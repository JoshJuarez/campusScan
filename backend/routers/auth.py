from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User
import os
import requests

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/google")
def google_login():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = "http://localhost:8000/auth/callback"
    scope = "email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar"
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&access_type=offline"
        f"&prompt=consent"
    )
    return {"auth_url": url}

@router.get("/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    # Exchange the code Google gave us for real tokens
    token_response = requests.post("https://oauth2.googleapis.com/token", data={
        "code": code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": "http://localhost:8000/auth/callback",
        "grant_type": "authorization_code",
    })
    tokens = token_response.json()

    access_token  = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")

    # Get the user's Google profile info
    profile = requests.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    google_id = profile.get("id")
    email     = profile.get("email")
    name      = profile.get("name")

    # Check if user already exists, if not create them
    user = db.query(User).filter_by(google_id=google_id).first()
    if not user:
        user = User(
            email=email,
            name=name,
            google_id=google_id,
            access_token=access_token,
            refresh_token=refresh_token,
        )
        db.add(user)
    else:
        # Update their tokens in case they expired
        user.access_token  = access_token
        user.refresh_token = refresh_token

    db.commit()
    db.refresh(user)

    # Redirect to the frontend with the user's ID
    return RedirectResponse(url=f"http://localhost:5173/events?user_id={user.id}")

@router.get("/me/{user_id}")
def get_me(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    return {"id": user.id, "email": user.email, "name": user.name}

@router.post("/phone/{user_id}")
def save_phone(user_id: int, data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    user.phone_number = data.get("phone_number")
    db.commit()

    # Send welcome text
    from services.twilio_service import send_welcome_text
    send_welcome_text(user.phone_number, user.name)

    return {"success": True}