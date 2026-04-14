"use client";

export default function CalendarButton({ event }) {
  if (!event?.start_iso) return null;

  function buildCalendarUrl() {
    // Google Calendar expects dates as YYYYMMDDTHHmmssZ (no dashes, colons, or ms)
    const fmt = (iso) =>
      iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "").replace("Z", "Z");

    const start = fmt(new Date(event.start_iso).toISOString());
    const end = event.end_iso
      ? fmt(new Date(event.end_iso).toISOString())
      : fmt(new Date(new Date(event.start_iso).getTime() + 60 * 60 * 1000).toISOString());

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title || "",
      dates: `${start}/${end}`,
      details: event.description || event.summary || "",
      location: event.location || "",
    });

    return `https://calendar.google.com/calendar/render?${params}`;
  }

  return (
    <div style={{ marginTop: 12 }}>
      <a
        href={buildCalendarUrl()}
        target="_blank"
        rel="noreferrer"
        className="button"
      >
        Add to Google Calendar
      </a>
    </div>
  );
}
