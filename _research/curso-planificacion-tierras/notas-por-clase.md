# Notas del curso "Especialización en Planificación de Tierras"

## Clase 21 — Replanteo a campo, Plan de pastoreo, Evaluación de suelo
- Replanteo: celular (error 5-8 m doble frecuencia; algunos 1-3 m), celular+corrección
  con cinta, RTK (2 m a cm). Apps: MAPinr (satelite Google, desmarcar zoom-al-pin y
  rellenar poligono), Google Earth (iOS, carga complejos), Mapit (RTK EMLID por BT).
- Posicionamiento de la base RTK: average single (2-3 m), GNSS estaciones permanentes,
  GNSS por linea movil, post proceso.
- Entregables de demarcacion: PLANO de demarcacion (puntos numerados, color por tipo),
  BANDERAS en terreno por color, KMZ para celular.
- En proyectos ganaderos el plano de demarcacion == plano completo (cada quiebre de
  camino es un poste). Requiere planificar el recorrido para no olvidar banderas.
- Fraccionamientos: los marca el agrimensor (implicancia legal).
- Plan de pastoreo: la planilla de Manejo Holistico no les sirve tal cual por (1) muchas
  parcelas y (2) info que ya vive en el diseño (tamaño de parcela = comida).
  Usan "PLANO-PLANILLA": hibrido donde se ve y corrige la rotacion mirando el plano.
  Excel con fechas automaticas + intervenciones (sanitarias, destete, entore, pesaje,
  toros IN/OUT, ajuste de carga, reserva).
  Columnas: Parcela / dia de rotacion / fecha / DESCANSO acumulado / comentarios.
  Rotaciones: 1a (10/11-16/01, 67 d), 2a (17/01-26/03, 71 d), 3a (11/04-29/04, 68 d).
- EOV (Savory Institute): linea base -> monitoreo -> analisis -> certificacion.
  Indicadores: MO, infiltracion, estructura/compactacion, inventario de plantas, fauna
  indicadora, balance hidrico, erosion, capacidad de recuperacion, funcionalidad del paisaje.
- Cromatografia de suelos (Jairo Restrepo): cualitativa, integra las 3 Ms (minerales,
  microorganismos, materia organica). Trofobiosis (Chaboussou): proteosintesis vs
  azucares libres; iatrogenia de pesticidas/fertilizantes solubles.
- Preparados: bocashi (estiercol+tierra+fibra en partes iguales; melaza/levadura/afrechillo;
  carbon y polvo de rocas; fermentacion aerobica), MEN, biofertilizante super magro
  (anaerobico con trampa de aire), caldos minerales.

## Clase 20 — Subdivisiones ganaderas  ★ nucleo de Etapa 2
Preguntas de diseño: cuantos modulos; se manejan igual o segun categoria; cuantas
parcelas; maximo descanso necesario; otros descansos; terreno homogeneo o no; cada
cuanto se cambia; tiempo de ocupacion aceptado por epoca; agua en la parcela; acceso;
sombra; tipo de alambrado; cuanto esta dispuesto a trabajar/invertir.

**Tabla de manejos (la clave).** Con N parcelas, el descanso en dias sale de:
  descanso = ocupacion_dias x (N / parcelas_por_cambio - 1)
  - 2 parcelas 1 dia  -> (N/2-1)x1   exig 0,5  comod 1
  - 3 parcelas 2 dias -> (N/3-1)x2   exig 0,6  comod 0,8
  - 1 dia por parcela -> (N-1)x1     exig 1,0  comod 1
  - 3 parcelas 4 dias -> (N/3-1)x4   exig 2,6  comod 0,7
  - 2 parcelas 3 dias -> (N/2-1)x3   exig 1,5  comod 0,8
  - 2 dias por parcela-> (N-1)x2     exig 2,0  comod 1
  - 2 parcelas 5 dias -> (N/2-1)x5   exig 2,5  comod 0,8
  - 3 dias por parcela-> (N-1)x3     exig 2,3  comod 1
  - 2 grupos (rodeo partido) -> (N/2-1)  exig 0,3 comod 0,6
  - 3 grupos -> (N/3-1)              exig 0,2  comod 0,5
  Verificado con N=30/45/60/70/80/100 de las planillas.
- Escenario de descansos por epoca (ejemplo Uruguay): primavera/verano lluvioso 55 d,
  otoño/invierno 70 d, primavera/verano humedo 55, verano/otoño seco 80, invierno 105,
  promedio 73. Estrategia: diseñar con el PROMEDIO y resolver los extremos con reserva.
- Dimensionamiento de parcelas: area a subdividir - 10% (caminos/callejones) / N.
  Formas aceptadas por relacion de lados: cuadrada AxA, rectangular 2Bx3B,
  rect. maxima Cx2C y Cx3C. Ej 650 ha -> 585 ha / 50 = 11,7 ha -> 342x342 / 280x420 /
  242x484 / 197x591 m.
- Avance frontal: parcelas fijas con agua y acceso, o franjas con avance frontal
  (mas tiempo de ocupacion o llevar agua a la franja). Franja dividida en 3/4/5 segun
  la epoca: 20 franjas -> 3 div = 57 d, 4 div = 76 d, 5 div = 95 d de reposo.
- **MODELO DE PASTOREO** (documento declarado del proyecto):
  alimentacion; cambio de parcelas; guiado por (observacion/planificacion); minimo y
  maximo tiempo de reposo; reserva de pasto (10% como fusible); tiempo maximo de
  ocupacion en crecimiento; agua (en parcela o respetando ocupacion); reserva de agua
  (1 semana); sistema de distribucion (gravedad); alambrado fijo/movil; porteras;
  categoria (vacas de cria / recria y reposicion); carga futura en UG/ha.
- **Subdivisiones ponderadas**: parcelas de COMIDA equivalente, no de area equivalente.
  Se mide superficie de pastoreo y superficie real, se califica cada area con un
  "coeficiente de productividad" y se reparten las N parcelas segun ese coeficiente.
- Electrificador dimensionado en joules (15 J, 7 jabalinas) + llaves sectorizadoras y
  llaves guillotina por sector/callejon.
- Potreros especiales: enfermeria, asociado a las mangas.
- Caso real: 5.700 ha, 12 modulos, carga 2,5 UG/ha (subir a 3 no movia la aguja
  economica, se eligio robustez).

## Clase 4 — Masterplan, conceptualizacion y MODELO DE PASTOREO
- El curso sigue la **Plataforma Regrarians**: 1 Clima, 2 Geografia, 3 Agua, 4 Accesos,
  5 Forestal/Ecosistema, 6 Estructuras, 7 Subdivisiones, 8 Suelo, 9 Economia.
  (acequia ya tiene casi todas las capas; el orden del riel coincide.)
- Etapas de un masterplan: A analisis (clima, geografia) / B conceptualizacion /
  C zonificacion ("de borroso a nitido") / D bosquejo, intercambio y chequeo a campo /
  E diseño en detalle / F detalles de instalacion (embalse, tanque, pozo, riego) /
  G listado de materiales por etapa / H presupuestacion (sirve de "contrato") / I informe.
- Implementacion: A demarcacion / B logistica / C explicacion a encargados /
  D direccion de obra + comisionamiento / E manejo.
- **MODELO** = el documento que fija criterios antes de diseñar. Hay modelo de
  PASTOREO, VIVIENDA, AGRICULTURA, FRACCIONAMIENTO, TURISMO (y combinaciones).
  Modelo de pastoreo (ejemplo completo): alimentacion (pasto + sup. mineral +
  sup. proteica segun epoca/categoria); base de pastura (campo natural); pastoreo
  referente (rotativo adaptativo base Manejo Holistico); cambio de parcelas (1 semana
  bajando a diario); guiado por planificacion holistica; min reposo 35 d; max 80 d;
  periodo de alto crecimiento 7 meses (oct-abr); bajo crecimiento 5 meses (may-set);
  agua (bebederos presurizados); plan B agua (embalses, zonas de bebida); alambrado
  (convencional en perimetro, fijo electrico 2 hilos en modulos y caminos, franjas 1
  hilo, movil); porteras; ancho de callejones 12 m; categorias; carga objetivo 2,5 UG/ha;
  reserva del sistema 5% minimo.
- **Reparto de superficie por modulo/categoria** (ejemplo): cria 46% (448 ha efectivas),
  reposicion/recria de vacas 20% (189 ha), recria de terneros 30% (302 ha), toros 4% (38 ha).
  -> "ha efectivas" = area de pastoreo, no area total.
- **Etapas de intensificacion** del sistema de parcelas (muy importante para la app):
  Etapa 1: 10 potreros fijos, cambio c/6 d -> 54 d de descanso; c/9 d -> 81 d.
  Etapa 2: se dividen a la mitad -> 20 parcelas; 3 d -> 57 d; 4 d -> 76 d.
  Etapa 3: alambrado movil dividiendo en 2/3/4 con avance frontal desde el bebedero;
  cambio diario con ocupacion 2, 3 y 4 d -> 39, 59 y 79 d de descanso.
- Modelo de agricultura: criterios geometricos explicitos (orientacion ideal 340°,
  pendiente no mayor a 12% salvo filas hasta 15%; canteros 1 m, eje a eje 3 m, plantas
  1,5 m; invernadero 50x24 m con vertices contiguos a menos de 70 cm de desnivel).
- Criterios de accesos de ese modelo: camino principal 3,5 m + 2 m de cada lado;
  trillo de tractor 3 m; espacio de giro minimo 6 m, con drenaje 7 m.
- Propuesta de trabajo: datos, empresa, motivo, descripcion del terreno, temas guiados
  por la Plataforma Regrarians, descripcion temporal, **ahorros asociados**, exclusiones,
  entregables, cotizacion, tiempo estimado, validez. "El valor por ha no es buena
  referencia" (10 ha puede dar el mismo trabajo que 300).
- Evaluacion de la infraestructura existente: dibujarla toda (ortofoto de drone 6 cm),
  decidir descartar o usar. Lo dificil de adaptar: alambrados, caños, callejones.
- Errores tipicos enumerados (utiles como checklist de advertencias de la app):
  goteros de 4 l/h que no corresponden al caudal del pozo; sin hidroneumatico ni
  respaldo ante cortes de luz; tratamiento de agua demasiado cerca de la casa;
  cuneta que desemboca en la entrada y erosiona el camino publico; canteros paralelos
  al camino que no drenan; huerta sombreada por arboles existentes; invernadero junto
  a la cortina del vecino; gallinero a 22 m de la casa (ruidos y olores) y con poca
  sombra; galpon que corta la vista; alero corto; pocas ventanas al norte.

## Clase 8 — Requerimientos y fuentes de agua  ★ el filon mas grande
### Fuentes y calidad
- Fuentes: manantial (sierra/tierra), lluvia de techos, superficial en movimiento
  (cañada/arroyo/rio), superficial estancada (lago/embalse), subterranea (pozo
  superficial/profundo), residuales, atmosferica, mar.
- **Calidad necesaria POR ACTIVIDAD** (clave de diseño): bebida humana y cocina (la mas
  alta, equilibrio mineral); consumo humano (baño/limpieza, sin contaminantes, mineral
  indiferente); consumo animales (atencion a contaminantes; Na/Mg/Ca altos dan problemas
  serios); riego huerta (biologicos menos importantes, mineral se resuelve del suelo);
  frutales (similar, mas resilientes); pastura (similar a frutales).
  "Si pedimos que una misma fuente resuelva todo, estamos pidiendo que el agua de riego
  de pasturas tenga calidad de consumo humano."
- Normas citadas: NOM-127-SSA1-2021 (Mexico) con tablas de limites fisicos, quimicos y
  metales; norma de Uruguay. Riego: salinidad EC (Follett y Soltanpour 2002; Bauder 2011),
  cloruro (Ludwick 1990), boro; de Zaman/Shahid/Heng cap. 5 Irrigation Water Quality.
### Escala de los usos (familia de 3)
  bebida+cocina 15-25 l/dia · consumo humano 300-1000 l/dia · huerta 300 m2 = 900 l/riego
  · frutales 1000 m2 = 3000 l/riego · animales 100 UG = 3000-7000 l/dia ·
  pasturas 10 ha = 200.000 l/dia de riego.
### Humano
- 50 l/d minimo, EE.UU. 300, UE 100-200; **promedio de trabajo 125 l/persona/dia**;
  austero 100, derrochador 200; si la fuente es lluvia, 80 l/d.
- Cuatro numeros a calcular siempre: consumo anual / diario / en seca / instantaneo (caudal).
- Reserva: 3 dias si la fuente es continua (pozo), ante rotura del sistema de carga.
- **Caudal por artefacto (l/s)**: lavamanos 0,05 · ducha 0,2 · bide 0,1 · inodoro con
  cisterna 0,1 · fregadero domestico 0,2 · lavadora 0,2 · grifo aislado 0,15.
  Simultaneidad de una vivienda: **Kv = 1/raiz(n-1)**; Qmax = Qtotal x Kv.
  Ej: 9 artefactos, Qtotal 1,35 -> Kv 0,35 -> 0,47 l/s (se adopta 0,6).
  Conjunto de N viviendas: **KE = (19+N)/(10(N+1))**; QmaxE = KE x N x Qvivienda.
  Ej 10 cabañas: KE 0,26 -> 1,3 l/s = 6,5 duchas simultaneas.
### Ganado vacuno  ★★
- Tabla **Winchester & Morris (1956)** adaptada de **NASEM (2016)**: consumo de agua por
  categoria y temperatura media. La clave generalizable:
  **litros de agua por kg de materia seca ingerida, segun temperatura media (°C)**:
    4,4->3,1 · 7,2->3,2 · 10,0->3,3 · 12,2->3,6 · 14,4->3,8 · 17,8->4,2 · 21,1->4,5 ·
    23,9->4,8 · 26,6->5,2 · 29,3->6,3 · 32,0->7,3
  Y la misma tabla en **% del peso vivo**: promedio total 7% (4,4 °C) a 11% (23,9 °C);
  maximo total 10% a 15%. Categorias: terneras/novillos en crecimiento 181/272/363/454 kg,
  ganado en acabado 272-544, terneras preñadas en invierno 363-454, vacas preñadas maduras
  454-544, vacas lactantes 3-4 meses 408-499 (las que mas toman: 43-68 l/d), toros 272-817.
- Procedimiento del ejemplo (Paraguay, Paraguari): 420 ha efectivas x 1,8 UG/ha x 400 kg
  (UG de Paraguay) = 302.400 kg PV. Se elige la categoria de mayor consumo.
  Temperatura media anual 22,4 °C -> 11%; media de la seca (4 meses) 26,5 °C -> 12%;
  dia pico (temperatura media del dia mas caluroso, 30,35 °C) -> 15%.
  Consumo anual = kgPV x 364 x 11% = 12,1 ML. En seca = kgPV x 120 x 12% = 4,75 ML.
  Dia pico = kgPV x 15% = 45.360 l.
- **Criterio propio de caudal** (la bebida se concentra en pocas horas) segun la distancia
  maxima al bebedero: 100-250 m -> 6 h · 250-800 m -> 5 h · 800-1600 m -> 4 h.
  Caudal = consumo del dia pico / horas. Ej 45.360/5 = 9.072 l/h = 2,52 l/s.
- **No pasar de 1600 m al agua; ideal menos de 800 m.**
- Piso de inaceptable (bibliografia Uruguay): **7 l/hora por UG de 380 kg**.
  Ej: 302.400/380 x 7 = 5.570 l/h = 1,47 l/s (mucho menor; sirve para medir el desvio).
- Si el caudal no llega en unos pocos bebederos: aceptarlo (un 15% menos = mas paciencia
  del ganado), engrosar la telescopica, o **mover/bajar el bebedero en la topografia**.
- Pedir que la captacion anual del embalse sea **el doble** del consumo, para recambio.
- La no linealidad que justifica afinar: la perdida de carga crece mucho mas que el caudal,
  y el precio del caño por diametro tampoco es lineal (32/40/50/63/75/90/110 mm).
### Riego
- ETc = ET0 x Kc. **Tabla de Kc del Regrarians Handbook p. 176** (hortalizas, legumbres,
  cereales, frutales, pastura): pastos para pastoreo 0,75 · alfalfa 0,88 · trebol 0,93 ·
  vid 0,58 · citricos 0,63 · olivas 0,70 · manzana/cereza/pera 0,83 · tomate 1,00 ·
  lechuga 1,03 · maiz dulce 1,10, etc.
- **Precipitacion efectiva = 70% de la precipitacion mensual** (60% si se es conservador).
- Si solo hay tanque A: **ET0 = evaporacion x Panfactor** (Uruguay sur 0,71-0,72).
- Requerimiento = ETc - Pef por mes, **los negativos se borran (no acumulan)**, se suma
  10% de seguridad (20% en escenario extremo), mm/100 = ML/ha, x superficie = ML/año.
- Ejemplos: vid 7,8 ha en Maldonado -> 53,8 mm/año = 4,2 ML; en la seca 2022-23 (la mayor
  en 70 años) -> 288 mm = 21,1 ML, "valor de techo"; con el tecnico se acepta la mitad
  (10,5 ML) como riego de supervivencia. Trebol 10 ha -> 258 mm = 25,8 ML.
### Asignacion de fuentes
- Cada fuente se asigna a una actividad segun calidad Y cantidad (manantial->bebida,
  pozo->domestico+frutales, embalse->jardin; en campo ganadero cada embalse cubre una
  zona y se interconectan para minimizar el uso de los altos).
- Evaluacion de un embalse existente: consumo anual + 50% minimo / +100% optimo por
  evaporacion y recambio; captacion de la cuenca con **coeficiente conservador del 8%**
  sobre la precipitacion media anual; volumen actual ~ espejo x profundidad maxima x
  **coeficiente de pendiente 0,25**; perdida por evaporacion en seca severa **50-60 cm**.

## Clase 9 — Obras de tierra: embalses y canales  ★★ fuente primaria para el vaso real
**Fuente del curso: K.D. Nelson (1985), "Design and Construction of Small Earth Dams".**
(El curso es un resumen de ese libro con aportes propios. Mas de 40 embalses construidos.)
### Las 6 preguntas antes de diseñar
legal · objetivo (estetico/habitat/bebida/riego) · fuente · cuanta agua necesito ·
con que material lo construyo (cateos) · que pasa si esta lleno y entra mas agua (vertido).
### Vocabulario (lo usa el plano)
presa/dam, embalse/reservoir, pendientes siempre H:V (3:1 = 3 horizontal 1 vertical),
vertedero/spillway, **relacion de almacenamiento** = m3 de agua por m3 de tierra movida,
superficie natural, pozo de prestamo, cresta, nivel de llenado completo (pelo de agua),
terraplen, **libre bordo** (vertical entre pelo de agua y cresta), banqueta, excavacion de
corte (nervio/cutoff), pie de aguas arriba/abajo, pendiente de retorno.
### Escorrentia y evento extremo
- Metodo simple: la escorrentia como **porcentaje de la lluvia anual** (tabla de referencia;
  usan 8% conservador). El USDA diario / HEC-RAS es el camino fino.
- Evento extremo (criterio propio, porque el dato no se consigue): tomar el **dia de
  precipitacion maxima historica** y suponer que **se concentra en 90 min (1,5-2 h)**.
  Ej: 164 mm en 90 min = 109,3 mm/h. Metodo racional: Q = 10.000 x A x C x I
  -> 381.500 l/h/ha = 0,106 m3/s/ha con C=0,35.
  Para canales: **Q(m3/s) = 0,00278 x C x I(mm/h) x Cuenca(ha)**.
- Canal abierto: **Manning Q = (1/n) A R^(2/3) S^(1/2)**, se resuelve **iterando** la seccion.
### Evaporacion
- Se da en ALTURA, no en litros. El libro recomienda **2/3 de la evaporacion anual**;
  calibrado en Uruguay da **70% de la evaporacion en tanque A**.
- Balance de los meses sin lluvia: Precipitacion - 70% de evaporacion tanque A, mes a mes.
- Truco de diseño: buscar el embalse con la capacidad buscada ignorando la evaporacion y
  despues **elevar la cota la altura de la evaporacion proyectada**.
### Tipos de embalse por posicion en el paisaje
ring tanks (anulares, material del centro, agua bajo nivel -> requiere bombeo) ·
turkey's nest (material de afuera, todo elevado -> entrega por gravedad) ·
excavated tanks (zonas con freatica alta, menos evaporacion, arcilla o geomembrana) ·
embalse de silla de montar · **gully dams / presas de drenaje** (las mas comunes y
eficientes) · presas de ladera (eficiencia ~1 o menor; conviene alargado en la direccion
de las curvas de nivel; ventaja: entrega por gravedad).
### Cuenca  ★ criterios propios del curso
1. **Maximo**: cuencas menores a 200 ha, de ser posible menores a 50 ha.
2. **Minimo (reposicion)**: la cuenca debe reponer consumo + evaporacion + infiltracion;
   **minimo 50% mas que consumo+evaporacion, ideal el doble**. Sin recambio las particulas
   disueltas se concentran y baja la calidad.
3. **Llenado**: si el embalse es grande para la cuenca, calcular cuanto tarda en llenarse
   y pedir **30% de recambio anual** -> que no demore mas de 3 años en llenarse.
4. **Colmatacion**: embalse chico en cuenca grande se llena de sedimento.
   Regla: embalses chicos en cuencas chicas, grandes en cuencas grandes.
### Posicion en la forma (eficiencia)
- Buscar donde **las curvas de nivel se mantienen paralelas largo rato o se cierran**;
  si las curvas se abren rapido, poca superficie de embalse.
  Mirar la **relacion entre largo del muro y largo del espejo**.
### Profundidad
- Moverse entre **2,5 m y 5,5 m de profundidad natural**. Menos de 2,5 m: mala calidad y
  mucha evaporacion. Mas de 5,5 m natural termina en 8-9 m de muro -> ingeniero civil.
- Pendiente en ambos lados = mas profundidad con menos largo de muro.
### Tablas de diseño (del libro)
- **Ancho minimo de cresta** por altura H: H<2 -> 2,5 m; 2-3 -> 2,8; 3-4 -> 3,0; 4-5 -> 3,3;
  5-6 -> 3,5; 6-7 -> 3,7; 7-8 -> 3,9; 8-9 -> 4,0; 9-10 -> 4,2.
  Si va camino por encima: ancho del camino + 1 m de cada lado; un trillo 0,5 m.
- **Pendiente del talud** por altura: H<3 interna 2,0:1 externa 2,5:1; 3-6 int 2,5:1 ext 2,5:1;
  6-10 int 3,0:1 ext 2,5:1 (del cuadro: la interna crece con la altura).
- **Libre bordo por largo del espejo L**: L<600 m -> 1,0 m; 600-1000 -> 1,2; 1000-2000 -> 1,3;
  2000-3000 -> 1,5; 3000-4000 -> 1,6; 4000-5000 -> 1,7.
  En embalses chicos usan **0,6-0,7 m**, y 0,8-1 m con mas altura o mas cuenca, aclarando
  al cliente que la bibliografia recomienda 1 m para arriba.
- **Esponjamiento 30%** sobre el volumen de tierra movida.
- Al construir: 15 cm extras en el centro del talud para compensar asentamiento;
  capas de no mas de 30 cm pisadas; nervio de 2,5 m de ancho minimo excavado 0,5-1 m
  hasta material ligante; decapaje reservado para recubrir el talud al final.
### Vertedero
- **De que lado**: (1) el lado con **menor pendiente**, (2) el lado con **menor recorrido
  para volver al cauce**.  <-- la app puede calcular los dos desde el DEM
- Dimension: (1) metodo de Alan Yeomans = **raiz cuadrada de la cuenca** (simple, no
  considera suelo); (2) metodo de alcantarillado por lamina con metodo racional.
  Los dos dan parecido. Arriba de 50-100 ha de cuenca: especialista.
- Falla tipica: vertedero chico -> velocidad y carcavas en el vertido, o el nivel sube y
  vierte por el muro -> rotura del talud. Debe trabajar **en lamina**, no concentrando.
  Vertedero de tierra: toda la primera parte del recorrido a la misma altura.
  De piedra/hormigon si pasan vehiculos (se suma la carpeta a la altura).
### Comparacion de candidatos (la planilla que la app deberia replicar)
Columnas: Cota · Pelo de agua · VTM (m3 tierra movida) · VTM+esponjamiento ·
Largo del talud · Profundidad natural maxima · Volumen de agua natural y total (ML) ·
Espejo (ha) · **Eficiencia VTM/VTA** · Cuenca (ha) · Captacion anual (ML) ·
**CAR = captacion/volumen (relacion)** · Volumen - evaporacion · Valor de la obra (US$) ·
**$/m3 de agua** · Evento extremo (ML/h) · Aporte estetico (puntaje).
Ej: subir la cota de 92,7 a 93,7 pasa de 10,3 a 23,9 ML con 1.990 -> 3.700 m3 de tierra:
el $/m3 de agua baja de 1,51 a 1,21 US$. **La curva cota-volumen-costo es el entregable.**
### Canales de captacion (robadores)
- Para aumentar la cuenca cuando no alcanza; se conecta a la cola del embalse.
- Pendiente **maxima 1 m cada 100 m**, mejor 1/200 o 1/300. Plano y no profundo.
- Ejemplo real: canal de 110 m, desnivel 50 cm, 1,5 m x 0,3 m; subio la cuenca de 25,6 a
  36 ha y la relacion captacion/volumen de 1,5 a 2,1.
### Pruebas de suelo (3 que recomiendan)
impermeabilidad, plasticidad, homogeneidad.
- **Plasticidad** (Llaco 1985): arena no moldea · franco arenoso esfera que se desmorona ·
  limo cilindros cortos · franco trenza de 15 cm que se fractura al doblar · franco
  arcilloso se dobla en U sin romperse · arcilla liviana circulo con grietitas ·
  arcilla circulo sin grietas.
- **Prueba de la botella** (permeabilidad de campo): botella de 750 ml invertida, agujero en
  la tapa, mitad de suelo compactado como quedaria en la pared, agua arriba; si a las
  **24 h no filtro, el suelo es impermeable** y sirve para el talud.
### Metodo de diseño en 6 pasos (el que la app deberia acompañar)
1) elegir punto potencial por eficiencia estimando volumen y cuenca ·
2) elegir una **curva de nivel como pelo de agua** y estimar el agua; sumar la evaporacion ·
3) elegir el lado del vertedero · 4) dibujar el centro de la corona: del lado del vertedero
hasta el pelo de agua y **del lado opuesto hasta la altura del libre bordo** ·
5) dibujar ancho de corona y, con la pendiente, el ancho del talud · 6) diseño final y calculos.

## Clase 11 — Calculos de hidraulica  ★★ motor nuevo entero
- Tres metodos de chequeo: software (EPANET, WaterCAD), formula (Excel), **tabla**.
  "Si colocamos alturas que no son reales por un mal relevamiento (por ejemplo alturas de
  Google Earth), los resultados seran incorrectos." -> el DEM de acequia ES el insumo.
- El caudal por gravedad depende de: altura del tanque, altura de la toma, metros de caño,
  diametro, material. **No depende del recorrido sino de la longitud**; el agua no "agarra
  envion" ni "pierde fuerza por superar alturas" (mientras sean menores que el tanque).
  Dos tramos de distinto diametro dan la misma perdida en cualquier orden, pero conviene
  **de mayor a menor** por las bifurcaciones futuras.
- Presion estatica = solo el desnivel; dinamica = desnivel menos rozamiento.
  **1 bar = 1 kgf/cm2 = 10 mca** (la unidad mas intuitiva es mca).
- Entrega CON presion: casa 2-3 kg · aspersor 3-5 kg · goteo 1,2 kg nominal.
  Entrega SIN presion (bebedero, tanque, vertido): toda la presion se puede gastar.
- **Tabla de perdida de carga en mca cada 100 m** por diametro y caudal. Diametros internos:
  1/2"=12,70 · 20mm=17 · 3/4"=19,00 · 25mm=22 · 1"=25,40 · 32mm=28,4 · 1 1/4"=31,70 ·
  40mm=36 · 1 1/2"=38,10 · 50mm=45,2 · 2"=50,80 · 63mm=57 · 2 1/2"=63,50 · 75mm=67,80.
  **VERIFIQUE: la tabla es Hazen-Williams con C = 130** (no 150): reproduce 1,07 m/100 m
  para 0,5 l/s en 40 mm y 0,41 para 1 l/s en 63 mm. "La tabla tiene un margen para
  confianza"; con formula o software se logran valores mas justos.
- Metodo de trabajo: desnivel disponible / (largo/100) = mca por cada 100 m que puedo
  "gastar"; entro a la tabla por ese valor y leo el diametro (o al reves, leo el caudal).
  "El caudal se paga con presion."
- Se ignoran las perdidas por piezas a campo (la relacion metros de caño/piezas es grande)
  y se compensa siendo generoso; en una casa o con filtro de anillos SI importan.
  No poner una salida de tanque de 1" en una cañeria de 3".
- Ramales simultaneos: el tramo comun lleva **la suma de los caudales**; se resuelve
  primero el bebedero mas exigente (menor desnivel/largo) y despues se reparte.
  Si el caudal no esta limitado (una canilla abierta) y un ramal tiene mas ventaja, hay que
  **reducir el diametro del ramal favorecido para equilibrar la entrega**.
- **La manguera movil: la trampa mas linda del curso.** 800 animales, 7.200 l/h = 2 l/s.
  Con 30 m de manguera de 1" la perdida es ~80 mca/100 m -> **24 mca, un disparate**;
  con 2" es 2,6 mca/100 m -> 0,78 m. "No olvidar pensar que manguera movil se va a usar,
  que diametro, y colocarlo en las cuentas." Ademas el flotador tiene que estar diseñado
  para ese caudal.
- Del plano se obtienen: altura de las tomas por las curvas de nivel y las distancias por
  escala. **Ese es exactamente el dato que acequia ya tiene.**

## Clase 10 — Tanques, cañerias y accesorios
- Cita del **Regrarians Handbook**: la red es como el sistema cardiovascular (reticulacion
  primaria, segundo y tercer orden) y el diseño debe basarse en clima, topografia,
  accesibilidad, consumos (domestico/ganadero/agricola), fuentes, energia, mano de obra y capital.
- Caños: PEAD, PEBD, PVC, PPL, TRL, acero galvanizado. **Comparativa del Regrarians Handbook
  p. 232**: PVC coeficiente C 130-150, PEAD >150, acero 60-100. PVC <10 años en superficie
  (degradacion UV) y >50 enterrado; PEAD >20 en superficie, flexible, bobinas de 20 m+,
  menos juntas, apto para zonas sismicas y asentamiento.
- **Clase o PN**: PN4 = 4 bar = 40 mca. A menor clase, pared mas fina y mas barato.
  Diseñar para la presion de trabajo real (pendiente del terreno + bomba): "ojala la bomba
  no tenga la capacidad de superar la clase del caño". Las piezas en PEAD suelen ser PN16.
  Cuidado con el caño de salida del pozo: suele necesitar PN particular (hubo un colapso).
- Medidas: imperial = diametro **interno** (embutidos, roscas); metrico = **externo**
  (compresion, termofusion, pegamento). La conversion no es lineal; se usa el anterior:
  **50 mm -> 1 1/2" · 63 mm -> 2" · 75 mm -> 2 1/2"**.
- **Valvulas de aire** (el aire acumulado quita seccion de circulacion): simple efecto,
  doble efecto, triple efecto. Se colocan: a la salida de tomas/tanques/presurizaciones;
  **en las trampas de aire (donde la cañeria sube y despues baja)**; y **cada 300-500 m**
  en terreno plano.  <-- acequia puede detectar las trampas de aire sobre el DEM
- Valvula reductora de presion; **valvula de alivio** con dos usos creativos: que una bomba
  solar no corte (devuelve el agua al embalse) y trasvasar agua por la red de distribucion.
- Listado de materiales real, con columnas **Necesario / Repuesto / Pedido**, y setpoints
  (apagar a 3 kg en la boca del pozo, encender a 2 kg; caudal al tanque alto 1.500 l/h).

## Clase 12 — Sistemas presurizados y riego
- Carga y descarga separadas o juntas; por gravedad o presurizado.
- Bombas: sumergibles, externas (**succion maxima 7-8 m**), PIU presurizadoras,
  a combustion, **de ariete** (sin energia externa, requiere caida y caudal sobrante).
  Fallas tipicas por tipo (cavitacion, obstruccion de impelentes, bloqueo por aire...).
- Automatizacion: flotador electronico · hidroneumatico · presurizador electronico ·
  **variador de frecuencia (VFD)**, con tabla comparativa de eficiencia, costo,
  mantenimiento, proteccion contra marcha en seco y espacio.
- **La potencia (HP) no describe una bomba.** Hay bombas de alto caudal, de alta presion y
  equilibradas. El **punto de trabajo** es el cruce de la curva de la bomba con la curva
  del sistema, y **cada punto de entrega es un sistema distinto**.
  El **punto de mejor eficiencia (PME)** cae tipicamente entre el 60 y 70% del caudal maximo
  y conviene trabajar cerca: menos energia, menos desgaste, menos cavitacion, menos ruido.
- **Presion a vencer = perdida de carga + desnivel + presion que requiere el dispositivo.**
  Ejemplo pozo-tanque: 30 m de profundidad + 31 m de desnivel + 1,9 m de perdida = 62,9 m
  para 2.100 l/h -> se busca la bomba por tabla/curva.
- Ejemplo casa+huerta: resolver primero el ramal mas exigente; si no hay bomba que cumpla
  los dos puntos, elegir una y **poner un reductor de presion en el ramal favorecido**
  para que la bomba trabaje en el centro de la curva.
- Tipos de riego: goteo, exudacion, aspersion, nebulizacion, surcos, laminar, inundacion,
  con criterio de cuando usar cada uno segun suelo y pendiente.
- **Presiones y caudales nominales** (tabla util para el motor):
  cinta de goteo 3-12 mca, 0,6-1,6 l/h por emisor · caño con goteros 10-30 mca, 2-8 l/h ·
  caño exudante 3-10 mca, 2-4 l/h por metro · TRL con goteros 10-30 mca, 2-4 l/h ·
  nebulizadores 30-50 mca, 5-20 l/h · micro/mini aspersores 10-25 mca, 30-200 l/h ·
  aspersores de impacto 20-40 mca, 300-3.000 l/h · emergentes 15-30 mca, 100-1.500 l/h ·
  cañones 40-60 mca, 5.000-15.000 l/h.
- Venturi para fertirriego (cuidado con el caudal que necesita para funcionar).

## Clase 7 — Zonificacion y MODULACION GANADERA  ★★ el corazon de la Etapa 2
### Zonificacion
- Asignar zonas a actividades buscando el espacio que las vuelve mas eficientes.
  Tres insumos: la energia humana **desde el centro hacia afuera**, la energia del exterior
  hacia adentro (**sectores**, del analisis de clima) y las caracteristicas del espacio.
- **Lo que debe estar mas cerca es lo que requiere mas observacion, mas trabajo, mas visitas
  y lo que es complejo.** "Guiarnos por la fertilidad del suelo podria ser un problema."
- Zona 0 casa y alrededor (alero segun viento/lluvia/sol, veredas, la casa como cortina y
  abrigo, leña, invernadero adosado, recoleccion de lluvia, aromaticas junto a la cocina).
  Zona 1 observacion continua (huerta intensiva, gallinero "lo suficientemente cerca para
  que sea menor trabajo visitarlo, lo suficientemente lejos para que no moleste olor y
  ruido", invernadero, estanque, tratamiento de aguas). Zona 2 (frutales de autoconsumo,
  huerta extensiva, enfermeria, mangas y corrales, zonas publicas). Zona 3 lo productivo
  central (campo natural, cultivos, frutales a escala). Zona 4 (madera/leña, costas de rios,
  **reservas de pasto**, turismo). Zona 5 no intervencion.
- Al norte especies caducas y al sur perennes (hemisferio sur): parque de verano al sur de
  la casa, de invierno al norte.
- Errores de ubicacion de la casa que achican todo: pegarse al camino vecinal, a un
  alambrado, a una zona de alta pendiente, meterse en un area virgen.
- **El ejercicio de zonificacion, que es una planilla y por lo tanto programable:**
  1) listar los espacios a diseñar · 2) asignar superficie · 3) **visitas semanales** ·
  4) de las visitas y el area sale la zona · 5) pasar en limpio por zona y sumar areas.
  Con una columna de **distancia maxima** (ej. casa 40 m, gallinero 30 m, invernadero 30 m,
  huerta 15 m, forestacion 50 m).
- Puede haber dos o tres zonificaciones simultaneas (casa de caseros, turismo): las zonas
  0-1-2 son individuales y las 3-4-5 compartidas.
- Holmgren: la misma idea a escala de emprendimiento/negocio/bioregion/pais/globalidad;
  **a mayor escala, menor poder de influencia**.
### Ganaderia: el dogma
- "¿Cual es el mejor sistema ganadero? ¿Cual es la mejor marca de autos?" Se toma de cada
  escuela lo que se adapta: Manejo Holistico, Keyline, Pastoreo Racional, PUAD, PRV,
  Pastoreo Voisin, Pastoreo Holistico Planificado.
- Lo mejor de cada mundo y lo que hay que ceder: unir categorias para simplificar; aceptar
  pasarse del **POR (punto optimo de reposo)** para asegurar rebrote y reserva; no buscar
  alta eficiencia de cosecha; no apuntar a carga tan alta para tener carga **estable**.
  **"Lo dificil de la ganaderia es mantenerla simple."**
- Factores que cambian la estrategia: productividad baja -> infraestructura menos intensa;
  campo arrendado -> mas movil; gente que no vive en el campo -> menos trabajo diario;
  innovadores -> PUAD; campo chico con capital -> riego.
### Modulacion: un modulo por grupo animal
- Razones: simplifica el manejo; se desperdicia menos area; cantidad de parcelas justa por
  modulo; **la hidraulica se puede calcular con precision y genera ahorros**; accesos,
  sombra, reserva y plan B de agua asignados; facilita el plan de pastoreo.
- **La menor cantidad posible de modulos** (mas modulos = mas trabajo diario, mas
  infraestructura, mas mantenimiento).
- Se pueden cruzar de modulo, pero **no en el pico de consumo de agua**.
  Ante la duda, diseñar en funcion de la **categoria mas exigente**.
- Si no se diseña todo el campo, **hacer igual la modulacion del todo** y diseñar la parte.
### El calculo de modulacion (programable, verificado contra la planilla)
Variables: superficie **efectiva a pastoreo** (sin piquetes ni enfermeria) · **carga objetivo**
por tipo de area en UG/ha o kgPV/ha · categorias · % a reposicion propia · relacion vaca/toro
· aumento de carga por evolucion · maximo rodeo por categoria.
**Coeficientes UG verificados del ejercicio "cada 100 vacas":**
  vaca = 1,0 · ternera de 1er año = **0,65** · ternera de 2do año = **0,8** · toro = **1,3**
  (100 vacas -> 100 UG 70% · 29,9 terneras 1er año -> 19,4 UG 14% · 26 terneras 2do año ->
  20,8 UG 14% · 2,5 toros -> 3,3 UG 2%; total ~143,5 UG por cada 100 vacas).
  Relacion vaca/toro 40. Cargas objetivo distintas por area: cria 1,9 · terneras 2,8 ·
  toros 0,9 UG/ha. Maximos de rodeo: cria 900 · reposicion 1200 · toros 70 animales.
  La superficie de cada modulo se **pondera** por su carga objetivo (comida equivalente).
- **"¡Cuidado, las UG no son iguales en todos los paises!"** (UG Uruguay 380 kg,
  Paraguay 400 kg) -> encaja exactamente con la auditoria del equivalente vaca.
- En cria hay que considerar el **techo de la fluctuacion anual** (vaca con ternero) para la
  hidraulica.
- Estrategia de criterios: **holgados en la carga objetivo y estrictos en todo lo demas**
  (si se es conservador en todo, el sistema sale carisimo; si estricto en todo, queda corto).
- Carga objetivo: referencia de la zona + mejora esperada por manejo (ej. 0,9 UG/ha de la
  zona + 75% de mejora + fluctuacion de cria -> techo de 2,1 UG/ha).
  "En los sistemas regenerativos se estima que con el tiempo la carga puede superar como
  minimo el doble de la carga inicial."
### Donde se ubican los modulos (4 criterios)
1) necesidad de observacion (zonificacion: la cria cerca de la casa para las pariciones) ·
2) la topografia (un arroyo como divisoria) · 3) la calidad de la pastura (las categorias
mas sensibles donde rinde mas) · 4) **en funcion del agua**: el punto de distribucion como
punto de encuentro de los modulos, asi **no hay superposicion de consumos** y bajan los
diametros. Ejemplos reales de 100 ha, 1.000 ha, 1.050 ha, 5.700 ha y 12.000 ha (Salta,
modulada por puestos A/B/C/D de 1.000 ha cada uno).

## Clases 5 y 6 — Cartografia, modelos de terreno y elementos topograficos
- **El curso se da en Google Earth porque aprender un GIS lleva demasiado tiempo.**
  Comparan Google Earth / MapInfo / QGIS / Global Mapper / ArcGIS; ellos usan Global Mapper.
  "Google Earth no soporta modelo de elevacion... no podremos extraer curvas, drenajes,
  cuencas, modelar."  <-- **acequia es exactamente el GIS que el alumno no tiene que aprender.**
- DEM gratuitos comparados: SRTM 30/90 m (±16 m absoluta, ±6 relativa), ASTER GDEM 30 m
  (±17), ALOS PALSAR RTC 12,5 m (±5-10 / ±2-4), Copernicus 30 m (±2-4 / ±1-2).
  Pixel de ortofoto: Sentinel 10-60 m · Google/Airbus 50 cm · IDEUY 35 cm · drone 3 cm.
  DTM: ALOS 30 m · IDEUY 2,5 m · drone 0,5 m.
- **DSM vs DTM**: el DSM trae vegetacion y edificios. El barrido de DSM a DTM "borra el ruido
  pero pierde informacion"; conviene **alternar entre los dos modelos** (el DSM para entender
  carcavas y el embalse, el DTM para caminerias y patrones de cultivo).
- **Trampas del relevamiento que la app deberia advertir**: un pastizal de 80 cm se interpreta
  como terreno y "resultaba la zona mas alta cuando en terreno no lo era" -> cuidado al
  **posicionar un tanque por gravedad en una zona muy plana**; en campos muy planos con
  vegetacion alta es imposible saber como fluye el agua (la imagen ayuda mas que el modelo).
- **Pedido de relevamiento** (plantilla que la app podria generar): campo chico hasta 50 ha
  2-5 cm de pixel · mediano 50-500 ha 5-8 cm · grande 500 ha+ menos detalle. Entregables:
  ortofoto (tiff/ecw), DTM y DSM (tiff); en KMZ: ortofoto raster, DTM y DSM por colores,
  curvas cada 0,5/1/2 m en DTM y en DSM, drenajes, y la pendiente si el proveedor la tiene.
- **Equidistancia de curvas segun la tarea**: 0,1 m para un canal, un camino, un embalse,
  posicionar un tanque · 0,5 m diseño en pendiente media/baja (la mas usada) · 1 m diseño
  general · 2 m pendiente muy alta · 5 m grandes areas.
  "Si el modelo no tiene definicion, por mas cerca que pida las curvas no logro mas
  informacion sino una aproximacion."
- **Los 11 mandamientos de las curvas de nivel** (utiles como texto didactico en la app):
  se cierran sobre si mismas; no se cruzan; mas cerca = mas pendiente; forman V que apuntan
  **aguas arriba en los valles** y V invertidas **aguas abajo en las crestas**; las que rodean
  cotas mas altas son cimas y las que rodean cotas mas bajas son hoyas; la direccion de
  maxima pendiente es perpendicular a las curvas.
- **Drenajes por area acumulada**: pedirle al GIS los drenajes a partir de 0,1 / 1 / 10 / 100
  / 1.000 ha acumuladas y **darle a cada umbral un grosor distinto** -> jerarquia visual de la
  importancia de cada drenaje. Clasificacion por permanencia: solo el dia que llueve ·
  unos dias mas · la temporada · todo el año con caudal variable · caudal estable;
  y la popular: drenaje natural / cañada / arroyo / rio.
- **Cuenca de un punto**, y el aviso: "muchas veces las cuencas exceden los limites de la
  propiedad"; con un relevamiento de drone que termina en el alambrado la cuenca sale mal y
  **hay que usar informacion satelital para el orden de magnitud**.
- **Divisorias** (parteaguas) primarias y principales, con aplicaciones: caminos, callejones,
  senderos, posicionamiento de estructuras, puntos de vista panoramica, cambio de orientacion.
- **CRESTAS** = maximo relativo en una divisoria principal; **PUNTOS SILLA** = minimo relativo.
  Aplicaciones: crestas para **tanques** (altas y normalmente planas), estructuras, mirador;
  **puntos silla para valvulas de aire** y para "el embalse mas alto con captacion", y para
  alertar problemas en el camino.  <-- todo computable desde el DEM
- **Keypoint / Keyline (P.A. Yeomans)**: el punto del drenaje donde el flujo pasa de erosionar
  a depositar; **NO es el punto de inflexion** (concavo a convexo). Hay un keypoint por cada
  drenaje primario; la keyline es la curva de nivel que pasa por el. Señales: antes las curvas
  mas juntas, despues mas separadas; el agua baja la velocidad; sedimenta arcilla; suele ser
  fertil y humedo. A campo: "cuando podes dar un paso mas largo, es alli".
  **"¿Es el punto clave una quimera?"** — muchas veces no se nota el cambio de pendiente;
  Yeomans desarrollo esto para gente sin DEM, sin RTK y sin curvas. "Hoy contamos con
  tecnologia que nos permite ir mas alla de esta teoria."
- **Perfil de elevacion**, aplicaciones: posicionar alcantarillados, **posicionar valvulas de
  aire**, evaluar posicion y pendiente de caminos, diseñar patrones de cultivo, evaluar filas.
- **Shaders** y para que sirve cada uno: altimetria (tanque, sistema por gravedad, bombeo,
  vistas, efecto del viento, estructuras) · pendiente (tanque, caminos/trillos/cruces,
  estructuras, zonificar cultivo, embalses, puentes) · orientacion (0 norte, 90 este, 180 sur,
  270 oeste; verde norte, rojo sur, azul este, blanco oeste; exposicion solar, divisorias,
  cuadros con orientacion norte, frente al amanecer/atardecer).
  **"Este analisis tiene sentido en campos con pendiente; si la pendiente es baja la
  implicancia de la orientacion se vuelve insignificante."**
- Instrumentos de campo comparados (marco A, nivel de manguera, nivel optico, nivel laser,
  RTK): precision, costo, personas necesarias, alcance. Para campo, laser de mas de 400 m.
  **Solo el RTK permite bajar el diseño a campo con precision.**
- Geologia y clasificacion de suelo para: interpretar consecuencias, zonificar por aptitud,
  deficiencias minerales, **coeficientes de escorrentia**, **evaluar el potencial de encontrar
  arcilla para la presa**, impacto de seca e inundacion, y **buscar zonas con geologia similar
  para obtener ideas de variedades**. Usan ChatGPT (Geology GPT) para interpretar el mapa
  geologico nacional y sacar **consecuencias positivas y negativas para el cultivo**
  (drenaje, minerales liberados, inercia termica vs acceso al agua, fertilidad, mecanizacion).
  "Material generado por IA, debe ser tomado como orientativo a revision por un experto."
  En Uruguay usan **CONEAT** con su **indice de productividad** (9, 53, 83, 105...).
  <-- acequia ya tiene Macrostrat, SoilGrids y las fichas: esto es el mismo producto
      pero con fuente citada en vez de ChatGPT.

## Keyline segun Georgi Pavlov (HUMA) — "Entendiendo la aplicacion de la geometria Keyline"
Prologo de Darren J. Doherty. Bibliografia: Yeomans 1954/1958/1965/1971, Collins & Doherty
2011 "Off The Contour #8: Keyline Design Mark IV", Regrarians Handbook - Geography (2015),
MacDonald Holmes 1960, Hill 2001.
**Correcciones que afectan directamente la herramienta keyline de acequia:**
- **No hacer offset directamente de las curvas de nivel**: desplazar desde un **perfil libre y
  simplificado** del contorno que solo considere las formas principales del terreno (lineas
  triangulares), si no el offset produce formas complicadisimas. Redondear despues si hace falta.
- **No hace falta limitarse** a desplazar pendiente abajo desde las vertientes y pendiente
  arriba desde las laderas: con una sola directriz se pueden cubrir vertientes y laderas a la
  vez. Empezar desde **el trazo de contorno simplificado mas largo** del area.
- **Headland (espacio de maniobra)**: 2 a 4 veces el ancho de la maquinaria (maquina de 5 m ->
  headland de 10-20 m). Dejar headland tambien **entre conjuntos de patrones**.
- **Angulo maximo de giro de la mayoria de los tractores: 50-55 grados.** Las lineas paralelas
  NO son equidistantes en los angulos: la distancia entre angulos es siempre mayor que entre
  sus rayos, lo que **permite redondear angulos sin romper la equidistancia general**.
- Regla practica: **por cada 10 grados de cambio en el angulo de la geometria, la pendiente de
  los rayos cambia 5 grados**.
- La bisectriz del angulo muestra **la trayectoria que el offset va a seguir** pendiente arriba
  y abajo: sabiendo eso se ajusta el angulo de antemano para que el agua vaya de vertientes a
  laderas. Cuando las formas del terreno cambian de direccion, arranca un nuevo conjunto.
  **Buscar el menor numero de conjuntos posible.**
- **Pendientes de mas de 20 grados**: puede convenir otro patron (surcos a 90 grados de las
  curvas, para que la maquina gire en lo plano de arriba y abajo). "Donde el paisaje se hace
  mas pronunciado los patrones se pueden hacer mas planos, y al reves."
- El patron Keyline **dirige el aire frio al medio de las laderas**: un camino o un headland
  entre patrones puede usarse para conducir el aire frio pendiente abajo.
- Anomalias (arroyitos, quebradas) se ignoran si son de escala insignificante; la geometria
  puede intentar mover agua pendiente arriba y estancarla, y eso tambien se tolera si es raro.
- **Por que no se menciona el keypoint**: respuesta del autor, los keypoints siguen siendo
  importantes para **ubicar cuerpos de agua**, pero **se volvieron irrelevantes para crear la
  geometria Keyline** gracias al software moderno.
- **"El diseño se completa cuando no se puede simplificar mas sin reducir su funcionalidad."**
  Mejor un diseño no del todo correcto pero inspirador y facil de trabajar, que uno
  tecnicamente correcto que a nadie le gusta usar.

## Clases 14 y 15 — Accesos: posicion, construccion y alcantarillado
- Lenguaje: **camino** (vehiculos, con obra: decapaje, conformacion, cuneta, balastro),
  **callejon** (ganado, entre alambres, sin obra salvo puntos complicados), **trillo**
  (maquinas) y **sendero** peatonal.
- **Anchos**: camino 3-8 m (segun transito) · callejon 8-20 m (tamaño del grupo y suelo) ·
  callejon ovino 5-10 m · sendero 1,5-3 m · rotonda 20-40 m · trillo 4-12 m ·
  estacionamiento 2,5x5 a 3x6,5 m por unidad. (Ejemplos reales de callejones: 12 y 14 m.)
- **Orden de prioridad de la posicion**: 1) divisoria principal · 2) divisoria primaria ·
  3) a nivel (pendientes leves). **9 excepciones**: pendiente, piedras (visibles en el DSM),
  agua en los puntos silla, simplificacion del alambrado, funcionalidad de las parcelas,
  areas de reserva, costos (un camino optimo puede ser mucho mas largo), elementos
  existentes, estetica (en loteos curvas que bajan la velocidad).
- Ventajas del camino en divisoria: expulsa el agua (menos erosion, a veces sin cuneta),
  terreno mas firme, vista panoramica, menos cruces/badenes/caños, infraestructura con buen
  acceso y en seco, estetica, y **division natural del espacio**.
- **Pendiente del camino: ideal no mas de 12%**; con mas, trazados oblicuos a las curvas
  usando el shader de pendiente.
- **Por que recomiendan callejones**: evitan porteras, el ganado aprende y sigue a la persona,
  menos distracciones, se respeta el diseño optimo, **plan B de agua** y **sombra como area
  social**. Ventaja extra del bebedero sobre el camino: piso firme, cañeria sobre el camino
  para mantenimiento, **el traspaso de fertilidad se da contra la gravedad** (la fertilidad
  sube a la zona alta y despues baja sola), los animales se juntan solos, y los minerales se
  reponen facil.
- Cruces de drenaje: **reducir la distancia, cruzar perpendicular**, y aprovechar que el
  encuentro de divisorias primarias suele coincidir con esos puntos.
- Baden vs caño vs puente, comparados por costo, capacidad de drenaje y dificultad.
- **CALCULO DE ALCANTARILLADO (Regrarians Handbook, Doherty & Jeeves)** — VERIFICADO:
  **A = 0,183 x C x M^0,75 x R / 100**, con A = seccion (m2), C = coeficiente de escorrentia,
  M = cuenca (ha), R = maxima precipitacion horaria prevista en la vida util (mm/h).
  Diametro: **D = 2 x raiz(A/pi)**.
  Comprobado con el caso del puente: cuenca 1.242 ha, C 0,35, seccion 10,5 m2 -> 78 mm/h, ok.
  Es racional: **cuidado con cuencas grandes y eventos concatenados**.
  Uso inverso muy bueno: dada una obra existente, **que lluvia maxima aguanta**.
- Cunetas y **bigotes** (desvios de cuneta) en los puntos elegidos del perfil para descargar
  el agua acumulada del tramo al campo y "volver a empezar".
- "Cada frenada y arrancada genera erosion": conviene que el flujo continue (callejones,
  mataburros, rotondas).
- Vados: ensanchar el camino con bajada al **15% de pendiente** (profundidad/0,15 = ancho);
  caño en el fondo con diametro = **1/6 de la seccion del vado**, relleno con tierra y piedra
  dejando espacio libre arriba para que el excedente pase por encima sin salirse.
- Puente barato real: dos **flat racks de 40 pies** (40 t cada uno, US$ 3.000 c/u, ~40% mas
  barato que un puente tradicional).

## Clase 16 — Cortinas, frutales, huerta, SOMBRA Y ABRIGO  (todo cuantificado)
- Huerta intensiva: **a menos de 50 m** de la casa, camas elevadas, del lado de la cocina,
  invernadero chico para plantines. Frutales: **distancia media menos de 150 m**, orientacion
  de ladera oeste/noroeste/este, **pendiente preferentemente menor a 10 grados**, en patron
  hidrologico o solar segun la pendiente. Cuidar siempre la **proyeccion de sombra**.
- Bibliografia de huerta: Fernando Pia (biointensiva), Jairo Restrepo, Jean-Martin Fortier
  (Market Garden, no till), Richard Perkins (Ridgedale).
- Frutales: filas orientadas al norte con leve inclinacion al oeste; ordenar por altura para
  no sombrear hacia atras y poner **las perennes al sureste** para que no sombreen a las
  caducas en el rebrote de primavera. Tabla por especie con distancia entre plantas, tamaño
  de pozo (80x80 cm o 1x1 m), litros de abono (20-40) y cantidad de goteros (2-6).
- **CORTINAS DE VIENTO: una cortina de 10 m de altura protege 140 a 200 m** (14-20 veces la
  altura), y estar **sobre divisoria aumenta los metros de proteccion**. Al menos **tres filas**
  con arboles de distinto estrato en **tresbolillo**: alto (casuarina, eucaliptus), medio
  (acacia aromo, cipreses), bajo (acacia negra, caña/bambu).
- **SOMBRA PARA EL GANADO**, los numeros:
  **minima 3-4 m2/UG · comoda 7 m2/UG · elegida 5-6 m2/UG** ("la bibliografia dice 4 a 8 m2").
  Al area de sombra efectiva se le suma el borde: **3-4 m de distancia al alambrado** y
  **6 m para el giro del tractor** que corta el pasto.
  Forma: cuadrado o rectangulo 1:2 (ej. modulo A 66x130 m; **el lado de un cuadrado de
  0,5 ha es 71,4 m, que a campo se simplifica a 70 m**). Filas cada 3-4 m, arboles a 4 m,
  en tresbolillo; mezclar **crecimiento rapido** (acacia negra, melanoxilon) con **largo plazo**
  (tipa, ibirapita, grevillea).
  **Distancia maxima a la sombra: objetivo 300 m, aceptable 600 m, en sistemas extensivos
  800 m** — y se verifica dibujando circulos de ese radio sobre el mapa para ver la cobertura.
  "La medida no es lineal porque a veces el camino no esta del lado que da acceso a la sombra."
  Las sombras se asocian al callejon, con hidrante, y se posicionan **en punta contra el
  callejon** para no restringir el acceso de las franjas contiguas al bebedero.
- **La importancia de la sombra mes a mes se lee del grafico climatico**: en el ejemplo es de
  alta importancia en diciembre, enero y febrero; media en marzo y noviembre; **no necesaria
  de abril a octubre**.  <-- acequia tiene el clima mensual: esto es calculable

## Clase 17 — Patrones de cultivo Keyline
- **Tabla 2.1 del Regrarians Handbook (cap. 2, pags. 69 y 96): comparacion de metodos de
  directrices paisajisticas**, con factores de ponderacion (5,5,5,5,3,2,2,1) sobre
  equidistancia de fila, potencial de erosion, agua en la cresta, densidad de cultivo/tallo,
  drenajes de agua, drenajes de aire, estetica y potencial de simetria:
    **Contorno 153/280 = 55% · Cuadricula estandar 136 = 49% · Mosaico 140 = 50% ·
    LINEA CLAVE 269 = 96%.**
  Argumento clave: "en realidad nunca se puede trabajar en curvas de nivel, porque una curva
  siempre es diferente a la otra" y **trabajar a nivel desperdicia mucho espacio**.
- Procedimiento clasico (6 pasos): marcar divisorias y drenajes · marcar separaciones entre
  ellos · seleccionar los puntos clave · elegir la curva de cada divisoria o drenaje · copiar
  el patron hacia arriba y hacia abajo hasta que se encuentren · crear un patron comun.
  Cuando no hay linea clave en la divisoria se elige **la curva mas alta**, que al copiarse
  hacia abajo se va cerrando.
- **Dos escuelas**: la clasica (Yeomans, Doherty) que aboga por la **simplicidad**, y la del
  detalle (Jesus Ruiz, lineaclave.org) que le impone al patron una **pendiente de 1% a 5%,
  promedio 2%**, lo que "termina generando muchas correcciones, le quita simpleza y se parece
  mas a un trabajo a nivel: da mas seguridad pero desaprovecha espacio".
- **Validacion automatica de un patron** (lo que la app puede hacer sola): marcar los
  **puntos altos del patron con triangulos amarillos y los bajos con triangulos azules**;
  si los amarillos caen en el drenaje y los azules en la divisoria, **el agua se mueve en la
  direccion buscada**. Ademas se propone la **recta que mejor aproxima** cada patron para
  simplificar la aplicacion, **con un color que indica el riesgo** de esa simplificacion.
- **Subsolado (arado Yeomans)**, tres objetivos: aumentar la infiltracion, redistribuir el
  agua y colonizar suelo hacia abajo. **El calculo de almacenamiento, verificable**: pie cada
  1,5 m y 30 cm de profundidad -> 66 lineas de 100 m por ha; seccion 0,02x0,26 + 0,10x0,04 =
  0,0092 m2; x 100 m = 0,92 m3 por linea; x 66 = **60,72 m3/ha = 60.000 litros = 6 mm por m2**,
  mas la infiltracion extra por la fractura y el agua retenida en superficie.
  Pasar **5 cm por debajo de la profundidad promedio de las raices**, un poco mas profundo
  cada año. Momento: **antes de la temporada de lluvia con el suelo a humedad media** —
  muy seco rompe el tapiz, muy humedo genera **efecto maceta** (paredes impermeables); si
  despues viene seca, el aire caliente entra al corte y quema las plantas cercanas; en alta
  pendiente con cortes muy cercanos se puede desplazar la tierra.
- En canteros el patron se diseña con **mas detalle y con divisiones** (si una linea acumula
  agua, en subsolado pasa a la siguiente, pero en canteros pasa por encima del cantero).
- **Evaluacion de la orientacion de las filas** con criterios del tecnico: "orientacion ideal
  340 grados; pendiente no superior al 12% salvo algunas filas hasta 15%", y se reporta por
  fila **la pendiente promedio y la maxima**. Resultados reales: un cuadro quedo a 6 grados al
  este del norte; los cuadros altos, paralelos al alambrado, a 18 grados, con 16% de pendiente
  promedio y 21% de maxima, **excediendo los criterios iniciales** (se informa, no se esconde).
- Advertencia de autoria: "Los cultivos en patron Keyline es lo definido por P.A. Yeomans;
  por respeto intelectual las desviaciones deberian tener otro nombre" (critica a Mark Shepard).

## Clase 18 — Posicionamiento de estructuras, orientacion, aleros
- Que mirar para ubicar una estructura: **zona alta, drenada, buen acceso**, orientacion del
  terreno y de la construccion, vista/paisaje, distancia a los limites, estrategia del caracol,
  privacidad, separacion de zona productiva y de vivienda, galpon e invernadero respecto a la
  casa, proyeccion de sombra, rotonda, internet.
- **Caso real de eleccion del punto de la casa, con los seis analisis que la app puede hacer:**
  1) **70 m de distancia del limite y 50 m del camino publico** · 2) **buffer de 15 m de cada
  lado de los drenajes naturales** · 3) altimetria (evitar inundables) · 4) orientacion
  (laderas norte) · 5) pendiente (la casa y su alrededor sin demasiada pendiente para poder
  usar el exterior) · 6) **cuenca visual proyectada desde cada punto candidato**.
  Y se **cuantifica con una tabla de puntajes por candidato**: accesibilidad,
  privacidad/seguridad, orientacion, presion de agua (1 a 5). "Para orientar a los
  propietarios en una decision que al final es subjetiva." Se chequeo a campo y se eligio el 4.
- **ESTRATEGIAS DE BIOCONSTRUCCION SEGUN KOPPEN** (tabla directamente implementable porque
  acequia ya calcula el Koppen del punto):
  · **Tropical humedo (Af, Am)**: ventilacion cruzada permanente, techos altos, vivienda
    elevada sobre pilotes, drenaje intensivo, materiales livianos (madera, bambu, barro),
    colores claros, aleros amplios contra lluvias torrenciales.
  · **Tropical seco-humedo (Aw, As)**: orientacion a las brisas dominantes, ventilacion
    adaptable segun estacion, materiales mixtos madera+adobe/tapial para inercia moderada,
    captacion y almacenamiento de lluvia.
  · **Subtropical humedo (Cfa, Cfb, Cwa)**: orientacion al sol invernal y proteccion en verano,
    galerias, patios y aleros amplios, ventilacion cruzada en verano, doble vidrio en invierno,
    materiales de aislamiento medio (ladrillo con camara).
  · **Mediterraneo (Csa, Csb, Csc)**: muros gruesos de alta inercia (piedra, adobe, tapial),
    ventilacion nocturna, patios frescos con vegetacion, fachadas encaladas, teja inclinada o
    azotea, recoleccion de agua en cisternas.
  · **Climas frios (Dsa, Dsb, Dwa, Dwb, Dfa, Dfb)**: maxima orientacion solar y volumen
    compacto, envolvente muy aislada, ventanas reducidas con doble/triple vidrio, techos
    inclinados preparados para nieve.
- Casa bioclimatica en Cfa: **rectangulo alargado con la cara larga al norte**; orientacion al
  **norte real** (no al magnetico), replanteo con RTK y chequeo con sombra calculada;
  **cocina al este** (luz de la mañana, vinculada a la huerta), **cuartos al oeste** (reciben el
  sol de invierno de la tarde con el alero bien calculado), estar al norte, servicios al sur;
  **techo de una caida hacia el sur**; muros con aislacion al sur e inercia termica al norte;
  ventilacion cruzada mas entradas de aire a nivel de piso desde el sur.
- **ALEROS**: el criterio es elegir **a partir de que dia del año la casa empieza a recibir sol**
  guiandose por la estadistica de temperatura (su recomendacion: de mediados a fines de
  **abril** en el hemisferio sur); aleros en **todas** las direcciones para que la lluvia no
  pegue en las paredes; el alero crea espacios externos (atardecer al oeste, amanecer al este,
  calor de invierno al norte, fresco de verano al sur); **del lado oeste, alero estacional con
  una trepadora caduca** (trompeta de fuego, glicina). Para calcularlo necesitan la planta de
  la casa, su altura y el angulo del techo.

## Clase 19 — Subdivisiones: proteccion y fraccionamientos
- Tipos: alambrado fijo de 5-7 hilos, pua, **electrico**, hilo movil, malla electrica movil,
  malla electrosoldada, malla pollito, malla ovina, malla gallina, vegetacion y **cerco virtual**.
- **El alambrado fijo se limita** a estructuras de manejo, separacion de modulos (si hay uno
  existente, aprovecharlo) y separacion de toros: lo demas lo hace mejor y mas barato el
  electrico (y el fijo dificulta las porteras).
- **El alambrado electrico es una barrera psicologica, no fisica**: no hace falta tensar mucho,
  y de eso se deduce que se pueden **reducir las riendas y distanciar mucho los postes**
  ("tenemos proyectos con postes a 700 m de distancia, lo cual reduce el costo"). Hoy usan
  poste de madera con **varilla de fibra de vidrio** (rapida instalacion, menor mantenimiento).
  Desventajas: requiere entendimiento y revision, pierde con pastos altos, animales con
  aislacion, puede no ser suficientemente seguro para algunas funciones.
- **DIMENSIONAR EL ELECTRIFICADOR: se piden los tres criterios al mismo tiempo** —
  **distancia maxima en linea recta** desde el electrificador al punto mas lejano, **radio o
  cobertura maxima (ha)** y **longitud total desplegada de alambre (km)** — mas la cantidad de
  hilos y la probabilidad de perdida por vegetacion (si es alta, sobredimensionar).
  **Casos reales**: 120 km de 1 hilo, 6,8 km lineales, 1.720 ha -> **20 J** ·
  170 km, 7,6 km, 2.647 ha -> **32 J** · 100 km, 5,4 km, 1.350 ha -> **10 J** ·
  (y el caso de clase 20: 5.700 ha con equipo de **15 J y 7 jabalinas**).
  "No se recomienda escatimar en el electrificador: el costo es bajo en relacion al resto de la
  instalacion y **es el corazon del sistema**." Jabalinas: la cantidad que pide el equipo o mas,
  con buen cable, **en un lugar que se sepa humedo** (un drenaje, la caida de un techo, o
  incluso con un goteo).
  **La linea madre (los callejones) debe ser de alambre de buena conduccion; usar alambrado
  movil ahi es el equivalente a un pedazo de caño de 1/2 pulgada en una instalacion de 2.**
- Implementos: cable subterraneo en los cruces (calculado), **llave guillotina** (apagar
  sectores y lineas), **sectorizador**, medidor de perdidas (voltimetro), **vela** (deja pasar
  al ganado y queda electrificada), vela automatica, resorte en los hilos bajos.
- Porteras electricas: cuerda elastica (adaptable, poco durable), cuerda electrificada (mas
  durable, menos adaptable), manijas, kits (cortos para callejon). La cinta ya no la recomienda.
- Movil: piolin trenzado (600 m por carretel, patada/visibilidad/durabilidad medias a bajas)
  vs **Polybraid** (mas visible, mejor patada, mucho mas durable, pero 350 m por carretel).
- **Cerco virtual**: "en ambientes donde la productividad del terreno es baja, la inversion en
  infraestructura es alta para lograr intensificacion. Con esta tecnologia **el costo es por
  unidad ganadera en vez de por area**."
- Para huerta y frutales de autoconsumo, si hay presupuesto, **malla electrosoldada**.

## Clase 2 — Clima de la biosfera y clima legal
- Tres climas: **biosfera**, **legal** y **de la mente** (los tomadores de decisiones).
  "Si la planificacion de tierras fuese un juego, el clima son las reglas."
- Lo que se estudia del clima: temperatura maxima y minima promedio, **temperatura promedio
  por hora** (grafico dia-del-año x hora), precipitacion mensual y anual, **probabilidad diaria
  de precipitacion**, proyeccion de sombra, horas luz y energia solar, direccion del viento,
  evaporacion y evapotranspiracion.
- Koppen-Geiger: usan la version de **Murray C. Peel (Universidad de Melbourne)**.
  Aplicaciones explicitas: variedades de plantas, razas de ganado, manejos de riego, busqueda
  de tecnologia, innovacion, **buscar coeficientes, criterios y tiempos de reposo**, y
  **evaluar la aplicabilidad de un estudio a un lugar**. Y "buscar zonas similares para ver
  como resuelven los problemas" — con listas de **ciudades del mundo con el mismo clima**.
- Fuentes: bancos de datos agroclimaticos oficiales (INIA) y **Weather Spark**, citando como
  trabaja (promedio ponderado por inversa de la distancia de 3 estaciones, corregido por
  altitud segun la International Standard Atmosphere y MERRA-2). **La energia solar sirve para
  estimar las horas efectivas que funcionara una bomba solar.**
- **Evaporacion de tanque A** con estadistica 1980-2024 por mes (maximo, minimo, promedio
  diario, promedio mensual): noviembre-febrero = **832 mm de perdida por evaporacion**.
- **BALANCE HIDRICO MENSUAL** (caso Esquel, y es un calculo entero que acequia puede hacer):
  filas PP · **% PP efectiva** (94-97%) · PP efectiva · **ETP** · PP ef - ETP ·
  **reserva en el suelo** (con tope, 80 mm en el ejemplo) · **exceso** · **deficit**.
  Sirve para: estacionalidad de la reserva/deficit, **excedentes para recarga de acuiferos,
  cursos y reservorios**, y cuantificar la demanda de riego con ETPc = ETP x Kc.
- **Variabilidad interanual como metrica de riesgo**: contar los años con precipitacion
  **30% menor al promedio** (Esquel 10% de los años; otra estacion 24%), con la tendencia
  lineal de la serie (en Esquel y = -2,68x + 516,8, es decir cayendo).
  Fuentes: Atlas Climatico Digital de la Republica Argentina (Bianchi y Cravero, 2010),
  Servicio Meteorologico Nacional, **IPCC Interactive Atlas con CMIP6** para los pronosticos.
- **CLIMA LEGAL**, seis capas a revisar: reglamentacion nacional · departamental/provincial
  (ej. en Uruguay **el area minima de subdivision de un predio rural varia por departamento**)
  · por zonas (areas protegidas, costas, cuencas de lagos, categorizacion de suelos) ·
  comerciales (faena propia de pollos, CBD/THC, fraccionamiento rural con areas comunes) ·
  impacto ambiental (tala de monte nativo, intervencion de cursos de agua, manejo de efluentes)
  · **beneficios impositivos** (ej. proyectos de agua o riego en Uruguay).
  "Es un elemento que puede determinar un proyecto por ser dificil de modificar: a veces nos
  permite evaluar la viabilidad y en otros adelantarnos a problemas."

## Clase 3 — Clima de la mente: CONTEXTO HOLISTICO
(Invitada: Master Verifier EOV del Savory Institute, referente de Ovis 21.)
- El **Contexto Holistico** es la fuerza conductora del Manejo Holistico y guia toda decision
  importante. Se define en tres partes: **declaracion de proposito** (¿para que existe esto?),
  **declaracion de calidad de vida** (bienestar social + bienestar economico) y **base futura
  de recursos** (nuestro comportamiento + **nuestro paisaje futuro**).
- Antes hay que **definir el TODO**: quienes son los tomadores de decisiones (incluyendo
  **quienes tienen poder de veto**), la **base de recursos** (humanos, fisicos y **el dinero**:
  de la produccion, de otro negocio, de servidumbres).
- Reglas de redaccion: **una pagina o menos**, escrito para que todos lo vean, simple, que las
  palabras signifiquen lo mismo para todos, **sin jerarquizar ideas**, **sin incluir acciones**,
  **a favor de algo y no en contra**, sin referirse a los problemas, y no buscar la perfeccion.
- Siete **verificaciones/testeos de decision** contra el contexto (economica, ambiental y
  socialmente solida).
- **La analogia que vale la pena citar**: el contexto holistico es la **suma de fuerzas**; si
  cada decision apunta a un objetivo distinto, parte de la fuerza se pierde o se contrarresta.
- **Cuando el cliente no tiene contexto holistico** (lo mas comun): no se puede crear por el,
  pero se lo va "entresacando" de las conversaciones con tres preguntas — **¿quienes son?
  ¿que tienen? ¿que quieren?** — y un listado concreto de preguntas de sondeo (con quien hace
  el proyecto, de quien es el campo, de donde viene el capital, a que se dedican, viven alli,
  piensan mudarse, han vivido en el campo, hay pozo, hay herramientas, se asesoran con alguien,
  que modelo los inspira, que tipo de trabajo y que alcance buscan, cuantas personas trabajan).
- **Tipologia de clientes** (el que no sabe lo que quiere, el que duda y va para atras, el que
  tiene muchas ideas, el citadino, el hombre de campo tradicional, el soñador, el ausente, el
  ahorrador, el gastador, el exigente, el que cree que lo sabe todo, el grupo, la comunidad...)
  y la advertencia: **si la parte humana es mas complicada, el proyecto sera mas complicado**,
  y eso cambia el precio o la decision de tomar el trabajo.
- **"No es nuestra responsabilidad el exito del proyecto"**: la mision es diseñar y planificar
  una infraestructura eficiente que cumpla los objetivos y ahorre problemas y dinero; el exito
  depende despues del propietario y su equipo. "A veces si vemos que algo esta bien complicado,
  es nuestro deber alertar."
- **Lista de sesgos del planificador** (buena para una pagina de la guia): querer tener razon,
  no escuchar, no preguntar, ser inflexible, tener oraciones como absolutos, perder el panorama,
  **proyectarse en el cliente (no somos el cliente)**, exceso de confianza, no proyectar a largo
  plazo, resistencia a la critica, no reconocer las propias limitaciones, no saber ceder el
  control, **sesgo de experiencia propia**, ignorar a algunos integrantes, demasiado innovador,
  no reconocer errores, no trabajar en equipo.
- Sobre IA: la toman como **una opinion mas**; advierten de la alucinacion y de **pedir
  referencias y chequear los links**; "la calidad de la respuesta depende de la calidad de la
  pregunta"; y la tecnica de **pedirle que te pregunte**. Para calculos hidraulicos recomiendan
  modelos razonadores y **resolverlo con dos formulas distintas para comparar**.
