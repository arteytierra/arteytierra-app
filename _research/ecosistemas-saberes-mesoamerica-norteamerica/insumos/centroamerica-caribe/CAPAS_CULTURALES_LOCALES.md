# Capas culturales locales

Estas entradas complementan las fichas ecológicas. No son nuevas ecorregiones: son contextos culturales que deben activarse únicamente cuando el predio cumple las condiciones territoriales indicadas.

## 1. Milpa maya / Ich Kool

- **Ficha base:** `selva_maya_peten_yucatan`
- **Pueblos/autoría:** pueblos mayas de la península de Yucatán; para Guatemala y Belice validar la comunidad y denominación local.
- **Regla mínima:** `country_code == MX` y polígono de la península de Yucatán. Para `GT` o `BZ`, no reutilizar el nombre Ich Kool automáticamente.
- **Mostrar:** policultivo de maíz, frijoles, calabazas y especies locales; solares, meliponicultura, selección de semillas, lectura de suelos y nubes, y sucesión bosque–acahual–milpa.
- **Advertencia:** no presentar roza-quema como instrucción aislada. La fuente FAO destaca que el ciclo depende del descanso y del conocimiento local.
- **Fuente:** [FAO — Ich Kool, milpa maya](https://www.fao.org/giahs/giahs-around-the-world/mexico-ich-kool-mayan-milpa-system/en)

## 2. Bosques comunales y milpa K’iche’/Mam

- **Ficha base:** `montanas_mayas_pino_encino`
- **Pueblos/autoría:** comunidades Maya K’iche’ y Mam.
- **Regla mínima:** `country_code == GT` y departamentos/municipios cubiertos por la investigación original; hasta cargar esa capa, usar solo a nivel editorial.
- **Mostrar:** diversidad de la milpa, árboles útiles, semillas locales, restauración y reglas comunales de bosque. Reconocer el rol de mujeres en la custodia de semillas y plantas.
- **No mostrar:** lugares ceremoniales, detalles de plantas medicinales ni la idea de una única práctica “maya”.
- **Fuentes:** [CATIE — milpa K’iche’](https://repositorio.catie.ac.cr/handle/11554/9716) y [CATIE — restauración con conocimientos Mam y K’iche’](https://repositorio.catie.ac.cr/handle/11554/12692)

## 3. Quesungual

- **Ficha base:** `corredor_seco_centroamericano`
- **Autoría territorial:** campesinado del occidente de Honduras, especialmente Lempira.
- **Regla mínima:** `country_code == HN`, `admin1` o polígono de la zona Quesungual. No activarlo en todo el ECO_ID 527.
- **Mostrar:** retención y poda de árboles/arbustos, siembra de maíz-frijol-sorgo, cobertura con residuos y abandono de la quema; mejora de infiltración, humedad y control de erosión.
- **Advertencia:** no convertir distancias, densidades o podas en receta sin diagnóstico de pendiente, suelo y árbol.
- **Fuente:** [FAO — Quesungual](https://www.fao.org/4/Y5030E/y5030e19.htm)

## 4. Kuxur Rum

- **Ficha base:** `corredor_seco_centroamericano`
- **Pueblos/autoría:** comunidades Ch’orti’ del corredor seco de Guatemala.
- **Regla mínima:** `country_code == GT` y municipios Ch’orti’ documentados.
- **Mostrar:** madre cacao o madreado (`Gliricidia sepium`) con granos básicos, poda, biomasa sobre el suelo, no quema y conservación de humedad.
- **Advertencia:** conservar el nombre local y no fusionarlo con Quesungual aunque compartan principios.
- **Fuente:** [FAO Guatemala — Kuxur Rum](https://www.fao.org/guatemala/detalle/historia-de-inter%C3%A9s-humano/detail/combatir-la-sequ%C3%ADa-con-t%C3%A9cnicas-ancestrales/es)

## 5. Conocimiento Mayangna de BOSAWAS

- **Ficha base:** `bosque_atlantico_mosquitia` y, con validación espacial, `sabanas_pino_belice_mosquitia`.
- **Pueblos/autoría:** pueblo Mayangna de Nicaragua.
- **Regla mínima:** `country_code == NI` y territorio Mayangna dentro de BOSAWAS.
- **Mostrar:** categorías propias de clasificación de flora/fauna y conocimientos sobre hábitat, reproducción, migración y aprovechamiento sostenible de peces y tortugas.
- **No mostrar:** puntos de captura, lugares sagrados o conocimientos restringidos. La fuente fue construida con participación y consentimiento; la app debe mantener la atribución.
- **Fuente:** [UNESCO — transmisión del conocimiento Mayangna](https://ich.unesco.org/en/project-education/reinforcing-the-transmission-of-mayangna-knowledge-and-culture-in-the-classroom-00493)

## 6. Cacao Bribri y Cabécar

- **Ficha base:** `talamanca_caribe_sur`
- **Pueblos/autoría:** pueblos Bribri y Cabécar de Costa Rica y áreas transfronterizas documentadas.
- **Regla mínima:** territorios indígenas o fincas de Talamanca incluidos en las fuentes; como mínimo `country_code == CR` y cantones/territorios relevantes.
- **Mostrar:** cacaotales diversos de dos a tres estratos; laurel, Inga, cítricos, musáceas, palmas, parches y galerías de bosque; usos múltiples de plantas.
- **Advertencia:** las 283 especies registradas en el estudio no son una lista universal ni una receta para todas las fincas.
- **Fuentes:** [CATIE — cacaotales Bribri y Cabécar](https://repositorio.catie.ac.cr/handle/11554/6038) y [CATIE — plantas útiles](https://repositorio.catie.ac.cr/handle/11554/6675)

## 7. Agricultura nainu Guna

- **Ficha base:** `darien_humedo_panama`
- **Pueblos/autoría:** pueblo Guna de Panamá.
- **Regla mínima:** `country_code == PA` y comarca/comunidad Guna documentada.
- **Mostrar:** parcelas manejadas dentro del bosque, huertos familiares, cultivos ribereños, frutales en bordes y recolección; la diversidad espacial reduce riesgo y mantiene cobertura.
- **No mostrar:** localización de sitios sagrados ni conocimiento ceremonial.
- **Fuente:** [FAO — agricultura nainu](https://www.fao.org/fileadmin/templates/esw/esw_new/documents/SARD/good_practices_Latin_America/13_Nainu_agriculture_Panama1.pdf)

## 8. Viñales y conuco cubano

- **Ficha base:** `cuba_bosques_karst_y_pinares`
- **Autoría territorial:** familias campesinas de Viñales; conuco familiar documentado en Cuba oriental como entrada separada.
- **Regla mínima Viñales:** polígono del Paisaje Cultural Valle de Viñales, Pinar del Río. **No** activar por ECO_ID 459 completo.
- **Mostrar Viñales:** pequeñas fincas, tabaco y métodos agrícolas tradicionales integrados al paisaje de mogotes.
- **Mostrar conuco:** huerto multiestrato con alimentos, frutales, sombra y plantas de uso familiar; aclarar que composición y función varían entre hogares.
- **Fuentes:** [UNESCO — Valle de Viñales](https://whc.unesco.org/en/list/840/) y [FAO — conuco cubano](https://www.fao.org/4/w8801e/w8801e03.htm)

## 9. Cockpit Country Maroon

- **Ficha base:** `jamaica_bosque_humedo_karstico`
- **Pueblos/autoría:** Maroons de Sotavento de Jamaica.
- **Regla mínima:** polígono oficial de Cockpit Country Protected Area y validación cultural.
- **Mostrar:** relación histórica con senderos y paisaje kárstico; conocimiento intergeneracional de plantas nativas y endémicas.
- **No mostrar:** Peace Cave, Kindah tree u otros sitios como coordenadas; tampoco recetas medicinales.
- **Fuente:** [UNESCO — Cockpit Country Protected Area](https://whc.unesco.org/en/tentativelists/6822/)

## 10. Agroforestería Kalinago de Dominica

- **Ficha base:** `antillas_menores_bosques_humedos_secos`
- **Pueblos/autoría:** pueblo Kalinago de Dominica.
- **Regla mínima:** `country_code == DM`, preferentemente polígono de Kalinago Territory.
- **Mostrar:** sistemas multiestrato con coco/cítricos, musáceas, café/cacao y raíces; cortavientos, cercas vivas, fibras y materiales forestales.
- **Advertencia:** no extender esta descripción a Guadalupe, Martinica, Santa Lucía u otras Antillas por compartir ECO_ID.
- **Fuentes:** [FAO — agroforestería de Dominica](https://www.fao.org/4/x5656e/x5656e05.htm) y [FAO — conocimiento forestal Kalinago](https://www.fao.org/4/x6689e/X6689E13.htm)

## Capas recomendadas para una segunda ronda

- Conucos y conservación de suelo por comuna en Haití.
- Cafetales tradicionales y huertos por municipio en República Dominicana y Puerto Rico.
- Conocimiento pesquero Garífuna en Belice, Guatemala y Honduras, con fuentes participativas.
- Prácticas de comunidades Rama, Miskitu y Creole en Nicaragua.
- Agricultura y pesca tradicional por isla en Bahamas, Turks y Caicos y las Antillas neerlandesas.
- Calendarios costeros y manejo comunitario de manglar, guardando fuera de la app sitios sensibles.

