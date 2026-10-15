# Encargo — fuentes propias, lote 05: Arabia del sur, el mar Rojo e Irán (17)

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto, en un chat nuevo y suelto.
La entrega va en
`C:\Arte y Tierra\encargos-gpt\entregas\fuentes-propias\05.json`.*

Este archivo se lee solo: no hace falta el encargo general ni nada del proyecto.

**Van quedando 31.** Los lotes 01 al 04 están montados —31 fichas cerradas, el
norte de África terminado— y lo que falta son 31 fichas en dos lotes. Este es el
primero de los dos. Reemplaza al bloque del lote 05 de
`ENCARGO_FUENTES_PROPIAS_LOTES_05_06.md`, porque el lote 04 dejó tres lecciones
nuevas que convienen antes de empezar.

---

## El problema, que no es la falta de fuentes

Un catálogo de fichas ecorregionales describe suelos, vegetación y manejo de cada
ecorregión del mundo. Cada ficha cita tres o cuatro fuentes, y aun así **31 de
ellas no se pueden chequear**, porque esas fuentes son las mismas de todo el
paquete: un atlas de suelos continental, una capa global de ecorregiones, una
base de datos mundial. Respaldan que la ficha existe; no respaldan lo que la
ficha afirma de **ese** lugar.

Lo que hace falta es, por ficha, **una fuente del lugar**: una medición, un
inventario, un plan de manejo, una tesis, un artículo regional. Una sola alcanza.

## Las 17 fichas

Los `id` son los del catálogo y están verificados: hay que copiarlos tal cual,
porque un id que no existe hace que la entrada no se muestre nunca.

| `id` | Dónde |
|---|---|
| `arabia_este_niebla` | Arenales de niebla del este arábigo (Wahiba, costa omaní) |
| `mar_rojo_escarpe` | Escarpe y llanura del mar Rojo (Hiyaz, Asir, Eritrea) |
| `mar_rojo_mangle` | Manglares del mar Rojo |
| `tihama_costa_arida` | Tihama, llanura costera del mar Rojo |
| `yemen_montana_aterrazada` | Montaña aterrazada del Yemen |
| `asir_altiplano_seco` | Altiplano seco del Asir, Arabia Saudita |
| `arabia_sur_bosque_niebla` | Bosque de niebla del Dofar, Omán |
| `hadramaut_meseta` | Meseta y uadis del Hadramaut, Yemen |
| `socotra` | Socotra |
| `iran_sur_nubo_sindico` | Sur de Irán nubo-síndico (costa de Hormuz al Makrán) |
| `kavir_cuencas_endorreicas` | Cuencas endorreicas de Irán central (Dasht-e Kavir, Lut) |
| `elburz_estepa_forestal` | Estepa forestal del Elburz, Irán |
| `caspio_llanura_desertica` | Llanura desértica caspia |
| `kopet_dag` | Kopet Dag, frontera de Irán y Turkmenistán |
| `badghyz_pistacho` | Sabana de pistacho de Badgyz, Afganistán |
| `kuh_rud_montano` | Sierras de Kuh Rud y el este iraní |
| `sistan_registan` | Arenales de Sistán y Registán |

## Qué tiene que cumplir la fuente

Las cuatro, y no es negociable ninguna:

1. **Abre hoy.** Probá la URL antes de escribirla. Si no se puede abrir, no se
   puede desmentir, y una afirmación que no se puede desmentir no sirve.
2. **Es la publicación, no un intermediario.** ResearchGate, Academia.edu,
   Scribd y los agregadores de acceso abierto son *hosts*. Hay que llegar al
   artículo en la revista, el repositorio institucional, la universidad o el
   organismo. Si existe un DOI, va el DOI. Un *handle* de repositorio sirve
   sólo si el repositorio es el editor; si el artículo salió en una revista,
   va la revista.
   En el lote 04 una entrada citó el handle del repositorio de la Universidad
   de Lieja y aclaró que ese registro la identifica como revisada por pares.
   La aclaración era cierta y el repositorio fue útil —de ahí salió el DOI—,
   pero el artículo había salido en Cybergeo, revista del CNRS, y la cita
   correcta es el DOI de la revista. **Si el repositorio te da un DOI, el DOI
   es la cita.**
3. **Es un trabajo publicado, no una nota periodística.** Un diario puede servir
   para *encontrar* el dato; la cita es el trabajo que está detrás.
4. **No está retractada.** En el lote 02 el artículo elegido para el desierto
   arábigo existía **dos veces**, y la versión que aparece primero buscando por
   título era la retractada. Las otras tres condiciones una retractación las
   cumple igual de bien que un artículo vivo. Si hay dos registros del mismo
   trabajo con DOI distinto, fijate cuál dice «RETRACTED» y poné el DOI del
   bueno.

Y una advertencia de tamaño: una nota de dos páginas en el número 2 del volumen 1
de una revista sin presencia indexada no alcanza. No es esnobismo — es que no hay
con qué contrastarla.

## Qué tiene que decir la fuente

Algo concreto y comprobable sobre **el lugar**: un tipo de suelo clasificado, una
profundidad, un contenido de materia orgánica, una lista de especies relevada, una
superficie, una serie de lluvia, un rendimiento, un sistema de riego descrito, un
caudal, una cota, una tasa de erosión.

**No** sirve una fuente que confirme que la ecorregión existe o que repita su
descripción general. Eso ya lo tenemos y es justo el problema.

### Y lo que más vale: el dato que da vuelta la conclusión fácil

Esto es lo que esta app necesita de verdad, y los cuatro lotes anteriores lo
dejaron bien documentado. Son cuatro formas distintas del mismo problema, y las
cuatro aparecieron en fuentes buenas, no en fuentes malas:

- **Una cosa que sube y otra que baja.** En el lote 03, el artículo del Troodos
  medía la concentración de carbono orgánico —que sube al abandonar el cultivo—
  y después el stock corregido por pedregosidad, que baja. Si la entrada hubiera
  copiado sólo la concentración, la ficha habría afirmado lo contrario de lo que
  dice el artículo. **Si la fuente mide dos cosas que apuntan distinto, poné las
  dos.**
- **Un promedio de un solo año no es un promedio anual.** En el lote 04, el
  proyecto de captación de niebla de Sidi Ifni se había dimensionado con 7 litros
  por metro cuadrado y día, sacados de un año de medición en 2007; cuando se
  midieron cuatro años, los promedios anuales dieron 1,6, 6,0 y 3,9 — todos por
  debajo. **Si el número sale de un año, una campaña o una estación, decilo.**
  Es la diferencia entre un dato y una estimación.
- **Fijate de qué lugar es cada número.** También del lote 04: el artículo citado
  para el Gran Erg Oriental medía avance de dunas, y el único número que lograba
  medir —15,83 metros por año— era de la depresión de Bodelé, en Chad. En el erg
  argelino el método había fallado. Copiar el número habría atribuido al erg una
  velocidad que nadie determinó. **Un artículo puede medir dos lugares y sólo uno
  ser el de la ficha.**
- **Un promedio sobre un rango enorme no describe nada.** En el oasis de Dajla la
  conductividad eléctrica iba de 2,3 a 165,8 dS/m con una media de 27,1. La media
  ahí no es información. **Si la fuente da rango y media, poné el rango.**

## La forma de cada entrada

```json
{
  "id": "socotra",
  "sobre": "vegetacion",
  "fuentes": [
    { "label": "título completo de la publicación, sin abreviar", "url": "https://…" }
  ],
  "verificacion": "Qué dice literalmente la fuente, con sus números y su alcance: dónde se midió, cuándo, cuántos sitios, qué valores.",
  "nota": "El alcance real: de qué lugar es esta fuente y de qué lugar NO habla."
}
```

- **`sobre`**: uno de `suelos`, `vegetacion`, `clima`, `agua`, `manejo`.
- **`verificacion`** es el campo que más importa y tiene que ser **literal**. Lo
  que escribas acá se va a copiar al texto que lee el usuario, así que todo
  número que pongas tiene que estar en el documento. En el lote 01 una entrada
  afirmó dos superficies en hectáreas y dos franjas de altitud que no aparecían
  en ninguna de las 7.619 líneas del plan de manejo que citaba: la fuente era
  buena, los números no eran de ahí. **Si no estás seguro de que un número está
  en el documento, no lo pongas.**
  Y si lo único que podés leer es el resumen, decilo: «el resumen informa que…»
  es una respuesta correcta y se puede montar. Pasó dos veces y las dos se
  resolvieron igual: en el lote 03 una entrada nombró dos macizos de Creta que
  estaban en los métodos y no en el resumen, y en el lote 04 otra afirmó
  relevamientos de campo de 2020 a 2022 cuando el resumen describía
  teledetección y no fechaba ninguna campaña. En los dos casos hubo que dejar
  eso afuera. **No estaba mal: estaba sin verificar, y es lo mismo para esto.**
- **`nota`** no es un trámite: es lo que vuelve usable a la fuente. «Ocho perfiles
  de un campo de lava, no todos los harrat» es la clase de frase que hace falta.
  Una fuente del lugar es de un lugar, y pretender que cubre la ecorregión entera
  es volver al problema del principio. La `nota` es sobre el alcance de **esa**
  fuente; no hace falta repetir ahí las reglas de este encargo.

## Dónde conviene buscar en esta zona

- **Omán** publica bastante: el Ministerio de Agricultura y Pesca, la Universidad
  Sultán Qabús y la bibliografía del Dofar y de los *aflaj*. El bosque de niebla
  del Dofar tiene literatura propia sobre el *khareef*.
- **Socotra** es un caso bien estudiado: hay inventarios de flora, trabajos de
  endemismo y el expediente de Patrimonio Mundial con caracterización física.
- Para el **Yemen**, la literatura de terrazas de piedra seca y de riego por
  avenidas (*spate irrigation*) es abundante y buena; el Spate Irrigation Network
  publica informes técnicos con mediciones.
- Para **Irán**, las universidades de Teherán, Shiraz e Isfahán, y los trabajos
  sobre *qanat* y sobre los *kavir*. Los bosques del Elburz e hircanos tienen
  inventarios forestales publicados.
- **Ramsar** y **UNESCO** otra vez: varios humedales iraníes y del mar Rojo son
  sitios Ramsar con fichas informativas que describen suelos e hidrología.
- Para los **manglares del mar Rojo**, los institutos saudíes y egipcios y la
  Global Mangrove Watch publican inventarios por sitio.

Un aviso sobre el acceso, por lo que pasó en los lotes 03 y 04: hay editoriales
que responden con una verificación anti-bot y no se pueden abrir desde acá
(Taylor & Francis, Wiley, OpenEdition). Si la única copia del texto completo está
ahí, igual sirve —el resumen suele ser público y se puede montar lo que el
resumen diga—, pero avisalo en la `verificacion`. Y si existe una copia en un
repositorio institucional o en PubMed Central, mejor: ponela como segunda entrada
del array `fuentes`.

## Lo que no entra

- Ningún número sin fuente abierta y verificada.
- Ninguna fuente que hable de un país entero cuando la ficha es de una
  ecorregión, salvo que lo digas en `nota` y el dato igual sirva.
- Ninguna extrapolación. Si de una ficha no sale nada que cumpla, va en `vacias`
  con el motivo, y eso es una respuesta correcta y útil. Quince fichas con trece
  fuentes buenas y dos vacías justificadas es un lote mejor que quince forzadas.

## La entrega

Un bloque JSON, sin prosa alrededor:

```json
{
  "encargo": "fuentes-propias",
  "lote": 5,
  "fecha": "2026-10-13",
  "entradas": [ … ],
  "vacias": [ { "id": "…", "motivo": "…" } ]
}
```
