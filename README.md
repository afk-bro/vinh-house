# PHAP Apartments

A property showcase website with a lightweight admin CMS for managing apartment
listings across 5 buildings. Browse-only for visitors; inquiries go to WhatsApp /
Messenger / email. No booking, no payments.

## Build plan

1. **Scaffold** — Next.js + TypeScript + Tailwind, Supabase client wiring.
2. **Harvest from `watershed-campground`** (by absolute path, read-only):
   - Admin auth (`@supabase/ssr` login, password reset, callback).
   - Image upload → Supabase storage.
   - Design tokens / base components / admin shell.
3. **Schema** — `buildings` (name, address, description, photos) and
   `rooms` (`building_id` FK, price, `status`, description, photos).
4. **Admin** — buildings/rooms CRUD + photo upload + status toggle.
5. **Public** — buildings list → building page → room cards, each with
   WhatsApp / Messenger / email inquiry links.

## Out of scope

Booking, reservations, Stripe/payments, availability date-math, transactional email,
contact-form processing. See `CLAUDE.md` for the full scope contract.

## Getting started

### Prerequisites

- **Node.js 20.9+** and npm (required by Next.js 16 and the image-optimization tooling).
- A **Supabase project** (free tier is fine) — you'll need its API keys.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (server-only — never expose to the browser) |
| `ADMIN_EMAILS` | Comma-separated list of emails allowed into `/admin` |

### 3. Set up the database

Apply the migrations in `supabase/migrations/` **in order**:

1. `0001_init.sql`
2. `0002_storage.sql`

Run them via the **Supabase SQL editor** (paste each file and run) or `supabase db push`.

> **Important:**
> - **Run each migration once.** They are **not** idempotent — re-running `0001`
>   would create a duplicate `site_settings` row and error on existing objects.
> - **Use the SQL editor or `supabase db push`.** The storage-policy statements
>   need a privileged role; a low-privilege `psql` session can fail on the
>   `storage.objects` policies.

This creates the `buildings`, `rooms`, and `site_settings` tables (the latter seeded
with a single row), RLS policies (public read / authenticated write), and the public
`listing-photos` storage bucket.

### 4. Create an admin user

There is no public signup — admins are created in Supabase. In the dashboard go to
**Authentication → Users → Add user** and create a user whose email is listed in
`ADMIN_EMAILS`. Either set a password directly, or use the invite/recovery email flow
(which routes through `/auth/callback` → `/admin/update-password` to set one).

### 5. Run the app

```bash
npm run dev
```

- Public site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (redirects to `/admin/login`)

### Admin usage

1. Create **buildings**.
2. Add **rooms** to each building — set the price, the availability status, and
   upload photos (pick one as the cover).
3. Under **Settings**, set the global WhatsApp / Messenger / email contacts used by
   the public inquiry links.

Public visitors browse buildings → rooms and inquire via those outbound links.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm test` | Run the test suite (Vitest) |
| `npm run lint` | Lint with ESLint |

### Optional — regenerate database types

`supabase/types.ts` ships as a permissive placeholder. To generate real types from
your schema:

```bash
npx supabase gen types typescript --project-id <ref> --schema public > supabase/types.ts
```
