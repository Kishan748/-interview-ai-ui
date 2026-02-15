import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext will pick up the state change and redirect
    } catch (err) {
      console.error("Firebase login error:", err.code, err.message);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(`Login failed: ${err.code || err.message}`);
      }
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch {
      setError("Could not send reset email. Check the address.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          padding: "40px",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "var(--text)", fontSize: "32px" }}>
          OWLWISE
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "14px" }}>
          Sign in to your account
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); setResetSent(false); }}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              marginBottom: "12px",
              fontSize: "16px",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              marginBottom: "15px",
              fontSize: "16px",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
              fontFamily: "inherit",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          onClick={handleResetPassword}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "13px",
            marginTop: "16px",
            fontFamily: "inherit",
          }}
        >
          Forgot password?
        </button>

        {error && (
          <p style={{ color: "#ef4444", marginTop: "15px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {resetSent && (
          <p style={{ color: "var(--green)", marginTop: "15px", fontSize: "14px" }}>
            Password reset email sent. Check your inbox.
          </p>
        )}
      </div>
    </div>
  );
}
