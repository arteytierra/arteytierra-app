# Respuestas del encargo de forraje

Lo que vuelve de `ENCARGO_FORRAJE.md`, lote por lote, después de validar la forma
y después de abrir el muestreo. La entrega cruda vive en
`C:\Arte y Tierra\encargos-gpt\entregas\forraje\`, afuera del repositorio.

| Lote | Biomas | Estado |
|---|---|---|
| 01 | `bosque_tropical_humedo`, `bosque_tropical_seco`, `conifera_tropical` | **entregado, no se monta** (10/10/2026) |

---

## Lote 01 — bien hecho y no se puede usar

La entrega pasó la validación de forma sin un aviso y el muestreo
—`bosque_tropical_seco`, elegido por la semilla fija— aguantó: el resumen del
artículo de Yadav & Yadav (2020) dice exactamente 242 g/m²/año de NPP herbácea
media, 257 arriba y 218 al medio de la ladera, con 90 % de la biomasa en partes
aéreas y 10 % en raíces, y efectivamente **no publica la lluvia anual**. La
conversión a 2.420 kg/ha está bien hecha. Dejó `conifera_tropical` vacío con el
motivo escrito, que es la respuesta correcta cuando no hay medición separada del
estrato herbáceo.

**Y aun así no se monta, por una razón que es mía y no de la entrega: pedí la
cantidad equivocada.**

El campo `que_cuenta` —el que el encargo declaraba como «el que más importa»—
dice las tres veces lo mismo: lo que volvió es **producción primaria neta del
estrato herbáceo**, medida bajo dosel cerrado, sin descontar palatabilidad,
accesibilidad ni pisoteo, y en un caso con las raíces adentro. Eso no es oferta
de forraje. Entre la NPP herbácea de un bosque y la materia seca que puede comer
un animal hay un factor que nadie midió en estas fuentes, así que el número no
puede reemplazar a `prodForrajera` ni acompañarlo.

Dicho de otro modo: el campo hizo su trabajo. Avisó que la cifra no es la que
hace falta antes de que entrara al código, que es precisamente para lo que se
escribió.

### Lo que la entrega encontró sin que se lo pidieran

Esto vale más que las dos entradas, y sale de comparar la medición de Nepal con
lo que la app hace hoy en ese mismo lugar.

La fuente es Gautam & Mandal, *Forest Ecosystems* 2016 (`10.1186/s40663-016-0070-y`) — verificada abriendo el artículo, porque al escribir esta nota puse de memoria un apellido equivocado y era justo el error que este repositorio documenta. El rodal de Sunsari recibe **1.998,6 mm/año**. Para esa lluvia:

| | kg MS/ha·año |
|---|---|
| `forrajePorLluvia(1998)` — la escalera, en Pastoreo | **7.000** |
| `forraje_sugerido` con 100 % arbolado — en Cobertura | **800** |
| Medido en Sunsari (NPP herbácea, que es un techo) | 1.300–1.700 |

**Las dos rutas de la app difieren por un factor de 8,8 para el mismo predio**, y
el panel de Cobertura le dice al usuario, textual, «usalo en Pastoreo como
referencia junto al valor por lluvia» — como si fueran dos estimaciones
comparables del mismo número. No lo son: una mira la lluvia y la otra mira la
cobertura, y en un predio forestado dan respuestas incompatibles.

La medición cae cerca de los 800 y no cerca de los 7.000. O sea que la escalera,
aplicada a un predio con dosel, **sobreestima la oferta por un factor de cuatro o
más**, y eso antes de descontar el uso admisible. La escalera se escribió pensando
en pastizal natural —su JSDoc lo dice— pero nada en el código impide aplicarla a
un bosque húmedo tropical, y nadie avisa cuando pasa.

No lo arreglo acá: la corrección necesita los biomas pastoriles, que es donde
está la literatura, y escribir un número nuevo sin eso sería repetir el error que
tiene hoy. Queda anotado en `pastoreo.ts`, al lado de la escalera.

### Qué cambia en el encargo

Dos cosas, las dos por errores de diseño míos:

1. **El orden estaba mal.** Ordené los 14 biomas como los lista RESOLVE, y así el
   primer lote se gastó entero en los tres biomas donde «producción forrajera»
   casi no significa nada y casi no está publicada: bosques cerrados. Los biomas
   donde la escalera hace daño de verdad y donde la bibliografía abunda son la
   sabana tropical, el pastizal templado, el montano y el desierto xerófilo.
   Esos pasan a ser el lote 02.
2. **La pregunta estaba mal planteada para los bosques.** Pedí «el rango
   publicado de producción de materia seca de su vegetación herbácea», y para un
   bosque eso devuelve NPP de sotobosque, que es una medición ecológica legítima
   y un dato forrajero inútil. Lo que hay que pedir primero es **oferta
   aprovechable o receptividad publicada**, y la NPP sólo como referencia
   rotulada.

Los tres biomas forestales vuelven al final, y con otra pregunta: no cuánto
produce el sotobosque, sino **si algún organismo publica carga animal admisible
para sistemas silvopastoriles** de ese bioma. Es la pregunta que un predio
forestado realmente tiene.
