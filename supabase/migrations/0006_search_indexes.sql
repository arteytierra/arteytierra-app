-- 0006: índices full-text para búsqueda global.
-- cms.posts ya tiene tsv (gen-always) e índice GIN desde 0001.
-- Sumamos tsv a shop.products y aseguramos índice GIN.

-- Wrapper IMMUTABLE de array_to_string (la versión nativa es STABLE).
create or replace function public.immutable_array_to_string(text[], text)
returns text language sql immutable parallel safe as
$$ select array_to_string($1, $2) $$;

alter table shop.products
  add column if not exists tsv tsvector generated always as (
    setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(name, ''))), 'A') ||
    setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(subtitle, ''))), 'B') ||
    setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(description_mdx, ''))), 'C') ||
    setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(public.immutable_array_to_string(tags, ' '), ''))), 'D')
  ) stored;

create index if not exists products_tsv_idx on shop.products using gin(tsv);

-- Trigram para fuzzy match en nombres (autocompletar tolerante a typos).
create extension if not exists pg_trgm;

create index if not exists products_name_trgm_idx on shop.products using gin (name gin_trgm_ops);
create index if not exists posts_title_trgm_idx on cms.posts using gin (title gin_trgm_ops);
