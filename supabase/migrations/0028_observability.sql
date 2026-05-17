-- 0028_observability.sql
-- Métricas de observabilidad: web vitals + server-side timings + errores capturados.

create table if not exists app.web_vitals (
  id bigserial primary key,
  metric text not null,                  -- LCP | INP | CLS | FCP | TTFB | FID
  value double precision not null,
  rating text,                            -- good | needs-improvement | poor
  navigation_type text,
  path text,
  visitor_id text,
  user_id uuid references auth.users(id) on delete set null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists web_vitals_metric_created_idx on app.web_vitals (metric, created_at desc);
create index if not exists web_vitals_path_idx on app.web_vitals (path, created_at desc);

create table if not exists app.server_errors (
  id bigserial primary key,
  source text not null,                  -- route | action | job | webhook
  route text,
  job_name text,
  message text not null,
  stack text,
  user_id uuid references auth.users(id) on delete set null,
  request_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists server_errors_created_idx on app.server_errors (created_at desc);
create index if not exists server_errors_source_idx on app.server_errors (source, route, created_at desc);

-- Vista P75 por metric para el dashboard
create or replace view app.web_vitals_p75 as
select
  metric,
  date_trunc('day', created_at) as day,
  count(*) as samples,
  percentile_cont(0.50) within group (order by value) as p50,
  percentile_cont(0.75) within group (order by value) as p75,
  percentile_cont(0.95) within group (order by value) as p95
from app.web_vitals
where created_at >= now() - interval '30 days'
group by metric, day
order by day desc, metric;

alter table app.web_vitals enable row level security;
alter table app.server_errors enable row level security;
-- inserts via service_role; reads via admin only
