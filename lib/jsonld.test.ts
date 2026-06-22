import { describe, it, expect } from 'vitest';
import { lodgingJsonLd } from './jsonld';

// NEXT_PUBLIC_SITE_URL is unset in tests, so BASE is the fallback origin.
const BASE = 'https://vinh-house.example';

describe('lodgingJsonLd', () => {
  it('builds a LodgingBusiness with absolute url + image and a PostalAddress', () => {
    const d = JSON.parse(
      lodgingJsonLd({
        locale: 'en',
        path: '/buildings/gilda-hotel',
        name: 'Gilda Hotel',
        description: 'A nice place',
        image: '/photos/cover.jpg',
        streetAddress: '89 Cao Bá Quát',
        telephone: '+84 90 000 0000',
      }),
    );
    expect(d['@context']).toBe('https://schema.org');
    expect(d['@type']).toBe('LodgingBusiness');
    expect(d.url).toBe(`${BASE}/buildings/gilda-hotel`);
    expect(d.image).toBe(`${BASE}/photos/cover.jpg`);
    expect(d.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: '89 Cao Bá Quát',
      addressLocality: 'Da Nang',
      addressCountry: 'VN',
    });
    expect(d.telephone).toBe('+84 90 000 0000');
    expect(d.makesOffer).toBeUndefined();
  });

  it('returns BASE as the url for the home path', () => {
    const d = JSON.parse(lodgingJsonLd({ locale: 'en', path: '', name: 'N', description: 'D' }));
    expect(d.url).toBe(BASE);
  });

  it('prefixes non-default locales in the url (zh-Hans → /zh)', () => {
    const d = JSON.parse(
      lodgingJsonLd({ locale: 'zh-Hans', path: '/buildings/x', name: 'X', description: 'Y' }),
    );
    expect(d.url).toBe(`${BASE}/zh/buildings/x`);
  });

  it('adds an InStock VND Offer when priceVnd is set', () => {
    const d = JSON.parse(
      lodgingJsonLd({
        locale: 'en',
        path: '/buildings/x/1-bedroom',
        name: 'Room',
        description: 'D',
        priceVnd: 700000,
      }),
    );
    expect(d.priceRange).toBe('700,000₫');
    expect(d.makesOffer).toEqual({
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: 700000,
      availability: 'https://schema.org/InStock',
    });
  });

  it('emits an OutOfStock Offer when available is false', () => {
    const d = JSON.parse(
      lodgingJsonLd({
        locale: 'en',
        path: '/buildings/x/1-bedroom',
        name: 'Room',
        description: 'D',
        priceVnd: 700000,
        available: false,
      }),
    );
    expect(d.makesOffer.availability).toBe('https://schema.org/OutOfStock');
  });

  it('does not add an Offer when priceVnd is null or zero', () => {
    const none = JSON.parse(lodgingJsonLd({ locale: 'en', path: '', name: 'N', description: 'D', priceVnd: null }));
    const zero = JSON.parse(lodgingJsonLd({ locale: 'en', path: '', name: 'N', description: 'D', priceVnd: 0 }));
    expect(none.makesOffer).toBeUndefined();
    expect(zero.makesOffer).toBeUndefined();
  });

  it('passes through already-absolute image URLs but not http-prefixed junk', () => {
    const abs = JSON.parse(
      lodgingJsonLd({ locale: 'en', path: '', name: 'N', description: 'D', image: 'https://cdn.example/x.jpg' }),
    );
    expect(abs.image).toBe('https://cdn.example/x.jpg');
    // "httpfoo" is not an absolute URL — it gets resolved against BASE, not passed through.
    const junk = JSON.parse(
      lodgingJsonLd({ locale: 'en', path: '', name: 'N', description: 'D', image: 'httpfoo.jpg' }),
    );
    expect(junk.image).toBe(`${BASE}/httpfoo.jpg`);
  });

  it('omits streetAddress when not provided', () => {
    const d = JSON.parse(lodgingJsonLd({ locale: 'en', path: '', name: 'N', description: 'D' }));
    expect(d.address.streetAddress).toBeUndefined();
  });

  it('escapes < so the JSON cannot break out of an inline <script> tag', () => {
    const json = lodgingJsonLd({ locale: 'en', path: '', name: '</script><b>hi', description: 'D' });
    expect(json).not.toContain('</script>');
    expect(json).toContain('\\u003c');
    // …and still round-trips to the original value.
    expect(JSON.parse(json).name).toBe('</script><b>hi');
  });
});
