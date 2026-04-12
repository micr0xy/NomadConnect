const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  adminLogin,
  logout,
  checkauth,
  googleAuth,
  updateProfile,
  getPublicProfileByEmail,
  listUsers,
  setUserBlockStatus,
  followUser,
  unfollowUser,
} = require('../controllers/auth.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

/**
 * Public Routes
 */
router.post('/signup', signup);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/logout', logout);
router.post('/google', googleAuth);

/**
 * Protected Routes
 */
router.get('/checkauth', verifyToken, checkauth);
router.put('/profile', verifyToken, updateProfile);
router.get('/profile/by-email/:email', verifyToken, getPublicProfileByEmail);
router.post('/follow/:userId', verifyToken, followUser);
router.post('/unfollow/:userId', verifyToken, unfollowUser);

/**
 * Admin Routes
 */
router.get('/admin/users', verifyToken, verifyAdmin, listUsers);
router.patch('/admin/users/:userId/block', verifyToken, verifyAdmin, setUserBlockStatus);

module.exports = router;
