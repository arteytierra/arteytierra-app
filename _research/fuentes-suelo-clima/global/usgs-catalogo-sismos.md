# Global — Catálogo de sismos del USGS (ComCat, servicio FDSN event)

**Tipo:** sismos registrados (historia medida; **no** es peligrosidad modelada)
**Estado:** VIVA
**Prioridad sugerida:** media

## Qué mejora sobre la fuente global

No compite con ninguna fuente de la app: es una capa nueva. Y **no reemplaza al
mapa de peligrosidad de GEM**, que quedó descartado por licencia (ver
`global/gem-peligrosidad-sismica.md`). Contesta una pregunta distinta y más
modesta, y conviene escribir las dos para no confundirlas nunca más:

| | Qué contesta | Qué no |
|---|---|---|
| **Peligrosidad (GEM)** | «qué aceleración esperar con 10 % de probabilidad en 50 años» | nada que se pueda consultar con licencia libre |
| **Catálogo (USGS)** | «qué pasó acá, medido, desde que hay instrumentos» | no da período de retorno ni aceleración de diseño |

**La diferencia importa y es la razón de ser de esta ficha:** de un conteo de
sismos **no se puede derivar un PGA de diseño**. Un catálogo con pocos eventos no
dice que el lugar sea seguro —puede ser una falla con recurrencia de siglos— y
eso tiene que quedar escrito en cualquier aviso que acequia imprima. Lo que el
catálogo sí hace, y ninguna otra fuente gratis hace, es poner un hecho fechado
donde hoy no hay nada.

## Cobertura

El planeta, desde el siglo XIX para los eventos grandes y con cobertura
instrumental seria desde los años setenta. La completitud **no es uniforme**: la
magnitud mínima detectada depende de la densidad de estaciones, así que un umbral
de M≥5 es comparable entre regiones y uno de M≥3 no lo es. Cualquier consulta de
acequia tiene que fijar la magnitud mínima y decirla.

## Licencia

Obra del gobierno de Estados Unidos: **dominio público**, sin restricción de uso
comercial y sin copyleft. El USGS pide atribución como cortesía, no como
condición. Términos: `https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits`

Texto de atribución a mostrar: **«Sismos: catálogo ComCat del U.S. Geological
Survey.»**

## Acceso técnico

- **Endpoint:** `GET https://earthquake.usgs.gov/fdsnws/event/1/query`
- **Ejemplo real que funciona** (100 km alrededor de las terrazas de Banaue,
  Ifugao, M≥5 desde 1980, ordenado por magnitud):

```
https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=1980-01-01&latitude=16.93&longitude=121.14&maxradiuskm=100&minmagnitude=5&orderby=magnitude
```

- **La respuesta real** del 21/11/2026: HTTP 200,
  `application/json; charset=utf-8`, 54.059 bytes, **71 eventos**. Los cuatro
  primeros por magnitud:

| Magnitud | Lugar | Fecha |
|---|---|---|
| 7,0 | 11 km NE de Bantay, Filipinas | 25/07/2022 |
| 6,5 | 14 km NNO de Salinas, Filipinas | 16/07/1990 |
| 6,4 | 11 km E de Dolores, Filipinas | 25/10/2022 |
| 6,3 | 7 km NNO de Besao, Filipinas | 25/03/1992 |

  El de 7,0 es el sismo de Abra de julio de 2022, que es justamente el que dejó
  daño documentado en las terrazas. O sea: la consulta devuelve el evento que
  motivó esta ficha, sin que nadie se lo pidiera por nombre.

- Formato: GeoJSON (también CSV, QuakeML, texto).
- **No pide clave ni registro.**
- Límites: el servicio corta las consultas que devolverían más de 20.000
  eventos; para un predio con radio de 100 km y M≥5 eso no se acerca. Conviene
  igual fijar `limit` y un `starttime`.
- Tiempo de respuesta observado: **menos de 3 s** desde Argentina.

## Campos que devuelve

| Campo | Qué es | Unidad |
|---|---|---|
| `properties.mag` | magnitud | la escala va en `magType` (mww, mb, ml…) |
| `properties.time` | fecha y hora del evento | milisegundos epoch UTC |
| `properties.place` | descripción del lugar | texto del USGS, en inglés |
| `geometry.coordinates` | longitud, latitud, **profundidad** | grados y **km** |
| `properties.magType` | de qué escala es esa magnitud | — |
| `properties.url` | la página del evento | — |

Ninguno equivale a algo que la app ya use. La profundidad en km importa para
cualquier lectura: un M6 a 200 km de hondo no hace lo que un M6 a 10 km.

## Qué falta o qué no da

- **No da período de retorno ni aceleración de diseño.** Para eso hace falta un
  modelo de peligrosidad, y el global no se puede usar.
- **No da intensidad en el predio.** El USGS publica ShakeMap y «Did You Feel
  It» para eventos grandes, que sí dan intensidad en grilla, pero por evento y
  no como una capa consultable por punto para cualquier lugar.
- **No da fallas activas.** Para eso existe la base de fallas del GEM, con la
  misma pregunta de licencia abierta.

## Verificación

**21/11/2026**: el ejemplo de arriba respondió 200 con 71 eventos en menos de
tres segundos, con un User-Agent genérico y sin clave.

## Dónde entraría en el modelo (sección extra de esta ficha)

Es la pregunta que abrió el pendiente, así que queda contestada acá y no en el
código:

1. **No entra como modificador de aptitud.** Un sismo no cambia qué se puede
   cultivar; cambia **qué obra aguanta**. Meterlo en el puntaje de uso del suelo
   sería el error de siempre: mover un número que nadie va a poder explicar.
2. **Entra como aviso de obra**, al lado de los dos que ya existen —el de suelo
   expansivo y el de flujo laminar— y en el mismo lugar de la pantalla: antes de
   dibujar. Lo leen la represa, el muro, la terraza y la naciente, que son las
   cuatro cosas que un sismo mueve. El patrón ya está armado en
   `lib/saludCalculo.ts` y `components/AvisoSueloObra.tsx`.
3. **Lo que el aviso puede decir, y nada más:** cuántos sismos de M≥X hubo a
   menos de N km desde tal año, el mayor de ellos con su fecha y su profundidad,
   y la frase que lo acota: **que un catálogo no es un modelo de peligrosidad, y
   que pocos eventos no prueban que el lugar sea tranquilo.** Si hace falta una
   aceleración de diseño, la pone un ingeniero con la norma local.
4. **Cómo se consulta:** un proxy en `app/api/`, como los demás —el navegador no
   pega contra el servicio directamente— con caché por punto redondeado, igual
   que el de ecorregión. Una consulta por predio, no por celda.
5. **Para Europa**, cuando se implemente, el ESHM20 con CC BY 4.0 permite además
   el PGA real; ahí el aviso puede decir las dos cosas y el resto del mundo se
   queda con el catálogo.
