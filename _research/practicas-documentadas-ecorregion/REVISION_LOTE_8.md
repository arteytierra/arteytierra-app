# Revisión del octavo lote — complemento F, el cierre

Fecha: 2026-09-16. Montado en `apps/terreno/lib/practicasHistoricas.ts`.

18 entradas nuevas más `socotra`, que el sexto lote había devuelto y que vuelve
corregida. **19 de 19 citas verificadas, ninguna caída.** Sexto lote seguido sin
una sola cita que la fuente no sostuviera.

Con esto la capa pasa de 182 entradas sobre 181 fichas a **201 sobre 200, de
222**. Las 22 que quedan no son un pendiente: son 22 decisiones de no forzar una
entrada, con el motivo escrito ficha por ficha en
`COBERTURA_COMPLEMENTO_F_CIERRE.md`.

## Cómo se verificó

El verificador automático dio 10/18 en la primera pasada. Las ocho fallas fueron
todas de acceso o de transcripción; **ninguna era una cita inventada**.

| Ficha | Qué pasó | Cómo se resolvió |
|---|---|---|
| `manglares_antillanos` | tandfonline responde 403 | OpenAlex: el resumen que el editor depositó en Crossref. Cita exacta. Copia abierta en el repositorio de la UvA |
| `manglares_centroamericanos` | tandfonline responde 403 | Ídem. Después se leyó el artículo entero en el repositorio de LSU |
| `manglares_amazon_orinoco_caribe_sur` | MDPI devuelve el cuerpo vacío a `curl` | OpenAlex. Cita exacta |
| `veracruz_tabasco_selvas_humedales` | ScienceDirect responde 403 | Navegador: la frase está en los **Highlights**, que Elsevier muestra gratis |
| `kopet_dag` | Desafío de JavaScript (Anubis) en el portal de revistas de Arizona | Navegador: el PDF es abierto (CC BY) y la frase está en la página 7 |
| `chiapas_bosques_montanos` | 3/21 palabras | La cita venía reescrita. Ver abajo |
| `arabia_este_niebla` | 10/21 palabras | La cita venía abreviada. Ver abajo |
| `iran_sur_nubo_sindico` | 7/26 palabras | La cita venía abreviada. Ver abajo |

`socotra` se verificó con el navegador: Springer contesta a `curl` con un desafío
de JavaScript aunque el artículo sea abierto, igual que en el séptimo lote.

## El período, esta vez, siempre sale de la fuente

El peor defecto del séptimo lote fue un `periodo` estimado en vez de citado.
**En este lote los 19 períodos están escritos en la fuente**, incluidos los tres
que podrían haberse redondeado y no se redondearon: la fecha de campo de la
etnografía de Tenejapa (marzo a julio de 2013), la del trabajo entre los beja
(1992-1997) y la de la Sierra Tarahumara (2002-2004). Cuando lo que la fuente
fecha es el estudio y no la práctica, la entrada lo dice así.

## Tres citas que no estaban escritas como decía la entrada

Ninguna de las tres cambia lo que la entrada afirma; las tres cambian que se
pueda encontrar la frase buscándola.

- **`chiapas_bosques_montanos`** decía «El trabajo etnográfico **se realizó** en
  cuatro comunidades…». La fuente escribe «…recabados mediante entrevistas en
  **un trabajo etnográfico realizado** en cuatro comunidades aledañas a la
  cabecera municipal de Tenejapa de marzo a julio de 2013». Reescrita, no
  abreviada: la diferencia es un verbo conjugado donde había un participio.
- **`arabia_este_niebla`** sacó un paréntesis del medio: UNESCO escribe «the
  frankincense tree **(Boswellia sacra)** can still be found».
- **`iran_sur_nubo_sindico`** sacó la referencia de página: la Encyclopaedia
  Iranica escribe «Ebn al-Balḵī **(p. 140)** reported that…».

Van nueve casos de este tipo en ocho lotes.

## Dos URLs que no eran del editor

Es el aviso que el séptimo lote agregó al encargo, y volvió a hacer falta.

- **`hircania_caspio`** apuntaba a **RePEc**, que es un índice bibliográfico: no
  aloja el artículo, lo describe. Repuntada al DOI de *Environmental
  Archaeology*.
- **`kopet_dag`** apuntaba al *galley* del Journal of Political Ecology, que es
  el endpoint de descarga del PDF y no una página. Repuntada al DOI.

## Un detalle con la geografía dada vuelta

`hircania_caspio` decía que el pastoreo estaba «junto al **borde oriental** del
bosque hircano». La fuente dice lo contrario: el polen del lago Neor muestra
«una estepa abierta típica de las tierras altas irano-turanias» con «la
proximidad del bosque hircano templado y húmedo **hacia el este**». O sea que el
sondeo está al **oeste** del bosque, no al este, y además **el pastoreo
documentado está al lado del bosque y no adentro** — que para una ficha que se
llama «bosque hircano del Caspio» importa más que el punto cardinal.

Es el segundo lote seguido con una inversión así; el anterior fue la costa norte
del mar Negro que en realidad era la sur.

## Un detalle que no decía de qué país hablaba la fuente

`desierto_arabigo` describe el *hema* —la reserva consuetudinaria de pastos—
citando un estudio de la FAO que es, en realidad, **sobre los beduinos de la
República Árabe Siria**. La frase citada sí habla de la península Arábiga
preislámica, así que la cita se sostiene, pero el lector que abriera la URL iba a
encontrarse con otro país. El detalle ahora lo dice, y de paso nombra al
**majlis** y al **'urf** como los nombra la fuente, en vez de traducirlos a
«consejo» y «derecho consuetudinario» a secas.

## Seis etiquetas completadas

Ninguna estaba mal: las 19 vinieron con autor, año y publicación, igual que en el
séptimo lote. **Van dos lotes seguidos sin una etiqueta que corregir.** Se les
agregaron páginas y estado de acceso:

- Ponel y otros (2013), *Environmental Archaeology* 18(3): 201-210 (resumen
  público; el texto completo es de pago).
- Brite (2016), *Journal of Political Ecology* 23: 1-25 (acceso abierto, CC BY).
- Camou-Guerrero y otros (2008), *Human Ecology* 36(2): 259-272 — **y que la URL
  es la copia íntegra reproducida en la tesis doctoral del primer autor**, no el
  sitio de la revista.
- McKillop (2024), *The Journal of Island and Coastal Archaeology* 19(3):
  484-504 (acceso abierto).
- Hofman y otros (2023), *Environmental Archaeology* 28(3) (acceso abierto).
- Stoner y otros (2021), *Journal of Anthropological Archaeology* 61: 101264
  (resumen y conclusiones destacadas públicos; el texto completo es de pago).

## Una fuente de pago bien tratada

`veracruz_tabasco_selvas_humedales` es el caso del defecto tipo 1 resuelto como
corresponde. El artículo es cerrado, pero ScienceDirect publica gratis los
*Highlights*, y ahí está todo lo que la entrada afirma: «The Classic lowlands of
Veracruz developed **15,000 ha** of raised-field intensifications», «Lidar remote
sensing revealed redundant architectural groups as management nodes» y
«Distribution of architectural nodes suggest agricultural management was
decentralized». El detalle no se pasa de ahí, e incluso conserva la advertencia
del resumen: son hipótesis generadas por teledetección que todavía hay que
probar en el campo.

## La entrada que vuelve corregida

`socotra` se devolvió en el sexto lote por el defecto tipo 2: declaraba
trashumancia vertical citando un artículo sobre la economía del pastoreo que no
contiene ni `mobility` ni `highland`. La versión nueva usa el mismo artículo de
Elie (2014) pero cita lo que sí dice: el **yaharuf**, el traslado estacional de
pescadores de la costa y pastores del interior a los huertos de dátiles en junio
y julio, antes del monzón del sudoeste, por relevos de pocos días o quedándose
toda la cosecha. Se verificó frase por frase contra el texto completo, incluida
la parte que la entrada usa para no exagerar: «this movement is still practiced
by many people, although it is less extensive than during the Sultanate period».

Es el modelo de cómo se arregla una entrada devuelta: misma fuente, otra
afirmación, la que la fuente realmente sostiene.

## La entrada que no vuelve

`uweinat_tibesti` se devolvió en el sexto lote porque el informe de UNESCO no
decía nada de las cabras, los perros, los cientos de sitios ni el museo. La
búsqueda nueva sobre los teda y los oasis tampoco reunió práctica, fecha y
territorio en una misma fuente, así que **queda vacía**. Está bien que quede
vacía.

## Cobertura final

| Bloque | Cubierto | Vacías |
|---|---|---|
| A · Sudamérica, fichas base | **12/12** | — |
| B · Sudamérica, resto | 39/47 | 8 |
| C · Catálogo base | **22/22** | — |
| D · México, Centroamérica y EE. UU. | 44/53 | 9 |
| E · Canadá, Alaska y Groenlandia | **10/10** | — |
| F · Europa no comunitaria | **8/8** | — |
| G · Unión Europea | **28/28** | — |
| H · Medio Oriente | 25/28 | 3 |
| I · Norte de África | 12/14 | 2 |
| **Total** | **200/222** | **22** |

Cinco de los nueve bloques quedan completos. Las 22 vacías:

- **B**: `bosque_juan_fernandez`, `bosque_seco_mato_grosso`,
  `campinaranas_aguas_negras`, `isla_malpelo_xerica`, `islas_desventuradas`,
  `mata_atlantica_seca`, `matorrales_xericos_caribe_suramericano`,
  `pantepui_guayana_alta`.
- **D**: `bosque_seco_panameno`, `californias_chaparral_costero`,
  `hispaniola_seco_pinar_humedales`, `matorral_xerico_caribeno`,
  `montanas_mayas_pino_encino`, `pacifico_sur_chiapas_bosque_seco`,
  `revillagigedo_ecosistemas_insulares`, `sabanas_pino_belice_mosquitia`,
  `tamaulipas_texas_pastizal_mezquital`.
- **H**: `caspio_llanura_desertica`, `golfo_persico_mangle`, `mar_rojo_escarpe`.
- **I**: `sahara_occidental_erg`, `uweinat_tibesti`.

Los motivos se repiten y vale la pena leerlos juntos, porque describen el límite
de este método: **islas oceánicas sin ocupación agrícola documentada**
(Desventuradas, Malpelo, Juan Fernández, Revillagigedo) y **fichas donde la
bibliografía existe pero habla de un país o de una región mayor y no distingue
la ecorregión** (el chaparral costero de las Californias, los conucos taínos de
La Española, las montañas mayas de pino-encino separadas de las tierras bajas,
el fuego pemón que es de la Gran Sabana y no de las cumbres del Pantepui).

En ninguno de los dos casos la respuesta es escribir algo. Un `detalle` que el
lector no pueda comprobar en la fuente es peor que la sección vacía que esta capa
vino a llenar.

## Nota de método

Al auditar `sierras_madre_pino_encino` casi corrijo una afirmación correcta. El
detalle dice que hubo división de tareas por género pero «sin diferencia general
de conocimiento entre ambos», y el resumen del artículo empieza diciendo que el
uso «is based on a gender-related pattern of differential knowledge». Parecía una
contradicción. No lo es: el artículo prueba las dos cosas a la vez —«when the
overall knowledge of plant species was examined, no significant differences were
detected between men and women, but significant differences were identified in
general use categories»— y la entrada leyó bien la distinción. **Un resumen
contradice al detalle menos veces de las que parece; hay que ir al cuerpo antes
de corregir.**
