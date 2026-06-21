const express = require("express");
const router = express.Router();

const tripsController = require("../controllers/tripsController");
const tripSharesController = require("../controllers/tripSharesController");

/**
 * @route GET /trips
 * @desc Get trips, with optional filters
 */
router.get("/", tripsController.getAllTrips);

/**
 * @route POST /trips
 * @desc Create a new trip
 */
router.post("/", tripsController.createTrip);

/**
 * @route POST /trips/:id/share
 * @desc Share trip with a friend
 */
router.post("/:id/share", tripSharesController.shareTrip);

/**
 * @route GET /trips/:id
 * @desc Get trip by ID
 */
router.get("/:id", tripsController.getTripById);

/**
 * @route PUT /trips/:id
 * @desc Update trip by ID
 */
router.put("/:id", tripsController.updateTrip);

/**
 * @route DELETE /trips/:id
 * @desc Delete trip by ID
 */
router.delete("/:id", tripsController.deleteTrip);

module.exports = router;