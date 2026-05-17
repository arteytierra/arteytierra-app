-- 0032: centro de ayuda — artículos buscables tipo Intercom KB.

create schema if not exists help;

create table if not exists help.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  icon        text,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists help.articles (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references help.categories(id) on delete set null,
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  body_md      text not null,
  tags         text[] not null default '{}',
  is_published boolean not null default false,
  view_count   int not null default 0,
  helpful_yes  int not null default 0,
  helpful_no   int not null default 0,
  author_id    uuid references app.profiles(id) on delete set null,
  search_tsv   tsvector
                 generated always as (
                   setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
                   setweight(to_tsvector('spanish', coalesce(excerpt, '')), 'B') ||
                   setweight(to_tsvector('spanish', coalesce(body_md, '')), 'C')
                 ) stored,
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists help_articles_search_idx on help.articles using gin(search_tsv);
create index if not exists help_articles_category_idx on help.articles(category_id) where is_published;
create trigger trg_help_articles_updated
  before update on help.articles
  for each row execute function app.set_updated_at();

-- Feedback "¿esto te resultó útil?".
create table if not exists help.article_feedback (
  id         bigserial primary key,
  article_id uuid not null references help.articles(id) on delete cascade,
  user_id    uuid references app.profiles(id) on delete set null,
  visitor_id text,
  helpful    boolean not null,
  comment    text,
  created_at timestamptz not null default now()
);
create index on help.article_feedback(article_id);

-- Búsqueda pública (artículos publicados).
create or replace function help.search_articles(p_query text, p_limit int default 12)
returns table(
  id uuid,
  slug text,
  title text,
  excerpt text,
  category_slug text,
  rank real
)
language sql stable security definer set search_path = help, app, public as $$
  with q as (select websearch_to_tsquery('spanish', coalesce(p_query, '')) as tsq)
  select
    a.id, a.slug, a.title, a.excerpt,
    c.slug as category_slug,
    ts_rank(a.search_tsv, q.tsq) as rank
  from help.articles a
  cross join q
  left join help.categories c on c.id = a.category_id
  where a.is_published = true
    and (p_query = '' or a.search_tsv @@ q.tsq)
  order by rank desc, a.view_count desc
  limit p_limit
$$;

-- Wrapper público para que PostgREST lo encuentre sin exponer schema help via RPC.
create or replace function public.search_help_articles(p_query text, p_limit int default 12)
returns table(id uuid, slug text, title text, excerpt text, category_slug text, rank real)
language sql stable security definer set search_path = help as $$
  select * from help.search_articles(p_query, p_limit)
$$;

create or replace function public.increment_article_view(p_slug text)
returns void language sql security definer set search_path = help as $$
  update help.articles set view_count = view_count + 1 where slug = p_slug and is_published
$$;

create or replace function public.help_inc_helpful_yes(p_article uuid)
returns void language sql security definer set search_path = help as $$
  update help.articles set helpful_yes = helpful_yes + 1 where id = p_article
$$;

create or replace function public.help_inc_helpful_no(p_article uuid)
returns void language sql security definer set search_path = help as $$
  update help.articles set helpful_no = helpful_no + 1 where id = p_article
$$;

alter table help.articles enable row level security;
alter table help.categories enable row level security;
alter table help.article_feedback enable row level security;

-- Lectura pública de artículos publicados.
drop policy if exists "help_articles read public" on help.articles;
create policy "help_articles read public" on help.articles
  for select using (is_published = true);
drop policy if exists "help_categories read public" on help.categories;
create policy "help_categories read public" on help.categories
  for select using (true);

-- Escritura sólo staff.
drop policy if exists "help_articles staff write" on help.articles;
create policy "help_articles staff write" on help.articles
  for all using (app.is_staff()) with check (app.is_staff());
drop policy if exists "help_categories staff write" on help.categories;
create policy "help_categories staff write" on help.categories
  for all using (app.is_staff()) with check (app.is_staff());

-- Feedback: cualquiera puede insertar; lectura sólo staff.
drop policy if exists "help_feedback insert public" on help.article_feedback;
create policy "help_feedback insert public" on help.article_feedback
  for insert with check (true);
drop policy if exists "help_feedback staff read" on help.article_feedback;
create policy "help_feedback staff read" on help.article_feedback
  for select using (app.is_staff());

-- Seed mínimo — 3 categorías base.
insert into help.categories (slug, title, description, position) values
  ('cursos', 'Cursos y enseñanza', 'Cómo inscribirte, ver clases, descargar certificados.', 10),
  ('pagos', 'Pagos y facturación', 'Métodos de pago, reembolsos, cupones.', 20),
  ('reservas', 'Reservas y hospedaje', 'Hospedaje en Tay Pichín, consultas, inmersiones.', 30)
on conflict (slug) do nothing;
