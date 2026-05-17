-- 0003: tabla unificada de mensajes (CRM multi-canal: WhatsApp, Instagram, email)
-- Se crea en `public` para consumirse desde supabase-js sin configurar search_path.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references app.contacts(id) on delete set null,
  channel text not null check (channel in ('whatsapp','instagram','email','sms','web')),
  direction text not null check (direction in ('inbound','outbound')),
  provider_message_id text,
  from_address text,
  to_address text,
  body text,
  status text,
  raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_contact_idx on public.messages (contact_id, created_at desc);
create index if not exists messages_channel_idx on public.messages (channel, created_at desc);
create unique index if not exists messages_provider_uniq
  on public.messages (channel, provider_message_id)
  where provider_message_id is not null;

-- Trigger: linkear contact_id por phone/email si no vino seteado
create or replace function public.link_message_contact()
returns trigger language plpgsql as $$
begin
  if new.contact_id is null then
    select id into new.contact_id
    from app.contacts
    where (new.channel = 'whatsapp' and phone = new.from_address)
       or (new.channel = 'email' and email = new.from_address)
    limit 1;
  end if;
  return new;
end$$;

drop trigger if exists tr_link_message_contact on public.messages;
create trigger tr_link_message_contact
  before insert on public.messages
  for each row execute function public.link_message_contact();

-- RLS: solo staff ve mensajes
alter table public.messages enable row level security;
drop policy if exists messages_staff on public.messages;
create policy messages_staff on public.messages
  for all using (app.is_staff()) with check (app.is_staff());
