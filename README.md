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

> Scaffolding in progress — commands will be added once the Next.js app is set up.
