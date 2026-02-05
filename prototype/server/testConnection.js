import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insureflow';

console.log('Attempting to connect to MongoDB...');
console.log('URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide only password

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        });
        console.log('✅ Connection successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.reason) {
            console.error('Error Reason:', JSON.stringify(error.reason, null, 2));
        }
        process.exit(1);
    }
};

run();
