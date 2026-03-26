import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const subscribePhone = (payload) => API.post("/subscribe", payload);
export const createPartnershipLead = (payload) => API.post("/partnerships", payload);
export const getAdminSubscribers = (password) => API.get(`/admin/subscribers?password=${password}`);
export const getAdminEvents = (password) => API.get(`/admin/events?password=${password}`);
export const getAdminPartnerships = (password) => API.get(`/admin/partnerships?password=${password}`);
export const runAdminScan = (password) => API.post(`/admin/scan?password=${password}`);
export const deleteAdminEvent = (eventId, password) =>
  API.delete(`/admin/events/${eventId}?password=${password}`);
export const sendTestDigest = () => API.post("/test-digest");
