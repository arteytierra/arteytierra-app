# Cobertura lote 04 — Amazonía y Caribe — 28/09/2026

**8 entradas nuevas en 5 fichas.** Rama `claude/practicas-enumeradas`.

---

## Fichas cubiertas

| Ficha | Entradas antes | Nuevas en lote 4 | Total |
|---|---|---|---|
| `amazonia_noroccidental_tierra_firme` | 2 (lotes previos) | 1 (Souza 2023 ribereños castaña) | **3** |
| `amazonia_oriental_tierra_firme` | 1 (terra preta) | 2 (Kayapó castaña, Maezumi policultura) | **3** |
| `varzeas_igapos_amazonicos` | 1 (pesca Cocamilla) | 2 (Ávila várzea, Heckenberger xinguano) | **3** |
| `amazonia_suroccidental_tierra_firme` | 1 (geoglifos Aquiry) | 2 (Watling Teotônio, Pilnik Huni Kuĩ) | **3** |
| `hispaniola_bosque_humedo` | 1 (conucos taínos) | 1 (Millet jardín criollo Haití) | **2** |

---

## Fichas que quedaron por debajo de 3

### `hispaniola_bosque_humedo` — 2 entradas

Se documentó el jardín criollo cafetalero haitiano (Millet et al. 2024). Para una tercera entrada
se buscaron fuentes sobre prácticas agrícolas tradicionales de la República Dominicana (conucos
contemporáneos, agroforestería campesina) en SciELO, PubMed Central y Google Scholar: los artículos
disponibles en acceso abierto tratan la historia colonial y la dieta taína sin documentar prácticas
productivas actuales con la especificidad requerida. **Se deja en 2 por falta de fuente abierta verificable.**

---

## Fichas del Caribe que quedaron con 1 entrada — este lote no las tocó

Estas fichas tenían 1 entrada antes del lote 4 y no se buscaron entradas adicionales por falta
de fuentes en acceso abierto con el nivel de detalle requerido para el diseño predial:

| Ficha | Entrada existente | Motivo de no ampliar |
|---|---|---|
| `bosque_humedo_tropical_caribeno` | entrada previa | La literatura académica disponible en acceso abierto sobre prácticas productivas del Caribe insular es escasa. Los trabajos de referencia (Newsom, Keegan) sobre arqueobotánica caribeña están en libros y no en repositorios abiertos. |
| `matorral_seco_caribeno` | entrada previa | La vegetación de matorral seco caribeño tiene escasa representación en la literatura de conocimiento ecológico local o agroforestería con acceso abierto. |
| `darien_humedo_panama` | entrada previa | Los trabajos sobre agricultura Emberá y Wounaan en el Darién requieren acceso institucional; los artículos en abierto tratan demografía y salud, no sistemas productivos en detalle. |
| `bosque_atlantico_mosquitia` | entrada previa | La Mosquitia hondureña y nicaragüense tiene literatura en acceso abierto sobre biodiversidad pero escasa sobre prácticas productivas tradicionales con fuentes verificables. |
| `manglares_centroamericanos` | entrada previa | Los trabajos disponibles documentan servicios ecosistémicos, no sistemas productivos tradicionales asociados al manglar con suficiente detalle. |
| `antillas_menores_bosques_humedos_secos` | entrada previa | La arqueobotánica de las Antillas Menores está concentrada en pocas revistas de acceso abierto; se encontró el artículo de Elliott et al. (2022) para Jamaica pero no un equivalente para las Antillas Menores con el mismo nivel de especificidad. |
| `talamanca_caribe_sur` | entrada previa | La literatura sobre el corredor biológico Talamanqueño está en informes institucionales o artículos de pago; los artículos en abierto describen biodiversidad sin documentar sistemas productivos tradicionales específicos. |
| `manglares_antillanos` | entrada previa (Martinica) | Se documentó un caso en Martinica (lote previo). Para una segunda entrada en otra isla antillana, las búsquedas en PubMed Central y SciELO no arrojaron artículos de acceso abierto sobre sistemas productivos ligados al manglar con el nivel de especificidad requerido. |

---

## Nota sobre el error de comillas tipográficas

Durante la escritura de las entradas en `practicasHistoricas.ts`, el editor sustituyó
automáticamente las comillas ASCII `'` por comillas tipográficas `'` y `'` (U+2018/U+2019)
en las cadenas TypeScript. Esto produjo errores de typecheck (`TS1127: Invalid character`)
que se corrigieron en el mismo commit mediante un script Python antes de pasar la compuerta.
La comilla tipográfica `'` (U+2019) que ya existía en `Amazonia's Terra Preta`
—válida dentro de una cadena delimitada por comillas ASCII— se conservó intacta.
