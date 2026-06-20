# Mobile Navbar + Language Abbreviations — Design

**Date:** 2026-06-20
**Status:** Approved (brainstorm) — pending implementation plan
**Trigger:** Audit showed the navbar overlaps/wraps badly at phone widths (wordmark + 4-line subtitle + "Buildings ▾" collide). Site content is otherwise responsive.

## Goal

Make the navigation render and perform correctly on mobile via a breakpoint-aware navbar (hamburger panel below `md`), and switch the language switcher to flag + two-letter codes. Verify no horizontal scroll, comfortable tap targets, and no layout shift.

## Decisions (from brainstorm)

| Decision | Choice |
| --- | --- |
| Mobile nav pattern | **Hamburger** below `md` (768px); inline nav at `md+` (unchanged) |
| Always visible on mobile | Logo/wordmark + **Book now** CTA + ☰ hamburger |
| In the hamburger panel | Flat **building links**, **Scooter Rental**, compact **language options** |
| Subtitle on mobile | Hidden (`hidden sm:block`) |
| Language labels | **Flag + 2-letter code** (EN · VI · KO · ZH · RU); full native names used for **aria-labels only** |
| QA bar | No horizontal scroll at common widths; ~44px tap targets; no layout shift/regression |

## Architecture

### `components/Navbar.tsx` (server) — breakpoint split
- Left: logo image + "Vĩnh House" wordmark (always); subtitle becomes `hidden sm:block`.
- Right cluster (`ml-auto`):
  - **Desktop group** (`hidden md:flex`): `BuildingsMenu`, Scooter Rental link, `LanguageMenu`.
  - **`BookNowMenu`** — rendered once, **always visible** (mobile + desktop).
  - **`MobileNav`** (`md:hidden`): the hamburger + panel.
- Passes `buildingNav()` items and `contacts.motorbikeUrl` to `MobileNav`.

### `components/MobileNav.tsx` (client, new)
- A ☰ button: `aria-label={t('nav.menu')}` (a **new** `nav.menu` message key added to all 5 catalogs — "Menu" / "Trình đơn" / "메뉴" / "菜单" / "Меню"), `aria-haspopup="menu"`, `aria-expanded`, min 44×44px tap target.
- Opens a panel (absolute, full-width or right-aligned card) containing, in order:
  1. **Buildings** — a small heading (`nav.buildings`) + flat list of next-intl `Link`s to each building (`{slug, name}`), coming-soon ones tagged with `nav.comingSoon`.
  2. **Scooter Rental** — external link to `motorbikeUrl` (`nav.scooterRental`), new tab.
  3. **Language** — a row of flag + 2-letter code buttons; each `aria-label` = full native name; selecting switches locale via `@/i18n/navigation` `useRouter().replace(pathname, { locale })`.
- Behaviors: closes on outside click, `Escape`, and on any link/locale selection. Uses `useTranslations` for labels and `useLocale` for the active language.

### `components/LanguageMenu.tsx` (desktop) — abbreviations
- `SHORT` map → `{ en:'EN', vi:'VI', ko:'KO', 'zh-Hans':'ZH', ru:'RU' }` (zh changes `中` → `ZH`).
- Dropdown items: **flag + SHORT code** as visible text; `aria-label={NAMES[loc]}` (full native name) on each option button for screen readers.
- Trigger: unchanged (flag + active SHORT + ▾), `aria-label` = `nav.selectLanguage`.

> `NAMES` (full native names) is retained **only** for aria-labels in both `LanguageMenu` and `MobileNav`.

## Accessibility

- Full native language names (`English`, `Tiếng Việt`, `한국어`, `中文`, `Русский`) appear in `aria-label`s so screen-reader users hear the language, while sighted users see compact codes.
- Hamburger button: proper `aria-expanded`/`aria-haspopup`, ≥44×44px.
- Menu/language option buttons: ≥44px tall tap targets on mobile; `type="button"`.

## Performance / overflow (verification, mostly already in place)

- **No horizontal scroll** at 360px and 390px — verified at phone viewport after the navbar fix (the overlap was the cause).
- No layout shift: navbar height stable; the panel is absolutely positioned (doesn't push content).
- Existing perf posture unchanged: `next/image` with `sizes`, hero `priority`, map iframe `loading="lazy"`, reveals respect `prefers-reduced-motion`. No new dependencies.

## Testing

Presentational/responsive change — verified by phone-viewport screenshots (iPhone-14 emulation), `npx tsc --noEmit`, `npm run lint`, `npm run build` (no Supabase env), and a horizontal-overflow check. No component unit tests (matches the repo's pattern of testing only pure `lib/` logic). Works across all 5 locales.

## Acceptance criteria

- At `< md`, the navbar shows logo + Book now + ☰ with **no overlap and no horizontal scroll**; the panel opens with building links, Scooter Rental, and language options; Book now is always tappable.
- At `md+`, the navbar is visually unchanged from today.
- Language switcher (desktop dropdown + mobile panel) shows flag + `EN/VI/KO/ZH/RU`; full names are present as `aria-label`s.
- Tap targets ≥ ~44px on the hamburger and menu items; no layout shift on open.
- `tsc`, `lint`, `build` green; all 5 locales render correctly on mobile and desktop.

## Out of scope

- No broader redesign; desktop navbar layout is unchanged.
- No changes to page content/sections (already responsive).
