-- ============================================================
-- PASO 8.2 — El respaldo que faltó, y la columna que le faltó a la 0051.
--
-- Qué pasó: la 0051 se aplicó el 08/09/2026, pero desde una copia vieja del
-- archivo. Quedó todo bien salvo una columna, `aviso_cobro_at`, que es donde el
-- cron anota que ya avisó del primer cobro. Sin ella, el aviso se enviaría todos
-- los días a la misma persona.
--
-- Tampoco se hizo el respaldo previo. No se perdió nada —los datos están
-- intactos, 2 activas y 5 canceladas— y la función que la 0051 reemplazó se
-- puede recuperar de git (commit 61d00a1). Igual conviene tener el respaldo
-- antes de seguir tocando.
--
-- ANTES DE EMPEZAR: mirá la URL del navegador. Tiene que decir
-- ojlvflmqcyxdnvhbnhgp. Si dice otra cosa, pará: es otra base.
--
-- Se puede correr todo junto. Es aditivo: no borra ni modifica ninguna fila.
-- ============================================================

-- A. Respaldo (por si acaso, de acá en adelante).
create schema if not exists respaldo_20260908;
create table if not exists respaldo_20260908.suscripciones as
  select * from terreno.suscripciones;

-- Tiene que dar 7.
select count(*) as filas_respaldadas from respaldo_20260908.suscripciones;

-- B. La columna que faltó.
alter table terreno.suscripciones
  add column if not exists aviso_cobro_at timestamptz;

comment on column terreno.suscripciones.aviso_cobro_at is
  'Cuándo se envió el aviso de 24 h antes del primer cobro. Null = todavía no se envió.';

-- C. Comprobación. Tienen que aparecer las 7 columnas.
select column_name
from information_schema.columns
where table_schema = 'terreno' and table_name = 'suscripciones'
  and column_name in ('trial_start','trial_end','first_charge_at',
                      'provider_event_id','provider_event_at','aviso_cobro_at')
order by column_name;

-- D. Las filas siguen intactas → 2 activa + 5 cancelada.
select estado, count(*) from terreno.suscripciones group by estado order by estado;
