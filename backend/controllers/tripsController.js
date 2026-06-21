const { Op } = require("sequelize");
const { Trip, User, TripParticipant } = require("../models");

const validStatuses = ["planned", "active", "completed", "cancelled"];

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

function hasMissingTripFields(tripData) {
  return (
    !tripData.tripName ||
    !tripData.destination ||
    !tripData.startDate ||
    !tripData.endDate ||
    tripData.budget === undefined ||
    tripData.budget === null ||
    tripData.budget === ""
  );
}

function validateTripDates(startDate, endDate) {
  return new Date(startDate) <= new Date(endDate);
}

function validateBudget(budget) {
  const numericBudget = Number(budget);
  return !Number.isNaN(numericBudget) && numericBudget >= 0;
}

function tripInclude() {
  return [
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
  ];
}

async function loadTripWithRelations(tripId) {
  return Trip.findByPk(tripId, {
    include: tripInclude()
  });
}

async function userCanManageTrip(userId, trip) {
  if (!isValidId(userId)) {
    return false;
  }

  if (trip.createdBy === userId) {
    return true;
  }

  const ownerRecord = await TripParticipant.findOne({
    where: {
      userId,
      tripId: trip.tripId,
      participantRole: "owner"
    }
  });

  return Boolean(ownerRecord);
}

function userCanSeeTrip(userId, tripJson) {
  if (!isValidId(userId)) {
    return true;
  }

  return (
    tripJson.createdBy === userId ||
    tripJson.participants.some((participant) => participant.userId === userId)
  );
}

/**
 * @desc Get trips, optionally filtered by destination/status/name/userId
 * @route GET /trips
 */
exports.getAllTrips = async (req, res) => {
  try {
    const { destination, status, name } = req.query;
    const currentUserId = getCurrentUserId(req);

    const where = {};

    if (destination) {
      where.destination = { [Op.like]: `%${destination}%` };
    }

    if (status) {
      where.status = status;
    }

    if (name) {
      where.tripName = { [Op.like]: `%${name}%` };
    }

    let trips = await Trip.findAll({
      where,
      include: tripInclude(),
      order: [["startDate", "ASC"]]
    });

    if (isValidId(currentUserId)) {
      trips = trips.filter((trip) => userCanSeeTrip(currentUserId, trip.toJSON()));
    }

    return sendSuccess(res, 200, trips);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to get trips.", {
      error: error.message
    });
  }
};

/**
 * @desc Get one trip by ID
 * @route GET /trips/:id
 */
exports.getTripById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const currentUserId = getCurrentUserId(req);

    if (!isValidId(id)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid trip id.", {
        id: req.params.id
      });
    }

    const trip = await loadTripWithRelations(id);

    if (!trip) {
      return sendError(res, 404, "TRIP_NOT_FOUND", "Trip not found.", { id });
    }

    const tripJson = trip.toJSON();

    if (isValidId(currentUserId) && !userCanSeeTrip(currentUserId, tripJson)) {
      return sendError(res, 403, "FORBIDDEN", "You do not have access to this trip.", {
        tripId: id,
        userId: currentUserId
      });
    }

    return sendSuccess(res, 200, trip);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to get trip.", {
      error: error.message
    });
  }
};

/**
 * @desc Create a new trip
 * @route POST /trips
 */
exports.createTrip = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req);

    const {
      tripName,
      destination,
      startDate,
      endDate,
      description,
      budget,
      status = "planned",
      participants = []
    } = req.body;

    if (!isValidId(currentUserId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing or invalid current user id.", {
        requiredHeader: "x-user-id"
      });
    }

    if (hasMissingTripFields({ tripName, destination, startDate, endDate, budget })) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields.", {
        required: ["tripName", "destination", "startDate", "endDate", "budget"]
      });
    }

    if (!validateTripDates(startDate, endDate)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Start date cannot be after end date.", {
        startDate,
        endDate
      });
    }

    if (!validateBudget(budget)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Budget must be a positive number or zero.", {
        budget
      });
    }

    if (!validStatuses.includes(status)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid trip status.", {
        allowedStatuses: validStatuses
      });
    }

    const creator = await User.findByPk(currentUserId);

    if (!creator) {
      return sendError(res, 404, "USER_NOT_FOUND", "Creating user was not found.", {
        userId: currentUserId
      });
    }

    const newTrip = await Trip.create({
      tripName,
      destination,
      startDate,
      endDate,
      description: description || "",
      createdBy: currentUserId,
      budget,
      status
    });

    const participantIds = Array.from(
      new Set([
        currentUserId,
        ...participants.map((participantId) => Number(participantId)).filter(isValidId)
      ])
    );

    const participantRows = participantIds.map((participantId) => ({
      userId: participantId,
      tripId: newTrip.tripId,
      participantRole: participantId === currentUserId ? "owner" : "member"
    }));

    await TripParticipant.bulkCreate(participantRows, {
      ignoreDuplicates: true
    });

    const createdTrip = await loadTripWithRelations(newTrip.tripId);

    return sendSuccess(res, 201, createdTrip);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to create trip.", {
      error: error.message
    });
  }
};

/**
 * @desc Update trip by ID
 * @route PUT /trips/:id
 */
exports.updateTrip = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const currentUserId = getCurrentUserId(req);

    const {
      tripName,
      destination,
      startDate,
      endDate,
      description,
      budget,
      status
    } = req.body;

    if (!isValidId(id)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid trip id.", {
        id: req.params.id
      });
    }

    if (!isValidId(currentUserId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing or invalid current user id.", {
        requiredHeader: "x-user-id"
      });
    }

    const trip = await Trip.findByPk(id);

    if (!trip) {
      return sendError(res, 404, "TRIP_NOT_FOUND", "Trip not found.", { id });
    }

    const canManage = await userCanManageTrip(currentUserId, trip);

    if (!canManage) {
      return sendError(res, 403, "FORBIDDEN", "Only the trip owner can edit this trip.", {
        tripId: id,
        userId: currentUserId
      });
    }

    if (hasMissingTripFields({ tripName, destination, startDate, endDate, budget })) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing required fields.", {
        required: ["tripName", "destination", "startDate", "endDate", "budget"]
      });
    }

    if (!validateTripDates(startDate, endDate)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Start date cannot be after end date.", {
        startDate,
        endDate
      });
    }

    if (!validateBudget(budget)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Budget must be a positive number or zero.", {
        budget
      });
    }

    if (!validStatuses.includes(status)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid trip status.", {
        allowedStatuses: validStatuses
      });
    }

    await trip.update({
      tripName,
      destination,
      startDate,
      endDate,
      description: description || "",
      budget,
      status
    });

    const updatedTrip = await loadTripWithRelations(id);

    return sendSuccess(res, 200, updatedTrip);
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to update trip.", {
      error: error.message
    });
  }
};

/**
 * @desc Delete trip by ID
 * @route DELETE /trips/:id
 */
exports.deleteTrip = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const currentUserId = getCurrentUserId(req);

    if (!isValidId(id)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid trip id.", {
        id: req.params.id
      });
    }

    if (!isValidId(currentUserId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Missing or invalid current user id.", {
        requiredHeader: "x-user-id"
      });
    }

    const trip = await Trip.findByPk(id);

    if (!trip) {
      return sendError(res, 404, "TRIP_NOT_FOUND", "Trip not found.", { id });
    }

    const canManage = await userCanManageTrip(currentUserId, trip);

    if (!canManage) {
      return sendError(res, 403, "FORBIDDEN", "Only the trip owner can delete this trip.", {
        tripId: id,
        userId: currentUserId
      });
    }

    await TripParticipant.destroy({
      where: { tripId: id }
    });

    await trip.destroy();

    return sendSuccess(res, 200, {
      tripId: id,
      deleted: true
    });
  } catch (error) {
    return sendError(res, 500, "SERVER_ERROR", "Failed to delete trip.", {
      error: error.message
    });
  }
};