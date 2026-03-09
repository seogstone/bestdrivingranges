# BestDrivingRanges

BestDrivingRanges is a UK golf directory built with Next.js App Router and Supabase.

## Features

- Directory pages for ranges and indoor simulators
- Canonical city pages at `/city/[city]`
- Individual listing pages at `/range/[slug]`
- Map view with Leaflet + OpenStreetMap
- Near-me browser geolocation search
- Public submission form with anti-spam + rate limiting
- Admin moderation workflow backed by Supabase Auth + roles
- CSV import script for seeded launch data

## Tech stack

- Next.js 16 + React 19 + TypeScript
- Supabase Postgres + Auth + RLS
- Leaflet / react-leaflet
- Vitest (unit/integration) + Playwright (e2e)

## Environment variables

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Local development

```bash
npm install
npm run dev
```

## Database setup

Run the SQL migration in your Supabase SQL editor:

- `supabase/migrations/001_init.sql`

Then create at least one `profiles` row with role `admin` or `editor` for your auth user.

## Data import

CSV template:

- `data/ranges-template.csv`

Import command:

```bash
npm run import:ranges -- data/ranges-template.csv
```

The script outputs a JSON report: inserted / updated / failed rows.

## Test commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## API endpoints

- `GET /api/ranges`
- `GET /api/ranges/[slug]`
- `GET /api/city/[city]`
- `POST /api/submissions`
- `GET /api/admin/submissions`
- `POST /api/admin/submissions/[id]/approve`
- `POST /api/admin/submissions/[id]/reject`
