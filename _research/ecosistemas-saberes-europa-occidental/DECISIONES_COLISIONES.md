# Decisiones y colisiones — Europa occidental

Regla que se aplicó, la misma del paquete americano: **un solo dueño ecológico por ECO_ID, global.** El país no cambia la resolución ecológica; sólo filtra saberes, que viven en otra capa. Ninguna ficha existente puede quedar sin ningún ECO_ID que la active.

Verificación automática ejecutada (`node` sobre `lib/ecorregiones.ts`, `lib/biomasRegionales.ts`, `lib/contexto.ts` y el paquete americano):

- 8 ids de ficha nuevos, **0 colisiones** con `lib/`.
- **0 colisiones** con los 53 ids del paquete de Mesoamérica y Norteamérica.
- 9 ECO_ID a agregar, **ninguno** estaba tomado en `ECO_ID_A_FICHA`.
- 5 ECO_ID a ampliar, **ninguno** estaba tomado.
- **0 choques** con los 143 ECO_ID ya asignados en el paquete americano.
- Los 6 `CONSERVAR_ACTUAL` coinciden exactamente con lo que hoy dice `lib/`.

## Dos errores documentados que este relevamiento corrige

No son colisiones: son fichas cuyo encabezado promete una cobertura que su ECO_ID no entrega. Se detectaron consultando RESOLVE por coordenada, no leyendo el código.

**1. `atlantico_templado_oceanico` dice cubrir España y Portugal y no los toca.** Su encabezado declara `IE, GB, FR, ES, PT, BE, NL` y su único ECO_ID es 651, Celtic broadleaf forests. Consultado por punto, 651 sólo aparece en Irlanda y Gran Bretaña. Galicia, Asturias, el País Vasco y el Miño devuelven **648**, que no está en la lista blanca: hoy un predio en Galicia cae al bioma global. Lo mismo pasa con Bretaña, Normandía, Flandes y los Países Bajos, que devuelven **664**, también ausente.

*Decisión:* no se remapea 651 ni se toca la ficha. Se agregan `cantabrico_atlantico_iberico` (648) y `atlantico_llanura_noroeste` (664). `atlantico_templado_oceanico` conserva 651 y sigue viva. Queda pendiente para el montaje corregir su comentario de encabezado, que hoy afirma una cobertura falsa.

**2. `templado_continental_europeo` dice cubrir Francia y Suiza y no las toca.** Su encabezado declara `FR, DE, CH, AT, CZ, PL, SK, SI, HR, HU, RO` con ECO_ID 654. Ningún punto francés ni suizo consultado cae en 654: Alsacia, los Vosgos, el Jura, el Macizo Central, las Ardenas, Luxemburgo y la meseta de Berna devuelven **686**.

*Decisión:* se agrega `templado_occidental_europeo` (686). 654 conserva su ficha, que sigue siendo correcta para Alemania, Chequia, Polonia y Austria. Igual que arriba, el comentario de encabezado hay que corregirlo al montar.

## Ampliaciones: fichas que ya describían un territorio donde no se activaban

Estos cinco casos no necesitan ficha nueva. La ficha existente ya cuenta ese ecosistema; lo que falta es el ECO_ID que la encienda.

**676 Pirineos → `alpino_montano_europeo`.** El resumen de la ficha dice textualmente "Alpes, Pirineos, Cárpatos" y su propio comentario avisa: *ECO_ID 689 corresponde a Alpes; Pirineos y Cárpatos tienen otros IDs*. El archivo documentaba el hueco. Ariège devuelve 676.

**796 Lanzarote y Fuerteventura → `macaronesia`.** El caso más llamativo. La ficha `macaronesia` describe tabaibal-cardonal y sus saberes son enarenado, jable, zocos, gavias y nateros; su primera fuente es literalmente la ficha GIAHS de la FAO sobre Lanzarote. Pero Lanzarote y Fuerteventura devuelven **796**, no 787. La ficha nunca se activaba en la isla sobre la que está escrita. Tenerife, Gran Canaria y La Palma sí devuelven 787.

**805 Alentejo, Algarve, Huelva y Cádiz → `mediterraneo_europeo`.** Mismo patrón. Los saberes de la ficha son dehesa extremeña y **montado alentejano**, y su fuente principal es el GIAHS del Montado de Serpa. Extremadura devuelve 793 y sí resuelve, pero el Alentejo, el Algarve, Monchique, Doñana y Los Alcornocales devuelven **805**. El montado no se activaba en el montado.

**799 Cataluña, Provenza, Languedoc, Baleares y Camarga → `mediterraneo_europeo`.** Es mediterráneo europeo típico, dentro de la cobertura que la ficha ya declara.

**788 Córcega → `mediterraneo_europeo`.** Confianza media. Córcega montana tiene pinar de laricio propio y merecería ficha aparte, pero es superficie chica y conviene resolverla en el pase de Italia y el Mediterráneo central, junto a 795, 806 y 644. Mientras tanto la ficha mediterránea es una aproximación aceptable y mejor que el bioma global.

## Cortes discutibles

**`campina_calcarea_inglesa` (663) — decidido el 03/09/2026: ficha propia.** Se evaluó plegarla a `atlantico_templado_oceanico` y se descartó. El sustrato de creta cambia la conclusión práctica: sobre creta fisurada una zanja de infiltración y una represa se comportan de manera opuesta a como se comportan sobre los cambisoles saturados de Irlanda, y eso es exactamente lo que la app calcula. `atlantico_templado_oceanico` conserva 651 y no queda huérfana.

**`montano_iberico` (792 + 800).** Unión deliberada de dos ECO_ID en una ficha. 792 es conífera oromediterránea, 800 es montano noroccidental con más influencia atlántica. Comparten lo que decide un diseño: relieve, nieve y verano seco. Si más adelante hace falta precisión, 800 se separa sin tocar 792.

**`semiarido_sureste_iberico` (803).** Acá no separar sí hace daño. Si 803 cayera en `mediterraneo_europeo`, la app recomendaría dehesa y montado en un lugar con 250 mm anuales. El polígono es chico y bien acotado: Murcia, Alicante y el interior valenciano siguen siendo 793 y no cambian.

## Fichas huérfanas

Ninguna. Las seis fichas europeas existentes conservan al menos un ECO_ID:

| Ficha | ECO_ID después de esta propuesta |
|---|---|
| `macaronesia` | 645, 668, 787, **796** |
| `atlantico_templado_oceanico` | 651 |
| `alpino_montano_europeo` | 689, **676** |
| `mediterraneo_europeo` | 793, **788**, **799**, **805** |
| `templado_continental_europeo` | 654 (sin cambio) |
| `estepa_pontica_panonica` | 674 (sin cambio) |
| `boreal_nordico_turberas` | 717 (sin cambio) |

Ninguna pierde ECO_ID y cuatro ganan cobertura.
