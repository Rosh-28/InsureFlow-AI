import mongoose from 'mongoose';

let isConnected = false;

export const connectMongoDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insureflow';

  if (isConnected) {
    console.log('📦 MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

export const disconnectMongoDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB disconnected');
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

export default { connectMongoDB, disconnectMongoDB };
