const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: maxAge,
  });
};

/**
 * SIGNUP - Register a new user
 * POST /api/auth/signup
 */
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

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

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user (include password field for comparison)
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const passwordMatches = await user.matchPassword(password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
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
 * LOGOUT - Clear token from cookies
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
