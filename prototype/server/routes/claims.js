import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../services/errorHandler.js';
import { runClaimProcessingGraph } from '../agents/graph.js';
import { getClaims, getClaimById, createClaim, updateClaim } from '../data/mongoStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP and PDF are allowed.'));
    }
  }
});

// Get claim statistics (must be before /:id route)
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const claims = await getClaims();

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'under_review' || c.status === 'processing').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    totalAmount: claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0),
    approvedAmount: claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.claimAmount || 0), 0),
    byType: {
      health: claims.filter(c => c.type === 'health').length,
      vehicle: claims.filter(c => c.type === 'vehicle').length
    },
    riskDistribution: {
      low: claims.filter(c => c.riskAssessment?.riskLevel === 'low').length,
      medium: claims.filter(c => c.riskAssessment?.riskLevel === 'medium').length,
      high: claims.filter(c => c.riskAssessment?.riskLevel === 'high').length
    }
  };

  res.json({ success: true, data: stats });
}));

// Get all claims (with optional filters)
router.get('/', asyncHandler(async (req, res) => {
  const { status, type, userId } = req.query;
  const filter = {};

  if (status && status !== 'all') filter.status = status;
  if (type) filter.type = type;
  if (userId) filter.userId = userId;

  const claims = await getClaims(filter);

  res.json({ success: true, data: claims });
}));

// Get single claim by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const claim = await getClaimById(req.params.id);

  if (!claim) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Claim not found' }
    });
  }

  res.json({ success: true, data: claim });
}));

// Create new claim with document processing
router.post('/', upload.array('documents', 5), asyncHandler(async (req, res) => {
  console.log('📝 [Claims Route] New claim request body:', req.body);
  const { userId, policyId, type, description, claimAmount, policyData } = req.body;

  if (!userId || !policyId) {
    const missing = [];
    if (!userId) missing.push('userId');
    if (!policyId) missing.push('policyId');
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Missing required fields: ${missing.join(', ')}`,
        details: req.body
      }
    });
  }

  const files = req.files || [];
  const documents = files.map(f => ({
    id: uuidv4(),
    filename: f.filename,
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
    path: `/uploads/${f.filename}`
  }));

  // Create claim object
  const claim = {
    id: `CLM-${Date.now()}`,
    userId,
    policyId,
    type, // 'health' or 'vehicle'
    description,
    claimAmount: parseFloat(claimAmount) || 0,
    policyData: policyData ? JSON.parse(policyData) : null,
    documents,
    status: 'processing',
    statusHistory: [
      { status: 'submitted', timestamp: new Date().toISOString(), note: 'Claim submitted' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Run through AI agent pipeline
  try {
    const agentResult = await runClaimProcessingGraph(claim, documents);

    claim.verification = agentResult.verification;
    claim.riskAssessment = agentResult.riskAssessment;
    claim.status = agentResult.recommendedStatus || 'under_review';
    claim.statusHistory.push({
      status: claim.status,
      timestamp: new Date().toISOString(),
      note: 'AI processing complete'
    });
  } catch (error) {
    console.error('Agent processing error:', error);
    claim.status = 'under_review';
    claim.processingError = error.message;
  }

  // Save claim
  const savedClaim = await createClaim(claim);

  res.status(201).json({ success: true, data: savedClaim });
}));

// Update claim status (admin action)
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status, note, reviewedBy } = req.body;
  const updated = await updateClaim(req.params.id, {
    status,
    reviewedBy,
    updatedAt: new Date().toISOString(),
    $push: {
      statusHistory: {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status changed to ${status}`,
        by: reviewedBy
      }
    }
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Claim not found' }
    });
  }

  res.json({ success: true, data: updated });
}));

export default router;
