/**
 * System admin proxy routes: scan, digest, subscribers, ambassadors, partnerships
 * All require system_admin role in the NextAuth session.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { adminFetch } from "../../../lib/api";

function isSystemAdmin(session) {
  return session?.userRole === "system_admin";
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSystemAdmin(session)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");

    const resourceMap = {
      subscribers: "/admin/subscribers",
      ambassadors: "/admin/ambassadors",
      partnerships: "/admin/partnerships",
    };

    const path = resourceMap[resource];
    if (!path) return Response.json({ error: "Unknown resource" }, { status: 400 });

    const data = await adminFetch(path);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSystemAdmin(session)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "scan") {
      const data = await adminFetch("/admin/scan", { method: "POST" });
      return Response.json(data);
    }
    if (action === "digest") {
      const data = await adminFetch("/test-digest", { method: "POST" });
      return Response.json(data);
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
