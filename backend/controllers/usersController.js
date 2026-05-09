const users = require('../models/usersMock');

/**
 * @desc Get all users
 * @route GET /users
 * @access Public
 * @returns {Object} JSON response with all users
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
 * @param {number} id - User ID from URL params
 * @returns {Object} JSON response with single user or error
 */
exports.getUserById = (req, res) => {
  const id = Number(req.params.id);

  const user = users.find(u => u.userId === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: "USER_NOT_FOUND",
        message: "User not found",
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
 * @access Public
 * @param {Object} body - User data from request body
 * @returns {Object} JSON response with new user ID or validation error
 */
exports.createUser = (req, res) => {
  const { username, firstName, lastName, email, password, userRole } = req.body;

  if (!username || !firstName || !lastName || !email || !password || !userRole) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields",
        details: {
          required: ["username", "firstName", "lastName", "email", "password", "userRole"]
        }
      }
    });
  }

  const newUser = {
    userId: users.length + 1,
    username,
    firstName,
    lastName,
    email,
    password,
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
 */
exports.updateUser = (req, res) => {
  const id = Number(req.params.id);
  const { username, firstName, lastName, email, password, userRole } = req.body;

  const user = users.find(u => u.userId === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: "USER_NOT_FOUND",
        message: "User not found",
        details: { id }
      }
    });
  }

  if (!username || !firstName || !lastName || !email || !password || !userRole) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields",
        details: {
          required: ["username", "firstName", "lastName", "email", "password", "userRole"]
        }
      }
    });
  }

  user.username = username;
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.password = password;
  user.userRole = userRole;
  user.updateDate = new Date().toISOString();

  res.status(200).json({
    success: true,
    data: { userId: user.userId },
    error: null
  });
};


/**
 * @desc Delete user by ID
 * @route DELETE /users/:id
 */
exports.deleteUser = (req, res) => {
  const id = Number(req.params.id);

  const userIndex = users.findIndex(u => u.userId === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: "USER_NOT_FOUND",
        message: "User not found",
        details: { id }
      }
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  res.status(200).json({
    success: true,
    data: { userId: deletedUser.userId },
    error: null
  });
};