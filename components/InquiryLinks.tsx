import { whatsappUrl, messengerUrl, mailtoUrl, type SiteContacts } from '@/lib/contacts';

export default function InquiryLinks({ contacts, roomName }: { contacts: SiteContacts; roomName: string }) {
  const subject = `Inquiry about ${roomName}`;
  const wa = whatsappUrl(contacts.whatsapp_number);
  const msg = messengerUrl(contacts.messenger_url);
  const mail = mailtoUrl(contacts.contact_email, subject);
  const cls = 'px-5 py-2 bg-accent-gold text-text-inverse rounded-full';
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {wa && <a className={cls} href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
      {msg && <a className={cls} href={msg} target="_blank" rel="noopener noreferrer">Messenger</a>}
      {mail && <a className={cls} href={mail}>Email</a>}
    </div>
  );
}
