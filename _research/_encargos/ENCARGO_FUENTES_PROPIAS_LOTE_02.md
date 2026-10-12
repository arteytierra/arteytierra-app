# Encargo — fuentes propias, lote 02: Arabia, Mesopotamia e Irán

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto, en un chat nuevo y suelto.
Entrega en `C:\Arte y Tierra\encargos-gpt\entregas\fuentes-propias\02.json`.*

Este archivo se lee solo: no hace falta el encargo general ni nada del proyecto.

---

## El problema, que no es la falta de fuentes

Un catálogo de fichas ecorregionales describe suelos, vegetación y manejo de cada
ecorregión del mundo. Cada ficha cita tres o cuatro fuentes, y aun así **56 de
ellas no se pueden chequear**, porque esas fuentes son las mismas de todo el
paquete: un atlas de suelos continental, una capa global de ecorregiones, una
base de datos mundial. Respaldan que la ficha existe; no respaldan lo que la
ficha afirma de **ese** lugar.

Lo que hace falta es, por ficha, **una fuente del lugar**: una medición, un
inventario, un plan de manejo, una tesis, un artículo regional. Una sola alcanza.

## Las seis de este lote

Son del Medio Oriente. Para cada una va el `id` exacto y entre paréntesis dónde
queda:

Los `id` son los del catálogo y están verificados: hay que copiarlos tal cual,
porque un id que no existe hace que la entrada no se muestre nunca.

| `id` | Dónde |
|---|---|
| `mesopotamia_marismas` | Ahwar del bajo Tigris y Éufrates, sur de Irak |
| `harrat_basalto` | Altiplanos basálticos del oeste de Arabia y Siria |
| `desierto_arabigo` | Desierto interior de la península arábiga |
| `nefud_rub_al_khali` | Arenales del Nefud y el Rub al-Khali |
| `golfo_llanura_costera` | Llanura costera del golfo Pérsico |
| `golfo_persico_mangle` | Manglares del golfo Pérsico |

## Qué tiene que cumplir la fuente

Las tres, y no es negociable ninguna:

1. **Abre hoy.** Probá la URL antes de escribirla. Si no se puede abrir, no se
   puede desmentir, y una afirmación que no se puede desmentir no sirve.
2. **Es la publicación, no un intermediario.** ResearchGate, Academia.edu,
   Scribd y los agregadores de acceso abierto son *hosts*. Hay que llegar al
   artículo en la revista, el repositorio institucional, la universidad o el
   organismo. Si existe un DOI, va el DOI.
3. **Es un trabajo publicado, no una nota periodística.** Un diario puede servir
   para *encontrar* el dato; la cita es el trabajo que está detrás.

Y una advertencia de tamaño: una nota de dos páginas en el número 2 del volumen 1
de una revista sin presencia indexada no alcanza. No es esnobismo — es que no hay
con qué contrastarla.

## Qué tiene que decir la fuente

Algo concreto y comprobable sobre **el lugar**: un tipo de suelo clasificado, una
profundidad, un contenido de materia orgánica, una lista de especies relevada, una
superficie, una serie de lluvia, un rendimiento, un sistema de riego descrito.

**No** sirve una fuente que confirme que la ecorregión existe o que repita su
descripción general. Eso ya lo tenemos y es justo el problema.

## La forma de cada entrada

```json
{
  "id": "zagros_robledal",
  "sobre": "suelos",
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
  número que pongas tiene que estar en el documento. En el lote anterior una
  entrada afirmó dos superficies en hectáreas y dos franjas de altitud que no
  aparecían en ninguna de las 7.619 líneas del plan de manejo que citaba: la
  fuente era buena, los números no eran de ahí. **Si no estás seguro de que un
  número está en el documento, no lo pongas.**
- **`nota`** no es un trámite: es lo que vuelve usable a la fuente. «Fuente local
  del parque, no un inventario de toda la ecorregión» es la clase de frase que
  hace falta. Una fuente del lugar es de un lugar, y pretender que cubre la
  ecorregión entera es volver al problema del principio.

## Dónde conviene buscar en esta zona

- **ICARDA** (Centro Internacional de Investigación Agrícola en Zonas Secas) y
  **ACSAD**, que publican sobre suelos y agua de toda la región árida.
- Las **universidades saudíes, iraníes y jordanas**: hay literatura de suelos de
  los *harrat* basálticos, de los arenales y de la llanura del Golfo en revistas
  regionales indexadas.
- **Planes de manejo de áreas protegidas** y expedientes de **UNESCO** —las
  marismas de Mesopotamia son Patrimonio Mundial y su expediente de nominación
  trae caracterización física— y de **Ramsar**, cuyas fichas informativas
  describen suelos, hidrología y uso.
- Para Omán y los Emiratos, los **ministerios de agricultura y pesca** y la
  bibliografía sobre los *aflaj*, que está bien publicada.
- Para los manglares del Golfo, la **Global Mangrove Watch** y los ministerios de
  ambiente de los estados del Golfo publican inventarios por sitio.

## Lo que no entra

- Ningún número sin fuente abierta y verificada.
- Ninguna fuente que hable de un país entero cuando la ficha es de una
  ecorregión, salvo que lo digas en `nota` y el dato igual sirva.
- Ninguna extrapolación. Si de una ficha no sale nada que cumpla, va en `vacias`
  con el motivo, y eso es una respuesta correcta y útil.

## La entrega

Un solo bloque JSON, sin prosa alrededor:

```json
{
  "encargo": "fuentes-propias",
  "lote": 2,
  "fecha": "2026-10-12",
  "entradas": [ … ],
  "vacias": [ { "id": "…", "motivo": "…" } ]
}
```
