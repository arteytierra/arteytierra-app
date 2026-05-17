-- 0002: agrega columnas para sync de calendarios externos (Airbnb/Booking)
-- y verifica que cms.posts tenga `blocks jsonb` (CMS de bloques).

alter table book.availability
  add column if not exists external_uid text,
  add column if not exists source text;

create unique index if not exists availability_external_uid_uniq
  on book.availability (resource_id, external_uid)
  where external_uid is not null;

-- Asegurar columnas para CMS por bloques en cms.posts
alter table cms.posts
  add column if not exists blocks jsonb not null default '[]'::jsonb,
  add column if not exists cover_url text,
  add column if not exists excerpt text;

create index if not exists posts_published_idx
  on cms.posts (published_at desc nulls last)
  where published_at is not null;
