# `apps/terreno/hooks/` — hooks de estado/orquestación del mapa

Hooks de React que sacan estado y orquestación fuera del "God component"
`MapaTerrenoApp.tsx` (la app de `/mapa`). Nacieron en el refactor de
modularización: cada uno se llevó un dominio de estado **tal cual** (mismos
setters, mismos nombres hacia el padre) para no cambiar comportamiento.

Regla al leer/tocar: si un hook dice "extraído tal cual", el código es
byte-equivalente al que vivía en `MapaTerrenoApp`; el estado sigue siendo dueño
del padre a través de los setters que el hook devuelve.

## Familia de "capas" (state-bags de datos por dominio)

Hooks chiquitos que sostienen el resultado + loading/error de una capa de
análisis. El **fetch real suele vivir en el panel** correspondiente, no acá.

| Hook | Dominio |
|---|---|
| `useCapaClima.ts` | Clima crudo (NASA POWER) + calibración de lluvia + extremos + `datosClima` derivado + efecto CHIRPS. Recibe `mojones`. |
| `useCapaSuelo.ts` | `datosSuelo` + `sueloLoading`/`sueloError`. State-bag puro (fetch en `SuelosPanel`). |
| `useCapaTopografia.ts` | Gemelo trivial de suelo: `datosTopografia` + loading/error (fetch en `TopografiaPanel`). |

## Capas con cálculo/orquestación propia

| Hook | Qué hace |
|---|---|
| `useCuenca.ts` | Delineación de la cuenca de aporte: modo/resultado/carga/aviso + 3 flujos (adaptativa por clic, extender a divisoria, manual desde polígono). Lee `mojones`. `handleEditarCuenca` queda en el padre. |
| `useSombras.ts` | Mapa de sombras + insolación: fecha/hora/objetos, animación del día, horas de sol acumuladas. Lee `datosShader`/`latCentro`/geometría. |
| `usePerfilElevacion.ts` | Perfil de elevación interactivo (dock inferior estilo Google Earth Pro). Pide el perfil a la API y lo cachea dentro del camino vía `setCaminos`. |

## Estado de UI / vista

| Hook | Qué hace |
|---|---|
| `useVistaShell.ts` | Tema + anchos de panel/Capas + resize, persistido. |
| `useCapas.ts` | Visibilidad del mapa: `capas` (checkboxes del panel), `ocultosIds` (elementos por id), `capasOcultas` (capas de usuario). Define `CAPAS_INICIAL`. |
| `useCapasDnD.ts` | Drag & drop del panel de Capas: reordenar grupos (`makeDrag`) + arrastrar elemento/overlay a carpeta (`dragFila`/`dropEnCarpeta`). `dragKey`/`dragBloqueado` compartidos por ambos gestos. Vive fuera de `PanelCapas`. |

## Interacción / persistencia / historial

| Hook | Qué hace |
|---|---|
| `useCadSnap.ts` | Puntos y segmentos candidatos de snap para el CAD (alimenta a `CadInteractivo`). Importa `SnapSegmento` de MapLeaflet. |
| `useCapturaPng.ts` | Export del mapa a PNG (`html-to-image` sobre `#print-capture-root`). Interfaz angosta: recibe `capturaTitulo` + `onError` (en ref para preservar memoización). |
| `useAutosave.ts` | Autoguardado local del proyecto (mojones + metadatos + título). Envuelve `@/lib/autosave`. |

> Nota: `useHistory.ts` (undo/redo genérico) vive en **`lib/`**, no acá.

## Convención

- Todos empiezan con `'use client';`.
- El **padre sigue siendo dueño del estado**: el hook expone setters con los
  mismos nombres que antes tenía `MapaTerrenoApp`, para que handlers,
  serializador de snapshot y paneles no cambien.
- Un handler queda en el padre (y no en el hook) cuando toca varios dominios
  cruzados a la vez (ej. `handleEditarCuenca`, que además navega de tab).

## Contexto del refactor

Balance de la extracción de hooks: `MapaTerrenoApp` bajó de **128 → 112
`useState`**. Los dos clusters que faltan (relief shader y dibujo libre) **no**
salen con extracción de estado simple — son orquestación cross-domain que
necesita otra técnica (reducer/orquestador). Ver
`PLAN-fase1-modularizacion.md` y el README de `components/mapa/`.
