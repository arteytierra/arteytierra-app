# Cobertura real de RESOLVE, medida por envolvente — 04/09/2026

Continuación de `AUDITORIA_PUNTOS_AMERICA.md`. Aquella auditoría probó 85 puntos
reales y encontró que el hueco de América era Canadá. Este documento cambia el
método por uno que no depende de qué puntos se me ocurran: en vez de preguntar
"¿qué devuelve el resolutor acá?", le pregunta al FeatureServer de RESOLVE
**todas** las ecorregiones cuya geometría interseca una caja, y resta las que ya
tienen ficha.

La diferencia importa. Los 85 puntos encontraron 10 ECO_ID sin ficha en Canadá;
la envolvente encontró 22. Los doce que faltaban no eran menos importantes: eran
los que a mí no se me ocurrió tocar.

**Regla que queda:** una lista de pendientes armada a mano —de puntos o de
ECO_ID— mide la imaginación de quien la armó. La enumeración mide el mapa.

## América — cerrada

Envolventes consultadas: Canadá y el Ártico, Alaska y Yukón, Estados Unidos
contiguo, México, Centroamérica, Caribe.

Al empezar faltaban 22 ECO_ID, todos del norte: Canadá y Groenlandia. México,
Centroamérica y el Caribe daban 0. Quedaron cubiertos con diez fichas nuevas en
`lib/biomasRegionalesCanada.ts` y su tabla en `lib/ecorregionesCanada.ts`.

| Ficha | ECO_ID |
| --- | --- |
| Tierras bajas del golfo de San Lorenzo | 335 |
| Interior de Columbia Británica y piedemonte de Alberta | 345, 350, 355 |
| Bosque seco del Okanagan | 362 |
| Bosque hipermarítimo de Haida Gwaii | 365 |
| Bosque boreal cerrado del escudo canadiense | 370, 373, 377 |
| Taiga abierta con permafrost | 374, 378, 379, 381, 382, 383 |
| Desierto polar del Alto Ártico | 412 |
| Tundra ártica canadiense | 413, 414 |
| Montaña ártica: Baffin oriental y Torngat | 415, 421 |
| Kalaallit Nunaat: la franja libre de hielo de Groenlandia | 417, 418 |

Reejecutadas las seis envolventes después del cambio, no queda ninguna sin
ficha salvo dos que están bien así:

- **ECO_ID 0** — roca y hielo. No lleva ficha regional a propósito: se resuelve
  al bioma 98 de RESOLVE, que es la respuesta correcta en cualquier continente.
- **ECO_ID 772, Chukchi Peninsula tundra** — es Palearctic, Siberia. Entra en la
  caja de Alaska por vecindad, no por pertenecer a América.

Los agrupamientos no siguen el número de ECO_ID sino cómo se comportan el suelo
y el agua: el escudo cerrado va aparte de la taiga abierta con permafrost, el
desierto polar aparte de la tundra arbustiva, y la montaña ártica aparte de las
dos. La única con agricultura de campo abierto es la del golfo de San Lorenzo
—la papa de la Isla del Príncipe Eduardo sobre podzoles rojos erosionables—, y
la de más valor por hectárea es el Okanagan, donde el límite no es el suelo sino
la asignación de agua de riego.

## Europa — cerrada, con el alcance escrito

**Actualización 04/09/2026.** El primer barrido dio 26 faltantes con seis cajas
que llegaban hasta Grecia. Ampliar el alcance a la Unión Europea y sus
asociados obligó a rehacer las cajas, y ahí el número volvió a moverse: **34**.

### Qué cuenta como Europa

Es una decisión, no un dato, así que queda escrita. Entran los 27 de la UE, el
EEE y la AELC (Noruega, Islandia, Suiza, Liechtenstein), el Reino Unido, y los
países candidatos: Albania, Bosnia y Herzegovina, Kosovo, Montenegro, Macedonia
del Norte, Serbia, Moldavia, Ucrania, Georgia y Turquía.

Con ese corte hubo que cambiar el método de consulta. Un rectángulo sobre
Turquía se come Siria, Irak, Irán y Azerbaiyán; uno sobre el Cáucaso se come
Armenia y Rusia. Para esos tres casos —Turquía, Georgia, Ucrania y Moldavia— la
caja pasó a ser un polígono que sigue la frontera a grandes rasgos. No pretende
ser exacto: pretende no invitar a nadie que no esté en la lista.

### Los 34, y las 28 fichas que los cubren

| Región | ECO_ID | Fichas |
| --- | --- | --- |
| Italia | 675, 644, 802, 795, 806 | llanura del Po · montaña apenínica · Mediterráneo tirreno-adriático e insular |
| Balcanes y Adriático | 660, 794, 646, 678, 801 | karst dinárico · bosque ilirio · mixto balcánico · montaña Ródope-Pindo |
| Europa central y báltica | 647, 679, 692 | morrena báltica · sarmático · Cárpatos |
| Estepa póntica y mar Negro | 735, 661, 658, 665, 650, 812 | chernozem póntico · estepa forestal · Crimea · euxino-cólquico · Cáucaso mixto · semidesierto del Kura |
| Escandinavia e Islandia | 708, 780, 711 | conífera costera · abedular montano · Islandia |
| Egeo, Creta y Chipre | 785, 789, 790, 791 | esclerófilo egeo · Creta · Troodos · Mediterráneo oriental |
| Anatolia | 786, 804, 703, 652, 725, 662, 727, 688 | Tauro · norte de Anatolia · meseta central · Anatolia oriental · Zagros |

Están en `lib/ecorregionesEuropaUE.ts` y `lib/biomasRegionalesEuropaUE.ts`, los
dos escritos a mano. Reejecutadas las trece envolventes, **0 sin ficha**.

De los 15 que el paquete de Europa occidental había anotado como "fuera de
alcance", 11 estaban acá; los otros cuatro (729, 745, 833, 839) caen fuera del
alcance definido arriba. Y **19 de los 34 no estaban en ninguna lista**: el
bloque anatolio entero, el caucásico, Chipre, Islandia y Crimea.

### Lo que queda afuera a propósito

Esto importa tanto como lo que entra: si no está escrito, el próximo barrido lo
lee como olvido. Todos están declarados en `ESPERADOS`, dentro del script.

- **Norte de África** — 701 Atlas, 797 Libia y Egipto, 798 Magreb, 833 estepa
  norsahariana, 839 desierto atlántico sahariano. Entran por el borde sur de
  las cajas ibérica y mediterránea y por el borde este de la de las islas
  atlánticas, no por pisar territorio europeo.
- **Rusia** — 774 tundra de Kola, 778 desierto ártico ruso. Verificado por
  punto: la de Kola no entra ni en la Laponia finlandesa ni en Finnmark, que
  resuelven a 780 y a 717.
- **Svalbard y Jan Mayen**, que son Noruega pero que RESOLVE directamente no
  cubre: la consulta por punto no devuelve ninguna ecorregión. Es un hueco real
  del dato de origen, no del catálogo.
- **Armenia y Azerbaiyán**, cuyo vínculo con la UE es de otro tipo. El 812 entra
  igual, pero por Georgia: es el semidesierto del Kura en Kajetia.
- **Islas del mar de Scotia** (129), reino Antártico, que entraban por el
  vértice sudeste de la caja sudamericana.

Macaronesia ya estaba cubierta por el paquete de Europa: Azores (645), Madeira
(668), Canarias (787) y el matorral de argán (796) resuelven a `macaronesia`.

### Estado

| Región | Cajas | Sin ficha |
| --- | --- | --- |
| América | 6 | 0 |
| Europa y asociados | 13 | 0 |
| Sudamérica | 1 | 0 |

Falta África, Asia y Oceanía, que no tienen cajas todavía. Agregarlas es
escribir una entrada en `REGIONES`.
