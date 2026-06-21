const API_BASE_URL = "http://localhost:3000";

async function parseResponse(response, fallbackMessage) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || fallbackMessage);
  }

  return result.data;
}

export async function getTrips(userId) {
  const response = await fetch(`${API_BASE_URL}/trips?userId=${userId}`, {
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not load trips");
}

export async function getTripById(userId, tripId) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}?userId=${userId}`, {
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not load trip");
}

export async function createTrip(userId, tripData) {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify(tripData)
  });

  return parseResponse(response, "Could not create trip");
}

export async function updateTrip(userId, tripId, tripData) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify(tripData)
  });

  return parseResponse(response, "Could not update trip");
}

export async function deleteTrip(userId, tripId) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not delete trip");
}