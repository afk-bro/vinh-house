// components/BookNowButton.tsx
import { getTranslations } from 'next-intl/server';

export default async function BookNowButton({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations();
  const size = compact ? 'px-5 py-2 text-xs tracking-[0.1em]' : '';
  return (
    <a
      href="#contact"
      className={`cta-pill bg-cta text-text-inverse shadow-md shadow-cta/30 hover:bg-cta-hover hover:shadow-lg ${size}`}
    >
      {t('nav.bookNow')}
    </a>
  );
}
