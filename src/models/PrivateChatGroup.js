const mongoose = require('mongoose');

const privateChatGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isPrivate: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      text: {
        type: String,
        default: '',
      },
      sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sentAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
privateChatGroupSchema.index({ participants: 1 });
privateChatGroupSchema.index({ createdBy: 1 });

module.exports = mongoose.model('PrivateChatGroup', privateChatGroupSchema);
