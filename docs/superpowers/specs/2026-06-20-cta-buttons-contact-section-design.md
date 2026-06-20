# CTA Buttons + Contact Section — Design

**Date:** 2026-06-20
**Status:** Approved (brainstorm) — pending implementation plan
**Reference:** Button aesthetic from the sibling `tmh-house` project (`src/components/cta/*`, `property/Hero.tsx`, `property/CtaRepeat.tsx`).

## Goal

Restyle the primary CTAs to the polished tmh-house "pill" look (recolored to this site's coastal palette), replace the Book-now dropdown with a **Book now button that scrolls to a new Contact section**, give the Hero a direct **WhatsApp** CTA, and add a global **Contact section** (WhatsApp · Zalo · Call) plus footer contact **icons + a Zalo option**.

## Decisions (from brainstorm)

| Decision | Choice |
| --- | --- |
| Button look | tmh-house **rounded-full pills** — `inline-flex`, icon + uppercase letter-spaced semibold label, `px-6 py-3`, hover-lift |
| Colors | **Site palette + brand icons** (no green/blue brand fills) |
| Restyle scope | **Primary CTAs only** (Book now, Hero WhatsApp, Contact options, Scooter); secondary buttons keep their outline style |
| Hero CTA | Direct **WhatsApp** pill (coral) + "View apartments" outline |
| Book now behavior | Scrolls to `#contact` (no dropdown) |
| Contact section | **Global**, in the locale layout before the footer, on every page |
| Channels | WhatsApp, **Zalo**, Call — **same number** for all three |
| Footer | Add icons to email/phone/WhatsApp/Facebook + a **Zalo** link |

## Button system

`globals.css` gains a `.cta-pill` recipe (the tmh-house base, palette-neutral):
```
inline-flex; align-items/justify center; gap .5rem; border-radius 9999px;
padding .75rem 1.5rem; font-size .875rem; font-weight 600;
text-transform uppercase; letter-spacing .12em; transition transform/colors;
:hover { transform translateY(-2px) }
```
Color comes from Tailwind classes per button. Per-channel assignment (palette colors, brand icons):
- **Primary CTA** (Book now, Hero WhatsApp): **coral** (`bg-cta` / hover `bg-cta-hover`, `text-text-inverse`), with shadow `shadow-md shadow-cta/30`.
- **Contact options:** WhatsApp → **coral**; Zalo → **teal** (`bg-[var(--color-primary)]`, white text, hover `--color-primary-dark`); Call → **sun gold** (`bg-accent-gold`, **charcoal** text for contrast).
- **Scooter** button: coral pill (already coral; switch to `.cta-pill` shape).
- A compact navbar variant (smaller padding, e.g. `px-5 py-2`) for the navbar "Book now".

Secondary buttons unchanged (View apartments / View on Maps / Get directions keep their current outline look).

## Components

### New
- `components/ContactSection.tsx` (server) — `id="contact"`, soft sand/ivory band (`bg-gradient` like the old closing CTA), `Reveal`-wrapped: eyebrow (`contact.eyebrow`) + Fraunces heading (`contact.heading`) + subtitle (`contact.subtitle`) + three `.cta-pill` links:
  - WhatsApp → `whatsappUrl(contacts.whatsapp, inquiryMessage({}))`, `WhatsAppIcon`, label `booking.whatsapp`.
  - Zalo → `zaloUrl(contacts.whatsapp)`, `ZaloIcon`, label `booking.zalo`.
  - Call → `telUrl(contacts.phone)`, lucide `Phone`, label `booking.call`.
- `components/BookNowButton.tsx` (server) — renders `<a href="#contact" class="cta-pill bg-cta …">{t('nav.bookNow')}</a>`; `compact?: boolean` prop for the navbar size.
- `components/icons/ZaloIcon.tsx` and `components/icons/FacebookIcon.tsx` — inline SVGs (no dependency), `currentColor`, `aria-hidden`.

### Changed
- `app/(public)/[locale]/layout.tsx` — render `<ContactSection />` between `<main>` and `<Footer />`.
- `components/Hero.tsx` — replace `BookNowMenu` with a direct WhatsApp `.cta-pill` (coral) + keep the "View apartments" outline link.
- `components/Navbar.tsx` — replace `BookNowMenu` with `<BookNowButton compact />`.
- `app/(public)/[locale]/page.tsx` — remove the closing "Ready to book?" CTA section (the global Contact section replaces it).
- `app/(public)/[locale]/buildings/[buildingSlug]/page.tsx` — both `BookNowMenu` usages (coming-soon + rooms footer) → `<BookNowButton />`.
- `app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx` — `BookNowMenu` → `<BookNowButton />`. (The Location section's contextual "Ask us on WhatsApp" stays unchanged.)
- `components/ScooterBand.tsx` — CTA button → `.cta-pill`.
- `components/Footer.tsx` — add an icon before each contact: **Email** (lucide `Mail`), **Phone** (lucide `Phone`), **WhatsApp** (`WhatsAppIcon`), **Facebook** (new inline `FacebookIcon` — brand glyph as inline SVG, consistent with the WhatsApp/Zalo icons rather than relying on lucide's brand set), and a new **Zalo** link (`ZaloIcon` → `zaloUrl`). Email/phone keep showing their value; channels show their name.
- `lib/contacts.ts` — add `zaloUrl(number)`.

### Deleted
- `components/BookNowMenu.tsx` (dropdown no longer used). `lib/content/inquiry.ts` stays (used by Hero, ContactSection, and the room Location section).

## `zaloUrl` helper

`lib/contacts.ts`:
```ts
/** Builds a zalo.me link from a phone number (digits only, leading + stripped). */
export function zaloUrl(number: string | null | undefined): string | null {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, '');
  return digits ? `https://zalo.me/${digits}` : null;
}
```
Pure → unit-tested alongside the existing `whatsappUrl`/`telUrl`/`mailtoUrl` tests.

## i18n

New message keys (all 5 locales):
- `contact.eyebrow` (e.g. "Get in touch"), `contact.heading` ("Ready to book your stay in Da Nang?"), `contact.subtitle` ("Message or call us directly — we reply fast.").
- `booking.zalo` ("Zalo"), `booking.call` ("Call").

`booking.whatsapp/phone/facebook/email` already exist. The `i18n-integrity` key-tree test keeps the catalogs in sync.

## Accessibility / verification

- All channel icons `aria-hidden`; pills have a visible text label. External links `target="_blank" rel="noopener noreferrer"`; `tel:` is same-tab.
- "Book now" is a real `<a href="#contact">`; smooth scroll via existing `scroll-behavior: smooth`. The Contact section has `scroll-mt` so the sticky navbar doesn't overlap the heading on scroll.
- Pills wrap on mobile (`flex-wrap`); tap targets comfortable (`py-3`). Works across all 5 locales.

## Acceptance criteria

- Primary CTAs render as coastal-palette pills (rounded-full, uppercase, icon, hover-lift); secondary buttons unchanged.
- Hero shows a coral WhatsApp pill (direct `wa.me`) + View apartments; no Book-now dropdown anywhere.
- "Book now" (navbar + building/room pages) scrolls smoothly to the Contact section.
- Contact section appears before the footer on every public page with WhatsApp / Zalo / Call pills, all using the same number, each with its icon.
- Footer shows icons for Email / Phone / WhatsApp / Facebook and a Zalo link.
- `npm test` (incl. `zaloUrl`), `tsc`, `lint` green; build succeeds with no Supabase env; localized in all 5 locales.

## Flagged for client verification

- The real contact number (still the `+84 92 442 22 99` placeholder) and that a **Zalo account exists** for it.
- New non-English copy (machine-translated, pending native review).
- Per-channel pill color assignment (WhatsApp coral / Zalo teal / Call gold) — easy to retune.

## Out of scope

- No change to the per-room contextual "Ask us on WhatsApp" in the Location section.
- No analytics/event tracking (tmh-house has it; not adopted here).
