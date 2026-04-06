from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class EventOut(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    description: Optional[str] = None
    club_name: Optional[str] = None
    club_names: Optional[List[str]] = None
    location: Optional[str] = None
    start_iso: Optional[str] = None
    end_iso: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    event_url: Optional[str] = None
    directions_video_url: Optional[str] = None
    university: Optional[str] = None
    has_food: bool = False
    food_keywords: Optional[List[str]] = None
    confidence: Optional[str] = None
    status: str = "approved"
    source: str = "scanned"
    posted_by: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    title: str
    description: str
    club_names: List[str]
    location: str
    start_iso: str
    end_iso: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    event_url: Optional[str] = None
    directions_video_url: Optional[str] = None
    university: Optional[str] = None
    posted_by: Optional[str] = None


class EventReview(BaseModel):
    status: str   # approved | rejected | pending


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    club_names: Optional[List[str]] = None
    location: Optional[str] = None
    start_iso: Optional[str] = None
    end_iso: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    event_url: Optional[str] = None
    directions_video_url: Optional[str] = None
    status: Optional[str] = None
    reviewed_by: Optional[str] = None


class ScanResult(BaseModel):
    ambassadors_scanned: int
    emails_scanned: int
    new_events: int


class SuccessResponse(BaseModel):
    success: bool
    message: Optional[str] = None


class SubscriberCreate(BaseModel):
    phone_number: str
    university: Optional[str] = None


class PartnershipLeadCreate(BaseModel):
    contact_name: str
    email: str
    university: str
    phone_number: Optional[str] = None
    preferred_timing: Optional[str] = None
    message: Optional[str] = None
