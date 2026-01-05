import { chatCompletion } from '../services/geminiService.js';

// System prompts for different conversation contexts
const CONTEXT_PROMPTS = {
  general: `You are a friendly and helpful insurance claim assistant. Help users with:
- Understanding their policies
- Filing claims step by step
- Answering questions about coverage
- Explaining claim statuses and decisions

Be empathetic, patient, and clear in your explanations.`,

  claimHelp: `You are helping a user file an insurance claim. Guide them through:
1. Selecting the right type of claim (health/vehicle)
2. Gathering required documents
3. Filling in claim details
4. Understanding what to expect next

Provide specific, actionable guidance.`,

  statusExplain: `You are explaining claim status to a user. Help them understand:
- What each status means
- How long each stage typically takes
- What actions they might need to take
- When to expect updates

Be reassuring and informative.`,

  rejection: `You are helping a user understand why their claim was rejected. 
- Explain the reason clearly and simply
- Show empathy for their situation
- Suggest possible next steps (appeal, additional documents, etc.)
- Be honest but supportive`
};

// Conversational agent for helping claimants
export const handleConversation = async (message, context = {}) => {
  // Determine conversation context
  const promptType = determineContextType(message, context);
  const systemPrompt = CONTEXT_PROMPTS[promptType] || CONTEXT_PROMPTS.general;

  // Build conversation history
  const messages = context.history || [];
  messages.push({ role: 'user', content: message });

  // Add context information
  const enrichedContext = {
    ...context,
    currentTime: new Date().toISOString(),
    promptType
  };

  try {
    const response = await chatCompletion(messages, enrichedContext);
    return {
      message: response,
      context: promptType,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Conversational agent error:', error);
    return {
      message: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team for immediate assistance.",
      error: true,
      timestamp: new Date().toISOString()
    };
  }
};

// Determine the type of conversation based on message content
const determineContextType = (message, context) => {
  const lowerMessage = message.toLowerCase();

  if (context.currentClaim?.status === 'rejected' || 
      lowerMessage.includes('rejected') || 
      lowerMessage.includes('denied')) {
    return 'rejection';
  }

  if (lowerMessage.includes('status') || 
      lowerMessage.includes('where is') || 
      lowerMessage.includes('how long')) {
    return 'statusExplain';
  }

  if (lowerMessage.includes('file') || 
      lowerMessage.includes('submit') || 
      lowerMessage.includes('claim') ||
      lowerMessage.includes('document')) {
    return 'claimHelp';
  }

  return 'general';
};

// Generate quick responses for common questions
export const getQuickResponse = (questionId) => {
  const quickResponses = {
    'how-to-file': `To file a claim:
1. Go to "Apply Claim" from your dashboard
2. Select your insurance type (Health or Vehicle)
3. Enter your policy number or upload your policy document
4. Fill in the claim details and upload required documents
5. Review and submit your claim

You'll receive a claim ID and can track your status in real-time.`,

    'required-docs-health': `For health insurance claims, you typically need:
- Hospital bills/invoices (required)
- Discharge summary (required)
- Doctor's prescription (required)
- Lab/diagnostic reports (if applicable)
- Pharmacy bills (if applicable)

Make sure all documents are clear and legible.`,

    'required-docs-vehicle': `For vehicle insurance claims, you typically need:
- FIR copy (for accidents/theft)
- Repair estimate from authorized service center
- Photos of damage
- Driving license copy
- Vehicle RC copy

For accident claims, file the FIR immediately.`,

    'processing-time': `Typical claim processing times:
- Initial review: 1-2 business days
- Document verification: 2-3 business days
- Final decision: 5-7 business days

Simple claims may be processed faster. Complex claims or those requiring additional information may take longer.`,

    'claim-rejected': `If your claim was rejected, you can:
1. Review the rejection reason in your claim details
2. Check if you can provide additional documentation
3. File an appeal within 30 days
4. Contact our support team for clarification

Common reasons include: missing documents, policy not covering the expense, or exceeding coverage limits.`
  };

  return quickResponses[questionId] || null;
};

export default { handleConversation, getQuickResponse };
