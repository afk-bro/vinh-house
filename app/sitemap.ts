import type { MetadataRoute } from 'next';
import { getBuildings } from '@/lib/content';
import { routing } from '@/i18n/routing';
import { localePrefix, SITE_URL as BASE } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const p = localePrefix(locale);
    // Use `/` for the default (unprefixed) locale so the home URL matches its canonical.
    urls.push({ url: `${BASE}${p || '/'}`, priority: 1 });
    for (const b of getBuildings(locale)) {
      urls.push({ url: `${BASE}${p}/buildings/${b.slug}` });
      if (!b.comingSoon) {
        for (const r of b.resolvedRooms) urls.push({ url: `${BASE}${p}/buildings/${b.slug}/${r.slug}` });
      }
    }
  }
  return urls;
}
