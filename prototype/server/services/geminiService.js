import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { retryWithBackoff, AppError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from prototype directory (two levels up from services folder)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

console.log('🔧 [Gemini] Initializing Gemini Service...');
console.log('    API Key present:', !!process.env.GEMINI_API_KEY);
console.log('    API Key length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('    API Key prefix:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...' || 'N/A');
console.log('    Model:', process.env.MODEL || 'gemini-2.5-flash (default)');

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ [Gemini] GEMINI_API_KEY is not set in environment variables!');
} else if (process.env.GEMINI_API_KEY.length < 30) {
  console.warn('⚠️  [Gemini] GEMINI_API_KEY seems too short, may be invalid');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.MODEL || 'gemini-2.5-flash';

// Get the generative model
const getModel = (systemInstruction = null) => {
  console.log('🤖 [Gemini] Getting model:', MODEL);
  const config = { model: MODEL };
  if (systemInstruction) {
    console.log('📝 [Gemini] Using system instruction (length:', systemInstruction.length, ')');
    config.systemInstruction = systemInstruction;
  }
  return genAI.getGenerativeModel(config);
};

// Text generation
export const generateText = async (prompt, systemInstruction = null) => {
  return retryWithBackoff(async () => {
    const model = getModel(systemInstruction);
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
};

// Helper function to normalize extracted data - flatten nested structures
const normalizeExtractedData = (data) => {
  const normalized = {};
  
  // Recursive function to flatten nested objects
  const flatten = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Check if this looks like a nested details object
        if (key.toLowerCase().includes('details') || key.toLowerCase().includes('information')) {
          flatten(value, prefix); // Don't add the details key itself
        } else {
          flatten(value, prefix);
        }
      } else if (!Array.isArray(value)) {
        // Convert common keys to expected format
        const normalizedKey = key
          .replace(/policy number/i, 'policyNumber')
          .replace(/holder name/i, 'holderName')
          .replace(/policy holder/i, 'holderName')
          .replace(/policy type/i, 'type')
          .replace(/coverage amount/i, 'coverageAmount')
          .replace(/start date/i, 'startDate')
          .replace(/end date/i, 'endDate')
          .replace(/premium amount/i, 'premiumAmount')
          .replace(/claim amount/i, 'claimAmount')
          .replace(/total claimed amount/i, 'claimAmount')
          .replace(/\s+/g, '');
        
        // Use camelCase version or original key
        const finalKey = normalizedKey.charAt(0).toLowerCase() + normalizedKey.slice(1);
        
        // Only add non-null, non-empty values
        if (value !== null && value !== '' && value !== undefined) {
          normalized[finalKey] = value;
        }
      }
    }
  };
  
  flatten(data);
  
  // Ensure we have at least the basic expected fields
  return {
    policyNumber: normalized.policyNumber || normalized.PolicyNumber || null,
    holderName: normalized.holderName || normalized.PolicyHolderName || null,
    type: normalized.type || normalized.PolicyType || null,
    coverageAmount: normalized.coverageAmount || normalized.CoverageAmount || null,
    startDate: normalized.startDate || normalized.StartDate || null,
    endDate: normalized.endDate || normalized.EndDate || null,
    premiumAmount: normalized.premiumAmount || normalized.PremiumAmount || null,
    claimAmount: normalized.claimAmount || normalized.TotalClaimedAmount || null,
    ...normalized // Include any other fields that were extracted
  };
};

// OCR - Extract text from image using Gemini Vision
export const extractTextFromImage = async (imageBase64, mimeType = 'image/png') => {
  console.log('📸 [OCR] extractTextFromImage called');
  console.log('    MIME type:', mimeType);
  console.log('    Base64 length:', imageBase64.length);
  console.log('    Model:', MODEL);
  
  return retryWithBackoff(async () => {
    console.log('🤖 [OCR] Initializing Gemini model...');
    const model = getModel();
    console.log('✅ [OCR] Model initialized successfully');
    
    const prompt = `Extract all text from this insurance document. 
    
    IMPORTANT: Return ONLY a flat JSON object (no nested objects) with these exact field names:
    {
      "policyNumber": "the policy number",
      "holderName": "policy holder's full name",
      "type": "Health or Vehicle",
      "coverageAmount": "coverage amount as number",
      "startDate": "start date in YYYY-MM-DD format",
      "endDate": "end date in YYYY-MM-DD format",
      "premiumAmount": "premium amount as number",
      "claimAmount": "total claim amount if mentioned"
    }
    
    Only include fields that you can extract from the document. Use null for missing values.
    Do NOT create nested objects or complex structures.`;
    
    console.log('📝 [OCR] Prompt prepared (length:', prompt.length, 'chars)');

    console.log('🚀 [OCR] Sending request to Gemini API...');
    const apiCallStart = Date.now();
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64
        }
      }
    ]);

    const apiCallDuration = Date.now() - apiCallStart;
    console.log('✅ [OCR] Gemini API response received in', apiCallDuration, 'ms');
    
    const text = result.response.text();
    console.log('📄 [OCR] Response text length:', text.length);
    console.log('📄 [OCR] Response preview:', text.substring(0, 200));
    
    // Try to parse as JSON, fallback to raw text
    try {
      console.log('🔍 [OCR] Attempting to parse response as JSON...');
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        console.log('✅ [OCR] JSON pattern found, length:', jsonString.length);
        console.log('📝 [OCR] JSON string preview:', jsonString.substring(0, 200));
        
        const parsed = JSON.parse(jsonString);
        console.log('✅ [OCR] Successfully parsed JSON');
        console.log('📊 [OCR] Parsed object keys:', Object.keys(parsed).join(', '));
        
        // Normalize the data structure - flatten nested objects if present
        const normalized = normalizeExtractedData(parsed);
        console.log('✅ [OCR] Data normalized');
        console.log('📊 [OCR] Normalized keys:', Object.keys(normalized).join(', '));
        
        return normalized;
      } else {
        console.log('⚠️  [OCR] No JSON pattern found in response');
      }
    } catch (e) {
      console.error('❌ [OCR] JSON parsing failed:', e.message);
      console.error('    Error type:', e.constructor.name);
    }
    
    console.log('⚠️  [OCR] Falling back to raw text response');
    return { rawText: text };
  });
};

// Analyze document for verification
export const analyzeDocument = async (imageBase64, mimeType, documentType) => {
  return retryWithBackoff(async () => {
    const model = getModel();
    
    const prompt = `Analyze this ${documentType} document for an insurance claim.
    
    Check for:
    1. Document authenticity indicators
    2. All required fields are present and readable
    3. Dates are valid and not expired
    4. Any signs of tampering or inconsistencies
    5. Document quality assessment
    
    Return a JSON object with:
    {
      "isValid": boolean,
      "confidence": number (0-100),
      "extractedData": { ... },
      "issues": ["list of any issues found"],
      "missingFields": ["list of missing required fields"],
      "recommendations": ["suggestions for the user"]
    }`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64
        }
      }
    ]);

    const text = result.response.text();
    
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (e) {
      console.log('Could not parse document analysis as JSON');
    }
    
    return {
      isValid: false,
      confidence: 0,
      issues: ['Could not analyze document'],
      rawResponse: text
    };
  });
};

// Chat completion for conversational agent
export const chatCompletion = async (messages, context = {}) => {
  return retryWithBackoff(async () => {
    const systemPrompt = `You are a helpful insurance claim assistant. Your role is to:
    - Help users understand their insurance policies
    - Guide them through the claim submission process
    - Answer questions about claim status and requirements
    - Explain rejection reasons in simple terms
    - Be empathetic and patient with users
    
    Current context:
    ${JSON.stringify(context, null, 2)}
    
    Always be professional, clear, and helpful. If you don't know something, say so honestly.`;

    const model = getModel(systemPrompt);
    
    // Build conversation history
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    
    return result.response.text();
  });
};

// Risk assessment for a claim
export const assessRisk = async (claimData, policyData, claimHistory = []) => {
  return retryWithBackoff(async () => {
    const model = getModel();
    
    const prompt = `Analyze this insurance claim for risk assessment.

    CLAIM DATA:
    ${JSON.stringify(claimData, null, 2)}
    
    POLICY DATA:
    ${JSON.stringify(policyData, null, 2)}
    
    CLAIM HISTORY:
    ${JSON.stringify(claimHistory, null, 2)}
    
    Evaluate:
    1. Claim amount vs policy coverage limits
    2. Frequency of claims in history
    3. Time since last claim
    4. Consistency of claim details
    5. Any red flags or anomalies
    
    Return a JSON object:
    {
      "riskScore": number (1-10, where 10 is highest risk),
      "riskLevel": "low" | "medium" | "high",
      "factors": [
        { "factor": "description", "impact": "positive" | "negative" | "neutral", "weight": number }
      ],
      "recommendation": "approve" | "review" | "flag",
      "reasoning": "detailed explanation",
      "flaggedIssues": ["list of concerns if any"]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (e) {
      console.log('Could not parse risk assessment as JSON');
    }
    
    return {
      riskScore: 5,
      riskLevel: 'medium',
      recommendation: 'review',
      reasoning: 'Manual review recommended',
      rawResponse: text
    };
  });
};

export default {
  generateText,
  extractTextFromImage,
  analyzeDocument,
  chatCompletion,
  assessRisk
};
