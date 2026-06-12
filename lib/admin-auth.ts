import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Checks the current user is authenticated and their email is in ADMIN_EMAILS.
 * @returns { authorized, user, response } — response is a ready-to-return error when not authorized.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false as const,
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) || [];
  const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '');

  if (!isAdmin) {
    return {
      authorized: false as const,
      user,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { authorized: true as const, user, response: null };
}
