import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/tokens.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './ErrorBoundary'
import { ToastProvider } from './components/Toast'
import LoginPage from './LoginPage'
import App from './layout/AppShell'
import OwlLogo from './assets/OwlLogo'

/* ── Splash / Loading Screen ───────────────────────────────── */
function SplashScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg)",
        gap: 20,
      }}
    >
      <div
        style={{
          animation: "splash-pulse 1.8s ease-in-out infinite",
        }}
      >
        <OwlLogo size={56} />
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.5px",
        }}
      >
        OWLWISE
      </div>
      <div
        style={{
          width: 120,
          height: 3,
          borderRadius: 99,
          background: "var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "40%",
            height: "100%",
            borderRadius: 99,
            background: "var(--accent)",
            animation: "splash-bar 1.2s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
        @keyframes splash-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              } />
            </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
