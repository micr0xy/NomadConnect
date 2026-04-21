const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createFollowNotification, createFollowBackNotification } = require('./notification.controller');
const { sendForgotPasswordEmail } = require('../services/email.service');

/* Create JWT token with user data */
const generateToken = (userId, userEmail) => {
  return jwt.sign(
    { id: userId, email: userEmail },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

/* Set secure token cookie */
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

/* Decode Google credential (JWT) payload without external dependency */
const decodeGoogleCredentialPayload = (credential) => {
  if (!credential || typeof credential !== 'string') {
    return null;
  }

  const parts = credential.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (_) {
    return null;
  }
};

/* Register new user with email */
exports.signup = async (req, res) => {
  try {
    const firstName = String(req.body.firstName || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    /* Check all required fields provided */
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    /* Verify passwords match */
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    /* Enforce minimum password length */
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    /* Check duplicate email */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    /* Insert new user to database */
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

/* Authenticate user and set token */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').toLowerCase();

    /* Require email and password */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    /* Get admin email from environment */
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

    /* Check if admin env login */
    const isEnvAdminLogin = normalizedEmail === adminEmail && password === adminPassword;

    /* Verify password or allow admin override */
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

    /* Generate JWT token */
    const token = generateToken(user._id, user.email);

    /* Set token in cookie */
    setTokenCookie(res, token);

    /* Return user data without password */
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

/* Generate temporary password via email */
exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    /* Require email address */
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    /* Validate email format */
    /* Validate email format */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a new password has been sent to the registered email.',
      });
    }

    /* Generate random temp password */
    /* Generate random temp password */
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

/* Update user password with verification */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    /* Require new password fields */
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password and confirm password',
      });
    }

    /* Check new password length */
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    /* Verify new passwords match */
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

    const hasExistingPassword = Boolean(user.passwordHash);

    if (hasExistingPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required',
        });
      }

      /* Verify current password correct */
      const passwordMatches = await user.matchPassword(currentPassword);
      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }
    }

    /* Update with new password */
    user.passwordHash = newPassword;
    if (user.authProvider !== 'email') {
      user.authProvider = 'email';
    }
    await user.save();

    return res.json({
      success: true,
      message: hasExistingPassword ? 'Password updated successfully' : 'Password set successfully',
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

/* Login with admin credentials */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Require both email password */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nomadconnect.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    /* Validate admin credentials */
    if (email.toLowerCase() !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    let user = await User.findOne({ email: adminEmail });
    /* Create admin if not exists */
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
    /* Set auth token */
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

/* Clear user authentication token */
/* Clear user authentication token */
exports.logout = (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    /* Remove token from browser */
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

/* Verify user token validity */
exports.checkauth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    /* Return user if found */
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

/* Fetch public user profile */
exports.getPublicProfileByEmail = async (req, res) => {
  try {
    const profileEmail = decodeURIComponent(String(req.params.email || '')).toLowerCase().trim();

    /* Check email parameter exists */
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

    /* Build public profile object */
    /* Build public profile object */
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

/* Handle Google OAuth authentication */
exports.googleAuth = async (req, res) => {
  try {
    let { googleId, email, firstName, lastName, picture, credential } = req.body;

    if ((!googleId || !email) && credential) {
      const decoded = decodeGoogleCredentialPayload(credential);
      if (decoded) {
        googleId = googleId || decoded.sub;
        email = email || decoded.email;
        firstName = firstName || decoded.given_name || decoded.name || '';
        lastName = lastName || decoded.family_name || '';
        picture = picture || decoded.picture || null;
      }
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedGoogleId = String(googleId || '').trim();

    /* Require Google ID and email */
    if (!normalizedGoogleId || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing Google credentials',
      });
    }

    /* Find existing user by email or googleId */
    const lookupConditions = [{ email: normalizedEmail }, { googleId: normalizedGoogleId }];
    let user = await User.findOne({ $or: lookupConditions });

    if (user?.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account is blocked by admin',
      });
    }

    /* Link Google ID to existing */
    if (user) {
      let shouldSave = false;

      if (user.email !== normalizedEmail) {
        user.email = normalizedEmail;
        shouldSave = true;
      }

      if (!user.googleId) {
        user.googleId = normalizedGoogleId;
        shouldSave = true;
      }

      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        shouldSave = true;
      }

      if (!user.profileImage && picture) {
        user.profileImage = picture;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    /* Create new user from Google */
    } else {
      /* Create new user from Google */
      user = await User.create({
        firstName: firstName || normalizedEmail.split('@')[0],
        lastName: lastName || '',
        email: normalizedEmail,
        googleId: normalizedGoogleId,
        authProvider: 'google',
        profileImage: picture || null,
      });
    }

    const token = generateToken(user._id, user.email);

    setTokenCookie(res, token);

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

/* Update user profile information */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    /* Check user exists */
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

    /* Remove duplicates from arrays */
    /* Remove duplicates from arrays */
    const normalizeStringArray = (value, maxItems = 12) => {
      if (!Array.isArray(value)) {
        return undefined;
      }

      return [...new Set(value
        .map((item) => String(item || '').trim())
        .filter(Boolean))]
        .slice(0, maxItems);
    };

    /* Update first name if provided */
    if (firstName !== undefined) {
      user.firstName = String(firstName).trim() || user.firstName;
    }

    /* Update last name if provided */
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

    /* Set profile theme from allowed */
    /* Set profile theme from allowed */
    if (profileTheme !== undefined) {
      const allowedThemes = new Set(['sunset', 'ocean', 'forest', 'aurora']);
      const selectedTheme = String(profileTheme || '').trim().toLowerCase();
      if (allowedThemes.has(selectedTheme)) {
        user.profileTheme = selectedTheme;
      }
    }

    /* Update age with bounds */
    /* Update age with bounds */
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

    /* Update travel styles array */
    /* Update travel styles array */
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

    /* Update visited countries list */
    /* Update visited countries list */
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

/* Get all users sorted by date */
/* Get all users sorted by date */
exports.listUsers = async (req, res) => {
  try {
    /* Fetch and sort users */
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

/* Block or unblock user account */
exports.setUserBlockStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    /* Validate boolean status */
    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isBlocked boolean is required',
      });
    }

    /* Prevent admin self-block */
    if (String(userId) === String(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot block own account',
      });
    }

    /* Find target user */
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

/* Add user to followers list */
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    /* Prevent self-follow */
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

    if (currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user',
      });
    }

    /* Check if follow is mutual */
    const isFollowBack = (userToFollow.following || []).some((id) => String(id) === String(currentUserId));

    /* Add to following list */
    currentUser.following.push(userId);
    await currentUser.save();

    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

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

/* Remove user from followers */
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    /* Prevent self-unfollow */
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

    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user',
      });
    }

    /* Remove from following */
    currentUser.following = currentUser.following.filter((id) => String(id) !== String(userId));
    await currentUser.save();

    /* Remove from followers */
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
