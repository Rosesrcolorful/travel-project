const API_BASE_URL = "http://localhost:3000";

async function parseResponse(response, fallbackMessage) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || fallbackMessage);
  }

  return result.data;
}

export async function getFriendsForUser(userId) {
  const response = await fetch(`${API_BASE_URL}/friends/${userId}`, {
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not load friends");
}

export async function getPendingFriendRequests(userId) {
  const response = await fetch(`${API_BASE_URL}/friends/requests/${userId}`, {
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not load friend requests");
}

export async function searchUsersByUsername(userId, username) {
  const response = await fetch(
    `${API_BASE_URL}/friends/search?username=${encodeURIComponent(username)}&userId=${userId}`,
    {
      headers: {
        "x-user-id": userId
      }
    }
  );

  return parseResponse(response, "Could not search users");
}

export async function sendFriendRequest(userId, friendId) {
  const response = await fetch(`${API_BASE_URL}/friends`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify({
      userId,
      friendId
    })
  });

  return parseResponse(response, "Could not send friend request");
}

export async function acceptFriendRequest(userId, friendshipId) {
  const response = await fetch(`${API_BASE_URL}/friends/${friendshipId}/accept`, {
    method: "PUT",
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not accept friend request");
}

export async function declineFriendRequest(userId, friendshipId) {
  const response = await fetch(`${API_BASE_URL}/friends/${friendshipId}/decline`, {
    method: "PUT",
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not decline friend request");
}

export async function unfriend(userId, friendshipId) {
  const response = await fetch(`${API_BASE_URL}/friends/${friendshipId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not remove friend");
}