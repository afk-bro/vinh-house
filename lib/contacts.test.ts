import { describe, it, expect } from 'vitest';
import { whatsappUrl, messengerUrl, mailtoUrl } from './contacts';

describe('whatsappUrl', () => {
  it('strips non-digits and builds wa.me link', () => {
    expect(whatsappUrl('+1 (555) 123-4567')).toBe('https://wa.me/15551234567');
  });
  it('returns null for null', () => {
    expect(whatsappUrl(null)).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(whatsappUrl('')).toBeNull();
  });
  it('returns null for whitespace-only input that strips to empty digits', () => {
    expect(whatsappUrl('   ')).toBeNull();
  });
});

describe('messengerUrl', () => {
  it('passes through a valid m.me URL', () => {
    expect(messengerUrl('https://m.me/mypage')).toBe('https://m.me/mypage');
  });
  it('trims surrounding whitespace', () => {
    expect(messengerUrl('  https://m.me/mypage  ')).toBe('https://m.me/mypage');
  });
  it('returns null for null', () => {
    expect(messengerUrl(null)).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(messengerUrl('')).toBeNull();
  });
  it('returns null for whitespace-only string', () => {
    expect(messengerUrl('   ')).toBeNull();
  });
});

describe('mailtoUrl', () => {
  it('builds a simple mailto link', () => {
    expect(mailtoUrl('hello@example.com')).toBe('mailto:hello@example.com');
  });
  it('builds a mailto link with an encoded subject', () => {
    expect(mailtoUrl('hello@example.com', 'Room inquiry')).toBe(
      'mailto:hello@example.com?subject=Room%20inquiry',
    );
  });
  it('returns null for null', () => {
    expect(mailtoUrl(null)).toBeNull();
  });
  it('returns null for undefined', () => {
    expect(mailtoUrl(undefined)).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(mailtoUrl('')).toBeNull();
  });
});

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
