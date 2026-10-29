-- Run once in the SQL editor of the Vennti backend project (bsafrekbtdommeefveej).
-- Only the server (service role) reads/writes these tables; the browser never touches them directly.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null default 'Vennti evening',
  starts_at timestamptz not null,
  venue_name text,
  venue_address text,
  details text,
  price text,
  ticket_url text,
  published boolean not null default true
);

create table if not exists public.screened_members (
  email text primary key,
  created_at timestamptz not null default now(),
  source text not null default 'call' check (source in ('call', 'preferences')),
  note text
);

grant all on public.events to service_role;
grant all on public.screened_members to service_role;

alter table public.events enable row level security;
alter table public.screened_members enable row level security;
-- No policies on purpose: anon/authenticated get no direct access.
