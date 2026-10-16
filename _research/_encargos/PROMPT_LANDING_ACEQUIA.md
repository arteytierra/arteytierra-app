# Prompt para el agente de la landing `acequia.app`

*Pegar esto completo en una sesión nueva, en el repositorio
`arteytierra/acequia-landing`. No hace falta nada más.*

---

Trabajás en la vidriera de **acequia**, el sitio `acequia.app`, que vive en este
repositorio. La aplicación está en **otro** repositorio y en otro proyecto de
Vercel: no la tenés a mano y no hace falta. Todo lo que necesitás saber de ella
está en este pedido o te lo da un endpoint público que ya existe.

Se responde y se escribe en **español argentino**, en el código y en los
mensajes de commit.

Son dos fases con una parada en el medio. **No arranques la fase 2 hasta que
Jonatan apruebe la fase 1.**

---

# Fase 1 — Dejar de afirmar cosas que la app ya no hace

## El problema, con nombre y fecha

La tarjeta del plan Semilla dice, en la home y en `/planes`:

> Informe con marca de agua

El **1 de octubre de 2026** la app dejó de permitirle a Semilla descargar el
informe. Hoy `informe.descarga` pide plan Personal. Lo que Semilla conserva es
**publicar el informe por link, con marca de agua, y compartirlo así** — lo que
pasó a Personal es sacarlo de la app en un archivo.

Ese renglón es la tercera vez que esta vidriera afirma algo falso. Antes
anunció USD 12 mientras el cobro salía 15, y «proyectos ilimitados» con un tope
de 10. Las dos primeras se arreglaron publicando el catálogo de planes en un
endpoint. **Esta no la cubría, porque el error no era un número: era una
frase.** Así que ahora el endpoint publica también las frases.

## La fuente única, y qué devuelve

```
GET https://arteytierra.org/api/terreno/estado-pagos
```

Es público, no pide clave, y tiene CORS habilitado para `https://acequia.app`
—verificado—. Sale del mismo paquete de configuración que usa el cobro, así
que lo que dice es lo que está desplegado cobrando.

Devuelve esto (recortado, pero la forma es exacta):

```json
{
  "pagos": true,
  "prueba": true,
  "diasPrueba": 3,
  "arsPorUsd": 1520,
  "topoSemillaHa": 0.5,
  "planes": {
    "semilla":     { "mensual": null, "anual": null, "proyectos": 1,  "cuentas": 1, "checkoutPropio": false },
    "personal":    { "mensual": 7,    "anual": 70,   "proyectos": 2,  "cuentas": 1, "checkoutPropio": true  },
    "profesional": { "mensual": 15,   "anual": 150,  "proyectos": 10, "cuentas": 1, "checkoutPropio": true  },
    "estudio":     { "mensual": 35,   "anual": 350,  "proyectos": 10, "cuentas": 5, "checkoutPropio": false }
  },
  "features": [
    {
      "id": "informe.descarga",
      "desde": "personal",
      "etiqueta": "Descargar el informe en PDF",
      "salvedad": "Semilla no descarga el informe: lo publica por link, con marca de agua, y se comparte así.",
      "tarjeta": true
    }
  ],
  "libre": [
    { "id": "informe_publico", "etiqueta": "Informe publicado por link, con marca de agua",
      "salvedad": "Se ve y se comparte; bajarlo en archivo pide Personal." }
  ]
}
```

Cómo se lee cada parte:

- **`features`** son las 34 funciones con candado. `desde` es el plan **mínimo**
  que la habilita, y un plan superior la habilita también: por eso la tarjeta de
  Profesional puede decir «Todo en Personal». `tarjeta: true` marca las doce que
  van en la tarjeta corta; el resto es material para una tabla comparativa.
- **`libre`** es lo que **no pide ningún plan**. Es de lo que está hecha la
  tarjeta de Semilla, y está publicado justamente porque una vidriera que sólo
  conoce las funciones con candado no tiene con qué armar la oferta gratis:
  termina inventando renglones, que es exactamente lo que pasó.
- **`salvedad`** es la parte que **no se puede omitir** al anunciar la función.
  No es letra chica. Si mostrás la etiqueta sin la salvedad, el renglón está mal
  aunque la función sea correcta. Hay cuatro con salvedad en tarjeta y las
  cuatro cambian lo que el visitante entiende.
- **`checkoutPropio: false`** significa que el alta pasa por una persona. Vale
  para Semilla (se resuelve con el registro) y para Estudio (sus cinco cuentas
  se dan de alta a mano). Un plan con `checkoutPropio: false` **no puede tener
  un botón que lleve al checkout**: ya pasó que el visitante recorría la
  pantalla del plan más caro para recibir un error al final.

## Qué hacer con eso

**No lo leas en vivo desde el navegador del visitante.** Este sitio es estático
y no conviene que las tarjetas de precio dependan de un fetch que puede fallar.
El patrón que quiero:

1. Un script —`scripts/traer-planes.mjs` o como corresponda acá— que consulte el
   endpoint y escriba un **snapshot versionado**, por ejemplo
   `data/planes.json`, con la respuesta tal cual y un `traido_el` con la fecha.
2. Las tarjetas de la home y de `/planes` se **renderizan desde ese snapshot**.
   Ningún precio, ningún tope y ninguna frase escritos a mano en un componente.
   Si hoy existe un `lib/plans.ts` con el catálogo copiado, se borra y lo
   reemplaza el snapshot.
3. Un test en CI que vuelva a consultar el endpoint y **falle si el snapshot
   quedó viejo**. Es el guardián: la copia sigue existiendo, pero ya no puede
   mentir en silencio. Si el endpoint no contesta, el test avisa que no pudo
   verificar y **no** da por bueno el snapshot.
4. Los `Offer` del JSON-LD salen del **mismo** snapshot. Hoy hay tres precios
   escritos ahí y es un tercer lugar donde el número puede quedar viejo.

Y la regla de degradación, que es la de toda la casa: **si el dato no está, no
se inventa.** Si el script no puede traer el catálogo, la build falla con un
mensaje claro. Nunca una tarjeta con un precio de relleno.

## Los renglones que quedan mal hoy

Con el snapshot armado, estos salen solos, pero los enumero para que se puedan
revisar uno por uno:

- **Semilla.** Sacar «Informe con marca de agua». Va, en su lugar, lo que dice
  `libre`: «Informe publicado por link, con marca de agua», y su salvedad.
- **Semilla, topografía.** Hoy dice «Muestras de clima, topografía, cuenca y
  sectores» sin aclarar nada. La muestra de topografía está **acotada a 0,5
  hectáreas**, que es un cuadrado de 70 m de lado. El número está en
  `topoSemillaHa` y la frase en la salvedad de `analisis.topo`. Sin eso, el
  renglón promete la herramienta y entrega media hectárea.
- **Personal.** Falta «Capturar el plano en PNG, con rótulo y leyenda»
  (`export.imagen`), que es de Personal y hoy no se anuncia en ningún lado.
- **Estudio.** Falta «Varias cuentas sobre la misma cartera» (`colaboracion`)
  con su salvedad sobre el alta a mano. El renglón que ya está —«El alta la
  hacemos nosotros»— es correcto y se queda.

## Linkear la guía, que es pública y gratis y no está linkeada

`https://app.acequia.app/guia` es la guía de uso completa: pública, estática, sin
cuenta. Hoy **la landing no la linkea ni una vez** —no hay un solo enlace a
`app.acequia.app` en toda la home— y en cambio la menciona como «el manual de
uso» en texto plano, dos veces.

Hay que linkearla en dos lugares, con el texto que corresponda:

- En la sección **«Metodología visible»** de la home, donde dice que la
  trazabilidad completa está disponible «dentro de la aplicación y en el manual
  de uso». Parte de eso es falso en la dirección contraria: está afuera, es
  gratis y no hay que entrar.
- En **`/primeros-pasos`**, en el bloque «Cómo leer los datos», donde dice
  «Dentro de la aplicación, el manual identifica la fuente activa…».

Y agregala a `libre` en la tarjeta de Semilla: ya viene en el endpoint como
«La guía de uso completa, sin cuenta».

## Lo que NO hay que tocar en esta fase

- **`robots.txt` se queda como está, con `Disallow: /`.** Es decisión de
  Jonatan: el piloto fundador todavía no es abierto. No lo cambies, no lo
  discutas en el código y no agregues un `llms.txt`.
- **Nada de SEO.** Mientras el sitio esté cerrado al rastreo, no toques el
  `sitemap.xml` ni su `lastmod`, ni agregues schema nuevo. Lo que sí importa y
  ya está bien son las etiquetas **Open Graph**, porque los previsualizadores de
  WhatsApp, Slack y Telegram siguen funcionando con el sitio cerrado y la mayor
  parte del tráfico va a llegar por un link compartido. Si tocás metadatos,
  verificá que `og:image`, `og:title` y `og:description` sigan saliendo.
- El aviso del pie —«La información es orientativa y no reemplaza estudios
  profesionales ni relevamientos de campo»— **se queda, textual**.
- Las credenciales de Vercel y de Cloudflare no se tocan.

## Antes de terminar la fase 1

Las notas de este proyecto dicen que **pushear a este repositorio no deploya**:
el deploy de la landing sería un segundo paso manual. Verificá si eso sigue
siendo así antes de darlo por hecho, y **no deployes vos**: dejá el cambio
commiteado y decile a Jonatan qué comando falta. Si hay una rama distinta de
`main` que es la viva, trabajá en esa.

Y mostrale el **antes y el después de las cuatro tarjetas de precio**, renglón
por renglón, antes de pasar a la fase 2.

---

# Fase 2 — La página que explica cómo se calcula

## Por qué

Hoy la web describe un visor de capas genérico: «Patrones históricos
relevantes», «Indicadores disponibles y límites de la información remota». Con
esas palabras acequia es una más.

Lo que la hace distinta es una sola cosa, y es la que no está dicha: **todo lo
que calcula una magnitud física tiene fuente citada, unidades explícitas, rango
de validez declarado y un test contra un caso resuelto de la literatura.** No es
una aspiración: es el contrato que cumple cada motor de cálculo, y la razón por
la que la app te dice «este número sale de un modelo global de 30 m y no de uno
nacional de 1 m» en vez de mostrar las dos cosas iguales.

La sección «Metodología visible» ya gatilla el tema y después dice que el
detalle está *adentro de la aplicación*. O sea: hay que pagar para ver lo que
convencería de pagar. Eso es lo que esta fase arregla.

## Qué construir

Una página pública nueva, **`/metodo`**, linkeada desde la sección «Metodología
visible» de la home y desde `/planes`.

La estructura que quiero: una entrada corta que diga el contrato en cuatro
líneas, y después **tres o cuatro casos concretos**, cada uno con la misma
forma. No una lista de features: casos. Un caso es más convincente que una
promesa porque se puede verificar.

De cada caso, cuatro cositas: **qué se calculaba mal o de más de una manera ·
qué dice la fuente · qué hace la app ahora · qué deja de valer**.

## Los cuatro casos, con los números exactos

**Elegí tres o cuatro de estos cinco. Todos los números de esta sección son los
que van: no agregues ninguno, no redondees ninguno y no inventes ninguno.** No
tenés el código a mano para verificar, así que la regla es simple: si un número
no está escrito acá, no va a la página. Si te falta un dato para que un caso
cierre, preguntá antes de publicarlo.

### 1. El equivalente vaca está definido en energía, no en kilos

Un «equivalente vaca» es la unidad con la que se mide cuánto ganado entra en un
campo. Está definido en **energía: 18,54 Mcal de energía metabolizable por
día**. La app tenía en su lugar un número en kilos de materia seca, que era el
de una pastura de buena calidad aplicado a todo el planeta: en un pastizal
natural el mismo animal necesita más kilos para la misma energía.

La tabla por categoría animal que lo reemplazó sale de AACREA.

*Qué muestra:* que la unidad importa más que el valor, y que una constante
heredada sin fuente es un error aunque el número parezca razonable.

### 2. El mismo predio tenía dos lluvias distintas y nada lo decía

La aridez y la receptividad ganadera salían de un conjunto de datos y el balance
hídrico de otro: **595 mm contra 943 mm para el mismo lugar**. Las dos cifras
eran correctas para su fuente —son productos distintos, con resoluciones
distintas— y la app las mostraba en pantallas distintas sin decir que no eran
comparables.

Hoy cada número dice de qué conjunto de datos sale.

*Qué muestra:* que dos números para la misma cosa es un error de software, no
una ambigüedad del mundo; y que nombrar la fuente no es un trámite.

### 3. El agua del ganado, por temperatura

El consumo de agua de un bovino **se multiplica por 2,4 entre 4 °C y 32 °C**, y
el dato publicado es el consumo **total**, que incluye el agua que el animal
toma del pasto. Y el caudal de pico de una aguada no es el consumo diario
dividido 24: los animales beben en pocas horas.

Tres cosas que, mal leídas, dimensionan un tanque para la mitad del agua.

*Qué muestra:* que el rango de validez de un dato es parte del dato, y que una
división «obvia» puede ser el error.

### 4. La producción de pasto no sale de la lluvia

La app estimaba la producción forrajera con una escalera de cinco escalones por
lluvia anual **que no tenía ninguna fuente**. En octubre de 2026 se montaron las
primeras mediciones publicadas, abriendo cada trabajo y verificando cada cifra
contra su tabla. Lo que mostraron:

| Sitio | Lluvia anual | Medido |
|---|---|---|
| Dakota del Norte y del Sur, pradera de altura | 381–508 mm | 2.643–3.063 kg MS/ha/año |
| Edwards Plateau, Texas | 508–762 mm | 825–2.578 |
| Altiplano de Puno, 3.900 m | 410–1.119 mm | 626–1.958 |
| Agra, oeste de Lesbos | 354–797 mm | 300–5.800 |
| Tundra de Alaska y Yukón | no publicada | 350–960 |

**Con menos lluvia que el altiplano peruano, la pradera de Dakota produce más.**
Una función de una sola variable no puede dar las dos cosas bien, se la calibre
como se la calibre: faltan el frío, el largo de la estación de crecimiento y la
profundidad del suelo.

Y el trabajo de Lesbos midió los mismos potreros en dos años que difieren 2,25
veces en lluvia: **el año seco rindió más en la última época**, 21,6 contra 12,1
kg de materia seca por hectárea y por día, porque el 45 % de la lluvia del año
húmedo cayó fuera de la ventana de crecimiento.

Cada medición está guardada con su método, su rango de validez y su
estacionalidad, y hay tests que las defienden contra la fuente. **La escalera
sigue en su lugar**, con el tamaño de su error escrito arriba, porque cinco
puntos en cuatro biomas no reemplazan una función global y el bioma donde
pastorea la mayoría todavía no tiene ninguna medición.

*Qué muestra:* lo más difícil de mostrar y lo más valioso: que cuando no
alcanza para arreglarlo, se dice que no alcanza en vez de cambiar un número sin
fuente por otro.

### 5. En un pastizal perenne, lo que está parado no es lo que creció este año

Y la distancia entre las dos cosas crece con el frío:

| | Biomasa en pie | Producción del año | Factor |
|---|---|---|---|
| Altiplano de Puno | 1.484–3.972 kg/ha | 626–1.958 | 1,5 a 3 veces |
| Tundra de Alaska | 74.010–75.670 kg/ha | 350–960 | 77 a 211 veces |

Cualquier cifra tomada de una foto de campo —o de un índice satelital de
biomasa— está midiendo el stock y no el flujo, y el error que comete depende del
bioma.

*Qué muestra:* por qué «lo que se ve» y «lo que se puede usar» son dos preguntas
distintas, y por qué conviene que el software sepa en qué bioma está.

## Reescribir las cinco tarjetas de capas

Hoy dicen cosas como «Patrones históricos relevantes para orientar decisiones».
Que digan de dónde sale el dato. Esto está verificado contra el código de la
app el 16/10/2026:

| Capa | De dónde sale |
|---|---|
| **Relieve** | Copernicus GLO-30 global, de 30 m de paso, **y modelos nacionales donde existen**: 3DEP en Estados Unidos, IGN en Francia, MDT del IGN en España, HRDEM en Canadá. La app dice cuál está usando y con qué paso efectivo. |
| **Clima** | NASA POWER y Daymet a 1 km en Norteamérica para la climatología; la serie diaria de reanálisis para los extremos; CHIRPS a unos 5 km para la lluvia mensual; y la clasificación de Köppen de Beck a 1 km, **en tres períodos, para que se vea la deriva**. |
| **Suelo** | SoilGrids v2.0 a 250 m, y SSURGO donde lo hay —el relevamiento de campo de Estados Unidos, con perfiles descriptos horizonte por horizonte—. Para la roca de abajo, Macrostrat. |
| **Cobertura** | ESA WorldCover a 10 m. |
| **Contexto** | RESOLVE Ecoregions 2017 para la ecorregión y el bioma, con **ficha propia por ecorregión**; y OpenStreetMap para lo que rodea al predio, donde **vacío significa «no mapeado» y no «no hay»**, y la app lo dice así. |

Y hay tres cosas que la app tiene y la web no nombra en ningún lado. Nombralas,
sin inventarles alcance:

- **Fichas por ecorregión**, cada una con una fuente del lugar y no de un
  promedio regional.
- **Saberes y prácticas fechadas del territorio**: qué se hizo en ese lugar y
  cuándo, con la licencia del dato verificada. Donde no se puede decir de quién
  es una práctica, se dice qué se hizo y cuándo.
- **Pueblos originarios con el dato local de siete países**, cada uno con su
  propio denominador y sus propias palabras, porque los censos no miden lo
  mismo: en Perú sobre los de 12 años y más, en México el censo básico mide
  lengua y no identidad, en Guatemala el instituto no publica el total.

## Lo que esta página no puede decir

- No prometas **precisión**. El aviso del pie es la posición de la casa y esta
  página tiene que ser coherente con él: lo que hay es una lectura preliminar
  trazable, con las limitaciones a la vista.
- No publiques el **inventario técnico completo** —todas las versiones, todas las
  licencias, todas las resoluciones de todas las capas—. Es decisión tomada:
  tres o cuatro casos concretos alcanzan para convencer a un profesional, y el
  inventario completo vive adentro de la app y en la guía.
- No digas que la app **reemplaza** un relevamiento, un cálculo estructural ni un
  estudio hidrológico. Lo que hace es decirte dónde hay que ir a medir.
- No inventes testimonios, ni cantidad de usuarios, ni casos de clientes.

---

# Cómo se cierra cada fase

1. La compuerta del repositorio en cero: typecheck, lint, tests y build.
2. Un commit por tema, con el mensaje explicando **por qué**, no qué.
3. El cambio commiteado y **no deployado**, con el comando que falta anotado
   para Jonatan.
4. Y en el reporte, tres cosas: qué quedó distinto en las tarjetas renglón por
   renglón, qué quedó linkeado a la guía, y **qué no hiciste y por qué**.

Si algo de este pedido choca con lo que encontrás en el repositorio, decilo
antes de resolverlo por tu cuenta. Es más probable que mi información esté vieja
que que el repositorio esté mal.
