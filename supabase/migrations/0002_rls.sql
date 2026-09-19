-- Row Level Security (§62, §66)
-- anon  : read published/public content only + insert enquiries (contact form)
-- authenticated (admin): full access to content tables (still re-checked server-side)
-- service_role: bypasses RLS — used only by server actions (SUPABASE_SERVICE_ROLE_KEY)

alter table public.companies        enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images   enable row level security;
alter table public.projects         enable row level security;
alter table public.project_images   enable row level security;
alter table public.gallery_items    enable row level security;
alter table public.banners          enable row level security;
alter table public.site_content     enable row level security;
alter table public.site_settings    enable row level security;
alter table public.contact_settings enable row level security;
alter table public.whatsapp_settings enable row level security;
alter table public.admin_profiles   enable row level security;
alter table public.enquiries        enable row level security;
alter table public.audit_logs       enable row level security;

-- public reads
create policy "public companies"      on public.companies        for select to anon using (is_active);
create policy "public categories"     on public.categories       for select to anon using (is_active);
create policy "public products"       on public.products         for select to anon using (is_published);
create policy "public variants"       on public.product_variants for select to anon using (exists (select 1 from public.products p where p.id = product_id and p.is_published));
create policy "public product images" on public.product_images   for select to anon using (exists (select 1 from public.products p where p.id = product_id and p.is_published));
create policy "public projects"       on public.projects         for select to anon using (is_published);
create policy "public project images" on public.project_images   for select to anon using (exists (select 1 from public.projects p where p.id = project_id and p.is_published));
create policy "public gallery"        on public.gallery_items    for select to anon using (is_published);
create policy "public banners"        on public.banners          for select to anon using (is_active);
create policy "public site content"   on public.site_content     for select to anon using (true);
create policy "public site settings"  on public.site_settings    for select to anon using (true);
create policy "public contact"        on public.contact_settings for select to anon using (true);
create policy "public whatsapp"       on public.whatsapp_settings for select to anon using (is_active);

-- contact form inserts (column allow-list via WITH CHECK)
create policy "enquiry insert" on public.enquiries for insert to anon
  with check (name is not null and email is not null and message is not null and status = 'new');

-- admins: everything on content tables; NEVER enquiries/audit/admin_profiles for anon
create policy "admin companies"   on public.companies   for all to authenticated using (true) with check (true);
create policy "admin categories"  on public.categories  for all to authenticated using (true) with check (true);
create policy "admin products"    on public.products    for all to authenticated using (true) with check (true);
create policy "admin variants"    on public.product_variants for all to authenticated using (true) with check (true);
create policy "admin prod images" on public.product_images   for all to authenticated using (true) with check (true);
create policy "admin projects"    on public.projects    for all to authenticated using (true) with check (true);
create policy "admin proj images" on public.project_images   for all to authenticated using (true) with check (true);
create policy "admin gallery"     on public.gallery_items    for all to authenticated using (true) with check (true);
create policy "admin banners"     on public.banners     for all to authenticated using (true) with check (true);
create policy "admin content"     on public.site_content     for all to authenticated using (true) with check (true);
create policy "admin settings"    on public.site_settings    for all to authenticated using (true) with check (true);
create policy "admin contact"     on public.contact_settings for all to authenticated using (true) with check (true);
create policy "admin whatsapp"    on public.whatsapp_settings for all to authenticated using (true) with check (true);
create policy "admin enquiries"   on public.enquiries   for all to authenticated using (true) with check (true);
create policy "admin audit"       on public.audit_logs  for all to authenticated using (true) with check (true);
create policy "admin profiles rw" on public.admin_profiles for all to authenticated using (true) with check (true);

-- storage: public read, authenticated write inside bucket imn
create policy "storage public read" on storage.objects for select to anon using (bucket_id = 'imn');
create policy "storage admin write" on storage.objects for all to authenticated using (bucket_id = 'imn') with check (bucket_id = 'imn');
