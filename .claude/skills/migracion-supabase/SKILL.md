---
name: migracion-supabase
description: Cómo se cambia el esquema de la base de Arte y Tierra sin que el repo y producción queden diciendo cosas distintas. Se activa al escribir o aplicar una migración, al tocar permisos, RLS o funciones SECURITY DEFINER, al agregar una tabla o una columna, y cuando hay que averiguar qué hay realmente aplicado en producción.
---

# Migraciones

Una sola base (`ojlvflmqcyxdnvhbnhgp`) para los dos productos, con esquemas
separados: `app`, `shop`, `edu`, `cms`, `help`, `terreno`, `anteproyectos`.
`supabase/migrations/` es la fuente de verdad y los archivos van numerados
(`0058_nombre_descriptivo.sql`).

No hay `psql` ni Docker en esta máquina. Todo pasa por el conector MCP de
Supabase.

## La trampa que ya mordió tres veces

El conector (`apply_migration`) estampa la fila en
`supabase_migrations.schema_migrations` **con una versión de timestamp**
(`20260911013734`), no con el número del archivo. Resultado: la base no
reconoce `0054_lo_que_sea.sql` como aplicado, y un `supabase db push` lo
intentaría de nuevo.

Peor: se puede aplicar algo a mano y no escribir ningún archivo. Pasó con seis
migraciones de permisos; un entorno nuevo armado desde el repo no habría tenido
ninguno de los arreglos.

**La regla, entonces:** escribí el archivo numerado y aplicalo en el mismo
movimiento, y después verificá que la fila tenga el número correcto. Si aplicás
con `execute_sql`, insertá vos la fila:

```sql
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('0058','nombre_descriptivo') ON CONFLICT (version) DO NOTHING;
```

Antes de dar por cerrado cualquier trabajo de base, compará `list_migrations`
contra `ls supabase/migrations`. Si no coinciden, hay deriva.

## Permisos: mirá quién usa la función antes de revocar

`app.is_staff()` y `app.is_admin()` **tienen** que conservar `EXECUTE` para
`anon`. No se llaman por RPC: las evalúan las políticas RLS de `cms.pages`,
`cms.posts` y `cms.testimonials`, del tipo `status = 'published' OR
app.is_staff()`, que corren con el rol del visitante. Sin permiso la política no
devuelve falso: **revienta**, y el sitio público deja de mostrar contenido. Ya
tiró abajo el sitio una vez.

Antes de revocar sobre cualquier función, consultá si aparece en una vista, en
una política o en una llamada del cliente:

```sql
select 'vista', n.nspname||'.'||c.relname from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where c.relkind in ('v','m') and pg_get_viewdef(c.oid) like '%la_funcion%'
union all
select 'politica', schemaname||'.'||tablename||' / '||policyname from pg_policies
  where coalesce(qual,'')||coalesce(with_check,'') like '%la_funcion%';
```

El default de Postgres es `EXECUTE` para `PUBLIC`, así que toda función nueva
nace abierta. Cerrala en la misma migración que la crea.

Quedan abiertas a propósito tres wrappers `IMMUTABLE`
(`immutable_unaccent`, `immutable_array_to_string`): alimentan expresiones de
índice de la búsqueda, no leen datos, y cerrarlas puede romper los índices.

## `ELSE NULL` en un `CASE` de límites es una puerta abierta

Dos triggers de límite de proyectos tenían `ELSE NULL`, y `NULL` ahí significaba
*sin tope*. Un plan con un nombre no contemplado —exactamente lo que produce un
renombre hecho a medias— podía crear proyectos sin límite. El default de un
`CASE` que decide un permiso o un tope tiene que ser **el valor más
restrictivo**, nunca el más permisivo.

## Reglas de escritura

- Idempotente siempre: `CREATE OR REPLACE`, `DROP ... IF EXISTS`,
  `ON CONFLICT DO NOTHING`. Cualquier migración se puede correr dos veces.
- `to_regprocedure('esquema.fn(tipos)')` antes de tocar una función, para que la
  migración no falle si todavía no existe.
- El comentario de arriba explica **por qué**, no qué. El qué ya está en el SQL.
- Nunca `DROP COLUMN` ni `DELETE` sin confirmarlo con Jonatan: no hay staging y
  el rollback de datos no existe.
- Si la migración cambia un número que el código también conoce (topes, precios),
  tiene que haber un test que compare el SQL contra el TypeScript. Ya existe uno
  en `apps/terreno/tests/unit/planes/catalogo.test.ts`; copiá ese patrón.

## Después de aplicar

Verificá el efecto contra la base, no contra tu intención: consultá el
`pg_get_functiondef`, el `pg_get_constraintdef` o el `pg_get_triggerdef` que
acabás de crear y leé lo que quedó. Y fijate cuántas filas afectó: una migración
que renombra planes y toca 0 filas puede estar bien (no había ninguna) o estar
mal (el `WHERE` no matchea).
