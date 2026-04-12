const PrivateChatGroup = require('../models/PrivateChatGroup');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');

/**
 * GET OR CREATE PRIVATE GROUP - Get existing group or create new one with another user
 * POST /api/messages/groups/:userId
 * Protected route
 */
exports.getOrCreatePrivateGroup = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    // Validate users
    if (String(userId) === String(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create group with yourself',
      });
    }

    const otherUser = await User.findById(userId).select('firstName lastName email');
    const currentUser = await User.findById(currentUserId).select('firstName lastName email');

    if (!otherUser || !currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if both users follow each other
    const currentUserData = await User.findById(currentUserId);
    const otherUserData = await User.findById(userId);

    const currentFollowsOther = currentUserData.following?.includes(userId);
    const otherFollowsCurrent = otherUserData.followers?.includes(currentUserId);

    if (!currentFollowsOther || !otherFollowsCurrent) {
      return res.status(403).json({
        success: false,
        message: 'Both users must follow each other to send messages',
      });
    }

    // Check if group already exists
    let group = await PrivateChatGroup.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 },
      isPrivate: true,
    }).populate('participants', 'firstName lastName email profileImage');

    // If not, create new group
    if (!group) {
      const groupName = `${currentUser.firstName} & ${otherUser.firstName}`;
      group = await PrivateChatGroup.create({
        name: groupName,
        participants: [currentUserId, userId],
        isPrivate: true,
        createdBy: currentUserId,
      });

      await group.populate('participants', 'firstName lastName email profileImage');
    }

    return res.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Get or create private group error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get or create group',
      error: error.message,
    });
  }
};

/**
 * GET ALL GROUPS FOR USER
 * GET /api/messages/groups
 * Protected route
 */
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.userId;

    const groups = await PrivateChatGroup.find({ participants: userId })
      .populate('participants', 'firstName lastName email profileImage')
      .populate('lastMessage.sentBy', 'firstName lastName')
      .sort({ 'lastMessage.sentAt': -1 })
      .lean();

    return res.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error('Get user groups error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch groups',
      error: error.message,
    });
  }
};

/**
 * GET MESSAGES IN GROUP
 * GET /api/messages/groups/:groupId/messages
 * Protected route
 */
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;
    const { limit = 30, skip = 0 } = req.query;

    // Verify user is part of group
    const group = await PrivateChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (!group.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this group',
      });
    }

    const messages = await DirectMessage.find({ groupId })
      .populate('senderId', 'firstName lastName profileImage email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const totalCount = await DirectMessage.countDocuments({ groupId });

    return res.json({
      success: true,
      messages: messages.reverse(),
      totalCount,
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

/**
 * SEND MESSAGE
 * POST /api/messages/groups/:groupId/send
 * Protected route
 */
exports.sendMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    // Verify group exists and user is participant
    const group = await PrivateChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (!group.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this group',
      });
    }

    // Get sender info
    const sender = await User.findById(userId).select('firstName lastName email profileImage');

    // Create message
    const message = await DirectMessage.create({
      groupId,
      senderId: userId,
      senderEmail: sender.email,
      senderName: `${sender.firstName} ${sender.lastName}`,
      senderProfileImage: sender.profileImage || '',
      text: text.trim(),
    });

    // Update group's last message
    await PrivateChatGroup.findByIdAndUpdate(
      groupId,
      {
        lastMessage: {
          text: text.trim(),
          sentBy: userId,
          sentAt: new Date(),
        },
      },
      { new: true }
    );

    return res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * MARK MESSAGES AS READ
 * PATCH /api/messages/groups/:groupId/read
 * Protected route
 */
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    // Verify user is part of group
    const group = await PrivateChatGroup.findById(groupId);
    if (!group || !group.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Mark all messages in group as read (for this user)
    await DirectMessage.updateMany(
      { groupId, senderId: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    return res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message,
    });
  }
};
