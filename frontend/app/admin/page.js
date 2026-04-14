"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

function AdminDashboardInner() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stats, setStats] = useState({ subscribers: null, ambassadors: null, partnerships: null });
  const [scanLoading, setScanLoading] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [connectedBanner, setConnectedBanner] = useState(false);
  const [ambassadorUniversity, setAmbassadorUniversity] = useState("");

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      setConnectedBanner(true);
      router.replace("/admin", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (session?.userRole !== "system_admin") return;
    Promise.all([
      fetch("/api/admin?resource=subscribers").then((r) => r.json()),
      fetch("/api/admin?resource=ambassadors").then((r) => r.json()),
      fetch("/api/admin?resource=partnerships").then((r) => r.json()),
    ])
      .then(([subs, ambs, leads]) => setStats({ subscribers: subs, ambassadors: ambs, partnerships: leads }))
      .catch((err) => setError(err.message));
  }, [session?.userRole]);

  async function handleScan() {
    setScanLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin?action=scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed.");
      setMessage(`Scan complete: ${data.emails_scanned} emails, ${data.new_events} new events.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanLoading(false);
    }
  }

  async function handleDigest() {
    setDigestLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin?action=digest", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Digest failed.");
      setMessage(data.message || "Digest sent.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDigestLoading(false);
    }
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (status === "loading") return <main className="shell" style={{ paddingTop: 24 }}>Loading...</main>;

  if (!session) {
    return (
      <main className="shell" style={{ paddingTop: 24 }}>
        <div className="panel" style={{ maxWidth: 440 }}>
          <h1 className="headline">Admin Dashboard</h1>
          <p className="panel-text">Sign in to access the system admin dashboard.</p>
          <button type="button" onClick={() => signIn("google")}>Sign in with Google</button>
        </div>
      </main>
    );
  }

  if (session.userRole !== "system_admin") {
    return (
      <main className="shell" style={{ paddingTop: 24 }}>
        <div className="panel" style={{ maxWidth: 480 }}>
          <h1 className="headline">Admin Dashboard</h1>
          <p className="panel-text">This page is restricted to system administrators.</p>
          <Link href="/events">← Back to Events</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      <div className="shell">
        {connectedBanner && (
          <div style={{ background: "rgba(31,111,67,0.1)", border: "1px solid rgba(31,111,67,0.3)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, color: "var(--success)" }}>
            Ambassador connected successfully.
          </div>
        )}

        <section className="hero-panel">
          <p className="eyebrow">System Admin</p>
          <h1 className="headline" style={{ margin: "8px 0 8px", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            CampusScan Dashboard
          </h1>
          <p style={{ margin: 0, opacity: 0.85 }}>Manage ambassadors, subscribers, events, and digests.</p>
        </section>

        {/* Stats */}
        <div className="admin-stats" style={{ marginTop: 20 }}>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{stats.subscribers?.active ?? "–"}</div>
            <div className="admin-stat-label">Active subscribers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{stats.ambassadors?.total ?? "–"}</div>
            <div className="admin-stat-label">Ambassadors</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{stats.partnerships?.total ?? "–"}</div>
            <div className="admin-stat-label">Partnership leads</div>
          </div>
        </div>

        {/* Actions */}
        <div className="card" style={{ padding: 20, marginTop: 20 }}>
          <h2 className="headline" style={{ marginTop: 0, fontSize: "1.5rem", marginBottom: 14 }}>Actions</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={handleScan} disabled={scanLoading}>
              {scanLoading ? "Scanning..." : "Scan Inboxes Now"}
            </button>
            <button type="button" onClick={handleDigest} disabled={digestLoading}>
              {digestLoading ? "Sending..." : "Send Digest Now"}
            </button>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <input
                placeholder="University name"
                value={ambassadorUniversity}
                onChange={(e) => setAmbassadorUniversity(e.target.value)}
                style={{ width: 200 }}
              />
              <a
                href={`${API_URL}/auth/google?university=${encodeURIComponent(ambassadorUniversity)}`}
                className="button button--small"
                style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                Connect Ambassador Gmail
              </a>
            </div>
            <Link href="/admin/review" className="button button--small">Review Queue</Link>
          </div>
          {error && <p className="error-message" style={{ marginTop: 10 }}>{error}</p>}
          {message && <p className="success-message" style={{ marginTop: 10 }}>{message}</p>}
        </div>

        {/* Ambassadors */}
        {stats.ambassadors?.ambassadors?.length > 0 && (
          <div className="card" style={{ padding: 20, marginTop: 20 }}>
            <h2 className="headline" style={{ marginTop: 0, fontSize: "1.5rem", marginBottom: 14 }}>Ambassadors</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {stats.ambassadors.ambassadors.map((a) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--panel-border)", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong>{a.name || a.email}</strong>
                    <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: "0.85rem" }}>{a.university}</span>
                  </div>
                  <span style={{ fontSize: "0.82rem", color: a.is_active ? "var(--success)" : "var(--error)" }}>
                    {a.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partnership leads */}
        {stats.partnerships?.leads?.length > 0 && (
          <div className="card" style={{ padding: 20, marginTop: 20 }}>
            <h2 className="headline" style={{ marginTop: 0, fontSize: "1.5rem", marginBottom: 14 }}>Partnership Leads</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {stats.partnerships.leads.map((lead) => (
                <div key={lead.id} style={{ padding: "12px 0", borderTop: "1px solid var(--panel-border)" }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700 }}>{lead.contact_name} — {lead.university}</p>
                  <p style={{ margin: "0 0 2px", color: "var(--muted)", fontSize: "0.88rem" }}>{lead.email} {lead.phone_number ? `· ${lead.phone_number}` : ""}</p>
                  {lead.preferred_timing && <p style={{ margin: "0 0 2px", fontSize: "0.85rem" }}>Timing: {lead.preferred_timing}</p>}
                  {lead.message && <p style={{ margin: 0, color: "var(--ink)", fontSize: "0.88rem" }}>{lead.message}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscribers */}
        {stats.subscribers?.subscribers?.length > 0 && (
          <div className="card" style={{ padding: 20, marginTop: 20 }}>
            <h2 className="headline" style={{ marginTop: 0, fontSize: "1.5rem", marginBottom: 14 }}>
              Subscribers ({stats.subscribers.active} active)
            </h2>
            <div style={{ display: "grid", gap: 4 }}>
              {stats.subscribers.subscribers.map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--panel-border)", fontSize: "0.9rem" }}>
                  <span>{s.phone_number} {s.university ? `· ${s.university}` : ""}</span>
                  <span style={{ color: s.is_active ? "var(--success)" : "var(--error)" }}>
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<main className="shell" style={{ paddingTop: 24 }}>Loading...</main>}>
      <AdminDashboardInner />
    </Suspense>
  );
}
