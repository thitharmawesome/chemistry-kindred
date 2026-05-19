
-- Roles enum + table (per security best practice: roles in separate table)
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can read roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Waitlist applications
create table public.waitlist_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  age int,
  city text,
  email text not null,
  pronouns text,
  instagram text,
  linkedin text,
  status text not null default 'new',
  payload jsonb not null default '{}'::jsonb
);

alter table public.waitlist_applications enable row level security;

-- Public can submit applications (insert only)
create policy "Anyone can submit an application"
  on public.waitlist_applications for insert
  to anon, authenticated
  with check (true);

-- Only admins can read/update/delete
create policy "Admins can view applications"
  on public.waitlist_applications for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update applications"
  on public.waitlist_applications for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete applications"
  on public.waitlist_applications for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create index waitlist_applications_created_at_idx
  on public.waitlist_applications (created_at desc);
