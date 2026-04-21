const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * GET NOTIFICATIONS - Fetch notifications for current user
 * GET /api/notifications
 * Protected route - requires valid token
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    const currentUser = await User.findById(userId).select('following followers').lean();
    const followingSet = new Set((currentUser?.following || []).map((id) => String(id)));
    const followersSet = new Set((currentUser?.followers || []).map((id) => String(id)));

    const notifications = await Notification.find({ recipientId: userId })
      .populate('senderId', 'firstName lastName profileImage email')
      .populate('targetId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const notificationsWithFollowState = notifications.map((notification) => {
      const serialized = notification.toObject();
      const senderId = serialized?.senderId?._id || serialized?.senderId;
      return {
        ...serialized,
        isFollowingSender: followingSet.has(String(senderId || '')),
        isFollowedBySender: followersSet.has(String(senderId || '')),
      };
    });

    const totalCount = await Notification.countDocuments({ recipientId: userId });
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    return res.json({
      success: true,
      notifications: notificationsWithFollowState,
      totalCount,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

/**
 * MARK AS READ - Mark notification as read
 * PATCH /api/notifications/:notificationId/read
 * Protected route - requires valid token
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    if (String(notification.recipientId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification',
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message,
    });
  }
};

/**
 * MARK ALL AS READ - Mark all notifications as read
 * PATCH /api/notifications/read-all
 * Protected route - requires valid token
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    return res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notifications',
      error: error.message,
    });
  }
};

/**
 * DELETE NOTIFICATION - Delete a notification
 * DELETE /api/notifications/:notificationId
 * Protected route - requires valid token
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    if (String(notification.recipientId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification',
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    return res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

/**
 * ADMIN BROADCAST NOTIFICATION - Send custom notification to all registered users
 * POST /api/notifications/admin/broadcast
 * Protected admin route
 */
exports.broadcastNotification = async (req, res) => {
  try {
    const senderId = req.userId;
    const title = String(req.body.title || '').trim();
    const message = String(req.body.message || '').trim();
    const imageUrl = String(req.body.imageUrl || '').trim();

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    if (imageUrl) {
      const isValidImageUrl = /^https?:\/\//i.test(imageUrl);
      if (!isValidImageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must start with http:// or https://',
        });
      }
    }

    const recipients = await User.find({ _id: { $ne: senderId } }).select('_id');
    if (!recipients.length) {
      return res.status(200).json({
        success: true,
        message: 'No recipients found',
        sentCount: 0,
      });
    }

    const notifications = recipients.map((recipient) => ({
      recipientId: recipient._id,
      senderId,
      type: 'announcement',
      title,
      imageUrl,
      targetId: senderId,
      message,
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    return res.json({
      success: true,
      message: 'Notification sent to all users',
      sentCount: notifications.length,
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message,
    });
  }
};

/**
 * CREATE FOLLOW NOTIFICATION
 * Called internally when a user follows another user
 */
exports.createFollowNotification = async (followerId, followedId) => {
  try {
    const follower = await User.findById(followerId).select('firstName lastName');
    
    const notification = await Notification.create({
      recipientId: followedId,
      senderId: followerId,
      type: 'follow',
      targetId: followerId,
      message: `${follower.firstName} ${follower.lastName} started following you`,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error('Create follow notification error:', error);
  }
};

/**
 * CREATE FOLLOW BACK NOTIFICATION
 * Called when user follows back someone already following them
 */
exports.createFollowBackNotification = async (followerId, followedId) => {
  try {
    const follower = await User.findById(followerId).select('firstName lastName');

    const notification = await Notification.create({
      recipientId: followedId,
      senderId: followerId,
      type: 'follow_back',
      targetId: followerId,
      message: `${follower.firstName} ${follower.lastName} followed you back`,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error('Create follow back notification error:', error);
  }
};

/**
 * CREATE EVENT NOTIFICATION
 * Called internally when a followed user posts an event
 */
exports.createEventNotification = async (eventId, creatorId) => {
  try {
    const creator = await User.findById(creatorId).select('firstName lastName');
    const followers = await User.findById(creatorId).select('followers');

    if (followers && followers.followers.length > 0) {
      const notifications = followers.followers.map((followerId) => ({
        recipientId: followerId,
        senderId: creatorId,
        type: 'event',
        targetId: eventId,
        message: `${creator.firstName} ${creator.lastName} posted a new event`,
        isRead: false,
      }));

      await Notification.insertMany(notifications);
    }

    return true;
  } catch (error) {
    console.error('Create event notification error:', error);
  }
};
