const API_BASE_URL = "http://localhost:3000";

export async function signup(signupData) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(signupData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Signup failed");
  }

  return result.data;
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Login failed");
  }

  return result.data;
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST"
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Logout failed");
  }

  return result.data;
}

export async function getCurrentUser(userId) {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: {
      "x-user-id": userId
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Could not load user");
  }

  return result.data;
}