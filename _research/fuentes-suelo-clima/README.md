# Fuentes regionales de suelo y clima — relevamiento

Carpeta de **investigación**, no de código de la app. Acá se deja el relevamiento
de fuentes de datos nacionales/regionales que después se implementan en
`apps/terreno`.

## Por qué existe

`acequia` funciona en cualquier parte del mundo con fuentes globales (SoilGrids
250 m para suelo, NASA POWER para clima, GLO-30 para relieve). Donde existe un
servicio nacional en vivo, con mejor resolución y licencia comercial clara, se
usa ése y la fuente global queda de respaldo. Ya funciona así el relieve
(`lib/elevacion/router.ts`) y desde hoy el suelo en Estados Unidos
(`lib/sueloFuentes.ts` → SSURGO).

Lo caro de sumar una fuente no es el código: es averiguar si existe, si sigue
viva, qué devuelve exactamente y si la licencia permite usarla en un producto
que se cobra. Eso es lo que se releva acá.

## Reparto

| Región | A cargo |
|---|---|
| Estados Unidos, Canadá, Europa | Claude |
| Sudamérica, Centroamérica, Caribe | GPT |

## Qué se entrega

Una ficha por fuente, en `<region>/<pais>-<fuente>.md`. Por ejemplo:
`sudamerica/argentina-inta-cartas-suelo.md`.

Además, un `<region>/RESUMEN.md` por región con la tabla de todo lo relevado,
ordenada por cuánto mejora sobre la fuente global.

Hay también una carpeta `global/`, para lo que aparece buscando en una región
pero sirve en todas: ahí cayeron el mapa Köppen de 1 km y el aviso de licencia de
Open-Meteo. Cuando una ficha global salga de un relevamiento regional, enlazarla
desde el `RESUMEN.md` de esa región.

## Regla dura sobre licencias

Una fuente entra sólo si **permite uso comercial**. `acequia` es un producto que
se cobra. Si la licencia es no comercial (como LUCAS Topsoil en Europa), o es
copyleft que obligue a liberar la app (CC-BY-SA), o no dice nada y no hay forma
de averiguarlo, la ficha se escribe igual pero marcada **DESCARTADA** con el
motivo. Eso también es resultado: evita que alguien la vuelva a proponer.

## Formato de la ficha

Usar `_PLANTILLA.md` como base. No cambiar los títulos de sección: se leen
después una atrás de otra para decidir el orden de implementación.

## Qué NO va acá

- Código de la app. Nada fuera de esta carpeta.
- Claves de API, tokens ni credenciales. Si una fuente pide clave, se anota que
  la pide y cómo se saca, no la clave.
- Fuentes que haya que descargar entera y hostear (un GeoTIFF nacional de 40 GB).
  Nos interesan las que se consultan por punto o por bbox, en vivo.
