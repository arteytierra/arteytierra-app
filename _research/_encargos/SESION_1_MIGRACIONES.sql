-- ===========================================================================
-- SESIÓN 1 — Las cuatro migraciones aditivas, en orden, listas para pegar.
-- Generado el 04/09/2026 desde los archivos reales del monorepo y del landing.
--
-- CÓMO SE USA: abrí el editor SQL de Supabase, pegá TODO este archivo y dale
-- Run. No pegues la ruta del archivo: el editor no abre archivos, sólo ejecuta
-- el texto que le pegues.
--
-- Es idempotente: todo es "create ... if not exists" o "create or replace".
-- Si falla a la mitad, arreglás y lo volvés a correr entero sin problema.
--
-- NO incluye 0051_acequia_commercial_trial.sql a propósito: es la única que
-- toca datos vivos (terreno.suscripciones) y su propia cabecera dice que se
-- deja sin aplicar hasta completar sandbox y revisión legal. Va con pagos.
--
-- NO incluye 202608290001_acequia_public_forms.sql del landing: es el mismo
-- contenido que 0049+0050 con un índice de menos.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1 de 4 — 0049_acequia_public_forms.sql (monorepo)
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;

create table if not exists public.acequia_pilot_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null,
  profession text not null check (char_length(profession) between 2 and 120),
  country_region text not null check (char_length(country_region) between 2 and 160),
  property_type text not null check (char_length(property_type) between 2 and 120),
  motivation text not null check (char_length(motivation) between 20 and 2000),
  status text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'waitlist', 'declined')),
  consent boolean not null check (consent = true),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create unique index if not exists acequia_pilot_applications_email_unique
  on public.acequia_pilot_applications (lower(email));
create index if not exists acequia_pilot_applications_created_at_idx
  on public.acequia_pilot_applications (created_at desc);
create index if not exists acequia_pilot_applications_ip_hash_idx
  on public.acequia_pilot_applications (ip_hash, created_at desc);

alter table public.acequia_pilot_applications enable row level security;

create table if not exists public.acequia_account_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  request_type text not null check (request_type in ('arrepentimiento', 'baja')),
  details text check (details is null or char_length(details) <= 1500),
  status text not null default 'new' check (status in ('new', 'processing', 'resolved', 'rejected')),
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);

create index if not exists acequia_account_requests_created_at_idx
  on public.acequia_account_requests (created_at desc);

alter table public.acequia_account_requests enable row level security;

comment on table public.acequia_pilot_applications is
  'Postulaciones al programa fundador de Acequia. Sólo se accede desde servidor con service role.';
comment on table public.acequia_account_requests is
  'Solicitudes de arrepentimiento o baja. Sólo se accede desde servidor con service role.';


-- ---------------------------------------------------------------------------
-- 2 de 4 — 0050_acequia_public_form_functions.sql (monorepo)
-- ---------------------------------------------------------------------------

alter table public.acequia_account_requests
  add column if not exists ip_hash text,
  add column if not exists user_agent text;

create index if not exists acequia_account_requests_ip_hash_idx
  on public.acequia_account_requests (ip_hash, created_at desc);

comment on table public.acequia_pilot_applications is
  'Postulaciones al programa fundador de Acequia. La tabla permanece privada.';
comment on table public.acequia_account_requests is
  'Solicitudes de arrepentimiento o baja. La tabla permanece privada.';

create or replace function public.submit_acequia_pilot_application(
  p_name text,
  p_email text,
  p_profession text,
  p_country_region text,
  p_property_type text,
  p_motivation text,
  p_consent boolean,
  p_ip_hash text,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_created_at timestamptz;
  v_email text := lower(btrim(p_email));
begin
  if char_length(btrim(p_name)) not between 2 and 120
    or char_length(v_email) not between 3 and 254
    or position('@' in v_email) < 2
    or char_length(btrim(p_profession)) not between 2 and 120
    or char_length(btrim(p_country_region)) not between 2 and 160
    or char_length(btrim(p_property_type)) not between 2 and 120
    or char_length(btrim(p_motivation)) not between 20 and 2000
    or p_consent is distinct from true
    or char_length(coalesce(p_ip_hash, '')) not between 32 and 128
    or char_length(coalesce(p_user_agent, '')) > 500 then
    raise exception using errcode = '22023', message = 'invalid_input';
  end if;

  if (select count(*) from public.acequia_pilot_applications
      where ip_hash = p_ip_hash and created_at >= now() - interval '1 hour') >= 3 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  begin
    insert into public.acequia_pilot_applications (
      name, email, profession, country_region, property_type, motivation,
      consent, ip_hash, user_agent
    ) values (
      btrim(p_name), v_email, btrim(p_profession), btrim(p_country_region),
      btrim(p_property_type), btrim(p_motivation), true, p_ip_hash, p_user_agent
    )
    returning id, created_at into v_id, v_created_at;
  exception when unique_violation then
    return jsonb_build_object('duplicate', true);
  end;

  return jsonb_build_object('id', v_id, 'created_at', v_created_at, 'duplicate', false);
end;
$$;

create or replace function public.submit_acequia_account_request(
  p_email text,
  p_request_type text,
  p_details text,
  p_consent boolean,
  p_ip_hash text,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_email text := lower(btrim(p_email));
begin
  if char_length(v_email) not between 3 and 254
    or position('@' in v_email) < 2
    or p_request_type not in ('arrepentimiento', 'baja')
    or char_length(coalesce(p_details, '')) > 1500
    or p_consent is distinct from true
    or char_length(coalesce(p_ip_hash, '')) not between 32 and 128
    or char_length(coalesce(p_user_agent, '')) > 500 then
    raise exception using errcode = '22023', message = 'invalid_input';
  end if;

  if (select count(*) from public.acequia_account_requests
      where ip_hash = p_ip_hash and created_at >= now() - interval '1 hour') >= 5 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.acequia_account_requests (
    email, request_type, details, consent, ip_hash, user_agent
  ) values (
    v_email, p_request_type, nullif(btrim(p_details), ''), true, p_ip_hash, p_user_agent
  ) returning id into v_id;

  return jsonb_build_object('id', v_id);
end;
$$;

revoke all on function public.submit_acequia_pilot_application(text, text, text, text, text, text, boolean, text, text) from public;
revoke all on function public.submit_acequia_account_request(text, text, text, boolean, text, text) from public;

grant execute on function public.submit_acequia_pilot_application(text, text, text, text, text, text, boolean, text, text)
  to anon, authenticated, service_role;
grant execute on function public.submit_acequia_account_request(text, text, text, boolean, text, text)
  to anon, authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 3 de 4 — 202609020001_pilot_feedback_metrics.sql (landing)
-- ---------------------------------------------------------------------------

create table if not exists public.acequia_pilot_participants (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.acequia_pilot_applications(id) on delete set null,
  display_name text not null check (char_length(display_name) between 2 and 120),
  email text not null,
  code_hash text not null unique check (char_length(code_hash) = 64),
  status text not null default 'active' check (status in ('invited', 'active', 'paused', 'completed', 'withdrawn')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists acequia_pilot_participants_email_unique
  on public.acequia_pilot_participants (lower(email));

create table if not exists public.acequia_pilot_feedback (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.acequia_pilot_participants(id) on delete cascade,
  stage text not null check (stage in ('registro', 'bienvenida', 'mapa', 'datos', 'diseno', 'cuenta', 'otro')),
  category text not null check (category in ('error', 'comprension', 'datos', 'utilidad', 'idea')),
  severity text not null check (severity in ('bajo', 'medio', 'alto', 'critico')),
  rating smallint not null check (rating between 1 and 5),
  blocked boolean not null default false,
  description text not null check (char_length(description) between 20 and 2500),
  expected text check (expected is null or char_length(expected) <= 1500),
  contact_consent boolean not null default false,
  status text not null default 'nuevo' check (status in ('nuevo', 'revisando', 'planificado', 'resuelto', 'descartado')),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 3000),
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists acequia_pilot_feedback_priority_idx
  on public.acequia_pilot_feedback (severity, status, created_at desc);
create index if not exists acequia_pilot_feedback_participant_idx
  on public.acequia_pilot_feedback (participant_id, created_at desc);

create table if not exists public.acequia_product_events (
  id bigint generated by default as identity primary key,
  event_name text not null check (event_name in ('page_view', 'cta_click', 'pilot_application_started', 'pilot_application_submitted', 'pilot_application_failed', 'feedback_started', 'feedback_submitted', 'feedback_failed', 'registration_step')),
  path text not null check (char_length(path) between 1 and 500),
  anonymous_hash text not null check (char_length(anonymous_hash) = 64),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists acequia_product_events_funnel_idx
  on public.acequia_product_events (event_name, created_at desc);
create index if not exists acequia_product_events_rate_idx
  on public.acequia_product_events (anonymous_hash, created_at desc);

alter table public.acequia_pilot_participants enable row level security;
alter table public.acequia_pilot_feedback enable row level security;
alter table public.acequia_product_events enable row level security;

comment on table public.acequia_pilot_participants is 'Participantes aceptados y códigos privados del piloto fundador.';
comment on table public.acequia_pilot_feedback is 'Devoluciones clasificadas del piloto. Acceso administrativo únicamente desde servidor.';
comment on table public.acequia_product_events is 'Eventos mínimos del recorrido. No contiene IP ni email en claro.';

create or replace function public.submit_acequia_pilot_feedback(
  p_code_hash text,
  p_stage text,
  p_category text,
  p_severity text,
  p_rating integer,
  p_blocked boolean,
  p_description text,
  p_expected text,
  p_contact_consent boolean,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_participant_id uuid;
  v_id uuid;
begin
  select id into v_participant_id
  from public.acequia_pilot_participants
  where code_hash = p_code_hash and status in ('invited', 'active')
  limit 1;

  if v_participant_id is null then
    raise exception using errcode = 'P0001', message = 'invalid_participant';
  end if;

  if p_stage not in ('registro', 'bienvenida', 'mapa', 'datos', 'diseno', 'cuenta', 'otro')
    or p_category not in ('error', 'comprension', 'datos', 'utilidad', 'idea')
    or p_severity not in ('bajo', 'medio', 'alto', 'critico')
    or p_rating not between 1 and 5
    or char_length(btrim(p_description)) not between 20 and 2500
    or char_length(coalesce(p_expected, '')) > 1500
    or char_length(coalesce(p_user_agent, '')) > 500 then
    raise exception using errcode = '22023', message = 'invalid_input';
  end if;

  if (select count(*) from public.acequia_pilot_feedback
      where participant_id = v_participant_id and created_at >= now() - interval '10 minutes') >= 5 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.acequia_pilot_feedback (
    participant_id, stage, category, severity, rating, blocked,
    description, expected, contact_consent, user_agent
  ) values (
    v_participant_id, p_stage, p_category, p_severity, p_rating, coalesce(p_blocked, false),
    btrim(p_description), nullif(btrim(p_expected), ''), coalesce(p_contact_consent, false), p_user_agent
  ) returning id into v_id;

  update public.acequia_pilot_participants
  set status = case when status = 'invited' then 'active' else status end,
      started_at = coalesce(started_at, now())
  where id = v_participant_id;

  return jsonb_build_object('id', v_id);
end;
$$;

create or replace function public.submit_acequia_product_event(
  p_event_name text,
  p_path text,
  p_anonymous_hash text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_event_name not in ('page_view', 'cta_click', 'pilot_application_started', 'pilot_application_submitted', 'pilot_application_failed', 'feedback_started', 'feedback_submitted', 'feedback_failed', 'registration_step')
    or char_length(p_path) not between 1 and 500
    or char_length(p_anonymous_hash) <> 64
    or jsonb_typeof(coalesce(p_metadata, '{}'::jsonb)) <> 'object'
    or octet_length(coalesce(p_metadata, '{}'::jsonb)::text) > 3000 then
    raise exception using errcode = '22023', message = 'invalid_input';
  end if;

  if (select count(*) from public.acequia_product_events
      where anonymous_hash = p_anonymous_hash and created_at >= now() - interval '1 minute') >= 40 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.acequia_product_events (event_name, path, anonymous_hash, metadata)
  values (p_event_name, p_path, p_anonymous_hash, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

revoke all on function public.submit_acequia_pilot_feedback(text, text, text, text, integer, boolean, text, text, boolean, text) from public;
revoke all on function public.submit_acequia_product_event(text, text, text, jsonb) from public;

grant execute on function public.submit_acequia_pilot_feedback(text, text, text, text, integer, boolean, text, text, boolean, text)
  to anon, authenticated, service_role;
grant execute on function public.submit_acequia_product_event(text, text, text, jsonb)
  to anon, authenticated, service_role;


-- ---------------------------------------------------------------------------
-- 4 de 4 — 0052_terreno_product_journey.sql (monorepo)
-- ---------------------------------------------------------------------------

create table if not exists terreno.eventos_recorrido (id bigint generated by default as identity primary key, user_id uuid not null references auth.users(id) on delete cascade, event_name text not null check (event_name in ('page_view','onboarding_started','map_opened','account_viewed','feedback_opened')), path text not null check (char_length(path) between 1 and 500), metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create index if not exists eventos_recorrido_user_created_idx on terreno.eventos_recorrido (user_id, created_at desc);
create index if not exists eventos_recorrido_event_created_idx on terreno.eventos_recorrido (event_name, created_at desc);
alter table terreno.eventos_recorrido enable row level security;
drop policy if exists "eventos_recorrido_insert_self" on terreno.eventos_recorrido;
create policy "eventos_recorrido_insert_self" on terreno.eventos_recorrido for insert to authenticated with check (user_id = auth.uid());
revoke all on terreno.eventos_recorrido from anon;
grant insert on terreno.eventos_recorrido to authenticated;
grant select on terreno.eventos_recorrido to service_role;
grant usage, select on sequence terreno.eventos_recorrido_id_seq to authenticated, service_role;
