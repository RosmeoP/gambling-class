# World Cup Predictor

Predict World Cup match scores with your friends, organized into groups. Each group gets a shareable invite code; members predict scores before kickoff and see each other's picks (your own predictions stay private until you submit one for that match, or until kickoff passes).

## Stack

- **apps/web** — React + TypeScript + Vite + Tailwind CSS
- **apps/api** — Node.js + TypeScript + Express + Prisma
- **packages/shared** — TypeScript types shared between web and api
- **Database** — PostgreSQL
- **Match data** — [football-data.org](https://www.football-data.org/) free API (competition `WC`)

Monorepo managed with pnpm workspaces + Turborepo.

## Local setup

1. Install dependencies:
   ```
   pnpm install
   ```
2. Start Postgres (requires Docker):
   ```
   docker compose up -d
   ```
3. Copy env files and fill in values:
   ```
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```
   Get a free `FOOTBALL_DATA_API_KEY` from https://www.football-data.org/client/register.
4. Run the initial migration:
   ```
   pnpm db:migrate
   ```
5. (Optional, no API key needed) Seed a few sample matches for local testing:
   ```
   pnpm db:seed
   ```
6. Start both apps:
   ```
   pnpm dev
   ```
   - Web: http://localhost:5173
   - API: http://localhost:3000

## Pulling real fixtures

Once `FOOTBALL_DATA_API_KEY` is set, sync World Cup fixtures/scores from football-data.org:

```
curl -X POST http://localhost:3000/matches/sync -H "Authorization: Bearer <your JWT>"
```

This is idempotent — call it again any time to refresh scores. In production, wire it to a periodic job (e.g. a Railway cron or scheduled GitHub Action) instead of calling it manually.

## Deploy

- **Web (Vercel)**: point Vercel at `apps/web`, set `VITE_API_URL` to your deployed API URL.
- **API + Postgres (Railway)**: deploy `apps/api/Dockerfile` (build context = repo root: `docker build -f apps/api/Dockerfile .`), attach a Railway Postgres plugin, set `DATABASE_URL`, `JWT_SECRET`, `FOOTBALL_DATA_API_KEY`, `WEB_ORIGIN` (your Vercel URL) as env vars. The container runs `prisma migrate deploy` on startup.

## How groups & visibility work

- Any user can create a group (`/groups/new`); this generates a unique invite code.
- Sharing the invite link (`/groups/join?code=...`) or just the code lets anyone join.
- On a group's page, you see everyone's predictions for the day's matches — but a member's pick for a given match is hidden from you until you've submitted your own pick for that match, or the match has kicked off. This stops people copying each other.
