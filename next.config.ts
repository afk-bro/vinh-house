import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : '';

// Absolute URLs (canonical, hreflang, OG, sitemap, JSON-LD) need a real origin. Prefer
// NEXT_PUBLIC_SITE_URL; on Vercel we fall back to the platform domain so the first/preview
// deploy works with no config (see lib/seo.ts). Only a genuine non-Vercel production build with
// nothing set is a misconfig that would ship the placeholder domain — fail that, warn in dev.
const hasSiteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL;
if (!hasSiteOrigin) {
  const msg =
    'No site origin available — set NEXT_PUBLIC_SITE_URL. Otherwise canonical/OG/sitemap/JSON-LD ' +
    'URLs fall back to the placeholder domain, breaking the sitemap and WhatsApp/Messenger link previews.';
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
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
