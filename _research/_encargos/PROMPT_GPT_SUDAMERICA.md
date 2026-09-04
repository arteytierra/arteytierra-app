# Encargo — Ecosistemas y saberes de Sudamérica

Seguimos con el mismo método que usaste en Centroamérica/Caribe y en
México/Estados Unidos. Ahora toca **Sudamérica**, que es la región donde la app
más se usa y, paradójicamente, la que tiene el catálogo más grueso.

Trabajás en carpeta nueva:
`C:\Arte y Tierra\0. Claude\_research\ecosistemas-saberes-sudamerica\`

No toques `apps/`, `packages/` ni `supabase/`. No hagas commit.

## Por qué esta región es la más urgente

Las 12 fichas sudamericanas de `apps/terreno/lib/contexto.ts` se escribieron
pensando en la Argentina y después se estiraron a todo el subcontinente. El
resultado, medido: de los 56 ECO_ID sudamericanos curados hoy, **33 apuntan a
una sola ficha, `selva_tropical`**. Es decir que la Amazonía occidental, las
várzeas del Amazonas, los bosques del escudo guayanés y la selva paranaense
misionera comparten un único texto que habla de yerba mate y kokue guaraní.
Un predio en Loreto o en el Rupununi recibe hoy una ficha del alto Paraná.

Además hay ecorregiones enteras que **a propósito** quedaron sin curar, porque
ninguna de las 12 fichas las describe y preferimos que caigan al bioma global
de RESOLVE antes que a la ficha argentina más parecida:

- **Caatinga** (semiárido brasileño)
- **Chaco húmedo** (que no es el Chaco seco)
- **Pantanal**
- **Páramos andinos** — hoy caían en "Puna" por pasar los 2800 m, cuando el
  páramo recibe 1000–2000 mm al año y la puna menos de 400
- **Chocó–Darién** (el flanco pacífico hiperhúmedo)
- **Valles secos interandinos** (Marañón, Mantaro, Chuquisaca, Patía)

Esos seis son la prioridad número uno del encargo. La prioridad número dos es
**partir `selva_tropical`** en fichas que se distingan de verdad.

## Contrato de datos

Idéntico al que ya entregaste. Cada ficha ecológica:

```
id, nombre, emoji, color, resumen, vegetacion, fauna, suelos,
saberes: []            // SIEMPRE vacío en la ficha ecológica
especies: [...],
fuentes: [{label, url}],
_meta: { ecorregiones_resolve: [...], paises: [...], confianza, notas }
```

Y las dos capas separadas desde el principio, como en la entrega americana:

1. **Ecología base** — una sola ficha dueña por ECO_ID. Global, no por país.
2. **Saberes territoriales** — inventario aparte, con pueblo o portadores,
   país, territorio mínimo, fuente, cautelas y estado de geometría. País o
   Köppen nunca alcanzan para activar un saber.

## Regla de colisiones (la misma que resolviste bien la vez pasada)

Para cada ECO_ID declarás una acción: `CONSERVAR_ACTUAL`, `AMPLIAR_SIN_REMAPEAR`,
`REEMPLAZAR` o `AGREGAR`. Ningún `REEMPLAZAR` sin decir qué ficha quedaría
huérfana y cómo se evita.

Diferencia con la entrega anterior: acá **el remapeo sí está sobre la mesa**,
porque el problema es justamente que 33 ECO_ID comparten ficha. Si proponés
partir `selva_tropical`, decí explícitamente qué ECO_ID se queda con ella
(sugerencia: la selva paranaense/misionera, que es de lo que habla el texto) y
cuáles se van a fichas nuevas. Lo mismo si `puna_altoandino` o `yungas` te
quedan chicas. Lo que no puede pasar es que una de las 12 fichas actuales se
quede sin ningún ECO_ID.

## ECO_ID sudamericanos ya tomados en `lib/ecorregiones.ts`

- **selva_tropical** (33): 439, 440, 441, 442, 443, 446, 463, 464, 465, 466,
  467, 469, 473, 474, 476, 480, 482, 483, 484, 485, 491, 492, 496, 497, 498,
  500, 503, 505, 507, 508, 511, 512, 518
- **yungas** (4): 444, 460, 493, 504
- **puna_altoandino** (3): 587, 588, 589
- **sabana_cerrado** (3): 567, 570, 572
- **pampa** (2): 574, 576 · **monte** (2): 577, 592 · **estepa_patagonica** (2):
  578, 595 · **desierto_costero** (2): 598, 608 · **bosque_andino_patagonico**
  (2): 561, 563
- **chaco_seco** (1): 569 · **espinal** (1): 575 · **mediterraneo** (1): 596

La caja de Sudamérica que usa la app va de latitud −56 a +13 y longitud −82 a
−34, y adentro de esa caja RESOLVE tiene unas 125 ecorregiones. O sea que hay
alrededor de **70 ECO_ID sudamericanos sin curar**. Ésos son el terreno nuevo.

No pises ninguno de los 143 ECO_ID que ya entregaste para Mesoamérica y
Norteamérica; varios del norte de Colombia y Venezuela y de Trinidad están en
esa lista y ya tienen dueño (mirá
`_research/ecosistemas-saberes-mesoamerica-norteamerica/fase-1-ecologia/mapeo-eco-id-nuevo.json`).

## Alcance

Colombia, Venezuela, Guyana, Surinam, Guayana Francesa, Ecuador, Perú, Bolivia,
Brasil, Paraguay, Uruguay, Argentina y Chile. Incluí las Galápagos y las islas
oceánicas como auditoría, no como relleno.

## Entregables

- `README.md`
- `fase-1-ecologia/fichas-ecologicas-nuevas.json` (con `saberes: []`)
- `fase-1-ecologia/mapeo-eco-id-nuevo.json`
- `fase-1-ecologia/decisiones-colisiones.json`
- `fase-1-ecologia/reporte-validacion.json`
- `fase-2-saberes-territoriales/inventario-saberes-documentados.json`
- `MATRIZ_ECO_ID.md`, `AUDITORIA_COLISIONES.md`, `FUENTES.md`, `RESUMEN.md`

## Cautelas

Fuentes oficiales, académicas o de organismos internacionales, con fecha de
consulta. Para saberes tradicionales, atribución explícita y límites de uso: no
publiques sitios sagrados, coordenadas, recetas medicinales, calendarios
ceremoniales ni de extracción. Nada de convertir fuego, pastoreo, pesca o
medicina en receta universal. Y no metas claves de API, tokens ni credenciales
en la carpeta: es regla del repo.

Avisá cuando esté listo para revisión. El montaje a `lib/` lo hace Claude.
