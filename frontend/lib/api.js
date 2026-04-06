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
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || "API error");
  return data;
}

export async function adminFetch(path, options = {}) {
  return apiFetch(path, {
    ...options,
    headers: { ...adminHeaders(), ...(options.headers || {}) },
  });
}
