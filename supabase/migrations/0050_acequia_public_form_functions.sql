alter table public.acequia_account_requests
  add column if not exists ip_hash text,
  add column if not exists user_agent text;

create index if not exists acequia_account_requests_ip_hash_idx
  on public.acequia_account_requests (ip_hash, created_at desc);

comment on table public.acequia_pilot_applications is
  'Postulaciones al programa fundador de Acequia. La tabla permanece privada.';
comment on table public.acequia_account_requests is
  'Solicitudes de arrepentimiento o baja. La tabla permanece privada.';

create or replace function public.submit_acequia_pilot_application(
  p_name text,
  p_email text,
  p_profession text,
  p_country_region text,
  p_property_type text,
  p_motivation text,
  p_consent boolean,
  p_ip_hash text,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_created_at timestamptz;
  v_email text := lower(btrim(p_email));
begin
  if char_length(btrim(p_name)) not between 2 and 120
    or char_length(v_email) not between 3 and 254
    or position('@' in v_email) < 2
    or char_length(btrim(p_profession)) not between 2 and 120
    or char_length(btrim(p_country_region)) not between 2 and 160
    or char_length(btrim(p_property_type)) not between 2 and 120
    or char_length(btrim(p_motivation)) not between 20 and 2000
    or p_consent is distinct from true
    or char_length(coalesce(p_ip_hash, '')) not between 32 and 128
    or char_length(coalesce(p_user_agent, '')) > 500 then
    raise exception using errcode = '22023', message = 'invalid_input';
  end if;

  if (select count(*) from public.acequia_pilot_applications
      where ip_hash = p_ip_hash and created_at >= now() - interval '1 hour') >= 3 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  begin
    insert into public.acequia_pilot_applications (
      name, email, profession, country_region, property_type, motivation,
      consent, ip_hash, user_agent
    ) values (
      btrim(p_name), v_email, btrim(p_profession), btrim(p_country_region),
      btrim(p_property_type), btrim(p_motivation), true, p_ip_hash, p_user_agent
    )
    returning id, created_at into v_id, v_created_at;
  exception when unique_violation then
    return jsonb_build_object('duplicate', true);
  end;

  return jsonb_build_object('id', v_id, 'created_at', v_created_at, 'duplicate', false);
end;
$$;

create or replace function public.submit_acequia_account_request(
  p_email text,
  p_request_type text,
  p_details text,
  p_consent boolean,
  p_ip_hash text,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_email text := lower(btrim(p_email));
begin
  if char_length(v_email) not between 3 and 254
    or position('@' in v_email) < 2
    or p_request_type not in ('arrepentimiento', 'baja')
    or char_length(coalesce(p_details, '')) > 1500
    or p_consent is distinct from true
    or char_length(coalesce(p_ip_hash, '')) not between 32 and 128
    or char_length(coalesce(p_user_agent, '')) > 500 then
    raise exception using errcode = '22023', message = 'invalid_input';
  end if;

  if (select count(*) from public.acequia_account_requests
      where ip_hash = p_ip_hash and created_at >= now() - interval '1 hour') >= 5 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.acequia_account_requests (
    email, request_type, details, consent, ip_hash, user_agent
  ) values (
    v_email, p_request_type, nullif(btrim(p_details), ''), true, p_ip_hash, p_user_agent
  ) returning id into v_id;

  return jsonb_build_object('id', v_id);
end;
$$;

revoke all on function public.submit_acequia_pilot_application(text, text, text, text, text, text, boolean, text, text) from public;
revoke all on function public.submit_acequia_account_request(text, text, text, boolean, text, text) from public;

grant execute on function public.submit_acequia_pilot_application(text, text, text, text, text, text, boolean, text, text)
  to anon, authenticated, service_role;
grant execute on function public.submit_acequia_account_request(text, text, text, boolean, text, text)
  to anon, authenticated, service_role;
