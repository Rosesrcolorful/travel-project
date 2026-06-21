const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");

router.post("/trip-plan", aiController.generateTripRecommendation);

module.exports = router;