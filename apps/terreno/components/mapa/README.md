# `components/mapa/` — capas y piezas del mapa Leaflet

Piezas extraídas de `MapLeaflet.tsx` durante la **Fase 1** de modularización
(un corte por commit, cada uno validado en prod). El objetivo es que una sesión
futura ubique el código de una capa **sin releer las ~822 líneas de MapLeaflet**.

Regla de oro de la extracción: **el código se movió byte a byte, sin cambiar
comportamiento** (mismas cachés, mismo HTML de iconos, mismo z-order). Si algo se
ve raro en el mapa, el bug estaba antes o es de props, no del movimiento.

## Quién importa a quién

`components/mapa/` lo consume **sólo `MapLeaflet.tsx`** (más los cross-imports
internos de esta carpeta). No hay otros importadores en `app/`, `lib/` ni el
resto de `components/`. MapLeaflet re-exporta algunos tipos (`NavegacionMapa`,
`PuntoSnap`, `SnapSegmento`, `TipoActivo`) para que importadores externos que
antes los tomaban de MapLeaflet sigan resolviendo.

`CapasVisibles` vive todavía en `MapLeaflet.tsx`; varias capas la importan con
`import type { CapasVisibles } from '../MapLeaflet'` (type-only → se borra en
compilación, no crea dependencia circular en runtime).

## Los archivos

| Archivo | Qué es | Exports principales |
|---|---|---|
| `iconos.ts` | Fábricas de `L.DivIcon` **puras** (sin React) + cachés. Arman el HTML de cada marcador una vez y lo cachean. | `crearIconoMojon`, `crearIconoPin`, `crearIconoElemento`, `emojiPxElemento`, `crearIconoAguada`, `crearIconoTexto`, `crearIconoLindero`, `crearIconoMedida`, `iconoSunEvent`, `iconoNoon`, `iconoCardinal` |
| `smoothing.ts` | Helper geométrico de suavizado de polilíneas. | `chaikin(pts, iteraciones, cerrada)` |
| `canvasLayers.tsx` | Capas de **análisis rasterizado**: pintan un `<canvas>` fuera de banda y lo agregan como `L.imageOverlay` (1 px por celda, escala 8× bilineal). Devuelven `null`. | `ShaderCanvasLayer`, `ErosionCanvasLayer`, `SombrasCanvasLayer`, `InsolacionCanvasLayer`, `ViewshedCanvasLayer` |
| `exposers.tsx` | Componentes-**puente**: viven dentro del `MapContainer`, hacen `useMap()` y exponen acciones/estado al padre (que vive afuera), o instalan interacción de bajo nivel. Devuelven `null`. | `AutoFit`, `RotarConBotonCentral`, `NavegacionExposer` (+ tipo `NavegacionMapa`), `FlyToExposer`, `MapMouseTracker`, `InvalidarSize`, `MapChangeWatcher`, `BoundsExposer` |
| `vectorLayers.tsx` | Capas **vectoriales** react-leaflet (polilíneas/marcadores de datos derivados). | `MedicionLayer`, `LinderoLabels`, `CotasAutoLayer`, `CurvasNivelLayer`, `TerrariumLayer`, `ArcoSolarLayer` |
| `cad.tsx` | **CAD interactivo**: clicks con snap/ortho + línea elástica + medidas en vivo. Componente puro (sin handlers de teclado). | `CadInteractivo` (+ tipos `PuntoSnap`, `SnapSegmento`, `TipoActivo`) |
| `dibujosLayer.tsx` | Superficie de **dibujo libre**: dibujos guardados (línea/curva/polígono/círculo/cota/texto/flecha/punto) + 4 grupos de mangos (arrastre, redimensión círculo, vértices, insertar vértice "+"), y el **preview** del trazo en curso. | `DibujosLayer`, `DibujoPreview` |
| `aguadasLayer.tsx` | Capa de **aguadas**: represas (marcador) + swales/keylines (polilíneas punteadas). Early-return si `!capas.aguadas`. | `AguadasLayer` |

## Convenciones al tocar esta carpeta

- **Z-order**: Leaflet apila por orden del DOM (lo último renderizado queda
  encima). Si movés un bloque de render, reemplazalo **en el mismo lugar**;
  reordenar cambia qué capa tapa a cuál.
- Todo archivo con JSX empieza con `'use client';`.
- Las fábricas de `iconos.ts` son **puras y cacheadas**: si agregás una, mantené
  el patrón de caché (no recrear el `DivIcon` en cada render).
- Los exposers **siempre devuelven `null`**: son puentes de efecto, no UI.
- Antes de commitear: `tsc --noEmit` y `next build` desde `apps/terreno` (ambos
  EXIT 0). `/mapa` está auth-gated → lo valida Jonatan en prod.

## Lo que sigue en MapLeaflet

Quedan en `MapLeaflet.tsx` (~822 líneas) el scaffolding del `MapContainer`, las
capas de dominio muy atadas a sus propias props (terreno, mojones, caminos,
zonas, sectores, masterplan, silvopastura, cortina, cortafuegos, escorrentías,
cuenca, potreros, sombras, overlay) y el cableado de exposers. Se dejó de cortar
ahí a propósito: seguir sólo mueve JSX prop-driven con interfaces anchas
(rendimiento decreciente).
