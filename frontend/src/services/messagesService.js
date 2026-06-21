const API_BASE_URL = "http://localhost:3000";

async function parseResponse(response, fallbackMessage) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || fallbackMessage);
  }

  return result.data;
}

export async function getConversation(userId, friendId) {
  const response = await fetch(`${API_BASE_URL}/messages/${friendId}`, {
    headers: {
      "x-user-id": userId
    }
  });

  return parseResponse(response, "Could not load conversation");
}

export async function sendMessage(userId, receiverId, content) {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify({
      receiverId,
      content
    })
  });

  return parseResponse(response, "Could not send message");
}