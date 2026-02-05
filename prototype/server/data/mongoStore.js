import Claim from './models/Claim.js';
import Policy from './models/Policy.js';
import User from './models/User.js';

// Helper to get Model by key
const getModelByKey = (key) => {
  switch (key) {
    case 'claims': return Claim;
    case 'policies': return Policy;
    case 'users': return User;
    default: throw new Error(`Unknown data key: ${key}`);
  }
};

/**
 * Legacy support: Read all data for a key
 * @param {string} key - 'claims' | 'policies' | 'users'
 * @returns {Promise<Array>}
 */
export const readData = async (key) => {
  const Model = getModelByKey(key);
  return await Model.find({}).lean();
};

/**
 * Legacy support: Replace all documents for a key
 * @param {string} key - 'claims' | 'policies' | 'users'
 * @param {Array} data - array of documents
 */
export const writeData = async (key, data) => {
  if (!Array.isArray(data)) {
    throw new Error('writeData expects an array');
  }
  const Model = getModelByKey(key);
  await Model.deleteMany({});
  if (data.length > 0) {
    await Model.insertMany(data);
  }
};

// --- Modern Mongoose-native helpers ---

// Claims
export const getClaims = (filter = {}) => Claim.find(filter).sort({ createdAt: -1 }).lean();
export const getClaimById = (id) => Claim.findOne({ id }).lean();
export const createClaim = (data) => Claim.create(data);
export const updateClaim = (id, update) => Claim.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();

// Policies
export const getPolicies = (filter = {}) => Policy.find(filter).lean();
export const getPolicyById = (id) => Policy.findOne({ $or: [{ id }, { policyNumber: id }] }).lean();

// Users
export const getUserById = (id) => User.findOne({ id }).lean();
export const getUserByEmail = (email) => User.findOne({ email }).select('+password');

export default {
  readData,
  writeData,
  getClaims,
  getClaimById,
  createClaim,
  updateClaim,
  getPolicies,
  getPolicyById,
  getUserById,
  getUserByEmail,
  models: { Claim, Policy, User }
};

