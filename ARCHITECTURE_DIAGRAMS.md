# InsureFlow-AI - Visual Architecture & Flow Diagrams

## 1. Complete System Architecture

```
╔═════════════════════════════════════════════════════════════════════════════╗
║                         INSUREFLOW-AI SYSTEM                               ║
║                      (Insurance Claim Automation)                           ║
╚═════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Frontend)                             │
│                     React 18 + Vite + Tailwind CSS                         │
│                        Running on localhost:3000                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│    ┌──────────────────────┐          ┌──────────────────────┐              │
│    │  USER FLOWS          │          │  ADMIN FLOWS         │              │
│    │  ─────────────────   │          │  ─────────────────   │              │
│    │ • Login              │          │ • Login              │              │
│    │ • Dashboard          │          │ • Dashboard          │              │
│    │ • Apply Claim        │          │ • View All Claims    │              │
│    │ • Upload Documents   │          │ • Review Claim       │              │
│    │ • Track Status       │          │ • Approve/Reject     │              │
│    │ • Chat Assistant     │          │ • View Analytics     │              │
│    │ • Hear AI Response   │          │ • Generate Reports   │              │
│    └──────────────────────┘          └──────────────────────┘              │
│                                                                               │
└──────────────┬──────────────────────────────────────────────────────┬───────┘
               │                                                      │
               │  REST API (JSON)                                    │
               │  POST, GET, PATCH requests                         │
               │                                                      │
┌──────────────▼──────────────────────────────────────────────────────▼───────┐
│                      API SERVER LAYER (Backend)                             │
│                        Node.js + Express.js                                 │
│                        Running on localhost:5000                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────┬────────────────────┬──────────────┬────────────────┐     │
│  │   AUTH        │   CLAIMS           │   POLICIES   │   CHAT/TTS     │     │
│  │  ROUTES       │   ROUTES           │   ROUTES     │   ROUTES       │     │
│  │               │                    │              │                │     │
│  │ • Login       │ • Get claims       │ • Get policy │ • Send message │     │
│  │ • Register    │ • Create claim     │ • Validate   │ • Get history  │     │
│  │ • Get user    │ • Get claim by ID  │ • Validate   │ • Text to      │     │
│  │               │ • Update status    │   number     │   speech       │     │
│  │               │ • Get stats        │ • OCR extract│ • Quick help   │     │
│  │               │                    │              │                │     │
│  └───────────────┴────────────────────┴──────────────┴────────────────┘     │
│         │                 │                    │              │              │
│         ▼                 ▼                    ▼              ▼              │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │              SERVICES LAYER (Core Logic)                       │         │
│  │ ──────────────────────────────────────────────────────────────│         │
│  │                                                                │         │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐       │         │
│  │  │  Gemini Service      │  │  Error Handler Service   │       │         │
│  │  │  ────────────────    │  │  ──────────────────────  │       │         │
│  │  │ • Text generation    │  │ • Error wrapping         │       │         │
│  │  │ • Vision/OCR         │  │ • Retry logic            │       │         │
│  │  │ • Chat completion    │  │ • Async handler wrapper  │       │         │
│  │  │ • Risk assessment    │  │ • Logging                │       │         │
│  │  │                      │  │                          │       │         │
│  │  └──────────────────────┘  └──────────────────────────┘       │         │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐       │         │
│  │  │  TTS Service         │  │  Data Store Service      │       │         │
│  │  │  ────────────────    │  │  ──────────────────────  │       │         │
│  │  │ • Calls Python svc   │  │ • Read JSON files        │       │         │
│  │  │ • Returns audio      │  │ • Write JSON files       │       │         │
│  │  │ • Multiple voices    │  │ • Claims, Policies, Users│       │         │
│  │  │                      │  │                          │       │         │
│  │  └──────────────────────┘  └──────────────────────────┘       │         │
│  │                                                                │         │
│  └────────────────────────────────────────────────────────────────┘         │
│         │                                        │                          │
│         ▼                                        ▼                          │
│  ┌────────────────────────┐         ┌─────────────────────────────┐        │
│  │  AI AGENTS (LangGraph) │         │  FILE MANAGEMENT            │        │
│  │  ──────────────────────│         │  ─────────────────────────  │        │
│  │                        │         │                             │        │
│  │ Document Verifier      │         │ Multer Upload Handler       │        │
│  │ ├─ Check file types    │         │ ├─ Memory storage (OCR)     │        │
│  │ ├─ Validate docs       │         │ ├─ Disk storage (claims)    │        │
│  │ └─ Use Gemini Vision   │         │ ├─ File validation          │        │
│  │                        │         │ └─ MIME type check          │        │
│  │ Risk Detector          │         │                             │        │
│  │ ├─ Calculate factors   │         │ Uploads Directory           │        │
│  │ ├─ Rule-based score    │         │ └─ Persistent file storage  │        │
│  │ └─ AI enhancement      │         │                             │        │
│  │                        │         │                             │        │
│  │ Conversational Agent    │         │                             │        │
│  │ ├─ Gemini chat         │         │                             │        │
│  │ ├─ Context enrichment   │         │                             │        │
│  │ └─ User history aware  │         │                             │        │
│  │                        │         │                             │        │
│  └────────────────────────┘         └─────────────────────────────┘        │
│         │                                                                    │
│         ▼                                                                    │
│  ┌────────────────────────────────────────────────┐                        │
│  │  STATE MACHINE ORCHESTRATOR (LangGraph Graph) │                        │
│  │  ────────────────────────────────────────────  │                        │
│  │                                                │                        │
│  │  Input: { claim, documents }                 │                        │
│  │         │                                     │                        │
│  │         ▼                                     │                        │
│  │  ┌────────────────────┐                      │                        │
│  │  │ Document Verifier  │                      │                        │
│  │  │ Node 1             │                      │                        │
│  │  └────────┬───────────┘                      │                        │
│  │           │                                  │                        │
│  │           ▼                                  │                        │
│  │  ┌────────────────────┐                      │                        │
│  │  │ Risk Detection     │                      │                        │
│  │  │ Node 2             │                      │                        │
│  │  └────────┬───────────┘                      │                        │
│  │           │                                  │                        │
│  │           ▼                                  │                        │
│  │  ┌────────────────────┐                      │                        │
│  │  │ Decision Aggreg.   │                      │                        │
│  │  │ Node 3             │                      │                        │
│  │  └────────┬───────────┘                      │                        │
│  │           │                                  │                        │
│  │  Output: { verification,                    │                        │
│  │            riskAssessment,                  │                        │
│  │            recommendedStatus }              │                        │
│  │                                                │                        │
│  └────────────────────────────────────────────────┘                        │
│                                                                               │
└──────────────┬──────────────────────────────────────────────────────────────┘
               │
               │  HTTP/REST                        │ JSON File I/O
               │                                   │
        ┌──────▼──────────────────────┐   ┌────────▼──────────────┐
        │                              │   │                       │
        ▼                              ▼   ▼                       │
┌──────────────────────┐      ┌──────────────────────┐  ┌─────────▼──────┐
│  EXTERNAL SERVICES   │      │  DATA LAYER          │  │   FILES        │
├──────────────────────┤      │  (Local Storage)     │  ├────────────────┤
│                      │      │                      │  │                │
│ Google Gemini API    │      │ claims.json          │  │ /data/         │
│ ├─ Text generation   │      │ ├─ All claims        │  │ ├─ claims.json │
│ ├─ Vision/OCR        │      │ └─ Status history    │  │ ├─ policies... │
│ └─ LLM reasoning     │      │                      │  │ └─ users.json  │
│                      │      │ policies.json        │  │                │
│ Microsoft Edge TTS   │      │ └─ Policy database   │  │ /uploads/      │
│ ├─ Speech synthesis  │      │                      │  │ └─ temp files  │
│ ├─ Multiple voices   │      │ users.json           │  │                │
│ └─ MP3/WAV output    │      │ └─ User accounts     │  │                │
│                      │      │                      │  │                │
└──────────────────────┘      └──────────────────────┘  └────────────────┘
```

---

## 2. Claim Processing Flow Diagram

```
USER INITIATES CLAIM
        │
        ▼
┌────────────────────────────┐
│ USER OPENS /apply          │
│ • Form for claim details   │
│ • Upload documents (1-5)   │
│ • Optional: Upload policy  │
└────────────────┬───────────┘
                 │
        [User fills form]
        [User uploads files]
                 │
                 ▼
      ┌──────────────────────────┐
      │ CLICK "APPLY CLAIM"      │
      │ Frontend calls:           │
      │ POST /api/claims         │
      │ (multipart/form-data)    │
      └────────────┬─────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ BACKEND: MULTER PROCESSES UPLOAD     │
    │ • Disk storage: /uploads/            │
    │ • Unique filename (timestamp+uuid)   │
    │ • Returns array of file objects      │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │ CREATE CLAIM OBJECT                  │
    │ • id: CLM-{timestamp}                │
    │ • status: "processing"               │
    │ • Add document references            │
    │ • statusHistory: [submitted entry]   │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │ CALL: runClaimProcessingGraph()      │
    │ (LangGraph state machine execution)  │
    └────────────┬─────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────────────┐  ┌────────────────────────┐
│  NODE 1: DOCUMENT   │  │ NODE 2: RISK           │
│  VERIFICATION       │  │ DETECTION              │
│                     │  │                        │
│ For each document:  │  │ Get user's history:    │
│ ├─ Check MIME type  │  │ ├─ Previous claims     │
│ ├─ Validate file    │  │ ├─ Claim frequency     │
│ ├─ Try Gemini Vision│  │ └─ Total paid amount   │
│ ├─ Identify type    │  │                        │
│ └─ Check required   │  │ Calculate factors:     │
│   docs present      │  │ ├─ Frequency (weight:  │
│                     │  │ │  0.25)               │
│ Output:             │  │ ├─ Amount ratio (0.3)  │
│ {                   │  │ ├─ Time since last     │
│   isValid: bool,    │  │ │  (0.15)              │
│   confidence: 0-100,│  │ ├─ Policy age (0.1)    │
│   identified: [...],│  │ ├─ Doc quality (0.2)   │
│   missing: [...],   │  │ └─ Calculate score     │
│   issues: [...]     │  │                        │
│ }                   │  │ Call Gemini:           │
│                     │  │ "Assess fraud risk"    │
│                     │  │                        │
│                     │  │ Output:                │
│                     │  │ {                      │
│                     │  │   score: 0-10,         │
│                     │  │   level: low/med/high, │
│                     │  │   factors: [...]       │
│                     │  │ }                      │
└──────────┬──────────┘  └────────────┬───────────┘
           │                         │
           └────────────┬────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ NODE 3: DECISION      │
            │ AGGREGATION           │
            │                       │
            │ if (!verification     │
            │     .isValid)         │
            │   → UNDER_REVIEW      │
            │                       │
            │ else if (risk.level   │
            │     == 'high')        │
            │   → UNDER_REVIEW      │
            │                       │
            │ else if (risk.level   │
            │     == 'low' &&       │
            │     verified)         │
            │   → AUTO_APPROVED ✓   │
            │                       │
            │ else                  │
            │   → UNDER_REVIEW      │
            │                       │
            │ Output:               │
            │ {                     │
            │   recommendedStatus,  │
            │   verification,       │
            │   riskAssessment      │
            │ }                     │
            └────────────┬──────────┘
                         │
                         ▼
        ┌────────────────────────────┐
        │ SAVE CLAIM TO claims.json  │
        │ • Add verification data    │
        │ • Add riskAssessment       │
        │ • Set status               │
        │ • Add to statusHistory     │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ RETURN TO FRONTEND         │
        │ {                          │
        │   success: true,           │
        │   data: {                  │
        │     id: "CLM-123",         │
        │     status: "under_review",│
        │     verification: {...},   │
        │     riskAssessment: {...}  │
        │   }                        │
        │ }                          │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ USER SEES SUCCESS PAGE     │
        │ • Claim ID displayed       │
        │ • Status shown             │
        │ • Next steps listed        │
        │ • Recommended result shown │
        └────────────────────────────┘

[Wait for Admin Review or Auto-Approval]

                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ▼                                 ▼
[AUTO-APPROVED]              [ADMIN REVIEW]
│                            │
├─ Status → "approved"       ├─ Claim shows on
├─ Add to statusHistory      │  /admin/claims
├─ Save to claims.json       ├─ Admin reads
├─ Auto-send to user         │  verification
│                            ├─ Admin sees risk
│                            │  score + reasons
│                            ├─ Admin decides
│                            │
│                            ├─ Click Approve/Reject
│                            ├─ Call PATCH 
│                            │  /api/claims/:id/status
│                            │
└────┬──────────────────────┬┘
     │                      │
     ▼                      ▼
┌──────────────┐      ┌──────────────┐
│ APPROVED     │      │ REJECTED     │
│              │      │              │
│ Status set   │      │ Status set   │
│ Save to DB   │      │ Save to DB   │
│ Notify user  │      │ Notify user  │
└──────────────┘      └──────────────┘
     │                      │
     └──────────┬───────────┘
                │
                ▼
    [USER SEES STATUS UPDATE]
    • View on /claims page
    • Details on /claims/:id
    • Timestamp recorded
    • Notification received
```

---

## 3. OCR Document Extraction Flow

```
USER UPLOADS POLICY DOCUMENT
        │
        ▼
┌────────────────────────────────┐
│ ApplyClaim.jsx Component       │
│ • File input element           │
│ • Optional: Auto-upload        │
└────────────────┬───────────────┘
                 │
        [User selects PDF/Image]
                 │
                 ▼
┌────────────────────────────────┐
│ Frontend: policiesApi.ocr()    │
│ • Create FormData              │
│ • Append file                  │
│ • POST /api/policies/ocr       │
└────────────────┬───────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Backend: Multer (Memory Storage)        │
│ • File stored in RAM                    │
│ • req.file.buffer = file bytes          │
│ • req.file.mimetype = "application/pdf" │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│ Validate File                        │
│ • Check MIME type                    │
│ • Allowed: pdf, jpeg, png, gif, webp│
│ • Check file size < 10MB             │
└────────────────┬─────────────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ Convert to Base64      │
        │ buffer.toString('base64')
        │ Length: ~1.3x file size│
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ Call extractTextFromImage()    │
        │ (from geminiService.js)        │
        │                                │
        │ Payload:                       │
        │ {                              │
        │   base64Data: "JVBERi0x...",   │
        │   mimeType: "application/pdf", │
        │   model: "gemini-2.5-flash"    │
        │ }                              │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────────┐
        │ Gemini Vision API Call (Retry Loop)│
        │                                      │
        │ [Attempt 1]                         │
        │ model.generateContent({              │
        │   contents: [{                       │
        │     parts: [                         │
        │       {text: "Extract policy..."},  │
        │       {inlineData: {                 │
        │         mimeType: "application/pdf",│
        │         data: base64String           │
        │       }}                             │
        │     ]                                │
        │   }]                                 │
        │ })                                   │
        │                                      │
        │ [If fails, retry 2 more times]      │
        │ [Exponential backoff: 1s, 2s, 4s]   │
        │                                      │
        └────────────┬──────────────────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ▼ [Success]                       ▼ [Failure]
┌──────────────────────┐     ┌──────────────────┐
│ Parse JSON Response  │     │ Return Error     │
│                      │     │ "API Key Invalid"│
│ Extract fields:      │     │ or               │
│ • policyNumber       │     │ "Extraction fail"│
│ • holderName         │     │                  │
│ • coverageAmount     │     │ Frontend shows   │
│ • type (health/veh)  │     │ error message    │
│ • startDate          │     │ User can retry   │
│ • endDate            │     │ or type manually │
│                      │     │                  │
│ Return:              │     └──────────────────┘
│ {                    │
│   success: true,     │
│   data: {            │
│     policyNumber: ...,
│     holderName: ...,
│     coverageAmount: ..,
│     type: ...        │
│   }                  │
│ }                    │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────────┐
│ Frontend: Show Extracted Data  │
│ • Auto-fill policy number      │
│ • Auto-fill holder name        │
│ • Show coverage amount         │
│ • User can edit before submit  │
│ • Shows confidence indicator   │
└────────────┬───────────────────┘
             │
             ▼
      [User confirms/edits]
             │
             ▼
    [Continue claim application]
```

---

## 4. Chat Assistant Flow

```
USER TYPES QUESTION
        │
        ▼
┌──────────────────────┐
│ Chat Component       │
│ (Help.jsx)           │
│ • Input field        │
│ • Send button        │
└──────────┬───────────┘
           │
   [User types message]
           │
           ▼
┌───────────────────────────┐
│ chatApi.send()            │
│ POST /api/chat            │
│ {                         │
│   sessionId: "chat-...",  │
│   message: "How do I...", │
│   userId: "user-1",       │
│   context: {}             │
│ }                         │
└───────────────┬───────────┘
                │
                ▼
    ┌───────────────────────────────┐
    │ Backend: Chat Route Handler   │
    │                               │
    │ 1. Get or create session      │
    │    (stored in Map in memory)  │
    │                               │
    │ 2. Add user message to chat   │
    │    session.messages.push({    │
    │      role: 'user',            │
    │      content: message,        │
    │      timestamp: now           │
    │    })                         │
    │                               │
    │ 3. Build context:             │
    │    • Read user's claims       │
    │    • Count total claims       │
    │    • Recent 5 claims          │
    │    • Policy info (if exists)  │
    │                               │
    │ 4. Call chatCompletion()      │
    │                               │
    └───────────────┬───────────────┘
                    │
                    ▼
    ┌──────────────────────────────────┐
    │ geminiService.chatCompletion()   │
    │                                  │
    │ System Prompt:                   │
    │ "You are an insurance claim      │
    │  assistant. Help users with:     │
    │  - Claim process                 │
    │  - Document requirements         │
    │  - Coverage details              │
    │  - Status tracking               │
    │  Be friendly and accurate."      │
    │                                  │
    │ Messages Array:                  │
    │ [                                │
    │   {role: 'user', content: msg1}, │
    │   {role: 'assistant', content...},
    │   ...conversation history...     │
    │   {role: 'user', content: newMsg}│
    │ ]                                │
    │                                  │
    │ Context Injection:               │
    │ "This user has 3 claims.         │
    │  Recent claims: [...]            │
    │  Policy type: health"            │
    │                                  │
    │ Call Gemini:                     │
    │ model.generateContent({          │
    │   contents: [{                   │
    │     parts: [{text: fullPrompt}]  │
    │   }]                             │
    │ })                               │
    │                                  │
    └───────────────┬──────────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ Gemini Returns Response      │
    │                              │
    │ Example:                     │
    │ "To file a health claim,     │
    │  you'll need:                │
    │  1. Hospital bill            │
    │  2. Discharge summary        │
    │  3. Prescription             │
    │                              │
    │  You can upload these on     │
    │  the Apply Claim page..."    │
    │                              │
    └───────────────┬──────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ Add Assistant Message        │
    │ to Session                   │
    │                              │
    │ session.messages.push({      │
    │   role: 'assistant',         │
    │   content: response,         │
    │   timestamp: now             │
    │ })                           │
    │                              │
    └───────────────┬──────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ Return Response to Frontend  │
    │ {                            │
    │   success: true,             │
    │   data: {                    │
    │     sessionId: "chat-...",   │
    │     message: "To file a...", │
    │     timestamp: now           │
    │   }                          │
    │ }                            │
    │                              │
    └───────────────┬──────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ Frontend: Display Response   │
    │ • Show in chat bubble        │
    │ • Add timestamp              │
    │ • Scroll to bottom           │
    │ • Enable "Read Aloud" button │
    │ • Ready for next message     │
    │                              │
    └──────────────────────────────┘

[Optional: User clicks "Read Aloud"]
                    │
                    ▼
    ┌──────────────────────────────┐
    │ ttsApi.generate()            │
    │ POST /api/tts                │
    │ {                            │
    │   text: response,            │
    │   voice: "en-US-female"      │
    │ }                            │
    │                              │
    └───────────────┬──────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ Backend TTS Route            │
    │ • Calls Python service       │
    │ • POST http://localhost:5001 │
    │ • Returns audio file (MP3)   │
    │                              │
    └───────────────┬──────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ Python TTS Service           │
    │ (Flask app)                  │
    │                              │
    │ edge_tts.Communicate()       │
    │ • Streams audio chunks       │
    │ • Converts to MP3            │
    │ • Returns as bytes           │
    │                              │
    └───────────────┬──────────────┘
                    │
                    ▼
    ┌──────────────────────────────┐
    │ Browser Audio Player         │
    │ • Plays audio stream         │
    │ • User hears response        │
    │ • Can download if needed     │
    │                              │
    └──────────────────────────────┘
```

---

## 5. Admin Review & Approval Flow

```
ADMIN LOGS IN
    │
    ▼
┌─────────────────────┐
│ Admin Dashboard     │
│ GET /admin          │
│                     │
│ Shows:              │
│ • Total claims      │
│ • Pending claims    │
│ • Quick stats       │
│                     │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────┐
│ Click "Manage Claims"    │
│ Navigate to /admin/claims│
│ GET /api/claims          │
│ (no filters = all)       │
└────────────┬─────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ Admin Claims List Page             │
│                                    │
│ For each claim show:               │
│ • Claim ID                         │
│ • Status badge                     │
│ • Claim amount                     │
│ • Type (health/vehicle)            │
│ • Applicant name                   │
│ • Created date                     │
│ • Risk score badge (color coded)   │
│ • Verification badge (pass/fail)   │
│ • "Review" button                  │
│                                    │
│ Can filter by:                     │
│ • Status (all, pending, approved...) 
│ • Type (all, health, vehicle)      │
│ • Sort by date/amount              │
│                                    │
└────────────┬───────────────────────┘
             │
     [Admin clicks "Review"]
             │
             ▼
┌──────────────────────────────────┐
│ GET /api/claims/:id              │
│ Fetch full claim details         │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Admin Claim Review Page              │
│ (/admin/claims/:id)                  │
│                                      │
│ LEFT PANEL: Claim Details           │
│ ├─ Basic info (amount, type, etc)   │
│ ├─ Description                       │
│ ├─ Policy info                       │
│ └─ Timeline (status history)         │
│                                      │
│ CENTER PANEL: AI Insights           │
│ ├─ Verification Results             │
│ │  ├─ Documents found: 3/3           │
│ │  ├─ Confidence: 95%                │
│ │  ├─ Types: hospital_bill, ...      │
│ │  └─ Issues: None                   │
│ │                                    │
│ ├─ Risk Assessment                  │
│ │  ├─ Risk Score: 4.2/10             │
│ │  ├─ Risk Level: LOW                │
│ │  ├─ Factors:                       │
│ │  │  ├─ Frequency: 1 claim/year     │
│ │  │  └─ Amount: 25K/500K (5%)      │
│ │  └─ Recommendation: APPROVE        │
│ │                                    │
│ └─ Reasoning:                       │
│    "Low frequency, complete docs,    │
│     policy active, no red flags"     │
│                                      │
│ RIGHT PANEL: Documents              │
│ ├─ List of uploaded files           │
│ ├─ Preview available                │
│ ├─ Download links                   │
│ └─ File metadata                    │
│                                      │
│ BOTTOM: Action Buttons              │
│ ├─ [✓ APPROVE]  [✗ REJECT]         │
│ └─ Note field: "Enter review note"  │
│                                      │
└────────────┬──────────────────────────┘
             │
    [Admin reviews info]
    [Admin writes note]
             │
             ▼
    [Admin clicks APPROVE or REJECT]
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
[APPROVE]          [REJECT]
    │                 │
    ▼                 ▼
┌─────────────────┐ ┌──────────────────┐
│ PATCH Request   │ │ PATCH Request    │
│ /api/claims/:id │ │ /api/claims/:id  │
│ /status         │ │ /status          │
│                 │ │                  │
│ Body:           │ │ Body:            │
│ {               │ │ {                │
│  status:        │ │  status:         │
│  "approved",    │ │  "rejected",     │
│  note: "...",   │ │  note: "...",    │
│  reviewedBy:    │ │  reviewedBy:     │
│  "admin-1"      │ │  "admin-1"       │
│ }               │ │ }                │
└────────┬────────┘ └────────┬─────────┘
         │                   │
         ▼                   ▼
┌──────────────────────────────┐
│ Backend Updates Claim        │
│                              │
│ • Set claim.status           │
│ • Add statusHistory entry:   │
│   {                          │
│     status: "approved",      │
│     timestamp: now,          │
│     note: "Approved by...",  │
│     reviewedBy: "admin-1"    │
│   }                          │
│ • Save to claims.json        │
│                              │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────┐
│ Return Success Response  │
│ {                        │
│   success: true,         │
│   data: {                │
│     id: "CLM-123",       │
│     status: "approved"   │
│   }                      │
│ }                        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Admin Page Updates       │
│ • Show success message   │
│ • Redirect to list       │
│ • Claim now shows new    │
│   status                 │
│                          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ User Gets Notification  │
│ (In next version)        │
│ • Email sent             │
│ • Claim status changed   │
│ • Approval details shown │
│                          │
└──────────────────────────┘
```

---

## 6. Data Flow Between Components

```
┌──────────────────────────────────────────────────────┐
│           DATA FLOW ARCHITECTURE                     │
└──────────────────────────────────────────────────────┘

                    FRONTEND
                (React Components)
                       │
                       │ (State Management)
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    [Auth State] [Claims State] [UI State]
        │              │              │
        │              │              │
        │ fetch()      │ fetch()      │
        │              │              │
        └──────────────┼──────────────┘
                       │
                REST API Calls (JSON)
                (Fetch with Auth header)
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
    [Express Router]          [Error Handling]
    (Route Handler)           (asyncHandler)
        │                             │
        │ Route Logic                 │
        │ ├─ Validate input           │
        │ ├─ Check auth               │
        │ └─ Call services            │
        │                             │
        ▼                             ▼
    [Services Layer]
    ├─ geminiService.js
    │  ├─ generateText()
    │  ├─ analyzeDocument()
    │  ├─ extractTextFromImage()
    │  ├─ chatCompletion()
    │  └─ assessRisk()
    │
    ├─ dataStore.js
    │  ├─ readData()
    │  └─ writeData()
    │
    ├─ errorHandler.js
    │  ├─ asyncHandler()
    │  ├─ AppError class
    │  └─ retryWithBackoff()
    │
    └─ ttsService.js
       ├─ convertToSpeech()
       └─ getVoices()
        │
        └─► API External Services
            ├─ Google Gemini API
            ├─ Python TTS Service
            └─ File System


SPECIFIC FLOW EXAMPLES:

1. User Claims Request:
   Frontend
      └─► GET /api/claims?status=pending
           └─► Route Handler
                └─► dataStore.readData('claims')
                     └─► JSON File (claims.json)
                          └─► Filter by status
                               └─► Return JSON Array
                                   └─► Frontend receives & renders

2. Create Claim Request:
   Frontend (FormData)
      └─► POST /api/claims
           └─► Multer (file upload)
                └─► Route Handler
                     ├─► Create claim object
                     ├─► Call runClaimProcessingGraph()
                     │    ├─► documentVerifier agent
                     │    │    └─► geminiService.analyzeDocument()
                     │    │         └─► Google Gemini API
                     │    ├─► riskDetector agent
                     │    │    └─► geminiService.assessRisk()
                     │    │         └─► Google Gemini API
                     │    └─► decisionNode
                     │         └─► Set status
                     ├─► dataStore.writeData('claims', [...])
                     │    └─► Write to claims.json
                     └─► Return complete claim with AI results
                         └─► Frontend displays confirmation

3. Chat Message Request:
   Frontend
      └─► POST /api/chat
           └─► Route Handler
                ├─► Get user's claims context
                │    └─► dataStore.readData('claims')
                │         └─► Filter by userId
                ├─► Build prompt with context
                ├─► Call geminiService.chatCompletion()
                │    └─► Google Gemini API
                ├─► Store in chatSessions Map
                └─► Return response
                    └─► Frontend displays & can call TTS

4. TTS Request:
   Frontend
      └─► POST /api/tts
           └─► Route Handler
                └─► ttsService.convertToSpeech(text)
                     └─► Python TTS Service (HTTP call)
                          └─► edge_tts library
                               └─► Microsoft Edge TTS API
                                   └─► Returns MP3 bytes
                                       └─► Frontend plays audio
```

---

## 7. Database (JSON Files) Structure

```
server/data/
│
├── claims.json
│   [
│     {
│       "id": "CLM-1734700000001",
│       "userId": "user-1",
│       "policyId": "POL-HEALTH-001",
│       "type": "health",
│       "status": "approved",
│       "statusHistory": [
│         {"status": "submitted", "timestamp": "...", "note": "..."},
│         {"status": "approved", "timestamp": "...", "note": "...", "reviewedBy": "admin-1"}
│       ],
│       "verification": {...},
│       "riskAssessment": {...},
│       "documents": [...],
│       "createdAt": "...",
│       "updatedAt": "..."
│     }
│   ]
│
├── policies.json
│   [
│     {
│       "id": "POL-HEALTH-001",
│       "policyNumber": "POL-12345",
│       "userId": "user-1",
│       "holderName": "John Doe",
│       "type": "health",
│       "coverageAmount": 500000,
│       "startDate": "2024-01-01",
│       "endDate": "2025-12-31",
│       "status": "active"
│     }
│   ]
│
└── users.json
    [
      {
        "id": "user-1",
        "email": "john@example.com",
        "password": "hashed_password",
        "name": "John Doe",
        "role": "user",
        "createdAt": "2024-01-01"
      },
      {
        "id": "admin-1",
        "email": "admin@example.com",
        "password": "hashed_password",
        "name": "Admin Officer",
        "role": "admin",
        "createdAt": "2024-01-01"
      }
    ]

RELATIONSHIPS:
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       │ userId
       │
       ▼
┌─────────────┐          ┌────────────┐
│   Claims    │◄─────────┤ Policies   │
└─────────────┘ policyId └────────────┘

// Queries
Claims for user: claims.filter(c => c.userId === userId)
User's claim: claims.find(c => c.id === claimId)
Policy info: policies.find(p => p.id === policyId)
User info: users.find(u => u.id === userId)
```

---

## 8. Request/Response Cycle Example

```
┌─ REQUEST ─────────────────────────────────────────────────────┐
│                                                                │
│  POST /api/claims                                             │
│  Content-Type: multipart/form-data                            │
│  Authorization: Bearer token_here                             │
│  User-Agent: Chrome                                           │
│                                                                │
│  Form Data:                                                   │
│  ├─ userId: "user-1"                                          │
│  ├─ policyId: "POL-HEALTH-001"                               │
│  ├─ type: "health"                                            │
│  ├─ description: "Hospital admission"                         │
│  ├─ claimAmount: "25000"                                      │
│  ├─ documents: [File, File, File]                             │
│  └─ policyData: "{\"policyNumber\": \"...\"}"               │
│                                                                │
└────────────────────────────────────────────────────────────────┘

                              ↓

┌─ BACKEND PROCESSING ──────────────────────────────────────────┐
│                                                                │
│ 1. Multer extracts files                                      │
│    ├─ Save to /uploads/                                       │
│    └─ Get file metadata (name, size, type)                    │
│                                                                │
│ 2. Create claim object                                        │
│    └─ id, userId, policyId, status: "processing"              │
│                                                                │
│ 3. Run LangGraph agents                                       │
│    ├─ Document Verification (Gemini Vision)                   │
│    │  └─ Returns: {isValid, confidence, types, issues}       │
│    │                                                           │
│    ├─ Risk Detection (Rules + Gemini)                        │
│    │  └─ Returns: {score, level, factors, reasoning}         │
│    │                                                           │
│    └─ Decision Aggregator                                     │
│       └─ Returns: {recommendedStatus}                         │
│                                                                │
│ 4. Save to claims.json                                        │
│    └─ Include verification & riskAssessment data              │
│                                                                │
│ 5. Build response                                             │
│    ├─ Get updated claim from DB                               │
│    └─ Format as JSON                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘

                              ↓

┌─ RESPONSE ────────────────────────────────────────────────────┐
│                                                                │
│  Status: 201 Created                                          │
│  Content-Type: application/json                               │
│                                                                │
│  Body:                                                        │
│  {                                                            │
│    "success": true,                                           │
│    "data": {                                                  │
│      "id": "CLM-1704012345",                                  │
│      "userId": "user-1",                                      │
│      "policyId": "POL-HEALTH-001",                           │
│      "type": "health",                                        │
│      "status": "under_review",                               │
│      "claimAmount": 25000,                                    │
│      "documents": [                                           │
│        {                                                      │
│          "id": "doc-uuid",                                    │
│          "filename": "1704012345-uuid.pdf",                   │
│          "originalName": "Hospital Bill.pdf",                 │
│          "mimeType": "application/pdf",                       │
│          "size": 102400,                                      │
│          "path": "/uploads/1704012345-uuid.pdf"              │
│        }                                                      │
│      ],                                                       │
│      "verification": {                                        │
│        "isValid": true,                                       │
│        "confidence": 95,                                      │
│        "documentsAnalyzed": 3,                                │
│        "identifiedTypes": [                                   │
│          "hospital_bill",                                     │
│          "discharge_summary",                                 │
│          "prescription"                                       │
│        ],                                                     │
│        "missingDocuments": [],                                │
│        "issues": []                                           │
│      },                                                       │
│      "riskAssessment": {                                      │
│        "riskScore": 4.2,                                      │
│        "riskLevel": "low",                                    │
│        "factors": [                                           │
│          {                                                    │
│            "factor": "Claim Frequency",                       │
│            "value": "1 claim/year",                           │
│            "score": 2                                         │
│          },                                                   │
│          {                                                    │
│            "factor": "Claim Amount",                          │
│            "value": "25K of 500K (5%)",                      │
│            "score": 1                                         │
│          }                                                    │
│        ],                                                     │
│        "recommendation": "approve",                           │
│        "reasoning": "Low historical frequency, complete..."   │
│      },                                                       │
│      "statusHistory": [                                       │
│        {                                                      │
│          "status": "submitted",                               │
│          "timestamp": "2024-01-01T10:00:00Z",                │
│          "note": "Claim submitted"                            │
│        },                                                     │
│        {                                                      │
│          "status": "under_review",                            │
│          "timestamp": "2024-01-01T10:05:00Z",                │
│          "note": "AI processing complete"                     │
│        }                                                      │
│      ],                                                       │
│      "createdAt": "2024-01-01T10:00:00Z",                    │
│      "updatedAt": "2024-01-01T10:05:00Z"                     │
│    }                                                          │
│  }                                                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘

                              ↓

┌─ FRONTEND RECEIVES ────────────────────────────────────────────┐
│                                                                │
│ 1. Parse JSON response                                        │
│    └─ Extract claim object                                    │
│                                                                │
│ 2. Update React state                                         │
│    ├─ claims: [..., newClaim]                                 │
│    └─ currentClaim: newClaim                                  │
│                                                                │
│ 3. Show success UI                                            │
│    ├─ Congratulations message                                 │
│    ├─ Claim ID displayed                                      │
│    ├─ Status shown (under_review)                             │
│    ├─ AI recommendations shown                                │
│    └─ Next steps button                                       │
│                                                                │
│ 4. Redirect user                                              │
│    └─ Navigate to /claims/:claimId                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

This comprehensive visual guide should help you understand every aspect of the system architecture and data flows!
