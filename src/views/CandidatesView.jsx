import { useState } from "react";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { relativeDate } from "../utils/dates";

/**
 * CandidatesView -- Lists all scored candidates with search, filter, and sort.
 *
 * @param {Object} props
 * @param {Array}    props.candidates       - Full list of candidate objects
 * @param {(c: Object) => void} props.onSelectCandidate - Called when a candidate row is clicked
 * @param {() => void}          props.onNewInterview    - Navigate to setup for a new interview
 */
export default function CandidatesView({ candidates, onSelectCandidate, onNewInterview }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [filterMaxScore, setFilterMaxScore] = useState(10);
  const [sortBy, setSortBy] = useState("date"); // date, score, name

  let filtered = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !filterRole || c.role === filterRole;
    const matchesScore = c.overall >= filterMinScore && c.overall <= filterMaxScore;
    return matchesSearch && matchesRole && matchesScore;
  });

  if (sortBy === "score") filtered.sort((a, b) => b.overall - a.overall);
  else if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else filtered.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const uniqueRoles = [...new Set(candidates.map((c) => c.role))];
  const hasActiveFilters = searchQuery || filterRole || filterMinScore > 0 || filterMaxScore < 10;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Candidates</h1>
          <p>{candidates.length} total · {filtered.length} shown</p>
        </div>
        <button className="btn btn-primary" onClick={onNewInterview}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          New Interview
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: 20, padding: "16px 20px" }}>
        <div className="filter-bar" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
              aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search candidates..." value={searchQuery}
              aria-label="Search candidates"
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-group"
              style={{
                width: "100%", padding: "8px 12px 8px 32px", background: "var(--bg)",
                border: "1px solid var(--border)", borderRadius: "var(--radius)",
                color: "var(--text)", fontFamily: "inherit", fontSize: "var(--text-base)", outline: "none",
              }}
            />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            aria-label="Filter by role"
            style={{
              padding: "8px 28px 8px 12px", background: "var(--bg)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
              color: "var(--text)", fontFamily: "inherit", fontSize: "var(--text-base)", outline: "none",
            }}>
            <option value="">All Roles</option>
            {uniqueRoles.map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort candidates"
            style={{
              padding: "8px 28px 8px 12px", background: "var(--bg)",
              border: "1px solid var(--border)", borderRadius: "var(--radius)",
              color: "var(--text)", fontFamily: "inherit", fontSize: "var(--text-base)", outline: "none",
            }}>
            <option value="date">Newest first</option>
            <option value="score">Highest score</option>
            <option value="name">A &rarr; Z</option>
          </select>
          {hasActiveFilters && (
            <button onClick={() => { setSearchQuery(""); setFilterRole(""); setFilterMinScore(0); setFilterMaxScore(10); }}
              className="btn btn-sm btn-secondary" style={{ fontSize: "var(--text-sm)" }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          candidates.length === 0 ? (
            <EmptyState type="candidates" title="No candidates yet"
              description="Start your first AI-powered phone interview to see candidates here."
              actionLabel="New Interview" onAction={onNewInterview} />
          ) : (
            <EmptyState type="search" title="No matches found"
              description="Try adjusting your search or filter criteria." />
          )
        ) : (
          <div className="responsive-table-wrap">
          <table className="candidates-table" role="table" aria-label="All candidates">
            <thead>
              <tr>
                <th scope="col">Candidate</th>
                <th scope="col">Role</th>
                <th scope="col">Level</th>
                <th scope="col">Score</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => onSelectCandidate(c)}
                  role="button" tabIndex={0} aria-label={`View results for ${c.name}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectCandidate(c); } }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={c.name} size={32} fontSize={12} />
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{c.role}</td>
                  <td style={{ color: "var(--text-muted)" }}>{c.experience}</td>
                  <td>
                    <div className="mini-score">
                      <span className="val" style={{
                        color: c.overall >= 7 ? "var(--green)" : c.overall >= 5 ? "var(--amber)" : "var(--red)",
                      }}>{c.overall}</span>
                      <div className="mini-bar-track">
                        <div className="mini-bar-fill" style={{ width: `${(c.overall / 10) * 100}%` }} />
                      </div>
                    </div>
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
