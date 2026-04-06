/**
 * POST /api/events  — club_admin submits a new event
 * GET  /api/events  — admin fetches all statuses (for review queue)
 */
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { adminFetch } from "../../../lib/api";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["club_admin", "system_admin"].includes(session.userRole)) {
      return Response.json({ error: "Only club admins can submit events." }, { status: 403 });
    }

    const body = await request.json();
    const event = await adminFetch("/events", {
      method: "POST",
      body: JSON.stringify({ ...body, posted_by: session.user.email }),
    });
    return Response.json(event, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!["club_admin", "system_admin"].includes(session?.userRole)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const university = searchParams.get("university") || "";
    const qs = university ? `?university=${encodeURIComponent(university)}` : "";
    const events = await adminFetch(`/events/all${qs}`);
    return Response.json(events);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
