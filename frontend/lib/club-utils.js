export function slugifyClubName(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCaseFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getEventClubNames(eventItem) {
  const values = Array.isArray(eventItem?.club_names)
    ? eventItem.club_names
    : [eventItem?.club_name];
  const seen = new Set();
  const clubNames = [];
  for (const item of values) {
    const name = String(item || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    clubNames.push(name);
  }
  return clubNames;
}

export function getPrimaryClubName(eventItem) {
  return getEventClubNames(eventItem)[0] || "";
}

export function isCollabEvent(eventItem) {
  return getEventClubNames(eventItem).length > 1;
}

export function eventHasClubSlug(eventItem, clubSlug) {
  return getEventClubNames(eventItem).some((n) => slugifyClubName(n) === clubSlug);
}

export function expandEventsByClub(events) {
  return events.flatMap((e) =>
    getEventClubNames(e).map((clubName) => ({
      ...e,
      clubName,
      clubSlug: slugifyClubName(clubName),
    }))
  );
}
