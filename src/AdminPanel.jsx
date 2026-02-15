import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const BACKEND_URL = "https://interview-backend-production-0688.up.railway.app";

export default function AdminPanel() {
  const { user, userProfile } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("companies"); // companies | members | create-company | add-member

  // Form states
  const [newCompany, setNewCompany] = useState({ companyId: "", companyName: "", adminEmail: "", adminPassword: "", adminName: "" });
  const [newMember, setNewMember] = useState({ email: "", password: "", name: "", role: "member" });
  const [message, setMessage] = useState({ text: "", type: "" });

  const getHeaders = async () => {
    const headers = { "Content-Type": "application/json" };
    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  // Load companies
  const loadCompanies = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND_URL}/api/admin/companies`, { headers });
      if (!res.ok) throw new Error("Failed to load companies");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      showMessage(err.message, "error");
    }
    setLoading(false);
  };

  // Load members for a company
  const loadMembers = async (companyId) => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND_URL}/api/admin/companies/${companyId}/members`, { headers });
      if (!res.ok) throw new Error("Failed to load members");
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      showMessage(err.message, "error");
    }
    setLoading(false);
  };

  // Create company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND_URL}/api/admin/companies`, {
        method: "POST", headers,
        body: JSON.stringify(newCompany),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create company");
      showMessage(`Company "${newCompany.companyName}" created successfully`);
      setNewCompany({ companyId: "", companyName: "", adminEmail: "", adminPassword: "", adminName: "" });
      setView("companies");
      loadCompanies();
    } catch (err) {
      showMessage(err.message, "error");
    }
    setLoading(false);
  };

  // Toggle company status
  const toggleCompanyStatus = async (companyId, currentlyDisabled) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND_URL}/api/admin/companies/${companyId}/status`, {
        method: "PUT", headers,
        body: JSON.stringify({ disabled: !currentlyDisabled }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      showMessage(`Company ${!currentlyDisabled ? "disabled" : "enabled"}`);
      loadCompanies();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  // Add member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND_URL}/api/admin/companies/${selectedCompany.id}/members`, {
        method: "POST", headers,
        body: JSON.stringify(newMember),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add member");
      showMessage(`Member "${newMember.name}" added to ${selectedCompany.name}`);
      setNewMember({ email: "", password: "", name: "", role: "member" });
      setView("members");
      loadMembers(selectedCompany.id);
    } catch (err) {
      showMessage(err.message, "error");
    }
    setLoading(false);
  };

  // Remove member
  const removeMember = async (uid, email) => {
    if (!confirm(`Remove ${email} from ${selectedCompany.name}? Their access will be disabled.`)) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BACKEND_URL}/api/admin/companies/${selectedCompany.id}/members/${uid}`, {
        method: "DELETE", headers,
      });
      if (!res.ok) throw new Error("Failed to remove member");
      showMessage(`${email} removed`);
      loadMembers(selectedCompany.id);
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  useEffect(() => {
    if (userProfile?.role === "super_admin") loadCompanies();
  }, [userProfile]);

  if (userProfile?.role !== "super_admin") {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
        <p>You don't have admin access.</p>
      </div>
    );
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", background: "var(--bg)",
    border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)",
    fontFamily: "inherit", fontSize: "13.5px", boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle, appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7f99' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  };

  // ── Companies List ──
  const renderCompanies = () => (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div>
          <h1>Client Management</h1>
          <p>{companies.length} companies</p>
        </div>
        <button className="btn btn-primary" onClick={() => setView("create-company")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>{" "}
          New Company
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {companies.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <p>No companies yet. Create your first client.</p>
          </div>
        ) : (
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>ID</th>
                <th>Members</th>
                <th>Interviews</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{c.id}</td>
                  <td>{c.memberCount}</td>
                  <td>{c.sessionCount}</td>
                  <td>
                    <span className={`status-pill ${c.disabled ? "" : "completed"}`}
                      style={c.disabled ? { background: "var(--red-dim)", color: "var(--red)" } : {}}>
                      <span className="status-dot" />
                      {c.disabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: 12 }}
                        onClick={() => { setSelectedCompany(c); loadMembers(c.id); setView("members"); }}>
                        Members
                      </button>
                      <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: 12, color: c.disabled ? "var(--green)" : "var(--red)" }}
                        onClick={() => toggleCompanyStatus(c.id, c.disabled)}>
                        {c.disabled ? "Enable" : "Disable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // ── Create Company Form ──
  const renderCreateCompany = () => (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div>
          <h1>New Company</h1>
          <p>Create a client account</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setView("companies")}>Back</button>
      </div>
      <div className="card">
        <form onSubmit={handleCreateCompany}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label>Company Name</label>
              <input style={inputStyle} placeholder="e.g. Acme Corp" value={newCompany.companyName}
                onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Company ID (URL-safe, lowercase)</label>
              <input style={inputStyle} placeholder="e.g. acme" value={newCompany.companyId}
                onChange={(e) => setNewCompany({ ...newCompany, companyId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} required />
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <label style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, display: "block" }}>
                Admin Account
              </label>
            </div>
            <div className="form-group">
              <label>Admin Name</label>
              <input style={inputStyle} placeholder="e.g. Jane Smith" value={newCompany.adminName}
                onChange={(e) => setNewCompany({ ...newCompany, adminName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Admin Email</label>
              <input style={inputStyle} type="email" placeholder="e.g. jane@acme.com" value={newCompany.adminEmail}
                onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input style={inputStyle} type="text" placeholder="Min 6 characters" value={newCompany.adminPassword}
                onChange={(e) => setNewCompany({ ...newCompany, adminPassword: e.target.value })} required minLength={6} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ alignSelf: "flex-end", marginTop: 8 }}>
              {loading ? "Creating..." : "Create Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── Members List ──
  const renderMembers = () => (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1>{selectedCompany?.name} — Members</h1>
          <p>{members.length} members</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setView("add-member")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>{" "}
            Add Member
          </button>
          <button className="btn btn-secondary" onClick={() => setView("companies")}>Back</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {members.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <p>No members yet.</p>
          </div>
        ) : (
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.uid}>
                  <td style={{ fontWeight: 500 }}>{m.name}</td>
                  <td style={{ color: "var(--text-muted)" }}>{m.email}</td>
                  <td>
                    <span className={`status-pill ${m.role === "admin" ? "chat" : "completed"}`}>
                      <span className="status-dot" />
                      {m.role}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <button className="btn btn-secondary"
                      style={{ padding: "5px 10px", fontSize: 12, color: "var(--red)" }}
                      onClick={() => removeMember(m.uid, m.email)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // ── Add Member Form ──
  const renderAddMember = () => (
    <div style={{ maxWidth: 500 }}>
      <div className="page-header">
        <div>
          <h1>Add Member</h1>
          <p>Add a team member to {selectedCompany?.name}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setView("members")}>Back</button>
      </div>
      <div className="card">
        <form onSubmit={handleAddMember}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label>Name</label>
              <input style={inputStyle} placeholder="e.g. John Doe" value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input style={inputStyle} type="email" placeholder="e.g. john@acme.com" value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input style={inputStyle} type="text" placeholder="Min 6 characters" value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select style={selectStyle} value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                <option value="member">Member (view + create interviews)</option>
                <option value="admin">Admin (manage company settings)</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ alignSelf: "flex-end", marginTop: 8 }}>
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      {message.text && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 200,
          padding: "12px 20px", borderRadius: 8,
          background: message.type === "error" ? "var(--red-dim)" : "var(--green-dim)",
          color: message.type === "error" ? "var(--red)" : "var(--green)",
          border: `1px solid ${message.type === "error" ? "var(--red)" : "var(--green)"}`,
          fontSize: 13.5, fontWeight: 500, animation: "fadeInUp 0.25s ease",
        }}>
          {message.text}
        </div>
      )}
      {view === "companies" && renderCompanies()}
      {view === "create-company" && renderCreateCompany()}
      {view === "members" && renderMembers()}
      {view === "add-member" && renderAddMember()}
    </div>
  );
}
