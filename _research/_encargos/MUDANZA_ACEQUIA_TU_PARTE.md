# Mudanza a acequia.app — paso a paso de lo que tenés que hacer vos

Escrito el 04/09/2026. Es la lista de todo lo que queda y que **no puedo hacer
yo**, porque toca consolas externas, credenciales, dinero o dominios. Lo que sí
puedo hacer está marcado como **(lo hago yo)**.

Regla que vale para todo el documento: **ninguna clave se pega en un chat, en un
archivo del repositorio ni en una captura.** Los valores se cargan directo en la
consola donde van.

---

## Antes de empezar — dónde está cada cosa

| Pieza | Dónde vive | Proyecto de Vercel |
| --- | --- | --- |
| App (mapa, informes) | `apps/terreno` del monorepo | el que hoy sirve `terreno.arteytierra.org` |
| Landing nueva | `C:\Users\Usuario\Documents\ChatGPT\terreno\acequia-landing-piloto` | `acequia-landing-piloto` |
| Base de datos | Supabase, un solo proyecto para las dos | — |
| Dominio | `acequia.app`, comprado en GoDaddy | — |

`terreno.arteytierra.org` es producción y sigue funcionando durante toda la
mudanza. No se apaga hasta el paso 9.

---

## Paso 1 — Backup de Supabase

Sin esto no se aplica ninguna migración.

1. Entrá al proyecto de Supabase.
2. **Database → Backups**. Sacá un backup manual y esperá a que diga que
   terminó. Si el plan no permite backup manual, exportá con `pg_dump` a un
   archivo local antes de seguir.
3. Anotá la fecha y hora del backup. Es tu punto de reversión.

**Antes de aplicar nada, confirmá que es el proyecto correcto:** la URL del
proyecto abierto tiene que ser exactamente la misma que el
`NEXT_PUBLIC_SUPABASE_URL` que hoy tiene cargado el proyecto de Vercel de la
app. Si no coinciden, pará: estarías tocando otra base.

---

## Paso 2 — Aplicar las cinco migraciones, en este orden

En **SQL Editor**, una por una, esperando que cada una termine antes de la
siguiente.

1. `supabase/migrations/0049_acequia_public_forms.sql` *(monorepo)*
2. `supabase/migrations/0050_acequia_public_form_functions.sql` *(monorepo)*
3. `supabase/migrations/202609020001_pilot_feedback_metrics.sql` *(landing)*
4. `supabase/migrations/0051_acequia_commercial_trial.sql` *(monorepo)*
5. `supabase/migrations/0052_terreno_product_journey.sql` *(monorepo)*

Tres aclaraciones:

- **No apliques `202608290001_acequia_public_forms.sql` del landing.** Es el
  mismo contenido que `0049` + `0050`, partido distinto y con un índice de
  menos. Verificado por diff.
- **`0051` es segura sobre los datos que hay hoy.** Reemplaza la restricción de
  estados de `terreno.suscripciones`, y los estados viejos (`activa`,
  `vencida`, `cancelada`) son un subconjunto de los nuevos, así que ninguna fila
  existente puede violarla.
- `0051` crea el estado comercial de prueba, pero **no cobra nada**. El
  interruptor `ACEQUIA_TRIAL_ENABLED` sigue en `false` y es lo último que se
  enciende, después de pagos.

### Verificación (obligatoria)

Pegá `_research/_encargos/VERIFICACION_SESION_1.sql` en el editor SQL y corré
los diez bloques. Son sólo lecturas, se puede repetir cuantas veces quieras.

Lo que tiene que dar:

- Bloques 1 a 6: las 7 tablas existen, todas con RLS activa, las 5 funciones
  están, los 11 índices están, `terreno.suscripciones` tiene las 5 columnas
  nuevas y las 2 restricciones.
- Bloque 7: **cero filas.** Si devuelve filas, hay suscripciones con un estado
  fuera de la lista nueva y hay que mirarlas antes de seguir.
- Bloque 9: `terreno` tiene que seguir en la lista de schemas expuestos. Si
  desaparece, la telemetría del navegador deja de funcionar **en silencio**.
- Bloque 10: **cero filas.** Es el control más importante. Filas acá significan
  que alguna tabla del piloto quedó legible con la clave anónima, o sea que los
  correos de los postulantes son públicos. Si aparece algo, no sigas: avisame.

Si el bloque 4 no encuentra `acequia_account_requests_ip_hash_idx`, es que se
aplicó el archivo del landing en vez del `0050`. Aplicá el `0050` y repetí.

---

## Paso 3 — Variables de la vista previa del landing

En Vercel, proyecto `acequia-landing-piloto`, **entorno Preview únicamente**.
Nunca Production en este paso.

Cargá estas ocho, por nombre:

| Variable | Qué poner |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | la URL `*.vercel.app` del landing, **sin barra final y sin ruta** |
| `NEXT_PUBLIC_APP_URL` | la URL `*.vercel.app` de la app |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave anónima |
| `SUPABASE_SERVICE_ROLE_KEY` | clave de servicio — **privada** |
| `PILOT_IP_HASH_SALT` | 32+ caracteres al azar |
| `ANALYTICS_HASH_SALT` | 32+ caracteres al azar, **distinta de la anterior** |
| `PILOT_ADMIN_EMAILS` | tu correo; separá por comas si hay más de uno |

Para generar cada sal, en una terminal tuya (el valor no pasa por ningún lado):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Estas nueve quedan en `false`: `NEXT_PUBLIC_PAYMENTS_ENABLED`,
`PAYMENT_WEBHOOKS_ENABLED`, `EMAIL_DELIVERY_ENABLED`,
`NEXT_PUBLIC_ALLOW_INDEXING`, `NEXT_PUBLIC_PILOT_APPLICATIONS_ENABLED`,
`NEXT_PUBLIC_PILOT_FEEDBACK_ENABLED`, `NEXT_PUBLIC_ACCOUNT_REQUESTS_ENABLED`,
`NEXT_PUBLIC_PRODUCT_ANALYTICS_ENABLED`, `PILOT_ADMIN_ENABLED`.

**`NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` no se carga todavía.** Puesta en
`.acequia.app` mientras probás sobre una URL `vercel.app`, el navegador descarta
la cookie de sesión y el login falla sin ningún mensaje.

### Después de cargarlas

1. Redesplegá la preview.
2. Bajá las variables y corré la verificación **con ellas cargadas**:

```bash
vercel env pull .env.local --environment=preview
```

Y después `npm run preflight`. Correrlo en seco no sirve: todas sus reglas son
condicionales y con el entorno vacío dice OK igual. Verde en seco no significa
"está configurado".

3. Si alguna ruta `/api` devuelve un 500 con cuerpo vacío, es el bug histórico
   del BOM: un carácter invisible al principio del valor de
   `NEXT_PUBLIC_SITE_URL`. Borrá la variable y volvé a tipearla a mano en vez de
   pegarla.

---

## Paso 4 — Google y Supabase Auth (todavía en preview)

1. **Google Cloud → Credenciales → tu cliente OAuth.** En *Authorized redirect
   URIs* tiene que estar el callback oficial de Supabase, que es
   `https://<project-ref>.supabase.co/auth/v1/callback`. Ese es el único que va
   en Google; las URLs de tu app no van acá.
2. **Supabase → Authentication → URL Configuration.** En *Redirect URLs*
   agregá:
   - la preview del landing + `/auth/callback`
   - la preview de la app + `/auth/callback`

   Las definitivas (`https://acequia.app/auth/callback` y
   `https://app.acequia.app/auth/callback`) se agregan recién en el paso 7.

---

## Paso 5 — Las siete pruebas con sesión

Estas las tenés que hacer vos porque `/mapa` y `/informe/*` están detrás de
login y yo no puedo entrar. Usá un correo real tuyo. Anotá el resultado real de
cada una, incluidas las que fallen.

1. Crear cuenta con Google.
2. Cerrar sesión y volver a entrar.
3. Revocar el permiso de Google desde tu cuenta de Google y reintentar el
   ingreso.
4. Recuperación de contraseña.
5. Abrir un enlace de recuperación ya vencido.
6. Entrar a `/mapa` con la sesión vencida.
7. Completar una cuenta que no tiene nombre cargado.

**Criterio para dar por buena la preview:** ninguna redirección sale de Acequia,
y **todo error ofrece una salida**. Nada de pantallas en blanco ni de mensajes
que no digan qué hacer. Si algo de esto falla, mandámelo y lo arreglo antes de
seguir.

---

## Paso 6 — Publicar la landing en `acequia.app`

Recién acá se toca un dominio.

1. En Vercel, proyecto `acequia-landing-piloto` → **Settings → Domains**.
   Agregá `acequia.app` y `www.acequia.app`. Vercel te va a dictar los registros
   exactos.
2. En **GoDaddy → DNS** de `acequia.app`, cargá esos registros tal cual. Suele
   ser un `A` en la raíz apuntando a la IP de Vercel y un `CNAME` para `www`. No
   inventes valores: usá los que muestra Vercel en ese momento.
3. Volvé a Vercel y esperá a que los dos dominios digan *Valid Configuration*.
   Puede tardar; si a las 2 horas no propagó, revisá que no haya quedado un
   registro viejo compitiendo.
4. Marcá `acequia.app` como dominio principal y `www.acequia.app` como
   redirección hacia él.
5. Ahora sí, cargá las mismas ocho variables del paso 3 en el entorno
   **Production**, con estos dos cambios:
   - `NEXT_PUBLIC_SITE_URL` = `https://acequia.app`
   - `NEXT_PUBLIC_APP_URL` = `https://app.acequia.app`
6. Cargá `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` = `.acequia.app` **sólo en
   Production**, nunca en Preview.
7. Bajá las variables de producción y corré `npm run preflight -- --production`.
   Esa variante agrega tres reglas: HTTPS obligatorio, los orígenes exactos
   `https://acequia.app` y `https://app.acequia.app`, y el dominio de cookie. Si
   falla, no publiques.
8. Encendé recién ahora `NEXT_PUBLIC_ALLOW_INDEXING` si querés que Google
   indexe. Los interruptores del piloto y de pagos siguen en `false`.

**(lo hago yo)** Revisar que no quede ninguna nota de demostración ni enlace
simulado en el landing, y dejar sitemap, robots y metadatos de producción. Ahora
que tengo acceso al repositorio del landing puedo hacerlo y dejártelo
commiteado.

---

## Paso 7 — La app en `app.acequia.app`

1. En Vercel, proyecto de la app (el que sirve `terreno.arteytierra.org`) →
   **Domains** → agregá `app.acequia.app`.
2. En GoDaddy, el `CNAME` que te dicte Vercel para `app`.
3. **No** saques todavía `terreno.arteytierra.org`. Los dos dominios conviven
   entre 7 y 14 días.
4. En las variables de Production de ese proyecto, cambiá:
   - `NEXT_PUBLIC_SITE_URL` = `https://app.acequia.app`
   - `NEXT_PUBLIC_ACEQUIA_APP_HOST` = `app.acequia.app`
5. **Supabase → Authentication → Redirect URLs:** agregá
   `https://acequia.app/auth/callback` y
   `https://app.acequia.app/auth/callback`.
6. Redesplegá y repetí las siete pruebas del paso 5, ahora sobre
   `app.acequia.app`.

Dato útil: en el código no hay ningún dominio viejo clavado. Los cuatro lugares
donde aparece `terreno.arteytierra.org` son valores por defecto detrás de una
variable de entorno, así que este paso es configuración, no código.

Aviso a tener presente: **las sesiones no se transfieren entre dominios.** Quien
esté logueado en `terreno.arteytierra.org` va a tener que volver a entrar en
`app.acequia.app`. Conviene avisarlo.

---

## Paso 8 — Pagos y prueba de 3 días

Este bloque está parado a propósito esperando sandbox y revisión legal. Cuando
lo retomes, el orden es:

1. Crear los planes en **Mercado Pago** (Argentina) y **PayPal**
   (internacional), con los precios ya congelados: personal 7/70, diseñador
   12/120, estudio 35/350 (USD, mensual/anual).
2. Probar todo el circuito en sandbox: alta con prueba de 3 días, primer cobro,
   rechazo, cancelación durante la prueba y cambio de plan.
3. Agregar `https://app.acequia.app` al CORS del checkout que hoy vive en
   `apps/web`.
4. Encender `PAYMENT_WEBHOOKS_ENABLED`, después `NEXT_PUBLIC_PAYMENTS_ENABLED`,
   y **último de todo** `ACEQUIA_TRIAL_ENABLED`.
5. Una operación real controlada, con tu propia tarjeta, antes de abrirlo.

**(lo hago yo)** Los webhooks con idempotencia, la lógica de cancelación durante
la prueba y los correos del ciclo de cobro, cuando digas que arrancamos.

---

## Paso 9 — Corte

1. Declarar `app.acequia.app` como dominio principal de la app.
2. Mirar errores durante 7 a 14 días con los dos accesos vivos.
3. Recién entonces, redirigir `terreno.arteytierra.org` → `app.acequia.app`
   conservando ruta y parámetros, y `arteytierra.org/acequia` → `acequia.app`.
4. Actualizar links en correos, PDFs, redes y material comercial.
5. Tener escrito el plan de reversión de DNS antes de tocar nada: cuáles eran
   los registros anteriores y a dónde apuntaban.

---

## Resumen de en qué orden pedirme cosas a mí

| Cuando termines… | Pedime |
| --- | --- |
| Paso 2 | que revise la salida de la verificación SQL si algo dio filas |
| Paso 5 | que arregle lo que haya fallado en las siete pruebas |
| Paso 6 | limpieza de notas de demo, sitemap, robots y metadatos del landing |
| Paso 8 | webhooks, cancelación en prueba y correos de cobro |
