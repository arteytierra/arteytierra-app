-- 0012: wallet de créditos / saldo interno con ledger double-entry simple.
-- Cada usuario tiene N accounts (una por currency). Cada operación inserta un
-- entry con signo y persiste balance_after para auditoría rápida. El balance
-- "real" se calcula vía SUM y se reconcilia con `wallet_accounts.balance_cents`.

create table app.wallet_accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  currency        text not null check (currency in ('ARS','USD')),
  balance_cents   bigint not null default 0,
  is_frozen       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(user_id, currency)
);
create trigger trg_wallet_accounts_updated
  before update on app.wallet_accounts
  for each row execute function app.set_updated_at();

create type app.wallet_source as enum (
  'manual_adjustment',
  'refund_credit',
  'referral_reward',
  'promo_credit',
  'order_payment',
  'order_refund',
  'gift_card_conversion'
);

create table app.wallet_entries (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references app.wallet_accounts(id) on delete cascade,
  amount_cents    bigint not null check (amount_cents <> 0),  -- signed
  source          app.wallet_source not null,
  ref_id          text,                                       -- order_id, attribution_id, gift_card_code…
  description     text,
  balance_after   bigint not null,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index on app.wallet_entries(account_id, created_at desc);
create index on app.wallet_entries(source, ref_id);

-- RPC atómica para mover saldo. Lock row con FOR UPDATE para evitar carreras.
create or replace function app.wallet_transact(
  p_user uuid,
  p_currency text,
  p_amount_cents bigint,
  p_source app.wallet_source,
  p_ref text default null,
  p_description text default null,
  p_created_by uuid default null
) returns table (entry_id uuid, balance_after bigint)
language plpgsql security definer set search_path = app, public as $$
declare
  v_account_id uuid;
  v_balance    bigint;
  v_new        bigint;
  v_entry      uuid;
begin
  if p_amount_cents = 0 then
    raise exception 'wallet_amount_zero';
  end if;

  -- Lock o crea account
  select id, balance_cents into v_account_id, v_balance
    from app.wallet_accounts
   where user_id = p_user and currency = p_currency
   for update;

  if not found then
    insert into app.wallet_accounts(user_id, currency, balance_cents)
      values (p_user, p_currency, 0)
      returning id, balance_cents into v_account_id, v_balance;
  end if;

  v_new := v_balance + p_amount_cents;
  if v_new < 0 then
    raise exception 'wallet_insufficient_funds'
      using detail = format('current=%s, attempt=%s', v_balance, p_amount_cents);
  end if;

  update app.wallet_accounts
     set balance_cents = v_new
   where id = v_account_id;

  insert into app.wallet_entries(account_id, amount_cents, source, ref_id, description, balance_after, created_by)
    values (v_account_id, p_amount_cents, p_source, p_ref, p_description, v_new, p_created_by)
    returning id into v_entry;

  entry_id := v_entry;
  balance_after := v_new;
  return next;
end;
$$;

-- RLS
alter table app.wallet_accounts enable row level security;
alter table app.wallet_entries  enable row level security;

create policy "wallet_accounts owner read" on app.wallet_accounts
  for select using (auth.uid() = user_id);
create policy "wallet_accounts staff all"  on app.wallet_accounts
  for all using (
    exists (select 1 from app.profiles p where p.user_id = auth.uid() and p.role in ('staff','admin'))
  );

create policy "wallet_entries owner read"  on app.wallet_entries
  for select using (
    exists (select 1 from app.wallet_accounts wa
            where wa.id = account_id and wa.user_id = auth.uid())
  );
create policy "wallet_entries staff all"   on app.wallet_entries
  for all using (
    exists (select 1 from app.profiles p where p.user_id = auth.uid() and p.role in ('staff','admin'))
  );

grant select on app.wallet_accounts, app.wallet_entries to authenticated;
grant execute on function app.wallet_transact(uuid, text, bigint, app.wallet_source, text, text, uuid)
  to authenticated;

-- Flag en carts para opt-in de pago con saldo
alter table shop.carts
  add column if not exists use_wallet boolean not null default false;
