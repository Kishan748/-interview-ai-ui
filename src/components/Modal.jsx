/**
 * Reusable Modal component for OWLWISE.
 * Renders a centered overlay dialog with title, body, and optional footer actions.
 * Closes on Escape key and backdrop click.
 */
import { useEffect, useRef } from "react";

/**
 * @param {Object} props
 * @param {boolean} props.open - whether modal is visible
 * @param {Function} props.onClose - callback to close modal
 * @param {string} props.title - modal heading
 * @param {React.ReactNode} props.children - modal body content
 * @param {React.ReactNode} [props.footer] - optional footer (buttons, etc.)
 * @param {"sm"|"md"|"lg"} [props.size] - width preset
 * @param {Object} [props.style] - additional content-area styles
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  style = {},
}) {
  const contentRef = useRef(null);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Focus trap — focus modal on open */
  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const widthMap = { sm: 400, md: 520, lg: 680 };
  const maxWidth = widthMap[size] || widthMap.md;

  return (
    <>
      <style>{`
        @keyframes modal-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-content-in { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 9998,
          animation: "modal-overlay-in 200ms ease",
        }}
      />

      {/* Content wrapper (centering) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 24,
          pointerEvents: "none",
        }}
      >
        {/* Modal card */}
        <div
          ref={contentRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: "auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            width: "100%",
            maxWidth,
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            outline: "none",
            animation: "modal-content-in 250ms ease",
            ...style,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "var(--surface-raised)",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: "20px 24px",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {children}
          </div>

          {/* Footer (optional) */}
          {footer && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12,
                padding: "16px 24px",
                borderTop: "1px solid var(--border)",
                flexShrink: 0,
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
