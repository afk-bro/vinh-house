# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**PHAP Apartments** is a property showcase website with a lightweight admin CMS for a
client who rents apartments. It is **not** a booking or payment system — it is a
catalog that staff can edit and visitors can browse.

### Scope (deliberately small)

**Domain model:** Buildings → Rooms (a two-level catalog).
- The client has **5 buildings**, each with **multiple rooms**.
- Each room has: photos, price, description, and an **availability status toggle**
  (e.g. Available / Not available).

**Admin (auth-protected):**
- Add / remove / update **buildings** and **rooms**.
- Upload room photos.
- Set price and flip the per-room availability status.

**Public (no backend logic, showcase only):**
- Browse buildings → rooms.
- Inquiries happen **off-platform**: each room links out to WhatsApp
  (`https://wa.me/<number>`), Facebook Messenger, and/or a `mailto:` link.

### Explicitly OUT of scope — do not build these

- ❌ Booking / reservation system
- ❌ Stripe / payments (client handles payments themselves, offline)
- ❌ Availability **engine** / date-conflict checking / calendars
  (availability is a simple per-room status flag, not date math)
- ❌ Transactional email / Resend / confirmation flows
- ❌ Contact-form processing (inquiries go to WhatsApp/Messenger/email links)

## Origin: harvested from watershed-campground

This project was started fresh rather than forked. A small number of pieces are being
**copied (harvested)** from a sibling project at
`/home/x/dev/projects/watershed-campground` — read those files by absolute path; do
**not** modify that repo.

Worth harvesting (the parts that are tedious to rebuild):
1. **Supabase admin auth** — `@supabase/ssr` login, password reset, callback wiring
   (`app/auth/callback`, admin layout auth guard).
2. **Image upload → Supabase storage** — the upload util + storage handling.
3. **Design system** — `globals.css` tokens, fonts, base components, admin shell layout.

Everything reservation/payment/availability-related in that repo is intentionally
left behind.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Storage), `@supabase/ssr`
- Single tenant — no multi-tenancy needed (the campground's `organization_id` model
  is NOT being carried over).

## Status

🚧 Scaffolding. See `README.md` for the build plan.
