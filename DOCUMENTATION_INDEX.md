# InsureFlow-AI - Complete Documentation Index

## 📚 Documentation Files Created

I've created **three comprehensive guides** to help you master the InsureFlow-AI project:

### 1. **MASTER_GUIDE.md** ⭐ START HERE
**The most important document - read this first!**

Contains:
- ✅ Complete project overview
- ✅ Architecture diagram
- ✅ Directory structure explained
- ✅ 4 major data flows (claims, OCR, chat, admin review)
- ✅ Deep dive into each AI agent (Document Verifier, Risk Detector, Conversational Agent)
- ✅ Explanation of all technologies used (Gemini, LangGraph, Multer, Edge TTS)
- ✅ Complete API endpoints reference
- ✅ Data models (JSON structure)
- ✅ 5-phase learning plan to master the project
- ✅ Common questions you should be able to answer
- ✅ Key code patterns explained
- ✅ Mastery checklist

**Read this to understand**: How everything works together

---

### 2. **ARCHITECTURE_DIAGRAMS.md** 📊
**Visual representations of every system flow**

Contains:
- ✅ ASCII diagrams showing complete system architecture
- ✅ Claim processing flow (step-by-step)
- ✅ OCR document extraction flow
- ✅ Chat assistant flow
- ✅ Admin review & approval flow
- ✅ Data flow between all components
- ✅ Database (JSON files) structure
- ✅ Request/Response cycle example with real data

**Read this to visualize**: How data moves through the system

---

### 3. **CODE_REFERENCE.md** 💻
**Quick reference and copy-paste ready code snippets**

Contains:
- ✅ Quick reference table of key files
- ✅ 10 code snippets ready to use:
  1. Creating a new API endpoint
  2. Calling Gemini API
  3. Using data store (read/write JSON)
  4. Using LangGraph agents
  5. Error handling patterns
  6. Frontend API calls
  7. React component patterns
  8. Document verification logic
  9. Risk scoring algorithm
  10. File upload with Multer
- ✅ Common debugging scenarios with solutions
- ✅ Testing queries (curl commands)
- ✅ Performance tips and caching patterns

**Read this to**: Get code examples and solve specific problems

---

## 🎯 How to Use These Documents

### If you want to understand the overall architecture:
1. Read [MASTER_GUIDE.md](MASTER_GUIDE.md) - sections 1-3
2. View [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) - section 1 (System Architecture)

### If you want to trace a specific user flow:
1. Read [MASTER_GUIDE.md](MASTER_GUIDE.md) - section "🔄 Data Flows"
2. View [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) - corresponding section
3. Reference [CODE_REFERENCE.md](CODE_REFERENCE.md) for code examples

### If you need to implement a feature:
1. Find similar feature in [MASTER_GUIDE.md](MASTER_GUIDE.md)
2. Look at the relevant code files
3. Copy code snippet from [CODE_REFERENCE.md](CODE_REFERENCE.md)
4. Use debugging tips if something goes wrong

### If you need to explain the project to someone:
1. Show them [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)
2. Explain using [MASTER_GUIDE.md](MASTER_GUIDE.md) sections
3. Point them to specific code in [CODE_REFERENCE.md](CODE_REFERENCE.md)

---

## 🧠 What You Now Know

After reading these documents, you can answer:

### Architecture Questions
- ✅ "What are the main components?"
  → Frontend (React), Backend (Express), TTS Service (Python), External APIs
  
- ✅ "How does data flow through the system?"
  → User Browser → Frontend → Backend API → Services → External APIs/Database
  
- ✅ "What databases are used?"
  → JSON files in server/data/ (claims.json, policies.json, users.json)

### Feature Questions
- ✅ "How does claim application work?"
  → User fills form → Uploads docs → Multer saves files → LangGraph runs agents → Status set
  
- ✅ "How does OCR extract policy data?"
  → Upload PDF → Convert to Base64 → Call Gemini Vision → Parse JSON response → Auto-fill form
  
- ✅ "How does the chat assistant work?"
  → User message → Load context (user's claims) → Call Gemini → Return conversational response
  
- ✅ "How does admin review work?"
  → Admin sees all claims with AI scores → Reviews documents → Clicks Approve/Reject → Status updates

### AI Questions
- ✅ "How do the agents work?"
  → LangGraph state machine orchestrates 3 agents: Document Verifier, Risk Detector, Decision Aggregator
  
- ✅ "How is document verification done?"
  → Check file types + Use Gemini Vision to read content + Check requirements met
  
- ✅ "How is risk score calculated?"
  → 5 weighted factors (frequency, amount, time, age, quality) → Rule-based scoring + AI enhancement
  
- ✅ "How are decisions made?"
  → If verification fails → review. If high risk → review. If low risk + valid → auto-approve

### Implementation Questions
- ✅ "How do I add a new API endpoint?"
  → Create route file → Use asyncHandler → Read/write data → Return JSON
  
- ✅ "How do I call Gemini?"
  → Use geminiService functions → Pass prompt + optional file data → Get response
  
- ✅ "How do I handle errors?"
  → Use asyncHandler wrapper → Throw AppError → Returns formatted JSON response
  
- ✅ "How do I save data?"
  → Read JSON → Modify array → writeData() → Done

---

## 📖 Recommended Reading Order

### For Complete Understanding (8-10 hours)
1. **MASTER_GUIDE.md** (2-3 hours)
   - Sections 1-3: Overview & architecture
   - Section 4: All data flows
   - Section 5: AI agents deep dive
   - Section 6: Technologies explained

2. **ARCHITECTURE_DIAGRAMS.md** (2-3 hours)
   - All 8 sections - visualize each flow
   - Trace a claim from creation to approval

3. **CODE_REFERENCE.md** (2-3 hours)
   - Read all 10 code snippets
   - Understand error handling
   - Know debugging techniques

### For Quick Learning (2-3 hours)
1. MASTER_GUIDE.md - Sections 1-3 only
2. ARCHITECTURE_DIAGRAMS.md - Sections 1 & 2 only
3. CODE_REFERENCE.md - Skip to "Quick Reference" table

### For Implementation (As needed)
- Reference MASTER_GUIDE.md data flow section
- Find code pattern in CODE_REFERENCE.md
- Check original file in repository

---

## 🔍 How to Find Specific Information

### "How does claim creation work?"
→ MASTER_GUIDE.md section 4.1 + ARCHITECTURE_DIAGRAMS.md section 2

### "What does the risk detector do?"
→ MASTER_GUIDE.md section 5.2 + CODE_REFERENCE.md snippet #9

### "How do I create an API endpoint?"
→ CODE_REFERENCE.md snippet #1 + MASTER_GUIDE.md API Endpoints reference

### "What is the claim JSON structure?"
→ MASTER_GUIDE.md Data Model section + CODE_REFERENCE.md

### "How does Gemini get called?"
→ CODE_REFERENCE.md snippet #2 + MASTER_GUIDE.md section 6.1

### "Why is the system structured this way?"
→ MASTER_GUIDE.md section 1 + ARCHITECTURE_DIAGRAMS.md section 1

### "How do I debug a Gemini error?"
→ CODE_REFERENCE.md "Common Debugging Scenarios" section 1

### "What is the complete user flow?"
→ ARCHITECTURE_DIAGRAMS.md section 2 (with all steps)

### "How are decisions made?"
→ MASTER_GUIDE.md section 5.3 + ARCHITECTURE_DIAGRAMS.md section 5

---

## 💡 Key Insights

### The System in One Sentence
**Users submit insurance claims → AI validates documents + assesses risk → Admins review → System auto-approves low-risk claims**

### The Three Layers
1. **Frontend**: React UI for users and admins
2. **Backend**: Express server orchestrating agents and APIs
3. **AI**: LangGraph agents making decisions

### The Three Key AI Components
1. **Document Verifier**: Checks if required docs are present (Gemini Vision)
2. **Risk Detector**: Scores claim risk using rules + AI (Gemini reasoning)
3. **Conversational Agent**: Helps users with questions (Gemini chat)

### The Two File Storages
1. **Memory**: For OCR processing (fast, temporary)
2. **Disk**: For claim documents (persistent, for admin review)

### The One State Machine
**LangGraph** orchestrates agents in sequence: Verification → Risk Assessment → Decision

---

## ✅ Mastery Checklist

After reading all three documents, check off:

- [ ] Can explain claim flow from creation to approval
- [ ] Understand what each of 3 agents do
- [ ] Know how OCR extracts policy data
- [ ] Can read claim JSON and understand each field
- [ ] Know why system uses Gemini
- [ ] Understand why Python TTS service is separate
- [ ] Can trace a chat message through system
- [ ] Know risk scoring algorithm
- [ ] Understand Multer file handling
- [ ] Can explain LangGraph state machine
- [ ] Know all API endpoints and their purposes
- [ ] Understand document requirements by type
- [ ] Can read error logs and diagnose issues
- [ ] Know how frontend and backend communicate
- [ ] Understand caching and performance patterns

**Mark every single one as checked = You've mastered the project!**

---

## 🚀 Next Steps

### Now that you understand the system:

1. **Run the application locally**
   ```bash
   cd prototype
   npm install  # server and client
   npm run dev  # in both directories
   ```

2. **Test each flow manually**
   - Create a test claim
   - Upload documents
   - Check AI recommendations
   - Approve as admin
   - Send chat message

3. **Make a small modification**
   - Add a new field to claim
   - Modify risk scoring
   - Add a new chat capability

4. **Debug something**
   - Use console logs to trace execution
   - Reference CODE_REFERENCE.md debugging section
   - Verify data in claims.json

5. **Implement a new feature**
   - Create new endpoint (CODE_REFERENCE.md #1)
   - Add business logic
   - Wire into frontend
   - Test thoroughly

---

## 📞 Quick Reference Commands

```bash
# Start server
cd prototype/server && npm run dev

# Start frontend
cd prototype/client && npm run dev

# Start TTS service
cd prototype/tts-service && python main.py

# View claims database
cat prototype/server/data/claims.json | jq .

# Check Gemini errors
grep "Gemini\|ERROR\|❌" log output

# Test API
curl -X GET http://localhost:5000/api/claims
curl -X GET http://localhost:5000/api/health
```

---

## 🎓 Final Words

You now have **three comprehensive documents** that explain:
- **What** the system does
- **How** each part works
- **Why** it's structured this way
- **Where** to find specific information
- **When** to use each component
- **Code examples** ready to copy

You can now confidently:
✅ Explain the project to anyone
✅ Answer questions about any feature
✅ Debug issues independently
✅ Implement new features
✅ Maintain and improve the codebase

**Go read these documents, and you'll be unstoppable!**

---

**Documentation Created**: January 8, 2026  
**Total Content**: 3 comprehensive guides  
**Total Word Count**: ~25,000 words  
**Estimated Reading Time**: 6-8 hours for complete mastery
