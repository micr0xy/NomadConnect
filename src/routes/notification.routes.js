const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
} = require('../controllers/notification.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getNotifications);
router.patch('/:notificationId/read', verifyToken, markAsRead);
router.patch('/read-all', verifyToken, markAllAsRead);
router.delete('/:notificationId', verifyToken, deleteNotification);
router.post('/admin/broadcast', verifyToken, verifyAdmin, broadcastNotification);

module.exports = router;
