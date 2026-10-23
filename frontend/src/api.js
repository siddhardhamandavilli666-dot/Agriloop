const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Silently ping the backend on app load so the Render dyno is warm by the
// time the user submits the login form (eliminates the cold-start delay).
export function warmUp() {
  fetch(`${API}/actuator/health`, { method: "GET", cache: "no-store" }).catch(
    () => fetch(`${API}/`, { method: "GET", cache: "no-store" }).catch(() => {}),
  );
}

let token = localStorage.getItem("agriloop_token") || "";

export function setToken(value) {
  token = value || "";

  if (token) {
    localStorage.setItem("agriloop_token", token);
  } else {
    localStorage.removeItem("agriloop_token");
  }
}

async function request(path, options = {}) {
  const isPublicAuth =
    path === "/api/auth/login" || path === "/api/auth/register";

  const headers = {
    "Content-Type": "application/json",
    ...(!isPublicAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Use the default message if the response is not JSON.
    }

    if (path === "/api/auth/login" && response.status === 401) {
      message = "Incorrect email or password. Please try again.";
    }

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

export const login = async (data) => {
  const result = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  setToken(result.token);
  return result.user;
};

export const register = async (data) => {
  const result = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  setToken(result.token);
  return result.user;
};

export const getMe = async () => {
  if (!token) return null;

  try {
    return await request("/api/auth/me");
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      setToken("");
      return null;
    }

    throw error;
  }
};

export const logout = () => setToken("");

export const getMachinery = () => request("/api/machinery");

export const addMachinery = (data) =>
  request("/api/machinery", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateMachinery = (id, data) =>
  request(`/api/machinery/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteMachinery = (id) =>
  request(`/api/machinery/${id}`, {
    method: "DELETE",
  });

export const getBookings = () => request("/api/bookings");

export const addBooking = (data) =>
  request("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const setBookingStatus = (id, value) =>
  request(`/api/bookings/${id}/status?value=${encodeURIComponent(value)}`, {
    method: "PATCH",
  });
