# Animación de la portada de acequia.app — plan y verificación previa

Encargo recibido el **23/10/2026**: reemplazar el adorno CSS `.contour-field` de
la portada por una revelación de ~14 s en cuatro actos sobre un predio real,
hecha con los datos que calcula la app. No es un loop: termina y se queda quieta.

La regla que manda: **o es un predio real leído con los datos de la app, o no se
publica.** Un relieve modelado en una página que promete trazabilidad es la
única mentira que acá hace daño.

> El contrato completo con los criterios de aceptación estaba en
> `C:\Users\Usuario\Documents\ChatGPT\terreno\acequia-landing-piloto\docs\animacion-portada.md`
> y **esa ruta no existe en el disco**: la carpeta `ChatGPT\terreno\` es un repo
> git sin un solo commit y sin árbol de trabajo. El acceso directo en
> «Recientes» apunta ahí, así que el archivo existió. Falta reponerlo.

---

## Lo que se verificó antes de pedir nada (23/10/2026)

La pregunta que había que contestar primero no era de estilo: **¿se puede
generar esto sin entrar a la app?** El encargo da por sentado que hay que pegarle
a `GET /api/dem`, y esa ruta pasa por `requiereTopoDe()`, que sin sesión devuelve
401 y con plan Semilla corta por superficie. De ahí salían dos pedidos a Jonatan
—una cuenta habilitada, o capturas— y los dos sobran.

**No hace falta la ruta HTTP: la ruta es una cáscara.** Todo lo que hace es
parsear el bbox, aplicar el candado de plan, mirar la caché y llamar a
`obtenerGrillaDEM()`, que es una función del repo que lee los COG de Copernicus
por *range request* y no toca ni la base ni la sesión. Llamándola directo se
obtiene **el mismo dato, del mismo código**, sin candado que esquivar: el candado
está para que un usuario Semilla no le pegue al endpoint, no para el que compila
el repo.

Corrido sobre un bbox de las sierras de Córdoba —0,03° × 0,02°, el mismo rincón
que usan los tests de swales— la cadena entera da esto:

| paso | resultado |
|---|---|
| `obtenerGrillaDEM(bbox, 200, 200)` | 200×200, `fuente=glo30`, **cero nodos sin dato**, cotas 530,6 a 641,8 m, 7,1 s |
| atribución | Copernicus GLO-30 · © DLR e.V. 2010-2014 y © Airbus Defence and Space GmbH 2014-2018, bajo COPERNICUS por la UE y la ESA |
| `shaderDesdeGrilla()` | 40.000 celdas, pendiente máxima 62,7 % |
| `colorElevacion()` | rampa de la app: `rgb(59,11,84)` en la cota baja, `rgb(198,34,34)` en la alta |
| `calcularEscorrentias()` | **18 cadenas**, acumulación máxima 5.260, 0,3 s |
| `calcularCurvas()` | 11 curvas cada 10 m (intervalo automático) |

Las cuatro capas que pide la secuencia salen de ahí. **Lo único que falta es de
qué predio.**

Conclusiones que cambian el encargo:

1. **No se necesita cuenta habilitada ni muestra gratis de topografía.** El tope
   por superficie vive en el guard de la ruta y la generación no pasa por la
   ruta. El predio puede tener la superficie que tenga.
2. **No se necesita el navegador ni capturas de `/mapa`.** Era la restricción
   más incómoda del encargo y desaparece: nada de esto se captura de pantalla,
   se genera.
3. **La grilla 10×10 no es un problema**: ese tope es de OpenTopoData por
   request y `obtenerGrillaDEM` no lo tiene —el techo es 90.000 nodos, y 300×300
   entra justo.

## La trampa que sí queda, y es de otra clase

El acto 04 pide **la ortofoto satelital drapeada sobre el terreno**, y eso ya
existe en la app: `components/Vista3D.tsx` es MapLibre GL con las teselas de
**Esri World Imagery** sobre un `raster-dem` de `/api/terrarium` (codificación
terrarium, sin candado porque el bucket de AWS Open Data se lee sin clave),
`pitch` 62 y `bearing` −15.

Eso es bueno para la fidelidad —el acto 04 puede ser literalmente la vista 3D de
la app, no una imitación— y abre la única pregunta de licencia del encargo:
**usar teselas de Esri en una pieza promocional no es lo mismo que mostrarlas
dentro de la aplicación.** El relieve es Copernicus y se cita sin problema; la
imagen es de un tercero. Dos caminos:

- **Recomendado:** las mismas teselas que usa la app, con la atribución quemada
  en el cuadro («Esri World Imagery»), y la confirmación de los términos antes
  de publicar —que no se publica desde acá: la portada la toca otra sesión, en
  otro repositorio.
- **Alternativa libre:** Sentinel-2 (mismo origen que el relieve, ESA). Se
  descarta por resolución: 10 m/píxel sobre un predio de 600 m de ancho son 60
  píxeles, y el acto 04 es el fotograma que más se va a ver.

## Cómo se va a construir

Dos piezas, en este orden:

1. **`packages/placas/scripts/datos-portada.mjs`** — corre una vez, con el bbox
   del predio. Llama a la librería del repo y escribe un JSON con la grilla de
   elevación, los colores por cota, las cadenas de acumulación y las curvas de
   nivel, más la fuente y la atribución. Es el único paso que toca la red.
2. **La composición de Remotion** lee ese JSON y anima los cuatro actos. Los
   actos 01 y 02 son dibujo propio sobre datos (relieve coloreado y cadenas
   encendiéndose); los actos 03 y 04 son MapLibre dentro del Chrome de Remotion,
   con el mismo estilo que `Vista3D`, avanzando la cámara cuadro por cuadro y
   esperando `idle` antes de cada captura — animar en tiempo real dentro de un
   render headless es lo que produce cuadros con teselas a medio cargar.

Movimiento lento y continuo, nada rebota: la marca es un canal de agua.

## Lo que falta para arrancar

| | qué | por qué |
|---|---|---|
| 1 | **Las coordenadas del predio** (perímetro o bbox) | es el único dato que no está en el repo |
| 2 | El documento del contrato, con los criterios de aceptación | la ruta nombrada está vacía |
| 3 | Decisión sobre la imagen satelital del acto 04 | es de un tercero y la pieza es promocional |

Jonatan propuso **cuetiepa**, que está en otra cuenta. No hace falta la cuenta:
hace falta el número. Sirve cualquiera de estas formas: el KML o el GeoJSON del
perímetro, la lista de mojones, o las dos esquinas del rectángulo que lo
envuelve. Si se prefiere que lo saque yo de la base, el conector MCP de Supabase
**no está conectado en esta sesión**.

Y lo que el predio tiene que tener, para que el acto 02 exista: **un valle y un
drenaje legible**. La prueba de humo da la referencia de qué significa eso
medido: 111 m de desnivel en 2 km dieron 18 cadenas de flujo. En un campo plano
no hay nada que encender.
