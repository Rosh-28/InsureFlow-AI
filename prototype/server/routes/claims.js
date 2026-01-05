import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../services/errorHandler.js';
import { runClaimProcessingGraph } from '../agents/graph.js';
import { readData, writeData } from '../data/dataStore.js';

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
  const claims = await readData('claims');
  
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
  let claims = await readData('claims');

  if (status && status !== 'all') {
    claims = claims.filter(c => c.status === status);
  }
  if (type) {
    claims = claims.filter(c => c.type === type);
  }
  if (userId) {
    claims = claims.filter(c => c.userId === userId);
  }

  // Sort by date descending
  claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, data: claims });
}));

// Get single claim by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const claims = await readData('claims');
  const claim = claims.find(c => c.id === req.params.id);

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
  const { userId, policyId, type, description, claimAmount, policyData } = req.body;
  
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
  const claims = await readData('claims');
  claims.push(claim);
  await writeData('claims', claims);

  res.status(201).json({ success: true, data: claim });
}));

// Update claim status (admin action)
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status, note, reviewedBy } = req.body;
  const claims = await readData('claims');
  const claimIndex = claims.findIndex(c => c.id === req.params.id);

  if (claimIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Claim not found' }
    });
  }

  claims[claimIndex].status = status;
  claims[claimIndex].updatedAt = new Date().toISOString();
  claims[claimIndex].reviewedBy = reviewedBy;
  claims[claimIndex].statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Status changed to ${status}`,
    by: reviewedBy
  });

  await writeData('claims', claims);

  res.json({ success: true, data: claims[claimIndex] });
}));

export default router;
