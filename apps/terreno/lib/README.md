# `apps/terreno/lib/` — motores de análisis y dominio

Toda la lógica de dominio de Terreno (análisis catastral/territorial de `/mapa`):
motores de cálculo puros, clientes de datos abiertos, interoperabilidad GIS y la
capa de planes/auth. Los componentes y hooks orquestan; **el cómputo vive acá**.

Casi todo es TypeScript puro y testeable de forma aislada. Los índices por
dominio de abajo son para ubicar un motor sin abrir 70 archivos.

## ⚠️ Zona sensible — no romper

Estos archivos gobiernan **quién puede hacer qué y quién paga**. Inspeccionar
libremente; tocar sólo con intención explícita y validación:

| Archivo | Rol |
|---|---|
| `entitlements.ts` | Matriz de permisos por plan (Semilla/Personal/Profesional/Estudio); nombres y precios canónicos viven en `@arteytierra/config/acequia`. |
| `auth/apiGuard.ts` | Guard de las rutas API (verifica sesión + plan). |
| `auth/plan.ts`, `auth/session.ts` | Resolución de plan y sesión del usuario. |
| `suscribir.ts` | Inicia el checkout de suscripción (la app terreno **no** tiene credenciales de pago; delega). |
| `telemetria.ts` | Telemetría de candados (best-effort, client-side). |

## Tipos base y proyecto

| Archivo | Qué es |
|---|---|
| `types.ts` | Tipos núcleo (`Mojon`, etc.). |
| `pines.ts` | Tipo `Pin` y helpers de pines. |
| `informe.ts` | Tipos y helpers del informe de análisis. |
| `proyectos.ts` | Acceso al schema `terreno` en Supabase (cast a `any`, sin tipos generados). |
| `profesional.ts` | Perfil del profesional que firma el informe (white-label). |

## Geometría, dibujo y zonificación

| Archivo | Qué es |
|---|---|
| `geometria.ts` | Cálculos geodésicos del polígono con `@turf/turf` (WGS84). |
| `coordenadas.ts` | Conversión decimal ↔ GMS ↔ UTM. |
| `transformaciones.ts` | Transformaciones geométricas tipo CAD sobre elementos. |
| `dibujos.ts` | Elementos de dibujo libre + helpers (distancias, áreas, snap geométrico). |
| `elementos.ts` | Símbolos vista-planta **a escala** que se estampan con un clic. |
| `bloques.ts` | Biblioteca de bloques: símbolos reutilizables. |
| `capasUsuario.ts` | Capas de usuario para los elementos de dibujo libre. |
| `zonificacion.ts` | Zonas dibujadas con área calculada. |
| `sectores.ts` | Análisis de sectores: influencias externas del predio. |

## Elevación · DEM · topografía

| Archivo | Qué es |
|---|---|
| `elevacion/` | **Subsistema DEM multi-fuente** (ver README propio si existe): router + proveedores (GLO-30 global, SRTM, nacionales), grilla, atribución, tipos. |
| `grillaElevacion.ts` | Grilla densa de elevación desde tiles Terrarium (AWS). |
| `shaders.ts` | Shaders topográficos: elevación + pendiente. |
| `curvasNivel.ts` | Curvas de nivel vectoriales (Marching Squares) sobre `GrillaElevacion`. |
| `topografia.ts` | Elevaciones desde OpenTopoData (SRTM 30m). |
| `demImport.ts` | Importar DEM propio (GeoTIFF 1 banda: dron, etc.). |
| `demExport.ts` | Exportar el DEM activo a formatos GIS. |
| `geotiffImport.ts` | Importar GeoTIFF (ortofoto de dron o MDE IGN). |
| `keyline.ts` | Análisis Keyline (P.A. Yeomans) orientativo desde grilla densa. |
| `keylineGeometria.ts` | Los criterios publicados del patrón Keyline: la banda de deriva del surco, el giro del tractor, el headland, la aptitud de la pendiente y la simplificación de la directriz. |
| `modeloDeclarado.ts` | **Cuanto puede valer cada numero**, y que habria que ir a medir para que valga menos. Implementa JCGM 100:2008 (el GUM): de una cota publicada a incertidumbre tipica (a/√3), de un intervalo al 90 % a incertidumbre tipica (÷1,64), la **ley de propagacion** con las derivadas evaluadas numericamente, el aporte de cada entrada a la varianza, la expansion por k y el redondeo —dos cifras en la incertidumbre y el valor al mismo lugar—. Trae la exactitud vertical **publicada** de los modelos de elevacion, separada en absoluta y punto a punto, porque el sesgo se cancela en una resta y no se cancela en una suma: propagar la absoluta en un desnivel lo duplica, e ignorar que la cota del agua es UNA celda deja la incertidumbre del vaso cinco veces corta. Y el **pedido de relevamiento** sale de la cuenta: cada medicion se vuelve a propagar y se informa cuanto baja el intervalo. Donde el proveedor no publica exactitud punto a punto con su base, no declara nada. |
| `validacionPatron.ts` | El patrón de cultivo **verificado** contra el terreno en vez de afirmado. La dirección del agua se resuelve por las **ocho facetas triangulares** de Tarboton (1997), que no redondea a ocho rumbos como la acumulación D8 de la que salía el «hacia qué lado» —sobre un plano devuelve el rumbo exacto, y ahí D8 se equivoca hasta 22,5°—. El informe es **fila por fila** porque el estándar limita cada surco y no un promedio: un surco entero fuera de grado pesa 1/N del patrón. Encuentra lo que el valor absoluto de la deriva no puede ver —un surco que baja hacia un punto de su propio recorrido tiene toda la deriva en banda y no desagua— y declara el límite del dato: con 2 m de resolución vertical, el piso publicado de 0,2 % necesita un kilómetro de surco para distinguirse de cero, y por debajo de eso acequia no imprime el número. |
| `ladoDeObra.ts` | Las dos decisiones de lado de una represa, con sus criterios publicados: de qué lado del espejo va el muro —por la relación de almacenamiento, m³ de agua por m³ de tierra movida— y de qué lado va el vertedero —por la pendiente del terreno natural y el recorrido de vuelta al cauce—. |
| `cutfill.ts` | Cut & fill de represas/embalses: volumen almacenable + movimiento de tierra. `perfilDeEje` muestrea el terreno bajo el eje del muro y **devuelve siempre `n` valores alineados** con el eje: hasta el 07/10/2026 las muestras sin dato se salteaban y el arreglo salia mas corto, mientras que `dimensionarMuro` lo lee como si cubriera el eje entero a paso regular, asi que un hueco del modelo —lo que hay sobre un espejo de agua, o sea arriba de un sitio de represa— corria las muestras de lugar y estiraba el paso de integracion. Los huecos interiores se interpolan, los extremos se extienden, y el resultado informa cuantos rellenó. |
| `vaso.ts` | El vaso del embalse deducido del muro y del terreno (Priority-Flood): volumen, espejo, cota de derrame y por dónde se derrama. |

## Agua e hidrología

| Archivo | Qué es |
|---|---|
| `aguadas.ts` | Diseño de aguadas: escurrimiento + sitios óptimos de cosecha de agua. |
| `swales.ts` | Zanjas de infiltración (swales) a nivel, siguiendo la curva. |
| `cortafuegos.ts` | Cortafuegos sobre líneas de cresta (divisorias). |
| `represa.ts` | Simulación mensual de represa/embalse. |
| `represaDiseno.ts` | Criterios publicados del muro de tierra (corona, taludes, revancha, asentamiento, zanja), la profundidad de agua que pide el clima y la evaporación del espejo. |
| `cuenca.ts` | Cuenca de aporte por clic. |
| `cuencaHidro.ts` | Delineación de cuenca sobre DEM propio de hidrología (el motor grande). |
| `escorrentias.ts` | Escorrentías superficiales por algoritmo D8. |
| `captacion.ts` | Captación pluvial + dimensionamiento de tanque. |
| `reservaPredio.ts` | **¿Alcanza el agua?** Cruza todo lo que el predio guarda y recibe contra todo lo que gasta. Lo importante es lo que evita: **la autonomía NO es volumen sobre consumo**. La evaporación del espejo y la infiltración del vaso son superficie por lámina y no les importa cuánta agua haya debajo, así que en una represa somera de verano pueden superar el consumo de todo el predio —500 m² de espejo a 9 mm/día son 4,5 m³ diarios— y una división da un número grande del lado peligroso. De ahí sale también que el ORDEN DE USO cambie el resultado con la misma agua: el litro que queda en una represa abierta se evapora en parte y el de una cisterna no, así que gastar primero el espejo rinde más días, y el módulo calcula los dos órdenes en vez de suponer uno. El volumen Útil descuenta la lámina permanente de AH-590, el caudal de una naciente **no cuenta en la crisis si no se midió en la seca**, y el período de diseño sale de la racha seca medida de la serie diaria del propio predio —p50, p90 y máximo, tres decisiones distintas— porque no se leyó ninguna norma que publique cuántos días de reserva debe tener un predio. |
| `hidraulica.ts` | Hidráulica de redes de agua por tubería. |
| `artefactos.ts` | Qué agua pide una instalación, con los **dos** niveles de simultaneidad: cuántos artefactos de una vivienda se abren juntos (Hunter, y K = 1/√(n−1) de contraste) y cuántas viviendas iguales de una red tienen el pico a la misma hora (`simultaneidadConjunto`, con su piso publicado de 0,25). |
| `manguera.ts` | Manguera móvil: el coeficiente medido en manguera, no el del caño de catálogo. |
| `ventosas.ts` | Trampas de aire: dónde va una ventosa sobre el perfil de una cañería. |
| `alcantarilla.ts` | Alcantarilla de un cruce de camino: del caudal de la cuenca al diámetro del caño. |
| `riego.ts` | Riego por sector desde la evapotranspiración. |
| `erosion.ts` | Riesgo de erosión hídrica (pendiente + cobertura). |

## Clima · solar · sombras

| Archivo | Qué es |
|---|---|
| `clima.ts` | Clima histórico vía NASA POWER (climatología 1981–2023). |
| `climaExtremos.ts` | Extremos y clima de riesgo sobre la serie diaria. |
| `calendario.ts` | Calendario agroclimático: ventanas de siembra, GDD, balance por cultivo. |
| `solar.ts` | Trayectoria del sol, radiación, horas de luz. La inclinación de panel sale de `alero.ts` desde el 05/10/2026: el `|lat| + 12` que había era una regla sin fuente que optimiza el invierno. |
| `arco_solar.ts` | Trayectoria del sol proyectada sobre el mapa. |
| `insolacion.ts` | Horas de sol acumuladas por punto en un día. |
| `sombras.ts` | Sombras del relieve por fecha/hora. |
| `objetosSombra.ts` | Objetos con altura propia que proyectan sombra. |
| `viewshed.ts` | Visibilidad / viewshed desde un punto de observación. |

## Suelo · cobertura · ecología

| Archivo | Qué es |
|---|---|
| `suelos.ts` | Análisis de suelo vía SoilGrids (ISRIC). |
| `aptitud.ts` | Aptitud de uso del suelo por celda de la grilla. La exposición al sol sale de `emplazamiento.ts` desde el 05/10/2026: antes premiaba la ladera que baja al norte en todo el planeta, que en el hemisferio norte es la sombría. |
| `cobertura.ts` | Cobertura del suelo — ESA WorldCover 10 m. |
| `carbono.ts` | Estimador orientativo de carbono (stock + potencial). |
| `contexto.ts` | Contexto ecológico y cultural del predio. |
| `entorno.ts` | Contexto vivo (datos abiertos: GBIF, OSM/Nominatim, Overpass). |
| `sugerencias.ts` | Sugerencias de ubicación por principios de permacultura. Mismo arreglo de hemisferio que `aptitud.ts`. |

## Producción agropecuaria y diseño del predio

| Archivo | Qué es |
|---|---|
| `planilla.ts` | **La planilla de replanteo**: el papel que va al lado del plano y se llena con un nivel. Replantear es pasar el plano al suelo, y para eso hacen falta cuatro numeros publicados que la app no tenia: la estaca cada 100 pies o menos (30,48 m), la progresiva escrita en estaciones de 100 m —del ejemplo resuelto del EFH: 3+05 mas 94,24 m da 3+99,24—, el mojon de referencia cada 150 m o menos, y la precision de anotacion: 0,1 pie para movimiento de suelo, 0,01 pie para una rasante de estructura. Con eso se puede comparar lo que la norma pide con lo que el dato trae, y el DEM global sale **40 veces mas grueso**, asi que la planilla imprime la geometria y deja la cota para el campo. La columna que se usa es la **altura sobre el mojon**, que es una resta y por lo tanto no arrastra el sesgo del modelo (ver `modeloDeclarado.ts`); de ahi sale la varilla de rasante sin necesidad de ningun datum. El umbral de «quiebre significativo» no esta publicado y se deriva de la precision de anotacion. **Y hay una planilla por obra**, porque lo que cambia entre una y otra es la rasante: `planillaDeMuro` replantea la corona **construida** —con el sobrealto por asentamiento, que es el primer renglon de lo que TR-62 entrega al dueno— y mete el eje del vertedero como renglon propio (CPS 378); `planillaDeSwale` replantea el fondo a nivel, donde el mojon se cancela del todo y la zanja se replantea sin ningun datum; `planillaDeDirectriz` no lleva rasante y no le falta nada, porque el surco sigue el terreno con la deriva del metodo. Trae ademas `corrimientoDeTraza`: el error de un swale **no es vertical**, es horizontal —la curva de nivel esta dibujada en otro lugar— y vale `u / pendiente`, que con el DEM global y una ladera del 5 % son **24 m**. En terreno plano devuelve `null`, porque ahi una curva de nivel no tiene posicion definida. |
| `materiales.ts` | **La lista de materiales**, que no es el presupuesto: CPS 378 la pide como «Quantities – bill of materials» y AH-590 dice que lleva «quantity **and kind**» mas la calidad del material. De ahi las tres columnas que faltaban: la **base de medicion** —AH-590: «define the method of measurement and the unit of payment»—, la **calidad requerida** publicada, y el estado por renglon. Corrige dos numeros: el movimiento de suelo de la represa tomaba su cantidad de la **capacidad embalsada**, que es el agua, y los postes iban «cada 8 m» para todo el planeta cuando la separacion maxima esta publicada por especie y por tipo de cierre (6,10 m en pua para bovinos, 4,57 en caprinos, 30,48 en un electrico liso) y los conjuntos de esquina no existian. Y los tres volumenes de tierra son tres: compactado en obra, banco excavado, y **disponible en el prestamo**, que AH-590 fija en un minimo de 1,5 veces el compactado con su ejemplo resuelto (8.099 → 12.148 yd³). El 1,5 no es un factor de contraccion. |
| `etapas.ts` | **El master plan por etapas**: `masterplan.ts` contesta donde, esto contesta cuando. El orden sale de la escala de permanencia mas las precedencias publicadas, cada una con su fuente —el replanteo antes de la maquina, el destape acopiado y devuelto, la cama de siembra «as soon after construction as practicable»—. Y los meses salen del balance hidrico con **una asimetria que no se ve venir**: la especificacion de terraplen contesta «mojar por aspersion» al suelo seco y «esperar» al mojado, asi que un mes con excedente queda **bloqueado** y un mes por debajo del agua facilmente aprovechable solo **pide agua**. Ademas, tres fuentes distintas dicen que una obra de tierra no termina cuando se termina de mover la tierra, de donde sale la **ventana compuesta**: hace falta un mes bueno para compactar **y** que la cobertura prenda enseguida, que es un subconjunto y a veces esta vacio. |
| `masterplan.ts` | Master Plan: programa declarado del predio → zonas + relaciones + optimización (el motor grande de esta familia). Su tabla de puntaje **no descarta nada**: las prohibiciones viven en `emplazamiento.ts`. |
| `zonificacionGuiada.ts` | Lo que el terreno le dice a las zonas dibujadas. Empieza por corregir un número: `calcularResumenZonificacion` **suma** las áreas, así que dos zonas que se pisan cuentan dos veces y los porcentajes salen de un total que no existe; acá van la **suma**, la **unión** y el **recorte al predio** juntas. Después, las zonas 0 a 5 de la permacultura están definidas por **frecuencia de visita y no por distancia**, así que el número de zona declara un presupuesto de viajes por año: una zona 1 a 150 m camina más que una zona 3 a 500 m, y el factor entre la zona 1 y la 4 a igual distancia va de 61 a 365 veces. Con la función de Tobler, cuyo máximo está en una **bajada del 5 %** y no en el llano, así que **la ida y vuelta no es el doble de la ida**. Y la USLE aplicada a cada zona destapa que **λ es la dimensión de la zona medida pendiente abajo**: la misma hectárea girada 90° cambia su pérdida de suelo por la raíz de la relación de lados. No inventa pendientes máximas por categoría: las que no tienen cifra publicada lo dicen. |
| `emplazamiento.ts` | Dónde **no** puede ir una construcción, y qué cuesta ponerla donde se la quiere poner. Las exclusiones —retiro de curso de agua, cauce, posición cóncava, sin camino posible— son reglas de sí o no y no penalizaciones de puntaje, que es la estructura que a `masterplan.ts` le faltaba. Y para lo que sí es cuestión de grado, da la magnitud física en vez de un puntaje: corte, volumen de tierra, cuánto más grande que el edificio es el movimiento de suelo, largo de camino, y la superficie de terreno que el desagüe de la casa necesita (que en el peor suelo pasa los 800 m² que el master plan reserva para la casa entera). Corre sobre la **grilla densa**: con las celdas de 63 m del shader no se puede aplicar un retiro de 10,7 m. |
| `produccion.ts` | Sistemas productivos agropecuarios. |
| `manejos.ts` | El menú de manejos de pastoreo: parcelas, ocupación, descanso, forma y el fusible del año seco. |
| `pastoreo.ts` | Balance forrajero de un manejo elegido y lo que cuesta armarlo. |
| `electrificador.ts` | El equipo del alambrado eléctrico, la puesta a tierra y la resistencia del alambre. |
| `potreros.ts` | Subdivisión geométrica de potreros. |
| `silvopastura.ts` | Líneas de árboles/forraje leñoso a nivel. |
| `sombraGanado.ts` | Cuánta sombra pide el rodeo (tres tablas publicadas que **no coinciden**, con el óptimo al lado), en qué meses la pide (índice temperatura-humedad con la humedad de la hora de calor, no la media del día), con qué se hace y dónde va. |
| `alero.ts` | El control solar de una abertura: cuánto alero pide **cada rumbo de pared** (el peor pide el doble que el que mira al ecuador), en qué meses hay que dar sombra según la serie del predio y no según el solsticio, qué hace el alero ya construido, y el límite duro del alero fijo —**da la misma sombra en dos fechas espejadas respecto del solsticio, y el clima no es simétrico**—. Reproduce las seis tablas publicadas de UN-Habitat, y de paso corrige la inclinación de panel de `solar.ts`. |
| `bioconstruccion.ts` | Qué técnica de tierra o de paja admite el clima del predio, y con qué condición. **Ninguno de los códigos que regulan estas técnicas condiciona nada a una clase de Köppen**: condicionan a la categoría de diseño sísmico, a la zona climática del IECC, a los ciclos de hielo-deshielo, a la zona inundable y a la exposición a la lluvia batiente. acequia puede calcular tres de las cinco y nombra las otras dos en vez de rellenarlas. De paso queda demostrado con aritmética que la línea de aridez del código y la de Köppen **son la misma con lluvia repartida y se separan exactamente 140 mm cuando es estacional**, con el signo dado por la estación en que llueve. |
| `balanceHidrico.ts` | El balance hídrico del suelo mes a mes —excedente, déficit y evapotranspiración real, que **no** son `lluvia − ETP`—, con las **dos reglas publicadas** de agotamiento del suelo (difieren por un factor 5 en suelo profundo), el período de crecimiento con los dos criterios de FAO, y la variabilidad entre años: **el balance del año promedio no es el promedio de los balances** y esconde el déficit y el excedente a la vez. |
| `cortinas.ts` | Cortinas rompevientos como franja multiestrato. |
| `caminos.ts` | Trazado de caminos con perfil de elevación. |
| `economia.ts` | Presupuesto de obras + análisis económico simple. Las cantidades sugeridas salen de `materiales.ts`: ya no cobra la capacidad embalsada como movimiento de suelo ni pone un poste cada 8 m. |

## Import · export · interoperabilidad

| Archivo | Qué es |
|---|---|
| `importar.ts` | Importar coordenadas desde KML/KMZ/CSV. |
| `exportar.ts` | Exportar a GeoJSON/KML/GPX, y la planilla de replanteo a CSV (`exportarPlanillaCSV`): el armado del texto es puro y vive en `planilla.ts`, aca queda solo la descarga. |
| `dxf.ts` | Interop DXF (AutoCAD): writer + parser propios, sin deps. |
| `capturaMapa.ts` | Compositor de mapa estático para el informe. |
| `wayback.ts` | Imagen histórica — ESRI World Imagery Wayback. |
| `vectores3d.ts` | Vectores para la Vista 3D. |

## Persistencia · estado · infraestructura

| Archivo | Qué es |
|---|---|
| `db/` | Clientes Supabase por contexto: `browser.ts`, `server.ts`, `admin.ts`, `cache.ts`. |
| `autosave.ts` | Autoguardado local (localStorage `terreno_autosave_v1`). |
| `useHistory.ts` | Hook genérico undo/redo (vive en lib, no en `hooks/`). |

## Convenciones

- Preferir **funciones puras**: entrada → salida, sin efectos, fáciles de testear.
- Los clientes de datos abiertos (NASA POWER, SoilGrids, OpenTopoData, GBIF,
  WorldCover, Wayback) son de **solo lectura** y deben degradar con gracia si la
  fuente falla.
- Para el subsistema DEM ver `lib/elevacion/` (router multi-proveedor).
- Antes de tocar la zona sensible (entitlements/auth/pagos), inspeccionar sin
  romper el sistema de planes y validar el cambio explícitamente.
