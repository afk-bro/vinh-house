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
