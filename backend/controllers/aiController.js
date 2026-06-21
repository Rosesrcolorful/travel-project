const { generateTripPlan } = require("../services/aiService");

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

exports.generateTripRecommendation = async (req, res) => {
  try {
    const prompt = (req.body.prompt || "").trim();

    if (!prompt) {
      return sendError(res, 400, "VALIDATION_ERROR", "Trip prompt is required.", {
        field: "prompt"
      });
    }

    if (prompt.length < 10) {
      return sendError(res, 400, "VALIDATION_ERROR", "Trip prompt is too short.", {
        field: "prompt",
        minimumLength: 10
      });
    }

    const tripPlan = await generateTripPlan(prompt);

    return sendSuccess(res, 200, tripPlan);
  } catch (error) {
    return sendError(res, 500, "AI_GENERATION_FAILED", "Failed to generate trip recommendation.", {
      error: error.message
    });
  }
};