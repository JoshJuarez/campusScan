from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from datetime import datetime, timedelta
import os

def get_calendar_service(access_token: str, refresh_token: str):
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
    )
    return build("calendar", "v3", credentials=creds)

def add_event_to_calendar(service, event) -> str:
    start_dt = datetime.combine(
        event.event_date,
        event.event_time or datetime.min.time()
    )
    end_dt = start_dt + timedelta(hours=1)

    body = {
        "summary": event.title,
        "location": event.location or "",
        "description": f"From: {event.club}\n{'🍕 Free food!' if event.has_food else ''}",
        "start": {"dateTime": start_dt.isoformat(), "timeZone": "America/New_York"},
        "end":   {"dateTime": end_dt.isoformat(),   "timeZone": "America/New_York"},
    }

    created = service.events().insert(calendarId="primary", body=body).execute()
    return created["id"]