-- 0021_global_search_rpc.sql
-- RPC unificada que busca en productos, posts y threads Q&A con ts_rank.
-- Devuelve resultados con score para ordenamiento mixto.

create or replace function app.global_search(
  p_query text,
  p_limit int default 12,
  p_user uuid default null
)
returns table (
  kind text,
  id uuid,
  title text,
  subtitle text,
  href text,
  thumb text,
  badge text,
  rank real
)
language plpgsql
stable
security definer
set search_path = app, shop, cms, edu, public
as $$
declare
  v_q tsquery;
  v_clean text := nullif(btrim(p_query), '');
begin
  if v_clean is null or char_length(v_clean) < 2 then
    return;
  end if;

  -- websearch_to_tsquery soporta "frases" y operadores básicos. unaccent
  -- iguala "cosmetica" ≈ "cosmética".
  v_q := websearch_to_tsquery('spanish', unaccent(v_clean));

  -- Productos activos
  return query
    select
      case when p.type = 'course' then 'course' else 'product' end as kind,
      p.id,
      p.name as title,
      p.subtitle,
      case p.type
        when 'course' then '/cursos/' || p.slug
        when 'ebook' then '/ebooks/' || p.slug
        when 'biocosmetic' then '/biocosmetica/' || p.slug
        when 'lodging' then '/hospedaje/' || p.slug
        when 'immersion' then '/inmersion-viva/' || p.slug
        when 'consult' then '/asesorias/' || p.slug
        else '/tienda/' || p.slug
      end as href,
      case
        when jsonb_typeof(p.gallery) = 'array' and jsonb_array_length(p.gallery) > 0
          then coalesce(p.gallery->0->>'url', p.gallery->>0)
        else null
      end as thumb,
      initcap(p.type) as badge,
      ts_rank(p.tsv, v_q) as rank
    from shop.products p
    where p.is_active = true and p.tsv @@ v_q
    order by rank desc
    limit p_limit;

  -- Posts publicados
  return query
    select
      'post' as kind,
      po.id,
      po.title,
      po.excerpt as subtitle,
      '/blog/' || po.slug as href,
      po.cover_url as thumb,
      'Blog' as badge,
      ts_rank(po.tsv, v_q) as rank
    from cms.posts po
    where po.published_at is not null and po.tsv @@ v_q
    order by rank desc
    limit p_limit;

  -- Threads Q&A: solo aquellos en cursos donde el usuario tiene enrollment
  -- o sin filtro si p_user es null (resultado vacío para preservar privacidad).
  if p_user is not null then
    return query
      select
        'thread' as kind,
        t.id,
        t.title,
        left(coalesce(t.body, ''), 160) as subtitle,
        '/cursos/' || pr.slug || '/q-a/' || t.id::text as href,
        null::text as thumb,
        'Foro' as badge,
        ts_rank(t.tsv, v_q) as rank
      from edu.threads t
      join edu.courses c on c.id = t.course_id
      join shop.products pr on pr.id = c.product_id
      join edu.enrollments e on e.course_id = c.id and e.user_id = p_user
      where t.hidden = false and t.tsv @@ v_q
      order by rank desc
      limit p_limit;
  end if;
end $$;

grant execute on function app.global_search(text, int, uuid) to anon, authenticated;
