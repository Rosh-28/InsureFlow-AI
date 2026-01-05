import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { retryWithBackoff, AppError } from './errorHandler.js';

dotenv.config({ path: '../.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.MODEL || 'gemini-2.5-flash';

// Get the generative model
const getModel = (systemInstruction = null) => {
  const config = { model: MODEL };
  if (systemInstruction) {
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

// OCR - Extract text from image using Gemini Vision
export const extractTextFromImage = async (imageBase64, mimeType = 'image/png') => {
  return retryWithBackoff(async () => {
    const model = getModel();
    
    const prompt = `Extract all text from this document image. 
    Return the extracted text in a structured format.
    If this is an insurance policy document, extract:
    - Policy Number
    - Policy Holder Name
    - Policy Type (Health/Vehicle)
    - Coverage Amount
    - Start Date
    - End Date
    - Premium Amount
    - Any other relevant details
    
    Return as JSON format.`;

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
    
    // Try to parse as JSON, fallback to raw text
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (e) {
      console.log('Could not parse as JSON, returning raw text');
    }
    
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
