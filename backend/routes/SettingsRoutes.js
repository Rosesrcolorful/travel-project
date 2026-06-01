/**
 * @file settingsRoutes.js
 * @description Defines settings API routes.
 */

const express = require('express');
const router = express.Router();

const settingsController = require('../controllers/settingsController');

/**
 * @route GET /api/settings
 * @desc Get settings
 */
router.get('/', settingsController.getSettings);

/**
 * @route PUT /api/settings
 * @desc Update settings
 */
router.put('/', settingsController.updateSettings);

module.exports = router;