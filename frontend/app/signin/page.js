"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/events");
  }, [session, router]);

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="panel" style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <p className="eyebrow">Sign in</p>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Welcome to CampusScan</h1>
        <p className="panel-text">
          Sign in with your <strong>.edu</strong> Google account to submit events,
          add events to your calendar, and join the club admin community.
        </p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/events" })}
          style={{ width: "100%", marginTop: "0.5rem" }}
        >
          Sign in with Google
        </button>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "1rem" }}>
          Only .edu email addresses are accepted. Non-edu accounts will be blocked.
        </p>
      </div>
    </main>
  );
}
