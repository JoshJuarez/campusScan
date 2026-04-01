from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from twilio.base.exceptions import TwilioRestException

from database import get_db
from models import PartnershipLead, Subscriber
from schemas import PartnershipLeadCreate, SubscriberCreate
from services.twilio_service import send_welcome_text


router = APIRouter(tags=["public"])


@router.get("/universities")
def get_universities(db: Session = Depends(get_db)):
    """Return the list of universities that currently have active ambassadors."""
    from models import Ambassador
    results = (
        db.query(Ambassador.university)
        .filter(Ambassador.is_active == True, Ambassador.university != None)
        .distinct()
        .all()
    )
    universities = sorted([r.university for r in results if r.university])
    return {"universities": universities}


def normalize_phone_number(phone_number: str) -> str:
    digits = "".join(ch for ch in phone_number if ch.isdigit())

    if len(digits) == 10:
        return f"+1{digits}"
    if len(digits) == 11 and digits.startswith("1"):
        return f"+{digits}"

    raise HTTPException(status_code=400, detail="Please enter a valid US phone number.")


@router.post("/subscribe")
def create_subscription(payload: SubscriberCreate, db: Session = Depends(get_db)):
    normalized_phone = normalize_phone_number(payload.phone_number)
    existing = db.query(Subscriber).filter_by(phone_number=normalized_phone).first()

    if existing:
        if existing.is_active:
            return {
                "success": True,
                "message": "This phone number is already subscribed to CampusScan alerts.",
            }

        existing.is_active = True
        db.commit()

        try:
            send_welcome_text(existing.phone_number, "there")
        except TwilioRestException as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Twilio could not send the welcome text: {exc.msg}",
            ) from exc

        return {
            "success": True,
            "message": "Welcome back. CampusScan alerts have been turned back on for this number.",
        }

    subscriber = Subscriber(
        phone_number=normalized_phone,
        university=payload.university.strip() if payload.university else None,
    )
    db.add(subscriber)
    db.commit()

    try:
        send_welcome_text(subscriber.phone_number, "there")
    except TwilioRestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Twilio could not send the welcome text: {exc.msg}",
        ) from exc

    return {
        "success": True,
        "message": "You are subscribed. We will text this number with campus alerts and free food updates.",
    }


@router.post("/partnerships")
def create_partnership_lead(payload: PartnershipLeadCreate, db: Session = Depends(get_db)):
    lead = PartnershipLead(
        contact_name=payload.contact_name.strip(),
        email=payload.email.strip(),
        university=payload.university.strip(),
        phone_number=payload.phone_number.strip() if payload.phone_number else None,
        preferred_timing=payload.preferred_timing.strip() if payload.preferred_timing else None,
        message=payload.message.strip() if payload.message else None,
    )
    db.add(lead)
    db.commit()

    return {
        "success": True,
        "message": "Thanks for reaching out. We will follow up to schedule a meeting about bringing CampusScan to your campus.",
    }
