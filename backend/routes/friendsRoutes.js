const express = require('express');
const router = express.Router();

const friendsController = require('../controllers/friendsController');

/**
 * @route GET /friends
 * @desc Get all friendship records
 */
router.get('/', friendsController.getAllFriends);

/**
 * @route GET /friends/search?username=...&userId=...
 * @desc Search users by username for friend requests
 */
router.get('/search', friendsController.searchUsersByUsername);

/**
 * @route GET /friends/requests/:userId
 * @desc Get pending friend requests received by a user
 */
router.get('/requests/:userId', friendsController.getPendingRequests);

/**
 * @route POST /friends
 * @desc Send a friend request
 */
router.post('/', friendsController.createFriendship);

/**
 * @route GET /friends/:userId
 * @desc Get friendship records for one user
 */
router.get('/:userId', friendsController.getFriendsByUserId);

/**
 * @route PUT /friends/:id/accept
 * @desc Accept friend request
 */
router.put('/:id/accept', friendsController.acceptFriendship);

/**
 * @route PUT /friends/:id/decline
 * @desc Decline friend request
 */
router.put('/:id/decline', friendsController.declineFriendship);

/**
 * @route PUT /friends/:id
 * @desc Update friendship status
 */
router.put('/:id', friendsController.updateFriendship);

/**
 * @route DELETE /friends/:id
 * @desc Unfriend / delete friendship record
 */
router.delete('/:id', friendsController.deleteFriendship);

module.exports = router;