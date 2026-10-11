# Revisión del segundo lote — Argentina y Sudamérica — 15/09/2026

Cuatro archivos de GPT: `prioridad-1-argentina.json` (12), `sudamerica-a.json`
(12), `sudamerica-b.json` (12) y `sudamerica-c.json` (8). **44 entradas, 41
montadas** en `apps/terreno/lib/practicasHistoricas.ts`.

Los 44 `fichaId` existen, no se repiten entre lotes y ninguno pisa una ficha que
ya tuviera práctica. Las 12 de la prioridad son las argentinas de verdad, las
que el anexo mal rotulado se había salteado en el primer lote.

## Verificación de las fuentes

Se abrió cada URL y se buscó la frase de `verificacion` palabra por palabra.
**39 de 44 verificadas.** Tres de las cinco restantes no fallaron la cita: no se
pudo abrir el archivo.

El verificador corrige dos artefactos que ya habían producido falsos negativos:
el PDF corta palabras con guion al final del renglón (`his- tóricamente`) y el
HTML mete entidades numéricas (`&#13;`) en medio de la frase. Ninguna de las dos
cosas es un error de la cita, así que se comparan secuencias de palabras sin
puntuación.

### Las cinco que no pasaron a la primera

| Ficha | Qué pasó | Resultado |
|---|---|---|
| `caatinga` | El PDF de Embrapa está en el repositorio **`alice`**, no en `infoteca`: la URL entregada daba 404 y el documento es el mismo. | Montada con la URL corregida; frase verificada en la p. 16. |
| `bosques_babacu_maranhao` | IBGE devuelve **403** a cualquier cliente que no sea un navegador real. | Montada; frase verificada palabra por palabra en el navegador. |
| `sabanas_beni` | `publications.dainst.org` está detrás de **Anubis**, un muro anti-scraping con prueba de trabajo en JavaScript. | Montada; el abstract contiene la frase textual. |
| `sabanas_guayanesas` | `whc.unesco.org/document/134048` devuelve **403** con cualquier combinación de cabeceras. | **Sin montar.** |
| `campos_rupestres` | La nota de FAO Brasil **ya no existe**: 404 en fao.org, en todos los idiomas. | **Sin montar.** |

### La única que sí falló la cita

`amazonia_suroccidental_tierra_firme`. El artículo existe y es serio —Crossref
confirma *Over 20,000 precolonial earthworks in the Southwest Amazonia*,
Pärssinen, Kalliola y Ranzi, Nature, 29/07/2026—, pero **el abstract accesible
no contiene la frase** que la sostiene ("began to be constructed over 2,500
years ago") y el texto completo está detrás del muro de pago. Tampoco aparece
"Aquiry", que es el nombre que la entrada le da a la cultura. Sin poder leer lo
que se cita, no entra. **Sin montar.**

### Dos citas editadas, no inventadas

Las dos se montaron, porque lo que afirman está literal en la fuente:

- `amazonia_noroccidental_tierra_firme` abrevió dentro de la cita: FAO escribe
  "as a Globally Important Agricultural Heritage System (GIAHS) by FAO in
  January 2023" y la `verificacion` dice "as a GIAHS by FAO".
- `bosques_secos_tumbes_ecuador_peru` **tradujo al inglés una fuente en
  español**. El original dice "las primeras obras de este tipo fueron
  construidas por la cultura Valdivia (2000 a 1500 a.C.)". El encargo pide la
  frase textual y en su idioma original, justamente para que la comparación sea
  mecánica.

## Control editorial

**La autoría no se calló en ninguna.** Es la falla que tuvo el primer lote y se
revisó al revés y al derecho: ninguna `verificacion` nombra un pueblo que el
texto publicado esconda, y ningún nombre propio del texto publicado falta en su
fuente. Donde la fuente nombra —Kichwa y Kijus en Napo, Mapuche en Lanín,
Chiquitanos, quilombolas del Vale do Ribeira, caiçaras, Kogui, Wiwa, Arhuaco y
Kankuamo en la Sierra Nevada, Cocamilla en el Huallaga, quebradeiras de coco
babaçu— la entrada nombra, como la nombra ella.

El sujeto es el registro y no el terreno: "INTA define", "Parques Nacionales
documenta", "la fuente advierte que sus modalidades concretas de uso siguen
siendo inciertas". Los períodos usan rangos abiertos. Varias entradas agregan
por su cuenta la advertencia que corresponde —que una quema necesita
prescripción y autorización, que el registro de 1994 no describe el estado
actual de la población, que la referencia no autoriza obras en un páramo
protegido—, que es exactamente lo que hace falta cuando alguien va a leer esto
antes de mover tierra.

## Lo que GPT dejó afuera y avisó

Trece ids relevados sin publicar, por falta de evidencia específica: entre
otros, `humedales_orinoco`, `pantepui_guayana_alta`, `mata_atlantica_seca`,
`bosque_juan_fernandez`, `galapagos_matorral_xerico` y las islas oceánicas del
Pacífico sur. La lista está en `COBERTURA_SUDAMERICA_A_B_C.md` y vale tanto como
las entradas: dice dónde hay que buscar distinto.

## Pendientes para quien pueda abrir lo que yo no

Cinco entradas esperan en los JSON con su `verificacion` intacta. Se montan sin
pedirle nada nuevo a GPT:

- `sabanas_guayanesas` y `campos_rupestres`, de este lote.
- `sur_templado_humedo_eeuu` y `bosque_mesofilo_montana`, del primero.
- `amazonia_suroccidental_tierra_firme` necesita además otra fuente, o el texto
  completo del artículo de Nature.
