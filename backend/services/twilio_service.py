from twilio.rest import Client
import os

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

        # Event title and club
        line = f"{emoji} {event.club} – {event.title}\n"

        # Date and time
        if event.event_date and event.event_time:
            line += f"   {event.event_date.strftime('%a %b %-d')} @ {event.event_time.strftime('%-I:%M %p')}\n"
        elif event.event_date:
            line += f"   {event.event_date.strftime('%a %b %-d')}\n"

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