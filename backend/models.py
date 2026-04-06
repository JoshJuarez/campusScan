from sqlalchemy import Column, Integer, String, Text, Boolean, ARRAY, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Ambassador(Base):
    __tablename__ = "ambassadors"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String(255), unique=True, nullable=False)
    name          = Column(String(255))
    google_id     = Column(String(255), unique=True)
    access_token  = Column(Text)
    refresh_token = Column(Text)
    university    = Column(String(255))
    is_active     = Column(Boolean, default=True)
    joined_at     = Column(DateTime, server_default=func.now())

    scanned_emails = relationship("ScannedEmail", back_populates="ambassador")


class Subscriber(Base):
    __tablename__ = "subscribers"

    id           = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, nullable=False)
    university   = Column(String(255))
    is_active    = Column(Boolean, default=True)
    joined_at    = Column(DateTime, server_default=func.now())


class ScannedEmail(Base):
    __tablename__ = "scanned_emails"

    id             = Column(Integer, primary_key=True, index=True)
    ambassador_id  = Column(Integer, ForeignKey("ambassadors.id"))
    gmail_id       = Column(String(255), unique=True, nullable=False)
    subject        = Column(Text)
    sender         = Column(String(255))
    raw_body       = Column(Text)
    received_at    = Column(DateTime)
    scanned_at     = Column(DateTime, server_default=func.now())

    ambassador = relationship("Ambassador", back_populates="scanned_emails")
    event      = relationship("Event", back_populates="source_email", uselist=False)


class Event(Base):
    """
    Covers both auto-scanned events (source='scanned', status='approved' by default)
    and manually submitted events (source='submitted', status='pending' until reviewed).
    """
    __tablename__ = "events"

    id               = Column(Integer, primary_key=True, index=True)
    scanned_email_id = Column(Integer, ForeignKey("scanned_emails.id"), nullable=True)

    # Core content
    title            = Column(Text, nullable=False)
    summary          = Column(Text)
    description      = Column(Text)
    club_name        = Column(String(255))          # primary club
    club_names       = Column(ARRAY(String))        # all clubs (collab events)
    location         = Column(Text)
    start_iso        = Column(String(50))           # ISO-8601 datetime string
    end_iso          = Column(String(50))
    tags             = Column(ARRAY(String))
    image_url        = Column(Text)
    event_url        = Column(Text)
    directions_video_url = Column(Text)
    university       = Column(String(255))

    # Scanning metadata
    has_food         = Column(Boolean, default=False)
    food_keywords    = Column(ARRAY(String))
    confidence       = Column(String(20))

    # Workflow
    status           = Column(String(20), default="approved")   # approved | pending | rejected
    source           = Column(String(20), default="scanned")    # scanned | submitted
    posted_by        = Column(String(255))
    reviewed_by      = Column(String(255))
    reviewed_at      = Column(DateTime)

    created_at       = Column(DateTime, server_default=func.now())
    updated_at       = Column(DateTime, server_default=func.now(), onupdate=func.now())

    source_email = relationship("ScannedEmail", back_populates="event")


class PartnershipLead(Base):
    __tablename__ = "partnership_leads"

    id               = Column(Integer, primary_key=True, index=True)
    contact_name     = Column(String(255), nullable=False)
    email            = Column(String(255), nullable=False)
    university       = Column(String(255), nullable=False)
    phone_number     = Column(String(20))
    message          = Column(Text)
    preferred_timing = Column(String(255))
    created_at       = Column(DateTime, server_default=func.now())
