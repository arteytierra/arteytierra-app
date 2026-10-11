# Encargo — una fuente del lugar para 62 fichas que sólo tienen marco general

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\fuentes-propias\NN.json`.*

---

## El problema, que no es la falta de fuentes

Cada ficha ecológica de la app cita tres o cuatro fuentes. Estas 62 citan sólo
las compartidas por todo el paquete: RESOLVE aparece en 111 fichas, la base
mundial de suelos HWSD en 68, SoilGrids en 50. Son fuentes reales y buenas, y no
alcanzan, porque **describen el marco y no el lugar**.

El efecto es que la ficha queda *trazable y no verificable*. Dice, por ejemplo,
que el karst de los Alpes Dináricos tiene suelos someros sobre caliza con
pérdida de agua por fisura, y quien quiera comprobarlo encuentra como referencia
un mapa mundial de suelos. No hay dónde ir a chequear la afirmación concreta.
Es el bloque donde un error puede vivir años sin que nadie lo encuentre.

## Qué hay que traer

**Una sola fuente por ficha**, y que cumpla las tres cosas:

1. **Es de ese lugar**, no de la región ni del continente. Un servicio
   geológico nacional, un instituto agronómico del país, un atlas regional, un
   plan de manejo, una monografía del macizo o del valle.
2. **Está publicada y se abre.** Si pide suscripción o login, no sirve.
3. **Dice algo que la ficha afirma**: el suelo, la vegetación, el régimen de
   lluvia, la aptitud productiva. No vale una fuente sobre el lugar que hable de
   otra cosa.

Dos fuentes si salen fáciles. Una buena vale más que tres genéricas.

```json
{
  "id": "dinaricos_karst",
  "fuentes": [{ "label": "Título tal como lo muestra la página", "url": "https://…" }],
  "sobre": "suelos",
  "verificacion": "Qué dice esa página, con sus palabras, sobre este lugar.",
  "nota": ""
}
```

`sobre`: uno de `suelos`, `vegetacion`, `clima`, `aptitud`, `agua`, `varios`.

**Si de una ficha no sale ninguna, va a `vacias` con el motivo** y qué se
intentó. Trece de estas fichas son desierto profundo o manglar: es esperable que
algunas no tengan bibliografía propia, y decirlo es parte del trabajo.

## Las 62, por paquete. Un lote de 6 por respuesta

### Mediterráneo oriental, Balcanes, Cáucaso y Escandinavia — 23

`apeninos_montano` (montaña apenínica, Italia) · `dinaricos_karst` (karst
dinárico) · `iliria_adriatico` (bosque caducifolio ilirio) · `balcanes_mixto` ·
`montana_balcanica_sur` (Ródope y Pindo) · `carpatos_montano` ·
`estepa_pontica_chernozem` · `estepa_forestal_este` (Europa oriental) ·
`crimea_submediterraneo` · `euxino_colquico` (bosque euxino-cólquico) ·
`caucaso_mixto` · `kura_semidesierto` (Azerbaiyán) ·
`costa_conifera_escandinava` · `abedular_montano_escandinavo` ·
`egeo_esclerofilo` (Egeo y Anatolia occidental) · `creta_mediterranea` ·
`chipre_troodos` · `mediterraneo_oriental_conifera` · `tauro_conifera_montana` ·
`ponto_anatolia_norte` · `meseta_anatolia_estepa` ·
`anatolia_oriental_montana` · `zagros_estepa_forestal` (Irán/Irak)

### Arabia, Mesopotamia e Irán — 23

`mesopotamia_marismas` (Ahwar del Tigris y el Éufrates) · `harrat_basalto`
(altiplano basáltico) · `desierto_arabigo` · `nefud_rub_al_khali` ·
`golfo_llanura_costera` · `golfo_persico_mangle` · `arabia_este_niebla` ·
`mar_rojo_escarpe` · `mar_rojo_mangle` · `tihama_costa_arida` ·
`yemen_montana_aterrazada` · `asir_altiplano_seco` · `arabia_sur_bosque_niebla`
(Dofar) · `hadramaut_meseta` · `socotra` · `iran_sur_nubo_sindico` ·
`kavir_cuencas_endorreicas` · `elburz_estepa_forestal` ·
`caspio_llanura_desertica` · `kopet_dag` · `badghyz_pistacho` (Turkmenistán) ·
`kuh_rud_montano` · `sistan_registan`

### Norte de África y Sahara — 13

`magreb_bosque_mediterraneo` · `atlas_conifera_montana` · `alto_atlas_enebro` ·
`nilo_delta` · `chotts_sebkhas` · `sahara_norte_estepa` (oasis de foggara) ·
`sahara_occidental_erg` · `sahara_oriental` (desierto líbico) · `sahara_sur` ·
`sahara_costa_atlantica` · `ahaggar_tassili` · `uweinat_tibesti` ·
`mar_rojo_costa_desierto`

### Canadá — 3

`escudo_canadiense_boreal` · `tundra_artica_canadiense` ·
`alto_artico_desierto_polar`

Estas tres son el caso donde el marco general alcanza más, porque son regiones
sin agricultura de campo. Van últimas y si no sale nada propio, se cierran como
vacías sin insistir.

## Dónde buscar, por zona

- **Turquía**: el ministerio de agricultura y bosques publica inventarios y
  mapas de suelos por cuenca; hay facultades de agronomía con revistas abiertas.
- **Grecia, Italia, Croacia, Eslovenia**: los servicios geológicos nacionales y
  los planes de gestión de sitios Natura 2000, que describen suelo y vegetación
  con detalle y son públicos.
- **Cáucaso**: FAO tiene relevamientos de suelos de Georgia, Armenia y
  Azerbaiyán; también el programa ENPI de la Unión Europea.
- **Arabia**: la Autoridad de Estudios Geológicos de Arabia Saudita, el
  ministerio de ambiente de Omán, y para los manglares la base de datos de
  Global Mangrove Watch, que publica por país.
- **Irán**: la organización de investigación agrícola publica en abierto; hay
  bastante sobre los qanats, los kavires y el bosque hircano.
- **Magreb y Sahara**: el *Soil Atlas of Africa* es marco y no cuenta; sí
  cuentan los institutos nacionales (INRA Marruecos, INRAT Túnez, INRAA
  Argelia), la FAO por país y, para los oasis, los expedientes SIPAM.
- **Yemen y Socotra**: los expedientes de UNESCO y de SIPAM tienen descripción
  técnica de las terrazas y de la flora endémica.

Un relevamiento de fuentes regionales previo está en
`_research/fuentes-suelo-clima/`, por si GPT recibe después ese contexto; **no
hace falta para este encargo**.
