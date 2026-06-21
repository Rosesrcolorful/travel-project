const { Op } = require("sequelize");
const {
  Message,
  User,
  Friendship,
  TripShare,
  Trip
} = require("../models");

const onlineUsers = new Map();

const userAttributes = ["userId", "username", "firstName", "lastName", "email"];

function isValidId(id) {
  return Number.isInteger(id) && id > 0;
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

function addOnlineUser(userId, socketId) {
  const key = String(userId);
  const sockets = onlineUsers.get(key) || new Set();

  sockets.add(socketId);
  onlineUsers.set(key, sockets);
}

function removeOnlineUser(socketId) {
  for (const [userId, sockets] of onlineUsers.entries()) {
    sockets.delete(socketId);

    if (sockets.size === 0) {
      onlineUsers.delete(userId);
    }
  }
}

function getOnlineUserIds() {
  return Array.from(onlineUsers.keys()).map(Number);
}

function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("user:join", (rawUserId) => {
      const userId = Number(rawUserId);

      if (!isValidId(userId)) {
        return;
      }

      socket.join(`user:${userId}`);
      addOnlineUser(userId, socket.id);

      io.emit("user:online", {
        onlineUserIds: getOnlineUserIds()
      });
    });

    socket.on("chat:send", async (payload, callback) => {
      try {
        const senderId = Number(payload.senderId);
        const receiverId = Number(payload.receiverId);
        const content = (payload.content || "").trim();

        if (!isValidId(senderId) || !isValidId(receiverId)) {
          throw new Error("Valid sender and receiver ids are required.");
        }

        if (!content) {
          throw new Error("Message content is required.");
        }

        const areFriends = await usersAreAcceptedFriends(senderId, receiverId);

        if (!areFriends) {
          throw new Error("You can only message accepted friends.");
        }

        const message = await Message.create({
          senderId,
          receiverId,
          content,
          messageType: "text"
        });

        const fullMessage = await loadMessage(message.messageId);

        io.to(`user:${senderId}`)
          .to(`user:${receiverId}`)
          .emit("chat:received", fullMessage);

        if (callback) {
          callback({
            success: true,
            data: fullMessage,
            error: null
          });
        }
      } catch (error) {
        if (callback) {
          callback({
            success: false,
            data: null,
            error: {
              code: "SOCKET_MESSAGE_ERROR",
              message: error.message,
              details: {}
            }
          });
        }
      }
    });

    socket.on("trip_share:respond", (payload) => {
      const senderId = Number(payload.senderId);
      const receiverId = Number(payload.receiverId);

      if (isValidId(senderId)) {
        io.to(`user:${senderId}`).emit("trip_share:updated", payload);
      }

      if (isValidId(receiverId)) {
        io.to(`user:${receiverId}`).emit("trip_share:updated", payload);
      }
    });

    socket.on("disconnect", () => {
      removeOnlineUser(socket.id);

      io.emit("user:online", {
        onlineUserIds: getOnlineUserIds()
      });

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocket;