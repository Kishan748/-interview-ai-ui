// ─── Sidebar ─────────────────────────────────────────────────────────────────
// Main navigation sidebar with company badge, user section, and logout.

import OwlLogo from "../assets/OwlLogo";
import { ThemeToggle } from "../context/ThemeContext";

// ─── Nav Item Definitions ────────────────────────────────────────────────────
const BASE_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="4" rx="1" />
        <rect x="14" y="10" width="7" height="7" rx="1" />
        <rect x="3" y="13" width="7" height="4" rx="1" />
      </svg>
    ),
  },
  {
    id: "setup",
    label: "New Interview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: "candidates",
    label: "Candidates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

const TEAM_NAV = {
  id: "team",
  label: "Team",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
};

const ADMIN_NAV = {
  id: "admin",
  label: "Admin Panel",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

/**
 * Build nav items based on user role.
 * @param {string|undefined} role - User role
 * @returns {Array} nav items
 */
export function buildNavItems(role) {
  return [
    ...BASE_NAV_ITEMS,
    ...(role === "admin" || role === "super_admin" ? [TEAM_NAV] : []),
    ...(role === "super_admin" ? [ADMIN_NAV] : []),
  ];
}

/**
 * Determine which nav item is active.
 * @param {string} view - Current view
 * @returns {string} active nav id
 */
export function getActiveNav(view) {
  if (view === "dashboard") return "dashboard";
  if (view === "admin") return "admin";
  if (view === "team") return "team";
  if (view === "candidates") return "candidates";
  return "setup";
}

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {Function} props.onClose - Close sidebar
 * @param {Function} props.onNavigate - Navigate to a view
 * @param {string} props.activeView - Current active view
 * @param {Object} props.user - Firebase user
 * @param {Object} props.userProfile - User profile
 * @param {Object|null} props.companyData - Company data
 * @param {Function} props.onLogout - Logout handler
 */
export default function Sidebar({ isOpen, onClose, onNavigate, activeView, user, userProfile, companyData, onLogout }) {
  const navItems = buildNavItems(userProfile?.role);
  const activeNav = getActiveNav(activeView);

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} role="navigation" aria-label="Main navigation">
      <div className="sidebar-logo">
        <OwlLogo size={34} />
        <div className="logo-text">
          OWLWISE
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            aria-current={activeNav === item.id ? "page" : undefined}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "auto" }}>
        {/* Company badge */}
        {companyData && (
          <div className="sidebar-company-badge">
            <div className="sidebar-company-icon">
              {companyData.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-company-name">{companyData.name}</div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", margin: "8px 12px" }} />

        {/* User section + theme toggle */}
        <div className="sidebar-user-section">
          {user && (
            <div className="sidebar-user-row">
              <div className="sidebar-avatar">
                {user.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sidebar-user-name">
                  {userProfile?.name || user.email?.split("@")[0]}
                </div>
                <div className="sidebar-user-email">{user.email}</div>
              </div>
              <ThemeToggle />
            </div>
          )}
          <button
            className="nav-item"
            onClick={onLogout}
            style={{ color: "var(--red)", marginTop: 4 }}
            aria-label="Sign out of your account"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
