/**
 * Empty state component for OWLWISE.
 * Shows when a list/view has no data — includes illustration, message, and optional CTA.
 */

/** Generic empty-state illustrations as lightweight inline SVGs */
const illustrations = {
  candidates: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="20" y="30" width="80" height="70" rx="8" stroke="var(--border)" strokeWidth="2" fill="var(--surface-raised)" />
      <circle cx="60" cy="55" r="14" stroke="var(--text-muted)" strokeWidth="2" fill="none" />
      <path d="M40 82c0-11 9-20 20-20s20 9 20 20" stroke="var(--text-muted)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="85" y1="25" x2="95" y2="15" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <line x1="90" y1="25" x2="90" y2="12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="95" y1="28" x2="100" y2="20" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  interviews: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="15" y="25" width="55" height="70" rx="6" stroke="var(--border)" strokeWidth="2" fill="var(--surface-raised)" />
      <line x1="28" y1="45" x2="58" y2="45" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="55" x2="52" y2="55" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="65" x2="48" y2="65" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="85" cy="50" r="22" stroke="var(--accent)" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M78 50l5 5 10-10" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  team: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="45" cy="45" r="16" stroke="var(--text-muted)" strokeWidth="2" fill="none" />
      <path d="M25 80c0-11 9-20 20-20s20 9 20 20" stroke="var(--text-muted)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="50" r="13" stroke="var(--border)" strokeWidth="2" fill="var(--surface-raised)" />
      <path d="M65 78c0-8 7-15 15-15s15 7 15 15" stroke="var(--border)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="50" r="3" fill="var(--accent)" />
    </svg>
  ),
  search: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="52" cy="52" r="25" stroke="var(--text-muted)" strokeWidth="2.5" fill="none" />
      <line x1="70" y1="70" x2="92" y2="92" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="52" x2="62" y2="52" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  generic: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="25" y="30" width="70" height="60" rx="8" stroke="var(--border)" strokeWidth="2" fill="var(--surface-raised)" />
      <circle cx="60" cy="55" r="10" stroke="var(--text-muted)" strokeWidth="2" fill="none" />
      <path d="M56 55l3 3 6-6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/**
 * @param {Object} props
 * @param {"candidates"|"interviews"|"team"|"search"|"generic"} props.type - illustration variant
 * @param {string} props.title - primary message
 * @param {string} [props.description] - secondary descriptive text
 * @param {string} [props.actionLabel] - CTA button text
 * @param {Function} [props.onAction] - CTA click handler
 * @param {React.ReactNode} [props.icon] - custom icon to replace default illustration
 * @param {Object} [props.style] - additional wrapper styles
 */
export default function EmptyState({
  type = "generic",
  title,
  description,
  actionLabel,
  onAction,
  icon,
  style = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        ...style,
      }}
    >
      {/* Illustration */}
      <div
        style={{
          marginBottom: 20,
          opacity: 0.8,
        }}
      >
        {icon || illustrations[type] || illustrations.generic}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: "var(--text-md)",
            color: "var(--text-muted)",
            maxWidth: 360,
            lineHeight: 1.6,
            marginBottom: actionLabel ? 20 : 0,
          }}
        >
          {description}
        </p>
      )}

      {/* CTA Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius)",
            fontSize: "var(--text-md)",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "all var(--transition)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
