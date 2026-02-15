// ─── Date utilities ────────────────────────────────────────────────────────

/**
 * Format a date as a human-readable relative string.
 * Examples: "just now", "5m ago", "2h ago", "3d ago", "Jan 15"
 * @param {Date|{toDate: () => Date}|string|null} d
 * @returns {string}
 */
export function relativeDate(d) {
  if (!d) return "";
  const date = d instanceof Date ? d : d.toDate ? d.toDate() : new Date(d);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
