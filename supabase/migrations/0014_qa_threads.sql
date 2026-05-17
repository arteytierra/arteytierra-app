-- =============================================================
--  Q&A / Foros por curso
--  Extiende edu.threads + edu.thread_replies con estado, mejor moderación
--  y aceptación de respuestas. Sumo tabla de reportes.
-- =============================================================

-- Estado de un thread (pregunta principal)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'thread_status') then
    create type edu.thread_status as enum ('open', 'answered', 'resolved', 'closed');
  end if;
end $$;

alter table edu.threads
  add column if not exists status edu.thread_status not null default 'open',
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_resolved boolean not null default false,
  add column if not exists accepted_reply_id uuid,
  add column if not exists reports_count int not null default 0,
  add column if not exists last_activity_at timestamptz default now(),
  add column if not exists reply_count int not null default 0,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists hidden boolean not null default false;

create index if not exists idx_threads_course_activity
  on edu.threads (course_id, last_activity_at desc) where hidden = false;

create index if not exists idx_threads_user
  on edu.threads (user_id);

create index if not exists idx_threads_status
  on edu.threads (course_id, status) where hidden = false;

-- tsvector para búsqueda
alter table edu.threads
  add column if not exists tsv tsvector
  generated always as (
    setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('spanish', public.immutable_unaccent(coalesce(body, ''))), 'B')
  ) stored;

create index if not exists idx_threads_tsv on edu.threads using gin(tsv);

alter table edu.thread_replies
  add column if not exists is_accepted boolean not null default false,
  add column if not exists reports_count int not null default 0,
  add column if not exists hidden boolean not null default false,
  add column if not exists edited_at timestamptz;

create index if not exists idx_replies_thread on edu.thread_replies (thread_id, created_at);
create index if not exists idx_replies_user on edu.thread_replies (user_id);

-- Reportes (soft-moderation)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'report_target') then
    create type edu.report_target as enum ('thread', 'reply');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type edu.report_status as enum ('open', 'dismissed', 'actioned');
  end if;
end $$;

create table if not exists edu.thread_reports (
  id           uuid primary key default gen_random_uuid(),
  target       edu.report_target not null,
  thread_id    uuid references edu.threads(id) on delete cascade,
  reply_id     uuid references edu.thread_replies(id) on delete cascade,
  reporter_id  uuid references app.profiles(id) on delete set null,
  reason       text not null check (char_length(reason) between 3 and 500),
  status       edu.report_status not null default 'open',
  resolved_by  uuid references app.profiles(id) on delete set null,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique(reporter_id, thread_id, reply_id)
);

create index if not exists idx_reports_open on edu.thread_reports (status) where status = 'open';

-- Trigger: actualizar reply_count y last_activity_at en thread cuando hay reply
create or replace function edu.bump_thread_activity()
returns trigger language plpgsql security definer set search_path = edu, public as $$
begin
  if tg_op = 'INSERT' then
    update edu.threads
      set reply_count = reply_count + 1,
          last_activity_at = now(),
          status = case when status = 'open' then 'answered' else status end
      where id = new.thread_id;
  elsif tg_op = 'DELETE' then
    update edu.threads
      set reply_count = greatest(0, reply_count - 1)
      where id = old.thread_id;
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists trg_bump_thread_activity on edu.thread_replies;
create trigger trg_bump_thread_activity
  after insert or delete on edu.thread_replies
  for each row execute function edu.bump_thread_activity();

-- Trigger: cuando se acepta una respuesta, marcar thread resolved y resetear otras
create or replace function edu.handle_accept_reply()
returns trigger language plpgsql security definer set search_path = edu, public as $$
begin
  if new.is_accepted and (old.is_accepted is distinct from new.is_accepted) then
    -- desmarcar otras
    update edu.thread_replies
      set is_accepted = false
      where thread_id = new.thread_id and id <> new.id and is_accepted = true;
    update edu.threads
      set accepted_reply_id = new.id,
          is_resolved = true,
          status = 'resolved'
      where id = new.thread_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_handle_accept_reply on edu.thread_replies;
create trigger trg_handle_accept_reply
  after update of is_accepted on edu.thread_replies
  for each row execute function edu.handle_accept_reply();

-- Trigger: bump reports_count
create or replace function edu.bump_reports_count()
returns trigger language plpgsql security definer set search_path = edu, public as $$
begin
  if new.target = 'thread' and new.thread_id is not null then
    update edu.threads set reports_count = reports_count + 1 where id = new.thread_id;
    -- auto-hide a partir de 3 reportes
    update edu.threads set hidden = true where id = new.thread_id and reports_count >= 3;
  elsif new.target = 'reply' and new.reply_id is not null then
    update edu.thread_replies set reports_count = reports_count + 1 where id = new.reply_id;
    update edu.thread_replies set hidden = true where id = new.reply_id and reports_count >= 3;
  end if;
  return new;
end $$;

drop trigger if exists trg_bump_reports_count on edu.thread_reports;
create trigger trg_bump_reports_count
  after insert on edu.thread_reports
  for each row execute function edu.bump_reports_count();

-- Reputation: sumar puntos cuando se acepta una respuesta
create table if not exists app.user_reputation (
  user_id     uuid primary key references app.profiles(id) on delete cascade,
  points      int not null default 0,
  accepted    int not null default 0,
  updated_at  timestamptz not null default now()
);

create or replace function edu.grant_reputation_on_accept()
returns trigger language plpgsql security definer set search_path = edu, app, public as $$
begin
  if new.is_accepted and (old.is_accepted is distinct from new.is_accepted) and new.user_id is not null then
    insert into app.user_reputation (user_id, points, accepted)
    values (new.user_id, 10, 1)
    on conflict (user_id) do update
      set points = app.user_reputation.points + 10,
          accepted = app.user_reputation.accepted + 1,
          updated_at = now();
  end if;
  return new;
end $$;

drop trigger if exists trg_grant_reputation on edu.thread_replies;
create trigger trg_grant_reputation
  after update of is_accepted on edu.thread_replies
  for each row execute function edu.grant_reputation_on_accept();

alter table edu.thread_reports enable row level security;
alter table app.user_reputation enable row level security;

-- Cualquiera autenticado puede reportar; nadie puede leer ajenos salvo staff (via admin client)
create policy "reports self insert" on edu.thread_reports
  for insert with check (auth.uid() = reporter_id);

create policy "reputation self read" on app.user_reputation
  for select using (auth.uid() = user_id);
