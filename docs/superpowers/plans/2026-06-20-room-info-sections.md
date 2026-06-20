# Room Info Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Amenities, Location (keyless embedded map + buttons), Around the Apartment, and a FAQ accordion beneath the room gallery, fully localized, plus a WhatsApp icon on every WhatsApp action site-wide.

**Architecture:** New content lives in the existing content layer — a global amenities catalog and FAQ list (`Localized<string>`), per-building `landmarks` + optional map-URL overrides on `BuildingMeta`, all resolved per-locale by `resolveBuilding`/`getFaq`. Section chrome lives in next-intl message catalogs. Four server components render under `RoomGallery`; FAQ uses native `<details>`. Pure helpers (map URLs, resolvers) are TDD'd; presentational components verified by build/render.

**Tech Stack:** Next.js 16, next-intl 4, React 19, TypeScript, Tailwind v4, Vitest. No new runtime dependencies (WhatsApp icon is inline SVG).

**Spec:** `docs/superpowers/specs/2026-06-20-room-info-sections-design.md`

**Path alias:** `@/*` → repo root. Testing: pure logic = Vitest TDD; components/pages = `tsc`/`lint`/`build`/manual.

---

## Phase A — Content & logic layer (TDD)

### Task A1: Map URL helpers

**Files:**
- Create: `lib/content/maps.ts`, `lib/content/maps.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/maps.test.ts
import { describe, it, expect } from 'vitest';
import { mapsUrl, embedUrl, directionsUrl, type MapTarget } from './maps';

const base: MapTarget = { address: '89 Cao Bá Quát, An Hải, Đà Nẵng', googleMapsUrl: '', googleMapsEmbedUrl: undefined, directionsUrl: undefined };

describe('map helpers', () => {
  it('falls back to address-derived URLs when no overrides', () => {
    const t: MapTarget = { ...base, googleMapsUrl: '' };
    expect(embedUrl(t)).toBe('https://www.google.com/maps?q=89%20Cao%20B%C3%A1%20Qu%C3%A1t%2C%20An%20H%E1%BA%A3i%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng&output=embed');
    expect(directionsUrl(t)).toBe('https://www.google.com/maps/dir/?api=1&destination=89%20Cao%20B%C3%A1%20Qu%C3%A1t%2C%20An%20H%E1%BA%A3i%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng');
    expect(mapsUrl(t)).toBe('https://www.google.com/maps?q=89%20Cao%20B%C3%A1%20Qu%C3%A1t%2C%20An%20H%E1%BA%A3i%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng');
  });
  it('prefers explicit overrides when present', () => {
    const t: MapTarget = { address: 'x', googleMapsUrl: 'https://maps.app.goo.gl/A', googleMapsEmbedUrl: 'https://maps.example/embed', directionsUrl: 'https://maps.example/dir' };
    expect(mapsUrl(t)).toBe('https://maps.app.goo.gl/A');
    expect(embedUrl(t)).toBe('https://maps.example/embed');
    expect(directionsUrl(t)).toBe('https://maps.example/dir');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/maps.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// lib/content/maps.ts
export type MapTarget = {
  address: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  directionsUrl?: string;
};

const q = (s: string) => encodeURIComponent(s);

/** Link to open the place in Google Maps (explicit override → address fallback). */
export function mapsUrl(t: MapTarget): string {
  return t.googleMapsUrl?.trim() || `https://www.google.com/maps?q=${q(t.address)}`;
}

/** Keyless embeddable map iframe src (explicit override → address fallback). */
export function embedUrl(t: MapTarget): string {
  return t.googleMapsEmbedUrl?.trim() || `https://www.google.com/maps?q=${q(t.address)}&output=embed`;
}

/** Directions link (explicit override → address fallback). */
export function directionsUrl(t: MapTarget): string {
  return t.directionsUrl?.trim() || `https://www.google.com/maps/dir/?api=1&destination=${q(t.address)}`;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/maps.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/maps.ts lib/content/maps.test.ts
git commit -m "feat: map URL helpers (explicit overrides + address fallback)"
```

---

### Task A2: Amenities catalog + resolver (TDD)

**Files:**
- Create: `lib/content/amenities.ts`, `lib/content/amenities.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/amenities.test.ts
import { describe, it, expect } from 'vitest';
import { AMENITIES, resolveAmenities } from './amenities';

describe('amenities', () => {
  it('has 11 catalog entries, each with an English label and icon', () => {
    expect(AMENITIES).toHaveLength(11);
    for (const a of AMENITIES) {
      expect(a.id).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(a.label.en).toBeTruthy();
    }
  });
  it('resolves selected ids in order, localized with en fallback', () => {
    const r = resolveAmenities(['wifi', 'ac'], 'vi');
    expect(r).toHaveLength(2);
    expect(r[0].icon).toBe('📶');
    expect(r[0].label).toBe('Wi-Fi miễn phí, tốc độ cao và ổn định');
    expect(r[1].label).toBe('Máy lạnh');
  });
  it('ignores unknown ids', () => {
    expect(resolveAmenities(['nope'], 'en')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/amenities.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** (English + VI/KO/ZH/RU; translations pending native review)

```ts
// lib/content/amenities.ts
import type { Locale } from '@/i18n/routing';
import type { Localized } from './localize';
import { pick } from './localize';

export type Amenity = { id: string; icon: string; label: Localized<string> };
export type ResolvedAmenity = { icon: string; label: string };

export const AMENITIES: Amenity[] = [
  { id: 'wifi', icon: '📶', label: { en: 'Free reliable high-speed Wi-Fi', vi: 'Wi-Fi miễn phí, tốc độ cao và ổn định', ko: '안정적인 무료 고속 Wi-Fi', 'zh-Hans': '免费稳定高速 Wi-Fi', ru: 'Бесплатный стабильный высокоскоростной Wi-Fi' } },
  { id: 'ac', icon: '❄️', label: { en: 'Air conditioning', vi: 'Máy lạnh', ko: '에어컨', 'zh-Hans': '空调', ru: 'Кондиционер' } },
  { id: 'frontDesk', icon: '🛎️', label: { en: '24-hour front desk', vi: 'Lễ tân 24 giờ', ko: '24시간 프런트 데스크', 'zh-Hans': '24 小时前台', ru: 'Круглосуточная стойка регистрации' } },
  { id: 'parking', icon: '🚗', label: { en: 'Free on-site parking', vi: 'Bãi đỗ xe miễn phí tại chỗ', ko: '무료 현장 주차', 'zh-Hans': '免费现场停车', ru: 'Бесплатная парковка на территории' } },
  { id: 'kitchen', icon: '🍳', label: { en: 'Fully-equipped kitchen with cooking utensils', vi: 'Bếp đầy đủ tiện nghi kèm dụng cụ nấu ăn', ko: '조리도구가 완비된 주방', 'zh-Hans': '设备齐全的厨房及炊具', ru: 'Полностью оборудованная кухня с посудой' } },
  { id: 'laundry', icon: '🧺', label: { en: 'Washing machine', vi: 'Máy giặt', ko: '세탁기', 'zh-Hans': '洗衣机', ru: 'Стиральная машина' } },
  { id: 'balcony', icon: '🌿', label: { en: 'Balcony with city view', vi: 'Ban công nhìn ra thành phố', ko: '시내 전망 발코니', 'zh-Hans': '城市景观阳台', ru: 'Балкон с видом на город' } },
  { id: 'garden', icon: '🌳', label: { en: 'Garden', vi: 'Khu vườn', ko: '정원', 'zh-Hans': '花园', ru: 'Сад' } },
  { id: 'smokeFree', icon: '🚭', label: { en: 'Smoke-free property', vi: 'Toàn bộ khuôn viên không hút thuốc', ko: '전 구역 금연', 'zh-Hans': '无烟物业', ru: 'Курение запрещено на всей территории' } },
  { id: 'family', icon: '👨‍👩‍👧', label: { en: 'Family rooms available', vi: 'Có phòng gia đình', ko: '가족실 이용 가능', 'zh-Hans': '提供家庭房', ru: 'Доступны семейные номера' } },
  { id: 'scooter', icon: '🛵', label: { en: 'Scooter & bicycle rental on request', vi: 'Cho thuê xe máy & xe đạp theo yêu cầu', ko: '요청 시 스쿠터 및 자전거 대여', 'zh-Hans': '可应要求租赁摩托车和自行车', ru: 'Аренда скутеров и велосипедов по запросу' } },
];

const BY_ID = new Map(AMENITIES.map((a) => [a.id, a]));

/** Resolve a building's amenity ids into ordered {icon, label} for a locale. */
export function resolveAmenities(ids: string[], locale: Locale): ResolvedAmenity[] {
  return ids
    .map((id) => BY_ID.get(id))
    .filter((a): a is Amenity => Boolean(a))
    .map((a) => ({ icon: a.icon, label: pick(a.label, locale) }));
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/amenities.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/amenities.ts lib/content/amenities.test.ts
git commit -m "feat: amenities catalog + locale resolver (pending native review)"
```

---

### Task A3: FAQ list + resolver (TDD)

**Files:**
- Create: `lib/content/faq.ts`, `lib/content/faq.test.ts`

> Answers are drafted from the amenities. **Check-in/out times and staff languages are placeholders flagged for client confirmation.**

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/faq.test.ts
import { describe, it, expect } from 'vitest';
import { FAQ, getFaq } from './faq';

describe('faq', () => {
  it('has 10 items, each with localized q and a (en required)', () => {
    expect(FAQ).toHaveLength(10);
    for (const f of FAQ) {
      expect(f.id).toBeTruthy();
      expect(f.q.en).toBeTruthy();
      expect(f.a.en).toBeTruthy();
    }
  });
  it('resolves for a locale with en fallback', () => {
    const r = getFaq('vi');
    expect(r).toHaveLength(10);
    expect(r[0].id).toBe('checkInOut');
    expect(r[0].q).toContain('nhận phòng');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/faq.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// lib/content/faq.ts
import type { Locale } from '@/i18n/routing';
import type { Localized } from './localize';
import { pick } from './localize';

export type FaqItem = { id: string; q: Localized<string>; a: Localized<string> };
export type ResolvedFaq = { id: string; q: string; a: string };

// Global FAQ. Stable ids allow per-building overrides later (not used in v1).
export const FAQ: FaqItem[] = [
  {
    id: 'checkInOut',
    q: { en: 'What are check-in and check-out times?', vi: 'Giờ nhận phòng và trả phòng là khi nào?', ko: '체크인 및 체크아웃 시간은 언제인가요?', 'zh-Hans': '入住和退房时间是几点？', ru: 'Каковы часы заезда и выезда?' },
    a: { en: 'Check-in is from 2:00 PM and check-out is by 12:00 PM. Early check-in or late check-out may be available on request.', vi: 'Nhận phòng từ 14:00 và trả phòng trước 12:00. Có thể nhận phòng sớm hoặc trả phòng muộn theo yêu cầu.', ko: '체크인은 오후 2시부터, 체크아웃은 정오 12시까지입니다. 요청 시 얼리 체크인 또는 레이트 체크아웃이 가능할 수 있습니다.', 'zh-Hans': '入住时间为下午 2:00，退房时间为中午 12:00。可应要求提前入住或延迟退房。', ru: 'Заезд с 14:00, выезд до 12:00. Ранний заезд или поздний выезд возможны по запросу.' },
  },
  {
    id: 'beachDistance',
    q: { en: 'How far is the beach?', vi: 'Bãi biển cách bao xa?', ko: '해변까지 얼마나 먼가요?', 'zh-Hans': '海滩有多远？', ru: 'Как далеко до пляжа?' },
    a: { en: 'My Khe Beach is about a 5-minute walk (around 400 m) from the property.', vi: 'Bãi biển Mỹ Khê cách chỗ ở khoảng 5 phút đi bộ (khoảng 400 m).', ko: '미케 해변까지 도보 약 5분(약 400m) 거리입니다.', 'zh-Hans': '美溪海滩距离住所步行约 5 分钟（约 400 米）。', ru: 'Пляж Мьякхе примерно в 5 минутах ходьбы (около 400 м) от жилья.' },
  },
  {
    id: 'scooterRental',
    q: { en: 'Do you rent scooters or bikes?', vi: 'Có cho thuê xe máy hoặc xe đạp không?', ko: '스쿠터나 자전거를 대여하나요?', 'zh-Hans': '可以租摩托车或自行车吗？', ru: 'Сдаёте ли вы скутеры или велосипеды?' },
    a: { en: 'Yes — scooter and bicycle rental is available on request, so you can explore Da Nang at your own pace.', vi: 'Có — chúng tôi cho thuê xe máy và xe đạp theo yêu cầu để bạn tự do khám phá Đà Nẵng.', ko: '네, 요청 시 스쿠터와 자전거를 대여해 드리므로 자유롭게 다낭을 둘러보실 수 있습니다.', 'zh-Hans': '可以——可应要求租赁摩托车和自行车，让您自在游览岘港。', ru: 'Да — аренда скутеров и велосипедов доступна по запросу, чтобы вы могли исследовать Дананг в своём темпе.' },
  },
  {
    id: 'wifi',
    q: { en: 'Is Wi-Fi free?', vi: 'Wi-Fi có miễn phí không?', ko: 'Wi-Fi는 무료인가요?', 'zh-Hans': 'Wi-Fi 免费吗？', ru: 'Wi-Fi бесплатный?' },
    a: { en: 'Yes, free reliable high-speed Wi-Fi is included throughout the property.', vi: 'Có, Wi-Fi miễn phí tốc độ cao và ổn định được phủ khắp khuôn viên.', ko: '네, 전 구역에서 안정적인 무료 고속 Wi-Fi를 제공합니다.', 'zh-Hans': '是的，整个物业均提供免费稳定的高速 Wi-Fi。', ru: 'Да, бесплатный стабильный высокоскоростной Wi-Fi доступен на всей территории.' },
  },
  {
    id: 'parking',
    q: { en: 'Is there parking?', vi: 'Có chỗ đỗ xe không?', ko: '주차장이 있나요?', 'zh-Hans': '有停车位吗？', ru: 'Есть ли парковка?' },
    a: { en: 'Yes, free on-site parking is available for cars and scooters.', vi: 'Có, bãi đỗ xe miễn phí tại chỗ cho ô tô và xe máy.', ko: '네, 자동차와 스쿠터를 위한 무료 현장 주차가 가능합니다.', 'zh-Hans': '有，提供免费的现场停车位，可停放汽车和摩托车。', ru: 'Да, бесплатная парковка на территории для автомобилей и скутеров.' },
  },
  {
    id: 'frontDesk',
    q: { en: 'Is there a 24-hour front desk?', vi: 'Có lễ tân 24 giờ không?', ko: '24시간 프런트 데스크가 있나요?', 'zh-Hans': '有 24 小时前台吗？', ru: 'Есть ли круглосуточная стойка регистрации?' },
    a: { en: 'Yes, our front desk is staffed 24 hours a day.', vi: 'Có, lễ tân của chúng tôi phục vụ 24 giờ mỗi ngày.', ko: '네, 프런트 데스크는 하루 24시간 운영됩니다.', 'zh-Hans': '是的，我们的前台 24 小时有人值守。', ru: 'Да, наша стойка регистрации работает круглосуточно.' },
  },
  {
    id: 'foodNearby',
    q: { en: 'Are there cafés or restaurants nearby?', vi: 'Gần đó có quán cà phê hoặc nhà hàng không?', ko: '근처에 카페나 식당이 있나요?', 'zh-Hans': '附近有咖啡馆或餐厅吗？', ru: 'Есть ли поблизости кафе или рестораны?' },
    a: { en: 'Plenty — An Hải has many cafés and restaurants within a short walk.', vi: 'Rất nhiều — khu An Hải có nhiều quán cà phê và nhà hàng chỉ cách vài bước chân.', ko: '많습니다 — 안하이에는 도보 거리 내에 카페와 식당이 많습니다.', 'zh-Hans': '很多——安海区步行不远即有众多咖啡馆和餐厅。', ru: 'Множество — в районе Анхай много кафе и ресторанов в пешей доступности.' },
  },
  {
    id: 'airportDistance',
    q: { en: 'How far is Da Nang airport?', vi: 'Sân bay Đà Nẵng cách bao xa?', ko: '다낭 공항까지 얼마나 먼가요?', 'zh-Hans': '岘港机场有多远？', ru: 'Как далеко аэропорт Дананга?' },
    a: { en: 'Da Nang International Airport is about 5 km away — roughly a 15-minute drive.', vi: 'Sân bay Quốc tế Đà Nẵng cách khoảng 5 km — chừng 15 phút lái xe.', ko: '다낭 국제공항까지 약 5km로, 차로 약 15분 거리입니다.', 'zh-Hans': '岘港国际机场约 5 公里，车程约 15 分钟。', ru: 'Международный аэропорт Дананга примерно в 5 км — около 15 минут на машине.' },
  },
  {
    id: 'smokeFreeFamily',
    q: { en: 'Is the property smoke-free and family-friendly?', vi: 'Chỗ ở có không hút thuốc và thân thiện với gia đình không?', ko: '금연이며 가족 친화적인가요?', 'zh-Hans': '物业是否无烟且适合家庭入住？', ru: 'Курение запрещено и подходит ли жильё для семей?' },
    a: { en: 'Yes. The property is entirely smoke-free, and family rooms are available.', vi: 'Có. Toàn bộ khuôn viên không hút thuốc và có phòng gia đình.', ko: '네. 전 구역이 금연이며 가족실도 이용 가능합니다.', 'zh-Hans': '是的。物业全面无烟，并提供家庭房。', ru: 'Да. Курение запрещено на всей территории, доступны семейные номера.' },
  },
  {
    id: 'languages',
    q: { en: 'What languages do you speak?', vi: 'Bạn nói được những ngôn ngữ nào?', ko: '어떤 언어로 응대하나요?', 'zh-Hans': '你们会说哪些语言？', ru: 'На каких языках вы говорите?' },
    a: { en: "We can help in English and Vietnamese, and you're welcome to message us in your own language on WhatsApp.", vi: 'Chúng tôi hỗ trợ bằng tiếng Anh và tiếng Việt, và bạn có thể nhắn tin cho chúng tôi bằng ngôn ngữ của mình qua WhatsApp.', ko: '영어와 베트남어로 도와드리며, WhatsApp으로 원하시는 언어로 메시지를 보내셔도 됩니다.', 'zh-Hans': '我们可以用英语和越南语为您服务，您也可以通过 WhatsApp 用您的语言留言。', ru: 'Мы помогаем на английском и вьетнамском, и вы можете написать нам на своём языке в WhatsApp.' },
  },
];

/** Resolve the global FAQ for a locale (en fallback). Stable ids allow future per-building overrides. */
export function getFaq(locale: Locale): ResolvedFaq[] {
  return FAQ.map((f) => ({ id: f.id, q: pick(f.q, locale), a: pick(f.a, locale) }));
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/faq.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/faq.ts lib/content/faq.test.ts
git commit -m "feat: global FAQ + locale resolver (drafted answers, pending verification)"
```

---

### Task A4: Extend content types

**Files:**
- Modify: `lib/content/types.ts`

- [ ] **Step 1: Add landmark type, amenityIds, landmarks, map override URLs**

Replace the `BuildingMeta` type (keep `RoomMeta`/`Contacts` as-is):

```ts
export type Landmark = { name: Localized<string>; distance: string };

export type BuildingMeta = {
  slug: string;
  folder: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl?: string;
  directionsUrl?: string;
  blurb: Localized<string>;
  alt: Localized<string>;
  sortOrder: number;
  hidden?: boolean;
  comingSoon?: boolean;
  amenityIds?: string[];
  landmarks?: Landmark[];
  rooms: RoomMeta[];
};
```

- [ ] **Step 2: Verify compile** (site.ts/index.ts errors expected until A5/A6)

Run: `npx tsc --noEmit 2>&1 | grep "content/types.ts" || echo "types ok"`
Expected: `types ok`

- [ ] **Step 3: Commit**

```bash
git add lib/content/types.ts
git commit -m "feat: building types for amenities, landmarks, map overrides"
```

---

### Task A5: Resolve amenities/landmarks/map URLs in `index.ts` (TDD)

**Files:**
- Modify: `lib/content/index.ts`, `lib/content/index.test.ts`

- [ ] **Step 1: Extend the test**

Append to `lib/content/index.test.ts` (keep existing test):

```ts
import { resolveBuilding as rb } from './index';

describe('resolveBuilding info sections', () => {
  it('resolves amenities, landmarks, and map URLs for the locale', () => {
    const meta = {
      slug: 'gilda-hotel', folder: 'Gilda-Hotel', name: 'Gilda Hotel', address: 'A',
      googleMapsUrl: 'https://maps/explicit', blurb: { en: 'b' }, alt: { en: 'a' }, sortOrder: 1,
      amenityIds: ['wifi'], landmarks: [{ name: { en: 'Beach', vi: 'Bãi biển' }, distance: '0.4 km' }],
      rooms: [],
    };
    const r = rb(meta as never, 'vi', {});
    expect(r.amenities[0].icon).toBe('📶');
    expect(r.landmarks[0]).toEqual({ name: 'Bãi biển', distance: '0.4 km' });
    expect(r.mapsUrl).toBe('https://maps/explicit');
    expect(r.embedUrl).toContain('output=embed');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/index.test.ts`
Expected: FAIL (amenities/landmarks/mapsUrl missing on ResolvedBuilding).

- [ ] **Step 3: Update `index.ts`** — add imports, extend `ResolvedBuilding`, resolve in `resolveBuilding`

Add imports near the top:
```ts
import { resolveAmenities, type ResolvedAmenity } from './amenities';
import { mapsUrl, embedUrl, directionsUrl } from './maps';
```
Extend the `ResolvedBuilding` type:
```ts
export type ResolvedLandmark = { name: string; distance: string };
export type ResolvedBuilding = {
  slug: string; folder: string; name: string; address: string; googleMapsUrl: string;
  blurb: string; alt: string; sortOrder: number; hidden?: boolean; comingSoon?: boolean;
  cover: Img | null; images: Img[]; resolvedRooms: ResolvedRoom[];
  amenities: ResolvedAmenity[]; landmarks: ResolvedLandmark[];
  mapsUrl: string; embedUrl: string; directionsUrl: string;
};
```
In the `resolveBuilding` return object, add (after `resolvedRooms`):
```ts
    amenities: resolveAmenities(meta.amenityIds ?? [], locale),
    landmarks: (meta.landmarks ?? []).map((l) => ({ name: pick(l.name, locale), distance: l.distance })),
    mapsUrl: mapsUrl(meta), embedUrl: embedUrl(meta), directionsUrl: directionsUrl(meta),
```

Finally, re-export the FAQ resolver so `@/lib/content` stays the single content entry point. Replace the bottom `export { scanDisk, PHOTOS_BASE };` line with:
```ts
export { scanDisk, PHOTOS_BASE };
export { getFaq } from './faq';
export type { ResolvedFaq } from './faq';
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/index.test.ts`
Expected: PASS (existing + new test).

- [ ] **Step 5: Commit**

```bash
git add lib/content/index.ts lib/content/index.test.ts
git commit -m "feat: resolve amenities, landmarks, and map URLs on ResolvedBuilding"
```

---

### Task A6: Populate `site.ts` (Gilda amenities, landmarks)

**Files:**
- Modify: `lib/content/site.ts`

> Distances are **approximate, flagged for client verification**. Landmark names localized; "Da Nang" forms localized per language.

- [ ] **Step 1: Add `amenityIds` and `landmarks` to the Gilda Hotel building**

In `lib/content/site.ts`, inside the `gilda-hotel` building object, after `sortOrder: 1,` add:

```ts
    amenityIds: ['wifi', 'ac', 'frontDesk', 'parking', 'kitchen', 'laundry', 'balcony', 'garden', 'smokeFree', 'family', 'scooter'],
    landmarks: [
      { name: { en: 'My Khe Beach', vi: 'Bãi biển Mỹ Khê', ko: '미케 해변', 'zh-Hans': '美溪海滩', ru: 'Пляж Мьякхе' }, distance: '0.4 km' },
      { name: { en: 'Dragon Bridge', vi: 'Cầu Rồng', ko: '드래곤 브리지', 'zh-Hans': '龙桥', ru: 'Мост Дракон' }, distance: '1.7 km' },
      { name: { en: 'Han River Bridge', vi: 'Cầu Sông Hàn', ko: '한강교', 'zh-Hans': '韩江桥', ru: 'Мост через реку Хан' }, distance: '2.4 km' },
      { name: { en: 'Da Nang Cathedral', vi: 'Nhà thờ Đà Nẵng', ko: '다낭 대성당', 'zh-Hans': '岘港大教堂', ru: 'Кафедральный собор Дананга' }, distance: '3.0 km' },
      { name: { en: 'Da Nang Railway Station', vi: 'Ga Đà Nẵng', ko: '다낭 기차역', 'zh-Hans': '岘港火车站', ru: 'Железнодорожный вокзал Дананга' }, distance: '4.5 km' },
      { name: { en: 'Da Nang International Airport (DAD)', vi: 'Sân bay Quốc tế Đà Nẵng (DAD)', ko: '다낭 국제공항 (DAD)', 'zh-Hans': '岘港国际机场 (DAD)', ru: 'Международный аэропорт Дананга (DAD)' }, distance: '5.0 km' },
      { name: { en: 'Marble Mountains (Ngũ Hành Sơn)', vi: 'Ngũ Hành Sơn', ko: '마블 마운틴 (응우한선)', 'zh-Hans': '五行山', ru: 'Мраморные горы (Нгуханьшон)' }, distance: '6.5 km' },
    ],
```

- [ ] **Step 2: Typecheck + content tests**

Run: `npx tsc --noEmit && npx vitest run lib/content/`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add lib/content/site.ts
git commit -m "feat: Gilda Hotel amenities + landmarks (approx distances, pending verification)"
```

---

### Task A7: Extend content-integrity test for new localized content

**Files:**
- Modify: `lib/content/content-integrity.test.ts`

- [ ] **Step 1: Add `en`-coverage assertions for amenities, landmarks, and FAQ**

Append inside the existing `describe(...)` block:

```ts
  it('every amenity label, landmark name, and FAQ q/a has an English source', () => {
    for (const a of AMENITIES) expect(a.label.en, `amenity ${a.id}`).toBeTruthy();
    for (const f of FAQ) {
      expect(f.q.en, `faq ${f.id} q`).toBeTruthy();
      expect(f.a.en, `faq ${f.id} a`).toBeTruthy();
    }
    for (const b of buildings) {
      for (const l of b.landmarks ?? []) expect(l.name.en, `${b.slug} landmark`).toBeTruthy();
    }
  });
```

Add imports at the top of the file:
```ts
import { AMENITIES } from './amenities';
import { FAQ } from './faq';
```

- [ ] **Step 2: Run**

Run: `npx vitest run lib/content/content-integrity.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/content/content-integrity.test.ts
git commit -m "test: content integrity covers amenities, landmarks, FAQ en sources"
```

---

## Phase B — Section chrome messages

### Task B1: Add section/button keys to all 5 catalogs

**Files:**
- Modify: `messages/en.json`, `messages/vi.json`, `messages/ko.json`, `messages/zh-Hans.json`, `messages/ru.json`

- [ ] **Step 1: Add a `roomInfo` namespace to each file** (insert before the closing `}` of each, after the last existing key; remember commas)

`messages/en.json`:
```json
  "roomInfo": {
    "amenitiesHeading": "Amenities",
    "locationHeading": "Location",
    "openInMaps": "Open in Google Maps",
    "directions": "Get directions",
    "askWhatsApp": "Ask us on WhatsApp",
    "aroundHeading": "Around the apartment",
    "approx": "Approx.",
    "faqHeading": "Frequently asked"
  }
```
`messages/vi.json`:
```json
  "roomInfo": {
    "amenitiesHeading": "Tiện nghi",
    "locationHeading": "Vị trí",
    "openInMaps": "Mở trong Google Maps",
    "directions": "Chỉ đường",
    "askWhatsApp": "Nhắn cho chúng tôi qua WhatsApp",
    "aroundHeading": "Xung quanh căn hộ",
    "approx": "Khoảng",
    "faqHeading": "Câu hỏi thường gặp"
  }
```
`messages/ko.json`:
```json
  "roomInfo": {
    "amenitiesHeading": "편의시설",
    "locationHeading": "위치",
    "openInMaps": "Google 지도에서 열기",
    "directions": "길찾기",
    "askWhatsApp": "WhatsApp으로 문의하기",
    "aroundHeading": "아파트 주변",
    "approx": "약",
    "faqHeading": "자주 묻는 질문"
  }
```
`messages/zh-Hans.json`:
```json
  "roomInfo": {
    "amenitiesHeading": "设施",
    "locationHeading": "位置",
    "openInMaps": "在 Google 地图中打开",
    "directions": "获取路线",
    "askWhatsApp": "通过 WhatsApp 咨询我们",
    "aroundHeading": "公寓周边",
    "approx": "约",
    "faqHeading": "常见问题"
  }
```
`messages/ru.json`:
```json
  "roomInfo": {
    "amenitiesHeading": "Удобства",
    "locationHeading": "Расположение",
    "openInMaps": "Открыть в Google Картах",
    "directions": "Построить маршрут",
    "askWhatsApp": "Напишите нам в WhatsApp",
    "aroundHeading": "Рядом с апартаментами",
    "approx": "Прибл.",
    "faqHeading": "Частые вопросы"
  }
```

- [ ] **Step 2: Validate JSON + key-tree parity**

Run: `for f in en vi ko zh-Hans ru; do node -e "JSON.parse(require('fs').readFileSync('messages/$f.json','utf8'))" && echo "$f ok"; done && npx vitest run lib/content/i18n-integrity.test.ts`
Expected: all `ok`; i18n-integrity passes (key trees identical).

- [ ] **Step 3: Commit**

```bash
git add messages/
git commit -m "feat: roomInfo section/button message keys (5 locales)"
```

---

## Phase C — Components & wiring

> Each component: after writing, `npx tsc --noEmit` + `npm run lint`; final build verified in Phase D.

### Task C1: WhatsApp icon

**Files:**
- Create: `components/icons/WhatsAppIcon.tsx`

- [ ] **Step 1: Create the inline SVG icon**

```tsx
// components/icons/WhatsAppIcon.tsx
export default function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.477-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.017-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
npx tsc --noEmit
git add components/icons/WhatsAppIcon.tsx
git commit -m "feat: inline WhatsApp icon component"
```

---

### Task C2: Amenities section

**Files:**
- Create: `components/room/Amenities.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/room/Amenities.tsx
import { getTranslations } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import type { ResolvedAmenity } from '@/lib/content/amenities';

export default async function Amenities({ amenities }: { amenities: ResolvedAmenity[] }) {
  if (amenities.length === 0) return null;
  const t = await getTranslations('roomInfo');
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="font-heading text-3xl text-text-accent">{t('amenitiesHeading')}</h2>
        <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((a) => (
            <li key={a.label} className="flex items-center gap-3 text-text-secondary">
              <span className="text-xl leading-none" aria-hidden>{a.icon}</span>
              <span>{a.label}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/room/Amenities.tsx
git commit -m "feat: Amenities section"
```

---

### Task C3: Location section (map + buttons + WhatsApp CTA)

**Files:**
- Create: `components/room/LocationSection.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/room/LocationSection.tsx
import { getTranslations } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { whatsappUrl } from '@/lib/contacts';

type Props = {
  address: string;
  mapsUrl: string;
  embedUrl: string;
  directionsUrl: string;
  whatsapp: string;
  message: string;
};

export default async function LocationSection({ address, mapsUrl, embedUrl, directionsUrl, whatsapp, message }: Props) {
  const t = await getTranslations('roomInfo');
  const wa = whatsappUrl(whatsapp, message);
  const btn = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition';
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="font-heading text-3xl text-text-accent">{t('locationHeading')}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-[var(--color-border-default)] shadow-sm">
            <iframe
              src={embedUrl}
              title={t('locationHeading')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] w-full"
            />
          </div>
          <div className="flex flex-col items-start gap-4">
            <p className="text-text-secondary">{address}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a className={`${btn} border border-[var(--color-border-strong)] text-text-accent hover:bg-surface-elevated`} href={mapsUrl} target="_blank" rel="noopener noreferrer">{t('openInMaps')}</a>
              <a className={`${btn} border border-[var(--color-border-strong)] text-text-accent hover:bg-surface-elevated`} href={directionsUrl} target="_blank" rel="noopener noreferrer">{t('directions')}</a>
              {wa && (
                <a className={`${btn} bg-cta text-text-inverse shadow-md shadow-cta/30 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-lg`} href={wa} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-4 w-4" />
                  {t('askWhatsApp')}
                </a>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/room/LocationSection.tsx
git commit -m "feat: Location section (keyless map embed + buttons + WhatsApp CTA)"
```

---

### Task C4: Around the apartment section

**Files:**
- Create: `components/room/AroundSection.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/room/AroundSection.tsx
import { getTranslations } from 'next-intl/server';
import { MapPin } from 'lucide-react';
import Reveal from '@/components/Reveal';
import type { ResolvedLandmark } from '@/lib/content';

export default async function AroundSection({ landmarks }: { landmarks: ResolvedLandmark[] }) {
  if (landmarks.length === 0) return null;
  const t = await getTranslations('roomInfo');
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="font-heading text-3xl text-text-accent">{t('aroundHeading')}</h2>
        <ul className="mt-6 divide-y divide-[var(--color-border-subtle)]">
          {landmarks.map((l) => (
            <li key={l.name} className="flex items-center justify-between gap-4 py-3">
              <span className="flex items-center gap-3 text-text-primary">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
                {l.name}
              </span>
              <span className="shrink-0 text-sm text-text-muted">{t('approx')} {l.distance}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/room/AroundSection.tsx
git commit -m "feat: Around-the-apartment section (landmarks + approx distances)"
```

---

### Task C5: FAQ accordion

**Files:**
- Create: `components/room/Faq.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/room/Faq.tsx
import { getTranslations } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import type { ResolvedFaq } from '@/lib/content/faq';

export default async function Faq({ items }: { items: ResolvedFaq[] }) {
  if (items.length === 0) return null;
  const t = await getTranslations('roomInfo');
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="font-heading text-3xl text-text-accent">{t('faqHeading')}</h2>
        <div className="mt-6 divide-y divide-[var(--color-border-subtle)] border-y border-[var(--color-border-subtle)]">
          {items.map((f) => (
            <details key={f.id} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-text-primary marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="pb-4 text-text-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/room/Faq.tsx
git commit -m "feat: FAQ accordion (native details, no-JS, accessible)"
```

---

### Task C6: Wire sections into the room page

**Files:**
- Modify: `app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx`

- [ ] **Step 1: Import the sections + getFaq, render under the gallery**

Add imports:
```ts
import Amenities from '@/components/room/Amenities';
import LocationSection from '@/components/room/LocationSection';
import AroundSection from '@/components/room/AroundSection';
import Faq from '@/components/room/Faq';
import { getBuildings, getBuilding, getRoom, getFaq } from '@/lib/content';
```
(replace the existing `getBuildings, getBuilding, getRoom` import line with the one above.)

In the component body, after `const message = t('inquiry.room', { ... });`, add:
```ts
  const faq = getFaq(locale as Locale);
```
Replace the final return block's closing (the `<div className="mt-8"><BookNowMenu .../></div></Container>`) so the sections render after it:
```tsx
      <div className="mt-8"><BookNowMenu contacts={contacts} message={message} /></div>

      <Amenities amenities={building.amenities} />
      <LocationSection
        address={building.address}
        mapsUrl={building.mapsUrl}
        embedUrl={building.embedUrl}
        directionsUrl={building.directionsUrl}
        whatsapp={contacts.whatsapp}
        message={message}
      />
      <AroundSection landmarks={building.landmarks} />
      <Faq items={faq} />
    </Container>
```

- [ ] **Step 2: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add "app/(public)/[locale]/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx"
git commit -m "feat: render amenities/location/around/FAQ on room page"
```

---

### Task C7: WhatsApp icon on all WhatsApp actions

**Files:**
- Modify: `components/BookNowMenu.tsx`, `components/Footer.tsx`, `app/(public)/[locale]/page.tsx`

- [ ] **Step 1: `BookNowMenu.tsx`** — icon in the WhatsApp item

Add import:
```ts
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
```
Replace the WhatsApp `<a>` (the `links.whatsapp` line) with:
```tsx
          {links.whatsapp && <a role="menuitem" className={`${item} flex items-center gap-2`} href={links.whatsapp} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-4 w-4 text-[#25D366]" />{t('booking.whatsapp')}</a>}
```

- [ ] **Step 2: `Footer.tsx`** — icon on the WhatsApp link

Add import `import WhatsAppIcon from '@/components/icons/WhatsAppIcon';`. Replace the `wa` link with:
```tsx
          {wa && <a className={`${link} inline-flex items-center gap-2`} href={wa} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-4 w-4" />{t('booking.whatsapp')}</a>}
```

- [ ] **Step 3: `app/(public)/[locale]/page.tsx`** — icon on the CTA WhatsApp link

Add import `import WhatsAppIcon from '@/components/icons/WhatsAppIcon';`. Replace the `wa` link with:
```tsx
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"><WhatsAppIcon className="h-4 w-4 text-[#25D366]" />{t('booking.whatsapp')}</a>}
```

- [ ] **Step 4: Typecheck + lint + commit**

```bash
npx tsc --noEmit && npm run lint
git add components/BookNowMenu.tsx components/Footer.tsx "app/(public)/[locale]/page.tsx"
git commit -m "feat: WhatsApp icon on all WhatsApp actions site-wide"
```

---

## Phase D — Verification

### Task D1: Full suite + build + manual

**Files:** none.

- [ ] **Step 1: Tests**

Run: `npx vitest run`
Expected: all pass (new maps/amenities/faq/index/content-integrity tests + existing).

- [ ] **Step 2: Build with no Supabase env**

Run: `rm -rf .next && env -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_ANON_KEY -u SUPABASE_SERVICE_ROLE_KEY npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual (`npm run dev`)**

On `http://localhost:3000/buildings/gilda-hotel/1-bedroom`:
- Amenities grid (11 items, emojis) under the gallery.
- Location: map iframe loads (the address), three buttons; "Ask us on WhatsApp" has the WhatsApp icon and opens wa.me with the room-contextual message.
- Around: landmark rows with 📍/pin + "Approx. X km" on the right.
- FAQ: click a question → expands the answer; works with the + rotating to ×.
- Switch to `/vi`, `/ko`, `/zh`, `/ru` — all four sections fully localized; "Approx." prefix translated.
- WhatsApp icon also shows in the Book-now dropdown, footer, and landing CTA.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: room info sections verification fixes" || echo "nothing to fix"
```

---

## Self-review checklist (planner)

- [ ] Spec coverage: amenities catalog+resolver (A2), landmarks per-building (A6) resolved (A5), FAQ global override-ready (A3), map overrides+fallback (A1/A5), 4 sections (C2-C5) wired room-page-only (C6), WhatsApp icon site-wide (C1/C7), contextual room WhatsApp (C3/C6 reuse `message`), guest-friendly names + approx distances (A6/C4/B1), translate-all-5 (A2/A3/A6/B1), validation (A7 + i18n-integrity).
- [ ] No placeholders: all translations are real values (pending native review), all FAQ answers drafted (check-in/languages flagged).
- [ ] Type consistency: `ResolvedAmenity {icon,label}`, `ResolvedLandmark {name,distance}`, `ResolvedFaq {id,q,a}`; `getFaq(locale)`, `resolveAmenities(ids,locale)`; `ResolvedBuilding` gains `amenities/landmarks/mapsUrl/embedUrl/directionsUrl`; room page passes `building.*` + reused `message`.

## Acceptance criteria (verify before done)

- [ ] Room page shows all four sections, fully localized in all 5 locales.
- [ ] Keyless map iframe loads; Open-in-Maps / Directions use explicit URLs when set else address-derived.
- [ ] "Ask us on WhatsApp" (and all WhatsApp actions) show the WhatsApp icon; room CTA uses the contextual message.
- [ ] Distances show a localized "Approx." prefix; landmark names guest-friendly.
- [ ] FAQ expands/collapses; works without JS.
- [ ] `npm test`, `tsc`, `lint` green; build succeeds with no Supabase env vars.

## Follow-ups

- Native-speaker review of all new translations.
- Confirm real distances, check-in/out times, and staff languages.
- Optional precise per-building Google Maps URLs (override the fallback).
- Per-building FAQ overrides when needed (ids are stable).
