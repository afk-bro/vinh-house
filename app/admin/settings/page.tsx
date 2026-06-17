import Container from '@/components/Container';
import { createClient } from '@/lib/supabase/server';
import { updateSettings } from './actions';

// Authed CRUD page — never statically prerendered, so the public build does not
// require Supabase env vars (admin is dormant/out of scope for now).
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: s } = await supabase.from('site_settings').select('*').limit(1).single();
  if (!s) return <Container><p className="mt-8 text-text-primary">No settings row.</p></Container>;

  const field = 'w-full p-2 bg-surface-card border border-[var(--color-border-default)] text-text-primary';
  return (
    <Container>
      <h1 className="font-heading text-3xl text-text-accent mt-8">Site settings</h1>
      <form action={updateSettings} className="mt-6 space-y-4 max-w-lg">
        <input type="hidden" name="id" value={s.id} />
        <label className="block text-text-secondary text-sm">Site title
          <input name="site_title" defaultValue={s.site_title ?? ''} className={field} /></label>
        <label className="block text-text-secondary text-sm">WhatsApp number (digits, with country code)
          <input name="whatsapp_number" defaultValue={s.whatsapp_number ?? ''} className={field} /></label>
        <label className="block text-text-secondary text-sm">Messenger URL (m.me/… or facebook.com/…)
          <input name="messenger_url" defaultValue={s.messenger_url ?? ''} className={field} /></label>
        <label className="block text-text-secondary text-sm">Contact email
          <input name="contact_email" type="email" defaultValue={s.contact_email ?? ''} className={field} /></label>
        <button className="px-4 py-2 bg-accent-gold text-text-inverse">Save</button>
      </form>
    </Container>
  );
}
