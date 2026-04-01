import re
from dateutil import parser as dateparser

FOOD_KEYWORDS = [
    "pizza", "free food", "food", "refreshments",
    "dinner", "lunch", "snacks", "drinks", "catering", "meal"
]

def extract_event(subject: str, body: str, sender: str) -> dict:
    text = f"{subject} {body}"
    lower = text.lower()

    found_food = [kw for kw in FOOD_KEYWORDS if kw in lower]
    event_date, event_time = extract_datetime(text)
    location = extract_location(text)
    club = extract_club(sender)
    confidence = "high" if (event_date and event_time) else "medium" if event_date else "low"

    return {
        "title": subject,
        "club": club,
        "event_date": event_date,
        "event_time": event_time,
        "location": location,
        "has_food": bool(found_food),
        "food_keywords": found_food,
        "confidence": confidence,
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
                t = dt.time() if dt.hour != 0 or dt.minute != 0 else None
                return dt.date(), t
        except Exception:
            continue
    return None, None

def extract_location(text: str):
    # Look for common location phrases: "at/in <Place>", room numbers, building names
    patterns = [
        # "at the Student Center", "in Room 204", "at 123 Main St"
        r'(?:in|at)\s+(?:the\s+)?([A-Z][a-zA-Z]*(?:\s+[A-Z]?[a-zA-Z]+){0,4}(?:\s+\d+)?)',
        # "Room 204", "Rm. 12", "Suite 300"
        r'(?:Room|Rm\.?|Suite|Hall|Building|Bldg\.?)\s+[A-Z0-9]\w*',
        # Standalone capitalized multi-word phrases that look like building names
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