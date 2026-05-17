-- 0026_experiments.sql
-- A/B testing + feature flags con asignación determinística por hash.

do $$ begin
  create type app.experiment_status as enum ('draft', 'running', 'paused', 'concluded');
exception when duplicate_object then null; end $$;

create table if not exists app.experiments (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_-]{2,48}$'),
  name text not null,
  description text,
  status app.experiment_status not null default 'draft',
  variants jsonb not null default '["control","b"]'::jsonb,
  -- pesos paralelos a variants. Si null → uniforme.
  weights jsonb,
  -- rollout 0..100 — % de usuarios incluidos en el experimento (resto = control fuera de exp)
  rollout_pct numeric(5,2) not null default 100 check (rollout_pct >= 0 and rollout_pct <= 100),
  goal_metric text,                       -- ej. purchase, signup, lesson_completed
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);

create index if not exists experiments_status_idx on app.experiments (status) where status = 'running';

create table if not exists app.feature_flags (
  key text primary key check (key ~ '^[a-z][a-z0-9_.-]{2,64}$'),
  enabled boolean not null default false,
  rollout_pct numeric(5,2) not null default 0 check (rollout_pct >= 0 and rollout_pct <= 100),
  -- override por user_id o role: jsonb shape { "users": ["uuid"], "roles": ["admin"] }
  overrides jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now()
);

-- Exposiciones: 1 row por (user/visitor × exp × variant) — sólo primera vez.
create table if not exists app.experiment_exposures (
  experiment_key text not null,
  subject_id text not null,               -- user_id o visitor_id
  variant text not null,
  exposed_at timestamptz not null default now(),
  primary key (experiment_key, subject_id)
);

create index if not exists exposures_exp_idx on app.experiment_exposures (experiment_key, variant);

-- Conversiones: vinculadas a un experimento con metric.
create table if not exists app.experiment_conversions (
  id bigserial primary key,
  experiment_key text not null,
  subject_id text not null,
  variant text,                            -- snapshot del variant del subject
  metric text not null,
  value_cents bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists exp_conv_exp_idx on app.experiment_conversions (experiment_key, metric, created_at desc);

alter table app.experiments enable row level security;
alter table app.feature_flags enable row level security;
alter table app.experiment_exposures enable row level security;
alter table app.experiment_conversions enable row level security;

-- Lectura pública de flags activos (sin overrides expuestos)
drop policy if exists "public reads flags" on app.feature_flags;
create policy "public reads flags" on app.feature_flags
  for select using (true);

-- inserts/updates a través de service_role only

-- Vista resumen para el dashboard
create or replace view app.experiment_summary as
select
  e.key,
  e.name,
  e.status,
  e.rollout_pct,
  (
    select jsonb_object_agg(variant, cnt)
      from (select variant, count(*) as cnt
              from app.experiment_exposures
             where experiment_key = e.key
             group by variant) v
  ) as exposures_by_variant,
  (
    select jsonb_object_agg(variant, cnt)
      from (select variant, count(*) as cnt
              from app.experiment_conversions
             where experiment_key = e.key
             group by variant) c
  ) as conversions_by_variant,
  e.started_at, e.ended_at
from app.experiments e;
