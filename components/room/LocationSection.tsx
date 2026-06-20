// components/room/LocationSection.tsx
import { getTranslations } from 'next-intl/server';
import Reveal from '@/components/Reveal';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { whatsappUrl } from '@/lib/contacts';

type Props = {
  address: string;
  mapsUrl: string;
  embedUrl: string;
  directionsUrl: string;
  whatsapp: string;
  message: string;
};

export default async function LocationSection({ address, mapsUrl, embedUrl, directionsUrl, whatsapp, message }: Props) {
  const t = await getTranslations('roomInfo');
  const wa = whatsappUrl(whatsapp, message);
  const btn = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition';
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="font-heading text-3xl text-text-accent">{t('locationHeading')}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-[var(--color-border-default)] shadow-sm">
            <iframe
              src={embedUrl}
              title={t('locationHeading')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] w-full"
            />
          </div>
          <div className="flex flex-col items-start gap-4">
            <p className="text-text-secondary">{address}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a className={`${btn} border border-[var(--color-border-strong)] text-text-accent hover:bg-surface-elevated`} href={mapsUrl} target="_blank" rel="noopener noreferrer">{t('openInMaps')}</a>
              <a className={`${btn} border border-[var(--color-border-strong)] text-text-accent hover:bg-surface-elevated`} href={directionsUrl} target="_blank" rel="noopener noreferrer">{t('directions')}</a>
              {wa && (
                <a className={`${btn} bg-cta text-text-inverse shadow-md shadow-cta/30 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-lg`} href={wa} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="h-4 w-4" />
                  {t('askWhatsApp')}
                </a>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
