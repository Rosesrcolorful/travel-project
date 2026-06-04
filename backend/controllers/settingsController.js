/**
 * @file settingsController.js
 * @description Handles reading and updating user settings.
 */

const settings = require("../models/settingsMock");
const users = require("../models/usersMock");

/**
 * @desc Get current settings
 * @route GET /api/settings
 * @access Public
 */
exports.getSettings = (req, res) => {
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

  const userSettings = settings.find((item) => item.userId === userId);

  if (!userSettings) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: "SETTINGS_NOT_FOUND",
        message: "Settings not found for this user.",
        details: {
          userId
        }
      }
    });
  }

  res.status(200).json({
    success: true,
    data: userSettings,
    error: null
  });
};

/**
 * @desc Update settings
 * @route PUT /api/settings
 * @access Public
 */
exports.updateSettings = (req, res) => {
  const userId = Number(req.header("x-user-id"));
  const { username, email, theme, newPassword } = req.body;

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

  if (!username || !email || !theme) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields.",
        details: {
          required: ["username", "email", "theme"]
        }
      }
    });
  }

  const userSettings = settings.find((item) => item.userId === userId);

  if (!userSettings) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: "SETTINGS_NOT_FOUND",
        message: "Settings not found for this user.",
        details: {
          userId
        }
      }
    });
  }

  const user = users.find((item) => item.userId === userId);

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

  userSettings.username = username;
  userSettings.email = email;
  userSettings.theme = theme;

  user.username = username;
  user.email = email;

  if (newPassword && newPassword.trim() !== "") {
    user.password = newPassword;
  }

  user.updateDate = new Date().toISOString();

  res.status(200).json({
    success: true,
    data: {
      ...userSettings,
      passwordChanged: Boolean(newPassword && newPassword.trim() !== "")
    },
    error: null
  });
};