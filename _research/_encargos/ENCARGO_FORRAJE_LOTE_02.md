# Encargo — forraje, lote 02: los tres biomas de pastizal

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto, en un chat nuevo y suelto.
Entrega en `C:\Arte y Tierra\encargos-gpt\entregas\forraje\02.json`.*

Este archivo se lee solo: no hace falta el encargo general ni nada del proyecto.

---

## Por qué este lote es el que importa

Una app de diseño de predios estima la producción forrajera natural con esta
función, que **no tiene ninguna fuente**:

```
lluvia anual < 300 mm → 700 kg MS/ha/año
          < 500 mm → 1.500
          < 700 mm → 3.000
          < 900 mm → 5.000
          ≥ 900 mm → 7.000
```

Ese número multiplica todo lo que viene después: la oferta de pasto, la carga
animal, el tamaño del rodeo y el agua que hay que almacenar para esa hacienda.
Si está mal, el usuario no ve un error: ve un número plausible, y compra vacas o
excava una represa con eso.

**Los tres biomas de este lote son donde esa escalera se aplica de verdad.** Un
predio ganadero cae casi siempre en uno de los tres, y son los tres donde hay
más bibliografía publicada. Reemplazarla acá vale más que en cualquier otro
bioma.

## Los tres ids

| `id` | Bioma (nombre de RESOLVE) |
|---|---|
| `sabana_tropical` | Tropical & Subtropical Grasslands, Savannas & Shrublands |
| `pastizal_templado` | Temperate Grasslands, Savannas & Shrublands |
| `pastizal_montano` | Montane Grasslands & Shrublands |

## Lo que se pide, en este orden de preferencia

El lote anterior volvió con producción primaria neta de sotobosque y no se pudo
usar, así que acá el orden importa:

1. **Oferta forrajera aprovechable** —materia seca que un animal puede comer, ya
   descontada la fracción no palatable o inaccesible—. Es lo que hace falta.
2. **Receptividad o carga animal admisible** publicada por un organismo
   (EV/ha, UG/ha, AU/ha, cabezas/ha, coeficiente de agostadero).
3. **Materia seca herbácea aérea total**, sin descontar nada.
4. **NPP herbácea**, sólo si no hay ninguna de las anteriores.

Las cuatro sirven, **pero hay que decir cuál es**. Entre la 1 y la 4 hay un
factor de varias veces, no un porcentaje, y confundirlas es exactamente cómo se
arruina este cálculo. Para eso está el campo `tipo_de_cifra`, que es
obligatorio y sólo admite estos cuatro valores:

```
"oferta_aprovechable" | "receptividad" | "ms_herbacea_total" | "npp_herbacea"
```

## La forma de cada entrada

```json
{
  "id": "pastizal_templado",
  "tipo_de_cifra": "ms_herbacea_total",
  "kg_ms_ha_anio_min": 0,
  "kg_ms_ha_anio_max": 0,
  "kg_ms_ha_anio_tipico": null,
  "receptividad_valor": null,
  "receptividad_unidad": null,
  "uso_admisible_pct": null,
  "metodo": "Cómo lo midió la fuente: cortes de biomasa, jaulas de exclusión, NPP por satélite, modelo, estimación de receptividad del organismo.",
  "que_cuenta": "Qué incluye y qué no: aéreo o con raíces, todas las especies o sólo las palatables, con o sin descuento por acceso y pisoteo.",
  "rango_lluvia_mm": "Para qué rango de precipitación anual vale. Si la fuente no lo informa, decirlo así.",
  "estacionalidad": "Cómo cambia si la misma lluvia cae concentrada en pocos meses. Si la fuente no lo dice, decirlo.",
  "donde_deja_de_valer": "Las condiciones fuera de las cuales la fuente no se aplica.",
  "region_medida": "Dónde se midió, con el detalle que dé la fuente.",
  "fuentes": [{ "label": "título completo de la página, sin abreviar", "url": "https://…" }],
  "verificacion": "Qué dice literalmente la fuente que sostiene estos números.",
  "nota": ""
}
```

Notas sobre tres campos:

- **`receptividad_valor` / `receptividad_unidad`: no convertir.** Si el organismo
  publica 0,6 EV/ha, va `0.6` y `"EV/ha"` tal cual. El equivalente animal lo
  define cada país de manera distinta y mezclarlos arruina el número. La
  conversión se hace después, acá.
- **`uso_admisible_pct`** sólo si la fuente publica un porcentaje de utilización
  recomendado (lo que se suele llamar *take half leave half*, o un 40 %, 50 %,
  60 % según el ambiente). Si no lo publica, `null`. **No inventarlo**: ese
  porcentaje depende del ambiente y suponerlo es la mitad del error.
- **`kg_ms_ha_anio_tipico`** sólo si la fuente publica un valor central. Si lo que
  hay es un rango, `null`. No se calcula el punto medio.

## Una pista que apareció sola, y lo que muestra

Buscando fuentes para otra cosa —las fichas ecorregionales del norte de África—
apareció un inventario de pastizales forestales del norte de Marruecos que mide
justamente lo que acá falta:

> Land 12(1):215, *Floristic Composition, Diversity, Palatability, and Forage
> Availability of Forest Rangelands in the Southern Mediterranean Region of
> Northern Morocco*. https://doi.org/10.3390/land12010215

Informa **3.143 kg de materia seca por hectárea en primavera**, estimados por el
método del cuadrante, sobre 358 taxones relevados, con la palatabilidad
evaluada para 95 de ellos —los que los pastores conocían— y 32 en el grupo muy
apetecido.

Sirve de ejemplo de dos cosas y de advertencia de una tercera:

1. **Es del tipo de cifra que hace falta**, o casi: tiene disponibilidad de
   forraje medida y palatabilidad evaluada aparte, que es la materia prima de
   una «oferta aprovechable».
2. **Declara la estación.** Dice «en primavera», no «al año». Un máximo
   estacional no es una producción anual, y la escalera que hay que reemplazar
   está en kg/ha/**año**. Si una fuente da un pico de primavera, eso va en
   `estacionalidad` y no en `kg_ms_ha_anio_max`.
3. **Es de un pastizal bajo monte mediterráneo**, que no es ninguno de los tres
   biomas de este lote. No sirve para ninguno de los tres `id`. Se cita acá
   sólo para mostrar qué forma tiene una fuente útil.

**Y una segunda pista, del cierre del encargo de fuentes propias.** En el macizo
del Karkas, en Irán, el único relevamiento publicado de esa sierra mide una
estepa donde los dos ajenjos dominantes cubren cerca del **58 % del área** y
**los herbívoros no los tocan hasta que la lluvia de otoño les lava los aceites
aromáticos**:

> Plant, Soil and Environment 54(8):347-358, *Plant communities of the Karkas
> Hunting-Prohibited Region, Isfahan-Iran*. https://doi.org/10.17221/413-PSE

O sea que más de la mitad de la biomasa en pie de ese lugar **no es forraje
disponible** durante buena parte del año. Tampoco sirve para ninguno de los tres
`id` —es estepa irano-turania—, pero muestra para qué está el campo
`que_cuenta`: entre «materia seca herbácea total» y «oferta aprovechable» puede
haber un factor que no es un ajuste, y la diferencia puede ser **estacional**
además de botánica. El mismo trabajo, de paso, anota la otra cara: el
*Eryngium*, que las espinas protegen del diente, se corta entero a fin del
verano, se seca, se pica y alimenta la hacienda en el invierno. Forraje que no
se pastorea en pie y aparece igual en el balance del año.

## Varias entradas por bioma, y eso está bien

Un bioma tan grande no tiene un número. **Se pueden entregar varias entradas con
el mismo `id`**, una por región medida, y conviene: la sabana del cerrado y la
sabana del África oriental no producen lo mismo, y tener las dos vale más que un
promedio que no describe ninguna.

Dos fuentes independientes por región cuando se puedan conseguir. **Si las dos no
coinciden, se entregan las dos y se dice en `nota`** — que dos mediciones
publicadas discrepen es información, no un problema a resolver promediando.

## Dónde conviene buscar

Organismos que publican producción o receptividad por región, que valen más que
un paper suelto:

- **`sabana_tropical`** — EMBRAPA para el cerrado y la caatinga; INTA para el
  chaco semiárido; ILRI y FAO para los rangelands de África oriental y del sur;
  CSIRO, ABARES y los departamentos estatales para el norte de Australia; CIAT
  para los llanos de Colombia y Venezuela.
- **`pastizal_templado`** — las *Ecological Site Descriptions* del NRCS de
  Estados Unidos, que publican producción anual en año favorable, normal y
  desfavorable por sitio, y son probablemente la fuente más utilizable que
  existe; INTA y AACREA para la pampa y la pampa deprimida; INIA Uruguay;
  Agriculture and Agri-Food Canada para las praderas; FAO para la estepa de Asia
  central.
- **`pastizal_montano`** — INIA Perú y los organismos bolivianos para la puna y
  los pajonales altoandinos; ILRI para las tierras altas de Etiopía; la
  bibliografía de pradera alpina de la meseta tibetana; los estudios de
  *alpage* / *Alpweide* de los Alpes.

## Lo que no entra

- Ningún número sin fuente abierta y verificada. **Abrir cada URL antes de
  escribirla**: un identificador inventado es corto, plausible y pasa cualquier
  revisión.
- Ningún promedio de dos fuentes. Si hay dos, van las dos.
- Ninguna extrapolación a una región donde no se midió. Mejor una entrada menos.
- Nada de riego ni de pastura implantada y fertilizada. Esto es **producción
  natural**: lo que da el lugar sin sembrar y sin regar. Si la fuente mide
  pastura sembrada, se dice en `que_cuenta` y no se usa como si fuera lo mismo.
- Si de un bioma no se consigue nada que cumpla, va en `vacias` con el motivo. Un
  hueco explicado sirve; un número inventado hace daño.

## Cómo se declara un hueco, y qué hacer si una página no abre

Esto es nuevo, y sale del encargo de fuentes propias, que cerró con 62 fichas en
ocho lotes. Las tres reglas valen para este encargo igual:

1. **Una vacía cuyo motivo es de acceso no es una vacía: es un reintento
   pendiente.** En ese encargo, 16 fichas volvieron vacías con el motivo «no se
   pudo abrir la página»; pedidas de nuevo con un camino señalado, **quince
   trajeron fuente**. Antes de declarar una vacía, probar las otras vías: el
   DOI, el sitio del organismo, el repositorio de la universidad de un autor, el
   PDF del informe suelto, PubMed Central, el portal de revistas del país.
2. **El motivo de una vacía tiene que ser chequeable por otro.** Tres cosas: qué
   se buscó, el título y el año de al menos una publicación candidata, y por qué
   no sirve. «No encontré nada» no es un motivo.
3. **Antes de elegir una fuente, mirar si su texto o su resumen es público.** Una
   fuente excelente que no se puede leer no se puede contrastar, así que no se
   puede usar. Si tiene DOI, consultarlo en Crossref o en OpenAlex y ver si trae
   `abstract`. Acá importa el doble que en el otro encargo, porque lo que hace
   falta son números de una tabla: si la tabla está detrás del editor, el
   resumen solo rara vez alcanza.

## La entrega

Un solo bloque JSON, sin prosa alrededor:

```json
{
  "encargo": "forraje",
  "lote": 2,
  "fecha": "2026-10-15",
  "entradas": [ … ],
  "vacias": [ { "id": "…", "motivo": "…" } ]
}
```
