/**
 * @file settingsRoutes.js
 * @description Defines settings API routes.
 */

const express = require("express");
const router = express.Router();

const settingsController = require("../controllers/settingsController");

/**
 * @route GET /api/settings
 * @desc Get settings
 */
router.get("/", settingsController.getSettings);

/**
 * @route PUT /api/settings
 * @desc Update profile/theme settings
 */
router.put("/", settingsController.updateSettings);

/**
 * @route PUT /api/settings/password
 * @desc Change user password
 */
router.put("/password", settingsController.changePassword);

/**
 * @route DELETE /api/settings/account
 * @desc Delete own account
 */
router.delete("/account", settingsController.deleteAccount);

module.exports = router;