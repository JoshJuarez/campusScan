from datetime import datetime, timezone
from twilio.rest import Client
from zoneinfo import ZoneInfo
import os

LOCAL_EVENT_TZ = ZoneInfo("America/New_York")


def _primary_club_name(event) -> str:
    club_names = getattr(event, "club_names", None) or []
    if club_names:
        return club_names[0]
    return getattr(event, "club_name", None) or "Campus event"


def _format_event_datetime(event) -> str:
    start_iso = getattr(event, "start_iso", None)
    if not start_iso:
        return "Time TBD"

    try:
        dt = datetime.fromisoformat(start_iso)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=LOCAL_EVENT_TZ)
        else:
            dt = dt.astimezone(LOCAL_EVENT_TZ)
        return dt.strftime("%a %b %-d @ %-I:%M %p")
    except Exception:
        return start_iso

def get_twilio_client():
    return Client(
        os.getenv("TWILIO_ACCOUNT_SID"),
        os.getenv("TWILIO_AUTH_TOKEN")
    )

def send_event_digest(phone_number: str, events: list) -> bool:
    if not events:
        return False

    # Build the message
    lines = ["📬 CampusScan Daily Digest\n"]

    for event in events:
        if event.has_food:
            emoji = "🍕"
        else:
            emoji = "📅"

        line = f"{emoji} {_primary_club_name(event)} - {event.title}\n"
        line += f"   {_format_event_datetime(event)}\n"

        # Location
        if event.location:
            line += f"   📍 {event.location}\n"

        # Food keywords
        if event.has_food and event.food_keywords:
            foods = ", ".join(event.food_keywords)
            line += f"   Free {foods}!\n"

        lines.append(line)

    lines.append("\nReply STOP to unsubscribe.")
    message_body = "\n".join(lines)

    client = get_twilio_client()
    client.messages.create(
        body=message_body,
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        to=phone_number
    )
    return True

def send_welcome_text(phone_number: str, name: str) -> bool:
    client = get_twilio_client()
    client.messages.create(
        body=(
            f"👋 Hey {name}! Welcome to CampusScan.\n\n"
            "You'll get a daily digest every morning at 8AM "
            "with campus events and free food alerts 🍕\n\n"
            "Reply STOP anytime to unsubscribe."
        ),
        from_=os.getenv("TWILIO_PHONE_NUMBER"),
        to=phone_number
    )
    return True
