const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your last name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    passwordHash: {
      type: String,
      required: function() {
        return this.authProvider === 'email';
      },
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 400,
    },
    profileImage: {
      type: String,
      default: null,
    },
    age: {
      type: Number,
      default: null,
      min: 18,
      max: 120,
    },
    location: {
      type: String,
      default: '',
      maxlength: 80,
    },
    instagramHandle: {
      type: String,
      default: '',
      maxlength: 40,
    },
    travelStyles: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    countriesVisited: {
      type: [String],
      default: [],
    },
    upcomingTrips: {
      type: [String],
      default: [],
    },
    photos: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is new or modified
  if (!this.isModified('passwordHash')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to return user data without sensitive info
userSchema.methods.toJSON = function () {
  const { passwordHash, ...userWithoutPassword } = this.toObject();
  return userWithoutPassword;
};

module.exports = mongoose.model('User', userSchema);
