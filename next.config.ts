import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : '';

const nextConfig: NextConfig = {
  images: { remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [] },
};

const withNextIntl = createNextIntlPlugin(); // defaults to ./i18n/request.ts
export default withNextIntl(nextConfig);
