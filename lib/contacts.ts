export type SiteContacts = {
  whatsapp_number: string | null;
  messenger_url: string | null;
  contact_email: string | null;
};

/** Builds a wa.me link; appends an encoded prefilled message when provided. */
export function whatsappUrl(number: string | null | undefined, message?: string): string | null {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, '');
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Passes through a Messenger URL (m.me/... or facebook.com/...) if non-empty. */
export function messengerUrl(url: string | null | undefined): string | null {
  return url && url.trim() ? url.trim() : null;
}

/** Builds a tel: link, preserving a leading + and stripping other non-digits. */
export function telUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const plus = phone.trim().startsWith('+') ? '+' : '';
  const digits = phone.replace(/[^\d]/g, '');
  return digits ? `tel:${plus}${digits}` : null;
}

/** Builds a mailto: link with optional subject and body. */
export function mailtoUrl(
  email: string | null | undefined,
  subject?: string,
  body?: string,
): string | null {
  if (!email) return null;
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const q = params.toString();
  // URLSearchParams encodes spaces as '+'; mail clients expect %20.
  return `mailto:${email}${q ? `?${q.replace(/\+/g, '%20')}` : ''}`;
}
