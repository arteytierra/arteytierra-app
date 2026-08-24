# `apps/terreno/lib/` — motores de análisis y dominio

Toda la lógica de dominio de Terreno (análisis catastral/territorial de `/mapa`):
motores de cálculo puros, clientes de datos abiertos, interoperabilidad GIS y la
capa de planes/auth. Los componentes y hooks orquestan; **el cómputo vive acá**.

Casi todo es TypeScript puro y testeable de forma aislada. Los índices por
dominio de abajo son para ubicar un motor sin abrir 70 archivos.

## ⚠️ Zona sensible — no romper

Estos archivos gobiernan **quién puede hacer qué y quién paga**. Inspeccionar
libremente; tocar sólo con intención explícita y validación:

| Archivo | Rol |
|---|---|
| `entitlements.ts` | **Fuente única de verdad** de qué habilita cada plan (Semilla/Diseñador/Estudio). |
| `auth/apiGuard.ts` | Guard de las rutas API (verifica sesión + plan). |
| `auth/plan.ts`, `auth/session.ts` | Resolución de plan y sesión del usuario. |
| `suscribir.ts` | Inicia el checkout de suscripción (la app terreno **no** tiene credenciales de pago; delega). |
| `telemetria.ts` | Telemetría de candados (best-effort, client-side). |

## Tipos base y proyecto

| Archivo | Qué es |
|---|---|
| `types.ts` | Tipos núcleo (`Mojon`, etc.). |
| `pines.ts` | Tipo `Pin` y helpers de pines. |
| `informe.ts` | Tipos y helpers del informe de análisis. |
| `proyectos.ts` | Acceso al schema `terreno` en Supabase (cast a `any`, sin tipos generados). |
| `profesional.ts` | Perfil del profesional que firma el informe (white-label). |

## Geometría, dibujo y zonificación

| Archivo | Qué es |
|---|---|
| `geometria.ts` | Cálculos geodésicos del polígono con `@turf/turf` (WGS84). |
| `coordenadas.ts` | Conversión decimal ↔ GMS ↔ UTM. |
| `transformaciones.ts` | Transformaciones geométricas tipo CAD sobre elementos. |
| `dibujos.ts` | Elementos de dibujo libre + helpers (distancias, áreas, snap geométrico). |
| `elementos.ts` | Símbolos vista-planta **a escala** que se estampan con un clic. |
| `bloques.ts` | Biblioteca de bloques: símbolos reutilizables. |
| `capasUsuario.ts` | Capas de usuario para los elementos de dibujo libre. |
| `zonificacion.ts` | Zonas dibujadas con área calculada. |
| `sectores.ts` | Análisis de sectores: influencias externas del predio. |

## Elevación · DEM · topografía

| Archivo | Qué es |
|---|---|
| `elevacion/` | **Subsistema DEM multi-fuente** (ver README propio si existe): router + proveedores (GLO-30 global, SRTM, nacionales), grilla, atribución, tipos. |
| `grillaElevacion.ts` | Grilla densa de elevación desde tiles Terrarium (AWS). |
| `shaders.ts` | Shaders topográficos: elevación + pendiente. |
| `curvasNivel.ts` | Curvas de nivel vectoriales (Marching Squares) sobre `GrillaElevacion`. |
| `topografia.ts` | Elevaciones desde OpenTopoData (SRTM 30m). |
| `demImport.ts` | Importar DEM propio (GeoTIFF 1 banda: dron, etc.). |
| `demExport.ts` | Exportar el DEM activo a formatos GIS. |
| `geotiffImport.ts` | Importar GeoTIFF (ortofoto de dron o MDE IGN). |
| `keyline.ts` | Análisis Keyline (P.A. Yeomans) orientativo desde grilla densa. |
| `cutfill.ts` | Cut & fill de represas/embalses: volumen almacenable + movimiento de tierra. |

## Agua e hidrología

| Archivo | Qué es |
|---|---|
| `aguadas.ts` | Diseño de aguadas: escurrimiento + sitios óptimos de cosecha de agua. |
| `swales.ts` | Zanjas de infiltración (swales) a nivel, siguiendo la curva. |
| `cortafuegos.ts` | Cortafuegos sobre líneas de cresta (divisorias). |
| `represa.ts` | Simulación mensual de represa/embalse. |
| `cuenca.ts` | Cuenca de aporte por clic. |
| `cuencaHidro.ts` | Delineación de cuenca sobre DEM propio de hidrología (el motor grande). |
| `escorrentias.ts` | Escorrentías superficiales por algoritmo D8. |
| `captacion.ts` | Captación pluvial + dimensionamiento de tanque. |
| `hidraulica.ts` | Hidráulica de redes de agua por tubería. |
| `riego.ts` | Riego por sector desde la evapotranspiración. |
| `erosion.ts` | Riesgo de erosión hídrica (pendiente + cobertura). |

## Clima · solar · sombras

| Archivo | Qué es |
|---|---|
| `clima.ts` | Clima histórico vía NASA POWER (climatología 1981–2023). |
| `climaExtremos.ts` | Extremos y clima de riesgo sobre la serie diaria. |
| `calendario.ts` | Calendario agroclimático: ventanas de siembra, GDD, balance por cultivo. |
| `solar.ts` | Trayectoria del sol, radiación, horas de luz. |
| `arco_solar.ts` | Trayectoria del sol proyectada sobre el mapa. |
| `insolacion.ts` | Horas de sol acumuladas por punto en un día. |
| `sombras.ts` | Sombras del relieve por fecha/hora. |
| `objetosSombra.ts` | Objetos con altura propia que proyectan sombra. |
| `viewshed.ts` | Visibilidad / viewshed desde un punto de observación. |

## Suelo · cobertura · ecología

| Archivo | Qué es |
|---|---|
| `suelos.ts` | Análisis de suelo vía SoilGrids (ISRIC). |
| `aptitud.ts` | Aptitud de uso del suelo por celda de la grilla. |
| `cobertura.ts` | Cobertura del suelo — ESA WorldCover 10 m. |
| `carbono.ts` | Estimador orientativo de carbono (stock + potencial). |
| `contexto.ts` | Contexto ecológico y cultural del predio. |
| `entorno.ts` | Contexto vivo (datos abiertos: GBIF, OSM/Nominatim, Overpass). |
| `sugerencias.ts` | Sugerencias de ubicación por principios de permacultura. |

## Producción agropecuaria y diseño del predio

| Archivo | Qué es |
|---|---|
| `masterplan.ts` | Master Plan: programa declarado del predio → zonas + relaciones + optimización (el motor grande de esta familia). |
| `produccion.ts` | Sistemas productivos agropecuarios. |
| `pastoreo.ts` | Pastoreo rotativo (PRV / Voisin). |
| `potreros.ts` | Subdivisión geométrica de potreros. |
| `silvopastura.ts` | Líneas de árboles/forraje leñoso a nivel. |
| `cortinas.ts` | Cortinas rompevientos como franja multiestrato. |
| `caminos.ts` | Trazado de caminos con perfil de elevación. |
| `economia.ts` | Presupuesto de obras + análisis económico simple. |

## Import · export · interoperabilidad

| Archivo | Qué es |
|---|---|
| `importar.ts` | Importar coordenadas desde KML/KMZ/CSV. |
| `exportar.ts` | Exportar a GeoJSON/KML/GPX. |
| `dxf.ts` | Interop DXF (AutoCAD): writer + parser propios, sin deps. |
| `capturaMapa.ts` | Compositor de mapa estático para el informe. |
| `wayback.ts` | Imagen histórica — ESRI World Imagery Wayback. |
| `vectores3d.ts` | Vectores para la Vista 3D. |

## Persistencia · estado · infraestructura

| Archivo | Qué es |
|---|---|
| `db/` | Clientes Supabase por contexto: `browser.ts`, `server.ts`, `admin.ts`, `cache.ts`. |
| `autosave.ts` | Autoguardado local (localStorage `terreno_autosave_v1`). |
| `useHistory.ts` | Hook genérico undo/redo (vive en lib, no en `hooks/`). |

## Convenciones

- Preferir **funciones puras**: entrada → salida, sin efectos, fáciles de testear.
- Los clientes de datos abiertos (NASA POWER, SoilGrids, OpenTopoData, GBIF,
  WorldCover, Wayback) son de **solo lectura** y deben degradar con gracia si la
  fuente falla.
- Para el subsistema DEM ver `lib/elevacion/` (router multi-proveedor).
- Antes de tocar la zona sensible (entitlements/auth/pagos), inspeccionar sin
  romper el sistema de planes y validar el cambio explícitamente.
