# La animación de la portada de acequia.app

Reemplaza el adorno CSS `.contour-field` —cuatro divs con `border-radius`
orgánico que simulan curvas de nivel concéntricas de ningún lado— por catorce
segundos sobre **un predio real, leídos con los datos de la app**.

No es un loop. Termina y se queda quieta en el último cuadro.

## El predio

**Cuetiepa, Chiapas (México).** Siete mojones, los que tiene cargados el
proyecto en acequia. Lo eligió Jonatan y sirve por lo que mide:

| | |
|---|---|
| superficie | 417,8 ha |
| cotas | 73 a 442 m s.n.m. |
| desnivel | 369 m |
| pendiente general | 30,4 % |
| escurre hacia | NE, por un valle que se lee de un vistazo |
| bbox usado | −92,20970, 17,31450 → −92,17501, 17,34509 (el predio más 8 % de margen) |

En un campo llano el acto 02 no tendría nada que encender. Acá el D8 encuentra
**123 cadenas de escurrimiento**, y las 19 cotas cada 20 m dibujan el valle.

## Las fuentes, que van en el `alt` y acá

- **Relieve:** Copernicus GLO-30, paso ~30 m. © DLR e.V. 2010-2014 y © Airbus
  Defence and Space GmbH 2014-2018, provisto bajo COPERNICUS por la UE y la ESA.
- **Imagen satelital del acto 04:** Esri World Imagery, las mismas teselas que
  drapea la vista 3D de la app.
- **Relieve del terreno 3D:** teselas Terrarium de AWS Open Data, que es lo que
  proxea `/api/terrarium`.

Texto propuesto para el `alt`:

> Vista 3D del relieve de un predio real de 417 hectáreas, con las curvas de
> nivel dibujadas sobre la imagen satelital. Relieve Copernicus
> GLO-30 a ~30 m; imagen Esri World Imagery.

## Los actos

| cuadros | segundos | qué pasa |
|---|---|---|
| 0 – 110 | 0,0 – 3,7 | **el relieve aparece.** Arranca casi plano y gris: el sombreado sube de 0,06 a 1 mientras el color de la rampa de la app sube de la cota más baja a la más alta |
| 108 – 168 | 3,6 – 5,6 | **las curvas de nivel se dibujan** sobre el relieve |
| 156 – 252 | 5,2 – 8,4 | **el agua encuentra su camino.** Las cadenas de acumulación se encienden por orden de caudal: primero los filos, al final el cauce |
| 252 – 330 | 8,4 – 11,0 | **el zoom.** La cámara baja y se inclina hasta 48°; el shader se retira y entra la ortofoto |
| 330 – 420 | 11,0 – 14,0 | **el predio.** Vista 3D con la foto y las curvas sobre el paisaje. Se queda |

El acto de las curvas lo pidió Jonatan viendo el primer corte —«entre el shader
y las escorrentías pasa mucho tiempo»— y tiene un argumento mejor que el de
rellenar un hueco: **el botón de Topografía de la app dice literalmente
«enciende relieve + curvas»**. Las enciende juntas, así que ése es el orden en
que la aplicación las muestra. Lo que había en el medio eran cuatro segundos en
los que no pasaba nada.

El zoom, la inclinación y el rumbo son **continuos de punta a punta**: los actos
marcan qué aparece, no cortes de cámara. Un corte en catorce segundos se lee
como un error.

## Cómo se hace

```bash
pnpm --filter @arteytierra/terreno datos-portada    # el dato, una vez
pnpm --filter @arteytierra/placas  portada          # el video
pnpm --filter @arteytierra/placas  portada --prueba # el corte en baja
```

**El dato** lo escribe [`apps/terreno/scripts/datos-portada.ts`](../../apps/terreno/scripts/datos-portada.ts)
en `packages/placas/generado/cuetiepa.json` (1,2 MB, gitignorado). Llama a las
funciones del repo —`obtenerGrillaDEM`, `shaderDesdeGrilla`,
`calcularEscorrentias`, `calcularCurvas`, `colorElevacion`— sobre los siete
mojones. No pasa por `GET /api/dem`: esa ruta es una cáscara que aplica
`requiereTopoDe()` —401 sin sesión, y con plan Semilla corta por superficie— y
después llama a la misma función. El candado está para que un usuario Semilla no
le pegue al endpoint, no para el que compila el repo.

**El video** es [`PortadaAcequia.tsx`](../../packages/placas/src/composiciones/PortadaAcequia.tsx),
una composición de Remotion que corre MapLibre con el mismo estilo que
`apps/terreno/components/Vista3D.tsx`. Se usa el motor de la app y no un
rasterizador propio por la regla que manda sobre todas las demás: lo que se
muestra tiene que ser lo que la aplicación hace de verdad, y un terreno
*parecido* en una página que promete trazabilidad es la única mentira que acá
hace daño.

## Las cuatro trampas, por si hay que volver

1. **El `canvas` no puede ir en el estilo inicial de MapLibre.** No es una
   fuente de la especificación de estilos, sólo existe en tiempo de ejecución.
   Puesta ahí, MapLibre rechaza el estilo entero y `load` no llega nunca: un
   cuadro negro sin un solo error en la consola. Va con `addSource` después de
   `load`.
2. **`idle` avisa cuando el mapa PASA a estar quieto.** Si ya estaba quieto
   —que es lo normal cuando el cuadro siguiente mira casi lo mismo que el
   anterior— el evento no llega y el render se cuelga en ese cuadro hasta que
   vence el tiempo. Se pregunta cada 50 ms en vez de escuchar el evento.
3. **El zoom no se mide en el estudio.** La composición se dibuja más chica ahí
   que en el render, así que un número fijo encuadra el predio en una pantalla y
   un cuadrado de tierra en la otra. Se calcula con la cuenta del esquema de
   teselas a partir del ancho y el alto reales del cuadro.
4. **Inclinar desde el cuadro 0 arruina los actos 01 y 02.** Con inclinación, el
   suelo más allá del centro trepa por la pantalla y manda el predio contra el
   borde de arriba, y la mitad de abajo se llena con el suelo de adelante, que
   todavía no tiene imagen y es negro. Hasta el acto 03 la vista es casi
   cenital, que además es como se lee un plano.

## Los criterios de aceptación, uno por uno

Los pasó Jonatan el 24/10/2026. Los de forma y peso los comprueba el propio
script de empaquetado con `ffprobe` sobre el archivo que acaba de escribir, y
falla con código 1 si alguno no entra: un entregable que incumple y nadie mide
es un entregable que incumple en producción.

| | cómo se cumple |
|---|---|
| **A1** predio declarado | El predio de Cuetiepia, con el relieve de Copernicus GLO-30. Va **en este documento, que es interno**, y NO en el `alt`: el 25/10/2026 Jonatan cerró este criterio nombrando el predio y aclarando que el nombre todavía no se publica, porque poner el proyecto de un cliente —y con él la ubicación de su tierra— en una página pública lo autoriza el cliente. Hasta entonces el crédito de la página dice «Predio real» |
| **A2** nada modelado | todo sale de `obtenerGrillaDEM` + las funciones del repo, y la vista 3D es MapLibre con el estilo de `Vista3D.tsx` |
| **A3** acumulación, no fluidos | son 37 polilíneas de `calcularEscorrentias` que suben de opacidad por orden de acumulación. No hay partículas, ni volumen, ni desplazamiento |
| **A4** ningún número | la atribución quemada dice «Relieve Copernicus GLO-30 · imagen Esri World Imagery» y nada más. El `~30 m` que tenía salió por esto: es una escala numérica, y el paso del DEM vive en el `alt` y acá |
| **A5** nada de interfaz inventada | no hay interfaz: ni botones, ni paneles, ni rótulos |
| **A6** relieve continuo | la grilla es de 300 × 277 nodos interpolados de los COG, no el muestreo 10×10 de la pantalla |
| **B1** 12 a 16 s | 14,00 s |
| **B2** orden de los actos | ver la tabla de arriba |
| **B3** fundidos, no cortes | todas las transiciones son interpolaciones de opacidad y de cámara; no hay un solo corte |
| **B4** no hace loop | 420 cuadros y se queda en el último |
| **B5** el último cuadro solo | es el póster, y por eso el póster es el último y no el primero |
| **B6** lento, con inercia, sin rebote | una sola curva en toda la pieza, `bezier(0.33, 0, 0.2, 1)`, que no se pasa nunca de su destino |
| **B7** sin pista de audio | se verifica con `ffprobe`: ningún stream con `codec_type=audio` |
| **C1** webm y mp4 | VP9 de dos pasadas y H.264 `veryslow`, los dos sin audio |
| **C2** ≤ 2,5 MB | se mide y se imprime el kbps al lado del tope |
| **C3** póster ≤ 150 KB | el último cuadro, y la calidad del JPEG **se busca** hasta entrar: fijar una calidad y confiar es lo que hace que un día entre y otro no |
| **C4** el cuadro final suelto | `portada-ultimo.png`, aparte del póster |
| **C5** 1280×720 | la composición se registra en 720p, no se reduce al exportar |
| **C6** legible a 375 px | los anchos de línea salen de esta cuenta: 375/1280 = 0,29, así que el filo más fino del agua va a 3,5 px para sobrevivir con un píxel entero. Con los 1,6 px que tenía, el acto 02 desaparecía en el celular |
| **C7** primer cuadro legible | gris y plano sobre el negro de la marca, nunca negro puro |

### El `alt` del video

> Vista 3D del relieve de un predio real de 417 hectáreas, con las curvas de
> nivel dibujadas sobre la imagen satelital. Relieve Copernicus
> GLO-30 a ~30 m; imagen Esri World Imagery.

## Lo que queda abierto

- **La licencia de la imagen de Esri.** El relieve es Copernicus y se cita sin
  problema. La ortofoto es de un tercero, y usarla dentro de la app no es lo
  mismo que usarla en una pieza promocional. Va con la atribución quemada en el
  cuadro; **confirmar los términos antes de publicar**. La alternativa libre es
  Sentinel-2, del mismo origen que el relieve, y se descarta por resolución: 10
  m/píxel sobre un predio de 3 km de ancho son 300 píxeles, y el acto 04 es
  justo el cuadro que más se va a ver.
- **Dónde va en la landing**, el `<video>`, el `prefers-reduced-motion` y el
  `poster`: eso lo hace una sesión de web, en el otro repositorio. Desde acá
  salen los archivos.

## Un hallazgo que no es de este encargo

Generando el dato apareció que **el panel de Topografía de la app informa 50 m
menos de desnivel que las curvas de nivel que dibuja la propia app en la misma
pantalla**:

| | panel de Topografía | grilla densa GLO-30 |
|---|---|---|
| elevación máx. | 391 m | **442 m** |
| desnivel | 317,1 m | **369 m** |
| pendiente general | 20,2 % | **30,4 %** |

El panel sale de `obtenerTopografia()`, que muestrea **~17 puntos** —una grilla
de 3×3 interiores, los siete mojones, que están sobre el perímetro, y el
centroide— sobre 417 ha. Repetido a 32 m y a 12 m de paso da lo mismo, así que
no es densidad de muestreo mía: el pico de 442 m está adentro del polígono y la
muestra chica lo saltea. Lo confirma la captura del mapa con las curvas
encendidas: las etiquetas llegan a 420 y 440 m adentro del perímetro.

Importa más que un rótulo porque la **pendiente general** sale de ahí, y 20,2 %
contra 30,4 % es la diferencia entre dos decisiones distintas de terrazas,
keyline y caminos. Es el caso que describe el CLAUDE.md del repo: no se
estrella, imprime un número plausible y equivocado.

### Cerrado el 28/10/2026

Dos mitades, porque el panel tiene que seguir contestando antes de que el relieve
denso exista:

1. **Cuando el relieve denso está, manda él.** El panel ya lo disparaba en el
   mismo clic —`onFetchShader()`— pero no podía esperarlo porque la función
   devolvía `void`. Ahora devuelve el resultado, los dos pedidos salen con un
   `Promise.all` y `topografiaConGrillaDensa()` reemplaza mínimo, máximo,
   desnivel, media, pendiente general y escurrimiento con los de **las celdas
   que caen adentro del polígono** —28.157 en este predio—. El perfil por mojón
   no se toca: ésos son puntos medidos en un lugar concreto.
2. **Cuando no está, el panel dice que es una muestra**, con cuántos puntos, y
   que un pico entre dos puntos no aparece. El informe lo imprime igual, porque
   un PDF que dice «Elev. máxima 391 m» sin esa frase es el mismo número
   equivocado con sello.

Y de paso, la muestra chica dejó de ser chica: usaba **9 de los 100 puntos** que
el pedido admite, porque la grilla estaba clavada en 4 divisiones.
`divisionesMuestra()` las calcula contra el presupuesto —10 divisiones con 7
mojones, 81 puntos interiores de los que 54 caen adentro del polígono— y eso no
cuesta un pedido más. Medido sobre este predio: la muestra vieja daba 381 m y
19,5 %, la nueva 425 m y 25,4 %, la grilla densa 442 m y 30,4 %. O sea que
densificar ayuda y no alcanza: lo que cierra el caso es leer el relieve denso.

Tests en `apps/terreno/tests/unit/topografia/topografiaBase.test.ts`, con un
predio sintético cuyo pico cae entre los nodos de la grilla de 4×4.
