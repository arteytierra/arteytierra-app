-- 0025_audit_log.sql
-- Log de acciones administrativas / críticas para compliance + forensics.

do $$ begin
  create type app.audit_severity as enum ('info', 'warning', 'critical');
exception when duplicate_object then null; end $$;

create table if not exists app.audit_log (
  id bigserial primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  action text not null,                  -- ej. order.refund, certificate.revoke, partner.payout
  target_kind text,                       -- order, certificate, partner, user
  target_id text,                         -- id del recurso afectado
  payload jsonb not null default '{}'::jsonb,
  severity app.audit_severity not null default 'info',
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on app.audit_log (created_at desc);
create index if not exists audit_log_actor_idx on app.audit_log (actor_user_id, created_at desc);
create index if not exists audit_log_action_idx on app.audit_log (action, created_at desc);
create index if not exists audit_log_target_idx on app.audit_log (target_kind, target_id) where target_id is not null;

-- RLS: solo staff/admin pueden leer (políticas en app layer porque profiles vive en public)
alter table app.audit_log enable row level security;
-- inserts via service_role
