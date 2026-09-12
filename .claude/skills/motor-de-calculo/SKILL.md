---
name: motor-de-calculo
description: Contrato obligatorio para escribir, revisar o modificar cualquier función de apps/terreno/lib que calcule una magnitud física, biológica, climática o económica — escorrentía, erosión, evapotranspiración, receptividad ganadera, radiación, caudal, carbono, costos. Se activa al tocar un motor de cálculo, al agregar una fuente de datos nueva, al cambiar una constante o un coeficiente, y cuando alguien pregunta si un número que devuelve la app está bien.
---

# Cómo se escribe un cálculo en acequia

acequia no falla estrellándose. Falla imprimiendo un número plausible y
equivocado. Un coeficiente de escorrentía mal puesto no tira una excepción: sale
en el informe, y alguien dimensiona una represa con eso. Un test que sólo
verifica que la función "devuelve un número" no protege de nada.

De eso se trata este contrato. Aplica a todo `apps/terreno/lib/` que produzca
una magnitud del mundo real.

## Las cinco cosas que tiene que tener

**1. La fuente, arriba, con nombre propio.** No "según la bibliografía". El
método, quién lo publicó y de dónde salieron los coeficientes:

```ts
// Escurrimiento por el método del Número de Curva (SCS-CN), USDA NRCS,
// National Engineering Handbook, Part 630, cap. 10 (2004).
// Los CN por combinación cobertura × grupo hidrológico salen de la tabla 9-1.
```

Si el dato viene de un servicio, va la versión y la resolución: no es lo mismo
SoilGrids v2.0 a 250 m que a 1 km, ni CHELSA V2.1 que la V1.

**2. Las unidades, en el nombre o en el tipo.** `lluviaMm`, `caudalLs`,
`superficieHa`. Nunca `lluvia` a secas. El 90% de los errores de este tipo de
software son de unidades, y son invisibles: mm y cm difieren por 10, y 10 sigue
pareciendo un número razonable.

**3. El rango de validez, y qué pasa afuera.** Todo método empírico fue
calibrado en algún lado. El SCS-CN se calibró en cuencas agrícolas chicas de
Estados Unidos; la fórmula de Hargreaves anda mal en climas muy húmedos.
Escribí dónde vale y qué devuelve fuera de rango: `null` es una respuesta
honesta, un número extrapolado no.

**4. Un test con un caso resuelto.** No inventado: tomado de la literatura, de
un manual o de un predio real medido. El test compara contra el valor publicado
con una tolerancia explícita.

```ts
// Ejemplo 10-1 del NEH-630: CN=80, P=5 pulgadas → Q=2,04 pulgadas.
expect(escurrimientoMm(127, 80)).toBeCloseTo(51.8, 1);
```

Un test así vale más que veinte que verifican que no devuelve `NaN`.

**5. Qué se rompe si cambia.** Si el número lo consume el informe, un panel o
otro motor, decilo en el comentario. Cambiar una constante compartida sin saber
quién la lee es cómo se desincronizan los análisis entre sí.

## Antes de escribir: la fuente primero, el código después

El orden importa y es fácil invertirlo. **No escribas el cálculo y después
busques con qué justificarlo.** Buscá el método, leé su rango de aplicación,
fijate la licencia del dato si es un servicio nuevo, y recién ahí codificá.

Para las fuentes de datos externas, la licencia es parte del trabajo, no un
trámite posterior: si no se puede usar comercialmente, el código no se escribe.
Hay relevamientos previos en `_research/fuentes-suelo-clima/`.

## Cuando el dato no está

Es la situación más común y la que peor se resuelve. Un predio puede no tener
DEM nacional, ni suelo a esa resolución, ni serie climática larga.

La regla: **degradar avisando, nunca inventar.** La app ya tiene la maquinaria
para esto —`saludCalculo.ts` y `climaFuentes.ts`/`sueloFuentes.ts`— y la
interfaz muestra de dónde salió cada número. Un análisis que dice "esto sale de
un DEM global de 30 m, no de uno nacional de 1 m" es útil; uno que presenta las
dos cosas igual es una trampa.

Nunca rellenes un hueco con el promedio regional sin decirlo.

## Al revisar un cálculo que ya existe

Preguntas que encuentran errores de verdad:

- ¿Las unidades del input coinciden con las que espera la fórmula? Buscá
  conversiones implícitas.
- ¿Hay una división sin proteger el denominador? Pendiente cero, superficie
  cero, plazo cero.
- ¿El método se está aplicando fuera de su rango y nadie avisa?
- ¿Los coeficientes son los publicados o alguien los "ajustó a ojo" en algún
  momento? Si están ajustados, ¿está escrito por qué?
- ¿El resultado tiene sentido dimensional? Multiplicá las unidades a mano.
- ¿Un `Infinity` o un `null` río arriba llega al informe como un número?

## Cómo se muestra el resultado

Lo decide `project_terreno_ux_numeros`, pero lo esencial: unidades del campo
(hectáreas, milímetros, litros por segundo, no notación científica), el intervalo
de tiempo explícito ("por año", "en la tormenta de diseño de 10 años"), y
redondeo al nivel de precisión que el método realmente tiene. Devolver
`1247,3829 m³` cuando el método tiene un 30% de error es mentirle al usuario con
decimales.
