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

## Europa — el hueco es más grande de lo que decía la lista

Envolventes consultadas: Iberia y Francia, Italia y Alpes orientales, Alemania y
Europa central, Escandinavia y el Báltico, Islas Británicas, Balcanes y Grecia.

**Faltan 26 ECO_ID.** El paquete de Europa occidental había dejado anotados 15
"fuera de alcance"; de esos, sólo 11 aparecen acá, y hay **15 que no estaban en
ninguna lista**. Los otros cuatro de aquella lista (729, 745, 833, 839) caen
fuera de estas cajas: son de más al este.

### Los 26, por región

| Región | ECO_ID |
| --- | --- |
| Italia y Apeninos | 644 Appenine deciduous montane, 675 Po Basin mixed, 795 Italian sclerophyllous, 802 South Apennine montane, 806 Tyrrhenian-Adriatic |
| Balcanes y Adriático | 646 Balkan mixed, 660 Dinaric Mountains, 678 Rodope montane, 794 Illyrian deciduous, 801 Pindus Mountains |
| Europa central y báltica | 647 Baltic mixed, 679 Sarmatic mixed, 692 Carpathian montane |
| Estepa póntica y mar Negro | 661 East European forest steppe, 665 Euxine-Colchic broadleaf, 735 Pontic steppe |
| Escandinavia y Ártico europeo | 708 Scandinavian coastal conifer, 774 Kola Peninsula tundra, 780 Scandinavian Montane Birch |
| Mediterráneo sin país asignado | 701 Mediterranean conifer and mixed, 797 Mediterranean dry woodlands and steppe, 798 Mediterranean woodlands and forests |
| Egeo, Creta y Anatolia | 785 Aegean and Western Turkey, 786 Anatolian conifer and deciduous, 789 Crete Mediterranean, 804 Southern Anatolian montane |

Las Islas Británicas dan 0: es la única parte de Europa que el paquete cerró de
verdad.

### Lo que esto cambia del plan

1. **El orden por superficie útil ya no es Italia → Alemania → Escandinavia.**
   Los Balcanes y el Adriático son cinco ecorregiones que no estaban ni
   anotadas, y ahí hay agricultura de ladera, karst y trashumancia con mucho
   para decir. El bloque italiano sigue primero por valor agrícola —la llanura
   del Po es la más productiva del sur de Europa—, pero el segundo debería ser
   Balcanes, no Alemania.
2. **Hay que decidir hasta dónde llega "Europa".** Cuatro de los 26 son
   Anatolia y el Egeo turco, y tres más son la estepa póntica y el Cáucaso
   colchic. Son ecorregiones europeas por bioma y no siempre por pasaporte. Si
   entran, el relevamiento crece; si no, hay que dejar dicho en el archivo que
   quedan afuera a propósito, para que el próximo barrido no las cuente como
   olvido.
3. **Tres del Mediterráneo (701, 797, 798) no tienen país claro en la
   consulta**: son polígonos que RESOLVE reparte entre varias orillas. Antes de
   escribir ficha hay que ver dónde pegan de verdad, por punto.
4. **El cierre se verifica con este mismo script, no con la palabra del
   paquete.** Ninguna entrega de Europa debería darse por cerrada sin volver a
   correr las seis envolventes y ver 0.
