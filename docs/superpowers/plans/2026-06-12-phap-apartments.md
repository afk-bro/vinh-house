# PHAP Apartments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a property-showcase website with an auth-protected admin CMS for managing apartments across buildings → rooms, harvesting auth/upload/design from the sibling `watershed-campground` repo.

**Architecture:** Next.js App Router + Supabase (Postgres/Auth/Storage) via `@supabase/ssr`. Single tenant. Two-level catalog (`buildings` → `rooms`) plus a single-row `site_settings`. Public side is browse-only; inquiries are outbound links to WhatsApp/Messenger/email. Admin side is RLS-protected CRUD with photo upload, price, and a per-room availability status flag.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, `@supabase/ssr`, `@supabase/supabase-js`, `lucide-react`.

**Harvest source (READ-ONLY — never modify):** `/home/x/dev/projects/watershed-campground`. Referred to below as `$WS`.

---

## Testing posture (deliberate deviation from default TDD)

The approved spec explicitly defers the test harness (no Playwright/vitest carried over; "tests may be added later"). User scope decisions override the skill's default TDD flow. Therefore **per-task verification uses real, observable evidence** but not unit tests:

- `npx tsc --noEmit` — type-check passes.
- `npm run build` (or `npm run lint`) — compiles/lints clean.
- **Manual smoke** — run `npm run dev`, hit the named URL, observe the named result.
- **SQL checks** — run the named query against Supabase, observe the named rows.

Every task below names its concrete verification. A small set of pure helpers (`lib/photos.ts`, `lib/contacts.ts`, `lib/storage-utils.ts`) are unit-test-friendly; **optional** vitest tasks for them are marked `(OPTIONAL)` and may be skipped without blocking.

A task is "done" only when its named verification command/URL produces the named result.

---

## File structure (what gets created)

```
phap-apartments/
  .env.local                      # Supabase URL/keys, ADMIN_EMAILS (gitignored)
  .env.example                    # documented var names (committed)
  middleware.ts                   # session refresh + /admin guard
  lib/
    logger.ts                     # tiny shim so harvested files import @/lib/logger
    supabase/{client,server,middleware}.ts   # harvested @supabase/ssr wiring
    supabase-admin.ts             # harvested service-role client
    admin-auth.ts                 # harvested, stripped to requireAdmin()
    admin/constants.ts            # ADMIN_ROUTES + isAuthPage (provides AdminNav/layout deps)
    storage-utils.ts              # harvested validators + new listing key gen
    photos.ts                     # cover/order helpers for the photos JSONB array
    contacts.ts                   # wa.me / messenger / mailto URL builders
  supabase/
    types.ts                      # Database types (placeholder, then generated)
    migrations/0001_init.sql      # buildings, rooms, site_settings, RLS, storage bucket
    seed.sql                      # optional dev seed
  components/                     # harvested base + admin components (pruned)
  app/
    globals.css                   # harvested design tokens + fonts
    layout.tsx                    # root layout (fonts wired)
    page.tsx                      # public: buildings grid
    buildings/[id]/page.tsx       # public: building detail + room cards
    rooms/[id]/page.tsx           # public: room detail + gallery + inquiry links
    auth/callback/{route.ts,page.tsx}        # harvested auth callback
    admin/
      layout.tsx                  # harvested auth-guard shell
      page.tsx                    # admin dashboard
      login/page.tsx              # harvested
      forgot-password/page.tsx    # harvested
      update-password/page.tsx    # harvested
      settings/page.tsx           # edit global contacts
      buildings/page.tsx          # list
      buildings/new/page.tsx      # create
      buildings/[id]/edit/page.tsx# edit + its rooms list
      rooms/new/page.tsx          # create room (building preselected)
      rooms/[id]/edit/page.tsx    # edit room: photos, price, status
    api/admin/
      upload-image/route.ts       # clean upload to listing-photos bucket
```

---

# Phase 0 — Scaffold

### Task 0.1: Scaffold Next.js into the existing repo without clobbering committed files

**Files:**
- Create: entire Next.js app skeleton
- Preserve: `CLAUDE.md`, `README.md`, `.gitignore`, `docs/`, `.git/`

`create-next-app` refuses a non-empty directory, so scaffold into a temp dir and merge.

- [ ] **Step 1: Scaffold into a temp directory**

```bash
cd /home/x/dev/projects
npx create-next-app@latest phap-scaffold \
  --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-turbopack --yes
```
Expected: `phap-scaffold/` created with `package.json`, `app/`, `tsconfig.json`, etc.

- [ ] **Step 2: Merge scaffold into the repo, keeping committed files**

```bash
cd /home/x/dev/projects/phap-scaffold
# Do not overwrite the repo's own README/.gitignore/CLAUDE.md
rm -f README.md .gitignore
rsync -a --ignore-existing ./ /home/x/dev/projects/phap-apartments/
# Bring over package files and config explicitly (rsync --ignore-existing skips none of these since they don't exist yet)
cd /home/x/dev/projects/phap-apartments
ls package.json next.config.* tsconfig.json postcss.config.* app/layout.tsx
```
Expected: all listed files now present in `phap-apartments/`.

- [ ] **Step 3: Append Next.js ignores to the existing .gitignore**

Open `/home/x/dev/projects/phap-apartments/.gitignore` and ensure it contains (add any missing lines):
```
/.next/
/node_modules
/out/
next-env.d.ts
.env*.local
.vercel
*.tsbuildinfo
```

- [ ] **Step 4: Install runtime deps**

```bash
cd /home/x/dev/projects/phap-apartments
npm install @supabase/ssr @supabase/supabase-js lucide-react
```
Expected: deps appear in `package.json`.

- [ ] **Step 5: Verify the app builds and runs**

```bash
npx tsc --noEmit && npm run build
```
Expected: build succeeds. Then `npm run dev` and open `http://localhost:3000` → default Next.js page renders.

- [ ] **Step 6: Clean up temp dir and commit**

```bash
rm -rf /home/x/dev/projects/phap-scaffold
cd /home/x/dev/projects/phap-apartments
git add -A
git commit -m "chore: scaffold Next.js app (TS, Tailwind, App Router)"
```

### Task 0.2: Environment variable wiring

**Files:**
- Create: `.env.example` (committed), `.env.local` (gitignored)

- [ ] **Step 1: Write `.env.example`**

```bash
# .env.example — copy to .env.local and fill in
# Supabase project (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Service-role key — server-only, NEVER expose to the browser
SUPABASE_SERVICE_ROLE_KEY=
# Comma-separated list of admin emails allowed into /admin
ADMIN_EMAILS=
```

- [ ] **Step 2: Create `.env.local`** with the same keys filled from the Supabase dashboard. (If the Supabase project does not exist yet, create it now: a new project at supabase.com, then copy URL + anon key + service-role key.)

- [ ] **Step 3: Verify it is gitignored**

```bash
git check-ignore .env.local
```
Expected: prints `.env.local`.

- [ ] **Step 4: Commit the example only**

```bash
git add .env.example && git commit -m "chore: document required environment variables"
```

---

# Phase 1 — Harvest auth (port + strip multi-tenancy)

### Task 1.1: Logger shim + admin constants (port enablers)

These small files let harvested code import `@/lib/logger` and `@/lib/admin/constants` unchanged.

**Files:**
- Create: `lib/logger.ts`, `lib/admin/constants.ts`

- [ ] **Step 1: Write `lib/logger.ts`**

```ts
/* Minimal logger shim. Harvested files import `@/lib/logger`. */
type Meta = unknown;
export const logger = {
  info: (msg: string, meta?: Meta) => console.info(msg, meta ?? ''),
  warn: (msg: string, meta?: Meta) => console.warn(msg, meta ?? ''),
  error: (msg: string, err?: Meta, meta?: Meta) => console.error(msg, err ?? '', meta ?? ''),
};
```

- [ ] **Step 2: Write `lib/admin/constants.ts`**

```ts
export const ADMIN_ROUTES = {
  ROOT: '/admin',
  LOGIN: '/admin/login',
  FORGOT_PASSWORD: '/admin/forgot-password',
  UPDATE_PASSWORD: '/admin/update-password',
  SETTINGS: '/admin/settings',
  BUILDINGS: '/admin/buildings',
} as const;

const AUTH_PAGES = [
  ADMIN_ROUTES.LOGIN,
  ADMIN_ROUTES.FORGOT_PASSWORD,
  ADMIN_ROUTES.UPDATE_PASSWORD,
];

export function isAuthPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return AUTH_PAGES.some((p) => pathname.startsWith(p));
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add lib/logger.ts lib/admin/constants.ts
git commit -m "feat: add logger shim and admin route constants"
```

### Task 1.2: Placeholder Supabase types

**Files:**
- Create: `supabase/types.ts`

Harvested clients reference `@/supabase/types` `Database`. Start permissive; regenerate after the schema migration (Task 4.2).

- [ ] **Step 1: Write `supabase/types.ts`**

```ts
/* Placeholder until generated from the live schema (see Task 4.2).
   Replace with `supabase gen types typescript`. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = Record<string, unknown>;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/types.ts && git commit -m "chore: add placeholder Supabase Database type"
```

### Task 1.3: Port Supabase SSR clients

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`

Port `$WS/lib/supabase/client.ts` and `$WS/lib/supabase/server.ts` **verbatim** — they have no multi-tenant coupling. `client.ts` already imports `@/supabase/types` (satisfied by Task 1.2).

- [ ] **Step 1: Copy both files**

```bash
WS=/home/x/dev/projects/watershed-campground
mkdir -p lib/supabase
cp "$WS/lib/supabase/client.ts" lib/supabase/client.ts
cp "$WS/lib/supabase/server.ts" lib/supabase/server.ts
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts
git commit -m "feat: harvest Supabase browser/server clients"
```

### Task 1.4: Port the service-role client

**Files:**
- Create: `lib/supabase-admin.ts`

`$WS/lib/supabase-admin.ts` has no multi-tenant coupling — port verbatim.

- [ ] **Step 1: Copy**

```bash
cp /home/x/dev/projects/watershed-campground/lib/supabase-admin.ts lib/supabase-admin.ts
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add lib/supabase-admin.ts && git commit -m "feat: harvest Supabase service-role client"
```

### Task 1.5: Port middleware session handling

**Files:**
- Create: `lib/supabase/middleware.ts`, `middleware.ts` (root)

Port `$WS/lib/supabase/middleware.ts` verbatim (it imports `@/lib/logger`, satisfied by Task 1.1; the `/admin` guard logic is generic). Then add the root `middleware.ts` that Next.js auto-runs.

- [ ] **Step 1: Copy the helper**

```bash
cp /home/x/dev/projects/watershed-campground/lib/supabase/middleware.ts lib/supabase/middleware.ts
```

- [ ] **Step 2: Create root `middleware.ts`**

```ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on everything except static assets and image files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/middleware.ts middleware.ts
git commit -m "feat: harvest auth middleware with /admin route guard"
```

### Task 1.6: Port admin-auth, stripped to `requireAdmin()`

**Files:**
- Create: `lib/admin-auth.ts`

Port ONLY the `requireAdmin()` function from `$WS/lib/admin-auth.ts`. **Drop** `requireAdminWithOrg`, `migrationGate`, `assertTenantMigrated`, and the `import { getUserOrganization } from '@/lib/organization'` line.

- [ ] **Step 1: Write `lib/admin-auth.ts`**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Checks the current user is authenticated and their email is in ADMIN_EMAILS.
 * @returns { authorized, user, response } — response is a ready-to-return error when not authorized.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false as const,
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) || [];
  const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '');

  if (!isAdmin) {
    return {
      authorized: false as const,
      user,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { authorized: true as const, user, response: null };
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add lib/admin-auth.ts
git commit -m "feat: harvest requireAdmin (multi-tenancy stripped)"
```

### Task 1.7: Port auth pages and admin shell

**Files:**
- Create: `app/auth/callback/page.tsx`, `app/auth/callback/route.ts` (if present in source), `app/admin/login/page.tsx`, `app/admin/forgot-password/page.tsx`, `app/admin/update-password/page.tsx`, `app/admin/layout.tsx`
- Depends on components harvested in Phase 2 (`Container`, `ui/Toast`, `admin/AdminNav`, `providers/ViewportModeProvider`). **This task must run after Task 2.2.**

- [ ] **Step 1: Copy the auth pages and callback**

```bash
WS=/home/x/dev/projects/watershed-campground
mkdir -p app/auth/callback app/admin/login app/admin/forgot-password app/admin/update-password
cp "$WS/app/auth/callback/page.tsx" app/auth/callback/page.tsx
[ -f "$WS/app/auth/callback/route.ts" ] && cp "$WS/app/auth/callback/route.ts" app/auth/callback/route.ts
cp "$WS/app/admin/login/page.tsx" app/admin/login/page.tsx
cp "$WS/app/admin/forgot-password/page.tsx" app/admin/forgot-password/page.tsx
cp "$WS/app/admin/update-password/page.tsx" app/admin/update-password/page.tsx
cp "$WS/app/admin/layout.tsx" app/admin/layout.tsx
```

- [ ] **Step 2: Resolve imports.** These files import `@/lib/supabase/client`, `@/lib/logger`, `@/components/Container`, `lucide-react`, `@/components/ui/Toast`, `@/components/providers/ViewportModeProvider`, `@/components/admin/AdminNav`, `@/lib/admin/constants`. All are satisfied by Tasks 1.1–1.6 and Phase 2. Open each file and confirm there are no remaining imports from `@/lib/organization`, reservation, or payment modules; delete any such lines and the code that used them (there should be none in these files).

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Manual smoke**

`npm run dev`, open `http://localhost:3000/admin` → redirected to `/admin/login`; the login form renders with email/password fields and a show/hide password toggle.

- [ ] **Step 5: Commit**

```bash
git add app/auth app/admin/login app/admin/forgot-password app/admin/update-password app/admin/layout.tsx
git commit -m "feat: harvest admin auth pages and auth-guard shell"
```

---

# Phase 2 — Harvest design system

### Task 2.1: Port design tokens, fonts, and Tailwind config

**Files:**
- Modify/replace: `app/globals.css`, `app/layout.tsx`
- Create: `tailwind.config.ts`

The watershed palette is a forest-green/gold campground theme. Harvest the **token architecture, spacing scale, and fonts intact** (recoloring later is a one-spot swap of the hex values under `:root` in `globals.css`).

- [ ] **Step 1: Copy globals.css and tailwind config**

```bash
WS=/home/x/dev/projects/watershed-campground
cp "$WS/app/globals.css" app/globals.css
cp "$WS/config/tailwind.config.ts" tailwind.config.ts
```

- [ ] **Step 2: Wire fonts in `app/layout.tsx`.** Replace the scaffolded root layout body/metadata so the `--font-heading` (Cormorant Garamond) and `--font-body` (Inter) referenced by `globals.css` are loaded:

```tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const heading = Cormorant_Garamond({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body-loaded' });

export const metadata: Metadata = {
  title: 'PHAP Apartments',
  description: 'Browse apartments across our buildings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify** the `next/font` variables are actually used. In `app/globals.css`, confirm `--font-heading`/`--font-body` resolve; if the file hardcodes the family names (it does), the `next/font` load still provides the webfont. Build to confirm no missing-font errors:

```bash
npx tsc --noEmit && npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Manual smoke** — `npm run dev`, open `http://localhost:3000`; the page background uses the forest token and headings render in a serif face.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tailwind.config.ts app/layout.tsx
git commit -m "feat: harvest design tokens, fonts, and Tailwind config"
```

### Task 2.2: Port base + admin components (pruned)

**Files:**
- Create under `components/`: `Container.tsx`, `Card.tsx`, `CTAButton.tsx`, `SectionHeader.tsx`, `ImageLightbox.tsx`, `ui/Toast.tsx`, `providers/ViewportModeProvider.tsx`, `admin/AdminNav.tsx`, `admin/StatusPill.tsx`, `admin/RowActions.tsx`, `admin/ConfirmDialog.tsx`

Do **NOT** harvest: anything under `components/booking/`, `PaymentForm.tsx`, `admin/CampsiteForm.tsx`, `admin/AssignmentDialog.tsx`, `admin/PaymentBadge.tsx`, `admin/DemoDataBanner.tsx`, `Hero.tsx`, `OurStory.tsx`, `TaskHero.tsx` (campground-specific).

- [ ] **Step 1: Copy the components**

```bash
WS=/home/x/dev/projects/watershed-campground
mkdir -p components/ui components/providers components/admin
for f in Container Card CTAButton SectionHeader ImageLightbox; do cp "$WS/components/$f.tsx" "components/$f.tsx"; done
cp "$WS/components/ui/Toast.tsx" components/ui/Toast.tsx
cp "$WS/components/providers/ViewportModeProvider.tsx" components/providers/ViewportModeProvider.tsx
for f in AdminNav StatusPill RowActions ConfirmDialog; do cp "$WS/components/admin/$f.tsx" "components/admin/$f.tsx"; done
```

- [ ] **Step 2: Resolve dangling imports.** Each copied file may import siblings or `@/lib/*`. Run `npx tsc --noEmit` and for each error: if it points at a campground-specific import (booking, payment, reservation, organization), remove that import and the JSX/code using it. If it points at another base component (e.g. `Container` used by `SectionHeader`), that component is already copied. **`AdminNav` must link only to PHAP admin routes** — open `components/admin/AdminNav.tsx` and replace its nav items with: Dashboard (`/admin`), Buildings (`/admin/buildings`), Settings (`/admin/settings`), plus the logout button (already wired via the `onLogout` prop). Remove campsite/reservation/calendar/reports links.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: passes (no dangling imports).

- [ ] **Step 4: Commit**

```bash
git add components/
git commit -m "feat: harvest base and admin UI components (pruned)"
```

---

# Phase 3 — Domain helpers (pure logic)

### Task 3.1: Photos JSONB helpers

**Files:**
- Create: `lib/photos.ts`
- Test (OPTIONAL): `lib/photos.test.ts`

- [ ] **Step 1: Write `lib/photos.ts`**

```ts
export type Photo = { url: string; alt: string; is_cover: boolean };

/** The cover photo, or the first photo if none is flagged, or undefined when empty. */
export function getCover(photos: Photo[]): Photo | undefined {
  return photos.find((p) => p.is_cover) ?? photos[0];
}

/** Returns a new array with exactly the given url flagged as cover. */
export function setCover(photos: Photo[], url: string): Photo[] {
  return photos.map((p) => ({ ...p, is_cover: p.url === url }));
}

/** Appends a photo; first photo added becomes the cover automatically. */
export function addPhoto(photos: Photo[], url: string, alt = ''): Photo[] {
  const isFirst = photos.length === 0;
  return [...photos, { url, alt, is_cover: isFirst }];
}

/** Removes a photo by url; if the cover was removed, the new first photo becomes cover. */
export function removePhoto(photos: Photo[], url: string): Photo[] {
  const next = photos.filter((p) => p.url !== url);
  if (next.length > 0 && !next.some((p) => p.is_cover)) next[0].is_cover = true;
  return next;
}

/** Moves the photo at `from` to index `to` (gallery reorder). */
export function reorder(photos: Photo[], from: number, to: number): Photo[] {
  const next = [...photos];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
```

- [ ] **Step 2 (OPTIONAL): Write `lib/photos.test.ts`** (only if vitest is added — see note below). If skipping, verify via `npx tsc --noEmit`.

```ts
import { describe, it, expect } from 'vitest';
import { getCover, setCover, addPhoto, removePhoto } from './photos';

const P = (url: string, is_cover = false) => ({ url, alt: '', is_cover });

describe('photos helpers', () => {
  it('first added photo is the cover', () => {
    expect(addPhoto([], 'a.jpg')[0].is_cover).toBe(true);
  });
  it('getCover prefers the flagged photo, falls back to first', () => {
    expect(getCover([P('a'), P('b', true)])?.url).toBe('b');
    expect(getCover([P('a'), P('b')])?.url).toBe('a');
    expect(getCover([])).toBeUndefined();
  });
  it('setCover flags exactly one', () => {
    const r = setCover([P('a', true), P('b')], 'b');
    expect(r.filter((p) => p.is_cover).map((p) => p.url)).toEqual(['b']);
  });
  it('removing the cover promotes the new first', () => {
    expect(removePhoto([P('a', true), P('b')], 'a')[0].is_cover).toBe(true);
  });
});
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
# If vitest installed: npx vitest run lib/photos.test.ts   → expect all pass
```
Expected: type-check passes.

- [ ] **Step 4: Commit**

```bash
git add lib/photos.ts lib/photos.test.ts 2>/dev/null; git add lib/photos.ts
git commit -m "feat: add photos JSONB cover/order helpers"
```

### Task 3.2: Inquiry-link helpers

**Files:**
- Create: `lib/contacts.ts`

- [ ] **Step 1: Write `lib/contacts.ts`**

```ts
export type SiteContacts = {
  whatsapp_number: string | null;
  messenger_url: string | null;
  contact_email: string | null;
};

/** Builds a wa.me link from a phone number (strips spaces, dashes, parens, leading +). */
export function whatsappUrl(number: string | null | undefined): string | null {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

/** Passes through a Messenger URL (m.me/... or facebook.com/...) if non-empty. */
export function messengerUrl(url: string | null | undefined): string | null {
  return url && url.trim() ? url.trim() : null;
}

/** Builds a mailto: link, optionally with a subject. */
export function mailtoUrl(email: string | null | undefined, subject?: string): string | null {
  if (!email) return null;
  const q = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${email}${q}`;
}
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add lib/contacts.ts
git commit -m "feat: add WhatsApp/Messenger/mailto link helpers"
```

### Task 3.3 (OPTIONAL): Add vitest for pure helpers

Only do this if you want automated coverage of `lib/photos.ts`, `lib/contacts.ts`, `lib/storage-utils.ts`.

- [ ] **Step 1: Install**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add script** to `package.json`: `"test": "vitest run"`.

- [ ] **Step 3: Run**

```bash
npx vitest run
```
Expected: the `lib/photos.test.ts` from Task 3.1 passes.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "test: add vitest for pure helpers"
```

---

# Phase 4 — Schema, RLS, storage

### Task 4.1: Write and apply the initial migration

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Write `supabase/migrations/0001_init.sql`**

```sql
-- PHAP Apartments — initial schema. Single tenant.

-- updated_at trigger helper
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- Buildings
create table buildings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  description text,
  photos      jsonb not null default '[]'::jsonb,   -- [{url, alt, is_cover}]
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger buildings_updated_at before update on buildings
  for each row execute function set_updated_at();

-- Rooms
create table rooms (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  name        text not null,
  price       numeric,
  status      text not null default 'available'
                check (status in ('available','not_available')),
  description text,
  photos      jsonb not null default '[]'::jsonb,   -- [{url, alt, is_cover}]
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index rooms_building_id_idx on rooms(building_id);
create trigger rooms_updated_at before update on rooms
  for each row execute function set_updated_at();

-- Single-row global settings (contacts)
create table site_settings (
  id              uuid primary key default gen_random_uuid(),
  site_title      text,
  whatsapp_number text,
  messenger_url   text,
  contact_email   text,
  updated_at      timestamptz not null default now()
);
create trigger site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();
insert into site_settings (site_title) values ('PHAP Apartments');

-- Row Level Security: public read, authenticated write
alter table buildings     enable row level security;
alter table rooms         enable row level security;
alter table site_settings enable row level security;

create policy "public read buildings"  on buildings     for select using (true);
create policy "public read rooms"      on rooms         for select using (true);
create policy "public read settings"   on site_settings for select using (true);

create policy "auth write buildings" on buildings     for all to authenticated using (true) with check (true);
create policy "auth write rooms"     on rooms         for all to authenticated using (true) with check (true);
create policy "auth write settings"  on site_settings for all to authenticated using (true) with check (true);
```

- [ ] **Step 2: Apply the migration.** Either via the Supabase SQL editor (paste and run) or the CLI if linked:

```bash
# CLI path (requires `supabase link` to the project):
npx supabase db push
# OR: paste supabase/migrations/0001_init.sql into the Supabase dashboard SQL editor and run.
```

- [ ] **Step 3: Verify the schema exists.** Run in the SQL editor:

```sql
select table_name from information_schema.tables
where table_schema='public' and table_name in ('buildings','rooms','site_settings');
select count(*) from site_settings;   -- expect 1
```
Expected: three tables listed; `site_settings` count = 1.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0001_init.sql
git commit -m "feat: initial schema (buildings, rooms, site_settings) with RLS"
```

### Task 4.2: Create the storage bucket and policies

**Files:**
- Create: `supabase/migrations/0002_storage.sql`

- [ ] **Step 1: Write `supabase/migrations/0002_storage.sql`**

```sql
-- Public bucket for listing photos
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Anyone can read; only authenticated users can write/delete in this bucket.
create policy "public read listing-photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "auth upload listing-photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos');

create policy "auth update listing-photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'listing-photos');

create policy "auth delete listing-photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos');
```

- [ ] **Step 2: Apply** (CLI `db push` or paste into SQL editor).

- [ ] **Step 3: Verify**

```sql
select id, public from storage.buckets where id='listing-photos';  -- expect public=true
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_storage.sql
git commit -m "feat: add public listing-photos storage bucket with RLS"
```

### Task 4.3: Regenerate Supabase types

**Files:**
- Modify: `supabase/types.ts`

- [ ] **Step 1: Generate types from the live schema**

```bash
# Requires SUPABASE project ref; from Project Settings → General → Reference ID
npx supabase gen types typescript --project-id <PROJECT_REF> --schema public > supabase/types.ts
```
If the CLI is not linked, skip and keep the placeholder `Database` type — the app compiles either way (clients are typed loosely).

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit
git add supabase/types.ts
git commit -m "chore: generate Supabase types from schema"
```

---

# Phase 5 — Image upload route

### Task 5.1: Harvest storage validators + add listing key generator

**Files:**
- Create: `lib/storage-utils.ts`

Harvest the validator functions from `$WS/lib/storage-utils.ts` and **replace** the campsite-specific key generator with a listing one (no org prefix).

- [ ] **Step 1: Copy then edit**

```bash
cp /home/x/dev/projects/watershed-campground/lib/storage-utils.ts lib/storage-utils.ts
```

- [ ] **Step 2: Replace `campsiteImageKey` with `listingPhotoKey`.** In `lib/storage-utils.ts`, delete the `campsiteImageKey` function and its doc comment, and add:

```ts
import { randomUUID } from 'crypto';

/**
 * Secure storage key for a listing photo.
 * Format: <kind>/<ownerId>/<uuid>.<ext>  e.g. rooms/<roomId>/<uuid>.jpg
 */
export function listingPhotoKey(kind: 'rooms' | 'buildings', ownerId: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  return `${kind}/${ownerId}/${randomUUID()}.${ext}`;
}
```
Keep `isValidImageType`, `validateFileHeader`, `isValidImageSize`, `getExtensionFromMimeType` unchanged (they import `@/lib/logger`, satisfied by Task 1.1). The `import { randomUUID } ...` line at the top of the original can be deduped — ensure it appears once.

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add lib/storage-utils.ts
git commit -m "feat: harvest storage validators, add listing key generator"
```

### Task 5.2: Clean upload route

**Files:**
- Create: `app/api/admin/upload-image/route.ts`

Unlike the harvested (deprecated) source, this route validates the file and is auth-guarded.

- [ ] **Step 1: Write `app/api/admin/upload-image/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/admin-auth';
import {
  listingPhotoKey,
  isValidImageType,
  isValidImageSize,
  validateFileHeader,
} from '@/lib/storage-utils';

export const runtime = 'nodejs';
const BUCKET = 'listing-photos';

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireAdmin();
  if (!authorized) return response;

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const kind = (form.get('kind') as string) === 'buildings' ? 'buildings' : 'rooms';
  const ownerId = form.get('ownerId') as string | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!ownerId) return NextResponse.json({ error: 'Missing ownerId' }, { status: 400 });
  if (!isValidImageType(file.type)) return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
  if (!isValidImageSize(file.size)) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 413 });
  if (!(await validateFileHeader(file))) return NextResponse.json({ error: 'File content is not a valid image' }, { status: 415 });

  const key = listingPhotoKey(kind, ownerId, file.name);
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type, cacheControl: '3600', upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
  return NextResponse.json({ url: data.publicUrl, name: file.name }, { status: 200 });
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit && npm run build
```
Expected: build succeeds.

- [ ] **Step 3: Manual smoke (after admin login works).** Deferred to Task 6.3 where the room editor exercises this route end-to-end. For now confirm the route compiles and returns 401 when unauthenticated:

```bash
npm run dev
curl -s -X POST http://localhost:3000/api/admin/upload-image -F file=@/dev/null
```
Expected: `{"error":"Unauthorized"}`.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/upload-image/route.ts
git commit -m "feat: add validated, auth-guarded image upload route"
```

---

# Phase 6 — Admin CRUD

> All admin pages live under `app/admin/` and are protected by the harvested middleware + layout guard. Server reads use `@/lib/supabase/server`; mutations use server actions with the server client (RLS enforces auth).

### Task 6.1: Buildings list + create + delete

**Files:**
- Create: `app/admin/page.tsx` (dashboard), `app/admin/buildings/page.tsx`, `app/admin/buildings/new/page.tsx`, `app/admin/buildings/actions.ts`

- [ ] **Step 1: Write `app/admin/page.tsx`** — a simple dashboard linking to Buildings and Settings:

```tsx
import Link from 'next/link';
import Container from '@/components/Container';

export default function AdminDashboard() {
  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">Admin</h1>
      <ul className="mt-6 space-y-3">
        <li><Link className="text-text-accent underline" href="/admin/buildings">Buildings</Link></li>
        <li><Link className="text-text-accent underline" href="/admin/settings">Site settings (contacts)</Link></li>
      </ul>
    </Container>
  );
}
```

- [ ] **Step 2: Write `app/admin/buildings/actions.ts`** (server actions):

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createBuilding(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('buildings').insert({
    name: String(formData.get('name') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/buildings');
  redirect('/admin/buildings');
}

export async function deleteBuilding(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const { error } = await supabase.from('buildings').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/buildings');
}
```

- [ ] **Step 3: Write `app/admin/buildings/page.tsx`** (list + delete):

```tsx
import Link from 'next/link';
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { deleteBuilding } from './actions';

export default async function BuildingsList() {
  const supabase = await createClient();
  const { data: buildings } = await supabase
    .from('buildings').select('id, name, address').order('sort_order');

  return (
    <Container>
      <div className="flex items-center justify-between mt-8">
        <h1 className="font-heading text-3xl text-text-accent">Buildings</h1>
        <Link href="/admin/buildings/new" className="text-text-accent underline">+ New building</Link>
      </div>
      <ul className="mt-6 divide-y divide-[var(--color-border-subtle)]">
        {(buildings ?? []).map((b) => (
          <li key={b.id} className="py-3 flex items-center justify-between">
            <Link href={`/admin/buildings/${b.id}/edit`} className="text-text-primary">
              {b.name}{b.address ? ` — ${b.address}` : ''}
            </Link>
            <form action={deleteBuilding}>
              <input type="hidden" name="id" value={b.id} />
              <button className="text-status-cancelled text-sm">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </Container>
  );
}
```

- [ ] **Step 4: Write `app/admin/buildings/new/page.tsx`**:

```tsx
import Container from '@/components/Container';
import { createBuilding } from '../actions';

export default function NewBuilding() {
  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">New building</h1>
      <form action={createBuilding} className="mt-6 space-y-4 max-w-lg">
        <input name="name" required placeholder="Building name"
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <input name="address" placeholder="Address"
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <textarea name="description" placeholder="Description" rows={4}
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Create</button>
      </form>
    </Container>
  );
}
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 6: Manual smoke** — log in at `/admin/login` (use an email in `ADMIN_EMAILS`; create the user in Supabase Auth dashboard first). Go to `/admin/buildings/new`, create "Building A", confirm it appears in the list, then delete it and confirm it disappears. Verify in SQL: `select count(*) from buildings;`.

- [ ] **Step 7: Commit**

```bash
git add app/admin/page.tsx app/admin/buildings
git commit -m "feat: admin buildings list/create/delete"
```

### Task 6.2: Building edit + its rooms list

**Files:**
- Create: `app/admin/buildings/[id]/edit/page.tsx`
- Modify: `app/admin/buildings/actions.ts` (add `updateBuilding`, `deleteRoom`)

- [ ] **Step 1: Add `updateBuilding` and `deleteRoom` to `actions.ts`**:

```ts
export async function updateBuilding(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const { error } = await supabase.from('buildings').update({
    name: String(formData.get('name') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/buildings/${id}/edit`);
}

export async function deleteRoom(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const buildingId = String(formData.get('buildingId'));
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/buildings/${buildingId}/edit`);
}
```

- [ ] **Step 2: Write `app/admin/buildings/[id]/edit/page.tsx`** — edit form + rooms list with "add room" linking to the room creator (Task 6.3):

```tsx
import Link from 'next/link';
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { updateBuilding, deleteRoom } from '../../actions';

export default async function EditBuilding({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: b } = await supabase.from('buildings').select('*').eq('id', id).single();
  const { data: rooms } = await supabase
    .from('rooms').select('id, name, price, status').eq('building_id', id).order('sort_order');
  if (!b) return <Container><p className="mt-8 text-text-primary">Not found.</p></Container>;

  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">Edit building</h1>
      <form action={updateBuilding} className="mt-6 space-y-4 max-w-lg">
        <input type="hidden" name="id" value={b.id} />
        <input name="name" defaultValue={b.name} required
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <input name="address" defaultValue={b.address ?? ''}
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <textarea name="description" defaultValue={b.description ?? ''} rows={4}
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Save</button>
      </form>

      <div className="flex items-center justify-between mt-10">
        <h2 className="font-heading text-2xl text-text-accent">Rooms</h2>
        <Link href={`/admin/rooms/new?building=${b.id}`} className="text-text-accent underline">+ New room</Link>
      </div>
      <ul className="mt-4 divide-y divide-[var(--color-border-subtle)]">
        {(rooms ?? []).map((r) => (
          <li key={r.id} className="py-3 flex items-center justify-between">
            <Link href={`/admin/rooms/${r.id}/edit`} className="text-text-primary">
              {r.name} — {r.price != null ? `$${r.price}` : 'no price'} — {r.status}
            </Link>
            <form action={deleteRoom}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="buildingId" value={b.id} />
              <button className="text-status-cancelled text-sm">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </Container>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 4: Manual smoke** — edit a building's name/address, save, confirm persisted (reload). The rooms section shows "New room" linking to `/admin/rooms/new?building=<id>`.

- [ ] **Step 5: Commit**

```bash
git add app/admin/buildings/[id]/edit/page.tsx app/admin/buildings/actions.ts
git commit -m "feat: admin building edit and per-building rooms list"
```

### Task 6.3: Room create + edit (photos upload, price, status)

**Files:**
- Create: `app/admin/rooms/new/page.tsx`, `app/admin/rooms/[id]/edit/page.tsx`, `app/admin/rooms/actions.ts`, `components/admin/RoomPhotoManager.tsx`

- [ ] **Step 1: Write `app/admin/rooms/actions.ts`**:

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Photo } from '@/lib/photos';

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  const buildingId = String(formData.get('building_id'));
  const priceRaw = String(formData.get('price') ?? '').trim();
  const { data, error } = await supabase.from('rooms').insert({
    building_id: buildingId,
    name: String(formData.get('name') ?? '').trim(),
    price: priceRaw === '' ? null : Number(priceRaw),
    status: String(formData.get('status') ?? 'available'),
    description: String(formData.get('description') ?? '').trim() || null,
  }).select('id').single();
  if (error) throw new Error(error.message);
  redirect(`/admin/rooms/${data!.id}/edit`);
}

export async function updateRoom(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const priceRaw = String(formData.get('price') ?? '').trim();
  const { error } = await supabase.from('rooms').update({
    name: String(formData.get('name') ?? '').trim(),
    price: priceRaw === '' ? null : Number(priceRaw),
    status: String(formData.get('status') ?? 'available'),
    description: String(formData.get('description') ?? '').trim() || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/rooms/${id}/edit`);
}

/** Persists the full photos array (called after upload/reorder/cover/remove). */
export async function saveRoomPhotos(roomId: string, photos: Photo[]) {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').update({ photos }).eq('id', roomId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/rooms/${roomId}/edit`);
}
```

- [ ] **Step 2: Write `components/admin/RoomPhotoManager.tsx`** (client component: uploads via the route, manages the array, calls `saveRoomPhotos`):

```tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { addPhoto, removePhoto, setCover, type Photo } from '@/lib/photos';
import { saveRoomPhotos } from '@/app/admin/rooms/actions';

export default function RoomPhotoManager({ roomId, initial }: { roomId: string; initial: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [busy, setBusy] = useState(false);

  async function persist(next: Photo[]) {
    setPhotos(next);
    await saveRoomPhotos(roomId, next);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setBusy(true);
    let next = photos;
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', 'rooms');
      fd.append('ownerId', roomId);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        next = addPhoto(next, url, file.name);
      }
    }
    await persist(next);
    setBusy(false);
    e.target.value = '';
  }

  return (
    <div className="mt-4">
      <input type="file" accept="image/*" multiple onChange={onUpload} disabled={busy} />
      {busy && <p className="text-text-muted text-sm mt-2">Uploading…</p>}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {photos.map((p) => (
          <figure key={p.url} className="relative border border-[var(--color-border-default)]">
            <Image src={p.url} alt={p.alt} width={240} height={160} className="object-cover w-full h-32" />
            <figcaption className="flex justify-between items-center p-1 text-xs">
              <button type="button" onClick={() => persist(setCover(photos, p.url))}
                className={p.is_cover ? 'text-accent-gold' : 'text-text-muted'}>
                {p.is_cover ? '★ cover' : 'set cover'}
              </button>
              <button type="button" onClick={() => persist(removePhoto(photos, p.url))}
                className="text-status-cancelled">remove</button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
```
(Reorder is intentionally out of MVP; array order = upload order. Add drag-reorder later using `lib/photos.ts:reorder` if desired.)

- [ ] **Step 3: Configure `next.config` for Supabase image host.** In `next.config.ts`, add the Supabase storage hostname to `images.remotePatterns`:

```ts
import type { NextConfig } from 'next';
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : '';
const nextConfig: NextConfig = {
  images: { remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [] },
};
export default nextConfig;
```

- [ ] **Step 4: Write `app/admin/rooms/new/page.tsx`**:

```tsx
import Container from '@/components/Container';
import { createRoom } from '../actions';

export default async function NewRoom({ searchParams }: { searchParams: Promise<{ building?: string }> }) {
  const { building } = await searchParams;
  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">New room</h1>
      <form action={createRoom} className="mt-6 space-y-4 max-w-lg">
        <input type="hidden" name="building_id" value={building ?? ''} />
        <input name="name" required placeholder="Room name / number"
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <input name="price" type="number" step="0.01" placeholder="Price"
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <select name="status" defaultValue="available"
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary">
          <option value="available">Available</option>
          <option value="not_available">Not available</option>
        </select>
        <textarea name="description" placeholder="Description" rows={4}
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Create &amp; add photos</button>
      </form>
    </Container>
  );
}
```

- [ ] **Step 5: Write `app/admin/rooms/[id]/edit/page.tsx`**:

```tsx
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { updateRoom } from '../actions';
import RoomPhotoManager from '@/components/admin/RoomPhotoManager';
import type { Photo } from '@/lib/photos';

export default async function EditRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: r } = await supabase.from('rooms').select('*').eq('id', id).single();
  if (!r) return <Container><p className="mt-8 text-text-primary">Not found.</p></Container>;

  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">Edit room</h1>
      <form action={updateRoom} className="mt-6 space-y-4 max-w-lg">
        <input type="hidden" name="id" value={r.id} />
        <input name="name" defaultValue={r.name} required
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <input name="price" type="number" step="0.01" defaultValue={r.price ?? ''}
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <select name="status" defaultValue={r.status}
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary">
          <option value="available">Available</option>
          <option value="not_available">Not available</option>
        </select>
        <textarea name="description" defaultValue={r.description ?? ''} rows={4}
          className="w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary" />
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Save</button>
      </form>

      <h2 className="font-heading text-2xl text-text-accent mt-10">Photos</h2>
      <RoomPhotoManager roomId={r.id} initial={(r.photos ?? []) as Photo[]} />
    </Container>
  );
}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 7: Manual smoke (end-to-end upload)** — from a building's edit page click "New room", create it, land on the room editor, upload 2 images, confirm thumbnails render, click "set cover" on the second, remove the first. Verify in SQL: `select name, price, status, jsonb_array_length(photos) from rooms where id='<id>';` shows the right count, and exactly one photo has `is_cover=true`: `select photos from rooms where id='<id>';`.

- [ ] **Step 8: Commit**

```bash
git add app/admin/rooms components/admin/RoomPhotoManager.tsx next.config.ts
git commit -m "feat: admin room create/edit with photo upload, price, status"
```

### Task 6.4: Settings page (global contacts)

**Files:**
- Create: `app/admin/settings/page.tsx`, `app/admin/settings/actions.ts`

- [ ] **Step 1: Write `app/admin/settings/actions.ts`**:

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const { error } = await supabase.from('site_settings').update({
    site_title: String(formData.get('site_title') ?? '').trim() || null,
    whatsapp_number: String(formData.get('whatsapp_number') ?? '').trim() || null,
    messenger_url: String(formData.get('messenger_url') ?? '').trim() || null,
    contact_email: String(formData.get('contact_email') ?? '').trim() || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/settings');
}
```

- [ ] **Step 2: Write `app/admin/settings/page.tsx`** (reads the single settings row):

```tsx
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { updateSettings } from './actions';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: s } = await supabase.from('site_settings').select('*').limit(1).single();
  if (!s) return <Container><p className="mt-8 text-text-primary">No settings row.</p></Container>;

  const field = 'w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary';
  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">Site settings</h1>
      <form action={updateSettings} className="mt-6 space-y-4 max-w-lg">
        <input type="hidden" name="id" value={s.id} />
        <label className="block text-text-secondary text-sm">Site title
          <input name="site_title" defaultValue={s.site_title ?? ''} className={field} /></label>
        <label className="block text-text-secondary text-sm">WhatsApp number (digits, with country code)
          <input name="whatsapp_number" defaultValue={s.whatsapp_number ?? ''} className={field} /></label>
        <label className="block text-text-secondary text-sm">Messenger URL (m.me/… or facebook.com/…)
          <input name="messenger_url" defaultValue={s.messenger_url ?? ''} className={field} /></label>
        <label className="block text-text-secondary text-sm">Contact email
          <input name="contact_email" type="email" defaultValue={s.contact_email ?? ''} className={field} /></label>
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Save</button>
      </form>
    </Container>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 4: Manual smoke** — set a WhatsApp number, Messenger URL, and email; save; reload; confirm values persisted. SQL: `select whatsapp_number, messenger_url, contact_email from site_settings;`.

- [ ] **Step 5: Commit**

```bash
git add app/admin/settings
git commit -m "feat: admin global contact settings"
```

---

# Phase 7 — Public pages

### Task 7.1: Buildings grid (home)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write `app/page.tsx`**:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { getCover, type Photo } from '@/lib/photos';

export default async function Home() {
  const supabase = await createClient();
  const { data: buildings } = await supabase
    .from('buildings').select('id, name, address, photos').order('sort_order');

  return (
    <Container>
      <h1 className="font-heading text-4xl text-text-accent mt-10">Our buildings</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {(buildings ?? []).map((b) => {
          const cover = getCover((b.photos ?? []) as Photo[]);
          return (
            <Link key={b.id} href={`/buildings/${b.id}`}
              className="block border border-[var(--color-border-default)] bg-surface-card">
              {cover && <Image src={cover.url} alt={cover.alt || b.name} width={480} height={300}
                className="object-cover w-full h-48" />}
              <div className="p-4">
                <h2 className="font-heading text-2xl text-text-primary">{b.name}</h2>
                {b.address && <p className="text-text-muted text-sm">{b.address}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Verify + smoke** — `npm run build`; open `/`; buildings created in admin appear as cards with cover images.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: public buildings grid"
```

### Task 7.2: Building detail + room cards (price pill, status badge)

**Files:**
- Create: `app/buildings/[id]/page.tsx`, `components/RoomCard.tsx`

- [ ] **Step 1: Write `components/RoomCard.tsx`**:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { getCover, type Photo } from '@/lib/photos';

type Room = { id: string; name: string; price: number | null; status: string; photos: Photo[] };

export default function RoomCard({ room }: { room: Room }) {
  const cover = getCover(room.photos ?? []);
  const available = room.status === 'available';
  return (
    <Link href={`/rooms/${room.id}`} className="block relative border border-[var(--color-border-default)] bg-surface-card">
      {cover && <Image src={cover.url} alt={cover.alt || room.name} width={480} height={320}
        className="object-cover w-full h-52" />}
      {room.price != null && (
        <span className="absolute top-3 left-3 px-3 py-1 bg-accent-gold text-text-inverse text-sm font-medium rounded-full">
          ${room.price}
        </span>
      )}
      <span className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full ${
        available ? 'bg-status-confirmed-bg text-status-confirmed' : 'bg-status-cancelled-bg text-status-cancelled'}`}>
        {available ? 'Available' : 'Not available'}
      </span>
      <div className="p-4"><h3 className="font-heading text-xl text-text-primary">{room.name}</h3></div>
    </Link>
  );
}
```
(If `status-confirmed-bg`/`status-cancelled-bg` are CSS-var-only tokens not in the Tailwind config, use inline `style={{ background: 'var(--color-status-confirmed-bg)' }}` instead — confirm against `app/globals.css` token names during implementation.)

- [ ] **Step 2: Write `app/buildings/[id]/page.tsx`**:

```tsx
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import RoomCard from '@/components/RoomCard';
import type { Photo } from '@/lib/photos';

export default async function BuildingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: b } = await supabase.from('buildings').select('*').eq('id', id).single();
  const { data: rooms } = await supabase
    .from('rooms').select('id, name, price, status, photos').eq('building_id', id).order('sort_order');
  if (!b) return <Container><p className="mt-10 text-text-primary">Building not found.</p></Container>;

  return (
    <Container>
      <h1 className="font-heading text-4xl text-text-accent mt-10">{b.name}</h1>
      {b.address && <p className="text-text-muted">{b.address}</p>}
      {b.description && <p className="text-text-secondary mt-4 max-w-2xl">{b.description}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {(rooms ?? []).map((r) => (
          <RoomCard key={r.id} room={{ ...r, photos: (r.photos ?? []) as Photo[] }} />
        ))}
      </div>
    </Container>
  );
}
```

- [ ] **Step 3: Verify + smoke** — `npm run build`; open a building page; rooms render with a **price pill** over the cover and a **status badge**; an unavailable room shows the red badge.

- [ ] **Step 4: Commit**

```bash
git add app/buildings components/RoomCard.tsx
git commit -m "feat: public building detail with room cards (price pill, status)"
```

### Task 7.3: Room detail — gallery + inquiry links

**Files:**
- Create: `app/rooms/[id]/page.tsx`, `components/InquiryLinks.tsx`

- [ ] **Step 1: Write `components/InquiryLinks.tsx`**:

```tsx
import { whatsappUrl, messengerUrl, mailtoUrl, type SiteContacts } from '@/lib/contacts';

export default function InquiryLinks({ contacts, roomName }: { contacts: SiteContacts; roomName: string }) {
  const subject = `Inquiry about ${roomName}`;
  const wa = whatsappUrl(contacts.whatsapp_number);
  const msg = messengerUrl(contacts.messenger_url);
  const mail = mailtoUrl(contacts.contact_email, subject);
  const cls = 'px-5 py-2 bg-accent-gold text-text-inverse rounded-full';
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {wa && <a className={cls} href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
      {msg && <a className={cls} href={msg} target="_blank" rel="noopener noreferrer">Messenger</a>}
      {mail && <a className={cls} href={mail}>Email</a>}
    </div>
  );
}
```

- [ ] **Step 2: Write `app/rooms/[id]/page.tsx`** (gallery + inquiry):

```tsx
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import InquiryLinks from '@/components/InquiryLinks';
import { getCover, type Photo } from '@/lib/photos';

export default async function RoomDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: r } = await supabase
    .from('rooms').select('*, buildings(id, name)').eq('id', id).single();
  const { data: settings } = await supabase
    .from('site_settings').select('whatsapp_number, messenger_url, contact_email').limit(1).single();
  if (!r) return <Container><p className="mt-10 text-text-primary">Room not found.</p></Container>;

  const photos = (r.photos ?? []) as Photo[];
  const cover = getCover(photos);
  const available = r.status === 'available';

  return (
    <Container>
      {r.buildings && (
        <Link href={`/buildings/${r.buildings.id}`} className="text-text-muted text-sm">← {r.buildings.name}</Link>
      )}
      <div className="flex items-center gap-4 mt-2">
        <h1 className="font-heading text-4xl text-text-accent">{r.name}</h1>
        {r.price != null && <span className="px-3 py-1 bg-accent-gold text-text-inverse rounded-full">${r.price}</span>}
        <span className={available ? 'text-status-confirmed' : 'text-status-cancelled'}>
          {available ? 'Available' : 'Not available'}
        </span>
      </div>
      {r.description && <p className="text-text-secondary mt-4 max-w-2xl">{r.description}</p>}

      {cover && <Image src={cover.url} alt={cover.alt || r.name} width={960} height={600}
        className="object-cover w-full max-h-[28rem] mt-6" />}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
        {photos.filter((p) => !p.is_cover).map((p) => (
          <Image key={p.url} src={p.url} alt={p.alt || r.name} width={240} height={160}
            className="object-cover w-full h-28" />
        ))}
      </div>

      {settings && <InquiryLinks contacts={settings} roomName={r.name} />}
    </Container>
  );
}
```

- [ ] **Step 3: Verify + smoke** — `npm run build`; open a room page; the gallery shows cover + remaining photos; WhatsApp/Messenger/Email buttons appear only for contacts that are set, and WhatsApp opens `https://wa.me/<digits>`.

- [ ] **Step 4: Commit**

```bash
git add app/rooms components/InquiryLinks.tsx
git commit -m "feat: public room detail with gallery and inquiry links"
```

---

# Phase 8 — Finishing touches

### Task 8.1: Update README with real commands

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the "Getting started" section** with real setup steps: copy `.env.example` → `.env.local`, fill Supabase keys + `ADMIN_EMAILS`, apply `supabase/migrations/*.sql`, create an admin user in the Supabase Auth dashboard, `npm install`, `npm run dev`.

- [ ] **Step 2: Commit**

```bash
git add README.md && git commit -m "docs: real getting-started commands"
```

### Task 8.2: Full smoke pass

- [ ] **Step 1:** `npm run build` → succeeds.
- [ ] **Step 2:** Log in → create a building → add 2 rooms with photos + prices + one set to "not available" → set contacts in settings.
- [ ] **Step 3:** Log out, browse `/` → building → room; confirm price pills, status badges, gallery, and working WhatsApp/Messenger/email links.
- [ ] **Step 4:** Confirm `/admin` redirects to `/admin/login` when logged out.

---

## Self-review notes (author checked against spec)

- **Versions** → Task 0.1 (latest stable = same majors as watershed). ✔
- **Photos JSONB + cover** → schema (4.1), helpers (3.1), manager (6.3), public cover usage (7.1–7.3). ✔
- **Price as own column, rendered as pill** → schema (4.1), RoomCard pill (7.2), room detail pill (7.3). ✔
- **Global contacts** → `site_settings` (4.1), settings admin (6.4), public inquiry links (7.3). ✔
- **Auth harvest, multi-tenancy stripped** → 1.3–1.7 (requireAdmin only; no `organization_id`). ✔
- **Upload harvest, retargeted to `listing-photos`** → 5.1–5.2. ✔
- **Design tokens/fonts/components harvest** → 2.1–2.2. ✔
- **RLS public-read / auth-write + public storage bucket** → 4.1–4.2. ✔
- **Out of scope** (booking/payments/availability-math/email/contact-form) → none introduced. ✔
- **Type consistency:** `Photo` shape (`url/alt/is_cover`) identical across `lib/photos.ts`, schema JSONB, upload manager, public components. `requireAdmin` return shape (`authorized/user/response`) consistent in `lib/admin-auth.ts` and `upload-image/route.ts`. `SiteContacts` consistent in `lib/contacts.ts` and `InquiryLinks`. ✔
- **Open flag for implementer:** if `create-next-app` emits a `src/` layout, keep paths consistent with the no-`src` layout this plan assumes (Task 0.1 passes `--no-src-dir`).
```
