# 🤖 InterviewAI - Documentation Hub

> **AI-powered interview platform** with phone calls, live transcripts, and automatic scoring using Claude AI

**Live Application:** https://interview-ai-ui.vercel.app/

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System design, components, API routes, data flow |
| **[ACCOUNTS.md](./ACCOUNTS.md)** | Service credentials, balances, account status |
| **[FEATURES.md](./FEATURES.md)** | Current features, roadmap, feature dependencies |
| **[OPERATIONS.md](./OPERATIONS.md)** | How to run, deploy, debug, monitoring |

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- Git

### Local Development

```bash
# 1. Clone frontend repo
git clone https://github.com/Kishan748/-interview-ai-ui.git
cd interview-ai-ui

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# App runs on http://localhost:5173
```

### Access the App
- **Local:** http://localhost:5173
- **Production:** https://interview-ai-ui.vercel.app

---

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   INTERVIEW AI PLATFORM                 │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   FRONTEND       │         │   BACKEND        │
│  (Vercel)        │◄───────►│  (Railway)       │
│                  │         │                  │
│ React + Vite     │ HTTPS   │ Node + Express   │
│ Firestore SDK    │ JSON    │ Firebase Admin   │
└──────────────────┘         └──────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│   SERVICES       │         │   SERVICES       │
│                  │         │                  │
│ • Firestore      │         │ • Claude API     │
│ • Firebase Auth  │         │ • Firestore      │
│                  │         │ • ElevenLabs     │
└──────────────────┘         └──────────────────┘
```

---

## 🎯 Key Features

### ✅ Current Features
- **📞 Phone Interviews** - Live calls with ElevenLabs agents
- **💬 Chat Interviews** - AI interviewer (Sarah) powered by Claude
- **📊 Auto Scoring** - Instant evaluation using Claude AI
- **📝 Transcripts** - Full call transcripts stored in Firestore
- **🔍 Search & Filter** - Find candidates by name, role, score
- **☁️ Cloud Persistence** - All data synced to Firestore
- **🌐 Public URL** - Deployed on Vercel

### 📋 Planned Features
- 🏷️ **Notes & Tags** - Recruiter notes & hiring decisions
- 📄 **PDF Export** - Generate interview reports
- 🔔 **Email Notifications** - Interview completion alerts
- 📊 **Analytics Dashboard** - Interview metrics & trends

---

## 📊 Current Stats

| Metric | Value |
|--------|-------|
| **Frontend Deployed** | ✅ Vercel |
| **Backend Deployed** | ✅ Railway |
| **Database** | ✅ Firestore |
| **Phone Interviews** | ✅ ElevenLabs |
| **AI Scoring** | ✅ Claude API |
| **Search & Filter** | ✅ Implemented |
| **Notes & Tags** | 📋 Todo |
| **PDF Export** | 📋 Todo |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, CSS-in-JS |
| **Backend** | Node.js, Express, Firebase Admin SDK |
| **Database** | Firestore (NoSQL) |
| **AI/ML** | Claude API (Anthropic) |
| **Phone** | ElevenLabs AI Agent, Twilio |
| **Auth** | Firebase Authentication |
| **Deployment** | Vercel (Frontend), Railway (Backend) |

---

## 💰 Monthly Costs

| Service | Cost | Notes |
|---------|------|-------|
| Anthropic (Claude) | ~$5-20 | Pay-as-you-go |
| ElevenLabs (Calls) | ~$10-50 | Pay-as-you-go |
| Railway (Backend) | Free | Free tier |
| Vercel (Frontend) | Free | Free tier |
| Firestore | ~$0-10 | Pay-as-use (free tier includes quota) |
| Twilio | TBD | Upgrade needed (trial = 10 min limit) |
| **TOTAL** | **~$15-80/mo** | Variable based on usage |

---

## ⚠️ Critical Action Items

- [ ] **Twilio Upgrade** - Remove 10-minute call limit
- [ ] **Anthropic Alerts** - Set spending alerts
- [ ] **ElevenLabs Alerts** - Set spending alerts
- [ ] **Firestore Monitoring** - Monitor database growth

---

## 🔗 Quick Links

### Deployments
- **Frontend (Vercel):** https://interview-ai-ui.vercel.app/
- **Backend (Railway):** https://interview-backend-production-0688.up.railway.app

### GitHub Repositories
- **Frontend:** https://github.com/Kishan748/-interview-ai-ui
- **Backend:** https://github.com/Kishan748/Interview-backend-

### Service Dashboards
- **Firebase Console:** https://console.firebase.google.com/project/interview-ai-91b6d
- **Anthropic Console:** https://console.anthropic.com
- **ElevenLabs Dashboard:** https://elevenlabs.io/app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard

---

## 📖 Next Steps

1. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** - Understand the system design
2. **Check [ACCOUNTS.md](./ACCOUNTS.md)** - Review service credentials & balances
3. **See [FEATURES.md](./FEATURES.md)** - View roadmap & planned features
4. **Follow [OPERATIONS.md](./OPERATIONS.md)** - Learn deployment & debugging

---

## ❓ FAQ

**Q: How do I do a phone interview?**
A: Create a new interview → Phone mode → Enter candidate details → Share the Twilio number → Candidate calls in → Transcript auto-saves → Click "Score Interview"

**Q: Where are the transcripts stored?**
A: Firestore `sessions` collection → `transcript` field (array of messages from ElevenLabs)

**Q: How is scoring done?**
A: Backend `/api/score-interview` endpoint → Calls Claude API → Returns 5 category scores → Saves to Firestore

**Q: Can I access candidates from any device?**
A: Yes! All candidates sync via Firestore. Any device with the app can view and search them.

**Q: What's the 10-minute limit on Twilio calls?**
A: Trial limitation. Need to upgrade Twilio account to remove this limit.

---

## 🆘 Support & Issues

For questions or issues:
1. Check [OPERATIONS.md](./OPERATIONS.md) for troubleshooting
2. Review recent commits in GitHub
3. Check backend/frontend logs
4. Review Firestore console for data issues

---

**Last Updated:** February 4, 2025
**Version:** 1.0 - Launch
