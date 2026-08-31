create extension if not exists pgcrypto;

create table if not exists public.acequia_pilot_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null,
  profession text not null check (char_length(profession) between 2 and 120),
  country_region text not null check (char_length(country_region) between 2 and 160),
  property_type text not null check (char_length(property_type) between 2 and 120),
  motivation text not null check (char_length(motivation) between 20 and 2000),
  status text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'waitlist', 'declined')),
  consent boolean not null check (consent = true),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create unique index if not exists acequia_pilot_applications_email_unique
  on public.acequia_pilot_applications (lower(email));
create index if not exists acequia_pilot_applications_created_at_idx
  on public.acequia_pilot_applications (created_at desc);
create index if not exists acequia_pilot_applications_ip_hash_idx
  on public.acequia_pilot_applications (ip_hash, created_at desc);

alter table public.acequia_pilot_applications enable row level security;

create table if not exists public.acequia_account_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  request_type text not null check (request_type in ('arrepentimiento', 'baja')),
  details text check (details is null or char_length(details) <= 1500),
  status text not null default 'new' check (status in ('new', 'processing', 'resolved', 'rejected')),
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);

create index if not exists acequia_account_requests_created_at_idx
  on public.acequia_account_requests (created_at desc);

alter table public.acequia_account_requests enable row level security;

comment on table public.acequia_pilot_applications is
  'Postulaciones al programa fundador de Acequia. Sólo se accede desde servidor con service role.';
comment on table public.acequia_account_requests is
  'Solicitudes de arrepentimiento o baja. Sólo se accede desde servidor con service role.';
