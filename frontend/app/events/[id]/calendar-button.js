"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function CalendarButton({ event }) {
  const { data: session } = useSession();
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  if (!event?.start_iso) return null;

  async function addToCalendar() {
    if (!session) {
      signIn("google");
      return;
    }
    setState("loading");
    setError("");
    try {
      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.title,
          location: event.location,
          description: event.description || event.summary,
          start: { dateTime: event.start_iso },
          end: {
            dateTime: event.end_iso ||
              new Date(new Date(event.start_iso).getTime() + 60 * 60 * 1000).toISOString(),
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message || "Failed to add event.");
      }
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err.message);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={addToCalendar}
        disabled={state === "loading" || state === "done"}
      >
        {state === "loading" ? "Adding..." : state === "done" ? "Added to Calendar" : "Add to Google Calendar"}
      </button>
      {!session && (
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 6 }}>
          Sign in with your .edu account to add events to your calendar.
        </p>
      )}
      {error && <p className="error-message" style={{ marginTop: 6 }}>{error}</p>}
    </div>
  );
}
