const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/tripsController');

/**
 * @route GET /trips
 * @desc Get all trips
 */
router.get('/', tripsController.getAllTrips);



/**
 * @route POST /Trips
 * @desc Create new Trip
 */
router.post('/', tripsController.createTrip);

router.put('/:id',tripsController.updateTrip);
router.delete('/:id',tripsController.deleteTrip);

/**
 * @route GET /trips/:id
 * @desc Get trip by ID
 */
router.get('/:id', tripsController.getTripById);

module.exports = router;