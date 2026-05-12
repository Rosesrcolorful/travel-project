const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');
const roleCheck = require('../middleware/roleCheck');

/**
 * @route GET /users
 * @desc Get all users
 * @access Public
 */
router.get('/', usersController.getAllUsers);

/**
 * @route POST /users
 * @desc Create new user
 * @access Admin only
 */
router.post('/', roleCheck(['admin']), usersController.createUser);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 * @access Public
 */
router.get('/:id', usersController.getUserById);

/**
 * @route PUT /users/:id
 * @desc Update user by ID
 * @access Admin and manager only
 */
router.put('/:id', roleCheck(['admin', 'manager']), usersController.updateUser);

/**
 * @route DELETE /users/:id
 * @desc Delete user by ID
 * @access Admin only
 */
router.delete('/:id', roleCheck(['admin']), usersController.deleteUser);

module.exports = router;