# `@arteytierra/terreno`

App de **análisis catastral y de territorio** de Arte y Tierra. El usuario dibuja
su predio sobre el mapa y obtiene análisis de clima, suelo, agua, relieve, solar
y un diseño regenerativo (permacultura / Keyline / silvopastura), más un informe
descargable. Corazón del producto: la ruta **`/mapa`** (auth-gated).

Next.js 15 (App Router) · React 19 · Leaflet · Supabase · TypeScript. Parte del
monorepo (pnpm + turbo); alias `@` → raíz de esta app.

## Dónde está cada cosa

| Carpeta | Qué hay | Índice |
|---|---|---|
| `app/` | Rutas App Router: `mapa/` (la app), `informe/`, `login/`, `registro/`, `suscribir/`, `canjear/`, `terminos/`, `auth/`, y `api/` (proxies a datos abiertos). | — |
| `components/` | ~55 componentes (paneles de cada análisis: Clima, Suelo, Aguadas, Caminos, Aptitud…) + el mapa. | — |
| `components/mapa/` | Capas y piezas del mapa Leaflet extraídas de `MapLeaflet.tsx`. | [README](components/mapa/README.md) |
| `hooks/` | Hooks de estado/orquestación que sacan estado del God component `MapaTerrenoApp.tsx`. | [README](hooks/README.md) |
| `lib/` | **Motores de análisis y dominio** (todo el cómputo puro + clientes de datos + planes/auth). | [README](lib/README.md) |
| `lib/elevacion/` | Subsistema DEM multi-fuente (router + proveedores nacionales). | [README](lib/elevacion/README.md) |
| `tests/unit/` | Vitest por dominio: `aguas/`, `clima/`, `diseno/`, `economia/`, `topografia/`. | — |

Documento vivo del refactor de modularización: `PLAN-fase1-modularizacion.md`.

## Arquitectura en una línea

`app/mapa` monta **`MapaTerrenoApp.tsx`** (orquestador: estado + paneles) que
renderiza **`MapLeaflet.tsx`** (el mapa y sus capas). Los paneles piden cómputo a
`lib/` (funciones puras) y a `app/api/*` (proxies server-side a NASA POWER,
SoilGrids, OpenTopoData, Copernicus, WorldCover, etc.). El estado se agrupó en
hooks de dominio (`hooks/`); las capas del mapa en piezas hermanas
(`components/mapa/`).

## Comandos

Desde `apps/terreno/`:

```bash
pnpm dev
```
```bash
pnpm typecheck
```
```bash
pnpm build
```
```bash
pnpm test
```

Tests por dominio: `pnpm test:aguas`, `test:clima`, `test:diseno`,
`test:economia`, `test:topografia`.

## Deploy

Push a `main` → **auto-deploy en Vercel** (integración GitHub). No reponer
`.vercelignore`. `/mapa` es auth-gated → la validación en prod la hace Jonatan.

## Zona sensible

`lib/entitlements.ts`, `lib/auth/*` y `lib/suscribir.ts` gobiernan planes, acceso
y pagos. Inspeccionar libremente; tocar sólo con intención explícita y validación
(ver [lib/README](lib/README.md)).
