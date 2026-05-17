-- 0006: índices full-text para búsqueda global.
-- cms.posts ya tiene tsv (gen-always) e índice GIN desde 0001.
-- Sumamos tsv a shop.products y aseguramos índice GIN.

alter table shop.products
  add column if not exists tsv tsvector generated always as (
    setweight(to_tsvector('spanish', unaccent(coalesce(name, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(subtitle, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(description_mdx, ''))), 'C') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(array_to_string(tags, ' '), ''))), 'D')
  ) stored;

create index if not exists products_tsv_idx on shop.products using gin(tsv);

-- Trigram para fuzzy match en nombres (autocompletar tolerante a typos).
create extension if not exists pg_trgm;

create index if not exists products_name_trgm_idx on shop.products using gin (name gin_trgm_ops);
create index if not exists posts_title_trgm_idx on cms.posts using gin (title gin_trgm_ops);
