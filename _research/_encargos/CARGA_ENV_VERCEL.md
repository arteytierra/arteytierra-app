# Carga de variables de entorno en Vercel — hoja de ejecución

Escrita el 05/09/2026. Es el paso 3 del runbook `MUDANZA_ACEQUIA_TU_PARTE.md`,
desarmado en filas para ejecutar mirando la pantalla. No hace falta leerla de
corrido: buscá la tabla del proyecto que estés tocando y cargá fila por fila.

**Regla que no se rompe:** ninguna clave se escribe acá, ni en un chat, ni en un
archivo del repositorio. Donde hay un secreto, esta guía dice de qué pantalla se
copia, nunca cuánto vale.

---

## 0. Antes de tocar nada — dos controles de 30 segundos

1. Abrí el proyecto de Supabase y confirmá que la URL es
   `https://ojlvflmqcyxdnvhbnhgp.supabase.co`. Si no coincide, pará: estarías
   configurando contra otra base.
2. Confirmá que el paso 2 (las cuatro migraciones) ya está aplicado. Varias de
   estas variables apuntan a tablas que crea ese paso. Como todo arranca en
   `false`, igual no rompe nada si todavía no lo hiciste, pero no vas a poder
   encender nada después.

---

## 1. Orden de ejecución — qué va antes y qué después del dominio

El orden importa porque `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_APP_URL` tienen
que apuntar a una URL que **ya exista y responda**. Cargar `https://acequia.app`
antes de que el dominio esté validado deja el sitio construyendo enlaces a un
lugar que no resuelve.

| Momento | Qué se hace | Dónde |
| --- | --- | --- |
| **A. Ahora** | Tabla 2 completa (Preview del landing) | `acequia-landing-piloto` → Preview |
| **B. Ahora** | Tabla 4 (interruptores nuevos de la app, todos en `false`) | `terreno` → Production |
| C. Después | Redeploy de la preview + `vercel env pull` + preflight | terminal |
| D. Después | Pasos 4 y 5 del runbook (Google, Supabase Auth, las siete pruebas) | consolas |
| E. Recién ahí | Agregar `acequia.app` y `www.acequia.app` en Vercel + DNS en GoDaddy | paso 6 |
| F. Con el dominio en *Valid Configuration* | Tabla 3 (Production del landing) | `acequia-landing-piloto` → Production |
| G. Con `app.acequia.app` validado | Tabla 5 (cambio de dominio de la app) | `terreno` → Production |

Lo que hay que retener: **A y B se hacen hoy; F y G no se tocan hasta que el
dominio diga *Valid Configuration* en Vercel.** En el medio, `terreno.arteytierra.org`
sigue funcionando sin enterarse de nada.

---

## 2. Proyecto `acequia-landing-piloto` — entorno **Preview**

Dónde: https://vercel.com/dashboard → `acequia-landing-piloto` → **Settings →
Environment Variables** → *Add New*.

**En cada variable destildá Production y Development, y dejá tildado sólo
Preview.** Es lo que más se olvida y es lo que ensucia producción sin querer.

Son 17 filas: 8 con valor propio y 9 interruptores.

### 2.1 — Las ocho con valor

| Variable | Entornos | Valor | De dónde sale |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Preview | la URL `*.vercel.app` estable del landing, **sin barra final y sin ruta** | proyecto `acequia-landing-piloto` → Deployments → *Preview domain* (el que no cambia entre deploys) |
| `NEXT_PUBLIC_APP_URL` | Preview | la URL `*.vercel.app` de la app, misma regla | proyecto `terreno` → Deployments |
| `NEXT_PUBLIC_SUPABASE_URL` | Preview | `https://ojlvflmqcyxdnvhbnhgp.supabase.co` | valor público, se tipea |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview | *secreto público* | Supabase → Settings → API → bloque *Project API keys* → fila `anon` `public` → botón de copiar |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview | *secreto privado* | misma pantalla, fila `service_role` → hay que apretar **Reveal** antes de copiar. Nunca se pega en un chat ni en un archivo |
| `PILOT_IP_HASH_SALT` | Preview | 32+ caracteres al azar | la generás vos (ver 2.3) |
| `ANALYTICS_HASH_SALT` | Preview | 32+ caracteres al azar, **distinta de la anterior** | la generás vos (ver 2.3) |
| `PILOT_ADMIN_EMAILS` | Preview | tu correo. Si hay más de uno, separados por comas y sin espacios raros | vos |

Sobre las dos URL: el preflight exige que sean **sólo el origen**. Si pegás algo
con `/` al final o con una ruta, tira
*"debe contener sólo el origen, sin rutas ni parámetros"*.

Sobre `PILOT_ADMIN_EMAILS`: el preflight sólo lo valida si `PILOT_ADMIN_ENABLED`
está en `true`, y ahí exige que cada elemento separado por coma contenga `@`.
Cargalo bien igual, para no tener que volver.

### 2.2 — Los nueve interruptores, todos en `false`

Se cargan con el texto literal `false`: minúscula, sin comillas, sin espacios.
El preflight rechaza cualquier otra cosa —incluido `FALSE`, `0` o `no`— con
*"Interruptores con un valor que no es true ni false"*. Y también rechaza que
**falte** alguno: los nueve tienen que existir aunque estén apagados, porque una
variable ausente y una variable en `false` se leen igual en el código y no quiere
que se confundan.

| Variable | Entornos | Valor | Por qué arranca apagada |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_PILOT_APPLICATIONS_ENABLED` | Preview | `false` | el formulario del piloto guardaría postulaciones reales en la base de producción mientras estás probando |
| `NEXT_PUBLIC_PILOT_FEEDBACK_ENABLED` | Preview | `false` | ídem, con las devoluciones |
| `NEXT_PUBLIC_ACCOUNT_REQUESTS_ENABLED` | Preview | `false` | es el canal de arrepentimiento y baja: no puede estar vivo antes de que exista una cuenta que dar de baja |
| `NEXT_PUBLIC_PRODUCT_ANALYTICS_ENABLED` | Preview | `false` | mezclaría eventos de tus pruebas con los de usuarios reales; se enciende cuando la privacidad esté revisada |
| `PILOT_ADMIN_ENABLED` | Preview | `false` | el panel usa la `service_role` key; con él encendido, cualquier error de configuración de correos admin abre la puerta |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Preview | `false` | si Google indexa la preview, después competís con vos mismo en los resultados |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | Preview | `false` | no hay sandbox ni revisión legal cerrada; el paso 8 lo enciende |
| `PAYMENT_WEBHOOKS_ENABLED` | Preview | `false` | mismo bloque de pagos. El preflight además exige que si `NEXT_PUBLIC_PAYMENTS_ENABLED` está en `true`, este también lo esté |
| `EMAIL_DELIVERY_ENABLED` | Preview | `false` | evita que una prueba dispare correos a gente real |

### 2.3 — Las dos sales

Una sal es un texto secreto y al azar. Cuando alguien manda un formulario no
guardamos su IP: guardamos un hash de `IP + sal`. Alcanza para contar envíos
repetidos y frenar spam, sin poder reconstruir la IP. Por eso tiene que ser
secreta, y por eso son **dos distintas**: con una sola se podrían cruzar la tabla
de formularios y la de métricas y volver a identificar a la persona. El preflight
chequea explícitamente que no sean iguales, y que cada una tenga 32 caracteres o
más.

No la inventes a mano. Abrí PowerShell y corré:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Copiá la línea entera → `PILOT_IP_HASH_SALT`. Corré **el mismo comando otra vez**
→ esa segunda línea va en `ANALYTICS_HASH_SALT`. No hace falta guardarlas en
ningún lado: una vez cargadas viven en Vercel.

### 2.4 — La variable que NO se carga en Preview

> **`NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` no se carga en Preview. Ninguno de los dos
> proyectos, ningún valor.**

La regla exacta, tal como está escrita en `scripts/preflight.mjs`:

- **Sin `--production`** (o sea, Preview y local): si la variable está presente
  con cualquier valor, es **error** y el preflight sale con código 1.
- **Con `--production`**: si su valor no es exactamente `.acequia.app` —incluido
  estar ausente— es **error**.

El motivo práctico: una cookie con dominio `.acequia.app` es descartada por el
navegador cuando estás navegando un `*.vercel.app`. La sesión no se guarda, el
login "no hace nada" y **no aparece ningún mensaje de error**. Es el bug que más
tiempo hace perder de todos los de esta mudanza. Si en las pruebas del paso 5
lográs entrar pero al recargar te vuelve a pedir ingresar, la causa es esta.

Va una sola vez, en la tabla 3, y sólo ahí.

### 2.5 — Opcionales, sólo si las querés

| Variable | Entornos | Valor | Nota |
| --- | --- | --- | --- |
| `PILOT_NOTIFICATION_WEBHOOK_URL` | Preview | una URL `https://` | recibe copia de las postulaciones. Si la cargás, el preflight exige HTTPS |
| `PILOT_NOTIFICATION_WEBHOOK_TOKEN` | Preview | *secreto* | el token del servicio al que apunte esa URL |

Si no las vas a usar, no las cargues vacías: dejalas sin crear.

---

## 3. Proyecto `acequia-landing-piloto` — entorno **Production**

**No hagas esto todavía.** Es el momento F del orden: recién cuando `acequia.app`
y `www.acequia.app` figuren como *Valid Configuration* en Vercel.

Se cargan **las mismas 17 filas** de la tabla 2, ahora tildando sólo
**Production**, con exactamente estas tres diferencias:

| Variable | Entornos | Valor en Production |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://acequia.app` — el preflight de producción exige este origen exacto |
| `NEXT_PUBLIC_APP_URL` | Production | `https://app.acequia.app` — ídem |
| `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` | **Production únicamente** | `.acequia.app` con el punto adelante. Es lo que permite compartir la sesión entre el landing y la app |

Los nueve interruptores siguen en `false` también en Production.
`NEXT_PUBLIC_ALLOW_INDEXING` se pasa a `true` recién cuando quieras que Google
indexe, y es el único que se enciende en esta etapa; los del piloto y los de
pagos siguen apagados hasta los pasos 8 y 9.

Los secretos (`SUPABASE_SERVICE_ROLE_KEY`, las dos sales) se vuelven a copiar de
la misma pantalla. Las sales pueden ser las mismas que en Preview o dos nuevas —
si generás nuevas, los hashes viejos de la preview dejan de cruzar con los de
producción, que es exactamente lo que querés.

---

## 4. Proyecto `terreno` — entorno **Production**, lo que se carga hoy

Este proyecto ya está en producción y ya tiene cargadas `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY`. **No las toques ahora.**

Lo que sí conviene dejar cargado hoy son los interruptores nuevos, en `false`.
Cargarlos apagados no cambia absolutamente nada del comportamiento actual, y
evita tener que volver a esta pantalla más adelante.

| Variable | Entornos | Valor | Por qué |
| --- | --- | --- | --- |
| `ACEQUIA_TRIAL_ENABLED` | Production, Preview | `false` | la prueba comercial de 3 días depende de la migración `0051`, que **no se aplicó** y queda para el paso 8. Con esto en `true` sin `0051`, las consultas de `lib/auth/plan.ts` piden columnas que no existen y la app rompe |
| `NEXT_PUBLIC_PILOT_MODE_ENABLED` | Production, Preview | `false` | muestra dentro del mapa el acceso al formulario de devolución del piloto. Todavía no hay piloto |
| `NEXT_PUBLIC_PRODUCT_ANALYTICS_ENABLED` | Production, Preview | `false` | el recorrido de producto escribe en `terreno.eventos_recorrido`. La tabla ya existe (migración `0052`), pero se enciende después de revisar privacidad |
| `NEXT_PUBLIC_ACEQUIA_SITE_URL` | Production, Preview | `https://acequia.app` | a dónde manda la app cuando ofrece el landing. Es un valor público, se tipea |

`NEXT_PUBLIC_ACEQUIA_APP_HOST` y `NEXT_PUBLIC_SITE_URL` de este proyecto **no se
tocan hoy**: van en la tabla 5.

Ojo con una asimetría: la app `terreno` **no tiene preflight**. Nadie va a
avisarte si escribís `False` en vez de `false`. En este proyecto el código
compara contra el literal `'true'`, así que cualquier otra cosa se lee como
apagado — que es el lado seguro, pero significa que un `true` mal tipeado tampoco
enciende nada y vas a estar diez minutos preguntándote por qué.

---

## 5. Proyecto `terreno` — el cambio de dominio (paso 7, no ahora)

Cuando `app.acequia.app` esté validado en Vercel:

| Variable | Entornos | Valor nuevo | Valor que pisa |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://app.acequia.app` | el que apunta hoy a `terreno.arteytierra.org` |
| `NEXT_PUBLIC_ACEQUIA_APP_HOST` | Production | `app.acequia.app` | si no está creada, se crea |

Y hay una tercera que vive en **otro proyecto**, el de `arteytierra.org`
(`apps/web`), y que es fácil de olvidar porque no está en ninguna de las tablas
anteriores:

| Variable | Proyecto | Entornos | Valor nuevo |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_ACEQUIA_APP_URL` | el de `apps/web` | Production | `https://app.acequia.app` |

Es la que arma los botones *Suscribir* y *Registro* que llevan de la web vieja a
la app. Sin cambiarla, esos dos botones siguen mandando a
`terreno.arteytierra.org` — que va a seguir vivo entre 7 y 14 días, así que no es
una rotura inmediata, pero es una punta suelta.

---

## 6. La trampa del BOM — leé esto antes de pegar el primer valor

Es un bug ya vivido dos veces en este proyecto. Cuando copiás un valor desde una
consola, un PDF, un editor de texto con formato o un chat, a veces viaja pegado
un carácter invisible: un BOM (`U+FEFF`), un espacio de ancho cero, una marca de
dirección de texto o un espacio duro. En Vercel el campo se ve **idéntico** a un
valor correcto. No hay forma visual de notarlo.

Qué pasa después: `new URL()` falla sobre ese valor, o `undici` no puede convertir
el string a una ByteString para un header HTTP, y la ruta `/api` entera devuelve
un **500 con el cuerpo vacío**. Sin stack, sin mensaje, sin nada.

**Cómo evitarlo al cargar:**

1. Escribí los valores cortos a mano. `false`, `https://acequia.app`,
   `.acequia.app`, `app.acequia.app` — son cuatro caracteres o veinte, tipearlos
   tarda menos que diagnosticar el bug.
2. Los valores largos (claves, sales) copialos con el botón *Copy* de la propia
   consola de Supabase, no seleccionando el texto con el mouse. El botón copia el
   valor limpio.
3. Si tenés que pasar por un intermediario, que sea el Bloc de notas en texto
   plano. Nunca arrastres desde Word, desde un PDF ni desde un mensaje con
   formato.
4. No pongas comillas alrededor de ningún valor. Vercel no las necesita y quedan
   dentro del valor.
5. No dejes espacios al principio ni al final. Un espacio final en una URL la
   invalida igual que un BOM.

**Cómo se detecta ahora:** el preflight endurecido compara el valor crudo contra
el valor saneado y, si difieren, **denuncia la variable por nombre**:

```
ERROR: Estas variables traen caracteres invisibles, comillas o espacios de más:
NEXT_PUBLIC_SITE_URL. Borralas en Vercel y tipealas a mano en vez de pegarlas.
```

Además el código del landing pasa toda variable por `clean()` (en `lib/env.ts`) y
la app `terreno` por `limpiarEnv()` (en `lib/http.ts`), así que el daño está
acotado. Pero el saneo en runtime es una red, no una excusa: si el preflight te
nombra una variable, borrala en Vercel y volvé a tipearla.

---

## 7. Verificación — qué corrés y qué tiene que imprimir

El preflight **no sirve corrido en seco**. Todas sus reglas son condicionales:
con el entorno vacío no encuentra nada que revisar. Por eso ahora tiene un freno
duro que corta antes de evaluar nada si no encontró ninguna variable conocida.

### 7.1 — Preparación, una sola vez

```bash
npm i -g vercel
cd "C:\Users\Usuario\Documents\ChatGPT\terreno\acequia-landing-piloto"
vercel login
vercel link
```

`vercel login` abre el navegador. `vercel link` te pregunta a qué proyecto
corresponde la carpeta: elegí `acequia-landing-piloto`.

### 7.2 — Verificar Preview (después de la tabla 2)

```bash
cd "C:\Users\Usuario\Documents\ChatGPT\terreno\acequia-landing-piloto"
vercel env pull .env.local --environment=preview
npm run preflight
```

Salida correcta, exactamente dos líneas:

```
Acequia preflight (local/preview) — 17 variables leídas
OK: no se detectaron combinaciones inseguras o incompletas.
```

El número puede ser 17 o 19 según si cargaste las dos opcionales del punto 2.5.
Lo que **no** puede pasar es que diga menos de 17: ahí falta alguna.

### 7.3 — Verificar Production (después de la tabla 3)

```bash
vercel env pull .env.local --environment=production
npm run preflight -- --production
```

Salida correcta:

```
Acequia preflight (producción) — 18 variables leídas
ADVERTENCIA: La indexación sigue apagada. Es correcto para el piloto; activala recién en el lanzamiento público.
OK: no se detectaron combinaciones inseguras o incompletas.
```

Son 18 porque en producción se suma `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN`. La
advertencia de indexación es **esperada y correcta**: una advertencia no hace
fallar el preflight, sólo un `ERROR:` lo hace. Si activaste el indexado, esa
línea desaparece.

**Si aparece cualquier línea que empiece con `ERROR:`, no publiques.** El
preflight sale con código 1 y el texto del error dice qué variable y por qué.

### 7.4 — Lo que hay que hacer después de cargar, y siempre se olvida

**Las variables no se aplican a un build que ya existe.** Después de cargarlas:
Deployments → el último deployment → los tres puntos → **Redeploy**. Si no
redesplegás, el sitio sigue corriendo con el entorno viejo y vas a estar
depurando un build que no tiene ninguna de tus variables.

### 7.5 — Borrá el `.env.local` cuando termines

`vercel env pull` deja en tu disco un archivo con la `service_role` key en claro.
Está en `.gitignore`, así que no se va a commitear, pero no tiene por qué
quedarse ahí:

```bash
del "C:\Users\Usuario\Documents\ChatGPT\terreno\acequia-landing-piloto\.env.local"
```

Cuando necesites correr el preflight de nuevo, lo volvés a bajar en dos segundos.

---

## 8. Errores del preflight, traducidos

| Lo que imprime | Qué hacer |
| --- | --- |
| `ENTORNO VACÍO` | no corriste el `env pull`, o `vercel link` apuntó a otro proyecto. El resultado no dice nada sobre tu configuración |
| `Faltan variables base: …` | falta alguna de las cuatro obligatorias: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `Interruptores sin declarar: …` | esos interruptores no existen en Vercel. Tienen que existir aunque estén en `false` |
| `Interruptores con un valor que no es true ni false` | escribiste `False`, `0`, `off` o dejaste el campo vacío |
| `Estas variables traen caracteres invisibles…` | el bug del BOM. Borrá esa variable en Vercel y tipeala a mano |
| `… debe contener sólo el origen, sin rutas ni parámetros` | sacale la barra final o la ruta a esa URL |
| `… debe ser https://acequia.app para producción` | en Production `NEXT_PUBLIC_SITE_URL` tiene que ser ese origen exacto |
| `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN no va en Preview` | borrala del entorno Preview. Ver 2.4 |
| `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN debe ser .acequia.app en producción` | falta el punto inicial, o la variable no está cargada en Production |
| `PILOT_IP_HASH_SALT y ANALYTICS_HASH_SALT deben ser distintas` | corriste el comando una sola vez y pegaste la misma línea en las dos |
| `… debe tener al menos 32 caracteres aleatorios` | la sal quedó cortada al copiar |

---

## 9. Checklist de la sesión de hoy

- [ ] Confirmar la URL del proyecto de Supabase (punto 0)
- [ ] Cargar las 8 variables con valor en `acequia-landing-piloto` → **sólo Preview**
- [ ] Cargar los 9 interruptores en `false` → **sólo Preview**
- [ ] Confirmar que `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` **no** existe en Preview
- [ ] Cargar los 4 interruptores/URL del proyecto `terreno` (tabla 4), en `false`
- [ ] Redeploy de la preview del landing
- [ ] `vercel env pull .env.local --environment=preview` + `npm run preflight`
- [ ] Leer la salida: tiene que decir `OK:` y ninguna línea `ERROR:`
- [ ] Borrar el `.env.local`
- [ ] Seguir con el paso 4 del runbook (Google + Supabase Auth)
