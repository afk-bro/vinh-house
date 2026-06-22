import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import BookNowButton from './BookNowButton';

export default async function Hero() {
  const t = await getTranslations();
  return (
    <section className="relative flex min-h-[500px] items-center justify-center overflow-hidden sm:min-h-[560px]">
      <Image src="/hero.jpg" alt={t('hero.imageAlt')} fill priority sizes="100vw" className="hero-kenburns object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,118,110,0.55)] via-[rgba(15,118,110,0.30)] to-[rgba(255,248,237,0.25)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h1 className="hero-rise font-heading text-5xl font-semibold text-white drop-shadow-sm sm:text-7xl" style={{ animationDelay: '0.05s' }}>{t('brand.name')}</h1>
        <p className="hero-rise mt-4 text-xl text-white/95 [text-shadow:0_1px_10px_rgba(15,58,61,0.55)] sm:text-2xl" style={{ animationDelay: '0.15s' }}>{t('hero.headline')}</p>
        <p className="hero-rise mt-3 text-base text-white/90 [text-shadow:0_1px_8px_rgba(15,58,61,0.6)]" style={{ animationDelay: '0.25s' }}>{t('hero.tagline')}</p>
        <div className="hero-rise mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '0.35s' }}>
          <BookNowButton />
          <a href="#buildings" className="rounded-lg border border-white/80 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15">
            {t('hero.viewApartments')}
          </a>
        </div>
      </div>
    </section>
  );
}
