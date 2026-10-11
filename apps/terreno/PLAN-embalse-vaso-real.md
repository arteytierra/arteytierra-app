# Plan — el embalse tiene que salir del muro, no del polígono

Pedido de Jonatan, 01/10/2026:

> «En embalse quiero que te haga seleccionar el lado donde se va a construir el
> muro antes de calcular. Además quiero que revees cómo está calculando en zonas
> con curvas de nivel en forma de cuello de botella que encierran depresiones; a
> veces los muros pueden ser de un metro de alto pero contener mucha agua debido
> a una depresión preexistente y no lo tiene en cuenta.»

La primera parte **ya está hecha** (paso 3 del panel, commit del 01/10/2026).
Este documento es la segunda, que es más de fondo.

> **Lo que cambió el 03/10/2026, en la etapa E del plan de diseño de predio**, y
> que hay que tener en cuenta antes de retomar esto:
>
> - `dimensionarMuro` ya **no** deduce la cota de corona del nivel de agua más la
>   revancha. Ahora apila nivel + carga de la crecida sobre el vertedero +
>   revancha, y además devuelve la cota a la que hay que **construirla** con el
>   sobrealto por asentamiento. Cuando el vaso pase a salir del muro, la cota de
>   derrame tiene que compararse contra `cotaAsentada_m`, no contra el nivel.
> - El ancho de corona, los taludes, la revancha, el asentamiento y la zanja de
>   anclaje salen de `lib/represaDiseno.ts` (AH-590). Los números del punto 2 de
>   este plan no los toca eso: lo que cambia es el muro, no el vaso.
> - El punto 4 del orden de abajo —que `dimensionarMuro` tome `profEnMuro_m` en
>   vez de `profMax_m`— **sigue abierto y sigue siendo correcto**.
> - El punto 5 —engancharse a la curva área-capacidad para la evaporación—
>   **sigue abierto**, pero ahora el factor del espejo ya no es el 1,05 fijo: es
>   `factorEvaporacionEspejo`, que distingue el vaso somero del embalse hondo en
>   clima templado y devuelve doce valores. Lo que falta es el **área**, no el
>   factor: hoy la simulación usa `area_espejo × llenado`, una recta, y con la
>   curva saldría del dato.

> **Pasos 1 y 2 hechos el 03/10/2026.** `lib/vaso.ts` + `components/VasoRealBloque.tsx`,
> con 27 tests en `tests/unit/topografia/vaso.test.ts`. El panel muestra los dos
> cálculos juntos y escribe la diferencia; el principal sigue siendo el del
> polígono hasta validar con predios medidos. Lo que salió distinto de este
> boceto, y por qué:
>
> - **No hay curva discretizada.** El boceto devolvía `VasoPorMuro[]` a un paso
>   de nivel. Como las celdas salen de la cola **ya ordenadas por cota de
>   llegada**, con una suma acumulada de elevaciones cualquier nivel se resuelve
>   exacto con una búsqueda binaria (`nivelVaso`). Es más barato que la curva y
>   no interpola: el slider consulta sin recalcular el terreno.
> - **El tipo de techo lo decide el camino, no la celda.** `cotaDerrame_m` viene
>   siempre acompañado de `tipoTope`: `'derrame'` si el agua trepó una silla de
>   montar y bajó hacia afuera, `'borde_del_dem'` si el pelo de agua llegó al
>   límite de la ventana de relieve subiendo. Distinguirlos comparando sólo la
>   elevación de la celda de fuga contra la cota **está mal** y se cayó en el
>   test del muro corto: hay que buscar la silla remontando el camino.
> - **Apareció `derramePorEstribo`**, que no estaba en el plan y vale la pena: si
>   el agua se va por la punta del muro, eso no se arregla con un vertedero, se
>   arregla alargando el muro. Son dos decisiones de obra distintas y el cálculo
>   las sabe separar.
> - **El punto de derrame ya se marca en el mapa** (`puntoDerrame` en
>   `MapLeaflet`, en rojo para no confundirlo con la salida de la cuenca, que es
>   azul y marca por dónde **entra** el agua). El espejo real celda por celda
>   todavía no se dibuja: eso es del paso 3.
> - **`N8` y `dimsCelda` se exportaron de `cuencaHidro.ts`** en vez de
>   duplicarse. Dos definiciones de «vecino» sobre el mismo DEM se
>   desincronizan.
>
> Y una cosa que encontramos de paso y **no está arreglada**:
> `buscarSitiosRepresa`, el que sugiere emplazamientos, arma el pool con
> adyacencia inversa de flujo sobre el DEM rellenado y celdas bajo el nivel. Eso
> tiene el mismo punto ciego que el cálculo por polígono: **nunca calcula una
> cota de derrame**, así que puede rankear primero un sitio cuyo embalse se
> derramaría por una silla de montar antes de llegar a esa altura. Engancharlo a
> `vasoDesdeMuro` no es directo —recorre hasta 400 candidatos × 3 alturas y un
> Priority-Flood por candidato es demasiado—, pero el sesgo está y conviene al
> menos filtrar los candidatos cuya silla más baja esté por debajo del nivel
> probado.

---

## 1 · Qué hace hoy el cálculo

`calcularEmbalse`, en `lib/cutfill.ts`:

```ts
const es = elevacionesDentro(g, poly);          // celdas DENTRO del polígono
for (const groundE of es) {
  if (groundE < nivel) { volumen += (nivel - groundE) * aCelda; … }
}
```

Es decir: **suma todas las celdas del polígono que estén por debajo del pelo de
agua**. Nada más. No hay hidráulica adentro.

De ahí salen tres fallas distintas, y la de Jonatan es la tercera.

### a) Cuenta agua donde el agua no se queda

Cualquier celda baja que caiga dentro del polígono entra al volumen, aunque esté
del otro lado de una loma, o **aguas abajo del muro**. El polígono es un dibujo
en planta; el agua no sabe de dibujos. Si alguien traza el espejo un poco
generoso —lo normal, porque el borde exacto es lo que uno está tratando de
averiguar— el volumen sale de más y nada avisa.

### b) El rango del nivel de agua miente

```tsx
<input type="range" min={rango.min} max={rango.max} …/>
…
<span>{rango.max.toFixed(0)} m (borde)</span>
```

`rango.max` es **la celda más alta dentro del polígono**, y está rotulada
«borde». En un cuello de botella entre dos laderas, la celda más alta del
polígono es la ladera: 40, 60, 100 m por encima del fondo. El slider deja subir
el pelo de agua hasta ahí y la app informa, impasible, un embalse gigantesco que
en el terreno se iría por la silla de montar más baja mucho antes.

**El límite físico no es la celda más alta: es la cota de derrame**, o sea el
punto más bajo del contorno del vaso que no sea el muro. Ese número hoy no se
calcula en ninguna parte.

### c) El vaso real es más grande que el polígono — el caso de Jonatan

Y al revés. Si el terreno ya tiene una depresión aguas arriba del cuello, un muro
de un metro la cierra y el agua ocupa **toda** la depresión, que puede ser
muchísimo más que lo que uno dibujó alrededor del pin sugerido. La app sólo ve
lo que trazaste, así que el muro más eficiente que existe —el que aprovecha una
hoya que ya estaba— es precisamente el que peor estima.

El síntoma que describe Jonatan es exacto: muro de 1 m, mucha agua, y la app no
lo tiene en cuenta. No es un error de redondeo: es que el modelo pregunta por un
polígono cuando debería preguntar por un muro.

---

## 2 · El cambio: inundar desde el muro

**Lo que el usuario elige es el muro y su cota de coronamiento. El vaso lo
encuentra el terreno.** El polígono deja de definir el volumen y pasa a ser lo
que siempre debió ser: una ayuda visual, y como mucho un límite opcional.

### El método, con nombre

Es el mismo problema que resolver depresiones en un modelo de elevación, con el
muro como única salida cerrada:

- **Priority-Flood.** Barnes, R., Lehman, C., Mulla, D. (2014), «Priority-flood:
  An optimal depression-filling and watershed-labeling algorithm for digital
  elevation models», *Computers & Geosciences* 62: 117–127. Una sola pasada con
  cola de prioridad, O(n log n).
- Antecedente: Planchon, O. & Darboux, F. (2002), «A fast, simple and versatile
  algorithm to fill the depressions of digital elevation models», *Catena* 46:
  159–176.
- Para la curva de áreas y capacidades, que es como se dimensiona una represa en
  la práctica: **USDA NRCS, National Engineering Handbook, Part 650 (Engineering
  Field Handbook), cap. 11 «Ponds and Reservoirs»**. De ahí sale el caso resuelto
  del test.

### Cómo queda

```ts
export interface VasoPorMuro {
  /** Cota del pelo de agua. */
  nivel_m: number;
  volumen_m3: number;
  area_inundada_m2: number;
  prof_max_m: number;
  /** Profundidad del agua CONTRA EL MURO: esto es lo que manda su altura. */
  prof_en_muro_m: number;
  /** Celdas del vaso, para dibujar el espejo real en el mapa. */
  espejo: Array<{ lat: number; lng: number }>;
  /** La silla de montar más baja del contorno que no es el muro. */
  cotaDerrame_m: number;
  /** Dónde se derramaría: se marca en el mapa. */
  puntoDerrame: { lat: number; lng: number } | null;
  /** true si el vaso toca el borde de la grilla: el DEM no alcanza. */
  tocaBorde: boolean;
  advertencias: string[];
}

/** Curva de áreas y capacidades: todo el rango de una sola pasada. */
export function vasoDesdeMuro(
  g: GrillaElevacion,
  muro: { a: LatLng; b: LatLng },
  opciones?: { limite?: Array<LatLng>; pasoNivel_m?: number },
): { curva: VasoPorMuro[]; cotaDerrame_m: number } | null;
```

El algoritmo, en prosa:

1. Rasterizar el eje del muro sobre la grilla y tomar las celdas **de aguas
   arriba** (el lado donde el terreno sube; si las dos bajan, no hay vaso y se
   dice).
2. Sembrar una cola de prioridad con esas celdas, ordenada por elevación
   creciente.
3. Sacar la celda más baja, agregarla al vaso, y empujar sus vecinas (8
   conectividad). La elevación a la que se saca cada celda es **la cota a la que
   el agua la alcanza**.
4. Cuando una celda que sale de la cola está sobre el eje del muro, se la ignora
   (ahí hay obra). Cuando sale una celda del borde de la grilla, se marca
   `tocaBorde`.
5. **La primera celda que permite salir del vaso sin pasar por el muro define la
   cota de derrame.** Ahí se corta la curva: por encima de eso el agua se va por
   otro lado y el embalse no existe.
6. Acumulando área y volumen mientras se recorre, sale la curva
   área-capacidad completa en una sola pasada. El slider de nivel pasa a
   consultar la curva en memoria en vez de recalcular todo en cada movimiento —
   que es, de paso, lo que hace hoy `onNivel`.

### Lo que esto arregla, punto por punto

| Hoy | Después |
|---|---|
| El volumen depende de lo bien que dibujaste | Depende del terreno y de la cota del muro |
| Una depresión aguas arriba se pierde | Entra completa: es el caso que motivó esto |
| El nivel sube hasta la ladera más alta | Sube hasta la cota de derrame, y se dice dónde |
| Celdas aguas abajo del muro cuentan como agua | No se conectan al vaso: no cuentan |
| El alto del muro sale de `prof_max` del vaso | Sale de `prof_en_muro`, que es lo correcto |
| El espejo dibujado es el polígono del usuario | Es el espejo real, celda por celda |

El penúltimo renglón merece su párrafo, porque es un error que ya está en
producción: `dimensionarMuro` recibe `profMax_m: res.prof_max_m`, la
profundidad máxima **en cualquier punto del vaso**. En un cuello de botella con
hoya, el punto más hondo está lejos del muro. El muro no tiene que ser tan alto
como lo más hondo del vaso: tiene que llegar al pelo de agua más la revancha,
y eso es `prof_en_muro + revancha`. Hoy se salva a medias porque `CutFillPanel`
pasa `cotaCorona_m: nivel + revancha` y el perfil manda, pero `altoMax` —que
sale de `profMax_m`— sigue decidiendo el ancho de la zanja de anclaje y el caso
sin perfil. Con `prof_en_muro` el cálculo deja de tener dos versiones de la
altura.

---

## 3 · Tests — con casos resueltos, no inventados

1. **Cono invertido, solución analítica.** Un DEM sintético con forma de cono de
   pendiente `s`: el volumen a profundidad `h` es `π·h³/(3·s²)`. Tolerancia
   explícita por la discretización de la grilla.
2. **Prisma de valle en V con fondo plano**, volumen a mano.
3. **El caso de Jonatan, como test de regresión.** DEM sintético: un canal con
   una depresión preexistente aguas arriba y un cuello de botella angosto. Un
   muro de 1,0 m sobre el cuello. El test comprueba que `vasoDesdeMuro` devuelve
   el volumen de la depresión completa, y —esto es lo que vale— que es
   **sustancialmente mayor** que lo que devuelve `calcularEmbalse` con un
   polígono trazado sólo alrededor del cuello. El test documenta el error que
   vinimos a arreglar, con número.
4. **Cota de derrame.** DEM con dos sillas de montar de cotas distintas: la
   curva tiene que cortar en la más baja, y `puntoDerrame` caer sobre ella.
5. **Aguas abajo no cuenta.** Un DEM con una hondonada del lado seco del muro:
   no puede aparecer en el volumen.
6. **Caso resuelto del NEH Part 650 cap. 11**, para la curva área-capacidad.

---

## 4 · Cómo se muestra

Rige `project_terreno_ux_numeros`, y además:

- **La cota de derrame es un número de primera línea**, al lado del volumen. Es
  la respuesta a «¿hasta dónde puedo llenar esto?», y hoy no está.
- El slider de nivel va de la cota del fondo a la cota de derrame. El extremo
  derecho se rotula **«derrame»**, no «borde».
- El espejo real se dibuja en el mapa con las celdas del vaso. Es la
  verificación visual: si el espejo se escapa por donde no debe, se ve.
- El punto de derrame se marca con un pin propio. Ahí va el vertedero, así que
  no es un detalle del cálculo: es una decisión de obra.
- `tocaBorde` tiene que avisar fuerte. Si el vaso llega al límite de la grilla,
  el volumen informado es un **mínimo**, no una estimación, y hay que ampliar la
  ventana de elevación. Es la regla de `saludCalculo`: degradar avisando.
- Y la advertencia que falta hoy: cuando el usuario dibujó un polígono y el vaso
  real se le sale, decirlo. «El agua llega más allá de lo que dibujaste: el vaso
  real son 2,4 ha contra las 0,8 del polígono.» Ése es exactamente el hallazgo
  que Jonatan quiere que la app encuentre sola.

---

## 5 · Compatibilidad y orden

`calcularEmbalse` **se conserva**, porque hay proyectos guardados con
`RepresaInputs` que incluyen `poligonoId` y `nivel`. El plan es:

1. ~~`vasoDesdeMuro` con sus tests, sin tocar la interfaz.~~ **✅ 03/10/2026**,
   en `lib/vaso.ts` (quedó grande: 500 líneas con el algoritmo documentado).
2. ~~El panel muestra **los dos** resultados un tiempo, con la diferencia
   escrita.~~ **✅ 03/10/2026**, en el bloque «El vaso que encuentra el
   terreno». Acá se para: el paso 3 necesita predios reales validados y eso lo
   hace Jonatan, no el cálculo.
3. Cuando el del muro esté validado, pasa a ser el principal. El del polígono
   queda como «lo que entra en el polígono que dibujaste», que sigue siendo útil
   como control. Entra también acá el **espejo real dibujado celda por celda**,
   que es la verificación visual: si el agua se escapa por donde no debe, se ve.
   Y el slider de nivel pasa a ir del fondo a la cota de derrame, con el extremo
   derecho rotulado «derrame» en vez de «borde».
4. `dimensionarMuro` toma `profEnMuro_m` en vez de `profMax_m`, y el `altoMax`
   deja de tener dos orígenes. **El número ya está calculado** —`nivelVaso`
   devuelve `profEnMuro_m`— y el bloque nuevo lo muestra al lado de la
   profundidad máxima para que la diferencia se vea; falta pasarlo.
5. La simulación anual (`represa.ts`) y el balance de tierra se enganchan a la
   curva área-capacidad: la superficie del espejo deja de ser
   `area_espejo_m2 * llenado` —una aproximación lineal— y pasa a leerse de la
   curva, que es el área real a ese volumen. Con `nivelVaso` eso es una consulta,
   pero hace falta el camino inverso (área al volumen embalsado) y la simulación
   trabaja en volumen, no en cota.

El punto 5 es un arreglo de regalo: hoy `simularRepresaAnual` estima la
evaporación con un espejo proporcional al llenado, y en un vaso con forma de
cuenco eso subestima la evaporación cuando está lleno y la sobreestima cuando
está bajo. Con la curva, sale del dato.
