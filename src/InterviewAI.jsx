import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0f1117;
    --surface: #161822;
    --surface-raised: #1c1f2e;
    --border: #2a2d3d;
    --text: #e4e6ed;
    --text-muted: #7a7f99;
    --accent: #5b8cff;
    --accent-glow: rgba(91,140,255,0.18);
    --green: #4ade80;
    --green-dim: rgba(74,222,128,0.15);
    --amber: #fbbf24;
    --amber-dim: rgba(251,191,36,0.15);
    --red: #f87171;
    --red-dim: rgba(248,113,113,0.15);
    --radius: 12px;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app-shell { display: flex; min-height: 100vh; }

  .sidebar {
    width: 220px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 28px 16px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    position: fixed;
    top: 0; left: 0; bottom: 0;
  }

  .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 8px; }
  .sidebar-logo .logo-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .sidebar-logo .logo-text { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
  .sidebar-logo .logo-text span { color: var(--accent); }

  .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px; cursor: pointer;
    font-size: 13.5px; color: var(--text-muted);
    transition: all 0.2s; border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: var(--surface-raised); color: var(--text); }
  .nav-item.active { background: var(--accent-glow); color: var(--accent); }
  .nav-item svg { width: 16px; height: 16px; opacity: 0.7; }
  .nav-item.active svg { opacity: 1; }

  .main-content { margin-left: 220px; flex: 1; padding: 32px 36px; min-height: 100vh; }

  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .page-header h1 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
  .page-header p { color: var(--text-muted); font-size: 13.5px; margin-top: 4px; }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 8px; font-family: inherit;
    font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s;
  }
  .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 2px 12px var(--accent-glow); }
  .btn-primary:hover { background: #4a7de8; transform: translateY(-1px); }
  .btn-secondary { background: var(--surface-raised); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .card-header h3 { font-size: 14px; font-weight: 600; }

  /* ── Mode Toggle ── */
  .mode-toggle {
    display: flex; gap: 4px;
    background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 4px;
    margin-bottom: 24px;
  }
  .mode-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 10px 16px; border-radius: 8px; border: none; background: none;
    color: var(--text-muted); font-family: inherit; font-size: 13.5px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .mode-btn:hover { color: var(--text); }
  .mode-btn.active { background: var(--surface-raised); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
  .mode-btn svg { width: 16px; height: 16px; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-group label { font-size: 12.5px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .form-group select, .form-group input, .form-group textarea {
    background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
    padding: 10px 14px; color: var(--text); font-family: inherit; font-size: 13.5px;
    transition: border-color 0.2s; outline: none;
  }
  .form-group select:focus, .form-group input:focus, .form-group textarea:focus { border-color: var(--accent); }
  .form-group textarea { resize: vertical; min-height: 100px; }
  .form-group select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7f99' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }

  /* ── Chat Interview ── */
  .interview-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; height: calc(100vh - 160px); }
  .chat-container { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); display: flex; flex-direction: column; overflow: hidden; }
  .chat-top-bar { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--surface-raised); }
  .interviewer-info { display: flex; align-items: center; gap: 10px; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
  .avatar-ai { background: linear-gradient(135deg, var(--accent), #8b5cf6); color: #fff; }
  .avatar-candidate { background: linear-gradient(135deg, #4ade80, #22c55e); color: #0f1117; }
  .interviewer-info .name { font-size: 13.5px; font-weight: 600; }
  .interviewer-info .role-label { font-size: 11.5px; color: var(--text-muted); }
  .timer-badge { display: flex; align-items: center; gap: 6px; background: var(--amber-dim); color: var(--amber); padding: 5px 10px; border-radius: 20px; font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .timer-badge.warning { background: var(--red-dim); color: var(--red); }
  .timer-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse 1.2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .chat-messages { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 18px; }
  .message { display: flex; gap: 10px; animation: fadeInUp 0.25s ease; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .message.ai { flex-direction: row; }
  .message.candidate { flex-direction: row-reverse; }
  .message-content { display: flex; flex-direction: column; max-width: 78%; }
  .message.candidate .message-content { align-items: flex-end; }
  .message-bubble { padding: 10px 14px; border-radius: 16px; font-size: 13.5px; line-height: 1.6; }
  .message.ai .message-bubble { background: var(--surface-raised); border: 1px solid var(--border); border-top-left-radius: 4px; }
  .message.candidate .message-bubble { background: var(--accent-glow); border: 1px solid rgba(91,140,255,0.25); border-top-right-radius: 4px; }
  .message-time { font-size: 10.5px; color: var(--text-muted); margin-top: 4px; }
  .message.candidate .message-time { text-align: right; }
  .chat-input-area { padding: 14px 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; align-items: center; }
  .chat-input-area input { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); font-family: inherit; font-size: 13.5px; outline: none; }
  .chat-input-area input:focus { border-color: var(--accent); }
  .chat-input-area input:disabled { opacity: 0.4; }
  .typing-wrap { display: flex; gap: 10px; align-items: flex-end; animation: fadeInUp 0.25s ease; }
  .typing-bubble { background: var(--surface-raised); border: 1px solid var(--border); border-radius: 16px; border-top-left-radius: 4px; padding: 12px 16px; }
  .typing-indicator { display: flex; align-items: center; gap: 5px; }
  .typing-indicator span { width: 7px; height: 7px; border-radius: 50%; background: var(--text-muted); animation: typingBounce 1.2s infinite; }
  .typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

  .side-panel { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-right: 4px; }
  .topic-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .topic-item:last-child { border-bottom: none; }
  .topic-badge { width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
  .topic-badge.pending { background: var(--surface-raised); color: var(--text-muted); }
  .topic-badge.active { background: var(--accent-glow); color: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
  .topic-badge.done { background: var(--green-dim); color: var(--green); }
  .topic-item .topic-label { font-size: 12.5px; color: var(--text-muted); line-height: 1.4; padding-top: 2px; }
  .topic-item .topic-label.active-label { color: var(--text); font-weight: 500; }
  .detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; }
  .detail-row span:first-child { color: var(--text-muted); }
  .detail-row span:last-child { font-weight: 500; }

  /* ── Phone Waiting Screen ── */
  .phone-waiting { max-width: 580px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 28px; }
  .phone-icon-wrap { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
  .phone-icon-wrap.waiting { background: var(--amber-dim); }
  .phone-icon-wrap.in-progress { background: var(--green-dim); }
  .phone-icon-wrap.completed { background: var(--green-dim); }
  .phone-icon-wrap svg { width: 40px; height: 40px; }
  .phone-icon-wrap.waiting svg { color: var(--amber); }
  .phone-icon-wrap.in-progress svg { color: var(--green); }
  .phone-icon-wrap.completed svg { color: var(--green); }
  .phone-pulse { position: absolute; inset: -6px; border-radius: 50%; border: 2px solid var(--amber); opacity: 0.4; animation: phonePulse 2s infinite; }
  .phone-icon-wrap.in-progress .phone-pulse { border-color: var(--green); }
  @keyframes phonePulse { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.2); opacity: 0; } }
  .phone-status-text { text-align: center; }
  .phone-status-text h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .phone-status-text p { color: var(--text-muted); font-size: 13.5px; line-height: 1.5; }
  .phone-number-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 28px; text-align: center; width: 100%; }
  .phone-number-box .pn-label { font-size: 11.5px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .phone-number-box .number { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; letter-spacing: 1px; color: var(--accent); }
  .copy-btn { display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 5px 12px; border-radius: 6px; font-family: inherit; font-size: 12px; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* Status timeline */
  .status-timeline { display: flex; flex-direction: column; gap: 0; width: 100%; max-width: 340px; }
  .status-step { display: flex; gap: 14px; align-items: flex-start; }
  .status-step-line { display: flex; flex-direction: column; align-items: center; }
  .status-dot-wrap { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .status-dot-wrap.done { background: var(--green-dim); color: var(--green); }
  .status-dot-wrap.active { background: var(--accent-glow); color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }
  .status-dot-wrap.pending { background: var(--surface-raised); color: var(--text-muted); }
  .status-connector { width: 2px; height: 24px; background: var(--border); margin: 2px 0; }
  .status-connector.done { background: var(--green); }
  .status-step-content { padding-top: 4px; }
  .status-step-content .step-label { font-size: 13.5px; font-weight: 500; }
  .status-step-content .step-label.done { color: var(--green); }
  .status-step-content .step-label.active { color: var(--accent); }
  .status-step-content .step-label.pending { color: var(--text-muted); }
  .status-step-content .step-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  /* ── Results ── */
  .results-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .score-hero { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; text-align: center; }
  .score-circle { width: 140px; height: 140px; border-radius: 50%; margin: 0 auto 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
  .score-circle svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
  .score-circle .score-num { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; position: relative; z-index: 1; }
  .score-circle .score-label { font-size: 11px; color: var(--text-muted); position: relative; z-index: 1; text-transform: uppercase; letter-spacing: 0.5px; }
  .score-hero .candidate-name { font-size: 17px; font-weight: 600; margin-bottom: 4px; }
  .score-hero .candidate-role { font-size: 12.5px; color: var(--text-muted); }
  .score-breakdown { display: flex; flex-direction: column; gap: 14px; }
  .score-bar-item { display: flex; flex-direction: column; gap: 6px; }
  .score-bar-item .bar-label { display: flex; justify-content: space-between; font-size: 12.5px; }
  .score-bar-item .bar-label span:last-child { color: var(--accent); font-weight: 600; }
  .score-bar-track { height: 5px; background: var(--surface-raised); border-radius: 3px; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--accent), #8b5cf6); transition: width 1s ease; }
  .commentary-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; }
  .commentary-box h4 { font-size: 12px; font-weight: 600; margin-bottom: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .commentary-box p { font-size: 13.5px; line-height: 1.7; color: var(--text); }
  .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .tag { padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 500; }
  .tag.strength { background: var(--green-dim); color: var(--green); }
  .tag.improvement { background: var(--red-dim); color: var(--red); }

  /* ── Candidates Table ── */
  .candidates-table { width: 100%; border-collapse: collapse; }
  .candidates-table th { text-align: left; font-size: 11.5px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
  .candidates-table td { padding: 14px; border-bottom: 1px solid rgba(42,45,61,0.5); font-size: 13.5px; }
  .candidates-table tr:last-child td { border-bottom: none; }
  .candidates-table tbody tr { transition: background 0.15s; cursor: pointer; }
  .candidates-table tbody tr:hover td { background: var(--surface-raised); }
  .status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 11.5px; font-weight: 500; }
  .status-pill.completed { background: var(--green-dim); color: var(--green); }
  .status-pill.phone { background: var(--amber-dim); color: var(--amber); }
  .status-pill.chat { background: var(--accent-glow); color: var(--accent); }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .mini-score { display: flex; align-items: center; gap: 8px; }
  .mini-score .val { font-weight: 600; color: var(--accent); font-size: 13px; }
  .mini-bar-track { width: 60px; height: 4px; background: var(--surface-raised); border-radius: 2px; }
  .mini-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--accent), #8b5cf6); }

  .loading-overlay { position: fixed; inset: 0; background: rgba(15,17,23,0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; gap: 16px; }
  .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-overlay p { color: var(--text-muted); font-size: 14px; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "ML Engineer",
  "Mobile Developer",
  "QA Engineer",
  "Software Engineer",
  "Automation Test Lead",
  "Senior Software Engineer",
  "Cloud Architect",
  "Solutions Architect",
  "Security Engineer",
  "Network Engineer",
  "Database Administrator",
  "Systems Administrator",
  "Business Analyst",
  "Data Analyst",
  "Product Manager",
  "Project Manager",
  "Delivery Lead",
  "Practice Lead",
  "UI/UX Designer",
  "Tech Lead",
  "Other",
];
const EXPERIENCE_LEVELS = [
  "Junior (0-2 yrs)",
  "Mid (2-4 yrs)",
  "Senior (4-7 yrs)",
  "Lead (7+ yrs)",
];
const DURATION_OPTIONS = [
  { label: "20 mins", value: 20 },
  { label: "25 mins", value: 25 },
  { label: "30 mins", value: 30 },
];
const TOPIC_AREAS = [
  "Introduction & Background",
  "Technical Depth",
  "Problem Solving",
  "Experience & Projects",
  "Culture & Teamwork",
  "Wrap Up",
];
const BACKEND_URL = "https://interview-backend-production-0688.up.railway.app";
const TWILIO_NUMBER = "+61 2 3820 5224";

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
async function callClaude(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function buildSystemPrompt(
  role,
  experience,
  jd,
  resumeText,
  candidateName,
  durationMins,
  timeLeftSecs,
) {
  const mins = Math.floor(timeLeftSecs / 60);
  const secs = timeLeftSecs % 60;
  let contextSection = "";
  if (jd && resumeText)
    contextSection = `━━━ CONTEXT ━━━\nJob Description:\n${jd}\n\nResume:\n${resumeText}\n\nUse both to ask relevant, specific questions.`;
  else if (jd)
    contextSection = `━━━ JOB DESCRIPTION ━━━\n${jd}\n\nTailor questions to this role.`;
  else if (resumeText)
    contextSection = `━━━ RESUME ━━━\n${resumeText}\n\nAsk about their actual experience.`;
  else
    contextSection = `━━━ CONTEXT ━━━\nNo JD or Resume. Focus on general questions for a ${experience} ${role}.`;

  return `You are Sarah, a warm recruiter interviewing ${candidateName} for a ${experience} ${role} position.

━━━ HOW YOU TALK ━━━
Keep it SHORT. One question at a time. React to what they say naturally.
Acknowledgments: "Mmhm", "Yeah", "Got it", "Okay", "Right", "Makes sense". No praise like "That's great!".
Never say "Next question". Flow naturally. Sound like a real person on a call.

━━━ FLOW ━━━
1. Open with casual small talk.
2. Ease into "Tell me about yourself."
3. Cover: background, technical skills for ${role}, problem solving, projects, teamwork.
4. Wrap up when time is low.

${contextSection}

━━━ TIME: ${mins}m ${secs}s left ━━━
• >5 mins: keep going. • 3-5 mins: steer to final question. • <2 mins: wrap up, set interviewComplete true.

━━━ OUTPUT ━━━
ONLY valid JSON: { "reply": "<response>", "topicArea": "<one of: Introduction & Background, Technical Depth, Problem Solving, Experience & Projects, Culture & Teamwork, Wrap Up>", "interviewComplete": <true|false> }`;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("setup");
  const [candidates, setCandidates] = useState([]);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [interviewMode, setInterviewMode] = useState("chat"); // "chat" | "phone"

  // Setup form
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("");
  const [duration, setDuration] = useState(25);
  const [candidateName, setCandidateName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [jd, setJd] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // Chat state
  const [messages, setMessages] = useState([]);
  const [apiMessages, setApiMessages] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [interviewDone, setInterviewDone] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [currentTopic, setCurrentTopic] = useState(0);
  const [topicHistory, setTopicHistory] = useState([]);

  // Phone state
  const [phoneSessionId, setPhoneSessionId] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState("waiting"); // waiting | in_progress | completed
  const [copied, setCopied] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [filterMaxScore, setFilterMaxScore] = useState(10);
  const [sortBy, setSortBy] = useState("date"); // date, score, name

  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const doneRef = useRef(false);
  const timeLeftRef = useRef(0);
  const phonePollerRef = useRef(null);
  const phoneStatusRef = useRef("waiting");

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  useEffect(() => {
    phoneStatusRef.current = phoneStatus;
  }, [phoneStatus]);

  // ── Chat timer ──
  useEffect(() => {
    if (view !== "interview" || interviewDone || interviewMode !== "chat")
      return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!doneRef.current) {
            doneRef.current = true;
            setInterviewDone(true);
            setMessages((m) => [
              ...m,
              {
                role: "ai",
                text: "Oh looks like we've hit our time! Thanks so much for chatting — it was great talking to you. Have an awesome rest of your day!",
                time: new Date(),
              },
            ]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view, interviewDone, interviewMode]);

  // ── Phone poller ──
  useEffect(() => {
    if (view !== "phone-waiting" || !phoneSessionId) return;
    phonePollerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/session/${phoneSessionId}`);
        const session = await res.json();
        if (
          session.status === "in_progress" &&
          phoneStatusRef.current === "waiting"
        )
          setPhoneStatus("in_progress");
        if (
          session.status === "completed" &&
          phoneStatusRef.current !== "completed"
        ) {
          setPhoneStatus("completed");
          clearInterval(phonePollerRef.current);
        }
      } catch {
        /* retry next tick */
      }
    }, 3000);
    return () => clearInterval(phonePollerRef.current);
  }, [view, phoneSessionId]);

  // ── Load completed candidates ──
  useEffect(() => {
    if (view === "candidates") loadCandidates();
  }, [view]);

  const loadCandidates = async () => {
    try {
      const candidateList = [];
      const seenIds = new Set();

      // 1. Fetch completed sessions from 'sessions' collection
      try {
        console.log("🔍 Loading from 'sessions' collection...");
        const q = query(
          collection(db, "sessions"),
          where("status", "==", "completed"),
        );
        const snapshot = await getDocs(q);

        console.log(
          `Found ${snapshot.docs.length} completed sessions in 'sessions'`,
        );

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Include ALL completed sessions, scored or not
          const candidate = {
            id: doc.id,
            name: data.candidate_name || "Unknown",
            role: data.role || "Unknown",
            experience: data.experience_level || "Unknown",
            scores: data.scores || null,
            overall: data.overall_score || null,
            completedAt: data.scored_at
              ? new Date(data.scored_at)
              : data.completed_at
                ? new Date(data.completed_at)
                : new Date(),
            mode: data.phone_number ? "phone" : "chat",
            transcript: data.transcript || [],
            source: "sessions",
          };
          candidateList.push(candidate);
          seenIds.add(doc.id);
        });
        console.log(
          `✅ Loaded ${candidateList.length} candidates from 'sessions' collection`,
        );
      } catch (err) {
        console.error("❌ Error loading from 'sessions' collection:", err);
      }

      // 2. Fetch scored interviews from 'scored_interviews' collection
      try {
        console.log("🔍 Loading from 'scored_interviews' collection...");
        const q = query(collection(db, "scored_interviews"));
        const snapshot = await getDocs(q);

        console.log(
          `Found ${snapshot.docs.length} interviews in 'scored_interviews'`,
        );

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Only add if not already added from sessions collection
          if (!seenIds.has(doc.id)) {
            const candidate = {
              id: doc.id,
              name: data.name || "Unknown",
              role: data.role || "Unknown",
              experience: data.experience || "Unknown",
              scores: data.scores || null,
              overall: data.overall || null,
              completedAt: data.completedAt
                ? new Date(data.completedAt)
                : new Date(data.created_at),
              mode: data.mode || "chat",
              transcript: data.transcript || [],
              source: "scored_interviews",
            };
            candidateList.push(candidate);
            seenIds.add(doc.id);
          }
        });
        console.log(
          `✅ Total candidates now: ${candidateList.length}`,
        );
      } catch (err) {
        console.error(
          "❌ Error loading from 'scored_interviews' collection:",
          err,
        );
      }

      // 3. Include all candidates (with or without scores for now)
      setCandidates(candidateList);

      // Update localStorage for quick access
      localStorage.setItem(
        "interviewai_candidates",
        JSON.stringify(candidateList),
      );
      console.log(
        `📊 Total candidates loaded: ${candidateList.length}`,
      );
      console.log("Candidates:", candidateList);
    } catch (err) {
      console.error("Error loading candidates from Firestore:", err);
      // Fallback to localStorage
      const stored = localStorage.getItem("interviewai_candidates");
      if (stored) {
        try {
          setCandidates(JSON.parse(stored));
        } catch {}
      }
    }
  };

  const saveCandidate = async (candidate) => {
    try {
      // Save to Firestore
      await addDoc(collection(db, "scored_interviews"), {
        ...candidate,
        created_at: new Date().toISOString(),
      });

      // Update local state
      const updated = [...candidates, candidate];
      setCandidates(updated);
      localStorage.setItem("interviewai_candidates", JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving candidate to Firestore:", err);
      // Still update local state even if Firestore fails
      const updated = [...candidates, candidate];
      setCandidates(updated);
      localStorage.setItem("interviewai_candidates", JSON.stringify(updated));
    }
  };

  // ── Resume ──
  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => setResumeText(ev.target.result);
      reader.readAsText(file);
    } else {
      setResumeText(`[Resume: ${file.name}]`);
    }
  };
  const clearResume = () => {
    setResumeFile(null);
    setResumeText("");
  };

  // ── Chat: AI reply ──
  const getAIReply = useCallback(
    async (updatedApiMsgs) => {
      setIsTyping(true);
      try {
        const raw = await callClaude(
          updatedApiMsgs,
          buildSystemPrompt(
            role,
            experience,
            jd,
            resumeText,
            candidateName,
            duration,
            timeLeftRef.current,
          ),
        );
        let clean = raw
          .trim()
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "");
        const m = clean.match(/\{[\s\S]*\}/);
        if (m) clean = m[0];
        const parsed = JSON.parse(clean);
        if (!parsed.reply) throw new Error("No reply");
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: parsed.reply, time: new Date() },
        ]);
        setApiMessages([
          ...updatedApiMsgs,
          { role: "assistant", content: parsed.reply },
        ]);
        const idx = TOPIC_AREAS.indexOf(parsed.topicArea);
        if (idx >= 0) {
          setCurrentTopic(idx);
          setTopicHistory((prev) =>
            prev.includes(idx) ? prev : [...prev, idx],
          );
        }
        if (parsed.interviewComplete) {
          doneRef.current = true;
          setInterviewDone(true);
          clearInterval(timerRef.current);
        }
      } catch {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Could you expand on that a bit?",
            time: new Date(),
          },
        ]);
      }
    },
    [role, experience, jd, resumeText, candidateName, duration],
  );

  // ── Start Chat ──
  const startChatInterview = async () => {
    setLoading(true);
    setLoadingText("Setting up interview...");
    setMessages([]);
    setApiMessages([]);
    setTimeLeft(duration * 60);
    timeLeftRef.current = duration * 60;
    setInterviewDone(false);
    doneRef.current = false;
    setCurrentTopic(0);
    setTopicHistory([0]);
    setView("interview");
    setLoading(false);
    setIsTyping(true);
    const kickoff = [
      { role: "user", content: "Start with warm casual small talk." },
    ];
    try {
      const raw = await callClaude(
        kickoff,
        buildSystemPrompt(
          role,
          experience,
          jd,
          resumeText,
          candidateName,
          duration,
          duration * 60,
        ),
      );
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setIsTyping(false);
      setMessages([{ role: "ai", text: parsed.reply, time: new Date() }]);
      setApiMessages([
        kickoff[0],
        { role: "assistant", content: parsed.reply },
      ]);
      const idx = TOPIC_AREAS.indexOf(parsed.topicArea);
      if (idx >= 0) {
        setCurrentTopic(idx);
        setTopicHistory([idx]);
      }
    } catch {
      setIsTyping(false);
      const fb = `Hey ${candidateName}! Thanks for jumping on — how's your day going?`;
      setMessages([{ role: "ai", text: fb, time: new Date() }]);
      setApiMessages([kickoff[0], { role: "assistant", content: fb }]);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  // ── Start Phone ──
  const startPhoneInterview = async () => {
    setLoading(true);
    setLoadingText("Creating interview session...");
    try {
      const res = await fetch(`${BACKEND_URL}/api/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_name: candidateName,
          role: role === "Other" ? customRole : role,
          experience_level: experience,
          job_description: jd,
          resume: resumeText,
          phone_number: phoneNumber,
        }),
      });
      const data = await res.json();
      setPhoneSessionId(data.session_id);
      setPhoneStatus("waiting");
      setView("phone-waiting");
    } catch {
      alert("Failed to create session. Is the backend running?");
    }
    setLoading(false);
  };

  // ── Score ──
  const scoreInterview = async (mode) => {
    setLoading(true);
    setLoadingText("Scoring the interview...");
    try {
      const scorePayload = {
        mode,
        candidate_name: candidateName,
        role: role === "Other" ? customRole : role,
        experience_level: experience,
      };

      // Add mode-specific data
      if (mode === "phone") {
        scorePayload.session_id = phoneSessionId;
      } else if (mode === "chat") {
        scorePayload.messages = messages;
      }

      // Call backend endpoint for all modes (no CORS!)
      console.log(
        "Calling backend /api/score-interview with payload:",
        scorePayload,
      );
      const scoreRes = await fetch(`${BACKEND_URL}/api/score-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scorePayload),
      });

      console.log("Backend response status:", scoreRes.status);

      if (!scoreRes.ok) {
        const errorText = await scoreRes.text();
        console.error("Backend error response:", errorText);
        throw new Error(
          `Scoring failed: ${scoreRes.statusText} - ${errorText}`,
        );
      }

      const scoreData = await scoreRes.json();
      console.log("Scoring complete:", scoreData);

      // Transform transcript based on mode
      let transcriptMessages = [];
      if (mode === "phone" && scoreData.transcript) {
        // Phone transcripts come from ElevenLabs format
        transcriptMessages = (scoreData.transcript || []).map((t) => ({
          role: t.role === "agent" ? "ai" : "candidate",
          text: t.message || "",
          time: new Date(),
        }));
      } else if (mode === "chat" && scoreData.transcript) {
        // Chat transcripts are already in our format
        transcriptMessages = scoreData.transcript;
      }

      const result = {
        id: Date.now(),
        name: candidateName,
        role: role === "Other" ? customRole : role,
        experience,
        scores: scoreData.scores,
        overall: scoreData.overall,
        completedAt: new Date(),
        mode,
        transcript: transcriptMessages,
      };

      saveCandidate(result);
      setCurrentCandidate(result);
      setView("results");
    } catch (err) {
      console.error("Scoring error:", err);
      alert("Scoring failed: " + (err.message || "Unknown error. Try again."));
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!inputVal.trim() || interviewDone || isTyping) return;
    const msg = inputVal.trim();
    setInputVal("");
    setMessages((prev) => [
      ...prev,
      { role: "candidate", text: msg, time: new Date() },
    ]);
    const updated = [...apiMessages, { role: "user", content: msg }];
    setApiMessages(updated);
    await getAIReply(updated);
  };

  const copyNumber = () => {
    navigator.clipboard.writeText("+61238205224");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const resetSetup = () => {
    setRole("");
    setExperience("");
    setCandidateName("");
    setJd("");
    clearResume();
    setView("setup");
  };

  // ─── RENDER: SETUP ────────────────────────────────────────────────────────
  const renderSetup = () => (
    <div style={{ maxWidth: 740 }}>
      <div className="page-header">
        <div>
          <h1>New Interview</h1>
          <p>Configure the role and candidate details</p>
        </div>
      </div>
      <div className="mode-toggle">
        <button
          className={`mode-btn ${interviewMode === "chat" ? "active" : ""}`}
          onClick={() => setInterviewMode("chat")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Chat Interview
        </button>
        <button
          className={`mode-btn ${interviewMode === "phone" ? "active" : ""}`}
          onClick={() => setInterviewMode("phone")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          Phone Interview
        </button>
      </div>
      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Select a role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {role === "Other" && (
            <div className="form-group">
              <label>Custom Role</label>
              <input
                type="text"
                placeholder="Enter custom role"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
              />
            </div>
          )}
          <div className="form-group">
            <label>Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Select experience</option>
              {EXPERIENCE_LEVELS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Candidate Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Mehta"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
          </div>
          {interviewMode === "phone" && (
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="+61 412 345 678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}
          {interviewMode === "chat" && (
            <div className="form-group">
              <label>Interview Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group full">
            <label>Job Description (Optional)</label>
            <textarea
              placeholder="Paste the job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              style={{ minHeight: 140 }}
            />
          </div>
          <div className="form-group full">
            <label>Resume (Optional)</label>
            {resumeFile ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                  <path d="M13 2v7h7" />
                </svg>
                <span style={{ flex: 1, fontSize: 13.5 }}>
                  {resumeFile.name}
                </span>
                <button
                  type="button"
                  onClick={clearResume}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: "block",
                  padding: "32px 14px",
                  background: "var(--bg)",
                  border: "1px dashed var(--border)",
                  borderRadius: 8,
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleResumeUpload}
                  style={{ display: "none" }}
                />
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      margin: "0 auto 8px",
                      display: "block",
                      opacity: 0.5,
                    }}
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  Click to upload PDF / Word / Text
                </div>
              </label>
            )}
          </div>
        </div>
        <div
          style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}
        >
          <button
            className="btn btn-primary"
            disabled={
              !candidateName ||
              (role === "Other" ? !customRole : !role) ||
              !experience
            }
            onClick={
              interviewMode === "chat"
                ? startChatInterview
                : startPhoneInterview
            }
          >
            {interviewMode === "chat" ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>{" "}
                Start Chat Interview
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>{" "}
                Start Phone Interview
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── RENDER: PHONE WAITING ────────────────────────────────────────────────
  const renderPhoneWaiting = () => {
    const steps = [
      {
        label: "Session Created",
        sub: "Interview context saved",
        status: "done",
      },
      {
        label:
          phoneStatus === "waiting" ? "Waiting for Call" : "Call Connected",
        sub:
          phoneStatus === "waiting"
            ? `${candidateName} needs to dial in`
            : "Sarah is interviewing",
        status: phoneStatus === "waiting" ? "active" : "done",
      },
      {
        label: "Interview In Progress",
        sub: "Sarah is conducting the interview",
        status:
          phoneStatus === "in_progress"
            ? "active"
            : phoneStatus === "completed"
              ? "done"
              : "pending",
      },
      {
        label: "Interview Complete",
        sub: "Transcript received, ready to score",
        status: phoneStatus === "completed" ? "active" : "pending",
      },
    ];
    return (
      <div className="phone-waiting">
        <div
          className="page-header"
          style={{ textAlign: "center", marginBottom: 0 }}
        >
          <div>
            <h1>Phone Interview</h1>
            <p>
              {role} · {experience} · {candidateName}
            </p>
          </div>
        </div>
        <div className={`phone-icon-wrap ${phoneStatus.replace("_", "-")}`}>
          <div className="phone-pulse" />
          {phoneStatus === "completed" ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          )}
        </div>
        <div className="phone-status-text">
          {phoneStatus === "waiting" && (
            <>
              <h2>Waiting for {candidateName}</h2>
              <p>Have {candidateName} call the number below to start.</p>
            </>
          )}
          {phoneStatus === "in_progress" && (
            <>
              <h2>Interview In Progress</h2>
              <p>Sarah is interviewing {candidateName} right now.</p>
            </>
          )}
          {phoneStatus === "completed" && (
            <>
              <h2>Interview Complete</h2>
              <p>
                The call ended and the transcript was received. Ready to score.
              </p>
            </>
          )}
        </div>
        {phoneStatus !== "completed" && (
          <div className="phone-number-box">
            <div className="pn-label">Candidate should call this number</div>
            <div className="number">{TWILIO_NUMBER}</div>
            <button className="copy-btn" onClick={copyNumber}>
              {copied ? (
                "✓ Copied!"
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>{" "}
                  Copy Number
                </>
              )}
            </button>
          </div>
        )}
        <div className="status-timeline">
          {steps.map((step, i) => (
            <div key={i}>
              <div className="status-step">
                <div className="status-step-line">
                  <div className={`status-dot-wrap ${step.status}`}>
                    {step.status === "done" ? "✓" : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`status-connector ${step.status === "done" ? "done" : ""}`}
                    />
                  )}
                </div>
                <div className="status-step-content">
                  <div className={`step-label ${step.status}`}>
                    {step.label}
                  </div>
                  <div className="step-sub">{step.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {phoneStatus === "completed" && (
            <button
              className="btn btn-primary"
              onClick={() => scoreInterview("phone")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>{" "}
              Score Interview
            </button>
          )}
          <button className="btn btn-secondary" onClick={resetSetup}>
            Back to Setup
          </button>
        </div>
      </div>
    );
  };

  // ─── RENDER: CHAT INTERVIEW ───────────────────────────────────────────────
  const renderInterview = () => (
    <div style={{ height: "100%" }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <h1>Live Interview</h1>
          <p>
            {role} · {experience} · {candidateName}
          </p>
        </div>
        {interviewDone && (
          <button
            className="btn btn-primary"
            onClick={() => scoreInterview("chat")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>{" "}
            Score Interview
          </button>
        )}
      </div>
      <div className="interview-layout">
        <div className="chat-container">
          <div className="chat-top-bar">
            <div className="interviewer-info">
              <div className="avatar avatar-ai">S</div>
              <div>
                <div className="name">Sarah</div>
                <div className="role-label">Interview Coordinator</div>
              </div>
            </div>
            <div className={`timer-badge ${timeLeft <= 180 ? "warning" : ""}`}>
              <span className="timer-dot" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <div>
                  {m.role === "ai" ? (
                    <span
                      className="avatar avatar-ai"
                      style={{ width: 28, height: 28, fontSize: 11 }}
                    >
                      S
                    </span>
                  ) : (
                    <span
                      className="avatar avatar-candidate"
                      style={{ width: 28, height: 28, fontSize: 11 }}
                    >
                      {candidateName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-bubble">{m.text}</div>
                  <div className="message-time">
                    {m.time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="typing-wrap">
                <span
                  className="avatar avatar-ai"
                  style={{ width: 28, height: 28, fontSize: 11 }}
                >
                  S
                </span>
                <div className="typing-bubble">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                interviewDone ? "Interview completed" : "Type your response..."
              }
              value={inputVal}
              disabled={interviewDone || isTyping}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="btn btn-primary"
              disabled={interviewDone || !inputVal.trim() || isTyping}
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
        <div className="side-panel">
          <div className="card">
            <div className="card-header">
              <h3>Topics</h3>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                {topicHistory.length}/{TOPIC_AREAS.length}
              </span>
            </div>
            {TOPIC_AREAS.map((topic, i) => {
              const isDone = topicHistory.includes(i) && currentTopic > i;
              const isActive = currentTopic === i;
              return (
                <div key={i} className="topic-item">
                  <div
                    className={`topic-badge ${isDone ? "done" : isActive ? "active" : "pending"}`}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div
                    className={`topic-label ${isActive ? "active-label" : ""}`}
                  >
                    {topic}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card">
            <div className="card-header">
              <h3>Details</h3>
            </div>
            {[
              ["Role", role],
              ["Level", experience],
              ["Candidate", candidateName],
              ["Duration", `${duration} mins`],
              ["Mode", "Chat"],
            ].map(([k, v]) => (
              <div key={k} className="detail-row">
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── RENDER: RESULTS ──────────────────────────────────────────────────────
  const renderResults = () => {
    const s = currentCandidate?.scores;
    if (!s) return null;
    const params = [
      { key: "technical", label: "Technical Knowledge" },
      { key: "communication", label: "Communication" },
      { key: "relevance", label: "JD Relevance" },
      { key: "problemSolving", label: "Problem Solving" },
      { key: "confidence", label: "Confidence" },
    ];
    const pct = (currentCandidate.overall / 10) * 100;
    const circumference = 2 * Math.PI * 54;
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>{currentCandidate.name}</h1>
            <p>
              {currentCandidate.role} · {currentCandidate.experience} ·{" "}
              {currentCandidate.mode === "phone" ? "📞 Phone" : "💬 Chat"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary" onClick={resetSetup}>
              New Interview
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setView("candidates")}
            >
              All Candidates
            </button>
          </div>
        </div>
        <div className="results-layout">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="score-hero">
              <div className="score-circle">
                <svg viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#sg)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)}
                  />
                  <defs>
                    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--accent)" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="score-num">{currentCandidate.overall}</div>
                <div className="score-label">/ 10</div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Score Breakdown</h3>
              </div>
              <div className="score-breakdown">
                {params.map((p) => (
                  <div key={p.key} className="score-bar-item">
                    <div className="bar-label">
                      <span>{p.label}</span>
                      <span>{s[p.key]}/10</span>
                    </div>
                    <div className="score-bar-track">
                      <div
                        className="score-bar-fill"
                        style={{ width: `${(s[p.key] / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="commentary-box">
              <h4>Summary</h4>
              <p>{s.summary}</p>
            </div>
            <div className="commentary-box">
              <h4>Strengths</h4>
              <div className="tag-row">
                {s.strengths?.map((st, i) => (
                  <span key={i} className="tag strength">
                    {st}
                  </span>
                ))}
              </div>
            </div>
            <div className="commentary-box">
              <h4>Areas for Improvement</h4>
              <div className="tag-row">
                {s.improvements?.map((im, i) => (
                  <span key={i} className="tag improvement">
                    {im}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <h3>Interview Transcript</h3>
              </div>
              <div
                style={{ maxHeight: 600, overflowY: "auto", paddingRight: 8 }}
              >
                {currentCandidate.transcript &&
                currentCandidate.transcript.length > 0 ? (
                  currentCandidate.transcript.map((msg, i) => (
                    <div
                      key={i}
                      style={{ marginBottom: 16, display: "flex", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background:
                            msg.role === "ai"
                              ? "linear-gradient(135deg, var(--accent), #8b5cf6)"
                              : "linear-gradient(135deg, var(--green), #059669)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {msg.role === "ai"
                          ? "S"
                          : currentCandidate.name[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginBottom: 4,
                            fontWeight: 600,
                          }}
                        >
                          {msg.role === "ai" ? "Sarah" : currentCandidate.name}
                        </div>
                        <div
                          style={{
                            background: "var(--surface-raised)",
                            padding: "10px 12px",
                            borderRadius: 10,
                            fontSize: 13.5,
                            lineHeight: 1.6,
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "var(--text-muted)",
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                    <p>Transcript not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER: CANDIDATES ───────────────────────────────────────────────────
  const renderCandidates = () => {
    // Filter and search logic
    let filtered = candidates.filter((c) => {
      const matchesSearch = c.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRole = !filterRole || c.role === filterRole;
      const matchesScore =
        c.overall >= filterMinScore && c.overall <= filterMaxScore;
      return matchesSearch && matchesRole && matchesScore;
    });

    // Sort logic
    if (sortBy === "score") filtered.sort((a, b) => b.overall - a.overall);
    else if (sortBy === "name")
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    else
      filtered.sort(
        (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
      ); // date

    const uniqueRoles = [...new Set(candidates.map((c) => c.role))];

    return (
      <div style={{ maxWidth: 1000 }}>
        <div className="page-header">
          <div>
            <h1>All Candidates</h1>
            <p>
              {filtered.length} of {candidates.length} interviewed
            </p>
          </div>
          <button className="btn btn-primary" onClick={resetSetup}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>{" "}
            New Interview
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="card" style={{ marginBottom: 20, padding: 18 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "10px 12px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: 13.5,
              }}
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: "10px 12px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: 13.5,
                appearance: "none",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7f99' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: 32,
              }}
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number"
                min="0"
                max="10"
                value={filterMinScore}
                onChange={(e) => setFilterMinScore(Number(e.target.value))}
                style={{
                  padding: "10px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontFamily: "inherit",
                  fontSize: 12,
                  flex: 1,
                }}
                placeholder="Min"
              />
              <span style={{ color: "var(--text-muted)" }}>-</span>
              <input
                type="number"
                min="0"
                max="10"
                value={filterMaxScore}
                onChange={(e) => setFilterMaxScore(Number(e.target.value))}
                style={{
                  padding: "10px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontFamily: "inherit",
                  fontSize: 12,
                  flex: 1,
                }}
                placeholder="Max"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 12px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: 13.5,
                appearance: "none",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7f99' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: 32,
              }}
            >
              <option value="date">Sort: Recent</option>
              <option value="score">Sort: Score</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
          {(searchQuery ||
            filterRole ||
            filterMinScore > 0 ||
            filterMaxScore < 10) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterRole("");
                setFilterMinScore(0);
                setFilterMaxScore(10);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Candidates Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <p>
                {candidates.length === 0
                  ? "No candidates yet."
                  : "No candidates match your filters."}
              </p>
            </div>
          ) : (
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Level</th>
                  <th>Mode</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => {
                      setCurrentCandidate(c);
                      setView("results");
                    }}
                  >
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: "var(--text-muted)" }}>{c.role}</td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {c.experience}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${c.mode === "phone" ? "phone" : "chat"}`}
                      >
                        <span className="status-dot" />
                        {c.mode === "phone" ? "📞 Phone" : "💬 Chat"}
                      </span>
                    </td>
                    <td>
                      <div className="mini-score">
                        <span className="val">{c.overall}</span>
                        <div className="mini-bar-track">
                          <div
                            className="mini-bar-fill"
                            style={{ width: `${(c.overall / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill completed">
                        <span className="status-dot" /> Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // ─── NAV ──────────────────────────────────────────────────────────────────
  const navItems = [
    {
      id: "setup",
      label: "New Interview",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      id: "candidates",
      label: "Candidates",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
  ];
  const getActiveNav = () =>
    ["setup", "interview", "phone-waiting"].includes(view)
      ? "setup"
      : "candidates";

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">🤖</div>
            <div className="logo-text">
              Interview<span>AI</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${getActiveNav() === item.id ? "active" : ""}`}
                onClick={() =>
                  item.id === "setup" ? resetSetup() : setView(item.id)
                }
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="main-content">
          {view === "setup" && renderSetup()}
          {view === "interview" && renderInterview()}
          {view === "phone-waiting" && renderPhoneWaiting()}
          {view === "results" && renderResults()}
          {view === "candidates" && renderCandidates()}
        </div>
      </div>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>{loadingText}</p>
        </div>
      )}
    </>
  );
}
