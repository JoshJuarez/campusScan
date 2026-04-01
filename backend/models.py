from sqlalchemy import Column, Integer, String, Text, Boolean, ARRAY, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


# An ambassador is a student who is on club/campus mailing lists and connects
# their Gmail so CampusScan can scan it for events. Multiple ambassadors can
# exist per school. Their inbox is the sole source of event data.
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
    __tablename__ = "events"

    id               = Column(Integer, primary_key=True, index=True)
    scanned_email_id = Column(Integer, ForeignKey("scanned_emails.id"))
    title            = Column(Text, nullable=False)
    club             = Column(String(255))
    event_date       = Column(Date)
    event_time       = Column(Time)
    location         = Column(Text)
    has_food         = Column(Boolean, default=False)
    food_keywords    = Column(ARRAY(String))
    confidence       = Column(String(20))
    created_at       = Column(DateTime, server_default=func.now())

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
