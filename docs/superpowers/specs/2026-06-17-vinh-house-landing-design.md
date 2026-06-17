# Vĩnh House — Public Website Design

**Date:** 2026-06-17
**Status:** Approved (brainstorm) — pending implementation plan
**Scope:** Public showcase website for Vĩnh House. Admin/Supabase work is **parked**
(client has not paid for it). This spec covers the public site only.

## Goal

Ship a polished, fully static public website for **Vĩnh House** — a boutique
apartments-and-hotel rental business in Da Nang, Vietnam. Visitors browse buildings →
rooms and inquire off-platform (WhatsApp / Messenger / phone / email). No booking, no
payments, no database at runtime.

## Key decisions (from brainstorm)

| Decision | Choice |
| --- | --- |
| Data source | **Filesystem-driven / static.** No Supabase at runtime. |
| Content layer | Folders + one hand-maintained `lib/content/site.ts` (placeholders) |
| Contacts | **Global** (one set for whole business), placeholder values for now |
| Nav Contact vs Book now | **Merged** into a single "Book now" CTA |
| i18n | **Centralized English strings**; flag dropdown rendered but inert |
| Room details | Content file with **obvious placeholders** (price, blurb, status) |
| Photos in repo | **Commit optimized** images; raw originals stay gitignored |
| Azure Apartments | **"Coming soon"** state (sparse data) |

## Architecture

### Static, filesystem-driven

The existing **Supabase-backed** public pages (`app/page.tsx`,
`app/buildings/[id]/page.tsx`, `app/rooms/[id]/page.tsx`) are **rebuilt** to read from
the filesystem at build time. No Supabase client calls remain on public routes; public
deploys with no database dependency.

The **admin pages stay in the repo but dormant** — not linked from the public site, not
required to build or deploy. They are revisited if/when the client pays for the CMS.

### Two content layers

1. **Folders** — `public/Phap_photos/<Building>/...` are the source of:
   - which **buildings** exist (top-level folder names),
   - which **room types** a building has (subfolder names, e.g. `1-bedroom`, `2-bedroom`),
   - the **photos** for each (image files; building-level images sit at the building
     folder root, room images in the room subfolder).
   Read at build time via Node `fs`.

2. **`lib/content/site.ts`** — a single hand-maintained file for everything folders
   can't express, seeded with clearly-marked placeholders:
   - **Global contacts:** `email`, `phone`, `whatsapp`, `facebook`, `motorbikeUrl`.
   - **Per-building:** display name, location/address, short blurb, sort order,
     `comingSoon` flag, cover image selection.
   - **Per-room:** price (e.g. `"$— / month"` placeholder), short blurb, availability
     status (`available` | `unavailable`).

   Building metadata currently in each `Information.txt` (name, address, phone, contact,
   motorbike link) is **migrated into this file**, so no `.txt` is read at runtime or
   served publicly.

3. **`lib/content/strings.ts`** — all user-facing UI copy in English, centralized so a
   later translation pass is a clean copy. Components import strings from here rather
   than hardcoding text.

### Photos

Filesystem-driven rendering requires the images to be **in the repo**. The earlier
gitignore of `public/Phap_photos/` is reversed for an **optimized** committed set
(resize/compress; the 7227×4064 skyline must be downscaled). Raw originals remain
gitignored. Optimization approach (build-time `next/image` vs pre-processed files) is an
implementation-plan detail.

## Components

New components (forest-green + gold design system, Cormorant Garamond headings / Inter body):

- **`Navbar`** (sticky) with sub-parts:
  - `Logo` — `logo.png` (small) + **Vĩnh House** title + subtitle
    *"Apartments and Hotel Rentals — Da Nang"*.
  - `BuildingsMenu` — dropdown generated from building folders; each item → building page.
  - `ScooterLink` — links out to the motorbike rental URL (new tab).
  - `LanguageMenu` — flag icons for EN / VI / KO / ZH / RU; EN active, others marked
    "coming soon" and inert.
  - `BookNowMenu` — primary gold CTA opening a dropdown with **Email · Phone · Facebook ·
    WhatsApp**. WhatsApp link is prefilled: *"Hi, I'm interested in renting a room at
    Vĩnh House."*
  - Mobile: hamburger collapse; **Book now** stays visible.
- **`Hero`** — `Da_Nang_skyline.jpg` full-bleed + dark overlay, "Vĩnh House" + tagline,
  Book now + "Browse our buildings" (scrolls to buildings section).
- **`ValueProps`** — three items: *Book direct, pay less* · *Message the owner directly* ·
  *Local, Da Nang–based*.
- **`BuildingShowcase`** — feature cards per building (cover, name, location, room-type
  count, "View rooms"). Renders Azure in a **"Details coming soon"** state.
- **`ScooterBand`** — small cross-sell band linking to the motorbike rental site.
- **`Footer`** — **Vĩnh House** + logo left, subtext *"Direct booked boutique apartments
  and hotels in Da Nang. Book direct, pay less, message the owner."*; right side Email ·
  Phone · WhatsApp · Facebook.

Reused existing components where they fit: `Container`, `CTAButton`, `RoomCard`,
`InquiryLinks`, `ImageLightbox`.

## Pages

- **`/` (landing):** Hero → Why book direct → Our buildings → Scooter rental band →
  Closing Book-now band → Footer.
- **`/buildings/[slug]`:** building header (name, location, blurb, gallery) → its room
  types as cards → Book now. "Coming soon" buildings show a placeholder state instead of
  rooms.
- **`/rooms/[...]` (or `/buildings/[slug]/[roomType]`):** photo gallery (`ImageLightbox`),
  price pill, status, blurb, inquiry buttons. Exact route shape is an implementation
  detail.

Slugs derive from folder names (e.g. `Gilda-Hotel` → `gilda-hotel`).

## Out of scope (unchanged from project scope)

Booking, reservations, payments, availability date-math, transactional email,
contact-form processing, and — **for now** — the admin CMS and Supabase runtime
dependency on public routes. Actual translations (only English copy is written now).

## Open items deferred to the client / later

- Real contact values (email / phone / WhatsApp / Facebook) — placeholders until provided.
- Azure Apartments full content (rooms, photos, info).
- Real room prices, blurbs, and availability.
- Translations for VI / KO / ZH / RU.
