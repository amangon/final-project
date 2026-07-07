const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).populate('plan');

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    if (!user.isActive || user.isSuspended) {
      return res.status(401).json({ error: 'Account is suspended or deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required.' });
  }
};

const getJwtSecret = () => process.env.JWT_SECRET || 'local-dev-secret-key-for-interview-ai-123456';
const getRefreshJwtSecret = () => process.env.JWT_REFRESH_SECRET || 'local-refresh-secret-key-for-interview-ai-654321';

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, getRefreshJwtSecret(), {
    expiresIn: '30d'
  });
};

module.exports = { authenticate, isAdmin, generateToken, generateRefreshToken };