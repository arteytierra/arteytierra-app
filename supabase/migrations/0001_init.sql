-- =============================================================
--  Arte y Tierra — Migración inicial
--  Schemas: app, cms, shop, edu, book, fin
--  Postgres 15+ / Supabase
-- =============================================================

-- ---------- Extensiones ----------
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";
create extension if not exists "citext";

-- ---------- Schemas ----------
create schema if not exists app;
create schema if not exists cms;
create schema if not exists shop;
create schema if not exists edu;
create schema if not exists book;
create schema if not exists fin;

-- ---------- Wrappers IMMUTABLE para unaccent ----------
-- Necesarios para usar en columnas GENERATED ALWAYS AS (...) STORED.
-- La función unaccent() pública de la extensión NO es IMMUTABLE por defecto.
create or replace function public.immutable_unaccent(regdictionary, text)
returns text language sql immutable parallel safe as
$$ select unaccent($1, $2) $$;

create or replace function public.immutable_unaccent(text)
returns text language sql immutable parallel safe as
$$ select unaccent('unaccent', $1) $$;

-- =============================================================
--  Helpers
-- =============================================================
create or replace function app.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =============================================================
--  APP: profiles, addresses, contacts, events
-- =============================================================
create table app.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  avatar_url      text,
  phone           text,
  country         text,
  locale          text default 'es',
  role            text not null default 'customer'
                    check (role in ('customer','instructor','staff','admin')),
  marketing_consent boolean default false,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create trigger trg_profiles_updated
  before update on app.profiles
  for each row execute function app.set_updated_at();

-- Helpers que dependen de app.profiles (creados después de la tabla)
create or replace function app.is_staff() returns boolean
language sql stable as $$
  select exists (
    select 1 from app.profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

create or replace function app.is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from app.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table app.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references app.profiles(id) on delete cascade,
  label       text,
  line1       text not null,
  line2       text,
  city        text,
  state       text,
  country     text,
  zip         text,
  is_default  boolean default false,
  created_at  timestamptz default now()
);
create index on app.addresses(user_id);

create table app.contacts (
  id              uuid primary key default gen_random_uuid(),
  email           citext unique,
  phone           text,
  full_name       text,
  source          text,
  tags            text[] default '{}',
  lifecycle_stage text default 'lead'
                    check (lifecycle_stage in
                      ('lead','subscriber','customer','student','partner','archived')),
  notes           text,
  user_id         uuid references app.profiles(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index on app.contacts using gin(tags);
create trigger trg_contacts_updated
  before update on app.contacts
  for each row execute function app.set_updated_at();

create table app.events (
  id           uuid primary key default gen_random_uuid(),
  contact_id   uuid references app.contacts(id) on delete set null,
  user_id      uuid references app.profiles(id) on delete set null,
  name         text not null,
  properties   jsonb default '{}'::jsonb,
  occurred_at  timestamptz default now()
);
create index on app.events(name);
create index on app.events(occurred_at desc);
create index on app.events(user_id);

-- =============================================================
--  CMS: pages, posts, testimonials, media
-- =============================================================
create table cms.media (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  kind        text check (kind in ('image','video','pdf','audio','other')),
  alt         text,
  width       int,
  height      int,
  bytes       bigint,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

create table cms.pages (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  locale        text not null default 'es',
  title         text not null,
  seo           jsonb default '{}'::jsonb,
  blocks        jsonb default '[]'::jsonb,
  status        text not null default 'draft'
                  check (status in ('draft','published','archived')),
  published_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (slug, locale)
);
create trigger trg_pages_updated
  before update on cms.pages
  for each row execute function app.set_updated_at();

create table cms.posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null,
  locale           text not null default 'es',
  title            text not null,
  excerpt          text,
  body_mdx         text,
  cover_url        text,
  author_id        uuid references app.profiles(id) on delete set null,
  tags             text[] default '{}',
  category         text,
  reading_minutes  int,
  seo              jsonb default '{}'::jsonb,
  status           text not null default 'draft'
                     check (status in ('draft','published','archived')),
  published_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  tsv              tsvector generated always as (
                     setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(title,''))), 'A') ||
                     setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(excerpt,''))), 'B') ||
                     setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(body_mdx,''))), 'C')
                   ) stored,
  unique (slug, locale)
);
create index on cms.posts using gin(tsv);
create index on cms.posts using gin(tags);
create index on cms.posts(status, published_at desc);
create trigger trg_posts_updated
  before update on cms.posts
  for each row execute function app.set_updated_at();

create table cms.testimonials (
  id          uuid primary key default gen_random_uuid(),
  author      text not null,
  role        text,
  body        text not null,
  avatar_url  text,
  rating      int check (rating between 1 and 5),
  product_id  uuid,
  course_id   uuid,
  visible     boolean default true,
  created_at  timestamptz default now()
);

-- =============================================================
--  SHOP: products, prices, carts, orders, payments, coupons
-- =============================================================
create type shop.product_type as enum
  ('course','ebook','physical','service','lodging','immersion');

create table shop.products (
  id                uuid primary key default gen_random_uuid(),
  type              shop.product_type not null,
  slug              text not null unique,
  name              text not null,
  subtitle          text,
  description_mdx   text,
  gallery           jsonb default '[]'::jsonb,
  base_price_cents  int not null default 0,
  compare_at_cents  int,
  currency          text not null default 'ARS',
  attributes        jsonb default '{}'::jsonb,
  seo               jsonb default '{}'::jsonb,
  tags              text[] default '{}',
  category          text,
  is_active         boolean default true,
  stock             int,
  weight_grams      int,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index on shop.products(type, is_active);
create index on shop.products using gin(tags);
create trigger trg_products_updated
  before update on shop.products
  for each row execute function app.set_updated_at();

create table shop.prices_intl (
  product_id    uuid references shop.products(id) on delete cascade,
  currency      text not null,
  amount_cents  int not null,
  provider      text not null check (provider in ('stripe','mercadopago')),
  primary key (product_id, currency, provider)
);

create table shop.coupons (
  code         text primary key,
  type         text not null check (type in ('percent','fixed')),
  value        int not null,
  max_uses     int,
  used         int default 0,
  valid_from   timestamptz,
  valid_to     timestamptz,
  applies_to   jsonb default '{}'::jsonb,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

create table shop.carts (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references app.profiles(id) on delete set null,
  anon_token                text unique,
  currency                  text default 'ARS',
  coupon_code               text references shop.coupons(code) on delete set null,
  abandoned_email_sent_at   timestamptz,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);
create index on shop.carts(user_id);
create trigger trg_carts_updated
  before update on shop.carts
  for each row execute function app.set_updated_at();

create table shop.cart_items (
  id                uuid primary key default gen_random_uuid(),
  cart_id           uuid not null references shop.carts(id) on delete cascade,
  product_id        uuid not null references shop.products(id),
  qty               int not null default 1 check (qty > 0),
  unit_price_cents  int not null,
  metadata          jsonb default '{}'::jsonb,
  added_at          timestamptz default now()
);
create index on shop.cart_items(cart_id);

create table shop.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references app.profiles(id) on delete set null,
  contact_id          uuid references app.contacts(id) on delete set null,
  status              text not null default 'pending'
                        check (status in
                          ('pending','paid','failed','refunded','cancelled')),
  provider            text check (provider in ('stripe','mercadopago','manual')),
  provider_order_id   text,
  subtotal_cents      int not null default 0,
  discount_cents      int not null default 0,
  tax_cents           int not null default 0,
  total_cents         int not null default 0,
  currency            text not null default 'ARS',
  coupon_code         text references shop.coupons(code) on delete set null,
  billing             jsonb default '{}'::jsonb,
  shipping            jsonb default '{}'::jsonb,
  notes               text,
  created_at          timestamptz default now(),
  paid_at             timestamptz,
  refunded_at         timestamptz,
  unique (provider, provider_order_id)
);
create index on shop.orders(user_id);
create index on shop.orders(status, created_at desc);

create table shop.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references shop.orders(id) on delete cascade,
  product_id        uuid references shop.products(id) on delete set null,
  product_type      shop.product_type not null,
  name_snapshot     text not null,
  qty               int not null,
  unit_price_cents  int not null,
  total_cents       int not null,
  metadata          jsonb default '{}'::jsonb
);
create index on shop.order_items(order_id);

create table shop.payments (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references shop.orders(id) on delete cascade,
  provider              text not null,
  provider_payment_id   text not null,
  amount_cents          int not null,
  currency              text not null,
  status                text not null,
  raw                   jsonb default '{}'::jsonb,
  created_at            timestamptz default now(),
  unique (provider, provider_payment_id)
);

-- =============================================================
--  EDU: courses, modules, lessons, enrollments, progress, certs
-- =============================================================
create table edu.courses (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid unique references shop.products(id) on delete cascade,
  level           text check (level in ('intro','intermediate','advanced')),
  duration_hours  int,
  is_live         boolean default false,
  is_recorded     boolean default true,
  starts_at       timestamptz,
  capacity        int,
  instructor_id   uuid references app.profiles(id) on delete set null,
  resources       jsonb default '[]'::jsonb,
  created_at      timestamptz default now()
);

create table edu.modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references edu.courses(id) on delete cascade,
  position    int not null,
  title       text not null,
  summary     text,
  unique (course_id, position)
);

create table edu.lessons (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references edu.modules(id) on delete cascade,
  position        int not null,
  title           text not null,
  kind            text not null check (kind in ('video','pdf','text','live','quiz')),
  video_provider  text,
  video_id        text,
  resource_url    text,
  body_mdx        text,
  duration_sec    int,
  is_free_preview boolean default false,
  unique (module_id, position)
);

create table edu.enrollments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references app.profiles(id) on delete cascade,
  course_id     uuid not null references edu.courses(id) on delete cascade,
  order_item_id uuid references shop.order_items(id) on delete set null,
  enrolled_at   timestamptz default now(),
  expires_at    timestamptz,
  progress      numeric default 0 check (progress between 0 and 1),
  completed_at  timestamptz,
  unique (user_id, course_id)
);
create index on edu.enrollments(user_id);

create table edu.lesson_progress (
  user_id      uuid not null references app.profiles(id) on delete cascade,
  lesson_id    uuid not null references edu.lessons(id) on delete cascade,
  completed    boolean default false,
  watched_sec  int default 0,
  updated_at   timestamptz default now(),
  primary key (user_id, lesson_id)
);

create table edu.certificates (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null unique references edu.enrollments(id) on delete cascade,
  code           text not null unique,
  pdf_url        text,
  issued_at      timestamptz default now()
);

create table edu.threads (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references edu.courses(id) on delete cascade,
  user_id     uuid references app.profiles(id) on delete set null,
  title       text not null,
  body        text,
  created_at  timestamptz default now()
);
create table edu.thread_replies (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references edu.threads(id) on delete cascade,
  user_id     uuid references app.profiles(id) on delete set null,
  body        text not null,
  created_at  timestamptz default now()
);

-- =============================================================
--  BOOK: resources, availability, reservations
-- =============================================================
create table book.resources (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid references shop.products(id) on delete cascade,
  kind              text not null check (kind in ('lodging','consult','immersion')),
  capacity          int,
  calendar_settings jsonb default '{}'::jsonb,
  created_at        timestamptz default now()
);

create table book.availability (
  id           uuid primary key default gen_random_uuid(),
  resource_id  uuid not null references book.resources(id) on delete cascade,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  price_cents  int,
  status       text not null default 'open'
                 check (status in ('open','blocked','booked')),
  source       text default 'manual',
  external_id  text,
  check (ends_at > starts_at)
);
create index on book.availability(resource_id, starts_at);

create table book.reservations (
  id           uuid primary key default gen_random_uuid(),
  resource_id  uuid not null references book.resources(id),
  order_id     uuid references shop.orders(id) on delete set null,
  user_id      uuid references app.profiles(id) on delete set null,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  guests       int default 1,
  status       text not null default 'pending'
                 check (status in ('pending','confirmed','cancelled','checked_in','checked_out')),
  notes        text,
  ical_uid     text unique,
  created_at   timestamptz default now(),
  check (ends_at > starts_at)
);
create index on book.reservations(resource_id, starts_at);
create index on book.reservations(user_id);

-- =============================================================
--  FIN: accounts, categories, transactions, fx
-- =============================================================
create table fin.accounts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  currency   text not null,
  kind       text not null check (kind in ('bank','cash','mp','stripe','other')),
  is_active  boolean default true,
  created_at timestamptz default now()
);

create table fin.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text not null check (type in ('income','expense')),
  parent_id  uuid references fin.categories(id) on delete set null,
  color      text
);

create table fin.fx_rates (
  date       date not null,
  base       text not null,
  quote      text not null,
  rate       numeric not null,
  primary key (date, base, quote)
);

create table fin.transactions (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references fin.accounts(id),
  category_id     uuid references fin.categories(id) on delete set null,
  date            date not null default current_date,
  amount_cents    int not null,
  currency        text not null,
  type            text not null check (type in ('income','expense','transfer')),
  description     text,
  attachment_url  text,
  order_id        uuid references shop.orders(id) on delete set null,
  project         text,
  created_by      uuid references app.profiles(id) on delete set null,
  created_at      timestamptz default now()
);
create index on fin.transactions(date desc);
create index on fin.transactions(category_id);
create index on fin.transactions(order_id);

create or replace view fin.monthly_pnl as
select
  date_trunc('month', date)::date as month,
  currency,
  sum(amount_cents) filter (where type='income')  as income_cents,
  sum(amount_cents) filter (where type='expense') as expense_cents,
  sum(amount_cents) filter (where type='income') -
    sum(amount_cents) filter (where type='expense') as net_cents
from fin.transactions
group by 1, 2
order by 1 desc;

-- =============================================================
--  Triggers de negocio
-- =============================================================

-- Auto-crear profile al registrarse
create or replace function app.handle_new_user() returns trigger
language plpgsql security definer set search_path = public, app as $$
begin
  insert into app.profiles (id, full_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.email),
          new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- Sincronizar ingreso financiero al marcar orden como pagada
create or replace function shop.sync_order_to_finance() returns trigger
language plpgsql as $$
declare
  v_account uuid;
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    select id into v_account
      from fin.accounts
      where kind = new.provider and currency = new.currency
      limit 1;

    if v_account is not null then
      insert into fin.transactions
        (account_id, date, amount_cents, currency, type, description, order_id)
      values
        (v_account, current_date, new.total_cents, new.currency, 'income',
         'Venta ' || new.id::text, new.id);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_to_finance on shop.orders;
create trigger trg_orders_to_finance
  after update on shop.orders
  for each row execute function shop.sync_order_to_finance();

-- Decrementar stock al pagar
create or replace function shop.decrement_stock() returns trigger
language plpgsql as $$
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    update shop.products p
       set stock = p.stock - oi.qty
      from shop.order_items oi
     where oi.order_id = new.id
       and oi.product_id = p.id
       and p.stock is not null
       and p.type in ('physical','immersion');
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_decrement_stock on shop.orders;
create trigger trg_orders_decrement_stock
  after update on shop.orders
  for each row execute function shop.decrement_stock();

-- Crear enrollments al pagar un curso
create or replace function shop.create_enrollments_on_paid() returns trigger
language plpgsql as $$
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    insert into edu.enrollments (user_id, course_id, order_item_id)
    select new.user_id, c.id, oi.id
      from shop.order_items oi
      join edu.courses c on c.product_id = oi.product_id
     where oi.order_id = new.id
       and new.user_id is not null
    on conflict (user_id, course_id) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_create_enrollments on shop.orders;
create trigger trg_orders_create_enrollments
  after update on shop.orders
  for each row execute function shop.create_enrollments_on_paid();

-- =============================================================
--  Row Level Security
-- =============================================================

-- APP
alter table app.profiles  enable row level security;
alter table app.addresses enable row level security;
alter table app.contacts  enable row level security;
alter table app.events    enable row level security;

create policy "profiles self read" on app.profiles
  for select using (id = auth.uid() or app.is_staff());
create policy "profiles self update" on app.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles staff all" on app.profiles
  for all using (app.is_staff()) with check (app.is_staff());

create policy "addresses self" on app.addresses
  for all using (user_id = auth.uid() or app.is_staff())
  with check (user_id = auth.uid() or app.is_staff());

create policy "contacts staff only" on app.contacts
  for all using (app.is_staff()) with check (app.is_staff());

create policy "events insert anyone" on app.events
  for insert with check (true);
create policy "events read self" on app.events
  for select using (user_id = auth.uid() or app.is_staff());

-- CMS — lectura pública de publicado, escritura staff
alter table cms.pages        enable row level security;
alter table cms.posts        enable row level security;
alter table cms.testimonials enable row level security;
alter table cms.media        enable row level security;

create policy "pages public read"  on cms.pages
  for select using (status = 'published' or app.is_staff());
create policy "pages staff write"  on cms.pages
  for all using (app.is_staff()) with check (app.is_staff());

create policy "posts public read"  on cms.posts
  for select using (status = 'published' or app.is_staff());
create policy "posts staff write"  on cms.posts
  for all using (app.is_staff()) with check (app.is_staff());

create policy "testimonials read"  on cms.testimonials
  for select using (visible or app.is_staff());
create policy "testimonials write" on cms.testimonials
  for all using (app.is_staff()) with check (app.is_staff());

create policy "media read"  on cms.media for select using (true);
create policy "media write" on cms.media
  for all using (app.is_staff()) with check (app.is_staff());

-- SHOP — productos público read, resto restringido
alter table shop.products     enable row level security;
alter table shop.prices_intl  enable row level security;
alter table shop.coupons      enable row level security;
alter table shop.carts        enable row level security;
alter table shop.cart_items   enable row level security;
alter table shop.orders       enable row level security;
alter table shop.order_items  enable row level security;
alter table shop.payments     enable row level security;

create policy "products public" on shop.products
  for select using (is_active or app.is_staff());
create policy "products staff" on shop.products
  for all using (app.is_staff()) with check (app.is_staff());

create policy "prices public" on shop.prices_intl
  for select using (true);
create policy "prices staff" on shop.prices_intl
  for all using (app.is_staff()) with check (app.is_staff());

create policy "coupons staff" on shop.coupons
  for all using (app.is_staff()) with check (app.is_staff());

create policy "carts owner" on shop.carts
  for all using (user_id = auth.uid() or app.is_staff())
  with check (user_id = auth.uid() or app.is_staff());
create policy "cart items owner" on shop.cart_items
  for all using (exists (
    select 1 from shop.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or app.is_staff())
  ));

create policy "orders owner read" on shop.orders
  for select using (user_id = auth.uid() or app.is_staff());
create policy "orders staff write" on shop.orders
  for all using (app.is_staff()) with check (app.is_staff());

create policy "order items via order" on shop.order_items
  for select using (exists (
    select 1 from shop.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or app.is_staff())
  ));

create policy "payments staff" on shop.payments
  for all using (app.is_staff()) with check (app.is_staff());

-- EDU — alumno ve lo propio, staff todo
alter table edu.courses          enable row level security;
alter table edu.modules          enable row level security;
alter table edu.lessons          enable row level security;
alter table edu.enrollments      enable row level security;
alter table edu.lesson_progress  enable row level security;
alter table edu.certificates     enable row level security;
alter table edu.threads          enable row level security;
alter table edu.thread_replies   enable row level security;

create policy "courses public read"  on edu.courses for select using (true);
create policy "courses staff write"  on edu.courses
  for all using (app.is_staff()) with check (app.is_staff());

create policy "modules public read"  on edu.modules for select using (true);
create policy "modules staff write"  on edu.modules
  for all using (app.is_staff()) with check (app.is_staff());

-- Lecciones: free preview público, resto sólo con enrollment vigente
create policy "lessons preview or enrolled" on edu.lessons
  for select using (
    is_free_preview
    or app.is_staff()
    or exists (
      select 1
        from edu.enrollments e
        join edu.modules m on m.course_id = e.course_id
       where m.id = lessons.module_id
         and e.user_id = auth.uid()
         and (e.expires_at is null or e.expires_at > now())
    )
  );
create policy "lessons staff write" on edu.lessons
  for all using (app.is_staff()) with check (app.is_staff());

create policy "enrollments self" on edu.enrollments
  for select using (user_id = auth.uid() or app.is_staff());
create policy "enrollments staff write" on edu.enrollments
  for all using (app.is_staff()) with check (app.is_staff());

create policy "progress self" on edu.lesson_progress
  for all using (user_id = auth.uid() or app.is_staff())
  with check (user_id = auth.uid() or app.is_staff());

create policy "certificates self read" on edu.certificates
  for select using (
    app.is_staff() or exists (
      select 1 from edu.enrollments e
       where e.id = certificates.enrollment_id and e.user_id = auth.uid()
    )
  );

create policy "threads read enrolled" on edu.threads
  for select using (
    app.is_staff() or exists (
      select 1 from edu.enrollments e
       where e.course_id = threads.course_id and e.user_id = auth.uid()
    )
  );
create policy "threads write enrolled" on edu.threads
  for insert with check (
    user_id = auth.uid() and exists (
      select 1 from edu.enrollments e
       where e.course_id = threads.course_id and e.user_id = auth.uid()
    )
  );

create policy "replies read via thread" on edu.thread_replies
  for select using (exists (
    select 1 from edu.threads t
     where t.id = thread_replies.thread_id
       and (app.is_staff() or exists (
          select 1 from edu.enrollments e
           where e.course_id = t.course_id and e.user_id = auth.uid()
       ))
  ));
create policy "replies write enrolled" on edu.thread_replies
  for insert with check (user_id = auth.uid());

-- BOOK
alter table book.resources     enable row level security;
alter table book.availability  enable row level security;
alter table book.reservations  enable row level security;

create policy "resources public read" on book.resources for select using (true);
create policy "resources staff write" on book.resources
  for all using (app.is_staff()) with check (app.is_staff());

create policy "availability public read" on book.availability for select using (true);
create policy "availability staff write" on book.availability
  for all using (app.is_staff()) with check (app.is_staff());

create policy "reservations owner read" on book.reservations
  for select using (user_id = auth.uid() or app.is_staff());
create policy "reservations staff write" on book.reservations
  for all using (app.is_staff()) with check (app.is_staff());

-- FIN — sólo staff/admin
alter table fin.accounts      enable row level security;
alter table fin.categories    enable row level security;
alter table fin.transactions  enable row level security;
alter table fin.fx_rates      enable row level security;

create policy "fin staff all accounts" on fin.accounts
  for all using (app.is_staff()) with check (app.is_staff());
create policy "fin staff all categories" on fin.categories
  for all using (app.is_staff()) with check (app.is_staff());
create policy "fin staff all tx" on fin.transactions
  for all using (app.is_staff()) with check (app.is_staff());
create policy "fin staff all fx" on fin.fx_rates
  for all using (app.is_staff()) with check (app.is_staff());

-- =============================================================
--  Permisos por defecto
-- =============================================================
grant usage on schema app, cms, shop, edu, book, fin to anon, authenticated;

grant select on cms.pages, cms.posts, cms.testimonials, cms.media,
                shop.products, shop.prices_intl,
                edu.courses, edu.modules, edu.lessons,
                book.resources, book.availability
  to anon, authenticated;

grant select, insert, update, delete on all tables in schema app  to authenticated;
grant select, insert, update, delete on all tables in schema shop to authenticated;
grant select, insert, update, delete on all tables in schema edu  to authenticated;
grant select, insert, update, delete on all tables in schema book to authenticated;
grant select, insert, update, delete on all tables in schema cms  to authenticated;
grant select, insert, update, delete on all tables in schema fin  to authenticated;

-- =============================================================
--  Storage buckets (ejecutar después en Supabase Studio o supabase CLI)
-- =============================================================
-- insert into storage.buckets (id,name,public) values
--   ('public-media','public-media',true),
--   ('course-videos','course-videos',false),
--   ('ebooks','ebooks',false),
--   ('finance-attachments','finance-attachments',false),
--   ('certificates','certificates',false)
-- on conflict do nothing;
