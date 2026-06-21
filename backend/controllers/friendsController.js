const { Op } = require('sequelize');
const { Friendship, User } = require('../models');

const userAttributes = ['userId', 'username', 'firstName', 'lastName', 'email', 'theme'];

const isValidId = (id) => {
  return !Number.isNaN(id) && Number.isInteger(id) && id > 0;
};

const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null
  });
};

const sendError = (res, statusCode, code, message, details = {}) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details
    }
  });
};

const friendshipInclude = [
  {
    model: User,
    as: 'requester',
    attributes: userAttributes
  },
  {
    model: User,
    as: 'addressee',
    attributes: userAttributes
  }
];

const formatFriendshipForUser = (friendship, currentUserId) => {
  const data = friendship.toJSON();

  return {
    ...data,
    otherUser: data.userId === currentUserId ? data.addressee : data.requester
  };
};

async function findExistingFriendship(userId, friendId) {
  return Friendship.findOne({
    where: {
      [Op.or]: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    }
  });
}

/**
 * @desc Get all friendship records
 * @route GET /friends
 */
exports.getAllFriends = async (req, res) => {
  try {
    const friendships = await Friendship.findAll({
      include: friendshipInclude,
      order: [['updateDate', 'DESC']]
    });

    return sendSuccess(res, 200, friendships);
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to get friendships.', {
      error: error.message
    });
  }
};

/**
 * @desc Get all non-declined friendships for a specific user
 * @route GET /friends/:userId
 */
exports.getFriendsByUserId = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!isValidId(userId)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user id.', {
        userId: req.params.userId
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return sendError(res, 404, 'USER_NOT_FOUND', 'User not found.', { userId });
    }

    const friendships = await Friendship.findAll({
      where: {
        status: {
          [Op.in]: ['pending', 'accepted']
        },
        [Op.or]: [
          { userId },
          { friendId: userId }
        ]
      },
      include: friendshipInclude,
      order: [['updateDate', 'DESC']]
    });

    const formattedFriendships = friendships.map((friendship) =>
      formatFriendshipForUser(friendship, userId)
    );

    return sendSuccess(res, 200, formattedFriendships);
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to get user friends.', {
      error: error.message
    });
  }
};

/**
 * @desc Search users by username so the current user can send a friend request
 * @route GET /friends/search?username=...&userId=...
 */
exports.searchUsersByUsername = async (req, res) => {
  try {
    const username = (req.query.username || "").trim();
    const currentUserId = Number(req.query.userId || req.header("x-user-id"));

    if (!username) {
      return sendError(res, 400, "VALIDATION_ERROR", "Username search is required.", {
        query: "username"
      });
    }

    if (!isValidId(currentUserId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Current user id is required.", {
        required: ["userId query parameter or x-user-id header"]
      });
    }

    const users = await User.findAll({
      where: {
        userId: {
          [Op.ne]: currentUserId
        },
        username: {
          [Op.like]: `%${username}%`
        }
      },
      attributes: userAttributes,
      order: [["username", "ASC"]],
      limit: 10
    });

    const usersWithFriendshipStatus = await Promise.all(
      users.map(async (user) => {
        const userJson = user.toJSON();

        const friendship = await findExistingFriendship(
          currentUserId,
          userJson.userId
        );

        if (!friendship) {
          return {
            ...userJson,
            friendship: null
          };
        }

        let direction = "incoming";

        if (friendship.userId === currentUserId) {
          direction = "outgoing";
        }

        return {
          ...userJson,
          friendship: {
            friendshipId: friendship.friendshipId,
            status: friendship.status,
            direction
          }
        };
      })
    );

    return sendSuccess(res, 200, usersWithFriendshipStatus);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to search users.", {
      error: error.message
    });
  }
};

/**
 * @desc Get pending friend requests received by a user
 * @route GET /friends/requests/:userId
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!isValidId(userId)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user id.', {
        userId: req.params.userId
      });
    }

    const requests = await Friendship.findAll({
      where: {
        friendId: userId,
        status: 'pending'
      },
      include: friendshipInclude,
      order: [['createDate', 'DESC']]
    });

    return sendSuccess(res, 200, requests);
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to get pending requests.', {
      error: error.message
    });
  }
};

/**
 * @desc Create a new friend request
 * @route POST /friends
 */
exports.createFriendship = async (req, res) => {
  try {
    const userId = Number(req.body.userId || req.header('x-user-id'));
    const friendId = Number(req.body.friendId);

    if (!isValidId(userId) || !isValidId(friendId)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'userId and friendId must be valid positive numbers.', {
        userId: req.body.userId || req.header('x-user-id'),
        friendId: req.body.friendId
      });
    }

    if (userId === friendId) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'A user cannot add themselves as a friend.', {
        userId,
        friendId
      });
    }

    const foundUsers = await User.findAll({
      where: {
        userId: {
          [Op.in]: [userId, friendId]
        }
      }
    });

    if (foundUsers.length !== 2) {
      return sendError(res, 404, 'USER_NOT_FOUND', 'One or both users were not found.', {
        userId,
        friendId
      });
    }

    const existingFriendship = await findExistingFriendship(userId, friendId);

    if (existingFriendship && ['pending', 'accepted'].includes(existingFriendship.status)) {
      return sendError(res, 400, 'FRIENDSHIP_ALREADY_EXISTS', 'A friendship or pending request already exists between these users.', {
        friendshipId: existingFriendship.friendshipId,
        status: existingFriendship.status
      });
    }

    if (existingFriendship && existingFriendship.status === 'declined') {
      await existingFriendship.update({
        userId,
        friendId,
        status: 'pending'
      });

      return sendSuccess(res, 200, {
        friendshipId: existingFriendship.friendshipId,
        status: existingFriendship.status
      });
    }

    const newFriendship = await Friendship.create({
      userId,
      friendId,
      status: 'pending'
    });

    return sendSuccess(res, 201, {
      friendshipId: newFriendship.friendshipId,
      status: newFriendship.status
    });
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to create friend request.', {
      error: error.message
    });
  }
};

async function setFriendshipStatus(req, res, status) {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid friendship id.', {
        id: req.params.id
      });
    }

    const friendship = await Friendship.findByPk(id);

    if (!friendship) {
      return sendError(res, 404, 'FRIENDSHIP_NOT_FOUND', 'Friendship not found.', { id });
    }

    await friendship.update({ status });

    return sendSuccess(res, 200, {
      friendshipId: friendship.friendshipId,
      status: friendship.status
    });
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to update friendship.', {
      error: error.message
    });
  }
}

/**
 * @desc Update friendship status manually
 * @route PUT /friends/:id
 */
exports.updateFriendship = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'accepted', 'declined'];

  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid friendship status.', {
      allowedStatuses
    });
  }

  return setFriendshipStatus(req, res, status);
};

/**
 * @desc Accept friend request
 * @route PUT /friends/:id/accept
 */
exports.acceptFriendship = async (req, res) => {
  return setFriendshipStatus(req, res, 'accepted');
};

/**
 * @desc Decline friend request
 * @route PUT /friends/:id/decline
 */
exports.declineFriendship = async (req, res) => {
  return setFriendshipStatus(req, res, 'declined');
};

/**
 * @desc Delete friendship by ID / unfriend
 * @route DELETE /friends/:id
 */
exports.deleteFriendship = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid friendship id.', {
        id: req.params.id
      });
    }

    const deletedCount = await Friendship.destroy({
      where: { friendshipId: id }
    });

    if (deletedCount === 0) {
      return sendError(res, 404, 'FRIENDSHIP_NOT_FOUND', 'Friendship not found.', { id });
    }

    return sendSuccess(res, 200, { friendshipId: id });
  } catch (error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Failed to delete friendship.', {
      error: error.message
    });
  }
};