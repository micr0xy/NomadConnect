const jwt = require('jsonwebtoken');
const User = require('../models/User');

/* Verify JWT token from request */
const verifyToken = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    /* Check token exists */
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('email role isBlocked');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account is blocked by admin',
      });
    }

    req.userId = decoded.id;
    req.userEmail = user.email;
    req.userRole = user.role || 'user';

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message,
    });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  return next();
};

module.exports = { verifyToken, verifyAdmin };
