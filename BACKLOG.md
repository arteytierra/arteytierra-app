# Backlog

Lo que está pendiente, agrupado por quién lo hace. Vive acá y no en la memoria
de un agente, porque la memoria de un agente no viaja a los otros.

**Cómo se usa:** cuando termines algo, borralo de acá en el mismo commit del
arreglo. Cuando encuentres algo nuevo que no vas a hacer ahora, agregalo con una
línea que diga *qué se rompe si no se hace*, no sólo qué hay que tocar. Si un
ítem no es tuyo, no lo hagas: avisá.

Última revisión: 12/09/2026 (bloque de cobro y hemisferio).

---

## Urgente — promesas que el producto no cumple

- [ ] **La landing promete 50 proyectos en Estudio; el tope real es 10.**
  `lib/plans.ts` de `acequia-landing`. El tope lo aplica el trigger de la base
  desde la 0057. Quien pague USD 35 va a ver rechazado el proyecto 11. → *web*
- [ ] **La landing manda `plan=disenador` al checkout.** Renombrado a
  `profesional` el 11/09; hoy anda sólo por el alias de compatibilidad en
  `resolveAcequiaPaidPlan()`. Si alguien limpia el alias, se rompen todos los
  checkouts de Profesional que salgan de la landing. → *web*
- [ ] **Los 5 asientos del plan Estudio no existen.** El número está declarado y
  la vidriera lo dice, pero la base no tiene noción de equipo: no hay forma de
  que un titular invite a cuatro personas. Hoy se resuelve creando cinco
  suscripciones a mano. **Es una feature** (tabla de equipos, invitaciones,
  titular de facturación), no un ajuste. Decidir antes de vender Estudio en la
  campaña. → *app + Jonatan*

---

## Agente de la app (`apps/terreno` + base + `packages/`)

### Cobro y planes
- [ ] La cuenta Estudio activa tiene exactamente 10 proyectos: está en el tope,
  la próxima creación se le rechaza. Confirmar si es la de Jonatan.
- [ ] **Decidir si el cobro sigue abierto al público.** `ACEQUIA_PAYMENTS_ENABLED`
  y `PAYMENT_WEBHOOKS_ENABLED` están en `true` en producción y
  `ACEQUIA_PAYMENTS_TEST_EMAILS` no está cargada, así que cualquiera que se
  registre puede pagar. Con la lista cargada, sólo esos correos pagan y el
  resto recibe la misma respuesta que si estuviera apagado. → *Jonatan*
- [ ] Los coeficientes de escurrimiento (`TIPOS_SUPERFICIE`) y los consumos de
  referencia (`CONSUMO_REFS`) de `lib/captacion.ts` no tienen fuente trazada.
  Con ellos se dimensiona un tanque. Están dentro de los rangos habituales y el
  encabezado del módulo lo dice, pero el informe los publica como propios. → *app*
- [ ] La lista de `incluye` de cada plan en `apps/web/lib/terreno/planes.ts` no
  se puede comparar con un test contra `apps/terreno/lib/entitlements.ts`, que es
  lo que la app habilita: viven en apps distintas. La vidriera anunciaba la
  exportación GIS como ventaja de Profesional cuando Personal ya la tenía, y no
  hubo test que lo agarrara. Mover la matriz de features a `packages/config`. → *app*

### Deuda estructural
- [ ] Partir `MapaTerrenoApp.tsx`: ~4.000 líneas, cierra sobre 393
  identificadores, el JSX no sale de forma mecánica. Leer
  `apps/terreno/PLAN-fase1-modularizacion.md` antes de tocar.
- [ ] Reducers para `useReliefShader` y para el cluster de dibujo libre.
- [ ] El camino de autocierre ignora `elementoPoli` y `espejoPendiente`.
- [ ] Calibrar el Master Plan v2 contra predios reales medidos.

### Datos y fuentes
- [ ] **Verificar licencias antes de escribir código** (Bloque 4): CHELSA V2.1 e
  INEGI CEM 15 m. Si no se pueden usar comercialmente, el código no se escribe.
- [ ] Bloque 5: `enumerar-cobertura-resolve.mjs`.
- [ ] Auditoría de fuentes de América.
- [ ] Fichas pendientes: Australasia, África tropical, Asia paleártica.
- [ ] Indomalaya volcánica.
- [ ] Los 26 saberes europeos con `fuentes: []` necesitan fuente por saber.
- [x] ~~Polígono holandés: licencia NGR, PDOK Atom, `GEOMETRIAS_SABERES` CC-BY.~~
  Resuelto el 12/09 y no por donde se esperaba: la ficha del Nationaal
  Georegister declara **CC BY-NC-ND 4.0**, que prohíbe cobrar y prohíbe derivar.
  El saber se activó por OpenStreetMap bajo ODbL. La licencia que vale es la del
  conjunto concreto, no la del portal que lo publica.
- [ ] Uruguay: MGAP / CONEAT.
- [ ] SoilGrids: chequear la arcilla resuelta por profundidad.
- [ ] Carta de licencia a BGR.
- [ ] Claves AEMET y Météo-France: parqueadas, sin decisión.

---

## Agente de las webs (`apps/web` + `acequia-landing`)

- [ ] Los dos ítems urgentes de la landing (arriba).
- [ ] Revisar la lista de `features` de cada plan en la landing contra
  `apps/terreno/lib/entitlements.ts`, que es lo que la app realmente habilita.
  La vidriera de `apps/web` ya tenía uno: anunciaba la exportación GIS como
  ventaja de Profesional y `export.gis` está en `personal` desde siempre.
- [ ] Proponer cómo atar los números de la landing al monorepo. Hoy es una copia
  a mano en otro repo y ya se desincronizó tres veces. Ver la skill
  `fuente-unica-de-verdad`.
- [ ] Migración de acequia.app: pasos 6 a 9.
- [ ] Cloudflare bloquea a ClaudeBot por su cuenta, con el proxy en ON. Se
  arregla en el panel de Cloudflare. Afecta el posicionamiento AEO.
- [ ] Fase 2 de la animación de la landing: **bloqueada**, espera filmación de
  drone.
- [ ] Verificar la cobertura de rate limiting: hay en 8 rutas
  (`fccd11a`, `34446fd`), falta confirmar que no quedó ninguna ruta pública
  sin tope ni tamaño máximo de cuerpo.

---

## Jonatan — nadie más puede hacer esto

- [ ] **Confirmar las URL de webhook** en los paneles de Mercado Pago y PayPal.
  Los webhooks están habilitados y verifican firma, pero si el panel apunta a
  otra URL el cobro entra y el plan no se asigna. El SDK de MP no acepta
  `notification_url` en el preapproval: sale de la configuración de la
  aplicación, y tiene que ser `https://arteytierra.org/api/webhooks/mercadopago`.
- [ ] Una transacción real controlada: alta, primer cobro, cancelación durante la
  prueba y cambio de plan.
- [x] ~~Crear los planes en Mercado Pago y en PayPal.~~ PayPal no los necesita a
  mano: `lib/terreno/paypal.ts` crea producto y plan por API en el primer uso y
  los cachea en `terreno.paypal_planes`.
- [x] ~~Setear las variables de entorno que falten en Vercel.~~ Las del cobro
  están las cuatro y son legibles: `ACEQUIA_PAYMENTS_ENABLED`,
  `PAYMENT_WEBHOOKS_ENABLED`, `ACEQUIA_TRIAL_ENABLED` y `ACEQUIA_ARS_PER_USD`.
  Falta decidir `ACEQUIA_PAYMENTS_TEST_EMAILS` (arriba).
- [ ] La suscripción `personal/activa` venció el 01/09 y la fila sigue diciendo
  activa. El código la degrada a Semilla bien, pero esa persona no tiene el plan
  que su fila dice. Son datos de un cliente: la decisión es tuya.
- [ ] Validar `/mapa` y `/informe/*` en producción (están detrás de login y
  ningún agente puede verlas).
- [ ] **Prender la protección de contraseñas filtradas** en Supabase:
  Authentication → Policies. Es un clic y no hay herramienta MCP que lo haga.
- [x] ~~Subir la rama de anteproyectos, que existía sólo en este disco.~~
  Respaldada el 12/09 como `backup/anteproyectos-a4` (13 commits). La rama
  local sigue siendo `claude/agente-anteproyectos-arquitectonicos-34f532`.
- [ ] Conectores: autorizar GitHub, reconectar Zoom, y desinstalar los bundles
  de plugin duplicados (`/plugin manage` en una terminal `claude`
  interactiva). Ver la memoria `reference_conectores_estado`.

---

## No tocar — está así a propósito

Cosas que un advisor o un linter va a marcar y que **no** son errores. Si te las
encontrás, no las "arregles" sin hablarlo.

- **Las tres extensiones en el esquema `public`** (`pg_trgm`, `unaccent`,
  `citext`). `citext` respalda el tipo de la columna `app.contacts.email`:
  moverlas de esquema arriesga referencias de tipo de columna, por un lint
  cosmético.
- **Tres wrappers `IMMUTABLE` ejecutables por `PUBLIC`**
  (`immutable_unaccent` ×2, `immutable_array_to_string`). Alimentan expresiones
  de índice de la búsqueda, no leen datos, y cerrarlas puede romper los índices.
- **`app.is_staff()` y `app.is_admin()` con `EXECUTE` para `anon`.** Las evalúan
  las políticas RLS de `cms.*` con el rol del visitante. Sin ese permiso la
  política no devuelve falso: revienta, y el sitio público deja de mostrar
  contenido. Ya pasó una vez.
- **El alias `disenador` → `profesional`** en `resolveAcequiaPaidPlan()`. Es la
  red que sostiene los links viejos y los pagos ya cobrados con el nombre
  anterior. No se borra hasta que ningún cliente lo mande — y hoy la landing
  todavía lo manda.

## Sin dueño asignado

- [ ] `apps/chatbot` no está rastreado en git. Lo maneja otro agente; falta
  decidir si entra al monorepo o vive aparte.
- [ ] El commit `b5f85ed` tiene el asunto malformado (`@`), por una here-string
  de PowerShell escrita dentro de Bash. Arreglarlo requiere `amend` y
  `force-push`: **no se hace sin autorización explícita de Jonatan.**
