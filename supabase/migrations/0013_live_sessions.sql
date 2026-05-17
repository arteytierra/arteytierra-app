-- 0013: clases en vivo / aulas virtuales (Jitsi por defecto, compatible con LiveKit).

create type edu.live_status as enum ('scheduled', 'live', 'ended', 'cancelled');

create table edu.live_sessions (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid references edu.courses(id) on delete cascade,
  lesson_id       uuid references edu.lessons(id) on delete set null,
  title           text not null,
  description     text,
  scheduled_at    timestamptz not null,
  duration_min    int not null default 60 check (duration_min between 5 and 600),
  room            text not null unique,                   -- nombre único de sala Jitsi
  host_user_id    uuid references auth.users(id) on delete set null,
  status          edu.live_status not null default 'scheduled',
  recording_enabled boolean not null default false,
  recording_url   text,
  reminders_sent  jsonb not null default '{}'::jsonb,     -- {24h: true, 1h: true}
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on edu.live_sessions(course_id, scheduled_at);
create index on edu.live_sessions(status, scheduled_at);
create trigger trg_live_sessions_updated
  before update on edu.live_sessions
  for each row execute function app.set_updated_at();

-- Registro de asistencia
create table edu.live_attendance (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references edu.live_sessions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  joined_at       timestamptz not null default now(),
  left_at         timestamptz,
  unique(session_id, user_id)
);
create index on edu.live_attendance(session_id);

alter table edu.live_sessions   enable row level security;
alter table edu.live_attendance enable row level security;

-- Lectura pública de sesiones (los enrollment-checks viven en server actions).
create policy "live_sessions public read" on edu.live_sessions
  for select using (true);
create policy "live_sessions staff write" on edu.live_sessions
  for all using (
    exists (select 1 from app.profiles p where p.user_id = auth.uid() and p.role in ('staff','admin','instructor'))
  );

create policy "live_attendance owner read" on edu.live_attendance
  for select using (auth.uid() = user_id);
create policy "live_attendance owner write" on edu.live_attendance
  for insert with check (auth.uid() = user_id);
create policy "live_attendance staff all" on edu.live_attendance
  for all using (
    exists (select 1 from app.profiles p where p.user_id = auth.uid() and p.role in ('staff','admin','instructor'))
  );

grant select on edu.live_sessions, edu.live_attendance to anon, authenticated;
grant insert, update, delete on edu.live_sessions, edu.live_attendance to authenticated;
