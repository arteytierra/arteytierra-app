# Arte y Tierra — monorepo

Dos productos en un repo: el sitio del estudio (`apps/web`, arteytierra.org) y
**acequia** (`apps/terreno`), la app SaaS de análisis de territorio y diseño
regenerativo. `packages/` tiene lo compartido; `supabase/migrations/` es el
esquema de la única base que usan los dos.

pnpm 9 + turbo. Node 24. Next 15 (App Router) + React 19 + TypeScript estricto
(`noUncheckedIndexedAccess` prendido) + Supabase.

**Se responde en español argentino**, en el código y en los mensajes de commit.

## Lo que rompe si no lo sabés

**El deploy es el push.** `git push origin HEAD:main` dispara Vercel en los dos
proyectos. No hay staging. **No reponer `.vercelignore`** (ya rompió el deploy
una vez). Las credenciales de Vercel no se tocan.

**Un build roto no se nota:** Vercel sigue sirviendo el último build bueno, así
que el sitio se ve bien igual. Verificá el *deployment*, no la página:
`npx vercel@latest inspect <url>` tiene que decir `● Ready`.

**El índice de git es compartido.** Puede haber otra sesión trabajando en el
mismo árbol. Nunca `git add -A`: stagear archivo por archivo y acotar el commit
con pathspecs (`git commit -F msg.txt -- ruta/uno ruta/dos`), o te llevás
puesto lo que stageó la otra sesión.

**`/mapa` y `/informe/*` están detrás de login.** No se pueden verificar desde
el navegador del agente y no se consultan endpoints de producción. Esas rutas
las valida Jonatan.

**Ninguna clave se escribe en un archivo del repo, ni en `_research/`, ni en un
mensaje de commit, ni en una captura.** La service-role key vive en
`apps/terreno/.env.local`.

## La compuerta, antes de cualquier commit de código

Las tres, en cero. Un commit sólo de documentación está exento.

```bash
pnpm typecheck && pnpm lint && pnpm --filter @arteytierra/terreno test && pnpm --filter @arteytierra/web test
```

`vitest` no resuelve desde la raíz: para correrlo directo hay que pararse en la
app. El `build` también tiene que salir 0 (`next build` en cada app); turbo no
lo corre solo.

Cerrá el ciclo completo sin preguntar en el medio: compuerta → commit → push →
verificar el deploy. Dentro de acequia hay vía libre para modificar lo que haga
falta; lo que nunca se hace solo es tocar paneles de terceros, crear cuentas,
aceptar términos o mover plata.

## Base de datos

Las migraciones se numeran (`0057_nombre.sql`) y son la fuente de verdad del
esquema. **Si aplicás algo a mano por el conector MCP, escribí el archivo en el
mismo movimiento y corregí la versión**: el conector estampa un timestamp
(`20260911013734`) en vez del número, y entonces la base no reconoce el archivo
como aplicado. Ya pasó con tres migraciones seguidas.

Antes de revocar permisos sobre una función, fijate si la usa una política RLS.
`app.is_staff()` y `app.is_admin()` tienen que seguir con `EXECUTE` para `anon`:
las evalúan las políticas de `cms.*` y sin permiso la política no devuelve
falso, **revienta**, y el sitio público deja de mostrar contenido.

## Planes de acequia

Una sola fuente: `packages/config/src/acequia.ts`. Los entitlements, la
vidriera y el trigger de la base leen de ahí y hay un test que compara el SQL
contra esos números. Nunca escribas un precio o un tope en otro archivo.

Semilla (gratis, 1 proyecto) · Personal (7/70, 2) · Profesional (15/150, 10) ·
Estudio (35/350, 10 proyectos × 5 cuentas). Los asientos de Estudio **todavía no
están implementados**: hoy se resuelven a mano.

Hay un sexto consumidor que este repo no puede vigilar: `lib/plans.ts` de la
landing `acequia.app`, que vive en **otro repositorio**
(`arteytierra/acequia-landing`) y es una copia a mano. Ya se desincronizó. El
contrato completo está en la skill `fuente-unica-de-verdad`.

## Lo que más importa en este código

acequia no falla estrellándose: falla **imprimiendo un número plausible y
equivocado**. Un coeficiente de escorrentía mal puesto no tira una excepción,
sale en el informe y alguien excava una represa con eso. Por eso, en todo lo que
calcule algo físico rige el contrato de la skill `motor-de-calculo`: fuente
citada, unidades explícitas, rango de validez y un test con un caso resuelto de
la literatura. Ver `apps/terreno/lib/README.md`.

## Mapa del territorio

| Dónde | Qué |
|---|---|
| `apps/terreno/lib/` | los motores de cálculo (funciones puras) y el dominio |
| `apps/terreno/app/api/` | proxies server-side a datos abiertos (NASA POWER, SoilGrids, Copernicus, OpenTopoData, WorldCover) |
| `apps/terreno/components/` | paneles de cada análisis + el mapa Leaflet |
| `apps/terreno/hooks/` | estado y orquestación sacados del componente grande |
| `apps/web/lib/terreno/` | el checkout de acequia (Mercado Pago y PayPal) vive acá |
| `packages/config/` | planes, precios, banderas |
| `_research/` | relevamientos y trazabilidad de fuentes; **no es código y no se monta** |

`MapaTerrenoApp.tsx` son ~4.000 líneas y cierra sobre 393 identificadores: el
JSX no se puede partir de forma mecánica. Si vas a tocarlo, leé
`apps/terreno/PLAN-fase1-modularizacion.md` antes.

## Entorno

Windows. **No hay Python, ni `psql`, ni `pg_dump`, ni Docker, ni `gh`.**
`npx vercel@latest` y `npx supabase` sí funcionan y están autenticados. Para la
base, usá el conector MCP de Supabase.

`grep -rn` sobre el repo se come el timeout por `node_modules`: usá `git grep`.
