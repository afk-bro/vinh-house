-- PHAP Apartments — initial schema. Single tenant.
--
-- SECURITY MODEL: single-tenant. Public (anon) may read; any authenticated user may write.
-- This is safe ONLY because there is no public signup — the sole Auth users are admins
-- created via the Supabase dashboard (allowlisted in ADMIN_EMAILS for API routes).
-- If public signup is ever added, tighten write policies to an admin-email allowlist
-- (e.g. (auth.jwt() ->> 'email') = ANY(string_to_array(current_setting('app.admin_emails'), ','))).

-- updated_at trigger helper
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- Buildings
create table buildings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  description text,
  photos      jsonb not null default '[]'::jsonb,   -- [{url, alt, is_cover}]
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger buildings_updated_at before update on buildings
  for each row execute function set_updated_at();

-- Rooms
create table rooms (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  name        text not null,
  price       numeric,
  status      text not null default 'available'
                check (status in ('available','not_available')),
  description text,
  photos      jsonb not null default '[]'::jsonb,   -- [{url, alt, is_cover}]
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index rooms_building_id_idx on rooms(building_id);
create trigger rooms_updated_at before update on rooms
  for each row execute function set_updated_at();

-- Single-row global settings (contacts)
create table site_settings (
  id              uuid primary key default gen_random_uuid(),
  site_title      text,
  whatsapp_number text,
  messenger_url   text,
  contact_email   text,
  updated_at      timestamptz not null default now()
);
create trigger site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();
insert into site_settings (site_title) values ('PHAP Apartments');

-- Row Level Security: public read, authenticated write
alter table buildings     enable row level security;
alter table rooms         enable row level security;
alter table site_settings enable row level security;

create policy "public read buildings"  on buildings     for select using (true);
create policy "public read rooms"      on rooms         for select using (true);
create policy "public read settings"   on site_settings for select using (true);

create policy "auth write buildings" on buildings     for all to authenticated using (true) with check (true);
create policy "auth write rooms"     on rooms         for all to authenticated using (true) with check (true);
create policy "auth write settings"  on site_settings for all to authenticated using (true) with check (true);
