from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import admin, webhook, public, auth
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from models import Subscriber, Event
from services.twilio_service import send_event_digest
from services.scanner import scan_all_ambassadors
from datetime import date
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusScan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(webhook.router)
app.include_router(public.router)


def send_daily_digests():
    db = SessionLocal()
    try:
        subscribers = db.query(Subscriber).filter_by(is_active=True).all()
        today_events = db.query(Event).filter(Event.event_date == date.today()).all()
        if not today_events:
            return
        for subscriber in subscribers:
            send_event_digest(subscriber.phone_number, today_events)
    finally:
        db.close()


def scheduled_scan_and_digest():
    """Scan inboxes first, then send the daily digest."""
    scan_all_ambassadors()
    send_daily_digests()


scheduler = BackgroundScheduler()
# Scan inboxes and send digest every morning at 7:45 AM
scheduler.add_job(
    scheduled_scan_and_digest,
    CronTrigger(hour=7, minute=45),
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
