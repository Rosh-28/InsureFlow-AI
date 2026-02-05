import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    policyNumber: { type: String, required: true },
    userId: { type: String, required: true },
    holderName: { type: String, required: true },
    type: { type: String, enum: ['health', 'vehicle'], required: true },
    provider: { type: String },
    coverageAmount: { type: Number },
    deductible: { type: Number },
    premium: { type: Number },
    premiumAmount: { type: Number },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: { type: String, default: 'active' },
    vehicleNumber: { type: String },
    vehicleModel: { type: String },
    coverageDetails: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true,
    toJSON: { virtuals: false }
  }
);

policySchema.index({ userId: 1 });
policySchema.index({ policyNumber: 1 });

const Policy = mongoose.model('Policy', policySchema);
export default Policy;
