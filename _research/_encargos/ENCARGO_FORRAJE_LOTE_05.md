# Encargo — forraje, lote 05: la sabana y el pastizal inundable, otra vez

Los mismos dos biomas del lote 04, porque después de ese lote **los dos siguen
en cero**. No es que las fuentes estuvieran mal: tres de las cuatro miden otra
cosa. Este encargo cambia una sola cosa de fondo y agrega dos campos.

## Lo que pasó en el lote 04, que es de dónde salen las reglas nuevas

| entrada | bioma | por qué no entró |
|---|---|---|
| Serengeti, Tanzania | 7 ✓ | biomasa **en pie**: 0,14 ± 0,10 kg/m², promedio de lecturas mensuales |
| Kruger, Sudáfrica | 7 ✓ | el **mayor cuadrante** cosechado de 50 × 50 cm, no una cifra de sitio |
| Pantanal, Nhecolândia | 9 ✓ | **disponibilidad por fecha**: 523 kg/ha en feb-2010, 1.698 en nov-2008 |
| Delta del Paraná | **8**, no 9 | entró, pero en el pastizal templado |

Las cuatro fuentes eran reales, abiertas y bien citadas. Los biomas verificaron
en tres de cuatro, que es la primera vez que pasa: **el campo
`bioma_verificado` del lote 04 funcionó.** Lo que falló fue otra cosa.

## Regla 1 — la coordenada es la que publica la fuente

La entrada del Delta verificó el bioma sobre un punto de referencia regional, no
sobre el sitio del estudio. Estaban a 65 km:

| punto consultado | ECO_ID | bioma | |
|---|---|---|---|
| el ancla regional, −33,9 / −58,8 | 585 | 9 | Paraná flooded savanna |
| **el sitio que publica la tesis, −33,8167 / −59,45** | **576** | **8** | **Pampa Húmeda** |

A esta escala, un ancla regional puede caer en otro bioma sin dejar de parecer
el mismo paisaje. Un pastizal de albardón que se inunda 40 días al año resultó
estar, para el mapa, en la Pampa Húmeda — y el mapa es lo que acequia consulta
cuando alguien marca su predio.

Entonces: **el bioma se consulta sobre la coordenada que la fuente publica.** Si
la fuente da una caja o un rango (por ejemplo «2° 00′–2° 30′ S, 34° 00′–34° 30′
E»), se consultan dos o tres puntos de esa caja y se informan. Si la fuente no
publica coordenada ninguna, el campo va con `"lat": null` y la entrada se marca
como `"bioma": "no_verificable"` — es una entrada válida, pero se sabe.

Los dos campos quedan separados y los dos son obligatorios:

```json
"coordenada_de_la_fuente": "19º 04'S, 56º 36'W (textual, como lo escribe la fuente)",
"bioma_verificado": {
  "lat": -19.0667, "lng": -56.60,
  "eco_name": "Pantanal", "eco_id": 584, "biome_num": 9,
  "es_el_sitio_publicado": true
}
```

`es_el_sitio_publicado` en `false` es una entrada a revisar, no un error — pero
tiene que estar declarado en ese campo y no sólo en la nota.

### Cómo se consulta

```
https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Resolve_Ecoregions/FeatureServer/0/query
  ?geometry=<lng>,<lat>&geometryType=esriGeometryPoint&inSR=4326
  &spatialRel=esriSpatialRelIntersects&outFields=ECO_NAME,ECO_ID,BIOME_NUM&returnGeometry=false&f=json
```

Si el servicio no responde, **la entrada no se manda como verificada**: se manda
con `"bioma_verificado": null` y se dice. En el lote 04 una entrada informó
ecorregión 65 cuando el sitio era 48, y la nota admitía que el servicio no había
respondido. Eso es un dato inventado con una disculpa al lado.

## Regla 2 — tiene que ser un flujo, no un stock

Es lo que rechazó tres de las cuatro. **`en_pie_o_anual` tiene que valer
`crecimiento_anual`.** Una biomasa en pie, por bien medida que esté, no sirve:
acequia la usaría para calcular cuántos animales come un campo por año, y lo que
está parado en un pastizal perenne no es lo que creció.

Está medido cuánto se equivoca eso: en el altiplano de Puno la biomasa en pie es
**1,5 a 3 veces** la anual; en la tundra de Alaska, **77 a 211**. Y en el Delta
del Paraná salió al revés y peor: el potrero con 10.533 kg/ha parados entregó
**menos** forraje cosechado (6.733) que el cortado cada dos meses, que tenía
2.237 parados y acumuló 7.417. Lo que se ve parado puede ser material viejo
muriéndose de su propia sombra.

Cuenta como flujo, en orden de preferencia:

1. **Cosechas acumuladas** a lo largo de la estación o del año, con su número de
   cortes. Es lo mejor y es lo que entró del Delta.
2. **Tasas de crecimiento** por diferencia entre cortes sucesivos (kg/ha/día o
   kg/ha/mes), con el calendario. De ahí se arma el acumulado.
3. **Jaulas de exclusión** medidas al principio y al final de un período.
4. **PPNA / NPP herbácea aérea** medida —no modelada desde satélite—, declarada
   como `npp_herbacea`.

No cuenta: disponibilidad por fecha, biomasa en pie promediada, el máximo de un
cuadrante, ni un valor de un mapa de productividad.

Si la fuente trae las dos cosas —en pie y crecimiento— van las dos, y la cifra
de los campos `kg_ms_ha_anio_*` es la del crecimiento.

## Regla 3 — decir si es lo herbáceo total o sólo lo forrajero

Campo nuevo, y sale de lo que el Delta destapó:

```json
"fraccion": "herbacea_total" | "solo_forrajeras" | "no_lo_dice"
```

En la misma cosecha del Delta, la MS total del pastizal fue 11.200–11.400 kg/ha
y la MS de especies forrajeras 6.700–8.250. **La total es de 1,36 a 1,70 veces
la forrajera**, porque el abrojo grande y las demás no forrajeras se llevan una
parte grande de un pastizal degradado. Tomar una por la otra sobreestima la
carga animal hasta un 70 %.

La escalera que acequia quiere reemplazar nunca dijo cuál de las dos era, y ahí
está el chiste: con la lluvia de ese sitio da 7.000 kg/ha/año, que **cae adentro
del rango forrajero y se queda 1,6 veces corta contra el total**. El mismo
sitio, la misma cosecha, y el veredicto se da vuelta según qué se compare.

## Dónde conviene buscar

### `sabana_tropical` (bioma 7)

Lo que falta es un sitio con producción medida, y para savana existen estudios
clásicos que la midieron a propósito:

- **Lamto, Costa de Marfil.** Sitio del Programa Biológico Internacional, con
  medición de producción primaria de la capa herbácea a lo largo de años y con
  régimen de fuego controlado. Publicado por ORSTOM/IRD y en la serie
  *Ecosystems of the World*. Es probablemente la savana mejor medida del mundo.
- **Nylsvley, Sudáfrica.** El otro sitio del IBP, savana de *Burkea africana*,
  con PPNA herbácea medida y separada por estrato (Scholes y Walker).
- **Land types del Territorio del Norte y de Queensland, Australia.** Los
  informes de land type publican crecimiento de pastura en kg MS/ha/año por
  tipo de suelo y régimen de lluvia, y vienen con la receptividad al lado.
  Buscar «pasture growth» y no «pasture biomass».
- **Receptividad de Sudáfrica (grazing capacity, ha/LSU)** del Departamento de
  Agricultura. Es `receptividad` y no `ms_herbacea_total`, así que **no entra al
  código** —acequia descuenta el uso admisible por su cuenta río abajo— pero
  sirve para contrastar, y conviene mandarla marcada como tal.
- **EMBRAPA Cerrados.** Produção de matéria seca de pastagens nativas, con
  cortes. Hay series largas.
- **KALRO, Kenia,** y los ensayos de exclusión de largo plazo del Serengeti y de
  Kruger, que si publicaron cosechas repetidas sirven; el trabajo del lote 04
  publicó sólo el stock.

### `pastizal_inundable` (bioma 9)

- **Camarão et al. 2006**, de primera mano. El documento del Pantanal lo cita
  con producción anual de materia seca de 1.578 a 8.329 kg/ha para *Hymenachne
  amplexicaulis* en llanuras de inundación amazónicas. Es la cita más
  prometedora que dejó el lote 04 y hay que ir al trabajo original: si mide
  producción y publica coordenada, entra. Ojo: Amazonia inundable puede no ser
  bioma 9, así que el bioma se verifica igual.
- **INTA Delta del Paraná.** La estación de INTA Delta publica sobre pastizales
  de albardón y de bañado. Es el lugar más valioso posible, por dos motivos: hay
  predios reales de acequia ahí, y las islas del Delta Medio **sí** son bioma 9
  en buena parte de su extensión, aunque el sitio de la tesis del lote 04 no lo
  fuera.
- **Llanos de Venezuela y de Colombia.** Savana inundable, con trabajos de
  producción primaria del IBP en Apure y en los llanos del Orinoco. Clásicos y
  medidos.
- **Esteros del Iberá, Corrientes.** Aviso: los verifiqué y son **bioma 7**, no
  9. Si aparece una medición de ahí, va a la sabana.
- **Fichas de sitio ecológico del NRCS** para las MLRA de marisma de Florida y
  del Golfo (150, 151, 155, 156). Publican producción anual en lb/acre por
  comunidad y por año seco / normal / húmedo, que es exactamente la forma que
  este archivo necesita.
- **Embrapa Pantanal**, buscando esta vez taxa de crescimento o acúmulo, no
  disponibilidade.

## Lugares ya verificados, para ahorrar el paso

Siguen valiendo los once del lote 04, y se agregan los de este:

| lugar | lat, lng | ECO_ID | bioma |
|---|---|---|---|
| Serengeti sur (caja del estudio) | −2,25 / 34,25 | 57 | **7** |
| Kruger, sitio de basaltos del sur | −25,2364 / 31,9039 | 48 | **7** |
| Kruger, centro-norte (mopane) | −24,0 / 31,5 | 65 | **7** |
| Fazenda Nhumirim, Nhecolândia | −19,0667 / −56,60 | 584 | **9** |
| Delta Medio, isla de Baradero | −33,8167 / −59,45 | 576 | **8** ⚠ |
| Delta Medio, más al norte | −33,60 / −59,20 | 585 | **9** |
| Delta, islas al este de Baradero | −33,85 / −59,25 | 585 | **9** |

El contraste entre las tres últimas filas es la regla 1 en una tabla: tres
puntos a menos de 25 km, dos biomas.

## Las cuatro condiciones, que no cambian

1. **Que diga quién midió y cuándo**, con el año de la medición y no el de
   publicación.
2. **Que se pueda abrir.** Si pide login o paga, no entra. Un resumen público
   con la cifra adentro alcanza; un resumen que no la tiene, no.
3. **Que diga qué midió**, con unidades y con qué incluye. «Materia seca» sin
   decir si es aérea, si son todas las especies y a qué altura se cortó no
   alcanza.
4. **Que diga dónde**, con coordenada o con un lugar que se pueda ubicar en un
   mapa.

Y la de siempre: **si una fuente no se pudo abrir por un problema de acceso, eso
es un reintento pendiente, no una entrada vacía.** Se declara en `vacias` con el
motivo, y vuelve en el lote siguiente.

## La forma de cada entrada

La misma del lote 04, con los tres campos nuevos: `coordenada_de_la_fuente`,
`es_el_sitio_publicado` dentro de `bioma_verificado`, y `fraccion`.

```json
{
  "id": "sabana_tropical",
  "coordenada_de_la_fuente": "",
  "bioma_verificado": { "lat": 0, "lng": 0, "eco_name": "", "eco_id": 0, "biome_num": 7, "es_el_sitio_publicado": true },
  "tipo_de_cifra": "ms_herbacea_total",
  "fraccion": "herbacea_total",
  "en_pie_o_anual": "crecimiento_anual",
  "kg_ms_ha_anio_min": 0,
  "kg_ms_ha_anio_max": 0,
  "kg_ms_ha_anio_tipico": null,
  "cuantas_cosechas": null,
  "receptividad_valor": null,
  "receptividad_unidad": null,
  "uso_admisible_pct": null,
  "cobertura_lenosa_pct": null,
  "regimen_de_inundacion": null,
  "metodo": "Cómo lo midió: tamaño del marco, altura de corte, temperatura de secado, cuántas cosechas y en qué fechas.",
  "que_cuenta": "Qué incluye y qué no: aéreo o con raíces, todas las especies o sólo las forrajeras, vivo o con material muerto, a qué altura se cortó.",
  "rango_lluvia_mm": "Para qué rango de precipitación anual vale. Si la fuente publica una sola media, se dice que es una sola media.",
  "estacionalidad": "Cómo se reparte en el año. Si hay curva mensual o tasas por período, va completa.",
  "donde_deja_de_valer": "Las condiciones fuera de las cuales no se aplica, incluido el tamaño del experimento y si las diferencias dieron significativas.",
  "region_medida": "",
  "medido_en": "",
  "fuentes": [{ "label": "título completo, sin abreviar", "url": "https://…" }],
  "verificacion": "Qué dice LITERALMENTE la fuente, y dónde se leyó: PDF abierto, resumen público, página del organismo. Si se citó una página, el número.",
  "nota": ""
}
```

`cuantas_cosechas` es nuevo y es chico pero decide: un número que sale de una
sola cosecha es un stock aunque se lo llame producción.

## Cómo se declara un hueco

```json
"vacias": [{ "id": "pastizal_inundable", "motivo": "…" }]
```

El motivo tiene que decir qué se buscó y por qué no alcanzó. Un motivo sobre
acceso —paywall, servicio caído, login— es un reintento y vuelve. Un motivo
sobre el contenido —sólo hay biomasa en pie, no hay coordenada— cierra el tema
para ese lugar.

## La entrega

Un solo bloque JSON, igual que siempre, en
`encargos-gpt/entregas/forraje/05.json`:

```json
{ "encargo": "forraje", "lote": 5, "fecha": "…", "entradas": [], "vacias": [] }
```

Dos a cuatro entradas por bioma está bien y es mejor que una: ya está medido que
dentro de un solo bioma la producción varía por un factor 11 —en el Pantanal,
entre 523 y 5.971 kg/ha, dos de los tres casos en la misma subregión— así que un
punto por bioma no va a alcanzar para nada.
