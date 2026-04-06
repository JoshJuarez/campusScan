"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { getEventClubNames } from "../../../lib/club-utils";
import { formatEventDateTime } from "../../../lib/event-presentation";

function toFormState(e) {
  return {
    title: e.title || "",
    description: e.description || "",
    clubNames: getEventClubNames(e).join(", "),
    location: e.location || "",
    start_iso: e.start_iso ? String(e.start_iso).slice(0, 16) : "",
    end_iso: e.end_iso ? String(e.end_iso).slice(0, 16) : "",
    tags: Array.isArray(e.tags) ? e.tags.join(", ") : "",
    image_url: e.image_url || "",
    event_url: e.event_url || "",
    directions_video_url: e.directions_video_url || "",
  };
}

export default function ReviewPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events.");
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (["club_admin", "system_admin"].includes(session?.userRole)) loadEvents();
    else setLoading(false);
  }, [session?.userRole]);

  const filtered = useMemo(() =>
    filter === "all" ? events : events.filter((e) => e.status === filter),
    [events, filter]
  );

  async function review(id, nextStatus) {
    setWorkingId(id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status.");
      setMessage(`Event ${nextStatus}.`);
      setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: nextStatus } : e));
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingId(null);
    }
  }

  async function remove(id) {
    if (!confirm("Permanently delete this event?")) return;
    setWorkingId(id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event.");
      setMessage("Event deleted.");
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingId(null);
    }
  }

  async function saveEdit(id) {
    if (!editForm) return;
    setWorkingId(id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          club_names: editForm.clubNames.split(",").map((s) => s.trim()).filter(Boolean),
          location: editForm.location,
          start_iso: editForm.start_iso ? new Date(editForm.start_iso).toISOString() : null,
          end_iso: editForm.end_iso ? new Date(editForm.end_iso).toISOString() : null,
          tags: editForm.tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
          image_url: editForm.image_url || null,
          event_url: editForm.event_url || null,
          directions_video_url: editForm.directions_video_url || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save event.");
      setEvents((prev) => prev.map((e) => e.id === id ? data : e));
      setMessage("Event updated.");
      setEditingId(null);
      setEditForm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingId(null);
    }
  }

  if (status === "loading") return <main className="shell" style={{ paddingTop: 24 }}>Loading...</main>;

  if (!session) {
    return (
      <main className="shell" style={{ paddingTop: 24 }}>
        <div className="panel" style={{ maxWidth: 480 }}>
          <h1 className="headline">Review Queue</h1>
          <p className="panel-text">Sign in to review submitted events.</p>
          <button type="button" onClick={() => signIn("google")}>Sign in with Google</button>
        </div>
      </main>
    );
  }

  if (!["club_admin", "system_admin"].includes(session.userRole)) {
    return (
      <main className="shell" style={{ paddingTop: 24 }}>
        <div className="panel" style={{ maxWidth: 480 }}>
          <h1 className="headline">Review Queue</h1>
          <p className="panel-text">Only club admins can review submissions.</p>
          <Link href="/events">← Back to Events</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      <div className="shell">
        <section className="hero-panel">
          <p className="eyebrow">Club Admin</p>
          <h1 className="headline" style={{ margin: "8px 0 8px", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Review Queue
          </h1>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Approve, reject, edit, or delete submitted events before they go public.
          </p>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "16px 0 12px" }}>
          <Link href="/submit" className="button button--small">+ Submit New Event</Link>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: "auto" }}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All statuses</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        {loading && <p style={{ color: "var(--muted)" }}>Loading queue...</p>}
        {!loading && filtered.length === 0 && <p style={{ color: "var(--muted)" }}>No events match this filter.</p>}

        <div style={{ display: "grid", gap: 14 }}>
          {filtered.map((e) => (
            <article key={e.id} className="card" style={{ padding: 18 }}>
              <p className="eyebrow" style={{ marginBottom: 8 }}>{e.status} · {e.source}</p>

              {editingId === e.id && editForm ? (
                <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
                  <label>Title<input value={editForm.title} onChange={(ev) => setEditForm((f) => ({ ...f, title: ev.target.value }))} style={{ marginTop: 4 }} /></label>
                  <label>Description<textarea rows={4} value={editForm.description} onChange={(ev) => setEditForm((f) => ({ ...f, description: ev.target.value }))} style={{ marginTop: 4 }} /></label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                    <label>Club name(s)<input value={editForm.clubNames} onChange={(ev) => setEditForm((f) => ({ ...f, clubNames: ev.target.value }))} style={{ marginTop: 4 }} /></label>
                    <label>Location<input value={editForm.location} onChange={(ev) => setEditForm((f) => ({ ...f, location: ev.target.value }))} style={{ marginTop: 4 }} /></label>
                    <label>Start<input type="datetime-local" value={editForm.start_iso} onChange={(ev) => setEditForm((f) => ({ ...f, start_iso: ev.target.value }))} style={{ marginTop: 4 }} /></label>
                    <label>End<input type="datetime-local" value={editForm.end_iso} onChange={(ev) => setEditForm((f) => ({ ...f, end_iso: ev.target.value }))} style={{ marginTop: 4 }} /></label>
                    <label>Tags<input value={editForm.tags} onChange={(ev) => setEditForm((f) => ({ ...f, tags: ev.target.value }))} style={{ marginTop: 4 }} /></label>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="headline" style={{ marginTop: 0, marginBottom: 6, fontSize: "1.3rem" }}>{e.title}</h3>
                  <p style={{ margin: "0 0 4px", color: "var(--muted)", fontSize: "0.9rem" }}>
                    {getEventClubNames(e).join(", ")} · {formatEventDateTime(e.start_iso, e.end_iso)}
                  </p>
                  <p style={{ margin: "0 0 12px", color: "var(--muted)", fontSize: "0.9rem" }}>{e.location}</p>
                  {e.summary && <p style={{ margin: "0 0 10px", fontSize: "0.92rem" }}>{e.summary}</p>}
                </>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {editingId === e.id ? (
                  <>
                    <button type="button" onClick={() => saveEdit(e.id)} disabled={workingId === e.id}>{workingId === e.id ? "Saving..." : "Save"}</button>
                    <button type="button" className="button" onClick={() => { setEditingId(null); setEditForm(null); }} disabled={workingId === e.id} style={{ background: "none", color: "var(--muted)", boxShadow: "none" }}>Cancel</button>
                  </>
                ) : (
                  <button type="button" className="button button--small" onClick={() => { setEditingId(e.id); setEditForm(toFormState(e)); }} disabled={workingId === e.id}>Edit</button>
                )}
                {e.status !== "approved" && (
                  <button type="button" className="button button--small" onClick={() => review(e.id, "approved")} disabled={workingId === e.id}>Approve</button>
                )}
                {e.status !== "rejected" && (
                  <button type="button" className="button button--small" onClick={() => review(e.id, "rejected")} disabled={workingId === e.id}>Reject</button>
                )}
                {e.status !== "pending" && (
                  <button type="button" className="button button--small" onClick={() => review(e.id, "pending")} disabled={workingId === e.id}>Mark Pending</button>
                )}
                <button type="button" className="button button--small button--danger" onClick={() => remove(e.id)} disabled={workingId === e.id}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
