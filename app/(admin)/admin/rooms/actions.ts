'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Photo } from '@/lib/photos';

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  const buildingId = String(formData.get('building_id'));
  const priceRaw = String(formData.get('price') ?? '').trim();
  const n = Number(priceRaw);
  if (priceRaw !== '' && !Number.isFinite(n)) throw new Error('Price must be a number');
  const price = priceRaw === '' ? null : n;
  const { data, error } = await supabase.from('rooms').insert({
    building_id: buildingId,
    name: String(formData.get('name') ?? '').trim(),
    price,
    status: String(formData.get('status') ?? 'available'),
    description: String(formData.get('description') ?? '').trim() || null,
  }).select('id').single();
  if (error) throw new Error(error.message);
  redirect(`/admin/rooms/${data!.id}/edit`);
}

export async function updateRoom(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get('id'));
  const buildingId = String(formData.get('building_id') ?? '');
  const priceRaw = String(formData.get('price') ?? '').trim();
  const n = Number(priceRaw);
  if (priceRaw !== '' && !Number.isFinite(n)) throw new Error('Price must be a number');
  const price = priceRaw === '' ? null : n;
  const { error } = await supabase.from('rooms').update({
    name: String(formData.get('name') ?? '').trim(),
    price,
    status: String(formData.get('status') ?? 'available'),
    description: String(formData.get('description') ?? '').trim() || null,
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/rooms/${id}/edit`);
  if (buildingId) revalidatePath(`/admin/buildings/${buildingId}/edit`);
}

/** Persists the full photos array (called after upload/reorder/cover/remove). */
export async function saveRoomPhotos(roomId: string, photos: Photo[]) {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').update({ photos }).eq('id', roomId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/rooms/${roomId}/edit`);
}
