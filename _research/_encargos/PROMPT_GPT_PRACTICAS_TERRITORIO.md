# Encargo a GPT — prácticas documentadas por ecorregión

Escrito el 14/09/2026. Alimenta `apps/terreno/lib/practicasHistoricas.ts`, que
hoy tiene 21 entradas sobre 20 ecorregiones de 222.

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
está mal.

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

1. **Prioridad 1 — Argentina**, las 12 fichas que encabezan el anexo. Es el
   mercado y es donde hay más fuente accesible (INTA, CONICET, universidades
   nacionales, Parques Nacionales).
2. **B. Sudamérica** — el resto del continente, 47 fichas.
3. **D. México, Centroamérica y Estados Unidos** — hay mucho SIPAM/FAO.
4. **H. Medio Oriente** e **I. Norte de África** — mucha obra hidráulica
   documentada por UNESCO.
5. **G. Unión Europea**, **F. Europa no comunitaria**, **E. Canadá y Alaska**.

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

Del primer lote, 15 de 17 se verificaron palabra por palabra contra la fuente.
Las otras dos no se montaron, y no porque la cita fallara sino porque no se
pudo abrir el archivo: un PDF del USDA con el certificado vencido y otro de
CONABIO sin capa de texto legible. **Conviene evitar los PDF escaneados o muy
pesados cuando hay una página HTML equivalente**: una fuente que no se puede
abrir vale lo mismo que ninguna, aunque sea real.

Después corre `pnpm --filter @arteytierra/terreno test`, que chequea lo
mecánico: fuente presente, `https`, nada de enciclopedias, período no vacío,
detalle con cuerpo, ficha existente, sin duplicados.
