import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : '';

// Absolute URLs (canonical, hreflang, OG, sitemap, JSON-LD) depend on this. Missing it ships
// the placeholder domain, which silently breaks the sitemap and link previews on the primary
// inquiry channel (WhatsApp/Messenger) — so fail the production build, and only warn in dev.
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  const msg =
    'NEXT_PUBLIC_SITE_URL is not set — SEO/canonical/OG/sitemap URLs would fall back to the ' +
    'placeholder domain, breaking the sitemap and WhatsApp/Messenger link previews.';
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${msg} Set it to the real origin before building for production.`);
  }
  console.warn(`\n⚠️  ${msg}\n`);
}

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [],
  },
};

const withNextIntl = createNextIntlPlugin(); // defaults to ./i18n/request.ts
export default withNextIntl(nextConfig);
