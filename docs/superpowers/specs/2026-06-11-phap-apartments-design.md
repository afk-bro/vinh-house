# PHAP Apartments — Design Spec

**Date:** 2026-06-11
**Status:** Approved (brainstorming → ready for implementation plan)

## Summary

A property-showcase website with a lightweight, auth-protected admin CMS for a client
who rents apartments across **5 buildings**, each with multiple rooms. Visitors browse
buildings → rooms; inquiries happen **off-platform** via WhatsApp / Messenger / email
links. There is **no** booking, payment, availability date-math, transactional email, or
contact-form processing. Availability is a single per-room status flag.

This project is scaffolded fresh (not forked) and **harvests** auth, image upload, and
design tokens from the sibling repo at `/home/x/dev/projects/watershed-campground`
(read-only source — never modified).

## Decisions (from brainstorming)

1. **Versions:** Scaffold with `create-next-app` (latest stable), which lands on the same
   majors as watershed (Next 16 / React 19 / Tailwind 4), so harvested code ports with
   minimal friction. Harvest is **ported, not blindly copied** — strip watershed's
   multi-tenancy and reservation/payment coupling.
2. **Photos:** Stored as an **ordered JSONB array** on each row (`{ url, alt, is_cover }`),
   ~10 photos per room. Exactly one element is flagged `is_cover` (admin picks the best
   shot from the set the client provides).
3. **Price:** Dedicated `numeric` column on `rooms`, editable in admin, rendered on the
   public room card as a **pill overlaid on the cover photo**.
4. **Contacts:** **Global, site-wide** — one WhatsApp number, one Messenger link, one
   email, stored in a single-row `site_settings` table and editable in admin settings.
   Every room links to the same contacts.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS (v4)
- Supabase (Postgres + Auth + Storage), `@supabase/ssr`
- **Single tenant** — no `organization_id` model carried over.

**Dependencies added:** `@supabase/ssr`, `@supabase/supabase-js`.
**Explicitly NOT carried over from watershed:** Stripe, Resend, Upstash rate-limiting,
swr, date-fns, and the Playwright/vitest test apparatus (tests may be added later).

## Harvest plan (from `watershed-campground`, read-only)

### Auth (`@supabase/ssr`)
- `lib/supabase/{client,server,middleware}.ts`
- `lib/admin-auth.ts`
- `app/admin/login`, `app/admin/forgot-password`, `app/admin/update-password`
- `app/auth/callback`
- Admin layout auth guard (`app/admin/layout.tsx`)
- **Strip:** all `organization_id` / multi-tenant logic and reservation/payment coupling.

### Image upload → Supabase Storage
- `lib/storage-utils.ts`
- `app/api/admin/upload-image/route.ts`
- Retargeted to write to our `listing-photos` bucket and append the returned public URL
  to the row's `photos` array.

### Design system
- `app/globals.css` (tokens + fonts)
- `tailwind.config.ts`
- Base UI components (buttons, inputs, card, admin shell), pruned of campground-specific
  content.

## Data model (Supabase / Postgres)

```
buildings
  id           uuid pk default gen_random_uuid()
  name         text not null
  address      text
  description  text
  photos       jsonb not null default '[]'      -- [{ url, alt, is_cover }]
  sort_order   int  not null default 0
  created_at   timestamptz default now()
  updated_at   timestamptz default now()

rooms
  id           uuid pk default gen_random_uuid()
  building_id  uuid not null references buildings(id) on delete cascade
  name         text not null
  price        numeric
  status       text not null default 'available'
                 check (status in ('available','not_available'))
  description  text
  photos       jsonb not null default '[]'      -- [{ url, alt, is_cover }]
  sort_order   int  not null default 0
  created_at   timestamptz default now()
  updated_at   timestamptz default now()

site_settings   -- single row
  id               uuid pk default gen_random_uuid()
  site_title       text
  whatsapp_number  text
  messenger_url    text
  contact_email    text
  updated_at       timestamptz default now()
```

- **`photos` JSONB shape:** ordered array of `{ url: string, alt: string, is_cover: boolean }`.
  Array order is the gallery order; exactly one element has `is_cover: true`.
- **RLS:** anon role may `select` from `buildings`, `rooms`, `site_settings`. Only the
  `authenticated` role may `insert` / `update` / `delete`.
- **Storage:** one **public** bucket `listing-photos`. The upload route writes the file
  and returns its public URL, which the admin form appends to the row's `photos` array.

## Admin (auth-protected)

- `/admin` — dashboard / landing.
- `/admin/buildings` — list; create / edit / delete buildings.
- Building → rooms — list; create / edit / delete rooms scoped to a building.
- Per-room editor:
  - Multi-photo **upload** with drag-to-reorder and **pick-cover**.
  - Inline **price** edit.
  - **Status toggle** (Available / Not available).
- `/admin/settings` — edit the three global inquiry contacts (+ site title).

## Public (browse-only, no backend logic)

- `/` — buildings grid.
- `/buildings/[id]` — building detail and its room cards. Each card: cover photo with a
  **price pill** overlay, a **status badge**, and a short description.
- `/rooms/[id]` — room detail: full photo gallery plus the three inquiry links
  (`https://wa.me/<number>`, Messenger URL, `mailto:`) read from `site_settings`.
  *(Open implementation detail: room detail as its own route vs. expand-in-place card —
  default to its own `/rooms/[id]` route unless reconsidered during planning.)*

## Out of scope (reaffirmed)

❌ Booking / reservations · ❌ Stripe / payments · ❌ availability date-math / calendars
· ❌ transactional email / Resend · ❌ contact-form processing. Availability is the single
per-room `status` flag — nothing more.

## Build sequence (high level)

1. Scaffold Next.js + Tailwind + Supabase client wiring.
2. Harvest auth (port + strip multi-tenancy); verify login/reset/callback.
3. Harvest design tokens + base components + admin shell.
4. Schema migration + RLS + storage bucket; harvest upload util.
5. Admin CRUD (buildings, rooms, photos, status, price) + settings.
6. Public pages (buildings grid → building detail → room detail + inquiry links).
