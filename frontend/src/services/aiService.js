const API_BASE_URL = "http://localhost:3000";

async function parseResponse(response, fallbackMessage) {
  const result = await response.json();

  if (!response.ok) {
    const backendMessage = result.error?.message;
    const detailedMessage = result.error?.details?.error;

    throw new Error(detailedMessage || backendMessage || fallbackMessage);
  }

  return result.data;
}

export async function generateTripPlan(prompt) {
  const response = await fetch(`${API_BASE_URL}/api/ai/trip-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  return parseResponse(response, "Could not generate trip plan");
}