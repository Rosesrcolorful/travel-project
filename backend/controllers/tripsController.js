const trips = require('../models/tripsMock');

/**
 * Helper function for checking if an id param is valid.
 */
const isValidId = (id) => {
  return !isNaN(id) && Number.isInteger(id) && id > 0;
};

/**
 * @desc Get all trips
 * @route GET /trips
 * @access Public
 *
 * Optional query params:
 * destination, status, name
 */
exports.getAllTrips = (req, res) => {
  const { destination, status, name, userId } = req.query;

  let filteredTrips = trips;

  if (userId) {
  const numericUserId = Number(userId);

  filteredTrips = filteredTrips.filter(
    (trip) =>
      trip.createdBy === numericUserId ||
      trip.participants.includes(numericUserId)
  );
}

  if (destination) {
    filteredTrips = filteredTrips.filter((trip) =>
      trip.destination.toLowerCase().includes(destination.toLowerCase())
    );
  }

  if (status) {
    filteredTrips = filteredTrips.filter((trip) =>
      trip.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (name) {
    filteredTrips = filteredTrips.filter((trip) =>
      trip.tripName.toLowerCase().includes(name.toLowerCase())
    );
  }

  res.status(200).json({
    success: true,
    data: filteredTrips,
    error: null
  });
};

/**
 * @desc Get trip by ID
 * @route GET /trips/:id
 * @access Public
 */
exports.getTripById = (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid trip id.',
        details: {
          id: req.params.id
        }
      }
    });
  }

  const trip = trips.find((t) => t.tripId === id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'TRIP_NOT_FOUND',
        message: 'Trip not found.',
        details: { id }
      }
    });
  }

  res.status(200).json({
    success: true,
    data: trip,
    error: null
  });
};

/**
 * @desc Create new trip
 * @route POST /trips
 * @access Admin, manager, and user
 */
exports.createTrip = (req, res) => {
  const {
    tripName,
    destination,
    startDate,
    endDate,
    description,
    createdBy,
    participants,
    budget,
    status
  } = req.body;

  if (!tripName || !destination || !startDate || !endDate || !budget || !status) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields.',
        details: {
          required: ['tripName', 'destination', 'startDate', 'endDate', 'budget', 'status']
        }
      }
    });
  }

  const newTrip = {
    tripId: trips.length > 0 ? Math.max(...trips.map((t) => t.tripId)) + 1 : 1,
    tripName,
    destination,
    startDate,
    endDate,
    description: description || '',
    createdBy: createdBy || null,
    participants: participants || [],
    budget,
    status,
    createDate: new Date().toISOString(),
    updateDate: new Date().toISOString()
  };

  trips.push(newTrip);

  res.status(201).json({
    success: true,
    data: {
      tripId: newTrip.tripId
    },
    error: null
  });
};

/**
 * @desc Update trip by ID
 * @route PUT /trips/:id
 * @access Admin and manager only
 */
exports.updateTrip = (req, res) => {
  const id = Number(req.params.id);

  const {
    tripName,
    destination,
    startDate,
    endDate,
    description,
    createdBy,
    participants,
    budget,
    status
  } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid trip id.',
        details: {
          id: req.params.id
        }
      }
    });
  }

  const trip = trips.find((t) => t.tripId === id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'TRIP_NOT_FOUND',
        message: 'Trip not found.',
        details: { id }
      }
    });
  }

  if (!tripName || !destination || !startDate || !endDate || !budget || !status) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Missing required fields.',
        details: {
          required: ['tripName', 'destination', 'startDate', 'endDate', 'budget', 'status']
        }
      }
    });
  }

  trip.tripName = tripName;
  trip.destination = destination;
  trip.startDate = startDate;
  trip.endDate = endDate;
  trip.description = description || trip.description || '';
  trip.createdBy = createdBy || trip.createdBy || null;
  trip.participants = participants || trip.participants || [];
  trip.budget = budget;
  trip.status = status;
  trip.updateDate = new Date().toISOString();

  res.status(200).json({
    success: true,
    data: {
      tripId: trip.tripId
    },
    error: null
  });
};

/**
 * @desc Delete trip by ID
 * @route DELETE /trips/:id
 * @access Admin only
 */
exports.deleteTrip = (req, res) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid trip id.',
        details: {
          id: req.params.id
        }
      }
    });
  }

  const tripIndex = trips.findIndex((t) => t.tripId === id);

  if (tripIndex === -1) {
    return res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'TRIP_NOT_FOUND',
        message: 'Trip not found.',
        details: { id }
      }
    });
  }

  const deletedTrip = trips.splice(tripIndex, 1)[0];

  res.status(200).json({
    success: true,
    data: {
      tripId: deletedTrip.tripId
    },
    error: null
  });
};