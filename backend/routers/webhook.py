from fastapi import APIRouter, Request, Response
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Subscriber
from twilio.twiml.messaging_response import MessagingResponse

router = APIRouter(prefix="/webhook", tags=["webhook"])

@router.post("/sms")
async def sms_webhook(request: Request):
    # Twilio sends form data, not JSON
    form_data = await request.form()
    from_number = form_data.get("From", "")
    message_body = form_data.get("Body", "").strip().upper()

    db = SessionLocal()
    response = MessagingResponse()

    try:
        if message_body == "JOIN":
            # Check if already subscribed
            existing = db.query(Subscriber).filter_by(
                phone_number=from_number
            ).first()

            if existing and existing.is_active:
                response.message(
                    "You're already subscribed to CampusScan! 📬\n"
                    "You'll get a daily digest every morning at 8AM.\n"
                    "Text STOP to unsubscribe."
                )
            elif existing and not existing.is_active:
                # Re-subscribe
                existing.is_active = True
                db.commit()
                response.message(
                    "Welcome back to CampusScan! 🎉\n"
                    "You'll get a daily digest every morning at 8AM.\n"
                    "Text STOP to unsubscribe."
                )
            else:
                # New subscriber
                subscriber = Subscriber(phone_number=from_number)
                db.add(subscriber)
                db.commit()
                response.message(
                    "Welcome to CampusScan! 🎓\n"
                    "You're now subscribed to daily campus event alerts.\n\n"
                    "Every morning at 8AM you'll get a text with:\n"
                    "📅 Campus events happening that day\n"
                    "🍕 Which clubs have free food\n\n"
                    "Text STOP to unsubscribe anytime."
                )

        elif message_body == "STOP":
            existing = db.query(Subscriber).filter_by(
                phone_number=from_number
            ).first()
            if existing:
                existing.is_active = False
                db.commit()
            response.message(
                "You've been unsubscribed from CampusScan.\n"
                "Text JOIN anytime to resubscribe!"
            )

        else:
            response.message(
                "Hi! This is CampusScan 📬\n"
                "Text JOIN to subscribe to daily campus event alerts.\n"
                "Text STOP to unsubscribe."
            )

    finally:
        db.close()

    # Must return TwiML format for Twilio
    return Response(content=str(response), media_type="application/xml")