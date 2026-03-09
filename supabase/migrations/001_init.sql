create extension if not exists pgcrypto;
create extension if not exists postgis;

create table if not exists public.ranges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text not null,
  city text not null,
  postcode text not null,
  latitude double precision not null,
  longitude double precision not null,
  facility_type text not null check (facility_type in ('outdoor', 'indoor', 'both')),
  bays integer,
  covered_bays boolean not null default false,
  floodlights boolean not null default false,
  short_game_area boolean not null default false,
  simulator_brand text,
  price_100_balls numeric(6,2),
  price_bucket text not null default 'unknown',
  website text,
  phone text,
  opening_hours text,
  image text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  postcode text not null,
  latitude double precision,
  longitude double precision,
  facility_type text not null check (facility_type in ('outdoor', 'indoor', 'both')),
  bays integer,
  covered_bays boolean,
  floodlights boolean,
  short_game_area boolean,
  simulator_brand text,
  price_100_balls numeric(6,2),
  price_bucket text not null default 'unknown',
  website text,
  phone text,
  opening_hours text,
  images text[] not null default '{}',
  submitter_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create index if not exists idx_ranges_slug on public.ranges (slug);
create index if not exists idx_ranges_city on public.ranges (city);
create index if not exists idx_ranges_facility_type on public.ranges (facility_type);
create index if not exists idx_ranges_price_bucket on public.ranges (price_bucket);
create index if not exists idx_ranges_lat_lng on public.ranges (latitude, longitude);
create index if not exists idx_submissions_status_created_at on public.submissions (status, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ranges_touch_updated_at on public.ranges;
create trigger ranges_touch_updated_at
before update on public.ranges
for each row
execute function public.touch_updated_at();

create or replace function public.is_admin(input_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = input_user_id
      and role in ('admin', 'editor')
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

alter table public.ranges enable row level security;
alter table public.submissions enable row level security;
alter table public.profiles enable row level security;

create policy if not exists ranges_public_read_published
on public.ranges
for select
to anon, authenticated
using (is_published = true);

create policy if not exists ranges_admin_all
on public.ranges
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy if not exists submissions_public_insert
on public.submissions
for insert
to anon, authenticated
with check (status = 'pending');

create policy if not exists submissions_admin_read
on public.submissions
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy if not exists submissions_admin_update
on public.submissions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy if not exists profiles_self_read
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy if not exists profiles_admin_all
on public.profiles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
