# 🎯 Features & Configuration

> **Available interview roles, experience levels, and configurable options for InterviewAI**

---

## 📋 Table of Contents

1. [Available Roles](#available-roles)
2. [Experience Levels](#experience-levels)
3. [Interview Formats](#interview-formats)
4. [Configurable Options](#configurable-options)
5. [Roadmap](#roadmap)

---

## 💼 Available Roles

### IT & Technical Roles (25 Total)

The platform supports **25 IT-focused roles** tailored for Capgemini enterprise hiring:

#### Engineering Roles
1. **Frontend Engineer** - React, Vue, Angular, TypeScript, CSS expertise
2. **Backend Engineer** - APIs, databases, server-side logic
3. **Full Stack Engineer** - Both frontend & backend capabilities
4. **Mobile Developer** - iOS, Android, React Native, Flutter
5. **Software Engineer** - General software development

#### Specialized Engineering
6. **Senior Software Engineer** - Leadership, mentoring, architecture experience
7. **DevOps Engineer** - CI/CD, infrastructure, deployment pipelines
8. **Cloud Architect** - AWS, Azure, GCP, cloud infrastructure design
9. **Solutions Architect** - Enterprise solutions design, client-facing
10. **Security Engineer** - Security protocols, encryption, vulnerability management
11. **Network Engineer** - Network design, protocols, infrastructure
12. **Database Administrator** - Database management, optimization, backup
13. **Systems Administrator** - System maintenance, user management, infrastructure

#### Data & Analytics
14. **Data Engineer** - ETL, data pipelines, big data technologies
15. **ML Engineer** - Machine learning models, AI, deep learning
16. **Data Analyst** - Data analysis, reporting, insights generation

#### Quality & Testing
17. **QA Engineer** - Testing, quality assurance, test automation
18. **Automation Test Lead** - Leading test automation strategies, frameworks

#### Product & Leadership
19. **Product Manager** - Product strategy, roadmap, feature prioritization
20. **Project Manager** - Project coordination, timeline management, resources
21. **Delivery Lead** - Delivery management, stakeholder communication
22. **Practice Lead** - Practice leadership, team management, business growth
23. **Tech Lead** - Technical leadership, mentoring, architecture decisions

#### Design
24. **UI/UX Designer** - User interface, experience design, prototyping

#### Custom Role
25. **Other** - Custom role (user specifies their own title)

---

## 📊 Experience Levels

The platform supports **3 experience levels** for role-specific questioning:

| Level | Target | Duration | Focus |
|-------|--------|----------|-------|
| **Junior** | 0-2 years | Entry-level | Fundamentals, learning ability, potential |
| **Mid-Level** | 2-5 years | Growth-oriented | Problem-solving, leadership, complexity |
| **Senior** | 5+ years | Expert-level | Architecture, mentoring, strategic thinking |

---

## 📞 Interview Formats

### Chat Interview
- **Type:** Text-based AI conversation
- **Interviewer:** "Sarah" (AI persona powered by Claude)
- **Duration:** Configurable (5-60 minutes)
- **Best For:** Quick screening, text-based assessments

### Phone Interview
- **Type:** Voice call via ElevenLabs
- **Interviewer:** AI voice agent (professional)
- **Duration:** Configurable
- **Best For:** Natural conversation, communication assessment
- **Note:** Requires Twilio upgrade to remove 10-min trial limit

---

## ⚙️ Configurable Options

### Interview Setup Form

When creating an interview, you can configure:

| Field | Options | Required | Notes |
|-------|---------|----------|-------|
| **Role** | 25 IT roles + Other | ✅ Yes | Select from dropdown |
| **Experience Level** | Junior, Mid-Level, Senior | ✅ Yes | Affects question difficulty |
| **Candidate Name** | Free text | ✅ Yes | Used in greeting |
| **Interview Duration** | 5-60 minutes | ✅ Yes | Default: 25 mins |
| **Job Description** | Paste/upload | ❌ Optional | Tailors questions to JD |
| **Resume** | Upload PDF/DOCX | ❌ Optional | Personalize questions |
| **Interview Mode** | Chat or Phone | ✅ Yes | Default: Chat |

---

## 🔍 Search & Filter

### Candidates List

View and filter candidates by:

- **Search:** Candidate name (text search)
- **Filter by Role:** Select specific role
- **Filter by Score:** View candidates with scores >= threshold

---

## 📋 Current Features

### ✅ Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Chat Interviews | ✅ Live | Real-time conversation with AI |
| Phone Interviews | ✅ Live | Voice calls via ElevenLabs |
| Auto Scoring | ✅ Live | 5-category evaluation by Claude |
| Transcripts | ✅ Live | Full transcript storage & display |
| Candidates List | ✅ Live | Search, filter, view all candidates |
| PDF Export | ✅ Live | Download interview results as PDF |
| Firestore Sync | ✅ Live | Real-time cloud persistence |
| Role Selection | ✅ Live | 25 IT-focused roles (Feb 2025) |

### 📋 Planned Features

| Feature | Priority | ETA | Details |
|---------|----------|-----|---------|
| User Login | High | Q2 2025 | Secure auth, multi-user support |
| Notes & Tags | Medium | Q2 2025 | Recruiter comments & hiring decisions |
| Email Notifications | Medium | Q2 2025 | Interview completion alerts |
| Analytics Dashboard | Medium | Q3 2025 | Metrics, trends, reporting |
| Video Interviews | Low | Q3 2025 | Video-based interviews |
| Integration APIs | Low | Q3 2025 | Connect with ATS/HCM systems |

---

## 🎨 UI/UX Enhancements

Recent improvements (Feb 2025):
- ✅ Clean dark theme (modern, professional)
- ✅ Responsive design (mobile-friendly)
- ✅ Real-time scoring display
- ✅ One-click PDF export
- ✅ Intuitive role selection (25 roles)

---

## 📈 Roadmap

### Near-term (Q2 2025)
- [ ] Firebase Authentication (login security)
- [ ] Enhanced role-specific prompts
- [ ] Candidate evaluation framework
- [ ] Recruiter notes feature

### Mid-term (Q3 2025)
- [ ] Analytics dashboard
- [ ] Video interview support
- [ ] Advanced search filters
- [ ] Interview templates

### Long-term (Q4 2025+)
- [ ] ATS integrations
- [ ] Mobile app (iOS/Android)
- [ ] Multi-language support
- [ ] Behavioral assessment modules

---

## 🔧 Technical Configuration

### Role-Specific Prompting

Each role has optimized Claude prompts that focus on:

```
Role: Frontend Engineer
├── Technical Skills: React, Vue, Angular, TypeScript, CSS
├── Problem Solving: Component design, performance optimization
├── Experience: Projects, contributions, open-source
├── Communication: API integration, team collaboration
└── Advanced: Architecture decisions, mentoring
```

### Scoring Categories (All Roles)

1. **Technical Knowledge** - Domain expertise & fundamentals
2. **Problem Solving** - Analytical thinking & solutions
3. **Communication** - Clarity, articulation, listening
4. **Experience Match** - Relevant background & skills
5. **Cultural Fit** - Team collaboration, values alignment

---

## 💾 Data Structure

### Interview Session Schema

```javascript
{
  candidate_name: "John Doe",
  role: "Frontend Engineer",
  experience_level: "Mid-Level",
  interview_format: "chat", // or "phone"
  duration_minutes: 25,
  job_description: "...",
  resume_text: "...",
  messages: [...],
  transcript: [...],
  scored: false,
  scores: {
    technical_knowledge: 0,
    problem_solving: 0,
    communication: 0,
    experience_match: 0,
    cultural_fit: 0
  },
  feedback: "...",
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## 🎯 Best Practices

### For Recruiters

1. **Use Job Description** - Paste JD for better role-specific questions
2. **Include Resume** - Candidates' background personalizes conversation
3. **Choose Right Duration** - Junior: 20-25 mins, Senior: 30-40 mins
4. **Phone for Communication** - Phone interviews assess soft skills better
5. **Export Results** - Download PDF for interview documentation

### For IT Teams

1. **Update Roles** - Add new roles to `ROLES` array in `InterviewAI.jsx`
2. **Customize Prompts** - Modify `buildSystemPrompt()` for specific roles
3. **Role-Specific Rules** - Add role checks in scoring validation
4. **Monitor Costs** - Track Claude API usage per role

---

## 📊 Role Distribution (Feb 2025)

| Category | Count | Roles |
|----------|-------|-------|
| Engineering | 8 | Frontend, Backend, Full Stack, Mobile, Senior, DevOps, Cloud Arch, Solutions Arch |
| Infrastructure | 4 | Security Engineer, Network Engineer, Database Admin, Systems Admin |
| Data | 3 | Data Engineer, ML Engineer, Data Analyst |
| QA & Testing | 2 | QA Engineer, Automation Test Lead |
| Product & Leadership | 4 | Product Manager, Project Manager, Delivery Lead, Tech Lead |
| Design | 1 | UI/UX Designer |
| Custom | 1 | Other (user-defined) |

---

## 🚀 Getting Started

1. **Create Interview** → Select role from dropdown (25 options)
2. **Choose Experience Level** → Junior/Mid/Senior
3. **Enter Job Details** → Name, duration, optional JD & resume
4. **Start Interview** → Chat or Phone format
5. **Auto Score** → Claude generates evaluation
6. **Export Results** → Download PDF report

---

**Last Updated:** February 4, 2025
**Version:** 1.0.1 - Role Selection Enhanced
**Total Roles Available:** 25 IT roles + Custom option

