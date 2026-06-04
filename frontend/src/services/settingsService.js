const API_BASE_URL = "http://localhost:3000";

export async function getSettings(userId) {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    headers: {
      "x-user-id": userId
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Could not load settings");
  }

  return result.data;
}

export async function updateSettings(userId, settings) {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify(settings)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Could not update settings");
  }

  return result.data;
}