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

> Vista 3D del relieve de un predio de 417 hectáreas en Cuetiepa, Chiapas, con
> las curvas de nivel dibujadas sobre la imagen satelital. Relieve Copernicus
> GLO-30 a ~30 m; imagen Esri World Imagery.

## Los cuatro actos

| cuadros | segundos | qué pasa |
|---|---|---|
| 0 – 120 | 0,0 – 4,0 | **el relieve aparece.** Arranca casi plano y gris: la exageración del terreno sube de 0,08 a 1,4 mientras el color de la rampa de la app sube de la cota más baja a la más alta |
| 120 – 240 | 4,0 – 8,0 | **el agua encuentra su camino.** Las cadenas de acumulación se encienden por orden de caudal: primero los filos, al final el cauce |
| 240 – 330 | 8,0 – 11,0 | **el zoom.** La cámara baja y se inclina de 12° a 50°; entran la ortofoto y las curvas |
| 330 – 420 | 11,0 – 14,0 | **el predio.** Vista 3D con la foto y las curvas sobre el paisaje. Se queda |

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
estrella, imprime un número plausible y equivocado. Quedó anotado como tarea
aparte.
