const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function extractTextFromResponse(responseData) {
  if (responseData.output_text) {
    return responseData.output_text;
  }

  const output = responseData.output || [];

  for (const item of output) {
    const content = item.content || [];

    for (const contentItem of content) {
      if (contentItem.type === "output_text" && contentItem.text) {
        return contentItem.text;
      }
    }
  }

  return "";
}

function parseJsonSafely(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw error;
    }

    const possibleJson = text.slice(firstBrace, lastBrace + 1);
    return JSON.parse(possibleJson);
  }
}

function buildPrompt(userPrompt) {
  return `
User travel request:
${userPrompt}

Create one practical trip plan.

Return ONLY valid JSON with this exact structure:
{
  "tripName": "string",
  "destination": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "budget": number,
  "status": "planned",
  "description": "string",
  "itinerary": [
    {
      "day": 1,
      "title": "string",
      "activities": ["string", "string"]
    }
  ],
  "tips": ["string", "string"]
}

Rules:
- Use realistic dates. If the user did not provide dates, choose future dates.
- Budget must be a number only.
- status must always be "planned".
- Keep the trip safe, age-appropriate, and realistic.
- Description should be useful for saving as a trip description.
- Do not include markdown.
- Do not include explanations outside the JSON.
`;
}

async function generateTripPlan(userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing from backend environment variables.");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions:
        "You are a travel planning assistant for a full-stack travel website. Generate realistic trip recommendations as strict JSON only.",
      input: buildPrompt(userPrompt),
      temperature: 0.7,
      max_output_tokens: 1200
    })
  });

  const responseData = await response.json();

  if (!response.ok) {
    const message =
      responseData.error?.message ||
      "OpenAI request failed.";

    throw new Error(message);
  }

  const rawText = extractTextFromResponse(responseData);

  if (!rawText) {
    throw new Error("AI response did not include text output.");
  }

  const tripPlan = parseJsonSafely(rawText);

  return {
    ...tripPlan,
    rawAiText: rawText
  };
}

module.exports = {
  generateTripPlan
};