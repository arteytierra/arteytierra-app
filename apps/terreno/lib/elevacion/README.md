# `lib/elevacion/` — DEM multi-fuente (server-side)

Capa de proveedores de elevación. Dado un punto/bbox, **rutea a la mejor fuente
disponible** para esa ubicación (nacionales de alta resolución donde existen;
global GLO-30 en el resto; SRTM como último respaldo) y devuelve una grilla
densa uniforme, ocultando al resto de la app de qué servicio vino cada celda.

Todo corre **server-side** (lee COGs y APIs de agencias). El consumidor pide una
grilla; no elige proveedor.

## Flujo

```
index.ts ──▶ router.ts ──▶ proveedor nacional (si aplica)
   │                    └─▶ glo30.ts / grilla.ts (global 30 m)
   │                    └─▶ srtm.ts (respaldo OpenTopoData)
   └──▶ atribucion.ts  (crédito legal obligatorio por fuente)
```

## Núcleo

| Archivo | Qué hace |
|---|---|
| `index.ts` | Punto de entrada. Rutea la fuente y garantiza una grilla válida. |
| `router.ts` | Elige la fuente por ubicación (regla del audit: donde hay servicio nacional, se usa). |
| `tipos.ts` | Tipos compartidos de la capa de proveedores. |
| `grilla.ts` | Grilla densa GLO-30 leída server-side de los COGs de Copernicus. |
| `glo30.ts` | Proveedor Copernicus GLO-30 (DEM global 30 m) directo de los COGs. |
| `srtm.ts` | Respaldo SRTM 30 m vía OpenTopoData (lo que usaba `/api/elevacion`). |
| `atribucion.ts` | Crédito legal por fuente. **Copernicus exige atribución** — no quitar. |

## Proveedores nacionales (`proveedores/`)

Alta resolución donde el país publica LiDAR/DTM abierto. Cada uno pide una grilla
ya resuelta para el bbox y la normaliza al formato común.

| Archivo | País / fuente | Resolución · licencia |
|---|---|---|
| `usgs3dep.ts` | EE.UU. — USGS 3DEP | 1 m / 10 m · dominio público |
| `ignfr.ts` | Francia — IGN RGE ALTI | 1 m / 5 m |
| `ignes.ts` | España — IGN MDT (PNOA-LiDAR) | 5 m / 25 m · CC-BY 4.0 |
| `hrdemca.ts` | Canadá — HRDEM (CanElevation) | 1–2 m · OGL-Canada |
| `ahnnl.ts` | Países Bajos — AHN | 0,5 m · datos abiertos |
| `swisstopo.ts` | Suiza — swissALTI3D | 0,5 m / 2 m · © swisstopo |

## Al agregar un proveedor nacional

1. Nuevo archivo en `proveedores/` que devuelva la grilla normalizada del bbox.
2. Registrar su cobertura geográfica en `router.ts`.
3. Agregar el crédito legal en `atribucion.ts` (obligatorio).
4. Degradar con gracia a GLO-30 si la fuente nacional falla o no cubre el bbox.
