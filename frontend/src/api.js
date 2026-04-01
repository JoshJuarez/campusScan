import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const getUniversities = () => API.get("/universities");
export const subscribePhone = (payload) => API.post("/subscribe", payload);
export const createPartnershipLead = (payload) => API.post("/partnerships", payload);

const adminHeaders = (password) => ({
  headers: { Authorization: `Bearer ${password}` },
});

export const getAdminSubscribers = (password) =>
  API.get("/admin/subscribers", adminHeaders(password));
export const getAdminAmbassadors = (password) =>
  API.get("/admin/ambassadors", adminHeaders(password));
export const getAdminEvents = (password) =>
  API.get("/admin/events", adminHeaders(password));
export const getAdminPartnerships = (password) =>
  API.get("/admin/partnerships", adminHeaders(password));
export const runAdminScan = (password) =>
  API.post("/admin/scan", null, adminHeaders(password));
export const deleteAdminEvent = (eventId, password) =>
  API.delete(`/admin/events/${eventId}`, adminHeaders(password));
export const sendTestDigest = (password) =>
  API.post("/test-digest", null, adminHeaders(password));
