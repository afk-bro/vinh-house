// lib/jsonld.ts — schema.org LodgingBusiness structured data for SEO rich results.
import { localePrefix, SITE_URL as BASE } from './seo';

/** Resolves a content path (relative or absolute) to an absolute URL. */
function absUrl(path: string): string {
  if (!path) return BASE;
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

type LodgingInput = {
  locale: string;
  /** Page path without the locale prefix, e.g. `/buildings/gilda-hotel`. */
  path: string;
  name: string;
  description: string;
  /** Content image src (relative or absolute). */
  image?: string;
  streetAddress?: string;
  telephone?: string;
  /** Nightly price in VND, if known (numeric). */
  priceVnd?: number | null;
  /** Whether the room is available; `false` emits an OutOfStock Offer. Defaults to in-stock. */
  available?: boolean;
};

/** Builds a JSON.stringify-ready LodgingBusiness object for a building or room page. */
export function lodgingJsonLd(input: LodgingInput): string {
  const url = absUrl(`${localePrefix(input.locale)}${input.path}`);
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: input.name,
    description: input.description,
    url,
    address: {
      '@type': 'PostalAddress',
      ...(input.streetAddress ? { streetAddress: input.streetAddress } : {}),
      addressLocality: 'Da Nang',
      addressCountry: 'VN',
    },
  };
  if (input.image) data.image = absUrl(input.image);
  if (input.telephone) data.telephone = input.telephone;
  if (input.priceVnd && input.priceVnd > 0) {
    data.priceRange = `${input.priceVnd.toLocaleString('en-US')}₫`;
    data.makesOffer = {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: input.priceVnd,
      availability:
        input.available === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    };
  }
  // Escape `<` so the JSON can't break out of the inline <script> tag,
  // even if content ever becomes CMS-editable.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
