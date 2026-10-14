# Encargo — fuentes propias, lotes 05 y 06: las 31 que faltan

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto, en un chat nuevo y suelto.
Dos entregas separadas, en
`C:\Arte y Tierra\encargos-gpt\entregas\fuentes-propias\05.json` y `06.json`.*

Este archivo se lee solo: no hace falta el encargo general ni nada del proyecto.

> **El lote 05 se reemitió aparte el 13/10/2026**, en
> `ENCARGO_FUENTES_PROPIAS_LOTE_05.md`, porque el lote 04 dejó tres lecciones
> que convenía poner antes de empezar: un promedio de un solo año no es un
> promedio anual, hay que fijarse de qué lugar es cada número, y un promedio
> sobre un rango enorme no describe nada. Para el lote 05 usar ese archivo.
> Este sigue valiendo para el **lote 06**.

**Son las últimas.** Con el lote 04 ya entregado, lo que queda son estas 31
fichas y después el trabajo se cierra. Van en dos lotes porque cada lote se
verifica abriendo sus fuentes una por una, y 31 de una vez no se puede revisar
con cuidado. Mismo chat, dos bloques JSON, uno por lote.

---

## El problema, que no es la falta de fuentes

Un catálogo de fichas ecorregionales describe suelos, vegetación y manejo de cada
ecorregión del mundo. Cada ficha cita tres o cuatro fuentes, y aun así **44 de
ellas no se pueden chequear**, porque esas fuentes son las mismas de todo el
paquete: un atlas de suelos continental, una capa global de ecorregiones, una
base de datos mundial. Respaldan que la ficha existe; no respaldan lo que la
ficha afirma de **ese** lugar.

Lo que hace falta es, por ficha, **una fuente del lugar**: una medición, un
inventario, un plan de manejo, una tesis, un artículo regional. Una sola alcanza.

## Lote 05 — Arabia del sur, el mar Rojo e Irán (17)

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

## Lote 06 — Anatolia, el Cáucaso, la estepa póntica y el Ártico canadiense (14)

| `id` | Dónde |
|---|---|
| `tauro_conifera_montana` | Conífera montana del Tauro y Anatolia mediterránea |
| `ponto_anatolia_norte` | Conífera y frondosa del norte de Anatolia |
| `meseta_anatolia_estepa` | Estepa de la meseta de Anatolia central |
| `anatolia_oriental_montana` | Montaña y estepa de Anatolia oriental |
| `euxino_colquico` | Bosque euxino-cólquico (costa este del mar Negro, Georgia) |
| `caucaso_mixto` | Bosque mixto del Cáucaso |
| `kura_semidesierto` | Semidesierto y estepa del Kura, Azerbaiyán |
| `crimea_submediterraneo` | Complejo submediterráneo de Crimea |
| `estepa_pontica_chernozem` | Estepa póntica y chernozem |
| `estepa_forestal_este` | Estepa forestal de Europa oriental |
| `zagros_estepa_forestal` | Estepa forestal del Zagros, Irán e Irak |
| `escudo_canadiense_boreal` | Bosque boreal cerrado del escudo canadiense |
| `tundra_artica_canadiense` | Tundra ártica canadiense |
| `alto_artico_desierto_polar` | Desierto polar del Alto Ártico canadiense |

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

Y lo que más vale, cuando aparece: **el dato que da vuelta la conclusión fácil.**
En el lote 03, el artículo del Troodos medía la concentración de carbono orgánico
—que sube al abandonar el cultivo— y después el stock corregido por pedregosidad,
que baja. Si la entrada hubiera copiado sólo la concentración, la ficha habría
afirmado lo contrario de lo que dice el artículo. Si la fuente mide dos cosas que
apuntan distinto, poné las dos.

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
  es una respuesta correcta y se puede montar. En el lote 03 una entrada nombró
  dos macizos de Creta que estaban en los métodos y no en el resumen, y hubo que
  dejarlos afuera. No estaba mal: estaba sin verificar, y es lo mismo para esto.
- **`nota`** no es un trámite: es lo que vuelve usable a la fuente. «Ocho perfiles
  de un campo de lava, no todos los harrat» es la clase de frase que hace falta.
  Una fuente del lugar es de un lugar, y pretender que cubre la ecorregión entera
  es volver al problema del principio. La `nota` es sobre el alcance de **esa**
  fuente; no hace falta repetir ahí las reglas de este encargo.

## Dónde conviene buscar en estas dos zonas

Para el lote 05:

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

Para el lote 06:

- **Turquía**: las facultades de forestales de Estambul, Karadeniz y Çukurova
  publican inventarios del Tauro y del Ponto en revistas indexadas, y hay
  literatura de estepa de Anatolia central con mediciones de suelo.
- **Georgia y Azerbaiyán**: la Academia de Ciencias georgiana, el Instituto de
  Botánica, y la bibliografía del Cólquida, que también es Patrimonio Mundial.
- **Ucrania y Rusia del sur**: la literatura de chernozem es enorme y vieja, con
  mediciones de carbono de las reservas de estepa (Askania-Nova, Streletska)
  comparadas contra tierra arada.
- **Canadá** es el más fácil de los tres bloques: el Servicio Forestal Canadiense,
  los informes de los parques nacionales del Ártico, el CAFF y la literatura de
  permafrost tienen mediciones por sitio y acceso abierto.

## Lo que no entra

- Ningún número sin fuente abierta y verificada.
- Ninguna fuente que hable de un país entero cuando la ficha es de una
  ecorregión, salvo que lo digas en `nota` y el dato igual sirva.
- Ninguna extrapolación. Si de una ficha no sale nada que cumpla, va en `vacias`
  con el motivo, y eso es una respuesta correcta y útil. Quince fichas con trece
  fuentes buenas y dos vacías justificadas es un lote mejor que quince forzadas.

## La entrega

Dos bloques JSON, sin prosa alrededor, uno por lote:

```json
{
  "encargo": "fuentes-propias",
  "lote": 5,
  "fecha": "2026-10-13",
  "entradas": [ … ],
  "vacias": [ { "id": "…", "motivo": "…" } ]
}
```

```json
{
  "encargo": "fuentes-propias",
  "lote": 6,
  "fecha": "2026-10-13",
  "entradas": [ … ],
  "vacias": [ { "id": "…", "motivo": "…" } ]
}
```
