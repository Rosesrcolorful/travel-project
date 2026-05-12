const friends = require('../models/friendsMock');
const users = require('../models/usersMock');

/**
 * Helper function for checking if an id param is valid.
 */
const isValidId = (id) => {
  return !isNaN(id) && Number.isInteger(id) && id > 0;
};

/**
 * @desc Get all friendship records
 * @route GET /friends
 * @access Admin and manager only
 */
exports.getAllFriends = (req, res) => {
  res.status(200).json({
    success: true,
    data: friends,
    error: null
  });
};

/**
 * @desc Get all friends for a specific user
 * @route GET /friends/:userId
 * @access Public
 */
exports.getFriendsByUserId = (req, res) => {
  const userId = Number(req.params.userId);

  if (!isValidId(userId)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid user id.',
        details: {
          userId: req.params.userId
        }
      }
    });
  }

  const userExists = users.some((user) => user.userId === userId);

  if (!userExists) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        details: {
          userId
        }
      }
    });
  }

  const userFriends = friends.filter(
    (friendship) =>
      friendship.userId === userId || friendship.friendId === userId
  );

  res.status(200).json({
    success: true,
    data: userFriends,
    error: null
  });
};

/**
 * @desc Create a new friendship request
 * @route POST /friends
 * @access Admin, manager, and user
 */
exports.createFriendship = (req, res) => {
  const { userId, friendId, status } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields.',
        details: {
          required: ['userId', 'friendId']
        }
      }
    });
  }

  if (!isValidId(Number(userId)) || !isValidId(Number(friendId))) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'userId and friendId must be valid positive numbers.',
        details: {
          userId,
          friendId
        }
      }
    });
  }

  if (Number(userId) === Number(friendId)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'A user cannot add themselves as a friend.',
        details: {
          userId,
          friendId
        }
      }
    });
  }

  const userExists = users.some((user) => user.userId === Number(userId));
  const friendExists = users.some((user) => user.userId === Number(friendId));

  if (!userExists || !friendExists) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'One or both users were not found.',
        details: {
          userId,
          friendId
        }
      }
    });
  }

  const friendshipExists = friends.some(
    (friendship) =>
      (friendship.userId === Number(userId) &&
        friendship.friendId === Number(friendId)) ||
      (friendship.userId === Number(friendId) &&
        friendship.friendId === Number(userId))
  );

  if (friendshipExists) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'FRIENDSHIP_ALREADY_EXISTS',
        message: 'Friendship already exists between these users.',
        details: {
          userId,
          friendId
        }
      }
    });
  }

  const newFriendship = {
    friendshipId:
      friends.length > 0
        ? Math.max(...friends.map((friendship) => friendship.friendshipId)) + 1
        : 1,
    userId: Number(userId),
    friendId: Number(friendId),
    status: status || 'pending',
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  };

  friends.push(newFriendship);

  res.status(201).json({
    success: true,
    data: {
      friendshipId: newFriendship.friendshipId
    },
    error: null
  });
};

/**
 * @desc Update friendship status
 * @route PUT /friends/:id
 * @access Admin and manager only
 */
exports.updateFriendship = (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid friendship id.',
        details: {
          id: req.params.id
        }
      }
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required field: status.',
        details: {
          required: ['status']
        }
      }
    });
  }

  const allowedStatuses = ['pending', 'accepted', 'blocked'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid friendship status.',
        details: {
          allowedStatuses
        }
      }
    });
  }

  const friendship = friends.find(
    (friendship) => friendship.friendshipId === id
  );

  if (!friendship) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'FRIENDSHIP_NOT_FOUND',
        message: 'Friendship not found.',
        details: {
          id
        }
      }
    });
  }

  friendship.status = status;
  friendship.updateDate = new Date().toISOString();

  res.status(200).json({
    success: true,
    data: {
      friendshipId: friendship.friendshipId
    },
    error: null
  });
};

/**
 * @desc Delete friendship by ID
 * @route DELETE /friends/:id
 * @access Admin only
 */
exports.deleteFriendship = (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid friendship id.',
        details: {
          id: req.params.id
        }
      }
    });
  }

  const friendshipIndex = friends.findIndex(
    (friendship) => friendship.friendshipId === id
  );

  if (friendshipIndex === -1) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'FRIENDSHIP_NOT_FOUND',
        message: 'Friendship not found.',
        details: {
          id
        }
      }
    });
  }

  const deletedFriendship = friends.splice(friendshipIndex, 1)[0];

  res.status(200).json({
    success: true,
    data: {
      friendshipId: deletedFriendship.friendshipId
    },
    error: null
  });
};