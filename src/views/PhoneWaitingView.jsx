import { DEFAULT_TWILIO_NUMBER } from "../constants";

/**
 * PhoneWaitingView -- Shows the phone interview progress (waiting, in progress, completed).
 *
 * @param {Object} props
 * @param {string}    props.phoneStatus     - "waiting" | "in_progress" | "completed"
 * @param {string}    props.candidateName   - Name of the candidate
 * @param {string}    props.role            - Selected role
 * @param {string}    props.customRole      - Custom role (when role === "Other")
 * @param {string}    props.experience      - Experience level
 * @param {Object}    props.companyData     - Company data (may contain twilioPhoneNumber)
 * @param {string}    props.phoneSessionId  - Active session ID
 * @param {boolean}   props.copied          - Whether the phone number was just copied
 * @param {() => void} props.onCopyNumber   - Copy phone number to clipboard
 * @param {() => void} props.onScoreInterview - Score the completed interview
 * @param {() => void} props.onBack         - Go back to setup
 */
export default function PhoneWaitingView({
  phoneStatus,
  candidateName,
  role,
  customRole,
  experience,
  companyData,
  phoneSessionId,
  copied,
  onCopyNumber,
  onScoreInterview,
  onBack,
}) {
  const displayRole = role === "Other" ? customRole : role;

  const steps = [
    {
      label: "Session Created",
      sub: "Interview context saved",
      status: "done",
    },
    {
      label:
        phoneStatus === "waiting" ? "Waiting for Call" : "Call Connected",
      sub:
        phoneStatus === "waiting"
          ? `${candidateName} needs to dial in`
          : "Sarah is interviewing",
      status: phoneStatus === "waiting" ? "active" : "done",
    },
    {
      label: "Interview In Progress",
      sub: "Sarah is conducting the interview",
      status:
        phoneStatus === "in_progress"
          ? "active"
          : phoneStatus === "completed"
            ? "done"
            : "pending",
    },
    {
      label: "Interview Complete",
      sub: "Transcript received, ready to score",
      status: phoneStatus === "completed" ? "active" : "pending",
    },
  ];

  return (
    <div className="phone-waiting">
      <div className="page-header" style={{ textAlign: "center", marginBottom: 0, width: "100%" }}>
        <div>
          <h1>Phone Interview</h1>
          <p>{displayRole} · {experience} · {candidateName}</p>
        </div>
      </div>

      {/* Status Hero */}
      <div className="card" style={{ textAlign: "center", padding: "36px 28px", width: "100%" }}>
        <div className={`phone-icon-wrap ${phoneStatus.replace("_", "-")}`} style={{ margin: "0 auto 20px" }}>
          <div className="phone-pulse" />
          {phoneStatus === "completed" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          )}
        </div>
        <div className="phone-status-text">
          {phoneStatus === "waiting" && (
            <>
              <h2>Waiting for {candidateName}</h2>
              <p>Have the candidate call the number below to begin the interview.</p>
            </>
          )}
          {phoneStatus === "in_progress" && (
            <>
              <h2>Interview In Progress</h2>
              <p>Sarah is interviewing {candidateName} right now.</p>
            </>
          )}
          {phoneStatus === "completed" && (
            <>
              <h2>Interview Complete</h2>
              <p>The call has ended and the transcript is ready. You can now score the interview.</p>
            </>
          )}
        </div>

        {/* Phone Number Card */}
        {phoneStatus !== "completed" && (
          <div className="phone-number-box" style={{ marginTop: 24 }}>
            <div className="pn-label">Candidate should call this number</div>
            <div className="number">{companyData?.twilioPhoneNumber || DEFAULT_TWILIO_NUMBER}</div>
            <button className="copy-btn" onClick={onCopyNumber}>
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy Number
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="card" style={{ width: "100%", padding: "24px 28px" }}>
        <div style={{ fontWeight: 600, fontSize: "var(--text-md)", marginBottom: 16 }}>Progress</div>
        <div className="status-timeline">
          {steps.map((step, i) => (
            <div key={i}>
              <div className="status-step">
                <div className="status-step-line">
                  <div className={`status-dot-wrap ${step.status}`}>
                    {step.status === "done" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    ) : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`status-connector ${step.status === "done" ? "done" : ""}`} />
                  )}
                </div>
                <div className="status-step-content">
                  <div className={`step-label ${step.status}`}>{step.label}</div>
                  <div className="step-sub">{step.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {phoneStatus === "completed" && (
          <button className="btn btn-primary" onClick={onScoreInterview}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
            Score Interview
          </button>
        )}
        <button className="btn btn-secondary" onClick={onBack}>Back to Setup</button>
      </div>
    </div>
  );
}
