/**
 * @file authRoutes.js
 * @description Defines authentication API routes.
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

/**
 * @route POST /api/auth/signup
 * @desc Signup new user
 */
router.post("/signup", authController.signup);

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post("/login", authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 */
router.post("/logout", authController.logout);

module.exports = router;