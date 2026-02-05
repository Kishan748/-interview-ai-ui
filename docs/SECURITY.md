# 🔐 Security Issues & Recommendations

> **Status:** Development Phase
> **Last Updated:** February 5, 2025
> **Owner:** InterviewAI Team

---

## Overview

This document outlines known security issues in the InterviewAI system and provides recommendations for hardening before production use.

---

## 🚨 Critical Security Issues

### 1. Firestore Security Rules Are Too Permissive

**Severity:** 🔴 **HIGH**
**Status:** Currently Enabled (Development)
**Impact:** Anyone with the Firestore project ID can read/write all data

**Current Configuration:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ❌ ALLOWS ANYONE
    }
  }
}
```

**Issues:**
- ✗ No authentication required
- ✗ All data is publicly readable
- ✗ Any user can modify or delete candidate data
- ✗ Violates GDPR and privacy regulations
- ✗ Exposes candidate information to unauthorized access

**Recommendation:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated users with proper roles
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null &&
                          request.auth.token.role == 'admin';
    }
    match /scored_interviews/{interviewId} {
      allow read, write: if request.auth != null &&
                          request.auth.token.role == 'admin';
    }
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Implementation Steps:**
1. Enable Firebase Authentication
2. Create admin role with custom claims
3. Update security rules to check authentication and roles
4. Test with authorized users only
5. Audit all database access logs

---

### 2. No Authentication on Backend API Endpoints

**Severity:** 🔴 **HIGH**
**Status:** Currently Enabled
**Impact:** Anyone can create interviews, trigger scoring, access session data

**Current Issue:**
```javascript
// ❌ No authentication check
app.post("/api/create-session", async (req, res) => {
  // Anyone can create sessions
  const session = await saveSession(...);
  res.json({ session_id: session.id });
});

// ❌ Anyone can score interviews
app.post("/api/score-interview", async (req, res) => {
  const scores = await scoreInterview(...);
  res.json(scores);
});
```

**Security Risks:**
- ✗ Anyone can create unlimited interviews (DOS attack)
- ✗ No rate limiting on API endpoints
- ✗ Backend calls to Claude API can be exploited (cost spike)
- ✗ No audit trail of who accessed what data
- ✗ Session data exposed to public

**Recommendation:**
1. **Add API Key Authentication:**
   ```javascript
   const validateApiKey = (req, res, next) => {
     const apiKey = req.headers['x-api-key'];
     if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   };

   app.post("/api/create-session", validateApiKey, async (req, res) => {
     // Protected endpoint
   });
   ```

2. **Add Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.post("/api/create-session", limiter, async (req, res) => {
     // Rate limited endpoint
   });
   ```

3. **Add Request Validation:**
   - Validate all input parameters
   - Sanitize candidate information
   - Reject oversized requests

---

### 3. No Caller Verification for Phone Interviews

**Severity:** 🔴 **HIGH**
**Status:** Exploitable
**Impact:** Anyone with candidate's phone number can access their interview

**Current Flow:**
```
Anyone calls +61 2 3820 5224
  ↓
Backend looks up by phone number
  ↓
Returns candidate context if status = "waiting"/"in_progress"
  ↓
Interview proceeds with NO verification
```

**Security Risks:**
- ✗ Phone number spoofing possible
- ✗ No verification that caller is the candidate
- ✗ Wrong person could answer interview
- ✗ Candidate impersonation risk
- ✗ Interview results attributed to wrong person

**Current Code Issue:**
```javascript
// backend/server.js - Line 81-106
async function getSessionByPhone(phone_number) {
  const session = await db.collection('sessions')
    .where('phone_number', '==', phone_number)
    .where('status', 'in', ['waiting', 'in_progress'])
    .limit(1)
    .get();

  return session.docs[0]?.data(); // ❌ No verification
}
```

**Recommendation:**
1. **Add PIN-Based Verification:**
   ```javascript
   // Generate 6-digit PIN when session created
   const pin = Math.floor(100000 + Math.random() * 900000);

   // Send PIN to candidate via email/SMS
   await sendEmail(candidate_email, `Your interview PIN: ${pin}`);

   // In ElevenLabs agent prompt, ask candidate for PIN
   // "Before we start, can you please say your PIN?"

   // Verify PIN before proceeding
   if (extractedPIN !== session.pin) {
     hangup(); // Disconnect if PIN doesn't match
   }
   ```

2. **Add Callback Verification:**
   ```javascript
   // Instead of inbound call, call candidate
   // Verify phone number matches
   // Then start interview
   ```

3. **Add Session ID Verification:**
   - Generate unique session ID
   - Display in UI for candidate
   - Have candidate provide session ID during call

---

### 4. API Keys Exposed in Environment Variables

**Severity:** 🟠 **MEDIUM**
**Status:** Current Issue
**Impact:** API keys could be leaked in logs or error messages

**Current Issue:**
```javascript
// ❌ API keys in .env file on Railway
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
```

**Risks:**
- ✗ Keys visible in server logs
- ✗ Keys in error messages
- ✗ Keys in git history (if accidentally committed)
- ✗ Leaked keys could give access to billing accounts
- ✗ Could enable unauthorized API usage

**Recommendation:**
1. **Use Secrets Manager:**
   ```javascript
   // Use Railway's built-in secrets management
   // Or use AWS Secrets Manager / GCP Secret Manager
   // Rotate keys regularly (monthly)
   ```

2. **Never Log Sensitive Data:**
   ```javascript
   // ❌ Don't do this
   console.log("API Key:", apiKey);

   // ✅ Do this instead
   console.log("API Key: " + apiKey.substring(0, 5) + "...");
   ```

3. **Audit Key Access:**
   - Log all API calls
   - Set usage alerts for unusual patterns
   - Monitor for unauthorized access

---

### 5. No CORS Protection

**Severity:** 🟠 **MEDIUM**
**Status:** Currently Disabled
**Impact:** API accessible from any domain

**Current Configuration:**
```javascript
// ❌ Allows requests from ANY origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
```

**Risks:**
- ✗ Any website can make requests to your API
- ✗ Cross-site request forgery (CSRF) attacks possible
- ✗ No origin verification
- ✗ Could be exploited by malicious sites

**Recommendation:**
```javascript
// ✅ Restrict to known domains only
const allowedOrigins = [
  'https://interview-ai-ui.vercel.app',
  'https://yourdomain.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
```

---

### 6. No Input Validation

**Severity:** 🟠 **MEDIUM**
**Status:** Current Issue
**Impact:** Injection attacks, data corruption

**Current Issue:**
```javascript
// ❌ No validation
app.post("/api/create-session", async (req, res) => {
  const { candidate_name, role, job_description, resume, phone_number } = req.body;

  // Directly saved without validation
  await saveSession(sessionId, {
    candidate_name,  // Could be SQL injection, XSS
    role,            // Could be malicious
    job_description, // Could be huge (DOS)
    resume,          // Could be malicious code
    phone_number     // Could be invalid
  });
});
```

**Recommendation:**
```javascript
const validateSession = (data) => {
  // Validate candidate name
  if (!data.candidate_name || typeof data.candidate_name !== 'string') {
    throw new Error('Invalid candidate name');
  }
  if (data.candidate_name.length > 100) {
    throw new Error('Candidate name too long');
  }

  // Validate phone number format
  if (!isValidPhoneNumber(data.phone_number)) {
    throw new Error('Invalid phone number');
  }

  // Validate JD length
  if (data.job_description.length > 5000) {
    throw new Error('Job description too long');
  }

  // Validate resume
  if (data.resume && data.resume.length > 50000) {
    throw new Error('Resume too large');
  }

  return true;
};

app.post("/api/create-session", async (req, res) => {
  validateSession(req.body);
  // Safe to proceed
});
```

---

### 7. No Data Encryption at Rest

**Severity:** 🟠 **MEDIUM**
**Status:** Current Issue
**Impact:** Sensitive candidate data stored in plaintext

**Current Issue:**
```javascript
// Candidate data stored in plaintext in Firestore
{
  candidate_name: "John Doe",
  phone_number: "+61 412 345 678",  // ❌ In plaintext
  resume: "...",                     // ❌ In plaintext
  scores: {...}                      // ❌ In plaintext
}
```

**Recommendation:**
1. **Enable Firestore Encryption:** (Already enabled by default)
2. **Encrypt Sensitive Fields:**
   ```javascript
   const encryptField = (value, key) => {
     const cipher = crypto.createCipher('aes-256-cbc', key);
     return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
   };

   const decryptField = (encrypted, key) => {
     const decipher = crypto.createDecipher('aes-256-cbc', key);
     return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
   };
   ```

3. **Hash Sensitive Data:**
   ```javascript
   const hashPhoneNumber = (phoneNumber) => {
     return crypto.createHash('sha256').update(phoneNumber).digest('hex');
   };
   ```

---

### 8. No Audit Logging

**Severity:** 🟡 **MEDIUM-LOW**
**Status:** Current Issue
**Impact:** No visibility into who accessed what data

**Current Issue:**
- ✗ No logs of interview creations
- ✗ No logs of who scored interviews
- ✗ No logs of data access
- ✗ Can't trace security incidents
- ✗ No compliance audit trail

**Recommendation:**
```javascript
const logAuditEvent = async (event, userId, action, resource, timestamp) => {
  await db.collection('audit_logs').add({
    event,
    user_id: userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });
};

// Usage
app.post("/api/create-session", async (req, res) => {
  const sessionId = generateId();
  await logAuditEvent('SESSION_CREATED', req.user?.id, 'CREATE', sessionId);
  // ...
});
```

---

### 9. ElevenLabs Webhook Not Verified

**Severity:** 🟡 **MEDIUM**
**Status:** Current Issue
**Impact:** Anyone can trigger post-call webhooks

**Current Issue:**
```javascript
// ❌ No verification of webhook source
app.post("/api/post-call", async (req, res) => {
  // Could be called by anyone with the URL
  const webhookData = req.body.data || req.body;
  // Process without verification
});
```

**Recommendation:**
```javascript
// Verify webhook signature from ElevenLabs
const verifyElevenLabsSignature = (req, signature) => {
  const payload = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', process.env.ELEVENLABS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return hash === signature;
};

app.post("/api/post-call", (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];

  if (!verifyElevenLabsSignature(req, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}, async (req, res) => {
  // Safe to process webhook
});
```

---

## 🔒 Security Best Practices (Not Yet Implemented)

### Production Checklist

- [ ] Enable Firebase Authentication
- [ ] Implement role-based access control (RBAC)
- [ ] Add API key authentication to backend
- [ ] Implement rate limiting on all endpoints
- [ ] Add phone number verification (PIN) for calls
- [ ] Restrict CORS to known domains only
- [ ] Add comprehensive input validation
- [ ] Encrypt sensitive candidate data
- [ ] Implement audit logging
- [ ] Verify webhook signatures from ElevenLabs
- [ ] Set up error monitoring (Sentry)
- [ ] Enable HTTPS everywhere
- [ ] Add security headers (CSP, X-Frame-Options, etc.)
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Data retention policies
- [ ] GDPR compliance review
- [ ] Regular backup and restore testing
- [ ] Incident response plan
- [ ] Security training for team

---

## 📋 Data Security Classification

**High Sensitivity (Encrypt & Protect):**
- Candidate phone numbers
- Candidate email addresses
- Interview transcripts
- Scoring details
- Personal information in resumes

**Medium Sensitivity (Access Control):**
- Candidate names
- Roles and experience levels
- Job descriptions
- Overall scores

**Low Sensitivity (Public OK):**
- Application version
- Feature availability
- System status

---

## 🚀 Migration to Production

### Phase 1: Authentication (Week 1)
- [ ] Set up Firebase Authentication
- [ ] Create admin users
- [ ] Implement backend API key validation
- [ ] Update Firestore rules

### Phase 2: Input Validation (Week 1)
- [ ] Add request validators to all endpoints
- [ ] Test edge cases and malicious inputs
- [ ] Document validation rules

### Phase 3: Encryption (Week 2)
- [ ] Encrypt sensitive fields
- [ ] Update all reads to decrypt
- [ ] Test encryption/decryption flow

### Phase 4: Audit Logging (Week 2)
- [ ] Implement audit logging
- [ ] Set up log retention
- [ ] Create monitoring dashboards

### Phase 5: Phone Verification (Week 3)
- [ ] Implement PIN generation
- [ ] Add PIN to ElevenLabs prompt
- [ ] Verify PIN before starting interview

### Phase 6: Hardening (Week 3)
- [ ] Add security headers
- [ ] Restrict CORS
- [ ] Enable rate limiting
- [ ] Verify webhooks

### Phase 7: Testing (Week 4)
- [ ] Security testing
- [ ] Penetration testing
- [ ] Compliance audit
- [ ] Load testing

---

## 📞 Incident Response

**If security breach suspected:**

1. **Immediate Actions:**
   - Rotate all API keys
   - Disable compromised accounts
   - Enable audit logging
   - Collect logs

2. **Investigation:**
   - Review access logs
   - Identify affected data
   - Determine scope of breach
   - Document timeline

3. **Notification:**
   - Notify affected users
   - File incident report
   - Contact legal if required
   - Report to compliance

4. **Prevention:**
   - Patch vulnerability
   - Update security rules
   - Add monitoring alerts
   - Conduct post-mortem

---

## 📞 Contact & Support

- **Security Issues:** Report to security@interviewai.local (when established)
- **Urgent Issues:** Contact team lead immediately
- **Questions:** See ARCHITECTURE.md and README.md

---

**Last Updated:** February 5, 2025
**Next Review:** May 5, 2025
**Owner:** InterviewAI Security Team
