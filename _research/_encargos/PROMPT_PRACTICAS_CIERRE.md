# Encargo — cerrar las prácticas enumeradas por ecorregión

Escrito el 02/10/2026. **Actualizado el 03/10/2026 contra la rama, después del
lote 18.** Este archivo es el prompt completo: se pega tal cual en la sesión nueva
y no hace falta nada más.

Continúa `PROMPT_PRACTICAS_ENUMERADAS.md`, que sigue siendo **la fuente de las
reglas**: cómo se abre una fuente, cómo se copia un `label`, qué formato tiene
una entrada, qué archivos se pueden tocar. Todo eso vale igual y no se repite
acá. Lo que agrega este archivo es **dónde quedó el trabajo, cuánto falta, y las
reglas de costo que la primera corrida no tuvo** — porque esa corrida se comió
unos cien dólares de uso y hay que terminar el resto con bastante menos.

Leé los dos archivos. Si se contradicen, manda este.

---

## Dónde quedó, medido contra el repositorio

La rama es **`claude/practicas-enumeradas`** y tiene **24 commits** que no están
en `origin/main`. Lotes 01 a 18, el último `c56cc4d` del 03/10/2026.

| | Entradas | Fichas |
|---|---|---|
| Al empezar (lo que hay en `origin/main`) | 201 | 200 |
| Hoy, en la rama | **408** | 200 |

Reparto actual, contando entradas por ficha:

| Entradas por ficha | Cuántas fichas |
|---|---|
| 1 | **60** |
| 2 | **72** |
| 3 | **68** |

Ninguna tiene más de 3 y ninguna ficha nueva se agregó ni hacía falta: las 200
son las mismas. El objetivo del encargo original era **3 a 5 por ficha donde la
bibliografía lo permita**. Para que ninguna quede abajo de 3 faltan **192
entradas**: 2 en cada una de las 60 y 1 en cada una de las 72.

### Lo primero que hay que saber: nada de esto está en producción

Las 207 entradas nuevas viven **sólo en la rama**. `origin/main` sigue con 201 en
total, así que la mitad del trabajo no la ve ningún usuario. Eso se arregla en la
**etapa 3** de este encargo y es la parte más valiosa de todo lo que queda: 207
entradas ya escritas y verificadas valen más, hoy, que 192 por escribir.

Dos cosas verificadas el 03/10/2026 que vuelven esa etapa más fácil de lo que
parece: la rama está **18 commits atrás de `origin/main`** pero `main` **no tocó
ninguno de sus archivos** desde que se bifurcó, así que el merge entra sin
conflicto; y el test de la capa pasa con las 408 entradas —13 tests en verde,
corridos hoy contra el archivo de la rama—.

### Los mensajes de commit de esta rama no sirven como medida

Importa porque es con lo que uno cuenta al retomar, y acá miente. `abdadec` dice
*«agrega 16 prácticas históricas (Lote 10)»* y agregó **una**. El informe de
cierre de la última sesión habló de *«108 entradas nuevas»* cuando la rama lleva
**207**. Ninguna de las dos cifras es malicia: son cuentas de memoria.

**La cantidad se mide con el archivo, nunca con el recuerdo**, y el número que va
al mensaje de commit sale de este comando corrido después de escribir:

```bash
grep -c '^      practica: ' apps/terreno/lib/practicasHistoricas.ts
```

### Lo que quedó sin documentar

Los `COBERTURA_LOTE_NN.md` existen para los lotes **01 a 09**, y los JSON del
relevamiento crudo sólo para los lotes **02, 03 y 04**. Los lotes **10 a 18
—unas 67 entradas— no tienen ni cobertura ni JSON**: sus fuentes están en el
TypeScript, pero sin la frase de `verificacion` que permite revisarlos sin volver
a abrir las URLs.

**No se rehace ese relevamiento.** Volver a abrir 67 fuentes para escribir un
archivo de cobertura retroactivo es pagar dos veces por lo mismo. Lo que sí hay
que hacer está en la etapa 3: la revisión por muestreo. Y de acá en adelante el
JSON se escribe siempre: fue lo primero que se dejó de hacer cuando los lotes se
hicieron chicos, y es lo único que no se puede reponer después.

Un dato más para dimensionar esa revisión: **400 de las 408 entradas tienen
exactamente una fuente** y sólo 8 tienen dos. No hay contraste interno en una
entrada. Si el `label` está mal copiado, no hay una segunda cita que lo delate:
lo único que lo delata es abrir la URL.

---

## Las reglas de costo, que son nuevas y no son opcionales

La primera corrida hizo 24 commits para 207 entradas: **8,6 entradas por
commit**, y los últimos ocho lotes promediaron **6**. Cada lote pagaba una
compuerta completa —`typecheck`, `lint` sobre toda la app, 1.588 tests de terreno
y 73 de web— y volvía a cargar en contexto un archivo que hoy tiene **5.041
líneas**. La investigación en sí —buscar, abrir y leer una fuente por entrada— es
irreducible y hay que pagarla. Todo lo demás se puede hacer entre cinco y diez
veces más barato.

**1. Los lotes son de 15 fichas y nunca menos de 10.** Un lote de 6 entradas es
el peor de los dos mundos: paga todo el overhead y avanza nada. Si el contexto se
está acortando a mitad de lote, cerralo con lo que tengas —eso no cambia— pero no
*planifiques* lotes chicos.

**1 bis. Pero un lote de 15 fichas del desierto puede dar 8 entradas, y eso no
es un fracaso.** Esto hay que saberlo antes de empezar o se planifica mal y se
termina creyendo que la sesión rindió poco. El ritmo cayó de 32 y 34 entradas
—lotes 07 y 08— a 6 por lote del 12 al 18, y **no fue cansancio: fue que lo
fácil ya se hizo.** Las 68 fichas que llegaron a 3 son América templada, Europa
agrícola y el trópico habitado. De las 60 que siguen con una sola entrada,
**unas 30 son el cinturón árido** —Arabia, Sáhara, Irán, Magreb— y **8 más son
el Ártico y Groenlandia**. El encargo original las dejó para el final a
propósito. Son fichas de una fuente cada tres búsquedas, y el presupuesto se
hace con ese número, no con el de la pampa.

Donde sí hay bibliografía en ese cinturón, para no arrancar de cero: los sistemas
de **qanat, falaj y foggara** y la agricultura de oasis tienen fichas de FAO
SIPAM, expedientes de UNESCO y literatura hidráulica propia; el **pastoreo nómade**
del Sáhara y de la badia siria tiene literatura de ciencias sociales y de manejo
de pastizales; las **terrazas de Yemen** ya dieron una entrada y tienen más. Para
el Ártico, la literatura de conocimiento ecológico tradicional está en inglés y
**cuenta igual**: la regla es fuente publicada, no fuente en español.

**2. La compuerta por lote es ésta y nada más:**

```bash
npx tsc --noEmit -p apps/terreno/tsconfig.json
cd apps/terreno && npx vitest run tests/unit/contexto/practicasHistoricas.test.ts
```

El test de prácticas es el único que puede fallar por lo que escribís: valida
fuente con `https`, rótulo, período, largo del detalle, enciclopedias
colaborativas, duplicados dentro de una ficha e `id` inexistente. Los otros 1.500
no tocan esta capa. **La batería completa y el lint de toda la app se corren una
sola vez, al final de la sesión**, antes del último push.

`pnpm typecheck` y `pnpm lint` pasan por turbo, que **cachea y puede devolver un
pase falso** después de tus propias ediciones. Por eso arriba van los comandos
directos.

**3. No se corre nada de `apps/web`.** Este encargo no toca ese paquete.

**4. Nunca leas `practicasHistoricas.ts` entero.** Son 5.041 líneas y hoy es el
gasto más grande de la sesión. Para encontrar una ficha:

```bash
git grep -n "^  nombre_de_la_ficha: \[" apps/terreno/lib/practicasHistoricas.ts
```

y leé veinte líneas alrededor. Para contar cómo viene el reparto, un script en
lugar de una lectura:

```bash
node -e "const s=require('fs').readFileSync('apps/terreno/lib/practicasHistoricas.ts','utf8');const h={};for(const b of s.split(/^  (?=[a-z0-9_]+: \[)/m)){const k=b.match(/^([a-z0-9_]+): \[/);if(!k)continue;const n=(b.match(/^      practica: /gm)||[]).length;h[n]=(h[n]||0)+1;}console.log(h)"
```

**5. No revises lo que ya está escrito.** Las 408 entradas de la rama están
verificadas por las sesiones que las escribieron. Si de paso ves un error
concreto, arreglalo y decilo en el commit; lo que no se hace es una pasada de
auditoría general que no pidió nadie. La única excepción es la etapa 0, que está
abajo y ya viene con la lista hecha.

**6. En el barrido de apertura, de seis a ocho `WebFetch` por turno**, cada una
con su pregunta de verificación. Esto ya estaba en el encargo original y es lo
que más decide el costo: una fuente por turno multiplica por seis el precio de la
misma investigación.

---

## El trabajo, en cuatro etapas y en este orden

### Etapa 0 — Las 37 entradas escritas sin una sola tilde *(media hora, cero fuentes)*

Va primero porque es lo más barato del encargo y porque es un defecto, no una
preferencia: esto se imprime en pantalla y en el informe de un producto en
español argentino. El encargo ya lo declara defecto, el lote 3 ya lo corrigió una
vez, y volvió a entrar en los lotes posteriores. **37 de las 408 entradas no
tienen ni un acento ni una eñe en todo el bloque.**

No hace falta abrir ninguna fuente: el contenido está verificado, lo que falta es
la ortografía. Pero tres cuidados, y el segundo es el que puede hacer daño:

1. **Hay palabras donde la eñe que falta cambia la palabra, no el acento:** cinco
   entradas dicen `montana` por «montaña», tres `otono` por «otoño», una `diseno`
   y una `ninos`. Esas no son tildes olvidadas: son otra palabra.
2. **`Montana` el estado de Estados Unidos va sin eñe y está bien.** Hay que
   mirar cada caso en su oración antes de reemplazar. Lo mismo con cualquier
   topónimo o palabra en otro idioma —`ulu`, `kahuna lapaau`, `ahupua'a`,
   `inuksuit`, `wasdi`— que no lleva tilde castellana.
3. **Los `id` de ficha son ASCII a propósito y no se tocan nunca.**
   `rocosas_norte_praderas_montanas`, `montana_artica_baffin_torngat` y
   `creta_mediterranea` están bien escritos: son claves del código, no texto. Si
   se les pone una tilde, se rompe el test que verifica que cada práctica cuelgue
   de una ficha real.

Se corrige el `practica`, el `periodo`, el `detalle` y el `label` de la fuente
—el título de un artículo en español también lleva sus tildes, y ahí se copia lo
que dice la portada—. Un solo commit para las 37.

- `hajar_falaj` — Fertilizacion con estiercol de caprinos y abono organico en oasis de montana del Hajar, Oman
- `bosque_templado_caducifolio_este` — Intercultivo de las Tres Hermanas por los Haudenosaunee
- `pradera_pastos_cortos` — Recoleccion y procesamiento de plantas silvestres nativas de la pradera corta para alimentacion
- `desiertos_calidos_norteamericanos` — Cosecha de frutos de saguaro y capullos de cholla por los Tohono O'odham
- `bosque_coniferas_pacifico_noroeste` — Gestion indigena de salmon del Pacifico mediante weirs y cuotas de apertura nocturna
- `taiga_borde_agricola` — Produccion de azucar de arce en el iskigamizigan (sugarbush) por los Anishinaabe
- `bosque_humedo_tropical_caribeno` — Parcelas de provision (provision grounds) con panapen en jardines forestales mixtos
- `matorral_seco_caribeno` — Extraccion artesanal de sal en la salina costera de Pampatar, isla Margarita
- `mediterraneo_europeo` — Olivicultura en terrazas de piedra seca en la cuenca mediterranea: el sistema de bancales del Priorat catalan
- `alpino_montano_europeo` — Siega manual de praderas de montana en los Alpes europeos: corte tardio para conservar biodiversidad de plantas
- `macaronesia` — Agricultura Amazigh en Canarias: cultivo en gavias, nateros y enarenados en Gran Canaria y Fuerteventura
- `pampa` — Uso de plantas silvestres para preparados rituales y medicinales por comunidades Mapuche-Rankulche de la pampa
- `campos_uruguayos` — Construccion de cerritos de campo (montecillos artificiales) en la cuenca del litoral uruguayo-riograndense
- `valles_secos_interandinos` — Sistema turno de riego por turnos comunales en los valles secos interandinos de Bolivia
- `paramos_andinos` — Pastoreo rotacional de llamas y alpacas en bofedales y pastizales de paramo en los Andes centrales del Peru
- `bosques_secos_tumbes_ecuador_peru` — Pastoreo tradicional de cabras en el bosque seco de Tumbes: conocimiento local de rutas, agua y forraje
- `humedales_guayaquil` — Recoleccion tradicional de concha prieta (Anadara tuberculosa) en los manglares del Golfo de Guayaquil
- `alaska_costa_taiga` — Quemas controladas para caribu y bayas silvestres por los Gwich'in y Koyukon de Alaska
- `alaska_tundra_hielo_beringia` — Caceria comunal de caribu con lineas de inuksuit y corrales de sauce por los Nunamiut
- `hawaii_bosques_humedos_secos` — Agroforesteria hawaiana de laderas con ulu, kukui y coco en el sistema ahupua'a
- `hawaii_matorrales_altos_bajos` — Recoleccion de plantas medicinales nativas hawaianas por los kahuna lapaau
- `pacifico_noroeste_bosques_coniferas` — Tecnicas ancestrales de pesca de salmon en el Columbia: dipnets, hoop nets y plataformas
- `interior_noroeste_palouse_willamette` — Quemas anuales de otono para mantener praderas de roble blanco de Oregon por los Kalapuya
- `rocosas_norte_praderas_montanas` — Cosecha selectiva de bulbos de camas (Camassia quamash) en praderas humedas del norte de las Rocosas
- `rocosas_sur_sky_islands` — Cultivo de agave domesticado en campos de piedra aridos por Hohokam y Sinagua en Arizona
- `gran_cuenca_meseta_colorado` — Recoleccion estacional de pinones (Pinus monophylla) por los Shoshone-Paiute del Sur
- `sur_templado_humedo_eeuu` — Cosecha y manejo del wasdi (ramps, Allium tricoccum) en bosques apalaches por los Cherokee
- `bosque_tropical_seco_mesoamericano` — Manejo y domesticacion del jicaro (Crescentia cujete) para utensilios rituales y cotidianos en la Peninsula de Yucatan
- `corredor_seco_centroamericano` — Meliponicultura ancestral con jicote (Melipona beecheii) en el corredor seco de Nicaragua
- `bosque_atlantico_mosquitia` — Pesca artesanal de tortuga verde (Chelonia mydas) con redes sobre sleeping rocks por comunidades Miskitu
- `bahamas_pinares_manglares` — Cosecha del caracol reina (Lobatus gigas) por los Lucayo en San Salvador, Bahamas
- `jamaica_bosque_humedo_karstico` — Recoleccion de raices forestales para tonicos por comunidades cimarronas de Jamaica
- `jamaica_bosque_seco` — Cosecha tradicional de pimenta gorda / allspice (Pimenta dioica) en el bosque seco jamaicano: recoleccion de bayas verdes y secado al sol
- `manglares_antillanos` — Cria artesanal del cangrejo terrestre negro (Gecarcinus ruricola) en las Bahamas: engorde en corrales de piedra y cosecha estacional
- `trinidad_tobago_bosques` — Uso ritual de plantas por cazadores de Trinidad: preparados para atraer presa y para proteccion personal en el monte
- `mesopotamia_marismas` — Cosecha de Phragmites australis para construccion del mudhif y techos de barro en las marismas de Mesopotamia
- `yemen_montana_aterrazada` — Conservacion de 75 variedades locales de sorgo en las terrazas de las tierras altas de Yemen

### Etapa 1 — Que ninguna ficha quede con una sola práctica *(60 entradas)*

Es la prioridad y es la que más cambia lo que se ve en pantalla. Una ficha con
una sola práctica se lee como simbólica; con dos se lee como una decisión. Son
**60 fichas, una entrada cada una**, cuatro o cinco lotes.

Van en el orden en que están en el archivo, que ya es por región, porque las
fuentes de una región se buscan juntas. El rótulo en bastardilla es el comentario
de región del propio archivo:

- `chaparral_californiano`
- `manglares_pacifico_suramericano`
- `galapagos_matorral_xerico`

*Guayanas y Orinoquia*
- `guayanas_bosques_tierras_bajas`
- `llanos_orinoquia`
- `sabanas_guayanesas`
- `guayanas_bosques_inundables_delta`
- `humedales_orinoco`
- `manglares_amazon_orinoco_caribe_sur`

*Llanuras inundables y bosque seco del interior*
- `sabanas_beni`
- `bosque_seco_chiquitano`
- `caatinga_enclaves_humedos`
- `mata_atlantica_interior`
- `mata_atlantica_restingas`
- `manglares_atlantico_sur_brasil`
- `gulf_mississippi_piney_woods`
- `balsas_jalisco_bosques_secos`
- `manglares_mexico`
- `sonora_sinaloa_bosque_seco_desierto`
- `desierto_norarabigo`
- `harrat_basalto`
- `estepa_siria_badia`
- `mesopotamia_jazira`

*Peninsula arabiga*
- `nefud_rub_al_khali`
- `arabia_sur_bosque_niebla`
- `arabia_este_niebla`
- `desierto_arabigo`
- `golfo_llanura_costera`

*Yemen*
- `tihama_costa_arida`
- `hadramaut_meseta`
- `socotra`

*Iran y Sistan*
- `kuh_rud_montano`
- `sistan_registan`
- `badghyz_pistacho`
- `hircania_caspio`
- `iran_sur_nubo_sindico`
- `kopet_dag`
- `atlas_conifera_montana`
- `alto_atlas_enebro`

*Sahara y sus oasis*
- `sahara_norte_estepa`
- `chotts_sebkhas`
- `sahara_oriental`
- `nilo_delta`
- `sahara_costa_atlantica`
- `mar_rojo_costa_desierto`
- `mar_rojo_mangle`

*Canada oriental y el San Lorenzo*
- `san_lorenzo_tierras_bajas`
- `okanagan_bosque_seco`
- `haida_gwaii_hipermaritimo`
- `taiga_canadiense_permafrost`
- `montana_artica_baffin_torngat`
- `alto_artico_desierto_polar`

*Groenlandia*
- `groenlandia_kalaallit_nunaat`

*Islas britanicas e Irlanda*
- `atlantico_llanura_noroeste`
- `pinar_caledonio`

*Francia atlantica*
- `templado_occidental_europeo`
- `estepa_forestal_este`
- `crimea_submediterraneo`
- `kura_semidesierto`
- `anatolia_oriental_montana`

### Etapa 2 — Llevar todas a tres *(132 entradas)*

Las 60 de arriba otra vez —que después de la etapa 1 quedan en 2— más las 72 que
ya tienen 2 hoy:

*Rapa Nui*
- `rapa_nui_bosque_subtropical_transformado`

*Meseta iraní*
- `kavir_cuencas_endorreicas`

*Norteamérica*
- `bosque_templado_caducifolio_este`
- `desiertos_calidos_norteamericanos`
- `estepa_arbustiva_gran_cuenca`
- `bosque_coniferas_pacifico_noroeste`
- `taiga_borde_agricola`

*Altiplano mexicano*
- `matorral_xerofilo_altiplano_mexicano`
- `altiplano_mexicano_matorral`

*Caribe*
- `bosque_humedo_tropical_caribeno`
- `matorral_seco_caribeno`

*Chile central y desierto de Atacama*
- `mediterraneo`
- `desierto_costero`

*Alaska y Hawái*
- `alaska_costa_taiga`
- `alaska_tundra_hielo_beringia`
- `hawaii_bosques_humedos_secos`
- `hawaii_matorrales_altos_bajos`

*Oeste de Estados Unidos*
- `pacifico_noroeste_bosques_coniferas`
- `interior_noroeste_palouse_willamette`
- `california_klamath_sierra_valle`
- `rocosas_norte_praderas_montanas`
- `rocosas_sur_sky_islands`
- `grandes_llanuras_pradera_alta_mixta`
- `gran_cuenca_meseta_colorado`
- `sur_templado_humedo_eeuu`

*México*
- `baja_california_desiertos_y_sierras`
- `bosque_tropical_seco_mesoamericano`
- `sierras_madre_pino_encino`

*Centroamérica*
- `corredor_seco_centroamericano`
- `bosque_atlantico_mosquitia`
- `asir_altiplano_seco`
- `elburz_estepa_forestal`

*Magreb y Atlas*
- `magreb_bosque_mediterraneo`
- `magreb_estepa_alfa`
- `sahara_sur`

*Macizos centrales del Sahara*
- `ahaggar_tassili`

*Columbia Britanica y el interior seco*
- `columbia_britanica_interior`

*Escudo, taiga y Artico canadiense*
- `escudo_canadiense_boreal`
- `tundra_artica_canadiense`
- `campina_calcarea_inglesa`
- `atlantico_norte_turberas`
- `atlantico_templado_oceanico`

*Peninsula iberica*
- `cantabrico_atlantico_iberico`
- `montano_iberico`
- `semiarido_sureste_iberico`

*Italia y el Adriatico*
- `po_llanura_aluvial`
- `apeninos_montano`
- `mediterraneo_italiano_insular`
- `iliria_adriatico`
- `dinaricos_karst`

*Balcanes, Egeo y Creta*
- `montana_balcanica_sur`
- `egeo_esclerofilo`
- `creta_mediterranea`
- `chipre_troodos`
- `balcanes_mixto`

*Baltico y Escandinavia*
- `baltico_morrena`
- `sarmatico_boreonemoral`
- `costa_conifera_escandinava`
- `abedular_montano_escandinavo`
- `islandia_abedular`
- `boreal_nordico_turberas`

*Carpatos y las estepas del este*
- `carpatos_montano`
- `estepa_pontica_chernozem`
- `estepa_pontica_panonica`

*Caucaso y el Caspio*
- `caucaso_mixto`
- `euxino_colquico`

*Anatolia y el Levante*
- `mediterraneo_oriental_conifera`
- `tauro_conifera_montana`
- `meseta_anatolia_estepa`
- `zagros_estepa_forestal`
- `ponto_anatolia_norte`

*Europa central*
- `templado_continental_europeo`

**Antes de empezar la etapa 2, parar y avisar.** La etapa 1 son 60 fuentes
nuevas; la etapa 2 son 132 más. Con lo que costó la primera corrida, que la
etapa 2 se haga entera, se haga a medias o no se haga es una decisión de Jonatan
y no de esta sesión. Informá qué costó la etapa 1 y esperá.

### Etapa 3 — Que esto llegue a producción

Es lo que convierte 408 entradas en un producto. **No la hace esta sesión**: se
hace desde un worktree sobre `main`, con la compuerta completa y el deploy
verificado, porque en este repo pushear a `main` deploya.

Lo que esa sesión tiene que hacer:

1. `git merge claude/practicas-enumeradas` sobre `main`. Verificado el
   03/10/2026: el único archivo de código que la rama toca es
   `practicasHistoricas.ts`, `main` no lo tocó desde el punto de bifurcación, y
   tampoco tocó el test ni `biomaTipos.ts`. **El merge no tiene conflicto
   esperable.** Lo que sí hay que hacer antes es traer los 18 commits de `main`
   a la rama, para que la compuerta corra contra el código de hoy.
2. **Revisión por muestreo de los lotes 10 a 18**, que no tienen cobertura: doce
   entradas elegidas al azar, abriendo la URL y comparando título, apellidos y
   año contra lo que dice el `label`. Es exactamente el error que ya apareció dos
   veces en este encargo —en el lote 3 los títulos y en el lote 2 los autores—, y
   doce de 67 alcanza para saber si hay que mirar las otras cincuenta y cinco.
   Acordate de que 400 de 408 entradas tienen una sola fuente: el `label` es todo
   lo que hay.
3. La compuerta completa, los dos `next build`, y la verificación del deploy
   preguntándole al dominio a qué deployment apunta.
4. Un `COBERTURA_CIERRE.md` con el reparto final y las fichas que quedaron abajo
   de 3 con el motivo.

---

## Cómo se informa al terminar

Corto: cuántos lotes, cuántas entradas **contadas con el `grep` de arriba y no de
memoria**, el reparto por ficha medido con el script, **cuántas fuentes buscaste
y no pudiste abrir** —eso es el trabajo que no se ve— y qué fichas te resultaron
imposibles y por qué. Si una región no da más de dos prácticas documentadas, eso
es un hallazgo y va escrito: le ahorra el mismo día a quien venga después.
