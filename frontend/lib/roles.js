export function inferUserRole(email) {
  const normalized = String(email || "").toLowerCase().trim();
  if (!normalized) return "blocked";

  const adminEmails = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(normalized)) return "system_admin";

  const clubAdminEmails = String(process.env.CLUB_ADMIN_EMAILS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (clubAdminEmails.includes(normalized)) return "club_admin";

  // .edu emails get student role; all others are blocked
  if (!normalized.endsWith(".edu")) return "blocked";

  return "student";
}
