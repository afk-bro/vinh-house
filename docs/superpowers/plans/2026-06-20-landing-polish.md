# Landing-Page Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the landing page more conversion-focused and premium — direct hero Book-now CTA, tighter hero, stronger (mobile-safe) navbar, premium building cards, stronger contact copy, centered scooter band, and accessibility polish.

**Architecture:** Presentational edits to existing server components + two message-catalog changes + one `globals.css` focus rule. No new components, no data-model changes. The navbar size bumps are applied only at `sm`/`md`+ so mobile stays uncrowded.

**Tech Stack:** Next.js 16, next-intl 4, React 19, Tailwind v4, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-20-landing-polish-design.md`

**Testing:** No new pure logic — the only programmatic check is i18n key-tree parity (`i18n-integrity.test.ts`). Presentational results verified by `tsc`/`lint`/`build` + screenshots (incl. mobile 360/390px) in the final task.

---

### Task 1: i18n — building intro + stronger contact copy

**Files:** Modify `messages/en.json`, `messages/vi.json`, `messages/ko.json`, `messages/zh-Hans.json`, `messages/ru.json`

- [ ] **Step 1: In each file, add `buildings.intro` and replace `contact.heading` + `contact.subtitle`** with the per-locale values below.

`en.json` — `buildings` gets `"intro"`, `contact` heading/subtitle replaced:
```json
  "buildings": { "heading": "Our buildings", "intro": "Boutique apartments and hotel rooms across Da Nang — browse a building to see rooms, prices, and availability.", "comingSoonShort": "Details coming soon", "roomType": "room type", "roomTypes": "room types", "viewRooms": "View rooms →" },
```
```json
  "contact": { "eyebrow": "Get in touch", "heading": "Ready to check availability?", "subtitle": "Message us directly for rooms, prices, and monthly stays." },
```

`vi.json`:
- `buildings.intro`: "Căn hộ và phòng khách sạn boutique khắp Đà Nẵng — chọn một tòa nhà để xem phòng, giá và tình trạng còn trống."
- `contact.heading`: "Sẵn sàng kiểm tra phòng trống?"
- `contact.subtitle`: "Nhắn tin trực tiếp cho chúng tôi để biết phòng, giá và lưu trú theo tháng."

`ko.json`:
- `buildings.intro`: "다낭 곳곳의 부티크 아파트와 호텔 객실 — 건물을 선택해 객실, 가격, 빈방을 확인하세요."
- `contact.heading`: "빈방을 확인할 준비가 되셨나요?"
- `contact.subtitle`: "객실, 가격, 월 단위 숙박은 직접 메시지로 문의하세요."

`zh-Hans.json`:
- `buildings.intro`: "遍布岘港的精品公寓和酒店客房——选择一栋楼即可查看房间、价格和空房情况。"
- `contact.heading`: "准备好查询空房了吗？"
- `contact.subtitle`: "直接联系我们了解房间、价格和长租（按月）。"

`ru.json`:
- `buildings.intro`: "Бутик-апартаменты и гостиничные номера по всему Данангу — выберите здание, чтобы посмотреть номера, цены и наличие."
- `contact.heading`: "Готовы проверить наличие мест?"
- `contact.subtitle`: "Напишите нам напрямую о номерах, ценах и помесячном проживании."

- [ ] **Step 2: Validate JSON + key-tree parity**

Run: `for f in en vi ko zh-Hans ru; do node -e "JSON.parse(require('fs').readFileSync('messages/$f.json','utf8'))" && echo "$f ok"; done && npx vitest run lib/content/i18n-integrity.test.ts`
Expected: all `ok`; i18n-integrity passes (the `buildings.intro` key now exists in every locale).

- [ ] **Step 3: Commit**

```bash
git add messages/
git commit -m "feat: building intro + stronger contact copy (5 locales)"
```

---

### Task 2: `.cta-pill` focus ring

**Files:** Modify `app/globals.css`

- [ ] **Step 1: Add a `:focus-visible` rule inside the existing `@layer components` block**, right after the `.cta-pill:hover` rule:
```css
  .cta-pill:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add app/globals.css
git commit -m "feat: visible focus ring on cta pills"
```

---

### Task 3: BookNowButton — stronger compact size

**Files:** Modify `components/BookNowButton.tsx`

- [ ] **Step 1: Bump the compact padding**

Change the `size` line:
```tsx
  const size = compact ? 'px-5 py-2.5 text-xs tracking-[0.1em]' : '';
```

- [ ] **Step 2: Typecheck + commit**

```bash
npx tsc --noEmit
git add components/BookNowButton.tsx
git commit -m "feat: stronger compact Book now pill"
```

---

### Task 4: Hero — Book now primary + tighter height

**Files:** Modify `components/Hero.tsx`

- [ ] **Step 1: Replace the file** with:
```tsx
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import BookNowButton from './BookNowButton';

export default async function Hero() {
  const t = await getTranslations();
  return (
    <section className="relative flex min-h-[500px] items-center justify-center overflow-hidden sm:min-h-[560px]">
      <Image src="/hero.jpg" alt="Da Nang skyline" fill priority sizes="100vw" className="hero-kenburns object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,118,110,0.55)] via-[rgba(15,118,110,0.30)] to-[rgba(255,248,237,0.25)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h1 className="hero-rise font-heading text-5xl font-semibold text-white drop-shadow-sm sm:text-7xl" style={{ animationDelay: '0.05s' }}>{t('brand.name')}</h1>
        <p className="hero-rise mt-4 text-xl text-white/95 sm:text-2xl" style={{ animationDelay: '0.15s' }}>{t('hero.headline')}</p>
        <p className="hero-rise mt-3 text-base text-white/85" style={{ animationDelay: '0.25s' }}>{t('hero.tagline')}</p>
        <div className="hero-rise mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '0.35s' }}>
          <BookNowButton />
          <a href="#buildings" className="rounded-lg border border-white/80 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15">
            {t('hero.viewApartments')}
          </a>
        </div>
      </div>
    </section>
  );
}
```
(Removes the direct-WhatsApp pill and its `whatsappUrl`/`inquiryMessage`/`WhatsAppIcon`/`contacts` imports; the Book-now pill now scrolls to `#contact`.)

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/Hero.tsx
git commit -m "feat: hero Book now primary CTA + tighter height"
```

---

### Task 5: Navbar — responsive size bumps (mobile-safe)

**Files:** Modify `components/Navbar.tsx`

- [ ] **Step 1: Logo + wordmark + padding + spacing — apply bumps at sm/md+ only**

Change the `<nav>` opening tag padding:
```tsx
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
```
Change the logo `<Image>`:
```tsx
          <Image src="/logo.png" alt="Vĩnh House logo" width={44} height={44} className="h-10 w-10 rounded sm:h-11 sm:w-11" />
```
Change the wordmark `<span>`:
```tsx
            <span className="block font-heading text-xl text-text-accent sm:text-2xl">{t('brand.name')}</span>
```
Change the desktop group wrapper (the `hidden ... md:flex` div) gap `gap-2` → `gap-3`:
```tsx
          <div className="hidden items-center gap-3 md:flex">
```
Change the right-cluster wrapper gap `gap-2` → `gap-2 sm:gap-3`:
```tsx
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
```
(The subtitle stays `hidden ... md:block`; `<BookNowButton compact />` and `<MobileNav />` are unchanged here — the compact pill already got its bump in Task 3.)

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/Navbar.tsx
git commit -m "feat: larger navbar at sm/md+ (mobile unchanged)"
```

---

### Task 6: BuildingShowcase — intro, 2-up larger cards, button-style View rooms, focus ring

**Files:** Modify `components/BuildingShowcase.tsx`

- [ ] **Step 1: Replace the file** with:
```tsx
import Image from 'next/image';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Container from './Container';
import Reveal from './Reveal';
import { getBuildings } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export default async function BuildingShowcase() {
  const t = await getTranslations('buildings');
  const locale = (await getLocale()) as Locale;
  const buildings = getBuildings(locale);
  return (
    <section id="buildings" className="scroll-mt-24 py-16">
      <Container>
        <Reveal>
          <h2 className="font-heading text-4xl text-text-accent">{t('heading')}</h2>
          <p className="mt-3 max-w-2xl text-text-secondary">{t('intro')}</p>
        </Reveal>
        <div className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2">
          {buildings.map((b, i) => (
            <Reveal key={b.slug} delay={i * 70}>
              <Link href={`/buildings/${b.slug}`}
                className="group block h-full overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-surface-card shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2">
                {b.cover && (
                  <div className="h-56 w-full overflow-hidden">
                    <Image src={b.cover.src} alt={b.cover.alt} width={480} height={300}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="h-56 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-heading text-2xl text-text-accent">{b.name}</h3>
                  <p className="mt-1 text-base text-text-muted">{b.address}</p>
                  {b.comingSoon ? (
                    <span className="mt-3 inline-block rounded-full bg-[var(--color-surface-secondary)] px-3 py-1 text-xs font-medium text-text-secondary">
                      {t('comingSoonShort')}
                    </span>
                  ) : (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-base text-text-muted">
                        {`${b.resolvedRooms.length} ${b.resolvedRooms.length === 1 ? t('roomType') : t('roomTypes')}`}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)]/40 px-3 py-1 text-sm font-medium text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white">
                        {t('viewRooms')}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/BuildingShowcase.tsx
git commit -m "feat: premium building cards (intro, 2-up, button-style View rooms, focus ring)"
```

---

### Task 7: ContactSection — scroll offset

**Files:** Modify `components/ContactSection.tsx`

- [ ] **Step 1: Bump the scroll offset**

Change line 18 `scroll-mt-20` → `scroll-mt-24`:
```tsx
    <section id="contact" className="scroll-mt-24 py-16">
```

- [ ] **Step 2: Typecheck + commit**

```bash
npx tsc --noEmit
git add components/ContactSection.tsx
git commit -m "feat: contact scroll offset for taller nav"
```

---

### Task 8: ScooterBand — centered + stacked

**Files:** Modify `components/ScooterBand.tsx`

- [ ] **Step 1: Replace the inner `<div>` row** (the `flex flex-col items-start ...` block and its children) with a centered stack:
```tsx
          <div className="flex flex-col items-center gap-5 text-center">
            <div>
              <h3 className="font-heading text-3xl text-[var(--color-primary-dark)]">{t('title')}</h3>
              <p className="mt-1 text-text-secondary">{t('body')}</p>
            </div>
            <a href={contacts.motorbikeUrl} target="_blank" rel="noopener noreferrer"
              className="cta-pill bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg">
              {t('cta')}
            </a>
          </div>
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/ScooterBand.tsx
git commit -m "feat: center + stack scooter band CTA"
```

---

### Task 9: ValueProps — stronger supporting copy

**Files:** Modify `components/ValueProps.tsx`

- [ ] **Step 1: Darken the body copy**

Change the body `<p>` class `text-text-secondary` → `text-text-primary`:
```tsx
              <p className="mt-2 text-text-primary">{t(`${key}.body`)}</p>
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add components/ValueProps.tsx
git commit -m "feat: stronger contrast on value-prop copy"
```

---

### Task 10: Verification (build + desktop + mobile screenshots)

**Files:** none.

- [ ] **Step 1: Full check**

```bash
npx vitest run 2>&1 | grep -E "Test Files|Tests "
npx tsc --noEmit && npm run lint
rm -rf .next && env -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_ANON_KEY -u SUPABASE_SERVICE_ROLE_KEY npm run build
```
Expected: tests pass, tsc/lint clean, build exit 0.

- [ ] **Step 2: Desktop render (`npm start` on a spare port)**

On `/`: hero is shorter with a coral **Book now** pill (→ scrolls to Contact, heading not hidden under nav) + View apartments (→ `#buildings`); navbar visibly larger (wordmark/logo/Book now); building section has the intro line, two larger cards with bigger text + button-style "View rooms"; scooter band centered with the CTA under the copy; contact copy = "Ready to check availability?".

- [ ] **Step 3: Mobile must hold (iPhone-14 / 360 + 390px)**

Emulate iPhone 14 and set viewport 360×740, then 390×844:
- Navbar shows `logo + Vĩnh House | Book now | ☰` with **no subtitle, no overlap**, and `Math.max(documentElement.scrollWidth, body.scrollWidth) - innerWidth === 0` (no horizontal scroll) on `/` and `/buildings/gilda-hotel/1-bedroom`.
- If any crowding appears, reduce the bump (e.g. keep wordmark `text-xl` until `md`) and re-check.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: landing-polish verification fixes" || echo "nothing to fix"
```

---

## Self-review checklist (planner)

- [ ] Spec coverage: hero Book now + tighter height (T4), `scroll-mt-24` on #buildings (T6) & #contact (T7), navbar responsive bumps (T5) + compact pill (T3), building intro/2-up/bigger text/button View rooms/focus ring (T6 + T1 intro), contact copy (T1), scooter centered (T8), ValueProps darker (T9), pill focus ring (T2), mobile re-verify (T10).
- [ ] No placeholders: every edit shows concrete code; translations concrete.
- [ ] Type consistency: `BookNowButton` (default size in Hero, `compact` in Navbar); `buildings.intro` key added in T1 before used in T6; tokens `text-text-primary`/`text-text-secondary`/`--color-primary` confirmed to exist.

## Acceptance criteria

- Hero: coral Book now (→ `#contact`) + View apartments (→ `#buildings`); `min-h-[500px] sm:min-h-[560px]`; scroll targets clear the sticky nav.
- Navbar larger on desktop; mobile keeps logo + wordmark | Book now | hamburger, no crowding/overflow at 360–390px.
- Building section: intro line, 2-up larger cards, bigger text, button-style View rooms, keyboard-focusable card with visible ring.
- Contact uses the stronger heading/subtitle (5 locales); scooter band centered/stacked; ValueProps copy darker; pills show a focus ring.
- `npm test`, `tsc`, `lint` green; build succeeds with no Supabase env.

## Follow-ups (unchanged from prior rounds)

- Replace simplified `ZaloIcon` with the official asset; confirm real contact number + Zalo account; native-speaker review of all non-English copy (now incl. the new building intro + contact copy).
