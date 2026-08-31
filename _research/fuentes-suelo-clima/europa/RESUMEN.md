# Europa — resumen del relevamiento

Estado al **31/08/2026**. Ordenado por cuánto mejora sobre la fuente global.

| Fuente | Tipo | Resolución | Cobertura | Licencia comercial | Estado | Prioridad |
|---|---|---|---|---|---|---|
| [Köppen 1 km de Beck](../global/koppen-beck-1km.md) | clima | 1 km | **mundial** | ✅ CC BY 4.0 | viva, hay que hostear 12,5 MB | **alta** |
| [DWD / Bright Sky](alemania-dwd-brightsky.md) | clima | estación | Alemania | ✅ CC BY 4.0 | viva, probada | media |
| [AEMET OpenData](espana-francia-servicios-con-clave.md) | clima | estación | España | ✅ (sin leer términos) | viva, **sin verificar** | media |
| [Météo-France DPClim](espana-francia-servicios-con-clave.md) | clima | estación | Francia | ✅ (sin leer términos) | viva, **sin verificar** | baja |
| [CERRA-Land](cerra-land-cds.md) | clima | 5,5 km | Europa | ✅ Copernicus | viva, **sin puerta** | descartada |
| [BÜK200 (BGR)](alemania-buek200-bgr.md) | suelo | 1:200.000 | Alemania | ❌ no verificable | viva, **descartada** | descartada |

## Lo que Europa no tiene, y hay que decirlo

**Europa no tiene su Daymet.** Ésa era la apuesta de esta fase: encontrar para
Europa el equivalente de lo que Daymet le dio a Norteamérica, una grilla fina de
clima consultable por punto y en vivo. No existe.

La candidata natural, CERRA-Land, es técnicamente perfecta —5,5 km, licencia
Copernicus, treinta años— y se cae por la puerta: el Climate Data Store no se
consulta, se le encarga, y devuelve archivos encolados minutos u horas después.
Eso no entra detrás de un usuario que está esperando su análisis. Lo que quedó
son servicios nacionales de **estación**, que son otra cosa: aportan medición real
donde hay estación y nada donde no la hay.

**Europa tampoco tiene su SSURGO.** Para suelo la única fuente nacional con
servicio en vivo que encontré fue la carta alemana BÜK200, y se cae por licencia:
el `GetCapabilities` remite a unas condiciones generales cuyas dos URLs devuelven
400, y las entradas en el catálogo de datos abiertos alemán tienen el campo de
licencia vacío. Sin permiso comercial verificable no entra —es la regla dura del
README—. Sumada a LUCAS, que ya estaba descartada por no comercial, **Europa se
queda con SoilGrids**.

Que dos de seis fichas terminen en DESCARTADA no es un relevamiento fallido: es
lo que el relevamiento existe para averiguar, y las fichas quedan escritas para
que nadie las vuelva a proponer sin resolver primero lo que las frenó.

## Los dos hallazgos que sí valen

**1. El mapa Köppen de 1 km, y no es europeo.** Apareció buscando para Europa y
sirve para todo el planeta. Hoy la app **calcula** el Köppen aplicando las reglas
sobre las medias de POWER, en celdas de ~50 km; Beck et al. lo publicaron **ya
clasificado a 1 km**, hecho con un ensamble de fuentes corregidas. Pasar de
calcularlo a leerlo mejora todo lo que cuelga del Köppen —análogos, ecorregiones,
recomendaciones—, y en cualquier parte del mundo, no sólo acá.

Y abre algo que la app hoy no puede decir: el mismo dataset trae 1901–1930,
1931–1960, 1961–1990, 1991–2020 y proyecciones a 2041–2070 y 2071–2099 por
escenario. Comparar dos períodos en el mismo punto es leer dos píxeles. Para
alguien que planta un monte que tarda treinta años, **a qué clima va el predio**
es más útil que en cuál está.

Tiene una condición: **hay que hostearlo**. No hay servicio en vivo, se publica
como archivo. Pero el archivo del presente a 1 km global son **12,5 MB**, medidos
—no estimados— leyendo la tabla del zip por *range request*. Eso entra en el
repo o en un bucket sin discutir. Igual **es una decisión de Jonatan**, porque el
README dice que no hosteamos fuentes descargables, y ésta lo sería: la regla se
escribió pensando en un GeoTIFF nacional de 40 GB, no en 12 MB para el mundo
entero, pero cambiar el criterio no me toca a mí.

**2. Un problema de licencia que ya está en producción.** Ver
[`global/open-meteo-licencia.md`](../global/open-meteo-licencia.md). Fui a leer
los términos de Open-Meteo porque aparecía como candidata europea, y resulta que
**la app ya la usa en dos lugares y en la modalidad que prohíbe el uso comercial**:
la serie diaria de ERA5 que alimenta los extremos climáticos, y un respaldo de
elevación. La tabla de planes de Open-Meteo dice, textual, *"Free / Open-Access
API — Commercial use ❌"*.

El dato no es el problema: es CC-BY 4.0. El problema es el servicio, y `acequia`
se cobra. Las salidas están en la ficha; la más barata en trabajo es pagar el
plan Standard, que además saca el techo de 10.000 llamadas diarias que hoy es un
riesgo real si la app crece. **Es una decisión comercial y la toma Jonatan.** Lo
que no conviene es esperar: los términos se reservan explícitamente el derecho a
bloquear sin aviso previo, y si eso pasa se caen a la vez los extremos climáticos
y un respaldo de elevación, en producción.

## Qué sigue

1. **Decidir sobre el Köppen de Beck** — es lo que más mejora el producto de todo
   lo relevado en las dos fases, y mejora el mundo entero.
2. **Decidir sobre Open-Meteo** — no mejora nada, pero es lo único de las dos
   fases que es un riesgo hoy.
3. Sacar las claves de AEMET y Météo-France y **cerrar esas dos fichas**, que
   quedaron a medias a propósito.
4. Si alguna vez interesa Alemania para suelo, escribirle al BGR y pedir los
   términos por escrito.
