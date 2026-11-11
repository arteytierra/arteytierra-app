# Los prompts para GPT, listos para pegar

*Al 11/11/2026. Un chat nuevo y suelto por encargo: sin Proyecto, sin memoria,
sin conectores, sin el de GitHub, y con «mejorar el modelo para todos» apagado.
Cada encargo se cierra al terminar — arrastrar veinte lotes en un mismo hilo
significa pagar los veinte en cada respuesta nueva.*

**Siempre dos pegadas, en este orden:**

1. `reglas\GPT_LOCAL_REGLAS.md` completo.
2. el `reglas\ENCARGO_*.md` de la fila que corresponda.

Y nada más: no hace falta escribir ninguna instrucción propia. Si los dos
archivos se contradicen, manda el encargo, y eso ya está dicho adentro.

---

## Por orden de lo que destraba

| # | Qué pegar | Qué destraba | Dónde cae |
|---|---|---|---|
| **1** | `ENCARGO_FASE_4_LOTES_09_10.md` | Las otras dos turberas: ECO_ID 221 (Borneo, 67.620 km²) y 264 (Malaca). Cierran el conjunto de cuatro «peat swamp forests» de RESOLVE y completan la calibración del módulo de turba. Y traen la pregunta que más vale: el sagú y el jelutong, que son la única respuesta al `forestal 0` y todavía no tienen id en el catálogo. | `entregas\fichas-indomalaya\09.json` y `10.json` |

Uno por chat. Es una sola fila porque las dos anteriores cerraron el 06 y el
11/11/2026, y porque **este es el último encargo del patrón bueno**: ficha que
completa algo medido, con las rutas ya probadas y el piso ya escrito. Lo que
queda después es relevamiento nuevo, que rinde menos por token, y la lista está
al final.

### Lo que cerró el 11/11/2026

~~`ENCARGO_FASE_6_REPESCA.md`~~ **volvió con cuatro entradas y dos vacías
declaradas, y entraron tres.** Por primera vez en la fase **ninguna se cayó por
la fuente**: las cuatro fuentes decían lo que la entrega decía. Montado en el
commit `a4199e9`; el veredicto entero está en
`_research/_encargos/RESPUESTAS_PRACTICAS_FASE_6_REPESCA.md`.

- **Dos abren ficha, las dos del taluka de Mulshi.** El devrai de Kolavade da 254
  y el riego de Paud da 253; las dos estaban en cero. Indomalaya baja de 13 fichas
  sin ninguna práctica a **11**, no a 8.
- **La del devrai costó cuatro rutas cerradas.** Hindawi, Wiley y CORE —la que
  trajo la entrega— contestan las tres con la verificación anti-bot de Cloudflare,
  también desde un navegador real, y la Wayback Machine, que tiene el PDF
  archivado, estaba caída ese día. Abrió por la copia de Semantic Scholar, que se
  encuentra con el DOI: **`api.openalex.org/works/doi:<DOI>` y
  `api.semanticscholar.org/graph/v1/paper/DOI:<DOI>?fields=openAccessPdf` devuelven
  el PDF abierto con su licencia.** Es herramienta nueva para el circuito.
- **La tercera se movió de polígono por una medición y no por una discusión.** El
  control mecánico de defoliadores de Wayanad llegó para el 270, y los cinco
  sitios de encuesta que el artículo publica con coordenada dan **los cinco 271**.
  Fue a `ghats_sur_montano`. El detalle que queda anotado: la coordenada que el
  artículo imprime al lado de «Pulpally» cae trece kilómetros al sur del pueblo de
  Pulpally, que sí da 270.
- **Y la frontera que esa entrada obligó a escribir.** El ensayo del trabajo midió
  las formulaciones que se pulverizan, **no** el método mecánico de las ramas.
  Atribuirle a las ramas el 33,7-41,5 % → 14,2-18,5 % habría sido la fuente
  correcta midiendo otra magnitud, que es la falla que este circuito ya cometió.
- **La cuarta es el cuarto fracaso seguido de `pinar_toba`, y el encargo tuvo la
  mitad de la culpa:** dijo «Siulak y las laderas del Gunung Kerinci», y Siulak da
  305 pero las tres aldeas de Kayu Aro Barat donde fue la entrega dan 279. El
  polígono del 305 quedó medido parte por parte en el veredicto: tiene cinco
  pedazos y sólo uno está en Kerinci. **Esa ficha no se vuelve a pedir sin esa
  tabla a la vista.**
- **Quinta variedad de fuente cerrada:** `repository.pertanian.go.id` **no tiene
  registro A**. No es un 403, ni un anti-bot, ni un 200 engañoso: el nombre no
  resuelve en ningún DNS mientras el dominio padre sí.
- **Una falta de forma en las cuatro entradas:** ninguna puso los autores, y hubo
  que buscarlos en los cuatro casos.

~~`ENCARGO_FASE_4_LOTES_07_08.md`~~ **entró entero el 06/11/2026** (commit
`c7a563d`). Las dos turberas están montadas —`pantanos_tonle_sap_mekong_turba` y
`pantanos_turba_sumatra`— con el modificador forestal reescrito y el límite de
napa agregado. Veredicto en
`_research/_encargos/RESPUESTAS_FICHAS_FASE_4_LOTES_07_08.md`. De ahí sale el
encargo de la fila 1: quedan dos de las cuatro.

### Lo que cerró el 06/11/2026, por la tarde

~~`ENCARGO_FASE_3_LOTE_02.md`~~ y ~~`ENCARGO_FASE_5_LOTE_02.md`~~ **entraron las
dos**. Están montadas la mulga de Australia Occidental (ECO_ID 216) y el miombo
seco (ECO_ID 42), con lo que Australasia y el África tropical pasan de una ficha
a dos cada uno y el catálogo regional queda en 252.

Las dos entregas estuvieron bien hechas y a las dos hubo que corregirles cosas
que no se ven leyendo:

- **Tres decisiones de polígono, y dos de las correcciones son a los encargos que
  escribí yo.** El relevamiento del bajo Murchison, que mi encargo invitaba a
  usar, cae en el ECO_ID 205 y en el bioma mediterráneo: su 78 % de vegetación en
  buen estado no es una recuperación del 21 % del Murchison, es otro lugar. La
  meseta de Makonde, sobre la que la entrega de África construyó todo su párrafo
  de suelos, cae en el ECO_ID 28. Y el encargo de África afirmaba que el bioma de
  sabana hereda «huerta −10» cuando hereda «forestal −10».
- **Un error aritmético, y es el primero del circuito que sólo se detecta
  recalculando.** La entrega de África reprodujo bien la curva logística de
  biomasa del rodal y después la tabuló con las edades corridas: sus filas de 30,
  40 y 50 años traen los valores de 25, 30 y 35. Tres de cinco mal, y para el
  lado que hace ver el rebrote más lento de lo que el modelo publicado dice. Las
  fracciones que calculó son internamente consistentes con sus propios valores,
  así que el error está en las edades y no en la cuenta, lo que lo hace más
  difícil de ver.
- **Un cuarto tipo de 200 engañoso.** `pub.epsilon.slu.se` devuelve 200 con la
  portada del portal de investigación de la SLU para **cualquier** ruta. No es un
  404, no es un anti-bot, no es una página de error: es la home. Van cuatro
  variedades contando EUDASM, `thaiscience.info` y `sundarbanaffairswb.in`.

Y lo que salió de abrir las fuentes fue mejor que lo que las entregas trajeron: la
escalera completa de capacidades de carga del Murchison sistema por sistema —la
mejor tierra del relevamiento entero son 76 km²—, el dato de que el ganado
doméstico ejercía menos del 50 % de la presión de pastoreo total, y, para el
miombo, la regresión publicada que dice que **a escala regional la lluvia anual no
predice el estrato herbáceo y la pendiente ajustada es negativa**, que es
exactamente lo que la ficha del miombo húmedo sólo había podido citar de segunda
mano. Los veredictos están en
`_research/_encargos/RESPUESTAS_FICHAS_AUSTRALASIA.md` y
`_research/_encargos/RESPUESTAS_FICHAS_AFRICA_MIOMBO.md`.

### Lo que cerró el 05 y el 06/11/2026, antes

~~`ENCARGO_FASE_4_LOTES_04_06.md`~~ **entró entero**, que es la primera vez en
esta fase. Las tres fichas están montadas —manglar de Sundarbans (323), bosques
secos del Irrawaddy (294) y matorral espinoso del Decán (315)— y con ellas
entraron las cuatro prácticas fechadas que estaban detenidas esperándolas. Ninguna
de las tres se montó como vino: la cifra que contestaba la pregunta central del
lote llegó citada por una URL que devuelve la página de error de su propio sitio
con código 200. El veredicto está en
`_research/_encargos/RESPUESTAS_FICHAS_FASE_4_LOTES_04_05_06.md`.

~~`ENCARGO_FASE_6_LOTES_08_10.md`~~ **entraron 7 de 18**, y el motivo del rechazo
se movió: seis se cayeron por el polígono y no por la fuente.

~~`ENCARGO_FORRAJE_YP.md`~~ **cerrado, y en contra.** No hay relación publicada
que prediga `Yp` desde una propiedad del suelo; `Yp` se despeja de un corte de
pasto del predio. Un aviso que vale para el método: el lote 4 trajo cuatro
números atribuidos a un documento que abre y que **no los contiene**. Es la
primera falla del circuito que no se detecta abriendo la fuente sino leyéndola.
El veredicto está al final de `_research/_encargos/RESPUESTAS_FORRAJE.md`.

### Los dos que están arriba, con lo que traen adentro

Se escribieron el 06/11/2026 y son las dos filas de la tabla.

**`ENCARGO_FASE_4_LOTES_07_08.md` — las dos turberas.** El 286 es el pantano de
turba del Tonle Sap y el Mekong, con el arroz de recesión de las doce fincas que
publican su coordenada; el 280 es el de la costa sureste de Sumatra, con el sonor
de Perigi. Al escribirlo apareció un motivo mejor que el de destrabar las dos
prácticas: **en RESOLVE hay cuatro ecorregiones cuyo nombre dice «peat swamp
forests», las cuatro en Indomalaya, y acequia no tiene ficha de ninguna** —las
otras dos son el 221 de Borneo y el 264 de Malaca—. Y acequia **ya tiene módulo
de turba**, que detecta suelo orgánico en el punto y avisa que drenar no se
deshace; ese módulo se calibró contra las cuatro ecorregiones donde la turba
aparece de refilón, entre el 7 % y el 41 % del polígono, y no contra las dos que
son turba. Las preguntas del encargo salen de ahí: dónde hay turba y cuánta, qué
espesor —porque con el espesor y los 5 cm por año de hundimiento la cuenta de
cuántos años quedan se hace y acequia la puede imprimir—, y **si el `forestal
+20` del bioma sobrevive sobre una turbera**, que es la más filosa: ese +20 dice
que la vocación del predio es plantar árboles, en el único suelo del catálogo
donde plantar del modo habitual exige drenar. Más la tensión que hay que escribir
sin esquivarla: la única práctica fechada que tenemos adentro del 280 es quemar
turba, que es justo lo que la ficha va a advertir.

**`ENCARGO_FASE_6_REPESCA.md` — seis blancos con nombre.** Tres sólo necesitan
otra URL, con el artículo nombrado y las rutas muertas ya probadas: el
*soppinabetta* de Sringeri (la única copia cuelga del host cerrado del IISc), los
*devrai* de Kolavade (CC-BY, y Wiley, Hindawi y el espejo contestan anti-bot o
403 por las cuatro rutas probadas) y los suludnon de Jayobo (van tres intentos;
`ovcre.uplb.edu.ph` anti-bot, `journals.uplb.edu.ph` 403, y el tercero llegó con
ResearchGate). Dos piden el extremo correcto de un polígono: **Siulak y las
laderas del Gunung Kerinci** para el 305 —van tres lotes consecutivos proponiendo
el lago Toba o el extremo sureste del valle, que dan 279— y el **este de Wayanad**
—Pulpally, Sulthan Bathery— para el 270.

Y el sexto es nuevo, y sale de corregir el anterior: cuando la coordenada de
Kolavade mudó esa entrada del 253 al 254, **`ghats_norte_deciduo` se quedó sin
ninguna candidata**, así que el encargo pide una práctica del lado seco de la
cresta, al este de Paud. Si entran los seis, Indomalaya baja de **13 fichas sin
ninguna práctica a 8**, y una de las que cierra tiene dos candidatas distintas
apuntándole, así que con una que abra alcanza.

~~Los lotes 2 y 3 de Indomalaya~~ **volvieron el 03/11/2026 y están montados**:
son los ECO_ID 297 y 298, el Decán norte y el Decán sur. Las dos entregas tenían
los primarios bien leídos y las dos argumentaron la aptitud con la presión de
uso, así que cuatro de los siete modificadores no se montaron. El veredicto
entero está en `_research/_encargos/RESPUESTAS_FICHAS_INDOMALAYA_DECAN.md`.

---

## El de `Yp`, que ya cerró, en una frase

**`Y = Yp · T/Tp`**. La fracción `T/Tp` ya la calcula acequia con balance diario,
y `Yp` es cuánto produce el sitio cuando el agua no es lo que limita.

La primera vuelta de este encargo **ya se hizo y cerró dos cosas**. Una: la
columna alta de las fichas de sitio ecológico del NRCS, que era la mejor
candidata, **no es `Yp`** —lee 1,6 a 2,0 veces alto contra el único `Yp` con el
que se puede comparar, porque cuenta hierbas y arbustos, mide producción anual y
no pico de materia en pie, y encima la ficha nunca dice que esa columna sea de un
año favorable—. Dos, y mejor: **`Yp` se despeja**, con `Yp = Y·Tp/T`, y eso quedó
verificado contra la propia tabla del trabajo con un error del 0,02 %. Como el
despeje no arrastra la sequía de la temporada medida, alcanza **un corte de pasto
en el predio del usuario**.

Así que lo que se le pide ahora a GPT son **tres blancos con nombre**, no un
barrido: el trabajo de Wight y Black (1979) de donde salió el 1.300, la ficha del
sitio real de Sidney —que está en la MLRA 52, no en la que se relevó—, y la
relación entre rendimiento potencial y una propiedad de suelo, que sigue siendo
lo que más vale y ahora tiene con qué validarse. Si alguno no existe, que lo
diga: eso también cierra una pregunta.

---

## Lo que queda abierto y todavía no tiene encargo escrito

No pegarlos todavía; están acá para que no se pierdan.

- **Fase 1, licencias y vías.** Bloque A preguntas 4, 5 y 6; bloque B las cinco;
  bloque C los 81 saberes sin geometría.
- **Fase 2, los ocho números sin fuente.** Un lote entregado.
- **Fase 5, África después del 42.** Veintiséis ecorregiones en cola (65, 34, 66,
  64, 38, 48, 47, 40, 41, 53, 43, 62, 44, 52, 58, 63, 61, 51, 57, 55, 54, 50, 45,
  35, 49, 46) más la 37 y la 60, que van a `vacias`.
- **Fase 3, Australasia después del 216.** Nueve: 191, 207, 212, 215, 209, 210,
  211, 208, 214.
- **Fase 6, bloques 2 y 3.**
- **Fase 4, Indomalaya después de las cuatro turberas.** El hueco quedó medido el
  11/11/2026: de las 106 ecorregiones de Indomalaya, **42 tienen ficha**, y de las
  que heredan el bosque tropical húmedo quedan 68 sin ninguna entre Indomalaya y
  Australasia. El lote que más rinde de los que quedan es **Sulawesi y las
  Molucas** —156 y 157 (Sulawesi bajo y montano), 140 (Halmahera), 138 (Buru) y
  151 (Seram)—, porque son cinco fichas en cero sobre islas volcánicas con
  población rural y ahí el `huerta −25` del bioma, escrito sobre el oxisol
  amazónico, es el que miente más. Después de eso quedan Borneo 219 y 220 y
  Palawan 262, que son el caso opuesto y hay que escribirlos como tales.
- **Australasia sigue casi en cero: 2 fichas de 83.** Es el hueco más grande del
  catálogo después de Afrotropic (8 de 116).

---

## Cuando algo cae en `entregas\`

```bash
node _research/validar-entrega-gpt.mjs "C:/Arte y Tierra/encargos-gpt/entregas/yp"
```

Chequea la forma —campos obligatorios, URLs, ids repetidos, ids que no existen
en el catálogo— y abre **una de cada diez** para leer la fuente. Si una no
aguanta vuelve el lote entero, porque el problema es el método y no la entrada.
Lo que GPT entrega nunca se commitea tal cual.
