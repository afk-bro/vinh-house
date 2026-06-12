import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/admin-auth';
import {
  listingPhotoKey,
  isValidImageType,
  isValidImageSize,
  validateFileHeader,
  getExtensionFromMimeType,
} from '@/lib/storage-utils';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
const BUCKET = 'listing-photos';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const { authorized, response } = await requireAdmin();
  if (!authorized) return response;

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const kind = (form.get('kind') as string) === 'buildings' ? 'buildings' : 'rooms';
  const ownerId = form.get('ownerId') as string | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!ownerId) return NextResponse.json({ error: 'Missing ownerId' }, { status: 400 });
  if (!UUID_RE.test(ownerId)) return NextResponse.json({ error: 'Invalid ownerId' }, { status: 400 });
  if (!isValidImageType(file.type)) return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
  if (!isValidImageSize(file.size)) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 413 });
  if (!(await validateFileHeader(file))) return NextResponse.json({ error: 'File content is not a valid image' }, { status: 415 });

  const ext = getExtensionFromMimeType(file.type);
  const key = listingPhotoKey(kind, ownerId, ext);
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type, cacheControl: '3600', upsert: false });
  if (error) {
    logger.error('upload-image failed', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
  return NextResponse.json({ url: data.publicUrl, name: file.name }, { status: 200 });
}
