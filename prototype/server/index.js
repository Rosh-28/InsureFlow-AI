import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Also try loading from parent directory just in case
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// MongoDB
import { connectMongoDB } from './data/mongoConnection.js';

// Routes
import claimsRouter from './routes/claims.js';
import policiesRouter from './routes/policies.js';
import chatRouter from './routes/chat.js';
import ttsRouter from './routes/tts.js';
import authRouter from './routes/auth.js';

// Error handler
import { errorHandler } from './services/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/claims', claimsRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/tts', ttsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server after MongoDB connection
const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

export default app;
