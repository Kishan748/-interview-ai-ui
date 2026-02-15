// ─── LoadingOverlay ──────────────────────────────────────────────────────────
// Full-screen loading spinner overlay. CSS is in /src/styles/components.css.

/**
 * @param {Object} props
 * @param {string} [props.text="Loading..."] - Text to display below spinner
 */
export default function LoadingOverlay({ text = "Loading..." }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={text || "Loading"}>
      <div className="loading-spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}
