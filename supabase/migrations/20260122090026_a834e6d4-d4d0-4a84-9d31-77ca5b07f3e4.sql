-- Create private bucket for knowledge base PDFs
insert into storage.buckets (id, name, public)
values ('kb-reports', 'kb-reports', false)
on conflict (id) do nothing;

-- Storage policies: admin-only access to kb-reports
-- Note: storage policies live on storage.objects

do $$
begin
  -- SELECT
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admin can read kb-reports'
  ) then
    create policy "Admin can read kb-reports"
    on storage.objects
    for select
    using (
      bucket_id = 'kb-reports'
      and public.has_role(auth.uid(), 'admin')
    );
  end if;

  -- INSERT
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admin can upload kb-reports'
  ) then
    create policy "Admin can upload kb-reports"
    on storage.objects
    for insert
    with check (
      bucket_id = 'kb-reports'
      and public.has_role(auth.uid(), 'admin')
    );
  end if;

  -- UPDATE
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admin can update kb-reports'
  ) then
    create policy "Admin can update kb-reports"
    on storage.objects
    for update
    using (
      bucket_id = 'kb-reports'
      and public.has_role(auth.uid(), 'admin')
    )
    with check (
      bucket_id = 'kb-reports'
      and public.has_role(auth.uid(), 'admin')
    );
  end if;

  -- DELETE
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admin can delete kb-reports'
  ) then
    create policy "Admin can delete kb-reports"
    on storage.objects
    for delete
    using (
      bucket_id = 'kb-reports'
      and public.has_role(auth.uid(), 'admin')
    );
  end if;
end $$;
