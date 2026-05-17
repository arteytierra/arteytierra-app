-- =============================================================
--  i18n: agregar columnas jsonb con traducciones por entidad.
--  Convención: { "en": "...", "pt": "..." } — el ES vive en la columna
--  original (fallback). Lookup helpers en `lib/i18n/localize.ts`.
-- =============================================================

alter table shop.products
  add column if not exists name_i18n        jsonb not null default '{}'::jsonb,
  add column if not exists subtitle_i18n    jsonb not null default '{}'::jsonb,
  add column if not exists description_i18n jsonb not null default '{}'::jsonb,
  add column if not exists slug_i18n        jsonb not null default '{}'::jsonb;

alter table cms.posts
  add column if not exists title_i18n   jsonb not null default '{}'::jsonb,
  add column if not exists excerpt_i18n jsonb not null default '{}'::jsonb,
  add column if not exists body_i18n    jsonb not null default '{}'::jsonb,
  add column if not exists slug_i18n    jsonb not null default '{}'::jsonb;

alter table cms.pages
  add column if not exists title_i18n jsonb not null default '{}'::jsonb,
  add column if not exists body_i18n  jsonb not null default '{}'::jsonb;

-- Slug por locale → necesitamos unique parcial para no romper PK actual.
-- Estrategia: vista mat indexada por (locale, slug) — sumaríamos en otra mig.
-- Por ahora, índices GIN para búsqueda.
create index if not exists idx_products_name_i18n_gin on shop.products using gin (name_i18n);
create index if not exists idx_posts_title_i18n_gin on cms.posts using gin (title_i18n);

-- Helper SQL: devuelve un texto con fallback en cadena de locales.
-- Uso: select cms.i18n_text(title_i18n, original_title, '{en,es}'::text[])
create or replace function app.i18n_text(
  p_i18n jsonb,
  p_fallback text,
  p_locales text[]
) returns text language sql immutable as $$
  select coalesce(
    (
      select v
      from unnest(p_locales) as l
      cross join lateral (select p_i18n ->> l as v) x
      where v is not null and v <> ''
      limit 1
    ),
    p_fallback
  );
$$;
