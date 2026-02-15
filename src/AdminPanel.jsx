import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./components/Toast";
import Modal from "./components/Modal";
import EmptyState from "./components/EmptyState";
import { BACKEND_URL } from "./constants";
import { getAuthHeaders } from "./utils/api";
import Avatar from "./components/Avatar";

export default function AdminPanel() {
  const { user, userProfile } = useAuth();
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("companies");

  // Form states
  const [newCompany, setNewCompany] = useState({ companyId: "", companyName: "", adminEmail: "", adminPassword: "", adminName: "" });
  const [newMember, setNewMember] = useState({ email: "", password: "", name: "", role: "member" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // getHeaders replaced by shared getAuthHeaders(user) from utils/api.js

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/admin/companies`, { headers });
      if (!res.ok) throw new Error("Failed to load companies");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const loadMembers = async (companyId) => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/admin/companies/${companyId}/members`, { headers });
      if (!res.ok) throw new Error("Failed to load members");
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleCreateCompany = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/admin/companies`, {
        method: "POST", headers,
        body: JSON.stringify(newCompany),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create company");
      toast.success(`Company "${newCompany.companyName}" created successfully`);
      setNewCompany({ companyId: "", companyName: "", adminEmail: "", adminPassword: "", adminName: "" });
      setShowCreateModal(false);
      loadCompanies();
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const toggleCompanyStatus = async (companyId, currentlyDisabled) => {
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/admin/companies/${companyId}/status`, {
        method: "PUT", headers,
        body: JSON.stringify({ disabled: !currentlyDisabled }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Company ${!currentlyDisabled ? "disabled" : "enabled"}`);
      loadCompanies();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddMember = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/admin/companies/${selectedCompany.id}/members`, {
        method: "POST", headers,
        body: JSON.stringify(newMember),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add member");
      toast.success(`Member "${newMember.name}" added`);
      setNewMember({ email: "", password: "", name: "", role: "member" });
      setShowAddMemberModal(false);
      loadMembers(selectedCompany.id);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const removeMember = async (uid, email) => {
    if (!confirm(`Remove ${email} from ${selectedCompany.name}?`)) return;
    try {
      const headers = await getAuthHeaders(user);
      const res = await fetch(`${BACKEND_URL}/api/admin/companies/${selectedCompany.id}/members/${uid}`, {
        method: "DELETE", headers,
      });
      if (!res.ok) throw new Error("Failed to remove member");
      toast.success(`${email} removed`);
      loadMembers(selectedCompany.id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (userProfile?.role === "super_admin") loadCompanies();
  }, [userProfile]);

  if (userProfile?.role !== "super_admin") {
    return (
      <EmptyState type="generic" title="Access Denied"
        description="You need super admin access to view this page." />
    );
  }

  // ── Companies Card View ──
  const renderCompanies = () => {
    const active = companies.filter(c => !c.disabled).length;
    const disabled = companies.filter(c => c.disabled).length;

    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Client Management</h1>
            <p>{companies.length} companies · {active} active · {disabled} disabled</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Company
          </button>
        </div>

        {loading && companies.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : companies.length === 0 ? (
          <EmptyState type="generic" title="No companies yet"
            description="Create your first client company to get started."
            actionLabel="New Company" onAction={() => setShowCreateModal(true)} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {companies.map((c) => (
              <div key={c.id} className="card" style={{ cursor: "pointer", transition: "all var(--transition)" }}
                onClick={() => { setSelectedCompany(c); loadMembers(c.id); setView("members"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "var(--radius)",
                      background: c.disabled ? "var(--surface-raised)" : "linear-gradient(135deg, var(--accent), #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: c.disabled ? "var(--text-muted)" : "#fff", fontSize: 16, fontWeight: 700,
                    }}>
                      {(c.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>{c.name}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "monospace" }}>{c.id}</div>
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 8px", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 600,
                    background: c.disabled ? "var(--red-dim)" : "var(--green-dim)",
                    color: c.disabled ? "var(--red)" : "var(--green)",
                  }}>
                    {c.disabled ? "Disabled" : "Active"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 20, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    {c.memberCount || 0} members
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3" />
                    </svg>
                    {c.sessionCount || 0} interviews
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}
                    onClick={(e) => { e.stopPropagation(); setSelectedCompany(c); loadMembers(c.id); setView("members"); }}>
                    Manage
                  </button>
                  <button className={`btn btn-sm ${c.disabled ? "btn-secondary" : "btn-danger"}`}
                    onClick={(e) => { e.stopPropagation(); toggleCompanyStatus(c.id, c.disabled); }}>
                    {c.disabled ? "Enable" : "Disable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Members View ──
  const renderMembers = () => (
    <div>
      <div className="page-header">
        <div>
          <h1>{selectedCompany?.name}</h1>
          <p>{members.length} members</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowAddMemberModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Add Member
          </button>
          <button className="btn btn-secondary" onClick={() => setView("companies")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {members.length === 0 ? (
          <EmptyState type="team" title="No members yet"
            description={`Add members to ${selectedCompany?.name} to give them access.`}
            actionLabel="Add Member" onAction={() => setShowAddMemberModal(true)} />
        ) : (
          <div className="responsive-table-wrap">
          <table className="candidates-table" role="table" aria-label="Company members">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.uid}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={m.name || m.email} size={32} fontSize={12} />
                      <span style={{ fontWeight: 500 }}>{m.name || "—"}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{m.email}</td>
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
                    <button className="btn btn-sm btn-danger" onClick={() => removeMember(m.uid, m.email)}>
                      Remove
                    </button>
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

  return (
    <div>
      {view === "companies" && renderCompanies()}
      {view === "members" && renderMembers()}

      {/* Create Company Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Company" size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateCompany}
              disabled={loading || !newCompany.companyName || !newCompany.companyId || !newCompany.adminEmail || !newCompany.adminPassword || !newCompany.adminName}>
              {loading ? "Creating..." : "Create Company"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Company Name *</label>
              <input placeholder="e.g. Acme Corp" value={newCompany.companyName}
                onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Company ID *</label>
              <input placeholder="e.g. acme" value={newCompany.companyId}
                onChange={(e) => setNewCompany({ ...newCompany, companyId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
              Admin Account
            </div>
          </div>
          <div className="form-group">
            <label>Admin Name *</label>
            <input placeholder="e.g. Jane Smith" value={newCompany.adminName}
              onChange={(e) => setNewCompany({ ...newCompany, adminName: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Admin Email *</label>
              <input type="email" placeholder="jane@acme.com" value={newCompany.adminEmail}
                onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Temp Password *</label>
              <input type="text" placeholder="Min 6 characters" value={newCompany.adminPassword}
                onChange={(e) => setNewCompany({ ...newCompany, adminPassword: e.target.value })} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal open={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title={`Add Member to ${selectedCompany?.name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddMember}
              disabled={loading || !newMember.name || !newMember.email || !newMember.password}>
              {loading ? "Adding..." : "Add Member"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label>Full Name *</label>
            <input placeholder="e.g. John Doe" value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" placeholder="john@acme.com" value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Temp Password *</label>
              <input type="text" placeholder="Min 6 characters" value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
