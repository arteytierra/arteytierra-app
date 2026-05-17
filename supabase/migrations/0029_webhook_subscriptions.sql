-- 0029_webhook_subscriptions.sql
-- Webhooks outbound: cualquier integración (partner, n8n externo, Zapier) puede
-- suscribirse a eventos del sistema con verificación HMAC-SHA256.

do $$ begin
  create type app.webhook_delivery_status as enum (
    'pending', 'success', 'failed', 'retrying', 'dead'
  );
exception when duplicate_object then null; end $$;

create table if not exists app.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  -- Para endpoints internos administrativos owner puede ser null
  label text not null,
  url text not null check (url ~* '^https?://'),
  secret text not null,                  -- HMAC secret (32+ chars)
  events text[] not null default '{}',   -- ['order.paid', 'certificate.issued', '*'] — '*' = todos
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  consecutive_failures int not null default 0
);

create index if not exists webhook_endpoints_owner_idx on app.webhook_endpoints (owner_user_id) where owner_user_id is not null;
create index if not exists webhook_endpoints_enabled_idx on app.webhook_endpoints (enabled) where enabled = true;

create table if not exists app.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid not null references app.webhook_endpoints(id) on delete cascade,
  event text not null,
  payload jsonb not null,
  status app.webhook_delivery_status not null default 'pending',
  attempts int not null default 0,
  next_attempt_at timestamptz,
  last_response_status int,
  last_response_body text,
  last_error text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists webhook_deliveries_endpoint_idx on app.webhook_deliveries (endpoint_id, created_at desc);
create index if not exists webhook_deliveries_pending_idx on app.webhook_deliveries (next_attempt_at)
  where status in ('pending', 'retrying');

alter table app.webhook_endpoints enable row level security;
alter table app.webhook_deliveries enable row level security;

drop policy if exists "owners read own endpoints" on app.webhook_endpoints;
create policy "owners read own endpoints" on app.webhook_endpoints
  for select using (auth.uid() = owner_user_id);

drop policy if exists "owners read own deliveries" on app.webhook_deliveries;
create policy "owners read own deliveries" on app.webhook_deliveries
  for select using (
    endpoint_id in (select id from app.webhook_endpoints where owner_user_id = auth.uid())
  );
-- inserts via service_role only
