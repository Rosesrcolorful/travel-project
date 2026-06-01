/**
 * @file authController.js
 * @description Handles authentication-related requests such as login, logout, and current user data.
 */

const users = require('../models/usersMock');

/**
 * @desc Login user by email and password
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Email and password are required.",
        details: {}
      }
    });
  }

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      data: null,
      error: {
        code: "LOGIN_FAILED",
        message: "Invalid email or password.",
        details: {}
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      userRole: user.userRole
    },
    error: null
  });
};

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 * @access Public
 */
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    data: "Logged out successfully",
    error: null
  });
};

/**
 * @desc Get current logged-in user
 * @route GET /api/users/me
 * @access Public
 */
exports.getMe = (req, res) => {
  const user = users[0];

  res.status(200).json({
    success: true,
    data: {
      userId: user.userId,
      username: user.username,
      email: user.email,
      userRole: user.userRole
    },
    error: null
  });
};