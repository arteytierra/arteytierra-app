# Backlog

Lo que está pendiente, agrupado por quién lo hace. Vive acá y no en la memoria
de un agente, porque la memoria de un agente no viaja a los otros.

**Cómo se usa:** cuando termines algo, borralo de acá en el mismo commit del
arreglo. Cuando encuentres algo nuevo que no vas a hacer ahora, agregalo con una
línea que diga *qué se rompe si no se hace*, no sólo qué hay que tocar. Si un
ítem no es tuyo, no lo hagas: avisá.

Última revisión: 12/09/2026.

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
- [ ] `ACEQUIA_PAYMENTS_ENABLED` está definida en el proyecto
  `arteytierra-app-web` pero marcada como sensible: la CLI no lee el valor.
  Marcar como sensible una bandera booleana es una mala configuración.

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
- [ ] Polígono holandés: licencia NGR, PDOK Atom, `GEOMETRIAS_SABERES` CC-BY.
- [ ] Uruguay: MGAP / CONEAT.
- [ ] SoilGrids: chequear la arcilla resuelta por profundidad.
- [ ] Carta de licencia a BGR.
- [ ] Claves AEMET y Météo-France: parqueadas, sin decisión.

---

## Agente de las webs (`apps/web` + `acequia-landing`)

- [ ] Los dos ítems urgentes de la landing (arriba).
- [ ] Revisar la lista de `features` de cada plan en la landing contra
  `apps/terreno/lib/entitlements.ts`, que es lo que la app realmente habilita.
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

- [ ] Crear los planes en Mercado Pago y en PayPal.
- [ ] Correr el circuito de sandbox de punta a punta.
- [ ] Una transacción real controlada.
- [ ] Setear las variables de entorno que falten en Vercel.
- [ ] Validar `/mapa` y `/informe/*` en producción (están detrás de login y
  ningún agente puede verlas).
- [ ] Decidir si se sube a GitHub la rama
  `claude/agente-anteproyectos-arquitectonicos-34f532`: **13 commits de
  anteproyectos que hoy existen sólo en este disco.**
- [ ] Conectores: autorizar GitHub, reconectar Zoom, y desinstalar los bundles
  de plugin duplicados (`/plugin manage` en una terminal `claude`
  interactiva). Ver la memoria `reference_conectores_estado`.

---

## Sin dueño asignado

- [ ] `apps/chatbot` no está rastreado en git. Lo maneja otro agente; falta
  decidir si entra al monorepo o vive aparte.
- [ ] El commit `b5f85ed` tiene el asunto malformado (`@`), por una here-string
  de PowerShell escrita dentro de Bash. Arreglarlo requiere `amend` y
  `force-push`: **no se hace sin autorización explícita de Jonatan.**
