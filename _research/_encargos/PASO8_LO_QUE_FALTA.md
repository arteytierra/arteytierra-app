# Paso 8 — dejar pagos y suscripciones funcionando

Actualizado el 08/09/2026. Reemplaza las versiones anteriores.

**La decisión que ordena todo:** el sistema queda **abierto**, para que vos o
cualquier otra persona pueda contratar y pagar de verdad. No es el lanzamiento
—no hay campaña, ni marca aprobada, ni revisión legal— pero el circuito de cobro
queda operativo y probado.

La base de datos ya está lista. **No queda ninguna migración pendiente.**

---

## Lo que ya no hay que hacer

Tres cosas que estaban en la lista y salieron:

- **Mercado Pago no necesita ninguna variable nueva.** La suscripción de Acequia
  reusa el mismo `MP_ACCESS_TOKEN` y el mismo webhook que ya cobra en la tienda.
  Ya está en producción y funcionando.
- **El cron no se configura en el panel.** Va declarado en `apps/web/vercel.json`.
  No aparecía en la pestaña Cron Jobs porque ese archivo todavía no había llegado
  a `main`; con el deploy aparece solo.
- **La oferta del "50% de por vida" ya no existe** en el código. Se había quitado
  antes. Quedan las dos que querías: piloto fundador y prueba comercial de 3 días.

---

## 1 · El piloto (independiente de todo lo demás)

Pegá **`PILOTO_CODIGO_ACCESO.sql`** en el editor SQL de Supabase.

Crea `FUNDADOR26`: plan Personal, 7 días, hasta 10 personas. A cada anotado le
mandás este link:

```
https://terreno.arteytierra.org/canjear?codigo=FUNDADOR26
```

Entra sin tarjeta y sin pasar por el checkout. **Este camino no depende de nada
de lo que sigue** — ni de los pagos, ni de PayPal, ni de la revisión legal.

El reloj de los 7 días arranca cuando la persona canjea, no cuando creás el
código. Mandá el link cerca del encuentro inicial para que la semana rinda entera.

Y revisá en Vercel, proyecto `acequia-landing-piloto`, que
`NEXT_PUBLIC_PILOT_APPLICATIONS_ENABLED` esté en `true` si querés que se sigan
anotando personas nuevas. No afecta a las ya anotadas.

---

## 2 · Deploy

Sin esto no anda nada de lo que sigue: el código está commiteado pero todavía no
llegó a producción. Ya dejé la rama armada, mergeada y verificada.

Esto deploya `arteytierra.org`. Los pagos siguen apagados hasta que cargues las
variables del punto 3, así que es un deploy seguro.

---

## 3 · Variables en Vercel · proyecto `arteytierra-app-web`

Settings → Environment Variables → Add New, en **Production, Preview y
Development**.

| Variable | Valor |
| --- | --- |
| `ACEQUIA_PAYMENTS_ENABLED` | `true` |
| `PAYMENT_WEBHOOKS_ENABLED` | `true` |
| `ACEQUIA_ARS_PER_USD` | la cotización del dólar, un número (ej. `1450`) |
| `NEXT_PUBLIC_ACEQUIA_SITE_URL` | `https://acequia.app` |
| `CRON_SECRET` | una cadena larga al azar que inventes vos |

**No cargues `ACEQUIA_PAYMENTS_TEST_EMAILS`.** Esa variable existe en el código
para poder cerrar el checkout a una lista de correos. Dejándola sin cargar, el
sistema queda abierto a todos, que es lo que querés. Queda disponible por si
alguna vez necesitás cerrarlo de nuevo sin tocar código.

Sobre `ACEQUIA_ARS_PER_USD`: no tiene valor por defecto a propósito — si falta,
el checkout de Mercado Pago falla con un error claro en vez de cobrar con una
cotización vieja escondida. La escribís a mano y no se actualiza sola. Cambiarla
**no** modifica lo que ya se le cobra a quien está suscrito: Mercado Pago congela
el importe en pesos al momento del alta.

---

## 4 · PayPal en vivo

Es lo único que falta crear desde cero. Los pasos están en
**`PASO8_PAYPAL_SANDBOX.md`**, con una diferencia: hacés todo en la pestaña
**Live**, no en Sandbox.

En `https://developer.paypal.com/dashboard/`, con la cuenta **Business** de Arte
y Tierra:

1. **Apps & Credentials → pestaña Live → Create App.** Nombre: `Acequia`.
   Dejá tildado **Subscriptions** en Features.
2. Copiá el **Client ID** y el **Secret**.
3. **Add Webhook**, con esta URL exacta:
   `https://arteytierra.org/api/webhooks/paypal`
   (no la URL larga `...vercel.app`: esa cambia en cada deploy y la webhook
   quedaría muerta).
4. Marcá exactamente estos cinco eventos:
   - `Billing subscription activated`
   - `Billing subscription cancelled`
   - `Billing subscription expired`
   - `Billing subscription suspended`
   - `Payment sale completed`
5. Copiá el **Webhook ID** que se genera.

Y cargá en Vercel, mismo proyecto y mismos tres entornos:

| Variable | Valor |
| --- | --- |
| `PAYPAL_ENV` | el texto literal `live` |
| `PAYPAL_CLIENT_ID` | del punto 2 |
| `PAYPAL_CLIENT_SECRET` | del punto 2 |
| `PAYPAL_WEBHOOK_ID` | del punto 5 |

**Tipealas a mano, no las pegues.** Un carácter invisible copiado del panel de
PayPal rompe la autenticación sin dar un error claro.

**No hay que crear ningún plan a mano.** El código crea el producto y los planes
solo, la primera vez que alguien contrata, con los precios del catálogo
(`packages/config/src/acequia.ts`). Los guarda en `terreno.paypal_planes` con el
entorno adentro de la clave, así que un plan de sandbox nunca se confunde con uno
real.

---

## 5 · Mercado Pago: una sola cosa que revisar

Las credenciales ya están. Lo único a verificar es que la notificación
configurada en tu cuenta de Mercado Pago incluya los eventos de suscripción,
porque hasta ahora sólo cobraba pagos sueltos de la tienda.

En `mercadopago.com.ar` → **Tus integraciones → tu aplicación → Webhooks**, la
URL `https://arteytierra.org/api/webhooks/mercadopago` tiene que tener marcados,
además de lo que ya tenga:

- `subscription_preapproval`
- `subscription_authorized_payment`

Si sólo figura `payment`, las altas de suscripción no van a llegar nunca y la
persona pagaría sin que se le active el plan.

---

## 6 · Prender la prueba de 3 días · proyecto `terreno`

| Variable | Valor |
| --- | --- |
| `ACEQUIA_TRIAL_ENABLED` | `true` |

Vive en otro proyecto de Vercel que el resto. Con esto, el alta arranca con 3
días de prueba y el primer cobro cae al cuarto día.

**Para tu primera prueba conviene ponerlo en `false`**: así el cobro entra al
instante y ves la plata. Después lo prendés y comprobás que la prueba no cobre.

---

## 7 · Mostrar los botones en la landing · proyecto `acequia-landing-piloto`

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | `true` |

Este es el último y el que hace visible el checkout desde `acequia.app`. Hasta
que no lo prendas, los botones de pago aparecen deshabilitados con un cartel de
"los cobros siguen desactivados".

**Ojo con el orden:** `arteytierra.org/acequia` enlaza al checkout sin
interruptor propio, así que desde el punto 3 ya se puede contratar por ese
camino. Este punto sólo agrega el camino desde la landing nueva.

---

## 8 · La prueba de cobro

Con todo lo anterior:

1. Entrás con tu usuario a
   `https://terreno.arteytierra.org/suscribir?plan=personal&periodo=mensual`
2. Pagás por **Mercado Pago**. Avisame y miro en la base que la fila quede
   `activa`, con el `provider_ref` correcto y sin eventos duplicados.
3. Repetís por **PayPal**.
4. Te das de baja vos mismo desde "Mi cuenta" y comprobamos que la baja también
   se haga en el proveedor, no sólo en nuestra base.

Después de eso el sistema queda operativo para cualquiera.

---

## Lo que queda pendiente y no bloquea nada de esto

- **La revisión legal.** `REVISION_LEGAL_ACEQUIA.md` tiene los Términos y la
  Privacidad escritos y listos; falta que los mire alguien con responsabilidad
  legal, y después se copian a `app/terminos/page.tsx` y `app/privacidad/page.tsx`
  de la landing. Hacelo antes de la campaña de lanzamiento.
- **La aprobación de la marca.**
- **Los 3 días de la prueba comercial** están definidos en un solo lugar
  (`ACEQUIA_TRIAL_DAYS` en `packages/config/src/acequia.ts`). Si los cambiás,
  cambian a la vez en la app, en los correos y en el plan de PayPal.
