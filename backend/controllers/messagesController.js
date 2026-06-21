const { Op } = require("sequelize");
const {
  Message,
  User,
  Friendship,
  TripShare,
  Trip
} = require("../models");

const userAttributes = ["userId", "username", "firstName", "lastName", "email"];

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

function isValidId(id) {
  return Number.isInteger(id) && id > 0;
}

function getCurrentUserId(req) {
  return Number(req.header("x-user-id") || req.query.userId || req.body.senderId);
}

function messageInclude() {
  return [
    {
      model: User,
      as: "sender",
      attributes: userAttributes
    },
    {
      model: User,
      as: "receiver",
      attributes: userAttributes
    },
    {
      model: TripShare,
      as: "tripShare",
      required: false,
      include: [
        {
          model: Trip,
          as: "trip"
        },
        {
          model: User,
          as: "sender",
          attributes: userAttributes
        },
        {
          model: User,
          as: "receiver",
          attributes: userAttributes
        }
      ]
    }
  ];
}

async function usersAreAcceptedFriends(userId, friendId) {
  const friendship = await Friendship.findOne({
    where: {
      status: "accepted",
      [Op.or]: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    }
  });

  return Boolean(friendship);
}

async function loadMessage(messageId) {
  return Message.findByPk(messageId, {
    include: messageInclude()
  });
}

/**
 * GET /messages/:friendId
 * Get chat conversation between current user and a friend.
 */
exports.getConversation = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    const friendId = Number(req.params.friendId);

    if (!isValidId(userId) || !isValidId(friendId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Valid user ids are required.", {
        userId,
        friendId: req.params.friendId
      });
    }

    const areFriends = await usersAreAcceptedFriends(userId, friendId);

    if (!areFriends) {
      return sendError(res, 403, "NOT_FRIENDS", "You can only chat with accepted friends.", {
        userId,
        friendId
      });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      include: messageInclude(),
      order: [["createDate", "ASC"]]
    });

    return sendSuccess(res, 200, messages);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to get conversation.", {
      error: error.message
    });
  }
};

/**
 * POST /messages
 * Send a message using normal REST.
 */
exports.sendMessage = async (req, res) => {
  try {
    const senderId = getCurrentUserId(req);
    const receiverId = Number(req.body.receiverId);
    const content = (req.body.content || "").trim();

    if (!isValidId(senderId) || !isValidId(receiverId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Valid sender and receiver ids are required.", {
        senderId,
        receiverId: req.body.receiverId
      });
    }

    if (!content) {
      return sendError(res, 400, "VALIDATION_ERROR", "Message content is required.", {
        field: "content"
      });
    }

    const areFriends = await usersAreAcceptedFriends(senderId, receiverId);

    if (!areFriends) {
      return sendError(res, 403, "NOT_FRIENDS", "You can only message accepted friends.", {
        senderId,
        receiverId
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content,
      messageType: "text"
    });

    const fullMessage = await loadMessage(message.messageId);

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${senderId}`)
        .to(`user:${receiverId}`)
        .emit("chat:received", fullMessage);
    }

    return sendSuccess(res, 201, fullMessage);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to send message.", {
      error: error.message
    });
  }
};