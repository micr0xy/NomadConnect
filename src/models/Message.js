const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
    },
    userName: {
      type: String,
      default: 'Anonymous',
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      minlength: [1, 'Message cannot be empty'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for fast queries by eventId
messageSchema.index({ eventId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
