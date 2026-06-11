
revoke execute on function public.enqueue_email(text, jsonb) from anon, authenticated, public;
revoke execute on function public.read_email_batch(text, integer, integer) from anon, authenticated, public;
revoke execute on function public.delete_email(text, bigint) from anon, authenticated, public;
revoke execute on function public.move_to_dlq(text, text, bigint, jsonb) from anon, authenticated, public;

alter function public.enqueue_email(text, jsonb) set search_path = public, pg_temp;
alter function public.read_email_batch(text, integer, integer) set search_path = public, pg_temp;
alter function public.delete_email(text, bigint) set search_path = public, pg_temp;
alter function public.move_to_dlq(text, text, bigint, jsonb) set search_path = public, pg_temp;

drop policy if exists "Anyone can upload waitlist files" on storage.objects;

create policy "Anyone can upload waitlist files"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'waitlist-uploads'
  and (storage.foldername(name))[1] in ('photos', 'videos')
  and name ~ '^(photos|videos)/[0-9a-fA-F-]{36}\.[A-Za-z0-9]{1,8}$'
);
