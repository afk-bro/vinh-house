// components/ContactSection.tsx
import { getTranslations } from 'next-intl/server';
import { Phone } from 'lucide-react';
import Container from './Container';
import Reveal from './Reveal';
import WhatsAppIcon from './icons/WhatsAppIcon';
import ZaloIcon from './icons/ZaloIcon';
import { contacts } from '@/lib/content/site';
import { whatsappUrl, telUrl, zaloUrl } from '@/lib/contacts';
import { inquiryMessage } from '@/lib/content/inquiry';

export default async function ContactSection() {
  const t = await getTranslations();
  const wa = whatsappUrl(contacts.whatsapp, inquiryMessage({}));
  const zalo = zaloUrl(contacts.whatsapp);
  const tel = telUrl(contacts.phone);
  return (
    <section id="contact" className="scroll-mt-24 py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-gradient-to-br from-[#FFF4DF] via-[var(--color-surface-secondary)] to-[#FBE6C4] px-6 py-14 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">{t('contact.eyebrow')}</p>
            <h2 className="max-w-2xl font-heading text-4xl text-[var(--color-primary-dark)]">{t('contact.heading')}</h2>
            <p className="max-w-xl text-text-secondary">{t('contact.subtitle')}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="cta-pill bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg">
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                  {t('booking.whatsapp')}
                </a>
              )}
              {zalo && (
                <a href={zalo} target="_blank" rel="noopener noreferrer" className="cta-pill bg-[var(--color-primary)] text-white shadow-md shadow-black/10 hover:bg-[var(--color-primary-dark)]">
                  <ZaloIcon className="h-[18px] w-[18px]" />
                  {t('booking.zalo')}
                </a>
              )}
              {tel && (
                <a href={tel} className="cta-pill bg-accent-gold text-[var(--color-text-primary)] shadow-md shadow-black/10 hover:brightness-105">
                  <Phone className="h-[18px] w-[18px]" aria-hidden />
                  {t('booking.call')}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
