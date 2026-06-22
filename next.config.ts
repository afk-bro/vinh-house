import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : '';

// Absolute URLs (canonical, hreflang, OG, sitemap, JSON-LD) depend on this. Warn loudly
// at build time so a production deploy doesn't silently ship the fallback example domain.
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    '\n⚠️  NEXT_PUBLIC_SITE_URL is not set — SEO/canonical/OG/sitemap URLs will fall back to ' +
    'the placeholder domain. Set it to the real origin before deploying to production.\n',
  );
}

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [],
  },
};

const withNextIntl = createNextIntlPlugin(); // defaults to ./i18n/request.ts
export default withNextIntl(nextConfig);
