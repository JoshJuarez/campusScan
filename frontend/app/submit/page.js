"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

const initialForm = {
  title: "", description: "", clubNames: "", location: "",
  start_iso: "", end_iso: "", tags: "", imageUrl: "",
  event_url: "", directions_video_url: "", university: "",
};

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onFlyerChange(e) {
    const file = e.target.files?.[0];
    if (!file) { setForm((f) => ({ ...f, imageUrl: "" })); return; }
    if (!file.type.startsWith("image/")) { setError("Flyer must be an image file."); return; }
    if (file.size > 4 * 1024 * 1024) { setError("Flyer must be 4 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = () => { setError(""); setForm((f) => ({ ...f, imageUrl: String(reader.result || "") })); };
    reader.onerror = () => { setError("Failed to read the flyer."); };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const clubNames = form.clubNames.split(",").map((s) => s.trim()).filter(Boolean);
      const tags = form.tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          club_names: clubNames,
          location: form.location,
          start_iso: form.start_iso ? new Date(form.start_iso).toISOString() : null,
          end_iso: form.end_iso ? new Date(form.end_iso).toISOString() : null,
          tags,
          image_url: form.imageUrl || null,
          event_url: form.event_url || null,
          directions_video_url: form.directions_video_url || null,
          university: form.university || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit event.");
      setNotice("Event submitted! It will appear in the feed after admin approval.");
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return <main className="shell" style={{ paddingTop: 24 }}>Loading...</main>;

  if (!session) {
    return (
      <main className="shell" style={{ paddingTop: 24 }}>
        <div className="panel" style={{ maxWidth: 480 }}>
          <h1 className="headline">Submit Club Event</h1>
          <p className="panel-text">Sign in with your .edu account to submit events.</p>
          <button type="button" onClick={() => signIn("google")}>Sign in with Google</button>
        </div>
      </main>
    );
  }

  if (!["club_admin", "system_admin"].includes(session.userRole)) {
    return (
      <main className="shell" style={{ paddingTop: 24 }}>
        <div className="panel" style={{ maxWidth: 480 }}>
          <h1 className="headline">Submit Club Event</h1>
          <p className="panel-text">
            Only club admins can submit events. If you should have access, ask the CampusScan admin to add your email.
          </p>
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
            Submit Club Event
          </h1>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Submitted events are held for review before appearing in the public feed.
          </p>
        </section>

        <section className="card" style={{ padding: 24, maxWidth: 860, marginTop: 20 }}>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <label>
                Event title
                <input name="title" placeholder="Spring community dinner" value={form.title} onChange={onChange} required style={{ marginTop: 4 }} />
              </label>
              <label>
                Club name(s) <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>(comma-separated)</span>
                <input name="clubNames" placeholder="Campus Ministry, Student Govt" value={form.clubNames} onChange={onChange} required style={{ marginTop: 4 }} />
              </label>
            </div>

            <label>
              Description
              <textarea name="description" placeholder="What is the event, who is it for, and why should students come?" value={form.description} onChange={onChange} rows={5} required style={{ marginTop: 4 }} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <label>
                Location
                <input name="location" placeholder="Student Center, Room 204" value={form.location} onChange={onChange} required style={{ marginTop: 4 }} />
              </label>
              <label>
                University
                <input name="university" placeholder="Fordham University" value={form.university} onChange={onChange} style={{ marginTop: 4 }} />
              </label>
              <label>
                Tags <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>(comma-separated)</span>
                <input name="tags" placeholder="food, social, career" value={form.tags} onChange={onChange} style={{ marginTop: 4 }} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <label>
                Start date & time
                <input type="datetime-local" name="start_iso" value={form.start_iso} onChange={onChange} required style={{ marginTop: 4 }} />
              </label>
              <label>
                End date & time
                <input type="datetime-local" name="end_iso" value={form.end_iso} onChange={onChange} style={{ marginTop: 4 }} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <label>
                Event flyer <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>(optional, max 4 MB)</span>
                <input type="file" accept="image/*" onChange={onFlyerChange} style={{ marginTop: 4 }} />
              </label>
              <label>
                Related link
                <input name="event_url" placeholder="RSVP, Instagram, website..." value={form.event_url} onChange={onChange} style={{ marginTop: 4 }} />
              </label>
              <label>
                Directions video URL
                <input name="directions_video_url" placeholder="YouTube or Vimeo link" value={form.directions_video_url} onChange={onChange} style={{ marginTop: 4 }} />
              </label>
            </div>

            {form.imageUrl && (
              <div>
                <p style={{ marginBottom: 8, fontSize: "0.85rem", color: "var(--muted)" }}>Flyer preview</p>
                <div style={{ width: "min(200px, 100%)", aspectRatio: "3/4", borderRadius: 14, border: "1px solid var(--panel-border)", background: `center / cover no-repeat url(${form.imageUrl})` }} />
              </div>
            )}

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Event"}
              </button>
              <Link href="/events" style={{ color: "var(--muted)" }}>Cancel</Link>
            </div>

            {error && <p className="error-message">{error}</p>}
            {notice && <p className="success-message">{notice}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
