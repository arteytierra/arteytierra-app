-- 0023_recommendations.sql
-- Sistema de recomendaciones basado en co-compras + categoría + tags.
-- Sin ML — heurísticas SQL que funcionan bien con catálogo pequeño/mediano.

-- Vista materializada: pares de productos co-comprados en la misma orden.
-- Refresh por cron diario.
drop materialized view if exists app.product_copurchases;
create materialized view app.product_copurchases as
select
  a.product_id as product_a,
  b.product_id as product_b,
  count(*) as together
from shop.order_items a
join shop.order_items b
  on a.order_id = b.order_id and a.product_id <> b.product_id
join shop.orders o on o.id = a.order_id
where o.status = 'paid'
group by a.product_id, b.product_id
having count(*) >= 2;

create unique index if not exists copurchases_pair_idx
  on app.product_copurchases (product_a, product_b);

create index if not exists copurchases_a_idx on app.product_copurchases (product_a, together desc);

-- RPC: dado un producto, devolver top N relacionados
create or replace function app.recommend_for_product(p_product uuid, p_limit int default 6)
returns table (
  id uuid, type text, slug text, name text, subtitle text, gallery jsonb,
  base_price_cents int, currency text, reason text, score real
)
language plpgsql stable security definer
set search_path = app, shop, public
as $$
declare
  v_type text;
  v_category text;
  v_tags text[];
begin
  select p.type, p.category, p.tags into v_type, v_category, v_tags
    from shop.products p where p.id = p_product;

  return query
  with src as (
    -- Co-compras (peso alto)
    select b.product_b as product_id, b.together::real * 3.0 as score, 'co-compra' as reason
      from app.product_copurchases b
     where b.product_a = p_product
    union all
    -- Misma categoría (peso medio)
    select p.id, 2.0, 'misma categoría'
      from shop.products p
     where p.id <> p_product
       and p.is_active = true
       and v_category is not null
       and p.category = v_category
    union all
    -- Tags compartidos (peso variable)
    select p.id,
           cardinality(array(select unnest(p.tags) intersect select unnest(coalesce(v_tags, '{}'::text[]))))::real,
           'tags comunes'
      from shop.products p
     where p.id <> p_product
       and p.is_active = true
       and v_tags is not null
       and p.tags && v_tags
    union all
    -- Mismo tipo (peso bajo, fallback)
    select p.id, 0.5, 'mismo tipo'
      from shop.products p
     where p.id <> p_product
       and p.is_active = true
       and p.type = v_type
  ),
  agg as (
    select product_id,
           sum(score) as total_score,
           (array_agg(reason order by score desc))[1] as top_reason
      from src
     group by product_id
  )
  select p.id, p.type, p.slug, p.name, p.subtitle, p.gallery,
         p.base_price_cents, p.currency,
         a.top_reason as reason,
         a.total_score::real as score
    from agg a
    join shop.products p on p.id = a.product_id
   where p.is_active = true
   order by a.total_score desc
   limit p_limit;
end $$;

grant execute on function app.recommend_for_product(uuid, int) to anon, authenticated;

-- RPC: recomendaciones para un usuario (basado en su historial de compras + completed courses)
create or replace function app.recommend_for_user(p_user uuid, p_limit int default 8)
returns table (
  id uuid, type text, slug text, name text, subtitle text, gallery jsonb,
  base_price_cents int, currency text, reason text, score real
)
language plpgsql stable security definer
set search_path = app, shop, edu, public
as $$
begin
  return query
  with seen as (
    select distinct oi.product_id
      from shop.orders o
      join shop.order_items oi on oi.order_id = o.id
     where o.user_id = p_user and o.status = 'paid'
  ),
  candidates as (
    select cp.product_b as product_id, sum(cp.together)::real * 2.0 as score, 'co-comprado por otros' as reason
      from seen s
      join app.product_copurchases cp on cp.product_a = s.product_id
     where cp.product_b not in (select product_id from seen)
     group by cp.product_b
    union all
    select p.id, 1.0, 'similar a tu interés'
      from shop.products p
      join seen s2 on s2.product_id <> p.id
      join shop.products sp on sp.id = s2.product_id
     where p.is_active = true
       and p.id not in (select product_id from seen)
       and (p.category = sp.category or p.tags && sp.tags)
  ),
  agg as (
    select product_id, sum(score) as total, (array_agg(reason order by score desc))[1] as top_reason
      from candidates group by product_id
  )
  select p.id, p.type, p.slug, p.name, p.subtitle, p.gallery,
         p.base_price_cents, p.currency, a.top_reason, a.total::real
    from agg a join shop.products p on p.id = a.product_id
   where p.is_active = true
   order by a.total desc
   limit p_limit;
end $$;

grant execute on function app.recommend_for_user(uuid, int) to authenticated;

-- Refresh wrapper para llamar desde el cron handler (service_role).
create or replace function public.refresh_product_copurchases_safe()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently app.product_copurchases;
exception when others then
  -- fallback non-concurrent si no hay datos previos
  refresh materialized view app.product_copurchases;
end $$;
revoke all on function public.refresh_product_copurchases_safe() from public;
grant execute on function public.refresh_product_copurchases_safe() to service_role;
