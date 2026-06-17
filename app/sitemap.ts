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
