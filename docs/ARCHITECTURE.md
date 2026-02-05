# 🏗️ Architecture Documentation

> **System design, components, data flow, and technical specifications for OWLWISE**

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Overview](#component-overview)
3. [Data Flow](#data-flow)
4. [API Routes](#api-routes)
5. [Database Schema](#database-schema)
6. [Authentication & Security](#authentication--security)
7. [Deployment Architecture](#deployment-architecture)

---

## 🏛️ System Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERVIEW AI SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

                          ┌──────────────┐
                          │   CANDIDATE  │
                          │  (Web/Phone) │
                          └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │                         │
           ┌────────▼────────┐      ┌────────▼────────┐
           │   FRONTEND UI   │      │   PHONE CALL    │
           │  (React/Vite)   │      │  (ElevenLabs)   │
           │                 │      │                 │
           │ • Interview     │      │ • AI Agent      │
           │ • Results View  │      │ • Transcript    │
           │ • Candidates    │      │ • Call Control  │
           └────────┬────────┘      └────────┬────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │   BACKEND API       │
                      │  (Node + Express)   │
                      │  (Railway)          │
                      │                     │
                      │ • /create-session   │
                      │ • /initiation       │
                      │ • /post-call        │
                      │ • /score-interview  │
                      │ • /session/:id      │
                      └──────────┬──────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
  ┌─────▼─────┐          ┌───────▼────────┐      ┌──────▼──────┐
  │ FIRESTORE │          │  CLAUDE API    │      │ ELEVENLABS  │
  │ (Database)│          │  (Scoring)     │      │ (Transcr.)  │
  │           │          │                │      │             │
  │ • Sessions│          │ • Score 5 cats │      │ • Webhook   │
  │ • Results │          │ • Feedback     │      │ • Agent ID  │
  │ • Transc. │          │ • Summary      │      │ • Conv. ID  │
  └───────────┘          └────────────────┘      └─────────────┘
```

---

## 🧩 Component Overview

### Frontend (React + Vite)

**Location:** `/Users/kishanshah/interview-ai-ui/`
**Deployed:** Vercel
**URL:** https://interview-ai-ui.vercel.app

#### Core Components

```
src/
├── InterviewAI.jsx (main component - 900+ lines)
│   ├── Setup View (form to create interview)
│   ├── Chat Interview View (live conversation with AI)
│   ├── Phone Waiting View (call status tracking)
│   ├── Results View (scores & transcript)
│   └── Candidates View (search, filter, list)
│
├── firebase.js (Firebase config & Firestore SDK)
│   └── Initialized Firestore client
│
└── index.html (entry point)
```

#### Key Features in Frontend

| Feature | Implementation |
|---------|-----------------|
| **Phone Mode** | Form → Create session → Poll backend for status |
| **Chat Mode** | Form → Render chat UI → Real-time messages |
| **Scoring** | POST to `/api/score-interview` → Display results |
| **Search** | Filter state → Real-time filtering |
| **Persistence** | Firestore SDK + localStorage fallback |

---

### Backend (Node.js + Express)

**Location:** `/Users/kishanshah/interview-backend/`
**Deployed:** Railway
**URL:** https://interview-backend-production-0688.up.railway.app

#### API Routes

```javascript
// POST /api/create-session
// Creates a new interview session
// Body: { candidate_name, role, experience_level, job_description, resume, phone_number }
// Returns: { session_id, message }

// POST /api/initiation
// Called by ElevenLabs before call starts
// Fetches candidate data by phone number
// Returns: candidate details for AI agent

// POST /api/post-call
// ElevenLabs webhook after call completes
// Body: { data: { conversation_id, transcript[], metadata } }
// Saves transcript to Firestore

// POST /api/score-interview
// Score interview using Claude API
// Body: { mode, session_id?, messages?, candidate_name, role, experience_level }
// Returns: { overall, scores{}, transcript[], summary, strengths, improvements }

// GET /api/session/:session_id
// Get session status and data
// Returns: complete session object from Firestore
```

#### File Structure

```
interview-backend/
├── server.js (main application - 500+ lines)
│   ├── Express setup
│   ├── Firebase Admin SDK
│   ├── Helper functions (CRUD, Claude API)
│   └── 5 API routes
│
├── .env (environment variables)
│   ├── ANTHROPIC_API_KEY
│   ├── ELEVENLABS_API_KEY
│   ├── ELEVENLABS_AGENT_ID
│   └── Firebase credentials
│
└── package.json (dependencies)
```

---

## 📊 Data Flow

### Flow 1: Phone Interview (Create → Call → Score)

```
1. USER CREATES SESSION
   └─► Frontend: POST /api/create-session
       └─► Backend: Generate session_id
       └─► Firestore: Save session (status: "waiting")
       └─► Return session_id

2. CANDIDATE RECEIVES PHONE NUMBER
   └─► Frontend: Display Twilio number
   └─► User shares number with candidate

3. CANDIDATE CALLS IN
   └─► Twilio receives call
   └─► ElevenLabs agent answers
   └─► ElevenLabs: POST /api/initiation
       └─► Backend: Fetch candidate data from Firestore
       └─► Return context to ElevenLabs

4. CALL IN PROGRESS
   └─► AI Agent (Sarah) conducts interview
   └─► Recording happens on ElevenLabs side
   └─► Real-time transcript captured

5. CALL ENDS
   └─► ElevenLabs: POST /api/post-call (webhook)
       └─► Payload: { conversation_id, transcript[], call_duration }
       └─► Backend: Save to Firestore
       └─► Frontend: Poll detects "completed" status

6. USER SCORES INTERVIEW
   └─► Frontend: POST /api/score-interview
       ├─► Backend: Fetch transcript from Firestore
       ├─► Claude API: Score interview
       └─► Firestore: Save scores + overall
       └─► Frontend: Display results

7. CANDIDATE APPEARS IN LIST
   └─► Frontend: Query Firestore for completed sessions
   └─► Search & Filter applied
   └─► User can view details
```

### Flow 2: Chat Interview (Start → Chat → Score)

```
1. USER CREATES INTERVIEW (Chat Mode)
   └─► Frontend: Store form data in state
   └─► Start timer (20/25/30 mins)

2. INITIAL AI RESPONSE
   └─► Frontend: POST to Claude API
       └─► Claude responds with greeting
       └─► Render AI message

3. USER SENDS MESSAGE
   └─► Frontend: Add to messages array
   └─► Call Claude API with conversation history
   └─► Claude responds with next question
   └─► Update UI

4. INTERVIEW COMPLETES (Time ends or AI says done)
   └─► Frontend: Show "Score Interview" button

5. USER SCORES INTERVIEW
   └─► Frontend: POST /api/score-interview
       ├─► Send chat messages array
       ├─► Backend: Call Claude to score
       └─► Frontend: Display results

6. CANDIDATE SAVED
   └─► Frontend: saveCandidate() to Firestore
   └─► Appears in candidates list
```

---

## 🔐 Database Schema

### Firestore Collections

#### Collection: `sessions`
```javascript
// Document ID: random hex (16 bytes)
{
  candidate_name: "John Doe",
  role: "Frontend Engineer",
  experience_level: "Mid (2-4 yrs)",
  job_description: "...",
  resume: "...",
  phone_number: "+61...",

  // Interview Details
  status: "waiting" | "in_progress" | "completed",
  created_at: "2025-02-04T10:30:00Z",
  completed_at: "2025-02-04T10:45:00Z",
  scored_at: "2025-02-04T10:46:00Z",

  // Call Details (Phone Mode Only)
  conversation_id: "conv_abc123",
  call_duration: 900, // seconds

  // Transcript (ElevenLabs Format)
  transcript: [
    {
      role: "user" | "agent",
      message: "What is your experience?",
      time_in_call_secs: 5.2
    },
    // ... more messages
  ],

  // Scoring (Added After Scoring)
  scores: {
    technical: 8,
    communication: 7,
    relevance: 8,
    problemSolving: 6,
    confidence: 8
  },
  overall_score: 7.4
}
```

#### Collection: `scored_interviews`
```javascript
// Document ID: auto-generated
{
  // Same as interview result in frontend
  id: 1707046800000,
  name: "John Doe",
  role: "Frontend Engineer",
  experience: "Mid (2-4 yrs)",
  mode: "phone",

  // Scores
  overall: 7.4,
  scores: { technical, communication, ... },

  // Metadata
  completedAt: "2025-02-04T10:46:00Z",
  created_at: "2025-02-04T10:46:00Z",

  // Transcript
  transcript: [{ role, text, time }, ...]
}
```

### Data Relationships

```
sessions (1) ──────────► scored_interviews (many)
                        (after interview scoring)

sessions (1) ──────────► transcript (1)
                        (from ElevenLabs webhook)
```

---

## 🔑 Key Algorithms & Logic

### 1. Phone Number Matching

```javascript
// Backend: /api/initiation
const session = await getSessionByPhone(incoming_phone);
// Matches: status IN ("waiting", "in_progress")
// Returns: candidate data for AI agent context
```

**Purpose:** Allow ElevenLabs to know candidate info when they call

### 2. Scoring Algorithm

```javascript
// Backend: /api/score-interview
1. Fetch transcript from Firestore
2. Build prompt: "Score this interview..."
3. Call Claude API
4. Parse JSON response
5. Calculate overall = avg(5 scores) * 10 / 10
6. Save back to Firestore
7. Return to frontend
```

**Overall Score Calculation:**
```
overall = (technical + communication + relevance + problem_solving + confidence) / 5
```

### 3. Search & Filter Logic

```javascript
// Frontend: renderCandidates()
filtered = candidates.filter(c => {
  matchesSearch = c.name.toLowerCase().includes(query)
  matchesRole = !filterRole || c.role === filterRole
  matchesScore = c.overall >= min && c.overall <= max
  return matchesSearch && matchesRole && matchesScore
})

// Then sort by: date, score (desc), or name (asc)
```

---

## 🔒 Authentication & Security

### Current Implementation

| Layer | Method | Status |
|-------|--------|--------|
| **Frontend** | Firebase SDK | ✅ Configured |
| **Backend** | Environment variables | ✅ API keys in Railway env |
| **Database** | Firestore Rules | ⚠️ Public read/write (dev mode) |
| **API** | No auth required | ⚠️ Webhooks are public (ElevenLabs) |

### Security Notes

⚠️ **Important:** Current setup is for development/demo only:
- Firestore in public read mode (anyone can query)
- No authentication on API endpoints
- API keys stored in environment variables

**Future improvements needed:**
- [ ] Add Firebase Authentication
- [ ] Implement API key validation on endpoints
- [ ] Restrict Firestore access with security rules
- [ ] Add rate limiting to prevent abuse

---

## 🚀 Deployment Architecture

### Frontend Deployment (Vercel)

```
GitHub Push (main branch)
        │
        ▼
Vercel Auto-Deploy
        │
        ├─► npm install
        ├─► npm run build (Vite)
        ├─► Optimize & minify
        │
        ▼
CDN Deploy (Global)
        │
        ▼
https://interview-ai-ui.vercel.app (Live)
```

**Environment Variables in Vercel:**
```
(None required - Firebase config is in client code)
```

### Backend Deployment (Railway)

```
GitHub Push (main branch)
        │
        ▼
Railway Auto-Deploy
        │
        ├─► npm install
        ├─► node server.js
        │
        ├─► Environment Variables:
        │   ├─ ANTHROPIC_API_KEY
        │   ├─ ELEVENLABS_API_KEY
        │   ├─ ELEVENLABS_AGENT_ID
        │   └─ Firebase Credentials
        │
        ▼
Live Server (Railway Infrastructure)
        │
        ▼
https://interview-backend-production-0688.up.railway.app (Live)
```

### External Service Connections

```
Frontend (Vercel)
    ├──► Firestore (Google Cloud)
    └──► Backend API (Railway)

Backend (Railway)
    ├──► Firestore (Google Cloud)
    ├──► Claude API (Anthropic)
    ├──► ElevenLabs (Webhooks)
    └──► Twilio (Phone)
```

---

## 📈 Scalability Considerations

### Current Capacity

| Component | Current Limit | Estimated Capacity |
|-----------|--------------|-------------------|
| Firestore | Free tier | ~100 concurrent users |
| Vercel | Free tier | Unlimited |
| Railway | Free tier | ~100 req/sec |
| Claude API | Rate limited | Unlimited (pay-per-use) |
| ElevenLabs | Rate limited | Unlimited (pay-per-use) |

### Scaling Plan (If Needed)

1. **Firestore:** Upgrade to paid tier (scales automatically)
2. **Railway:** Upgrade to paid plan (add more RAM/CPU)
3. **Backend:** Add caching layer (Redis)
4. **Frontend:** Already scales on Vercel

---

## 🔄 Technology Decisions

### Why These Choices?

| Decision | Rationale |
|----------|-----------|
| **React + Vite** | Fast build, great DX, component reusability |
| **Firestore** | Real-time sync, serverless, low ops |
| **Claude API** | State-of-the-art scoring & conversation |
| **ElevenLabs** | Best voice quality & agent capabilities |
| **Vercel** | Best Next.js/frontend deployment platform |
| **Railway** | Simple Node.js deployment, good DX |

---

## 🐛 Known Limitations

| Issue | Impact | Workaround |
|-------|--------|-----------|
| Twilio Trial (10 min) | Calls drop at 10 min | Upgrade Twilio account |
| No user auth | Anyone can see data | Add Firebase Auth |
| Public Firestore | Data exposure risk | Add security rules |
| No rate limiting | API abuse possible | Add middleware |
| Chat CORS (Frontend) | Can't call Claude directly | Use backend endpoint ✅ |

---

## 📝 Change Log

| Date | Change | Impact |
|------|--------|--------|
| Feb 4, 2025 | Fixed ElevenLabs webhook parsing | ✅ Transcripts now save |
| Feb 4, 2025 | Created /api/score-interview | ✅ No CORS errors |
| Feb 4, 2025 | Added Firestore sync | ✅ Data persists |
| Feb 4, 2025 | Added Search & Filter | ✅ Better UX |
| Feb 4, 2025 | Deployed to Vercel | ✅ Public URL |

---

**Last Updated:** February 4, 2025
**Version:** 1.0 - Initial Documentation
