# Study Tracker

A full-stack study tracker: React (Vite + Tailwind) on the frontend, Node/Express/MongoDB on the backend. Built to track study sessions, coding commits, learning topics, and notes in one dashboard.

## What's included

- Landing page → register/login → dashboard, with JWT-based auth (passwords hashed with bcrypt)
- Study timer (start/pause/resume/stop/reset) with today/week/lifetime totals, saved permanently
- Commit counter with today/week/month/lifetime totals
- Learning topics with hours studied, progress %, and status
- Notes with create/edit/delete/search
- Dashboard analytics cards + a weekly bar chart (recharts)
- **Study streak** calculation (like a coding streak tracker)
- **CSV export** of your full study history
- Dark mode (persisted), responsive layout, toast notifications, smooth page animations
- Security basics: helmet, rate limiting, hashed passwords, JWT expiry, per-user data isolation

## Why these extras (good talking points for interviews)

- **Rate limiting + helmet** — shows security awareness, not just CRUD.
- **Streak calculation** — a small algorithm (not just a stored counter), good to walk through in an interview.
- **CSV export** — a real "power user" feature, shows you think about the whole user journey.
- **Dark mode + animations** — signals attention to UI/UX polish, not just working code.
- **Clean separation** (routes → controllers → models) — standard industry structure, easy for a reviewer to navigate.

## Project structure

```
study-tracker/
  backend/
    config/db.js          MongoDB connection
    middleware/auth.js     JWT verification
    models/                Mongoose schemas
    controllers/            Route logic
    routes/                 Express routes
    utils/                  Date + streak helpers
    server.js               Entry point
  frontend/
    src/
      context/             Auth + theme state
      services/api.js      Shared axios instance
      components/          Reusable UI pieces
      pages/                Route-level pages
      App.jsx               Routing
      main.jsx              Entry point
```

## Setup — exactly what to change

### 1. Backend config

File: `backend/.env.example` → **rename to `backend/.env`**, then edit:

| Line | What to put there |
|---|---|
| `MONGO_URI=...` | Your MongoDB connection string. Easiest option: create a free cluster at mongodb.com/cloud/atlas, click "Connect" → "Drivers", copy the string, and replace `<username>`, `<password>`, and add a database name at the end (e.g. `/study-tracker`). |
| `JWT_SECRET=...` | Any long random string (e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste the output). |
| `JWT_EXPIRES_IN=7d` | How long a login stays valid. Leave as-is unless you want it shorter/longer. |
| `PORT=5000` | Change only if port 5000 is already used on your machine. |
| `CLIENT_URL=http://localhost:5173` | Leave as-is for local development. Update this to your deployed frontend URL when you deploy. |

### 2. Frontend config

File: `frontend/.env.example` → **rename to `frontend/.env`**, then edit:

| Line | What to put there |
|---|---|
| `VITE_API_URL=http://localhost:5000/api` | Leave as-is locally. When you deploy the backend, change this to your deployed backend URL + `/api`. |

### 3. Install and run

```bash
# Backend
cd backend
npm install
npm run dev        # starts on http://localhost:5000

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

Open `http://localhost:5173` — you should see the landing page. Register an account, and you're in the dashboard.

## Deploying (optional, when you're ready)

- **Backend**: Render, Railway, or Fly.io all work well for a Node/Express app. Set the same environment variables from `.env` in their dashboard.
- **Frontend**: Vercel or Netlify. Set `VITE_API_URL` to your deployed backend's `/api` URL as an environment variable there.
- **Database**: MongoDB Atlas free tier is enough for a portfolio project.

## Notes on scope

This is a complete, working scaffold covering every feature you listed. A few things are intentionally simple and worth mentioning as "next steps" if a recruiter asks what you'd add:
- Refresh tokens (currently a single JWT with an expiry, no silent refresh)
- Email verification on signup
- Automated tests (the structure — routes/controllers/models — is set up to make these easy to add)