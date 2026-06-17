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
| i18n | **Centralized English strings**; flag dropdown shows "Coming soon" for non-EN |
| Room details | Content file with **obvious placeholders** (price, blurb, status) |
| Photos in repo | **Commit optimized** images; raw originals in a gitignored dir |
| Azure Apartments | **"Coming soon"** state (sparse data) |
| Room route | **Nested** `/buildings/[buildingSlug]/[roomTypeSlug]` |

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
   - the **photos** for each (see Photo handling for the filename convention).
   Read at build time via Node `fs`.

2. **`lib/content/site.ts`** — a single hand-maintained file for everything folders
   can't express, seeded with clearly-marked placeholders:
   - **Global contacts:** `email`, `phone`, `whatsapp`, `facebook`, `motorbikeUrl`.
   - **Per-building:** display name, address, `googleMapsUrl`, short blurb, sort order,
     `hidden` flag, `comingSoon` flag, `alt` default.
   - **Per-room:** price (e.g. `"$— / month"` placeholder), short blurb, availability
     status (`available` | `unavailable`), `alt` default.

   Building metadata currently in each `Information.txt` (name, address, phone, contact,
   motorbike link) is **migrated into this file**, so no `.txt` is read at runtime or
   served publicly.

3. **`lib/content/strings.ts`** — all user-facing UI copy in English, centralized so a
   later translation pass is a clean copy. Components import strings from here rather
   than hardcoding text.

### Content validation (required, runs before build)

A `scripts/validate-content.ts` script (wired into `prebuild` / CI) is the single
biggest defense against folder ↔ `site.ts` drift. It **fails the build** on any of:

- A building folder exists with no `site.ts` entry, or vice-versa.
- A room subfolder exists with no room metadata, or vice-versa.
- Two folder names slugify to the **same slug** (slug collision).
- A required image is missing (`cover.jpg` for each building/room — see convention).
- A room belongs to a `comingSoon` building (must not exist — would generate stray pages).
- (Warning, non-fatal) placeholder values (`$—`, "coming soon" blurbs) still present —
  surfaced so the client knows what's unfilled, but does not block the build.

### Photo handling

Filesystem-driven rendering requires images **in the repo**. Two directories:

| Directory | Git | Contents |
| --- | --- | --- |
| `public/Phap_photos_raw/` | **gitignored** | raw originals / phone-camera dumps |
| `public/Phap_photos/` | **committed** | optimized images only, renamed to convention |

**Target sizes (max width), format WebP or optimized JPEG:**
- Hero: 1920px
- Building covers: 1200px
- Room gallery: 1600px
- Thumbnails: optional, later

**Filename convention** (avoids random phone filenames entering the content system):
- `cover.jpg` — required cover for each building folder and each room folder
- `building-01.jpg`, `building-02.jpg` … — additional building images
- `room-01.jpg`, `room-02.jpg` … — room gallery images

Cover is **positional** (`cover.jpg`), not a metadata pointer — this removes the
"coverImage points to a missing file" drift risk. `validate-content` checks every
required `cover.jpg` exists.

### Alt text

No per-image alt text; defaults live in `site.ts` and are reused across a building's /
room's images:
- `building.alt` e.g. *"Exterior and rooms at Gilda Hotel in Da Nang"*
- `room.alt` e.g. *"1-bedroom apartment at Gilda Hotel"*

### `hidden` vs `comingSoon` (strict)

Two distinct per-building flags:

- **`hidden: true`** — building is not rendered anywhere; no card, no building page, no
  room pages generated.
- **`comingSoon: true`** — building card **is** shown (dropdown + showcase) but:
  - room count shows "Details coming soon" (not a number),
  - building page renders a placeholder state,
  - **no room cards render**,
  - **no room detail pages are generated**.

Azure Apartments uses `comingSoon: true` until the client provides content.

## Components

New components (forest-green + gold design system, Cormorant Garamond headings / Inter body):

- **`Navbar`** (sticky) with sub-parts:
  - `Logo` — `logo.png` (small) + **Vĩnh House** title + subtitle
    *"Apartments and Hotel Rentals — Da Nang"*.
  - `BuildingsMenu` — dropdown generated from building folders (excludes `hidden`); each
    item → building page.
  - `ScooterLink` — links out to the motorbike rental URL (new tab).
  - `LanguageMenu` — flag icons for EN / VI / KO / ZH / RU; EN active. Selecting a
    non-EN flag shows a small **"Coming soon"** disabled menu item (not a dead/inert
    click that feels broken).
  - `BookNowMenu` — primary gold CTA opening a dropdown with **Email · Phone · Facebook ·
    WhatsApp**. WhatsApp message is **contextual** (see Inquiry messages).
  - Mobile: hamburger collapse; **Book now** stays visible.
- **`Hero`** — `Phap_photos/hero/cover.jpg` (optimized skyline) full-bleed + dark
  overlay, "Vĩnh House" + tagline, Book now + "Browse our buildings" (scrolls down).
- **`ValueProps`** — three items: *Book direct, pay less* · *Message the owner directly* ·
  *Local, Da Nang–based*.
- **`BuildingShowcase`** — feature cards per building (cover, name, address, room-type
  count, "View rooms"). `comingSoon` buildings render a **"Details coming soon"** state.
- **`ScooterBand`** — small cross-sell band linking to the motorbike rental site.
- **`Footer`** — **Vĩnh House** + logo left, subtext *"Direct booked boutique apartments
  and hotels in Da Nang. Book direct, pay less, message the owner."*; right side Email ·
  Phone · WhatsApp · Facebook.

Reused existing components where they fit: `Container`, `CTAButton`, `RoomCard`,
`InquiryLinks`, `ImageLightbox`. `lib/contacts.ts` is extended so link builders accept a
**message/subject** argument.

## Inquiry messages (contextual)

| Context | WhatsApp / message text |
| --- | --- |
| Global (navbar Book now) | "Hi, I'm interested in renting a room at Vĩnh House." |
| Building page | "Hi, I'm interested in **{Building Name}**. Is a room available?" |
| Room page | "Hi, I'm interested in the **{Room Type}** at **{Building Name}**. Is it available? {page URL}" |

The page URL is known at build time per route and appended to the room-level message so
the owner sees exactly which listing the inquiry is about.

## Pages & routing

- **`/` (landing):** Hero → Why book direct → Our buildings → Scooter rental band →
  Closing Book-now band → Footer.
- **`/buildings/[buildingSlug]`:** building header (name, address, "View on Google Maps"
  button, blurb, gallery) → its room types as cards → Book now. `comingSoon` buildings
  show a placeholder state instead of rooms.
- **`/buildings/[buildingSlug]/[roomTypeSlug]`:** photo gallery (`ImageLightbox`), price
  pill, status, blurb, contextual inquiry buttons.

Example: `/buildings/gilda-hotel/1-bedroom`. Slugs derive from folder names
(`Gilda-Hotel` → `gilda-hotel`); collisions are caught by `validate-content`.

## Maps

Each building carries an `address` and a `googleMapsUrl` in `site.ts`. Building pages
render a lightweight **"View on Google Maps"** button (opens in a new tab) rather than a
heavy embedded map. An embed can be added later only if the client asks.

## SEO / social metadata

- **Page titles:**
  - Home: *Vĩnh House — Apartments and Hotel Rentals in Da Nang*
  - Building: *Gilda Hotel — Vĩnh House Da Nang*
  - Room: *1 Bedroom at Gilda Hotel — Vĩnh House*
- **Meta descriptions** per page (from building/room blurbs).
- **Open Graph image** (per-page where sensible: hero for home, cover for
  building/room) + OG title/description for social sharing.
- **Favicon / logo** from `logo.png`.
- **`sitemap.xml`** generated from the same content source.
- **`robots.txt`** allowing indexing.

## Out of scope (unchanged from project scope)

Booking, reservations, payments, availability date-math, transactional email,
contact-form processing, and — **for now** — the admin CMS and Supabase runtime
dependency on public routes. Actual translations (only English copy is written now).

## Acceptance criteria

- Public pages build **without** Supabase environment variables.
- **No Supabase imports** are used by public routes/components.
- All building folders generate building pages **unless `hidden`**.
- **Coming-soon** buildings do not generate room pages or room cards.
- Every visible room has price/status/blurb (placeholder or real).
- Every inquiry button opens the correct email/phone/Facebook/WhatsApp action, with the
  **contextual** message on building and room pages.
- Mobile navbar keeps **Book now** visible.
- Images are optimized; **no raw originals** are committed (only `Phap_photos/`).
- No `Information.txt` files are publicly linked or read at runtime.
- `validate-content` passes (no drift, no slug collisions, all `cover.jpg` present).
- **Lighthouse mobile performance target: 85+** (target, depends on final image weight).

## Open items deferred to the client / later

- Real contact values (email / phone / WhatsApp / Facebook) — placeholders until provided.
- Azure Apartments full content (rooms, photos, info).
- Real room prices, blurbs, and availability.
- Translations for VI / KO / ZH / RU.
- **Client sign-off on "Book direct, pay less"** marketing copy (implies OTAs cost more).
- Google Maps URLs per building.
