// ─── Avatar ─────────────────────────────────────────────────────────────────
// Reusable HSL-colored initial avatar.

/**
 * Renders a circular avatar with the first letter of the name.
 * Background color is deterministically generated from the name.
 *
 * @param {Object} props
 * @param {string} props.name - Display name (uses first char for initial)
 * @param {number} [props.size=32] - Diameter in px
 * @param {number} [props.fontSize=12] - Font size in px
 * @param {string} [props.className] - Optional extra className
 * @param {boolean} [props.ariaHidden=true] - Hide from screen readers
 */
export default function Avatar({ name, size = 32, fontSize = 12, className = "", ariaHidden = true }) {
  const char = (name || "?").charAt(0).toUpperCase();
  const hue = ((name?.charCodeAt(0) || 0) * 7) % 360;

  return (
    <div
      aria-hidden={ariaHidden}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-full)",
        flexShrink: 0,
        background: `hsl(${hue}, 60%, 65%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize,
        fontWeight: 700,
      }}
    >
      {char}
    </div>
  );
}
