const { Op } = require("sequelize");
const {
  TripShare,
  Trip,
  User,
  TripParticipant,
  Friendship,
  Message
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
  return Number(req.header("x-user-id") || req.query.userId || req.body.userId);
}

function tripShareInclude() {
  return [
    {
      model: Trip,
      as: "trip",
      include: [
        {
          model: User,
          as: "creator",
          attributes: userAttributes
        },
        {
          model: User,
          as: "participants",
          attributes: userAttributes,
          through: {
            attributes: ["participantRole"]
          }
        }
      ]
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
  ];
}

async function loadTripShare(tripShareId) {
  return TripShare.findByPk(tripShareId, {
    include: tripShareInclude()
  });
}

async function loadTripShareMessage(messageId) {
  return Message.findByPk(messageId, {
    include: [
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
        include: tripShareInclude()
      }
    ]
  });
}

async function createTripShareMessage(req, tripShare, note = "") {
  const messageContent =
    note ||
    `${tripShare.sender?.username || "A friend"} shared "${tripShare.trip?.tripName || "a trip"}" with you.`;

  const message = await Message.create({
    senderId: tripShare.senderId,
    receiverId: tripShare.receiverId,
    content: messageContent,
    messageType: "trip_share",
    tripShareId: tripShare.tripShareId
  });

  const fullMessage = await loadTripShareMessage(message.messageId);

  const io = req.app.get("io");

  if (io) {
    io.to(`user:${tripShare.senderId}`)
      .to(`user:${tripShare.receiverId}`)
      .emit("chat:received", fullMessage);

    io.to(`user:${tripShare.receiverId}`).emit("trip_share:received", tripShare);
  }

  return fullMessage;
}

async function userCanShareTrip(userId, tripId) {
  const trip = await Trip.findByPk(tripId);

  if (!trip) {
    return false;
  }

  if (Number(trip.createdBy) === Number(userId)) {
    return true;
  }

  const ownerParticipant = await TripParticipant.findOne({
    where: {
      userId,
      tripId,
      participantRole: "owner"
    }
  });

  return Boolean(ownerParticipant);
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

/**
 * @desc Share trip with a friend
 * @route POST /trips/:id/share
 */
exports.shareTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const senderId = getCurrentUserId(req);
    const receiverId = Number(req.body.receiverId);
    const note = req.body.note || "";

    if (!isValidId(tripId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid trip id.", {
        tripId: req.params.id
      });
    }

    if (!isValidId(senderId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing or invalid current user id.", {
        requiredHeader: "x-user-id"
      });
    }

    if (!isValidId(receiverId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Receiver id must be valid.", {
        receiverId: req.body.receiverId
      });
    }

    if (senderId === receiverId) {
      return sendError(res, 400, "VALIDATION_ERROR", "You cannot share a trip with yourself.", {
        senderId,
        receiverId
      });
    }

    const trip = await Trip.findByPk(tripId);

    if (!trip) {
      return sendError(res, 404, "TRIP_NOT_FOUND", "Trip not found.", {
        tripId
      });
    }

    const receiver = await User.findByPk(receiverId);

    if (!receiver) {
      return sendError(res, 404, "USER_NOT_FOUND", "Receiver user was not found.", {
        receiverId
      });
    }

    const canShare = await userCanShareTrip(senderId, tripId);

    if (!canShare) {
      return sendError(res, 403, "FORBIDDEN", "Only the trip owner can share this trip.", {
        tripId,
        senderId
      });
    }

    const areFriends = await usersAreAcceptedFriends(senderId, receiverId);

    if (!areFriends) {
      return sendError(res, 403, "NOT_FRIENDS", "You can only share trips with accepted friends.", {
        senderId,
        receiverId
      });
    }

    const alreadyParticipant = await TripParticipant.findOne({
      where: {
        tripId,
        userId: receiverId
      }
    });

    if (alreadyParticipant) {
      return sendError(res, 409, "ALREADY_PARTICIPANT", "This user is already a participant in the trip.", {
        tripId,
        receiverId
      });
    }

    const existingShare = await TripShare.findOne({
      where: {
        tripId,
        senderId,
        receiverId
      }
    });

    if (existingShare) {
      if (existingShare.status === "pending") {
        return sendError(res, 409, "SHARE_ALREADY_PENDING", "This trip share is already pending.", {
          tripShareId: existingShare.tripShareId
        });
      }

      if (existingShare.status === "accepted") {
        return sendError(res, 409, "SHARE_ALREADY_ACCEPTED", "This trip share was already accepted.", {
          tripShareId: existingShare.tripShareId
        });
      }

      await existingShare.update({
        status: "pending",
        note
      });

      const refreshedShare = await loadTripShare(existingShare.tripShareId);

      await createTripShareMessage(req, refreshedShare, note);

      return sendSuccess(res, 200, refreshedShare);
    }

    const tripShare = await TripShare.create({
      tripId,
      senderId,
      receiverId,
      status: "pending",
      note
    });

    const createdShare = await loadTripShare(tripShare.tripShareId);

    await createTripShareMessage(req, createdShare, note);

    return sendSuccess(res, 201, createdShare);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to share trip.", {
      error: error.message
    });
  }
};

/**
 * @desc Get pending trip shares for current user
 * @route GET /trip-shares/pending
 */
exports.getPendingTripShares = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    if (!isValidId(userId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing or invalid current user id.", {
        requiredHeader: "x-user-id"
      });
    }

    const pendingShares = await TripShare.findAll({
      where: {
        receiverId: userId,
        status: "pending"
      },
      include: tripShareInclude(),
      order: [["createDate", "DESC"]]
    });

    return sendSuccess(res, 200, pendingShares);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to get pending trip shares.", {
      error: error.message
    });
  }
};

/**
 * @desc Get all trip shares related to current user
 * @route GET /trip-shares
 */
exports.getMyTripShares = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);

    if (!isValidId(userId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing or invalid current user id.", {
        requiredHeader: "x-user-id"
      });
    }

    const shares = await TripShare.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: tripShareInclude(),
      order: [["createDate", "DESC"]]
    });

    return sendSuccess(res, 200, shares);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to get trip shares.", {
      error: error.message
    });
  }
};

/**
 * @desc Accept a trip share
 * @route PUT /trip-shares/:id/accept
 */
exports.acceptTripShare = async (req, res) => {
  try {
    const tripShareId = Number(req.params.id);
    const userId = getCurrentUserId(req);

    if (!isValidId(tripShareId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid trip share id.", {
        tripShareId: req.params.id
      });
    }

    if (!isValidId(userId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing or invalid current user id.", {
        requiredHeader: "x-user-id"
      });
    }

    const tripShare = await TripShare.findByPk(tripShareId);

    if (!tripShare) {
      return sendError(res, 404, "TRIP_SHARE_NOT_FOUND", "Trip share was not found.", {
        tripShareId
      });
    }

    if (tripShare.receiverId !== userId) {
      return sendError(res, 403, "FORBIDDEN", "Only the receiver can accept this trip share.", {
        tripShareId,
        userId
      });
    }

    if (tripShare.status === "declined") {
      return sendError(res, 409, "SHARE_ALREADY_DECLINED", "This trip share was already declined.", {
        tripShareId
      });
    }

    await TripParticipant.findOrCreate({
      where: {
        userId,
        tripId: tripShare.tripId
      },
      defaults: {
        userId,
        tripId: tripShare.tripId,
        participantRole: "member"
      }
    });

    await tripShare.update({
      status: "accepted"
    });

    const acceptedShare = await loadTripShare(tripShareId);

    return sendSuccess(res, 200, acceptedShare);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to accept trip share.", {
      error: error.message
    });
  }
};

/**
 * @desc Decline a trip share
 * @route PUT /trip-shares/:id/decline
 */
exports.declineTripShare = async (req, res) => {
  try {
    const tripShareId = Number(req.params.id);
    const userId = getCurrentUserId(req);

    if (!isValidId(tripShareId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid trip share id.", {
        tripShareId: req.params.id
      });
    }

    if (!isValidId(userId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing or invalid current user id.", {
        requiredHeader: "x-user-id"
      });
    }

    const tripShare = await TripShare.findByPk(tripShareId);

    if (!tripShare) {
      return sendError(res, 404, "TRIP_SHARE_NOT_FOUND", "Trip share was not found.", {
        tripShareId
      });
    }

    if (tripShare.receiverId !== userId) {
      return sendError(res, 403, "FORBIDDEN", "Only the receiver can decline this trip share.", {
        tripShareId,
        userId
      });
    }

    if (tripShare.status === "accepted") {
      return sendError(res, 409, "SHARE_ALREADY_ACCEPTED", "This trip share was already accepted.", {
        tripShareId
      });
    }

    await tripShare.update({
      status: "declined"
    });

    const declinedShare = await loadTripShare(tripShareId);

    return sendSuccess(res, 200, declinedShare);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to decline trip share.", {
      error: error.message
    });
  }
};