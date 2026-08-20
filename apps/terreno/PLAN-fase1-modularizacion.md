# Fase 1 — Romper los archivos-Dios de `apps/terreno`

> Continúa el plan de modularización. **Fase 0 (red de tests sobre libs puras) está
> completa**: 116 tests en verde sobre los 5 dominios. Esta fase ataca los dos
> componentes que concentran la complejidad, **de forma incremental y verificada**.

## Objetivo

Bajar `MapaTerrenoApp.tsx` (~5233 líneas) y `MapLeaflet.tsx` (~2334) a un tamaño
manejable **sin cambiar comportamiento**. No es una reescritura: es mover clusters
cohesivos de estado/lógica a hooks y sub-componentes, uno por commit, cada uno
guardado por `tsc` + `next build` + verificación en `/mapa`.

### Principios

1. **Un cluster por commit.** Nada de refactors gigantes. Cada etapa entra y sale
   verde por su cuenta y es fácil de revertir.
2. **Sin cambio de comportamiento.** Extraer ≠ rediseñar. Misma firma, mismos
   efectos, mismas claves de `localStorage`.
3. **El patrón ya existe.** `hooks/` ya tiene `useCuenca`, `useSombras`, `useCapas`,
   `useAutosave`, `useCadSnap`, `usePerfilElevacion`. Seguimos esa convención.
4. **`/mapa` es auth-gated** → Jonatan valida en prod tras cada push. Por eso los
   cortes se ordenan de **menor a mayor riesgo**.

## Diagnóstico

`MapaTerrenoApp.tsx` ya delega la UI a 54 paneles y 6 hooks. Lo que queda adentro
es **estado + orquestación**: 128 `useState`, 138 `useCallback`, 19 `useEffect`.
Ahí está el verdadero peso. La estrategia es agrupar ese estado en hooks de
dominio hasta que el componente sea sólo cableado + layout.

## Etapas (orden de ejecución)

| # | Corte | Qué mueve | Riesgo |
|---|-------|-----------|--------|
| **1** | `useVistaShell` | Tema (claro/sepia/oscuro) + anchos regulables de panel y sidebar Capas, con su persistencia en `localStorage` | **Muy bajo** — piloto |
| 2 | `useDibujoLibre` | `modoDibujo`, `dibujoEnCurso`, `dibujoSelId`, `medicionVertices`, `colorDibujo`, `overlay` + handlers | Bajo |
| 3 | `useCapaClima` | `datosClimaRaw`, `calibracionPrecip`, CHIRPS, `datosExtremos` + fetch | Medio |
| 4 | `useCapaSuelo` | `datosSuelo` + loading/error + fetch | Bajo |
| 5 | `useReliefShader` | `datosShader`, `datosTopografia`, curvas, `demPropio`, `terrariumRango` | Medio-alto |
| 6 | `useExportUI` | `exp`, `capturaActiva/Titulo`, `leyendaEditada`, `guardandoPng` | Bajo |
| 7 | `useCapasDnD` | `ordenGrupos`, `dragKey/Item`, `dropCapa`, `overlayFolder` | Medio |
| 8 | Sub-componentes de `MapLeaflet` | capa base vs overlays (curvas, cuenca, zonas, dibujos) | Alto |

Cada etapa se cierra con: `tsc --noEmit` EXIT 0, `next build` EXIT 0, y verificación
en browser de que la interacción sigue igual. Las etapas 3–8 se re-evalúan a medida
que avanzamos (el plan es una guía, no un contrato).

## Etapa 1 — `useVistaShell` (piloto) ✅

Primer dominó, deliberadamente el más aislado: preferencias de "cáscara" de vista
persistidas por dispositivo. No toca nada del dominio del mapa, así que valida el
loop completo (nuevo hook + gate + browser) con blast radius mínimo.

- **Nuevo:** `hooks/useVistaShell.ts` — dueño de `tema` (+ `data-theme` en `<html>`
  y persistencia), `anchoPanel`, `anchoCapas`, `redimensionando`, `iniciarResize`.
- **En `MapaTerrenoApp.tsx`:** se reemplazan ~30 líneas de estado/efectos/handler
  por una línea `const { … } = useVistaShell()`. El botón de tema pasa a
  `onClick={ciclarTema}`.
- **Invariantes preservados:** mismas claves `terreno_tema`, `terreno.anchoPanel`,
  `terreno.anchoCapas`; mismos límites de ancho (220–560); mismo `data-theme`.
