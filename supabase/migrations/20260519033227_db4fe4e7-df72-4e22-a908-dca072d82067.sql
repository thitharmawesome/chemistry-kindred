
-- Replace permissive public insert with validated insert
drop policy if exists "Anyone can submit an application" on public.waitlist_applications;

create policy "Anyone can submit a valid application"
  on public.waitlist_applications for insert
  to anon, authenticated
  with check (
    length(trim(name)) between 1 and 200
    and length(trim(email)) between 3 and 320
    and email like '%_@_%.__%'
  );

-- Lock down has_role(): only callable by service_role (server fns use it)
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;

-- The admin SELECT policy on user_roles references has_role; recreate so postgres
-- evaluates it as the policy owner (definer) regardless of execute grants.
-- (No change needed — RLS policies bypass EXECUTE checks when evaluating expressions.)
