-- 0008: newsletter con double opt-in + segmentación + unsubscribe.
-- Pieza separada de app.contacts: un contacto puede existir sin suscripción.

create table app.newsletter_subscribers (
  id               uuid primary key default gen_random_uuid(),
  email            citext not null unique,
  full_name        text,
  segments         text[] not null default '{}',  -- ej: ['cursos','hospedaje','newsletter']
  source           text,                          -- popup, footer, checkout, course-page…
  confirm_token    text unique,
  confirmed_at     timestamptz,
  unsubscribed_at  timestamptz,
  contact_id       uuid references app.contacts(id) on delete set null,
  ip               inet,
  user_agent       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index on app.newsletter_subscribers (confirm_token) where confirmed_at is null;
create index on app.newsletter_subscribers using gin (segments);

create trigger trg_newsletter_updated
  before update on app.newsletter_subscribers
  for each row execute function app.set_updated_at();

alter table app.newsletter_subscribers enable row level security;

-- Sólo staff puede leer/editar; las inserciones via service_role en server actions.
create policy "newsletter staff all" on app.newsletter_subscribers
  for all using (
    exists (select 1 from app.profiles p
            where p.id = auth.uid() and p.role in ('staff','admin'))
  );

grant select, insert, update, delete on app.newsletter_subscribers to authenticated;
