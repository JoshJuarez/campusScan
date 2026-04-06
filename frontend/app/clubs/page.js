import Link from "next/link";
import { expandEventsByClub } from "../../lib/club-utils";
import { formatEventDateTime, summarizeClubs } from "../../lib/event-presentation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getApprovedEvents() {
  const res = await fetch(`${API_URL}/events?includePast=1`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function ClubsDirectoryPage() {
  const events = await getApprovedEvents();
  const clubs = summarizeClubs(expandEventsByClub(events)).sort((a, b) =>
    a.clubName.localeCompare(b.clubName)
  );

  return (
    <main style={{ minHeight: "100vh" }}>
      <div className="shell">
        <section className="hero-panel">
          <p className="eyebrow">Clubs Directory</p>
          <h1 className="headline" style={{ margin: "8px 0 12px", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            Browse campus organizations through their events
          </h1>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Every club with an approved event gets a public page. Find the organizations active on your campus.
          </p>
          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="stat-tile">
              <strong>{clubs.length}</strong>
              <div>Active organizations</div>
            </div>
            <div className="stat-tile">
              <strong>{events.length}</strong>
              <div>Total approved events</div>
            </div>
          </div>
        </section>

        {clubs.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No clubs yet. Events will appear here once ambassadors are connected.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {clubs.map((club) => (
              <Link key={club.slug} href={`/clubs/${club.slug}`} style={{ textDecoration: "none" }}>
                <article className="card" style={{ overflow: "hidden", height: "100%" }}>
                  <div
                    style={{
                      height: 140,
                      background: club.imageUrl
                        ? `center / cover no-repeat url(${club.imageUrl})`
                        : "linear-gradient(120deg, rgba(127,29,29,0.12) 0%, rgba(216,164,58,0.18) 100%)",
                    }}
                  />
                  <div style={{ padding: 18 }}>
                    <p className="eyebrow">Club</p>
                    <h2 className="headline" style={{ marginBottom: 8, fontSize: "1.5rem" }}>
                      {club.clubName}
                    </h2>
                    <p style={{ color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.5 }}>
                      {club.summary || "See current and past events from this organization."}
                    </p>
                    <p style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>
                      <strong>{club.eventCount}</strong> approved event{club.eventCount === 1 ? "" : "s"}
                    </p>
                    <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.85rem" }}>
                      {club.nextEvent
                        ? `Next: ${club.nextEvent.title}`
                        : `Latest: ${club.latestEvent?.title || "TBD"}`}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
