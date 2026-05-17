-- =============================================================
--  Becas (scholarships) + Programas de partners (B2B referrals)
-- =============================================================

-- ---------- Becas ----------

do $$ begin
  if not exists (select 1 from pg_type where typname = 'scholarship_status') then
    create type app.scholarship_status as enum ('open', 'paused', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type app.application_status as enum ('pending', 'in_review', 'approved', 'rejected', 'expired');
  end if;
end $$;

create table if not exists app.scholarship_programs (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  summary           text,
  body_md           text,
  status            app.scholarship_status not null default 'open',
  discount_type     text not null check (discount_type in ('percent', 'fixed')) default 'percent',
  discount_value    int not null check (discount_value > 0),
  currency          text check (currency in ('ARS', 'USD')),
  applies_to        jsonb not null default '{}'::jsonb, -- {product_slugs:[], category:[]}
  max_grants        int,                                -- cupo total de becas
  granted_count     int not null default 0,
  max_per_user      int not null default 1,
  requires_evidence boolean not null default true,
  application_deadline timestamptz,
  valid_until       timestamptz,
  created_by        uuid references app.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_scholarships_status on app.scholarship_programs (status);

create table if not exists app.scholarship_applications (
  id                uuid primary key default gen_random_uuid(),
  program_id        uuid not null references app.scholarship_programs(id) on delete cascade,
  user_id           uuid not null references app.profiles(id) on delete cascade,
  motivation        text not null check (char_length(motivation) between 100 and 5000),
  evidence_path     text,                               -- storage path en bucket privado 'scholarships'
  household_info    jsonb default '{}'::jsonb,          -- ingresos, situación, etc (opcional)
  status            app.application_status not null default 'pending',
  reviewer_id       uuid references app.profiles(id) on delete set null,
  reviewer_notes    text,
  decision_at       timestamptz,
  granted_coupon    text references shop.coupons(code) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (program_id, user_id)
);

create index if not exists idx_apps_program on app.scholarship_applications (program_id, status);
create index if not exists idx_apps_user on app.scholarship_applications (user_id);
create index if not exists idx_apps_pending on app.scholarship_applications (status) where status in ('pending', 'in_review');

create or replace function app.bump_granted_count()
returns trigger language plpgsql security definer set search_path = app, public as $$
begin
  if new.status = 'approved' and (old.status is distinct from new.status) then
    update app.scholarship_programs
      set granted_count = granted_count + 1
      where id = new.program_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_bump_granted on app.scholarship_applications;
create trigger trg_bump_granted
  after update of status on app.scholarship_applications
  for each row execute function app.bump_granted_count();

-- ---------- Partner programs (B2B referrals) ----------

do $$ begin
  if not exists (select 1 from pg_type where typname = 'partner_status') then
    create type app.partner_status as enum ('pending', 'active', 'paused', 'banned');
  end if;
  if not exists (select 1 from pg_type where typname = 'commission_status') then
    create type app.commission_status as enum ('pending', 'confirmed', 'paid', 'reversed');
  end if;
end $$;

create table if not exists app.partner_programs (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  description     text,
  commission_pct  numeric(5,2) not null check (commission_pct >= 0 and commission_pct <= 90),
  tier            text not null default 'standard' check (tier in ('standard', 'silver', 'gold', 'enterprise')),
  payout_terms_md text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists app.partners (
  id              uuid primary key default gen_random_uuid(),
  program_id      uuid not null references app.partner_programs(id) on delete restrict,
  user_id         uuid not null references app.profiles(id) on delete cascade,
  organization    text,
  website         text,
  contact_email   text,
  ref_code        text not null unique check (ref_code ~ '^[A-Z0-9_-]{4,32}$'),
  status          app.partner_status not null default 'pending',
  application_md  text,
  approved_at     timestamptz,
  approved_by     uuid references app.profiles(id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  unique(program_id, user_id)
);

create index if not exists idx_partners_status on app.partners (status);

create table if not exists app.partner_commissions (
  id               uuid primary key default gen_random_uuid(),
  partner_id       uuid not null references app.partners(id) on delete cascade,
  order_id         uuid not null references shop.orders(id) on delete cascade,
  amount_cents     bigint not null,
  currency         text not null,
  commission_pct   numeric(5,2) not null,
  status           app.commission_status not null default 'pending',
  confirmed_at     timestamptz,
  paid_at          timestamptz,
  payout_ref       text,
  notes            text,
  created_at       timestamptz not null default now(),
  unique(order_id, partner_id)
);

create index if not exists idx_partner_comm_partner on app.partner_commissions (partner_id, status);
create index if not exists idx_partner_comm_status on app.partner_commissions (status);

create or replace view app.partner_summary as
select
  p.id as partner_id,
  p.ref_code,
  p.user_id,
  pp.name as program,
  pp.commission_pct as program_pct,
  coalesce(sum(c.amount_cents) filter (where c.status in ('confirmed','paid')), 0) as confirmed_cents,
  coalesce(sum(c.amount_cents) filter (where c.status = 'paid'), 0) as paid_cents,
  count(distinct c.order_id) as total_orders
from app.partners p
join app.partner_programs pp on pp.id = p.program_id
left join app.partner_commissions c on c.partner_id = p.id
group by p.id, p.ref_code, p.user_id, pp.name, pp.commission_pct;

-- RLS
alter table app.scholarship_programs enable row level security;
alter table app.scholarship_applications enable row level security;
alter table app.partner_programs enable row level security;
alter table app.partners enable row level security;
alter table app.partner_commissions enable row level security;

create policy "scholarships read all" on app.scholarship_programs
  for select using (status <> 'closed');

create policy "applications self read" on app.scholarship_applications
  for select using (auth.uid() = user_id);

create policy "applications self insert" on app.scholarship_applications
  for insert with check (auth.uid() = user_id);

create policy "partner programs public" on app.partner_programs
  for select using (is_active);

create policy "partners self read" on app.partners
  for select using (auth.uid() = user_id);

create policy "partner commissions self read" on app.partner_commissions
  for select using (
    exists (select 1 from app.partners pa where pa.id = partner_id and pa.user_id = auth.uid())
  );

-- Storage bucket nota: crear bucket privado 'scholarships' con policy
-- de upload sólo por el dueño (path prefix = auth.uid()::text).
