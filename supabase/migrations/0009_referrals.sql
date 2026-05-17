-- 0009: programa de referidos / afiliados.
-- Cada usuario puede generar un código (slug) con %comisión.
-- Atribución por cookie 30 días → al pagarse la orden se crea una attribution.

create table app.referral_codes (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique check (code ~ '^[A-Z0-9_-]{3,32}$'),
  owner_user_id    uuid not null references auth.users(id) on delete cascade,
  commission_pct   numeric(5,2) not null default 10.00 check (commission_pct >= 0 and commission_pct <= 100),
  discount_pct     numeric(5,2) not null default 0 check (discount_pct >= 0 and discount_pct <= 100),
  max_uses         int,
  is_active        boolean not null default true,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on app.referral_codes(owner_user_id);
create trigger trg_referral_codes_updated
  before update on app.referral_codes
  for each row execute function app.set_updated_at();

-- Attribution: una atribución por (order_id) y opcionalmente cart_id para tracking pre-checkout.
create type app.referral_status as enum ('pending', 'confirmed', 'paid', 'reversed');

create table app.referral_attributions (
  id                uuid primary key default gen_random_uuid(),
  code_id           uuid not null references app.referral_codes(id) on delete restrict,
  code              text not null,
  cart_id           uuid references shop.carts(id) on delete set null,
  order_id          uuid references shop.orders(id) on delete set null,
  referred_user_id  uuid references auth.users(id) on delete set null,
  subtotal_cents    int not null default 0,
  commission_cents  int not null default 0,
  currency          text not null default 'ARS',
  status            app.referral_status not null default 'pending',
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on app.referral_attributions(code_id, status);
create index on app.referral_attributions(order_id);
create unique index referral_attribution_unique_order on app.referral_attributions(order_id)
  where order_id is not null;

create trigger trg_referral_attributions_updated
  before update on app.referral_attributions
  for each row execute function app.set_updated_at();

-- Vista resumen por código (dashboard del afiliado).
create or replace view app.referral_summary as
select
  rc.id as code_id,
  rc.code,
  rc.owner_user_id,
  rc.commission_pct,
  rc.is_active,
  count(ra.id) filter (where ra.status in ('confirmed','paid'))::int                          as conversions,
  coalesce(sum(ra.commission_cents) filter (where ra.status = 'confirmed'), 0)::int           as pending_cents,
  coalesce(sum(ra.commission_cents) filter (where ra.status = 'paid'), 0)::int                as paid_cents,
  coalesce(sum(ra.subtotal_cents) filter (where ra.status in ('confirmed','paid')), 0)::int   as gross_cents
from app.referral_codes rc
left join app.referral_attributions ra on ra.code_id = rc.id
group by rc.id;

-- RLS
alter table app.referral_codes        enable row level security;
alter table app.referral_attributions enable row level security;

create policy "referral_codes owner read"   on app.referral_codes
  for select using (auth.uid() = owner_user_id);
create policy "referral_codes owner update" on app.referral_codes
  for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "referral_codes staff all"    on app.referral_codes
  for all using (
    exists (select 1 from app.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
  );
-- Lectura pública por code (para resolver código en checkout sin filtrar más datos).
create policy "referral_codes public read code" on app.referral_codes
  for select using (is_active = true);

create policy "attributions owner read" on app.referral_attributions
  for select using (
    exists (select 1 from app.referral_codes rc where rc.id = code_id and rc.owner_user_id = auth.uid())
  );
create policy "attributions staff all" on app.referral_attributions
  for all using (
    exists (select 1 from app.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
  );

grant select on app.referral_codes, app.referral_attributions, app.referral_summary
  to anon, authenticated;
grant insert, update, delete on app.referral_codes, app.referral_attributions to authenticated;
