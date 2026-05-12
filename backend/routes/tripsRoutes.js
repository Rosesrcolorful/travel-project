const express = require('express');
const router = express.Router();

const tripsController = require('../controllers/tripsController');
const roleCheck = require('../middleware/roleCheck');

/**
 * @route GET /trips
 * @desc Get all trips, with optional filters
 * @access Public
 */
router.get('/', tripsController.getAllTrips);

/**
 * @route POST /trips
 * @desc Create a new trip
 * @access Admin, manager, and user
 */
router.post('/', roleCheck(['admin', 'manager', 'user']), tripsController.createTrip);

/**
 * @route GET /trips/:id
 * @desc Get trip by ID
 * @access Public
 */
router.get('/:id', tripsController.getTripById);

/**
 * @route PUT /trips/:id
 * @desc Update trip by ID
 * @access Admin and manager only
 */
router.put('/:id', roleCheck(['admin', 'manager']), tripsController.updateTrip);

/**
 * @route DELETE /trips/:id
 * @desc Delete trip by ID
 * @access Admin only
 */
router.delete('/:id', roleCheck(['admin']), tripsController.deleteTrip);

module.exports = router;