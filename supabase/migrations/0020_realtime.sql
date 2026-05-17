-- 0020_realtime.sql
-- Habilita Supabase Realtime sobre las tablas relevantes para live updates.
-- - app.notifications: bell en vivo
-- - edu.thread_replies: Q&A en vivo
-- - edu.threads: status / accepted_reply_id
-- Idempotente.

do $$
declare
  t record;
begin
  for t in
    select schema_name, table_name
    from (values
      ('app','notifications'),
      ('edu','thread_replies'),
      ('edu','threads')
    ) as v(schema_name, table_name)
  loop
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
