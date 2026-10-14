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

## Estado al 14/10/2026 (tarde): montados los lotes 01 al 07

**Sesenta fichas cerradas de sesenta y dos.** A las 46 de los lotes 01 al 06 se
suman las 14 del lote 07, que recuperó casi todas las que habían vuelto vacías:
Hiyaz, terrazas del Yemen, Asir, Socotra, Lut, Alborz, Gomishan, pistacho
afgano, Sinop, Anatolia oriental, Cólquida, Cáucaso, Kurdamir y Yalta.
**No volver a pedir ninguna de las sesenta.**

**Lo que falta son dos**, pedidas en `ENCARGO_FUENTES_PROPIAS_LOTE_08.md`:

- `tauro_conifera_montana`, que necesita **otra** fuente. La que se eligió es
  buena pero no tiene resumen público en ningún índice y el editor bloquea, así
  que nada de lo que afirma se puede chequear.
- `kuh_rud_montano`, con una vacía bien declarada y un intento más por delante.

Con eso el encargo se cierra.

## Estado al 14/10/2026: montados los lotes 01 al 06

**Cuarenta y seis fichas cerradas.** A las 31 de los lotes 01 al 04 se suman las
15 de los lotes 05 y 06: ocho de Medio Oriente (Wahiba, manglar del mar Rojo,
Tihama, Dofar, Hadramaut, sur de Irán, Kopet Dag, Sistán), cuatro de EuropaUE
(estepa de Anatolia, estepa póntica, estepa forestal del este, Zagros) y las tres
de Canadá (boreal del escudo, tundra ártica, desierto polar). **Norte de África y
Canadá están cerrados.** La cuenta bajó de **62 a 16**. **No volver a pedir
ninguna de las cuarenta y seis.**

**Lo que falta son las 16 que volvieron vacías** en los lotes 05 y 06 —Medio
Oriente 9, EuropaUE 7—, pedidas de nuevo en
`ENCARGO_FUENTES_PROPIAS_LOTE_07.md`. No volvieron por falta de fuente: el motivo
declarado fue que la página no se pudo abrir, que es otra cosa.

## Estado al 13/10/2026 (tarde): montados los lotes 01 al 04

**Treinta y una fichas cerradas** y el norte de África terminado. A los
dieciocho de los lotes 01 a 03 se suman las trece del lote 04: Magreb,
conífera del Atlas, enebral del Alto Atlas, delta del Nilo, chotts, erg
occidental, Sahara oriental, Sahara sur, costa atlántica, Ahaggar, Tibesti,
costa del mar Rojo y estepa del norte sahariano. La cuenta bajó de **62 a 31**.
**No volver a pedir ninguna de las treinta y una.**

**Lo que falta:** Medio Oriente 17, EuropaUE 11 y Canadá 3, que son los lotes
05 y 06 ya encargados en `ENCARGO_FUENTES_PROPIAS_LOTES_05_06.md`. Con eso el
trabajo se cierra.

## Estado al 13/10/2026: montados los lotes 01, 02 y 03

**Dieciocho fichas cerradas.** Seis de EuropaUE en el lote 01 (Apeninos, karst
dinárico, Adriático ilirio, Stara Planina, Rhodopi, Piatra Craiului), seis de
Medio Oriente en el 02 (marismas de Mesopotamia, harrat, desierto arábigo, Nefud
y Rub al-Jali, llanura del Golfo, manglar del Golfo) y seis más de EuropaUE en el
03 (conífera costera escandinava, abedular montano, Egeo, Creta, Troodos,
conífera del Mediterráneo oriental). La cuenta bajó de **62 a 44**. **No volver a
pedir ninguna de las dieciocho.**

El lote 04 está entregado y sin montar: las 13 del norte de África, todas con
fuente. Si pasa, ese paquete queda cerrado y la cuenta baja a 31.

**Lo que falta después del 04:** Medio Oriente 17, EuropaUE 11 y Canadá 3.

## Estado al 12/10/2026: los lotes 01 y 02 están montados

**Doce fichas ya cerradas.** El lote 01 fueron seis de EuropaUE —Apeninos, karst
dinárico, Adriático ilirio, Stara Planina, Rhodopi y Piatra Craiului— y el lote 02
seis de Medio Oriente —marismas de Mesopotamia, harrat, desierto arábigo, Nefud y
Rub al-Jali, llanura del Golfo y manglar del Golfo—. La cuenta bajó de **62 a 50**.
**No volver a pedir ninguna de las doce.**

Queda un lote 03 entregado y sin montar, con seis de EuropaUE: conífera costera
escandinava, abedular montano escandinavo, Egeo, Creta, Troodos y conífera del
Mediterráneo oriental. Tampoco pedir esas.

**Una cuarta condición para la fuente, que salió del lote 02:** que no esté
retractada. El artículo del Wadi Al-Jufair existe dos veces, y la versión que
aparece primero buscando por título es la retractada. Las tres condiciones
originales —abre, es la publicación, es un trabajo publicado— las cumple una
retractación igual que un artículo vivo.

**El orden que sigue:** Norte de África y Sahara (13), que cierra el paquete
entero; después lo que queda de EuropaUE (11 tras montar el lote 03), Medio Oriente
(17) y las tres de Canadá.

## Estado al 11/10/2026: el lote 01 está montado

**Las primeras seis ya entraron al código** —Apeninos, karst dinárico, Adriático
ilirio, Stara Planina, Rhodopi y Piatra Craiului— y la cuenta bajó de **62 a 56**,
medida con `medir-espesor-fichas.mjs`. **No volver a pedir esas seis.**

El lote salió bien y conviene decir por qué, porque es el molde: una fuente por
ficha, seis dominios distintos, todas instituciones del lugar —la universidad, la
facultad de forestales, el parque nacional, la revista regional— y **cada una con
su alcance declarado en `nota`**: «fuente local del parque, no un inventario de
toda la ecorregión». Eso último es lo que la hace montable. Una fuente del lugar
es de un lugar; pretender que cubre la ecorregión entera es volver al problema que
el encargo viene a resolver.

**El orden cambia:** con EuropaUE en 17, el grueso pasa a ser **Arabia,
Mesopotamia e Irán (23)** y el **norte de África y Sahara (13)** —juntos 36 de las
56—. Los lotes que siguen salen de ahí.

## Las 62 originales, por paquete. Un lote de 6 por respuesta

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
