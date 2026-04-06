import Link from "next/link";
import { notFound } from "next/navigation";
import { eventHasClubSlug, getEventClubNames, titleCaseFromSlug } from "../../../lib/club-utils";
import { formatEventDateTime, sortEventsChronologically } from "../../../lib/event-presentation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAllEvents() {
  const res = await fetch(`${API_URL}/events?includePast=1`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function ClubPage({ params }) {
  const clubSlug = String(params.slug || "");
  const allEvents = await getAllEvents();
  const clubEvents = allEvents.filter((e) => eventHasClubSlug(e, clubSlug));

  if (clubEvents.length === 0) notFound();

  const clubName =
    clubEvents
      .flatMap((e) => getEventClubNames(e))
      .find((name) => {
        const slug = name.toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        return slug === clubSlug;
      }) || titleCaseFromSlug(clubSlug);

  const now = Date.now();
  const upcoming = sortEventsChronologically(
    clubEvents.filter((e) => !e.start_iso || new Date(e.start_iso).getTime() >= now)
  );
  const past = sortEventsChronologically(
    clubEvents.filter((e) => e.start_iso && new Date(e.start_iso).getTime() < now),
    "desc"
  );

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <div className="shell">
        <p style={{ marginBottom: 12 }}>
          <Link href="/events">Events</Link>
          {" · "}
          <Link href="/clubs">All Clubs</Link>
        </p>

        <section className="hero-panel">
          <p className="eyebrow">Club Page</p>
          <h1 className="headline" style={{ margin: "8px 0 12px", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            {clubName}
          </h1>
          <div className="stat-grid">
            <div className="stat-tile"><strong>{upcoming.length}</strong><div>Upcoming events</div></div>
            <div className="stat-tile"><strong>{clubEvents.length}</strong><div>Total events</div></div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 18 }}>
            <section className="card" style={{ padding: 20 }}>
              <h2 className="headline" style={{ marginTop: 0, fontSize: "1.7rem" }}>Upcoming Events</h2>
              {upcoming.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>No upcoming events posted yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {upcoming.map((e) => (
                    <article key={e.id} style={{ border: "1px solid var(--panel-border)", borderRadius: 12, padding: 14, background: "#fffcfb" }}>
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
                        {formatEventDateTime(e.start_iso, e.end_iso)}
                      </p>
                      <h3 className="headline" style={{ margin: "0 0 6px", fontSize: "1.15rem" }}>
                        <Link href={`/events/${e.id}`} style={{ color: "var(--ink)", textDecoration: "none" }}>{e.title}</Link>
                      </h3>
                      {e.summary && <p style={{ margin: "0 0 4px", color: "var(--ink)", fontSize: "0.9rem" }}>{e.summary}</p>}
                      <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.85rem" }}>{e.location}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {past.length > 0 && (
              <section className="card" style={{ padding: 20 }}>
                <h2 className="headline" style={{ marginTop: 0, fontSize: "1.7rem" }}>Recent Activity</h2>
                <div style={{ display: "grid", gap: 8 }}>
                  {past.slice(0, 5).map((e) => (
                    <article key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: "1px solid var(--panel-border)" }}>
                      <div>
                        <strong>
                          <Link href={`/events/${e.id}`} style={{ color: "var(--ink)" }}>{e.title}</Link>
                        </strong>
                        {e.location && <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>{e.location}</p>}
                      </div>
                      <span style={{ color: "var(--accent)", whiteSpace: "nowrap", fontWeight: 700, fontSize: "0.85rem" }}>
                        {formatEventDateTime(e.start_iso, e.end_iso)}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside>
            <section className="card" style={{ padding: 20 }}>
              <h2 className="headline" style={{ marginTop: 0, fontSize: "1.6rem" }}>Club Snapshot</h2>
              <p style={{ margin: "0 0 8px" }}><strong>Featured event:</strong> {upcoming[0]?.title || past[0]?.title || "None yet"}</p>
              {(upcoming[0] || past[0]) && (
                <p style={{ margin: "0 0 8px" }}>
                  <strong>Date:</strong>{" "}
                  {formatEventDateTime((upcoming[0] || past[0]).start_iso, (upcoming[0] || past[0]).end_iso)}
                </p>
              )}
              <p style={{ margin: 0 }}>
                <strong>Tags:</strong>{" "}
                {[...new Set(clubEvents.flatMap((e) => e.tags || []))].slice(0, 5).join(", ") || "campus life"}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
