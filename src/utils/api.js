// ─── Shared API utilities ──────────────────────────────────────────────────
// Used by InterviewAI (AppShell) and AdminPanel for authenticated API calls.

import { BACKEND_URL } from "../constants";

export { BACKEND_URL };

/**
 * Build auth headers with Firebase ID token.
 * @param {import("firebase/auth").User} user - Firebase user object
 * @returns {Promise<Record<string, string>>} Headers with Authorization
 */
export async function getAuthHeaders(user) {
  const headers = { "Content-Type": "application/json" };
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
