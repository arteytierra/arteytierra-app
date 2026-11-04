# Fase 5 — lote 2: ECO_ID 42, Dry miombo woodlands

*Va junto con `ENCARGO_FASE_5_FICHAS_AFRICA.md` y `ANEXO_IDS_CULTIVOS.md`.
Entregá un solo archivo, `02.json`, con una sola ficha. Fecha: 02/11/2026.*

---

## 1. Lo que pasó con el lote 1, y por qué este lote es el caso difícil

El lote 1 fue el miombo **húmedo** —ECO_ID 39 y 36, agrupados en una ficha— y se
montó. La entrega estuvo bien escrita: las seis URLs abren, las descripciones son
textuales de las fuentes, y lo que no tenía lo declaró sin adornos («no se
extrajeron repartos comparables de HWSD v2 y SoilGrids», «la estimación de 15
hectáreas por unidad animal procede de una referencia histórica sobre miombo en
Mozambique; no se extrapola como tasa uniforme») y con `confianza: "baja"`.

**Y el modificador que confirmó estaba mal, y lo decían sus propias fuentes.**

El bioma 7 —sabana y pastizal tropical— hereda `pasturas +20` con esta razón: «es
un bioma de gramíneas y pastoreo: el sistema pastoril es el nativo, no un
reemplazo». **El miombo no es un bioma de gramíneas**: es un bosque de
Caesalpinioideae con un estrato herbáceo estacional. Las fichas que la propia
entrega citó dicen que hay baja densidad de grandes mamíferos por la estación
seca dura, las sequías largas y los suelos pobres, «which results in vegetation
of low nutrient content»; que la población humana es baja por los suelos pobres y
por la **mosca tsetse**, vector de tripanosomiasis en humanos y en ganado
doméstico; y que los parches de mejor pastoreo están dispersos y **asociados a
ríos y humedales**.

Y la carga de 15 ha por unidad animal que la entrega usó como respaldo del `+20`
es, en su propia fuente, **la peor fila de la tabla**:

| formación | hectáreas por unidad animal |
|---|---|
| **miombo** | **15** |
| sabana de *Urochloa* (tipo Combretum-Acacia) | 6 a 8 |
| pastizal aluvial inundable | 3 a 4 |
| bajos herbáceos sobre suelo pesado, Chokwe | 2,3 |

Un relevamiento de campo del mismo informe —139 parcelas— ordena 24 comunidades
por carga y pone al miombo húmedo alto y cerrado **último**, con 18 ha/LSU. El
miombo es el piso de su propio bioma para pastoreo, no el techo. El `+20` quedó
en **0** para esa ficha: no bajó a negativo porque el pastoreo extensivo existe y
es real, en los parches, sobre ríos y humedales, el *dambo*.

### Y la otra razón de la entrega no era lo que parecía

Citaba que la ficha «señala que se propone aumentar la producción ganadera». La
frase existe y dice: aumentar la producción ganadera para bajar el precio de la
carne y así **reducir la caza furtiva**. Es una acción prioritaria de
conservación, no una medición de la capacidad de carga de la tierra. **Una
recomendación de política no es un dato.**

---

## 2. El arreglo del encargo, que era mío

El ejemplo de JSON del encargo de la fase 5 traía el modificador resuelto:
`"uso": "pasturas", "delta": 20, "pisa_global": 20, "razon": "Confirmado, con el
mecanismo y la carga publicada que lo sostiene.", "confianza": "alta"`. La
entrega devolvió exactamente eso. **No es que haya copiado: es que no había nada
que decidir.** Está neutralizado; si tenés una copia vieja del encargo, pedí la
nueva.

**Y la trampa de este lote es la simétrica.** Ahora que el miombo húmedo quedó en
`pasturas 0`, lo fácil es copiar ese cero acá. **No se copia.** Éste es el
miombo seco, que es otro sistema: menos lluvia, estrato herbáceo distinto, otra
relación con el *dambo* y con el cinturón de tsetse. Si el cero corresponde, que
lo sostenga la literatura del miombo seco; si corresponde otra cosa, también.

---

## 3. Las rutas, probadas el 02/11/2026

| Ruta | Qué es | Estado medido |
|---|---|---|
| `https://www.oneearth.org/ecoregions/dry-miombo-woodlands/` | la ficha de One Earth de esta ecorregión | 200, 66.602 bytes |
| `https://www.cifor-icraf.org/knowledge/publication/` | el buscador de publicaciones de **CIFOR-ICRAF**, que es quien más publicó sobre miombo | 200, 429.649 bytes |
| `https://www.fao.org/3/ad652e/ad652e00.htm` | *Global Ecological Zoning for the Global Forest Resources Assessment 2000*, FAO | 200 |

**Ojo con CIFOR:** `cifor-icraf.org/publications/` devuelve **403**;
`cifor-icraf.org/knowledge/publication/` abre. Es la misma institución y dos
rutas distintas.

Y una regla nueva que vale para todo el circuito: **un 200 no significa que la
página abrió.** El archivo de suelos del JRC europeo —EUDASM— contesta hoy código
200 con un cuerpo de 244 bytes que dice «Request Rejected». La fuente se confirma
leyendo el contenido.

---

## 4. Lo que se pide además de la ficha

Este lote tiene un encargo extra, que es una deuda vieja del cálculo: **una tasa
de rebrote del miombo, publicada, para el uso `forestal`.**

Hoy acequia no tiene ninguna. Lo que hace falta es una de estas dos formas, con
la que la fuente use:

- **toneladas de materia seca por hectárea y por año** de biomasa aérea
  acumulada después de un corte, con la edad del rodal y cuántos años duró el
  seguimiento; o
- **el porcentaje de la biomasa del bosque maduro** que el rebrote recupera a los
  *n* años, con el *n* y con la biomasa del maduro.

Y lo de siempre: la serie junto con el número, no sólo el promedio; el rango de
validez —lluvia anual, suelo, si hubo fuego, si hubo pastoreo—; y qué mide
exactamente, porque acá está el error más caro del circuito anterior: **la fuente
correcta midiendo otra magnitud.** Biomasa en pie no es producción anual, y
biomasa aérea de árboles no es el estrato herbáceo.

**La pista, sin URL porque no se citan DOI de memoria:** hay trabajo de
Chidumayo en Zambia central sobre el desarrollo del bosque de
*Brachystegia-Julbernardia* después de la tala rasa, con el argumento de alta
resiliencia, y hay estudios de cronosecuencia de miombo en rebrote en Mozambique.
Buscalos, abrilos, y si lo que abre no trae la tasa, decilo: **un hueco explicado
vale.** Va en `_meta.notas` o como una entrada aparte, con sus campos de unidad y
rango.

---

## 5. El modificador: contra qué compite

Bioma 7. Hoy hereda:

- `pasturas +20`
- `huerta −10`

Van los dos en la propuesta, con `delta` y `pisa_global`. El mecanismo y no la
conclusión. Para `pasturas`, el mecanismo tiene que decir **qué come el ganado,
dónde vive eso dentro de la ecorregión y qué fracción de la superficie es**; para
`huerta`, qué hace el suelo y qué hace la estación seca. Si el miombo seco
sostiene un uso que el bioma global no nombra —`forestal`, por ejemplo, que la
sabana no trae— se puede agregar, pero con un mecanismo propio de acá.

Los usos son `huerta`, `pasturas`, `frutales`, `forestal` y `reserva`, con
`delta` entero entre −35 y +25.

---

## 6. La entrega

Un solo archivo, `02.json`, una sola ficha:

- `_meta.ecorregiones_resolve: [42]`
- `_meta.nombre_resolve: "Dry miombo woodlands"`
- `_meta.paises`, `_meta.confianza`
- `_meta.base_de_suelos_usada`, diciendo qué abrió de verdad y qué no
- `verificacion`: qué dicen esas páginas, con sus palabras, sobre este lugar
- `saberes: []`, siempre
- siete especies con nombre común y binomial
- `cultivos` con ids del anexo
- `modificadores_propuestos`, con el mecanismo, la fuente y la confianza
- la tasa de rebrote si la conseguiste, o por qué no

**Mejor una ficha que aguanta que una que rellena.**
