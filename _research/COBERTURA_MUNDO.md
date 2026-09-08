# Cobertura del resto del mundo, medida

*07/09/2026. Los números salen de cruzar los mapas `ECO_ID_*` de
`apps/terreno/lib/ecorregiones*.ts` contra
`_research/resolve-eco-id-bioma-2026-09-07.json`, que son las 847 ecorregiones
de RESOLVE con su bioma y su reino.*

## Lo que cambió de diagnóstico

El plan decía "seguir el mismo barrido de aptitud heredada por África
subsahariana, Asia y Oceanía". **Ese barrido no se puede hacer, porque ahí no
hay fichas que auditar.** El método anterior consistía en encontrar dónde una
ficha regional heredaba mal del bioma global; en esas regiones no hay ficha
regional. Lo que el usuario recibe es, directamente, el bioma global.

## Cobertura por reino biogeográfico

| Reino | Con ficha | Total |
|---|---|---|
| Neotropic | 174 | 179 |
| Nearctic | 114 | 115 |
| Palearctic | 94 | 205 |
| Oceania | 6 | 24 |
| Afrotropic | 7 | 116 |
| Indomalayan | 1 | 106 |
| Australasia | 0 | 83 |
| Antarctica | 0 | 18 |
| **Total** | **396** | **847** |

América está prácticamente cerrada. El Paleártico está por la mitad: lo cubierto
es Europa, Medio Oriente y el norte de África, y lo que falta es Asia —Siberia,
Asia central, China, Japón, Corea—. Indomalaya, Australasia y África tropical
están en cero o casi.

## Dónde pega esa ausencia

Las 451 ecorregiones sin ficha, agrupadas por el bioma global que habla por
ellas:

| Sin ficha | Bioma global | Reinos |
|---|---|---|
| 150 | Bosque tropical y subtropical húmedo | Indomalaya 72, Afrotrópico 30, Australasia 28, Oceanía 15 |
| 48 | Desierto y matorral xerófilo | Afrotrópico 16, Paleártico 16, Australasia 10 |
| 42 | Sabana y pastizal tropical | Afrotrópico 31, Australasia 9 |
| 36 | Bosque templado caducifolio y mixto | Paleártico 19, Australasia 14 |
| 34 | Pastizal y matorral montano | Paleártico 19, Afrotrópico 11 |
| 32 | Tundra | Antártida 18, Paleártico 13 |
| 22 | Bosque tropical y subtropical seco | Indomalaya 12, Australasia 4 |
| 19 | Pastizal templado | Paleártico 14, Australasia 3 |

El resto suma menos de 60 entre siete biomas.

## La prioridad, y por qué es una sola

**El bosque tropical húmedo.** No sólo es el bloque más grande: es donde el
modificador global dice algo que es falso justo en la mitad de las ecorregiones
que dependen de él. `huerta -25` está escrito sobre el oxisol amazónico —"la
fertilidad está en la biomasa viva, no en el suelo"— y eso es cierto en la
Amazonia y en la cuenca del Congo. No lo es en Java, Bali, Luzón ni en buena
parte de Nueva Guinea, que se sostienen sobre andisoles volcánicos jóvenes: los
suelos más fértiles del planeta, con las densidades rurales más altas del mundo
y horticultura continua desde hace siglos.

Son **216 ecorregiones las que heredan ese `huerta -25` sin pisarlo**, y 145 de
ellas no tienen ninguna ficha que pueda matizarlo. La razón ya quedó acotada
para que no afirme como universal lo que no lo es, pero el número sigue siendo
el mismo para el oxisol y para el andisol. **Eso sólo se arregla con fichas
regionales**, no con otro ajuste al bioma global: la distinción es geográfica,
y el bioma global no tiene forma de expresarla.

Encargo, en orden:

1. **Sudeste asiático volcánico** (Java, Bali, Sumatra, Luzón, Mindanao). Es el
   caso donde el error es más grande y donde hay más gente.
2. **África tropical húmeda** (cuenca del Congo, Guinea, franja costera). Acá el
   modificador global sí acierta; la ficha suma por especies, saberes y suelos,
   no por corregir aptitud.
3. **Sabana africana**, 31 ecorregiones. El `pasturas +20` global es correcto
   —la sabana africana es el arquetipo del bioma—, así que otra vez es
   profundidad y no corrección.
4. **Australasia**, 83 ecorregiones en cero, con un problema propio: los
   rangelands áridos australianos heredan `pasturas -15` del desierto global, y
   son una de las industrias ganaderas extensivas más grandes del mundo.
5. **Asia paleártica**, 111 ecorregiones. Incluye la estepa kazaja y mongola,
   que hereda `huerta +10` del pastizal templado: el mismo error que ya se
   corrigió tres veces (badia siria, meseta de Anatolia, pradera de pastos
   cortos), y acá sin ficha que lo pise.

## Lo que sí se corrigió ahora

- **Pradera de pastos cortos** (High Plains, Nearctic). Heredaba `huerta +10`
  del pastizal templado y la ficha se contradecía sola: dice "Aridisoles con
  baja reserva de agua" y no lista un solo cultivo de huerta. La huerta que
  existe se riega con el Ogallala, que se extrae muy por encima de su recarga.
  Es literalmente el mismo caso que Konya, corregido la semana pasada.
- **La razón de `huerta` del bosque tropical húmedo global**, acotada a los
  suelos lixiviados que efectivamente dominan el bioma, nombrando la excepción
  volcánica. El delta no se tocó: cambiarlo sin ficha regional rompería la
  Amazonia para arreglar Java.

## Lo que se decidió no tocar

- **Pradera mixta** y **grandes llanuras de pradera alta y mixta**. Son fichas
  de gradiente: el este es mollisol profundo y el oeste es semiárido. Un
  modificador único mentiría en una de las dos mitades, igual que en las cuencas
  endorreicas de Irán. Es problema de texto, no de herencia.
- **Las 18 ecorregiones antárticas**, que RESOLVE clasifica como tundra y por
  eso heredan `huerta -35`, `forestal -35`, `reserva +25`. La dirección es
  correcta aunque la clase sea discutible, y reclasificar RESOLVE no es tarea de
  esta app.
