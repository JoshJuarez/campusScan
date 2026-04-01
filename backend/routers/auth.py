from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Ambassador
import os
import requests
import base64
import json

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/google")
def google_login(university: str = ""):
    """Start the Google OAuth flow for a new ambassador.

    Pass ?university=<name> so we can store which school the ambassador belongs to.
    The value is encoded into the OAuth state param and read back in the callback.
    """
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("BASE_URL", "http://localhost:8000") + "/auth/callback"
    scope = (
        "email profile "
        "https://www.googleapis.com/auth/gmail.readonly"
    )
    # Encode university in state so we get it back after the redirect
    state = base64.urlsafe_b64encode(
        json.dumps({"university": university}).encode()
    ).decode()

    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&access_type=offline"
        f"&prompt=consent"
        f"&state={state}"
    )
    return RedirectResponse(url=url)


@router.get("/callback")
def google_callback(code: str, state: str = "", db: Session = Depends(get_db)):
    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    redirect_uri = base_url + "/auth/callback"

    # Decode university from state
    university = ""
    if state:
        try:
            decoded = json.loads(base64.urlsafe_b64decode(state.encode()))
            university = decoded.get("university", "")
        except Exception:
            pass

    # Exchange the code for tokens
    token_response = requests.post("https://oauth2.googleapis.com/token", data={
        "code": code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    })
    tokens = token_response.json()

    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")

    # Get the ambassador's Google profile
    profile = requests.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    google_id = profile.get("id")
    email = profile.get("email")
    name = profile.get("name")

    # Create or update the ambassador record
    ambassador = db.query(Ambassador).filter_by(google_id=google_id).first()
    if not ambassador:
        ambassador = Ambassador(
            email=email,
            name=name,
            google_id=google_id,
            access_token=access_token,
            refresh_token=refresh_token,
            university=university or None,
        )
        db.add(ambassador)
    else:
        ambassador.access_token = access_token
        ambassador.refresh_token = refresh_token
        if university:
            ambassador.university = university

    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(url=f"{frontend_url}/admin?connected=true")


@router.get("/ambassadors")
def list_ambassadors(db: Session = Depends(get_db)):
    ambassadors = db.query(Ambassador).filter_by(is_active=True).all()
    return [
        {"id": a.id, "name": a.name, "email": a.email, "joined_at": a.joined_at}
        for a in ambassadors
    ]
