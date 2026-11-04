# Fase 3 — lote 2: ECO_ID 216, Western Australian Mulga shrublands

*Va junto con `ENCARGO_FASE_3_FICHAS_AUSTRALASIA.md` y `ANEXO_IDS_CULTIVOS.md`.
Entregá un solo archivo, `02.json`, con una sola ficha. Fecha: 02/11/2026.*

---

## 1. Lo que pasó con el lote 1, porque cambia cómo se escribe éste

El lote 1 —el Pilbara, ECO_ID 213— **vino bien hecho y se montó**: cuatro URLs
que abren, siete binomiales correctos, el campo `suelos` con la base nombrada, y
una nota honesta explicando por qué `cultivos` quedó vacío. Es la primera entrega
del circuito que llegó completa.

**Y el modificador estaba al revés.** Ésa era la única parte que importaba del
lote, así que conviene entender por qué, porque éste es el mismo tipo de caso.

La entrega proponía `pasturas · delta 0 · pisa_global −15`, con esta razón: que
el informe pastoral del estado estima capacidades por sistema de tierras y
documenta manejo ganadero en el Pilbara, «por eso un castigo uniforme de
desierto no representa por sí solo el sistema productivo regional».

Las dos premisas son verdaderas. La conclusión no se sigue de ellas: **es un
argumento desde la existencia de un documento de manejo, no un mecanismo.**

Y el primario que la entrega citó sin abrir decía lo contrario. El *Technical
Bulletin 92* —el relevamiento oficial de la región, 181.723 km², 12.445
evaluaciones de campo, 102 sistemas de tierras— informa que el 77 % de la
vegetación del Pilbara está en estado bueno o muy bueno, contra el 39 % del
promedio de los *rangelands* de Australia Occidental. Leído de apuro, eso
confirma la entrega. El informe no deja leerlo de apuro, porque explica la
diferencia en la misma página: el buen estado se debe a las grandes superficies
de vegetación de valor pastoral bajo o muy bajo, es decir el espinifex. **El
Pilbara está en buen estado porque la mayor parte no se puede pastorear.** Lo
comestible vive en un octavo de la superficie, y ahí es exactamente donde el
informe mide el daño, la erosión y los 310 km² que recomienda sacar del uso
ganadero.

### Y hay una razón técnica por la que un cero ahí no era un matiz

En el código de acequia el delta regional **reemplaza** al global para ese uso:
no se suman. Un `delta: 0` no agrega cero, **saca la entrada del bioma y pone la
propia**, con lo cual la única advertencia que el usuario recibía sobre la carga
en un *rangeland* árido desaparecía. Proponer cero es borrar una advertencia, y
eso hay que querer hacerlo y decir por qué.

---

## 2. Dos cosas del encargo grande que arreglé hoy, y las dos eran mías

**a. El ejemplo de JSON traía puesta la respuesta de este lote.** Decía
literalmente `"id": "pilbara_mulga"`, `"nombre": "Matorrales de mulga del
Pilbara"`, `"ecorregiones_resolve": [213, 216]`, la mulga con su binomial, y el
modificador `pasturas · delta 0 · pisa_global −15` —que es, exactamente, la
propuesta que hubo que dar vuelta—. **El ejemplo es la instrucción más fuerte de
un documento**, más que las reglas numeradas: ya hizo que una entrega de la fase
5 devolviera el id, el nombre, el emoji, el color y el modificador del ejemplo,
con las descripciones investigadas alrededor. Está neutralizado. Si tenés una
copia vieja del encargo, **pedí la nueva**.

**b. Por lo mismo: 216 no se agrupa con 213.** El ejemplo las juntaba, y el
Pilbara ya está montado por su cuenta. Agrupar ecorregiones es legítimo cuando
describen el mismo sistema, pero ya se midió el costo de agrupar de más: dos
fichas del catálogo terminaron cubriendo ecorregiones a mil kilómetros una de
otra y ahora hay que partirlas. **Esta ficha es sólo el ECO_ID 216.**

---

## 3. Las rutas, probadas el 02/11/2026 una por una

| Ruta | Qué es | Estado medido |
|---|---|---|
| `https://library.dbca.wa.gov.au/Journals/082156/082156-84.pdf` | **Technical Bulletin 84**, el relevamiento oficial de la cuenca del Murchison | **200, PDF, 18.546.397 bytes** |
| `https://library.dpird.wa.gov.au/tech_bull/4` | la ficha del mismo boletín en el repositorio de DPIRD, con resumen y partes | 200, HTML |
| `https://library.dpird.wa.gov.au/lr_scsc/17` | *Pasture condition guides for the Murchison River catchment*, Fox y Eckersley | 200, HTML |
| `https://www.oneearth.org/ecoregions/western-australian-mulga-shrublands/` | la ficha de One Earth de esta ecorregión | 200, 61.367 bytes |
| `https://en.wikipedia.org/wiki/Western_Australian_Mulga_shrublands` | la entrada de Wikipedia | 200, 124.156 bytes |

El Technical Bulletin 84 es **el mismo tipo de documento que dio vuelta el lote
1**, para esta región: *An inventory and condition survey of the Murchison River
catchment, Western Australia*, de Curry, Payne, Leighton, Hennig y Blood, sobre
la campaña de campo de 1985 a 1988, publicado en 1994. Abre con descarga directa
y pesa 18 MB. **Es la fuente del lote.** La cuenca baja del Murchison se publicó
aparte como Technical Bulletin 96; si lo encontrás, vale.

---

## 4. La pregunta del lote

El relevamiento del Murchison **no** se parece al del Pilbara, y ahí está lo
interesante: encontró la vegetación en peor estado que cualquier otro
relevamiento de *rangeland* de Australia Occidental, y entre los tipos más
degradados nombra los matorrales halofíticos, los **matorrales de mulga sobre
hardpan** y los pastizales arbustivos sobre calcrete.

Eso **no es la respuesta**: es dónde está la tensión. Lo que se pide:

- Los números con los que el boletín lo afirma —qué porcentaje en qué estado,
  sobre cuántos puntos de evaluación, en cuántos sistemas de tierras—, igual que
  el del Pilbara. Si aparecen dos evaluaciones con cifras distintas, **las dos
  con su año**, no la más alta.
- **Qué parte de la superficie es realmente pastoreable**, que es la pregunta que
  dio vuelta el lote 1. Una capacidad de carga promedio no significa lo mismo
  donde lo comestible es un octavo que donde es la mitad.
- Las capacidades de carga recomendadas que el boletín publica por arrendamiento
  o por sistema de tierras, **con las unidades que el boletín usa** y con su año.
  La propia página de DPIRD avisa que el contenido puede estar desactualizado y
  en revisión: eso se dice en la ficha, no se esconde.
- Y una pregunta específica, porque acequia calcula sobre esto: **¿el boletín
  dice algo sobre bancos de contención, difusión de agua o encauzamiento del
  escurrimiento laminar en la planicie de hardpan?** En este sistema hay
  literatura que midió que canalizar la lámina no dio más agua abajo y mató mulga
  por falta de agua. Si el boletín lo trata, es un hallazgo de primera; si no lo
  trata, se dice que no lo trata.

---

## 5. El modificador: contra qué compite

Bioma 13, desierto y matorral xérico. Hoy hereda `pasturas −15`, con esta razón:
«la carga que aguanta es baja y el error se paga con desertificación».

Van el `delta` y el `pisa_global`, los dos. El mecanismo y no la conclusión, la
fuente abierta, la confianza declarada. **Confirmar vale igual que corregir**: si
el boletín sostiene el −15, eso convierte un delta heredado en un delta
respaldado, que es justamente lo que esta fase vino a hacer. Y si corresponde
moverlo, que lo mueva un mecanismo —qué come el ganado, dónde vive eso, qué pasa
cuando se lo pastorea—, no la existencia de una industria.

Los usos son `huerta`, `pasturas`, `frutales`, `forestal` y `reserva`, con
`delta` entero entre −35 y +25. La ficha pisa sólo el uso que nombra y hereda el
resto.

---

## 6. La entrega

Un solo archivo, `02.json`, una sola ficha, el bloque JSON y nada de prosa
alrededor. Lo que no puede faltar:

- `_meta.ecorregiones_resolve: [216]` —sólo 216—
- `_meta.nombre_resolve: "Western Australian Mulga shrublands"`
- `_meta.paises`, `_meta.confianza`
- `_meta.base_de_suelos_usada`, diciendo qué se usó de verdad y qué no abrió
- `verificacion`: qué dicen esas páginas, con sus palabras, sobre este lugar
- `saberes: []`, siempre
- siete especies con nombre común y binomial
- `cultivos` con ids del anexo; si la región no cultiva, la lista vacía y la
  razón en `notas` —el lote 1 hizo eso y estuvo bien—
- `modificadores_propuestos`, con el mecanismo, la fuente y la confianza

**Mejor una ficha que aguanta que una que rellena.**
