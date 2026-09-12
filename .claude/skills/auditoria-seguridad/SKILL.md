---
name: auditoria-seguridad
description: El barrido de seguridad de Arte y Tierra — permisos EXECUTE de funciones, search_path, políticas RLS, claves y variables de entorno, los caminos donde hay plata (webhooks, reembolsos, idempotencia), rate limiting y datos que viven en un solo lado. Se activa al hacer una revisión de seguridad, al leer los advisors de Supabase, antes de abrir algo al público, y cuando hay que decidir si una función o una ruta puede quedar accesible.
---

# El barrido de seguridad

Este barrido ya se hizo tres veces y cada vez se volvió a derivar la lista desde
cero. Esto es la lista, con las trampas que costaron caro.

**La regla que ordena todo: verificá quién usa algo antes de cerrarlo.** Cerrar
a ciegas ya tiró abajo el sitio público una vez. Un permiso de más es un riesgo;
un permiso de menos, en este sistema, es una caída.

## 1. Permisos EXECUTE de funciones

El default de Postgres es `EXECUTE` para `PUBLIC`: **toda función nueva nace
abierta**. Y el `GRANT` que importa suele venir de `PUBLIC`, no de `anon`, así
que revocarle a `anon` sin revocarle a `public` no hace nada.

```sql
revoke execute on function esquema.fn(tipos) from anon, authenticated, public;
```

**La trampa que rompió el sitio:** `app.is_staff()` y `app.is_admin()` **tienen**
que conservar `EXECUTE` para `anon`. No se llaman por RPC: las evalúan las
políticas RLS de `cms.pages`, `cms.posts` y `cms.testimonials`, del tipo
`status = 'published' OR app.is_staff()`, que corren con el rol del visitante.
Sin permiso la política no devuelve falso: **revienta**, y el sitio público deja
de mostrar contenido.

Antes de revocar sobre cualquier función, buscá si aparece en una vista, en una
política o en una llamada del cliente:

```sql
select 'vista', n.nspname||'.'||c.relname from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where c.relkind in ('v','m') and pg_get_viewdef(c.oid) like '%la_funcion%'
union all
select 'politica', schemaname||'.'||tablename||' / '||policyname from pg_policies
  where coalesce(qual,'')||coalesce(with_check,'') like '%la_funcion%';
```

Y en el repo: `git grep "nombre_funcion"` para las llamadas `.rpc()`.

**Lo que queda abierto a propósito** —y no hay que "arreglar"— son tres wrappers
`IMMUTABLE`: `immutable_unaccent` (×2) e `immutable_array_to_string`. Alimentan
expresiones de índice de la búsqueda, no leen datos, y cerrarlas puede romper
los índices. Si aparecen en un informe de advisors, se ignoran.

## 2. `search_path` en `SECURITY DEFINER`

Una función `SECURITY DEFINER` sin `search_path` fijo corre con el del que la
llama, que puede anteponer un esquema propio y secuestrar a qué tabla apunta un
nombre sin calificar. Toda función `SECURITY DEFINER` lleva:

```sql
set search_path = public, pg_temp
```

con los esquemas que realmente use. Es el hallazgo más repetido de los advisors.

## 3. Políticas RLS

- Tabla nueva expuesta por PostgREST **sin** `ENABLE ROW LEVEL SECURITY` = está
  abierta. Es la falla más grave y la más fácil de cometer.
- Una política que **erra** en vez de devolver falso deja la tabla inusable. Ver
  el caso `is_staff` de arriba.
- `USING` controla lo que se lee; `WITH CHECK`, lo que se escribe. Una política
  de `UPDATE` sin `WITH CHECK` deja mover una fila a otro dueño.
- Probá la política **con el rol que la va a evaluar**, no como service-role. El
  conector de Supabase permite bajar el nivel de acceso; usalo.

## 4. Claves y variables de entorno

- **La service-role key nunca sale del servidor.** Vive en
  `apps/terreno/.env.local` y en las variables de Vercel. Nunca en un archivo
  del repo, ni en `_research/`, ni en un mensaje de commit, ni en una captura.
- Una variable que empiece con `NEXT_PUBLIC_` **va al navegador**. Si una clave
  quedó ahí, está publicada: rotarla es la única respuesta, ocultarla no sirve.
- Chequeá el `.gitignore` de verdad, no de memoria:
  `git check-ignore -v archivo` y `git log --all -- archivo` para confirmar que
  nunca entró al historial. Un archivo ignorado hoy pudo estar commiteado ayer.
- Bug recurrente propio: **un BOM en una variable de entorno de Vercel**
  (`NEXT_PUBLIC_SITE_URL`) rompe las rutas `/api` con un 500 vacío. Sanear con
  `limpiarEnv`.

## 5. Donde hay plata

Es lo que menos se revisa y lo que más duele.

- **Firma del webhook verificada**, siempre, antes de tocar nada. Un webhook de
  pago sin verificar es una orden marcada como pagada por cualquiera.
- **Idempotencia**: los proveedores reintentan. Procesar dos veces el mismo
  evento no puede duplicar una suscripción ni una inscripción.
- **Que la acción haga lo que dice.** Ya apareció un botón de reembolso que
  marcaba la orden como devuelta **sin devolver la plata**. Seguí el camino
  hasta el proveedor, no hasta el cambio de estado local.
- **Tope en el checkout**: cantidad y monto máximo. Sin tope, un formulario
  público es una invitación.
- El identificador de plan que viaja en la URL de checkout se **valida contra el
  catálogo**, no se confía. Ver la skill `fuente-unica-de-verdad`.

## 6. Superficie pública

- Toda ruta `/api` que no pida sesión necesita **rate limiting** y un tamaño
  máximo de cuerpo.
- Los formularios públicos entran por RPC con `SECURITY DEFINER` acotada, no por
  escritura directa a la tabla.
- Un proxy a un servicio externo con tu clave del lado del servidor es un
  **open proxy** si no tiene límite: alguien puede gastarte la cuota.
- Las rutas detrás de login (`/mapa`, `/informe/*`) no se verifican desde el
  navegador del agente. Las valida Jonatan.

## 7. Datos que viven en un solo lado

No es seguridad clásica, pero se pierde igual. Ya pasó: **los leads del sitio
vivían sólo en el mail**. Si el mail se pierde o cae, el dato no existe. Todo lo
que entra por un formulario se guarda en la base **y además** se notifica.

## Los advisors de Supabase

`get_advisors` con `type: 'security'` es el punto de partida, no la conclusión.
Vale leerlo entero cada vez, pero:

- Marca las tres `IMMUTABLE` de arriba. Es ruido conocido.
- No sabe qué funciones evalúa una política RLS, así que recomienda cerrar cosas
  que no hay que cerrar.
- No mira nada de la sección 5 ni de la 6: la plata y la superficie pública son
  trabajo a mano.

## Cómo se cierra

Todo hallazgo que se arregla en la base se escribe **además** como migración
numerada en `supabase/migrations/`, en el mismo movimiento. Un arreglo aplicado
a mano y no escrito no existe para un entorno nuevo, y ya pasó con seis
migraciones seguidas. Ver la skill `migracion-supabase`.

Y verificá el efecto contra la base, no contra tu intención: leé el
`pg_get_functiondef` o el ACL que quedó, y fijate cuántas filas afectó.
