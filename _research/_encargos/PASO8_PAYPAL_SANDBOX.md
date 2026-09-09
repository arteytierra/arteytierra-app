# Paso 8 — PayPal en sandbox, tu parte

Tu objetivo en este archivo: dejar creada la **app de sandbox de PayPal**, su
**webhook**, y las **cuatro variables** cargadas en Vercel. Nada de esto cobra
plata: sandbox es un PayPal de juguete con dinero falso.

## Lo que NO tenés que hacer

**No hay que crear los 6 planes a mano.** Me equivoqué antes con eso. El código
(`apps/web/lib/terreno/paypal.ts`) crea el Product y cada Plan solo, la primera
vez que alguien contrata ese plan, y guarda la referencia en la tabla
`terreno.paypal_planes`. Vos solo cargás las credenciales; los planes se arman
solos con los precios que ya están congelados en `packages/config/src/acequia.ts`
(Personal 7/70, Profesional 12/120, Estudio 35/350 USD).

## Antes de empezar

- Necesitás una cuenta **PayPal Business** de Arte y Tierra. Si es Personal,
  primero hay que convertirla a Business en paypal.com; sin eso la API de
  Suscripciones no funciona.
- El proyecto de Vercel en juego es **`arteytierra-app-web`** y su dominio de
  producción es **`arteytierra.org`**. Nada más que anotar: la webhook usa ese
  dominio fijo (ver punto 4).

---

## 1. Entrar al panel de desarrolladores

1. Andá a **https://developer.paypal.com/dashboard/** e iniciá sesión con la
   cuenta Business de Arte y Tierra.
2. Arriba a la derecha, asegurate de estar en **Sandbox** (no en "Live").

## 2. Mirar las cuentas de prueba

1. Menú **Testing Tools → Sandbox Accounts**.
2. Vas a ver al menos dos cuentas creadas solas:
   - una tipo **Business** (termina en `@business.example.com`) → es el
     "comercio", el que recibe los pagos de prueba;
   - una tipo **Personal** (`@personal.example.com`) → es el "comprador" de
     prueba, ya trae saldo y una tarjeta falsa.
3. Si no hay una Personal, tocá **Create account → Personal → con saldo**.
   Anotá su correo y su contraseña (el botón "..." → *View/Edit* la muestra):
   con esa cuenta vas a pagar en las pruebas.

## 3. Crear la app de sandbox

1. Menú **Apps & Credentials**, pestaña **Sandbox**.
2. **Create App**. Nombre: `Acequia sandbox`. Cuenta asociada: la **Business**
   de sandbox del punto anterior. **Create App**.
3. En la página de la app quedan a la vista:
   - **Client ID**
   - **Secret** (tocá *Show* para verlo)
4. Bajá hasta **Features** y dejá tildado **Subscriptions**. Guardá si te lo pide.

## 4. Crear el webhook

El proyecto de Vercel es **`arteytierra-app-web`** (el que estabas mirando). PayPal
solo lo usa Acequia para las suscripciones — la tienda no toca PayPal —, así que
**no hay ninguna credencial PayPal *live* en producción que se pueda romper**. Por
eso, y para no pelear con las URLs de preview que cambian en cada deploy, la
webhook va directo al dominio fijo de producción.

En la página de la app, sección **Sandbox Webhooks** (o **Add Webhook**):

1. **Webhook URL:**
   `https://arteytierra.org/api/webhooks/paypal`

   (NO uses la URL larga tipo `arteytierra-app-feurf1d72-...vercel.app` que se ve
   en el Overview: esa cambia en cada deploy y la webhook quedaría muerta.)
2. **Event types** — marcá exactamente estos cinco:
   - `Billing subscription activated`
   - `Billing subscription cancelled`
   - `Billing subscription expired`
   - `Billing subscription suspended`
   - `Payment sale completed`
3. **Save**.
4. Se genera un **Webhook ID** (una cadena tipo `5GP...`). Copialo.

## 5. Cargar las variables en Vercel

Proyecto **`arteytierra-app-web`** → **Settings → Environment Variables** →
**Add New**. Marcá los tres entornos (**Production, Preview y Development**), así
la webhook de producción y cualquier preview leen lo mismo.

| Variable | Qué valor le das | De dónde lo sacás |
| --- | --- | --- |
| `PAYPAL_ENV` | el texto literal `sandbox` (en minúscula, sin comillas) | lo escribís vos. En el corte final pasa a `live` |
| `PAYPAL_CLIENT_ID` | la cadena larga que arranca con `A...` | developer.paypal.com → Apps & Credentials → pestaña **Sandbox** → app `Acequia sandbox` → campo **Client ID**, botón de copiar |
| `PAYPAL_CLIENT_SECRET` | la cadena que arranca con `E...` | misma página de la app → **Secret** → botón *Show* o el ícono de copiar |
| `PAYPAL_WEBHOOK_ID` | la cadena tipo `5GP80273...` | misma página de la app, sección **Webhooks**, al lado de la URL que creaste en el punto 4 |

**Tipealas a mano, no las pegues.** Un carácter invisible pegado desde el panel
de PayPal rompe la autenticación sin dar un error claro. Después: **Deployments →
en el último de `main` → botón "..." → Redeploy**, porque las variables no entran
a un build que ya existe.

### ¿Por qué en Production y no solo en Preview, como dice el manual?

El manual pide "sandbox solo en Preview" para no ensuciar producción. Acá se puede
relajar sin riesgo porque:

- PayPal en este repo lo usa **únicamente** Acequia; la tienda cobra con Mercado
  Pago y Stripe. No hay credenciales PayPal *live* que pisar.
- Los pagos siguen **invisibles** (`NEXT_PUBLIC_PAYMENTS_ENABLED=false`): ningún
  usuario puede iniciar una suscripción real.
- La webhook solo reacciona a los eventos que **vos** dispares a mano desde el
  simulador de PayPal con tu cuenta de prueba.

Único efecto posible: que un evento de prueba escriba una fila en
`terreno.suscripciones` para tu usuario de test. Se borra después, o se hace esto
recién con la migración `0051` ya aplicada (paso 8.2), que es el orden correcto.

En el corte final (paso 8.6) estas cuatro variables se reemplazan por las *live*
y la webhook de PayPal *live* apunta al mismo `https://arteytierra.org/api/webhooks/paypal`.

## 6. Avisame

Cuando tengas los cuatro cargados y el redeploy hecho, decímelo. Ahí yo:

- reviso que `terreno.paypal_planes` y las tablas de `0051` estén en la base;
- escribo el código de idempotencia + cancelación en prueba + correos, en una
  rama sin mergear;
- te paso el guion de las pruebas de sandbox del paso 8.4 (alta con prueba de 3
  días, primer cobro, rechazo, cancelación durante la prueba, cambio de plan).

---

## Recordá el orden del paso 8 (del manual)

1. Punto de reversión del paso 1 + guardar definición vieja de la función.
2. Aplicar `0051_acequia_commercial_trial.sql` + verificar bloques 5, 6 y 7.
3. **(este archivo)** Sandbox de PayPal. Mercado Pago no necesita planes.
4. Probar el circuito completo en sandbox.
5. CORS de `app.acequia.app` en el checkout — **ya está hecho** en el código.
6. Encender `PAYMENT_WEBHOOKS_ENABLED`, después `NEXT_PUBLIC_PAYMENTS_ENABLED`,
   y último `ACEQUIA_TRIAL_ENABLED`. De a uno.
7. Una operación real con tu tarjeta antes de abrirlo.

Los pagos siguen invisibles y sin cobrar hasta el punto 6, que es tuyo y va
después de que los textos legales tengan el "ok".
