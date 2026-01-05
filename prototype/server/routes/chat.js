import express from 'express';
import { asyncHandler } from '../services/errorHandler.js';
import { chatCompletion } from '../services/geminiService.js';
import { readData } from '../data/dataStore.js';

const router = express.Router();

// Store chat sessions in memory (for prototype)
const chatSessions = new Map();

// Start or continue chat session
router.post('/', asyncHandler(async (req, res) => {
  const { sessionId, message, userId, context } = req.body;

  // Get or create session
  let session = chatSessions.get(sessionId);
  if (!session) {
    session = {
      id: sessionId || `chat-${Date.now()}`,
      userId,
      messages: [],
      context: context || {}
    };
    chatSessions.set(session.id, session);
  }

  // Add user message
  session.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });

  // Get additional context
  let enrichedContext = { ...session.context };
  
  if (userId) {
    // Get user's claims for context
    const claims = await readData('claims');
    const userClaims = claims.filter(c => c.userId === userId);
    enrichedContext.recentClaims = userClaims.slice(0, 5);
    enrichedContext.claimCount = userClaims.length;
  }

  // Get AI response
  const response = await chatCompletion(session.messages, enrichedContext);

  // Add assistant message
  session.messages.push({
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      message: response,
      timestamp: new Date().toISOString()
    }
  });
}));

// Get chat history
router.get('/:sessionId', asyncHandler(async (req, res) => {
  const session = chatSessions.get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Chat session not found' }
    });
  }

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      messages: session.messages
    }
  });
}));

// Clear chat session
router.delete('/:sessionId', asyncHandler(async (req, res) => {
  chatSessions.delete(req.params.sessionId);
  res.json({ success: true, message: 'Session cleared' });
}));

// Quick help questions
router.get('/help/quick', asyncHandler(async (req, res) => {
  const quickQuestions = [
    { id: 1, question: 'How do I file a claim?', category: 'process' },
    { id: 2, question: 'What documents do I need for a health claim?', category: 'documents' },
    { id: 3, question: 'How long does claim processing take?', category: 'process' },
    { id: 4, question: 'Why was my claim rejected?', category: 'status' },
    { id: 5, question: 'How can I check my claim status?', category: 'status' },
    { id: 6, question: 'What is covered under my policy?', category: 'policy' }
  ];

  res.json({ success: true, data: quickQuestions });
}));

export default router;
