import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getAuthHeaders, BACKEND_URL } from "../utils/api";
import Modal from "../components/Modal";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";

/**
 * TeamView -- Team Management panel for company admins.
 *
 * Self-contained: owns all team-related state and API calls.
 * Uses useAuth() and useToast() directly.
 *
 * No props required.
 */
export default function TeamView() {
  const { user } = useAuth();
  const toast = useToast();

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", email: "", password: "" });
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadTeamMembers = async () => {
    setTeamLoading(true);
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/team/members`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
      }
    } catch (err) {
      console.error("Failed to load team:", err);
    }
    setTeamLoading(false);
  };

  const handleAddTeamMember = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/team/members`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      if (res.ok) {
        setTeamForm({ name: "", email: "", password: "" });
        setShowTeamModal(false);
        toast.success("Team member added successfully!");
        loadTeamMembers();
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error}`);
      }
    } catch (err) {
      toast.error("Failed to add team member");
    }
  };

  const handleRemoveTeamMember = async (uid, email) => {
    if (!confirm(`Remove ${email} from your team?`)) return;
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/team/members/${uid}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        toast.success("Member removed");
        loadTeamMembers();
      }
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  // Auto-load team members on first render
  if (teamMembers.length === 0 && !teamLoading && !hasLoadedOnce) {
    setHasLoadedOnce(true);
    loadTeamMembers();
  }

  const admins = teamMembers.filter(m => m.role === "admin").length;
  const members = teamMembers.filter(m => m.role !== "admin").length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Team Management</h1>
          <p>{teamMembers.length} members · {admins} admin{admins !== 1 ? "s" : ""} · {members} member{members !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowTeamModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
          Invite Member
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {teamLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading team...</div>
        ) : teamMembers.length === 0 ? (
          <EmptyState type="team" title="No team members" description="Invite your first team member to get started."
            actionLabel="Invite Member" onAction={() => setShowTeamModal(true)} />
        ) : (
          <div className="responsive-table-wrap">
          <table className="candidates-table" style={{ width: "100%" }} role="table" aria-label="Team members">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m) => (
                <tr key={m.uid}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={m.name || m.email} size={34} fontSize={13} ariaHidden={false} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "var(--text-md)" }}>{m.name || "\u2014"}</div>
                        {m.uid === user?.uid && (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "var(--text-base)" }}>{m.email}</td>
                  <td>
                    <span style={{
                      padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 600,
                      background: m.role === "admin" ? "var(--accent-glow)" : "var(--surface-raised)",
                      color: m.role === "admin" ? "var(--accent)" : "var(--text-muted)",
                      textTransform: "capitalize",
                    }}>
                      {m.role}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {m.uid !== user?.uid && (
                      <button className="btn btn-sm btn-danger"
                        onClick={(e) => { e.stopPropagation(); handleRemoveTeamMember(m.uid, m.email); }}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal open={showTeamModal} onClose={() => setShowTeamModal(false)} title="Invite Team Member"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowTeamModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddTeamMember}
              disabled={!teamForm.name || !teamForm.email || !teamForm.password || teamForm.password.length < 6}>
              Send Invite
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" placeholder="e.g. Jane Doe" value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" placeholder="jane@company.com" value={teamForm.email}
              onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Temporary Password *</label>
            <input type="password" placeholder="Min 6 characters" value={teamForm.password}
              minLength={6}
              onChange={(e) => setTeamForm({ ...teamForm, password: e.target.value })} />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              The member will use this password for their first login.
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
