"""
Public event discovery endpoints + club-admin CRUD.

Auth model:
  - GET  /events        public (no auth)
  - GET  /events/{id}   public (no auth; non-approved only visible with admin auth)
  - POST /events        requires Authorization: Bearer <ADMIN_PASSWORD>
  - PATCH /events/{id}  requires Authorization: Bearer <ADMIN_PASSWORD>
  - DELETE /events/{id} requires Authorization: Bearer <ADMIN_PASSWORD>

The Next.js API routes validate the NextAuth session server-side and then
call these endpoints with the Bearer token — the token never reaches the browser.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Event
from schemas import EventCreate, EventUpdate, EventOut
import os

router = APIRouter(prefix="/events", tags=["events"])


def _check_admin(authorization: str = Header(...)):
    expected = f"Bearer {os.getenv('ADMIN_PASSWORD', 'admin123')}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


def _derive_summary(description: str) -> str:
    text = (description or "").replace("\n", " ").strip()
    if len(text) <= 120:
        return text
    return text[:117].rstrip() + "..."


@router.get("", response_model=list[EventOut])
def list_events(
    university: Optional[str] = Query(None),
    status: Optional[str] = Query("approved"),
    q: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    include_past: bool = Query(False, alias="includePast"),
    db: Session = Depends(get_db),
):
    query = db.query(Event)

    if status == "approved":
        query = query.filter(Event.status == "approved")
    # Other statuses (pending/rejected/all) require admin auth and are handled
    # by the Next.js API route proxy, which adds the Bearer token.

    if university:
        query = query.filter(Event.university == university)

    events = query.order_by(Event.created_at.desc()).all()

    # Apply search filter in Python (simpler than ARRAY contains across multiple cols)
    if q:
        lower_q = q.lower()
        events = [
            e for e in events
            if lower_q in (e.title or "").lower()
            or lower_q in (e.summary or "").lower()
            or lower_q in (e.description or "").lower()
            or lower_q in (e.location or "").lower()
            or lower_q in (e.club_name or "").lower()
        ]

    if tag:
        lower_tag = tag.lower()
        events = [e for e in events if lower_tag in [t.lower() for t in (e.tags or [])]]

    if not include_past:
        now = datetime.now(timezone.utc)
        def is_future(e):
            if not e.start_iso:
                return True
            try:
                dt = datetime.fromisoformat(e.start_iso)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt >= now
            except Exception:
                return True
        events = [e for e in events if is_future(e)]

    return events


@router.get("/all", response_model=list[EventOut])
def list_all_events(
    university: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    """Return events of all statuses — admin only."""
    _check_admin(authorization)
    query = db.query(Event)
    if university:
        query = query.filter(Event.university == university)
    return query.order_by(Event.created_at.desc()).all()


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.status != "approved":
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("", response_model=EventOut, status_code=201)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    _check_admin(authorization)
    club_names = payload.club_names or []
    club_name = club_names[0] if club_names else None

    event = Event(
        title=payload.title.strip(),
        summary=_derive_summary(payload.description),
        description=payload.description.strip(),
        club_name=club_name,
        club_names=club_names,
        location=payload.location.strip() if payload.location else None,
        start_iso=payload.start_iso,
        end_iso=payload.end_iso,
        tags=payload.tags or [],
        image_url=payload.image_url,
        event_url=payload.event_url,
        directions_video_url=payload.directions_video_url,
        university=payload.university,
        status="pending",
        source="submitted",
        posted_by=payload.posted_by,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    _check_admin(authorization)
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "club_names" in update_data:
        club_names = update_data["club_names"] or []
        event.club_names = club_names
        event.club_name = club_names[0] if club_names else event.club_name
        del update_data["club_names"]

    if "status" in update_data and update_data["status"] in ("approved", "rejected", "pending"):
        event.reviewed_at = datetime.now(timezone.utc)

    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    _check_admin(authorization)
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"success": True}
