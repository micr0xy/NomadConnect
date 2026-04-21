const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  changePassword,
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

/* User sign up */
router.post('/signup', signup);
/* User log in */
router.post('/login', login);
/* Reset password */
router.post('/forgot-password', forgotPassword);
/* Admin login */
router.post('/admin/login', adminLogin);
/* User logout */
router.post('/logout', logout);
/* Google OAuth */
router.post('/google', googleAuth);

/* Check token validity */
router.get('/checkauth', verifyToken, checkauth);
/* Update profile */
router.put('/profile', verifyToken, updateProfile);
/* Change password */
router.put('/change-password', verifyToken, changePassword);
/* Get public profile */
router.get('/profile/by-email/:email', verifyToken, getPublicProfileByEmail);
/* Follow user */
router.post('/follow/:userId', verifyToken, followUser);
/* Unfollow user */
router.post('/unfollow/:userId', verifyToken, unfollowUser);

/* List all users */
router.get('/admin/users', verifyToken, verifyAdmin, listUsers);
/* Block/unblock user */
router.patch('/admin/users/:userId/block', verifyToken, verifyAdmin, setUserBlockStatus);

module.exports = router;
