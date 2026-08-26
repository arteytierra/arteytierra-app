# Plan de expansión de Anteproyectos en dos pistas paralelas

Documento de coordinación entre dos IAs trabajando sobre el mismo repo al mismo
tiempo. Pistas explícitamente separadas por dominio y por archivos, con un
contrato de interfaces acordado *antes* de escribir código, para que cada una
pueda avanzar sin esperar a la otra salvo en los puntos de sincronización que
se marcan abajo.

**Repo:** monorepo pnpm/Turborepo, `apps/anteproyectos` es la app a expandir.
**Fuente de mejoras:** auditoría externa recibida el 25/08/2026 (generador de
anteproyectos "muy básico", modelos 2D esquemáticos, 3D sin materiales, render
= sólo un prompt de texto) + inventario propio de qué existe en `apps/terreno`
que se puede reutilizar en vez de reconstruir.

**Objetivo final:** que cualquier persona (no sólo Jonatan) pueda entrar,
responder el cuestionario de diseño participativo, subir fotos/dibujos a
mano/modelos, ubicar su terreno en un mapa real, y recibir anteproyectos de
calidad profesional — 2D acotado, 3D con materiales, render fotorrealista
consistente — de la misma forma en que `apps/terreno` ya sirve a múltiples
usuarios con cuentas, planes y persistencia en base de datos.

---

## 1. Por qué se divide así

`apps/terreno` ya resuelve, de forma madura y probada en producción, todo lo
que tiene que ver con **el sitio** (terreno real, no un rectángulo abstracto):
DEM multi-fuente, geometría de lote, trayectoria solar, sombra proyectada de
volúmenes, cuenca visual — y toda la infraestructura de **multiusuario**
(Supabase auth, esquema de base de datos por app, entitlements por plan,
persistencia de proyectos). Eso es un trabajo de portar/adaptar, no de
inventar.

Lo que hace falta en **planos y 3D** (muros con espesor, grafo de circulación,
tipologías reales, escena 3D con materiales, pipeline de render controlado por
geometría) no tiene ningún equivalente en terreno — es dominio nuevo, y es
donde vale la pena invertir el esfuerzo de la segunda IA.

Las dos pistas comparten un único punto de enganche real (ver §3), así que
casi todo el trabajo se puede hacer sin coordinación constante.

---

## 2. Reparto de tareas

### Pista A — Sitio, clima real y plataforma (esta IA — Claude)

Portar desde `apps/terreno` a `apps/anteproyectos`, adaptando lo necesario.

| Fase | Qué | Fuente en terreno | Destino en anteproyectos |
|---|---|---|---|
| A0 | Extraer el DEM multi-fuente a paquete compartido | `apps/terreno/lib/elevacion/` (GLO-30 → SRTM con fallback, import de GeoTIFF propio) | `packages/dem/` (nuevo, consumido por las dos apps) |
| A1 | Geometría real del sitio: polígono del lote, linderos con azimut real, pendiente, escurrimiento | `lib/geometria.ts`, `lib/topografia.ts` | `apps/anteproyectos/lib/sitio/` |
| A1 | Cuenca visual (qué se ve desde la casa) | `lib/viewshed.ts` | `apps/anteproyectos/lib/sitio/` |
| A1 | Mapa de selección de sitio con capas activables (elevación, pendiente, curvas de nivel) y recorrido del sol dibujado sobre el terreno | `components/MapLeaflet.tsx` (`CAPAS_DEFAULT`), `components/mapa/vectorLayers.tsx` (`ArcoSolarLayer`) | `apps/anteproyectos/app/sitio/` (nuevo, reemplaza los inputs de lat/lng a mano) |
| A2 | Motor solar real: trayectoria del sol, horas de luz por fecha, sombra proyectada de un volumen con altura | `lib/solar.ts`, `lib/arco_solar.ts`, `lib/sombras.ts`, `lib/objetosSombra.ts`, `lib/insolacion.ts` | `apps/anteproyectos/lib/bioclima/` (reemplaza las categorías Köppen gruesas actuales de `lib/motor/bioclimatica.ts` por horas de sol reales por fachada) |
| A3 | Multiusuario: auth Supabase, esquema de BD propio (`schema: 'anteproyectos'`, análogo a `schema: 'terreno'`), entitlements por plan, persistencia de proyectos en Postgres (hoy es un JSON por archivo local) | `lib/auth/`, `lib/db/`, `lib/entitlements.ts`, `lib/proyectos.ts` | `apps/anteproyectos/lib/auth/`, `lib/db/`, reemplaza `lib/proyectos/almacen.ts` |
| A4 | Ingesta ampliada: ubicar terreno en un mapa real (no lat/lng a mano), subir fotos/dibujos/modelos a Supabase Storage | patrón de mapa de `apps/terreno/app/mapa` + Storage | `apps/anteproyectos/lib/ingesta/` |

### Pista B — Modelo arquitectónico, 3D y render (la otra IA)

Esto se construye de cero — terreno no tiene nada reutilizable acá salvo el
patrón conceptual de `aptitud.ts` (varias funciones de puntaje evaluadas en
paralelo). Basado en las fases 1, 3 y 4 de la auditoría externa.

| Fase | Qué | Nota |
|---|---|---|
| B1 | Modelo arquitectónico canónico: muros con espesor y caras interior/exterior, aberturas como conexiones de un grafo (no heurística de dibujo), grafo de circulación real (acceso → cada ambiente sin atravesar un dormitorio), conciliación real entre m² objetivo y programa | Extiende `lib/motor/layout.ts` y `lib/motor/huella.ts`; **no** hace falta tirar el empaquetador actual — puede quedar como generador rápido de una primera solución |
| B2 | Generación de candidatos + evaluación multicriterio (orientación, compacidad, ventilación cruzada, longitud de circulación) + biblioteca de tipologías reales (lineal, en L, en U, patio central, dos alas) en vez de sólo "bandas" | Referencia de patrón: `apps/terreno/lib/aptitud.ts` (varias funciones de score en paralelo) — no es código para importar, es el patrón de arquitectura a copiar |
| B3 | Motor 3D profesional: escena real (Three.js / `@react-three/fiber`, ninguna de las dos apps lo tiene instalado), muros con espesor y huecos booleanos, cubierta con estructura, cámara orbitable, materiales, exportación GLB/glTF | Reemplaza `lib/motor/volumen.ts` (hoy: polígonos proyectados a SVG, sin escena real) |
| B4 | Pipeline de render controlado por geometría: depth map + normal map + máscara de materiales generados desde el 3D real, en vez de sólo un prompt de texto | Reemplaza/extiende `lib/render/prompt.ts` |
| B5 | Ingesta con visión: interpretar croquis a mano (detectar ambientes, proporciones, accesos) para que el perfil "fiel al cliente" use de verdad el dibujo, no sólo el orden en que se listaron los ambientes | Hoy `lib/ingesta/carpeta.ts` sólo clasifica archivos por nombre |

---

## 3. El contrato compartido — v3, cerrado en Checkpoint 0 (25/08/2026)

Versión revisada por ChatGPT (Pista B) sobre el borrador original, en dos
rondas. La primera corrigió tres huecos reales: el sitio no tenía origen
geográfico ni orientación (no alcanzaba para colocar el edificio), los
volúmenes no tenían identidad ni tipo (no distinguía muro de vegetación), y
la insolación era un raster anónimo en vez de resultados por objeto. La
segunda reemplazó la idea de "`cubierta` lleva `z_m` por vértice como caso
especial" por una unión discriminada: `ObjetoVolumen` ahora es `ObjetoPrisma`
(huella + extrusión vertical) o `ObjetoSuperficie` (vértices coplanares, cada
uno con su `z_m`, para techos y aleros inclinados) — más prolijo que dejarlo
como un flag implícito según el `tipo`. Vive en un paquete nuevo, sin
dependencias de framework, siguiendo el patrón que el repo ya usa
(`packages/types`, `packages/config`, `packages/ui`):

**`packages/anteproyectos-contracts/`** (`@arteytierra/anteproyectos-contracts`)

```ts
export interface PuntoLocal {
  x_m: number;
  y_m: number;
  z_m?: number;
}

export interface SistemaLocal {
  origen: { lat: number; lng: number; elevacion_m: number };
  /** Giro del eje Y local respecto del norte geográfico, sentido horario,
   *  misma convención que azimut_deg en el resto del contrato. */
  norte_deg: number;
  crs?: string;
}

export interface GrillaElevacion {
  /** Elevación absoluta (msnm, mismo datum que origen.elevacion_m). */
  valores_m: number[][];
  origenLocal: PuntoLocal;
  pasoX_m: number;
  pasoY_m: number;
  filas: number;
  columnas: number;
  nodata?: number;
  fuente: 'glo30' | 'srtm' | 'propio';
}

export interface ModeloSitio {
  id: string;
  sistema: SistemaLocal;
  poligono: PuntoLocal[];
  linderos: { id: string; desde: PuntoLocal; hasta: PuntoLocal; azimut_deg: number; largo_m: number }[];
  elevacion: GrillaElevacion;
  accesos: { id: string; punto: PuntoLocal; tipo: 'peatonal' | 'vehicular' | 'mixto'; prioridad: number }[];
  vistas: { id: string; desde: PuntoLocal; azimut_deg: number; apertura_deg: number; calidad: number; deseable: boolean }[];
  restricciones?: { retiros_m?: number; poligonosNoEdificables?: PuntoLocal[][]; cotaInundable_m?: number };
}

export type TipoVolumen = 'muro' | 'cubierta' | 'alero' | 'galeria' | 'obstaculo' | 'vegetacion';

interface ObjetoVolumenBase {
  id: string;
  tipo: TipoVolumen;
  opacidadSolar?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface ObjetoPrisma extends ObjetoVolumenBase {
  geometria: 'prisma';
  /** Huella horizontal; z_m de cada vértice se ignora. */
  vertices: PuntoLocal[];
  z0_m: number;
  altura_m: number;
}

export interface ObjetoSuperficie extends ObjetoVolumenBase {
  geometria: 'superficie';
  /** Todos los vértices llevan z_m y deben ser coplanares. Orden
   *  antihorario visto desde el exterior/superior (normal consistente). */
  vertices: Array<PuntoLocal & { z_m: number }>;
  espesor_m?: number;
}

/** Muro/alero/vegetacion/obstaculo: normalmente `prisma`. Cubierta (faldón
 *  de techo, casi siempre alero inclinado): `superficie`. */
export type ObjetoVolumen = ObjetoPrisma | ObjetoSuperficie;

export interface ResultadoInsolacionObjeto {
  objetoId: string;
  horasSol: number;
  energiaRelativa?: number;
  porcentajeSombreado: number;
  muestras: { hora: number; iluminado: boolean; porcentajeSombreado: number }[];
}

export interface MapaInsolacion {
  fecha: string;
  resultados: ResultadoInsolacionObjeto[];
}

/** El punto de desacople clave: B1/B2 arrancan con un evaluador provisional
 *  y cambian a esta interfaz al motor real de la Pista A sin tocar el
 *  generador. Ver Checkpoint 1 y §5 (dependencias). */
export interface EvaluadorSolar {
  evaluar(volumenes: ObjetoVolumen[], sitio: ModeloSitio, fecha: Date, horas: number[]): Promise<MapaInsolacion>;
}
```

**Quién es dueño de qué adaptador (regla anti-import-cruzado):** ninguna
pista importa módulos internos de la otra — sólo
`@arteytierra/anteproyectos-contracts` y estas dos funciones adaptadoras:
- Pista A exporta el adaptador **DEM → `ModeloSitio`** (dueña de esos datos:
  `lib/elevacion/` + `lib/sitio/`).
- Pista B exporta el adaptador **modelo de edificio → `ObjetoVolumen[]`**
  (dueña de esos datos: `lib/motor/`).

**Precisiones cerradas, en dos rondas:**
1. `norte_deg`: sentido horario desde el norte geográfico, misma convención
   que `azimut_deg` en todo el contrato. (Claude, ronda 1)
2. `valores_m` de `GrillaElevacion` y `origen.elevacion_m` están en la misma
   cota absoluta (msnm); el `z_m` de un `PuntoLocal` es relativo a
   `origen.elevacion_m`. (Claude, ronda 1)
3. `cubierta` no es una extrusión vertical como el resto — es un plano
   inclinado. Resuelto formalmente por ChatGPT en la ronda 2 con la unión
   `ObjetoPrisma`/`ObjetoSuperficie` (reemplaza la propuesta inicial de
   Claude de "z_m por vértice como caso especial de `cubierta`", que
   funcionaba pero dejaba la distinción implícita en el `tipo` en vez de en
   el sistema de tipos). El motor de sombra de terreno
   (`lib/objetosSombra.ts`) hoy sólo resuelve prismas verticales; la Fase A2
   lo extiende para intersectar rayos contra planos `superficie` también.

---

## 4. Mecánica para que dos IAs trabajen en el mismo repo sin pisarse

**Ramas separadas**, ambas partiendo del mismo punto de la rama actual
(`claude/agente-anteproyectos-arquitectonicos-34f532` o la que esté activa al
momento de arrancar):
- `claude/pista-sitio-bioclima` (Pista A)
- `codex/pista-planos-3d` (Pista B)

**Propiedad de archivos** (para que un merge no tenga conflictos):

| Pista A escribe | Pista B escribe |
|---|---|
| `apps/anteproyectos/lib/sitio/` (nuevo) | `apps/anteproyectos/lib/motor/` (existente, se extiende) |
| `apps/anteproyectos/lib/bioclima/` (nuevo, incluye la implementación real de `EvaluadorSolar`) | `apps/anteproyectos/lib/3d/` o `components/Escena3D/` (nuevo) |
| `apps/anteproyectos/lib/auth/`, `lib/db/` (nuevo) | `apps/anteproyectos/lib/render/` — pipeline, mapas de control, abstracción de proveedor |
| `apps/anteproyectos/lib/proyectos/` (existente, cambia de JSON a Postgres) | `apps/anteproyectos/lib/vision/` (nuevo — interpretar croquis) |
| `apps/anteproyectos/lib/ingesta/` (existente — dueña de subida/almacenamiento; Pista B consume referencias de archivo por el contrato, no importa este módulo) | — |
| Credenciales, bindings de Cloudflare, R2, despliegue | — |
| `packages/dem/` (nuevo, compartido) | — |
| `packages/anteproyectos-contracts/` — **compartido**, cambios se acuerdan entre las dos, no es propiedad exclusiva de ninguna | |

Ninguna de las dos toca `apps/terreno` (sólo lectura, como referencia).

**Checkpoints de auditoría cruzada** (no en cada commit — sólo tres, para que
la coordinación no se vuelva el cuello de botella):

1. **Checkpoint 0 — antes de empezar.** Las dos IAs confirman el contrato de
   §3 tal cual quedó, o proponen cambios, *antes* de escribir la primera
   línea. Evita descubrir una incompatibilidad después de días de trabajo.
2. **Checkpoint 1 — a mitad de camino** (A0+A1+A2 de un lado, B1+B2 del
   otro). Cada IA lee el diff completo de la otra rama y reporta hallazgos —
   igual que una revisión de código — antes de que la Pista B empiece a
   consumir `ModeloSitio` o la Pista A empiece a consumir `ObjetoVolumen[]`
   reales.
3. **Checkpoint 2 — integración final.** Se juntan las dos ramas, corren los
   tests de la app completa, y cada IA revisa una vez más el resultado ya
   integrado.

**Cómo se pasan información entre sí:** ninguna IA puede hablarle a la otra en
vivo — la coordinación pasa por Jonatan copiando y pegando entre sesiones.
Por eso el contrato de §3 tiene que quedar escrito y estable desde el
Checkpoint 0, y por eso conviene llevar una bitácora corta en este mismo
archivo (agregar una sección "Registro" abajo) donde cada IA anota, en una o
dos líneas, qué cambió desde el último checkpoint — así la otra no tiene que
releer todo el diff para saber qué esperar.

---

## 5. Dependencias entre fases

| Fase | Depende de | Puede arrancar |
|---|---|---|
| A0, A1 | nada | inmediatamente |
| A2 (solar real, implementa `EvaluadorSolar`) | versión mínima de `ObjetoVolumen[]` de la Pista B — **ya no bloquea a B1/B2**, ver nota | después del Checkpoint 1 |
| A3 (multiusuario) | nada (independiente del resto) | inmediatamente, en paralelo a todo |
| A4 (ingesta con mapa/Storage) | A3 (Storage necesita el esquema de BD) | después de A3 |
| B1, B2 | nada — **usan un `EvaluadorSolar` provisional** (constante) hasta que A2 publique el real | inmediatamente |
| B3 (3D con terreno real) | `ModeloSitio` de la Pista A | después del Checkpoint 1 |
| B4 (render) | B3 (necesita el 3D para derivar depth/normal maps) | interno a la Pista B, sin dependencia cruzada |
| B5 (visión de croquis, `lib/vision/`) | referencias de archivo de `lib/ingesta/` (Pista A) por el contrato, no import directo | después de A4, o con datos de prueba antes |

**Cambio del Checkpoint 0:** la interfaz `EvaluadorSolar` (§3) desacopla a
B1/B2 del motor solar real — arrancan ya mismo con un evaluador de relleno
(por ejemplo "siempre sol") y en el Checkpoint 1 cambian al de la Pista A
sin tocar el generador. Eso deja **B1, B2, A0, A1 y A3 corriendo en paralelo
desde el día uno**, sin ningún bloqueo — el único enganche real de mitad de
camino queda en B3↔`ModeloSitio` y A2↔`ObjetoVolumen[]`.

**Estado al 25/08/2026:** A2 ya está implementado y probado
(`evaluadorSolarReal`, ver Registro) — la Pista B puede cambiar del
evaluador provisional al real en cuanto llegue al Checkpoint 1, sin esperar
más. Lo único que A2 sigue necesitando de la Pista B es `ObjetoVolumen[]`
real (hoy sólo hay fixtures de test escritos a mano).

---

## 6. Decisiones ya tomadas (25/08/2026)

- **Integración en 2 fases**, no fase-por-fase continua: se mergea después
  del Checkpoint 1 (contrato mínimo funcionando de los dos lados) y otra vez
  en el Checkpoint 2 (integración final). El Checkpoint 0 no mergea nada —
  es sólo acuerdo de contrato antes de escribir código.
- **Multiusuario (A3) se construye ahora**, no se pospone. Puede quedar sin
  activar en la UI mientras el resto madura, pero la infraestructura
  (auth, esquema de BD, entitlements) se hace en esta ronda.
- **Un solo proyecto Supabase**, el mismo que ya usa terreno, con
  `schema: 'anteproyectos'` separado — el patrón que terreno ya usa para
  separar dominios dentro del mismo proyecto.
- **La otra IA es ChatGPT** (la que hizo la auditoría externa citada al
  principio de este documento).
- **El costo de las APIs de render es un problema real** — ver §7, se
  resuelve moviendo lo caro a Cloudflare en vez de una API de imagen por
  llamada.

## 7. Hosting: todo se apoya en la cuenta de Cloudflare que ya existe

`apps/web` (`@opennextjs/cloudflare`) y `apps/terreno`
(`@cloudflare/next-on-pages`) **ya despliegan en Cloudflare**. No es una
cuenta nueva a dar de alta — es extender lo que ya se paga y ya se usa.

Dos piezas se mueven ahí explícitamente porque resuelven la queja de costo:

- **Render (B4):** en vez de pagar por llamada a una API de imagen externa,
  usar **Cloudflare Workers AI** (modelos de imagen tipo Stable
  Diffusion/FLUX, precio por neurona, corre en la misma cuenta). Encaja
  directo con el pipeline que ya propone B4: el prompt sale de la geometría
  real, no de texto libre, así que un modelo más chico/barato en Workers AI
  puede rendir bien si el control por profundidad/normales hace la mayor
  parte del trabajo.
- **Storage de archivos subidos y tiles de DEM:** **Cloudflare R2** en vez
  de (o adelante de) Supabase Storage — compatible con S3, sin costo de
  egreso, más barato a medida que crecen las fotos/dibujos/modelos que suban
  los usuarios.

### Capas de terreno y recorrido del sol: ya existen en terreno, se portan tal cual

Esto no hay que construirlo — ya está hecho y funcionando en
`apps/terreno`:

- **Sistema de capas activable/desactivable** — `CAPAS_DEFAULT` en
  `components/MapLeaflet.tsx` (elevación por sombreado, pendiente,
  Terrarium, curvas de nivel, escorrentías, erosión, arco solar, y más,
  cada una con su toggle).
- **Recorrido del sol dibujado sobre el mapa** — `ArcoSolarLayer` en
  `components/mapa/vectorLayers.tsx`: círculo de horizonte, líneas
  cardinales, y el arco solar por fecha, todo en Leaflet real sobre el
  terreno del usuario. Consume `calcularArcoSolar()` de `lib/arco_solar.ts`
  (ya listado en la Fase A2).

Esto pasa a ser parte explícita de la **Fase A1/A4**: no sólo portar el
cálculo (`arco_solar.ts`, `viewshed.ts`, etc.) sino también el componente de
mapa que los muestra — `ArcoSolarLayer` y el selector de capas de
`MapLeaflet.tsx` — para que elegir el sitio en anteproyectos se sienta como
el mapa de terreno, no como cargar lat/lng a mano.

---

## Registro

*(cada IA agrega una entrada corta acá después de cada checkpoint — no antes)*

- 2026-08-25 — Documento inicial. Pista A (Claude) no arrancó código todavía;
  a la espera de que Jonatan confirme el reparto y lo comparta con la otra IA
  para el Checkpoint 0.
- 2026-08-25 — Jonatan confirmó: integración en 2 fases, A3 se construye ya,
  un solo Supabase con `schema: 'anteproyectos'`, la Pista B es ChatGPT, y el
  costo de render por API es un problema real. Se suma §7: render (B4) y
  storage (A0/A4) se apoyan en la cuenta de Cloudflare que `apps/web` y
  `apps/terreno` ya usan (Workers AI + R2), y se agrega a la Fase A1 portar
  el mapa de selección de sitio con capas y `ArcoSolarLayer`, que ya existen
  hechos en terreno. Este documento queda listo para pasarle a ChatGPT y
  arrancar el Checkpoint 0.
- 2026-08-25 — ChatGPT revisó el contrato de §3 y encontró tres huecos
  reales (sitio sin origen/orientación, volúmenes sin identidad/tipo,
  insolación como raster anónimo) y propuso `packages/anteproyectos-
  contracts/`, `EvaluadorSolar` como interfaz de desacople, y resolver el
  choque de propiedad en `lib/ingesta/` con `lib/vision/` para la Pista B.
  Claude aceptó los 8 puntos y cerró tres precisiones de implementación
  (convención de `norte_deg`, datum de elevación, `cubierta` como plano
  inclinado en vez de prisma). Contrato v2 cerrado.
- 2026-08-25 — **Fase A0 completa.** `apps/terreno/lib/elevacion/` (DEM
  multi-fuente: GLO-30 con fallback SRTM, seis proveedores nacionales
  ruteados por bbox) se extrajo tal cual a `packages/dem/`
  (`@arteytierra/dem`), siguiendo la convención de `packages/types`. Como el
  objetivo es que sirva a las dos apps y no dos copias que se desalinean,
  `apps/terreno` se migró para consumir el paquete (`app/api/dem/route.ts`,
  `app/api/elevacion/route.ts`) y se borró la copia local. `geotiff` sigue
  como dependencia directa de terreno aparte (la usa también
  `lib/geotiffImport.ts` / `lib/demImport.ts`, fuera del alcance del DEM
  remoto). Typecheck limpio en `@arteytierra/dem` y en terreno; 116/116
  tests de terreno pasan sin cambios. `apps/anteproyectos` todavía no
  importa el paquete — eso es Fase A1 (armar `ModeloSitio` desde la grilla).
- 2026-08-25 — **Fase A1, primer tramo: geometría + topografía real.**
  `apps/anteproyectos/lib/sitio/geometria.ts` — polígono del lote con
  mojones, área/perímetro/linderos geodésicos (azimut real, no aproximado),
  portado de `apps/terreno/lib/geometria.ts` sobre un `Mojon` propio.
  `lib/sitio/topografia.ts` — pendiente, orientación de escurrimiento y
  estadísticas de elevación, pero **reconstruido sobre `@arteytierra/dem`**
  (`obtenerGrillaDEM`) en vez de portar el `topografia.ts` de terreno tal
  cual: ese usa OpenTopoData punto a punto, un patrón anterior a que
  existiera el DEM multi-fuente compartido — portarlo hubiera sido
  reintroducir la fuente vieja en la app nueva. 7 tests nuevos, 106/106
  pasan en anteproyectos, typecheck limpio. **Deliberadamente NO cableado**
  todavía al `Sitio` de un solo punto que usa hoy `generador.ts`/la UI —
  eso es un cambio de modelo de datos más grande (de punto a polígono) que
  toca ~10 archivos y merece su propia revisión, no colarse en este tramo.
  Pendiente de A1: viewshed y el mapa de selección con
  `CAPAS_DEFAULT`/`ArcoSolarLayer` (ver por qué se dejan para después, abajo).
- 2026-08-25 — **`packages/anteproyectos-contracts/` creado** con el
  contrato v3 completo (ver §3), siguiendo la convención de `packages/types`.
  Es fundacional para las dos pistas — sin esto ninguna puede importar los
  tipos compartidos — así que se prioriza antes de seguir con A1/A2.
  Typecheck limpio.
- 2026-08-25 — **Fase A2 completa: motor solar real, implementa
  `EvaluadorSolar`.** `lib/bioclima/posicionSolar.ts` (Cooper 1969, portado
  de `arco_solar.ts` con `posicionSolar` ahora pública). `lib/bioclima/
  sombra.ts` — cumple la precisión (c) del Checkpoint 0: extiende la
  intersección rayo-sólido de `apps/terreno/lib/objetosSombra.ts` (que sólo
  resolvía prismas verticales) a la unión `ObjetoPrisma | ObjetoSuperficie`
  del contrato, con intersección rayo-plano propia para cubiertas
  inclinadas (normal por producto cruz de dos aristas, proyección a 2D
  sobre el plano para el test punto-en-polígono). Respeta `opacidadSolar`
  (vegetación semitransparente) y evita que un objeto se sombree a sí
  mismo. `lib/bioclima/evaluadorSolar.ts` implementa `EvaluadorSolar` del
  contrato: por objeto, punto representativo (centro de huella a media
  altura en un prisma; centroide del plano en una superficie), rayo hacia
  el sol por hora pedida, factor de sombreado contra el resto de la
  escena. 11 tests nuevos (posición solar en ecuador/hemisferio sur, muro
  bloqueando sol rasante y no bloqueando sol cenital, cubierta inclinada
  bloqueando/no bloqueando, opacidad parcial, auto-exclusión, integración
  del evaluador completo). 117/117 tests de anteproyectos pasan, typecheck
  limpio en los tres paquetes tocados.
- 2026-08-25 — **Adaptador DEM → `ModeloSitio`** (`lib/sitio/adaptador.ts`),
  la obligación simétrica de la Pista A del Checkpoint 0. Combina
  `geometria.ts` + `@arteytierra/dem` en un `ModeloSitio` real: polígono y
  linderos convertidos a metros locales (origen en el centroide, norte_deg
  = 0), grilla de elevación real re-muestreada al formato del contrato.
  Nota para la Pista B: el `fuente` de `GrillaElevacion` del contrato sólo
  distingue 3 valores (`glo30`/`srtm`/`propio`), así que las fuentes
  nacionales de mayor resolución de `@arteytierra/dem` (USGS 3DEP, IGN
  Francia/España, etc.) quedan agrupadas bajo `'glo30'` por ahora — si se
  necesita distinguirlas, es un cambio de contrato a acordar, no algo que
  el adaptador pueda resolver solo. Sin test automatizado (depende de red
  real a los COGs, igual que `topografia.ts`).
- 2026-08-25 — **Viewshed y mapa de selección de sitio quedan para
  después**, con motivo: `apps/terreno/lib/shaders.ts` (del que depende
  `viewshed.ts`) está acoplado a `grillaElevacion.ts`, un módulo orientado
  a cliente (fetch al navegador + colores de render para el mapa), no al
  cálculo puro — portarlo bien es un trabajo de UI/mapa aparte, no del
  motor de sitio. No bloquea el contrato con la Pista B: `ModeloSitio` y
  `EvaluadorSolar`, lo que realmente se intercambia en el Checkpoint 1, ya
  están completos y probados sin esto.
- 2026-08-25 — **Checkpoint 1 (lado Pista A): A0 ✅, A1 núcleo ✅ (geometría
  + topografía + adaptador a `ModeloSitio`; viewshed y mapa UI pendientes,
  no bloqueantes), A2 ✅ (`EvaluadorSolar` real, con la extensión a
  cubiertas inclinadas prometida en el Checkpoint 0).** Lista para que la
  Pista B revise el diff y empiece a consumir `ModeloSitio`/`ObjetoVolumen[]`
  reales en vez de datos provisionales.
- 2026-08-25 — ChatGPT refinó su propia precisión sobre `cubierta`: en vez
  de `z_m` por vértice como caso especial, `ObjetoVolumen` pasa a ser una
  unión discriminada `ObjetoPrisma | ObjetoSuperficie` (geometría explícita
  en el tipo, vértices coplanares con orden antihorario para normal
  consistente). Confirmó rama `codex/pista-planos-3d` y su propiedad
  principal (`lib/motor/`, `lib/3d/`, `components/Escena3D/`, `lib/render/`,
  `lib/vision/`), coincide con la tabla de §4. Contrato v3 cerrado —
  Checkpoint 0 aprobado formalmente por las dos pistas. A la espera de la
  orden explícita de Jonatan para arrancar código.
- 2026-08-25 — **Fase A3 completa: multiusuario.** Portado el patrón de
  `apps/terreno` (`lib/auth/`, `lib/db/`) tal cual, apuntando al schema
  `anteproyectos` en el mismo proyecto Supabase: `lib/db/{server,browser,
  admin}.ts`, `lib/auth/{session,plan}.ts`, `lib/entitlements.ts` (reducido
  a `Plan` + `LIMITE_PROYECTOS`, sin matriz de features todavía — no hay
  nada que gatear más allá del límite de proyectos). `middleware.ts` protege
  toda la app salvo `/login`, `/registro` y `/auth/*`; `app/login/`,
  `app/registro/` y `app/auth/callback/` calcados de terreno (email+password
  y Google OAuth). `lib/proyectos/almacen.ts` — antes un JSON por archivo en
  disco, ahora Postgres real, misma firma de funciones (`listarProyectos`,
  `leerProyecto`, `guardarProyecto`, `borrarProyecto`) para no tocar los
  route handlers ni `PanelProyectos.tsx` más allá del copy que ya no
  describía la realidad ("guardado como .json", la carpeta en disco).
  Migraciones nuevas: `0045_anteproyectos_proyectos.sql` (schema, tabla
  `proyectos` con `datos jsonb` = el `ProyectoGuardado` completo, RLS por
  `user_id = auth.uid()`, tabla `suscripciones`, trigger que hace cumplir
  `LIMITE_PROYECTOS` server-side además del chequeo client-side) y
  `0046_anteproyectos_expose_schema.sql` (suma `anteproyectos` a la lista de
  `pgrst.db_schemas` — esa lista se reemplaza entera, no se agrega, así que
  repite los schemas que ya exponía `0038`). 115/115 tests de anteproyectos
  pasan (se cayeron 2 tests de `rutaDe`, función que ya no existe), typecheck
  limpio en las 8 unidades del workspace.
  **Pendiente, no lo hice yo:** aplicar las dos migraciones nuevas contra el
  Supabase real (es el mismo proyecto que ya usan `apps/web` y
  `apps/terreno` en producción — no corro migraciones contra una base
  compartida sin que Jonatan lo pida explícitamente) y cargar
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
  `SUPABASE_SERVICE_ROLE_KEY` en el entorno de `apps/anteproyectos` (hoy no
  hay `.env.local` en este worktree, así que no pude levantar el dev server
  contra Supabase real para probar el login a ojo). Sin esas dos cosas la
  app no arranca: el middleware exige sesión en todas las rutas.
- 2026-08-26 — ChatGPT revisó el diff de A2 en el Checkpoint 1 y encontró
  dos bugs reales, los dos corregidos: (1) `horasSol` contaba "muestras
  iluminadas × paso" en vez de integrar el intervalo — sobrecontaba,
  llegando a superar el largo real del período evaluado (5 muestras cada 3h
  daban 15h de sol en un período de 12h). Se reemplazó por integración
  trapezoidal (`horasDeSol`, exportado desde `lib/bioclima/evaluadorSolar.
  ts`). (2) `evaluadorSolarReal` usaba el azimut GEOGRÁFICO de
  `posicionSolar` directamente como si fuera el azimut del sistema LOCAL del
  sitio — con `sitio.sistema.norte_deg !== 0` (el eje Y local girado
  respecto del norte verdadero) el rayo se armaba apuntando a la dirección
  equivocada dentro de la escena. Se agregó `azimutLocal()` (resta
  `norte_deg` antes de convertir a dirección local) y se aplica antes de
  llamar a `direccionDesdeAzimutElevacion`. 6 tests nuevos que reproducen
  ambos bugs (incluido uno de integración con `evaluadorSolarReal.evaluar`
  que compara el mismo sitio con `norte_deg=0` vs `90`). 123/123 tests de
  anteproyectos, typecheck limpio.
- 2026-08-26 — **Migraciones de A3 aplicadas a Supabase real.** Al ir a
  aplicarlas aparecieron dos problemas de numeración, los dos resueltos
  antes de tocar nada: (1) el `0045` original de esta rama chocaba con
  `0045_terreno_codigos_familia.sql`, ya aplicado en `main` y no
  sincronizado a esta rama — se renombraron a `0046`/`0047` y se trajo el
  archivo real de `main`. (2) `supabase db push` rechazaba todo por un
  hueco: el historial remoto tenía una versión `0039` sin archivo local en
  ningún lado del repo. Se consultó `supabase_migrations.schema_migrations`
  directo en la base (`supabase db query`) y se confirmó que no era nada
  peligroso: `0039_is_staff_admin_security_definer.sql`, un fix de
  producción real (RLS de `app.is_staff()`/`app.is_admin()` sin
  `SECURITY DEFINER` rompía la lectura anónima del catálogo) que se aplicó
  a la base pero nunca se commiteó al repo. Se reconstruyó el archivo con
  el contenido exacto leído de la base (no una aproximación) y se agregó al
  repo, en vez de marcarlo como revertido. Con eso resuelto, `db push`
  corrió limpio: `anteproyectos.proyectos` y `anteproyectos.suscripciones`
  existen en la base real, y `anteproyectos` quedó sumado a la lista de
  schemas expuestos a PostgREST (verificado con `db query` después de
  aplicar).
- 2026-08-26 — **A3 probado de punta a punta en el navegador real.** Se
  cargó `.env.local` en `apps/anteproyectos` con las mismas credenciales de
  Supabase que ya usa `apps/terreno` (mismo proyecto, no son nuevas). Con el
  permiso explícito de Jonatan se creó una cuenta de prueba descartable
  (`prueba.anteproyectos@arteytierra.org`), confirmada por SQL directo
  (`email_confirmed_at`) en vez de depender de un buzón real. Flujo
  verificado: registro → login → `middleware.ts` deja pasar y muestra la
  app → guardar proyecto (mensaje de éxito en la UI) → confirmado que quedó
  en `anteproyectos.proyectos` con `db query` directo, no sólo por el
  mensaje de la UI → recarga de página muestra el proyecto en la lista con
  sus metadatos correctos (6 ambientes, 90 m², fecha). Cuenta y proyecto de
  prueba borrados al terminar, sin residuos en producción. Único hallazgo
  menor: tras guardar, la lista de proyectos guardados no se refresca sola
  (queda vacía hasta recargar) — cosmético, no de datos; queda anotado para
  una pasada de UI, no bloquea nada.
- 2026-08-26 — **A4, primer tramo: mapa de selección de sitio con el
  recorrido del sol.** Reemplaza los inputs de lat/lng a mano por un mapa
  Leaflet real (`components/mapa/MapaSitio.tsx`, montado sólo en cliente vía
  `next/dynamic` + `ssr:false`, mismo patrón que `apps/terreno`): click para
  ubicar el sitio, botón "Usar mi ubicación" (geolocalización del navegador),
  y en cuanto hay un punto elegido se dibuja el arco solar del año encima
  (`ArcoSolarLayer`, portado de `apps/terreno/components/mapa/
  vectorLayers.tsx` con sus 3 íconos necesarios de `iconos.ts`, sobre
  `lib/sitio/arcoSolar.ts` — el cálculo de `arco_solar.ts` de terreno,
  autocontenido, portado tal cual). Los inputs de lat/lng se mantienen debajo
  del mapa como fallback/edición manual, sincronizados en los dos sentidos.
  **Hallazgo al portar:** `reactStrictMode: true` (el default de este
  proyecto) rompe a Leaflet en dev ("Map container is already initialized")
  por el doble-mount de Strict Mode — mismo problema que `apps/terreno` ya
  había resuelto poniendo `reactStrictMode: false` en su `next.config.ts`;
  se aplicó el mismo ajuste acá. Probado en el navegador real con una cuenta
  de prueba (permiso explícito de Jonatan): click en el mapa fija lat/lng
  correctamente, se renderizan 14 marcadores y 12 trazos del arco solar sin
  errores de consola. `lib/sitio/arcoSolar.ts` sumó 7 tests nuevos (incluido
  uno que documenta explícitamente la convención heredada de terreno: las
  etiquetas de fecha son las del hemisferio sur — "solsticio_verano" es
  diciembre — así que en un sitio del hemisferio norte el resultado se
  invierte; no es un bug, es la nomenclatura de origen del equipo). 130/130
  tests de anteproyectos, typecheck limpio. Se agregaron `leaflet`,
  `react-leaflet` y `@types/leaflet` a `package.json` (mismas versiones que
  terreno, mismo warning de peer-deps con React 19 que terreno ya tiene en
  producción sin problema real).
  **Pendiente de A4:** capas activables tipo `CAPAS_DEFAULT` (elevación,
  pendiente, curvas de nivel — hoy el mapa sólo tiene el tile base de OSM) y
  la subida de fotos/dibujos/modelos a Cloudflare R2 (todavía usa
  `lib/ingesta/carpeta.ts`, que lee una carpeta local, no una subida real).
