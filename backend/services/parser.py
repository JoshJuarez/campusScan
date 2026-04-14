import re
from datetime import datetime, timezone
from dateutil import parser as dateparser
from zoneinfo import ZoneInfo

FOOD_KEYWORDS = [
    "pizza", "free food", "food", "refreshments",
    "dinner", "lunch", "snacks", "drinks", "catering", "meal", "boba", "donuts"
]

FORDHAM_DIGEST_SENDER = "involvementlc@crm.fordham.edu"
FORDHAM_DIGEST_SUBJECT_HINT = "what's happening on campus"
DAY_HEADER_RE = re.compile(
    r"^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+"
    r"([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?)$",
    re.IGNORECASE,
)
TIME_RE = re.compile(r"\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b", re.IGNORECASE)
TITLE_MARKERS = [
    "general meeting",
    "weekly meeting",
    "meeting",
    "small business fair",
    "movie night",
    "craft night",
    "spring market",
    "coptic easter",
    "plaza concert",
    "spring cookout",
    "concert",
    "show",
    "workshop",
    "training",
    "panel and q&a",
    "panel",
    "speaker event",
    "publication celebration",
    "networking event",
    "law school panel and q&a",
    "rock painting",
    "field day",
    "coffee break",
    "sexual violence 101",
    "presentation",
    "internship prep",
    "dance workshop",
    "drag & ballroom show",
    "spring concert",
    "music mayhem",
    "fordham’s got talent",
    "earth week day",
    "cpr training",
    "quince",
    "event",
]
LOCAL_EVENT_TZ = ZoneInfo("America/New_York")


def extract_events(
    subject: str,
    body: str,
    sender: str,
    university: str = None,
    received_at: datetime | None = None,
) -> list[dict]:
    normalized_sender = (sender or "").lower()
    normalized_subject = (subject or "").lower()

    if FORDHAM_DIGEST_SENDER in normalized_sender and FORDHAM_DIGEST_SUBJECT_HINT in normalized_subject:
        digest_events = extract_digest_events(
            subject,
            body,
            sender,
            university=university,
            received_at=received_at,
        )
        if digest_events:
            return digest_events

    return [extract_event(subject, body, sender, university=university)]


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
        "status": "pending",
        "source": "scanned",
    }


def extract_digest_events(
    subject: str,
    body: str,
    sender: str,
    university: str = None,
    received_at: datetime | None = None,
) -> list[dict]:
    lines = normalize_lines(body)
    current_date_label = None
    current_section = None
    parsed_events = []
    year = (received_at.year if received_at else datetime.now(timezone.utc).year)

    for line in lines:
        lowered = line.lower()

        if "upcoming events & highlights" in lowered:
            current_section = "highlights"
            continue
        if "upcoming club & student involvement meetings/events" in lowered:
            current_section = "meetings"
            continue
        if "events are for fordham undergraduate students only" in lowered:
            break

        header_match = DAY_HEADER_RE.match(line)
        if header_match:
            current_date_label = f"{header_match.group(1)}, {header_match.group(2)}"
            continue

        if not current_section or not current_date_label:
            continue
        if should_skip_digest_line(line):
            continue

        parsed = parse_digest_event_line(
            line,
            current_date_label,
            year,
            university=university,
            section=current_section,
        )
        if parsed:
            parsed_events.append(parsed)

    return dedupe_digest_events(parsed_events)


def normalize_lines(body: str) -> list[str]:
    text = (body or "").replace("\r", "\n")
    raw_lines = [line.strip() for line in text.split("\n")]
    return [line for line in raw_lines if line]


def should_skip_digest_line(line: str) -> bool:
    lowered = line.lower()
    return (
        lowered.startswith("hey fordham")
        or lowered.startswith("below is a list")
        or lowered.startswith("(the full list")
        or lowered.startswith("to keep up")
        or lowered.startswith("follow student involvement")
    )


def parse_digest_event_line(
    line: str,
    current_date_label: str,
    year: int,
    university: str = None,
    section: str | None = None,
) -> dict | None:
    cleaned = clean_digest_line(line)
    time_match = TIME_RE.search(cleaned)
    if not time_match:
        return None

    time_text = time_match.group(1)
    start_iso, end_iso = build_digest_datetimes(current_date_label, year, time_text)
    location = extract_digest_location(cleaned)
    if not location:
        return None

    title, club_name = build_digest_title_and_club(cleaned, time_text)
    title = finalize_digest_title(title, club_name)
    description = cleaned
    food_keywords = [kw for kw in FOOD_KEYWORDS if kw in cleaned.lower()]

    return {
        "title": title,
        "summary": cleaned[:120],
        "description": description,
        "club_name": club_name,
        "club_names": [club_name] if club_name else [],
        "location": location,
        "start_iso": start_iso,
        "end_iso": end_iso,
        "has_food": bool(food_keywords),
        "food_keywords": food_keywords,
        "confidence": "high" if start_iso and location else "medium",
        "university": university,
        "status": "pending",
        "source": "scanned",
        "tags": [section] if section else [],
    }


def clean_digest_line(line: str) -> str:
    cleaned = re.sub(r"^.*?\bJoin\s+", "", line, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"^(Make sure to join)\s+", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned


def build_digest_datetimes(current_date_label: str, year: int, time_text: str):
    normalized_date = remove_ordinal_suffixes(current_date_label)
    dt = dateparser.parse(f"{normalized_date} {year} {time_text}")
    if not dt:
        return None, None
    dt = localize_event_datetime(dt)
    return dt.isoformat(), None


def remove_ordinal_suffixes(text: str) -> str:
    return re.sub(r"(\d)(st|nd|rd|th)\b", r"\1", text)


def extract_digest_location(line: str) -> str | None:
    match = re.search(
        r"\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\s+(?:in|on)\s+(.+?)(?=(?:\s+(?:to|for|where)\b)|[.!?]|$)",
        line,
        re.IGNORECASE,
    )
    if match:
        return match.group(1).strip()
    return None


def build_digest_title_and_club(line: str, time_text: str) -> tuple[str, str | None]:
    before_time = re.split(rf"\bat\s+{re.escape(time_text)}\b", line, maxsplit=1, flags=re.IGNORECASE)[0].strip()
    before_time = re.sub(r"\s+", " ", before_time).strip(" -")

    explicit_match = re.search(r"^(?P<club>.+?)\s+(?:at|for)\s+their\s+(?P<title>.+)$", before_time, re.IGNORECASE)
    if explicit_match:
        club = normalize_digest_text(explicit_match.group("club"))
        title = normalize_digest_text(explicit_match.group("title"))
        title = re.sub(r"\s+event$", "", title, flags=re.IGNORECASE)
        return title, club

    prefix_lower = before_time.lower()
    for marker in TITLE_MARKERS:
        idx = prefix_lower.find(f" {marker}")
        if idx != -1:
            club = normalize_digest_text(before_time[:idx])
            title = normalize_digest_text(before_time[idx + 1:])
            return title, club

    normalized = normalize_digest_text(before_time)
    return normalized, normalized


def normalize_digest_text(text: str) -> str:
    normalized = re.sub(r"^(the)\s+", "", text.strip(), flags=re.IGNORECASE)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip(" -")


def finalize_digest_title(title: str, club_name: str | None) -> str:
    normalized_title = normalize_digest_text(title)
    normalized_club = normalize_digest_text(club_name or "")
    generic_titles = {"general meeting", "meeting", "weekly meeting"}

    if normalized_title.lower() in generic_titles and normalized_club:
        return f"{normalized_club} {normalized_title}"

    return normalized_title


def dedupe_digest_events(events: list[dict]) -> list[dict]:
    deduped = {}
    for event in events:
        key = (
            event.get("start_iso"),
            (event.get("location") or "").lower(),
        )
        existing = deduped.get(key)
        if not existing or len(event.get("description") or "") > len(existing.get("description") or ""):
            deduped[key] = event
    return list(deduped.values())


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
                dt = localize_event_datetime(dt)
                start = dt.isoformat()
                return start, None
        except Exception:
            continue
    return None, None


def localize_event_datetime(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=LOCAL_EVENT_TZ)
    return dt.astimezone(LOCAL_EVENT_TZ)


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
