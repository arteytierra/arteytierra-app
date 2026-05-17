-- 0011: gift cards (tarjetas de regalo).
-- Modelo: producto virtual tipo `gift_card`. Al pagarse, se emite un código
-- con balance inicial. El destinatario lo aplica en checkout y descuenta del
-- subtotal. Multi-uso hasta agotar saldo. Cada redención queda en ledger.

-- Extender enum product_type para incluir 'gift_card'.
do $$ begin
  alter type shop.product_type add value if not exists 'consult';
  alter type shop.product_type add value if not exists 'biocosmetic';
  alter type shop.product_type add value if not exists 'gift_card';
exception when others then null;
end $$;

create table shop.gift_cards (
  id                    uuid primary key default gen_random_uuid(),
  code                  text not null unique check (code ~ '^[A-Z0-9]{12,20}$'),
  initial_cents         int not null check (initial_cents > 0),
  balance_cents         int not null check (balance_cents >= 0),
  currency              text not null default 'ARS' check (currency in ('ARS','USD')),
  issued_by_user_id     uuid references auth.users(id) on delete set null,
  issued_order_id       uuid references shop.orders(id) on delete set null,
  recipient_email       citext,
  recipient_name        text,
  message               text,
  expires_at            timestamptz,
  delivered_at          timestamptz,
  is_active             boolean not null default true,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on shop.gift_cards(recipient_email);
create index on shop.gift_cards(issued_by_user_id);
create trigger trg_gift_cards_updated
  before update on shop.gift_cards
  for each row execute function app.set_updated_at();

create table shop.gift_card_redemptions (
  id              uuid primary key default gen_random_uuid(),
  gift_card_id    uuid not null references shop.gift_cards(id) on delete restrict,
  order_id        uuid references shop.orders(id) on delete set null,
  cart_id         uuid references shop.carts(id) on delete set null,
  amount_cents    int not null check (amount_cents > 0),
  redeemed_by     uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index on shop.gift_card_redemptions(gift_card_id);
create index on shop.gift_card_redemptions(order_id);

-- Trigger: cuando se redime, decrementa balance atomicamente.
create or replace function shop.apply_gift_card_redemption()
returns trigger language plpgsql security definer set search_path = shop as $$
declare
  v_balance int;
begin
  update shop.gift_cards
     set balance_cents = balance_cents - new.amount_cents
   where id = new.gift_card_id
     and is_active = true
     and balance_cents >= new.amount_cents
     and (expires_at is null or expires_at > now())
   returning balance_cents into v_balance;
  if not found then
    raise exception 'gift_card_insufficient_balance_or_expired';
  end if;
  return new;
end;
$$;

create trigger trg_gift_card_redemption
  before insert on shop.gift_card_redemptions
  for each row execute function shop.apply_gift_card_redemption();

-- Columna en carts para reservar gift card aplicada antes de checkout.
alter table shop.carts
  add column if not exists gift_card_code text;

-- RLS
alter table shop.gift_cards            enable row level security;
alter table shop.gift_card_redemptions enable row level security;

-- Issuer (quien compró) puede ver sus gift cards emitidas.
create policy "gift_cards issuer read" on shop.gift_cards
  for select using (auth.uid() = issued_by_user_id);

-- Staff: todo.
create policy "gift_cards staff all" on shop.gift_cards
  for all using (
    exists (select 1 from app.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
  );
create policy "gift_card_redemptions staff all" on shop.gift_card_redemptions
  for all using (
    exists (select 1 from app.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
  );

grant select on shop.gift_cards, shop.gift_card_redemptions to authenticated;
grant insert, update on shop.gift_cards to authenticated;
grant insert on shop.gift_card_redemptions to authenticated;
