from fastapi import APIRouter, Request, Response, HTTPException
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse
from database import SessionLocal
from models import Subscriber
import os

router = APIRouter(prefix="/webhook", tags=["webhook"])


async def _validate_twilio_signature(request: Request) -> dict:
    """Validate the X-Twilio-Signature header. Raises 403 if invalid."""
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    url = base_url + "/webhook/sms"

    twilio_signature = request.headers.get("X-Twilio-Signature", "")
    form_data = dict(await request.form())

    validator = RequestValidator(auth_token)
    if auth_token and not validator.validate(url, form_data, twilio_signature):
        raise HTTPException(status_code=403, detail="Invalid Twilio signature")

    return form_data


@router.post("/sms")
async def sms_webhook(request: Request):
    form_data = await _validate_twilio_signature(request)
    from_number = form_data.get("From", "")
    message_body = form_data.get("Body", "").strip().upper()

    db = SessionLocal()
    response = MessagingResponse()

    try:
        if message_body == "JOIN":
            existing = db.query(Subscriber).filter_by(phone_number=from_number).first()

            if existing and existing.is_active:
                response.message(
                    "You're already subscribed to CampusScan!\n"
                    "You'll get a daily digest every morning at 8AM.\n"
                    "Text STOP to unsubscribe."
                )
            elif existing and not existing.is_active:
                existing.is_active = True
                db.commit()
                response.message(
                    "Welcome back to CampusScan!\n"
                    "You'll get a daily digest every morning at 8AM.\n"
                    "Text STOP to unsubscribe."
                )
            else:
                subscriber = Subscriber(phone_number=from_number)
                db.add(subscriber)
                db.commit()
                response.message(
                    "Welcome to CampusScan!\n"
                    "You're now subscribed to daily campus event alerts.\n\n"
                    "Every morning at 8AM you'll get a text with:\n"
                    "- Campus events happening that day\n"
                    "- Which clubs have free food\n\n"
                    "Text STOP to unsubscribe anytime."
                )

        elif message_body == "STOP":
            existing = db.query(Subscriber).filter_by(phone_number=from_number).first()
            if existing:
                existing.is_active = False
                db.commit()
            response.message(
                "You've been unsubscribed from CampusScan.\n"
                "Text JOIN anytime to resubscribe."
            )

        else:
            response.message(
                "Hi! This is CampusScan.\n"
                "Text JOIN to subscribe to daily campus event alerts.\n"
                "Text STOP to unsubscribe."
            )

    finally:
        db.close()

    return Response(content=str(response), media_type="application/xml")
