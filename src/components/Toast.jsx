/**
 * Toast notification system for OWLWISE.
 * Provides a context-based API for showing transient notifications.
 *
 * Usage:
 *   import { ToastProvider, useToast } from "./components/Toast";
 *
 *   // Wrap app:
 *   <ToastProvider>...</ToastProvider>
 *
 *   // In any component:
 *   const toast = useToast();
 *   toast.success("Saved!");
 *   toast.error("Something failed");
 *   toast.info("FYI...");
 */
import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

let toastId = 0;

/* ── Icons ───────────────────────────────────────────────── */
const icons = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const bgMap = {
  success: "var(--green-dim)",
  error: "var(--red-dim)",
  info: "var(--accent-glow)",
  warning: "var(--amber-dim)",
};

const borderMap = {
  success: "var(--green)",
  error: "var(--red)",
  info: "var(--accent)",
  warning: "var(--amber)",
};

/* ── Single Toast ────────────────────────────────────────── */
function ToastItem({ toast, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--surface)",
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${borderMap[toast.type] || borderMap.info}`,
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow-lg)",
        fontSize: "var(--text-md)",
        color: "var(--text)",
        maxWidth: 420,
        width: "100%",
        animation: "toast-slide-in 250ms ease",
        pointerEvents: "auto",
      }}
    >
      <div style={{ flexShrink: 0 }}>{icons[toast.type] || icons.info}</div>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "var(--radius-sm)",
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          cursor: "pointer",
          transition: "color var(--transition-fast)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ── Provider ────────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type, message, duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, type, message }]);
      if (duration > 0) {
        timersRef.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const api = useRef({
    success: (msg, dur) => addToast("success", msg, dur),
    error: (msg, dur) => addToast("error", msg, dur ?? 6000),
    info: (msg, dur) => addToast("info", msg, dur),
    warning: (msg, dur) => addToast("warning", msg, dur ?? 5000),
    dismiss,
  });

  // Keep API ref updated
  api.current.success = (msg, dur) => addToast("success", msg, dur);
  api.current.error = (msg, dur) => addToast("error", msg, dur ?? 6000);
  api.current.info = (msg, dur) => addToast("info", msg, dur);
  api.current.warning = (msg, dur) => addToast("warning", msg, dur ?? 5000);
  api.current.dismiss = dismiss;

  return (
    <ToastContext.Provider value={api.current}>
      {children}

      {/* Toast container — fixed, top-right */}
      {toasts.length > 0 && (
        <>
          <style>{`
            @keyframes toast-slide-in {
              from { opacity: 0; transform: translateX(24px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          <div
            aria-label="Notifications"
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              zIndex: 10000,
              pointerEvents: "none",
            }}
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </div>
        </>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
