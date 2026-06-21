import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const handleI18n = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    // Lazy import so the Supabase module never loads for public requests.
    const { updateSession } = await import('@/lib/supabase/middleware');
    return updateSession(request);
  }
  return handleI18n(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|apple-icon|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
