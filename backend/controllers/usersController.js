const { User } = require("../models");

const isValidId = (id) => {
  return !isNaN(id) && Number.isInteger(id) && id > 0;
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    res.status(200).json({
      success: true,
      data: users,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to get users.",
        details: {
          error: error.message
        }
      }
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid user id.",
          details: {
            id: req.params.id
          }
        }
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found.",
          details: { id }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to get user.",
        details: {
          error: error.message
        }
      }
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      password,
      userRole
    } = req.body;

    if (!firstName || !lastName || !userRole) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing required fields.",
          details: {
            required: ["firstName", "lastName", "userRole"]
          }
        }
      });
    }

    const newUser = await User.create({
      username,
      firstName,
      lastName,
      email,
      password,
      userRole
    });

    res.status(201).json({
      success: true,
      data: {
        userId: newUser.userId
      },
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to create user.",
        details: {
          error: error.message
        }
      }
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      username,
      firstName,
      lastName,
      email,
      password,
      userRole
    } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid user id.",
          details: {
            id: req.params.id
          }
        }
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found.",
          details: { id }
        }
      });
    }

    if (!firstName || !lastName || !userRole) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing required fields.",
          details: {
            required: ["firstName", "lastName", "userRole"]
          }
        }
      });
    }

    await user.update({
      username,
      firstName,
      lastName,
      email,
      password,
      userRole
    });

    res.status(200).json({
      success: true,
      data: {
        userId: user.userId
      },
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to update user.",
        details: {
          error: error.message
        }
      }
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid user id.",
          details: {
            id: req.params.id
          }
        }
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found.",
          details: { id }
        }
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      data: {
        userId: id
      },
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to delete user.",
        details: {
          error: error.message
        }
      }
    });
  }
};