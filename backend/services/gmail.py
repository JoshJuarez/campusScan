from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.utils import parsedate_to_datetime
import base64
import html
import re
import os

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "email",
    "profile",
]

PRIORITY_QUERIES = [
    "in:inbox",
]

def get_gmail_service(access_token: str, refresh_token: str):
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
        scopes=GMAIL_SCOPES,
    )
    return build("gmail", "v1", credentials=creds)

def fetch_recent_emails(service, max_results: int = 25) -> list[dict]:
    seen_ids = set()
    ordered_ids = []

    for query in PRIORITY_QUERIES:
        results = service.users().messages().list(
            userId="me",
            maxResults=max_results,
            q=query
        ).execute()

        for msg_ref in results.get("messages", []):
            gmail_id = msg_ref["id"]
            if gmail_id in seen_ids:
                continue
            seen_ids.add(gmail_id)
            ordered_ids.append(gmail_id)

    messages = []
    for gmail_id in ordered_ids:
        msg = service.users().messages().get(
            userId="me", id=gmail_id, format="full"
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
    text_body = extract_body_by_mimetype(payload, "text/plain")
    if text_body:
        return normalize_email_text(text_body)

    html_body = extract_body_by_mimetype(payload, "text/html")
    if html_body:
        return normalize_email_text(strip_html(html_body))

    data = payload.get("body", {}).get("data", "")
    return normalize_email_text(decode_gmail_part(data)) if data else ""


def extract_body_by_mimetype(payload: dict, target_mimetype: str) -> str:
    if payload.get("mimeType") == target_mimetype:
        return decode_gmail_part(payload.get("body", {}).get("data", ""))

    for part in payload.get("parts", []) or []:
        extracted = extract_body_by_mimetype(part, target_mimetype)
        if extracted:
            return extracted

    return ""


def decode_gmail_part(data: str) -> str:
    if not data:
        return ""
    return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")


def strip_html(text: str) -> str:
    cleaned = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", text)
    cleaned = re.sub(r"(?i)<br\s*/?>", "\n", cleaned)
    cleaned = re.sub(r"(?i)</p>", "\n", cleaned)
    cleaned = re.sub(r"(?i)</div>", "\n", cleaned)
    cleaned = re.sub(r"(?s)<[^>]+>", " ", cleaned)
    return html.unescape(cleaned)


def normalize_email_text(text: str) -> str:
    normalized = (text or "").replace("\r", "\n").replace("\xa0", " ")
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)
    normalized = re.sub(r"[ \t]+", " ", normalized)
    return normalized.strip()
