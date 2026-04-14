# CampusScan Frontend

This is the Next.js frontend for CampusScan.

## Local development

```bash
npm install
npm run dev
```

The app expects the FastAPI backend to run on `http://localhost:8000` by default.

## Required env vars

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `API_URL`
- `NEXT_PUBLIC_API_URL`
- `ADMIN_PASSWORD`
- `ADMIN_EMAILS`
- `CLUB_ADMIN_EMAILS`

## Deployment

Deploy this folder to Vercel with:

- Root Directory: `frontend`
- Framework Preset: `Next.js`

See [DEPLOYMENT.md](/Users/joshuajuarez/Desktop/campusscan/DEPLOYMENT.md:1) for the full stack setup.
