const express = require("express");
const router = express.Router();

const tripSharesController = require("../controllers/tripSharesController");

/**
 * @route GET /trip-shares
 * @desc Get trip shares sent or received by current user
 */
router.get("/", tripSharesController.getMyTripShares);

/**
 * @route GET /trip-shares/pending
 * @desc Get pending trip shares received by current user
 */
router.get("/pending", tripSharesController.getPendingTripShares);

/**
 * @route PUT /trip-shares/:id/accept
 * @desc Accept trip share
 */
router.put("/:id/accept", tripSharesController.acceptTripShare);

/**
 * @route PUT /trip-shares/:id/decline
 * @desc Decline trip share
 */
router.put("/:id/decline", tripSharesController.declineTripShare);

module.exports = router;