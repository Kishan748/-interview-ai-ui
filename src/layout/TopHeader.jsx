// ─── TopHeader ───────────────────────────────────────────────────────────────
// Top header bar with breadcrumbs, hamburger button, theme toggle, and user pill.

import { ThemeToggle } from "../context/ThemeContext";

const VIEW_LABELS = {
  dashboard: "Dashboard",
  setup: "New Interview",
  "phone-waiting": "Phone Interview",
  results: "Results",
  candidates: "Candidates",
  team: "Team",
  admin: "Admin",
};

/**
 * @param {Object} props
 * @param {string} props.view - Current active view
 * @param {boolean} props.sidebarOpen - Whether sidebar is open (mobile)
 * @param {Function} props.onToggleSidebar - Toggle sidebar
 * @param {Object} props.user - Firebase user object
 * @param {Object} props.userProfile - User profile from Firestore
 */
export default function TopHeader({ view, sidebarOpen, onToggleSidebar, user, userProfile }) {
  return (
    <header className="top-header" role="banner">
      <div className="top-header-left">
        {/* Hamburger for mobile */}
        <button
          className="hamburger-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={sidebarOpen}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
        <div className="top-header-breadcrumb">
          <span>OWLWISE</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span style={{ color: "var(--text)" }}>
            {VIEW_LABELS[view] || "Dashboard"}
          </span>
        </div>
      </div>
      <div className="top-header-right">
        <ThemeToggle />
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "6px 12px", borderRadius: "var(--radius)",
          border: "1px solid var(--border)", background: "var(--surface-raised)",
          cursor: "default",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "var(--radius-full)",
            background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700,
          }}>
            {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text)" }}>
            {userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
