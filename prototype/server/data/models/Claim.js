import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: String,
  timestamp: String,
  note: String,
  by: String
}, { _id: false });

const claimSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    policyId: { type: String, required: true },
    type: { type: String, enum: ['health', 'vehicle'], required: true },
    description: { type: String },
    claimAmount: { type: Number, default: 0 },
    policyData: { type: mongoose.Schema.Types.Mixed },
    documents: { type: [mongoose.Schema.Types.Mixed], default: [] },
    status: { type: String, default: 'processing' },
    statusHistory: { type: [statusHistorySchema], default: [] },
    verification: { type: mongoose.Schema.Types.Mixed },
    riskAssessment: { type: mongoose.Schema.Types.Mixed },
    reviewedBy: { type: String },
    processingError: { type: String },
    createdAt: { type: String },
    updatedAt: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: false }
  }
);

claimSchema.index({ userId: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ createdAt: -1 });

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
