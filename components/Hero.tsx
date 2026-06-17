import Image from 'next/image';
import BookNowMenu from './BookNowMenu';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      <Image src="/hero.jpg" alt="Da Nang skyline" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-brand-forest/70" />
      <div className="relative z-10 px-4 text-center">
        <h1 className="font-heading text-5xl text-text-accent sm:text-6xl">{t.brand.name}</h1>
        <p className="mt-3 text-lg text-text-primary">{t.brand.subtitle}</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <BookNowMenu contacts={contacts} message={inquiryMessage({})} />
          <a href="#buildings" className="rounded-lg border border-accent-gold px-5 py-2.5 text-sm text-text-accent hover:bg-surface-elevated">
            {t.hero.browse}
          </a>
        </div>
      </div>
    </section>
  );
}
