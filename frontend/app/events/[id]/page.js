import Link from "next/link";
import { notFound } from "next/navigation";
import CalendarButton from "./calendar-button";
import { getEventClubNames, isCollabEvent, slugifyClubName } from "../../../lib/club-utils";
import { formatEventDateTime } from "../../../lib/event-presentation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getDirectionsEmbed(url) {
  const value = String(url || "").trim();
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
      const videoId = host === "youtu.be"
        ? parsed.pathname.split("/").filter(Boolean)[0]
        : parsed.searchParams.get("v");
      if (videoId) return { type: "iframe", src: `https://www.youtube.com/embed/${videoId}` };
    }
    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) return { type: "iframe", src: `https://player.vimeo.com/video/${videoId}` };
    }
    if (/\.(mp4|webm|ogg)$/i.test(parsed.pathname)) return { type: "video", src: value };
  } catch {}
  return { type: "link", src: value };
}

async function getEvent(id) {
  const res = await fetch(`${API_URL}/events/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function EventDetailPage({ params }) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  const clubNames = getEventClubNames(event);
  const collab = isCollabEvent(event);
  const directionsMedia = getDirectionsEmbed(event.directions_video_url);

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      <div className="shell">
        <p style={{ marginBottom: 12 }}>
          <Link href="/events">← Back to Events</Link>
          {clubNames.length > 0 && (
            <>{" · "}<Link href={`/clubs/${slugifyClubName(clubNames[0])}`}>Club Page</Link></>
          )}
        </p>

        <section className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 0, overflow: "hidden" }}>
          <div
            style={{
              minHeight: 300,
              background: event.image_url
                ? `center / cover no-repeat url(${event.image_url})`
                : "linear-gradient(120deg, rgba(127,29,29,0.12) 0%, rgba(216,164,58,0.2) 100%)",
            }}
          />
          <div style={{ padding: 26 }}>
            <p className="eyebrow">Campus Event</p>
            {collab && <div className="chip-row" style={{ marginBottom: 10 }}><span className="chip">Collab Event</span></div>}
            <h1 className="headline" style={{ marginTop: 0, fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
              {event.title}
            </h1>
            {event.summary && <p style={{ color: "var(--muted)" }}>{event.summary}</p>}
            <p><strong>When:</strong> {formatEventDateTime(event.start_iso, event.end_iso)}</p>
            <p><strong>Where:</strong> {event.location || "TBD"}</p>
            {clubNames.length > 0 && (
              <p>
                <strong>{collab ? "Hosted by:" : "Club:"}</strong>{" "}
                {clubNames.map((name, i) => (
                  <span key={name}>
                    {i > 0 ? ", " : ""}
                    <Link href={`/clubs/${slugifyClubName(name)}`}>{name}</Link>
                  </span>
                ))}
              </p>
            )}
            {event.university && <p><strong>Campus:</strong> {event.university}</p>}
            <CalendarButton event={event} />
            {event.event_url && (
              <p style={{ marginTop: 10 }}>
                <a href={event.event_url} target="_blank" rel="noreferrer">Related link</a>
              </p>
            )}
          </div>
        </section>

        {event.description && (
          <section className="card" style={{ marginTop: 20, padding: 24 }}>
            <h2 className="headline" style={{ marginTop: 0, fontSize: "1.8rem" }}>Details</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{event.description}</p>
            {event.tags?.length > 0 && (
              <div className="chip-row" style={{ marginTop: 12 }}>
                {event.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            )}
          </section>
        )}

        {directionsMedia && (
          <section className="card" style={{ marginTop: 20, padding: 24 }}>
            <h2 className="headline" style={{ marginTop: 0, fontSize: "1.8rem" }}>Directions</h2>
            {directionsMedia.type === "iframe" && (
              <iframe src={directionsMedia.src} title="Directions" allowFullScreen style={{ width: "100%", aspectRatio: "16/9", border: 0, borderRadius: 14 }} />
            )}
            {directionsMedia.type === "video" && (
              <video controls src={directionsMedia.src} style={{ width: "100%", borderRadius: 14 }} />
            )}
            {directionsMedia.type === "link" && (
              <a href={directionsMedia.src} target="_blank" rel="noreferrer">Open directions video</a>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
