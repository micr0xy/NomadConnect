const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createFollowNotification, createFollowBackNotification } = require('./notification.controller');
const { sendForgotPasswordEmail } = require('../services/email.service');

// Helper function to generate JWT token
const generateToken = (userId, userEmail) => {
  return jwt.sign(
    { id: userId, email: userEmail },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Helper function to set token in cookies
const setTokenCookie = (res, token) => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: maxAge,
  });
};

/**
 * SIGNUP - Register a new user
 * POST /api/auth/signup
 */
exports.signup = async (req, res) => {
  try {
    const firstName = String(req.body.firstName || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password,
      authProvider: 'email',
    });

    // Generate JWT token
    const token = generateToken(user._id, user.email);

    // Set token in cookie
    setTokenCookie(res, token);

    // Return user data without password
    const userWithoutPassword = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    if (error?.name === 'ValidationError') {
      const validationMessage = Object.values(error.errors || {})
        .map((entry) => entry.message)
        .join(', ') || 'Invalid signup data';

      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: error.message,
    });
  }
};

/**
 * LOGIN - Authenticate user and set token
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase();

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user (include password field for comparison)
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nomadconnect.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user && normalizedEmail === adminEmail && password === adminPassword) {
      user = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        passwordHash: adminPassword,
        authProvider: 'email',
        role: 'admin',
        isBlocked: false,
      });

      user = await User.findOne({ email: adminEmail }).select('+passwordHash');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account is blocked by admin',
      });
    }

    const isEnvAdminLogin = normalizedEmail === adminEmail && password === adminPassword;

    // Check password (or allow env admin credential override)
    const passwordMatches = isEnvAdminLogin ? true : await user.matchPassword(password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (isEnvAdminLogin && user.role !== 'admin') {
      user.role = 'admin';
      user.isBlocked = false;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email);

    // Set token in cookie
    setTokenCookie(res, token);

    // Return user data without password
    const userWithoutPassword = user.toJSON();

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

/**
 * FORGOT PASSWORD - Generate a temporary password and send it via email
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    const user = await User.findOne({ email });

    // Avoid revealing whether an email exists in the system.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a new password has been sent to the registered email.',
      });
    }

    const temporaryPassword = crypto
      .randomBytes(9)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12);

    user.passwordHash = temporaryPassword;
    await user.save();

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Traveler';
    await sendForgotPasswordEmail({
      toEmail: user.email,
      temporaryPassword,
      userName,
    });

    return res.status(200).json({
      success: true,
      message: 'If an account exists, a new password has been sent to the registered email.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message,
    });
  }
};

/**
 * CHANGE PASSWORD - Update the current user's password after verifying the old one
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password, new password, and confirm password',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.authProvider !== 'email' || !user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'Password change is only available for email accounts',
      });
    }

    const passwordMatches = await user.matchPassword(currentPassword);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

/**
 * ADMIN LOGIN - Authenticate admin via credentials from env
 * POST /api/auth/admin/login
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nomadconnect.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    if (email.toLowerCase() !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    let user = await User.findOne({ email: adminEmail });
    if (!user) {
      user = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        passwordHash: adminPassword,
        authProvider: 'email',
        role: 'admin',
      });
    } else if (user.role !== 'admin') {
      user.role = 'admin';
      user.isBlocked = false;
      await user.save();
    }

    const token = generateToken(user._id, user.email);
    setTokenCookie(res, token);

    return res.json({
      success: true,
      message: 'Admin login successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message,
    });
  }
};

/**
 * LOGOUT - Clear token from cookies
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

/**
 * CHECKAUTH - Verify token and return user data
 * GET /api/auth/checkauth
 * Protected route - requires valid token in cookies
 */
exports.checkauth = async (req, res) => {
  try {
    // req.userId is set by verifyToken middleware
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('CheckAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error.message,
    });
  }
};

/**
 * GET PUBLIC PROFILE BY EMAIL - Return safe profile fields for profile visit pages
 * GET /api/auth/profile/by-email/:email
 * Protected route - requires valid token
 */
exports.getPublicProfileByEmail = async (req, res) => {
  try {
    const profileEmail = decodeURIComponent(String(req.params.email || '')).toLowerCase().trim();

    if (!profileEmail) {
      return res.status(400).json({
        success: false,
        message: 'Profile email is required',
      });
    }

    const user = await User.findOne({ email: profileEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const publicProfile = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      profileImage: user.profileImage,
      age: user.age,
      location: user.location,
      instagramHandle: user.instagramHandle,
      travelStyles: user.travelStyles,
      interests: user.interests,
      languages: user.languages,
      countriesVisited: user.countriesVisited,
      upcomingTrips: user.upcomingTrips,
      photos: user.photos,
      isVerified: user.isVerified,
      coverImage: user.coverImage,
      followers: user.followers || [],
      following: user.following || [],
      followersCount: (user.followers || []).length,
      followingCount: (user.following || []).length,
    };

    return res.json({
      success: true,
      user: publicProfile,
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

/**
 * GOOGLE AUTH - Handle Google OAuth signup/login
 * POST /api/auth/google
 */
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, picture } = req.body;

    // Validation
    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing Google credentials',
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update googleId if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // Create new user with Google OAuth
      user = await User.create({
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        email,
        googleId,
        authProvider: 'google',
        profileImage: picture || null,
        // No password hash for Google OAuth users
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email);

    // Set token in cookie
    setTokenCookie(res, token);

    // Return user data
    const userWithoutPassword = user.toJSON();

    res.json({
      success: true,
      message: 'Google authentication successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message,
    });
  }
};

/**
 * UPDATE PROFILE - Update editable profile fields
 * PUT /api/auth/profile
 * Protected route - requires valid token in cookies
 */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const {
      firstName,
      lastName,
      bio,
      profileImage,
      coverImage,
      profileTheme,
      age,
      location,
      instagramHandle,
      travelStyles,
      interests,
      languages,
      countriesVisited,
      upcomingTrips,
      photos,
    } = req.body;

    const normalizeStringArray = (value, maxItems = 12) => {
      if (!Array.isArray(value)) {
        return undefined;
      }

      return [...new Set(value
        .map((item) => String(item || '').trim())
        .filter(Boolean))]
        .slice(0, maxItems);
    };

    if (firstName !== undefined) {
      user.firstName = String(firstName).trim() || user.firstName;
    }

    if (lastName !== undefined) {
      user.lastName = String(lastName).trim() || user.lastName;
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim().slice(0, 400);
    }

    if (profileImage !== undefined) {
      const value = String(profileImage || '').trim();
      user.profileImage = value || null;
    }

    if (coverImage !== undefined) {
      const value = String(coverImage || '').trim();
      user.coverImage = value || null;
    }

    if (profileTheme !== undefined) {
      const allowedThemes = new Set(['sunset', 'ocean', 'forest', 'aurora']);
      const selectedTheme = String(profileTheme || '').trim().toLowerCase();
      if (allowedThemes.has(selectedTheme)) {
        user.profileTheme = selectedTheme;
      }
    }

    if (age !== undefined) {
      const parsed = Number(age);
      user.age = Number.isFinite(parsed) ? Math.max(18, Math.min(120, parsed)) : null;
    }

    if (location !== undefined) {
      user.location = String(location).trim().slice(0, 80);
    }

    if (instagramHandle !== undefined) {
      user.instagramHandle = String(instagramHandle).replace('@', '').trim().slice(0, 40);
    }

    const normalizedTravelStyles = normalizeStringArray(travelStyles);
    if (normalizedTravelStyles !== undefined) {
      user.travelStyles = normalizedTravelStyles;
    }

    const normalizedInterests = normalizeStringArray(interests);
    if (normalizedInterests !== undefined) {
      user.interests = normalizedInterests;
    }

    const normalizedLanguages = normalizeStringArray(languages);
    if (normalizedLanguages !== undefined) {
      user.languages = normalizedLanguages;
    }

    const normalizedCountries = normalizeStringArray(countriesVisited, 30);
    if (normalizedCountries !== undefined) {
      user.countriesVisited = normalizedCountries;
    }

    const normalizedTrips = normalizeStringArray(upcomingTrips, 10);
    if (normalizedTrips !== undefined) {
      user.upcomingTrips = normalizedTrips;
    }

    const normalizedPhotos = normalizeStringArray(photos, 6);
    if (normalizedPhotos !== undefined) {
      user.photos = normalizedPhotos;
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: error.message,
    });
  }
};

/**
 * ADMIN - List users
 * GET /api/auth/admin/users
 */
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      users: users.map((user) => user.toJSON()),
    });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

/**
 * ADMIN - Block/unblock user
 * PATCH /api/auth/admin/users/:userId/block
 */
exports.setUserBlockStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isBlocked boolean is required',
      });
    }

    if (String(userId) === String(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot block own account',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin account cannot be blocked',
      });
    }

    user.isBlocked = isBlocked;
    await user.save();

    return res.json({
      success: true,
      message: isBlocked ? 'User blocked' : 'User unblocked',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Set user block status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update block status',
      error: error.message,
    });
  }
};

/**
 * FOLLOW USER - Add user to current user's following list
 * POST /api/auth/follow/:userId
 * Protected route - requires valid token
 */
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    if (String(userId) === String(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself',
      });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found',
      });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user',
      });
    }

    const isFollowBack = (userToFollow.following || []).some((id) => String(id) === String(currentUserId));

    // Add to following list
    currentUser.following.push(userId);
    await currentUser.save();

    // Add to followers list
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    // Create follow or follow-back notification
    if (isFollowBack) {
      await createFollowBackNotification(currentUserId, userId);
    } else {
      await createFollowNotification(currentUserId, userId);
    }

    return res.json({
      success: true,
      message: 'User followed successfully',
      user: currentUser.toJSON(),
    });
  } catch (error) {
    console.error('Follow user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to follow user',
      error: error.message,
    });
  }
};

/**
 * UNFOLLOW USER - Remove user from current user's following list
 * POST /api/auth/unfollow/:userId
 * Protected route - requires valid token
 */
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    if (String(userId) === String(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unfollow yourself',
      });
    }

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found',
      });
    }

    // Check if following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user',
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter((id) => String(id) !== String(userId));
    await currentUser.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => String(id) !== String(currentUserId));
    await userToUnfollow.save();

    return res.json({
      success: true,
      message: 'User unfollowed successfully',
      user: currentUser.toJSON(),
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unfollow user',
      error: error.message,
    });
  }
};
