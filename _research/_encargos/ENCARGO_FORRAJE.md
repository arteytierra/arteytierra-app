# Encargo — producción forrajera con fuente

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\forraje\NN.json`.*

---

## Qué hay que reemplazar, y por qué importa

Una app de diseño de predios estima la producción forrajera natural con esta
función, que **no tiene ninguna fuente**:

```
lluvia anual < 300 mm → 700 kg MS/ha/año
          < 500 mm → 1.500
          < 700 mm → 3.000
          < 900 mm → 5.000
          ≥ 900 mm → 7.000
```

Ese número multiplica todo lo que viene después: la oferta de pasto, el balance
forrajero, la carga animal, el tamaño del rodeo y el agua que hay que almacenar
para esa hacienda. Si está mal, el usuario no ve un error: ve un número
plausible, y compra vacas o excava una represa con eso.

Y falsea en una dirección conocida: **la lluvia anual no distingue estacionalidad
ni temperatura**. 600 mm repartidos en un pastizal templado y 600 mm en cuatro
meses de una sabana tropical reciben el mismo 3.000, y no producen lo mismo. Un
pastizal de montaña a 3.000 m con 800 mm tampoco produce como una pampa con 800.

**No hay que inventar una fórmula mejor. Hay que traer lo que está publicado.**

## La entrega, en dos etapas

### Etapa 1 — los 14 biomas de RESOLVE (lotes 01 a 05, 3 biomas por lote)

Una entrada por bioma, con el rango publicado de producción de materia seca de
su vegetación herbácea. Los 14, con el `id` que hay que usar:

| `id` | Bioma (nombre de RESOLVE) |
|---|---|
| `bosque_tropical_humedo` | Tropical & Subtropical Moist Broadleaf Forests |
| `bosque_tropical_seco` | Tropical & Subtropical Dry Broadleaf Forests |
| `conifera_tropical` | Tropical & Subtropical Coniferous Forests |
| `bosque_templado_mixto` | Temperate Broadleaf & Mixed Forests |
| `conifera_templada` | Temperate Conifer Forests |
| `boreal_taiga` | Boreal Forests/Taiga |
| `sabana_tropical` | Tropical & Subtropical Grasslands, Savannas & Shrublands |
| `pastizal_templado` | Temperate Grasslands, Savannas & Shrublands |
| `pastizal_inundable` | Flooded Grasslands & Savannas |
| `pastizal_montano` | Montane Grasslands & Shrublands |
| `tundra` | Tundra |
| `mediterraneo` | Mediterranean Forests, Woodlands & Scrub |
| `desierto_xerofilo` | Deserts & Xeric Shrublands |
| `manglar` | Mangroves |

Campos de cada entrada:

```json
{
  "id": "pastizal_templado",
  "kg_ms_ha_anio_min": 0,
  "kg_ms_ha_anio_max": 0,
  "kg_ms_ha_anio_tipico": 0,
  "metodo": "Cómo lo midió la fuente: cortes de biomasa, NPP por satélite, modelo, estimación de receptividad.",
  "que_cuenta": "Si es materia seca total aérea, sólo la fracción herbácea, o sólo la fracción consumible.",
  "rango_lluvia_mm": "Para qué rango de precipitación anual vale ese número.",
  "estacionalidad": "Cómo cambia si la misma lluvia cae concentrada en pocos meses. Si la fuente no lo dice, decirlo.",
  "donde_deja_de_valer": "Las condiciones fuera de las cuales la fuente no se aplica.",
  "fuentes": [{ "label": "…", "url": "…" }],
  "verificacion": "…",
  "nota": ""
}
```

**`que_cuenta` es el campo que más se equivoca y el que más importa.** La
producción primaria neta aérea de un bioma incluye el estrato leñoso; la materia
seca disponible para un rodeo es sólo parte del herbáceo, y a eso todavía hay
que descontarle lo que no se puede pastorear. Si la fuente mide una cosa y la
usamos como la otra, el error es de varias veces y no de un porcentaje.

Dos fuentes independientes por bioma cuando se puedan conseguir. **Si las dos no
coinciden, se entregan las dos y se dice en `nota`** — que dos mediciones
publicadas discrepen es información, no un problema a resolver promediando.

### Etapa 2 — las regiones ganaderas con dato propio (lotes 06 en adelante)

Donde haya un organismo que publique receptividad o producción de materia seca
por región, eso vale más que el bioma. Interesan, en este orden:

1. **Argentina** — INTA, por región ganaderas (pampa húmeda, pampa deprimida,
   espinal, chaco semiárido, monte, Patagonia, Mesopotamia).
2. **Brasil** — EMBRAPA (cerrado, pantanal, caatinga, pampa gaúcho).
3. **Estados Unidos** — NRCS *Ecological Site Descriptions*, que publican
   producción anual favorable/normal/desfavorable por sitio.
4. **Australia** — CSIRO / ABARES / los departamentos estatales, para los
   rangelands áridos.
5. **México** — COTECOCA / INIFAP, coeficientes de agostadero.
6. **Uruguay, Paraguay, Bolivia, Chile** — INIA, IPTA y equivalentes.
7. **África oriental y del sur** — ILRI, FAO.
8. **Cuenca mediterránea y Cercano Oriente** — ICARDA.

Misma forma, con el `id` que arme GPT (`ar_pampa_deprimida`, `us_ned_42_mlra`…)
más tres campos:

```json
"pais": "AR",
"region": "Nombre como lo llama el organismo",
"organismo": "INTA"
```

Los organismos nacionales suelen publicar en **receptividad** (EV/ha, UG/ha,
cabezas/ha) en vez de en kg de materia seca. **No convertir.** Entregar el número
como lo publica la fuente, en `receptividad_valor` y `receptividad_unidad`, y
dejar la conversión para después: el factor depende del equivalente que use cada
país y mezclarlos es exactamente cómo se arruina esto.

## Lo que no entra

- Ningún número sin fuente abierta y verificada.
- Ningún promedio de dos fuentes. Si hay dos, van las dos.
- Ninguna extrapolación a un bioma donde no se midió. Mejor vacío con el motivo.
- Nada de riego ni de pastura implantada. Esto es **producción natural**: lo que
  da el lugar sin sembrar y sin regar. Si la fuente mide pastura sembrada, se
  dice en `que_cuenta` y no se usa como si fuera lo mismo.
