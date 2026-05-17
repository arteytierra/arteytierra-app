-- 0019_notifications.sql
-- Notificaciones in-app + bell + integración con push web.
-- Cada notificación es un row con kind (tipo), data jsonb, read_at.

do $$ begin
  create type app.notification_kind as enum (
    'qa_reply',          -- alguien respondió a tu hilo
    'qa_accepted',       -- aceptaron tu respuesta
    'qa_mention',        -- te mencionaron
    'order_paid',        -- tu pedido fue pagado
    'enrollment_created',-- te inscribimos a un curso
    'lesson_published',  -- nueva lección en curso al que estás suscripto
    'reservation_confirmed',
    'reservation_reminder',
    'certificate_issued',
    'scholarship_decision',
    'partner_decision',
    'commission_confirmed',
    'broadcast'          -- aviso del staff
  );
exception when duplicate_object then null; end $$;

create table if not exists app.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind app.notification_kind not null,
  title text not null,
  body text,
  url text,                            -- deep-link al recurso
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on app.notifications (user_id, created_at desc)
  where read_at is null;

create index if not exists notifications_user_idx
  on app.notifications (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- RPCs convenientes
-- ─────────────────────────────────────────────────────────────
create or replace function app.mark_notification_read(p_id uuid)
returns void
language plpgsql
security definer
set search_path = app, public
as $$
begin
  update app.notifications
     set read_at = coalesce(read_at, now())
   where id = p_id
     and user_id = auth.uid();
end $$;

create or replace function app.mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = app, public
as $$
begin
  update app.notifications
     set read_at = now()
   where user_id = auth.uid()
     and read_at is null;
end $$;

create or replace function app.unread_notifications_count()
returns int
language sql
security definer
set search_path = app, public
as $$
  select count(*)::int from app.notifications
   where user_id = auth.uid() and read_at is null;
$$;

grant execute on function app.mark_notification_read(uuid) to authenticated;
grant execute on function app.mark_all_notifications_read() to authenticated;
grant execute on function app.unread_notifications_count() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table app.notifications enable row level security;

drop policy if exists "users read own notifs" on app.notifications;
create policy "users read own notifs" on app.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "users update own notifs" on app.notifications;
create policy "users update own notifs" on app.notifications
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- inserts: solo service_role (createNotification helper)

-- ─────────────────────────────────────────────────────────────
-- Triggers para notificaciones automáticas
-- ─────────────────────────────────────────────────────────────

-- Cuando alguien responde un hilo de Q&A → notificar al autor del hilo
-- (no si responde su propio hilo).
create or replace function app.notify_thread_reply()
returns trigger
language plpgsql
security definer
set search_path = app, edu, public
as $$
declare
  v_thread_author uuid;
  v_thread_title text;
  v_course_slug text;
begin
  select t.author_user_id, t.title, p.slug
    into v_thread_author, v_thread_title, v_course_slug
    from edu.threads t
    join edu.courses c on c.id = t.course_id
    join shop.products p on p.id = c.product_id
   where t.id = new.thread_id;

  if v_thread_author is null or v_thread_author = new.author_user_id then
    return new;
  end if;

  insert into app.notifications (user_id, kind, title, body, url, data)
  values (
    v_thread_author,
    'qa_reply',
    'Nueva respuesta en tu pregunta',
    left(coalesce(v_thread_title, ''), 140),
    format('/cursos/%s/q-a/%s', v_course_slug, new.thread_id),
    jsonb_build_object('thread_id', new.thread_id, 'reply_id', new.id)
  );
  return new;
end $$;

drop trigger if exists trg_notify_thread_reply on edu.thread_replies;
create trigger trg_notify_thread_reply
  after insert on edu.thread_replies
  for each row execute function app.notify_thread_reply();

-- Cuando aceptan una respuesta → notificar al autor de la respuesta.
create or replace function app.notify_reply_accepted()
returns trigger
language plpgsql
security definer
set search_path = app, edu, public
as $$
declare
  v_reply_author uuid;
  v_thread_title text;
  v_course_slug text;
begin
  if new.is_accepted is distinct from true or coalesce(old.is_accepted, false) = true then
    return new;
  end if;
  select r.author_user_id, t.title, p.slug
    into v_reply_author, v_thread_title, v_course_slug
    from edu.thread_replies r
    join edu.threads t on t.id = r.thread_id
    join edu.courses c on c.id = t.course_id
    join shop.products p on p.id = c.product_id
   where r.id = new.id;

  if v_reply_author is null then return new; end if;

  insert into app.notifications (user_id, kind, title, body, url, data)
  values (
    v_reply_author,
    'qa_accepted',
    '¡Aceptaron tu respuesta!',
    left(coalesce(v_thread_title, ''), 140),
    format('/cursos/%s/q-a/%s', v_course_slug, new.thread_id),
    jsonb_build_object('thread_id', new.thread_id, 'reply_id', new.id, 'reputation_delta', 10)
  );
  return new;
end $$;

drop trigger if exists trg_notify_reply_accepted on edu.thread_replies;
create trigger trg_notify_reply_accepted
  after update of is_accepted on edu.thread_replies
  for each row execute function app.notify_reply_accepted();
