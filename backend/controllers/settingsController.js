/**
 * @file settingsController.js
 * @description Handles reading and updating user settings.
 */

const settings = require('../models/settingsMock');

/**
 * @desc Get current settings
 * @route GET /api/settings
 * @access Public
 */
exports.getSettings = (req, res) => {
  res.status(200).json({
    success: true,
    data: settings,
    error: null
  });
};

/**
 * @desc Update settings
 * @route PUT /api/settings
 * @access Public
 */
exports.updateSettings = (req, res) => {
  const { username, email, theme } = req.body;

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

  settings.username = username;
  settings.email = email;
  settings.theme = theme;

  res.status(200).json({
    success: true,
    data: settings,
    error: null
  });
};