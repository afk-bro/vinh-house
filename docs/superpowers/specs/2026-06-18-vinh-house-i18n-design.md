# Vĩnh House — Internationalization (i18n) Design

**Date:** 2026-06-18
**Status:** Approved (brainstorm, with reviewer edits) — pending implementation plan
**Builds on:** the merged public website + coastal redesign.

## Goal

Make the public Vĩnh House site fully multilingual in **English, Vietnamese, Korean,
Simplified Chinese, and Russian**, with path-based locale URLs, translated UI **and**
content, and a working language switcher. The admin section stays English-only and
un-prefixed. The public site must continue to build and run **without Supabase env vars**.

## Locales & routing

- **Library:** `next-intl` (Next 16 App Router path-based i18n).
- **Locales (internal ids):** `en` (default), `vi`, `ko`, `zh-Hans`, `ru`.
  - `zh-Hans` is used internally for precision (Simplified Chinese), but the **public URL
    prefix is `/zh`** via next-intl's `localePrefix.prefixes`. `<html lang>` uses the
    precise tag (`zh-Hans`).
- **Prefix mode:** `localePrefix: { mode: 'as-needed', prefixes: { 'zh-Hans': '/zh' } }`.
  English has **no prefix** (stays at `/`), preserving existing URLs; others are
  `/vi`, `/ko`, `/zh`, `/ru`.
- **`localeDetection: false`** — `/` always means English. No Accept-Language or
  cookie-based redirect of unprefixed routes. Users switch language manually; the choice
  is reflected in the URL (and next-intl's locale cookie remembers the last explicit pick
  for the switcher, but never auto-redirects `/`).
- **Pathnames are not localized** (slugs stay the same across locales) — e.g.
  `/buildings/gilda-hotel` ↔ `/vi/buildings/gilda-hotel`. Simple and reliable since slugs
  aren't translated.

Config lives in `i18n/routing.ts`; server message loading in `i18n/request.ts`;
locale-aware navigation helpers (`Link`, `redirect`, `usePathname`, `useRouter`) in
`i18n/navigation.ts` via `createNavigation(routing)`.

## Routing infrastructure: `proxy.ts` (not `middleware.ts`)

Next 16 renamed the `middleware` file convention to **`proxy.ts`** (next-intl's proxy was
formerly `middleware.ts`). We rename `middleware.ts` → `proxy.ts` and **compose** locale
routing with Supabase session refresh by path:

```ts
// proxy.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import type { NextRequest } from 'next/server';

const intlProxy = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    // Lazy import so the Supabase module is never loaded for public requests.
    const { updateSession } = await import('@/lib/supabase/middleware');
    return updateSession(req);
  }
  return intlProxy(req);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

Net effects:
- Public routes go through next-intl only — **no Supabase at runtime** for the public site.
- Supabase session refresh is scoped to `/admin`, `/auth`, `/api`.
- The Supabase middleware is **lazy-imported** so its env-var check can't trip a public
  request. (Belt-and-suspenders: `lib/supabase/middleware.ts` already validates env at call
  time, not import time — keep it that way.)

## Layout restructure (route groups, two root layouts)

Remove the top-level `app/layout.tsx`. Use route groups so public and admin each have their
own root layout defining `<html>`/`<body>` (no nested html):

```
app/
  (public)/
    [locale]/
      layout.tsx          # <html lang>, NextIntlClientProvider, Navbar, Footer, fonts, globals.css
      page.tsx            # landing
      buildings/
        [buildingSlug]/
          page.tsx
          [roomTypeSlug]/
            page.tsx
  (admin)/
    layout.tsx            # <html lang="en">, globals.css  (root for admin/auth)
    admin/                # existing admin pages (client AdminLayout nested inside)
    auth/                 # auth/callback
  sitemap.ts
  robots.ts
  api/...                 # admin upload route
proxy.ts
i18n/{routing,request,navigation}.ts
messages/{en,vi,ko,zh-Hans,ru}.json
```

- `app/(public)/[locale]/layout.tsx` owns the public shell:
  `<html lang={locale}><body><NextIntlClientProvider>… <Navbar/> {children} <Footer/> …</NextIntlClientProvider></body></html>`,
  and loads fonts (below). It calls `setRequestLocale(locale)` for static rendering and
  validates the incoming locale (`notFound()` on unknown).
- `app/(admin)/layout.tsx` owns the admin/auth root: `<html lang="en"><body>…`. The
  existing client `AdminLayout` (AdminNav shell) nests inside its `admin/` subtree.
- `globals.css` is imported by **both** root layouts.
- Bonus cleanup: the public Navbar/Footer no longer wrap admin pages (a current oddity).

## Messages (JSON) & component refactor

- UI copy moves from `lib/content/strings.ts` (the `t` object) into **JSON** message files
  `messages/en.json … messages/zh-Hans.json` (JSON chosen for easy hand-off to a native
  reviewer). The English file is the canonical key tree.
- Components switch from `t.nav.bookNow` (module constant) to next-intl access:
  - **Client components** (`Navbar`, `BookNowMenu`, `LanguageMenu`, `BuildingsMenu`): `useTranslations()`.
  - **Server components/pages** (`Hero`, `ValueProps`, `ScooterBand`, `BuildingShowcase`,
    `Footer`, building/room pages): `getTranslations()`.
- `lib/content/strings.ts` is removed after migration.

### Localized via messages (UI + templated content)
- All current `t.*` UI copy (nav, booking labels, hero, value props, scooter, buildings,
  building, room status labels, cta).
- **SEO templates:** page title suffix, description templates, generic site description.
- **Inquiry message templates:** the generic / building / room prefilled messages (with
  `{building}`, `{roomType}`, `{url}` placeholders) move into messages so a Vietnamese
  user's WhatsApp message is in Vietnamese. `inquiryMessage()` / `buildInquiryLinks()`
  refactor to take the translated template (pages build the message server-side via
  `getTranslations` and pass it as the existing `message` prop; Navbar builds the generic
  one via `useTranslations`).

## Content localization (`lib/content`)

- `type Locale = 'en' | 'vi' | 'ko' | 'zh-Hans' | 'ru'` (single source in `i18n/routing.ts`).
- `type Localized<T> = { en: T } & Partial<Record<Locale, T>>` — **`en` required**, others
  optional. Resolver `pick(value, locale) => value[locale] ?? value.en`.
- **Localized content fields** (in `site.ts`, resolved per request):
  - building: `blurb`, `alt`
  - room: `name`, `blurb`, `alt`
- **Single-source fields** (never localized): building `name` (brand), `address`,
  `googleMapsUrl`; room `price`, `slug`, `status` enum; all contacts (email/phone/whatsapp/
  facebook), `motorbikeUrl`, image paths, slugs.
- **Status** stays the enum `'available' | 'unavailable'`; only the *displayed label* is
  translated (via messages: Available / Có sẵn / 이용 가능 / 可入住 / Доступно).
- **SEO/OG:** page titles & descriptions are composed from the (single-source) building
  name + localized blurb + localized SEO templates in `getTranslations`. OG image `alt`
  uses the localized building/room `alt`.
- `getBuildings(locale)`, `getBuilding(slug, locale)`, `getRoom(buildingSlug, roomSlug,
  locale)` gain a `locale` param and return plain (already-resolved) strings for that
  locale. `resolveBuilding`/`resolveRoom` apply `pick`.

## Fonts & CJK/Cyrillic coverage

Loaded in the public root layout via `next/font/google`, exposed as CSS variables:
- **Inter** (body) with subsets `latin, latin-ext, cyrillic, vietnamese` — covers en/vi/ru.
- **Fraunces** (headings) subsets `latin, latin-ext` — covers en/vi.
- **Noto Sans KR** (ko) and **Noto Sans SC** (zh-Hans) for both body and headings.

`globals.css` language overrides (the decorative serif does **not** render CJK/Cyrillic
well, so headings fall back per language):
```css
:lang(ko)      { font-family: var(--font-noto-kr), system-ui, sans-serif; }
:lang(zh-Hans) { font-family: var(--font-noto-sc), system-ui, sans-serif; }
:lang(ko) :is(h1,h2,h3,h4,h5,h6),
:lang(zh-Hans) :is(h1,h2,h3,h4,h5,h6) { font-family: inherit; } /* Noto, not Fraunces */
:lang(ru) :is(h1,h2,h3,h4,h5,h6) { font-family: "Noto Serif", Georgia, serif; } /* Fraunces lacks Cyrillic */
```
(en/vi keep Fraunces headings + Inter body.) Exact families are an implementation detail;
the requirement is: **no missing-glyph / weak-fallback rendering in any of the 5 locales.**

## Language switcher

`LanguageMenu` becomes functional: native names, switches to the **same page** in the
chosen locale using next-intl navigation (`usePathname`/`useRouter` from `i18n/navigation`),
preserving the route since slugs aren't localized. Drops the "coming soon" labels.

| id | label | URL |
| --- | --- | --- |
| en | English | `/…` |
| vi | Tiếng Việt | `/vi/…` |
| ko | 한국어 | `/ko/…` |
| zh-Hans | 中文 | `/zh/…` |
| ru | Русский | `/ru/…` |

## Translations

I generate VI / KO / ZH-Hans / RU for all UI messages + localized content fields +
inquiry/SEO templates. The entire non-English set is **flagged for native-speaker review**
before launch (a tracked follow-up; the site ships functional but review-pending).

## Validation

- **`validate-i18n`** (Vitest, runs in `prebuild`):
  - Every locale JSON has the **same key tree** as `en` (deep key-set equality) — build
    **fails** on missing/extra public UI keys.
  - Every `Localized<T>` content object has an `en` value.
  - **Warn** (non-fatal) when a visible (non-en) locale is missing a content value (falls
    back to en) or still contains a placeholder marker, so review gaps are loud but the
    fallback keeps the site working.
- **`validate-content`** updated for the new localized field shapes.
- Sitemap emits all locale variants of each public route.

## Acceptance criteria

- Visiting `/`, `/vi`, `/ko`, `/zh`, `/ru` renders the site fully in that language (UI +
  localized content); status labels, inquiry messages, and SEO metadata are localized.
- `<html lang>` is correct per locale (`zh-Hans` for `/zh`).
- Language switcher navigates to the same page in the chosen locale.
- `/` is always English; no auto-redirect by cookie/Accept-Language.
- Admin stays at `/admin` (English), behind Supabase auth.
- **Public site builds and runs with no Supabase env vars** (proxy lazy-imports Supabase;
  admin pages remain `force-dynamic`).
- No missing-glyph rendering in any locale (CJK/Cyrillic fonts load).
- `validate-i18n` + `validate-content` pass; key trees aligned; all tests + `tsc` + `lint`
  green.

## Out of scope / follow-ups

- Native-speaker review of all generated translations (tracked; pre-launch).
- Localized slugs / pathnames (kept identical for now).
- Translating real room descriptions/prices (currently placeholders) — done when the client
  provides real content.
- Amenity/rule copy localization — only when those sections are added later.
