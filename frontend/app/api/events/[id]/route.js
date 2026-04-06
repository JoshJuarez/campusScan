/**
 * PATCH /api/events/[id]  — approve / reject / edit
 * DELETE /api/events/[id] — permanently delete
 */
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { adminFetch } from "../../../../lib/api";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!["club_admin", "system_admin"].includes(session?.userRole)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const event = await adminFetch(`/events/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...body, reviewed_by: session.user.email }),
    });
    return Response.json(event);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!["club_admin", "system_admin"].includes(session?.userRole)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const result = await adminFetch(`/events/${params.id}`, { method: "DELETE" });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
