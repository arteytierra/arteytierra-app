-- 0005: agrega campos opcionales para cupones (descripción, mínimo subtotal, currency de fixed).

alter table shop.coupons
  add column if not exists description text,
  add column if not exists currency text check (currency in ('ARS', 'USD')),
  add column if not exists min_subtotal_cents integer;
