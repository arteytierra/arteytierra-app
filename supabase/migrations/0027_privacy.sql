-- 0027_privacy.sql
-- GDPR/LGPD: consent banner, data export requests, account deletion queue.

do $$ begin
  create type app.consent_category as enum ('necessary', 'analytics', 'marketing', 'personalization');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.privacy_request_kind as enum ('export', 'delete', 'rectification');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.privacy_request_status as enum ('pending', 'processing', 'completed', 'rejected');
exception when duplicate_object then null; end $$;

-- Consent: persistido por user O por visitor_id si no autenticado
create table if not exists app.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  visitor_id text,
  necessary boolean not null default true,    -- siempre true
  analytics boolean not null default false,
  marketing boolean not null default false,
  personalization boolean not null default false,
  policy_version text not null default 'v1',
  user_agent text,
  ip inet,
  created_at timestamptz not null default now()
);

create index if not exists consents_user_idx on app.consents (user_id, created_at desc) where user_id is not null;
create index if not exists consents_visitor_idx on app.consents (visitor_id, created_at desc) where visitor_id is not null;

-- Solicitudes DSR (Data Subject Requests)
create table if not exists app.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind app.privacy_request_kind not null,
  status app.privacy_request_status not null default 'pending',
  notes text,
  payload_url text,                            -- signed URL del bundle export
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  scheduled_for timestamptz,                   -- para deletes con cooling-off de 30 días
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists privacy_requests_user_idx on app.privacy_requests (user_id, created_at desc);
create index if not exists privacy_requests_status_idx on app.privacy_requests (status) where status in ('pending', 'processing');

alter table app.consents enable row level security;
alter table app.privacy_requests enable row level security;

drop policy if exists "users read own consents" on app.consents;
create policy "users read own consents" on app.consents
  for select using (auth.uid() = user_id);

drop policy if exists "users insert own consents" on app.consents;
create policy "users insert own consents" on app.consents
  for insert with check (auth.uid() = user_id or auth.uid() is null);

drop policy if exists "users read own requests" on app.privacy_requests;
create policy "users read own requests" on app.privacy_requests
  for select using (auth.uid() = user_id);

drop policy if exists "users insert own requests" on app.privacy_requests;
create policy "users insert own requests" on app.privacy_requests
  for insert with check (auth.uid() = user_id);
