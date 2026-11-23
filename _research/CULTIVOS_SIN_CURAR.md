# Las tres listas de cultivos que faltaban

`apps/terreno/lib/sinCultivos.ts` nació el 22/11/2026 con 29 fichas que no
declaran cultivos, y con el motivo de cada una. Veintiséis de esas fichas no
los declaran porque no corresponde —manglares, desierto polar, costra salina—
o porque el sistema productivo documentado es otro. Las otras **tres eran el
pendiente de verdad**: hay agricultura documentada y la ficha todavía no decía
cuál. El archivo se escribió para que esa lista fuera el inventario.

Este documento es de dónde salió cada una de las tres, y qué quedó afuera.

| Ficha | ECO_ID | Dónde |
|---|---|---|
| `decan_norte_sal` | 297 | Odisha, Chhattisgarh, Jharkhand |
| `decan_sur_elefantes` | 298 | Karnataka, Tamil Nadu |
| `galapagos_matorral_xerico` | — | zona agrícola de las islas pobladas |

## De dónde salen los números de la India

Los **planes de contingencia agrícola de distrito** del ICAR-CRIDA, que el
gobierno de la India publica distrito por distrito con el mismo formulario. La
sección 1.4 trae los suelos mayores con su superficie, la 1.5 la intensidad de
cultivo, la 1.6 el área regada y la de secano, y la 1.7 el área bajo cada
cultivo con el año de la estadística.

Sirven acá por tres razones:

1. Son área sembrada medida, no una lista de lo que se podría plantar.
2. Separan **regadío de secano**, que es la variable que decide si un cultivo
   le sirve a un predio sin riego, y acequia distingue las dos cosas.
3. Dan los suelos del distrito con su nombre vernáculo, así que la estadística
   agrícola y el zonal de SoilGrids se pueden contrastar sobre el mismo
   territorio.

Son de 2008 a 2014 según el distrito, y eso se dice: el reparto relativo entre
cultivos cambia despacio, pero las superficies absolutas no son de hoy.

| Distrito | Ecorregión | Documento |
|---|---|---|
| Kondagaon (Chhattisgarh) | 297, meseta de Bastar | [CHH24, 30.08.2014](https://icar-crida.res.in/CP/Chattisgarh/CHH24-Kondagaon-30.08.2014.pdf) |
| Sundargarh (Odisha) | 297, borde norte | [Orissa 9, 31.05.2011](https://www.icar-crida.res.in/CP/Orissa/OUAT,%20Bhubaneswar/Orissa%209-%20Sundargarh%2031.05.2011.pdf) |
| Chamarajanagar (Karnataka) | 298, Bandipur y BRT | [KAR18, 31.03.2011](https://icar-crida.res.in/CP/Karnataka/GKVK,%20Bangalore/KAR18-CHAMARAJANAGAR%2031.03.2011.pdf) |

## 297 — `decan_norte_sal`

Superficie sembrada, en miles de hectáreas:

| | Kondagaon (2013) | Sundargarh (2009-10) |
|---|---|---|
| Arroz | 99,8 | 213,0 (54,0 con riego) |
| Poroto urad (*blackgram*) | 7,6 | 16,9 |
| Maíz | 13,1 | 7,6 |
| Poroto mung (*greengram*) | 0,1 | 6,9 |
| Guandul (*arhar*) | 0,7 | 5,3 |
| Maní | — | 5,3 |
| *Horsegram* | 4,4 | — |
| Garbanzo | 0,4 | — |
| Sésamo | — | 0,6 |
| Mijos (kodo-kutki) | 1,2 | — |
| Trigo | 0,1 | 2,6 |
| Hortalizas, todas | 3,6 | — |
| Batata | — | 3,4 |
| Chile | — | 3,4 |
| Cebolla | — | 1,5 |
| Papa | 0,1 | 0,6 |
| Banano | 0,03 | 1,6 |
| Mango | 0,25 | 6,8 |

El arroz es tres cuartas partes de la superficie sembrada, y es **de secano**:
en Kondagaon el área regada son 4,8 de 137,2 mil ha, el 3,5 %, con una
intensidad de cultivo del 104 % —un cultivo por año y casi nada más—. En
Sundargarh el riego llega al 24 % y la intensidad sube a 129 %. Esa diferencia
pesa más que la lista.

La lista que quedó en la ficha:

```
arroz, maiz_tropical, guandul, mani, sesamo, garbanzo,
batata, chile_seco, cebolla, papa, platano, vetiver
```

## 298 — `decan_sur_elefantes`

Chamarajanagar, el distrito de Bandipur y de BRT, en miles de hectáreas
(2008-09), con el regadío separado:

| Cultivo | Regadío | Secano |
|---|---|---|
| Maíz | 7,9 | 55,0 |
| Legumbres de grano | 0,2 | 41,7 |
| Arroz | 18,0 | 36,2 |
| *Ragi*, mijo dedo | 0,0 | 20,0 |
| Maní | 0,2 | 19,9 |
| Caña de azúcar | 9,6 | 19,3 |
| *Jowar*, sorgo | — | 17,9 |
| Girasol | 1,0 | 17,3 |
| Algodón | 0,5 | 1,1 |
| Banano | 8,5 (total) | |
| Cebolla | 4,3 (total) | |
| Chile verde | 1,0 (total) | |

Acá el riego pesa: 67,6 de 191,8 mil ha netas sembradas, con el **57 % de esa
superficie regada desde pozos profundos** y el 21,7 % de los bloques del
distrito clasificados como sobreexplotados en agua subterránea. Un predio que
proyecte caña o banano sobre pozo está entrando en esa cuenta, y la ficha lo
dice.

La lista que quedó en la ficha:

```
maiz_tropical, arroz, sorgo, mani, cana_azucar, girasol, algodon,
guandul, caupi, platano, cebolla, chile_seco, vetiver
```

## Galápagos — `galapagos_matorral_xerico`

Acá la fuente es el **MAG-SIPA del Ecuador**, que publica un boletín zonal
mensual de Galápagos con el levantamiento INEC–MAG–CGREG 2014 comparado contra
el III Censo Agropecuario de 2000. Superficie sembrada, en hectáreas:

| Cultivo | 2000 | 2014 |
|---|---|---|
| Café | 1.669 | 723 |
| Maíz | 70 | 105 |
| Otros bananos | 139 | 98 |
| Yuca | 34 | 74 |
| Plátano | 78 | 72 |

Son **1.072 ha sembradas** sobre una zona agrícola de 19.010 ha, que a su vez
es el 2,38 % del territorio insular. El café cayó un 16 % entre los dos
relevamientos y el maíz y la yuca subieron.

Tres cosas del mismo boletín que cambian cómo se lee la lista:

- **Las dos estaciones están al revés de lo que uno supondría.** La época
  lluviosa y fría va de junio a noviembre y es cuando se hacen las hortalizas;
  la seca y cálida va de diciembre a mayo y es la de los frutales de temporada.
  Es la garúa de la zona alta, que es donde está la agricultura.
- **El límite es el agua, y después la piedra.** «Las fuentes de agua dependen
  de las lluvias para recargar acuíferos, grietas, pozos y reservorios», y «el
  exceso de rocas en el suelo impide la mecanización». Las dos frases son del
  boletín y coinciden con lo que la ficha ya decía.
- **Hay producción local suficiente como para restringir importaciones.** En
  julio de 2020 el Consejo de Gobierno del Régimen Especial de Galápagos
  resolvió restringir el ingreso a la provincia de tomate riñón y de café en
  grano seco, tostado y molido, por la alta oferta local.

La lista que quedó en la ficha:

```
cafe, platano, yuca, maiz_tropical
```

**Cuatro, y sin `vetiver`.** Todas las demás fichas de este catálogo llevan
vetiver como especie de servicio para barreras vivas y control de erosión. Acá
no: es un pasto introducido, y en una ficha cuyo delta de frutales es −25
porque las frutales introducidas son hoy las invasoras que más territorio ganan
en las islas, agregar una gramínea exótica a la lista sería contradecir en un
campo lo que el otro campo advierte.

Fuente: [MAG-SIPA, boletín zonal Galápagos, marzo
2021](https://sipa.agricultura.gob.ec/boletines/territoriales/agricola-integral/2021/galapagos/boletin_zonal_galapagos_marzo_2021.pdf).

## Lo que no entró, y por qué

Cinco cultivos que están entre los primeros por superficie **no existen en
`lib/especies.ts`**, así que no se pudieron declarar:

| Cultivo | Dónde pesa | Nota |
|---|---|---|
| *Ragi*, mijo dedo (*Eleusine coracana*) | 20.000 ha en Chamarajanagar: el cuarto cultivo del distrito | ya estaba en el pendiente de los cinco cultivos |
| Poroto urad (*Vigna mungo*) | 16.900 ha en Sundargarh: el segundo | ya estaba en el pendiente |
| Poroto mung (*Vigna radiata*) | 6.900 ha en Sundargarh | — |
| *Horsegram* (*Macrotyloma uniflorum*) | 4.400 ha en Kondagaon | — |
| Kodo y kutki (*Paspalum scrobiculatum*, *Panicum sumatrense*) | 14.300 ha en la meseta de Bastar | — |

**`mijo` no los cubre.** En el catálogo `mijo` es *Pennisetum glaucum*, el mijo
perla, calibrado con 350 mm de agua y clases climáticas BSh, BWh y Aw: es el
cereal de las lluvias cortas. El kodo-kutki del Bastar y el ragi del sur son
otras especies, con otro ciclo y otra demanda, en ecorregiones de 1.400 mm.
Ponerle `mijo` a esas superficies sería exactamente la clase de número
plausible y equivocado que el contrato de cálculo prohíbe, así que quedan como
hueco declarado.

Tampoco entraron el mango —6.800 ha en Sundargarh, el frutal de la región— ni
el anacardo ni el *nigerseed*, y en Galápagos ni la papaya ni la piña, que el
boletín monitorea en precios pero no en superficie.

## El contraste con el zonal de suelos

Los tres planes de la India traen los suelos del distrito, y eso se cruza con
el resumen zonal de SoilGrids del mismo polígono:

- **Kondagaon** nombra cinco suelos mayores de la meseta de Bastar y el cuarto
  es, textualmente, *Vertisols (Kanhar-clayey)*. No le pone superficie.
- **Sundargarh** sí la pone: suelo rojo 26,5 %, franco arenoso 17,0 %, **suelo
  negro 3,3 %**, arenoso 8,4 %, y pardo forestal y laterita 44,8 %.
- **Chamarajanagar** pone **suelos negros medios en el 16,0 %**, rojo franco
  14,2 % y rojo franco arenoso 4,8 %. Esas tres filas suman el 35 % del
  distrito y el resto queda sin clasificar, que es la mitad del distrito bajo
  bosque: renormalizado sobre lo que sí clasificó, el negro es el 46 %.

Las dos fichas afirmaban que el vertisol negro «no se hereda» acá. El zonal
medido dice 32,5 % de Vertisols en el 297 y 42,4 % en el 298. La afirmación
no se sostiene, y el detalle está en
`_research/fuentes-suelo-clima/global/soilgrids-zonal-por-poligono.md`.
