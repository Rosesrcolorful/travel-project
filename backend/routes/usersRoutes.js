const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

/**
 * @route GET /users
 * @desc Get all users
 */
router.get('/', usersController.getAllUsers);



/**
 * @route POST /users
 * @desc Create new user
 */
router.post('/', usersController.createUser);

router.put('/:id',usersController.updateUser);
router.delete('/:id',usersController.deleteUser);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 */
router.get('/:id', usersController.getUserById);

module.exports = router;