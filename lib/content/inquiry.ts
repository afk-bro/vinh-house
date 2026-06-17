// lib/content/inquiry.ts
import { whatsappUrl, telUrl, mailtoUrl } from '@/lib/contacts';
import type { Contacts } from './types';

const BUSINESS = 'Vĩnh House';

export type InquiryContext = { building?: string; roomType?: string; url?: string };

/** Returns the contextual prefilled inquiry message. */
export function inquiryMessage(ctx: InquiryContext): string {
  if (ctx.building && ctx.roomType) {
    const tail = ctx.url ? ` ${ctx.url}` : '';
    return `Hi, I'm interested in the ${ctx.roomType} at ${ctx.building}. Is it available?${tail}`;
  }
  if (ctx.building) {
    return `Hi, I'm interested in ${ctx.building}. Is a room available?`;
  }
  return `Hi, I'm interested in renting a room at ${BUSINESS}.`;
}

export type InquiryLinkSet = {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  facebook: string | null;
};

/** Builds the four Book-now hrefs from contacts + a prefilled message. */
export function buildInquiryLinks(contacts: Contacts, message: string): InquiryLinkSet {
  return {
    email: mailtoUrl(contacts.email, `${BUSINESS} inquiry`, message),
    phone: telUrl(contacts.phone),
    whatsapp: whatsappUrl(contacts.whatsapp, message),
    facebook: contacts.facebook?.trim() || null,
  };
}
