-- Public bucket for listing photos
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Anyone can read; only authenticated users can write/delete in this bucket.
create policy "public read listing-photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "auth upload listing-photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos');

create policy "auth update listing-photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'listing-photos');

create policy "auth delete listing-photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos');
