from database import SessionLocal
from models import Ambassador, ScannedEmail, Event
from services.gmail import get_gmail_service, fetch_recent_emails
from services.parser import extract_event


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

            for raw in raw_emails:
                already_scanned = db.query(ScannedEmail).filter_by(
                    gmail_id=raw["gmail_id"]
                ).first()
                if already_scanned:
                    continue

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

                parsed = extract_event(
                    raw["subject"],
                    raw["raw_body"],
                    raw["sender"],
                    university=ambassador.university,
                )
                if parsed["confidence"] != "low" or parsed["has_food"]:
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
