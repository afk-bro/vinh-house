// lib/content/inquiry.ts
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
