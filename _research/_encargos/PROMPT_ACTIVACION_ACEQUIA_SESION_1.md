# Encargo — activación de acequia.app, sesión 1: Supabase + Google + vista previa

Para pegar al arrancar una sesión dedicada. Jonatan tiene que estar presente:
esta sesión toca credenciales y consolas externas, y el agente no las opera solo.

## Alcance de ESTA sesión

Sólo los bloques 1, 2 y 3 del plan de activación. **No** se tocan pagos, correo
transaccional, dominios definitivos ni indexación. El objetivo es terminar con
una vista previa privada funcionando contra Supabase, con Google andando, y
todos los interruptores de funciones todavía en `false`.

## Contexto que el agente necesita antes de empezar

- El monorepo es `C:\Arte y Tierra\0. Claude`. La app principal es
  `apps/terreno` (marca: **acequia**; carpeta, dominio y planes siguen
  diciendo terreno, es deliberado).
- El landing **no está en el monorepo**: vive en
  `C:\Users\Usuario\Documents\ChatGPT\terreno\acequia-landing-piloto`, con su
  propio plan en `AUDIT_Y_PLAN_MUDANZA_ACEQUIA.md` y su checklist en
  `CHECKLIST_PRE_LANZAMIENTO.md`.
- `terreno.arteytierra.org` sigue siendo producción y **no se toca** en esta
  sesión. La app principal auto-deploya al pushear a `main` (Vercel + GitHub).
- `/mapa` y `/informe/*` están detrás de sesión: el agente no puede verificarlos
  en un navegador sin login. Esas pruebas las hace Jonatan.

## Reglas duras

1. **Ninguna clave se escribe en un archivo del repo, ni en `_research/`, ni en
   un mensaje de commit, ni en una captura.** La `service_role` va únicamente en
   variables privadas de Vercel, cargada por Jonatan en la consola.
2. El agente **no crea cuentas, no acepta términos y no aprieta ningún botón
   irreversible** en Supabase, Google Cloud, Vercel ni GoDaddy. Prepara,
   explica y dicta; Jonatan ejecuta y confirma.
3. Antes de aplicar SQL: **backup del proyecto de Supabase**, hecho y
   verificado. Sin backup no se aplica nada.
4. Todo interruptor de función arranca y termina esta sesión en `false`, salvo
   los que el bloque 3 pida explícitamente.
5. Nada de esto se prueba primero en producción.

## Bloque 1 — Supabase

Confirmar que el proyecto es el mismo que usa la app principal (comparar el
`NEXT_PUBLIC_SUPABASE_URL` de `apps/terreno` en Vercel con la URL del proyecto
abierto). Hacer el backup. Después aplicar, **en este orden**:

1. `supabase/migrations/0049_acequia_public_forms.sql` *(monorepo)*
2. `supabase/migrations/0050_acequia_public_form_functions.sql` *(monorepo)*
3. `supabase/migrations/202609020001_pilot_feedback_metrics.sql` *(landing)*
4. `supabase/migrations/0051_acequia_commercial_trial.sql` *(monorepo)*
5. `supabase/migrations/0052_terreno_product_journey.sql` *(monorepo)*

> **Corrección al plan escrito.** El plan original pedía aplicar
> `202608290001_acequia_public_forms.sql` del landing. Ese archivo es el mismo
> contenido que `0049` + `0050` del monorepo, partido distinto y sin un índice
> (`acequia_account_requests_ip_hash_idx`) ni los comentarios de tabla. Los dos
> son idempotentes, así que aplicar ambos no rompe nada, pero conviene tener una
> sola fuente de verdad: se aplican los del monorepo y se saltea el del landing.
> Verificado por diff el 04/09/2026. El de métricas
> (`202609020001_pilot_feedback_metrics.sql`) sí es exclusivo del landing y no
> tiene equivalente en el monorepo: ese hay que aplicarlo desde ahí.

Después de aplicar, comprobar que existen y tienen RLS activa:
`acequia_pilot_applications`, `acequia_account_requests`,
`acequia_pilot_participants`, `acequia_pilot_feedback`,
`acequia_product_events`, `terreno.suscripcion_eventos_proveedor` y
`terreno.eventos_recorrido`; y que `terreno.suscripciones` aceptó las columnas
nuevas del estado de prueba.

**Ojo con `0051`.** Trae el estado comercial de prueba y quedó parado a propósito
esperando sandbox de pagos y revisión legal. Aplicar la migración es seguro
—crea columnas y tablas, no cobra— pero el interruptor `ACEQUIA_TRIAL_ENABLED`
sigue en `false` y es lo último que se enciende, después de pagos.

## Bloque 2 — vista previa de Vercel (proyecto del landing)

Cargar en **Preview**, nunca en Production: `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`PILOT_IP_HASH_SALT` y `ANALYTICS_HASH_SALT` (32+ caracteres aleatorios cada
una, distintas entre sí) y `PILOT_ADMIN_EMAILS`.

Todo lo demás en `false`: pagos, webhooks, correo, métricas, indexación y las
funciones del piloto.

**No** poner `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=.acequia.app` mientras se prueba
sobre una URL `vercel.app`: el navegador descarta esas cookies y la sesión se
pierde sin error visible.

Redesplegar la preview y correr la verificación previa del proyecto. Tiene que
terminar en verde antes de encender nada.

**Riesgo conocido, revisar antes de dar la preview por buena:** hay un bug
histórico de BOM en las variables de entorno de Vercel —un carácter invisible al
principio del valor de `NEXT_PUBLIC_SITE_URL` rompía las rutas `/api` con un 500
vacío. Si aparece un 500 sin cuerpo, es eso: se sanea con `limpiarEnv`.

## Bloque 3 — Google y cuentas

En Google Cloud, cargar las URLs de retorno exactas que dicte Supabase. En
Supabase Auth, habilitar como destinos: la preview del landing y la de la app,
cada una con `/auth/callback`. Las definitivas (`https://acequia.app/...` y
`https://app.acequia.app/...`) se agregan recién en el bloque 8.

Probar con un correo real de Jonatan, y que él haga los pasos con sesión:
crear cuenta con Google · cerrar sesión y volver a entrar · revocar el permiso
de Google y reintentar · recuperación de contraseña · abrir un enlace vencido ·
entrar a `/mapa` con la sesión vencida · completar una cuenta sin nombre.

Criterio de aprobación: ninguna redirección sale de Acequia y **todo error
ofrece una salida** —nada de pantallas en blanco ni de mensajes que no digan
qué hacer.

## Qué entrega el agente al cerrar la sesión

- Un registro de qué migraciones se aplicaron y en qué proyecto.
- La lista de variables cargadas **por nombre, nunca por valor**.
- La lista de pruebas del bloque 3 con su resultado real, incluidas las que
  fallaron.
- Los interruptores que quedaron encendidos y los que quedaron en `false`.
- Lo que quedó pendiente, dicho como pendiente y no como hecho.
