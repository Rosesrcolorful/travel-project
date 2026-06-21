/**
 * @file authController.js
 * @description Handles authentication-related requests such as signup, login, logout, and current user data.
 */

const { Op } = require("sequelize");
const { User } = require("../models");

const publicUserAttributes = [
  "userId",
  "username",
  "firstName",
  "lastName",
  "email",
  "userRole",
  "theme"
];

function sendSuccess(res, statusCode, data) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null
  });
}

function sendError(res, statusCode, code, message, details = {}) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details
    }
  });
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

/**
 * @desc Signup new user
 * @route POST /api/auth/signup
 * @access Public
 */
exports.signup = async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      password
    } = req.body;

    if (!username || !firstName || !lastName || !email || !password) {
      return sendError(res, 400, "VALIDATION_ERROR", "All signup fields are required.", {
        required: ["username", "firstName", "lastName", "email", "password"]
      });
    }

    if (!isValidEmail(email)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Please enter a valid email address.", {
        field: "email"
      });
    }

    if (password.length < 6) {
      return sendError(res, 400, "VALIDATION_ERROR", "Password must be at least 6 characters.", {
        field: "password"
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      const duplicateField = existingUser.username === username ? "username" : "email";

      return sendError(res, 409, "USER_ALREADY_EXISTS", `This ${duplicateField} is already taken.`, {
        field: duplicateField
      });
    }

    const newUser = await User.create({
      username,
      firstName,
      lastName,
      email,
      password,
      userRole: "user",
      theme: "light"
    });

    const safeUser = await User.findByPk(newUser.userId, {
      attributes: publicUserAttributes
    });

    return sendSuccess(res, 201, safeUser);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to create account.", {
      error: error.message
    });
  }
};

/**
 * @desc Login user by email and password
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "VALIDATION_ERROR", "Email and password are required.");
    }

    const user = await User.findOne({
      where: {
        email,
        password
      },
      attributes: publicUserAttributes
    });

    if (!user) {
      return sendError(res, 401, "LOGIN_FAILED", "Invalid email or password.");
    }

    return sendSuccess(res, 200, user);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to login.", {
      error: error.message
    });
  }
};

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 * @access Public
 */
exports.logout = (req, res) => {
  return sendSuccess(res, 200, {
    message: "Logged out successfully"
  });
};

/**
 * @desc Get current logged-in user
 * @route GET /api/users/me
 * @access Public
 */
exports.getMe = async (req, res) => {
  try {
    const userId = Number(req.header("x-user-id"));

    if (!userId) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing user id.", {
        header: "x-user-id"
      });
    }

    const user = await User.findByPk(userId, {
      attributes: publicUserAttributes
    });

    if (!user) {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found.", {
        userId
      });
    }

    return sendSuccess(res, 200, user);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to get current user.", {
      error: error.message
    });
  }
};