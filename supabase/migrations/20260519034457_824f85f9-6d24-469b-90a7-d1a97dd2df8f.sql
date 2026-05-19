
insert into storage.buckets (id, name, public)
values ('waitlist-uploads', 'waitlist-uploads', false)
on conflict (id) do nothing;

create policy "Anyone can upload waitlist files"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'waitlist-uploads');

create policy "Admins can read waitlist files"
on storage.objects for select
to authenticated
using (bucket_id = 'waitlist-uploads' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete waitlist files"
on storage.objects for delete
to authenticated
using (bucket_id = 'waitlist-uploads' and public.has_role(auth.uid(), 'admin'));
