const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * Protected Routes
 */
router.get('/', verifyToken, getNotifications);
router.patch('/:notificationId/read', verifyToken, markAsRead);
router.patch('/read-all', verifyToken, markAllAsRead);
router.delete('/:notificationId', verifyToken, deleteNotification);

module.exports = router;
