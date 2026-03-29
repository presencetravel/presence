-- profiles: one row per auth user (athlete profile)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  school text,
  sport text,
  home_airport text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'athlete profile linked to auth.users';

alter table public.profiles enable row level security;

-- users can read their own profile
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- users can update their own profile
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- users can insert their own profile row (e.g. after sign up)
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);
