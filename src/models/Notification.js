const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['follow', 'event', 'follow_back', 'announcement'],
      required: true,
    },
    title: {
      type: String,
      default: '',
      maxlength: 120,
    },
    imageUrl: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: function() {
        return this.type === 'event' ? 'Event' : 'User';
      },
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionPerformed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
