const express = require('express');
const router = express.Router();

const friendsController = require('../controllers/friendsController');
const roleCheck = require('../middleware/roleCheck');

/**
 * @route GET /friends
 * @desc Get all friendship records
 * @access Admin and manager only
 */
router.get(
  '/',
  roleCheck(['admin', 'manager']),
  friendsController.getAllFriends
);

/**
 * @route POST /friends
 * @desc Create a new friendship request
 * @access Admin, manager, and user
 */
router.post(
  '/',
  roleCheck(['admin', 'manager', 'user']),
  friendsController.createFriendship
);

/**
 * @route GET /friends/:userId
 * @desc Get all friends for a specific user
 * @access Public
 */
router.get('/:userId', friendsController.getFriendsByUserId);

/**
 * @route PUT /friends/:id
 * @desc Update friendship status
 * @access Admin and manager only
 */
router.put(
  '/:id',
  roleCheck(['admin', 'manager']),
  friendsController.updateFriendship
);

/**
 * @route DELETE /friends/:id
 * @desc Delete friendship by ID
 * @access Admin only
 */
router.delete(
  '/:id',
  roleCheck(['admin']),
  friendsController.deleteFriendship
);

module.exports = router;