# Encargo — cerrar las prácticas enumeradas por ecorregión

Escrito el 02/10/2026. **Este archivo es el prompt completo: se pega tal cual en
la sesión nueva y no hace falta nada más.**

Continúa `PROMPT_PRACTICAS_ENUMERADAS.md`, que sigue siendo **la fuente de las
reglas**: cómo se abre una fuente, cómo se copia un `label`, qué formato tiene
una entrada, qué archivos se pueden tocar. Todo eso vale igual y no se repite
acá. Lo que agrega este archivo es **dónde quedó el trabajo, cuánto falta, y las
reglas de costo que la primera corrida no tuvo** — porque esa corrida se comió
unos cien dólares de uso y hay que terminar el resto con bastante menos.

Leé los dos archivos. Si se contradicen, manda este.

---

## Dónde quedó, medido contra el repositorio

La rama es **`claude/practicas-enumeradas`** y tiene **23 commits** que no están
en `main`. Lotes 01 a 17.

| | Entradas | Fichas |
|---|---|---|
| Al empezar (lo que hay en `main`) | 201 | 200 |
| Hoy, en la rama | **402** | 200 |

Reparto actual, contando entradas por ficha:

| Entradas por ficha | Cuántas fichas |
|---|---|
| 1 | **66** |
| 2 | **66** |
| 3 | **68** |

Ninguna ficha nueva se agregó ni hacía falta: las 200 son las mismas. El objetivo
del encargo original era **3 a 5 por ficha donde la bibliografía lo permita**.
Para que ninguna quede abajo de 3 faltan **198 entradas**.

### Lo primero que hay que saber: nada de esto está en producción

Las 201 entradas nuevas viven **sólo en la rama**. `main` sigue con 201 en total,
así que la mitad del trabajo no la ve ningún usuario. Eso se arregla en la
**etapa 3** de este encargo y es la parte más valiosa de todo lo que queda: 201
entradas ya escritas y verificadas valen más, hoy, que 198 por escribir.

### Lo que quedó sin documentar

Los `COBERTURA_LOTE_NN.md` existen para los lotes **01 a 09**, y los JSON del
relevamiento crudo sólo para los lotes **02, 03 y 04**. Los lotes **10 a 17 —unas
62 entradas— no tienen ni cobertura ni JSON**: sus fuentes están en el
TypeScript, pero sin la frase de `verificacion` que permite revisarlos sin volver
a abrir las URLs.

**No se rehace ese relevamiento.** Volver a abrir 62 fuentes para escribir un
archivo de cobertura retroactivo es pagar dos veces por lo mismo. Lo que sí hay
que hacer está en la etapa 3: la revisión por muestreo.

---

## Las reglas de costo, que son nuevas y no son opcionales

La primera corrida hizo 23 commits para 201 entradas: **8,7 entradas por
commit**, y los últimos siete lotes promediaron **6**. Cada lote pagaba una
compuerta completa —`typecheck`, `lint` sobre toda la app, 1.387 tests de terreno
y 73 de web— y volvía a cargar en contexto un archivo que hoy tiene **4.975
líneas**. La investigación en sí —buscar, abrir y leer una fuente por entrada— es
irreducible y hay que pagarla. Todo lo demás se puede hacer entre cinco y diez
veces más barato.

**1. Los lotes son de 15 fichas y nunca menos de 10.** Un lote de 6 entradas es
el peor de los dos mundos: paga todo el overhead y avanza nada. Si el contexto se
está acortando a mitad de lote, cerralo con lo que tengas —eso no cambia— pero no
*planifiques* lotes chicos.

**2. La compuerta por lote es ésta y nada más:**

```bash
npx tsc --noEmit -p apps/terreno/tsconfig.json
cd apps/terreno && npx vitest run tests/unit/contexto/practicasHistoricas.test.ts
```

El test de prácticas es el único que puede fallar por lo que escribís: valida
fuente con `https`, rótulo, período, largo del detalle, enciclopedias
colaborativas, duplicados dentro de una ficha e `id` inexistente. Los otros 1.300
no tocan esta capa. **La batería completa y el lint de toda la app se corren una
sola vez, al final de la sesión**, antes del último push.

`pnpm typecheck` y `pnpm lint` pasan por turbo, que **cachea y puede devolver un
pase falso** después de tus propias ediciones. Por eso arriba van los comandos
directos.

**3. No se corre nada de `apps/web`.** Este encargo no toca ese paquete.

**4. Nunca leas `practicasHistoricas.ts` entero.** Son 4.975 líneas y hoy es el
gasto más grande de la sesión. Para encontrar una ficha:

```bash
git grep -n "^  nombre_de_la_ficha: \[" apps/terreno/lib/practicasHistoricas.ts
```

y leé veinte líneas alrededor. Para contar cómo viene el reparto, un script en
lugar de una lectura:

```bash
node -e "const s=require('fs').readFileSync('apps/terreno/lib/practicasHistoricas.ts','utf8');const h={};for(const b of s.split(/^  (?=[a-z0-9_]+: \[)/m)){const k=b.match(/^([a-z0-9_]+): \[/);if(!k)continue;const n=(b.match(/^      practica: /gm)||[]).length;h[n]=(h[n]||0)+1;}console.log(h)"
```

**5. No revises lo que ya está escrito.** Las 402 entradas de la rama están
verificadas por las sesiones que las escribieron. Si de paso ves un error
concreto, arreglalo y decilo en el commit; lo que no se hace es una pasada de
auditoría general que no pidió nadie.

**6. En el barrido de apertura, de seis a ocho `WebFetch` por turno**, cada una
con su pregunta de verificación. Esto ya estaba en el encargo original y es lo
que más decide el costo: una fuente por turno multiplica por seis el precio de la
misma investigación.

---

## El trabajo, en tres etapas y en este orden

### Etapa 1 — Que ninguna ficha quede con una sola práctica *(66 entradas)*

Es la prioridad y es la que más cambia lo que se ve en pantalla. Una ficha con
una sola práctica se lee como simbólica; con dos se lee como una decisión. Son
**66 fichas, una entrada cada una**, cinco lotes de entre 12 y 15.

Van en el orden en que están en el archivo, que ya es por región:

- `chaparral_californiano`
- `manglares_pacifico_suramericano`
- `galapagos_matorral_xerico`
- `guayanas_bosques_tierras_bajas`
- `llanos_orinoquia`
- `sabanas_guayanesas`
- `guayanas_bosques_inundables_delta`
- `humedales_orinoco`
- `manglares_amazon_orinoco_caribe_sur`
- `sabanas_beni`
- `bosque_seco_chiquitano`
- `caatinga_enclaves_humedos`
- `mata_atlantica_interior`
- `mata_atlantica_restingas`
- `manglares_atlantico_sur_brasil`
- `gulf_mississippi_piney_woods`
- `baja_california_desiertos_y_sierras`
- `balsas_jalisco_bosques_secos`
- `manglares_mexico`
- `sonora_sinaloa_bosque_seco_desierto`
- `sierras_madre_pino_encino`
- `desierto_norarabigo`
- `harrat_basalto`
- `estepa_siria_badia`
- `mesopotamia_jazira`
- `nefud_rub_al_khali`
- `arabia_sur_bosque_niebla`
- `arabia_este_niebla`
- `desierto_arabigo`
- `golfo_llanura_costera`
- `tihama_costa_arida`
- `hadramaut_meseta`
- `socotra`
- `kuh_rud_montano`
- `sistan_registan`
- `badghyz_pistacho`
- `hircania_caspio`
- `iran_sur_nubo_sindico`
- `kopet_dag`
- `magreb_estepa_alfa`
- `atlas_conifera_montana`
- `alto_atlas_enebro`
- `sahara_norte_estepa`
- `chotts_sebkhas`
- `sahara_oriental`
- `nilo_delta`
- `sahara_sur`
- `sahara_costa_atlantica`
- `mar_rojo_costa_desierto`
- `mar_rojo_mangle`
- `ahaggar_tassili`
- `san_lorenzo_tierras_bajas`
- `okanagan_bosque_seco`
- `haida_gwaii_hipermaritimo`
- `taiga_canadiense_permafrost`
- `montana_artica_baffin_torngat`
- `alto_artico_desierto_polar`
- `groenlandia_kalaallit_nunaat`
- `atlantico_llanura_noroeste`
- `pinar_caledonio`
- `templado_occidental_europeo`
- `estepa_forestal_este`
- `crimea_submediterraneo`
- `kura_semidesierto`
- `anatolia_oriental_montana`
- `zagros_estepa_forestal`

### Etapa 2 — Llevar todas a tres *(132 entradas)*

Las 66 de arriba otra vez —que después de la etapa 1 quedan en 2— más las 66 que
ya tienen 2 hoy:

- `rapa_nui_bosque_subtropical_transformado`
- `kavir_cuencas_endorreicas`
- `bosque_templado_caducifolio_este`
- `desiertos_calidos_norteamericanos`
- `estepa_arbustiva_gran_cuenca`
- `bosque_coniferas_pacifico_noroeste`
- `taiga_borde_agricola`
- `matorral_xerofilo_altiplano_mexicano`
- `altiplano_mexicano_matorral`
- `bosque_humedo_tropical_caribeno`
- `matorral_seco_caribeno`
- `mediterraneo`
- `desierto_costero`
- `alaska_costa_taiga`
- `alaska_tundra_hielo_beringia`
- `hawaii_bosques_humedos_secos`
- `hawaii_matorrales_altos_bajos`
- `pacifico_noroeste_bosques_coniferas`
- `interior_noroeste_palouse_willamette`
- `california_klamath_sierra_valle`
- `rocosas_norte_praderas_montanas`
- `rocosas_sur_sky_islands`
- `grandes_llanuras_pradera_alta_mixta`
- `gran_cuenca_meseta_colorado`
- `sur_templado_humedo_eeuu`
- `bosque_tropical_seco_mesoamericano`
- `corredor_seco_centroamericano`
- `bosque_atlantico_mosquitia`
- `asir_altiplano_seco`
- `elburz_estepa_forestal`
- `magreb_bosque_mediterraneo`
- `columbia_britanica_interior`
- `escudo_canadiense_boreal`
- `tundra_artica_canadiense`
- `campina_calcarea_inglesa`
- `atlantico_norte_turberas`
- `atlantico_templado_oceanico`
- `cantabrico_atlantico_iberico`
- `montano_iberico`
- `semiarido_sureste_iberico`
- `po_llanura_aluvial`
- `apeninos_montano`
- `mediterraneo_italiano_insular`
- `iliria_adriatico`
- `dinaricos_karst`
- `montana_balcanica_sur`
- `egeo_esclerofilo`
- `creta_mediterranea`
- `chipre_troodos`
- `balcanes_mixto`
- `baltico_morrena`
- `sarmatico_boreonemoral`
- `costa_conifera_escandinava`
- `abedular_montano_escandinavo`
- `islandia_abedular`
- `boreal_nordico_turberas`
- `carpatos_montano`
- `estepa_pontica_chernozem`
- `estepa_pontica_panonica`
- `caucaso_mixto`
- `euxino_colquico`
- `mediterraneo_oriental_conifera`
- `tauro_conifera_montana`
- `meseta_anatolia_estepa`
- `ponto_anatolia_norte`
- `templado_continental_europeo`

**Antes de empezar la etapa 2, parar y avisar.** La etapa 1 son 66 fuentes
nuevas; la etapa 2 son 132 más. Con lo que costó la primera corrida, que la
etapa 2 se haga entera, se haga a medias o no se haga es una decisión de Jonatan
y no de esta sesión. Informá qué costó la etapa 1 y esperá.

### Etapa 3 — Que esto llegue a producción

Es lo que convierte 402 entradas en un producto. **No la hace esta sesión**: se
hace desde un worktree sobre `main`, con la compuerta completa y el deploy
verificado, porque en este repo pushear a `main` deploya.

Lo que esa sesión tiene que hacer:

1. `git merge claude/practicas-enumeradas` sobre `main`. El único archivo de
   código que la rama toca es `practicasHistoricas.ts`, así que el conflicto
   esperable es uno solo y es de contenido, no estructural.
2. **Revisión por muestreo de los lotes 10 a 17**, que no tienen cobertura: doce
   entradas elegidas al azar, abriendo la URL y comparando título, apellidos y
   año contra lo que dice el `label`. Es exactamente el error que ya apareció dos
   veces en este encargo —en el lote 3 los títulos y en el lote 2 los autores—, y
   doce de 62 alcanza para saber si hay que mirar las otras cincuenta.
3. La compuerta completa, los dos `next build`, y la verificación del deploy
   preguntándole al dominio a qué deployment apunta.
4. Un `COBERTURA_CIERRE.md` con el reparto final y las fichas que quedaron abajo
   de 3 con el motivo.

---

## Cómo se informa al terminar

Corto: cuántos lotes, cuántas entradas, el reparto por ficha medido con el script
de arriba, **cuántas fuentes buscaste y no pudiste abrir** —eso es el trabajo que
no se ve— y qué fichas te resultaron imposibles y por qué. Si una región no da
más de dos prácticas documentadas, eso es un hallazgo y va escrito: le ahorra el
mismo día a quien venga después.
