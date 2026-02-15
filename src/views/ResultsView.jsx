import { useState } from "react";
import EmptyState from "../components/EmptyState";

/**
 * ResultsView -- Displays scored interview results for a candidate.
 *
 * @param {Object} props
 * @param {Object} props.candidate - The currentCandidate object (with scores, transcript, etc.)
 * @param {() => void} props.onNewInterview - Navigate to setup for a new interview
 * @param {() => void} props.onViewCandidates - Navigate to candidates list
 */
export default function ResultsView({ candidate, onNewInterview, onViewCandidates }) {
  const [transcriptSearch, setTranscriptSearch] = useState("");

  const s = candidate?.scores;
  if (!s) return null;

  const params = [
    { key: "technical", label: "Technical Knowledge", icon: "\uD83D\uDCBB" },
    { key: "communication", label: "Communication", icon: "\uD83D\uDCAC" },
    { key: "relevance", label: "JD Relevance", icon: "\uD83D\uDCCB" },
    { key: "problemSolving", label: "Problem Solving", icon: "\uD83E\uDDE9" },
    { key: "confidence", label: "Confidence", icon: "\uD83D\uDCAA" },
  ];
  const pct = (candidate.overall / 10) * 100;
  const circumference = 2 * Math.PI * 54;
  const scoreColor = candidate.overall >= 7 ? "var(--green)" : candidate.overall >= 5 ? "var(--amber)" : "var(--red)";

  // Filter transcript by search
  const transcript = candidate.transcript || [];
  const filteredTranscript = transcriptSearch
    ? transcript.filter(msg => msg.text?.toLowerCase().includes(transcriptSearch.toLowerCase()))
    : transcript;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{candidate.name}</h1>
          <p>
            {candidate.role} · {candidate.experience} · Phone Interview
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={onNewInterview}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            New Interview
          </button>
          <button className="btn btn-secondary" onClick={onViewCandidates}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            All Candidates
          </button>
        </div>
      </div>

      {/* Top row: Overall Score + Strengths/Improvements */}
      <div className="score-top-row" style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Overall Score */}
        <div className="score-hero" style={{ minWidth: 200 }}>
          <div className="score-circle">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="url(#sg)" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct / 100)} />
              <defs>
                <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="score-num">{candidate.overall}</div>
            <div className="score-label">/ 10</div>
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: scoreColor, fontWeight: 600, marginTop: 4 }}>
            {candidate.overall >= 8 ? "Excellent" : candidate.overall >= 6 ? "Good" : candidate.overall >= 4 ? "Average" : "Needs Improvement"}
          </div>
        </div>

        {/* Strengths */}
        <div className="commentary-box" style={{ display: "flex", flexDirection: "column" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Strengths
          </h4>
          <div className="tag-row" style={{ marginTop: "auto" }}>
            {s.strengths?.map((st, i) => (<span key={i} className="tag strength">{st}</span>))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="commentary-box" style={{ display: "flex", flexDirection: "column" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Areas for Improvement
          </h4>
          <div className="tag-row" style={{ marginTop: "auto" }}>
            {s.improvements?.map((im, i) => (<span key={i} className="tag improvement">{im}</span>))}
          </div>
        </div>
      </div>

      {/* Main grid: Score Breakdown + Transcript */}
      <div className="results-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Score Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3>Score Breakdown</h3>
            </div>
            <div className="score-breakdown">
              {params.map((p) => (
                <div key={p.key} className="score-bar-item">
                  <div className="bar-label">
                    <span>{p.label}</span>
                    <span>{s[p.key]}/10</span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${(s[p.key] / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="commentary-box" style={{ borderLeft: "3px solid var(--accent)", background: "var(--accent-glow)" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              AI Summary
            </h4>
            <p style={{ fontStyle: "italic" }}>{s.summary}</p>
          </div>
        </div>

        {/* Transcript Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className="card-header" style={{ flexShrink: 0 }}>
              <h3>Interview Transcript</h3>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                {transcript.length} messages
              </span>
            </div>
            {/* Search bar */}
            <div style={{ padding: "0 0 14px 0", flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search transcript..."
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  aria-label="Search transcript"
                  style={{
                    width: "100%", padding: "8px 12px 8px 32px", background: "var(--bg)",
                    border: "1px solid var(--border)", borderRadius: "var(--radius)",
                    color: "var(--text)", fontFamily: "inherit", fontSize: "var(--text-sm)",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
            {/* Messages */}
            <div style={{ flex: 1, maxHeight: 520, overflowY: "auto", paddingRight: 8 }}>
              {filteredTranscript.length > 0 ? (
                filteredTranscript.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 14, display: "flex", gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: msg.role === "ai"
                        ? "linear-gradient(135deg, var(--accent), #8b5cf6)"
                        : "linear-gradient(135deg, var(--green), #059669)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 11, fontWeight: 700,
                    }}>
                      {msg.role === "ai" ? "S" : candidate.name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 3, fontWeight: 600 }}>
                        {msg.role === "ai" ? "Sarah (AI Interviewer)" : candidate.name}
                      </div>
                      <div style={{
                        background: "var(--surface-raised)", padding: "10px 12px",
                        borderRadius: "var(--radius)", fontSize: "var(--text-base)", lineHeight: 1.6,
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : transcript.length === 0 ? (
                <EmptyState type="interviews" title="No transcript available" description="The interview transcript will appear here after scoring." />
              ) : (
                <EmptyState type="search" title="No matches" description="Try a different search term." />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
