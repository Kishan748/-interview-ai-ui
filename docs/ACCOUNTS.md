# 💳 Accounts & Services Documentation

> **Service credentials, account status, and cost tracking for OWLWISE**

⚠️ **IMPORTANT:** This document contains references to sensitive data. Keep actual credentials in:
- Railway environment variables (backend)
- Vercel environment variables (frontend)
- `.env` files (never commit to git)
- Password managers (LastPass, 1Password, etc.)

---

## 📋 Table of Contents

1. [API Services](#api-services)
2. [Deployment Services](#deployment-services)
3. [GitHub Repositories](#github-repositories)
4. [Cost Summary](#cost-summary)
5. [Action Items](#action-items)
6. [Account Health](#account-health)

---

## 🔑 API Services

### 1. Anthropic (Claude API)

| Property | Value |
|----------|-------|
| **Account Email** | kishanshah@email.com |
| **API Key Status** | ✅ Active |
| **API Key Stored In** | Railway env var: `ANTHROPIC_API_KEY` |
| **Model Used** | claude-sonnet-4-5-20250929 |
| **Current Usage** | Scoring interviews (1000 tokens/call) |
| **Billing** | Pay-as-you-go |
| **Last Topped Up** | Feb 4, 2025 |
| **Current Balance** | Check at https://console.anthropic.com |
| **Monthly Estimate** | $5-20 (depends on interview volume) |
| **Console** | https://console.anthropic.com |
| **Action Needed** | ⚠️ Monitor balance, set spending alerts |

**Used By:**
- Backend: `/api/score-interview` endpoint
- Frontend: Chat interview AI responses (Sarah)

**Cost Breakdown:**
```
Scoring:     ~1,000 tokens per interview
Chat:        ~500-2,000 tokens per interview
Typical:     ~3-5 interviews/day = 3,000-7,000 tokens
Daily cost:  ~$0.05-0.15
Monthly:     ~$1.50-4.50
```

---

### 2. ElevenLabs (Phone Agent & Transcription)

| Property | Value |
|----------|-------|
| **Account Email** | kishanshah@email.com |
| **API Key Status** | ✅ Active |
| **API Key Stored In** | Railway env var: `ELEVENLABS_API_KEY` |
| **Agent ID** | agent_3001kggq58fze4ctfda9h1861w7p |
| **Plan** | Starter / Pro |
| **Billing** | Pay-as-you-go (per minute) |
| **Last Topped Up** | Feb 4, 2025 |
| **Current Balance** | Check at https://elevenlabs.io/app |
| **Monthly Estimate** | $10-50 (depends on call volume) |
| **Console** | https://elevenlabs.io/app |
| **Action Needed** | ⚠️ Monitor balance, set spending alerts |

**Used By:**
- Phone interviews (AI agent conducts calls)
- Automatic transcription (receives webhook)

**Cost Breakdown:**
```
Agent call:  ~$0.50-1.00 per minute
Typical:     ~15 min call = $7.50-15
Daily:       ~1-2 calls = $15-30
Monthly:     ~$450-900
```

⚠️ **Note:** This is the highest cost. Monitor usage carefully.

---

### 3. Firebase (Firestore & Authentication)

| Property | Value |
|----------|-------|
| **Project ID** | interview-ai-91b6d |
| **Project Email** | interview-ai-91b6d@appspot.gserviceaccount.com |
| **Status** | ✅ Active |
| **Firestore Region** | us-central1 |
| **Authentication** | Service Account (Backend) + SDK (Frontend) |
| **Billing** | Pay-as-use (free tier included) |
| **Current Storage** | ~5-10 MB (estimate) |
| **Console** | https://console.firebase.google.com/project/interview-ai-91b6d |
| **Collections** | `sessions`, `scored_interviews` |
| **Action Needed** | ⚠️ Monitor storage growth |

**Used By:**
- Frontend: Firestore SDK (real-time sync)
- Backend: Firebase Admin SDK (CRUD operations)
- Database: All candidate, session, and transcript data

**Cost Estimate:**
```
Free tier covers:
- 1 GB storage
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day

Current usage: ~1% of free tier
Monthly cost: FREE (under quota)
```

---

### 4. Twilio (Phone Numbers)

| Property | Value |
|----------|-------|
| **Account Email** | kishanshah@email.com |
| **Phone Number** | +61 2 3820 5224 |
| **Plan** | Trial |
| **Status** | ⚠️ Trial (10-minute call limit) |
| **Billing** | TBD (trial is free) |
| **Console** | https://www.twilio.com/console |
| **Action Needed** | 🔴 **URGENT: Upgrade to remove 10-min limit** |

**Used By:**
- Phone interviews (incoming call routing)
- ElevenLabs agent integration

**Limitations:**
- ⚠️ Calls drop exactly at 10 minutes
- Trial numbers only work with verified recipients

**Next Steps:**
1. Upgrade Twilio account to paid plan
2. Configure call routing
3. Add call recording (optional)
4. Set up billing alerts

---

## 🚀 Deployment Services

### 1. Vercel (Frontend)

| Property | Value |
|----------|-------|
| **Project Name** | interview-ai-ui |
| **Repository** | https://github.com/Kishan748/-interview-ai-ui |
| **URL** | https://interview-ai-ui.vercel.app |
| **Status** | ✅ Active & Deployed |
| **Auto-Deploy** | On main branch push |
| **Plan** | Hobby (Free) |
| **Monthly Cost** | Free |
| **Dashboard** | https://vercel.com/dashboard |
| **Last Deploy** | Feb 4, 2025 |

**Deployment Flow:**
```
Git Push → GitHub → Vercel Auto-Deploy → Build → CDN → Live
```

**Environment Variables:** None required (config in code)

---

### 2. Railway (Backend)

| Property | Value |
|----------|-------|
| **Project Name** | interview-backend |
| **Repository** | https://github.com/Kishan748/Interview-backend- |
| **URL** | https://interview-backend-production-0688.up.railway.app |
| **Status** | ✅ Active & Deployed |
| **Auto-Deploy** | On main branch push |
| **Plan** | Free Tier |
| **Monthly Cost** | Free (until ~$5/month limit) |
| **Dashboard** | https://railway.app/dashboard |
| **Last Deploy** | Feb 4, 2025 |

**Environment Variables Set:**
```
✅ ANTHROPIC_API_KEY
✅ ELEVENLABS_API_KEY
✅ ELEVENLABS_AGENT_ID
✅ Firebase Service Account (JSON)
```

**Deployment Flow:**
```
Git Push → GitHub → Railway Auto-Deploy → npm install → node server.js → Live
```

---

## 📦 GitHub Repositories

### 1. Frontend Repository

| Property | Value |
|----------|-------|
| **Name** | interview-ai-ui |
| **URL** | https://github.com/Kishan748/-interview-ai-ui |
| **Visibility** | Public |
| **Main Branch** | main |
| **Default Deploy** | Vercel (auto) |
| **Commits** | 2 (initial, docs) |
| **Technologies** | React, Vite, Firebase, Firestore |

**Branches:**
- `main` → Production (Vercel deploys this)
- No feature branches yet

---

### 2. Backend Repository

| Property | Value |
|----------|-------|
| **Name** | Interview-backend- |
| **URL** | https://github.com/Kishan748/Interview-backend- |
| **Visibility** | Public |
| **Main Branch** | main |
| **Default Deploy** | Railway (auto) |
| **Commits** | 5 (multiple fixes & features) |
| **Technologies** | Node.js, Express, Firebase Admin, Claude API |

**Branches:**
- `main` → Production (Railway deploys this)
- No feature branches yet

---

## 💰 Cost Summary

### Monthly Cost Breakdown

| Service | Cost | Status | Notes |
|---------|------|--------|-------|
| **Anthropic** | $5-20 | 🟢 Low | Pay-as-you-go |
| **ElevenLabs** | $10-50 | 🟡 High | Per minute calls |
| **Twilio** | $0 | 🔴 Trial | Needs upgrade |
| **Firestore** | $0 | 🟢 Free | Under quota |
| **Vercel** | $0 | 🟢 Free | Hobby plan |
| **Railway** | $0 | 🟢 Free | Under $5 limit |
| **GitHub** | $0 | 🟢 Free | Public repos |
| **TOTAL** | **$15-70** | - | Variable |

### Cost Optimization Opportunities

| Item | Current | Potential Savings |
|------|---------|-------------------|
| ElevenLabs call duration | 15 min avg | Optimize prompts (-20%) |
| Claude scoring | ~1K tokens | Cache prompts (-30%) |
| Firestore reads | Unlimited | Add caching layer (-50%) |
| **Total Potential** | | **-30% to -50%** |

---

## ⚠️ Action Items

### 🔴 URGENT (Do This Week)

- [ ] **Twilio Upgrade**
  - Login: https://www.twilio.com/console
  - Upgrade from Trial to Paid plan
  - Add payment method
  - Remove 10-minute call limit
  - Test with a call

### 🟡 IMPORTANT (Do This Month)

- [ ] **Anthropic Spending Alerts**
  - Login: https://console.anthropic.com/account/billing
  - Set budget alert at $50
  - Monitor weekly usage

- [ ] **ElevenLabs Spending Alerts**
  - Login: https://elevenlabs.io/app/billing
  - Set budget alert at $100
  - Monitor daily usage (highest cost)

- [ ] **Document API Keys**
  - Store all keys in password manager
  - Share access with team lead
  - Create API key rotation plan

### 🟢 NICE-TO-HAVE (Future)

- [ ] Add monitoring/logging dashboard
- [ ] Set up cost tracking spreadsheet
- [ ] Create automated billing alerts
- [ ] Plan for Firestore upgrade if scaling

---

## 📊 Account Health

### Status Dashboard

```
Last Updated: Feb 4, 2025, 10:30 AM

┌─────────────────────────────────────────┐
│         SERVICE STATUS SUMMARY          │
├─────────────────────────────────────────┤
│                                         │
│ Anthropic API         ✅ Healthy        │
│ ElevenLabs API        ✅ Healthy        │
│ Firestore             ✅ Healthy        │
│ Twilio                ⚠️  Trial Mode    │
│                                         │
│ Frontend (Vercel)     ✅ Deployed       │
│ Backend (Railway)     ✅ Deployed       │
│                                         │
│ Overall Status        ✅ OPERATIONAL    │
│                                         │
└─────────────────────────────────────────┘
```

### Uptime & Reliability

| Service | Uptime | Last Issue |
|---------|--------|-----------|
| Anthropic | 99.9% | None |
| ElevenLabs | 99.8% | None |
| Firestore | 99.95% | None |
| Twilio | TBD | Trial limitations |
| Vercel | 99.95% | None |
| Railway | 99.9% | None |

---

## 📞 Support Contacts

| Service | Support | Hours |
|---------|---------|-------|
| **Anthropic** | support@anthropic.com | Business hours |
| **ElevenLabs** | support@elevenlabs.io | Business hours |
| **Firebase** | Firebase Console Chat | 24/7 |
| **Twilio** | Twilio Support Portal | 24/7 |
| **Vercel** | Vercel Support | 24/7 |
| **Railway** | Discord Community | 24/7 |

---

## 🔐 Security Checklist

- [ ] API keys not in git repo
- [ ] API keys in environment variables only
- [ ] API keys rotated quarterly
- [ ] IP restrictions where possible
- [ ] Firestore security rules configured
- [ ] Rate limiting on backend
- [ ] Error messages don't leak sensitive data
- [ ] Logs don't contain API keys

---

## 📝 Update Instructions

**When adding new services:**
1. Add section to this document
2. Include all details from table above
3. Add to cost summary
4. Add to action items if needed
5. Update account health status
6. Commit to git with message "Update ACCOUNTS.md - Add [Service] details"

**When updating balances/status:**
1. Update the relevant service section
2. Update cost summary if changed
3. Update action items if needed
4. Update status dashboard
5. Don't commit sensitive data (API keys, balances)
6. Share status updates separately with team

---

**Last Updated:** February 4, 2025, 10:30 AM
**Version:** 1.0 - Initial Setup
**Next Review:** February 11, 2025 (weekly)
