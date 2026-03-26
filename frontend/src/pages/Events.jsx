import { useState } from "react";
import {
  deleteAdminEvent,
  getAdminEvents,
  getAdminPartnerships,
  getAdminSubscribers,
  runAdminScan,
  sendTestDigest,
} from "../api";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const handleLogin = async () => {
    try {
      const [subscriberRes, eventsRes, partnershipsRes] = await Promise.all([
        getAdminSubscribers(password),
        getAdminEvents(password),
        getAdminPartnerships(password),
      ]);

      setStats(subscriberRes.data);
      setEvents(eventsRes.data.events);
      setPartnerships(partnershipsRes.data.leads);
      setLoggedIn(true);
      setError("");
    } catch (err) {
      setError("Wrong password");
    }
  };

  const refreshDashboard = async () => {
    const [subscriberRes, eventsRes, partnershipsRes] = await Promise.all([
      getAdminSubscribers(password),
      getAdminEvents(password),
      getAdminPartnerships(password),
    ]);

    setStats(subscriberRes.data);
    setEvents(eventsRes.data.events);
    setPartnerships(partnershipsRes.data.leads);
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await runAdminScan(password);
      alert(`Scanned ${res.data.scanned} emails, found ${res.data.new_events} new events`);
      refreshDashboard();
    } catch (err) {
      alert("Scan failed");
    }
    setScanning(false);
  };

  const handleDelete = async (eventId) => {
    await deleteAdminEvent(eventId, password);
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleTestDigest = async () => {
    await sendTestDigest();
    alert("Digest sent to all subscribers!");
  };

  if (!loggedIn) {
    return (
      <div className="admin-shell">
        <h1>CampusScan Admin</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <h1>CampusScan Admin</h1>

      {stats && (
        <div className="admin-stats">
          <p>Total subscribers: {stats.total}</p>
          <p>Active subscribers: {stats.active}</p>
          <p>Partnership requests: {partnerships.length}</p>
        </div>
      )}

      <div className="admin-actions">
        <button onClick={handleScan} disabled={scanning}>
          {scanning ? "Scanning..." : "Scan Inbox"}
        </button>
        <button onClick={handleTestDigest}>
          Send Test Digest
        </button>
      </div>

      <h2>Detected Events ({events.length})</h2>
      {events.length === 0 && <p>No events yet. Click Scan Inbox to start.</p>}
      {events.map((event) => (
        <div key={event.id} className="admin-card">
          <h3>{event.title}</h3>
          {event.has_food && <span>🍕 Free Food — {event.food_keywords?.join(", ")}</span>}
          <p>{event.event_date} {event.event_time && `at ${event.event_time}`}</p>
          <p>📍 {event.location}</p>
          <p>Club: {event.club}</p>
          <p>Confidence: {event.confidence}</p>
          <button onClick={() => handleDelete(event.id)} className="danger-button">
            Delete
          </button>
        </div>
      ))}

      <h2>University Partnership Requests ({partnerships.length})</h2>
      {partnerships.length === 0 && <p>No meeting requests yet.</p>}
      {partnerships.map((lead) => (
        <div key={lead.id} className="admin-card">
          <h3>{lead.university}</h3>
          <p>Contact: {lead.contact_name}</p>
          <p>Email: {lead.email}</p>
          {lead.phone_number && <p>Phone: {lead.phone_number}</p>}
          {lead.preferred_timing && <p>Preferred timing: {lead.preferred_timing}</p>}
          {lead.message && <p>Notes: {lead.message}</p>}
        </div>
      ))}
    </div>
  );
}
