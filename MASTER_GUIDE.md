# InsureFlow-AI - Complete Master Guide

## 🎯 Project Overview

**InsureFlow-AI** is an AI-powered insurance claim automation system with a **dual-dashboard architecture**:
- **User Dashboard**: Citizens apply for and track insurance claims
- **Admin Dashboard**: Insurance officers review and approve/reject claims using AI insights

### Core Technologies
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + LangGraph (AI agents)
- **AI**: Google Gemini 2.5 Flash for vision/text processing
- **TTS**: Python Flask + Microsoft Edge TTS (completely free)
- **Data**: JSON file-based storage (prototype)

---

## 📊 Project Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     INSUREFLOW-AI                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │   REACT FRONTEND     │         │  EXPRESS BACKEND     │  │
│  │   (Port 3000)        │◄──────►│  (Port 5000)        │  │
│  │                      │  REST   │                      │  │
│  │  • Login             │  APIs   │  • Routes            │  │
│  │  • User Dashboard    │         │  • LangGraph Agents  │  │
│  │  • Apply Claim       │         │  • Gemini Service    │  │
│  │  • Track Status      │         │  • File Upload       │  │
│  │  • Chat Assistant    │         │  • Data Store        │  │
│  │  • Admin Dashboard   │         │                      │  │
│  └──────────────────────┘         └──────────────────────┘  │
│                                            │                 │
│                                            ▼                 │
│                          ┌──────────────────────────────┐   │
│                          │   PYTHON TTS SERVICE         │   │
│                          │   (Port 5001)                │   │
│                          │                              │   │
│                          │  • Edge TTS                  │   │
│                          │  • Audio Generation          │   │
│                          └──────────────────────────────┘   │
│                                            │                 │
│                          ┌──────────────────────────────┐   │
│                          │   EXTERNAL SERVICES          │   │
│                          │                              │   │
│                          │  • Google Gemini API         │   │
│                          │  • Microsoft Edge TTS API    │   │
│                          └──────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Directory Structure Explained

### Backend Structure (`server/`)
```
server/
├── index.js                          # Main Express app, sets up all routes
├── package.json                      # Dependencies (express, gemini-ai, langgraph)
├── .env                              # Configuration (API keys, ports)
│
├── routes/
│   ├── auth.js                       # Login/register endpoints
│   ├── claims.js                     # Claim CRUD + AI processing
│   ├── policies.js                   # Policy lookup + OCR extraction
│   ├── chat.js                       # Chat assistant endpoint
│   └── tts.js                        # Text-to-speech proxy
│
├── agents/
│   ├── graph.js                      # LangGraph state machine orchestration
│   ├── documentVerifier.js           # AI agent: validates documents
│   ├── riskDetector.js               # AI agent: assesses claim risk
│   └── conversationalAgent.js        # AI agent: handles user queries
│
├── services/
│   ├── geminiService.js              # Google Gemini API wrapper
│   ├── errorHandler.js               # Error handling + retry logic
│   └── ttsService.js                 # TTS service integration
│
├── data/
│   ├── dataStore.js                  # JSON file read/write operations
│   ├── claims.json                   # Claims database
│   ├── policies.json                 # Policies database
│   └── users.json                    # Users database
│
└── uploads/                          # Temporary file storage
```

### Frontend Structure (`client/`)
```
client/
├── src/
│   ├── App.jsx                       # Main router config
│   ├── index.css                     # Global styles
│   │
│   ├── pages/
│   │   ├── Login.jsx                 # Auth page
│   │   ├── user/
│   │   │   ├── Dashboard.jsx         # User home
│   │   │   ├── ApplyClaim.jsx        # New claim form + OCR
│   │   │   ├── StatusTracker.jsx     # View all claims
│   │   │   ├── ClaimDetail.jsx       # Claim details page
│   │   │   └── Help.jsx              # Chat assistant
│   │   └── admin/
│   │       ├── Dashboard.jsx         # Admin overview
│   │       ├── Claims.jsx            # Manage all claims
│   │       ├── ClaimReview.jsx       # Approve/reject claims
│   │       └── Analytics.jsx         # Charts + statistics
│   │
│   ├── components/
│   │   ├── ChatAssistant.jsx         # Reusable chat component
│   │   └── layouts/
│   │       ├── UserLayout.jsx        # User sidebar + nav
│   │       └── AdminLayout.jsx       # Admin sidebar + nav
│   │
│   ├── services/
│   │   └── api.js                    # All API calls to backend
│   │
│   └── App.jsx                       # Routes & auth context
```

### TTS Service (`tts-service/`)
```
tts-service/
├── main.py                           # Flask app for text-to-speech
└── requirements.txt                  # Python dependencies
```

---

## 🔄 Data Flows - How Everything Connects

### 1️⃣ **User Claim Application Flow**

```
USER BROWSER                BACKEND                 AI AGENTS
   │                          │                         │
   ├─ Fill claim form ────────>│                         │
   │  (with file upload)       │                         │
   │                           │                         │
   │                    /api/claims (POST)              │
   │                           │                         │
   │                    Create claim object            │
   │                           ├─ runClaimProcessingGraph
   │                           │                    ────>│
   │                           │                    Document
   │                           │                    Verification
   │                           │                    ←────│
   │                           │                    Risk
   │                           │                    Detection
   │                           │                    ←────│
   │<──── Response ────────────│                         │
   │ (with AI insights)        │                         │
   │                           │                         │
```

**What happens:**
1. User fills out claim form on `/apply` page
2. Selects claim type (health/vehicle) and uploads documents
3. Frontend calls `POST /api/claims` with FormData (files + metadata)
4. Backend receives files via **Multer** (disk storage)
5. Creates claim object with initial status: `processing`
6. Runs through **LangGraph state machine** with 3 agents:
   - **Document Verifier**: Checks if required documents are present
   - **Risk Detector**: Assesses claim risk (rule-based + AI)
   - **Decision Aggregator**: Combines results → sets status
7. Returns claim with AI insights to frontend
8. User sees status on `/claims` page

### 2️⃣ **Document OCR (Policy Data Extraction) Flow**

```
USER BROWSER             BACKEND              GEMINI API
   │                       │                      │
   ├─ Upload PDF/Image ────>│                      │
   │                        │                      │
   │            /api/policies/ocr (POST)         │
   │            (multipart file)                  │
   │                        │                      │
   │                 Read file → Base64 encode    │
   │                        │                      │
   │                        ├─ extractTextFromImage
   │                        ├─────────────────────>│
   │                        │  {base64, mimeType}  │
   │                        │                      │
   │                        │<─ Extracted data ───│
   │                        │  (JSON parsed)       │
   │                        │                      │
   │<─ JSON response ───────│                      │
   │ (policyNumber, amount) │                      │
```

**What happens:**
1. User uploads policy document on `/apply` page
2. Clicks "Extract Policy Data" or automatic upload trigger
3. Frontend calls `POST /api/policies/ocr` with file
4. **Multer** stores file in memory (for OCR processing)
5. Backend converts file to Base64
6. Calls **Gemini Vision API** with prompt: "Extract policy details"
7. Gemini returns structured JSON:
   ```json
   {
     "policyNumber": "POL-12345",
     "holderName": "John Doe",
     "coverageAmount": 500000,
     "type": "health"
   }
   ```
8. Frontend auto-fills form fields with extracted data
9. User can review/edit before submission

### 3️⃣ **Chat Assistant Flow**

```
USER BROWSER          BACKEND            GEMINI API
   │                    │                    │
   ├─ Type message ─────>│                    │
   │                     │                    │
   │      POST /api/chat │                    │
   │      {message, uid} │                    │
   │                     │                    │
   │              Read user's claims from DB  │
   │              Build context              │
   │                     │                    │
   │            chatCompletion()              │
   │                     ├──────────────────>│
   │                     │  (message + context)
   │                     │                    │
   │                     │<─ AI response ────│
   │                     │                    │
   │<─ JSON response ────│                    │
   │ {message, sessionId}│                    │
```

**What happens:**
1. User types message in chat on `/help` page
2. Frontend calls `POST /api/chat` with message + userId
3. Backend loads user's recent claims from JSON DB
4. Passes to **Gemini** with system prompt:
   - "You are an insurance claim assistant"
   - Includes recent claims as context
5. Gemini generates conversational response
6. Response saved in chat session (in-memory Map)
7. Response sent back to frontend
8. **Optional**: If user says "read this aloud"
   - Frontend calls `POST /api/tts` with text
   - Backend forwards to Python TTS service
   - Returns audio file as MP3/WAV
   - Browser plays it

### 4️⃣ **Admin Claim Review Flow**

```
ADMIN BROWSER         BACKEND          GEMINI (optional)
   │                    │                    │
   ├─ View claims ──────>│                    │
   │  GET /api/claims    │                    │
   │                     │                    │
   │<─ All claims ───────│                    │
   │  (with AI scores)   │                    │
   │                     │                    │
   ├─ Click claim ──────>│                    │
   │  GET /api/claims/:id│                    │
   │                     │                    │
   │<─ Claim details ────│                    │
   │  (verification +    │                    │
   │   riskAssessment)   │                    │
   │                     │                    │
   ├─ Approve/Reject ────>│                    │
   │  PATCH /api/claims  │                    │
   │  /:id/status        │                    │
   │                     │                    │
   │           Update claim.json              │
   │           Update statusHistory           │
   │                     │                    │
   │<─ Confirmation ─────│                    │
```

**What happens:**
1. Admin logs in with role: `admin`
2. Views `/admin/claims` - fetches all claims with stats
3. Each claim shows:
   - Document verification results
   - Risk score + level (low/medium/high)
   - Recommended status from AI
   - Reason for recommendation
4. Admin can view claim details at `/admin/claims/:id`
5. Reviews AI insights + uploaded documents
6. Clicks **Approve** or **Reject**
7. Calls `PATCH /api/claims/:id/status` with decision
8. Backend updates JSON DB:
   - Changes `claim.status`
   - Adds to `statusHistory`
   - Records reviewer name + timestamp

---

## 🤖 AI Agents Deep Dive (LangGraph)

### Architecture: State Machine Pattern

```
┌─────────────────────────────────────────────────┐
│           LANGGRAPH STATE MACHINE               │
├─────────────────────────────────────────────────┤
│                                                  │
│   Input: { claim, documents }                   │
│       │                                          │
│       ▼                                          │
│   ┌─────────────────────────────────────────┐  │
│   │  DOCUMENT VERIFICATION AGENT            │  │
│   │  • Check file types                     │  │
│   │  • Validate required documents          │  │
│   │  • Use Gemini Vision to read content    │  │
│   │  • Output: {isValid, confidence, issues}│  │
│   └────────────────┬────────────────────────┘  │
│                    │                            │
│       ┌────────────▼─────────────┐             │
│       │  RISK DETECTION AGENT    │             │
│       │  • Calculate claim freq. │             │
│       │  • Compare amount vs     │             │
│       │    coverage              │             │
│       │  • Check claim history   │             │
│       │  • Use Gemini for AI     │             │
│       │    assessment            │             │
│       │  Output: {score, level}  │             │
│       └────────────┬─────────────┘             │
│                    │                            │
│       ┌────────────▼─────────────────────────┐ │
│       │ DECISION AGGREGATOR                  │ │
│       │ If verification failed → UNDER_REVIEW│ │
│       │ If high risk → UNDER_REVIEW          │ │
│       │ If low risk + valid → AUTO_APPROVE   │ │
│       │ Else → UNDER_REVIEW                  │ │
│       └────────────┬─────────────────────────┘ │
│                    │                            │
│       Output: { recommendedStatus,             │
│                verification,                   │
│                riskAssessment }                │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Agent 1: Document Verifier (`documentVerifier.js`)

**Purpose**: Validate that required documents are present and complete

**How it works**:
```javascript
// Define requirements by claim type
const REQUIRED_DOCUMENTS = {
  health: ['hospital_bill', 'discharge_summary', 'prescription'],
  vehicle: ['fir_copy', 'repair_estimate', 'damage_photos']
};

// For each document:
1. Read filename
2. If Gemini can access file → use Vision API
   - Analyze image content
   - Detect document type
   - Extract key fields
3. Else → Use filename-based detection
4. Compare with requirements
5. Flag missing/invalid documents
```

**Output**:
```json
{
  "isValid": true/false,
  "confidence": 0-100,
  "documentsAnalyzed": 3,
  "identifiedTypes": ["hospital_bill", "prescription"],
  "missingDocuments": ["discharge_summary"],
  "issues": ["Low resolution image", "Document expired"],
  "recommendations": ["Please upload high-quality documents"]
}
```

### Agent 2: Risk Detector (`riskDetector.js`)

**Purpose**: Assess claim risk using rules + AI

**Rule-based factors** (weighted):
```javascript
RISK_FACTORS = {
  claimFrequency: {
    weight: 0.25,
    thresholds: { low: 1, medium: 3, high: 5 } // per year
  },
  claimAmount: {
    weight: 0.3,
    thresholds: { low: 0.3, medium: 0.6, high: 0.9 } // % of coverage
  },
  timeSinceLastClaim: {
    weight: 0.15,
    thresholds: { low: 180, medium: 90, high: 30 } // days
  },
  policyAge: {
    weight: 0.1,
    thresholds: { low: 365, medium: 180, high: 30 } // days
  },
  documentQuality: {
    weight: 0.2,
    thresholds: { low: 80, medium: 50, high: 30 } // confidence %
  }
};
```

**Calculation**:
```
Risk Score = (factor1_score × weight1) + (factor2_score × weight2) + ...
Risk Level = { low: 0-3, medium: 3-7, high: 7-10 }
```

**AI Enhancement**:
- Calls Gemini: "Assess risk for this claim given its history"
- Gemini returns: fraud indicators, suspicious patterns, recommendations
- Combines rule-based score with AI insights

**Output**:
```json
{
  "riskScore": 6.5,
  "riskLevel": "medium",
  "factors": [
    { "factor": "Claim Frequency", "value": "4 claims/year", "score": 7 },
    { "factor": "Claim Amount", "value": "$45K of $100K coverage", "score": 5 }
  ],
  "recommendation": "manual_review",
  "reasoning": "Multiple claims this year suggest potential insurance fraud",
  "flaggedIssues": ["High claim frequency", "Incomplete documentation"]
}
```

### Agent 3: Conversational Agent (`conversationalAgent.js`)

**Purpose**: Answer user questions about insurance/claims

**System Prompt**:
```
You are an insurance claim assistant. 
Help users understand:
- Claim process and requirements
- Policy coverage details
- Claim status
- Document requirements

Be friendly, helpful, and accurate.
```

**Context passed**:
- Recent claims of the user
- Claim count
- Policy information

---

## 🔧 Key Technologies & How They Work

### 1. **Gemini Vision API** (Image Understanding)

**When used**:
- OCR: Extract text from policy documents
- Document verification: Identify document types
- Risk assessment: Analyze submitted documents

**Example call**:
```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const result = await model.generateContent({
  contents: [{
    parts: [
      { text: "Extract all insurance policy details from this document" },
      { inlineData: { mimeType: 'application/pdf', data: base64Pdf } }
    ]
  }]
});
```

### 2. **Gemini Text API** (Language Understanding)

**When used**:
- Chat responses
- Risk assessment reasoning
- Claim recommendations

### 3. **LangGraph** (Agentic Workflows)

**What it does**:
- Orchestrates multiple agents
- Manages state between agents
- Handles failures gracefully
- Retries automatically

**Pattern**:
```javascript
const graph = new StateGraph(/* schema */)
  .addNode('documentVerification', documentVerificationNode)
  .addNode('riskAssessment', riskAssessmentNode)
  .addNode('decision', decisionNode)
  .addEdge('documentVerification', 'riskAssessment')
  .addEdge('riskAssessment', 'decision')
  .addEdge('decision', END);

const result = await graph.invoke(initialState);
```

### 4. **Multer** (File Upload Handling)

**Two modes**:

a) **Memory storage** (for OCR):
   - Used in `/policies/ocr` route
   - Files uploaded to RAM
   - Converted to Base64 immediately
   - Efficient for small files

b) **Disk storage** (for claim documents):
   - Used in `/claims` route
   - Files saved to `server/uploads/`
   - Unique names (timestamp + UUID)
   - Files persist for admin review

### 5. **Edge TTS** (Text-to-Speech)

**How it works**:
```python
# Python service
async def generate_speech(text: str, voice: str) -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    audio_data = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])
    
    return audio_data.getvalue()  # Returns MP3 bytes
```

**Called from**:
- Chat assistant when user clicks "Read aloud"
- Help page for announcements

---

## 📡 API Endpoints Reference

### Authentication
```
POST   /api/auth/login          # Login with email/password
POST   /api/auth/register       # Create new account
GET    /api/auth/me             # Get current user
```

### Claims Management
```
GET    /api/claims              # Get all claims (filters: status, type, userId)
GET    /api/claims/:id          # Get single claim
POST   /api/claims              # Create new claim (multipart file upload)
PATCH  /api/claims/:id/status   # Update claim status (admin)
GET    /api/claims/stats/overview # Get statistics
```

### Policies
```
GET    /api/policies            # Get all policies (filter by userId)
GET    /api/policies/:id        # Get single policy
POST   /api/policies/validate   # Validate policy number
POST   /api/policies/ocr        # Extract data from policy document
```

### Chat
```
POST   /api/chat                # Send message (conversational AI)
GET    /api/chat/:sessionId     # Get chat history
DELETE /api/chat/:sessionId     # Clear session
GET    /api/chat/help/quick     # Get quick help questions
```

### Text-to-Speech
```
POST   /api/tts                 # Convert text to speech
GET    /api/tts/voices          # Get available voices
```

---

## 🗂️ Data Model (JSON Structure)

### Claim Object
```json
{
  "id": "CLM-1734700000001",
  "userId": "user-1",
  "policyId": "POL-HEALTH-001",
  "type": "health",
  "description": "Hospital admission",
  "claimAmount": 25000,
  "policyData": {
    "policyNumber": "POL-12345",
    "holderName": "John Doe"
  },
  "documents": [
    {
      "id": "doc-123",
      "filename": "hospital_bill.pdf",
      "originalName": "Hospital Bill.pdf",
      "mimeType": "application/pdf",
      "size": 102400,
      "path": "/uploads/1704012345-uuid.pdf"
    }
  ],
  "status": "under_review",
  "statusHistory": [
    {
      "status": "submitted",
      "timestamp": "2024-12-01T10:00:00Z",
      "note": "Claim submitted"
    }
  ],
  "verification": {
    "isValid": true,
    "confidence": 95,
    "documentsAnalyzed": 3,
    "identifiedTypes": ["hospital_bill", "discharge_summary"],
    "missingDocuments": [],
    "issues": []
  },
  "riskAssessment": {
    "riskScore": 4.2,
    "riskLevel": "low",
    "factors": [
      {
        "factor": "Claim Frequency",
        "value": "1 claim/year",
        "score": 2
      }
    ],
    "recommendation": "approve",
    "reasoning": "Low historical frequency, complete documentation"
  },
  "createdAt": "2024-12-01T10:00:00Z",
  "updatedAt": "2024-12-01T10:30:00Z"
}
```

### Policy Object
```json
{
  "id": "POL-HEALTH-001",
  "policyNumber": "POL-12345",
  "userId": "user-1",
  "holderName": "John Doe",
  "type": "health",
  "coverageAmount": 500000,
  "startDate": "2024-01-01",
  "endDate": "2025-12-31",
  "status": "active"
}
```

### User Object
```json
{
  "id": "user-1",
  "email": "john@example.com",
  "password": "hashed_password",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## 🚀 How to Master This Project

### Phase 1: Understand the Architecture (2-3 hours)

1. **Read these files in order**:
   - [server/index.js](server/index.js) - Understand routing
   - [server/routes/claims.js](server/routes/claims.js) - Follow claim flow
   - [server/agents/graph.js](server/agents/graph.js) - Understand orchestration
   - [client/src/App.jsx](client/src/App.jsx) - Understand frontend routing

2. **Key questions to answer**:
   - How does a claim move from user to approval?
   - What happens when a document is uploaded?
   - How do the 3 agents work together?
   - What's the data flow between frontend and backend?

3. **Trace a complete user journey**:
   - Start at login → apply claim → upload docs → check status

### Phase 2: Deep Dive Into Each Component (4-5 hours)

**Backend Services** (understand each service):
- [server/services/geminiService.js](server/services/geminiService.js) - How Gemini calls work
- [server/data/dataStore.js](server/data/dataStore.js) - Data persistence
- [server/services/errorHandler.js](server/services/errorHandler.js) - Error patterns

**Agents** (understand decision logic):
- [server/agents/documentVerifier.js](server/agents/documentVerifier.js) - Document validation logic
- [server/agents/riskDetector.js](server/agents/riskDetector.js) - Risk scoring algorithm
- [server/agents/conversationalAgent.js](server/agents/conversationalAgent.js) - Chat logic

**Frontend Pages** (understand each user flow):
- [client/src/pages/user/ApplyClaim.jsx](client/src/pages/user/ApplyClaim.jsx) - Form handling + file upload
- [client/src/pages/user/StatusTracker.jsx](client/src/pages/user/StatusTracker.jsx) - Claim listing
- [client/src/pages/admin/Claims.jsx](client/src/pages/admin/Claims.jsx) - Admin management
- [client/src/pages/admin/ClaimReview.jsx](client/src/pages/admin/ClaimReview.jsx) - Review logic

### Phase 3: Understand the AI Decision Making (2-3 hours)

1. **Document Verification Logic**:
   - What documents are required for health vs vehicle claims?
   - How does Gemini Vision identify document types?
   - What confidence threshold triggers "invalid"?

2. **Risk Scoring Algorithm**:
   - Calculate manually: a claim with 4 claims/year, $50K claim on $100K policy
   - Understand weighted factor calculation
   - See how AI ranking enhances rule-based scoring

3. **State Machine Flow**:
   - Draw the LangGraph flow by hand
   - Understand conditional edges and decision logic

### Phase 4: Learn Common Operations (2 hours)

**Code Examples You Should Understand**:

1. **How to add a new Gemini API call**:
   ```javascript
   // In services/geminiService.js
   export const myNewFunction = async (input) => {
     return retryWithBackoff(async () => {
       const model = getModel();
       const result = await model.generateContent({
         contents: [{ parts: [{ text: "prompt" }] }]
       });
       return result.response.text();
     });
   };
   ```

2. **How to add a new route**:
   ```javascript
   // In routes/newRoute.js
   router.get('/:id', asyncHandler(async (req, res) => {
     const data = await readData('claims');
     const item = data.find(x => x.id === req.params.id);
     res.json({ success: true, data: item });
   }));
   ```

3. **How to read/write data**:
   ```javascript
   import { readData, writeData } from '../data/dataStore.js';
   
   // Read
   const claims = await readData('claims');
   
   // Write
   await writeData('claims', claims);
   ```

4. **How to call backend from frontend**:
   ```javascript
   import { claimsApi } from '../services/api.js';
   
   const claim = await claimsApi.create(formData); // Uses multipart
   const claims = await claimsApi.getAll({ status: 'approved' }); // With filters
   ```

### Phase 5: Practice & Build (3-4 hours)

**Mini Projects to Implement**:

1. **Add Email Notification Agent**:
   - Create new agent that sends emails on claim status changes
   - Add to LangGraph state machine
   - Test with dummy SMTP

2. **Add Document Scoring**:
   - Modify document verifier to score each document (0-100)
   - Return document quality metrics
   - Display on admin review page

3. **Add Claim History Analytics**:
   - New endpoint: `GET /api/analytics/claims-by-month`
   - Add chart component on admin dashboard
   - Calculate trends

4. **Enhance Chat with Memory**:
   - Currently chat sessions are in-memory (lost on restart)
   - Save to claims.json database
   - Load persistent history

---

## 🎯 Common Questions You Should Be Able to Answer

### Architecture
- Q: "How does the system know if a document is valid?"
  A: LangGraph runs documentVerifier agent which checks file types + uses Gemini Vision to analyze content

- Q: "How are decisions made to auto-approve claims?"
  A: Decision aggregator combines verification results + risk score. If valid docs + low risk → auto-approve

- Q: "Where is data stored?"
  A: JSON files in server/data/. claims.json, policies.json, users.json

### Features
- Q: "How does OCR work?"
  A: User uploads policy PDF → Backend converts to Base64 → Calls Gemini Vision API → Extracts structured JSON → Frontend auto-fills form

- Q: "How does the chat assistant work?"
  A: User types question → Backend loads user's claims as context → Calls Gemini with system prompt → Returns conversational response

- Q: "Why is there a Python TTS service?"
  A: Gemini generates text, but for speech we use Microsoft Edge TTS (free, high quality). Separate service to avoid blocking Node.js thread

### Debugging
- Q: "How do I trace a claim from creation to approval?"
  A: Check claims.json for claim.statusHistory array. Shows timestamp + note for each state change.

- Q: "How do I see what the AI agents decided?"
  A: Check claim.verification and claim.riskAssessment fields in response

- Q: "How do I test without Gemini API key?"
  A: Mock responses in geminiService.js. Return fake verification/risk data for testing.

---

## 🔑 Key Code Patterns

### Error Handling Pattern
```javascript
import { asyncHandler, AppError } from '../services/errorHandler.js';

router.get('/:id', asyncHandler(async (req, res) => {
  // asyncHandler wraps async errors
  // AppError thrown = formatted JSON response
  const data = await readData('claims');
  const item = data.find(x => x.id === req.params.id);
  
  if (!item) {
    throw new AppError('NOT_FOUND', 'Claim not found', 404);
  }
  
  res.json({ success: true, data: item });
}));
```

### API Request Pattern (Frontend)
```javascript
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.error.message);
  return data.data;
};
```

### Agent Pattern (LangGraph)
```javascript
const nodeFunction = async (state) => {
  // Process input
  const result = await someAsyncOperation(state);
  
  // Return updated state
  return {
    ...state,
    newField: result
  };
};

graph.addNode('nodeName', nodeFunction);
```

---

## 📚 Learning Resources

### Inside the Project
- `OCR_LOGGING_GUIDE.md` - Detailed OCR debugging
- `DATA_SCRIPTS_README.md` - Data management utilities
- `README.md` - Basic setup

### External Resources
- [Google Generative AI JS docs](https://ai.google.dev/docs)
- [LangChain/LangGraph JS docs](https://js.langchain.com/)
- [Express.js guide](https://expressjs.com/)
- [React Router docs](https://reactrouter.com/)

---

## 🔄 Environment Variables

**Required in `server/.env`**:
```env
PORT=5000
GEMINI_API_KEY=your_api_key_here
MODEL=gemini-2.5-flash
TTS_SERVICE_URL=http://localhost:5001
```

**Optional**:
```env
ENVIRONMENT=development
LOG_LEVEL=debug
```

---

## ✅ Checklist for Mastery

- [ ] Can explain claim flow from creation to approval
- [ ] Understand all 3 LangGraph agents and their logic
- [ ] Know how OCR extracts policy data
- [ ] Can trace a specific request through logs
- [ ] Understand document verification requirements by type
- [ ] Can calculate risk score manually for a claim
- [ ] Know the complete JSON structure of claims/policies/users
- [ ] Can read/write data using dataStore.js
- [ ] Understand Gemini API calls and retry logic
- [ ] Can explain how frontend talks to backend
- [ ] Know all API endpoints and their purposes
- [ ] Understand TTS service integration
- [ ] Can add a new route and agent to the system
- [ ] Can debug using console logs (already extensive)
- [ ] Know how authentication works
- [ ] Understand both user and admin flows
- [ ] Can explain decision aggregation algorithm
- [ ] Know how file uploads work (Multer)
- [ ] Understand error handling patterns
- [ ] Can answer any question about project architecture

---

## 🎓 Final Tips for Mastery

1. **Run locally and debug**:
   - Set breakpoints in VS Code
   - Read the extensive console logs
   - Modify requests and see what changes

2. **Experiment**:
   - Create test claims and trace them
   - Try different document combinations
   - See how risk scores change

3. **Read the code thoroughly**:
   - Don't just skim
   - Understand each variable
   - Trace all control flows

4. **Ask yourself**:
   - "What would happen if I removed this code?"
   - "Why was this implemented this way?"
   - "How would I build this differently?"

5. **Build features**:
   - Each new feature deepens understanding
   - Start small and iterate
   - Test thoroughly before moving on

---

**Last Updated**: January 8, 2026  
**Project Status**: Prototype  
**Complexity Level**: Intermediate (3/5)
