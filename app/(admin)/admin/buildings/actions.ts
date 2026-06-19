'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Photo } from '@/lib/photos';

export async function createBuilding(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('buildings').insert({
    name: String(formData.get('name') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/buildings');
  redirect('/admin/buildings');
}

export async function deleteBuilding(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const { error } = await supabase.from('buildings').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/buildings');
}

export async function updateBuilding(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const { error } = await supabase.from('buildings').update({
    name: String(formData.get('name') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/buildings/${id}/edit`);
}

export async function deleteRoom(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const buildingId = String(formData.get('buildingId'));
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/buildings/${buildingId}/edit`);
}

/** Persists the full photos array (called after upload/reorder/cover/remove). */
export async function saveBuildingPhotos(buildingId: string, photos: Photo[]) {
  const supabase = await createClient();
  const { error } = await supabase.from('buildings').update({ photos }).eq('id', buildingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/buildings/${buildingId}/edit`);
}
