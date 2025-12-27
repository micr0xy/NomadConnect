const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  checkauth,
  googleAuth,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * Public Routes
 */
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleAuth);

/**
 * Protected Routes
 */
router.get('/checkauth', verifyToken, checkauth);

module.exports = router;
