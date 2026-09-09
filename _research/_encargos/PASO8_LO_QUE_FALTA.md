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

**Por qué no te aparecía nada en Cron Jobs:** el archivo que lo declara estaba
commiteado en una rama, no en `main`. Vercel lee esa configuración del deploy de
producción, así que mientras no llegue a `main` la pestaña está vacía — no había
nada roto. Con el push a `main` aparece solo.

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

## 3 bis. El cobro real sin esperar la revisión legal

Vos preferís saltar directo a pagar de verdad vos mismo. Se puede, pero había un
problema que encontré al revisarlo: **la sección de planes de
`arteytierra.org/acequia` enlaza al checkout sin ningún interruptor propio.**
Prender `ACEQUIA_PAYMENTS_ENABLED` en Production alcanzaba para que cualquiera
que se registre pueda contratar de verdad — sin Términos aprobados. Eso es lo que
obligaba a esperar la revisión legal.

Lo resolví con una variable nueva: **`ACEQUIA_PAYMENTS_TEST_EMAILS`**. Cargándola
con tu correo, sólo vos podés pagar; a cualquier otra persona el checkout le
responde igual que si los pagos estuvieran apagados. El día que abras, borrás la
variable y queda abierto para todos.

Entonces, para la prueba real:

| Variable | Proyecto | Valor |
| --- | --- | --- |
| `ACEQUIA_PAYMENTS_TEST_EMAILS` | `arteytierra-app-web` | tu correo |
| `ACEQUIA_PAYMENTS_ENABLED` | `arteytierra-app-web` | `true` |
| `PAYMENT_WEBHOOKS_ENABLED` | `arteytierra-app-web` | `true` |
| `PAYPAL_*` (las cuatro) | `arteytierra-app-web` | las **live**, y webhook live al mismo `https://arteytierra.org/api/webhooks/paypal` |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | `acequia-landing-piloto` | **dejalo en `false`** |
| `ACEQUIA_TRIAL_ENABLED` | `terreno` | ver abajo |

Sobre `ACEQUIA_TRIAL_ENABLED`: en `true` el alta arranca con 3 días de prueba y
**no te cobra hasta el cuarto día**. Si lo que querés es ver la plata hoy,
ponelo en `false`, hacé el cobro, y después prendelo. Yo haría las dos: primero
en `false` para ver el cobro entrar, después en `true` para ver que la prueba
tampoco cobre.

Después: entrás con tu usuario a
`https://terreno.arteytierra.org/suscribir?plan=personal&periodo=mensual`,
pagás una vez por Mercado Pago y otra por PayPal, y te das de baja vos mismo.

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

## Las ofertas: quedaron dos, como pediste

Lo del "50% de por vida" **ya no está publicado en ningún lado**. Lo busqué en
`apps/web`, en el landing y en el catálogo de planes: no aparece. Se había quitado
en el commit `3d42520`, cuando los planes pasaron a tener un solo nombre. Mi aviso
anterior apuntaba a una versión vieja del archivo — no había nada que borrar.

Quedan las dos que querías: **piloto fundador** (7 días, sin tarjeta) y **prueba
comercial** (3 días, con tarjeta).
