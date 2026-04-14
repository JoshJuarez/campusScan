# CampusScan Deployment

## Recommended setup

- Frontend: Vercel
- Backend: Render web service
- Database: Render Postgres or any hosted Postgres

## 1. Deploy the backend

The repo includes [render.yaml](/Users/joshuajuarez/Desktop/campusscan/render.yaml:1) for the FastAPI service.

Use these backend env vars:

- `DATABASE_URL`
- `BASE_URL`
  Example: `https://campusscan-api.onrender.com`
- `FRONTEND_URLS`
  Example: `https://campusscan.vercel.app,https://campusscan-git-main-yourname.vercel.app`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_PASSWORD`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

Backend start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 2. Deploy the frontend

Create a Vercel project with:

- Root Directory: `frontend`
- Framework Preset: `Next.js`

Frontend env vars:

- `NEXTAUTH_URL`
  Example: `https://campusscan.vercel.app`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `API_URL`
  Example: `https://campusscan-api.onrender.com`
- `NEXT_PUBLIC_API_URL`
  Example: `https://campusscan-api.onrender.com`
- `ADMIN_PASSWORD`
- `ADMIN_EMAILS`
- `CLUB_ADMIN_EMAILS`

## 3. Update Google OAuth

Add these redirect URIs:

- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:8000/auth/callback`
- `https://YOUR_VERCEL_DOMAIN/api/auth/callback/google`
- `https://YOUR_BACKEND_DOMAIN/auth/callback`

Also add JavaScript origins:

- `http://localhost:3000`
- `https://YOUR_VERCEL_DOMAIN`

## 4. Update Twilio

For inbound SMS, set the Messaging webhook to:

```text
https://YOUR_BACKEND_DOMAIN/webhook/sms
```

Twilio delivery to US numbers still requires A2P 10DLC registration for the sending number.

## 5. Final launch checklist

- Rotate all secrets currently stored in local `.env` files
- Confirm Google sign-in works in production
- Confirm `/admin` works for your admin email
- Confirm approved events appear on `/events`
- Confirm Twilio webhook is reachable
- Confirm one real SMS send after A2P registration
