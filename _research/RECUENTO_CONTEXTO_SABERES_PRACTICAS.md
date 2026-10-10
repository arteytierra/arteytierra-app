# Recuento — contexto y entorno, saberes y prácticas agropecuarias

*10/10/2026. Todos los números de este archivo se midieron contra el repositorio
y contra `origin/`, no contra lo que decía el documento anterior. Dos cosas que
figuraban como pendientes estaban cerradas y una que figuraba como cerrada no
llegó nunca a producción; está anotado dónde.*

Los scripts que lo midieron están al pie, para poder repetirlo.

---

## El titular: 207 prácticas escritas, verificadas y que nadie ve

Antes de encargar nada nuevo. La rama **`origin/claude/practicas-enumeradas`**
tiene **408 prácticas** en `apps/terreno/lib/practicasHistoricas.ts`; `main`
tiene **201**. Son 24 commits, el último `c56cc4d` del 03/10/2026.

```
origin/main ... origin/claude/practicas-enumeradas → 45 atrás, 24 adelante
main no tocó practicasHistoricas.ts desde la bifurcación → el archivo entra sin conflicto
```

**Esto no es un encargo para GPT: es un merge.** Doscientas siete entradas ya
escritas con su fuente abierta valen más, hoy, que doscientas por escribir, y
cuestan una tarde en vez de un mes. Va primero y lo hago yo.

El encargo de cierre de esa rama está en `_encargos/PROMPT_PRACTICAS_CIERRE.md`
y sigue vigente para lo que falta (192 entradas para que ninguna ficha quede con
menos de tres), pero recién tiene sentido después del merge.

---

## 1. El ecosistema de base — 417 ecorregiones sin ficha

Medido contra las 846 ecorregiones de RESOLVE con reino declarado:

| Reino | Con ficha | Total |
|---|---|---|
| Neotropic | 174 | 179 |
| Nearctic | 114 | 115 |
| Palearctic | 94 | 205 |
| Indomalayan | 34 | 106 |
| Oceania | 6 | 24 |
| Afrotropic | 7 | 116 |
| Australasia | 0 | 83 |
| Antarctica | 0 | 18 |
| **Total** | **429** | **846** |

Indomalaya pasó de 1 a 34 desde el recuento de septiembre, que es el único
movimiento grande. Lo que sigue en cero o casi es **Australasia (83),
el Afrotrópico (109) y el Asia paleártica (111)**.

Un predio en una ecorregión sin ficha no ve un error: ve el bioma global, que
promedia un continente. El orden de prioridad y el motivo de cada uno ya están
razonados en `COBERTURA_MUNDO.md` y no cambió: pega más donde el modificador
global dice algo que es falso justo ahí —los rangelands áridos australianos
heredando `pasturas -15` del desierto, la estepa kazaja heredando `huerta +10`—
que donde sólo falta profundidad.

**Esto es el encargo más grande del catálogo y el más caro.** No arranca hasta
que vuelva limpio un lote de los chicos de abajo.

## 2. Las fichas que existen pero no sostienen un razonamiento

Tres carencias medidas, y la tercera es la que más importa:

| | Fichas | Dónde |
|---|---|---|
| Con 5 especies nativas o menos | **164** | Indomalaya 31 · EuropaUE 28 · MedioOriente 28 · América 23 · base 22 · NorteÁfrica 14 · Canadá 10 · Europa 8 |
| **Sin ninguna fuente propia del lugar** | **62** | EuropaUE 23 · MedioOriente 23 · NorteÁfrica 13 · Canadá 3 |
| Con `suelos` en menos de 250 caracteres | **45** | América 23 · base 22 |

Las 5 especies no son un olvido: son la plantilla con la que se relevó. Pero una
ficha con cinco plantas no alcanza para elegir qué plantar.

**Las 62 sin fuente propia son el problema serio**, y es distinto de no tener
fuente: tienen tres o cuatro, pero son las mismas tres o cuatro de todo el
paquete —RESOLVE en 111 fichas, HWSD en 68, SoilGrids en 50—. La ficha queda
*trazable y no verificable*: no hay dónde ir a chequear lo que esa ficha
concreta afirma de ese lugar concreto. Es el bloque donde una afirmación
equivocada puede vivir años.

El primer criterio que usé para medirlo daba **79** y estaba mal: contaba como
genérica toda constante en mayúsculas, y `PEI_ROTACION` es la ley de rotación de
la papa de la Isla del Príncipe Eduardo. Son constantes porque se escriben una
vez, no porque sean genéricas. El criterio que vale es **cuántas fichas
comparten la fuente**: de cinco en adelante es marco del paquete, de una a
cuatro es del lugar. El umbral es discutible y por eso el script imprime las dos
listas con los nombres.

El texto de `suelos` importa más de lo que parece: es de donde sale el
razonamiento de la aptitud. Una ficha que dice dos líneas de suelo no puede
sostener una corrección de aptitud.

## 3. Las prácticas — 54 fichas sin ninguna, y 32 son un hueco real

254 fichas en total (242 regionales + 12 a mano en `contexto.ts`). **200 tienen
práctica fechada, 54 no**, y hay que partir esas 54 en dos:

- **32 son las de Indomalaya**, montadas en septiembre y que nunca pasaron por
  el relevamiento de prácticas. Es un hueco, y es el encargo más limpio que hay:
  el formato está fijado, hay 200 ejemplos escritos y las fichas ya nombran la
  vegetación y el suelo de cada lugar.
- **22 son decisiones**, con el motivo escrito una por una en
  `COBERTURA_COMPLEMENTO_F_CIERRE.md`: islas oceánicas sin agricultura
  documentada, manglares y desiertos donde la bibliografía habla de un país
  entero y no de la ecorregión. No son un pendiente. Si aparece una fuente
  nueva se agregan; buscarla a propósito ya se intentó.

Son `bosque_seco_panameno`, `californias_chaparral_costero`,
`hispaniola_seco_pinar_humedales`, `matorral_xerico_caribeno`,
`montanas_mayas_pino_encino`, `pacifico_sur_chiapas_bosque_seco`,
`revillagigedo_ecosistemas_insulares`, `sabanas_pino_belice_mosquitia`,
`tamaulipas_texas_pastizal_mezquital`, `golfo_persico_mangle`,
`mar_rojo_escarpe`, `caspio_llanura_desertica`, `sahara_occidental_erg`,
`uweinat_tibesti`, `bosque_juan_fernandez`, `bosque_seco_mato_grosso`,
`campinaranas_aguas_negras`, `isla_malpelo_xerica`, `islas_desventuradas`,
`mata_atlantica_seca`, `matorrales_xericos_caribe_suramericano` y
`pantepui_guayana_alta`.

## 4. Los saberes territoriales — 2 activos de 85, y no es un problema de datos

85 saberes documentados, los 85 con fuente. Por estado: **2 aprobados**
(`cac_quesungual`, `polder_y_waterschap`), 2 marcados
`cartografia_oficial_sin_licencia` y **81 documentados sin geometría**.

La capa está construida, probada y conectada. Lo que falta no es código ni
texto: es **permiso**, y de dos clases distintas.

- **Los que necesitan una licencia.** España está bloqueado dos veces —la
  cartografía de las cañadas es de **líneas**, y un punto no cae dentro de una
  línea— y el Reino Unido no tiene geometría abierta. Quedan los **sitios
  SIPAM/GIAHS de América** (chinampas de Xochimilco, metepantle de Tlaxcala,
  chakra amazónica de Napo, Viñales): la FAO publica el polígono y **nadie
  verificó bajo qué licencia**. Eso sí es un encargo, y es de una tarde.
- **Los que necesitan un acuerdo.** Los saberes de pueblos originarios de
  Sudamérica, Mesoamérica y Estados Unidos no se activan por conseguir el mapa.
  El polígono es la mitad del permiso; la otra mitad es el acuerdo de quien
  porta el saber. **No se encarga a nadie: se conversa**, y no lo puede hacer
  una sesión de chat.

Y hay una decisión que es de Jonatan y no del código: si `LICENCIAS_ADMITIDAS`
acepta `OGL-3.0` y las licencias de atribución propias de un organismo público.
Aclaro que ampliarla **no desbloquea** ni al español ni al británico.

## 5. Pueblos originarios — el dato existe y lo que falta es la carta

Siete países con dato local montado. El resto entra como **una cifra nacional
citada**, que es la distinción que destrabó la mitad del asunto: decir un número
citando la fuente no es redistribuir un dataset; montar la tabla de 1.100
municipios sí.

Lo que falta ahí son **las cartas a los organismos de estadística** (Bolivia,
Colombia, Ecuador, Uruguay) y la licencia del censo de Estados Unidos, donde el
dato está publicado hasta el bloque y lo único que no hay es una licencia
declarada. **Las cartas las manda Jonatan** —están escritas— y eso no es
delegable a GPT ni a mí.

## 6. Prácticas agropecuarias: la deuda número uno del cálculo

Es la que más plata mueve y la que menos se ve.

```ts
function prodForrajera(precip_mm: number): number {   // kg MS/ha/año
  if (precip_mm < 300) return 700;
  if (precip_mm < 500) return 1500;
  if (precip_mm < 700) return 3000;
  if (precip_mm < 900) return 5000;
  return 7000;
}
```

Cinco escalones por lluvia anual, **sin ninguna fuente**, y **triplicada**:
`produccion.ts`, `forrajePorLluvia` en `pastoreo.ts` y `forraje_sugerido` en
`cobertura.ts`. Multiplica todo lo que viene después —la oferta, el balance
forrajero, la carga animal, el tamaño del rodeo y el agua de la represa—, así
que el balance forrajero tiene la precisión de esta escalera y no más, por bien
calculado que esté el resto.

Y falsea en la dirección peligrosa: la lluvia anual no distingue un pastizal
templado de 600 mm repartidos de uno tropical de 600 mm en cuatro meses, y le
da a los dos 3.000 kg.

**Esto es un relevamiento, no una fórmula**, y es el mejor encargo de toda la
lista: productividad primaria neta de pastizales y series de materia seca de los
organismos regionales (INTA, EMBRAPA, NRCS, CSIRO, FAO). Encargado en
`_encargos/ENCARGO_FORRAJE.md`.

Bloquea tres etapas del plan de diseño de predio.

## 7. Contexto y entorno del predio — está sano, y su límite es el dato

`lib/contextoActual.ts` resuelve qué actividad industrial hay alrededor, a qué
distancia y en qué rumbo, por OpenStreetMap bajo ODbL: minería,
hidrocarburos, energía, residuos, industria, agroindustria, cultivo declarado e
infraestructura, con los ductos y las líneas medidos contra la traza y no contra
el centro de su caja. No se nombra a nadie, y eso está garantizado por la
estructura y no por una promesa.

**No tiene pendientes de código.** Su límite no se arregla programando: el
relevamiento de OSM es desparejo y en buena parte de Sudamérica la minería chica
y los pozos no están cargados. La app ya distingue "no encontré" de "no pude
preguntar" y nunca escribe "no hay".

Lo único que podría sumar es **cargar en OSM lo que falta alrededor de los
predios que ya analizamos**, que es trabajo de campo y de una cuenta de OSM, no
de una sesión de chat. Queda anotado y sin encargo.

---

## El orden, y por qué

1. **El merge de las 408 prácticas.** Mío, una tarde, y duplica lo que el
   usuario ve en esta capa. Nada más empieza antes.
2. **Las licencias**: los polígonos SIPAM/GIAHS de la FAO y el censo de EE.UU.
   Es la clase de trabajo donde una respuesta de una tarde desbloquea meses, y
   es un encargo chico. `_encargos/ENCARGO_LICENCIAS.md`.
3. **El forraje.** La deuda número uno del cálculo. `ENCARGO_FORRAJE.md`.
4. **Las prácticas de Indomalaya**, 32 fichas. `ENCARGO_PRACTICAS_INDOMALAYA.md`.
5. **Las fuentes propias de las 62 fichas.** `ENCARGO_FUENTES_PROPIAS.md`.
6. **Las especies de las 164 fichas**, por tandas, de fondo.
7. **Australasia, el Afrotrópico y el Asia paleártica.** No antes de que uno de
   los chicos vuelva limpio: es el único encargo donde equivocarse cuesta un mes.

Los cuatro encargos escritos usan el circuito de
`_encargos/GPT_LOCAL_REGLAS.md`: carpeta local, sin acceso al repositorio, sin
GitHub y entrega en JSON que se valida con un script antes de montarse.

---

## Dos cosas que este recuento corrigió del anterior

**Las correcciones 1.1 y 1.2 del curso ya están hechas.** Figuraban como
bloqueadas esperando la tabla de agua por temperatura de NASEM 2016.
`lib/aguaGanado.ts` la tiene montada celda por celda, con dos publicaciones
independientes que se validan entre sí (NDSU AS1763 y KSU/OSU MF3303), y el
caudal de pico salió por `lib/abrevadero.ts` con la nota técnica del NRCS. No
hay nada que esperar ahí.

**Las fuentes por saber de los 26 europeos están cerradas** desde el 23/09/2026:
los 85 saberes tienen fuente, ninguno quedó con `fuentes: []`.

---

*Cómo se midió, para repetirlo:*

```bash
# cobertura de fichas contra RESOLVE, sin red
node _research/medir-cobertura-fichas.mjs
# espesor de cada ficha: especies, fuentes propias, largo de suelos
node _research/medir-espesor-fichas.mjs
# prácticas en main contra la rama
grep -c '^      practica: ' apps/terreno/lib/practicasHistoricas.ts
git show origin/claude/practicas-enumeradas:apps/terreno/lib/practicasHistoricas.ts | grep -c '^      practica: '
```
