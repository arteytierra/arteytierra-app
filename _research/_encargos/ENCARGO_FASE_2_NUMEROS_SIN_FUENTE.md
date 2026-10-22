# Fase 2 — Los ocho números sin fuente que multiplican

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\numeros\NN.json` — carpeta nueva, el
primer lote es el **01**.*

---

## Qué es esto y por qué importa

La app no se estrella: **imprime un número plausible y equivocado**, y alguien
dimensiona un riego o una represa con eso. Por eso todo lo que calcula una
magnitud física tiene que llevar fuente citada, unidades explícitas, rango de
validez y un test contra un caso resuelto de la literatura.

Hay ocho lugares donde eso **no** se cumple hoy. Están identificados uno por
uno, con el archivo y el número que hay puesto. Esta fase trae la fuente de cada
uno. No hay que programar ni opinar: hay que encontrar la tabla publicada.

**Son ocho lotes, uno por número.** Si un número sale en media respuesta, se
cierra el lote igual y se sigue con el siguiente: es más barato cortar que
reintentar un lote largo.

## Lo que tiene que traer cada entrada, sin excepción

Esto es el contrato y es lo que separa una entrega usable de una inservible.

1. **La tabla o la ecuación, símbolo por símbolo.** Si es una ecuación, cada
   símbolo con su nombre, su unidad y su rango. Si es una tabla, todas las filas
   y todas las columnas, con el encabezado tal como está impreso.
2. **Las unidades, en el nombre del campo.** `kg_ms_ha_anio`, no `produccion`.
   `l_dia_cabeza`, no `agua`. `pct_por_km`, no `perdida`.
3. **El rango de validez**: en qué condiciones lo midió la fuente —clima, suelo,
   especie, escala— y dónde la propia fuente dice que deja de valer.
4. **Qué pasa afuera del rango.** Si la fuente no lo dice, el campo va `null` y
   se dice que no lo dice. Un `null` honesto vale; un número extrapolado no.
5. **Un caso resuelto, con sus números.** Un ejemplo de la propia publicación
   donde se vea entrada → salida, para escribir el test. Si el trabajo no trae
   ejemplo resuelto, traer una fila completa de la tabla, que sirve igual.
6. **Los autores completos y en el orden de la cita.** Quién firma es evidencia:
   una entrega anterior atribuyó un trabajo a tres autores que no eran, y los
   reales incluían a los autores de otra serie ya montada, lo que cambiaba cómo
   se leía una discrepancia del 42 %.
7. **Si la fuente publica una serie o una regresión, la serie va también.** Una
   regresión con n chico no significa lo que su r² dice: un lote anterior trajo
   cuatro ventanas de lluvia con r² de 0,03 a 0,95 y **el 0,95 lo ponía un solo
   año de palanca**. Sin la tabla de datos eso no se puede ver.

Y la regla que no se negocia: **ninguna URL entra sin abrirse.** Si el PDF no
abre, va a `vacias` con el motivo. Ninguna ecuación de memoria. Ningún
«según la bibliografía».

---

## Lote 01 · El triángulo textural USDA, completo

**Dónde está:** `apps/terreno/lib/suelos.ts`, función `clasificarTextura`.

**Qué hay puesto:** una escalera de diez `if` que devuelve diez nombres de
clase: Arcilloso, Arcillo-limoso, Arcillo-arenoso, Franco-arcilloso, Arenoso,
Arenoso-franco, Limoso, Franco-limoso, Franco-arenoso y Franco. El comentario
dice «(simplificada)» y no cita nada.

**El problema:** el triángulo de la USDA tiene **doce** clases. Faltan dos
—franco-arcillo-limoso y franco-arcillo-arenoso— y los límites de las diez que
están fueron escritos de memoria, no copiados. La clase textural es la entrada
de la pedotransferencia que decide el agua útil del suelo, el grupo hidrológico
y, por esa vía, el coeficiente de escorrentía de toda herramienta de captación.

**Qué hace falta:** los **doce** nombres de clase y, para cada uno, **las
desigualdades exactas** sobre los tres porcentajes (arcilla, limo, arena) que lo
delimitan en el triángulo. Tal como las publica la fuente, no reordenadas.

**Rutas nombradas:**
- *Soil Survey Manual*, USDA Handbook No. 18, edición 2017, capítulo 3 — es el
  documento que define el triángulo. Está publicado abierto por el NRCS.
- *Soil Texture Calculator* del NRCS: la página trae las reglas escritas.
- *Keys to Soil Taxonomy*, USDA-NRCS, si el Manual no trae las desigualdades.

**El caso resuelto:** una tabla de al menos **doce tríos** (arcilla, limo,
arena) con la clase que les corresponde, uno por clase, preferiblemente los
ejemplos que la propia fuente usa. Eso es el test.

**Ojo con una cosa:** los tres porcentajes tienen que sumar 100, y la fuente
puede expresar los límites sobre dos de los tres. Decir cuáles dos usa.

---

## Lote 02 · La eficiencia de aplicación de los once sistemas de riego

**Dónde está:** `apps/terreno/lib/riego.ts`, constante `SISTEMAS`.

**Qué hay puesto:** once sistemas con una `eficiencia` cada uno y **ninguna
fuente**: goteo 0,90 · goteo espaciado 0,90 · cinta 0,90 · goteo
subsuperficial 0,95 · manguera exudante 0,88 · microaspersión 0,80 ·
nebulización 0,85 · aspersión 0,75 · cañón 0,65 · pivote central 0,85 ·
surco o manto 0,55.

**El problema:** la cadena es ETc → necesidad neta → **necesidad bruta dividida
por esta eficiencia** → volumen y caudal del sector, y ese caudal alimenta un
nodo de consumo de la red de agua del predio. El número divide, así que un error
del 20 % acá es un error del 20 % en el caudal que después dimensiona cañerías y
reserva. Los Kc de la misma función sí citan FAO-56 tablas 12 y 22; las
eficiencias no citan nada.

**Qué hace falta:** la tabla publicada de **eficiencia de aplicación** por
método de riego, con el rango —mínimo y máximo— y no sólo el valor medio, más la
definición de qué mide esa eficiencia.

**Y una distinción que hay que traer explícita**, porque es donde esto se
arruina: la literatura separa **eficiencia de aplicación** (lo que llega a la
zona de raíces sobre lo que sale del emisor), **eficiencia de conducción** (lo
que llega al sector sobre lo que sale de la fuente) y **eficiencia del
proyecto** o global, que es el producto de las dos. La app divide por **un solo
número**. Hay que decir cuál de las tres es cada valor de la tabla que se trae.

**Rutas nombradas:**
- FAO *Irrigation and Drainage Paper 24*, Doorenbos & Pruitt — las tablas
  clásicas de eficiencia por método.
- FAO *Irrigation and Drainage Paper 56*, Allen, Pereira, Raes & Smith (1998) —
  es el que la app ya cita para los Kc; ver si trae eficiencias en los anexos.
- ASABE EP405.1, *Design and Installation of Microirrigation Systems*.
- Keller, J. y Bliesner, R.D., *Sprinkle and Trickle Irrigation* (1990).
- Burt, C.M. et al., «Irrigation Performance Measures: Efficiency and
  Uniformity», *Journal of Irrigation and Drainage Engineering* 123(6), 1997 —
  es el trabajo que define los términos y advierte contra confundirlos.

**El caso resuelto:** un ejemplo de dimensionamiento donde se vea la necesidad
neta, la eficiencia aplicada y la necesidad bruta resultante, con los tres
números.

---

## Lote 03 · La pérdida por conducción

**Dónde está:** no está en ninguna parte, y eso es el problema. La app lleva el
agua desde la fuente hasta el sector y **no descuenta nada en el camino**.

**El problema:** en un predio con acequia de tierra —que es el caso de diseño
más común en la clientela de esta app— la pérdida por infiltración y evaporación
en el canal puede ser una fracción grande del caudal. No descontarla sobreestima
el agua disponible, que es la dirección cara: alguien planta en base a un agua
que no llega.

**Qué hace falta:** la tabla publicada de **pérdida por conducción**, para al
menos estos casos: canal de tierra sin revestir, canal revestido en hormigón,
canal revestido en membrana, cañería a presión, y acequia tradicional si la
literatura la trata aparte.

La unidad importa y la literatura usa varias: **porcentaje del caudal por
kilómetro**, **litros por segundo por kilómetro**, o **lámina infiltrada por
metro cuadrado de perímetro mojado por día** (m³/m²/día). Traer la que use la
fuente, con su unidad en el nombre del campo, y decir **de qué depende**: la
textura del suelo del canal es la variable que más manda y la fuente debería
tabularla por textura.

**Rutas nombradas:**
- FAO *Irrigation and Drainage Paper 24*, anexos — trae tablas de pérdida por
  conducción por tipo de canal y suelo.
- USBR, *Design of Small Canal Structures* o el *Water Measurement Manual* del
  Bureau of Reclamation.
- ICID, publicaciones sobre eficiencia de conducción en sistemas tradicionales.
- FAO *Irrigation Water Management Training Manual* nº 1 a 4, que son los
  manuales de campo y suelen traer las tablas simples.

**El caso resuelto:** un canal con su longitud, su textura, su caudal de entrada
y su caudal de salida medidos o calculados.

---

## Lote 04 · El agua de bebida de equinos y caprinos

**Dónde está:** `apps/terreno/lib/aguaGanado.ts`, función `aguaAnimal`, la rama
final.

**Qué hay puesto:** para bovinos, ovinos, porcinos y aves el consumo sale de
tabla publicada y **varía con la temperatura** —la app multiplica por 2,4 entre
4 y 32 °C, que es el hallazgo que justifica toda la función—. Para **equinos y
caprinos** no hay fuente en este módulo: se devuelve el valor declarado de la
categoría con `origen: 'declarado'` y `fuente: ''`, que es la regla del silencio
funcionando bien pero dejando el hueco.

Las fuentes que ya están montadas, para que la nueva sea comparable: NASEM
(2016), *Nutrient Requirements of Beef Cattle*, 8.ª ed. rev., con la tabla
reproducida en Meehan, Galbreath, Mostrom & Stokka, «Livestock Water
Requirements», NDSU Extension AS1763; y las guías del NRC que se remontan a
Winchester & Morris (1956), *J. Anim. Sci.* 15(3):722-740.

**Qué hace falta:** consumo de agua de **equinos** y de **caprinos**, por
categoría si la fuente la distingue (adulto en mantenimiento, trabajo, hembra
lactando), y **en función de la temperatura ambiente** si la fuente la tabula.
Si la fuente da un valor único sin temperatura, traerlo así y decir que no la
tabula: un número honesto sin curva es mejor que una curva inventada.

Y una aclaración que la fuente tiene que permitir resolver: **si el consumo
publicado incluye el agua del pasto o es sólo el agua de bebida.** La app ya
tiene esa distinción anotada para los bovinos y cambia el dimensionamiento de la
represa.

**Rutas nombradas:**
- NRC, *Nutrient Requirements of Horses*, 6.ª ed. revisada (2007), National
  Academies Press — hay versión de lectura abierta en `nap.edu`.
- NRC, *Nutrient Requirements of Small Ruminants: Sheep, Goats, Cervids, and New
  World Camelids* (2007), mismo editor y misma vía.
- NDSU AS1763, que ya está citada: ver si sus tablas 4 y 5 incluyen caballos y
  cabras y la app simplemente no las leyó.
- Las fichas de extensión de Langston University (American Institute for Goat
  Research), que es el centro de referencia en caprinos.

---

## Lote 05 · El coeficiente equivalente vaca de los caprinos

**Dónde está:** `apps/terreno/lib/rodeo.ts` y `apps/terreno/lib/categorias.ts`.

**Qué hay puesto:** `caprino: 0,12` equivalentes vaca, y el comentario del
propio archivo lo dice: «igual, **y sigue sin fuente**».

**El contexto, que es la mitad del pedido:** acequia ya corrigió un error grande
acá y conviene no repetirlo. El equivalente vaca **está definido en energía**
—18,54 Mcal de energía metabolizable por día— **y no en kilos de animal**. La
app calculaba la carga instantánea como `peso / 400`, que es el error de tratar
el EV como una relación de pesos, y se corrigió en dos archivos. Entonces el
0,12 del caprino no se repone con una regla de tres de pesos vivos: se repone
con el requerimiento energético publicado de una cabra, dividido por el de la
vaca de referencia.

**Qué hace falta, en orden de preferencia:**

1. **El requerimiento de energía metabolizable de una cabra adulta** en
   mantenimiento, en Mcal EM/día, con el peso vivo al que corresponde. Con eso
   el coeficiente se deriva acá y queda trazable.
2. Si existe, **la tabla de equivalencias ganaderas** que incluya caprinos, de
   un organismo que publique también la definición de su unidad de referencia.
   No sirve una tabla de equivalencias sin la definición: hay tablas que
   equivalen por peso y otras por consumo, y dan números distintos.

**Rutas nombradas:**
- Cocimano, M., Lange, A. y Menvielle, E., *Estudio sobre equivalencias
  ganaderas*, AACREA — es la fuente clásica del equivalente vaca en la
  Argentina y la que define la unidad en consumo.
- INTA: publicaciones de las EEA sobre carga animal y equivalencias, en
  particular las de las regiones con majada y hato caprino (Santiago del Estero,
  Chaco, Neuquén, Mendoza).
- NRC *Nutrient Requirements of Small Ruminants* (2007) para el requerimiento
  energético, que es la ruta 1.
- NRCS, *National Range and Pasture Handbook*, capítulo de *animal unit
  equivalents* — define la AU en 26 lb de materia seca por día, que es otra
  definición; si se trae, **decir que es otra definición** y no mezclarla.

**El caso resuelto:** el requerimiento en Mcal EM/día de la cabra y el de la
vaca de referencia, de la misma fuente o de dos fuentes comparables, para que la
división se pueda verificar.

---

## Lote 06 · El espaciamiento de postes de un alambrado

**Dónde está:** salió de `apps/terreno/lib/pastoreo.ts` y el comentario explica
por qué: «1 poste cada 8 m» no tenía fuente **y se fue porque no hay con qué
reponerlo**. El número se usaba para presupuestar la subdivisión en parcelas, que
es la salida más concreta de toda la herramienta de pastoreo.

**Qué hace falta:** el espaciamiento publicado entre postes, para los dos tipos
que importan y distinguiéndolos, porque difieren mucho:

- **Alambrado eléctrico** de uno a tres hilos, que es el que se usa para
  subdividir en pastoreo rotativo.
- **Alambrado fijo** convencional de cinco a siete hilos, que es el perimetral.

Con eso: el espaciamiento entre **postes** y entre **varillas** o postes
intermedios si la norma los separa, la altura de los hilos, y **de qué depende**
el espaciamiento —el relieve y la tensión del hilo son las dos variables que la
literatura nombra—. Y el espaciamiento de los **postes de esquina y de
tranquera**, que son los que llevan el refuerzo y el costo.

**Rutas nombradas:**
- NRCS *Conservation Practice Standard 382, Fence* — es una norma, con números y
  con criterios, publicada abierta por el USDA.
- NRCS *National Range and Pasture Handbook*, capítulo de instalaciones.
- INTA: las fichas de alambrados eléctricos de las EEA, en especial las de
  pastoreo rotativo de la pampa húmeda.
- Los manuales técnicos de Gallagher o Premier 1 — son comerciales, así que
  valen como respaldo secundario y no como fuente única, y hay que decirlo.

**Si no hay norma y sólo hay recomendación de fabricante, decirlo así.** Es un
resultado: significa que el número se muestra como sugerencia editable y no como
dato, que es lo que la app ya hace con lo que no tiene fuente.

---

## Lote 07 · La demanda de la huerta en milímetros por día

**Dónde está:** la app tiene una demanda de huerta de **2 mm/día** heredada de
una versión vieja, sin fuente y sin la aclaración de a qué clima corresponde.

**El problema:** 2 mm/día son 20 m³ por hectárea por día, y una huerta de
hortalizas en verano en el Cono Sur puede pedir el doble o el triple. Un número
fijo global es la clase de dato que la app ya reemplazó en otros lados por el
cálculo: `riego.ts` hace ETc = ETo · Kc con el Kc de FAO-56 y la ETo del clima
del punto, que es la forma correcta.

**Entonces la pregunta de este lote es doble, y las dos respuestas sirven:**

1. **¿Existe una demanda de huerta publicada en mm/día** como cifra de
   planificación, con el clima al que corresponde? Si existe, traerla con su
   clima, su estación y su rango; si la fuente da un rango por región climática,
   mejor.
2. **¿O la literatura dice que no se usa un número fijo** y hay que calcularlo
   de la ETo? Si es así, traer **la frase de la fuente que lo dice**. Eso
   autoriza a sacar el número de la app y reemplazarlo por el cálculo que ya
   existe, que es el mejor resultado posible de este lote.

**Rutas nombradas:**
- FAO 56, tabla 12 (Kc de hortalizas) y tabla 22 (profundidad radicular) — ya
  están citadas en la app, así que lo que falta es la frase sobre el método.
- FAO, *Crop Water Information* por cultivo (`fao.org/land-water/`).
- Las guías de riego de huerta de INTA Pro-Huerta, si publican lámina diaria.

---

## Lote 08 · La simultaneidad del riego

**Dónde está:** la app suma los picos de riego de todos los sectores **como si
fueran coincidentes**: si hay tres sectores que piden 2 L/s cada uno en su hora
de riego, la red se dimensiona para 6 L/s.

**El problema:** casi nunca se riegan todos los sectores a la vez —se riegan por
turno, que es justamente lo que el calendario de riego de la app calcula—. Sumar
coincidente sobredimensiona la cañería y la bomba, y eso cuesta plata en obra.

**El antecedente que hay que imitar:** para las viviendas, la app ya resolvió el
mismo problema. Usa un **coeficiente de simultaneidad Kv** con piso publicado de
0,25, y tiene anotado que la fórmula se escapa a partir de doce viviendas. O sea:
el patrón es «coeficiente publicado, con su piso y su rango de validez».

**Qué hace falta:** si existe, el **coeficiente de simultaneidad para riego por
sectores** —cómo se combina el caudal de n sectores que no riegan a la vez—, con
su fórmula, su piso y el rango de n en que vale.

Y si **no** existe un coeficiente, la respuesta útil es la otra: **la frase de la
fuente que dice que el caudal de diseño se toma del sector de mayor demanda y no
de la suma**, que es lo que haría un proyectista de riego. Eso también cierra el
pendiente, y por el camino correcto.

**Rutas nombradas:**
- FAO 56 y FAO 24, capítulos de diseño de red.
- ASABE EP405.1 para microriego.
- Keller & Bliesner, *Sprinkle and Trickle Irrigation*, capítulo de diseño
  hidráulico de la red.
- Las normas de instalaciones sanitarias que definen el Kv de viviendas, para
  ver si tratan el riego aparte: UNE 149201 (España), o la norma IRAM
  correspondiente.

---

## La forma del JSON

Un lote por respuesta, **un número por lote**. El bloque es largo porque la
tabla va completa: si no entra, se corta y se sigue en el lote siguiente **sin
repetir nada**, poniendo `"continua": true` en el primero.

```json
{
  "encargo": "numeros",
  "lote": 1,
  "fecha": "2026-10-23",
  "continua": false,
  "entradas": [
    {
      "id": "triangulo_textural_usda",
      "que_numero_repone": "clasificarTextura en suelos.ts — 10 clases simplificadas sin fuente",
      "metodo": "Nombre del método tal como lo llama la fuente",
      "autores": "Apellido, Inicial.; Apellido, Inicial. — completos y en el orden de la cita",
      "publicacion": "Título del trabajo, editorial u organismo, año, edición",
      "que_cuenta": "Qué magnitud exactamente es este número y qué NO es",
      "unidad": "pct_arcilla, pct_limo, pct_arena",
      "tabla": [
        { "clase": "…", "limites": "…", "nota": "…" }
      ],
      "ecuaciones": [
        { "nombre": "…", "formula": "…", "simbolos": [ { "simbolo": "…", "nombre": "…", "unidad": "…", "rango": "…" } ] }
      ],
      "rango_de_validez": "En qué condiciones lo midió o lo define la fuente",
      "fuera_de_rango": "Qué dice la fuente que pasa afuera, o null si no lo dice",
      "caso_resuelto": [
        { "entrada": { "…": 0 }, "salida_publicada": "…", "donde": "Tabla 3, fila 4, página 122" }
      ],
      "serie": null,
      "fuentes": [{ "label": "Título tal como lo muestra la página", "url": "https://…" }],
      "verificacion": "Qué dice esa página, con sus palabras, en la página que se abrió.",
      "nota": "La duda, el límite, la contradicción, o qué quedó sin resolver."
    }
  ],
  "vacias": [
    { "id": "<id>", "motivo": "Qué se buscó, dónde, y por qué no alcanzó." }
  ]
}
```

`serie` lleva la tabla de datos cuando la fuente publica una regresión: los
pares o tríos de valores, año por año o sitio por sitio. Sin eso una regresión
no se puede auditar.

---

## Las reglas, en corto

1. **Ninguna URL entra sin abrirse.** Si el PDF no abre, va a `vacias`.
2. **Ninguna ecuación de memoria.** Símbolo por símbolo, de la página.
3. **Unidades en el nombre del campo.** Siempre.
4. **El rango de validez es obligatorio.** Un método empírico sin rango no se
   puede montar.
5. **`null` donde la fuente no dice.** Nunca el promedio regional sin avisar.
6. **Autores completos y en orden.**
7. **La serie va con la ecuación.**
8. **Un «no hay fuente publicada» verificado es un resultado.** Significa que el
   número sale de la app o se muestra como sugerencia editable, que es una
   decisión que se puede tomar. Un número inventado, no.
9. Un bloque JSON por lote. Sin prosa antes ni después.
