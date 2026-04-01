from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import admin, webhook, public, auth
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from database import SessionLocal
from models import Subscriber, Event
from services.twilio_service import send_event_digest
from datetime import date

# Create all database tables on startup
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

# Daily digest — runs every morning at 8AM
def send_daily_digests():
    db = SessionLocal()
    try:
        # Get all active subscribers
        subscribers = db.query(Subscriber).filter_by(is_active=True).all()

        # Get today's events
        today_events = db.query(Event).filter(
            Event.event_date == date.today()
        ).all()

        if not today_events:
            return

        # Text every subscriber
        for subscriber in subscribers:
            send_event_digest(subscriber.phone_number, today_events)
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(
    send_daily_digests,
    CronTrigger(hour=8, minute=0),
    id="daily_digest"
)
scheduler.start()

@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()

@app.get("/")
def root():
    return {"message": "CampusScan API is running"}

# Manually trigger digest for testing
@app.post("/test-digest")
def test_digest():
    send_daily_digests()
    return {"success": True, "message": "Digest sent to all subscribers"}
