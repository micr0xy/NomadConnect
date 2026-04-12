const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrivateChatGroup',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderProfileImage: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
directMessageSchema.index({ groupId: 1, createdAt: 1 });
directMessageSchema.index({ senderId: 1 });

module.exports = mongoose.model('DirectMessage', directMessageSchema);
