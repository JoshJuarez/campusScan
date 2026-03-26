from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional, List


# What an event looks like when sent to the frontend
class EventOut(BaseModel):
    id: int
    title: str
    club: Optional[str]
    event_date: Optional[date]
    event_time: Optional[time]
    location: Optional[str]
    has_food: bool
    food_keywords: Optional[List[str]]
    confidence: str
    status: str
    google_cal_event_id: Optional[str]

    class Config:
        from_attributes = True

class ScanResult(BaseModel):
    scanned: int
    new_events: int

class SuccessResponse(BaseModel):
    success: bool
    message: Optional[str] = None


class SubscriberCreate(BaseModel):
    phone_number: str


class PartnershipLeadCreate(BaseModel):
    contact_name: str
    email: str
    university: str
    phone_number: Optional[str] = None
    preferred_timing: Optional[str] = None
    message: Optional[str] = None
