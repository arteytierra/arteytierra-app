# Estados Unidos — SSURGO vía Soil Data Access (USDA-NRCS)

**Tipo:** suelo
**Estado:** VIVA
**Prioridad sugerida:** alta — **IMPLEMENTADA** el 30/08/2026

Ficha de referencia: fue la primera fuente nacional de suelo que entró y el
adaptador (`apps/terreno/app/api/suelo/ssurgo/route.ts`) sirve de modelo para
las que vengan.

## Qué mejora sobre la fuente global

Compite con SoilGrids 250 m. La diferencia no es de resolución sino de
naturaleza: SoilGrids es un **modelo** que interpola perfiles dispersos y estima
las propiedades hidráulicas por pedotransferencia; SSURGO es el **relevamiento**
—polígonos mapeados a campo, perfiles descriptos horizonte por horizonte por un
edafólogo, y agua útil, conductividad y grupo hidrológico medidos.

| | SoilGrids | SSURGO |
|---|---|---|
| Perfil | modelo interpolado a 250 m | descripto a campo |
| Agua útil | estimada (Saxton-Rawls) | **medida** |
| Conductividad saturada | estimada | **medida** |
| Grupo hidrológico | derivado de la Ksat estimada | **el oficial del NRCS** |

## Cobertura

Los 50 estados, Puerto Rico e Islas Vírgenes. El detalle varía por *survey
area*, y hay condados sin levantar donde el servicio devuelve tabla vacía.

Bounding boxes del router (`apps/terreno/lib/sueloFuentes.ts`):

```
[-125.0, 24.4, -66.9, 49.5]   EE.UU. contiguo
[-160.3, 18.9, -154.7, 22.3]  Hawái
[-168.2, 54.4, -129.9, 71.5]  Alaska
[-67.3, 17.6, -64.5, 18.6]    Puerto Rico e Islas Vírgenes
```

## Licencia

Obra del gobierno federal de Estados Unidos → **dominio público** por
17 U.S.C. §105. Uso comercial libre, sin obligación de atribuir (igual se
atribuye).

- https://sdmdataaccess.sc.egov.usda.gov/

## Acceso técnico

- **Endpoint:** `POST https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest`
- **Formato:** recibe **T-SQL** en el cuerpo y devuelve JSON.
- **Sin clave ni registro.**

**Cuerpo del POST que funciona** (`Content-Type: application/json`):

```json
{
  "SERVICE": "query",
  "FORMAT": "JSON+COLUMNNAME",
  "QUERY": "SELECT TOP 60 mu.muname, mu.mukey, c.cokey, c.compname, c.comppct_r, c.hydgrp, c.taxorder, c.drainagecl, c.slope_r, h.hzname, h.hzdept_r, h.hzdepb_r, h.claytotal_r, h.sandtotal_r, h.silttotal_r, h.om_r, h.dbthirdbar_r, h.ph1to1h2o_r, h.ksat_r, h.awc_r, h.wthirdbar_r, h.wfifteenbar_r FROM mapunit mu JOIN component c ON c.mukey = mu.mukey LEFT JOIN chorizon h ON h.cokey = c.cokey WHERE mu.mukey = (SELECT TOP 1 mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('point(-93.6000 41.9000)')) AND c.comppct_r = (SELECT MAX(c2.comppct_r) FROM component c2 WHERE c2.mukey = mu.mukey) ORDER BY h.hzdept_r"
}
```

La función `SDA_Get_Mukey_from_intersection_with_WktWgs84` es la que convierte un
punto en unidad cartográfica. El `WHERE ... = MAX(comppct_r)` se queda con el
**componente dominante**: una unidad es un mosaico (85% Clarion, 10% Nicollet,
5% otro) y promediarlos daría un suelo que no existe en ningún lado.

**Respuesta real** (recortada; formato `{"Table":[[nombres],[fila],…]}`):

```json
{"Table":[
 ["muname","mukey","cokey","compname","comppct_r","hydgrp","taxorder","drainagecl","slope_r","hzname","hzdept_r","hzdepb_r","claytotal_r","sandtotal_r","silttotal_r","om_r","dbthirdbar_r","ph1to1h2o_r","ksat_r","awc_r","wthirdbar_r","wfifteenbar_r"],
 ["Clarion loam, Bemis moraine, 2 to 6 percent slopes","408340","...","Clarion","85","B","Mollisols","Well drained","4","Ap","0","23","21.0","45.0","34.0","3.5","1.30","6.2","9.1700","0.21","28.6","14.5"],
 ["...","...","...","Clarion","85","B","Mollisols","Well drained","4","A","23","35","21.0","45.0","34.0","2.5","1.35","6.2","9.1700","0.18","28.1","13.8"]
]}
```

Fuera de las áreas relevadas responde **200 con la tabla vacía**. Eso no es un
error: es "acá no hay SSURGO", y hay que caer a SoilGrids.

- **Límites de request:** no publicados. Conviene acotar con `TOP`.
- **Latencia observada:** 2–5 s. Medido el 30/08/2026.

## Campos que devuelve

| Campo | Qué es | Unidad | Equivale en la app a |
|---|---|---|---|
| `claytotal_r` / `sandtotal_r` / `silttotal_r` | textura | % | arcilla / arena / limo |
| `om_r` | materia orgánica | **%** | `carbono_org` — convertir |
| `dbthirdbar_r` | densidad aparente a 1/3 bar | g/cm³ | densidad aparente |
| `ph1to1h2o_r` | pH en agua 1:1 | — | pH |
| `ksat_r` | conductividad saturada | **µm/s** | `ksat` — convertir |
| `awc_r` | agua útil | cm/cm | `awc_frac` (ya es fracción) |
| `wthirdbar_r` / `wfifteenbar_r` | capacidad de campo / punto de marchitez | **% volumétrico** | `cc` / `pmp` — convertir |
| `hydgrp` | grupo hidrológico oficial | A/B/C/D o dobles | grupo hidrológico |
| `hzdept_r` / `hzdepb_r` | techo y piso del horizonte | cm | remapeo de perfil |

**Ojo con las unidades.** Cuatro conversiones obligatorias:

1. `ksat_r` en **µm/s** → mm/h es `× 3,6`.
2. `om_r` en **%** → carbono orgánico en g/kg es `÷ 1,724 × 10` (Van Bemmelen).
3. `wthirdbar_r` / `wfifteenbar_r` en **% volumétrico** → fracción es `÷ 100`.
   `awc_r`, en cambio, ya viene en cm/cm: no dividir.
4. `hydgrp` puede venir doble (`A/D`, `B/D`, `C/D`): son "drenado/sin drenar".
   Se toma la **segunda** letra, que es la condición real de un campo sin
   intervenir y la conservadora para escorrentía.

Y una trampa estructural: **los horizontes de SSURGO son irregulares** (0-23,
23-35, 35-84, 84-200 cm), no las seis bandas fijas de SoilGrids. Hay que
remapearlos promediando por cuánto cruza cada horizonte cada banda
(`perfilSsurgo` en `apps/terreno/lib/suelos.ts`), o nada de lo que ya consume el
perfil sigue funcionando.

## Qué falta o qué no da

- **Nitrógeno total**: SSURGO no lo mide. En la app se estima con C:N ≈ 10 y
  queda declarado como estimación en la línea de fuente.
- **Condados sin relevar**: tabla vacía → SoilGrids.

## Verificación

Probado el **30/08/2026** contra un punto real en Iowa (41,90 / −93,60), unidad
"Clarion loam, Bemis moraine, 2 to 6 percent slopes". Ese perfil quedó como
fixture del test en
`apps/terreno/tests/unit/aguas/suelosSsurgo.test.ts`.
