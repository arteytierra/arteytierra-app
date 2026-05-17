-- 0030: cupones avanzados — BOGO, bundles, stackables, condiciones ricas.
-- Mantiene retro-compat con shop.coupons (code/type/value/used).
-- Suma:
--   * nuevos `kind` (bogo, bundle, free_shipping) en columna paralela `kind`
--   * stackable + priority (orden de aplicación, ASC = primero)
--   * conditions jsonb: { product_ids[], category_slugs[], product_types[], first_order_only,
--                         min_subtotal_cents, max_uses_per_user }
--   * config jsonb para BOGO/bundle:
--       BOGO   → { buy_product_ids[], buy_qty, get_product_ids[], get_qty, get_discount_pct }
--       bundle → { required_product_ids[], bundle_price_cents }
--   * `shop.cart_coupons` — junction n:m, habilita stacking
--   * `shop.coupon_redemptions` — uso por usuario (para max_uses_per_user)

alter table shop.coupons
  add column if not exists kind text
    check (kind in ('percent', 'fixed', 'bogo', 'bundle', 'free_shipping')),
  add column if not exists stackable boolean not null default false,
  add column if not exists priority int not null default 100,
  add column if not exists conditions jsonb not null default '{}'::jsonb,
  add column if not exists config jsonb not null default '{}'::jsonb,
  add column if not exists name text;

-- Backfill kind desde type (compat).
update shop.coupons set kind = type where kind is null;

create index if not exists coupons_active_idx
  on shop.coupons(is_active, priority) where is_active = true;

-- Stack n:m. Cada cart puede acumular varios cupones (si todos son stackable
-- o si sólo hay uno no-stackable; el engine valida).
create table if not exists shop.cart_coupons (
  cart_id     uuid not null references shop.carts(id) on delete cascade,
  code        text not null references shop.coupons(code) on delete cascade,
  applied_at  timestamptz not null default now(),
  primary key (cart_id, code)
);
create index if not exists cart_coupons_code_idx on shop.cart_coupons(code);

-- Histórico de redenciones (usado por max_uses_per_user y para invariantes
-- post-pago — el counter `used` en shop.coupons sigue actualizándose).
create table if not exists shop.coupon_redemptions (
  id           bigserial primary key,
  code         text not null references shop.coupons(code) on delete cascade,
  user_id      uuid references app.profiles(id) on delete set null,
  order_id     uuid references shop.orders(id) on delete set null,
  discount_cents int not null default 0,
  redeemed_at  timestamptz not null default now()
);
create index if not exists coupon_redemptions_user_idx
  on shop.coupon_redemptions(code, user_id);
create index if not exists coupon_redemptions_order_idx
  on shop.coupon_redemptions(order_id);

-- RLS: las tablas heredan políticas staff de shop. Para cart_coupons,
-- los clientes los manipulan vía server actions con service_role.
alter table shop.cart_coupons enable row level security;
alter table shop.coupon_redemptions enable row level security;

drop policy if exists "cart_coupons staff" on shop.cart_coupons;
create policy "cart_coupons staff" on shop.cart_coupons
  for all using (app.is_staff()) with check (app.is_staff());
drop policy if exists "coupon_redemptions staff" on shop.coupon_redemptions;
create policy "coupon_redemptions staff" on shop.coupon_redemptions
  for all using (app.is_staff()) with check (app.is_staff());

-- Incremento atómico de `used` en shop.coupons.
create or replace function public.increment_coupon_used(p_code text)
returns void language sql security definer set search_path = shop as $$
  update shop.coupons set used = coalesce(used, 0) + 1 where code = p_code
$$;

-- Helper para contar uso por usuario.
create or replace function shop.coupon_user_usage(p_code text, p_user uuid)
returns int language sql stable security definer set search_path = shop, app as $$
  select coalesce(count(*), 0)::int from shop.coupon_redemptions
   where code = p_code and user_id = p_user
$$;

-- Bundle: detecta si un cart contiene TODOS los product_ids requeridos.
-- Devuelve unidades-bundle (min qty entre productos) que se pueden formar.
create or replace function shop.bundle_units_in_cart(p_cart uuid, p_required uuid[])
returns int language sql stable security definer set search_path = shop as $$
  with required as (select unnest(p_required) as pid),
       avail as (
         select ci.product_id, sum(ci.qty)::int as q
           from shop.cart_items ci
          where ci.cart_id = p_cart
          group by ci.product_id
       )
  select case
    when (select count(*) from required) =
         (select count(*) from required r join avail a on a.product_id = r.pid)
      then (select min(a.q) from required r join avail a on a.product_id = r.pid)
    else 0
  end
$$;
