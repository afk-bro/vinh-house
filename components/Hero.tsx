import Image from 'next/image';
import BookNowMenu from './BookNowMenu';
import { contacts } from '@/lib/content/site';
import { inquiryMessage } from '@/lib/content/inquiry';
import { t } from '@/lib/content/strings';

export default function Hero() {
  return (
    <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden sm:min-h-[70vh]">
      <Image src="/hero.jpg" alt="Da Nang skyline" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,118,110,0.55)] via-[rgba(15,118,110,0.30)] to-[rgba(255,248,237,0.25)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h1 className="font-heading text-5xl font-semibold text-white drop-shadow-sm sm:text-7xl">{t.brand.name}</h1>
        <p className="mt-4 text-xl text-white/95 sm:text-2xl">{t.hero.headline}</p>
        <p className="mt-3 text-base text-white/85">{t.hero.tagline}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <BookNowMenu contacts={contacts} message={inquiryMessage({})} />
          <a href="#buildings" className="rounded-lg border border-white/80 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15">
            {t.hero.viewApartments}
          </a>
        </div>
      </div>
    </section>
  );
}
