import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple JSON file-based data store for prototype
const dataFiles = {
  claims: 'claims.json',
  policies: 'policies.json',
  users: 'users.json'
};

// Ensure data directory and files exist
const initDataStore = async () => {
  try {
    await fs.access(__dirname);
  } catch {
    await fs.mkdir(__dirname, { recursive: true });
  }

  for (const [key, filename] of Object.entries(dataFiles)) {
    const filePath = path.join(__dirname, filename);
    try {
      await fs.access(filePath);
    } catch {
      // Create empty file with initial data
      const initialData = getInitialData(key);
      await fs.writeFile(filePath, JSON.stringify(initialData, null, 2));
    }
  }
};

// Initial mock data
const getInitialData = (key) => {
  switch (key) {
    case 'claims':
      return [
        {
          id: 'CLM-1734700000001',
          userId: 'user-1',
          policyId: 'POL-HEALTH-001',
          type: 'health',
          description: 'Hospital admission for viral fever treatment',
          claimAmount: 25000,
          status: 'approved',
          statusHistory: [
            { status: 'submitted', timestamp: '2024-12-01T10:00:00Z', note: 'Claim submitted' },
            { status: 'under_review', timestamp: '2024-12-01T10:05:00Z', note: 'AI processing complete' },
            { status: 'approved', timestamp: '2024-12-02T14:30:00Z', note: 'Claim approved', by: 'admin-1' }
          ],
          riskAssessment: { riskScore: 2, riskLevel: 'low', recommendation: 'approve' },
          createdAt: '2024-12-01T10:00:00Z',
          updatedAt: '2024-12-02T14:30:00Z'
        },
        {
          id: 'CLM-1734700000002',
          userId: 'user-1',
          policyId: 'POL-VEHICLE-001',
          type: 'vehicle',
          description: 'Minor accident - front bumper damage',
          claimAmount: 15000,
          status: 'under_review',
          statusHistory: [
            { status: 'submitted', timestamp: '2024-12-15T09:00:00Z', note: 'Claim submitted' },
            { status: 'under_review', timestamp: '2024-12-15T09:10:00Z', note: 'AI processing complete' }
          ],
          riskAssessment: { riskScore: 5, riskLevel: 'medium', recommendation: 'review' },
          createdAt: '2024-12-15T09:00:00Z',
          updatedAt: '2024-12-15T09:10:00Z'
        },
        {
          id: 'CLM-1734700000003',
          userId: 'user-1',
          policyId: 'POL-HEALTH-001',
          type: 'health',
          description: 'Dental treatment',
          claimAmount: 8000,
          status: 'rejected',
          statusHistory: [
            { status: 'submitted', timestamp: '2024-11-20T11:00:00Z', note: 'Claim submitted' },
            { status: 'under_review', timestamp: '2024-11-20T11:05:00Z', note: 'AI processing complete' },
            { status: 'rejected', timestamp: '2024-11-21T16:00:00Z', note: 'Dental not covered under policy', by: 'admin-1' }
          ],
          riskAssessment: { riskScore: 3, riskLevel: 'low', recommendation: 'review' },
          createdAt: '2024-11-20T11:00:00Z',
          updatedAt: '2024-11-21T16:00:00Z'
        }
      ];

    case 'policies':
      return [
        {
          id: 'POL-HEALTH-001',
          policyNumber: 'HLTH-2024-78901',
          userId: 'user-1',
          holderName: 'Aarun Kulkarni',
          type: 'health',
          provider: 'InsureCo Health',
          coverageAmount: 500000,
          deductible: 5000,
          premium: 12000,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          status: 'active',
          coverageDetails: {
            hospitalization: true,
            surgery: true,
            maternity: false,
            dental: false,
            vision: true
          }
        },
        {
          id: 'POL-VEHICLE-001',
          policyNumber: 'VEH-2024-45678',
          userId: 'user-1',
          holderName: 'Aarun Kulkarni',
          type: 'vehicle',
          provider: 'InsureCo Auto',
          vehicleNumber: 'MH-01-AB-1234',
          vehicleModel: 'Honda City 2022',
          coverageAmount: 800000,
          deductible: 2500,
          premium: 15000,
          startDate: '2025-03-15',
          endDate: '2026-03-14',
          status: 'active',
          coverageDetails: {
            thirdParty: true,
            ownDamage: true,
            theft: true,
            naturalDisaster: true,
            personalAccident: true
          }
        },
        {
          id: 'POL-HEALTH-002',
          policyNumber: 'HLTH-2023-12345',
          userId: 'user-1',
          holderName: 'Aarun Kulkarni',
          type: 'health',
          provider: 'InsureCo Health',
          coverageAmount: 300000,
          deductible: 3000,
          premium: 8000,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          status: 'expired'
        }
      ];

    case 'users':
      return [
        {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Aarun Kulkarni',
          phone: '+91 98765 43210',
          role: 'user'
        },
        {
          id: 'admin-1',
          email: 'admin@insureco.com',
          name: 'Admin User',
          role: 'admin',
          company: 'InsureCo'
        }
      ];

    default:
      return [];
  }
};

// Read data from file
export const readData = async (key) => {
  await initDataStore();
  const filePath = path.join(__dirname, dataFiles[key]);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

// Write data to file
export const writeData = async (key, data) => {
  await initDataStore();
  const filePath = path.join(__dirname, dataFiles[key]);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Initialize on module load
initDataStore().catch(console.error);

export default { readData, writeData };
