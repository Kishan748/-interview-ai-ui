import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { ROLES, EXPERIENCE_LEVELS, BACKEND_URL } from "../constants";
import { getAuthHeaders } from "../utils/api";

/**
 * SetupView -- Interview setup form. Owns all form state and the startPhoneInterview API call.
 *
 * @param {Object} props
 * @param {(session: {sessionId: string, name: string, role: string, experience: string}) => void} props.onSessionCreated
 *   Called after a phone session is successfully created. Parent should set phoneSessionId,
 *   phoneStatus, candidateName, and navigate to phone-waiting view.
 * @param {() => void} props.onCancel - Called when the user clicks Cancel
 */
export default function SetupView({ onSessionCreated, onCancel }) {
  const { user, companyId } = useAuth();
  const toast = useToast();

  // Form state
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [jd, setJd] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Resume handlers
  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => setResumeText(ev.target.result);
      reader.readAsText(file);
    } else {
      setResumeText(`[Resume: ${file.name}]`);
    }
  };
  const clearResume = () => {
    setResumeFile(null);
    setResumeText("");
  };

  // Start phone interview
  const startPhoneInterview = async () => {
    setSubmitting(true);
    try {
      const headers = await getAuthHeaders(user);
      const effectiveRole = role === "Other" ? customRole : role;
      const res = await fetch(`${BACKEND_URL}/api/create-session`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          candidate_name: candidateName,
          role: effectiveRole,
          experience_level: experience,
          job_description: jd,
          resume: resumeText,
          phone_number: phoneNumber,
          companyId,
        }),
      });
      const data = await res.json();
      onSessionCreated({
        sessionId: data.session_id,
        name: candidateName,
        role: effectiveRole,
        experience,
      });
    } catch {
      toast.error("Failed to create session. Is the backend running?");
    }
    setSubmitting(false);
  };

  const isValid = candidateName && (role === "Other" ? customRole : role) && experience;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>New Interview</h1>
          <p>Configure the interview parameters below</p>
        </div>
      </div>

      {/* Step 1: Role & Level */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "var(--radius-full)",
            background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>1</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>Role & Experience</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>What position are you interviewing for?</div>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Role *</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Select a role</option>
              {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
          </div>
          {role === "Other" && (
            <div className="form-group">
              <label>Custom Role *</label>
              <input type="text" placeholder="Enter custom role" value={customRole} onChange={(e) => setCustomRole(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label>Experience Level *</label>
            <select value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option value="">Select experience</option>
              {EXPERIENCE_LEVELS.map((e) => (<option key={e} value={e}>{e}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Step 2: Candidate Details */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "var(--radius-full)",
            background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>2</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>Candidate Details</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Who will be taking the interview?</div>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" placeholder="e.g. Rahul Mehta" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" placeholder="+61 412 345 678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div className="form-group full">
            <label>Job Description (Optional)</label>
            <textarea placeholder="Paste the job description here to tailor the interview questions..." value={jd} onChange={(e) => setJd(e.target.value)} style={{ minHeight: 120 }} />
          </div>
        </div>
      </div>

      {/* Step 3: Resume */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "var(--radius-full)",
            background: "var(--surface-raised)", color: "var(--text-muted)", fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            border: "1px solid var(--border)",
          }}>3</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>Resume <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(Optional)</span></div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Upload the candidate's resume for context-aware questions</div>
          </div>
        </div>
        {resumeFile ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", background: "var(--accent-glow)",
            border: "1px solid var(--accent)", borderRadius: "var(--radius)", transition: "all var(--transition)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
              <path d="M13 2v7h7" />
            </svg>
            <span style={{ flex: 1, fontSize: "var(--text-md)", fontWeight: 500 }}>{resumeFile.name}</span>
            <button type="button" onClick={clearResume} style={{
              background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
              padding: 4, display: "flex", borderRadius: "var(--radius-sm)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "36px 16px", background: "var(--bg)", border: "2px dashed var(--border)",
            borderRadius: "var(--radius-lg)", textAlign: "center", cursor: "pointer",
            transition: "all var(--transition)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-glow)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
          >
            <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleResumeUpload} style={{ display: "none" }} />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ opacity: 0.6 }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <div style={{ fontSize: "var(--text-md)", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>Click to upload</span> or drag and drop
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", opacity: 0.7 }}>PDF, DOCX, TXT (max 5MB)</div>
          </label>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={!isValid || submitting} onClick={startPhoneInterview}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          Start Phone Interview
        </button>
      </div>
    </div>
  );
}
