# Vĩnh House Public Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully static, filesystem-driven public website for Vĩnh House (boutique apartment/hotel rentals in Da Nang), replacing the current Supabase-backed public pages.

**Architecture:** Public pages read building/room structure and photos from `public/Phap_photos/` folders at build time, merged with a single hand-maintained metadata file (`lib/content/site.ts`) for prices, blurbs, statuses, and global contacts. No Supabase at runtime. A pure `validateContent()` function (run via Vitest in `prebuild`) prevents folder↔metadata drift. Admin/Supabase pages stay in the repo but dormant.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (existing forest-green + gold design tokens), Vitest, `sharp` (image optimization, dev-only).

**Spec:** `docs/superpowers/specs/2026-06-17-vinh-house-landing-design.md`

**Testing approach:** Pure `lib/content/*` logic is built TDD with Vitest (matches existing `lib/*.test.ts` pattern). Presentational components/pages are verified with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks — the repo has no component-testing infra and we are not adding it (YAGNI).

**Brand tokens (use these, do not invent colors):** `bg-navbar-forest`, `bg-brand-forest`, `bg-surface-card`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-text-accent`, `text-text-inverse`, `bg-accent-gold`, `border-[var(--color-border-default)]`, `font-heading` (Cormorant Garamond), default body (Inter). Reuse `CTAButton`, `Container`, `ImageLightbox`.

---

## Phase A — Content logic layer (TDD)

### Task A1: `slugify` helper

**Files:**
- Create: `lib/content/slug.ts`
- Test: `lib/content/slug.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/slug.test.ts
import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates folder names', () => {
    expect(slugify('Gilda-Hotel')).toBe('gilda-hotel');
    expect(slugify('Azure Apartments')).toBe('azure-apartments');
  });
  it('keeps digits and collapses separators', () => {
    expect(slugify('1-bedroom')).toBe('1-bedroom');
    expect(slugify('2  Bedroom__Suite')).toBe('2-bedroom-suite');
  });
  it('strips diacritics', () => {
    expect(slugify('Đà Nẵng')).toBe('da-nang');
  });
  it('trims leading/trailing separators', () => {
    expect(slugify('--Hello--')).toBe('hello');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/content/slug.test.ts`
Expected: FAIL — cannot find module `./slug`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/content/slug.ts
/** Folder/display name → URL slug. ASCII, lowercase, hyphen-separated, diacritics stripped. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/content/slug.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/slug.ts lib/content/slug.test.ts
git commit -m "feat: add slugify helper for content layer"
```

---

### Task A2: Content types

**Files:**
- Create: `lib/content/types.ts`

No test (types only — verified by `tsc` in later tasks).

- [ ] **Step 1: Write the types file**

```ts
// lib/content/types.ts

/** Global, business-wide contact info (placeholders until client provides real values). */
export type Contacts = {
  email: string;
  phone: string;        // display + tel source, e.g. "+84 92 442 22 99"
  whatsapp: string;     // number, e.g. "+84 92 442 22 99"
  facebook: string;     // full URL
  motorbikeUrl: string; // scooter rental site
};

export type RoomMeta = {
  /** Must equal slugify(folder name) of the room subfolder. */
  slug: string;
  name: string;         // display, e.g. "1 Bedroom"
  price: string;        // e.g. "$— / month" placeholder
  blurb: string;
  status: 'available' | 'unavailable';
  alt: string;          // default alt text for this room's images
};

export type BuildingMeta = {
  /** Must equal slugify(folder). */
  slug: string;
  /** Exact folder name under public/Phap_photos. */
  folder: string;
  name: string;
  address: string;
  googleMapsUrl: string;
  blurb: string;
  alt: string;          // default alt text for this building's images
  sortOrder: number;
  hidden?: boolean;     // not rendered anywhere
  comingSoon?: boolean; // card shown, no rooms/room-pages
  rooms: RoomMeta[];    // empty when comingSoon
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new errors referencing `lib/content/types.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/content/types.ts
git commit -m "feat: add content layer types"
```

---

### Task A3: Extend `lib/contacts.ts` (WhatsApp message, tel, mailto body)

**Files:**
- Modify: `lib/contacts.ts`
- Modify: `lib/contacts.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `lib/contacts.test.ts` (keep existing tests intact):

```ts
import { telUrl } from './contacts';

describe('whatsappUrl with message', () => {
  it('appends an encoded text query when a message is given', () => {
    expect(whatsappUrl('+84 92 442 22 99', 'Hi there')).toBe(
      'https://wa.me/84924422299?text=Hi%20there',
    );
  });
  it('omits the query when no message is given', () => {
    expect(whatsappUrl('+84 92 442 22 99')).toBe('https://wa.me/84924422299');
  });
});

describe('telUrl', () => {
  it('builds a tel link preserving a leading +', () => {
    expect(telUrl('+84 92 442 22 99')).toBe('tel:+84924422299');
  });
  it('builds a tel link without + when none present', () => {
    expect(telUrl('0924 422 299')).toBe('tel:0924422299');
  });
  it('returns null for empty', () => {
    expect(telUrl('')).toBeNull();
  });
});

describe('mailtoUrl with body', () => {
  it('encodes subject and body', () => {
    expect(mailtoUrl('a@b.com', 'Subj', 'Body text')).toBe(
      'mailto:a@b.com?subject=Subj&body=Body%20text',
    );
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/contacts.test.ts`
Expected: FAIL — `telUrl` not exported; `whatsappUrl`/`mailtoUrl` ignore new args.

- [ ] **Step 3: Update `lib/contacts.ts`**

Replace the `whatsappUrl` and `mailtoUrl` functions and add `telUrl`:

```ts
/** Builds a wa.me link; appends an encoded prefilled message when provided. */
export function whatsappUrl(number: string | null | undefined, message?: string): string | null {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, '');
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Builds a tel: link, preserving a leading + and stripping other non-digits. */
export function telUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const plus = phone.trim().startsWith('+') ? '+' : '';
  const digits = phone.replace(/[^\d]/g, '');
  return digits ? `tel:${plus}${digits}` : null;
}

/** Builds a mailto: link with optional subject and body. */
export function mailtoUrl(
  email: string | null | undefined,
  subject?: string,
  body?: string,
): string | null {
  if (!email) return null;
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const q = params.toString();
  // URLSearchParams encodes spaces as '+'; mail clients expect %20.
  return `mailto:${email}${q ? `?${q.replace(/\+/g, '%20')}` : ''}`;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/contacts.test.ts`
Expected: PASS (all existing + new tests). The existing `mailtoUrl('hello@example.com', 'Room inquiry')` test still yields `mailto:hello@example.com?subject=Room%20inquiry`.

- [ ] **Step 5: Commit**

```bash
git add lib/contacts.ts lib/contacts.test.ts
git commit -m "feat: WhatsApp prefilled message, telUrl, mailto body"
```

---

### Task A4: Contextual inquiry messages + link builder

**Files:**
- Create: `lib/content/inquiry.ts`
- Test: `lib/content/inquiry.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/inquiry.test.ts
import { describe, it, expect } from 'vitest';
import { inquiryMessage, buildInquiryLinks } from './inquiry';
import type { Contacts } from './types';

const contacts: Contacts = {
  email: 'hello@example.com',
  phone: '+84 92 442 22 99',
  whatsapp: '+84 92 442 22 99',
  facebook: 'https://facebook.com/vinhhouse',
  motorbikeUrl: 'https://vinhphatmotorbikes.com',
};

describe('inquiryMessage', () => {
  it('generic when no context', () => {
    expect(inquiryMessage({})).toBe(
      "Hi, I'm interested in renting a room at Vĩnh House.",
    );
  });
  it('building context', () => {
    expect(inquiryMessage({ building: 'Gilda Hotel' })).toBe(
      "Hi, I'm interested in Gilda Hotel. Is a room available?",
    );
  });
  it('room context includes type, building, and url', () => {
    expect(
      inquiryMessage({ building: 'Gilda Hotel', roomType: '1 Bedroom', url: 'https://x/y' }),
    ).toBe(
      "Hi, I'm interested in the 1 Bedroom at Gilda Hotel. Is it available? https://x/y",
    );
  });
});

describe('buildInquiryLinks', () => {
  it('builds all four hrefs with the message', () => {
    const links = buildInquiryLinks(contacts, 'Hello');
    expect(links.whatsapp).toBe('https://wa.me/84924422299?text=Hello');
    expect(links.phone).toBe('tel:+84924422299');
    expect(links.email).toBe('mailto:hello@example.com?subject=V%C4%A9nh%20House%20inquiry&body=Hello');
    expect(links.facebook).toBe('https://facebook.com/vinhhouse');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/inquiry.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// lib/content/inquiry.ts
import { whatsappUrl, telUrl, mailtoUrl } from '@/lib/contacts';
import type { Contacts } from './types';

const BUSINESS = 'Vĩnh House';

export type InquiryContext = { building?: string; roomType?: string; url?: string };

/** Returns the contextual prefilled inquiry message. */
export function inquiryMessage(ctx: InquiryContext): string {
  if (ctx.building && ctx.roomType) {
    const tail = ctx.url ? ` ${ctx.url}` : '';
    return `Hi, I'm interested in the ${ctx.roomType} at ${ctx.building}. Is it available?${tail}`;
  }
  if (ctx.building) {
    return `Hi, I'm interested in ${ctx.building}. Is a room available?`;
  }
  return `Hi, I'm interested in renting a room at ${BUSINESS}.`;
}

export type InquiryLinkSet = {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  facebook: string | null;
};

/** Builds the four Book-now hrefs from contacts + a prefilled message. */
export function buildInquiryLinks(contacts: Contacts, message: string): InquiryLinkSet {
  return {
    email: mailtoUrl(contacts.email, `${BUSINESS} inquiry`, message),
    phone: telUrl(contacts.phone),
    whatsapp: whatsappUrl(contacts.whatsapp, message),
    facebook: contacts.facebook?.trim() || null,
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/inquiry.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/inquiry.ts lib/content/inquiry.test.ts
git commit -m "feat: contextual inquiry messages and link builder"
```

---

### Task A5: Filesystem image/folder loader (TDD with fixtures)

**Files:**
- Create: `lib/content/loader.ts`
- Create: `lib/content/__fixtures__/photos/Test-Building/cover.jpg` (empty file)
- Create: `lib/content/__fixtures__/photos/Test-Building/building-01.jpg` (empty)
- Create: `lib/content/__fixtures__/photos/Test-Building/Information.txt` (any text)
- Create: `lib/content/__fixtures__/photos/Test-Building/1-bedroom/cover.jpg` (empty)
- Create: `lib/content/__fixtures__/photos/Test-Building/1-bedroom/room-01.jpg` (empty)
- Create: `lib/content/__fixtures__/photos/Empty-Building/.gitkeep` (empty)
- Test: `lib/content/loader.test.ts`

- [ ] **Step 1: Create fixture files**

```bash
mkdir -p lib/content/__fixtures__/photos/Test-Building/1-bedroom lib/content/__fixtures__/photos/Empty-Building
: > lib/content/__fixtures__/photos/Test-Building/cover.jpg
: > lib/content/__fixtures__/photos/Test-Building/building-01.jpg
echo 'info' > lib/content/__fixtures__/photos/Test-Building/Information.txt
: > lib/content/__fixtures__/photos/Test-Building/1-bedroom/cover.jpg
: > lib/content/__fixtures__/photos/Test-Building/1-bedroom/room-01.jpg
: > lib/content/__fixtures__/photos/Empty-Building/.gitkeep
```

- [ ] **Step 2: Write the failing test**

```ts
// lib/content/loader.test.ts
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { listImages, scanDisk } from './loader';

const FIX = fileURLToPath(new URL('./__fixtures__/photos', import.meta.url));

describe('listImages', () => {
  it('returns image files with cover.jpg first, ignoring non-images', () => {
    const dir = `${FIX}/Test-Building`;
    expect(listImages(dir)).toEqual(['cover.jpg', 'building-01.jpg']);
  });
  it('returns [] for a folder with no images', () => {
    expect(listImages(`${FIX}/Empty-Building`)).toEqual([]);
  });
});

describe('scanDisk', () => {
  it('reports building folders, room subfolders, and cover presence', () => {
    const disk = scanDisk(FIX);
    const tb = disk.find((b) => b.folder === 'Test-Building')!;
    expect(tb.hasCover).toBe(true);
    expect(tb.rooms).toEqual([{ folder: '1-bedroom', hasCover: true }]);
    const eb = disk.find((b) => b.folder === 'Empty-Building')!;
    expect(eb.hasCover).toBe(false);
    expect(eb.rooms).toEqual([]);
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run: `npx vitest run lib/content/loader.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement**

```ts
// lib/content/loader.ts
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

function isDir(p: string): boolean {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

/** Image filenames in a folder, sorted alphabetically but with cover.jpg first. */
export function listImages(dir: string): string[] {
  if (!isDir(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_RE.test(f))
    .sort();
  return files.sort((a, b) => (a === 'cover.jpg' ? -1 : b === 'cover.jpg' ? 1 : 0));
}

export type DiskRoom = { folder: string; hasCover: boolean };
export type DiskBuilding = { folder: string; hasCover: boolean; rooms: DiskRoom[] };

/** Scans a photos base directory into a normalized snapshot for validation/rendering. */
export function scanDisk(baseDir: string): DiskBuilding[] {
  if (!isDir(baseDir)) return [];
  return fs
    .readdirSync(baseDir)
    .filter((name) => isDir(path.join(baseDir, name)))
    .sort()
    .map((folder) => {
      const dir = path.join(baseDir, folder);
      const rooms: DiskRoom[] = fs
        .readdirSync(dir)
        .filter((name) => isDir(path.join(dir, name)))
        .sort()
        .map((roomFolder) => ({
          folder: roomFolder,
          hasCover: fs.existsSync(path.join(dir, roomFolder, 'cover.jpg')),
        }));
      return {
        folder,
        hasCover: fs.existsSync(path.join(dir, 'cover.jpg')),
        rooms,
      };
    });
}

/** Absolute base directory of committed photos. */
export const PHOTOS_BASE = path.join(process.cwd(), 'public', 'Phap_photos');

/** Public URL for an image inside a building (and optional room) folder. */
export function imageUrl(buildingFolder: string, file: string, roomFolder?: string): string {
  return roomFolder
    ? `/Phap_photos/${buildingFolder}/${roomFolder}/${file}`
    : `/Phap_photos/${buildingFolder}/${file}`;
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npx vitest run lib/content/loader.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/content/loader.ts lib/content/loader.test.ts lib/content/__fixtures__
git commit -m "feat: filesystem photo loader with fixtures"
```

---

### Task A6: Content validation (TDD, pure)

**Files:**
- Create: `lib/content/validate.ts`
- Test: `lib/content/validate.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/validate.test.ts
import { describe, it, expect } from 'vitest';
import { validateContent } from './validate';
import type { BuildingMeta } from './types';
import type { DiskBuilding } from './loader';

function building(over: Partial<BuildingMeta> = {}): BuildingMeta {
  return {
    slug: 'gilda-hotel', folder: 'Gilda-Hotel', name: 'Gilda Hotel', address: 'x',
    googleMapsUrl: 'https://maps', blurb: 'b', alt: 'a', sortOrder: 1,
    rooms: [{ slug: '1-bedroom', name: '1 Bedroom', price: '$1', blurb: 'b', status: 'available', alt: 'a' }],
    ...over,
  };
}
const okDisk: DiskBuilding[] = [
  { folder: 'Gilda-Hotel', hasCover: true, rooms: [{ folder: '1-bedroom', hasCover: true }] },
];

describe('validateContent', () => {
  it('passes for matching metadata and disk', () => {
    expect(validateContent([building()], okDisk).errors).toEqual([]);
  });
  it('errors when a disk folder has no metadata', () => {
    const r = validateContent([], okDisk);
    expect(r.errors.some((e) => e.includes('Gilda-Hotel') && e.includes('no metadata'))).toBe(true);
  });
  it('errors when metadata has no disk folder', () => {
    const r = validateContent([building()], []);
    expect(r.errors.some((e) => e.includes('no folder'))).toBe(true);
  });
  it('errors on duplicate building slugs', () => {
    const disk: DiskBuilding[] = [
      ...okDisk,
      { folder: 'Gilda Hotel', hasCover: true, rooms: [] },
    ];
    const r = validateContent(
      [building(), building({ folder: 'Gilda Hotel', rooms: [] })],
      disk,
    );
    expect(r.errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });
  it('errors when a building cover.jpg is missing', () => {
    const disk: DiskBuilding[] = [{ folder: 'Gilda-Hotel', hasCover: false, rooms: [{ folder: '1-bedroom', hasCover: true }] }];
    const r = validateContent([building()], disk);
    expect(r.errors.some((e) => e.includes('cover.jpg'))).toBe(true);
  });
  it('errors when a comingSoon building has room folders', () => {
    const r = validateContent([building({ comingSoon: true, rooms: [] })], okDisk);
    expect(r.errors.some((e) => e.includes('coming soon') || e.includes('comingSoon'))).toBe(true);
  });
  it('warns on placeholder price', () => {
    const r = validateContent(
      [building({ rooms: [{ slug: '1-bedroom', name: '1 Bedroom', price: '$— / month', blurb: 'b', status: 'available', alt: 'a' }] })],
      okDisk,
    );
    expect(r.warnings.some((w) => w.includes('placeholder'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/validate.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// lib/content/validate.ts
import type { BuildingMeta } from './types';
import type { DiskBuilding } from './loader';

export type ValidationResult = { errors: string[]; warnings: string[] };

/** Pure validation of metadata against a disk snapshot. Errors must block the build. */
export function validateContent(meta: BuildingMeta[], disk: DiskBuilding[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Slug uniqueness (buildings)
  const seen = new Set<string>();
  for (const b of meta) {
    if (seen.has(b.slug)) errors.push(`Duplicate building slug "${b.slug}"`);
    seen.add(b.slug);
  }

  const diskByFolder = new Map(disk.map((d) => [d.folder, d]));
  const metaByFolder = new Map(meta.map((m) => [m.folder, m]));

  // Disk folder with no metadata
  for (const d of disk) {
    if (!metaByFolder.has(d.folder)) {
      errors.push(`Building folder "${d.folder}" has no metadata in site.ts`);
    }
  }

  for (const b of meta) {
    const d = diskByFolder.get(b.folder);
    if (!d) {
      errors.push(`Building "${b.name}" (folder "${b.folder}") has no folder on disk`);
      continue;
    }

    if (b.comingSoon) {
      if (d.rooms.length > 0) {
        errors.push(`Building "${b.name}" is comingSoon but has room folders on disk`);
      }
      if (b.rooms.length > 0) {
        errors.push(`Building "${b.name}" is comingSoon but has room metadata`);
      }
      continue; // coming-soon buildings are exempt from cover/room checks below
    }

    if (!d.hasCover) errors.push(`Building "${b.folder}" is missing cover.jpg`);

    // Room slug uniqueness within building
    const roomSeen = new Set<string>();
    for (const r of b.rooms) {
      if (roomSeen.has(r.slug)) errors.push(`Duplicate room slug "${r.slug}" in "${b.name}"`);
      roomSeen.add(r.slug);
      if (r.price.includes('—')) warnings.push(`Room "${r.name}" in "${b.name}" has a placeholder price`);
    }

    // Room folder ↔ metadata drift + room covers
    const diskRoomFolders = new Set(d.rooms.map((r) => r.folder));
    const metaRoomFolders = new Set(b.rooms.map((r) => r.slug));
    for (const dr of d.rooms) {
      if (!metaRoomFolders.has(dr.folder)) {
        errors.push(`Room folder "${dr.folder}" in "${b.folder}" has no metadata`);
      }
      if (!dr.hasCover) errors.push(`Room "${dr.folder}" in "${b.folder}" is missing cover.jpg`);
    }
    for (const r of b.rooms) {
      if (!diskRoomFolders.has(r.slug)) {
        errors.push(`Room metadata "${r.slug}" in "${b.name}" has no folder on disk`);
      }
    }
  }

  return { errors, warnings };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/validate.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/validate.ts lib/content/validate.test.ts
git commit -m "feat: pure content validation (drift, slugs, covers, coming-soon)"
```

---

### Task A7: Centralized UI strings

**Files:**
- Create: `lib/content/strings.ts`

All user-facing UI copy lives here so a later translation pass is a clean copy. Components/pages import `t` and never hardcode display literals (proper nouns shown from data — e.g. contact values, language endonyms — are exempt). No test (data module).

- [ ] **Step 1: Write the strings module**

```ts
// lib/content/strings.ts
/** All English UI copy. Translate by copying this object per locale later. */
export const t = {
  brand: {
    name: 'Vĩnh House',
    subtitle: 'Apartments and Hotel Rentals — Da Nang',
    footerTagline:
      'Direct booked boutique apartments and hotels in Da Nang. Book direct, pay less, message the owner.',
  },
  nav: {
    buildings: 'Buildings',
    scooterRental: 'Scooter Rental',
    bookNow: 'Book now',
    selectLanguage: 'Select language',
    comingSoon: 'Coming soon',
  },
  booking: { whatsapp: 'WhatsApp', phone: 'Phone', facebook: 'Facebook', email: 'Email' },
  hero: { browse: 'Browse our buildings' },
  valueProps: [
    { title: 'Book direct, pay less', body: 'No platform fees or middlemen — you deal straight with us.' },
    { title: 'Message the owner directly', body: 'Questions answered by the people who run the buildings.' },
    { title: 'Local, Da Nang–based', body: 'On the ground in Da Nang, ready to help you settle in.' },
  ],
  scooter: {
    title: 'Getting around Da Nang',
    body: 'Rent a scooter and explore the city and coast at your own pace.',
    cta: 'Scooter rentals',
  },
  buildings: {
    heading: 'Our buildings',
    comingSoonShort: 'Details coming soon',
    roomType: 'room type',
    roomTypes: 'room types',
  },
  building: {
    viewOnMaps: 'View on Google Maps →',
    comingSoonTitle: 'Details coming soon',
    comingSoonBody: "We're preparing the listings for this building.",
  },
  room: { available: 'Available', notAvailable: 'Not available' },
  cta: {
    readyToBook: 'Ready to book?',
    readyToBookBody: "Message us directly — we'll help you find the right room.",
  },
} as const;
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors in `lib/content/strings.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/content/strings.ts
git commit -m "feat: centralized UI strings module"
```

---

## Phase B — Images & site metadata

### Task B1: Reorganize photos into raw (ignored) + committed conventions

This is a manual/curation task — no unit test. Goal: `public/Phap_photos_raw/` holds untouched originals (gitignored); `public/Phap_photos/` holds optimized images named to convention.

- [ ] **Step 1: Move raw originals aside and update gitignore**

```bash
git mv public/Phap_photos public/Phap_photos_raw 2>/dev/null || mv public/Phap_photos public/Phap_photos_raw
mkdir -p public/Phap_photos
```

Edit `.gitignore`: replace the line `/public/Phap_photos/` with:

```
# raw client originals (kept local; not committed)
/public/Phap_photos_raw/
```

(So `public/Phap_photos/` — the optimized set — IS committed.)

- [ ] **Step 2: Add the optimization script**

```bash
npm install --save-dev sharp
```

Create `scripts/optimize-image.mjs`:

```js
// Usage: node scripts/optimize-image.mjs <src> <dest> <maxWidth>
// Resizes (never upscales) to maxWidth and writes optimized JPEG.
import sharp from 'sharp';

const [, , src, dest, maxWidth] = process.argv;
if (!src || !dest || !maxWidth) {
  console.error('Usage: node scripts/optimize-image.mjs <src> <dest> <maxWidth>');
  process.exit(1);
}
await sharp(src)
  .rotate() // honor EXIF orientation
  .resize({ width: Number(maxWidth), withoutEnlargement: true })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(dest);
console.log(`✓ ${dest}`);
```

- [ ] **Step 3: Produce the committed image set**

Build this structure under `public/Phap_photos/` (cover is positional `cover.jpg`; max widths: building cover/gallery 1200, room gallery 1600). Run the optimizer for each chosen file. Example for Gilda Hotel:

```bash
mkdir -p public/Phap_photos/Gilda-Hotel/1-bedroom public/Phap_photos/Gilda-Hotel/2-bedroom
# Building cover + extra building shots (1200px):
node scripts/optimize-image.mjs public/Phap_photos_raw/Gilda-Hotel/building-front.jpg   public/Phap_photos/Gilda-Hotel/cover.jpg       1200
node scripts/optimize-image.mjs public/Phap_photos_raw/Gilda-Hotel/address-placard.jpg  public/Phap_photos/Gilda-Hotel/building-01.jpg 1200
# 1-bedroom room (cover + gallery at 1600px), repeat per source photo as room-01..NN:
node scripts/optimize-image.mjs public/Phap_photos_raw/Gilda-Hotel/1-bedroom/1br-room.jpeg    public/Phap_photos/Gilda-Hotel/1-bedroom/cover.jpg   1600
node scripts/optimize-image.mjs public/Phap_photos_raw/Gilda-Hotel/1-bedroom/1br-bed.jpeg     public/Phap_photos/Gilda-Hotel/1-bedroom/room-01.jpg 1600
# ...continue for each 1-bedroom and 2-bedroom photo (room-02.jpg, room-03.jpg, ...)
```

For **Azure-Apartments** (comingSoon — needs only a building cover, no room subfolders):

```bash
mkdir -p public/Phap_photos/Azure-Apartments
node scripts/optimize-image.mjs public/Phap_photos_raw/Azure-Apartments/20260617_104808.jpg public/Phap_photos/Azure-Apartments/cover.jpg 1200
```

- [ ] **Step 4: Produce the optimized hero image**

```bash
node scripts/optimize-image.mjs public/Da_Nang_skyline.jpg public/hero.jpg 1920
git rm --cached public/Da_Nang_skyline.jpg 2>/dev/null || true
```

Add `/public/Da_Nang_skyline.jpg` to `.gitignore` (raw original kept local, hero is `public/hero.jpg`).

- [ ] **Step 5: Verify sizes are reasonable, then commit**

```bash
du -sh public/Phap_photos public/hero.jpg
git add .gitignore scripts/optimize-image.mjs package.json package-lock.json public/Phap_photos public/hero.jpg
git commit -m "build: optimized committed photo set + hero, raw originals gitignored"
```

Expected: `public/Phap_photos` is a few MB (not 21 MB); `public/hero.jpg` well under 1 MB.

---

### Task B2: Author `lib/content/site.ts`

**Files:**
- Create: `lib/content/site.ts`

Build metadata must match the folders produced in B1. Real contacts are placeholders (client provides later). Slugs must equal `slugify(folder)`.

- [ ] **Step 1: Write the metadata module**

```ts
// lib/content/site.ts
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
    blurb: 'Boutique rooms in An Hải, steps from the beach.',
    alt: 'Exterior and rooms at Gilda Hotel in Da Nang',
    sortOrder: 1,
    rooms: [
      { slug: '1-bedroom', name: '1 Bedroom', price: '$— / month', blurb: 'Description coming soon.', status: 'available', alt: '1-bedroom apartment at Gilda Hotel' },
      { slug: '2-bedroom', name: '2 Bedroom', price: '$— / month', blurb: 'Description coming soon.', status: 'available', alt: '2-bedroom apartment at Gilda Hotel' },
    ],
  },
  {
    slug: 'azure-apartments',
    folder: 'Azure-Apartments',
    name: 'Azure Apartments',
    address: 'Da Nang, Vietnam',
    googleMapsUrl: 'https://maps.google.com/?q=Da+Nang',
    blurb: 'Details coming soon.',
    alt: 'Azure Apartments in Da Nang',
    sortOrder: 2,
    comingSoon: true,
    rooms: [],
  },
];

/** Nav-safe building list (excludes hidden), sorted. For client components. */
export function buildingNav(): { slug: string; name: string; comingSoon: boolean }[] {
  return buildings
    .filter((b) => !b.hidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => ({ slug: b.slug, name: b.name, comingSoon: !!b.comingSoon }));
}
```

> NOTE: The room slugs/folders here MUST match B1's folders exactly. If you named room folders differently, update either side so `validateContent` passes in Task F1.

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors in `lib/content/site.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/content/site.ts
git commit -m "feat: site content metadata (placeholders)"
```

---

### Task B3: Resolved content API (merges metadata + disk images)

**Files:**
- Create: `lib/content/index.ts`
- Test: `lib/content/index.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/index.test.ts
import { describe, it, expect } from 'vitest';
import { resolveBuilding } from './index';
import type { BuildingMeta } from './types';

const meta: BuildingMeta = {
  slug: 'gilda-hotel', folder: 'Gilda-Hotel', name: 'Gilda Hotel', address: 'x',
  googleMapsUrl: 'https://m', blurb: 'b', alt: 'A building', sortOrder: 1,
  rooms: [{ slug: '1-bedroom', name: '1 Bedroom', price: '$1', blurb: 'b', status: 'available', alt: 'A room' }],
};

describe('resolveBuilding', () => {
  it('maps disk image filenames to public URLs with alt defaults', () => {
    const r = resolveBuilding(meta, {
      'Gilda-Hotel': ['cover.jpg', 'building-01.jpg'],
      'Gilda-Hotel/1-bedroom': ['cover.jpg', 'room-01.jpg'],
    });
    expect(r.cover).toEqual({ src: '/Phap_photos/Gilda-Hotel/cover.jpg', alt: 'A building' });
    expect(r.images.map((i) => i.src)).toEqual([
      '/Phap_photos/Gilda-Hotel/cover.jpg',
      '/Phap_photos/Gilda-Hotel/building-01.jpg',
    ]);
    expect(r.rooms[0].cover.src).toBe('/Phap_photos/Gilda-Hotel/1-bedroom/cover.jpg');
    expect(r.rooms[0].images[1].alt).toBe('A room');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/content/index.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// lib/content/index.ts
import type { BuildingMeta, RoomMeta } from './types';
import { listImages, scanDisk, imageUrl, PHOTOS_BASE } from './loader';
import { buildings } from './site';
import path from 'node:path';

export type Img = { src: string; alt: string };
export type ResolvedRoom = RoomMeta & { buildingSlug: string; buildingName: string; cover: Img; images: Img[] };
export type ResolvedBuilding = BuildingMeta & { cover: Img | null; images: Img[]; resolvedRooms: ResolvedRoom[] };

/** Pure resolver: merges metadata with a map of folderPath -> image filenames. */
export function resolveBuilding(
  meta: BuildingMeta,
  imagesByPath: Record<string, string[]>,
): ResolvedBuilding & { rooms: ResolvedRoom[] } {
  const bFiles = imagesByPath[meta.folder] ?? [];
  const images = bFiles.map((f) => ({ src: imageUrl(meta.folder, f), alt: meta.alt }));
  const cover = images[0] ?? null;
  const resolvedRooms: ResolvedRoom[] = meta.rooms.map((r) => {
    const rFiles = imagesByPath[`${meta.folder}/${r.slug}`] ?? [];
    const rImages = rFiles.map((f) => ({ src: imageUrl(meta.folder, f, r.slug), alt: r.alt }));
    return { ...r, buildingSlug: meta.slug, buildingName: meta.name, cover: rImages[0] ?? { src: '', alt: r.alt }, images: rImages };
  });
  return { ...meta, cover, images, resolvedRooms, rooms: resolvedRooms };
}

/** Build-time: scan disk and produce a folderPath -> filenames map for a building. */
function imagesMapFor(meta: BuildingMeta): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  map[meta.folder] = listImages(path.join(PHOTOS_BASE, meta.folder));
  for (const r of meta.rooms) {
    map[`${meta.folder}/${r.slug}`] = listImages(path.join(PHOTOS_BASE, meta.folder, r.slug));
  }
  return map;
}

/** All visible (non-hidden) buildings, sorted, with resolved images. */
export function getBuildings(): ResolvedBuilding[] {
  return buildings
    .filter((b) => !b.hidden)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => resolveBuilding(b, imagesMapFor(b)));
}

export function getBuilding(slug: string): ResolvedBuilding | undefined {
  return getBuildings().find((b) => b.slug === slug);
}

export function getRoom(buildingSlug: string, roomSlug: string): ResolvedRoom | undefined {
  return getBuilding(buildingSlug)?.resolvedRooms.find((r) => r.slug === roomSlug);
}

/** Current disk snapshot for validation. */
export { scanDisk, PHOTOS_BASE };
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/content/index.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add lib/content/index.ts lib/content/index.test.ts
git commit -m "feat: resolved content API merging metadata + disk images"
```

---

## Phase C — Components

> All components below: after writing, run `npx tsc --noEmit` and `npm run lint`; fix errors; then commit. Visual correctness is confirmed in Phase D's manual browser check.

### Task C1: `BookNowMenu` (client dropdown)

**Files:**
- Create: `components/BookNowMenu.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/BookNowMenu.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { Contacts } from '@/lib/content/types';
import { buildInquiryLinks } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

type Props = { contacts: Contacts; message: string; label?: string };

export default function BookNowMenu({ contacts, message, label = t.nav.bookNow }: Props) {
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
        className="rounded-lg bg-accent-gold px-5 py-2.5 font-medium text-text-inverse shadow-lg shadow-black/30 transition hover:brightness-105"
      >
        {label}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl"
        >
          {links.whatsapp && <a role="menuitem" className={item} href={links.whatsapp} target="_blank" rel="noopener noreferrer">{t.booking.whatsapp}</a>}
          {links.phone && <a role="menuitem" className={item} href={links.phone}>{t.booking.phone}</a>}
          {links.facebook && <a role="menuitem" className={item} href={links.facebook} target="_blank" rel="noopener noreferrer">{t.booking.facebook}</a>}
          {links.email && <a role="menuitem" className={item} href={links.email}>{t.booking.email}</a>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add components/BookNowMenu.tsx
git commit -m "feat: BookNowMenu dropdown (contextual inquiry links)"
```

---

### Task C2: `LanguageMenu` (client dropdown, EN active)

**Files:**
- Create: `components/LanguageMenu.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/LanguageMenu.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { t } from '@/lib/content/strings';

const LANGS = [
  { code: 'en', flag: '🇬🇧', name: 'English', active: true },
  { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt', active: false },
  { code: 'ko', flag: '🇰🇷', name: '한국어', active: false },
  { code: 'zh', flag: '🇨🇳', name: '中文', active: false },
  { code: 'ru', flag: '🇷🇺', name: 'Русский', active: false },
];

export default function LanguageMenu() {
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
        aria-label={t.nav.selectLanguage}
        className="rounded-lg px-2 py-1.5 text-xl leading-none hover:bg-surface-elevated"
      >
        🇬🇧
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {LANGS.map((l) => (
            <div
              key={l.code}
              role="menuitem"
              aria-disabled={!l.active}
              className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                l.active ? 'text-text-primary' : 'cursor-not-allowed text-text-muted'
              }`}
            >
              <span><span className="mr-2">{l.flag}</span>{l.name}</span>
              {!l.active && <span className="text-xs italic">{t.nav.comingSoon}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add components/LanguageMenu.tsx
git commit -m "feat: LanguageMenu (EN active, others coming soon)"
```

---

### Task C3: `BuildingsMenu` (client dropdown)

**Files:**
- Create: `components/BuildingsMenu.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/BuildingsMenu.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { t } from '@/lib/content/strings';

type Item = { slug: string; name: string; comingSoon: boolean };

export default function BuildingsMenu({ items }: { items: Item[] }) {
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
        {t.nav.buildings} ▾
      </button>
      {open && (
        <div role="menu" className="absolute left-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card shadow-2xl">
          {items.map((b) => (
            <Link
              key={b.slug}
              role="menuitem"
              href={`/buildings/${b.slug}`}
              className="flex items-center justify-between px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated"
              onClick={() => setOpen(false)}
            >
              {b.name}
              {b.comingSoon && <span className="text-xs italic text-text-muted">{t.nav.comingSoon}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add components/BuildingsMenu.tsx
git commit -m "feat: BuildingsMenu dropdown"
```

---

### Task C4: `Navbar`

**Files:**
- Create: `components/Navbar.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/Navbar.tsx
import Image from 'next/image';
import Link from 'next/link';
import BuildingsMenu from './BuildingsMenu';
import LanguageMenu from './LanguageMenu';
import BookNowMenu from './BookNowMenu';
import { contacts, buildingNav } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-subtle)] bg-navbar-forest">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Vĩnh House logo" width={40} height={40} className="rounded" />
          <span className="leading-tight">
            <span className="block font-heading text-xl text-text-accent">{t.brand.name}</span>
            <span className="block text-[11px] text-text-muted">{t.brand.subtitle}</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <BuildingsMenu items={buildingNav()} />
          <a
            href={contacts.motorbikeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated sm:block"
          >
            {t.nav.scooterRental}
          </a>
          <LanguageMenu />
          <BookNowMenu contacts={contacts} message={inquiryMessage({})} />
        </div>
      </nav>
    </header>
  );
}
```

> NOTE on mobile: this lean version keeps Book now + language always visible and hides only "Scooter Rental" below `sm`. A full hamburger is a future enhancement; the spec's mobile requirement (Book now stays visible) is satisfied.

- [ ] **Step 2: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add components/Navbar.tsx
git commit -m "feat: Navbar with buildings/language/book-now and scooter link"
```

---

### Task C5: `Footer`

**Files:**
- Create: `components/Footer.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/Footer.tsx
import Image from 'next/image';
import { contacts } from '@/lib/content/site';
import { whatsappUrl, telUrl, mailtoUrl } from '@/lib/contacts';
import { t } from '@/lib/content/strings';

export default function Footer() {
  const wa = whatsappUrl(contacts.whatsapp);
  const tel = telUrl(contacts.phone);
  const mail = mailtoUrl(contacts.email);
  const link = 'text-sm text-text-secondary hover:text-text-accent';
  return (
    <footer className="mt-20 border-t border-[var(--color-border-subtle)] bg-navbar-forest">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="Vĩnh House logo" width={44} height={44} className="rounded" />
          <div>
            <p className="font-heading text-2xl text-text-accent">{t.brand.name}</p>
            <p className="mt-1 max-w-md text-sm text-text-muted">{t.brand.footerTagline}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {mail && <a className={link} href={mail}>{contacts.email}</a>}
          {tel && <a className={link} href={tel}>{contacts.phone}</a>}
          {wa && <a className={link} href={wa} target="_blank" rel="noopener noreferrer">{t.booking.whatsapp}</a>}
          {contacts.facebook && <a className={link} href={contacts.facebook} target="_blank" rel="noopener noreferrer">{t.booking.facebook}</a>}
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add components/Footer.tsx
git commit -m "feat: Footer with business name, subtext, and contacts"
```

---

### Task C6: `Hero`, `ValueProps`, `ScooterBand`, `BuildingShowcase`

**Files:**
- Create: `components/Hero.tsx`
- Create: `components/ValueProps.tsx`
- Create: `components/ScooterBand.tsx`
- Create: `components/BuildingShowcase.tsx`

- [ ] **Step 1: Write `Hero.tsx`**

```tsx
// components/Hero.tsx
import Image from 'next/image';
import BookNowMenu from './BookNowMenu';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      <Image src="/hero.jpg" alt="Da Nang skyline" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-brand-forest/70" />
      <div className="relative z-10 px-4 text-center">
        <h1 className="font-heading text-5xl text-text-accent sm:text-6xl">{t.brand.name}</h1>
        <p className="mt-3 text-lg text-text-primary">{t.brand.subtitle}</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <BookNowMenu contacts={contacts} message={inquiryMessage({})} />
          <a href="#buildings" className="rounded-lg border border-accent-gold px-5 py-2.5 text-sm text-text-accent hover:bg-surface-elevated">
            {t.hero.browse}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `ValueProps.tsx`**

```tsx
// components/ValueProps.tsx
import Container from './Container';
import { t } from '@/lib/content/strings';

export default function ValueProps() {
  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-8 sm:grid-cols-3">
          {t.valueProps.map((p) => (
            <div key={p.title}>
              <h3 className="font-heading text-2xl text-text-accent">{p.title}</h3>
              <p className="mt-2 text-text-secondary">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Write `ScooterBand.tsx`**

```tsx
// components/ScooterBand.tsx
import Container from './Container';
import { contacts } from '@/lib/content/site';
import { t } from '@/lib/content/strings';

export default function ScooterBand() {
  return (
    <section className="bg-surface-secondary py-12">
      <Container>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-2xl text-text-accent">{t.scooter.title}</h3>
            <p className="mt-1 text-text-secondary">{t.scooter.body}</p>
          </div>
          <a
            href={contacts.motorbikeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent-gold px-5 py-2.5 font-medium text-text-inverse hover:brightness-105"
          >
            {t.scooter.cta}
          </a>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Write `BuildingShowcase.tsx`**

```tsx
// components/BuildingShowcase.tsx
import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';
import { getBuildings } from '@/lib/content';
import { t } from '@/lib/content/strings';

export default function BuildingShowcase() {
  const buildings = getBuildings();
  return (
    <section id="buildings" className="py-16">
      <Container>
        <h2 className="font-heading text-4xl text-text-accent">{t.buildings.heading}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <Link
              key={b.slug}
              href={`/buildings/${b.slug}`}
              className="block overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card"
            >
              {b.cover && (
                <Image src={b.cover.src} alt={b.cover.alt} width={480} height={300}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-48 w-full object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-heading text-2xl text-text-primary">{b.name}</h3>
                <p className="text-sm text-text-muted">{b.address}</p>
                <p className="mt-2 text-sm text-text-accent">
                  {b.comingSoon
                    ? t.buildings.comingSoonShort
                    : `${b.resolvedRooms.length} ${b.resolvedRooms.length === 1 ? t.buildings.roomType : t.buildings.roomTypes}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 5: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add components/Hero.tsx components/ValueProps.tsx components/ScooterBand.tsx components/BuildingShowcase.tsx
git commit -m "feat: Hero, ValueProps, ScooterBand, BuildingShowcase"
```

---

## Phase D — Pages, routing, layout

### Task D1: Remove Supabase-backed public pages

**Files:**
- Delete: `app/buildings/[id]/` (whole dir)
- Delete: `app/rooms/[id]/` (whole dir)

(The old `app/buildings/[id]` dynamic segment name conflicts with the new `[buildingSlug]`; it must be removed.)

- [ ] **Step 1: Delete and verify nothing else imports them**

```bash
git rm -r "app/buildings/[id]" "app/rooms/[id]"
grep -rn "from '@/components/RoomCard'" app components || echo "RoomCard now unused by public (OK)"
```

- [ ] **Step 2: Commit**

```bash
git commit -m "refactor: remove Supabase-backed public building/room pages"
```

---

### Task D2: Root layout — Navbar + Footer + metadata + fonts

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const heading = Cormorant_Garamond({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin'], variable: '--font-body-loaded' });

export const metadata: Metadata = {
  title: { default: 'Vĩnh House — Apartments and Hotel Rentals in Da Nang', template: '%s — Vĩnh House Da Nang' },
  description: 'Direct booked boutique apartments and hotels in Da Nang. Book direct, pay less, message the owner.',
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'Vĩnh House — Apartments and Hotel Rentals in Da Nang',
    description: 'Direct booked boutique apartments and hotels in Da Nang. Book direct, pay less, message the owner.',
    images: ['/hero.jpg'],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="bg-brand-forest text-text-primary">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add app/layout.tsx
git commit -m "feat: app shell (Navbar + Footer), site metadata, favicon"
```

---

### Task D3: Landing page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import BuildingShowcase from '@/components/BuildingShowcase';
import ScooterBand from '@/components/ScooterBand';
import Container from '@/components/Container';
import BookNowMenu from '@/components/BookNowMenu';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProps />
      <BuildingShowcase />
      <ScooterBand />
      <section className="py-16">
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-heading text-3xl text-text-accent">{t.cta.readyToBook}</h2>
            <p className="text-text-secondary">{t.cta.readyToBookBody}</p>
            <BookNowMenu contacts={contacts} message={inquiryMessage({})} />
          </div>
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add app/page.tsx
git commit -m "feat: landing page composition"
```

---

### Task D4: Building detail page

**Files:**
- Create: `app/buildings/[buildingSlug]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
// app/buildings/[buildingSlug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import BookNowMenu from '@/components/BookNowMenu';
import { getBuildings, getBuilding } from '@/lib/content';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export function generateStaticParams() {
  return getBuildings().map((b) => ({ buildingSlug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ buildingSlug: string }> }): Promise<Metadata> {
  const { buildingSlug } = await params;
  const b = getBuilding(buildingSlug);
  if (!b) return {};
  return {
    title: b.name,
    description: b.blurb,
    openGraph: { title: `${b.name} — Vĩnh House Da Nang`, description: b.blurb, images: b.cover ? [b.cover.src] : [] },
  };
}

export default async function BuildingPage({ params }: { params: Promise<{ buildingSlug: string }> }) {
  const { buildingSlug } = await params;
  const b = getBuilding(buildingSlug);
  if (!b) notFound();

  return (
    <Container>
      <div className="mt-10">
        <h1 className="font-heading text-4xl text-text-accent">{b.name}</h1>
        <p className="text-text-muted">{b.address}</p>
        {b.googleMapsUrl && (
          <a href={b.googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-text-accent hover:underline">
            {t.building.viewOnMaps}
          </a>
        )}
        <p className="mt-4 max-w-2xl text-text-secondary">{b.blurb}</p>
      </div>

      {b.comingSoon ? (
        <div className="my-12 rounded-lg border border-[var(--color-border-default)] bg-surface-card p-8 text-center">
          <p className="font-heading text-2xl text-text-accent">{t.building.comingSoonTitle}</p>
          <p className="mt-2 text-text-secondary">{t.building.comingSoonBody}</p>
          <div className="mt-6 flex justify-center">
            <BookNowMenu contacts={contacts} message={inquiryMessage({ building: b.name })} />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {b.resolvedRooms.map((r) => (
              <Link key={r.slug} href={`/buildings/${b.slug}/${r.slug}`}
                className="relative block overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-surface-card">
                {r.cover.src && <Image src={r.cover.src} alt={r.cover.alt} width={480} height={320}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-52 w-full object-cover" />}
                <span className="absolute left-3 top-3 rounded-full bg-accent-gold px-3 py-1 text-sm font-medium text-text-inverse">{r.price}</span>
                <span className="absolute right-3 top-3 rounded-full px-2 py-1 text-xs"
                  style={{ background: r.status === 'available' ? 'var(--color-status-confirmed-bg)' : 'var(--color-status-cancelled-bg)' }}>
                  {r.status === 'available' ? t.room.available : t.room.notAvailable}
                </span>
                <div className="p-4"><h3 className="font-heading text-xl text-text-primary">{r.name}</h3></div>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <BookNowMenu contacts={contacts} message={inquiryMessage({ building: b.name })} />
          </div>
        </>
      )}
    </Container>
  );
}
```

- [ ] **Step 2: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add "app/buildings/[buildingSlug]/page.tsx"
git commit -m "feat: building detail page (coming-soon aware, maps button)"
```

---

### Task D5: Room detail page

**Files:**
- Create: `app/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx`
- Create: `components/RoomGallery.tsx` (client wrapper around `ImageLightbox`)

- [ ] **Step 1: Write `components/RoomGallery.tsx`**

```tsx
// components/RoomGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageLightbox from './ImageLightbox';

type Img = { src: string; alt: string };

export default function RoomGallery({ images }: { images: Img[] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <button className="block w-full" onClick={() => setIndex(0)} aria-label="Open gallery">
        <Image src={images[0].src} alt={images[0].alt} width={960} height={600} priority
          className="max-h-[28rem] w-full rounded-lg object-cover" />
      </button>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.slice(1).map((img, i) => (
            <button key={img.src} onClick={() => setIndex(i + 1)} aria-label={`Open image ${i + 2}`}>
              <Image src={img.src} alt={img.alt} width={240} height={160} className="h-28 w-full rounded object-cover" />
            </button>
          ))}
        </div>
      )}
      {index !== null && (
        <ImageLightbox
          images={images}
          currentIndex={index}
          onClose={() => setIndex(null)}
          onNext={() => setIndex((i) => (i === null ? 0 : (i + 1) % images.length))}
          onPrevious={() => setIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length))}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Write the room page**

```tsx
// app/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import RoomGallery from '@/components/RoomGallery';
import BookNowMenu from '@/components/BookNowMenu';
import { getBuildings, getBuilding, getRoom } from '@/lib/content';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export function generateStaticParams() {
  return getBuildings()
    .filter((b) => !b.comingSoon)
    .flatMap((b) => b.resolvedRooms.map((r) => ({ buildingSlug: b.slug, roomTypeSlug: r.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ buildingSlug: string; roomTypeSlug: string }> }): Promise<Metadata> {
  const { buildingSlug, roomTypeSlug } = await params;
  const room = getRoom(buildingSlug, roomTypeSlug);
  if (!room) return {};
  return {
    title: `${room.name} at ${room.buildingName}`,
    description: room.blurb,
    openGraph: { title: `${room.name} at ${room.buildingName} — Vĩnh House`, description: room.blurb, images: room.cover.src ? [room.cover.src] : [] },
  };
}

export default async function RoomPage({ params }: { params: Promise<{ buildingSlug: string; roomTypeSlug: string }> }) {
  const { buildingSlug, roomTypeSlug } = await params;
  const building = getBuilding(buildingSlug);
  const room = getRoom(buildingSlug, roomTypeSlug);
  if (!building || building.comingSoon || !room) notFound();

  // Build absolute URL for the inquiry message.
  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const url = host ? `${proto}://${host}/buildings/${buildingSlug}/${roomTypeSlug}` : '';
  const message = inquiryMessage({ building: building.name, roomType: room.name, url });

  const available = room.status === 'available';
  return (
    <Container>
      <Link href={`/buildings/${building.slug}`} className="mt-8 inline-block text-sm text-text-muted hover:text-text-accent">
        ← {building.name}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <h1 className="font-heading text-4xl text-text-accent">{room.name}</h1>
        <span className="rounded-full bg-accent-gold px-3 py-1 text-text-inverse">{room.price}</span>
        <span className={available ? 'text-status-confirmed' : 'text-status-cancelled'}>
          {available ? t.room.available : t.room.notAvailable}
        </span>
      </div>
      <p className="mt-4 max-w-2xl text-text-secondary">{room.blurb}</p>

      <div className="mt-6">
        <RoomGallery images={room.images} />
      </div>

      <div className="mt-8">
        <BookNowMenu contacts={contacts} message={message} />
      </div>
    </Container>
  );
}
```

> NOTE: `headers()` makes this route dynamic at request time so the inquiry URL is correct on any deploy domain. This is acceptable for a no-DB site. If fully static export is later required, swap to a configured base URL constant instead of `headers()`.

- [ ] **Step 3: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add "app/buildings/[buildingSlug]/[roomTypeSlug]/page.tsx" components/RoomGallery.tsx
git commit -m "feat: room detail page with gallery and contextual booking"
```

---

## Phase E — SEO extras

### Task E1: Sitemap & robots

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Write `app/sitemap.ts`**

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getBuildings } from '@/lib/content';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vinh-house.example';

export default function sitemap(): MetadataRoute.Sitemap {
  const buildings = getBuildings();
  const urls: MetadataRoute.Sitemap = [{ url: BASE, priority: 1 }];
  for (const b of buildings) {
    urls.push({ url: `${BASE}/buildings/${b.slug}` });
    if (!b.comingSoon) {
      for (const r of b.resolvedRooms) {
        urls.push({ url: `${BASE}/buildings/${b.slug}/${r.slug}` });
      }
    }
  }
  return urls;
}
```

- [ ] **Step 2: Write `app/robots.ts`**

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vinh-house.example';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Typecheck, lint, commit**

```bash
npx tsc --noEmit && npm run lint
git add app/sitemap.ts app/robots.ts
git commit -m "feat: sitemap and robots"
```

---

## Phase F — Validation wiring & final verification

### Task F1: Real-content validation test + prebuild gate

**Files:**
- Create: `lib/content/content-integrity.test.ts`
- Modify: `package.json` (add `prebuild`)

- [ ] **Step 1: Write the integrity test (runs against real content)**

```ts
// lib/content/content-integrity.test.ts
import { describe, it, expect } from 'vitest';
import { buildings } from './site';
import { scanDisk, PHOTOS_BASE } from './loader';
import { validateContent } from './validate';
import { slugify } from './slug';

describe('content integrity (real folders + site.ts)', () => {
  it('every building slug equals slugify(folder)', () => {
    for (const b of buildings) expect(b.slug).toBe(slugify(b.folder));
  });
  it('has no validation errors', () => {
    const result = validateContent(buildings, scanDisk(PHOTOS_BASE));
    if (result.errors.length) console.error('Content errors:\n' + result.errors.join('\n'));
    if (result.warnings.length) console.warn('Content warnings:\n' + result.warnings.join('\n'));
    expect(result.errors).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it against the real content**

Run: `npx vitest run lib/content/content-integrity.test.ts`
Expected: PASS. If it FAILS, the printed errors tell you exactly which folder/metadata is out of sync — fix `site.ts` or the folders (Task B1/B2) until it passes. (Placeholder-price warnings are expected and do not fail.)

- [ ] **Step 3: Add the prebuild gate**

In `package.json` scripts, add:

```json
"prebuild": "vitest run"
```

(So `npm run build` runs the full test suite — including content integrity — first, and aborts on failure.)

- [ ] **Step 4: Commit**

```bash
git add lib/content/content-integrity.test.ts package.json
git commit -m "feat: content integrity test wired into prebuild"
```

---

### Task F2: Full build + manual verification

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all suites pass (slug, contacts, inquiry, loader, validate, index, content-integrity, plus existing photos/storage-utils tests).

- [ ] **Step 2: Production build (no Supabase env vars set)**

Run: `unset NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY; npm run build`
Expected: build succeeds; `prebuild` tests pass; building/room routes appear in the build output as static where possible. No build-time Supabase connection error from public routes.

- [ ] **Step 3: Manual browser check**

Run: `npm run dev`, then verify at `http://localhost:3000`:
- Hero shows the optimized skyline + "Vĩnh House"; "Browse our buildings" scrolls to the grid.
- Navbar: logo + title + subtitle; Buildings dropdown lists Gilda Hotel and Azure Apartments (Azure tagged "Coming soon"); Scooter Rental opens `vinhphatmotorbikes.com` in a new tab; Language dropdown shows EN active and others "Coming soon"; Book now dropdown shows WhatsApp/Phone/Facebook/Email.
- WhatsApp link opens with the generic prefilled message; on a room page it includes building + room type + URL.
- `/buildings/gilda-hotel` shows room cards with price pill + status and a "View on Google Maps" button.
- `/buildings/gilda-hotel/1-bedroom` shows the gallery (lightbox opens) and a Book now with the room-specific message.
- `/buildings/azure-apartments` shows the "Details coming soon" state and generates NO room links.
- Footer shows business name, subtext, and the four contacts.
- Mobile width: Book now stays visible.

- [ ] **Step 4: Commit any fixes, then finalize**

```bash
git add -A
git commit -m "fix: address issues found during build/manual verification" || echo "nothing to fix"
```

---

## Acceptance criteria (from spec — verify before done)

- [ ] Public pages build **without** Supabase env vars (Task F2 Step 2).
- [ ] No Supabase imports in public routes/components (`grep -rn "lib/supabase" app/page.tsx "app/buildings" "app/sitemap.ts"` → none).
- [ ] All non-hidden building folders generate building pages; `hidden` would generate none.
- [ ] Coming-soon (Azure) generates no room pages/cards (Task D5 `generateStaticParams` filter + Task D4 branch).
- [ ] Every visible room shows price/status/blurb (placeholder or real).
- [ ] Every inquiry button opens the correct action; building/room pages use the contextual message.
- [ ] Mobile navbar keeps Book now visible.
- [ ] Only optimized images committed; raw originals gitignored (`public/Phap_photos_raw/`, `public/Da_Nang_skyline.jpg`).
- [ ] No `Information.txt` read at runtime (metadata lives in `site.ts`).
- [ ] `validateContent` passes (Task F1).
- [ ] Lighthouse mobile performance ≥ 85 (target; run Chrome DevTools Lighthouse on the landing page after build).

## Follow-ups for the client (not blockers)

- Replace placeholder contacts in `lib/content/site.ts` (email, WhatsApp, Facebook; confirm phone).
- Provide Azure Apartments content (rooms, photos, info), then remove its `comingSoon` flag and add room metadata + folders.
- Provide real room prices, blurbs, availability.
- Sign-off on "Book direct, pay less" copy.
- Translations for VI / KO / ZH / RU — all UI copy is centralized in `lib/content/strings.ts` (Task A7), so each locale is a copy of that object plus wiring the language dropdown to switch.
```
