const express = require('express');
const router = express.Router();
const {
  getOrCreatePrivateGroup,
  getUserGroups,
  getGroupMessages,
  sendMessage,
  markMessagesAsRead,
} = require('../controllers/messages.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/groups/:userId', verifyToken, getOrCreatePrivateGroup);
router.get('/groups', verifyToken, getUserGroups);
router.get('/groups/:groupId/messages', verifyToken, getGroupMessages);
router.post('/groups/:groupId/send', verifyToken, sendMessage);
router.patch('/groups/:groupId/read', verifyToken, markMessagesAsRead);

module.exports = router;
