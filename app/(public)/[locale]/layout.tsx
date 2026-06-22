import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Noto_Sans_KR, Noto_Sans_SC } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { localeAlternates, SITE_URL } from '@/lib/seo';
import Navbar from '@/components/Navbar';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import '../../globals.css';

const heading = Fraunces({
  subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'],
  variable: '--font-heading-loaded',
});
const body = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'], variable: '--font-body-loaded' });
const notoKR = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-noto-kr' });
const notoSC = Noto_Sans_SC({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-noto-sc' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F766E',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('homeTitle'), template: `%s — ${t('titleSuffix')}` },
    description: t('homeDescription'),
    alternates: localeAlternates(locale),
    openGraph: { title: t('homeTitle'), description: t('homeDescription'), images: ['/hero.jpg'], type: 'website' },
  };
}

export default async function LocaleLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();

  const fontVars = `${heading.variable} ${body.variable} ${notoKR.variable} ${notoSC.variable}`;
  return (
    <html lang={locale} className={fontVars} suppressHydrationWarning>
      <body className="bg-brand-forest text-text-primary">
        {/* Adds the `js` class to <html> before hydration so scroll-reveals hide only
            with JS available (no-JS stays fully visible). suppressHydrationWarning covers
            the intentional <html> class diff this creates. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only z-[60] rounded-lg bg-surface-card px-4 py-2 text-sm font-medium text-text-accent shadow-lg focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
          >
            {t('nav.skipToContent')}
          </a>
          <Navbar />
          <main id="main" tabIndex={-1}>{children}</main>
          <ContactSection />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
