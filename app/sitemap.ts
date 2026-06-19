import type { MetadataRoute } from 'next';
import { getBuildings } from '@/lib/content';
import { routing } from '@/i18n/routing';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vinh-house.example';

function prefix(locale: string): string {
  if (locale === routing.defaultLocale) return '';
  if (locale === 'zh-Hans') return '/zh';
  return `/${locale}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const p = prefix(locale);
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
