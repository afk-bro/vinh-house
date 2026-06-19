# Vĩnh House Internationalization (i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public site fully multilingual (en/vi/ko/zh-Hans/ru) with path-based locale URLs, translated UI + content, a working language switcher, and no Supabase dependency on public routes.

**Architecture:** `next-intl` v4 with a `[locale]` segment under a `(public)` route group; admin moves to a separate `(admin)` route group (its own root layout); `proxy.ts` (Next 16's renamed middleware) composes locale routing for public paths with Supabase session refresh for `/admin|/auth|/api` (lazy-imported). UI copy lives in `messages/*.json`; localized content lives in `lib/content/site.ts` resolved per-locale.

**Tech Stack:** Next.js 16, next-intl 4.13, React 19, TypeScript, Tailwind v4, Vitest, next/font (Inter, Fraunces, Noto Sans KR, Noto Sans SC).

**Spec:** `docs/superpowers/specs/2026-06-18-vinh-house-i18n-design.md`

**Path alias:** `@/*` → repo root (no `src/`). Files live at repo root: `i18n/`, `proxy.ts`, `messages/`.

**Testing approach:** Pure logic (`pick` resolver, validate-i18n, validate-content updates) is TDD with Vitest. Structural changes (routing, layouts, fonts, component message swaps) are verified with `npx tsc --noEmit`, `npm run lint`, `npm run build` (no Supabase env), and browser render — matching the repo's established pattern.

---

## Phase A — next-intl scaffolding & messages

### Task A1: Install next-intl and wire the Next plugin

**Files:**
- Modify: `package.json` (dependency), `next.config.ts`

- [ ] **Step 1: Install**

```bash
npm install next-intl@^4.13.0
```

- [ ] **Step 2: Wrap `next.config.ts` with the plugin**

Replace `next.config.ts` with:

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : '';

const nextConfig: NextConfig = {
  images: { remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [] },
};

const withNextIntl = createNextIntlPlugin(); // defaults to ./i18n/request.ts
export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Verify install**

Run: `node -e "require('next-intl'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "build: add next-intl and wire the Next plugin"
```

---

### Task A2: Routing, navigation, and request config

**Files:**
- Create: `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`

- [ ] **Step 1: `i18n/routing.ts`**

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'vi', 'ko', 'zh-Hans', 'ru'],
  defaultLocale: 'en',
  // English unprefixed (stays at /); zh-Hans shown publicly as /zh.
  localePrefix: { mode: 'as-needed', prefixes: { 'zh-Hans': '/zh' } },
  // / always means English — no cookie/Accept-Language redirect of unprefixed routes.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 2: `i18n/navigation.ts`**

```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 3: `i18n/request.ts`**

```ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: (await import(`../messages/${locale}.json`)).default };
});
```

- [ ] **Step 4: Verify compile** (will fail to resolve `../messages/*` until A3 — that's fine; just check syntax)

Run: `npx tsc --noEmit 2>&1 | grep -i "i18n/" || echo "no i18n type errors"`
Expected: no syntax errors referencing these files (missing message JSON is resolved in A3).

- [ ] **Step 5: Commit**

```bash
git add i18n/routing.ts i18n/navigation.ts i18n/request.ts
git commit -m "feat: next-intl routing, navigation, and request config (5 locales)"
```

---

### Task A3: English messages (migrate from strings.ts) + restructure valueProps

**Files:**
- Create: `messages/en.json`

The canonical key tree. Note `valueProps` becomes a keyed object (next-intl messages don't iterate arrays cleanly), and new namespaces `inquiry` and `seo` are added.

- [ ] **Step 1: Create `messages/en.json`**

```json
{
  "brand": {
    "name": "Vĩnh House",
    "subtitle": "Apartments and Hotel Rentals — Da Nang",
    "footerTagline": "Direct booked boutique apartments and hotels in Da Nang. Book direct, pay less, message the owner."
  },
  "nav": {
    "buildings": "Buildings",
    "scooterRental": "Scooter Rental",
    "bookNow": "Book now",
    "selectLanguage": "Select language",
    "comingSoon": "Coming soon"
  },
  "booking": { "whatsapp": "WhatsApp", "phone": "Phone", "facebook": "Facebook", "email": "Email" },
  "hero": {
    "headline": "Comfortable apartments and hotel rentals in Da Nang",
    "tagline": "Book direct, message the owner, and find your stay with less hassle.",
    "viewApartments": "View apartments"
  },
  "valueProps": {
    "bookDirect": { "title": "Book direct, pay less", "body": "No platform fees or middlemen — message us directly." },
    "message": { "title": "Message the owner", "body": "Ask about rooms, prices, and availability before you arrive." },
    "local": { "title": "Local in Da Nang", "body": "On the ground and ready to help you settle in." }
  },
  "scooter": {
    "title": "Getting around Da Nang",
    "body": "Rent a scooter and explore the beach, cafés, and city at your own pace.",
    "cta": "Scooter rentals"
  },
  "buildings": {
    "heading": "Our buildings",
    "comingSoonShort": "Details coming soon",
    "roomType": "room type",
    "roomTypes": "room types",
    "viewRooms": "View rooms →"
  },
  "building": {
    "viewOnMaps": "View on Google Maps →",
    "comingSoonTitle": "Details coming soon",
    "comingSoonBody": "We're preparing the listings for this building."
  },
  "room": { "available": "Available", "notAvailable": "Not available" },
  "cta": {
    "readyToBook": "Ready to find your room in Da Nang?",
    "readyToBookBody": "Message us directly and we'll help you choose the best option."
  },
  "inquiry": {
    "generic": "Hi, I'm interested in renting a room at Vĩnh House.",
    "building": "Hi, I'm interested in {building}. Is a room available?",
    "room": "Hi, I'm interested in the {roomType} at {building}. Is it available? {url}"
  },
  "seo": {
    "homeTitle": "Vĩnh House — Apartments and Hotel Rentals in Da Nang",
    "homeDescription": "Direct booked boutique apartments and hotels in Da Nang. Book direct, pay less, message the owner.",
    "titleSuffix": "Vĩnh House Da Nang"
  }
}
```

- [ ] **Step 2: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add messages/en.json
git commit -m "feat: English message catalog (migrated from strings.ts)"
```

---

## Phase B — Route restructure (route groups, [locale])

> Structural. Verify each task with `npx tsc --noEmit`, `npm run lint`, and (at the end) `npm run build`. No unit tests for moves.

### Task B1: Create `proxy.ts`, delete `middleware.ts`

**Files:**
- Create: `proxy.ts`
- Delete: `middleware.ts`

- [ ] **Step 1: Create `proxy.ts`**

```ts
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const handleI18n = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    // Lazy import so the Supabase module never loads for public requests.
    const { updateSession } = await import('@/lib/supabase/middleware');
    return updateSession(request);
  }
  return handleI18n(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
```

- [ ] **Step 2: Delete the old middleware**

```bash
git rm middleware.ts
```

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat: proxy.ts composing locale routing + scoped Supabase session refresh"
```

---

### Task B2: Public route group with `[locale]` + locale layout

**Files:**
- Create: `app/(public)/[locale]/layout.tsx`
- Move: `app/page.tsx` → `app/(public)/[locale]/page.tsx`
- Move: `app/buildings/[buildingSlug]/page.tsx` → `app/(public)/[locale]/buildings/[buildingSlug]/page.tsx`
- Move: `app/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx` → `app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx`
- Delete (after move): empty `app/buildings/`

> The page **contents** are refactored for messages/locale in Phase C/D. This task only moves files and adds the locale layout. Pages will still import the old `@/lib/content/strings` and `getBuildings()` for now — that's fine; they keep compiling until Phase C/D swaps them.

- [ ] **Step 1: Move the public pages**

```bash
mkdir -p "app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]"
git mv app/page.tsx "app/(public)/[locale]/page.tsx"
git mv "app/buildings/[buildingSlug]/page.tsx" "app/(public)/[locale]/buildings/[buildingSlug]/page.tsx"
git mv "app/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx" "app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx"
rmdir "app/buildings/[buildingSlug]" "app/buildings" 2>/dev/null || true
```

- [ ] **Step 2: Create `app/(public)/[locale]/layout.tsx`** (fonts + provider + shell; metadata moves here, localized)

```tsx
import type { Metadata } from 'next';
import { Fraunces, Inter, Noto_Sans_KR, Noto_Sans_SC } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../../globals.css';

const heading = Fraunces({
  subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'],
  variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'], variable: '--font-body-loaded' });
const notoKR = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-noto-kr' });
const notoSC = Noto_Sans_SC({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-noto-sc' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vinh-house.example'),
    title: { default: t('homeTitle'), template: `%s — ${t('titleSuffix')}` },
    description: t('homeDescription'),
    icons: { icon: '/logo.png' },
    openGraph: { title: t('homeTitle'), description: t('homeDescription'), images: ['/hero.jpg'], type: 'website' },
  };
}

export default async function LocaleLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const fontVars = `${heading.variable} ${body.variable} ${notoKR.variable} ${notoSC.variable}`;
  return (
    <html lang={locale} className={fontVars}>
      <body className="bg-brand-forest text-text-primary">
        <NextIntlClientProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Typecheck (expect unrelated errors until Phase C/D; just confirm the layout itself compiles)**

Run: `npx tsc --noEmit 2>&1 | grep "(public)/\[locale\]/layout" || echo "layout ok"`
Expected: `layout ok`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: public [locale] route group with locale layout (fonts, provider, shell)"
```

---

### Task B3: Admin route group with its own root layout

**Files:**
- Create: `app/(admin)/layout.tsx`
- Move: `app/admin/` → `app/(admin)/admin/`
- Move: `app/auth/` → `app/(admin)/auth/`
- Delete: `app/layout.tsx` (top-level root layout removed; route groups own their roots)

- [ ] **Step 1: Move admin + auth under the group and add a root layout**

```bash
mkdir -p "app/(admin)"
git mv app/admin "app/(admin)/admin"
git mv app/auth "app/(admin)/auth"
git rm app/layout.tsx
```

- [ ] **Step 2: Create `app/(admin)/layout.tsx`** (its own html/body, English)

```tsx
import { Cormorant_Garamond, Inter } from 'next/font/google';
import '../globals.css';

const heading = Cormorant_Garamond({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body-loaded' });

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="bg-brand-forest text-text-primary">{children}</body>
    </html>
  );
}
```

> Note: the existing client `app/(admin)/admin/layout.tsx` (AdminNav shell) stays and nests inside this root layout. The `force-dynamic` exports on admin pages are preserved by the move.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "(admin)" || echo "admin layouts ok"`
Expected: `admin layouts ok`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: admin route group with its own root layout; remove top-level layout"
```

---

## Phase C — Component message refactor (next-intl)

> Each component swaps `import { t } from '@/lib/content/strings'` + `t.x.y` for next-intl access. Client components use `useTranslations`; server use `getTranslations`. After each task: `npx tsc --noEmit` + `npm run lint`.
>
> **Ordering (important):** Tasks **C1–C6 are independent** and run first — each fully typechecks after Phase B (they don't call the content API). **Task C7 (BuildingShowcase) and Task C8 (landing page) call `getBuildings(locale)` / render content, which only gains its `locale` param in Task D4 — so run C7 and C8 AFTER D4** (they are listed here for cohesion but belong to the atomic D4→D5 block). `lib/content/strings.ts` is **not** deleted until every consumer (incl. the building/room pages in D5) is refactored — see Task D5 Step 4.

### Task C1: `BookNowMenu` (client)

**Files:** Modify `components/BookNowMenu.tsx`

- [ ] **Step 1: Refactor**

Replace the import + label default + item labels:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Contacts } from '@/lib/content/types';
import { buildInquiryLinks } from '@/lib/content/inquiry';

type Props = { contacts: Contacts; message: string; label?: string };

export default function BookNowMenu({ contacts, message, label }: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const links = buildInquiryLinks(contacts, message);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const item = 'block px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-lg bg-cta px-5 py-2.5 font-medium text-text-inverse shadow-md shadow-cta/30 transition hover:bg-cta-hover"
      >
        {label ?? t('nav.bookNow')}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {links.whatsapp && <a role="menuitem" className={item} href={links.whatsapp} target="_blank" rel="noopener noreferrer">{t('booking.whatsapp')}</a>}
          {links.phone && <a role="menuitem" className={item} href={links.phone}>{t('booking.phone')}</a>}
          {links.facebook && <a role="menuitem" className={item} href={links.facebook} target="_blank" rel="noopener noreferrer">{t('booking.facebook')}</a>}
          {links.email && <a role="menuitem" className={item} href={links.email}>{t('booking.email')}</a>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit 2>&1 | grep BookNowMenu || true
npm run lint
git add components/BookNowMenu.tsx
git commit -m "refactor: BookNowMenu uses next-intl translations"
```

---

### Task C2: `LanguageMenu` (client, now functional)

**Files:** Modify `components/LanguageMenu.tsx`

- [ ] **Step 1: Replace with a functional locale switcher**

```tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const NAMES: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  ko: '한국어',
  'zh-Hans': '中文',
  ru: 'Русский',
};

export default function LanguageMenu() {
  const t = useTranslations();
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function switchTo(locale: Locale) {
    setOpen(false);
    startTransition(() => router.replace(pathname, { locale }));
  }

  const shortLabel: Record<Locale, string> = { en: 'EN', vi: 'VI', ko: 'KO', 'zh-Hans': '中', ru: 'RU' };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.selectLanguage')}
        disabled={isPending}
        className="rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated"
      >
        {shortLabel[active]} ▾
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              role="menuitem"
              onClick={() => switchTo(loc)}
              className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-surface-elevated ${
                loc === active ? 'font-semibold text-text-accent' : 'text-text-primary'
              }`}
            >
              {NAMES[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit 2>&1 | grep LanguageMenu || true
npm run lint
git add components/LanguageMenu.tsx
git commit -m "feat: functional LanguageMenu (locale switch preserving page)"
```

---

### Task C3: `BuildingsMenu` (client)

**Files:** Modify `components/BuildingsMenu.tsx`

- [ ] **Step 1: Use next-intl `Link` + translations**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type Item = { slug: string; name: string; comingSoon: boolean };

export default function BuildingsMenu({ items }: { items: Item[] }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated"
      >
        {t('nav.buildings')} ▾
      </button>
      {open && (
        <div role="menu" className="absolute left-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {items.map((b) => (
            <Link key={b.slug} role="menuitem" href={`/buildings/${b.slug}`}
              className="flex items-center justify-between px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated"
              onClick={() => setOpen(false)}>
              {b.name}
              {b.comingSoon && <span className="text-xs italic text-text-muted">{t('nav.comingSoon')}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit 2>&1 | grep BuildingsMenu || true
npm run lint
git add components/BuildingsMenu.tsx
git commit -m "refactor: BuildingsMenu uses next-intl Link + translations"
```

---

### Task C4: `Navbar` (server)

**Files:** Modify `components/Navbar.tsx`

- [ ] **Step 1: Use `getTranslations`, next-intl `Link`, pass locale to building nav**

```tsx
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import BuildingsMenu from './BuildingsMenu';
import LanguageMenu from './LanguageMenu';
import BookNowMenu from './BookNowMenu';
import { contacts, buildingNav } from '@/lib/content/site';

export default async function Navbar() {
  const t = await getTranslations();
  const generic = t('inquiry.generic');
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-default)] bg-navbar-forest/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Vĩnh House logo" width={40} height={40} className="rounded" />
          <span className="leading-tight">
            <span className="block font-heading text-xl text-text-accent">{t('brand.name')}</span>
            <span className="block text-[11px] text-text-muted">{t('brand.subtitle')}</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <BuildingsMenu items={buildingNav()} />
          <a href={contacts.motorbikeUrl} target="_blank" rel="noopener noreferrer"
            className="hidden rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated sm:block">
            {t('nav.scooterRental')}
          </a>
          <LanguageMenu />
          <BookNowMenu contacts={contacts} message={generic} />
        </div>
      </nav>
    </header>
  );
}
```

> `buildingNav()` (no locale arg) returns building slug/name/comingSoon. Building names are single-source proper nouns, so no locale is needed here. Its signature is finalized in Task D3.

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit 2>&1 | grep "Navbar" || true
npm run lint
git add components/Navbar.tsx
git commit -m "refactor: Navbar uses next-intl translations + locale-aware Link"
```

---

### Task C5: `Footer` (server)

**Files:** Modify `components/Footer.tsx`

- [ ] **Step 1: Replace `t.*` with `getTranslations`**

```tsx
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { contacts } from '@/lib/content/site';
import { whatsappUrl, telUrl, mailtoUrl } from '@/lib/contacts';

export default async function Footer() {
  const t = await getTranslations();
  const wa = whatsappUrl(contacts.whatsapp);
  const tel = telUrl(contacts.phone);
  const mail = mailtoUrl(contacts.email);
  const link = 'text-sm text-[#FFF8ED]/80 transition hover:text-[var(--color-accent-gold)]';
  return (
    <footer className="mt-20 bg-[var(--color-primary-dark)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="Vĩnh House logo" width={44} height={44} className="rounded" />
          <div>
            <p className="font-heading text-2xl text-[var(--color-accent-gold)]">{t('brand.name')}</p>
            <p className="mt-1 max-w-md text-sm text-[#FFF8ED]/70">{t('brand.footerTagline')}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {mail && <a className={link} href={mail}>{contacts.email}</a>}
          {tel && <a className={link} href={tel}>{contacts.phone}</a>}
          {wa && <a className={link} href={wa} target="_blank" rel="noopener noreferrer">{t('booking.whatsapp')}</a>}
          {contacts.facebook && <a className={link} href={contacts.facebook} target="_blank" rel="noopener noreferrer">{t('booking.facebook')}</a>}
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit 2>&1 | grep "Footer" || true
npm run lint
git add components/Footer.tsx
git commit -m "refactor: Footer uses next-intl translations"
```

---

### Task C6: `Hero`, `ValueProps`, `ScooterBand` (server)

**Files:** Modify `components/Hero.tsx`, `components/ValueProps.tsx`, `components/ScooterBand.tsx`

- [ ] **Step 1: `Hero.tsx`**

```tsx
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import BookNowMenu from './BookNowMenu';
import { contacts } from '@/lib/content/site';

export default async function Hero() {
  const t = await getTranslations();
  return (
    <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden sm:min-h-[70vh]">
      <Image src="/hero.jpg" alt="Da Nang skyline" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,118,110,0.55)] via-[rgba(15,118,110,0.30)] to-[rgba(255,248,237,0.25)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h1 className="font-heading text-5xl font-semibold text-white drop-shadow-sm sm:text-7xl">{t('brand.name')}</h1>
        <p className="mt-4 text-xl text-white/95 sm:text-2xl">{t('hero.headline')}</p>
        <p className="mt-3 text-base text-white/85">{t('hero.tagline')}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <BookNowMenu contacts={contacts} message={t('inquiry.generic')} />
          <a href="#buildings" className="rounded-lg border border-white/80 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15">
            {t('hero.viewApartments')}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `ValueProps.tsx`** (keyed entries from messages)

```tsx
import Container from './Container';
import { Wallet, MessageCircle, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const ENTRIES = [
  { key: 'bookDirect', Icon: Wallet },
  { key: 'message', Icon: MessageCircle },
  { key: 'local', Icon: MapPin },
] as const;

export default async function ValueProps() {
  const t = await getTranslations('valueProps');
  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-3">
          {ENTRIES.map(({ key, Icon }) => (
            <div key={key}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-primary)]">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-2xl text-text-accent">{t(`${key}.title`)}</h3>
              <p className="mt-2 text-text-secondary">{t(`${key}.body`)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: `ScooterBand.tsx`**

```tsx
import Container from './Container';
import { getTranslations } from 'next-intl/server';
import { contacts } from '@/lib/content/site';

export default async function ScooterBand() {
  const t = await getTranslations('scooter');
  return (
    <section className="bg-[#E0F7F4] py-14">
      <Container>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-3xl text-[var(--color-primary-dark)]">{t('title')}</h3>
            <p className="mt-1 text-text-secondary">{t('body')}</p>
          </div>
          <a href={contacts.motorbikeUrl} target="_blank" rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-cta px-5 py-2.5 font-medium text-text-inverse shadow-md shadow-cta/30 transition hover:bg-cta-hover">
            {t('cta')}
          </a>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Typecheck + lint + commit**

```bash
npx tsc --noEmit 2>&1 | grep -E "Hero|ValueProps|ScooterBand" || true
npm run lint
git add components/Hero.tsx components/ValueProps.tsx components/ScooterBand.tsx
git commit -m "refactor: Hero/ValueProps/ScooterBand use next-intl translations"
```

---

### Task C7: `BuildingShowcase` (server, locale-aware) — RUN AFTER Task D4

**Files:** Modify `components/BuildingShowcase.tsx`

> Depends on `getBuildings(locale)` (Task D4). Run this after D4; the per-task `tsc` grep below will only be clean once D4 is in place.

- [ ] **Step 1: Use locale + translations + next-intl Link**

```tsx
import Image from 'next/image';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Container from './Container';
import { getBuildings } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export default async function BuildingShowcase() {
  const t = await getTranslations('buildings');
  const locale = (await getLocale()) as Locale;
  const buildings = getBuildings(locale);
  return (
    <section id="buildings" className="py-16">
      <Container>
        <h2 className="font-heading text-4xl text-text-accent">{t('heading')}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <Link key={b.slug} href={`/buildings/${b.slug}`}
              className="group block overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-surface-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              {b.cover && (
                <Image src={b.cover.src} alt={b.cover.alt} width={480} height={300}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-48 w-full object-cover" />
              )}
              <div className="p-5">
                <h3 className="font-heading text-2xl text-text-accent">{b.name}</h3>
                <p className="mt-1 text-sm text-text-muted">{b.address}</p>
                {b.comingSoon ? (
                  <span className="mt-3 inline-block rounded-full bg-[var(--color-surface-secondary)] px-3 py-1 text-xs font-medium text-text-secondary">
                    {t('comingSoonShort')}
                  </span>
                ) : (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-text-muted">
                      {`${b.resolvedRooms.length} ${b.resolvedRooms.length === 1 ? t('roomType') : t('roomTypes')}`}
                    </span>
                    <span className="text-sm font-medium text-[var(--color-primary)] transition group-hover:translate-x-0.5">
                      {t('viewRooms')}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

> `getBuildings(locale)` gains its locale param in Phase D. Building names/blurbs become localized there.

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit 2>&1 | grep "BuildingShowcase" || true
npm run lint
git add components/BuildingShowcase.tsx
git commit -m "refactor: BuildingShowcase locale-aware (translations, Link, getBuildings(locale))"
```

---

### Task C8: Refactor landing page — RUN AFTER Task D4

**Files:**
- Modify: `app/(public)/[locale]/page.tsx`

> Run after D4 (it renders `BuildingShowcase`, which needs `getBuildings(locale)`). `strings.ts` is deleted later, in Task D5 Step 4.

- [ ] **Step 1: Refactor the landing page**

```tsx
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server';
import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import BuildingShowcase from '@/components/BuildingShowcase';
import ScooterBand from '@/components/ScooterBand';
import Container from '@/components/Container';
import BookNowMenu from '@/components/BookNowMenu';
import { contacts } from '@/lib/content/site';
import { whatsappUrl } from '@/lib/contacts';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const generic = t('inquiry.generic');
  const wa = whatsappUrl(contacts.whatsapp, generic);
  return (
    <>
      <Hero />
      <ValueProps />
      <BuildingShowcase />
      <ScooterBand />
      <section className="py-16">
        <Container>
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-[var(--color-surface-secondary)] px-6 py-14 text-center">
            <h2 className="max-w-2xl font-heading text-4xl text-[var(--color-primary-dark)]">{t('cta.readyToBook')}</h2>
            <p className="max-w-xl text-text-secondary">{t('cta.readyToBookBody')}</p>
            <div className="flex items-center gap-4">
              <BookNowMenu contacts={contacts} message={generic} />
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--color-primary)] hover:underline">{t('booking.whatsapp')}</a>}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Lint + commit** (full `tsc` is run after D5, once strings.ts is removed)

```bash
npm run lint
git add app/\(public\)/\[locale\]/page.tsx
git commit -m "refactor: landing page on next-intl"
```

---

## Phase D — Content localization

> **Atomic block:** Task D4 changes the signatures of `getBuildings/getBuilding/getRoom` to take a `locale`. Their callers — **C7 (BuildingShowcase), C8 (landing), and D5 (building/room pages)** — break until refactored. The build is expected to be red from D4 until the end of D5. Run the full `tsc --noEmit && npm run lint && npm run build` **at the end of Task D5** (and again in Phase F), not per-task, for this block. Recommended execution order: D1 → D2 → D3 → D4 → C7 → C8 → D5 → D6.

### Task D1: `Localized<T>` type + `pick` resolver (TDD)

**Files:**
- Create: `lib/content/localize.ts`, `lib/content/localize.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/localize.test.ts
import { describe, it, expect } from 'vitest';
import { pick, type Localized } from './localize';

describe('pick', () => {
  const v: Localized<string> = { en: 'Hello', vi: 'Xin chào' };
  it('returns the requested locale when present', () => {
    expect(pick(v, 'vi')).toBe('Xin chào');
  });
  it('falls back to en when the locale is missing', () => {
    expect(pick(v, 'ko')).toBe('Hello');
    expect(pick(v, 'zh-Hans')).toBe('Hello');
  });
  it('returns en for en', () => {
    expect(pick(v, 'en')).toBe('Hello');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/localize.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// lib/content/localize.ts
import type { Locale } from '@/i18n/routing';

/** A value with a required English source and optional per-locale overrides. */
export type Localized<T> = { en: T } & Partial<Record<Locale, T>>;

/** Resolve a localized value for a locale, falling back to English. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.en;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/localize.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/localize.ts lib/content/localize.test.ts
git commit -m "feat: Localized<T> type and pick resolver"
```

---

### Task D2: Localize content types

**Files:** Modify `lib/content/types.ts`

- [ ] **Step 1: Make blurb/alt and room name localized**

```ts
// lib/content/types.ts
import type { Localized } from './localize';

export type Contacts = {
  email: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  motorbikeUrl: string;
};

export type RoomMeta = {
  slug: string;
  name: Localized<string>;   // e.g. "1 Bedroom" / "1 Phòng ngủ"
  price: string;             // single-source (format/placeholder)
  blurb: Localized<string>;
  status: 'available' | 'unavailable';
  alt: Localized<string>;
};

export type BuildingMeta = {
  slug: string;
  folder: string;
  name: string;              // brand proper noun — single-source
  address: string;           // single-source
  googleMapsUrl: string;
  blurb: Localized<string>;
  alt: Localized<string>;
  sortOrder: number;
  hidden?: boolean;
  comingSoon?: boolean;
  rooms: RoomMeta[];
};
```

- [ ] **Step 2: Verify compile (expect errors in site.ts/index.ts until D3/D4 — confirm types.ts itself is fine)**

Run: `npx tsc --noEmit 2>&1 | grep "content/types.ts" || echo "types ok"`
Expected: `types ok`

- [ ] **Step 3: Commit**

```bash
git add lib/content/types.ts
git commit -m "feat: localized content types (blurb/alt/room name)"
```

---

### Task D3: Localize `site.ts` data + `buildingNav(locale)`

**Files:** Modify `lib/content/site.ts`

> English values come from the current site.ts. Non-English values are added in Phase E (Task E1); for now seed every localized field with just `{ en: ... }` so the structure compiles and falls back to English. Room names get localized now (small, known set).

- [ ] **Step 1: Rewrite `lib/content/site.ts`**

```ts
import type { BuildingMeta, Contacts } from './types';

// ⚠️ PLACEHOLDERS — replace with real values when the client provides them.
export const contacts: Contacts = {
  email: 'CHANGEME@example.com',
  phone: '+84 92 442 22 99',
  whatsapp: '+84 92 442 22 99',
  facebook: 'https://facebook.com/CHANGEME',
  motorbikeUrl: 'https://vinhphatmotorbikes.com',
};

export const buildings: BuildingMeta[] = [
  {
    slug: 'gilda-hotel',
    folder: 'Gilda-Hotel',
    name: 'Gilda Hotel',
    address: '89 Cao Bá Quát, An Hải, Đà Nẵng 550000, Vietnam',
    googleMapsUrl: 'https://maps.google.com/?q=89+Cao+Ba+Quat+Da+Nang',
    blurb: { en: 'Boutique rooms in An Hải, steps from the beach.' },
    alt: { en: 'Exterior and rooms at Gilda Hotel in Da Nang' },
    sortOrder: 1,
    rooms: [
      { slug: '1-bedroom', name: { en: '1 Bedroom' }, price: '$— / month', blurb: { en: 'Description coming soon.' }, status: 'available', alt: { en: '1-bedroom apartment at Gilda Hotel' } },
      { slug: '2-bedroom', name: { en: '2 Bedroom' }, price: '$— / month', blurb: { en: 'Description coming soon.' }, status: 'available', alt: { en: '2-bedroom apartment at Gilda Hotel' } },
    ],
  },
  {
    slug: 'azure-apartments',
    folder: 'Azure-Apartments',
    name: 'Azure Apartments',
    address: 'Da Nang, Vietnam',
    googleMapsUrl: 'https://maps.google.com/?q=Da+Nang',
    blurb: { en: 'Details coming soon.' },
    alt: { en: 'Azure Apartments in Da Nang' },
    sortOrder: 2,
    comingSoon: true,
    rooms: [],
  },
];

/** Nav-safe building list (excludes hidden), sorted. Building names are single-source. */
export function buildingNav(): { slug: string; name: string; comingSoon: boolean }[] {
  return buildings
    .filter((b) => !b.hidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => ({ slug: b.slug, name: b.name, comingSoon: !!b.comingSoon }));
}
```

> Building names are single-source proper nouns, so `buildingNav()` takes no locale. `site.ts` holds only data + `buildingNav` (no `pick`/`Locale` import); the `pick` resolver lives in `index.ts` (Task D4).

- [ ] **Step 2: Typecheck (index.ts will still error until D4)**

Run: `npx tsc --noEmit 2>&1 | grep "content/site.ts" || echo "site ok"`
Expected: `site ok`

- [ ] **Step 3: Commit**

```bash
git add lib/content/site.ts
git commit -m "feat: localized site.ts data shape + buildingNav(locale)"
```

---

### Task D4: Locale-aware resolver (`index.ts`) + tests

**Files:** Modify `lib/content/index.ts`, `lib/content/index.test.ts`

- [ ] **Step 1: Update the test**

```ts
// lib/content/index.test.ts
import { describe, it, expect } from 'vitest';
import { resolveBuilding } from './index';
import type { BuildingMeta } from './types';

const meta: BuildingMeta = {
  slug: 'gilda-hotel', folder: 'Gilda-Hotel', name: 'Gilda Hotel', address: 'x',
  googleMapsUrl: 'https://m', blurb: { en: 'B', vi: 'B-vi' }, alt: { en: 'A building' }, sortOrder: 1,
  rooms: [{ slug: '1-bedroom', name: { en: '1 Bedroom', vi: '1 Phòng ngủ' }, price: '$1', blurb: { en: 'b' }, status: 'available', alt: { en: 'A room' } }],
};

describe('resolveBuilding', () => {
  it('resolves localized fields for the locale (with en fallback) and maps images', () => {
    const r = resolveBuilding(meta, 'vi', {
      'Gilda-Hotel': ['cover.jpg', 'building-01.jpg'],
      'Gilda-Hotel/1-bedroom': ['cover.jpg', 'room-01.jpg'],
    });
    expect(r.blurb).toBe('B-vi');                 // vi present
    expect(r.alt).toBe('A building');             // vi missing -> en
    expect(r.cover).toEqual({ src: '/Phap_photos/Gilda-Hotel/cover.jpg', alt: 'A building' });
    expect(r.resolvedRooms[0].name).toBe('1 Phòng ngủ');
    expect(r.resolvedRooms[0].images[1].alt).toBe('A room');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/index.test.ts`
Expected: FAIL (signature mismatch / localized fields).

- [ ] **Step 3: Rewrite `lib/content/index.ts`**

```ts
// lib/content/index.ts
import type { BuildingMeta } from './types';
import { listImages, imageUrl, PHOTOS_BASE, scanDisk } from './loader';
import { pick } from './localize';
import { buildings } from './site';
import type { Locale } from '@/i18n/routing';
import path from 'node:path';

export type Img = { src: string; alt: string };
export type ResolvedRoom = {
  slug: string; name: string; price: string; status: 'available' | 'unavailable';
  buildingSlug: string; buildingName: string; blurb: string; alt: string; cover: Img; images: Img[];
};
export type ResolvedBuilding = {
  slug: string; folder: string; name: string; address: string; googleMapsUrl: string;
  blurb: string; alt: string; sortOrder: number; hidden?: boolean; comingSoon?: boolean;
  cover: Img | null; images: Img[]; resolvedRooms: ResolvedRoom[];
};

/** Pure resolver: metadata + locale + folderPath->filenames map -> resolved building. */
export function resolveBuilding(
  meta: BuildingMeta,
  locale: Locale,
  imagesByPath: Record<string, string[]>,
): ResolvedBuilding {
  const bAlt = pick(meta.alt, locale);
  const bFiles = imagesByPath[meta.folder] ?? [];
  const images = bFiles.map((f) => ({ src: imageUrl(meta.folder, f), alt: bAlt }));
  const resolvedRooms: ResolvedRoom[] = meta.rooms.map((r) => {
    const rAlt = pick(r.alt, locale);
    const rFiles = imagesByPath[`${meta.folder}/${r.slug}`] ?? [];
    const rImages = rFiles.map((f) => ({ src: imageUrl(meta.folder, f, r.slug), alt: rAlt }));
    return {
      slug: r.slug, name: pick(r.name, locale), price: r.price, status: r.status,
      buildingSlug: meta.slug, buildingName: meta.name, blurb: pick(r.blurb, locale), alt: rAlt,
      cover: rImages[0] ?? { src: '', alt: rAlt }, images: rImages,
    };
  });
  return {
    slug: meta.slug, folder: meta.folder, name: meta.name, address: meta.address,
    googleMapsUrl: meta.googleMapsUrl, blurb: pick(meta.blurb, locale), alt: bAlt,
    sortOrder: meta.sortOrder, hidden: meta.hidden, comingSoon: meta.comingSoon,
    cover: images[0] ?? null, images, resolvedRooms,
  };
}

function imagesMapFor(meta: BuildingMeta): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  map[meta.folder] = listImages(path.join(PHOTOS_BASE, meta.folder));
  for (const r of meta.rooms) {
    map[`${meta.folder}/${r.slug}`] = listImages(path.join(PHOTOS_BASE, meta.folder, r.slug));
  }
  return map;
}

export function getBuildings(locale: Locale): ResolvedBuilding[] {
  return buildings
    .filter((b) => !b.hidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => resolveBuilding(b, locale, imagesMapFor(b)));
}

export function getBuilding(slug: string, locale: Locale): ResolvedBuilding | undefined {
  return getBuildings(locale).find((b) => b.slug === slug);
}

export function getRoom(buildingSlug: string, roomSlug: string, locale: Locale): ResolvedRoom | undefined {
  return getBuilding(buildingSlug, locale)?.resolvedRooms.find((r) => r.slug === roomSlug);
}

export { scanDisk, PHOTOS_BASE };
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/index.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add lib/content/index.ts lib/content/index.test.ts
git commit -m "feat: locale-aware content resolver (pick + images)"
```

---

### Task D5: Update building & room pages (locale + translations)

**Files:**
- Modify: `app/(public)/[locale]/buildings/[buildingSlug]/page.tsx`
- Modify: `app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx`

- [ ] **Step 1: Building page**

```tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Container from '@/components/Container';
import BookNowMenu from '@/components/BookNowMenu';
import { getBuildings, getBuilding } from '@/lib/content';
import { contacts } from '@/lib/content/site';
import type { Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return getBuildings('en').map((b) => ({ buildingSlug: b.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; buildingSlug: string }> },
): Promise<Metadata> {
  const { locale, buildingSlug } = await params;
  const b = getBuilding(buildingSlug, locale as Locale);
  if (!b) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: b.name,
    description: b.blurb,
    openGraph: { title: `${b.name} — ${t('titleSuffix')}`, description: b.blurb, images: b.cover ? [b.cover.src] : [] },
  };
}

export default async function BuildingPage(
  { params }: { params: Promise<{ locale: string; buildingSlug: string }> },
) {
  const { locale, buildingSlug } = await params;
  setRequestLocale(locale);
  const b = getBuilding(buildingSlug, locale as Locale);
  if (!b) notFound();
  const t = await getTranslations();

  return (
    <Container>
      <div className="mt-10">
        <h1 className="font-heading text-4xl text-text-accent">{b.name}</h1>
        <p className="text-text-muted">{b.address}</p>
        {b.googleMapsUrl && (
          <a href={b.googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-text-accent hover:underline">
            {t('building.viewOnMaps')}
          </a>
        )}
        <p className="mt-4 max-w-2xl text-text-secondary">{b.blurb}</p>
      </div>

      {b.comingSoon ? (
        <div className="my-12 rounded-lg border border-[var(--color-border-default)] bg-surface-card p-8 text-center">
          <p className="font-heading text-2xl text-text-accent">{t('building.comingSoonTitle')}</p>
          <p className="mt-2 text-text-secondary">{t('building.comingSoonBody')}</p>
          <div className="mt-6 flex justify-center">
            <BookNowMenu contacts={contacts} message={t('inquiry.building', { building: b.name })} />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {b.resolvedRooms.map((r) => (
              <Link key={r.slug} href={`/buildings/${b.slug}/${r.slug}`}
                className="relative block overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-surface-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                {r.cover.src && <Image src={r.cover.src} alt={r.cover.alt} width={480} height={320}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-52 w-full object-cover" />}
                <span className="absolute left-3 top-3 rounded-full bg-accent-gold px-3 py-1 text-sm font-semibold text-[var(--color-text-primary)] shadow-sm">{r.price}</span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm"
                  style={{ color: r.status === 'available' ? 'var(--color-status-confirmed)' : 'var(--color-status-cancelled)' }}>
                  {r.status === 'available' ? t('room.available') : t('room.notAvailable')}
                </span>
                <div className="p-5"><h3 className="font-heading text-xl text-text-accent">{r.name}</h3></div>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <BookNowMenu contacts={contacts} message={t('inquiry.building', { building: b.name })} />
          </div>
        </>
      )}
    </Container>
  );
}
```

- [ ] **Step 2: Room page**

```tsx
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Container from '@/components/Container';
import RoomGallery from '@/components/RoomGallery';
import BookNowMenu from '@/components/BookNowMenu';
import { getBuildings, getBuilding, getRoom } from '@/lib/content';
import { contacts } from '@/lib/content/site';
import type { Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return getBuildings('en')
    .filter((b) => !b.comingSoon)
    .flatMap((b) => b.resolvedRooms.map((r) => ({ buildingSlug: b.slug, roomTypeSlug: r.slug })));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; buildingSlug: string; roomTypeSlug: string }> },
): Promise<Metadata> {
  const { locale, buildingSlug, roomTypeSlug } = await params;
  const room = getRoom(buildingSlug, roomTypeSlug, locale as Locale);
  if (!room) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: `${room.name} · ${room.buildingName}`,
    description: room.blurb,
    openGraph: { title: `${room.name} · ${room.buildingName} — ${t('titleSuffix')}`, description: room.blurb, images: room.cover.src ? [room.cover.src] : [] },
  };
}

export default async function RoomPage(
  { params }: { params: Promise<{ locale: string; buildingSlug: string; roomTypeSlug: string }> },
) {
  const { locale, buildingSlug, roomTypeSlug } = await params;
  setRequestLocale(locale);
  const building = getBuilding(buildingSlug, locale as Locale);
  const room = getRoom(buildingSlug, roomTypeSlug, locale as Locale);
  if (!building || building.comingSoon || !room) notFound();
  const t = await getTranslations();

  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const localePrefix = locale === 'en' ? '' : locale === 'zh-Hans' ? '/zh' : `/${locale}`;
  const url = host ? `${proto}://${host}${localePrefix}/buildings/${buildingSlug}/${roomTypeSlug}` : '';
  const message = t('inquiry.room', { roomType: room.name, building: building.name, url });

  const available = room.status === 'available';
  return (
    <Container>
      <Link href={`/buildings/${building.slug}`} className="mt-8 inline-block text-sm text-text-muted hover:text-text-accent">
        ← {building.name}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <h1 className="font-heading text-4xl text-text-accent">{room.name}</h1>
        <span className="rounded-full bg-accent-gold px-3 py-1 text-sm font-semibold text-[var(--color-text-primary)]">{room.price}</span>
        <span className={`text-sm font-medium ${available ? 'text-status-confirmed' : 'text-status-cancelled'}`}>
          {available ? t('room.available') : t('room.notAvailable')}
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-text-secondary">{room.blurb}</p>
      <div className="mt-6"><RoomGallery images={room.images} /></div>
      <div className="mt-8"><BookNowMenu contacts={contacts} message={message} /></div>
    </Container>
  );
}
```

- [ ] **Step 3: Commit the pages**

```bash
git add "app/(public)/[locale]/buildings"
git commit -m "feat: building/room pages locale-aware with localized content + metadata"
```

- [ ] **Step 4: Delete `strings.ts` (now unreferenced) and run the FULL block verification**

By now every consumer (C1–C8, building/room pages) is off `strings.ts`. Delete it and verify the whole atomic block compiles:

```bash
git rm lib/content/strings.ts
grep -rn "content/strings" app components lib && echo "STILL REFERENCED — fix before continuing" || echo "no references ✓"
npx tsc --noEmit && npm run lint
git add -A
git commit -m "refactor: remove strings.ts (fully migrated to next-intl messages)"
```
Expected: `no references ✓`; `tsc` clean; lint clean.

---

### Task D6: Update `validate-content` + sitemap for locales

**Files:**
- Modify: `lib/content/validate.ts`, `lib/content/validate.test.ts`, `lib/content/content-integrity.test.ts`
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Update `validate.ts` to read localized fields via `.en`**

In `validate.ts`, the placeholder-price check is unchanged (price is single-source). Change the room-name/blurb references if any used them. The current `validateContent` only reads `b.rooms[].price` and slugs/folders — **no localized fields are read**, so `validate.ts` needs **no change**. Confirm by reading it; if it references `r.name`/`b.blurb` as strings, update to `.en`. (As written in the repo it does not.)

Run: `grep -nE "\.name|\.blurb|\.alt" lib/content/validate.ts || echo "no localized field reads — validate.ts unchanged"`
Expected: `no localized field reads — validate.ts unchanged`

- [ ] **Step 2: Update `content-integrity.test.ts`** (it calls `validateContent(buildings, ...)` — unchanged signature; just confirm it still compiles against the new `buildings` shape)

The integrity test imports `buildings` and `validateContent`. Since `validateContent` reads only `price`/slug/folder, it still works. No change needed unless it references localized fields. Confirm:

Run: `npx vitest run lib/content/content-integrity.test.ts`
Expected: PASS (placeholder-price warning still emitted).

- [ ] **Step 3: Rewrite `app/sitemap.ts` to emit all locales**

```ts
import type { MetadataRoute } from 'next';
import { getBuildings } from '@/lib/content';
import { routing } from '@/i18n/routing';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vinh-house.example';

function prefix(locale: string): string {
  if (locale === routing.defaultLocale) return '';
  if (locale === 'zh-Hans') return '/zh';
  return `/${locale}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const p = prefix(locale);
    urls.push({ url: `${BASE}${p}`, priority: 1 });
    for (const b of getBuildings(locale)) {
      urls.push({ url: `${BASE}${p}/buildings/${b.slug}` });
      if (!b.comingSoon) {
        for (const r of b.resolvedRooms) urls.push({ url: `${BASE}${p}/buildings/${b.slug}/${r.slug}` });
      }
    }
  }
  return urls;
}
```

- [ ] **Step 4: Typecheck + tests + commit**

```bash
npx tsc --noEmit && npx vitest run lib/content/ 2>&1 | grep -E "Test Files|Tests "
git add -A
git commit -m "feat: locale-aware sitemap; confirm validate-content unaffected"
```

---

## Phase E — Translations, validation, fonts

### Task E1: Generate VI/KO/ZH-Hans/RU message catalogs

> **EXECUTION NOTE (resequenced):** This task is pulled **forward into Phase B**. Because the locale layout's `generateStaticParams` (B2) prerenders all 5 locales and `i18n/request.ts` imports `messages/${locale}.json`, all four non-English catalogs must exist for the Phase B build to succeed. Do E1 immediately after B3.

**Files:** Create `messages/vi.json`, `messages/ko.json`, `messages/zh-Hans.json`, `messages/ru.json`

> Same key tree as `en.json`. Brand/proper nouns (`Vĩnh House`, `WhatsApp`, `Facebook`) kept as-is. Da Nang localized in prose (Đà Nẵng / 다낭 / 岘港 / Дананг). **Flagged for native-speaker review.**

- [ ] **Step 1: `messages/vi.json`**

```json
{
  "brand": {
    "name": "Vĩnh House",
    "subtitle": "Cho thuê căn hộ và khách sạn — Đà Nẵng",
    "footerTagline": "Căn hộ và khách sạn boutique đặt trực tiếp tại Đà Nẵng. Đặt trực tiếp, tiết kiệm hơn, nhắn tin cho chủ nhà."
  },
  "nav": {
    "buildings": "Tòa nhà",
    "scooterRental": "Thuê xe máy",
    "bookNow": "Đặt ngay",
    "selectLanguage": "Chọn ngôn ngữ",
    "comingSoon": "Sắp ra mắt"
  },
  "booking": { "whatsapp": "WhatsApp", "phone": "Điện thoại", "facebook": "Facebook", "email": "Email" },
  "hero": {
    "headline": "Căn hộ và khách sạn thoải mái cho thuê tại Đà Nẵng",
    "tagline": "Đặt trực tiếp, nhắn tin cho chủ nhà và tìm chỗ ở dễ dàng hơn.",
    "viewApartments": "Xem căn hộ"
  },
  "valueProps": {
    "bookDirect": { "title": "Đặt trực tiếp, tiết kiệm hơn", "body": "Không phí nền tảng hay trung gian — nhắn tin trực tiếp cho chúng tôi." },
    "message": { "title": "Nhắn tin cho chủ nhà", "body": "Hỏi về phòng, giá và tình trạng trước khi bạn đến." },
    "local": { "title": "Người địa phương tại Đà Nẵng", "body": "Luôn có mặt và sẵn sàng giúp bạn ổn định chỗ ở." }
  },
  "scooter": {
    "title": "Đi lại quanh Đà Nẵng",
    "body": "Thuê xe máy và khám phá bãi biển, quán cà phê và thành phố theo nhịp của bạn.",
    "cta": "Thuê xe máy"
  },
  "buildings": {
    "heading": "Các tòa nhà của chúng tôi",
    "comingSoonShort": "Thông tin sắp có",
    "roomType": "loại phòng",
    "roomTypes": "loại phòng",
    "viewRooms": "Xem phòng →"
  },
  "building": {
    "viewOnMaps": "Xem trên Google Maps →",
    "comingSoonTitle": "Thông tin sắp có",
    "comingSoonBody": "Chúng tôi đang chuẩn bị danh sách cho tòa nhà này."
  },
  "room": { "available": "Còn trống", "notAvailable": "Hết phòng" },
  "cta": {
    "readyToBook": "Sẵn sàng tìm phòng tại Đà Nẵng?",
    "readyToBookBody": "Nhắn tin trực tiếp cho chúng tôi và chúng tôi sẽ giúp bạn chọn lựa chọn tốt nhất."
  },
  "inquiry": {
    "generic": "Xin chào, tôi muốn thuê phòng tại Vĩnh House.",
    "building": "Xin chào, tôi quan tâm đến {building}. Còn phòng trống không?",
    "room": "Xin chào, tôi quan tâm đến {roomType} tại {building}. Phòng còn trống không? {url}"
  },
  "seo": {
    "homeTitle": "Vĩnh House — Cho thuê căn hộ và khách sạn tại Đà Nẵng",
    "homeDescription": "Căn hộ và khách sạn boutique đặt trực tiếp tại Đà Nẵng. Đặt trực tiếp, tiết kiệm hơn, nhắn tin cho chủ nhà.",
    "titleSuffix": "Vĩnh House Đà Nẵng"
  }
}
```

- [ ] **Step 2: `messages/ko.json`**

```json
{
  "brand": {
    "name": "Vĩnh House",
    "subtitle": "아파트 및 호텔 렌탈 — 다낭",
    "footerTagline": "다낭의 직접 예약 부티크 아파트 및 호텔. 직접 예약하고, 더 저렴하게, 주인에게 직접 문의하세요."
  },
  "nav": {
    "buildings": "건물",
    "scooterRental": "스쿠터 대여",
    "bookNow": "지금 예약",
    "selectLanguage": "언어 선택",
    "comingSoon": "준비 중"
  },
  "booking": { "whatsapp": "WhatsApp", "phone": "전화", "facebook": "Facebook", "email": "이메일" },
  "hero": {
    "headline": "다낭의 편안한 아파트 및 호텔 렌탈",
    "tagline": "직접 예약하고, 주인에게 문의하고, 번거로움 없이 숙소를 찾으세요.",
    "viewApartments": "아파트 보기"
  },
  "valueProps": {
    "bookDirect": { "title": "직접 예약하고 더 저렴하게", "body": "플랫폼 수수료나 중개인 없이 — 저희에게 직접 문의하세요." },
    "message": { "title": "주인에게 직접 문의", "body": "도착 전에 객실, 가격, 이용 가능 여부를 문의하세요." },
    "local": { "title": "다낭 현지", "body": "현지에서 정착을 도와드릴 준비가 되어 있습니다." }
  },
  "scooter": {
    "title": "다낭 둘러보기",
    "body": "스쿠터를 빌려 해변, 카페, 도시를 자유롭게 둘러보세요.",
    "cta": "스쿠터 대여"
  },
  "buildings": {
    "heading": "건물 안내",
    "comingSoonShort": "세부 정보 준비 중",
    "roomType": "객실 유형",
    "roomTypes": "객실 유형",
    "viewRooms": "객실 보기 →"
  },
  "building": {
    "viewOnMaps": "Google 지도에서 보기 →",
    "comingSoonTitle": "세부 정보 준비 중",
    "comingSoonBody": "이 건물의 목록을 준비하고 있습니다."
  },
  "room": { "available": "이용 가능", "notAvailable": "이용 불가" },
  "cta": {
    "readyToBook": "다낭에서 객실을 찾을 준비가 되셨나요?",
    "readyToBookBody": "저희에게 직접 문의하시면 가장 좋은 옵션을 선택하도록 도와드리겠습니다."
  },
  "inquiry": {
    "generic": "안녕하세요, Vĩnh House에서 객실을 임대하고 싶습니다.",
    "building": "안녕하세요, {building}에 관심이 있습니다. 이용 가능한 객실이 있나요?",
    "room": "안녕하세요, {building}의 {roomType}에 관심이 있습니다. 이용 가능한가요? {url}"
  },
  "seo": {
    "homeTitle": "Vĩnh House — 다낭 아파트 및 호텔 렌탈",
    "homeDescription": "다낭의 직접 예약 부티크 아파트 및 호텔. 직접 예약하고, 더 저렴하게, 주인에게 직접 문의하세요.",
    "titleSuffix": "Vĩnh House 다낭"
  }
}
```

- [ ] **Step 3: `messages/zh-Hans.json`**

```json
{
  "brand": {
    "name": "Vĩnh House",
    "subtitle": "公寓与酒店租赁 — 岘港",
    "footerTagline": "岘港直订精品公寓与酒店。直接预订，更省钱，直接联系房东。"
  },
  "nav": {
    "buildings": "楼宇",
    "scooterRental": "租摩托车",
    "bookNow": "立即预订",
    "selectLanguage": "选择语言",
    "comingSoon": "即将推出"
  },
  "booking": { "whatsapp": "WhatsApp", "phone": "电话", "facebook": "Facebook", "email": "电子邮件" },
  "hero": {
    "headline": "岘港舒适的公寓与酒店租赁",
    "tagline": "直接预订，联系房东，轻松找到您的住处。",
    "viewApartments": "查看公寓"
  },
  "valueProps": {
    "bookDirect": { "title": "直接预订，更省钱", "body": "没有平台费用或中介——直接联系我们。" },
    "message": { "title": "直接联系房东", "body": "在抵达前咨询房间、价格和空房情况。" },
    "local": { "title": "扎根岘港", "body": "我们就在当地，随时帮助您安顿下来。" }
  },
  "scooter": {
    "title": "畅游岘港",
    "body": "租一辆摩托车，按自己的节奏探索海滩、咖啡馆和城市。",
    "cta": "租摩托车"
  },
  "buildings": {
    "heading": "我们的楼宇",
    "comingSoonShort": "详情即将公布",
    "roomType": "房型",
    "roomTypes": "房型",
    "viewRooms": "查看房间 →"
  },
  "building": {
    "viewOnMaps": "在 Google 地图上查看 →",
    "comingSoonTitle": "详情即将公布",
    "comingSoonBody": "我们正在准备该楼宇的房源信息。"
  },
  "room": { "available": "可入住", "notAvailable": "暂无空房" },
  "cta": {
    "readyToBook": "准备好在岘港找房间了吗？",
    "readyToBookBody": "直接联系我们，我们将帮您选择最合适的方案。"
  },
  "inquiry": {
    "generic": "您好，我想在 Vĩnh House 租一个房间。",
    "building": "您好，我对 {building} 感兴趣。还有空房吗？",
    "room": "您好，我对 {building} 的 {roomType} 感兴趣。还可以入住吗？{url}"
  },
  "seo": {
    "homeTitle": "Vĩnh House — 岘港公寓与酒店租赁",
    "homeDescription": "岘港直订精品公寓与酒店。直接预订，更省钱，直接联系房东。",
    "titleSuffix": "Vĩnh House 岘港"
  }
}
```

- [ ] **Step 4: `messages/ru.json`**

```json
{
  "brand": {
    "name": "Vĩnh House",
    "subtitle": "Аренда апартаментов и отелей — Дананг",
    "footerTagline": "Бутик-апартаменты и отели в Дананге с прямым бронированием. Бронируйте напрямую, платите меньше, пишите владельцу."
  },
  "nav": {
    "buildings": "Здания",
    "scooterRental": "Аренда скутера",
    "bookNow": "Забронировать",
    "selectLanguage": "Выбрать язык",
    "comingSoon": "Скоро"
  },
  "booking": { "whatsapp": "WhatsApp", "phone": "Телефон", "facebook": "Facebook", "email": "Эл. почта" },
  "hero": {
    "headline": "Комфортная аренда апартаментов и отелей в Дананге",
    "tagline": "Бронируйте напрямую, пишите владельцу и находите жильё без лишних хлопот.",
    "viewApartments": "Смотреть апартаменты"
  },
  "valueProps": {
    "bookDirect": { "title": "Бронируйте напрямую, платите меньше", "body": "Без комиссий платформ и посредников — пишите нам напрямую." },
    "message": { "title": "Пишите владельцу", "body": "Узнайте о комнатах, ценах и наличии до приезда." },
    "local": { "title": "Местные в Дананге", "body": "Мы на месте и готовы помочь вам устроиться." }
  },
  "scooter": {
    "title": "Передвижение по Данангу",
    "body": "Арендуйте скутер и исследуйте пляж, кафе и город в своём темпе.",
    "cta": "Аренда скутеров"
  },
  "buildings": {
    "heading": "Наши здания",
    "comingSoonShort": "Подробности скоро",
    "roomType": "тип номера",
    "roomTypes": "типов номеров",
    "viewRooms": "Смотреть номера →"
  },
  "building": {
    "viewOnMaps": "Открыть в Google Картах →",
    "comingSoonTitle": "Подробности скоро",
    "comingSoonBody": "Мы готовим объявления для этого здания."
  },
  "room": { "available": "Свободно", "notAvailable": "Нет мест" },
  "cta": {
    "readyToBook": "Готовы найти номер в Дананге?",
    "readyToBookBody": "Напишите нам напрямую, и мы поможем выбрать лучший вариант."
  },
  "inquiry": {
    "generic": "Здравствуйте, я хочу арендовать номер в Vĩnh House.",
    "building": "Здравствуйте, меня интересует {building}. Есть свободный номер?",
    "room": "Здравствуйте, меня интересует {roomType} в {building}. Он свободен? {url}"
  },
  "seo": {
    "homeTitle": "Vĩnh House — аренда апартаментов и отелей в Дананге",
    "homeDescription": "Бутик-апартаменты и отели в Дананге с прямым бронированием. Бронируйте напрямую, платите меньше, пишите владельцу.",
    "titleSuffix": "Vĩnh House Дананг"
  }
}
```

- [ ] **Step 5: Validate all JSON parses**

```bash
for f in vi ko zh-Hans ru; do node -e "JSON.parse(require('fs').readFileSync('messages/$f.json','utf8')); console.log('$f valid')"; done
```
Expected: `vi valid` / `ko valid` / `zh-Hans valid` / `ru valid`

- [ ] **Step 6: Commit**

```bash
git add messages/vi.json messages/ko.json messages/zh-Hans.json messages/ru.json
git commit -m "feat: VI/KO/ZH-Hans/RU message catalogs (pending native review)"
```

---

### Task E2: Localized content values in `site.ts`

**Files:** Modify `lib/content/site.ts`

- [ ] **Step 1: Add translations to localized content fields**

Update the two buildings' `blurb`/`alt` and room `name`/`blurb`/`alt`. (Room `blurb` stays placeholder text translated; real descriptions later.)

Gilda Hotel:
```ts
blurb: {
  en: 'Boutique rooms in An Hải, steps from the beach.',
  vi: 'Phòng boutique tại An Hải, cách bãi biển vài bước chân.',
  ko: '해변에서 몇 걸음 거리, 안하이의 부티크 객실.',
  'zh-Hans': '安海区精品客房，离海滩仅几步之遥。',
  ru: 'Бутик-номера в Анхай, в нескольких шагах от пляжа.',
},
alt: {
  en: 'Exterior and rooms at Gilda Hotel in Da Nang',
  vi: 'Bên ngoài và các phòng tại Gilda Hotel ở Đà Nẵng',
  ko: '다낭 Gilda Hotel의 외관과 객실',
  'zh-Hans': '岘港 Gilda Hotel 的外观和客房',
  ru: 'Фасад и номера Gilda Hotel в Дананге',
},
```
Gilda rooms:
```ts
// 1-bedroom
name: { en: '1 Bedroom', vi: '1 Phòng ngủ', ko: '원룸', 'zh-Hans': '一居室', ru: '1 спальня' },
blurb: { en: 'Description coming soon.', vi: 'Mô tả sắp có.', ko: '설명 준비 중입니다.', 'zh-Hans': '描述即将公布。', ru: 'Описание скоро появится.' },
alt: { en: '1-bedroom apartment at Gilda Hotel', vi: 'Căn hộ 1 phòng ngủ tại Gilda Hotel', ko: 'Gilda Hotel의 원룸 아파트', 'zh-Hans': 'Gilda Hotel 的一居室公寓', ru: 'Апартаменты с 1 спальней в Gilda Hotel' },
// 2-bedroom
name: { en: '2 Bedroom', vi: '2 Phòng ngủ', ko: '투룸', 'zh-Hans': '两居室', ru: '2 спальни' },
blurb: { en: 'Description coming soon.', vi: 'Mô tả sắp có.', ko: '설명 준비 중입니다.', 'zh-Hans': '描述即将公布。', ru: 'Описание скоро появится.' },
alt: { en: '2-bedroom apartment at Gilda Hotel', vi: 'Căn hộ 2 phòng ngủ tại Gilda Hotel', ko: 'Gilda Hotel의 투룸 아파트', 'zh-Hans': 'Gilda Hotel 的两居室公寓', ru: 'Апартаменты с 2 спальнями в Gilda Hotel' },
```
Azure Apartments:
```ts
blurb: { en: 'Details coming soon.', vi: 'Thông tin sắp có.', ko: '세부 정보 준비 중입니다.', 'zh-Hans': '详情即将公布。', ru: 'Подробности скоро.' },
alt: { en: 'Azure Apartments in Da Nang', vi: 'Azure Apartments ở Đà Nẵng', ko: '다낭의 Azure Apartments', 'zh-Hans': '岘港的 Azure Apartments', ru: 'Azure Apartments в Дананге' },
```

- [ ] **Step 2: Typecheck + content tests + commit**

```bash
npx tsc --noEmit && npx vitest run lib/content/ 2>&1 | grep -E "Test Files|Tests "
git add lib/content/site.ts
git commit -m "feat: localized building/room content values (pending native review)"
```

---

### Task E3: `validate-i18n` (TDD) + prebuild wiring

**Files:**
- Create: `lib/content/i18n-validate.ts`, `lib/content/i18n-validate.test.ts`
- Create: `lib/content/i18n-integrity.test.ts`

- [ ] **Step 1: Write the failing test for the pure key-tree checker**

```ts
// lib/content/i18n-validate.test.ts
import { describe, it, expect } from 'vitest';
import { diffKeyTrees, flattenKeys } from './i18n-validate';

describe('flattenKeys', () => {
  it('flattens nested object keys with dot paths', () => {
    expect(flattenKeys({ a: { b: 1, c: 2 }, d: 3 }).sort()).toEqual(['a.b', 'a.c', 'd']);
  });
});

describe('diffKeyTrees', () => {
  const base = { a: { b: 1 }, c: 2 };
  it('reports missing and extra keys vs the base', () => {
    const r = diffKeyTrees(base, { a: {}, c: 2, e: 9 });
    expect(r.missing).toEqual(['a.b']);
    expect(r.extra).toEqual(['e']);
  });
  it('reports nothing for an identical tree', () => {
    const r = diffKeyTrees(base, { a: { b: 5 }, c: 7 });
    expect(r.missing).toEqual([]);
    expect(r.extra).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/i18n-validate.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// lib/content/i18n-validate.ts
type Tree = Record<string, unknown>;

/** Flatten nested message object into dot-path leaf keys. */
export function flattenKeys(obj: Tree, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flattenKeys(v as Tree, path));
    else out.push(path);
  }
  return out;
}

/** Keys missing from / extra in `candidate` relative to `base`. */
export function diffKeyTrees(base: Tree, candidate: Tree): { missing: string[]; extra: string[] } {
  const b = new Set(flattenKeys(base));
  const c = new Set(flattenKeys(candidate));
  return {
    missing: [...b].filter((k) => !c.has(k)).sort(),
    extra: [...c].filter((k) => !b.has(k)).sort(),
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/i18n-validate.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the integrity test (real message files + content)**

```ts
// lib/content/i18n-integrity.test.ts
import { describe, it, expect } from 'vitest';
import { routing } from '@/i18n/routing';
import { buildings } from './site';
import { diffKeyTrees } from './i18n-validate';
import en from '../../messages/en.json';
import vi from '../../messages/vi.json';
import ko from '../../messages/ko.json';
import zhHans from '../../messages/zh-Hans.json';
import ru from '../../messages/ru.json';

const CATALOGS: Record<string, unknown> = { en, vi, ko, 'zh-Hans': zhHans, ru };

describe('i18n integrity', () => {
  it('every locale catalog matches the English key tree', () => {
    for (const locale of routing.locales) {
      const diff = diffKeyTrees(en as Record<string, unknown>, CATALOGS[locale] as Record<string, unknown>);
      if (diff.missing.length || diff.extra.length) {
        console.error(`${locale}: missing=${diff.missing.join(',')} extra=${diff.extra.join(',')}`);
      }
      expect(diff.missing, `${locale} missing keys`).toEqual([]);
      expect(diff.extra, `${locale} extra keys`).toEqual([]);
    }
  });

  it('every localized content field has an English source', () => {
    for (const b of buildings) {
      expect(b.blurb.en, `${b.slug} blurb.en`).toBeTruthy();
      expect(b.alt.en, `${b.slug} alt.en`).toBeTruthy();
      for (const r of b.rooms) {
        expect(r.name.en, `${b.slug}/${r.slug} name.en`).toBeTruthy();
        expect(r.blurb.en, `${b.slug}/${r.slug} blurb.en`).toBeTruthy();
        expect(r.alt.en, `${b.slug}/${r.slug} alt.en`).toBeTruthy();
      }
    }
  });

  it('warns (non-fatal) when a visible locale is missing content', () => {
    const visible = routing.locales.filter((l) => l !== 'en');
    for (const b of buildings) {
      for (const l of visible) {
        if (!(l in b.blurb)) console.warn(`content gap: building ${b.slug} blurb missing ${l}`);
      }
    }
    expect(true).toBe(true);
  });
});
```

> `import en from '../../messages/en.json'` requires `resolveJsonModule` (Next/TS default is on). If tsc complains, ensure `"resolveJsonModule": true` in `tsconfig.json` (add if missing).

- [ ] **Step 6: Run, then wire prebuild**

```bash
npx vitest run lib/content/i18n-integrity.test.ts
```
Expected: PASS (key trees aligned; content has en). `prebuild` already runs `vitest run`, so this test gates the build automatically.

- [ ] **Step 7: Commit**

```bash
git add lib/content/i18n-validate.ts lib/content/i18n-validate.test.ts lib/content/i18n-integrity.test.ts tsconfig.json
git commit -m "feat: i18n validation (key-tree parity + content fallback) gated in prebuild"
```

---

### Task E4: Font fallbacks for CJK/Cyrillic

**Files:** Modify `app/globals.css`

- [ ] **Step 1: Add `:lang()` overrides near the typography section**

Append after the `h1..h6` rule:

```css
/* ============================================================================
   LANGUAGE FONT FALLBACKS (CJK / Cyrillic coverage)
   ============================================================================ */

/* Korean & Simplified Chinese: Noto sans for body AND headings (the decorative
   serif does not render CJK well). */
:lang(ko) { font-family: var(--font-noto-kr), system-ui, sans-serif; }
:lang(zh-Hans) { font-family: var(--font-noto-sc), system-ui, sans-serif; }
:lang(ko) :is(h1, h2, h3, h4, h5, h6),
:lang(zh-Hans) :is(h1, h2, h3, h4, h5, h6) {
  font-family: inherit; /* Noto, not Fraunces */
  letter-spacing: 0;
}

/* Russian: Fraunces lacks Cyrillic, so headings fall back to a Cyrillic-capable serif. */
:lang(ru) :is(h1, h2, h3, h4, h5, h6) {
  font-family: Georgia, "Times New Roman", serif;
}
```

- [ ] **Step 2: Verify build picks up fonts (smoke) + commit**

```bash
npx tsc --noEmit && npm run lint
git add app/globals.css
git commit -m "feat: language-specific font fallbacks (Noto KR/SC, Cyrillic headings)"
```

---

## Phase F — Verification

### Task F1: Full build (no Supabase env) + all tests

**Files:** none.

- [ ] **Step 1: Full test suite**

Run: `npx vitest run`
Expected: all suites pass (localize, i18n-validate, i18n-integrity, index, loader, validate, content-integrity, contacts, photos, storage-utils).

- [ ] **Step 2: Production build with no Supabase env**

Run: `rm -rf .next && env -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_ANON_KEY -u SUPABASE_SERVICE_ROLE_KEY npm run build`
Expected: build succeeds. Route table shows `/` plus `/[locale]` variants; building/room pages prerendered per locale; admin routes dynamic; sitemap/robots present.

- [ ] **Step 3: Commit (if any fixes were needed)**

```bash
git add -A && git commit -m "fix: i18n build verification fixes" || echo "nothing to fix"
```

---

### Task F2: Manual locale verification

**Files:** none.

- [ ] **Step 1: Run dev and check each locale**

Run `npm run dev`, then verify:
- `http://localhost:3000/` — English; `/vi`, `/ko`, `/zh`, `/ru` render fully translated (hero, value props, buildings, scooter, CTA, footer).
- `<html lang>` is `en|vi|ko|zh-Hans|ru` respectively (view source on `/zh` → `lang="zh-Hans"`).
- Language dropdown on `/buildings/gilda-hotel` switches to `/vi/buildings/gilda-hotel` etc. (same page).
- Korean/Chinese text renders in Noto (no tofu boxes); Russian renders correctly.
- On `/vi/buildings/gilda-hotel/1-bedroom`, the WhatsApp Book-now message is in Vietnamese and includes the `/vi/...` URL.
- `/` stays English (no redirect to a previously selected locale).
- `/admin` still loads (English) and redirects to `/admin/login` without a session.

- [ ] **Step 2: Screenshot a non-English page for the record; commit any fixes.**

---

## Self-review checklist (planner)

- [ ] Spec coverage: locales+prefix (A2), zh-Hans→/zh (A2/sitemap/room url), localeDetection:false (A2), proxy.ts + lazy Supabase (B1), route groups + two roots (B2/B3), messages JSON (A3/E1), component refactor (C1–C8), content localization + pick (D1–D5), localized SEO + inquiry templates (A3/D5), validate-i18n + content fallback (E3), fonts (B2/E4), functional switcher (C2), no-Supabase build (F1).
- [ ] No placeholders: all message values are real translations (flagged for native review, not blank).
- [ ] Type consistency: `getBuildings/getBuilding/getRoom` all take `locale: Locale`; `ResolvedBuilding/ResolvedRoom` expose resolved plain strings; `pick`/`Localized<T>` used consistently; `buildingNav(locale)`.

## Acceptance criteria (verify before done)

- [ ] `/`, `/vi`, `/ko`, `/zh`, `/ru` fully localized (UI + content + status + inquiry + SEO).
- [ ] `<html lang>` correct per locale (`zh-Hans` for `/zh`).
- [ ] Switcher navigates to the same page in the chosen locale.
- [ ] `/` always English; no auto-redirect.
- [ ] Admin at `/admin` (English) behind Supabase auth.
- [ ] Public build + run with **no Supabase env vars**.
- [ ] No missing-glyph rendering (CJK/Cyrillic fonts load).
- [ ] `i18n-integrity` + content tests + `tsc` + `lint` all green; key trees aligned.

## Follow-ups

- Native-speaker review of all VI/KO/ZH-Hans/RU strings (UI + content) before launch.
- Real room descriptions/prices (translate once provided).
- Localized slugs/pathnames (kept identical for now).
