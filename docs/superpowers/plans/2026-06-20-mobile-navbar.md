# Mobile Navbar + Language Abbreviations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the navbar on mobile with a breakpoint-aware layout (hamburger panel below `md`), and switch the language switcher to flag + two-letter codes (full names kept as aria-labels only).

**Architecture:** `Navbar` (server) splits into a desktop inline group (`hidden md:flex`) and a mobile `MobileNav` (`md:hidden`) hamburger panel; `BookNowMenu` stays always-visible. `MobileNav` (new client component) holds building links + Scooter Rental + a compact language switcher. `LanguageMenu` shows flag + code. No new dependencies (lucide `Menu`/`X` + existing `country-flag-icons`).

**Tech Stack:** Next.js 16, next-intl 4, React 19, Tailwind v4, lucide-react, country-flag-icons.

**Spec:** `docs/superpowers/specs/2026-06-20-mobile-navbar-design.md`

**Testing:** Presentational/responsive — verified by `tsc`/`lint`/`build` + phone-viewport (iPhone-14) screenshots + a horizontal-overflow check. No component unit tests (matches the repo pattern of testing only pure `lib/` logic).

---

### Task 1: Add `nav.menu` message key (5 locales)

**Files:** Modify `messages/en.json`, `messages/vi.json`, `messages/ko.json`, `messages/zh-Hans.json`, `messages/ru.json`

- [ ] **Step 1: Add `"menu"` to the `nav` object in each catalog**

In each file's `"nav": { ... }` object, add a `"menu"` key:
- `en.json` → `"menu": "Menu"`
- `vi.json` → `"menu": "Trình đơn"`
- `ko.json` → `"menu": "메뉴"`
- `zh-Hans.json` → `"menu": "菜单"`
- `ru.json` → `"menu": "Меню"`

Example for `en.json` (add the key inside the existing `nav` object, mind the comma):
```json
  "nav": {
    "buildings": "Buildings",
    "scooterRental": "Scooter Rental",
    "bookNow": "Book now",
    "selectLanguage": "Select language",
    "comingSoon": "Coming soon",
    "menu": "Menu"
  },
```

- [ ] **Step 2: Validate JSON + key-tree parity**

Run: `for f in en vi ko zh-Hans ru; do node -e "JSON.parse(require('fs').readFileSync('messages/$f.json','utf8'))" && echo "$f ok"; done && npx vitest run lib/content/i18n-integrity.test.ts`
Expected: all `ok`; i18n-integrity passes (key trees identical).

- [ ] **Step 3: Commit**

```bash
git add messages/
git commit -m "feat: nav.menu message key for the mobile hamburger (5 locales)"
```

---

### Task 2: LanguageMenu — flag + 2-letter codes, full names as aria-labels

**Files:** Modify `components/LanguageMenu.tsx`

- [ ] **Step 1: Change the `SHORT` map (zh → ZH) and the dropdown item rendering**

Replace the `SHORT` constant line:
```tsx
  const SHORT: Record<Locale, string> = { en: 'EN', vi: 'VI', ko: 'KO', 'zh-Hans': 'ZH', ru: 'RU' };
```

Replace the dropdown item `<button>` block (the `routing.locales.map(...)` body) so the visible text is the code and the full name is the aria-label:
```tsx
              <button
                key={loc}
                type="button"
                role="menuitem"
                onClick={() => switchTo(loc)}
                aria-label={NAMES[loc]}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-elevated ${
                  loc === active ? 'font-semibold text-text-accent' : 'text-text-primary'
                }`}
              >
                <Flag className={flagClass} title={NAMES[loc]} />
                {SHORT[loc]}
              </button>
```

(The `NAMES` map stays — now used only for `title`/`aria-label`. The trigger button is unchanged: flag + `SHORT[active]` + ▾.)

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/LanguageMenu.tsx
git commit -m "feat: language switcher shows flag + 2-letter code (full names as aria-labels)"
```

---

### Task 3: MobileNav component (hamburger panel)

**Files:** Create `components/MobileNav.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/MobileNav.tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Menu, X } from 'lucide-react';
import GB from 'country-flag-icons/react/3x2/GB';
import VN from 'country-flag-icons/react/3x2/VN';
import KR from 'country-flag-icons/react/3x2/KR';
import CN from 'country-flag-icons/react/3x2/CN';
import RU from 'country-flag-icons/react/3x2/RU';

type Item = { slug: string; name: string; comingSoon: boolean };

const NAMES: Record<Locale, string> = {
  en: 'English', vi: 'Tiếng Việt', ko: '한국어', 'zh-Hans': '中文', ru: 'Русский',
};
const FLAGS: Record<Locale, typeof GB> = { en: GB, vi: VN, ko: KR, 'zh-Hans': CN, ru: RU };
const SHORT: Record<Locale, string> = { en: 'EN', vi: 'VI', ko: 'KO', 'zh-Hans': 'ZH', ru: 'RU' };

export default function MobileNav({ items, motorbikeUrl }: { items: Item[]; motorbikeUrl: string }) {
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
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  function switchTo(locale: Locale) {
    setOpen(false);
    startTransition(() => router.replace(pathname, { locale }));
  }

  const flagClass = 'h-4 w-6 shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10';

  return (
    <div className="relative md:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={t('nav.menu')}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-text-primary hover:bg-surface-elevated"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
      </button>
      {open && (
        <nav id="mobile-nav-panel" aria-label={t('nav.menu')} style={{ transformOrigin: 'top right' }} className="menu-in absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-text-muted">{t('nav.buildings')}</p>
          {items.map((b) => (
            <Link
              key={b.slug}
              href={`/buildings/${b.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 text-sm text-text-primary hover:bg-surface-elevated"
            >
              {b.name}
              {b.comingSoon && <span className="text-xs italic text-text-muted">{t('nav.comingSoon')}</span>}
            </Link>
          ))}
          <a
            href={motorbikeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--color-border-subtle)] px-4 py-3 text-sm text-text-primary hover:bg-surface-elevated"
          >
            {t('nav.scooterRental')}
          </a>
          <div className="border-t border-[var(--color-border-subtle)] px-4 py-3">
            <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{t('nav.selectLanguage')}</p>
            <div className="flex flex-wrap gap-2">
              {routing.locales.map((loc) => {
                const Flag = FLAGS[loc];
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => switchTo(loc)}
                    disabled={isPending}
                    aria-label={NAMES[loc]}
                    className={`flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
                      loc === active
                        ? 'border-[var(--color-border-strong)] font-semibold text-text-accent'
                        : 'border-[var(--color-border-default)] text-text-primary'
                    } hover:bg-surface-elevated`}
                  >
                    <Flag className={flagClass} title={NAMES[loc]} />
                    {SHORT[loc]}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/MobileNav.tsx
git commit -m "feat: MobileNav hamburger panel (buildings, scooter, language)"
```

---

### Task 4: Navbar — breakpoint split

**Files:** Modify `components/Navbar.tsx`

- [ ] **Step 1: Replace the component**

```tsx
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import BuildingsMenu from './BuildingsMenu';
import LanguageMenu from './LanguageMenu';
import BookNowMenu from './BookNowMenu';
import MobileNav from './MobileNav';
import { contacts, buildingNav } from '@/lib/content/site';

export default async function Navbar() {
  const t = await getTranslations();
  const generic = t('inquiry.generic');
  const items = buildingNav();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-default)] bg-navbar-forest/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/logo.png" alt="Vĩnh House logo" width={40} height={40} className="rounded" />
          <span className="leading-tight">
            <span className="block font-heading text-xl text-text-accent">{t('brand.name')}</span>
            <span className="hidden text-[11px] text-text-muted md:block">{t('brand.subtitle')}</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <BuildingsMenu items={items} />
            <a href={contacts.motorbikeUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated">
              {t('nav.scooterRental')}
            </a>
            <LanguageMenu />
          </div>
          <BookNowMenu contacts={contacts} message={generic} />
          <MobileNav items={items} motorbikeUrl={contacts.motorbikeUrl} />
        </div>
      </nav>
    </header>
  );
}
```

> Notes: the subtitle is `hidden md:block` (aligned with the breakpoint where the inline nav appears, so it's hidden whenever the hamburger is shown — cleaner than `sm`). Scooter Rental moves into the `hidden md:flex` desktop group (it's in the hamburger for mobile). `BookNowMenu` is rendered once, always visible. `MobileNav` carries its own `md:hidden`.

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/Navbar.tsx
git commit -m "feat: breakpoint-aware navbar (desktop inline / mobile hamburger)"
```

---

### Task 5: Verification (build + mobile QA)

**Files:** none.

- [ ] **Step 1: Tests + typecheck + lint + build**

```bash
npx vitest run 2>&1 | grep -E "Test Files|Tests "
npx tsc --noEmit && npm run lint
rm -rf .next && env -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_ANON_KEY -u SUPABASE_SERVICE_ROLE_KEY npm run build
```
Expected: tests pass, tsc/lint clean, build succeeds.

- [ ] **Step 2: Mobile render check** (`npm run dev`, then iPhone-14 emulation)

```bash
agent-browser set device "iPhone 14"
agent-browser open http://localhost:3000/
agent-browser wait --load networkidle
agent-browser screenshot /tmp/m-landing.png    # navbar: logo + Book now + ☰, no overlap
# open the hamburger and screenshot the panel
agent-browser find role button click --name "Menu"
agent-browser wait 400
agent-browser screenshot /tmp/m-panel.png       # buildings + scooter + EN/VI/KO/ZH/RU language pills
```
Verify on `/`, `/buildings/gilda-hotel`, `/buildings/gilda-hotel/1-bedroom`, and a non-EN locale (`/vi`):
- Navbar shows logo + Book now + ☰; **no overlap**, no wrap of the wordmark.
- Hamburger opens a panel with building links, Scooter Rental, and flag + `EN/VI/KO/ZH/RU` language buttons; tapping a language switches locale and closes the panel; tapping a building navigates and closes.
- Desktop (`md+`) navbar unchanged.

- [ ] **Step 3: Horizontal-overflow check** (no sideways scroll at 360/390px)

```bash
agent-browser set viewport 360 740
agent-browser open http://localhost:3000/buildings/gilda-hotel/1-bedroom
agent-browser wait --load networkidle
agent-browser get text "body" >/dev/null   # ensure it loads
# JS check: document scrollWidth must not exceed innerWidth
agent-browser eval "Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth"
```
Expected: the value is `0` (or ≤ a couple px) — no horizontal overflow. If it reports a positive number, find the overflowing element and constrain it (e.g. `min-w-0`/`overflow-hidden`), then re-check.

> If `agent-browser eval` is unavailable, instead scroll right (`agent-browser scroll right 200`) and confirm the screenshot doesn't shift horizontally.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: mobile navbar verification fixes" || echo "nothing to fix"
```

---

## Self-review checklist (planner)

- [ ] Spec coverage: hamburger below md (Task 4 `md:hidden`/`hidden md:flex` + Task 3), logo+BookNow always visible (Task 4), panel = buildings+scooter+language (Task 3), subtitle hidden on mobile (Task 4 `hidden md:block`), language flag + EN/VI/KO/ZH/RU codes (Tasks 2 + 3), full names as aria-labels only (Tasks 2 + 3), `nav.menu` key (Task 1), 44px hamburger (Task 3 `h-11 w-11`), no-overflow check (Task 5 Step 3).
- [ ] No placeholders: all code + translations are concrete.
- [ ] Type consistency: `Item = { slug; name; comingSoon }` (matches `buildingNav()` and `BuildingsMenu`); `MobileNav({ items, motorbikeUrl })`; `SHORT`/`NAMES`/`FLAGS` keyed by `Locale`.

## Acceptance criteria

- `< md`: navbar = logo + Book now + ☰, no overlap / no horizontal scroll; panel opens with buildings, scooter, language; Book now always tappable.
- `md+`: navbar visually unchanged.
- Language switcher (desktop + mobile) shows flag + `EN/VI/KO/ZH/RU`; full names present as aria-labels.
- ~44px tap target on the hamburger; no layout shift on open (panel is absolutely positioned).
- `tsc`/`lint`/`build` green; all 5 locales OK on mobile + desktop.

## Follow-ups

- None required. (Optional later: focus-trap the open panel for full keyboard users.)
