-- 0010: log de ejecuciones de cron jobs + lock cooperativo.
-- Los jobs corren via `GET /api/cron/[job]` disparado por Cloudflare Cron Triggers
-- o n8n. Cada ejecución se registra; un lock previene runs concurrentes.

create table app.job_runs (
  id           uuid primary key default gen_random_uuid(),
  job          text not null,
  status       text not null check (status in ('running', 'ok', 'error')),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  duration_ms  int,
  result       jsonb,
  error        text
);
create index on app.job_runs(job, started_at desc);

-- Lock cooperativo: una sola corrida activa por job_name a la vez.
create table app.job_locks (
  job          text primary key,
  locked_at    timestamptz not null default now(),
  locked_by    text
);

-- Helper: adquirir lock. Devuelve true si lo tomó, false si ya estaba ocupado
-- o tiene más de 1 hora (caso colgado: lo libera y reintenta).
create or replace function app.try_acquire_job_lock(p_job text, p_by text)
returns boolean language plpgsql security definer set search_path = app as $$
declare
  current_lock_age interval;
begin
  select now() - locked_at into current_lock_age from app.job_locks where job = p_job;
  if found and current_lock_age < interval '1 hour' then
    return false;
  end if;
  if found then
    delete from app.job_locks where job = p_job;
  end if;
  insert into app.job_locks(job, locked_by) values (p_job, p_by);
  return true;
exception when unique_violation then
  return false;
end;
$$;

create or replace function app.release_job_lock(p_job text)
returns void language plpgsql security definer set search_path = app as $$
begin
  delete from app.job_locks where job = p_job;
end;
$$;

alter table app.job_runs  enable row level security;
alter table app.job_locks enable row level security;

create policy "job_runs staff read" on app.job_runs
  for select using (
    exists (select 1 from app.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
  );
create policy "job_locks staff read" on app.job_locks
  for select using (
    exists (select 1 from app.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
  );

grant select on app.job_runs, app.job_locks to authenticated;

-- Columnas auxiliares para idempotencia de jobs
alter table book.reservations
  add column if not exists reminder_sent_at timestamptz;
