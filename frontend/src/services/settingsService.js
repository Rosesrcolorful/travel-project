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

export async function changePassword(userId, passwordData) {
  const response = await fetch(`${API_BASE_URL}/api/settings/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify(passwordData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Could not change password");
  }

  return result.data;
}

export async function deleteAccount(userId, password) {
  const response = await fetch(`${API_BASE_URL}/api/settings/account`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify({ password })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Could not delete account");
  }

  return result.data;
}