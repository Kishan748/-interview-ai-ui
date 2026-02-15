// ─── Transcript utilities ──────────────────────────────────────────────────

/**
 * Normalize transcript format from various sources (ElevenLabs uses 'message', UI expects 'text').
 * @param {Array} transcript - Raw transcript array
 * @returns {Array<{role: string, text: string, time: Date}>}
 */
export function normalizeTranscript(transcript) {
  if (!Array.isArray(transcript)) return [];
  return transcript.map((msg) => ({
    role:
      msg.role === "agent"
        ? "ai"
        : msg.role === "candidate"
          ? "candidate"
          : "candidate",
    text: msg.text || msg.message || "",
    time: msg.time ? new Date(msg.time) : new Date(),
  }));
}
