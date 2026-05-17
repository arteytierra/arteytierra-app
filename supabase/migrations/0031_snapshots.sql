-- 0031: snapshots — registro de exportaciones programadas / on-demand.
-- El job real escribe NDJSON por tabla en Supabase Storage (bucket: backups).
-- Esta tabla solo trackea metadata para que el admin pueda listarlas + descargarlas.

create table if not exists app.db_snapshots (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null default 'full' check (kind in ('full', 'incremental', 'manual')),
  status       text not null default 'running'
                 check (status in ('running', 'completed', 'failed')),
  tables       text[] not null default '{}',
  row_counts   jsonb not null default '{}'::jsonb,
  total_bytes  bigint not null default 0,
  storage_path text,
  error        text,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  created_by   uuid references app.profiles(id) on delete set null
);
create index if not exists db_snapshots_started_idx
  on app.db_snapshots(started_at desc);
create index if not exists db_snapshots_status_idx
  on app.db_snapshots(status);

alter table app.db_snapshots enable row level security;

drop policy if exists "db_snapshots staff" on app.db_snapshots;
create policy "db_snapshots staff" on app.db_snapshots
  for all using (app.is_staff()) with check (app.is_staff());

-- Vista resumida — N últimos snapshots con duración derivada.
create or replace view app.db_snapshots_summary as
  select
    s.*,
    extract(epoch from (coalesce(s.finished_at, now()) - s.started_at))::int as duration_s,
    (s.row_counts -> 'profiles')::int as profiles_count,
    (s.row_counts -> 'orders')::int as orders_count
  from app.db_snapshots s;
