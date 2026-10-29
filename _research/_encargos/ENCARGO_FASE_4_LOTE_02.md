# Fase 4 — lote 2: ECO_ID 297, North Deccan dry deciduous forests

*Va junto con `ENCARGO_FASE_4_FICHAS_INDOMALAYA.md`, que está corregido en cuatro
lugares desde el lote 1, y con `ANEXO_IDS_CULTIVOS.md`, que también. Entregá un
solo archivo, `02.json`, con una sola ficha. Fecha: 23/10/2026.*

---

## 1. El lote 1 salió bien, y lo único que faltó fue culpa del encargo

Quedó montado el 290, el Decán central, con ocho especies, diez cultivos y dos
modificadores. Las cuatro URLs abrían, los `label` eran los títulos de las
páginas, las atribuciones a One Earth y a la FAO eran textuales, y el `_meta`
declaraba de frente que no se habían extraído repartos de HWSD ni de SoilGrids.
Eso es exactamente el reparto que rinde: **las descripciones, la estructura del
bosque y los binomiales los hacés vos; los números de suelo, escurrimiento y
erosión los bajo yo**, porque viven en PDF y en páginas que bloquean el acceso
automático.

Lo único que faltó fue el modificador, y la culpa fue del encargo. Decía: «si es
un gradiente, no se propone delta. En este reino va a pasar en el Decán, que va de
500 a 1.200 mm». Le dio el caso, el motivo y los números, y volvió repetido. Y
doce líneas más arriba el mismo encargo usaba el mecanismo del vertisol del Decán
como ejemplo de una razón que **sí** justifica mover un número. Entre dos
instrucciones contradictorias eligió la conservadora, que es lo correcto.

**La regla está reescrita.** Ahora pide nombrar **la variable** del gradiente —no
el gradiente— y preguntarse si la app la mide. La app mide lluvia anual,
estacionalidad, pendiente, orientación, textura, pH, carbono orgánico, reserva de
agua útil del perfil, grupo hidrológico y profundidad de la capa limitante. Si la
mide, se propone el delta y la razón manda a mirar ese campo. Sólo si no la mide
va `modificadores_propuestos: []`, con la variable nombrada en `notas`.

En el 290 la variable no era la lluvia: era la profundidad del perfil, y la app la
mide.

---

## 2. Lo primero de este lote: esta ecorregión no es la del lote 1

Y acá el encargo también te iba a mentir, así que lo digo antes. La cabecera del
bloque 1 dice que el tema del bloque son los **vertisoles negros**, el *regur*.
Eso vale para parte del bloque y **no vale para ésta**.

Verificado hoy, antes de mandarte esto: el 297 está en el **oeste de Odisha y en
Chhattisgarh**, en la cuenca media del **Mahanadi**, a sombra de lluvia de los
**Ghats orientales**, y es el extremo norte de los bosques secos deciduos de la
India. Está **fuera de la traza basáltica del Decán**. No arrastres el regur, ni
el ICRISAT, ni los números de Patancheru: son de otra mitad del bloque.

**Cuál es el orden de suelo dominante acá es la pregunta del lote, y no te la voy
a contestar.** Averigualo de los mapas y decí qué dicen las dos bases, HWSD v2 y
SoilGrids, con sus porcentajes y si coinciden. Si el orden que aparece es otro que
el que el encargo daba por hecho, **ése es el hallazgo del lote** y se escribe así
en `verificacion`.

---

## 3. Las rutas, probadas hoy una por una

**Las que abren con acceso automático:**

| Ruta | Qué es | Estado |
|---|---|---|
| `https://www.oneearth.org/ecoregions/north-deccan-dry-deciduous-forests/` | la ficha de One Earth de esta ecorregión | 200, abre pelada |
| `https://en.wikipedia.org/wiki/North_Deccan_dry_deciduous_forests` | redirige a «Northern dry deciduous forests» | 200 |
| `https://www.fao.org/4/w4442E/w4442e05.htm` | las series de bosque seco de la India, FAO | 200, ya usada en el 290 |
| `https://esdac.jrc.ec.europa.eu/public_path/shared_folder/eudasm/asia/lists/cin.htm` | **EUDASM**, el archivo del JRC europeo con los mapas del NBSS&LUP escaneados | 200 |
| `https://krishikosh.egranth.ac.in/` | boletines del NBSS digitalizados | 200 |
| `https://epubs.icar.org.in/index.php/JISSS/article/view/172097` | revista de la Sociedad India de Ciencia del Suelo | 200 |

**La que no abre sola:**
`https://ecoregions.worldwildlife.org/ecoregions/im0208` es la página de WWF de
esta ecorregión —**IM0208**— y devuelve 403 al acceso automático. Desde un
navegador real abre. Si no la podés abrir, no la cites: va a `vacias` con lo que
intentaste.

**Y la ruta que el encargo nombraba y está muerta:** `nbsslup.in`, el sitio del
NBSS&LUP, es hoy **un dominio estacionado en venta**; `nbsslup.icar.gov.in` no
resuelve y `soilhealth.dac.gov.in` devuelve 403. Por eso están arriba los dos
espejos. En EUDASM lo que sirve para acá es «Soils of India. (Suborder
Associations)», NBSS&LUP Nagpur 1985, escala 1:7.000.000, y «India.
Agro-Ecological Subregions». **No hay hoja estatal de Odisha ni de Chhattisgarh
en EUDASM** —están Bengala Occidental, Gujarat, Haryana, Tamil Nadu y Punjab—, así
que si el reparto por estado no sale, se dice que no sale.

En Krishikosh el boletín que correspondería es **NBSS Publ. 119, «Soil series of
Orissa», Sarkar et al. 2005**. No verifiqué que esté digitalizado. Si no está,
decilo en `notas`; no lo reemplaces por otro estado.

---

## 4. Tres trampas de este lote en particular

**a. Los estados que nombra la fuente son los de antes del año 2000.** El texto de
WWF de 2002 describe esta ecorregión con los estados de entonces. Bihar,
Chhattisgarh, Jharkhand, Madhya Pradesh y Odisha **no son hoy lo que eran en 2002**:
Jharkhand y Chhattisgarh se separaron en noviembre de 2000, y Orissa se llama
Odisha desde 2011. La ficha va con los estados y los nombres de hoy, y si usás una
fuente vieja, convertís. Esto no es un detalle de prolijidad: alguien que cae con
el predio en Chhattisgarh tiene que leer Chhattisgarh.

**b. Las fuentes no coinciden en cuánto hábitat queda, y quiero las dos.** Hay más
de una evaluación, de años distintos, con cifras distintas de hábitat perdido y de
superficie protegida. **Dame las dos con su año y su fuente, no la más alta ni la
más reciente sola.** La ficha puede decir «tal evaluación de tal año dice esto y
tal otra dice aquello»: eso es información, no es una duda.

**c. No repitas la ficha del 290.** Dos cosas concretas: en el 290 se agregó un
modificador de uso `forestal` que el bioma global no tiene, por un mecanismo que es
de esa ecorregión y de su especie dominante; y la razón del `huerta` manda al
usuario a mirar la reserva de agua útil del panel de suelo. **Si acá el delta
termina coincidiendo, el mecanismo tiene que ser el de acá**, con su fuente. Una
razón copiada se nota y se cae.

---

## 5. El modificador: contra qué compite

Esta ecorregión es **bioma 2, bosque seco tropical**, y hoy hereda del bioma
global:

- `pasturas +10`
- `huerta −10`

Los dos números van en la propuesta: el `delta` que proponés y el `pisa_global`.
Y lo de siempre: el **mecanismo**, no la conclusión; la **fuente** abierta; y la
**confianza** declarada. Confirmar un número vale igual que corregirlo — en el 290
el `huerta −10` se confirmó y lo que cambió fue la razón.

Los usos posibles son `huerta`, `pasturas`, `frutales`, `forestal` y `reserva`, con
`delta` entero entre −35 y +25. **La ficha pisa sólo el uso que nombra**, hereda el
resto, y puede agregar un uso que el bioma global no nombre.

---

## 6. Los cultivos, con el anexo corregido al lado

De los doce ids del lote 1, cinco no servían, y **tres salieron de copiar la
columna del medio —la del nombre— en vez de la primera**: `mijo_perla` por `mijo`,
`maiz` por `maiz_tropical`, `gandul` por `guandul`. El anexo ahora lo dice con esos
tres casos escritos.

La regla operativa, en una línea: **el id es siempre la primera columna, va entre
comillas y nunca tiene mayúsculas, acentos, barras ni espacios.** Si lo que vas a
escribir tiene cualquiera de esas cosas, estás copiando un nombre.

Y los otros dos del lote 1 —`cartamo` y `poroto_urad`— simplemente no están en el
catálogo. Hiciste bien en nombrarlos: **un cultivo que falta se nombra en `notas`,
no se reemplaza por un pariente.**

---

## 7. La entrega

Un solo archivo, `02.json`, una sola ficha, el bloque JSON y nada de prosa
alrededor. La forma es la del encargo grande. Lo que no puede faltar:

- `_meta.ecorregiones_resolve: [297]`
- `_meta.nombre_resolve: "North Deccan dry deciduous forests"`
- `_meta.paises: ["India"]`
- `_meta.confianza`
- `_meta.base_de_suelos_usada`, diciendo **qué se usó de verdad** y qué no se pudo
  abrir
- `verificacion`: qué dicen esas páginas, con sus palabras, sobre este lugar
- `saberes: []`, siempre
- siete especies con nombre común y binomial
- `modificadores_propuestos`, con el mecanismo, la fuente y la confianza

Y si algo no se consigue, va a `vacias` con lo que se buscó y dónde. **Mejor una
ficha que aguanta que una que rellena.**
