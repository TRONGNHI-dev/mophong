const API_BASE_URL = "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Yêu cầu thất bại.");
  }

  return data;
}

export const bizpracApi = {
  health() {
    return request("/health");
  },

  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  login(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getClassrooms() {
    return request("/classrooms");
  },

  createClassroom(payload) {
    return request("/classrooms", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getInventoryItems(status) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request(`/inventory${query}`);
  },

  createInventoryItem(payload) {
    return request("/inventory", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updateInventoryItem(id, payload) {
    return request(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  deleteInventoryItem(id) {
    return request(`/inventory/${id}`, {
      method: "DELETE"
    });
  },

  getSessions() {
    return request("/sessions");
  },

  createSession(payload) {
    return request("/sessions", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
