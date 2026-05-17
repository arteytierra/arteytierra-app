-- 0018_email_transactional.sql
-- Sistema de email transaccional con tracking (opens, clicks, bounces) y
-- preferencias granulares por categoría. Idempotente.

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────
do $$ begin
  create type app.email_status as enum (
    'queued', 'sent', 'delivered', 'opened', 'clicked',
    'bounced', 'complained', 'failed', 'suppressed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.email_category as enum (
    'transactional', -- siempre se envían (recibos, certificados, password reset)
    'orders',        -- compras, pagos pendientes, envíos
    'courses',       -- enrollment, nuevas clases, recordatorios
    'reservations',  -- hospedaje, asesorías
    'marketing',     -- newsletter, promos
    'community'      -- foros, respuestas, menciones
  );
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────
-- Tabla principal de mensajes
-- ─────────────────────────────────────────────────────────────
create table if not exists app.email_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  recipient text not null check (recipient ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  category app.email_category not null default 'transactional',
  template text not null,
  locale text not null default 'es' check (locale in ('es','en','pt')),
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  provider text,                  -- resend | postmark | smtp
  provider_message_id text,
  status app.email_status not null default 'queued',
  error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  complained_at timestamptz,
  open_count int not null default 0,
  click_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists email_messages_recipient_idx on app.email_messages (recipient);
create index if not exists email_messages_user_idx on app.email_messages (user_id) where user_id is not null;
create index if not exists email_messages_status_idx on app.email_messages (status, created_at desc);
create index if not exists email_messages_provider_msg_idx on app.email_messages (provider_message_id) where provider_message_id is not null;

-- ─────────────────────────────────────────────────────────────
-- Preferencias del usuario (opt-out granular)
-- ─────────────────────────────────────────────────────────────
create table if not exists app.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  orders boolean not null default true,
  courses boolean not null default true,
  reservations boolean not null default true,
  marketing boolean not null default true,
  community boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Suppression list por email (sin necesidad de cuenta) — bounces, complaints,
-- o unsubscribe explícito desde footer.
create table if not exists app.email_suppressions (
  email text primary key check (email = lower(email)),
  reason text not null,                    -- bounced | complaint | unsubscribed
  category app.email_category,             -- null = todas
  created_at timestamptz not null default now()
);

create index if not exists email_suppressions_cat_idx
  on app.email_suppressions (category) where category is not null;

-- ─────────────────────────────────────────────────────────────
-- RPCs de tracking (incrementan counters atómicamente)
-- ─────────────────────────────────────────────────────────────
create or replace function app.mark_email_opened(p_id uuid)
returns void
language plpgsql
security definer
set search_path = app, public
as $$
begin
  update app.email_messages
     set opened_at = coalesce(opened_at, now()),
         open_count = open_count + 1,
         status = case when status in ('sent','delivered') then 'opened' else status end
   where id = p_id;
end $$;

create or replace function app.mark_email_clicked(p_id uuid)
returns void
language plpgsql
security definer
set search_path = app, public
as $$
begin
  update app.email_messages
     set clicked_at = coalesce(clicked_at, now()),
         opened_at = coalesce(opened_at, now()),
         click_count = click_count + 1,
         status = case when status in ('sent','delivered','opened') then 'clicked' else status end
   where id = p_id;
end $$;

grant execute on function app.mark_email_opened(uuid) to anon, authenticated;
grant execute on function app.mark_email_clicked(uuid) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table app.email_messages enable row level security;
alter table app.email_preferences enable row level security;
alter table app.email_suppressions enable row level security;

drop policy if exists "users read own messages" on app.email_messages;
create policy "users read own messages" on app.email_messages
  for select using (auth.uid() = user_id);

drop policy if exists "users read own prefs" on app.email_preferences;
create policy "users read own prefs" on app.email_preferences
  for select using (auth.uid() = user_id);

drop policy if exists "users upsert own prefs" on app.email_preferences;
create policy "users upsert own prefs" on app.email_preferences
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update own prefs" on app.email_preferences;
create policy "users update own prefs" on app.email_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- suppressions: solo service_role
