# Smart Insurance Claim Automation System

A prototype for an AI-powered insurance claim processing system with dual dashboards (User & Admin).

## Features

### User Features
- 📝 **Apply Claim** - Submit health or vehicle insurance claims with document upload
- 📋 **Status Tracker** - Track claim status (Submitted → Processing → Approved/Rejected)
- 🤖 **AI Chat Assistant** - Get help with claims, understand processes, and get quick answers
- 🔊 **Text-to-Speech** - Listen to AI responses using Microsoft Edge TTS (completely free)
- 📄 **OCR Support** - Upload policy documents for automatic data extraction via Gemini Vision

### Admin Features
- 📊 **Dashboard** - Overview of claims, statistics, and key metrics
- 📋 **Claims Management** - View, filter, and manage all claims
- ✅ **Claim Review** - Approve or reject claims with AI-powered insights
- 📈 **Analytics** - Visual analytics for claims distribution, risk, and trends

### AI Features (LangGraph Agents)
- **Document Verifier** - Validates uploaded documents for completeness
- **Risk Detector** - Assesses claim risk using rules + AI (Gemini 2.5 Flash)
- **Conversational Agent** - Helps users with questions and claim guidance

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Lucide Icons

### Backend
- Express.js (ES Modules)
- LangGraph.js for agent orchestration
- Google Gemini 2.5 Flash for AI
- Multer for file uploads
- JSON file-based data storage (prototype)

### TTS Service
- Python + Flask
- Edge-TTS (Microsoft Edge Text-to-Speech - free)

## Project Structure

```
prototype/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # User and Admin pages
│   │   └── services/       # API services
│   └── ...
├── server/                 # Express backend
│   ├── agents/             # LangGraph agents
│   ├── data/               # JSON data storage
│   ├── routes/             # API routes
│   ├── services/           # Core services
│   └── uploads/            # Uploaded documents
└── tts-service/            # Python TTS microservice
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Python 3.8+ (for TTS service)
- Google Gemini API Key

### 1. Environment Setup

Create `.env` file in `/server`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
MODEL=gemini-2.5-flash
TTS_SERVICE_URL=http://localhost:5001
```

### 2. Install Dependencies

**Server:**
```bash
cd prototype/server
npm install
```

**Client:**
```bash
cd prototype/client
npm install
```

**TTS Service (optional):**
```bash
cd prototype/tts-service
pip install -r requirements.txt
```

### 3. Run the Application

**Terminal 1 - Server:**
```bash
cd prototype/server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd prototype/client
npm run dev
```

**Terminal 3 - TTS Service (optional):**
```bash
cd prototype/tts-service
python main.py
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Server API: http://localhost:5000
- TTS Service: http://localhost:5001

## Demo Credentials

**User Account:**
- Email: user@example.com
- Password: password123

**Admin Account:**
- Email: admin@example.com
- Password: admin123

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Claims
- `GET /api/claims` - Get all claims
- `GET /api/claims/:id` - Get claim by ID
- `POST /api/claims` - Create new claim
- `PATCH /api/claims/:id/status` - Update claim status
- `GET /api/claims/stats/overview` - Get claim statistics

### Policies
- `GET /api/policies` - Get policies
- `POST /api/policies/validate` - Validate policy number
- `POST /api/policies/ocr` - Extract data from policy document
- `GET /api/policies/requirements/:type` - Get document requirements

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat/:sessionId` - Get chat history

### TTS
- `POST /api/tts/synthesize` - Generate speech from text
- `GET /api/tts/voices` - List available voices

## License

MIT
