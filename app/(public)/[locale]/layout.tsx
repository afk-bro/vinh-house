import type { Metadata } from 'next';
import { Fraunces, Inter, Noto_Sans_KR, Noto_Sans_SC } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { localeAlternates } from '@/lib/seo';
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vinh-house.example'),
    title: { default: t('homeTitle'), template: `%s — ${t('titleSuffix')}` },
    description: t('homeDescription'),
    icons: { icon: '/logo.png' },
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

  const fontVars = `${heading.variable} ${body.variable} ${notoKR.variable} ${notoSC.variable}`;
  return (
    <html lang={locale} className={fontVars} suppressHydrationWarning>
      <body className="bg-brand-forest text-text-primary">
        {/* Adds the `js` class to <html> before hydration so scroll-reveals hide only
            with JS available (no-JS stays fully visible). suppressHydrationWarning covers
            the intentional <html> class diff this creates. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <NextIntlClientProvider>
          <Navbar />
          <main>{children}</main>
          <ContactSection />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
