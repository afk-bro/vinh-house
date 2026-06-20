# Room Info Sections (Amenities · Location · Around · FAQ) — Design

**Date:** 2026-06-20
**Status:** Approved (brainstorm, with reviewer tweaks) — pending implementation plan
**Builds on:** the public site + coastal redesign + 5-language i18n + room content + visual polish.

## Goal

Below the photo gallery on each **room detail page** (`/[locale]/buildings/[buildingSlug]/[roomTypeSlug]`), add four trust-building sections — **Amenities**, **Location** (with an embedded map), **Around the Apartment**, and a **FAQ** accordion — to raise guest confidence right before they inquire. Also add a **WhatsApp icon to every WhatsApp action** across the site. Fully localized in all 5 locales.

## Decisions (from brainstorm + review)

| Decision | Choice |
| --- | --- |
| Translations | Translate all new content to **all 5 locales** (machine, pending native review) |
| Map embed | **Keyless Google Maps iframe** (`?output=embed`), no API key |
| Placement | **Room page only** (under the gallery) |
| Map URLs | Optional explicit overrides per building, **address-derived fallback** |
| FAQ | **Global for v1**, structured (stable ids) so per-building overrides drop in later |
| Room WhatsApp CTA | **Contextual** room inquiry message (room type + building + page URL) |
| Landmark names | **Guest-friendly** full names ("Da Nang International Airport (DAD)") |
| Distances | Rendered with a localized **"Approx."** prefix |

## Content model

### Amenities (global catalog + per-building selection)
`lib/content/amenities.ts`:
```ts
export type Amenity = { id: string; icon: string; label: Localized<string> };
export const AMENITIES: Amenity[]; // the 11 items, each label localized
```
`BuildingMeta` gains `amenityIds?: string[]`. Gilda Hotel lists all 11. The 11 (with the client's emojis):
📶 Free reliable high-speed Wi-Fi · ❄️ Air conditioning · 🛎️ 24-hour front desk · 🚗 Free on-site parking · 🍳 Fully-equipped kitchen with cooking utensils · 🧺 Washing machine · 🌿 Balcony with city view · 🌳 Garden · 🚭 Smoke-free property · 👨‍👩‍👧 Family rooms available · 🛵 Scooter & bicycle rental on request.

### Landmarks ("Around the Apartment") — per building
`BuildingMeta` gains:
```ts
landmarks?: { name: Localized<string>; distance: string }[];
```
`distance` is a single-source value like `"2.4 km"`; the UI prepends a localized "Approx." (see i18n). Gilda Hotel (An Hải, near My Khe Beach) seed — **distances are approximate, flagged for client verification**:
My Khe Beach · Dragon Bridge · Han River Bridge · Da Nang Cathedral · Da Nang Railway Station · Da Nang International Airport (DAD) · Marble Mountains (Ngũ Hành Sơn).

### FAQ — global, override-ready
`lib/content/faq.ts`:
```ts
export type FaqItem = { id: string; q: Localized<string>; a: Localized<string> };
export const FAQ: FaqItem[]; // the 10 questions + drafted answers, all localized
```
The 10 ids: `checkInOut`, `beachDistance`, `scooterRental`, `wifi`, `parking`, `frontDesk`, `foodNearby`, `airportDistance`, `smokeFreeFamily`, `languages`.
Resolver `getFaq(locale, building?)` returns the global list resolved for `locale`; a future `building.faqOverrides?: Record<faqId, Partial<{q,a}>>` merges over the globals (not populated in v1 — structure only).
**Answers are drafted** (grounded in the amenities) and **flagged for verification** — notably check-in/out times and staff languages (placeholder values).

### Map URLs — explicit overrides + fallback
`BuildingMeta` already has `googleMapsUrl?`. Add optional `googleMapsEmbedUrl?` and `directionsUrl?`.
`lib/content/maps.ts` pure helpers build fallbacks from `address`:
- `embedUrl(b)` → `b.googleMapsEmbedUrl ?? https://www.google.com/maps?q=<enc(address)>&output=embed`
- `directionsUrl(b)` → `b.directionsUrl ?? https://www.google.com/maps/dir/?api=1&destination=<enc(address)>`
- `mapsUrl(b)` → `b.googleMapsUrl ?? https://www.google.com/maps?q=<enc(address)>`
Exact links are preferred (VN address search can be imperfect); the client can paste precise Maps URLs per building.

## Components (room page, under the gallery)

New components (server components unless noted), composed in the room page after `RoomGallery`:

1. **`Amenities`** — `components/room/Amenities.tsx`. Heading + responsive grid (2-col mobile, 3-col desktop) of `emoji + label`.
2. **`LocationSection`** — `components/room/LocationSection.tsx`. Two-column (stacks on mobile):
   - **Left:** lazy `<iframe>` (`loading="lazy"`, `title`, rounded, ~16:9) of `embedUrl(building)`.
   - **Right:** address text + three buttons — **Open in Google Maps** (`mapsUrl`), **Get directions** (`directionsUrl`), and **Ask us on WhatsApp** (coral CTA, **with WhatsApp icon**, using the room's **contextual** inquiry message).
3. **`AroundSection`** — `components/room/AroundSection.tsx`. Rows: 📍 pin icon + landmark name (left) · `Approx. {distance}` (right).
4. **`Faq`** — `components/room/Faq.tsx`. `<details>`/`<summary>` accordion (no JS, accessible), styled summary with a chevron that rotates on `open`. Each item: question = summary, answer = body.

The room page resolves these from the building (`getBuilding(slug, locale)` → resolved `amenities`, `landmarks`) and `getFaq(locale)`.

### WhatsApp icon — site-wide
`components/icons/WhatsAppIcon.tsx` — inline SVG (no dependency), brand-green by default, `aria-hidden`. Added to every WhatsApp action:
- `BookNowMenu` WhatsApp item
- `Footer` WhatsApp link
- landing-CTA WhatsApp link (`app/(public)/[locale]/page.tsx`)
- the new "Ask us on WhatsApp" button

## i18n & validation

- **Content** (amenity labels, landmark names, FAQ q/a) = `Localized<string>` resolved via `pick(locale)`; VI/KO/ZH/RU machine-translated, **pending native review**.
- **Section chrome** in message catalogs (`messages/*.json`), new keys (all 5 locales):
  `amenities.heading`, `location.heading`, `location.openInMaps`, `location.directions`, `location.askWhatsApp`, `around.heading`, `around.approx`, `faq.heading`.
- **`i18n-integrity` test** keeps message key-trees in parity (build-gated).
- **`content-integrity` test** extended: every `AMENITIES` label, building `landmarks[].name`, and `FAQ` `q`/`a` must have an `en` value (and warns on missing visible-locale content, like the existing fields).
- **Resolvers** (`getBuilding` amenities/landmarks; `getFaq`) and **map helpers** are pure where possible → **unit-tested** (map URL building, amenity/landmark/faq resolution).

## Guardrails

- Map iframe `loading="lazy"` — no first-paint/Lighthouse hit.
- FAQ works with **no JS** (`<details>`), keyboard-accessible.
- All sections reuse the coastal styling + the `Reveal` scroll-in system; respect `prefers-reduced-motion`.
- Public site stays Supabase-free; no new runtime dependencies (WhatsApp icon is inline SVG).

## Flagged for client verification (drafts)

- **Landmark distances** (approximate estimates).
- **FAQ answers**, especially **check-in/out times** and **staff languages** (placeholders).
- All non-English translations (machine, pending native review).
- Optional: paste **precise Google Maps URLs** per building (overrides the address-derived fallback).

## Acceptance criteria

- Room pages show Amenities, Location (working keyless map + 3 buttons), Around, and a working FAQ accordion — fully localized in all 5 locales.
- "Ask us on WhatsApp" (and all other WhatsApp actions) show the **WhatsApp icon**; the room-page CTA uses the **contextual** message.
- Map "Open in Maps"/"Directions" use explicit URLs when set, else address-derived.
- Distances render with a localized "Approx." prefix; landmark names are guest-friendly.
- `npm test` (incl. new map/resolver/content-integrity/i18n tests), `tsc`, `lint` green; `npm run build` succeeds with no Supabase env vars.

## Out of scope / follow-ups

- Per-building FAQ overrides (structure ready; not populated in v1).
- Real distances / check-in-out times / languages (client to confirm).
- Native-speaker translation review.
- Upgrading the map to the official Embed API (needs an API key).
