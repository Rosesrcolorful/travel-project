const users = require('../models/usersMock');

/**
 * Helper function for checking if an id param is valid.
 */
const isValidId = (id) => {
  return !isNaN(id) && Number.isInteger(id) && id > 0;
};

/**
 * @desc Get all users
 * @route GET /users
 * @access Public
 */
exports.getAllUsers = (req, res) => {
  res.status(200).json({
    success: true,
    data: users,
    error: null
  });
};

/**
 * @desc Get user by ID
 * @route GET /users/:id
 * @access Public
 */
exports.getUserById = (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid user id.',
        details: {
          id: req.params.id
        }
      }
    });
  }

  const user = users.find((u) => u.userId === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        details: { id }
      }
    });
  }

  res.status(200).json({
    success: true,
    data: user,
    error: null
  });
};

/**
 * @desc Create new user
 * @route POST /users
 * @access Admin only
 */
exports.createUser = (req, res) => {
  const { username, firstName, lastName, email, password, userRole } = req.body;

  if (!firstName || !lastName || !userRole) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields.',
        details: {
          required: ['firstName', 'lastName', 'userRole']
        }
      }
    });
  }

  const newUser = {
    userId: users.length > 0 ? Math.max(...users.map((u) => u.userId)) + 1 : 1,
    username: username || null,
    firstName,
    lastName,
    email: email || null,
    password: password || null,
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
    userRole
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: {
      userId: newUser.userId
    },
    error: null
  });
};

/**
 * @desc Update user by ID
 * @route PUT /users/:id
 * @access Admin and manager only
 */
exports.updateUser = (req, res) => {
  const id = Number(req.params.id);
  const { username, firstName, lastName, email, password, userRole } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid user id.',
        details: {
          id: req.params.id
        }
      }
    });
  }

  const user = users.find((u) => u.userId === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        details: { id }
      }
    });
  }

  if (!firstName || !lastName || !userRole) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields.',
        details: {
          required: ['firstName', 'lastName', 'userRole']
        }
      }
    });
  }

  user.username = username || user.username || null;
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email || user.email || null;
  user.password = password || user.password || null;
  user.userRole = userRole;
  user.updateDate = new Date().toISOString();

  res.status(200).json({
    success: true,
    data: {
      userId: user.userId
    },
    error: null
  });
};

/**
 * @desc Delete user by ID
 * @route DELETE /users/:id
 * @access Admin only
 */
exports.deleteUser = (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid user id.',
        details: {
          id: req.params.id
        }
      }
    });
  }

  const userIndex = users.findIndex((u) => u.userId === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        details: { id }
      }
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  res.status(200).json({
    success: true,
    data: {
      userId: deletedUser.userId
    },
    error: null
  });
};