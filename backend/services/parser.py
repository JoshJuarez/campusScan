import re
from datetime import datetime, timezone
from dateutil import parser as dateparser

FOOD_KEYWORDS = [
    "pizza", "free food", "food", "refreshments",
    "dinner", "lunch", "snacks", "drinks", "catering", "meal", "boba", "donuts"
]


def extract_event(subject: str, body: str, sender: str, university: str = None) -> dict:
    text = f"{subject} {body}"
    lower = text.lower()

    found_food = [kw for kw in FOOD_KEYWORDS if kw in lower]
    start_iso, end_iso = extract_datetime(text)
    location = extract_location(text)
    club_name = extract_club(sender)

    # Build a one-sentence summary from the subject
    summary = subject.strip()[:120] if subject else ""

    confidence = "high" if start_iso else "medium" if location else "low"

    return {
        "title": subject,
        "summary": summary,
        "club_name": club_name,
        "club_names": [club_name] if club_name else [],
        "location": location,
        "start_iso": start_iso,
        "end_iso": end_iso,
        "has_food": bool(found_food),
        "food_keywords": found_food,
        "confidence": confidence,
        "university": university,
        "status": "approved",
        "source": "scanned",
    }


def extract_datetime(text: str):
    chunks = re.findall(
        r'[^\.\n]{0,60}(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|'
        r'january|february|march|april|may|june|july|august|september|october|november|december|'
        r'\d{1,2}\/\d{1,2})[^\.\n]{0,60}',
        text, re.IGNORECASE
    )
    for chunk in chunks:
        try:
            dt = dateparser.parse(chunk, fuzzy=True)
            if dt and dt.year >= 2024:
                # Ensure timezone-aware
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                start = dt.isoformat()
                # Default 1-hour event
                end_dt = dt.replace(hour=dt.hour + 1) if dt.hour < 23 else dt
                end = end_dt.isoformat()
                return start, end
        except Exception:
            continue
    return None, None


def extract_location(text: str):
    patterns = [
        r'(?:in|at)\s+(?:the\s+)?([A-Z][a-zA-Z]*(?:\s+[A-Z]?[a-zA-Z]+){0,4}(?:\s+\d+)?)',
        r'(?:Room|Rm\.?|Suite|Hall|Building|Bldg\.?)\s+[A-Z0-9]\w*',
        r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}(?:\s+(?:Hall|Center|Building|Room|Auditorium|Theater|Theatre|Gym|Library|Cafeteria|Lounge|Plaza|Quad))?)\b',
    ]
    for pat in patterns:
        match = re.search(pat, text)
        if match:
            return match.group(0).strip()
    return None


def extract_club(sender: str):
    match = re.search(r'[\.<]?([a-z]+)@', sender.lower())
    if match:
        return match.group(1).replace(".", " ").title() + " Club"
    return sender
