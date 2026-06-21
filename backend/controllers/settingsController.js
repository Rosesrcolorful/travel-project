/**
 * @file settingsController.js
 * @description Handles reading, updating, password changes, and account deletion using MySQL through Sequelize.
 */

const { Op } = require("sequelize");
const { User, Trip, TripParticipant, Admin, Friendship } = require("../models");

const allowedThemes = ["light", "dark", "travel"];

function sendSuccess(res, statusCode, data) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null
  });
}

function sendError(res, statusCode, code, message, details = {}) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details
    }
  });
}

function getUserIdFromHeader(req) {
  return Number(req.header("x-user-id"));
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

exports.getSettings = async (req, res) => {
  try {
    const userId = getUserIdFromHeader(req);

    if (!userId) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing user id.", {
        header: "x-user-id"
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ["userId", "username", "firstName", "lastName", "email", "userRole", "theme"]
    });

    if (!user) {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found.", {
        userId
      });
    }

    return sendSuccess(res, 200, user);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to get settings.", {
      error: error.message
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const userId = getUserIdFromHeader(req);
    const { username, email, theme } = req.body;

    if (!userId) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing user id.", {
        header: "x-user-id"
      });
    }

    if (!username || !email || !theme) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields.", {
        required: ["username", "email", "theme"]
      });
    }

    if (!isValidEmail(email)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Please enter a valid email address.", {
        field: "email"
      });
    }

    if (!allowedThemes.includes(theme)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid theme.", {
        allowedThemes
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found.", {
        userId
      });
    }

    const duplicateUser = await User.findOne({
      where: {
        userId: {
          [Op.ne]: userId
        },
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (duplicateUser) {
      const duplicateField = duplicateUser.username === username ? "username" : "email";

      return sendError(res, 409, "USER_ALREADY_EXISTS", `This ${duplicateField} is already taken.`, {
        field: duplicateField
      });
    }

    await user.update({
      username,
      email,
      theme
    });

    return sendSuccess(res, 200, {
      userId: user.userId,
      username: user.username,
      email: user.email,
      theme: user.theme
    });
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to update settings.", {
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = getUserIdFromHeader(req);
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing user id.", {
        header: "x-user-id"
      });
    }

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, "VALIDATION_ERROR", "Current password and new password are required.", {
        required: ["currentPassword", "newPassword"]
      });
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, "VALIDATION_ERROR", "New password must be at least 6 characters.", {
        field: "newPassword"
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found.", {
        userId
      });
    }

    if (user.password !== currentPassword) {
      return sendError(res, 401, "INVALID_PASSWORD", "Current password is incorrect.", {
        field: "currentPassword"
      });
    }

    await user.update({
      password: newPassword
    });

    return sendSuccess(res, 200, {
      passwordChanged: true
    });
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to change password.", {
      error: error.message
    });
  }
};

exports.deleteAccount = async (req, res) => {
  const transaction = await User.sequelize.transaction();

  try {
    const userId = getUserIdFromHeader(req);
    const { password } = req.body;

    if (!userId) {
      await transaction.rollback();

      return sendError(res, 400, "VALIDATION_ERROR", "Missing user id.", {
        header: "x-user-id"
      });
    }

    if (!password) {
      await transaction.rollback();

      return sendError(res, 400, "VALIDATION_ERROR", "Password is required before deleting account.", {
        required: ["password"]
      });
    }

    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();

      return sendError(res, 404, "USER_NOT_FOUND", "User not found.", {
        userId
      });
    }

    if (user.password !== password) {
      await transaction.rollback();

      return sendError(res, 401, "INVALID_PASSWORD", "Password is incorrect.", {
        field: "password"
      });
    }

    await Admin.destroy({
      where: { userId },
      transaction
    });

    await TripParticipant.destroy({
      where: { userId },
      transaction
    });

    if (Friendship) {
      await Friendship.destroy({
        where: {
          [Op.or]: [
            { userId },
            { friendId: userId }
          ]
        },
        transaction
      });
    }

    await Trip.update(
      { createdBy: null },
      {
        where: { createdBy: userId },
        transaction
      }
    );

    await user.destroy({ transaction });

    await transaction.commit();

    return sendSuccess(res, 200, {
      deletedUserId: userId,
      message: "Account deleted successfully."
    });
  } catch (error) {
    await transaction.rollback();

    return sendError(res, 500, "SERVER_ERROR", "Failed to delete account.", {
      error: error.message
    });
  }
};