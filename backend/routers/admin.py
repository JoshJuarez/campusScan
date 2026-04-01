from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Subscriber, Event, ScannedEmail, PartnershipLead, Ambassador
import os

router = APIRouter(prefix="/admin", tags=["admin"])


def check_admin(password: str):
    if password != os.getenv("ADMIN_PASSWORD", "admin123"):
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/subscribers")
def get_subscribers(password: str, db: Session = Depends(get_db)):
    check_admin(password)
    subscribers = db.query(Subscriber).all()
    return {
        "total": len(subscribers),
        "active": len([s for s in subscribers if s.is_active]),
        "subscribers": [
            {
                "id": s.id,
                "phone_number": s.phone_number,
                "is_active": s.is_active,
                "joined_at": s.joined_at,
            }
            for s in subscribers
        ],
    }


@router.get("/ambassadors")
def get_ambassadors(password: str, db: Session = Depends(get_db)):
    check_admin(password)
    ambassadors = db.query(Ambassador).order_by(Ambassador.joined_at.desc()).all()
    return {
        "total": len(ambassadors),
        "ambassadors": [
            {
                "id": a.id,
                "name": a.name,
                "email": a.email,
                "university": a.university,
                "is_active": a.is_active,
                "joined_at": a.joined_at,
            }
            for a in ambassadors
        ],
    }


@router.get("/partnerships")
def get_partnerships(password: str, db: Session = Depends(get_db)):
    check_admin(password)
    leads = db.query(PartnershipLead).order_by(PartnershipLead.created_at.desc()).all()
    return {
        "total": len(leads),
        "leads": [
            {
                "id": lead.id,
                "contact_name": lead.contact_name,
                "email": lead.email,
                "university": lead.university,
                "phone_number": lead.phone_number,
                "preferred_timing": lead.preferred_timing,
                "message": lead.message,
                "created_at": lead.created_at,
            }
            for lead in leads
        ],
    }


@router.get("/events")
def get_events(password: str, db: Session = Depends(get_db)):
    check_admin(password)
    events = db.query(Event).order_by(Event.event_date).all()
    return {
        "total": len(events),
        "events": [
            {
                "id": e.id,
                "title": e.title,
                "club": e.club,
                "event_date": e.event_date,
                "event_time": e.event_time,
                "location": e.location,
                "has_food": e.has_food,
                "food_keywords": e.food_keywords,
                "confidence": e.confidence,
            }
            for e in events
        ],
    }


@router.delete("/events/{event_id}")
def delete_event(event_id: int, password: str, db: Session = Depends(get_db)):
    check_admin(password)
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"success": True}


@router.post("/scan")
def trigger_scan(password: str, db: Session = Depends(get_db)):
    """Scan every active ambassador's inbox and extract new events."""
    check_admin(password)
    from services.gmail import get_gmail_service, fetch_recent_emails
    from services.parser import extract_event

    ambassadors = db.query(Ambassador).filter_by(is_active=True).all()
    if not ambassadors:
        return {"scanned": 0, "new_events": 0, "ambassadors_scanned": 0}

    total_scanned = 0
    new_event_count = 0

    for ambassador in ambassadors:
        service = get_gmail_service(ambassador.access_token, ambassador.refresh_token)
        raw_emails = fetch_recent_emails(service)
        total_scanned += len(raw_emails)

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

            parsed = extract_event(raw["subject"], raw["raw_body"], raw["sender"])
            if parsed["confidence"] != "low" or parsed["has_food"]:
                event_row = Event(
                    scanned_email_id=email_row.id,
                    **parsed
                )
                db.add(event_row)
                new_event_count += 1

    db.commit()
    return {
        "ambassadors_scanned": len(ambassadors),
        "scanned": total_scanned,
        "new_events": new_event_count,
    }
