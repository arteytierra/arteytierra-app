# Encargo a GPT — prácticas documentadas por ecorregión

Escrito el 14/09/2026. Alimenta `apps/terreno/lib/practicasHistoricas.ts`, que
hoy tiene 182 entradas sobre 181 ecorregiones de 222.

El reparto es el mismo que funcionó con las fichas ecológicas: **GPT releva y
redacta, acá se monta y se verifica.** Lo que cambia respecto de aquel encargo es
que esto no describe un ecosistema sino la historia de un territorio, así que la
fuente dejó de ser un requisito de prolijidad y pasó a ser la pieza que sostiene
todo. Una cita inventada acá no produce un dato flojo: produce una afirmación
falsa sobre la gente de un lugar, impresa en un informe que alguien va a leer en
voz alta delante de un vecino.

---

## Para qué es

En el panel de contexto de acequia, la enorme mayoría de las 222 fichas de
ecorregión tienen la sección de saberes vacía, **a propósito**: atribuirle una
práctica a un pueblo a escala de ecorregión sería inventar, porque abarca muchos
y ninguno la ocupa entera. El resultado era una sección en blanco que se leía
como "acá no hay nada", que es falso.

La salida es decir **qué se hizo en este territorio y cuándo**, sin decir de
quién es. Eso sí lo permite la escala, porque es exactamente lo que el registro
arqueológico e histórico fecha: lo que una excavación data es el rasgo —el
camellón, el muro, el canal—, no la identidad de quien lo levantó, que muchas
veces sigue en discusión entre especialistas.

Los saberes que sí se afirman como propios de una comunidad son otra capa del
producto, se activan por polígono y no son parte de este encargo.

---

## Las seis reglas

**1. Sin fuente publicada no hay entrada.** Una referencia por práctica como
mínimo, con URL. Vale: artículo con DOI, libro, informe de organismo (FAO SIPAM,
UNESCO, INTA, un ministerio), repositorio universitario, museo. No vale:
Wikipedia ni ningún wiki, blogs, notas periodísticas sin fuente, sitios de
turismo, agregadores de IA. Hay un test que rechaza automáticamente las
enciclopedias colaborativas.

**2. La URL se abre antes de escribirla.** No de memoria. Al armar las primeras
seis entradas, un DOI escrito de memoria para el artículo de los jardines de
piedra de Rapa Nui resolvió a un artículo **distinto de la misma revista**: el
identificador existía, el trabajo era otro. Por eso cada entrada lleva un campo
`verificacion` con la frase textual de la fuente que sostiene la fecha. Si no
podés abrir la fuente, la entrada no se escribe.

**3. Es preferible una ecorregión vacía que una entrada dudosa.** No hay ninguna
obligación de cubrir las 222. Una respuesta de veinte entradas sólidas vale más
que una de cien con la mitad relleno. Si un bloque entero no tiene nada
documentado, la respuesta correcta es una lista vacía y una línea diciéndolo.

**4. El sujeto de la frase es el registro, no el terreno.** Se escribe "el
registro arqueológico de la cuenca documenta camellones desde el 1000 a.C." y no
"acá se hacían camellones".

**5. La autoría se copia de la fuente: ni se inventa ni se borra.** Son dos
errores opuestos y los dos cuentan como error.

*No inventarla:* el pueblo no se deduce del mapa, nunca. Si la fuente no dice
quién, la entrada no dice quién, y con el período alcanza.

*No borrarla:* **si la fuente nombra al pueblo, hay que nombrarlo**, como lo
nombra ella y dentro de `detalle`, en tercera persona — "el Servicio de Parques
lo atribuye a los hohokam". Callar una autoría que la fuente afirma no es
prudencia: es borrarla, y a escala de un informe que alguien lee en voz alta,
es hacer desaparecer a la gente del lugar donde vivió.

Esta segunda mitad ya falló una vez. En el primer lote, tres entradas tenían la
autoría textual en la cita de respaldo —hohokam, ojibwe, taíno— y la ocultaban
en el texto publicado. Si tu `verificacion` nombra un pueblo y tu `detalle` no,
está mal. En el segundo lote no volvió a pasar en ninguna de las 44: kichwa y
kijus en Napo, mapuche en Lanín, chiquitanos, quilombolas del Vale do Ribeira,
caiçaras, kogui, wiwa, arhuaco y kankuamo en la Sierra Nevada, cocamilla en el
Huallaga, quebradeiras de coco babaçu. En el tercero tampoco, en ninguna de las
26. Así va.

Y en el tercer lote apareció la otra mitad ejercitada a fondo, que es lo que hay
que seguir haciendo: seis entradas **se niegan explícitamente a atribuir**.
`baja_california_desiertos_y_sierras` aclara que los oasis vienen de las
misiones jesuitas y no de una práctica prehispánica; `cuba_bosques_karst_y_pinares`
pide no presentar una economía colonial del tabaco como saber indígena;
`selva_maya_peten_yucatan` avisa que las concesiones forestales son una
institucionalidad contemporánea del Petén y no una práctica maya ancestral;
`ozarks_transicion_bosque_pradera` dice que la observación colonial de 1750 no
identifica un pueblo concreto. Eso es exactamente la regla.

En el cuarto lote, donde las fuentes nombran sistemas por lugar —Figuig, Siwa,
Gonabad, Liwa— más que por pueblo, la mitad de "no borrar" casi no se ejercitó, y
se perdieron dos nombres que la fuente sí daba: la presentación de la FAO
identifica a la población de Imilchil y Amellagou como **Ait Hdidou** y **Ait
Marghad**, y UNESCO nombra las prácticas colectivas de reparación de terrazas en
Yemen —**al-ʿanah**, **al-ʿawn**, **al-tajyish**—. **El nombre local de la
práctica también se copia**, no sólo el del pueblo: es la palabra con la que el
lector puede seguir buscando.

El quinto lote es el mejor en esto y conviene tomarlo de modelo. El bloque de
Canadá nombra la autoría en las nueve entradas —"el pueblo T'exelc, hoy Williams
Lake First Nation", el pueblo syilx Okanagan, los haida, las comunidades ojibwa,
los gwich'in, el conocimiento Inuvialuit, los inuit de Baffin— y varias entradas
además dicen hasta dónde llega la fuente: `haida_gwaii_hipermaritimo` aclara que
la descripción es de Charles Newcombe a fines del siglo XIX y que las
excavaciones **no hallaron prueba arqueológica de cultivo**, así que no proyecta
antigüedad; `islandia_abedular` avisa que los mismos indicadores podrían
reflejar pastoreo; `meseta_anatolia_estepa` documenta la rotación pero dice que
no prueba que sea óptima hoy. Eso es exactamente el tono.

**6. Le tiene que servir a alguien que está diseñando un predio.** No es una
entrada de enciclopedia: es información para alguien que va a decidir dónde pone
la huerta. Qué es, cómo funciona, y por qué funciona **acá** —qué limitante del
lugar resuelve—. Dos a cuatro oraciones.

---

## Qué devolver

Un JSON, un objeto por práctica. Sin texto alrededor.

```json
[
  {
    "fichaId": "puna_humeda_central",
    "practica": "Campos elevados (waru waru, suka kollus)",
    "periodo": "Desde ~1000 a.C.; los fechados asociados llegan al inicio de nuestra era",
    "tipo": "suelo",
    "vigencia": "historica",
    "detalle": "Plataformas de cultivo levantadas sobre la llanura lacustre, separadas por canales de agua. El canal es el instrumento: acumula calor durante el día y lo devuelve de noche, lo que sube la temperatura del cultivo un par de grados y corre el riesgo de helada en un altiplano donde la helada es el límite real, no la lluvia. Además drena el exceso y el sedimento que se saca del fondo vuelve a la plataforma como abono.",
    "fuentes": [
      { "label": "Erickson, C. (1988) — Raised Field Agriculture in the Lake Titicaca Basin, Expedition 30(3), Penn Museum", "url": "https://www.penn.museum/sites/expedition/raised-field-agriculture-in-the-lake-titicaca-basin/" }
    ],
    "verificacion": "The surprisingly early dates between 1000 B.C. and the beginning of our era"
  }
]
```

Los campos cerrados:

| Campo | Valores |
|---|---|
| `fichaId` | **Sólo de la lista del anexo.** Un id inventado o mal tipeado hace que la entrada no se muestre nunca. |
| `tipo` | `agua` · `suelo` · `cultivo` · `ganaderia` · `recoleccion` · `fuego` |
| `vigencia` | `en_uso` · `en_retroceso` · `historica` |

`periodo` va en texto y no en números: el registro fecha con rangos abiertos,
con siglos y con "desde". Un campo numérico obligaría a inventar precisión.

`verificacion` no se publica. Es para la revisión de acá y se descarta al
montar: la frase de la fuente, textual y en su idioma original, que sostiene la
fecha que pusiste.

---

## Cómo se trabaja

**Un bloque por vez**, en este orden, que es el de utilidad para el negocio:

1. ~~Prioridad 1 — Argentina~~, ~~A y B. Sudamérica~~ y ~~D. México,
   Centroamérica y Estados Unidos~~: **hechos**. Las 12 argentinas están
   completas y América quedó casi entera. De los tres lo que falta son los ids
   que no tuvieron evidencia específica, listados en
   `practicas-documentadas-ecorregion/COBERTURA_SUDAMERICA_A_B_C.md` y
   `COBERTURA_BLOQUE_D.md`.
2. ~~**H. Medio Oriente** e **I. Norte de África**~~: **hechos**. Quedaron
   cargadas 24 de 28 en H y 11 de 14 en I. Lo que falta está en
   `COBERTURA_BLOQUE_H_MEDIO_ORIENTE.md` y `COBERTURA_BLOQUE_I_NORTE_AFRICA.md`,
   más `socotra` y `uweinat_tibesti`, que se devolvieron: ver
   `REVISION_LOTE_4.md`.
3. ~~**G. Unión Europea**, **F. Europa no comunitaria** y **E. Canadá, Alaska y
   Groenlandia**~~: **hechos**. F quedó completo; G, 24 de 28; E, 9 de 10.
4. ~~**Complementos B, C y D**~~: **hechos**. 17 entradas sobre huecos
   declarados en lotes anteriores. **C quedó cerrado**: 22 de 22. B subió a 37
   de 47 y D a 36 de 53.
5. ~~**Complemento E: prioridades y huecos**~~: **hecho**. 9 entradas, entre
   ellas las seis fichas que este encargo marcaba como prioritarias. **G quedó
   cerrado**: 28 de 28. H subió a 17 de 28 e I a 12 de 14.

**Con eso los nueve bloques están abiertos, tres están completos —el catálogo
base, Europa no comunitaria y la Unión Europea— y no falta ningún continente.**
Lo que queda son **41 fichas sueltas** repartidas por todo el anexo: las que no
tuvieron evidencia específica en su lote. Están listadas, bloque por bloque, en los
`COBERTURA_*.md` de `practicas-documentadas-ecorregion/`. De ahora en más el
trabajo ya no es por bloque sino por ficha, y la pregunta cambia: no es "¿qué
falta cubrir?" sino "¿por qué esta no se pudo sostener, y hay otra fuente?".

**D es hoy el bloque más vacío: 17 de 53 sin entrada**, casi todo
Centroamérica, el Caribe y los manglares, que es además donde más bibliografía
hay. Después vienen H, con 11 de 28, y B, con 10 de 47.

Las dos que más conviene volver a intentar, porque son regiones agrícolas viejas
y el hueco sorprende: `hircania_caspio` y `kopet_dag`. Las seis prioridades
anteriores se cerraron en el séptimo lote.

Y las que probablemente **no** tengan respuesta, donde lo correcto es devolverlas
vacías antes que forzarlas: `socotra`, `uweinat_tibesti`,
`alto_artico_desierto_polar`, `islas_desventuradas`,
`revillagigedo_ecosistemas_insulares`, `isla_malpelo_xerica`.

Lo que el sexto lote deja como lección para los que faltan: **los huecos que
quedan son huecos difíciles**, y la tentación va a ser llenarlos con una fuente
que no alcanza. Es preferible devolver diez fichas vacías que una entrada cuyo
`detalle` el lector no pueda comprobar.

Los ids están en `ANEXO_IDS_FICHAS.md`, al lado de este archivo. **Los bloques
del anexo son los que están en el anexo**: no hay que inferir a qué región
pertenece un id por su nombre, ni asumir que el rótulo de un bloque describe a
todas sus fichas. Si algo no cierra, decilo en las tres líneas del cierre —el
primer lote lo hizo y estuvo bien: el anexo tenía un bloque mal rotulado y ese
aviso fue lo que lo destapó.

Las fichas marcadas con ✓ en el anexo ya tienen práctica cargada: saltearlas.

Al final de cada bloque, tres líneas: cuántas ecorregiones quedaron sin entrada,
cuáles te parecen las que más faltan y por qué no las pudiste sostener. Esa lista
vale tanto como las entradas: dice dónde hay que buscar distinto.

---

## Cómo se revisa acá

Antes de montar, sobre una muestra: se abre la URL, se busca la frase de
`verificacion`, y se controla que el `fichaId` exista. Una entrada cuya fuente no
contiene lo que dice `verificacion` no se corrige — **se descarta el lote y se
vuelve a pedir**, porque una cita que no dice lo que se le atribuye no es un
error de redacción, es el único error que este archivo no puede tener.

Del primer lote se verificaron 15 de 17 palabra por palabra; del segundo, 41 de
44; del tercero, **las 26**; del cuarto, **las 24**; del quinto, **las 41**; del
sexto, **las 17**; del séptimo, **las 9**. Las que no se montaron casi
nunca fallaron la cita: falló el archivo, o falló el resto de la entrada.
**Conviene evitar los PDF escaneados o muy pesados cuando hay una página HTML
equivalente**, y preferir una página estable —la ficha SIPAM del sistema, el
registro del repositorio— a una nota de prensa: una fuente que no se puede abrir
vale lo mismo que ninguna, aunque sea real.

Cinco avisos concretos que salieron de la revisión:

- **La `verificacion` sostiene la fecha; la fuente tiene que sostener toda la
  entrada.** Es lo que falló en el cuarto lote y no lo caza ningún test. Dos
  entradas tenían la frase textual y una fuente que no hablaba de lo que la
  entrada afirmaba: `socotra` declaraba trashumancia vertical en busca de agua
  citando un artículo sobre la economía del pastoreo, que no contiene
  `mobility`, `highland` ni `transhumance`; `uweinat_tibesti` decía que el arte
  rupestre registra cabras y perros en cientos de sitios y que "el museo
  advierte" sobre la datación, y el informe de UNESCO no menciona cabras ni
  perros, dice que Jebel Ouenat es el único punto de agua en cientos de
  kilómetros —no que haya cientos de sitios— y nombra un museo una sola vez, en
  los agradecimientos. Las dos se devolvieron. Antes de escribir el `detalle`,
  preguntate qué oración de la fuente respalda cada afirmación; si alguna no
  tiene ninguna, sacala.

- **El `periodo` tiene que estar escrito en la fuente.** Es el peor defecto de
  los siete lotes y apareció recién en el séptimo:
  `mar_rojo_costa_desierto` fechaba la práctica "desde aproximadamente 5500 años
  antes del presente" y el artículo no dice eso en ninguna parte —dice que
  sacudir y podar acacias está representado ya en el Reino Nuevo egipcio,
  1539-1075 a. C., dos milenios más acá—. Esta capa existe porque la práctica se
  le atribuye a un tiempo y no a una cultura: si el período no sale de la
  fuente, no queda nada que el lector pueda comprobar. Antes que estimar una
  antigüedad, escribí la que la fuente imprime, aunque sea más vaga.

- **Si la fuente es de pago, el `detalle` no puede pasarse del resumen.** En el
  sexto lote, `hawaii_matorrales_altos_bajos` citaba un artículo cerrado de
  *Current Anthropology* y describía alineamientos, senderos, parcelas, bandas
  de lluvia y batata: nada de eso está en el resumen público, que es lo único
  que se puede leer. La fecha sí estaba, así que la entrada se montó recortada,
  diciendo dónde termina lo que la fuente permite comprobar. Un resumen alcanza
  para fechar una práctica y casi nunca para describirla; si no hay copia
  abierta, escribí sólo lo que el resumen dice.

- **Si la fuente nombra al pueblo, la entrada lo nombra.** Volvió el error del
  primer lote. El Servicio de Parques dice que el riego de escorrentía del
  desierto de Sonora "se llama Ak-Chin por los tohono o'odham", y la entrada de
  `sonora_sinaloa_bosque_seco_desierto` hablaba de "otros agricultores
  tempranos". Callar una autoría que la fuente afirma es tan grave como
  inventarla.

- **ResearchGate no es el lugar de publicación.** En el séptimo lote,
  `balcanes_mixto` citaba una copia de ResearchGate de un artículo de
  *Quaternary International*: subida por un usuario, puede no ser la versión
  final, puede desaparecer sin aviso y además responde 403. La URL va al DOI o
  al sitio de la revista. Lo mismo vale para Academia.edu y Scribd.

- **Un boletín oficial no es un trabajo revisado.** `badghyz_pistacho` se apoya
  en la agencia estatal de noticias de Turkmenistán. Se aceptó porque lo que
  afirma es la historia de un programa forestal del propio Estado —ensayos de
  1930, casi cinco mil hectáreas en 1985— y ahí el Estado es fuente primaria de
  sus propios actos. Una afirmación ecológica o agronómica no se sostiene con
  una fuente así.

- **La URL se copia del lugar donde está el archivo.** El PDF de Embrapa se
  citó en `infoteca` cuando vive en `alice`: daba 404 y es el mismo documento.
  Y una dirección del NPS se copió con la coma de "1,000" adentro, donde la
  página usa un guion.
- **Citá el lugar que se puede abrir, no el agregador.** `research.fs.usda.gov`
  devuelve 403 a cualquier cliente, navegador incluido; los tres artículos que
  se citaron desde ahí eran abiertos en la revista que los publicó (*Fire
  Ecology*, *Sustainability*) o en el repositorio de la universidad
  (PDXScholar). Ante la duda, la revista o el repositorio antes que el catálogo
  del organismo. `whc.unesco.org`, en cambio, **no** es un problema: lo que
  parecía un bloqueo era una limitación de la herramienta de acá.
- **La etiqueta describe el documento que abre la URL.** Es el defecto que
  aparece en todos los lotes y que ningún test caza: van catorce en siete
  lotes, **ninguna en el séptimo**, que fue el primero donde las etiquetas
  vinieron completas. Tres en el
  tercero —un artículo vecino del mismo equipo, o el organismo en vez de la
  revista—, uno en el cuarto —`fao.org/4/y1275e/` citado como "Drainage water
  reuse in Egypt", cuando es *Case Studies on Water Conservation in the
  Mediterranean Region* de Vidal y otros, con Egipto como uno de los casos— y
  tres en el quinto: **dos títulos inventados** (el artículo de Copes-Gerbitz
  sobre Ne Sextsine y el de Livarda sobre Palaikastro, este último además con la
  revista equivocada) y una plataforma de la FAO puesta como autora de un texto
  de Barbara Knowles. En el sexto, **siete de golpe**, todas de la misma forma:
  la revista o el organismo en lugar del autor —"Quaternary International —
  Late pre-Columbian agroforestry...", "Current Anthropology — Variable
  Development..."—, sin autor, sin año y sin volumen. Ninguna miente, pero
  ninguna permite encontrar el trabajo si la URL se cae. **Si no podés copiar el
  título exacto del documento, no inventes uno corto que lo describa.** Van
  autor, año, título y dónde se publicó.
- **La `verificacion` va en el idioma de la fuente, entera, sin abreviar y sin
  corregir.** Si el texto está en español o en portugués, la frase se copia en
  español o en portugués. Y no se saca nada del medio: UNESCO escribe "las
  actividades humanas **que allí se desarrollan** y el cuidado de la biosfera",
  y la cita entregada sacó esas tres palabras. Ya van cuatro veces: "Globally
  Important Agricultural Heritage System (GIAHS)" abreviado a "GIAHS" en el
  segundo lote, ése en el tercero, y en el cuarto "the evolution of human life
  **on the edge of the Sahara** from 6000 BC" y un paréntesis entero sacado de
  la frase del Land of Frankincense. Es la regla que más se incumple. Tampoco se
  le arregla la ortografía a la fuente: la FAO escribe "long-**tern** climate
  change" en su propio resumen y la cita lo escribió bien, lo que rompe la
  comparación literal igual que abreviarla. Y en el quinto lote apareció la
  versión más costosa: la **cita reescrita**. La tesis dice "sitúan el origen del
  sistema agrario en terrazas de Galicia **en** los primeros siglos de la Alta
  Edad Media" y la frase entregada decía "**data de** los primeros siglos". Dice
  lo mismo y no sirve para nada: una cita entre comillas que nadie va a encontrar
  buscando esas palabras deja de ser una cita. Copiar y pegar, no resumir ni
  editar.

Después corre `pnpm --filter @arteytierra/terreno test`, que chequea lo
mecánico: fuente presente, `https`, nada de enciclopedias, período no vacío,
detalle con cuerpo, ficha existente, sin duplicados.
