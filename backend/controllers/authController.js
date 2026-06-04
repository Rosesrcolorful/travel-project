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
  const userId = Number(req.header("x-user-id"));

  if (!userId) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing user id.",
        details: {
          header: "x-user-id"
        }
      }
    });
  }

  const user = users.find((u) => u.userId === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: "USER_NOT_FOUND",
        message: "User not found.",
        details: {
          userId
        }
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      userId: user.userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userRole: user.userRole
    },
    error: null
  });
};