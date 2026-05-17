-- 0022_attribution.sql
-- Atribución multi-touch: persistimos cada visita con UTMs en una tabla
-- de touchpoints, y resolvemos last-non-direct al convertir.

create table if not exists app.attribution_touches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  visitor_id text,                       -- cookie ay_vid (anónimo)
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  referrer text,
  landing_path text,
  partner_ref text,
  personal_ref text,
  created_at timestamptz not null default now()
);

create index if not exists attribution_user_idx on app.attribution_touches (user_id, created_at desc);
create index if not exists attribution_vid_idx  on app.attribution_touches (visitor_id, created_at desc);
create index if not exists attribution_campaign_idx on app.attribution_touches (campaign) where campaign is not null;

-- Snapshot por orden — vinculamos la conversión al último touch no-direct.
create table if not exists app.attribution_conversions (
  order_id uuid primary key references shop.orders(id) on delete cascade,
  user_id uuid,
  visitor_id text,
  first_touch_id uuid references app.attribution_touches(id) on delete set null,
  last_touch_id uuid references app.attribution_touches(id) on delete set null,
  -- Materialized para queries rápidas
  source text,
  medium text,
  campaign text,
  partner_ref text,
  personal_ref text,
  amount_cents bigint not null default 0,
  currency text not null default 'ARS',
  created_at timestamptz not null default now()
);

create index if not exists conversions_campaign_idx on app.attribution_conversions (campaign) where campaign is not null;
create index if not exists conversions_partner_idx  on app.attribution_conversions (partner_ref) where partner_ref is not null;
create index if not exists conversions_created_idx  on app.attribution_conversions (created_at desc);

-- View con resumen por campaign/source para el dashboard
create or replace view app.attribution_summary as
select
  coalesce(source, '(direct)')   as source,
  coalesce(medium, '(none)')     as medium,
  coalesce(campaign, '(none)')   as campaign,
  count(*)                       as conversions,
  sum(amount_cents)              as gross_cents,
  count(distinct user_id) filter (where user_id is not null) as buyers
from app.attribution_conversions
group by 1, 2, 3
order by gross_cents desc nulls last;

-- RLS
alter table app.attribution_touches enable row level security;
alter table app.attribution_conversions enable row level security;

drop policy if exists "users read own touches" on app.attribution_touches;
create policy "users read own touches" on app.attribution_touches
  for select using (auth.uid() = user_id);
-- inserts: solo service_role
