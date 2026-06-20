# CTA Pills + Contact Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle primary CTAs to tmh-house "pill" buttons (coastal colors), add a global Contact section (WhatsApp · Zalo · Call) that "Book now" scrolls to, give the Hero a direct WhatsApp pill, and add footer contact icons + Zalo.

**Architecture:** A shared `.cta-pill` CSS recipe + per-button Tailwind colors. A new `ContactSection` (server) renders in the locale layout before the footer (`#contact`); "Book now" becomes a `BookNowButton` anchor to `#contact` (the `BookNowMenu` dropdown is deleted). New inline `ZaloIcon`/`FacebookIcon`; a pure `zaloUrl` helper. Fully localized, no new runtime deps.

**Tech Stack:** Next.js 16, next-intl 4, React 19, Tailwind v4, lucide-react, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-20-cta-buttons-contact-section-design.md`

**Testing:** Pure logic (`zaloUrl`) is TDD'd; components/pages verified by `tsc`/`lint`/`build` + screenshots.

---

### Task 1: `zaloUrl` helper (TDD)

**Files:** Modify `lib/contacts.ts`, `lib/contacts.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `lib/contacts.test.ts`:
```ts
import { zaloUrl } from './contacts';

describe('zaloUrl', () => {
  it('builds a zalo.me link from digits (strips +/spaces)', () => {
    expect(zaloUrl('+84 92 442 22 99')).toBe('https://zalo.me/84924422299');
  });
  it('returns null for empty/nullish', () => {
    expect(zaloUrl('')).toBeNull();
    expect(zaloUrl(null)).toBeNull();
    expect(zaloUrl('   ')).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/contacts.test.ts`
Expected: FAIL — `zaloUrl` not exported.

- [ ] **Step 3: Implement** — append to `lib/contacts.ts`:
```ts
/** Builds a zalo.me link from a phone number (digits only, leading + stripped). */
export function zaloUrl(number: string | null | undefined): string | null {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, '');
  return digits ? `https://zalo.me/${digits}` : null;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/contacts.test.ts`
Expected: PASS (all existing + new).

- [ ] **Step 5: Commit**

```bash
git add lib/contacts.ts lib/contacts.test.ts
git commit -m "feat: zaloUrl helper"
```

---

### Task 2: Zalo + Facebook icons

**Files:** Create `components/icons/ZaloIcon.tsx`, `components/icons/FacebookIcon.tsx`

- [ ] **Step 1: `ZaloIcon.tsx`** (simplified monochrome chat-bubble mark — swap for the official Zalo asset later)

```tsx
// components/icons/ZaloIcon.tsx
export default function ZaloIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2.6c-5.3 0-9.6 3.55-9.6 7.93 0 2.5 1.4 4.74 3.6 6.17-.12.92-.5 2.05-1.2 2.96-.28.36.03.86.47.74 1.83-.47 3.18-1.07 4.05-1.55.86.22 1.76.34 2.68.34 5.3 0 9.6-3.55 9.6-7.93S17.3 2.6 12 2.6zm-3.4 9.9H6.45c-.3 0-.5-.24-.5-.52 0-.12.04-.24.12-.34l2.05-2.62H6.6a.5.5 0 0 1 0-1h2.65c.3 0 .5.24.5.52 0 .12-.04.24-.12.34L7.58 11.5h1.02a.5.5 0 0 1 0 1zm2.1-.02a.5.5 0 0 1-1 0V9.02a.5.5 0 0 1 1 0v3.46zm5.9.02a.5.5 0 0 1-.46-.3.5.5 0 0 1-.78.18l-.02-.02a1.6 1.6 0 0 1-1-.35 1.74 1.74 0 0 1 0-2.66 1.6 1.6 0 0 1 1.78-.17.5.5 0 0 1 .96.2v2.82a.5.5 0 0 1-.48.3zm-1.46-2.2a.74.74 0 0 0 0 1.48.74.74 0 0 0 0-1.48z"/>
    </svg>
  );
}
```

- [ ] **Step 2: `FacebookIcon.tsx`** (the standard Facebook "f")

```tsx
// components/icons/FacebookIcon.tsx
export default function FacebookIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
npx tsc --noEmit
git add components/icons/ZaloIcon.tsx components/icons/FacebookIcon.tsx
git commit -m "feat: inline Zalo + Facebook icons"
```

---

### Task 3: `.cta-pill` button recipe

**Files:** Modify `app/globals.css`

- [ ] **Step 1: Append the recipe** at the end of the file

```css

/* ============================================================================
   CTA PILL (tmh-house-inspired) — color supplied via Tailwind classes
   ============================================================================ */
.cta-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.cta-pill:hover {
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) {
  .cta-pill:hover { transform: none; }
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add app/globals.css
git commit -m "feat: .cta-pill button recipe"
```

---

### Task 4: Message keys (contact + booking, 5 locales)

**Files:** Modify `messages/en.json`, `messages/vi.json`, `messages/ko.json`, `messages/zh-Hans.json`, `messages/ru.json`

- [ ] **Step 1: Extend `booking` and add a `contact` namespace in each file**

For each file: add `"zalo"` and `"call"` to the existing `booking` object, and add a new `contact` object. Values per locale:

`en.json`:
```json
  "booking": { "whatsapp": "WhatsApp", "phone": "Phone", "facebook": "Facebook", "email": "Email", "zalo": "Zalo", "call": "Call" },
```
add:
```json
  "contact": {
    "eyebrow": "Get in touch",
    "heading": "Ready to book your stay in Da Nang?",
    "subtitle": "Message or call us directly — we reply fast."
  },
```

`vi.json` — booking adds `"zalo": "Zalo", "call": "Gọi điện"`; contact:
```json
  "contact": { "eyebrow": "Liên hệ", "heading": "Sẵn sàng đặt phòng tại Đà Nẵng?", "subtitle": "Nhắn tin hoặc gọi trực tiếp cho chúng tôi — chúng tôi phản hồi nhanh." },
```

`ko.json` — booking adds `"zalo": "Zalo", "call": "전화"`; contact:
```json
  "contact": { "eyebrow": "문의하기", "heading": "다낭에서 숙소를 예약할 준비가 되셨나요?", "subtitle": "메시지를 보내거나 직접 전화 주세요 — 빠르게 답변드립니다." },
```

`zh-Hans.json` — booking adds `"zalo": "Zalo", "call": "致电"`; contact:
```json
  "contact": { "eyebrow": "联系我们", "heading": "准备好在岘港预订您的住宿了吗？", "subtitle": "直接给我们发消息或致电——我们回复很快。" },
```

`ru.json` — booking adds `"zalo": "Zalo", "call": "Позвонить"`; contact:
```json
  "contact": { "eyebrow": "Связаться с нами", "heading": "Готовы забронировать жильё в Дананге?", "subtitle": "Напишите или позвоните нам напрямую — мы быстро отвечаем." },
```

- [ ] **Step 2: Validate JSON + key-tree parity**

Run: `for f in en vi ko zh-Hans ru; do node -e "JSON.parse(require('fs').readFileSync('messages/$f.json','utf8'))" && echo "$f ok"; done && npx vitest run lib/content/i18n-integrity.test.ts`
Expected: all `ok`; i18n-integrity passes.

- [ ] **Step 3: Commit**

```bash
git add messages/
git commit -m "feat: contact + booking message keys (5 locales)"
```

---

### Task 5: `BookNowButton` (scroll-to-contact pill)

**Files:** Create `components/BookNowButton.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/BookNowButton.tsx
import { getTranslations } from 'next-intl/server';

export default async function BookNowButton({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations();
  const size = compact ? 'px-5 py-2 text-xs tracking-[0.1em]' : '';
  return (
    <a
      href="#contact"
      className={`cta-pill bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg ${size}`}
    >
      {t('nav.bookNow')}
    </a>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/BookNowButton.tsx
git commit -m "feat: BookNowButton (pill, scrolls to #contact)"
```

---

### Task 6: `ContactSection`

**Files:** Create `components/ContactSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ContactSection.tsx
import { getTranslations } from 'next-intl/server';
import { Phone } from 'lucide-react';
import Container from './Container';
import Reveal from './Reveal';
import WhatsAppIcon from './icons/WhatsAppIcon';
import ZaloIcon from './icons/ZaloIcon';
import { contacts } from '@/lib/content/site';
import { whatsappUrl, telUrl, zaloUrl } from '@/lib/contacts';
import { inquiryMessage } from '@/lib/content/inquiry';

export default async function ContactSection() {
  const t = await getTranslations();
  const wa = whatsappUrl(contacts.whatsapp, inquiryMessage({}));
  const zalo = zaloUrl(contacts.whatsapp);
  const tel = telUrl(contacts.phone);
  return (
    <section id="contact" className="scroll-mt-20 py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-gradient-to-br from-[#FFF4DF] via-[var(--color-surface-secondary)] to-[#FBE6C4] px-6 py-14 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">{t('contact.eyebrow')}</p>
            <h2 className="max-w-2xl font-heading text-4xl text-[var(--color-primary-dark)]">{t('contact.heading')}</h2>
            <p className="max-w-xl text-text-secondary">{t('contact.subtitle')}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="cta-pill bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg">
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                  {t('booking.whatsapp')}
                </a>
              )}
              {zalo && (
                <a href={zalo} target="_blank" rel="noopener noreferrer" className="cta-pill bg-[var(--color-primary)] text-white shadow-md shadow-black/10 hover:bg-[var(--color-primary-dark)]">
                  <ZaloIcon className="h-[18px] w-[18px]" />
                  {t('booking.zalo')}
                </a>
              )}
              {tel && (
                <a href={tel} className="cta-pill bg-accent-gold text-[var(--color-text-primary)] shadow-md shadow-black/10 hover:brightness-105">
                  <Phone className="h-[18px] w-[18px]" aria-hidden />
                  {t('booking.call')}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/ContactSection.tsx
git commit -m "feat: global Contact section (WhatsApp / Zalo / Call pills)"
```

---

### Task 7: Hero — direct WhatsApp pill

**Files:** Modify `components/Hero.tsx`

- [ ] **Step 1: Replace `BookNowMenu` with a WhatsApp pill**

```tsx
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { contacts } from '@/lib/content/site';
import { whatsappUrl } from '@/lib/contacts';
import { inquiryMessage } from '@/lib/content/inquiry';

export default async function Hero() {
  const t = await getTranslations();
  const wa = whatsappUrl(contacts.whatsapp, inquiryMessage({}));
  return (
    <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden sm:min-h-[70vh]">
      <Image src="/hero.jpg" alt="Da Nang skyline" fill priority sizes="100vw" className="hero-kenburns object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,118,110,0.55)] via-[rgba(15,118,110,0.30)] to-[rgba(255,248,237,0.25)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h1 className="hero-rise font-heading text-5xl font-semibold text-white drop-shadow-sm sm:text-7xl" style={{ animationDelay: '0.05s' }}>{t('brand.name')}</h1>
        <p className="hero-rise mt-4 text-xl text-white/95 sm:text-2xl" style={{ animationDelay: '0.15s' }}>{t('hero.headline')}</p>
        <p className="hero-rise mt-3 text-base text-white/85" style={{ animationDelay: '0.25s' }}>{t('hero.tagline')}</p>
        <div className="hero-rise mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '0.35s' }}>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="cta-pill bg-cta text-text-inverse shadow-lg shadow-black/20 hover:bg-cta-hover">
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              {t('booking.whatsapp')}
            </a>
          )}
          <a href="#buildings" className="rounded-lg border border-white/80 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15">
            {t('hero.viewApartments')}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/Hero.tsx
git commit -m "feat: Hero direct WhatsApp pill (replaces Book-now dropdown)"
```

---

### Task 8: ScooterBand — pill button

**Files:** Modify `components/ScooterBand.tsx`

- [ ] **Step 1: Swap the button class to `.cta-pill`**

Replace the `<a ...>` button className:
```tsx
            className="cta-pill shrink-0 bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg">
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/ScooterBand.tsx
git commit -m "feat: scooter band CTA as pill"
```

---

### Task 9: Footer — contact icons + Zalo

**Files:** Modify `components/Footer.tsx`

- [ ] **Step 1: Add icons to every link + a Zalo link**

Replace the imports and the `link` constant + `<nav>` block:
```tsx
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Mail, Phone } from 'lucide-react';
import { contacts } from '@/lib/content/site';
import { whatsappUrl, telUrl, mailtoUrl, zaloUrl } from '@/lib/contacts';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import ZaloIcon from '@/components/icons/ZaloIcon';
import FacebookIcon from '@/components/icons/FacebookIcon';

export default async function Footer() {
  const t = await getTranslations();
  const wa = whatsappUrl(contacts.whatsapp);
  const zalo = zaloUrl(contacts.whatsapp);
  const tel = telUrl(contacts.phone);
  const mail = mailtoUrl(contacts.email);
  const link = 'inline-flex items-center gap-2 text-sm text-[#FFF8ED]/80 underline-offset-4 transition hover:text-[var(--color-accent-gold)] hover:underline';
```
and the `<nav>`:
```tsx
        <nav className="flex flex-col gap-2">
          {mail && <a className={link} href={mail}><Mail className="h-4 w-4" aria-hidden />{contacts.email}</a>}
          {tel && <a className={link} href={tel}><Phone className="h-4 w-4" aria-hidden />{contacts.phone}</a>}
          {wa && <a className={link} href={wa} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-4 w-4" />{t('booking.whatsapp')}</a>}
          {zalo && <a className={link} href={zalo} target="_blank" rel="noopener noreferrer"><ZaloIcon className="h-4 w-4" />{t('booking.zalo')}</a>}
          {contacts.facebook && <a className={link} href={contacts.facebook} target="_blank" rel="noopener noreferrer"><FacebookIcon className="h-4 w-4" />{t('booking.facebook')}</a>}
        </nav>
```
(Leave the surrounding `<>`, wave divider, logo block, and `<footer>`/`<div>` wrappers unchanged.)

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/Footer.tsx
git commit -m "feat: footer contact icons + Zalo link"
```

---

### Task 10: Wire Contact section + swap all Book-now usages + delete BookNowMenu (atomic)

**Files:**
- Modify: `app/(public)/[locale]/layout.tsx`, `components/Navbar.tsx`, `app/(public)/[locale]/page.tsx`, `app/(public)/[locale]/buildings/[buildingSlug]/page.tsx`, `app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx`
- Delete: `components/BookNowMenu.tsx`
- Modify: `lib/content/inquiry.ts`, `lib/content/inquiry.test.ts` (drop now-unused `buildInquiryLinks`)

> Do all of these together so the build stays green (deleting `BookNowMenu`/`buildInquiryLinks` requires every consumer gone first).

- [ ] **Step 1: Layout — render `ContactSection` before the footer**

In `app/(public)/[locale]/layout.tsx`, add the import `import ContactSection from '@/components/ContactSection';` and change:
```tsx
        <main>{children}</main>
        <ContactSection />
        <Footer />
```

- [ ] **Step 2: Navbar — `BookNowButton compact`**

In `components/Navbar.tsx`: replace `import BookNowMenu from './BookNowMenu';` with `import BookNowButton from './BookNowButton';`, remove the now-unused `const generic = t('inquiry.generic');` line, and replace `<BookNowMenu contacts={contacts} message={generic} />` with `<BookNowButton compact />`.

- [ ] **Step 3: Landing page — remove the closing CTA section**

Replace `app/(public)/[locale]/page.tsx` entirely with:
```tsx
import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import BuildingShowcase from '@/components/BuildingShowcase';
import ScooterBand from '@/components/ScooterBand';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <ValueProps />
      <BuildingShowcase />
      <ScooterBand />
    </>
  );
}
```

- [ ] **Step 4: Building page — both Book-now usages → `BookNowButton`**

In `app/(public)/[locale]/buildings/[buildingSlug]/page.tsx`: replace `import BookNowMenu from '@/components/BookNowMenu';` with `import BookNowButton from '@/components/BookNowButton';`. Replace both `<BookNowMenu contacts={contacts} message={t('inquiry.building', { building: b.name })} />` occurrences with `<BookNowButton />`. Then remove the now-unused `import { contacts } from '@/lib/content/site';` line (verify with grep that `contacts` is otherwise unused in this file; if used elsewhere, keep it).

- [ ] **Step 5: Room page — Book-now → `BookNowButton`**

In `app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx`: replace `import BookNowMenu from '@/components/BookNowMenu';` with `import BookNowButton from '@/components/BookNowButton';`, and replace `<div className="mt-8"><BookNowMenu contacts={contacts} message={message} /></div>` with `<div className="mt-8"><BookNowButton /></div>`. **Keep** the `contacts` and `message` — they're still used by `LocationSection`.

- [ ] **Step 6: Delete `BookNowMenu` and the orphaned `buildInquiryLinks`**

```bash
git rm components/BookNowMenu.tsx
```
In `lib/content/inquiry.ts`, remove the `buildInquiryLinks` function and its `InquiryLinkSet` type and the now-unused imports (`whatsappUrl, telUrl, mailtoUrl` from `@/lib/contacts`). **Keep** `inquiryMessage` and `InquiryContext`. In `lib/content/inquiry.test.ts`, remove the `describe('buildInquiryLinks', …)` block and the `buildInquiryLinks` import; **keep** the `inquiryMessage` tests.

- [ ] **Step 7: Verify no orphan references, then full check**

```bash
grep -rn "BookNowMenu\|buildInquiryLinks" app components lib && echo "STILL REFERENCED — fix" || echo "clean ✓"
npx tsc --noEmit && npm run lint && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```
Expected: `clean ✓`; tsc/lint clean; tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Book now scrolls to global Contact section; remove BookNowMenu + buildInquiryLinks"
```

---

### Task 11: Verification (build + screenshots)

**Files:** none.

- [ ] **Step 1: Build (no Supabase env)**

```bash
rm -rf .next && env -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_ANON_KEY -u SUPABASE_SERVICE_ROLE_KEY npm run build
```
Expected: succeeds.

- [ ] **Step 2: Manual (`npm run dev`)**

Verify on `/` and `/buildings/gilda-hotel/1-bedroom` (and `/vi`):
- Hero shows a coral WhatsApp pill (uppercase, icon, hover-lift) + View apartments; no Book-now dropdown anywhere.
- Navbar "Book now" is a compact pill; clicking it smooth-scrolls to the Contact section (heading not hidden under the sticky navbar).
- Contact section renders before the footer with WhatsApp (coral) / Zalo (teal) / Call (gold) pills, each with its icon; all three use the same number.
- Footer shows icons for Email / Phone / WhatsApp / Zalo / Facebook.
- Scooter band button is a coral pill.
- Localized across `/vi /ko /zh /ru` (eyebrow, heading, "Call" → translated; "Zalo"/"WhatsApp" stay).

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "fix: CTA/contact verification fixes" || echo "nothing to fix"
```

---

## Self-review checklist (planner)

- [ ] Spec coverage: `.cta-pill` (T3), Hero WhatsApp (T7), Book now→#contact (T5+T10), ContactSection global w/ WhatsApp/Zalo/Call same number (T6+T10), footer icons+Zalo (T9), `zaloUrl` (T1), icons (T2), messages 5 locales (T4), BookNowMenu deleted (T10), per-channel colors coral/teal/gold (T6), secondary buttons unchanged (untouched).
- [ ] No placeholders: all code/translations concrete (Zalo icon flagged as simplified, not a gap).
- [ ] Type consistency: `whatsappUrl/telUrl/zaloUrl/mailtoUrl` signatures; `inquiryMessage({})`; `BookNowButton({ compact })`; icon `{ className }` props; `contacts.whatsapp/phone/email/facebook`.

## Acceptance criteria

- Primary CTAs are coastal pills; secondary buttons unchanged; Hero has a coral WhatsApp pill.
- "Book now" scrolls to the global Contact section (present before the footer on every page) with WhatsApp/Zalo/Call pills (same number, icons).
- Footer shows Email/Phone/WhatsApp/Zalo/Facebook with icons.
- `npm test` (incl. `zaloUrl`), `tsc`, `lint` green; build succeeds with no Supabase env; localized in all 5 locales.

## Follow-ups

- Replace the simplified `ZaloIcon` with the official Zalo brand asset.
- Confirm the real number + that a Zalo account exists for it.
- Native-speaker review of the new copy.
