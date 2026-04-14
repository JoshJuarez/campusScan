/**
 * Server-side helper: all calls to the FastAPI backend.
 * Never import this in client components — it uses server-only env vars.
 */

const API_URL = process.env.API_URL || "http://localhost:8000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

function adminHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ADMIN_PASSWORD}`,
  };
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const raw = await res.text();
  let data = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw };
    }
  }

  if (!res.ok) throw new Error(data.detail || data.error || `API error (${res.status})`);
  return data;
}

export async function adminFetch(path, options = {}) {
  return apiFetch(path, {
    ...options,
    headers: { ...adminHeaders(), ...(options.headers || {}) },
  });
}
