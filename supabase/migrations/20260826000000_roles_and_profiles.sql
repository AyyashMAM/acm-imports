-- Roles for Supabase Auth users. Until now, `requireAdminUser`/the proxy
-- middleware treated ANY authenticated user as an admin — fine when only
-- admins could sign in, but customer signup is being added, so a role is
-- now required to keep customers out of /admin.

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- No insert/delete policies for anon/authenticated: rows are created by the
-- handle_new_user trigger below (security definer) or, for the backfill
-- below, directly by this migration.

-- Backfill: every account that already exists predates customer signup, so
-- it was created by/for the store owner — treat all of them as admins.
insert into profiles (id, role)
select id, 'admin' from auth.users
on conflict (id) do nothing;

-- New signups (from here on) default to 'customer'.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
