import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import useCandidates from "../hooks/useCandidates";
import AdminPanel from "../AdminPanel";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { useToast } from "../components/Toast";
import LoadingOverlay from "../components/LoadingOverlay";
import { BACKEND_URL, DEFAULT_TWILIO_NUMBER } from "../constants";
import { getAuthHeaders } from "../utils/api";

// View components
import DashboardView from "../views/DashboardView";
import SetupView from "../views/SetupView";
import PhoneWaitingView from "../views/PhoneWaitingView";
import ResultsView from "../views/ResultsView";
import CandidatesView from "../views/CandidatesView";
import TeamView from "../views/TeamView";

import "../styles/layout.css";
import "../styles/components.css";
import "../styles/phone.css";
import "../styles/results.css";
import "../styles/candidates.css";

// ─── AppShell ─────────────────────────────────────────────────────────────────
// Top-level orchestrator: view routing, shared state, layout composition.
export default function App() {
  const { user, userProfile, companyId, companyData, logout } = useAuth();
  const toast = useToast();

  const [view, setView] = useState("dashboard");
  const { candidates, loadCandidates, saveCandidate } = useCandidates(companyId);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  // Phone-only mode (chat mode removed)

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // Phone state
  const [phoneSessionId, setPhoneSessionId] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState("waiting"); // waiting | in_progress | completed
  const [copied, setCopied] = useState(false);

  // These are set when a session is created (from SetupView) and used for scoring
  const [candidateName, setCandidateName] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const phonePollerRef = useRef(null);
  const phoneStatusRef = useRef("waiting");
  const scoringTriggeredRef = useRef(false);

  // getAuthHeaders is now imported from utils/api.js
  // Usage: const headers = await getAuthHeaders(user);

  useEffect(() => {
    phoneStatusRef.current = phoneStatus;
  }, [phoneStatus]);

  // ── Phone poller ──
  useEffect(() => {
    if (view !== "phone-waiting" || !phoneSessionId) return;
    phonePollerRef.current = setInterval(async () => {
      try {
        const headers = await getAuthHeaders(user);
        const res = await fetch(`${BACKEND_URL}/api/session/${phoneSessionId}`, { headers });
        const session = await res.json();
        if (
          session.status === "in_progress" &&
          phoneStatusRef.current === "waiting"
        )
          setPhoneStatus("in_progress");
        if (
          session.status === "completed" &&
          phoneStatusRef.current !== "completed"
        ) {
          setPhoneStatus("completed");
          clearInterval(phonePollerRef.current);
        }
      } catch {
        /* retry next tick */
      }
    }, 3000);
    return () => clearInterval(phonePollerRef.current);
  }, [view, phoneSessionId]);

  // ── Auto-score when phone interview completes ──
  useEffect(() => {
    if (phoneStatus === "completed" && !scoringTriggeredRef.current && phoneSessionId) {
      scoringTriggeredRef.current = true;
      scoreInterview();
    }
  }, [phoneStatus, phoneSessionId]);

  // ── Load completed candidates ──
  useEffect(() => {
    if (view === "candidates" || view === "dashboard") loadCandidates();
  }, [view, companyId]);

  // loadCandidates and saveCandidate are now provided by useCandidates hook

  // ── Score (phone only) ──
  const scoreInterview = async () => {
    setLoading(true);
    setLoadingText("Scoring the interview...");
    try {
      const scorePayload = {
        mode: "phone",
        candidate_name: candidateName,
        role,
        experience_level: experience,
        session_id: phoneSessionId,
        companyId,
      };

      console.log(
        "Calling backend /api/score-interview with payload:",
        scorePayload,
      );
      const headers = await getAuthHeaders(user);
      const scoreRes = await fetch(`${BACKEND_URL}/api/score-interview`, {
        method: "POST",
        headers,
        body: JSON.stringify(scorePayload),
      });

      console.log("Backend response status:", scoreRes.status);

      if (!scoreRes.ok) {
        const errorText = await scoreRes.text();
        console.error("Backend error response:", errorText);
        throw new Error(
          `Scoring failed: ${scoreRes.statusText} - ${errorText}`,
        );
      }

      const scoreData = await scoreRes.json();
      console.log("Scoring complete:", scoreData);

      // Transform phone transcript from ElevenLabs format
      const transcriptMessages = (scoreData.transcript || []).map((t) => ({
        role: t.role === "agent" ? "ai" : "candidate",
        text: t.message || "",
        time: new Date(),
      }));

      const result = {
        id: Date.now(),
        name: candidateName,
        role,
        experience,
        scores: scoreData.scores,
        overall: scoreData.overall,
        completedAt: new Date(),
        mode: "phone",
        transcript: transcriptMessages,
      };

      saveCandidate(result);
      setCurrentCandidate(result);
      setView("results");
    } catch (err) {
      console.error("Scoring error:", err);
      toast.error("Scoring failed: " + (err.message || "Unknown error. Try again."));
    }
    setLoading(false);
  };

  const copyNumber = () => {
    const num = companyData?.twilioPhoneNumber || DEFAULT_TWILIO_NUMBER;
    navigator.clipboard.writeText(num.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetSetup = () => {
    setView("setup");
  };

  // ── Callback from SetupView when a phone session is created ──
  const handleSessionCreated = ({ sessionId, name, role: effectiveRole, experience: expLevel }) => {
    setPhoneSessionId(sessionId);
    setPhoneStatus("waiting");
    scoringTriggeredRef.current = false;
    setCandidateName(name);
    setRole(effectiveRole);
    setExperience(expLevel);
    setView("phone-waiting");
  };

  // ── Callback to select a candidate and view results ──
  const handleSelectCandidate = (c) => {
    setCurrentCandidate(c);
    setView("results");
  };

  // ─── NAV ──────────────────────────────────────────────────────────────────
  // Nav items and active nav logic are now in layout/Sidebar.jsx
  const navigateTo = (viewId) => {
    if (viewId === "setup") { resetSetup(); }
    else { setView(viewId); }
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Styles are now loaded via CSS file imports */}
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="app-shell">
        {/* Mobile Sidebar Overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)} aria-hidden="true" />

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={navigateTo}
          activeView={view}
          user={user}
          userProfile={userProfile}
          companyData={companyData}
          onLogout={() => { logout(); setSidebarOpen(false); }}
        />
        <div className="main-content" role="main">
          <TopHeader
            view={view}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            user={user}
            userProfile={userProfile}
          />

          {/* ── Page Content ── */}
          <div className="main-inner" id="main-content">
            {view === "dashboard" && (
              <DashboardView
                candidates={candidates}
                user={user}
                userProfile={userProfile}
                onNavigate={navigateTo}
                onSelectCandidate={handleSelectCandidate}
              />
            )}
            {view === "setup" && (
              <SetupView
                onSessionCreated={handleSessionCreated}
                onCancel={resetSetup}
              />
            )}
            {view === "phone-waiting" && (
              <PhoneWaitingView
                phoneStatus={phoneStatus}
                candidateName={candidateName}
                role={role}
                customRole=""
                experience={experience}
                companyData={companyData}
                phoneSessionId={phoneSessionId}
                copied={copied}
                onCopyNumber={copyNumber}
                onScoreInterview={scoreInterview}
                onBack={resetSetup}
              />
            )}
            {view === "results" && (
              <ResultsView
                candidate={currentCandidate}
                onNewInterview={resetSetup}
                onViewCandidates={() => setView("candidates")}
              />
            )}
            {view === "candidates" && (
              <CandidatesView
                candidates={candidates}
                onSelectCandidate={handleSelectCandidate}
                onNewInterview={resetSetup}
              />
            )}
            {view === "team" && <TeamView />}
            {view === "admin" && <AdminPanel />}
          </div>
        </div>
      </div>
      {loading && <LoadingOverlay text={loadingText} />}
    </>
  );
}
