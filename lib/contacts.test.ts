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
