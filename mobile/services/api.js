import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://budgetapp-production-1afe.up.railway.app"; // Android emulator → localhost
// For physical device: use your computer's local IP e.g. http://192.168.1.x:8000
// For production: replace with deployed URL

async function getToken() {
  return await SecureStore.getItemAsync("token");
}

async function request(method, path, body) {
  const token = await getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
  return data;
}

export const api = {
  auth: {
    login: (email, password) =>
      request("POST", "/api/auth/login", { email, password }),
    register: (email, username, password) =>
      request("POST", "/api/auth/register", { email, username, password }),
    me: () => request("GET", "/api/auth/me"),
  },
  transactions: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("GET", `/api/transactions?${q}`);
    },
    create: (data) => request("POST", "/api/transactions", data),
    update: (id, data) => request("PATCH", `/api/transactions/${id}`, data),
    delete: (id) => request("DELETE", `/api/transactions/${id}`),
    summary: (month, year) =>
      request("GET", `/api/transactions/summary/monthly?month=${month}&year=${year}`),
  },
  categories: {
    list: () => request("GET", "/api/categories"),
    create: (data) => request("POST", "/api/categories", data),
    delete: (id) => request("DELETE", `/api/categories/${id}`),
  },
};
