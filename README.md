# Dreamize Frontend

Next.js web app for the Dreamize LMS. This repository is **standalone** — clone, configure, and run it on its own. The backend API lives in a separate repo.

## Prerequisites

- **Node.js** 18 or newer
- **pnpm** (recommended) or npm
- A running **Dreamize backend** (local or deployed) for auth, dashboards, chat, and data

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. (Optional) Create local env file — see Environment variables below

# 3. Start development server
pnpm run dev
```

Open **http://localhost:3000** in your browser.

## Environment variables

Create `.env.local` in the frontend root when you need to override defaults:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | No | Sanity CMS project ID (default baked in) |
| `NEXT_PUBLIC_SANITY_DATASET` | No | Sanity dataset (default: `production`) |

### API URL (development vs production)

The backend URL is configured in `services/constants.ts`:

- **Development:** `http://localhost:5000`
- **Production:** `https://umbrella-academy-backend.onrender.com`

For local full-stack work, start the backend on port **5000** — no frontend env change needed.

To point at a different API during development, update `BASE_URL` in `services/constants.ts` or refactor it to use `NEXT_PUBLIC_API_URL` if you add that later.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Next.js dev server on port 3000 |
| `pnpm run build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm run lint` | Run ESLint |

## Running with the backend locally

Use two terminals:

**Terminal 1 — Backend** (separate repo)

```bash
cd dreamize-backend
pnpm install
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, EMAILJS_*, FRONTEND_URL=http://localhost:3000
pnpm run dev
```

**Terminal 2 — Frontend** (this repo)

```bash
cd dreamize-frontend
pnpm install
pnpm run dev
```

Then open **http://localhost:3000**.

Make sure the backend `.env` includes:

```env
FRONTEND_URL=http://localhost:3000
```

Without this, CORS and email links (OTP, guardian invites, password reset) may break.

## User roles

The app supports:

- **Student** — onboarding, roadmaps, projects, bookings, payments, chat
- **Trainer** — students, roadmaps, projects, bookings, chat
- **Admin** — users, approvals, payments, system monitoring
- **Guardian** — linked student progress
- **Sales manager** — leads dashboard

## Tech stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **CMS:** Sanity (blog/content)
- **Realtime:** Socket.IO client (chat, notifications)
- **Backend:** Separate Express + MongoDB API

## Production deployment (Vercel example)

1. Connect this repo to Vercel.
2. Set build command: `pnpm run build` (or use defaults).
3. Ensure the production backend URL in `services/constants.ts` matches your deployed API.
4. On the backend, set `FRONTEND_URL` to your Vercel URL (e.g. `https://dreamize-academy.vercel.app`).

## Project structure

```
app/              # Next.js App Router pages
components/       # UI components (admin, chat, dashboard, etc.)
contexts/         # React context (auth, roadmaps, projects, etc.)
hooks/            # Custom hooks
services/         # API clients, socket, constants
lib/              # Utilities, design system
types/            # TypeScript types
```

## Troubleshooting

**API requests fail / network errors**  
Confirm the backend is running and reachable at `http://localhost:5000/health`.

**Login works locally but not in production**  
Check that `BASE_URL` in `services/constants.ts` points to the correct deployed backend.

**Chat not connecting**  
Socket.IO uses the same `BASE_URL`. Backend must allow your frontend origin in CORS (`FRONTEND_URL`).

**Sanity content missing**  
Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` if you override defaults.

## Contact

hello@dreamize.rw
