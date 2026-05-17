-- =============================================================
--  Certificados: extender con firma, locale y revocación
-- =============================================================

alter table edu.certificates
  add column if not exists locale text not null default 'es' check (locale in ('es', 'en', 'pt')),
  add column if not exists signature_hash text,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references app.profiles(id) on delete set null,
  add column if not exists revoked_reason text,
  add column if not exists download_count int not null default 0,
  add column if not exists last_downloaded_at timestamptz;

create index if not exists idx_certificates_code on edu.certificates (code);
create index if not exists idx_certificates_revoked on edu.certificates (revoked_at) where revoked_at is not null;

-- Lookup público sólo para no-revocados (RLS)
alter table edu.certificates enable row level security;

drop policy if exists "certificates public verify" on edu.certificates;
create policy "certificates public verify" on edu.certificates
  for select using (revoked_at is null);

-- RPC: bump download counter
create or replace function edu.bump_certificate_download(p_code text)
returns void language plpgsql security definer set search_path = edu, public as $$
begin
  update edu.certificates
    set download_count = download_count + 1,
        last_downloaded_at = now()
    where code = upper(p_code) and revoked_at is null;
end $$;
