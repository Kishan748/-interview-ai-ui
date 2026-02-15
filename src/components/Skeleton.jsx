/**
 * Skeleton loading components for OWLWISE.
 * Use while data is being fetched to prevent layout shift.
 */

const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--surface-raised) 25%,
      var(--border) 37%,
      var(--surface-raised) 63%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: var(--radius-sm);
  }
`;

/** Basic rectangular skeleton block */
export function SkeletonBlock({ width = "100%", height = 16, style = {} }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div
        className="skeleton"
        style={{ width, height, borderRadius: "var(--radius-sm)", ...style }}
      />
    </>
  );
}

/** Skeleton that mimics a text line */
export function SkeletonText({ lines = 3, style = {} }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, ...style }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: 14,
              width: i === lines - 1 ? "60%" : "100%",
              borderRadius: "var(--radius-sm)",
            }}
          />
        ))}
      </div>
    </>
  );
}

/** Skeleton that mimics a circle (avatar) */
export function SkeletonCircle({ size = 32, style = {} }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div
        className="skeleton"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          ...style,
        }}
      />
    </>
  );
}

/** Skeleton card — mimics a full card with header + body */
export function SkeletonCard({ style = {} }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
          ...style,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <SkeletonCircle size={36} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock height={14} width="40%" />
            <SkeletonBlock height={10} width="25%" style={{ marginTop: 6 }} />
          </div>
        </div>
        <SkeletonText lines={3} />
      </div>
    </>
  );
}

/** Skeleton table row */
export function SkeletonTableRow({ columns = 5, style = {} }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <tr style={style}>
        {Array.from({ length: columns }).map((_, i) => (
          <td key={i} style={{ padding: "12px 14px" }}>
            <SkeletonBlock
              height={14}
              width={i === 0 ? "70%" : i === columns - 1 ? "50%" : "60%"}
            />
          </td>
        ))}
      </tr>
    </>
  );
}

/** Full table skeleton */
export function SkeletonTable({ rows = 5, columns = 5, style = {} }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", ...style }}>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  );
}
