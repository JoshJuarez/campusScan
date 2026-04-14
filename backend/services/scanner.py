from database import SessionLocal
from models import Ambassador, ScannedEmail, Event
from services.gmail import get_gmail_service, fetch_recent_emails
from services.parser import extract_events
from datetime import datetime
from zoneinfo import ZoneInfo
import re


LOCAL_EVENT_TZ = ZoneInfo("America/New_York")
BLOCKED_SENDER_DOMAINS = {
    "nytimes.com",
    "interactive.wsj.com",
    "tm.openai.com",
    "openai.com",
    "twilio.com",
    "team.twilio.com",
    "mail.quillbot.com",
    "sheerid.com",
    "google.com",
}
# Platform-agnostic preferred senders — university domains are derived per-ambassador
PREFERRED_SENDER_SUFFIXES = (
    "joinhandshake.com",
    "campuslabs.com",
)
EVENT_KEYWORDS = (
    "event",
    "meeting",
    "club",
    "student",
    "campus",
    "workshop",
    "panel",
    "concert",
    "show",
    "fair",
    "brunch",
    "food",
    "dinner",
    "lunch",
    "snacks",
    "training",
    "networking",
    "movie",
)


def scan_all_ambassadors(db=None) -> dict:
    """Scan every active ambassador's inbox and extract new events.

    Accepts an optional db session. If none is provided, opens and closes its own.
    Returns a summary dict with counts.
    """
    own_db = db is None
    if own_db:
        db = SessionLocal()

    try:
        ambassadors = db.query(Ambassador).filter_by(is_active=True).all()
        if not ambassadors:
            return {"ambassadors_scanned": 0, "emails_scanned": 0, "new_events": 0}

        total_emails = 0
        new_events = 0

        for ambassador in ambassadors:
            service = get_gmail_service(ambassador.access_token, ambassador.refresh_token)
            raw_emails = fetch_recent_emails(service)
            total_emails += len(raw_emails)

            # Treat emails from the ambassador's own university domain as preferred
            ambassador_domain = (
                ambassador.email.split("@")[-1].lower()
                if ambassador.email and "@" in ambassador.email
                else ""
            )

            for raw in raw_emails:
                if not should_scan_email(raw, preferred_domain=ambassador_domain):
                    continue

                already_scanned = db.query(ScannedEmail).filter_by(
                    gmail_id=raw["gmail_id"]
                ).first()
                should_reprocess = bool(
                    already_scanned
                    and not (already_scanned.raw_body or "").strip()
                    and (raw.get("raw_body") or "").strip()
                )
                if already_scanned and not should_reprocess:
                    continue

                if already_scanned and should_reprocess:
                    already_scanned.subject = raw["subject"]
                    already_scanned.sender = raw["sender"]
                    already_scanned.raw_body = raw["raw_body"]
                    already_scanned.received_at = raw["received_at"]
                    email_row = already_scanned
                    db.query(Event).filter_by(scanned_email_id=email_row.id).delete()
                else:
                    email_row = ScannedEmail(
                        ambassador_id=ambassador.id,
                        gmail_id=raw["gmail_id"],
                        subject=raw["subject"],
                        sender=raw["sender"],
                        raw_body=raw["raw_body"],
                        received_at=raw["received_at"],
                    )
                    db.add(email_row)
                    db.flush()

                parsed_events = extract_events(
                    raw["subject"],
                    raw["raw_body"],
                    raw["sender"],
                    university=ambassador.university,
                    received_at=raw["received_at"],
                )

                for parsed in parsed_events:
                    if parsed["confidence"] == "low" and not parsed["has_food"]:
                        continue
                    if not should_queue_for_review(parsed.get("start_iso")):
                        continue

                    event_row = Event(scanned_email_id=email_row.id, **parsed)
                    db.add(event_row)
                    new_events += 1

        db.commit()
        return {
            "ambassadors_scanned": len(ambassadors),
            "emails_scanned": total_emails,
            "new_events": new_events,
        }
    finally:
        if own_db:
            db.close()


def should_queue_for_review(start_iso: str | None) -> bool:
    if not start_iso:
        return True

    try:
        dt = datetime.fromisoformat(start_iso)
        local_dt = dt.astimezone(LOCAL_EVENT_TZ) if dt.tzinfo else dt.replace(tzinfo=LOCAL_EVENT_TZ)
        return local_dt.date() >= datetime.now(LOCAL_EVENT_TZ).date()
    except Exception:
        return True


def should_scan_email(raw: dict, preferred_domain: str = "") -> bool:
    sender = (raw.get("sender") or "").strip()
    subject = (raw.get("subject") or "").strip()
    body = (raw.get("raw_body") or "").strip()

    if not sender or not subject:
        return False

    sender_email = extract_sender_email(sender)
    if sender_email:
        domain = sender_email.split("@")[-1].lower()
        if domain in BLOCKED_SENDER_DOMAINS:
            return False
        # Fast-pass: email is from the ambassador's own university or a known platform
        if preferred_domain and (domain == preferred_domain or domain.endswith(f".{preferred_domain}")):
            return True
        if domain.endswith(PREFERRED_SENDER_SUFFIXES):
            return True

    haystack = f"{subject}\n{body}".lower()
    if "what's happening on campus" in haystack:
        return True

    return any(keyword in haystack for keyword in EVENT_KEYWORDS)


def extract_sender_email(sender: str) -> str:
    match = re.search(r"([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})", sender, re.IGNORECASE)
    return match.group(1).lower() if match else ""
