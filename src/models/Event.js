const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      minlength: [3, 'Title must be at least 3 characters'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: ['meetup', 'travel', 'adventure', 'cultural', 'food', 'sports', 'other'],
      lowercase: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Event start time is required'],
      validate: {
        validator: function (value) {
          if (!this.isModified('startTime')) {
            return true;
          }
          return value > new Date();
        },
        message: 'Event start time must be in the future',
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Event location is required'],
        validate: {
          validator: function (value) {
            return (
              Array.isArray(value) &&
              value.length === 2 &&
              value[0] >= -180 &&
              value[0] <= 180 &&
              value[1] >= -90 &&
              value[1] <= 90
            );
          },
          message: 'Location coordinates must be valid [longitude, latitude]',
        },
      },
    },
    maxParticipants: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          return value === null || value >= 2;
        },
        message: 'Max participants must be at least 2 or null',
      },
    },
    createdByEmail: {
      type: String,
      required: [true, 'Creator email is required'],
      trim: true,
      lowercase: true,
    },
    participants: [
      {
        userEmail: {
          type: String,
          required: true,
          lowercase: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

eventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);
