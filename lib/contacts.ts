export type SiteContacts = {
  whatsapp_number: string | null;
  messenger_url: string | null;
  contact_email: string | null;
};

/** Builds a wa.me link from a phone number (strips spaces, dashes, parens, leading +). */
export function whatsappUrl(number: string | null | undefined): string | null {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

/** Passes through a Messenger URL (m.me/... or facebook.com/...) if non-empty. */
export function messengerUrl(url: string | null | undefined): string | null {
  return url && url.trim() ? url.trim() : null;
}

/** Builds a mailto: link, optionally with a subject. */
export function mailtoUrl(email: string | null | undefined, subject?: string): string | null {
  if (!email) return null;
  const q = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${email}${q}`;
}
