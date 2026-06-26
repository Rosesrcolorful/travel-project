const API_BASE_URL =   process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

async function parseResponse(response, fallbackMessage) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || fallbackMessage);
  }

  return result.data;
}

export async function shareTrip(userId, tripId, receiverId, note = "") {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify({
      receiverId,
      note
    })
  });

  return parseResponse(response, "Could not share trip");
}

export async function getPendingTripShares(userId) {
  const response = await fetch(`${API_BASE_URL}/trip-shares/pending`, {
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not load pending trip shares");
}

export async function getMyTripShares(userId) {
  const response = await fetch(`${API_BASE_URL}/trip-shares`, {
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not load trip shares");
}

export async function acceptTripShare(userId, tripShareId) {
  const response = await fetch(`${API_BASE_URL}/trip-shares/${tripShareId}/accept`, {
    method: "PUT",
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not accept trip share");
}

export async function declineTripShare(userId, tripShareId) {
  const response = await fetch(`${API_BASE_URL}/trip-shares/${tripShareId}/decline`, {
    method: "PUT",
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not decline trip share");
}