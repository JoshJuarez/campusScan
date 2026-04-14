from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import admin, webhook, public, auth, events
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from models import Subscriber, Event
from services.twilio_service import send_event_digest
from services.scanner import scan_all_ambassadors
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusScan API")
LOCAL_EVENT_TZ = ZoneInfo("America/New_York")

FRONTEND_URLS = [
    url.strip()
    for url in os.getenv("FRONTEND_URLS", os.getenv("FRONTEND_URL", "http://localhost:3000")).split(",")
    if url.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(FRONTEND_URLS + ["http://localhost:3000", "http://localhost:5173"])),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(webhook.router)
app.include_router(public.router)
app.include_router(events.router)


def send_daily_digests():
    db = SessionLocal()
    try:
        subscribers = db.query(Subscriber).filter_by(is_active=True).all()
        now = datetime.now(LOCAL_EVENT_TZ)

        # Find approved events happening today
        today_events = []
        for event in db.query(Event).filter(Event.status == "approved").all():
            if not event.start_iso:
                continue
            try:
                dt = datetime.fromisoformat(event.start_iso)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=LOCAL_EVENT_TZ)
                else:
                    dt = dt.astimezone(LOCAL_EVENT_TZ)
                if dt.date() == now.date():
                    today_events.append(event)
            except Exception:
                continue

        if not today_events:
            return

        for subscriber in subscribers:
            # Only send events for the subscriber's university (or all if no university set)
            if subscriber.university:
                filtered = [e for e in today_events if not e.university or e.university == subscriber.university]
            else:
                filtered = today_events
            if filtered:
                send_event_digest(subscriber.phone_number, filtered)
    finally:
        db.close()


def scheduled_scan_and_digest():
    """Scan inboxes first, then send the daily digest."""
    scan_all_ambassadors()
    send_daily_digests()


scheduler = BackgroundScheduler()
scheduler.add_job(
    scheduled_scan_and_digest,
    CronTrigger(hour=8, minute=0, timezone=LOCAL_EVENT_TZ),
    id="daily_scan_and_digest",
)
scheduler.start()


@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()


@app.get("/")
def root():
    return {"message": "CampusScan API is running"}


def _check_admin(authorization: str):
    expected = f"Bearer {os.getenv('ADMIN_PASSWORD', 'admin123')}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/test-digest")
def test_digest(authorization: str = Header(...)):
    _check_admin(authorization)
    send_daily_digests()
    return {"success": True, "message": "Digest sent to all subscribers"}
