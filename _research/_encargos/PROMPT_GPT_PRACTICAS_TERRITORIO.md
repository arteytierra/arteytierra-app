# Encargo a GPT — prácticas documentadas por ecorregión

Escrito el 14/09/2026. Alimenta `apps/terreno/lib/practicasHistoricas.ts`, que
hoy tiene 89 entradas sobre 88 ecorregiones de 222.

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
2. **H. Medio Oriente** (2 de 28) e **I. Norte de África** (0 de 14) — mucha
   obra hidráulica documentada por UNESCO: qanats, foggaras, aflaj, jessour,
   terrazas de Yemen y Omán. Es el bloque con más fuente de organismo por ficha.
3. **G. Unión Europea** (0 de 28) y **F. Europa no comunitaria** (0 de 8).
4. **E. Canadá, Alaska y Groenlandia** (0 de 10) — Alaska ya tiene dos entradas
   cargadas desde el bloque D; fijate en el anexo cuáles.
5. Lo que quedó suelto: **C. Norteamérica, Mesoamérica, Caribe y Europa**
   (16 de 22) y el resto de B y D.

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
44; del tercero, **las 26**. Las que no se montaron casi nunca fallaron la cita:
falló el archivo. Un PDF de CONABIO sin capa de texto, un documento de UNESCO
que devuelve 403 a todo lo que no sea un navegador, y una nota de FAO Brasil que
**desapareció del sitio**. **Conviene evitar los PDF escaneados o muy pesados
cuando hay una página HTML equivalente**, y preferir una página estable —la
ficha SIPAM del sistema, el registro del repositorio— a una nota de prensa: una
fuente que no se puede abrir vale lo mismo que ninguna, aunque sea real.

Cuatro avisos concretos que salieron de la revisión:

- **La URL se copia del lugar donde está el archivo.** El PDF de Embrapa se
  citó en `infoteca` cuando vive en `alice`: daba 404 y es el mismo documento.
  Y una dirección del NPS se copió con la coma de "1,000" adentro, donde la
  página usa un guion.
- **Citá el lugar que se puede abrir, no el agregador.** `research.fs.usda.gov`
  devuelve 403 a cualquier cliente, navegador incluido; los tres artículos que
  se citaron desde ahí eran abiertos en la revista que los publicó (*Fire
  Ecology*, *Sustainability*) o en el repositorio de la universidad
  (PDXScholar). Ante la duda, la revista o el repositorio antes que el catálogo
  del organismo.
- **La etiqueta describe el documento que abre la URL.** En el tercer lote tres
  etiquetas nombraban otra cosa: un artículo vecino del mismo equipo, o el
  organismo en vez de la revista. La cita se verifica igual, pero el lector que
  la sigue termina en otro lado. Van autor, año y dónde se publicó.
- **La `verificacion` va en el idioma de la fuente, entera y sin abreviar.** Si
  el texto está en español o en portugués, la frase se copia en español o en
  portugués. Y no se saca nada del medio: UNESCO escribe "las actividades
  humanas **que allí se desarrollan** y el cuidado de la biosfera", y la cita
  entregada sacó esas tres palabras. Ya había pasado antes con "Globally
  Important Agricultural Heritage System (GIAHS)" abreviado a "GIAHS". Es la
  única regla que se incumplió dos veces: copiar y pegar, no resumir.

Después corre `pnpm --filter @arteytierra/terreno test`, que chequea lo
mecánico: fuente presente, `https`, nada de enciclopedias, período no vacío,
detalle con cuerpo, ficha existente, sin duplicados.
