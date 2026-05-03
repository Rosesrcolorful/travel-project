const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

/**
 * @route GET /users
 * @desc Get all users
 */
router.get('/', usersController.getAllUsers);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 */
router.get('/:id', usersController.getUserById);

/**
 * @route POST /users
 * @desc Create new user
 */
router.post('/', usersController.createUser);

module.exports = router;