# InsureFlow-AI - Code Reference & Snippets

## Quick Reference Guide

### Key Files to Know

| File | Purpose | Key Functions |
|------|---------|---|
| `server/index.js` | Express app setup | Route mounting, middleware |
| `server/routes/claims.js` | Claim CRUD + AI processing | POST /api/claims, runClaimProcessingGraph |
| `server/routes/policies.js` | Policy lookup & OCR | POST /api/policies/ocr |
| `server/routes/chat.js` | Chat assistant | POST /api/chat |
| `server/agents/graph.js` | LangGraph orchestration | StateGraph, state machine |
| `server/agents/documentVerifier.js` | Document validation | verifyDocuments() |
| `server/agents/riskDetector.js` | Risk scoring | assessClaimRisk() |
| `server/services/geminiService.js` | Gemini API wrapper | All Gemini calls |
| `server/services/errorHandler.js` | Error handling | asyncHandler, retryWithBackoff |
| `server/data/dataStore.js` | JSON persistence | readData(), writeData() |
| `client/src/services/api.js` | Frontend API calls | All fetch requests |
| `client/src/App.jsx` | Main router | Route configuration |

---

## Code Snippets You Should Know

### 1. How to Create a New API Endpoint

```javascript
// In server/routes/myRoute.js
import express from 'express';
import { asyncHandler } from '../services/errorHandler.js';
import { readData, writeData } from '../data/dataStore.js';

const router = express.Router();

// GET endpoint
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Read data
  const items = await readData('claims'); // or 'policies', 'users'
  const item = items.find(x => x.id === id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Item not found' }
    });
  }
  
  res.json({ success: true, data: item });
}));

// POST endpoint
router.post('/', asyncHandler(async (req, res) => {
  const { name, value } = req.body;
  
  // Validate
  if (!name) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Name required' }
    });
  }
  
  // Create item
  const items = await readData('claims');
  const newItem = {
    id: `ITEM-${Date.now()}`,
    name,
    value,
    createdAt: new Date().toISOString()
  };
  
  // Save
  items.push(newItem);
  await writeData('claims', items);
  
  res.status(201).json({ success: true, data: newItem });
}));

export default router;
```

**Then mount in `index.js`**:
```javascript
import myRouter from './routes/myRoute.js';
app.use('/api/myroute', myRouter);
```

### 2. How to Call Gemini API

```javascript
// Text generation
import { generateText } from './services/geminiService.js';

const response = await generateText("What is insurance?");
console.log(response);

// With system instruction
const response2 = await generateText(
  "What documents needed for claim?",
  "You are an insurance assistant. Be helpful and concise."
);

// Vision/OCR
import { extractTextFromImage } from './services/geminiService.js';

const base64 = fileBuffer.toString('base64');
const result = await extractTextFromImage(base64, 'application/pdf');
console.log(result); // Extracted text/data

// Risk assessment
import { assessRisk } from './services/geminiService.js';

const riskAnalysis = await assessRisk(claim, policy, claimHistory);
console.log(riskAnalysis); // {riskScore, riskLevel, reasoning}

// Chat completion
import { chatCompletion } from './services/geminiService.js';

const messages = [
  { role: 'user', content: 'How do I file a claim?' },
  { role: 'assistant', content: 'To file a claim...' },
  { role: 'user', content: 'What documents needed?' }
];

const reply = await chatCompletion(messages, {
  recentClaims: userClaims,
  claimCount: 3
});
console.log(reply); // Assistant response
```

### 3. How to Use Data Store (JSON Persistence)

```javascript
import { readData, writeData } from './data/dataStore.js';

// Read all claims
const allClaims = await readData('claims');

// Filter claims
const userClaims = allClaims.filter(c => c.userId === 'user-1');

// Find single claim
const claim = allClaims.find(c => c.id === 'CLM-123');

// Create new claim
const newClaim = {
  id: `CLM-${Date.now()}`,
  userId: 'user-1',
  status: 'submitted',
  createdAt: new Date().toISOString()
};

const claims = await readData('claims');
claims.push(newClaim);
await writeData('claims', claims); // Overwrites file

// Update existing claim
const claims = await readData('claims');
const claim = claims.find(c => c.id === 'CLM-123');
if (claim) {
  claim.status = 'approved';
  claim.updatedAt = new Date().toISOString();
  await writeData('claims', claims);
}

// Delete claim
const claims = await readData('claims');
const filtered = claims.filter(c => c.id !== 'CLM-123');
await writeData('claims', filtered);

// Batch update
let claims = await readData('claims');
claims = claims.map(c => {
  if (c.userId === 'user-1') {
    c.lastNotified = new Date().toISOString();
  }
  return c;
});
await writeData('claims', claims);
```

### 4. How to Use LangGraph Agents

```javascript
import { StateGraph, END } from '@langchain/langgraph';

// 1. Define state
const initialState = {
  claim: claimObject,
  documents: filesArray,
  verification: null,
  riskAssessment: null,
  recommendedStatus: null,
  errors: []
};

// 2. Create nodes (agent functions)
const verificationNode = async (state) => {
  const verification = await verifyDocuments(
    state.documents,
    state.claim.type
  );
  
  return {
    ...state,
    verification
  };
};

const riskNode = async (state) => {
  const risk = await assessClaimRisk(state.claim);
  
  return {
    ...state,
    riskAssessment: risk
  };
};

const decisionNode = async (state) => {
  let status = 'under_review';
  
  if (state.verification?.isValid && state.riskAssessment?.riskLevel === 'low') {
    status = 'approved';
  }
  
  return {
    ...state,
    recommendedStatus: status
  };
};

// 3. Create graph
const graph = new StateGraph(
  // State schema (defines what properties exist)
)
  .addNode('verification', verificationNode)
  .addNode('risk', riskNode)
  .addNode('decision', decisionNode)
  
  // Define flow
  .addEdge('verification', 'risk')
  .addEdge('risk', 'decision')
  .addEdge('decision', END);

// 4. Execute
const result = await graph.invoke(initialState);

console.log(result.verification);
console.log(result.riskAssessment);
console.log(result.recommendedStatus);
```

### 5. How to Handle Errors

```javascript
// Using asyncHandler (wraps route)
router.get('/:id', asyncHandler(async (req, res) => {
  // If error thrown, asyncHandler catches and sends JSON
  const item = await someAsyncFunction();
  
  if (!item) {
    throw new AppError('NOT_FOUND', 'Item not found', 404);
  }
  
  res.json({ success: true, data: item });
}));

// With retryWithBackoff (for flaky operations)
import { retryWithBackoff } from './services/errorHandler.js';

const result = await retryWithBackoff(
  async () => {
    // This will retry 3 times if it fails
    return await geminiAPI.call();
  },
  3,          // max retries
  1000,       // initial delay (ms)
  true        // exponential backoff
);

// Try-catch pattern
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error.message);
  
  if (error.code === 'API_KEY_INVALID') {
    // Handle specific error
  }
  
  throw error; // Re-throw for outer handler
}

// Manual error response
res.status(400).json({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid email format',
    details: { field: 'email' }
  }
});
```

### 6. Frontend API Calls

```javascript
import { claimsApi, policiesApi, chatApi } from './services/api.js';

// Get all claims with filters
const claims = await claimsApi.getAll({
  status: 'approved',
  type: 'health'
});

// Get single claim
const claim = await claimsApi.getById('CLM-123');

// Create claim with file upload
const formData = new FormData();
formData.append('userId', 'user-1');
formData.append('type', 'health');
formData.append('description', 'Hospital visit');
formData.append('claimAmount', '25000');
formData.append('documents', fileInput.files[0]);
formData.append('documents', fileInput.files[1]);

const newClaim = await claimsApi.create(formData);

// Update claim status
const updated = await claimsApi.updateStatus(
  'CLM-123',
  'approved',
  'Approved by admin',
  'admin-1'
);

// Policy OCR
const file = fileInput.files[0];
const extractedData = await policiesApi.ocr(file);
// Returns: {policyNumber, holderName, coverageAmount, type}

// Chat
const response = await chatApi.send(
  'session-123',
  'How do I file a claim?',
  'user-1'
);

// Get chat history
const history = await chatApi.getHistory('session-123');

// TTS
const audioBlob = await ttsApi.generate(
  'This is a test message',
  'en-US-female'
);

// Play in browser
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();
```

### 7. Frontend React Component Pattern

```javascript
import { useState, useEffect } from 'react';
import { claimsApi } from '../services/api.js';

export default function ClaimsList() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await claimsApi.getAll({ status: 'pending' });
      setClaims(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {claims.map(claim => (
        <div key={claim.id}>
          <h3>{claim.id}</h3>
          <p>Status: {claim.status}</p>
          <p>Amount: ${claim.claimAmount}</p>
        </div>
      ))}
    </div>
  );
}
```

### 8. Document Verification Logic

```javascript
// In documentVerifier.js

// Step 1: Define requirements
const REQUIRED_DOCUMENTS = {
  health: {
    required: ['hospital_bill', 'discharge_summary', 'prescription'],
    keywords: {
      hospital_bill: ['bill', 'invoice', 'hospital', 'charges'],
      discharge_summary: ['discharge', 'patient', 'diagnosis'],
      prescription: ['prescription', 'medicine', 'dosage']
    }
  },
  vehicle: {
    required: ['fir_copy', 'repair_estimate', 'damage_photos'],
    keywords: {
      fir_copy: ['fir', 'police', 'complaint'],
      repair_estimate: ['estimate', 'repair', 'cost'],
      damage_photos: ['photo', 'damage', 'accident']
    }
  }
};

// Step 2: Analyze each document
const analyzeDocument = async (base64, mimeType, claimType) => {
  // Call Gemini Vision
  const prompt = `You are an insurance document analyzer.
    Claim type: ${claimType}
    Analyze this document and identify:
    1. Document type
    2. Key fields
    3. Any issues or missing info
    
    Return JSON with: {type, fields, issues, isValid}`;
  
  const result = await model.generateContent({
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: base64 } }
      ]
    }]
  });
  
  return JSON.parse(result.response.text());
};

// Step 3: Check requirements met
const verifyDocuments = async (documents, claimType) => {
  const requirements = REQUIRED_DOCUMENTS[claimType];
  const identifiedTypes = new Set();
  
  for (const doc of documents) {
    const analysis = await analyzeDocument(doc.base64, doc.mimeType, claimType);
    identifiedTypes.add(analysis.type);
  }
  
  const missing = requirements.required.filter(
    r => !identifiedTypes.has(r)
  );
  
  return {
    isValid: missing.length === 0,
    confidence: 95,
    identifiedTypes: Array.from(identifiedTypes),
    missingDocuments: missing
  };
};
```

### 9. Risk Scoring Algorithm

```javascript
// In riskDetector.js

const RISK_FACTORS = {
  claimFrequency: { weight: 0.25, thresholds: { low: 1, medium: 3, high: 5 } },
  claimAmount: { weight: 0.3, thresholds: { low: 0.3, medium: 0.6, high: 0.9 } },
  timeSinceLastClaim: { weight: 0.15, thresholds: { low: 180, medium: 90, high: 30 } },
  policyAge: { weight: 0.1, thresholds: { low: 365, medium: 180, high: 30 } },
  documentQuality: { weight: 0.2, thresholds: { low: 80, medium: 50, high: 30 } }
};

// Helper: Calculate factor score
const calculateFactorRisk = (value, thresholds, inverse = false) => {
  let score = 0;
  
  if (inverse ? value <= thresholds.low : value >= thresholds.low) {
    score = 2; // Low risk
  } else if (inverse ? value <= thresholds.medium : value >= thresholds.medium) {
    score = 5; // Medium risk
  } else {
    score = 8; // High risk
  }
  
  return score;
};

// Main calculation
const assessClaimRisk = async (claim, policy, claimHistory) => {
  const factors = [];
  let totalScore = 0;
  
  // 1. Claim frequency
  const claimsThisYear = claimHistory.filter(c => {
    const diff = Date.now() - new Date(c.createdAt);
    return diff < 365 * 24 * 60 * 60 * 1000;
  }).length;
  
  const frequencyScore = calculateFactorRisk(
    claimsThisYear,
    RISK_FACTORS.claimFrequency.thresholds,
    true
  );
  factors.push({ factor: 'Frequency', value: claimsThisYear, score: frequencyScore });
  totalScore += frequencyScore * RISK_FACTORS.claimFrequency.weight;
  
  // 2. Amount ratio
  const amountRatio = claim.claimAmount / policy.coverageAmount;
  const amountScore = calculateFactorRisk(
    amountRatio,
    RISK_FACTORS.claimAmount.thresholds
  );
  factors.push({ factor: 'Amount', value: amountRatio, score: amountScore });
  totalScore += amountScore * RISK_FACTORS.claimAmount.weight;
  
  // Final risk level
  const riskLevel = totalScore < 3 ? 'low' : totalScore < 7 ? 'medium' : 'high';
  
  // Optional: Call Gemini for AI assessment
  const aiAnalysis = await assessRisk(claim, policy, claimHistory);
  
  return {
    riskScore: totalScore,
    riskLevel,
    factors,
    recommendation: riskLevel === 'low' ? 'approve' : 'review',
    aiAnalysis
  };
};
```

### 10. File Upload with Multer

```javascript
// Memory storage (for OCR)
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Disk storage (for claims)
const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    cb(allowed.includes(file.mimetype) ? null : new Error('Invalid'), 
       allowed.includes(file.mimetype));
  }
});

// Usage in routes
router.post('/ocr', uploadMemory.single('document'), async (req, res) => {
  const buffer = req.file.buffer; // File in memory
  const base64 = buffer.toString('base64');
  // Process...
});

router.post('/claims', uploadDisk.array('documents', 5), async (req, res) => {
  const files = req.files; // Array of file info
  // Save file references...
});
```

---

## Common Debugging Scenarios

### Scenario 1: "Gemini API Key not found"

```javascript
// Problem: env variables not loading

// Solution 1: Check .env file exists
// server/.env should have:
// GEMINI_API_KEY=AIzaSy...

// Solution 2: Ensure dotenv.config() called early
// In server/index.js (line 1-5)
import dotenv from 'dotenv';
dotenv.config();

// Solution 3: Print debug info
console.log('API Key present:', !!process.env.GEMINI_API_KEY);
console.log('Key length:', process.env.GEMINI_API_KEY?.length);
console.log('Key prefix:', process.env.GEMINI_API_KEY?.substring(0, 10));

// Solution 4: Verify path
import path from 'path';
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });
console.log('Loading from:', envPath);
```

### Scenario 2: "Claim creation fails silently"

```javascript
// Problem: No error message shown

// Solution: Add detailed logging
const claim = {
  id: `CLM-${Date.now()}`,
  userId,
  // ... rest of fields
};

try {
  // Run agents
  const result = await runClaimProcessingGraph(claim, documents);
  console.log('✅ Processing complete:', result);
  
  // Save to DB
  const claims = await readData('claims');
  claims.push(claim);
  await writeData('claims', claims);
  console.log('✅ Saved to DB');
  
  // Return response
  res.json({ success: true, data: claim });
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}
```

### Scenario 3: "Documents not detected"

```javascript
// Problem: Gemini can't identify document type

// Solution 1: Check file was received
console.log('File received:', !!req.file);
console.log('File size:', req.file?.size);
console.log('File type:', req.file?.mimetype);

// Solution 2: Verify base64 encoding
const base64 = req.file.buffer.toString('base64');
console.log('Base64 length:', base64.length);
console.log('First 50 chars:', base64.substring(0, 50));

// Solution 3: Test Gemini directly
const test = await model.generateContent({
  contents: [{
    parts: [
      { text: "What is this document type?" },
      { inlineData: { mimeType: 'application/pdf', data: base64 } }
    ]
  }]
});
console.log('Gemini response:', test.response.text());

// Solution 4: Use filename as fallback
const detectedType = detectByFilename(req.file.originalname);
```

### Scenario 4: "Risk score too high/low"

```javascript
// Problem: Risk calculation seems wrong

// Solution: Log each factor
const claimsThisYear = claimHistory.filter(...).length;
console.log('Claims this year:', claimsThisYear);

const frequencyScore = calculateFactorRisk(claimsThisYear, {low: 1, medium: 3, high: 5}, true);
console.log('Frequency score:', frequencyScore, 'weight:', 0.25);

const amountRatio = claim.claimAmount / policy.coverageAmount;
console.log('Amount ratio:', amountRatio);

const amountScore = calculateFactorRisk(amountRatio, {low: 0.3, medium: 0.6, high: 0.9});
console.log('Amount score:', amountScore, 'weight:', 0.3);

const total = (frequencyScore * 0.25) + (amountScore * 0.3) + /* etc */;
console.log('Final score:', total);
console.log('Level:', total < 3 ? 'low' : total < 7 ? 'medium' : 'high');
```

---

## Testing Queries

### Test with curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get claims
curl -X GET "http://localhost:5000/api/claims?status=approved" \
  -H "Authorization: Bearer token_here"

# Create claim
curl -X POST http://localhost:5000/api/claims \
  -F "userId=user-1" \
  -F "type=health" \
  -F "claimAmount=25000" \
  -F "documents=@hospital_bill.pdf"

# Chat
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId":"chat-123",
    "message":"How do I file a claim?",
    "userId":"user-1"
  }'
```

### Test Data (copy to claims.json)

```json
[
  {
    "id": "CLM-TEST-001",
    "userId": "user-1",
    "policyId": "POL-HEALTH-001",
    "type": "health",
    "description": "Test claim",
    "claimAmount": 25000,
    "status": "approved",
    "documents": [],
    "verification": { "isValid": true, "confidence": 95 },
    "riskAssessment": { "riskScore": 4.2, "riskLevel": "low" },
    "statusHistory": [
      { "status": "submitted", "timestamp": "2024-01-01T10:00:00Z", "note": "Test" }
    ],
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
]
```

---

## Performance Tips

```javascript
// ❌ SLOW: Reading entire file for each request
for (const claimId of claimIds) {
  const claims = await readData('claims'); // Reads file 100 times!
  const claim = claims.find(c => c.id === claimId);
}

// ✅ FAST: Read once, filter in memory
const claims = await readData('claims');
const results = claimIds.map(id => claims.find(c => c.id === id));

// ❌ SLOW: Writing to file multiple times
claims.push(claim1);
await writeData('claims', claims);
claims.push(claim2);
await writeData('claims', claims);

// ✅ FAST: Batch writes
claims.push(claim1, claim2, claim3);
await writeData('claims', claims);

// ❌ SLOW: Array operations on large data
const filtered = claims.filter(c => c.status === 'approved');

// ✅ FAST: Use Map for O(1) lookups
const claimMap = new Map(claims.map(c => [c.id, c]));
const claim = claimMap.get('CLM-123');

// Caching pattern
let cachedClaims = null;
let cacheTime = null;
const CACHE_TTL = 60 * 1000; // 1 minute

const getClaims = async () => {
  const now = Date.now();
  if (cachedClaims && (now - cacheTime) < CACHE_TTL) {
    return cachedClaims;
  }
  cachedClaims = await readData('claims');
  cacheTime = now;
  return cachedClaims;
};
```

---

**Last Updated**: January 8, 2026  
**For**: Complete InsureFlow-AI Project Understanding
