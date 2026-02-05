/**
 * Seed MongoDB with initial data (users, policies, claims)
 * Run: node data/seedMongo.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import User from './models/User.js';
import Policy from './models/Policy.js';
import Claim from './models/Claim.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insureflow';

const seedUsers = async () => {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log('Users already exist, skipping seed');
    return;
  }

  const hashedUserPass = await bcrypt.hash('password123', 10);
  const hashedAdminPass = await bcrypt.hash('admin123', 10);

  const users = [
    {
      id: 'user-1',
      email: 'user@example.com',
      password: hashedUserPass,
      name: 'Test User',
      phone: '+91 98765 43210',
      role: 'user'
    },
    {
      id: 'admin-1',
      email: 'admin@insureco.com',
      password: hashedAdminPass,
      name: 'Admin User',
      role: 'admin',
      company: 'InsureCo'
    }
  ];

  await User.insertMany(users);
  console.log('✅ Seeded users (user@example.com / password123, admin@insureco.com / admin123)');
};

const seedPolicies = async () => {
  const count = await Policy.countDocuments();
  if (count > 0) {
    console.log('Policies already exist, skipping seed');
    return;
  }

  const policies = [
    {
      id: 'POL-HEALTH-001',
      policyNumber: 'HLTH-2024-12345',
      userId: 'user-1',
      type: 'health',
      holderName: 'Test User',
      coverageAmount: 500000,
      premiumAmount: 15000,
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      status: 'active'
    },
    {
      id: 'POL-VEHICLE-001',
      policyNumber: 'VEH-2024-67890',
      userId: 'user-1',
      type: 'vehicle',
      holderName: 'Test User',
      coverageAmount: 1000000,
      premiumAmount: 25000,
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      status: 'active'
    }
  ];

  await Policy.insertMany(policies);
  console.log('✅ Seeded policies');
};

const seedClaims = async () => {
  try {
    const filePath = path.join(__dirname, 'claims.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const claims = JSON.parse(data);

    if (claims.length === 0) {
      console.log('No claims in JSON, skipping');
      return;
    }

    const count = await Claim.countDocuments();
    if (count > 0) {
      console.log('Claims already exist, skipping seed (use --force to replace)');
      if (process.argv.includes('--force')) {
        await Claim.deleteMany({});
        await Claim.insertMany(claims);
        console.log('✅ Replaced claims from claims.json');
      }
      return;
    }

    await Claim.insertMany(claims);
    console.log(`✅ Seeded ${claims.length} claims from claims.json`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No claims.json found, skipping claims seed');
    } else {
      throw err;
    }
  }
};

const migratePoliciesFromJson = async () => {
  try {
    const filePath = path.join(__dirname, 'policies.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const policies = JSON.parse(data);

    if (policies.length === 0) return;

    const count = await Policy.countDocuments();
    if (count === 0 && policies.length > 0) {
      await Policy.insertMany(policies);
      console.log(`✅ Migrated ${policies.length} policies from policies.json`);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
};

const main = async () => {
  console.log('🌱 Starting MongoDB seed...');
  console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    await seedUsers();
    await seedPolicies();
    await migratePoliciesFromJson();
    await seedClaims();

    console.log('\n🎉 Seed complete!');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

main();
