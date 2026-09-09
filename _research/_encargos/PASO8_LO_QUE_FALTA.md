# Paso 8 — todo lo que falta, en orden

Actualizado el 08/09/2026, después de que aplicaras el SQL.

La base ya está lista: `aviso_cobro_at` existe, el respaldo está hecho y las
7 filas siguen intactas. **La 0051 no hay que aplicarla: ya está aplicada.** Se
aplicó el 08/09 desde una copia vieja del archivo, y lo único que le faltaba —esa
columna— es justamente lo que acabás de agregar con la 0053. No queda ninguna
migración pendiente.

De acá en adelante son seis pasos. Los cuatro primeros no cobran plata a nadie.

---

## 1. Variables en Vercel · proyecto `arteytierra-app-web`

Settings → Environment Variables → Add New, en **Production, Preview y Development**.

| Variable | Valor | Para qué |
| --- | --- | --- |
| `ACEQUIA_PAYMENTS_ENABLED` | `false` **por ahora** | el interruptor que habilita cobrar. Se prende recién en el paso 6 |
| `ACEQUIA_ARS_PER_USD` | la cotización del dólar que quieras usar, un número, ej. `1450` | con cuánto se pasa el precio USD a pesos en Mercado Pago |
| `NEXT_PUBLIC_ACEQUIA_SITE_URL` | `https://acequia.app` | a dónde vuelve la persona después de pagar |
| `CRON_SECRET` | una cadena larga al azar que inventes vos | protege el aviso automático de cobro |

**`ACEQUIA_ARS_PER_USD` no tiene valor por defecto a propósito.** Si falta, el
checkout de Mercado Pago falla con un error claro. Es preferible eso a cobrar en
pesos con una cotización vieja escondida en el código.

Sobre esa cotización: la escribís vos a mano y no se actualiza sola. Cuando el
dólar se mueva, hay que cambiarla acá. **Ojo:** cambiarla no modifica lo que ya
se le cobra a quien está suscrito — Mercado Pago congela el importe en pesos al
momento del alta. Sólo afecta a las altas nuevas.

Después de cargarlas: **Deployments → el último de `main` → "..." → Redeploy.**
Las variables no entran a un build que ya existe.

---

## 2. El cron diario

**No hay que configurar nada en el panel de Vercel.** Ya dejé el archivo
`apps/web/vercel.json`, que le dice a Vercel que llame todos los días a las
13:00 UTC (10 de la mañana en Argentina) al aviso de "en un día se hace el primer
cobro". Se activa solo en el próximo deploy.

Vercel firma esa llamada con el `CRON_SECRET` que cargaste en el paso 1 — por eso
esa variable va antes que el deploy. Sin ella, el aviso responde 401 y no manda nada.

Para comprobar que quedó: Vercel → proyecto `arteytierra-app-web` → pestaña
**Cron Jobs**. Tiene que figurar `/api/cron/acequia-aviso-cobro`, una vez por día.

---

## 3. Sandbox de PayPal

Está todo escrito en `PASO8_PAYPAL_SANDBOX.md`, al lado de este archivo, y sigue
vigente palabra por palabra. En resumen: creás la app de sandbox, marcás los cinco
eventos, y cargás `PAYPAL_ENV=sandbox`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
y `PAYPAL_WEBHOOK_ID`.

Dos cosas que arreglé hoy y que hacen que esto sea seguro de hacer:

- **Los planes de sandbox ya no se confunden con los de producción.** El código
  guardaba el identificador de plan de PayPal sin anotar de qué entorno venía. Al
  pasar de sandbox a live habría reusado el plan de juguete contra la API real, y
  el alta habría fallado sin decir por qué. Ahora el entorno va dentro de la clave.
- **La prueba gratis lleva el precio cero escrito.** Antes el ciclo de prueba se
  creaba sin importe. Lo más probable es que PayPal lo tomara como gratis, pero
  "lo más probable" no alcanza cuando del otro lado hay una tarjeta.

---

## 4. Las pruebas en sandbox (paso 8.4)

Esto lo hacemos juntos: vos disparás desde el navegador, yo miro la base y los
registros. Para arrancar hace falta prender **sólo** `PAYMENT_WEBHOOKS_ENABLED=true`
y `ACEQUIA_PAYMENTS_ENABLED=true` en Preview — **no en Production** —, así nadie
que entre a la web se cruza con un checkout.

Los cinco casos, en este orden:

1. **Alta con prueba de 3 días.** Contratás Personal mensual con la cuenta
   Personal de sandbox. Tiene que quedar `estado='prueba'`, `trial_end` a 3 días,
   y llegarte el correo "Empezó tu prueba". **PayPal no debe cobrar nada.**
2. **Primer cobro.** Desde el simulador de webhooks de PayPal disparás un
   `PAYMENT.SALE.COMPLETED`. La fila pasa a `activa` y llega el correo "Cobro
   confirmado" — no el de renovación.
3. **Cobro rechazado.** Un `BILLING.SUBSCRIPTION.SUSPENDED`. La suscripción se
   corta y la persona vuelve a Semilla.
4. **Baja durante la prueba.** Desde "Mi cuenta" en la app, botón "Dar de baja".
   Tiene que cancelarse **en PayPal también** —no sólo en nuestra base— y el
   mensaje decir "no se te cobró nada".
5. **Evento repetido.** El mismo evento del caso 2, disparado dos veces. La
   segunda tiene que contestar `duplicate: true` y no tocar nada. Es la prueba de
   que un reintento de PayPal no cobra dos veces.

Y el mismo circuito con Mercado Pago, que no necesita sandbox aparte: usás las
tarjetas de prueba de MP.

**Avisame cuando tengas las variables cargadas y te paso los pasos exactos de cada
caso, con qué mirar en cada uno.** No lo escribo ahora porque la mitad depende de
cómo te queden numeradas las cuentas de sandbox.

---

## 5. La revisión legal

`REVISION_LEGAL_ACEQUIA.md` tiene los Términos y la Privacidad reescritos y
listos. Falta que los mire alguien con responsabilidad legal. Recién con ese "ok"
se copian a `app/terminos/page.tsx` y `app/privacidad/page.tsx` del landing.

**Esto bloquea el paso 6, no los anteriores.** Podés hacer sandbox mientras tanto.

---

## 6. El corte: cobrar de verdad

Último, y de a uno, comprobando entre cada uno:

1. `PAYMENT_WEBHOOKS_ENABLED=true` en Production.
2. Las cuatro variables de PayPal pasan de sandbox a **live**, y creás la webhook
   *live* apuntando al mismo `https://arteytierra.org/api/webhooks/paypal`.
3. `ACEQUIA_PAYMENTS_ENABLED=true` y `NEXT_PUBLIC_PAYMENTS_ENABLED=true`.
4. `ACEQUIA_TRIAL_ENABLED=true` en el proyecto `terreno`.
5. **Una operación real con tu propia tarjeta**, una por Mercado Pago y otra por
   PayPal, y después te das de baja vos mismo para ver que la baja funcione con
   plata de verdad de por medio.

---

## Una cosa que no es técnica y sigue abierta

Hoy hay **tres ofertas distintas al mismo público**: el piloto fundador de 7 días
sin tarjeta, la prueba comercial de 3 días con tarjeta, y "los primeros 50 con 50%
de por vida", que sigue publicada en `apps/web/app/acequia/page.tsx:576`.

No es un error de código —las tres funcionan— pero alguien que entra hoy no
entiende cuál le toca. Conviene resolverlo antes de empezar a comunicar, no
después. No lo toco sin que me digas cuál queda.
