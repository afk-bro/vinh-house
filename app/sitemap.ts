import type { MetadataRoute } from 'next';
import { getBuildings } from '@/lib/content';
import { routing } from '@/i18n/routing';
import { localePrefix } from '@/lib/seo';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vinh-house.example';

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const p = localePrefix(locale);
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
