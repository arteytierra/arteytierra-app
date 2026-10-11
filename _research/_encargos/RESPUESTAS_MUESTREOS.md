# Muestreos de las entregas de GPT

El validador chequea la forma. Lo que no puede chequear ningún script es si la
fuente dice lo que la entrada dice, y para eso el validador sortea **una de cada
diez entradas con semilla fija** y exige abrirla. Acá queda lo que pasó al
abrirlas, lote por lote.

| Encargo | Lote | Forma | Muestreo | Veredicto |
|---|---|---|---|---|
| licencias | 01 | limpia | `giahs_chakra_napo` ✅ | **cerrado**, ver `RESPUESTAS_LICENCIAS.md` |
| forraje | 01 | limpia | `bosque_tropical_seco` ✅ | **no se monta**, ver `RESPUESTAS_FORRAJE.md` |
| fuentes-propias | 01 | limpia | `iliria_adriatico` ✅ | **se monta** |
| practicas-indomalaya | 01 | limpia | `ghats_norte_montano` ⛔ | **vuelve** |

---

## fuentes-propias, lote 01 — pasa

Seis fichas de los Apeninos a los Cárpatos, una fuente local cada una y seis
dominios distintos: el repositorio de Bolonia, la revista de la facultad de
forestales de Sarajevo, los documentos del Parque Nacional de Plitvice, la
Universidad de Plovdiv, Forests (MDPI) y un plan de manejo rumano. Eso es
exactamente lo que «fuente propia del lugar» quiere decir, y es lo contrario del
problema que el encargo venía a resolver —fichas sostenidas sólo por marcos
generales de todo el paquete—.

**El muestreo cayó en `iliria_adriatico` y aguantó.** La entrada dice que el plan
territorial de Plitvice registra ahí los hábitats Natura 2000 de bosques ilirios
de haya (91K0) y de roble y carpe (91L0). Bajé el PDF —5 MB, 8.436 líneas de
texto— y los dos están.

Vale contar cómo, porque es donde se podía resbalar: en la tabla de hábitats
objetivo la extracción desalinea las columnas y deja `91K0` pegado a «Travnjaci
beskoljenke (Molinion caeruleae)», que es un prado de *Molinia* y es el código
6410. Leída así, la entrada parecía equivocada. Alineando la lista de códigos con
la de nombres, 91K0 es «Ilirske bukove šume (Aremonio-Fagion)». Y más adelante el
documento lo dice en inglés y bien alineado, sin lugar a interpretación:

> 91KO  Illyrian Fagus sylvatica forests (Aremonio-Fagion)
> 91LO  Illyrian oak-hornbeam forests (Erythronio-carpinion)

Además la entrada aclara en `nota` que es una fuente local del parque y **no un
inventario de toda la ecorregión**, que es la cautela correcta y muestra que
entendió qué se estaba pidiendo.

Las seis URL abren, salvo la de Bolonia, que devuelve 403 a `curl` y una
verificación anti-bot de Cloudflare en el navegador. El enlace está bien —es un
handle institucional, un identificador estable— pero **esa hay que abrirla a
mano**: acá no se resuelven verificaciones de bots.

## practicas-indomalaya, lote 01 — vuelve, y no por mentir

Diez prácticas sobre cuatro fichas de los Ghats occidentales, que es la forma
correcta: `PRACTICAS_POR_FICHA` es un `Record<fichaId, PracticaHistorica[]>` y los
cuatro ids existen en el catálogo. (El validador lo había rechazado por «id
repetido»; el error era del validador y está arreglado.)

**El muestreo cayó en `ghats_norte_montano` y no se pudo verificar.** Sus dos
entradas cuelgan de un solo PDF en `oaji.net`, y **todo el host está en 502** —no
el archivo: la raíz del sitio también—, en tres intentos y desde el navegador.
Eso es una caída ajena y no una URL inventada.

Buscando el artículo por su título aparece que existe: R.S. Bhohale (2013),
*International Journal of Science and Engineering*, vol. 1 núm. 2, **páginas
69-70**. Dos detalles que conviene separar:

- **A favor de la entrega:** el rótulo copia el título exacto, incluida la errata
  de la revista («Tribal **Trace** Areas» donde debería decir *Tract*). Eso es
  propio de haber visto el registro, no de haberlo imaginado.
- **En contra de montarlo:** son **dos páginas** en el número 2 del volumen 1 de
  una revista sin presencia indexada, llegada por un agregador que hoy no
  responde. Sobre esa base la entrada afirma una tabla histórica de superficie y
  producción 2005–2009 y un régimen de manantiales y pozos. No se puede abrir, así
  que no se puede desmentir, y una afirmación que no se puede desmentir es
  justamente lo que este archivo no acepta.

Y mirando el lote completo apareció algo más: **dos entradas se sostienen sólo en
`villagesquare.in`**, un sitio de periodismo. No es Wikipedia y el test no lo
rechaza, pero conviene medirlo contra lo que el catálogo ya usa: `practicasHistoricas.ts`
tiene **416 URLs sobre 123 dominios** —85 de PMC, 47 de la FAO, 30 de UNESCO, 27
del NPS, SciELO, Frontiers, Ecology & Society— y **ninguna de periodismo**. Serían
las dos primeras. Ese piso lo fijó el archivo con la práctica, no una preferencia
de ahora.

### Qué vuelve y qué se queda

De las diez, **seis están en línea con el catálogo**: las dos de la meseta de
Nilgiri (repositorio White Rose), el manejo del mosaico de pastizal (ATREE), los
bosques sagrados del sur (Nature Conservation Foundation) y las dos de
ResearchGate, que hay que resolver a su publicación de origen porque ResearchGate
es un host y no una fuente.

**Vuelven cuatro:** las dos de Mahabaleshwar y las dos de `villagesquare.in`. No
hay que reescribir el lote: hay que reemplazar la fuente de esas cuatro, o
dejarlas en `vacias` con el motivo. Una ficha con dos prácticas sostenidas vale
más que una con tres donde una no se puede chequear.
