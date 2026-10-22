# Fase 6 — Prácticas fechadas: 32 fichas en cero y 132 por debajo del piso

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\practicas\NN.json` — carpeta nueva, el
primer lote es el **01**.*

---

## Qué es esta capa y por qué existe

**220 de las 242 fichas ecológicas de la app tienen `saberes: []` a propósito.**
Atribuirle una práctica a un pueblo a escala de ecorregión sería inventar: una
ecorregión abarca muchos pueblos y ninguno la ocupa entera. El resultado era una
sección vacía que se leía como «acá no hay nada», que es falso y además ofensivo.

La salida fue esta capa. **Que no se pueda decir de quién es una práctica no
impide decir qué se hizo acá y cuándo.** El sujeto de la oración es el registro,
no el terreno: no «los campesinos hacían camellones» sino «hay camellones
documentados desde el año tal». Si la fuente nombra al pueblo, se lo nombra como
lo nombra ella, dentro del detalle.

**El estado, medido hoy:** 408 entradas sobre 200 fichas. El piso que se busca es
**tres por ficha**, y el reparto es desigual:

| Entradas por ficha | Cuántas fichas |
|---|---|
| 0 | **54** — 32 son de Indomalaya, nunca relevadas; las otras 22 son decisiones |
| 1 | **60** |
| 2 | **72** |
| 3 | **68** ← el piso |

Las 22 fichas en cero que **no** son un pendiente son veintidós decisiones de no
sostener una afirmación con una fuente que no alcanzaba: islas oceánicas sin
agricultura documentada, manglares y desiertos donde la bibliografía habla de un
país entero y no de la ecorregión. **No hay que tocarlas.** Un hueco explicado
vale; una afirmación sin respaldo cuesta meses de confianza.

Lo que falta son **192 entradas**: las 32 fichas de Indomalaya desde cero, más 2
en cada una de las 60 y 1 en cada una de las 72.

---

## El piso de fuentes, que no lo pone el gusto: lo midió el catálogo

Esto es lo que hizo volver un lote entero y conviene tenerlo claro antes de
empezar.

`practicasHistoricas.ts` tiene hoy **416 URLs sobre unos 123 dominios**: 85 de
PubMed Central, 47 de la FAO, 41 de SciELO, 30 de UNESCO, 27 del Servicio de
Parques Nacionales de los Estados Unidos. **Ninguna de periodismo.** Un lote
anterior trajo dos entradas colgando de un sitio de periodismo y habrían sido las
primeras; volvió el lote.

Entonces, las tres condiciones de una fuente, y son las tres juntas:

1. **Abre hoy.** Se prueba abriéndola. Si el host está caído, no entra. Un lote
   anterior se cayó porque sus dos entradas sorteadas colgaban de un PDF en un
   host con todo el dominio en 502: el artículo existía, pero **si no se puede
   abrir, no se puede desmentir**, y eso es lo que el archivo no acepta.
2. **Es la publicación y no un *host*.** ResearchGate y Academia.edu son hosts:
   alojan el PDF de alguien, no lo publican. Si el trabajo está ahí, hay que
   encontrar dónde lo publicó la revista, el organismo o la editorial.
3. **Es un trabajo publicado y no una nota periodística.** Artículo revisado,
   informe de organismo, tesis, monografía, ficha de patrimonio, plan de manejo.

Y una regla de cantidad que manda sobre la de cobertura: **mejor dos prácticas
que aguantan que tres con una floja.** La que no aguanta contamina la confianza
en las otras dos, porque una ficha no puede ser más fuerte que su fuente más
floja. Si de una ficha salen dos buenas, se entregan dos y se dice que la tercera
no salió.

### Y una advertencia sobre leer el documento y no el *grep*

En un PDF de Plitvice la extracción de texto desalineó una tabla y dejó el código
de hábitat `91K0` pegado a un prado de *Molinia*, que es el código 6410. Leído
rápido, la entrada parecía equivocada y estaba bien. **Hay que leer el documento,
no la línea que matcheó la búsqueda.**

---

## La forma de una entrada

Cinco campos más las fuentes. Los cinco son obligatorios.

| Campo | Qué es |
|---|---|
| `practica` | El nombre del rasgo, **corto**. «Camellones (waru waru)», «Terraza de piedra seca» |
| `periodo` | **Cuándo, en texto y no en números.** Rangos abiertos, siglos, «desde». Ej.: «Desde ~1000 a.C.; auge entre el 500 y el 1100 d.C.» — un campo numérico obligaría a inventar precisión |
| `tipo` | Uno de: `agua`, `suelo`, `cultivo`, `ganaderia`, `recoleccion`, `fuego` |
| `vigencia` | Uno de: `en_uso` (se practica hoy, aunque sea en parte del territorio), `en_retroceso` (queda gente haciéndola y se está perdiendo), `historica` (documentada y abandonada; puede seguir siendo legible en el paisaje) |
| `detalle` | **Qué es, cómo funciona y por qué funciona acá.** Dos a cuatro oraciones. Tiene que servirle a alguien que está diseñando un predio, no ser una entrada de glosario |
| `fuentes` | Al menos una, abierta y verificada, con el `label` copiado del título que muestra la página |

### El campo `detalle` es el que decide si la entrada sirve

Compará. Esto no sirve: *«Sistema de terrazas agrícolas usado tradicionalmente en
la región.»* Es una definición de diccionario y no cambia ninguna decisión.

Esto sí, y es una entrada real del catálogo:

> «Terrazas de ladera con el borde plantado de maguey, y adentro maíz, poroto,
> zapallo y las hierbas espontáneas que se cosechan como quelites. La hilera de
> agave hace de estructura: sujeta el bordo, frena la escorrentía y produce por
> su cuenta —aguamiel, fibra, forraje—, de modo que la obra de conservación no
> compite con la superficie productiva sino que la amplía.»

La diferencia es el **mecanismo**: qué hace cada parte, y por qué eso funciona en
ese clima y en ese suelo. Si la fuente trae una medida —la profundidad del canal,
la separación de los bordos, el rendimiento— va la medida, con su unidad.

---

## Los lotes, en orden

**Seis entradas por lote.** Pueden ser de una ficha o de varias. Si un lote sale
largo, se corta y se sigue en el siguiente **sin repetir nada**.

### Bloque 1 — Las 32 fichas de Indomalaya, desde cero. Primero y por mucho.

Son el único hueco real de cobertura del catálogo: se montaron en septiembre de
2026 y nunca se relevaron. Y es el bloque con más literatura disponible de los
tres, porque acá la agricultura tradicional está documentada desde hace siglos y
hay patrimonio agrícola reconocido en casi todos estos países.

**Tres por ficha, directo al piso.** Los ids son los que la app usa y hay que
devolverlos tal cual:

`ghats_norte_deciduo`, `ghats_norte_montano`, `ghats_sur_deciduo`,
`ghats_sur_montano`, `sri_lanka_humedo_bajo`, `sri_lanka_montano`,
`sri_lanka_zona_seca`, `valle_brahmaputra`, `gangetica_inferior`,
`gangetica_superior`, `pantanos_sundarbans`, `pantanos_irrawaddy`,
`irrawaddy_deciduo`, `pantanos_chao_phraya`, `chao_phraya_deciduo`,
`pantanos_tonle_sap`, `pantanos_rio_rojo`, `sumatra_bajo`, `sumatra_montano`,
`pantanos_sumatra`, `pinar_toba`, `java_occidental_bajo`,
`java_oriental_bali_bajo`, `java_bali_montano`, `pantanos_borneo_suroeste`,
`luzon_bajo`, `luzon_montano`, `pinar_luzon`, `mindoro`, `negros_panay`,
`mindanao_montano`, `mindanao_visayas_oriental`.

**Rutas nombradas para este bloque**, porque es lo que hace que un encargo rinda:

- **FAO SIPAM/GIAHS** tiene sitios designados en China, Japón, Corea, India,
  Filipinas, Sri Lanka, Bangladesh e Irán. Las fichas describen el sistema y
  están abiertas: `fao.org/giahs/giahs-around-the-world/`. Son 47 de las URLs
  que el catálogo ya usa, así que es la vía probada.
- **UNESCO patrimonio mundial** tiene las terrazas de arroz de las cordilleras de
  Filipinas (Ifugao), el sistema *subak* de Bali, y los tanques de Sri Lanka
  entre sus fichas; la descripción del *outstanding universal value* trae el
  mecanismo.
- **PubMed Central** para los trabajos de agronomía y de etnobotánica: es el
  dominio más usado del catálogo, con 85 URLs.
- **ICIMOD** para el Himalaya y las laderas del noreste de la India.
- **ICRISAT** para la India seca y los *tanques* del Decán.
- **Los institutos nacionales**: ICAR en la India, BBSDLP en Indonesia, PhilRice
  y PCAARRD en Filipinas, LDD en Tailandia.

**Lo que en este bloque está esperando ser encontrado**, con nombre, para que no
se gaste la búsqueda en abstracto: el *subak* balinés y sus templos de agua; las
terrazas de Ifugao; los *tanques* o *eri* del sur de la India y de la zona seca de
Sri Lanka, con sus cascadas de embalses; el *zabo* de Nagaland; el *apatani* de
Arunachal; los campos flotantes de Loktak; el *sorjan* javanés; el *bheri* de
Bengala; el *baray* angkoriano del Tonle Sap; los *tanques* de Anuradhapura; el
*rejuvenecimiento del chena* en la zona seca cingalesa; los *paddy-fish* de
Indochina; la quema prescripta del pinar de Luzón.

### Bloque 2 — Las 60 fichas con una sola entrada. Dos cada una.

Son las que están más lejos del piso. Al tener ya una entrada montada, **hay que
traer prácticas distintas de la que está**: si la ficha ya tiene una de `agua`,
preferir `suelo`, `cultivo`, `ganaderia`, `recoleccion` o `fuego`. No se puede
saber cuál tiene cada una sin ver el archivo, así que la regla práctica es:
**traer las dos de tipos distintos entre sí**, y si una resulta repetida se
descarta al montar sin costo.

`chaparral_californiano`, `manglares_pacifico_suramericano`,
`galapagos_matorral_xerico`, `guayanas_bosques_tierras_bajas`,
`llanos_orinoquia`, `sabanas_guayanesas`,
`guayanas_bosques_inundables_delta`, `humedales_orinoco`,
`manglares_amazon_orinoco_caribe_sur`, `sabanas_beni`,
`bosque_seco_chiquitano`, `caatinga_enclaves_humedos`,
`mata_atlantica_interior`, `mata_atlantica_restingas`,
`manglares_atlantico_sur_brasil`, `gulf_mississippi_piney_woods`,
`balsas_jalisco_bosques_secos`, `manglares_mexico`,
`sonora_sinaloa_bosque_seco_desierto`, `desierto_norarabigo`,
`harrat_basalto`, `estepa_siria_badia`, `mesopotamia_jazira`,
`nefud_rub_al_khali`, `arabia_sur_bosque_niebla`, `arabia_este_niebla`,
`desierto_arabigo`, `golfo_llanura_costera`, `tihama_costa_arida`,
`hadramaut_meseta`, `socotra`, `kuh_rud_montano`, `sistan_registan`,
`badghyz_pistacho`, `hircania_caspio`, `iran_sur_nubo_sindico`, `kopet_dag`,
`atlas_conifera_montana`, `alto_atlas_enebro`, `sahara_norte_estepa`,
`chotts_sebkhas`, `sahara_oriental`, `nilo_delta`,
`sahara_costa_atlantica`, `mar_rojo_costa_desierto`, `mar_rojo_mangle`,
`san_lorenzo_tierras_bajas`, `okanagan_bosque_seco`,
`haida_gwaii_hipermaritimo`, `taiga_canadiense_permafrost`,
`montana_artica_baffin_torngat`, `alto_artico_desierto_polar`,
`groenlandia_kalaallit_nunaat`, `atlantico_llanura_noroeste`,
`pinar_caledonio`, `templado_occidental_europeo`, `estepa_forestal_este`,
`crimea_submediterraneo`, `kura_semidesierto`, `anatolia_oriental_montana`.

**Dónde está lo fácil de este bloque:** la península arábiga y el Sahara tienen
los *qanat* o *falaj* —con sitio UNESCO en Omán y en Irán—, los *aflaj*, las
*foggara* argelinas, el riego de *turbias* o *spate irrigation* del Yemen y la
Tihama, y los *jessour* tunecinos. Irán tiene además los *yakhchal* y los
*ab-anbar*. El Ártico canadiense y Groenlandia son el caso difícil: ahí la
práctica es de `recoleccion` o `ganaderia` —caza, pesca, pastoreo de renos— y la
fuente natural son los informes de los gobiernos de Nunavut y Groenlandia y las
publicaciones de conocimiento inuit, que ya están citadas en otras fichas.

### Bloque 3 — Las 72 fichas con dos entradas. Una cada una.

Mismo criterio: **la tercera, de un tipo distinto de las dos que ya están.**

`rapa_nui_bosque_subtropical_transformado`, `kavir_cuencas_endorreicas`,
`bosque_templado_caducifolio_este`, `desiertos_calidos_norteamericanos`,
`estepa_arbustiva_gran_cuenca`, `bosque_coniferas_pacifico_noroeste`,
`taiga_borde_agricola`, `matorral_xerofilo_altiplano_mexicano`,
`altiplano_mexicano_matorral`, `bosque_humedo_tropical_caribeno`,
`matorral_seco_caribeno`, `mediterraneo`, `desierto_costero`,
`alaska_costa_taiga`, `alaska_tundra_hielo_beringia`,
`hawaii_bosques_humedos_secos`, `hawaii_matorrales_altos_bajos`,
`pacifico_noroeste_bosques_coniferas`,
`interior_noroeste_palouse_willamette`, `california_klamath_sierra_valle`,
`rocosas_norte_praderas_montanas`, `rocosas_sur_sky_islands`,
`grandes_llanuras_pradera_alta_mixta`, `gran_cuenca_meseta_colorado`,
`sur_templado_humedo_eeuu`, `baja_california_desiertos_y_sierras`,
`bosque_tropical_seco_mesoamericano`, `sierras_madre_pino_encino`,
`corredor_seco_centroamericano`, `bosque_atlantico_mosquitia`,
`asir_altiplano_seco`, `elburz_estepa_forestal`,
`magreb_bosque_mediterraneo`, `magreb_estepa_alfa`, `sahara_sur`,
`ahaggar_tassili`, `columbia_britanica_interior`,
`escudo_canadiense_boreal`, `tundra_artica_canadiense`,
`campina_calcarea_inglesa`, `atlantico_norte_turberas`,
`atlantico_templado_oceanico`, `cantabrico_atlantico_iberico`,
`montano_iberico`, `semiarido_sureste_iberico`, `po_llanura_aluvial`,
`apeninos_montano`, `mediterraneo_italiano_insular`, `iliria_adriatico`,
`dinaricos_karst`, `montana_balcanica_sur`, `egeo_esclerofilo`,
`creta_mediterranea`, `chipre_troodos`, `balcanes_mixto`,
`baltico_morrena`, `sarmatico_boreonemoral`,
`costa_conifera_escandinava`, `abedular_montano_escandinavo`,
`islandia_abedular`, `boreal_nordico_turberas`, `carpatos_montano`,
`estepa_pontica_chernozem`, `estepa_pontica_panonica`, `caucaso_mixto`,
`euxino_colquico`, `mediterraneo_oriental_conifera`,
`tauro_conifera_montana`, `meseta_anatolia_estepa`,
`zagros_estepa_forestal`, `ponto_anatolia_norte`,
`templado_continental_europeo`.

**Dónde está lo fácil de este bloque:** Europa tiene la Directiva Hábitats, que
pone código a cada formación semi-natural y describe el manejo que la sostiene, y
tiene la lista de patrimonio inmaterial de UNESCO, que ya es fuente de ocho
entradas del catálogo. El Mediterráneo oriental y Anatolia tienen los *yayla* de
trashumancia, la *hema* como figura de descanso de pastoreo, y los bancales de
piedra seca con sitio UNESCO. Los Cárpatos y la estepa póntica tienen la
trashumancia y el *polje* kárstico. Islandia tiene el *afréttur* y el pastoreo
comunal con *fjallskil*.

---

## La forma del JSON

```json
{
  "encargo": "practicas",
  "lote": 1,
  "fecha": "2026-10-23",
  "entradas": [
    {
      "id": "sri_lanka_zona_seca",
      "practica": "Cascada de tanques (ellanga)",
      "periodo": "Desde el siglo III a.C.; red en uso y en rehabilitación",
      "tipo": "agua",
      "vigencia": "en_uso",
      "detalle": "Qué es, cómo funciona y por qué funciona acá. Dos a cuatro oraciones, con las medidas que la fuente publique.",
      "fuentes": [
        { "label": "Título tal como lo muestra la página", "url": "https://…" }
      ],
      "verificacion": "Qué dice esa página, con sus palabras, en la página que se abrió.",
      "nota": "Opcional: la duda, el límite, o por qué sólo salieron dos de tres."
    }
  ],
  "vacias": [
    { "id": "<id de ficha>", "motivo": "Qué se buscó, dónde, y por qué no alcanzó." }
  ]
}
```

`id` es el id de la **ficha** a la que la práctica se asocia, y una misma ficha
puede aparecer varias veces en el mismo lote con prácticas distintas. Si de una
ficha no sale nada que aguante, va a `vacias` con el motivo: **veintidós fichas
del catálogo están vacías justamente así y están bien.**

---

## Las reglas, en corto

1. **Ninguna URL entra sin abrirse.** Si no abre, la entrada no existe.
2. **El `label` se copia del título que muestra la página**, no se redacta.
3. **Nada de DOI de memoria.** Un DOI escrito de memoria para el artículo de los
   jardines de piedra de Rapa Nui resolvió a un artículo distinto de la misma
   revista: el identificador existía y el trabajo era otro.
4. **Ni periodismo, ni ResearchGate, ni Academia.edu.** Hay que llegar a la
   publicación.
5. **El sujeto es el registro, no el terreno.** «Hay camellones documentados
   desde…», no «los campesinos hacían…». Si la fuente nombra al pueblo, se lo
   nombra **como lo nombra ella**, en el `detalle`.
6. **`periodo` en texto, nunca en número.** Rangos abiertos y siglos.
7. **El `detalle` dice el mecanismo**, no la definición.
8. **Mejor dos que aguantan que tres con una floja.**
9. **Leer el documento, no la línea que matcheó.**
10. Seis entradas por lote. Un bloque JSON. Sin prosa antes ni después.
