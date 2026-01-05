import express from 'express';
import multer from 'multer';
import { asyncHandler } from '../services/errorHandler.js';
import { extractTextFromImage } from '../services/geminiService.js';
import { readData } from '../data/dataStore.js';

const router = express.Router();

// Configure multer for memory storage (for OCR processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
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
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_FILE', message: 'No document uploaded' }
    });
  }

  const base64Image = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const extractedData = await extractTextFromImage(base64Image, mimeType);

    res.json({
      success: true,
      data: {
        extracted: extractedData,
        confidence: extractedData.rawText ? 'low' : 'high',
        message: extractedData.rawText 
          ? 'Could only extract raw text. Please verify the details.'
          : 'Successfully extracted policy details.'
      }
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OCR_FAILED',
        message: 'Could not extract text from document. Please enter details manually.'
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
