# Revisión del cuarto lote — bloques H (Medio Oriente) e I (Norte de África) — 15/09/2026

Dos archivos de GPT: `bloque-h-medio-oriente.json` (13 entradas) y
`bloque-i-norte-africa.json` (11). **Se montaron 22 de 24.** Además se
recuperaron las **cuatro** entradas que venían pendientes de lotes anteriores
por no poder abrir el archivo: **26 fichas nuevas**, de 88 a 114 sobre 222.

Los 24 `fichaId` existen, no se repiten, ninguno pisa una ficha que ya tuviera
práctica, y los 24 pasan los chequeos mecánicos del test.

## Verificación de las fuentes

Se abrió cada URL y se buscó la frase de `verificacion` palabra por palabra.
**Las 24 quedaron verificadas: ninguna cita caída, por segundo lote seguido.**

De las 24, **20 pasaron automáticamente** una vez corregida la herramienta —ver
abajo—, y las otras cuatro se resolvieron a mano.

### Lo que estaba mal era el verificador, no UNESCO

Desde el primer lote este archivo viene diciendo que "UNESCO devuelve 403 a todo
lo que no sea un navegador real". **Es falso y conviene borrarlo de la cabeza.**
`whc.unesco.org` contesta 403 a una petición que no trae `Referer` de su propio
sitio, y además el `fetch` de Node se come un 403 donde `curl` con las mismas
cabeceras baja la página entera. Con el `Referer` puesto y `curl` como respaldo,
las siete fuentes de UNESCO de este lote se verifican solas.

Lo mismo vale para los PDF de `whc.unesco.org/document/...`: el navegador los
convierte en un cuadro de descarga —por eso `sabanas_guayanesas` quedó dos veces
sin verificar— pero `curl` los trae completos.

Y apareció un artefacto tipográfico más, de la familia de siempre: **el marcador
de nota al pie en medio de la frase**. La FAO escribe `Spate irrigation[1] is
practiced in Yemen`, y al sacar las etiquetas queda un `1` suelto entre las dos
palabras. Se descarta antes de comparar, igual que el guion de corte de renglón,
las entidades numéricas y el ordinal en superíndice.

### Las cuatro que no pasaron solas

| Ficha | Qué pasó | Resultado |
|---|---|---|
| `arabia_sur_bosque_niebla` | Cita **abreviada**: ver abajo. | Montada. |
| `ahaggar_tassili` | Cita **abreviada**: ver abajo. | Montada. |
| `socotra` | `link.springer.com` sirve un muro de JavaScript al cliente plano. | Verificada en el navegador; **no montada**, por otra razón. |
| `sahara_sur` | El subsitio `fao.org/family-farming` está detrás de un desafío de Cloudflare que no se resuelve solo. | Montada contra el repositorio abierto de la FAO. |

### La cita abreviada, tercera y cuarta vez

Es la única regla del encargo que se incumple una y otra vez.

- `ahaggar_tassili`: UNESCO escribe "the evolution of human life **on the edge of
  the Sahara** from 6000 BC"; la `verificacion` sacó esas cinco palabras.
- `arabia_sur_bosque_niebla`: UNESCO escribe "refounded at the end of the 1st
  century by LL'ad Yalutas **(evidenced by an inscription still in situ)** to
  control the trade in Dhofar incense"; la `verificacion` sacó el paréntesis.

Las dos afirman algo que está literal en la fuente, así que se montaron. Pero ya
van cuatro: `amazonia_noroccidental_tierra_firme` en el segundo lote,
`selva_maya_peten_yucatan` en el tercero y estas dos. Copiar y pegar, no resumir.

Y una variante nueva: **la cita corregida**. La FAO escribe, en su propio
resumen, "It developed 7,000 years ago in response to long-**tern** climate
change" —un error de tipeo de ellos—, y la `verificacion` lo escribió bien.
Arreglarle la ortografía a la fuente rompe la comparación literal igual que
abreviarla.

## Lo que este lote enseñó: la `verificacion` verifica, la entrada no

Es el hallazgo del lote y no lo caza ningún test, ni el mecánico ni el de citas.
La frase de `verificacion` sostiene **la fecha**. Nada controla que la fuente
sostenga **la práctica** ni el resto del `detalle`. Dos entradas se apoyaron en
una fuente que no habla de lo que la entrada afirma.

- **`socotra` no se montó.** La práctica declarada es "trashumancia vertical en
  busca de agua" y el `detalle` describe subir a tierras altas en la estación
  seca y bajar a la costa cuando vuelve el agua. El artículo citado —Elie (2014),
  *Soqotra's pastoral economy: from core to auxiliary livelihood*— es sobre la
  economía del pastoreo, y no contiene `mobility`, `movement`, `highland`,
  `transhumance` ni `water availability`. La frase que sí está, "The practice of
  pastoralism is millennia-old in Soqotra", sostiene la antigüedad y nada más.
- **`uweinat_tibesti` no se montó.** El `detalle` dice que el arte rupestre
  registra "cabras, perros y camellos" en "cientos de sitios", habla de
  "manantiales permanentes" y cierra con "el museo advierte la dificultad de
  datar directamente las pinturas". El informe técnico de UNESCO de 2004 menciona
  camellos, pero no cabras ni perros; dice que Jebel Ouenat es el único punto de
  agua en cientos de kilómetros, no que haya cientos de sitios; y la palabra
  "museum" aparece una sola vez, en los agradecimientos. No hay museo advirtiendo
  nada. La fecha —"between 12,000 and 7,000 BP"— sí es textual.

Las dos se conservan en los JSON con su `verificacion` intacta, por si aparece
una fuente que sostenga lo que dicen.

## Una etiqueta que nombraba otro documento

Otra vez, y por eso conviene mirarlo a mano en cada lote: `nilo_delta` citaba
`fao.org/4/y1275e/y1275e00.pdf` como *"FAO — Drainage water reuse in Egypt"*. Lo
que abre esa dirección es *Case Studies on Water Conservation in the
Mediterranean Region*, de Vidal, Comeau, Plusquellec y Gadelle (FAO/IPTRID,
2001), y Egipto es uno de los casos, en la página 44. Se corrigió al montar, con
autores, año y página.

## Dos fuentes que sostienen dos fichas cada una

No es un error, pero conviene tenerlo a la vista: cuatro de las 22 entradas se
apoyan en dos documentos.

- La nota de la FAO sobre Yemen sostiene `tihama_costa_arida` y
  `hadramaut_meseta` con **la misma frase**. La frase distingue "along wadi
  courses and in the plains", así que alcanza para las dos, pero es una
  afirmación de escala nacional puesta a fechar dos ecorregiones.
- La ficha SIPAM de Figuig sostiene `sahara_norte_estepa` (khettara, kharrouba,
  twiza) y `magreb_estepa_alfa` (territorios pastorales de AbbouLakhal). Acá el
  reparto es limpio: la propia ficha describe dos agrosistemas complementarios y
  cada entrada toma uno. Los dos `detalle` están respaldados palabra por palabra.

## Control editorial

Ninguna `verificacion` nombra un pueblo que el texto publicado esconda. Estas
fuentes nombran sistemas por lugar —Figuig, Siwa, Gonabad, Liwa, Khaybar— más
que por pueblo, así que la mitad de "no borrar la autoría" casi no se ejercita.
Dos cosas que las entradas podrían haber conservado y no conservaron:

- La presentación técnica de la FAO identifica a la población de Imilchil y
  Amellagou como **Ait Hdidou** y **Ait Marghad**; `alto_atlas_enebro` no los
  nombra.
- UNESCO nombra las prácticas colectivas de reparación de terrazas en Yemen
  —**al-ʿanah**, **al-ʿawn**, **al-tajyish**—; `yemen_montana_aterrazada`
  describe la práctica sin el nombre.

Nombrar bien tiene valor propio: el lector que quiere seguir el hilo necesita la
palabra con la que buscarlo.

La otra mitad de la regla sí está bien ejercitada. `desierto_norarabigo` cierra
con "es evidencia histórica de caza colectiva, no una práctica aplicable hoy
sobre fauna silvestre"; `harrat_basalto` conserva la incertidumbre de la
cronología porque UNESCO la declara en debate; `ahaggar_tassili` avisa que el
arte rupestre "no permite reconstruir un calendario exacto de pastoreo";
`nefud_rub_al_khali` aclara que el flujo natural del falaj ya no alcanza y hoy se
complementa con bombeo.

Una inferencia menor que se dejó pasar y queda anotada: `atlas_conifera_montana`
dice que "el estiércol conecta el rebaño con la fertilidad de los cultivos",
donde la ficha SIPAM dice "animal husbandry is integrated into cropping". Es la
lectura habitual de esa frase, pero la fuente no nombra el estiércol.

## Las cuatro que esperaban poder abrir el archivo

Las cuatro se pudieron abrir hoy, y **tres de los cuatro diagnósticos anteriores
estaban mal**:

- `sabanas_guayanesas` — el informe de misión a Canaima no "dispara una
  descarga": `curl` con `Referer` lo baja entero. La frase sobre el manejo del
  fuego por las comunidades pemón está en la página 3.
- `campos_rupestres` — la nota de FAO Brasil efectivamente desapareció del sitio,
  pero está archivada (captura del 04/01/2023) y contiene la frase entera. Se
  cita la copia archivada, diciendo que lo es.
- `bosque_mesofilo_montana` — el PDF de CONABIO **sí tiene capa de texto**; la
  frase está en la página 146. Lo que había fallado era la bajada de 10 MB, no el
  documento.
- `amazonia_suroccidental_tierra_firme` — **nunca fue una cita caída.** Se había
  registrado como "la única de todos los lotes", porque la frase no estaba en el
  resumen del artículo de *Nature*. Está en el cuerpo, que es abierto. El error
  fue mío: leer el resumen y concluir sobre el artículo.

Con esto **no queda ninguna entrada pendiente de acceso** en los cuatro lotes.

## Un archivo mal nombrado, renombrado

`bloque-h.json` y `COBERTURA_BLOQUE_H.md` no eran del bloque H: son el catálogo
base de 22 fichas de Norteamérica, Mesoamérica, Caribe y Europa, que en el anexo
es el bloque **C**. GPT lo avisó. Pasaron a llamarse
`bloque-c-catalogo-base.json` y `COBERTURA_BLOQUE_C.md`.

## Lo que GPT dejó afuera y avisó

Del bloque H, 13 de las 26 pendientes; del I, 3 de 14. Los huecos que el propio
informe señala: `estepa_siria_badia`, `mesopotamia_jazira`, `desierto_arabigo`,
`golfo_llanura_costera`, `golfo_persico_mangle`, `mar_rojo_mangle`,
`iran_sur_nubo_sindico`, `hircania_caspio`, `badghyz_pistacho`,
`sahara_occidental_erg`, `sahara_costa_atlantica` y `mar_rojo_costa_desierto`.

La razón que da —fuentes de escala nacional sin fecha verificable, o que no
permiten asignar el sitio documentado a una sola ficha— es exactamente la
correcta, y es la misma razón por la que `socotra` y `uweinat_tibesti` no
entraron. Vale más decir que no se pudo.
