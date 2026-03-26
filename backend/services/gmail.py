from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.utils import parsedate_to_datetime
import base64
import os

def get_gmail_service(access_token: str, refresh_token: str):
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
    )
    return build("gmail", "v1", credentials=creds)

def fetch_recent_emails(service, max_results: int = 20) -> list[dict]:
    results = service.users().messages().list(
        userId="me",
        maxResults=max_results,
        q="in:inbox"
    ).execute()

    messages = []
    for msg_ref in results.get("messages", []):
        msg = service.users().messages().get(
            userId="me", id=msg_ref["id"], format="full"
        ).execute()
        messages.append(parse_gmail_message(msg))
    return messages

def parse_gmail_message(msg: dict) -> dict:
    headers = {h["name"]: h["value"] for h in msg["payload"]["headers"]}
    body = extract_body(msg["payload"])

    # Convert the date string into a proper datetime object
    raw_date = headers.get("Date", "")
    try:
        received_at = parsedate_to_datetime(raw_date)
    except Exception:
        received_at = None

    return {
        "gmail_id": msg["id"],
        "subject": headers.get("Subject", ""),
        "sender": headers.get("From", ""),
        "received_at": received_at,
        "raw_body": body,
    }

def extract_body(payload: dict) -> str:
    if "parts" in payload:
        for part in payload["parts"]:
            if part["mimeType"] == "text/plain":
                data = part["body"].get("data", "")
                return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
    data = payload.get("body", {}).get("data", "")
    return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore") if data else ""