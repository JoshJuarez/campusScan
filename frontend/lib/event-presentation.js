function toTime(value) {
  const parsed = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatEventDateTime(startIso, endIso) {
  const startTime = toTime(startIso);
  if (!startTime) return "Date TBD";

  const start = new Date(startTime);
  const endTime = toTime(endIso);
  const dateText = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startText = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!endTime) return `${dateText} at ${startText}`;

  const end = new Date(endTime);
  const sameDay = start.toDateString() === end.toDateString();
  const endText = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (sameDay) return `${dateText}, ${startText} – ${endText}`;

  const endDateText = end.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${dateText} ${startText} – ${endDateText} ${endText}`;
}

export function getEventTimeStatus(eventItem, now = Date.now()) {
  const startTime = toTime(eventItem?.start_iso);
  const endTime = toTime(eventItem?.end_iso);
  const effectiveEnd = endTime ?? (startTime ? startTime + 60 * 60 * 1000 : null);

  if (!startTime) return "unscheduled";
  if (effectiveEnd && effectiveEnd < now) return "past";
  if (startTime < now) return "in_progress";
  return "upcoming";
}

export function sortEventsChronologically(events, direction = "asc") {
  const m = direction === "desc" ? -1 : 1;
  return [...events].sort((a, b) => {
    const aTime = toTime(a?.start_iso) ?? Number.MAX_SAFE_INTEGER;
    const bTime = toTime(b?.start_iso) ?? Number.MAX_SAFE_INTEGER;
    if (aTime === bTime) return m * String(a?.title || "").localeCompare(String(b?.title || ""));
    return m * (aTime - bTime);
  });
}

export function summarizeClubs(events, now = Date.now()) {
  const clubMap = new Map();

  events.forEach((e) => {
    const clubName = String(e?.clubName || "").trim();
    if (!clubName) return;
    const slug = String(e?.clubSlug || "").trim();
    if (!slug) return;

    const existing = clubMap.get(slug) || {
      slug,
      clubName,
      imageUrl: "",
      summary: "",
      eventCount: 0,
      upcomingCount: 0,
      nextEvent: null,
      latestEvent: null,
    };

    existing.eventCount += 1;
    if (!existing.imageUrl && e.image_url) existing.imageUrl = e.image_url;
    if (!existing.summary && e.summary) existing.summary = e.summary;

    const status = getEventTimeStatus(e, now);
    if (["upcoming", "in_progress", "unscheduled"].includes(status)) {
      existing.upcomingCount += 1;
      if (!existing.nextEvent) {
        existing.nextEvent = e;
      } else {
        const et = toTime(existing.nextEvent.start_iso) ?? Number.MAX_SAFE_INTEGER;
        const ct = toTime(e.start_iso) ?? Number.MAX_SAFE_INTEGER;
        if (ct < et) existing.nextEvent = e;
      }
    }

    if (!existing.latestEvent) {
      existing.latestEvent = e;
    } else {
      const et = toTime(existing.latestEvent.start_iso) ?? 0;
      const ct = toTime(e.start_iso) ?? 0;
      if (ct > et) existing.latestEvent = e;
    }

    clubMap.set(slug, existing);
  });

  return [...clubMap.values()];
}
