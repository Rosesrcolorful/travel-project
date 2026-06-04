const API_BASE_URL = "http://localhost:3000";

export async function getTrips(userId) {
  const response = await fetch(`${API_BASE_URL}/trips?userId=${userId}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Could not load trips");
  }

  return result.data;
}