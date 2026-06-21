# Landing-Page Polish — Design

**Date:** 2026-06-20
**Status:** Approved (brainstorm) — pending implementation plan
**Builds on:** the CTA-pills + Contact-section work (PR #8 / `feat/cta-contact`). Recommend merging #8 first, then a fresh `feat/landing-polish` branch off `main`.

## Goal

Make the landing page more conversion-focused and premium: a direct hero **Book now** CTA, a tighter hero, a stronger navbar (without crowding mobile), more premium building cards, stronger contact copy, a re-centered scooter band, and accessibility polish (focus states, scroll offsets, contrast).

## Decisions (from brainstorm)

| Area | Decision |
| --- | --- |
| Hero CTA | Primary **Book now** coral pill → `#contact`; secondary **View apartments** outline → `#buildings` |
| Hero height | Tighter: `min-h-[500px] sm:min-h-[560px]` (was `min-h-[62vh] sm:min-h-[70vh]`) |
| Anchor offset | `scroll-mt-24` on `#buildings` and `#contact` (taller sticky nav must not hide headings) |
| Navbar | Bigger wordmark / logo / Book now / spacing — **applied at `sm`/`md`+ only**; mobile unchanged (logo + wordmark \| Book now \| hamburger, no subtitle) |
| Building cards | Intro sentence + bigger text + button-like "View rooms" + 2-up larger cards |
| Contact copy | "Ready to check availability?" / "Message us directly for rooms, prices, and monthly stays." |
| Scooter band | Centered + stacked (title / body / CTA), centered on desktop too |
| Polish | Darker ValueProps copy; visible focus rings on pills + building-card links |
| Out of scope | Feature chips (need per-building data + i18n); no data-model changes |

## Changes by file

### `components/Hero.tsx`
- Replace the direct-WhatsApp pill with `<BookNowButton />` (full coral pill → `#contact`). Keep the **View apartments** outline (`href="#buildings"`).
- Drop the now-unused `whatsappUrl` / `inquiryMessage` / `WhatsAppIcon` / `contacts` imports (Hero no longer builds a wa.me link).
- Hero `<section>` height → `min-h-[500px] sm:min-h-[560px]`.
- Keep the existing gradient overlay + `drop-shadow` (text contrast over image).

### `components/Navbar.tsx` (responsive bumps only)
- `<nav>` padding: `py-3` → `py-3 sm:py-4`.
- Logo: keep intrinsic 40px on mobile; render larger on `sm+` via class — `width={44} height={44}` with `className="h-10 w-10 rounded sm:h-11 sm:w-11"`.
- Wordmark: `text-xl` → `text-xl sm:text-2xl`. Subtitle stays `hidden ... md:block`.
- Right cluster gap: `gap-2` → `gap-2 sm:gap-3`.
- Book now: bump the compact pill from `px-5 py-2 text-xs` → `px-5 py-2.5 text-xs` (in `BookNowButton`'s `compact` branch) for a touch more presence while staying mobile-safe.

### `components/BookNowButton.tsx`
- `compact` size string: `px-5 py-2 text-xs tracking-[0.1em]` → `px-5 py-2.5 text-xs tracking-[0.1em]`.

### `components/BuildingShowcase.tsx`
- Add an intro sentence under the heading: `<p>{t('intro')}</p>` (new `buildings.intro`), muted, `max-w-2xl`.
- `#buildings` section: add `scroll-mt-24`.
- Grid: `sm:grid-cols-2 lg:grid-cols-3` → `sm:grid-cols-2` with `mx-auto max-w-5xl` so two buildings fill the row (no 3-col gap).
- Card image height: `h-48` → `h-56` (both the wrapper and `<Image>` class).
- Card text: address `text-sm` → `text-base`; room-count `text-sm` → `text-base`.
- "View rooms": the text span becomes a button-style pill (still inside the single card `<Link>` — a styled `<span>`, NOT a nested anchor): `inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)]/40 px-3 py-1 text-sm font-medium text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white`.
- Card link focus: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2` to the `<Link>`.

### `components/ContactSection.tsx`
- `#contact` section: `scroll-mt-20` → `scroll-mt-24`.
- (Copy itself comes from the message catalogs — see i18n.)

### `components/ScooterBand.tsx`
- Replace the `sm:flex-row sm:justify-between` row with a centered stack: `flex flex-col items-center gap-4 text-center` — title, body, then the CTA pill below (centered on all breakpoints).

### `components/ValueProps.tsx`
- Body copy contrast: `text-text-secondary` → `text-text-primary` (darker, stronger). Titles unchanged.

### `app/globals.css`
- Add a visible keyboard focus ring to the pill recipe (inside the existing `@layer components` block):
  `.cta-pill:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`
  (an offset outline reads clearly on light and colored pill backgrounds and needs no surface-token).

## i18n (5 locales)

**New** `buildings.intro`:
- en: "Boutique apartments and hotel rooms across Da Nang — browse a building to see rooms, prices, and availability."
- vi: "Căn hộ và phòng khách sạn boutique khắp Đà Nẵng — chọn một tòa nhà để xem phòng, giá và tình trạng còn trống."
- ko: "다낭 곳곳의 부티크 아파트와 호텔 객실 — 건물을 선택해 객실, 가격, 빈방을 확인하세요."
- zh-Hans: "遍布岘港的精品公寓和酒店客房——选择一栋楼即可查看房间、价格和空房情况。"
- ru: "Бутик-апартаменты и гостиничные номера по всему Данангу — выберите здание, чтобы посмотреть номера, цены и наличие."

**Updated** `contact.heading`:
- en: "Ready to check availability?" · vi: "Sẵn sàng kiểm tra phòng trống?" · ko: "빈방을 확인할 준비가 되셨나요?" · zh-Hans: "准备好查询空房了吗？" · ru: "Готовы проверить наличие мест?"

**Updated** `contact.subtitle`:
- en: "Message us directly for rooms, prices, and monthly stays." · vi: "Nhắn tin trực tiếp cho chúng tôi để biết phòng, giá và lưu trú theo tháng." · ko: "객실, 가격, 월 단위 숙박은 직접 메시지로 문의하세요." · zh-Hans: "直接联系我们了解房间、价格和长租（按月）。" · ru: "Напишите нам напрямую о номерах, ценах и помесячном проживании."

`i18n-integrity` (key-tree parity) keeps the catalogs in sync.

## Accessibility / verification

- **Anchors** `#buildings` / `#contact` use `scroll-mt-24` so the sticky navbar never overlaps the target heading on scroll.
- **Focus**: `.cta-pill` and building-card links get visible `focus-visible` rings; tab order is native (anchors/buttons).
- **Mobile (must hold)**: at 360px and 390px, the navbar shows `logo + Vĩnh House | Book now | hamburger` with **no subtitle, no overlap, no horizontal scroll** — the size bumps apply only at `sm`/`md`+. Re-verified by screenshot + overflow check.
- Hero text remains legible over the image (gradient + drop-shadow retained).
- `npm test`, `tsc`, `lint` green; build succeeds with no Supabase env; localized in all 5 locales.

## Acceptance criteria

- Hero shows a coral **Book now** pill (→ `#contact`) + **View apartments** outline (→ `#buildings`); hero is `min-h-[500px] sm:min-h-[560px]`.
- Clicking Book now / View apartments scrolls so the target heading sits below the sticky nav (not hidden).
- Navbar is visibly larger on desktop; mobile keeps logo + wordmark | Book now | hamburger with no crowding/overflow at 360–390px.
- Building section has an intro line, 2-up larger cards with bigger text and a button-style "View rooms"; card links are keyboard-focusable with a visible ring.
- Contact section uses the stronger heading/subtitle in all 5 locales.
- Scooter band is centered/stacked (button grouped under the copy).
- ValueProps supporting copy is darker; pills show a visible focus ring.

## Out of scope

- Feature chips on building cards (would need per-building tags + 5-locale strings).
- Any content/data-model changes; per-room Location section unchanged.
