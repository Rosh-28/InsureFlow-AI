# InsureFlow-AI - Visual Quick Start Guide

## 🎯 TL;DR - Complete System in 2 Minutes

```
┌─────────────────────────────────────────────────────────────────┐
│  WHAT IS INSUREFLOW-AI?                                         │
│  AI-powered insurance claim automation system                   │
│  • Users apply for claims (with document upload)                │
│  • AI validates documents & assesses risk                       │
│  • Admins review & approve/reject with AI recommendations       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  HOW IT WORKS - 3 MAIN FLOWS                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FLOW 1: USER APPLIES FOR CLAIM                                 │
│  ────────────────────────────────                              │
│  User fills form → Uploads documents → Submits                  │
│  Backend: Validates files → Runs AI agents → Sets status        │
│  Result: Claim created with AI recommendations                  │
│                                                                  │
│  FLOW 2: ADMIN REVIEWS & APPROVES                               │
│  ──────────────────────────────────                             │
│  Admin sees all claims with AI scores → Reads verification      │
│  Admin sees risk assessment → Clicks Approve/Reject             │
│  Result: Claim status updated to approved/rejected              │
│                                                                  │
│  FLOW 3: USER GETS HELP FROM AI CHAT                            │
│  ─────────────────────────────────────                          │
│  User asks question → AI reads user's history → Responds        │
│  User can click "Read Aloud" → TTS converts text to speech      │
│  Result: User gets helpful, personalized answer                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4 KEY PARTS OF THE SYSTEM                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. FRONTEND (React)                  on localhost:3000         │
│     • Login page                                                │
│     • User: apply claim, track status, chat                     │
│     • Admin: manage claims, approve/reject, analytics           │
│                                                                  │
│  2. BACKEND (Express + AI)            on localhost:5000         │
│     • Routes: claims, policies, chat, auth                      │
│     • AI Agents: verify docs, detect risk, chat                 │
│     • Services: Gemini, data storage, file upload               │
│                                                                  │
│  3. TEXT-TO-SPEECH (Python Flask)     on localhost:5001         │
│     • Converts AI responses to audio                            │
│     • Uses Microsoft Edge TTS (free)                            │
│                                                                  │
│  4. DATABASES (JSON Files)            in server/data/           │
│     • claims.json - all claims & their data                     │
│     • policies.json - insurance policies                        │
│     • users.json - user accounts                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3 AI AGENTS EXPLAINED                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AGENT 1: DOCUMENT VERIFIER                                     │
│  "Are all required documents present?"                          │
│  • For health claims: Need hospital bill, discharge, Rx         │
│  • For vehicle claims: Need police report, estimate, photos     │
│  • Uses Gemini Vision to read document content                  │
│  • Returns: Valid or not valid + confidence                     │
│                                                                  │
│  AGENT 2: RISK DETECTOR                                         │
│  "Is this claim risky? Score 1-10"                              │
│  • Checks claim frequency (how many claims per year)            │
│  • Checks amount vs coverage (is it reasonable)                 │
│  • Uses rules + Gemini reasoning                                │
│  • Returns: Score + risk level (low/medium/high)                │
│                                                                  │
│  AGENT 3: DECISION MAKER                                        │
│  "Should this claim be auto-approved?"                          │
│  • If documents invalid → needs human review                    │
│  • If risk is high → needs human review                         │
│  • If documents valid + low risk → auto-approved                │
│  • Returns: Recommended status for the claim                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure at a Glance

```
InsureFlow-AI/
├── MASTER_GUIDE.md ..................... Read this first (complete guide)
├── ARCHITECTURE_DIAGRAMS.md ........... Visual flows and diagrams
├── CODE_REFERENCE.md .................. Code snippets and patterns
├── DOCUMENTATION_INDEX.md ............. How to use documentation
│
└── prototype/
    ├── README.md ...................... Setup instructions
    │
    ├── client/ ........................ FRONTEND (React)
    │   ├── src/App.jsx ................ Main router
    │   ├── pages/
    │   │   ├── user/           ..... User pages (apply, track)
    │   │   └── admin/          ..... Admin pages (review, approve)
    │   └── services/api.js ........... All API calls
    │
    ├── server/ ........................ BACKEND (Express + AI)
    │   ├── index.js .................. Main app entry point
    │   ├── routes/ ................... API endpoints
    │   │   ├── claims.js ............ Claim CRUD + processing
    │   │   ├── policies.js ......... Policy lookup + OCR
    │   │   ├── chat.js ............ Chat assistant
    │   │   └── auth.js ............ Login/register
    │   ├── agents/ .................. AI Logic (LangGraph)
    │   │   ├── graph.js ........... State machine orchestrator
    │   │   ├── documentVerifier.js  Document validation
    │   │   └── riskDetector.js ... Risk scoring
    │   ├── services/ ................ Core functionality
    │   │   ├── geminiService.js ... All Gemini API calls
    │   │   ├── errorHandler.js ... Error handling
    │   │   └── ttsService.js ..... TTS integration
    │   └── data/ .................... Database
    │       ├── dataStore.js ....... Read/write JSON
    │       ├── claims.json ........ Claims data
    │       ├── policies.json ...... Policies data
    │       └── users.json ......... Users data
    │
    └── tts-service/ .................. SPEECH SERVICE (Python)
        └── main.py .................. Flask app for TTS
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Environment
```bash
# In server folder, create .env file with:
PORT=5000
GEMINI_API_KEY=your_key_here
MODEL=gemini-2.5-flash
TTS_SERVICE_URL=http://localhost:5001
```

### Step 2: Start All Services
```bash
# Terminal 1: Backend
cd prototype/server
npm install
npm run dev  # Starts on :5000

# Terminal 2: Frontend
cd prototype/client
npm install
npm run dev  # Starts on :3000

# Terminal 3: TTS (optional)
cd prototype/tts-service
python main.py  # Starts on :5001
```

### Step 3: Use the System
- Visit `http://localhost:3000`
- Login with test credentials
- Fill out claim form
- Upload documents
- Watch AI process your claim

---

## 📊 Key Concepts Explained Simply

### What is LangGraph?
**A tool that orchestrates AI agents in sequence**
```
Agent 1          Agent 2          Agent 3
[Verify]   →     [Risk]    →    [Decide]
  ✓                ✓               ✓
```

### What is Gemini?
**Google's AI that we use for:**
- 🔍 Reading documents (Vision)
- 💬 Answering questions (Chat)
- 🎯 Assessing risk (Reasoning)

### What is Multer?
**Handles file uploads - puts files in server storage**
- For OCR: Stores in RAM (fast, temporary)
- For claims: Stores on disk (permanent, for admin review)

### What is Edge TTS?
**Microsoft's free text-to-speech - converts AI responses to audio**

### What is JSON?
**Database format - just text files that store data**
```json
{
  "id": "CLM-123",
  "status": "approved",
  "amount": 25000
}
```

---

## 💾 How Data Flows

```
USER CLICKS "APPLY CLAIM"
        ↓
Frontend creates FormData (form fields + files)
        ↓
POST to backend /api/claims
        ↓
Backend receives FormData
        ↓
Multer extracts files to disk
        ↓
Creates claim object
        ↓
Runs LangGraph with 3 agents
        ├─ Agent 1: Check documents ✓
        ├─ Agent 2: Calculate risk (score: 4.2/10)
        └─ Agent 3: Decide status (Auto-approve)
        ↓
Saves claim to claims.json
        ↓
Returns JSON response to frontend
        ↓
Frontend shows success page
```

---

## 🎓 To Understand Everything

### 10 Minute Version
Read: [MASTER_GUIDE.md](MASTER_GUIDE.md) sections 1-3

### 1 Hour Version
Read: 
- [MASTER_GUIDE.md](MASTER_GUIDE.md) sections 1-4
- [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) sections 1-2

### 3 Hour Version (Recommended)
Read all three documents:
1. [MASTER_GUIDE.md](MASTER_GUIDE.md) - Complete
2. [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) - Complete
3. [CODE_REFERENCE.md](CODE_REFERENCE.md) - Focus on snippets

### Complete Mastery (6-8 hours)
Read all documents + explore actual code files + create test claim

---

## 🔍 Find Answers Quickly

| Question | Answer |
|----------|--------|
| How do users apply for claims? | MASTER_GUIDE section 4.1 + ARCHITECTURE_DIAGRAMS section 2 |
| What does each AI agent do? | MASTER_GUIDE section 5 |
| What files get uploaded where? | CODE_REFERENCE snippet #10 |
| How is risk scored? | CODE_REFERENCE snippet #9 |
| How does OCR work? | MASTER_GUIDE section 4.2 + ARCHITECTURE_DIAGRAMS section 3 |
| What's in claims.json? | MASTER_GUIDE Data Model section |
| How do I add a new endpoint? | CODE_REFERENCE snippet #1 |
| How do I call Gemini? | CODE_REFERENCE snippet #2 |
| How is everything connected? | ARCHITECTURE_DIAGRAMS section 6 |
| How does chat work? | ARCHITECTURE_DIAGRAMS section 4 |

---

## 🧪 Test the System

### Create a Test Claim
1. Go to http://localhost:3000/login
2. Login as user
3. Go to /apply
4. Fill claim details
5. Upload any document
6. Click "Apply Claim"
7. Watch console for AI agent outputs

### Check What Happened
1. Stop backend server (Ctrl+C)
2. Open `server/data/claims.json`
3. Look at last claim object
4. See verification + riskAssessment fields
5. View statusHistory to see state changes

### Test Chat
1. Go to /help
2. Type a question
3. See AI response
4. Click "Read Aloud"
5. Hear response in audio

### Admin Review
1. Login as admin
2. Go to /admin/claims
3. Click on a claim
4. See AI scores and recommendations
5. Click Approve/Reject
6. Watch status update

---

## 🛠️ Common Tasks

### Check Gemini API Key
```bash
# Check if key is set
echo $GEMINI_API_KEY

# Test Gemini directly
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_KEY" \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello"}]
    }]
  }'
```

### View All Claims in Database
```bash
# Pretty print claims
cat prototype/server/data/claims.json | jq .

# Count claims
cat prototype/server/data/claims.json | jq 'length'

# Find claim by status
cat prototype/server/data/claims.json | jq '.[] | select(.status=="approved")'
```

### Check Logs in Real Time
```bash
# Tail server logs
tail -f server_output.log

# Search for errors
grep -i "error\|failed\|❌" server_output.log

# Search for Gemini calls
grep -i "gemini\|🤖" server_output.log
```

### Test API Manually
```bash
# Get all claims
curl http://localhost:5000/api/claims

# Get single claim
curl http://localhost:5000/api/claims/CLM-123

# Create chat message
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"How do I file a claim?","userId":"user-1"}'

# Health check
curl http://localhost:5000/api/health
```

---

## 💡 Key Insights

### The Magic Happens in 3 Places
1. **Document Verifier** - Reads docs with Gemini Vision
2. **Risk Detector** - Scores with rules + AI reasoning  
3. **Decision Maker** - Decides approve/review based on above

### Data Never Leaves (Except to Gemini)
- Users' files stored on server disk
- JSON data stored in files
- Only documents sent to Gemini (for analysis)
- Everything else stays in your system

### The System is Deterministic
- Same claim always gets same verification result
- Same claim history always gets same risk score
- Admins make final approval decision (not AI)

### Scalability Bottleneck
- JSON files don't scale past 10,000 claims
- Would need real database (MongoDB/PostgreSQL)
- Gemini API has rate limits
- TTS service is single-threaded

---

## 🎯 Success Criteria

✅ **You've understood the system when you can:**

- [ ] Explain to someone what the system does in 1 sentence
- [ ] Draw diagram of how claims flow through system
- [ ] Name the 3 AI agents and what they do
- [ ] Explain why there's a separate TTS service
- [ ] Read a claim object and understand each field
- [ ] Point to where each main feature is in code
- [ ] Trace a request from frontend to database
- [ ] Explain what Multer does
- [ ] Describe the risk scoring algorithm
- [ ] Know what happens when claim is submitted

---

## 🚀 Level Up

### Master Level (Next Steps)
1. ✅ Understand current system (you're here)
2. 🔄 Modify existing feature (change risk algorithm)
3. ✨ Add new feature (email notifications)
4. 🚀 Deploy to production (Docker/Cloud)
5. 📈 Optimize performance (real database)

### Code Changes to Try
- [ ] Add a new required document type
- [ ] Modify risk scoring weights
- [ ] Add email notifications on approval
- [ ] Add search/filter to claims list
- [ ] Add data export to CSV
- [ ] Add more chat personalities
- [ ] Add document preview
- [ ] Add claim analytics chart

---

## 📚 All Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Map of all docs | 5 min |
| [MASTER_GUIDE.md](MASTER_GUIDE.md) | Complete understanding | 2-3 hrs |
| [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) | Visual flows | 2-3 hrs |
| [CODE_REFERENCE.md](CODE_REFERENCE.md) | Code snippets | 1-2 hrs |
| [QUICK_START.md](QUICK_START.md) | This file | 10 min |

---

## 🎓 Final Checklist

Before saying "I've mastered this":

- [ ] Read MASTER_GUIDE.md (all sections)
- [ ] Study ARCHITECTURE_DIAGRAMS.md (understand all flows)
- [ ] Review CODE_REFERENCE.md (understand patterns)
- [ ] Run system locally and see it work
- [ ] Create a test claim and view JSON
- [ ] Try admin approval flow
- [ ] Test chat assistant
- [ ] Look at logs to understand execution
- [ ] Modify one small thing (e.g., add a field)
- [ ] Explain the system to someone else

**When you can check all boxes = You're an InsureFlow-AI expert! 🎉**

---

**Created**: January 8, 2026  
**For**: Quick understanding of InsureFlow-AI  
**Next Step**: Read [MASTER_GUIDE.md](MASTER_GUIDE.md)
