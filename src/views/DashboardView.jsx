import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { relativeDate } from "../utils/dates";

/**
 * DashboardView -- Main landing dashboard showing KPIs and recent interviews.
 *
 * @param {Object} props
 * @param {Array}           props.candidates       - Full list of candidate objects
 * @param {Object}          props.user             - Firebase auth user
 * @param {Object}          props.userProfile      - User profile from Firestore
 * @param {(viewId: string) => void} props.onNavigate - Navigate to a different view
 * @param {(c: Object) => void}      props.onSelectCandidate - Select a candidate and view results
 */
export default function DashboardView({ candidates, user, userProfile, onNavigate, onSelectCandidate }) {
  const totalInterviews = candidates.length;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const thisWeek = candidates.filter(c => {
    const d = c.completedAt instanceof Date ? c.completedAt : c.completedAt?.toDate ? c.completedAt.toDate() : new Date(c.completedAt);
    return d >= weekAgo;
  }).length;
  const avgScore = totalInterviews > 0
    ? (candidates.reduce((sum, c) => sum + (c.overall || 0), 0) / totalInterviews).toFixed(1)
    : "\u2014";
  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  const kpiCards = [
    {
      label: "Total Interviews",
      value: totalInterviews,
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3" /></svg>),
      bg: "var(--accent-glow)",
    },
    {
      label: "This Week",
      value: thisWeek,
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
      bg: "var(--green-dim)",
    },
    {
      label: "Average Score",
      value: avgScore,
      sub: "/ 10",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>),
      bg: "var(--amber-dim)",
    },
    {
      label: "Completion Rate",
      value: totalInterviews > 0 ? "100%" : "\u2014",
      icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
      bg: "var(--green-dim)",
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{greeting}, {userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "there"}</h1>
          <p>Here's your interview overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("setup")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          New Interview
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpiCards.map((kpi, i) => (
          <div key={i} className="card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500 }}>{kpi.label}</span>
              <div style={{
                width: 36, height: 36, borderRadius: "var(--radius)", background: kpi.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {kpi.icon}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-display)" }}>{kpi.value}</span>
              {kpi.sub && <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{kpi.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Interviews */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "var(--text-md)", fontWeight: 600 }}>Recent Interviews</h3>
          {candidates.length > 5 && (
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate("candidates")}>
              View All
            </button>
          )}
        </div>
        {recentCandidates.length === 0 ? (
          <EmptyState type="interviews" title="No interviews yet"
            description="Start your first interview to see results here."
            actionLabel="New Interview" onAction={() => onNavigate("setup")} />
        ) : (
          <div className="responsive-table-wrap">
            <table className="candidates-table" role="table" aria-label="Recent interviews">
              <thead>
                <tr>
                  <th scope="col">Candidate</th>
                  <th scope="col">Role</th>
                  <th scope="col">Score</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((c) => (
                  <tr key={c.id} onClick={() => onSelectCandidate(c)}
                    role="button" tabIndex={0} aria-label={`View results for ${c.name}`}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectCandidate(c); } }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={c.name} size={30} fontSize={11} />
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{c.role}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: "var(--text-md)",
                        color: c.overall >= 7 ? "var(--green)" : c.overall >= 5 ? "var(--amber)" : "var(--red)",
                      }}>
                        {c.overall}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>/10</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                      {relativeDate(c.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
