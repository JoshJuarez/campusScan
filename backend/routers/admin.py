from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import Subscriber, Event, ScannedEmail, PartnershipLead, Ambassador
from services.scanner import scan_all_ambassadors
import os

router = APIRouter(prefix="/admin", tags=["admin"])


def check_admin(authorization: str = Header(...)):
    expected = f"Bearer {os.getenv('ADMIN_PASSWORD', 'admin123')}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.get("/subscribers")
def get_subscribers(db: Session = Depends(get_db), authorization: str = Header(...)):
    check_admin(authorization)
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
def get_ambassadors(db: Session = Depends(get_db), authorization: str = Header(...)):
    check_admin(authorization)
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
def get_partnerships(db: Session = Depends(get_db), authorization: str = Header(...)):
    check_admin(authorization)
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
def get_events(db: Session = Depends(get_db), authorization: str = Header(...)):
    check_admin(authorization)
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
def delete_event(event_id: int, db: Session = Depends(get_db), authorization: str = Header(...)):
    check_admin(authorization)
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"success": True}


@router.post("/scan")
def trigger_scan(db: Session = Depends(get_db), authorization: str = Header(...)):
    check_admin(authorization)
    result = scan_all_ambassadors(db)
    return result
