// lib/content/inquiry.test.ts
import { describe, it, expect } from 'vitest';
import { inquiryMessage } from './inquiry';

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
