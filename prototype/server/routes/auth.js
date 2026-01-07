import express from 'express';
import { asyncHandler } from '../services/errorHandler.js';

const router = express.Router();

// Mock users database
const users = [
  {
    id: 'user-1',
    email: 'user@example.com',
    password: 'password123',
    name: 'Aarun Kulkarni',
    role: 'user',
    phone: '+91 98765 43210'
  },
  {
    id: 'admin-1',
    email: 'admin@insureco.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    company: 'InsureCo'
  }
];

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    });
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
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
  const userId = token.split('-')[2]; // Extract user ID from mock token

  const user = users.find(u => u.id === userId || u.id === `user-${userId}` || u.id === `admin-${userId}`);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
}));

// Register (mock)
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'Email already registered' }
    });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    name,
    phone,
    role: 'user'
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    data: {
      user: userWithoutPassword,
      token: `mock-token-${newUser.id}-${Date.now()}`
    }
  });
}));

export default router;
