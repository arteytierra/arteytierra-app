-- 0020_realtime.sql
-- Habilita Supabase Realtime sobre las tablas relevantes para live updates.
-- - app.notifications: bell en vivo
-- - edu.thread_replies: Q&A en vivo
-- - edu.threads: status / accepted_reply_id
-- Idempotente.

do $$
declare
  t record;
  tables text[][] := array[
    array['app','notifications'],
    array['edu','thread_replies'],
    array['edu','threads']
  ];
begin
  for t in select arr[1] as schema_name, arr[2] as table_name from unnest(tables) as arr loop
    -- Asegurar REPLICA IDENTITY FULL para que payload incluya old/new completos
    execute format('alter table %I.%I replica identity full', t.schema_name, t.table_name);
    -- Agregar a publication supabase_realtime si no está
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = t.schema_name
         and tablename = t.table_name
    ) then
      execute format('alter publication supabase_realtime add table %I.%I', t.schema_name, t.table_name);
    end if;
  end loop;
end $$;
