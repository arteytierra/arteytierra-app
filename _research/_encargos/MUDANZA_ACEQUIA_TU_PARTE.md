# Mudanza a acequia.app — paso a paso de lo que tenés que hacer vos

Escrito el 04/09/2026, actualizado el mismo día después de la primera sesión de
consola. Es la lista de todo lo que queda y que **no puedo hacer yo**, porque
toca consolas externas, credenciales, dinero o dominios. Lo que sí puedo hacer
está marcado como **(lo hago yo)**.

Regla que vale para todo el documento: **ninguna clave se pega en un chat, en un
archivo del repositorio ni en una captura.** Los valores se cargan directo en la
consola donde van.

---

## Enlaces directos

Para no perder tiempo buscando dentro de cada consola.

### Supabase — proyecto `ojlvflmqcyxdnvhbnhgp`

| Para qué | Enlace |
| --- | --- |
| Editor SQL (pestaña nueva) | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/sql/new |
| Ver las tablas creadas | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/editor |
| Claves de API (anon y service role) | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/settings/api |
| Schemas expuestos a la API | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/settings/api |
| Redirect URLs de autenticación | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/auth/url-configuration |
| Proveedores de login (Google) | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/auth/providers |
| Usuarios registrados | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/auth/users |
| Backups | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/database/backups/scheduled |

### Vercel

Entrá por https://vercel.com/dashboard y abrí el proyecto por nombre.

| Proyecto | Nombre en Vercel | Qué sirve |
| --- | --- | --- |
| App | `terreno` | `terreno.arteytierra.org` → después `app.acequia.app` |
| Landing | `acequia-landing-piloto` | → después `acequia.app` |

Dentro de cada proyecto, lo que vas a usar está en **Settings → Environment
Variables** y en **Settings → Domains**.

### Otras consolas

| Para qué | Enlace |
| --- | --- |
| Credenciales OAuth de Google | https://console.cloud.google.com/apis/credentials |
| Permisos de tu cuenta de Google (para la prueba 3 del paso 5) | https://myaccount.google.com/permissions |
| DNS de `acequia.app` en GoDaddy | https://dcc.godaddy.com/control/acequia.app/dns |

### Archivos de este encargo

| Archivo | Para qué |
| --- | --- |
| `_research/_encargos/SESION_1_MIGRACIONES.sql` | las cuatro migraciones concatenadas, listas para pegar de una |
| `_research/_encargos/VERIFICACION_SESION_1.sql` | los diez controles de lectura del paso 2 |
| `_research/_encargos/VARIABLES_PREVIEW_ACEQUIA.md` | la lista de variables del paso 3 |
| `_research/_encargos/CARGA_ENV_VERCEL.md` | **hoja de ejecución del paso 3**: una tabla por proyecto, fila por variable, con el orden respecto de los dominios, la trampa del BOM y cómo verificar |

---

## Antes de empezar — dónde está cada cosa

| Pieza | Dónde vive | Proyecto de Vercel |
| --- | --- | --- |
| App (mapa, informes) | `apps/terreno` del monorepo | `terreno` |
| Landing nueva | `C:\Users\Usuario\Documents\ChatGPT\terreno\acequia-landing-piloto` | `acequia-landing-piloto` |
| Base de datos | Supabase, un solo proyecto para las dos | — |
| Dominio | `acequia.app`, comprado en GoDaddy | — |

`terreno.arteytierra.org` es producción y sigue funcionando durante toda la
mudanza. No se apaga hasta el paso 9.

---

## Paso 1 — Punto de reversión

**Actualizado: el proyecto está en plan Free, y el plan Free no tiene backups de
ningún tipo** — ni programados, ni manuales, ni PITR. La pantalla de Backups sólo
ofrece pasar a Pro. El `pg_dump` local que decía la versión anterior de este
documento tampoco sale: en esta máquina no hay `pg_dump`, ni `psql`, ni Docker.

**No hace falta pagar Pro para esta sesión.** Las cuatro migraciones que se
aplican ahora son puramente aditivas: crean tablas, índices y funciones nuevas, y
no tienen un solo `drop`, `delete` ni `update` sobre datos existentes. Si algo
sale mal se revierte tirando abajo lo que crearon. Un backup ahí no protege de
nada.

La única migración con riesgo real es `0051`, que sí toca `terreno.suscripciones`
— y esa queda para el paso 8, con pagos. Cuando llegue ese momento, el punto de
reversión que hace falta es este, que es gratis y tarda dos segundos:

```sql
create schema if not exists respaldo_20260904;
create table respaldo_20260904.suscripciones as select * from terreno.suscripciones;

-- Guardá la salida de estas dos en un archivo tuyo: es lo que 0051 pisa.
select conname, pg_get_constraintdef(oid) from pg_constraint
where conrelid = 'terreno.suscripciones'::regclass;
select pg_get_functiondef('terreno.limite_proyectos_semilla()'::regprocedure);
```

La segunda importa especialmente: `0051` hace `create or replace` de esa función
y borra el cuerpo anterior sin dejar rastro en ningún lado.

**Control obligatorio antes de aplicar nada:** la URL del proyecto de Supabase que
tenés abierto tiene que ser exactamente la misma que el `NEXT_PUBLIC_SUPABASE_URL`
cargado hoy en el proyecto `terreno` de Vercel. Hoy es
`https://ojlvflmqcyxdnvhbnhgp.supabase.co`. Si no coincide, pará: estarías tocando
otra base.

Considerá pasar a Pro cuando haya postulantes reales cargados en las tablas del
piloto — ahí sí va a haber datos que sólo viven en Supabase y que perderías.

---

## Paso 2 — Aplicar las migraciones

> **El error más común, y ya te pasó una vez:** el editor SQL **no abre
> archivos**. Si pegás `supabase/migrations/0049_acequia_public_forms.sql` te va a
> contestar `ERROR: 42601: syntax error at or near "supabase"`, porque está
> tratando de ejecutar esa línea de texto como si fuera SQL. Hay que pegar el
> **contenido** del archivo, no su ruta.

### Lo que se aplica ahora

Abrí `_research/_encargos/SESION_1_MIGRACIONES.sql`, copiá **todo** el archivo y
pegalo en https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/sql/new

Ese archivo trae las cuatro migraciones aditivas ya concatenadas y en orden:

1. `0049_acequia_public_forms.sql` — las dos tablas de formularios públicos
2. `0050_acequia_public_form_functions.sql` — las dos funciones que escriben en ellas
3. `202609020001_pilot_feedback_metrics.sql` *(landing)* — participantes, devoluciones y eventos
4. `0052_terreno_product_journey.sql` — `terreno.eventos_recorrido`

Es idempotente de punta a punta: todo es `create ... if not exists` o
`create or replace`. Si falla a la mitad, se arregla y se vuelve a correr entero
sin dejar nada roto.

### Lo que NO se aplica

- **`0051_acequia_commercial_trial.sql`.** Su propia cabecera dice *"se deja sin
  aplicar hasta completar sandbox y revisión legal"*, y nada de la vista previa la
  necesita: `ACEQUIA_TRIAL_ENABLED` va a quedar en `false` igual. Va en el paso 8,
  junto con pagos, y con el punto de reversión del paso 1 corrido antes.
- **`202608290001_acequia_public_forms.sql` del landing.** Es el mismo contenido
  que `0049` + `0050`, partido distinto y con un índice de menos. Verificado por
  diff.

### Verificación — cómo leer los diez bloques

Pegá `_research/_encargos/VERIFICACION_SESION_1.sql` en el editor SQL. Son sólo
lecturas: se puede repetir cuantas veces quieras, no rompe nada.

Supabase corre los diez bloques pero **te muestra el resultado del último**. Para
verlos uno por uno, seleccioná con el mouse el bloque que querés y apretá Run:
ejecuta sólo lo seleccionado. Esa es la forma práctica de recorrerlos.

Esto es lo que tiene que dar cada uno:

| Bloque | Qué mira | Resultado correcto |
| --- | --- | --- |
| 1 | las 7 tablas | 7 filas; sin `0051`, la de `terreno.suscripcion_eventos_proveedor` da `ok = false` — **esperado** |
| 2 | RLS activa | todas las filas con `ok = true`. Un `false` acá es grave: esa tabla queda abierta |
| 3 | las funciones | las cuatro `submit_...` con `ok_security_definer = true`. `limite_proyectos_semilla` aparece con su versión vieja, está bien |
| 4 | los índices | todos `ok = true`, salvo `terreno.suscripcion_eventos_provider_ref_idx`, que es de `0051` |
| 5 | columnas de la prueba comercial | **todo `false` es lo esperado** mientras `0051` no esté aplicada |
| 6 | restricciones de `0051` | **cero filas, o sólo la restricción vieja**, es lo esperado sin `0051` |
| 7 | estados de suscripción raros | **cero filas.** Si devuelve algo, avisame antes de seguir |
| 8 | política de `eventos_recorrido` | una fila, `eventos_recorrido_insert_self`, con `(user_id = auth.uid())` |
| 9 | schemas expuestos | tiene que aparecer `terreno` en la lista. Si no está, la telemetría del navegador muere **en silencio** |
| 10 | lectura anónima | **cero filas.** Es el control más importante: filas acá significan que los correos de los postulantes son públicos. Si aparece algo, no sigas y avisame |

Dos lecturas de error que conviene reconocer:

- Si el **bloque 4** no encuentra `acequia_account_requests_ip_hash_idx`, se
  aplicó el archivo del landing en vez del `0050`. Volvé a correr
  `SESION_1_MIGRACIONES.sql` entero y repetí.
- Si el **bloque 9** no muestra `terreno`, andá a
  https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/settings/api y
  agregalo en *Exposed schemas*, junto a `public`.

Cuando termines, mandame la salida de los bloques 7, 9 y 10. Los otros los podés
dar por buenos vos con la tabla de arriba.

---

## Paso 3 — Variables de la vista previa del landing

> **Para ejecutar este paso mirando la pantalla, usá
> `_research/_encargos/CARGA_ENV_VERCEL.md`.** Ahí está lo mismo que sigue acá
> pero desarmado en tablas fila por fila, con los dos proyectos de Vercel, el
> orden respecto de los dominios, la traducción de cada error del preflight y
> qué hacer con `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN`. Lo de abajo queda como la
> explicación de fondo.

### Qué es una variable de entorno, y por qué acá

Son valores que la aplicación lee al arrancar y que **no viven en el código**:
claves, URLs, interruptores. Se cargan en Vercel y el código las busca por nombre.
La ventaja es que la clave privada de Supabase nunca queda escrita en un archivo
del repositorio.

Vercel tiene tres entornos separados —Production, Preview y Development— y cada
variable se carga en el que vos elijas. **En este paso todo va sólo en Preview.**
Production se toca recién en el paso 6.

Dónde: https://vercel.com/dashboard → proyecto `acequia-landing-piloto` →
**Settings → Environment Variables** → *Add New*. En cada una, destildá Production
y Development, y dejá tildado sólo **Preview**.

### Las ocho variables

| Variable | Qué poner | De dónde sale |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | la URL `*.vercel.app` del landing, **sin barra final y sin ruta** | pestaña Deployments del proyecto `acequia-landing-piloto` |
| `NEXT_PUBLIC_APP_URL` | la URL `*.vercel.app` de la app | pestaña Deployments del proyecto `terreno` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ojlvflmqcyxdnvhbnhgp.supabase.co` | ya lo sabés |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clave `anon` / `public` | https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/settings/api |
| `SUPABASE_SERVICE_ROLE_KEY` | la clave `service_role` — **privada, no la muestres nunca** | misma pantalla, hay que apretar *Reveal* |
| `PILOT_IP_HASH_SALT` | 32+ caracteres al azar (ver abajo) | la generás vos |
| `ANALYTICS_HASH_SALT` | 32+ caracteres al azar, **distinta de la anterior** | la generás vos |
| `PILOT_ADMIN_EMAILS` | tu correo; separá por comas si hay más de uno | vos |

### Las dos sales, explicado

Una **sal** es simplemente un texto secreto y al azar. Se usa así: cuando alguien
manda el formulario del piloto, no guardamos su IP — guardamos un hash de
`IP + sal`. Eso alcanza para contar cuántos envíos vinieron de la misma persona y
frenar el spam, pero sin poder reconstruir la IP. Si la sal se filtra, el truco se
rompe; de ahí que sea secreta, y que haya dos distintas (una para el formulario,
otra para la analítica) para que nadie pueda cruzar las dos tablas y descubrir que
son la misma persona.

No la inventes a mano — una sal tipeada por una persona no es al azar. Se genera
con este comando, que ya viene con Node y no manda nada a ningún lado: calcula 32
bytes aleatorios y los imprime en pantalla.

Abrí una terminal (en Windows: tecla Windows → escribí `powershell` → Enter),
pegá esto y apretá Enter:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Te va a imprimir una sola línea de texto raro, con esta pinta — **este es un
ejemplo, no lo uses**:

```
kQ7x-2Bd9fLmR4vTsN8wYpZaHcE1jUoG5rXbW0nIqMs
```

Copiá **esa línea entera** y pegala como valor de `PILOT_IP_HASH_SALT`. Después
**volvé a correr el mismo comando** — te va a dar otra línea distinta — y esa
segunda va en `ANALYTICS_HASH_SALT`. No hace falta que las guardes en ningún lado:
una vez cargadas en Vercel viven ahí.

### Los nueve interruptores en `false`

Son banderas de encendido/apagado. Todas se cargan con el valor literal `false`,
en minúscula y sin comillas:

`NEXT_PUBLIC_PAYMENTS_ENABLED`, `PAYMENT_WEBHOOKS_ENABLED`,
`EMAIL_DELIVERY_ENABLED`, `NEXT_PUBLIC_ALLOW_INDEXING`,
`NEXT_PUBLIC_PILOT_APPLICATIONS_ENABLED`, `NEXT_PUBLIC_PILOT_FEEDBACK_ENABLED`,
`NEXT_PUBLIC_ACCOUNT_REQUESTS_ENABLED`, `NEXT_PUBLIC_PRODUCT_ANALYTICS_ENABLED`,
`PILOT_ADMIN_ENABLED`.

Van en `false` porque la preview es para probar el circuito, no para recibir
postulantes reales ni para que Google la indexe. Se encienden de a uno, después.

### La variable que NO se carga todavía

**`NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` no se carga en Preview.** Si la ponés en
`.acequia.app` mientras probás sobre una URL `*.vercel.app`, el navegador descarta
la cookie de sesión y **el login falla sin ningún mensaje de error**. Es media
sesión perdida buscando un bug que no existe. Va recién en el paso 6, y sólo en
Production.

### Después de cargarlas

**1. Redesplegá la preview.** Deployments → el último deployment → los tres puntos
→ *Redeploy*. Las variables no se aplican solas a un build que ya existe.

**2. Bajá las variables a tu máquina y corré la verificación con ellas cargadas.**
La herramienta de línea de comandos de Vercel no está instalada acá, así que
primero:

```bash
npm i -g vercel
```

Después, parado en la carpeta del landing:

```bash
cd "C:\Users\Usuario\Documents\ChatGPT\terreno\acequia-landing-piloto"
vercel login
vercel link
vercel env pull .env.local --environment=preview
npm run preflight
```

`vercel login` te abre el navegador una sola vez. `vercel link` te pregunta a qué
proyecto corresponde la carpeta: elegí `acequia-landing-piloto`.

**Correr `npm run preflight` en seco no sirve.** Todas sus reglas son
condicionales: con el entorno vacío no encuentra nada que revisar y dice OK igual.
Verde en seco no significa "está configurado" — sólo vale corrido después del
`env pull`.

**3. Si alguna ruta `/api` devuelve un 500 con el cuerpo vacío**, es el bug
histórico del BOM: un carácter invisible que se cuela al principio del valor de
`NEXT_PUBLIC_SITE_URL` cuando lo pegás desde otro lado. Borrá la variable y volvé
a **tipearla a mano** en vez de pegarla.

---

## Paso 4 — Google y Supabase Auth (todavía en preview)

Acá se conectan tres cosas que tienen que coincidir exactamente, y el orden
importa. Vale la pena entender el circuito antes de tocar, porque si algo no
coincide el error de Google es genérico y no dice cuál de las tres falló:

> El usuario aprieta *Entrar con Google* en tu app → la app lo manda a Google →
> **Google devuelve al callback de Supabase**, nunca a tu app → Supabase crea la
> sesión y **recién ahí** redirige al `/auth/callback` de tu app.

Por eso Google conoce **una sola** URL —la de Supabase— y Supabase conoce las de
tus sitios. Es el punto donde más gente se confunde.

### 4.1 — Google Cloud

Andá a https://console.cloud.google.com/apis/credentials y abrí tu cliente OAuth
(sección *OAuth 2.0 Client IDs*, de tipo *Web application*).

En **Authorized redirect URIs** tiene que estar exactamente esta, y sólo esta:

```
https://ojlvflmqcyxdnvhbnhgp.supabase.co/auth/v1/callback
```

Sin barra final, con `https`, sin espacios. **Ninguna URL de tu app ni del landing
va acá.** Si ves URLs viejas de `terreno.arteytierra.org` en esa lista, dejalas por
ahora —no molestan— y las limpiás en el paso 9.

En **Authorized JavaScript origins** no hace falta nada para este circuito.

Guardá. Google avisa que los cambios pueden tardar unos minutos en tomar efecto:
si el login falla justo después de tocar acá, esperá cinco minutos y reintentá
antes de buscar otra causa.

### 4.2 — Que Supabase tenga las credenciales de Google

Andá a https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/auth/providers
y abrí **Google**. Tienen que estar cargados el *Client ID* y el *Client Secret*
del mismo cliente OAuth que acabás de editar, y el interruptor *Enable Sign in
with Google* encendido.

Los dos valores salen de la misma pantalla de Google Cloud del punto anterior (el
secreto sólo se ve al crearlo; si lo perdiste, generá uno nuevo desde ahí y pegá el
nuevo acá). Si ya andaba el login con Google en `terreno.arteytierra.org`, esto ya
está bien y no hay nada que tocar.

En esa misma pantalla, abajo de todo, Supabase muestra su *Callback URL*: tiene que
ser idéntica a la que pegaste en Google. Es la forma de chequearlo sin escribirla a
mano.

### 4.3 — Redirect URLs en Supabase

Andá a
https://supabase.com/dashboard/project/ojlvflmqcyxdnvhbnhgp/auth/url-configuration

En **Redirect URLs**, apretá *Add URL* y agregá estas dos, reemplazando por las
URLs `*.vercel.app` reales:

```
https://<preview-del-landing>.vercel.app/auth/callback
https://<preview-de-la-app>.vercel.app/auth/callback
```

Son las mismas URLs que cargaste en `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_APP_URL`
en el paso 3, con `/auth/callback` pegado al final.

**Cuidado con las previews de Vercel:** cada deployment genera una URL nueva con un
sufijo distinto. Si probás sobre esas, la lista de Supabase queda vieja a cada rato.
Usá siempre la URL estable del proyecto —la que Vercel llama *Preview domain* y no
cambia entre deploys— o, si preferís, cargá el comodín:

```
https://acequia-landing-piloto-*.vercel.app/auth/callback
```

Supabase acepta `*` en esa lista. En **Production nunca uses comodines**: ahí van
las dos URLs exactas y nada más.

Dejá el **Site URL** de esa pantalla apuntando a lo que hoy es producción
(`https://terreno.arteytierra.org`) hasta el paso 7. Ese campo es a dónde manda
Supabase cuando el enlace no trae un destino explícito.

Las definitivas —`https://acequia.app/auth/callback` y
`https://app.acequia.app/auth/callback`— se agregan recién en el paso 7.

### 4.4 — Chequeo rápido antes de pasar al paso 5

Abrí la preview del landing en una **ventana de incógnito** y apretá entrar con
Google. Si te devuelve a tu sitio ya logueado, las tres piezas coinciden.

Si falla, el mensaje te dice cuál es:

| Lo que ves | Qué está mal |
| --- | --- |
| `Error 400: redirect_uri_mismatch` (pantalla de Google) | la URI del punto 4.1 no coincide. Comparala carácter por carácter con la que muestra Supabase en 4.2 |
| Vuelve a tu sitio pero a `/login?estado=enlace-invalido` | la URL de retorno no está en la lista del punto 4.3 |
| `Unsupported provider` | el proveedor Google está apagado en Supabase (punto 4.2) |
| Loguea, pero al recargar te pide entrar de nuevo | cargaste `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` en Preview. Borrala |

---

## Paso 5 — Las siete pruebas con sesión

Estas las tenés que hacer vos porque `/mapa` y `/informe/*` están detrás de login y
yo no puedo entrar. Usá un correo real tuyo. Anotá el resultado real de cada una,
incluidas las que fallen.

1. Crear cuenta con Google.
2. Cerrar sesión y volver a entrar.
3. Revocar el permiso de Google desde https://myaccount.google.com/permissions y
   reintentar el ingreso.
4. Recuperación de contraseña.
5. Abrir un enlace de recuperación ya vencido.
6. Entrar a `/mapa` con la sesión vencida.
7. Completar una cuenta que no tiene nombre cargado.

**Criterio para dar por buena la preview:** ninguna redirección sale de Acequia, y
**todo error ofrece una salida**. Nada de pantallas en blanco ni de mensajes que no
digan qué hacer. Si algo de esto falla, mandámelo y lo arreglo antes de seguir.

---

## Paso 6 — Publicar la landing en `acequia.app`

Recién acá se toca un dominio.

1. En Vercel, proyecto `acequia-landing-piloto` → **Settings → Domains**. Agregá
   `acequia.app` y `www.acequia.app`. Vercel te va a dictar los registros exactos.
2. En GoDaddy → https://dcc.godaddy.com/control/acequia.app/dns, cargá esos
   registros tal cual. Suele ser un `A` en la raíz apuntando a la IP de Vercel y un
   `CNAME` para `www`. No inventes valores: usá los que muestra Vercel en ese
   momento.
3. Volvé a Vercel y esperá a que los dos dominios digan *Valid Configuration*.
   Puede tardar; si a las 2 horas no propagó, revisá que no haya quedado un registro
   viejo compitiendo.
4. Marcá `acequia.app` como dominio principal y `www.acequia.app` como redirección
   hacia él.
5. Ahora sí, cargá las mismas ocho variables del paso 3 en el entorno
   **Production**, con estos dos cambios:
   - `NEXT_PUBLIC_SITE_URL` = `https://acequia.app`
   - `NEXT_PUBLIC_APP_URL` = `https://app.acequia.app`
6. Cargá `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` = `.acequia.app` **sólo en Production**,
   nunca en Preview.
7. Bajá las variables de producción y corré `npm run preflight -- --production`.
   Esa variante agrega tres reglas: HTTPS obligatorio, los orígenes exactos
   `https://acequia.app` y `https://app.acequia.app`, y el dominio de cookie. Si
   falla, no publiques.
8. Encendé recién ahora `NEXT_PUBLIC_ALLOW_INDEXING` si querés que Google indexe.
   Los interruptores del piloto y de pagos siguen en `false`.

**(lo hago yo)** Revisar que no quede ninguna nota de demostración ni enlace
simulado en el landing, y dejar sitemap, robots y metadatos de producción. Ahora que
tengo acceso al repositorio del landing puedo hacerlo y dejártelo commiteado.

---

## Paso 7 — La app en `app.acequia.app`

1. En Vercel, proyecto `terreno` → **Settings → Domains** → agregá
   `app.acequia.app`.
2. En GoDaddy, el `CNAME` que te dicte Vercel para `app`.
3. **No** saques todavía `terreno.arteytierra.org`. Los dos dominios conviven entre
   7 y 14 días.
4. En las variables de Production de ese proyecto, cambiá:
   - `NEXT_PUBLIC_SITE_URL` = `https://app.acequia.app`
   - `NEXT_PUBLIC_ACEQUIA_APP_HOST` = `app.acequia.app`
5. **Supabase → Authentication → URL Configuration:** agregá
   `https://acequia.app/auth/callback` y `https://app.acequia.app/auth/callback`, y
   cambiá el **Site URL** a `https://app.acequia.app`.
6. Redesplegá y repetí las siete pruebas del paso 5, ahora sobre
   `app.acequia.app`.

Dato útil: en el código no hay ningún dominio viejo clavado. Los cuatro lugares
donde aparece `terreno.arteytierra.org` son valores por defecto detrás de una
variable de entorno, así que este paso es configuración, no código.

Aviso a tener presente: **las sesiones no se transfieren entre dominios.** Quien
esté logueado en `terreno.arteytierra.org` va a tener que volver a entrar en
`app.acequia.app`. Conviene avisarlo.

---

## Paso 8 — Pagos, prueba de 3 días y la migración `0051`

Este bloque está parado a propósito, esperando sandbox y revisión legal. Cuando lo
retomes, el orden es:

1. **Correr el punto de reversión del paso 1** y guardar la definición vieja de la
   restricción y de la función.
2. Aplicar `supabase/migrations/0051_acequia_commercial_trial.sql`, y después los
   bloques 5, 6 y 7 de la verificación — que recién ahí tienen que dar bien.
3. Crear los planes en **Mercado Pago** (Argentina) y **PayPal** (internacional),
   con los precios ya congelados: personal 7/70, diseñador 12/120, estudio 35/350
   (USD, mensual/anual).
4. Probar todo el circuito en sandbox: alta con prueba de 3 días, primer cobro,
   rechazo, cancelación durante la prueba y cambio de plan.
5. Agregar `https://app.acequia.app` al CORS del checkout que hoy vive en
   `apps/web`.
6. Encender `PAYMENT_WEBHOOKS_ENABLED`, después `NEXT_PUBLIC_PAYMENTS_ENABLED`, y
   **último de todo** `ACEQUIA_TRIAL_ENABLED`.
7. Una operación real controlada, con tu propia tarjeta, antes de abrirlo.

**(lo hago yo)** Los webhooks con idempotencia, la lógica de cancelación durante la
prueba y los correos del ciclo de cobro, cuando digas que arrancamos.

---

## Paso 9 — Corte

1. Declarar `app.acequia.app` como dominio principal de la app.
2. Mirar errores durante 7 a 14 días con los dos accesos vivos.
3. Recién entonces, redirigir `terreno.arteytierra.org` → `app.acequia.app`
   conservando ruta y parámetros, y `arteytierra.org/acequia` → `acequia.app`.
4. Limpiar de Google Cloud y de Supabase las URLs viejas que quedaron del paso 4.
5. Actualizar links en correos, PDFs, redes y material comercial.
6. Tener escrito el plan de reversión de DNS antes de tocar nada: cuáles eran los
   registros anteriores y a dónde apuntaban.

---

## Resumen de en qué orden pedirme cosas a mí

| Cuando termines… | Pedime |
| --- | --- |
| Paso 2 | que revise la salida de los bloques 7, 9 y 10 de la verificación |
| Paso 4 | que mire el error si el login con Google no cierra el círculo |
| Paso 5 | que arregle lo que haya fallado en las siete pruebas |
| Paso 6 | limpieza de notas de demo, sitemap, robots y metadatos del landing |
| Paso 8 | webhooks, cancelación en prueba y correos de cobro |
