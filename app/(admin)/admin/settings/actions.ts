'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const { error } = await supabase.from('site_settings').update({
    site_title: String(formData.get('site_title') ?? '').trim() || null,
    whatsapp_number: String(formData.get('whatsapp_number') ?? '').trim() || null,
    messenger_url: String(formData.get('messenger_url') ?? '').trim() || null,
    contact_email: String(formData.get('contact_email') ?? '').trim() || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/settings');
}
