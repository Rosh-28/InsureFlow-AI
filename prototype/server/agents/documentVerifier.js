import { analyzeDocument, generateText } from '../services/geminiService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Document requirements by claim type
const REQUIRED_DOCUMENTS = {
  health: {
    required: ['hospital_bill', 'discharge_summary', 'prescription'],
    keywords: {
      hospital_bill: ['bill', 'invoice', 'hospital', 'amount', 'total', 'charges'],
      discharge_summary: ['discharge', 'summary', 'patient', 'diagnosis', 'treatment'],
      prescription: ['prescription', 'rx', 'medicine', 'dosage', 'doctor']
    }
  },
  vehicle: {
    required: ['fir_copy', 'repair_estimate', 'damage_photos'],
    keywords: {
      fir_copy: ['fir', 'first information report', 'police', 'complaint'],
      repair_estimate: ['estimate', 'repair', 'cost', 'parts', 'labour', 'service'],
      damage_photos: ['photo', 'image', 'damage', 'accident']
    }
  }
};

// Verify uploaded documents
export const verifyDocuments = async (documents, claimType, policyData) => {
  console.log(`  Verifying ${documents.length} documents for ${claimType} claim...`);
  
  const requirements = REQUIRED_DOCUMENTS[claimType];
  if (!requirements) {
    return {
      isValid: false,
      error: 'Unknown claim type',
      confidence: 0
    };
  }

  const verificationResults = [];
  const identifiedDocTypes = new Set();
  const issues = [];
  const missingDocs = [];

  // If no documents uploaded, just check what's missing
  if (documents.length === 0) {
    return {
      isValid: false,
      confidence: 0,
      documentsAnalyzed: 0,
      identifiedTypes: [],
      missingDocuments: requirements.required.map(r => ({
        type: r,
        name: formatDocTypeName(r)
      })),
      issues: ['No documents uploaded'],
      recommendations: ['Please upload the required documents to proceed with your claim']
    };
  }

  // Analyze each document
  for (const doc of documents) {
    try {
      // Read file if it exists on disk
      let analysis = null;
      
      if (doc.path) {
        const fullPath = path.join(__dirname, '..', doc.path);
        try {
          const fileBuffer = await fs.readFile(fullPath);
          const base64 = fileBuffer.toString('base64');
          analysis = await analyzeDocument(base64, doc.mimeType, claimType);
        } catch (fileError) {
          console.log(`  Could not read file ${doc.path}, using metadata analysis`);
        }
      }

      // If we couldn't analyze the image, use filename-based detection
      if (!analysis) {
        analysis = analyzeByFilename(doc.originalName, claimType);
      }

      // Identify document type
      const detectedType = detectDocumentType(doc.originalName, analysis, claimType);
      if (detectedType) {
        identifiedDocTypes.add(detectedType);
      }

      verificationResults.push({
        documentId: doc.id,
        filename: doc.originalName,
        detectedType,
        analysis,
        isValid: analysis?.isValid !== false
      });

      if (analysis?.issues) {
        issues.push(...analysis.issues.map(i => `${doc.originalName}: ${i}`));
      }
    } catch (error) {
      console.error(`  Error analyzing document ${doc.originalName}:`, error.message);
      verificationResults.push({
        documentId: doc.id,
        filename: doc.originalName,
        error: error.message,
        isValid: false
      });
      issues.push(`Could not analyze ${doc.originalName}`);
    }
  }

  // Check for missing required documents
  for (const required of requirements.required) {
    if (!identifiedDocTypes.has(required)) {
      missingDocs.push({
        type: required,
        name: formatDocTypeName(required)
      });
    }
  }

  // Calculate overall validity and confidence
  const hasAllRequired = missingDocs.length === 0;
  const validDocs = verificationResults.filter(r => r.isValid).length;
  const confidence = documents.length > 0 
    ? Math.round((validDocs / documents.length) * 100 * (hasAllRequired ? 1 : 0.5))
    : 0;

  return {
    isValid: hasAllRequired && issues.length === 0,
    confidence,
    documentsAnalyzed: documents.length,
    results: verificationResults,
    identifiedTypes: Array.from(identifiedDocTypes),
    missingDocuments: missingDocs,
    issues,
    recommendations: generateRecommendations(missingDocs, issues, claimType)
  };
};

// Analyze document by filename when image analysis isn't available
const analyzeByFilename = (filename, claimType) => {
  const lowerFilename = filename.toLowerCase();
  const requirements = REQUIRED_DOCUMENTS[claimType];
  
  for (const [docType, keywords] of Object.entries(requirements.keywords)) {
    if (keywords.some(kw => lowerFilename.includes(kw))) {
      return {
        isValid: true,
        confidence: 60,
        detectedType: docType,
        extractedData: {},
        issues: [],
        note: 'Identified by filename pattern'
      };
    }
  }

  return {
    isValid: true,
    confidence: 40,
    detectedType: 'unknown',
    extractedData: {},
    issues: [],
    note: 'Could not identify document type from filename'
  };
};

// Detect document type from filename and analysis
const detectDocumentType = (filename, analysis, claimType) => {
  const lowerFilename = filename.toLowerCase();
  const requirements = REQUIRED_DOCUMENTS[claimType];

  // Check filename first
  for (const [docType, keywords] of Object.entries(requirements.keywords)) {
    if (keywords.some(kw => lowerFilename.includes(kw))) {
      return docType;
    }
  }

  // Use analysis result if available
  if (analysis?.detectedType && analysis.detectedType !== 'unknown') {
    return analysis.detectedType;
  }

  return null;
};

// Format document type name for display
const formatDocTypeName = (type) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Generate recommendations based on issues
const generateRecommendations = (missingDocs, issues, claimType) => {
  const recommendations = [];

  if (missingDocs.length > 0) {
    recommendations.push(
      `Please upload the following required documents: ${missingDocs.map(d => d.name).join(', ')}`
    );
  }

  if (issues.length > 0) {
    recommendations.push('Please review the flagged issues and re-upload clearer documents if needed');
  }

  if (recommendations.length === 0) {
    recommendations.push('All documents look good! Your claim is ready for processing.');
  }

  return recommendations;
};

export default { verifyDocuments };
