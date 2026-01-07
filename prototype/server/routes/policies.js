import express from 'express';
import multer from 'multer';
import { asyncHandler } from '../services/errorHandler.js';
import { extractTextFromImage } from '../services/geminiService.js';
import { readData } from '../data/dataStore.js';

const router = express.Router();

console.log('📁 [Policies Routes] Configuring multer for file uploads...');
console.log('    Storage: memory');
console.log('    File size limit:', '10 MB');

// Configure multer for memory storage (for OCR processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log('🔍 [Multer] File filter check:');
    console.log('    Original name:', file.originalname);
    console.log('    MIME type:', file.mimetype);
    console.log('    Field name:', file.fieldname);
    
    const allowedMimes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      console.log('✅ [Multer] File accepted');
      cb(null, true);
    } else {
      console.log('❌ [Multer] File rejected - invalid MIME type');
      cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`), false);
    }
  }
});

// Get all policies for a user
router.get('/', asyncHandler(async (req, res) => {
  const { userId } = req.query;
  let policies = await readData('policies');

  if (userId) {
    policies = policies.filter(p => p.userId === userId);
  }

  res.json({ success: true, data: policies });
}));

// Get single policy by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const policies = await readData('policies');
  const policy = policies.find(p => p.id === req.params.id || p.policyNumber === req.params.id);

  if (!policy) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Policy not found' }
    });
  }

  res.json({ success: true, data: policy });
}));

// Validate policy number
router.post('/validate', asyncHandler(async (req, res) => {
  const { policyNumber } = req.body;
  const policies = await readData('policies');
  const policy = policies.find(p => p.policyNumber === policyNumber);

  if (!policy) {
    return res.json({
      success: true,
      data: {
        isValid: false,
        message: 'Policy number not found in our records'
      }
    });
  }

  // Check if policy is expired
  const isExpired = new Date(policy.endDate) < new Date();

  res.json({
    success: true,
    data: {
      isValid: !isExpired,
      isExpired,
      policy: {
        id: policy.id,
        policyNumber: policy.policyNumber,
        holderName: policy.holderName,
        type: policy.type,
        coverageAmount: policy.coverageAmount,
        startDate: policy.startDate,
        endDate: policy.endDate,
        status: policy.status
      },
      message: isExpired ? 'Policy has expired' : 'Policy is valid'
    }
  });
}));

// OCR - Extract policy data from uploaded image
router.post('/ocr', upload.single('document'), asyncHandler(async (req, res) => {
  console.log('=== OCR REQUEST STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  if (!req.file) {
    console.error('❌ OCR Error: No file uploaded in request');
    return res.status(400).json({
      success: false,
      error: { code: 'NO_FILE', message: 'No document uploaded' }
    });
  }

  console.log('✅ File received:');
  console.log('  - Original name:', req.file.originalname);
  console.log('  - MIME type:', req.file.mimetype);
  console.log('  - Size:', req.file.size, 'bytes', '(' + (req.file.size / 1024 / 1024).toFixed(2) + ' MB)');
  console.log('  - Field name:', req.file.fieldname);
  console.log('  - Buffer length:', req.file.buffer?.length || 0);

  // Validate MIME type
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (!validMimeTypes.includes(req.file.mimetype)) {
    console.warn('⚠️  Invalid MIME type:', req.file.mimetype);
    console.warn('    Valid types:', validMimeTypes.join(', '));
  }
  
  const isPdf = req.file.mimetype === 'application/pdf';
  console.log('📄 Document type:', isPdf ? 'PDF' : 'Image');

  const base64Image = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;
  
  console.log('📝 Base64 encoding complete');
  console.log('  - Base64 string length:', base64Image.length);
  console.log('  - First 50 chars:', base64Image.substring(0, 50));

  try {
    console.log('🔄 Calling extractTextFromImage function...');
    const startTime = Date.now();
    
    const extractedData = await extractTextFromImage(base64Image, mimeType);
    
    const processingTime = Date.now() - startTime;
    console.log('✅ OCR Processing completed in', processingTime, 'ms');
    console.log('📊 Extracted data:', JSON.stringify(extractedData, null, 2));
    
    const confidence = extractedData.rawText ? 'low' : 'high';
    console.log('🎯 Confidence level:', confidence);
    
    if (extractedData.rawText) {
      console.log('⚠️  Only raw text extracted - structured data parsing failed');
      console.log('    Raw text length:', extractedData.rawText.length);
    } else {
      console.log('✅ Structured data successfully extracted');
      console.log('    Fields found:', Object.keys(extractedData).join(', '));
    }

    console.log('=== OCR REQUEST COMPLETED SUCCESSFULLY ===\n');
    res.json({
      success: true,
      data: {
        extracted: extractedData,
        confidence: confidence,
        message: extractedData.rawText 
          ? 'Could only extract raw text. Please verify the details.'
          : 'Successfully extracted policy details.'
      }
    });
  } catch (error) {
    console.error('=== OCR ERROR ===');
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    if (error.response) {
      console.error('❌ API Response status:', error.response.status);
      console.error('❌ API Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.code) {
      console.error('❌ Error code:', error.code);
    }
    
    console.error('=== OCR REQUEST FAILED ===\n');
    
    res.status(500).json({
      success: false,
      error: {
        code: 'OCR_FAILED',
        message: 'Could not extract text from document. Please enter details manually.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}));

// Get required documents for claim type
router.get('/requirements/:type', asyncHandler(async (req, res) => {
  const { type } = req.params;

  const requirements = {
    health: {
      required: [
        { id: 'hospital_bill', name: 'Hospital Bill/Invoice', description: 'Original bill from hospital' },
        { id: 'discharge_summary', name: 'Discharge Summary', description: 'Patient discharge document' },
        { id: 'prescription', name: 'Doctor\'s Prescription', description: 'Prescription for treatment' }
      ],
      optional: [
        { id: 'lab_reports', name: 'Lab Reports', description: 'Diagnostic test reports' },
        { id: 'pharmacy_bills', name: 'Pharmacy Bills', description: 'Medicine purchase bills' }
      ]
    },
    vehicle: {
      required: [
        { id: 'fir_copy', name: 'FIR Copy', description: 'For theft/accident cases' },
        { id: 'repair_estimate', name: 'Repair Estimate', description: 'From authorized service center' },
        { id: 'photos', name: 'Damage Photos', description: 'Clear photos of damage' }
      ],
      optional: [
        { id: 'driving_license', name: 'Driving License', description: 'Copy of driver\'s license' },
        { id: 'rc_copy', name: 'RC Copy', description: 'Vehicle registration certificate' }
      ]
    }
  };

  const typeRequirements = requirements[type];

  if (!typeRequirements) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TYPE', message: 'Invalid claim type. Use "health" or "vehicle".' }
    });
  }

  res.json({ success: true, data: typeRequirements });
}));

export default router;
