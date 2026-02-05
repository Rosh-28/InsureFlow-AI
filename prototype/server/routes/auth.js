import express from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../services/errorHandler.js';
import { getUserByEmail, getUserById } from '../data/mongoStore.js';
import User from '../data/models/User.js';

const router = express.Router();

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    });
  }

  const userObj = user.toJSON();

  res.json({
    success: true,
    data: {
      user: userObj,
      token: `mock-token-${user.id}-${Date.now()}`
    }
  });
}));

// Get current user (mock auth check)
router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'No authentication token provided' }
    });
  }

  const token = authHeader.split(' ')[1];
  // Token format: mock-token-{userId}-{timestamp} e.g. mock-token-user-1-1734700000
  const parts = token.split('-');
  const userId = parts.slice(2, -1).join('-');

  const user = await getUserById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }

  res.json({
    success: true,
    data: { user: user.toJSON() }
  });
}));

// Register (creates user role only)
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;

  const existing = await getUserByEmail(email);
  if (existing) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'Email already registered' }
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    id: `user-${Date.now()}`,
    email,
    password: hashedPassword,
    name: name || 'User',
    phone: phone || '',
    role: 'user'
  });

  const userObj = newUser.toJSON();

  res.status(201).json({
    success: true,
    data: {
      user: userObj,
      token: `mock-token-${newUser.id}-${Date.now()}`
    }
  });
}));

export default router;
