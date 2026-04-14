# CampusScan

A multi-university campus event discovery and SMS alert platform. CampusScan auto-scans ambassador inboxes, surfaces events on a filterable web feed, and delivers personalized daily text digests.

**Stack:** Python (FastAPI) · Next.js 15 · PostgreSQL · Twilio A2P SMS · NextAuth · Gmail API · APScheduler

**Live:** [campusscan.vercel.app](https://campusscan.vercel.app)

---

## How it works

1. **Ambassadors** connect their `.edu` Gmail inbox via Google OAuth
2. **Scanner** runs daily at 8AM — fetches recent emails, filters by 20+ campus event keywords, and extracts event titles, datetimes, locations, and food mentions using a regex-based NLP parser with 3-tier confidence scoring
3. **Admins** review parsed events in the `/admin/review` queue before they go public
4. **Students** browse approved events at `/events` and add them to Google Calendar
5. **Subscribers** receive a Twilio SMS digest each morning with that day's events, filtered by their university

---

## Project structure

```
campusscan/
├── backend/          # FastAPI app
│   ├── main.py       # App entry, APScheduler cron
│   ├── models.py     # SQLAlchemy models
│   ├── schemas.py    # Pydantic schemas
│   ├── database.py   # DB connection
│   ├── routers/      # admin, auth, events, public, webhook
│   └── services/     # scanner, parser, gmail, twilio_service
└── frontend/         # Next.js 15 App Router
    └── app/          # events, clubs, submit, admin, signin, privacy, terms
```

---

## Roles

| Role | Access | How assigned |
|------|--------|--------------|
| `system_admin` | Full admin dashboard | `ADMIN_EMAILS` env var |
| `club_admin` | Submit events + review queue | `CLUB_ADMIN_EMAILS` env var |
| `student` | Browse events, add to calendar | Any `.edu` Google sign-in |
| `blocked` | Cannot sign in | Non-`.edu` emails |

---

## Local development

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on `http://localhost:8000`. Requires a `backend/.env` with:

```
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_PASSWORD=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`. Requires a `frontend/.env.local` with:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
ADMIN_PASSWORD=
ADMIN_EMAILS=
CLUB_ADMIN_EMAILS=
```

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full Vercel + Render setup, Google OAuth redirect URIs, and Twilio webhook configuration.
