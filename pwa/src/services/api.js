const BASE = import.meta.env.VITE_API_URL || "";

// ── Pending queue for offline sync ────────────────────────────────────────────
const QUEUE_KEY = "budgetapp_offline_queue";

export function getQueue() {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
}

function enqueue(item) {
  const q = getQueue();
  q.push({ ...item, id: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function dequeue(id) {
  const q = getQueue().filter((i) => i.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export async function flushQueue() {
  const q = getQueue();
  for (const item of q) {
    try {
      await request(item.method, item.url, item.body, false);
      dequeue(item.id);
    } catch {
      break; // stop on first failure – still offline
    }
  }
}

// ── Core fetch ────────────────────────────────────────────────────────────────
async function request(method, path, body, queued = true) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    // Queue mutating operations when offline
    if (queued && ["POST", "PATCH", "DELETE"].includes(method) && !navigator.onLine) {
      enqueue({ method, url: path, body });
      return body; // optimistic return
    }
    throw err;
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (data) => request("POST", "/api/auth/register", data),
    login: (data) => request("POST", "/api/auth/login", data),
    me: () => request("GET", "/api/auth/me"),
  },
  transactions: {
    list: (params) => request("GET", `/api/transactions?${new URLSearchParams(params)}`),
    get: (id) => request("GET", `/api/transactions/${id}`),
    create: (data) => request("POST", "/api/transactions", data),
    update: (id, data) => request("PATCH", `/api/transactions/${id}`, data),
    delete: (id) => request("DELETE", `/api/transactions/${id}`),
    summary: (month, year) =>
      request("GET", `/api/transactions/summary/monthly?month=${month}&year=${year}`),
  },
  categories: {
    list: () => request("GET", "/api/categories"),
    create: (data) => request("POST", "/api/categories", data),
    update: (id, data) => request("PATCH", `/api/categories/${id}`, data),
    delete: (id) => request("DELETE", `/api/categories/${id}`),
  },
  budgets: {
    list: (month, year) => request("GET", `/api/budgets?month=${month}&year=${year}`),
    create: (data) => request("POST", "/api/budgets", data),
    delete: (id) => request("DELETE", `/api/budgets/${id}`),
  },
};
