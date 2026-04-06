"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getEventClubNames, getPrimaryClubName, isCollabEvent, slugifyClubName } from "../../lib/club-utils";
import { formatEventDateTime, getEventTimeStatus } from "../../lib/event-presentation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TAG_OPTIONS = ["all", "food", "career", "social", "music", "sports"];

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [university, setUniversity] = useState("");
  const [universities, setUniversities] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/universities`)
      .then((r) => r.json())
      .then((d) => setUniversities(d.universities || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ includePast: "0" });
    if (query.trim()) params.set("q", query.trim());
    if (tag !== "all") params.set("tag", tag);
    if (university) params.set("university", university);

    fetch(`${API_URL}/events?${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { if (active) setEvents(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, tag, university]);

  const feed = useMemo(() =>
    events
      .map((e) => ({
        ...e,
        clubName: getPrimaryClubName(e),
        clubNames: getEventClubNames(e),
        clubSlug: slugifyClubName(getPrimaryClubName(e)),
        label: e.tags?.includes("food") || e.has_food ? "Free Food" : "Event",
        isCollab: isCollabEvent(e),
        timing: getEventTimeStatus(e),
      }))
      .sort((a, b) => {
        const at = a.start_iso ? new Date(a.start_iso).getTime() : Number.MAX_SAFE_INTEGER;
        const bt = b.start_iso ? new Date(b.start_iso).getTime() : Number.MAX_SAFE_INTEGER;
        return at - bt;
      }),
    [events]
  );

  return (
    <main style={{ minHeight: "100vh" }}>
      <div className="shell">
        <section className="hero-panel">
          <p className="eyebrow">Campus Event Feed</p>
          <h1 className="headline" style={{ margin: "8px 0 12px", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            What's happening on campus today
          </h1>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Events automatically collected from student ambassador inboxes, plus community submissions.
          </p>
          {session && ["club_admin", "system_admin"].includes(session.userRole) && (
            <div style={{ marginTop: 14 }}>
              <Link href="/submit" className="button button--ghost">
                Submit an Event
              </Link>
            </div>
          )}
        </section>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <input
            placeholder="Search title, club, location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 220, flex: 1 }}
          />
          <select value={tag} onChange={(e) => setTag(e.target.value)} style={{ width: "auto", flex: "none" }}>
            {TAG_OPTIONS.map((t) => (
              <option key={t} value={t}>{t === "all" ? "All categories" : t}</option>
            ))}
          </select>
          {universities.length > 0 && (
            <select value={university} onChange={(e) => setUniversity(e.target.value)} style={{ width: "auto", flex: "none" }}>
              <option value="">All universities</option>
              {universities.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}
        {notice && <p className="success-message">{notice}</p>}
        {loading && <p style={{ color: "var(--muted)" }}>Loading events...</p>}
        {!loading && feed.length === 0 && <p style={{ color: "var(--muted)" }}>No upcoming events found.</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {feed.map((e) => (
            <article key={e.id} className="card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  height: 160,
                  background: e.image_url
                    ? `center / cover no-repeat url(${e.image_url})`
                    : "linear-gradient(120deg, rgba(127,29,29,0.12) 0%, rgba(216,164,58,0.18) 100%)",
                }}
              />
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 6, fontWeight: 700 }}>
                  {e.label}
                </div>
                <h3 className="headline" style={{ margin: "0 0 8px", fontSize: "1.2rem" }}>
                  <Link href={`/events/${e.id}`} style={{ color: "var(--ink)", textDecoration: "none" }}>
                    {e.title}
                  </Link>
                </h3>
                <div className="chip-row" style={{ marginBottom: 10 }}>
                  {e.isCollab && <span className="chip">Collab</span>}
                  <span className="chip">
                    {e.timing === "past" ? "Past" : e.timing === "in_progress" ? "Happening now" : e.timing === "unscheduled" ? "Date TBD" : "Upcoming"}
                  </span>
                  {(e.tags || []).slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}
                </div>
                {e.clubNames?.length > 0 && (
                  <p style={{ margin: "0 0 6px", color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" }}>
                    {e.isCollab ? "Hosted by " : ""}
                    {e.clubNames.map((name, i) => (
                      <span key={name}>
                        {i > 0 ? ", " : ""}
                        <Link href={`/clubs/${slugifyClubName(name)}`}>{name}</Link>
                      </span>
                    ))}
                  </p>
                )}
                <p style={{ margin: "0 0 4px", fontSize: "0.88rem" }}>{formatEventDateTime(e.start_iso, e.end_iso)}</p>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem" }}>{e.location}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
