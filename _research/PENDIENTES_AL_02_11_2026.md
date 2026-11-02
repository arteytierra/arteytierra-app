# Todo lo que falta, al 02/11/2026

*Los números de este documento salieron de contar hoy contra el repositorio, no
de estimar. Donde no se midió, se dice.*

Esto no reemplaza a `PENDIENTES_ACEQUIA.md` —que es del 08/09/2026 y sigue siendo
el detalle técnico de cada deuda— ni a `_encargos/PLAN_FASES_ENCARGOS.md`, que es
la hoja de ruta de las seis fases. Es la lista corta y al día, repartida por
quién la puede hacer.

---

## Los números, medidos hoy

| Qué | Medido |
|---|---|
| Ecorregiones de RESOLVE con ficha | **433 de 846** |
| Prácticas fechadas | **446 entradas sobre 218 fichas**, de un catálogo de 257 |
| Fichas con cinco especies o menos | 164 |
| Fichas con el campo `suelos` abajo de 250 caracteres | 45 (23 de América, 22 de la base global) |
| Saberes territoriales activos | **2 de 85** |

El reparto de fichas por reino, que es lo que dice dónde duele:

| Reino | Con ficha | Total |
|---|---|---|
| Nearctic | 114 | 115 |
| Neotropic | 174 | 179 |
| Palearctic | 94 | 205 |
| Indomalayan | 35 | 106 |
| Afrotropic | **9** | 116 |
| Oceania | 6 | 24 |
| Australasia | **1** | 83 |
| Antarctica | 0 | 18 |

América está cerrada. Europa, Medio Oriente y el norte de África, cerrados. Lo
que falta es Asia, África tropical y Oceanía.

---

## 1. De GPT — cuatro pedidos listos para pegar

Están escritos, con las rutas probadas una por una, y copiados en
`C:\Arte y Tierra\encargos-gpt\reglas\`. Un chat nuevo y suelto por encargo, y
primero se pega `GPT_LOCAL_REGLAS.md`.

| Archivo | Qué pide | Qué desbloquea |
|---|---|---|
| `ENCARGO_FASE_6_LOTES_08_10.md` | las cinco prácticas que sólo necesitan otra URL, las tres fichas que hay que pedir por el polígono y no por el nombre, y las seis que faltan relevar | cierra el bloque 1 de prácticas: las 15 fichas de Indomalaya que siguen en cero |
| `ENCARGO_FASE_4_LOTES_04_06.md` | tres fichas: Sundarbans (323), bosques secos del Irrawaddy (294) y matorral espinoso del Decán (315) | **tres prácticas ya entregadas y verificadas que no se pueden montar porque la ficha no existe** |
| `ENCARGO_FASE_3_LOTE_02.md` | el ECO_ID 216, matorrales de mulga de Australia Occidental | el reino donde el modificador heredado está mal y hay una de las ganaderías extensivas más grandes del mundo |
| `ENCARGO_FASE_5_LOTE_02.md` | el ECO_ID 42, miombo seco, **más una tasa de rebrote publicada** | África tropical, y la tasa que le falta al uso `forestal` |

**Y hay dos pedidos escritos que nunca volvieron:** `ENCARGO_FASE_4_LOTE_02.md` y
`ENCARGO_FASE_4_LOTE_03.md`, el Decán central sobre vertisoles y la meseta sur
del Decán. Siguen válidos. El lote 3 tiene una corrección de hoy: la ruta de
EUDASM que recomendaba como lo mejor del pedido devuelve 200 con «Request
Rejected» adentro.

**Lo que sigue después, por orden de rendimiento:**

- **Fase 1, licencias y vías de dato** (`ENCARGO_FASE_1_LICENCIAS_Y_VIAS.md`). Es
  el más chico y el que más desbloquea: 2 saberes activos de 85, y una respuesta
  de una línea prende código ya escrito. Bloque A, las preguntas 4, 5 y 6; bloque
  B, las cinco; bloque C, los 81 saberes documentados sin geometría.
- **Fase 2, los ocho números sin fuente** (`ENCARGO_FASE_2_NUMEROS_SIN_FUENTE.md`).
  Ocho lugares donde la app imprime un número que nadie puede verificar.
- **Fase 5, África**, que es la más grande: después del 42 vienen 65, 34, 66, 64,
  38, 48, 47, 40, 41, 53, 43, 62, 44, 52, 58, 63, 61, 51, 57, 55, 54, 50, 45, 35,
  49 y 46, más el 37 y el 60 que van a `vacias`.
- **Fase 3, Australasia**: después del 216 sigue el bloque 1, los *rangelands*
  áridos: 191, 207, 212, 215, 209, 210, 211, 208 y 214.
- **Fase 6, bloques 2 y 3**: las fichas que tienen una sola práctica (dos cada
  una) y las que tienen dos (una cada una).

---

## 2. Mío, con código o con el navegador

En orden de cuánto cambia el resultado que ve un usuario.

### La deuda número uno de toda la cadena ganadera

**Wight y Hanks (1981) ya está abierto.** El 02/11/2026 se extrajo completo por
el `fetch` del mismo origen desde la página del ítem —los cuatro pasos dieron
200 a la primera— y quedó en `_research/WIGHT_HANKS_1981.md` con las siete
ecuaciones, la calibración y la Tabla 1 entera: doce años resueltos en Sidney,
Montana. El caso para el test está listo: la ecuación [1] con `Yp` = 1.300 kg/ha
reproduce la columna publicada dentro de un 0,4 %.

**Y el modelo dice que esto se hace en dos pasos, no en uno.** `Yp`, el
rendimiento potencial del sitio, no sale del modelo: incluye composición de
especies y fertilidad, se estima del dato de campo del sitio, y entre los dos
sitios del estudio difiere 2,1 veces. Entonces:

1. **Escribir `T/Tp`**, el índice de suficiencia hídrica, con balance diario y el
   test contra la Tabla 1. Acequia tiene las cuatro entradas que hacen falta:
   lluvia diaria, ETP, `AW` por capa y temperatura del suelo.
2. **Conseguir una fuente para `Yp`.** Ahí entra lo que ya está medido en
   `forrajeMedido.ts`: el Miami Model de Lieth con su forma de mínimo entre lluvia
   y temperatura, y la banda de fracción herbácea según el dosel.
3. **Recién entonces** se desconecta `prodForrajera`, que hoy es una escalera de
   cinco escalones sin fuente que multiplica la oferta, el balance, la carga, el
   rodeo y el agua de la represa, y que veinte lotes midieron equivocada entre
   **1,7 y 2,9 veces**.

Lo que falta además, y el artículo lo dice de sí mismo: su curva de LAI relativo
es de la pradera mixta del norte de las Grandes Planicies y **conviene desarrollar
una por región**, y sus curvas de actividad radicular por temperatura de suelo son
de Swift Current, Saskatchewan. Usarlas en el Chaco o en el miombo es extrapolar.

### Lo que el catálogo pide y nadie pidió

- **Partir dos fichas lumpeadas.** `java_bali_montano` cubre el ECO_ID 229 y el
  288 a propósito, y ahora conviven en ella el talún de bambú de Soreang y el
  *subak* de Batukaru, a mil kilómetros. `california_klamath_sierra_valle` junta
  cinco ecorregiones: 357, 366, 385, 423 y 425. Es trabajo río arriba, en
  `_research/`, porque los catálogos se regeneran desde ahí.
- **Renombrar o reencuadrar `pinar_toba`.** La ficha que se llama como el lago no
  contiene las orillas del lago —el 305 es el pinar de Kerinci, 400 km al sur— y
  mientras el nombre siga así va a seguir atrayendo prácticas del Toba. Van dos
  lotes seguidos.
- **Cuatro entradas de prácticas de Indomalaya necesitan fuente de reemplazo.**
- **Espesor**: 164 fichas con cinco especies o menos y 45 con el campo `suelos`
  corto. Es el bloque 2 y 3 del plan de América, y vale para todos los reinos.

### Motores de cálculo

- **Cinco cultivos para `lib/especies.ts`** con números con fuente: cártamo,
  poroto urad, tabaco, *finger millet* (*Eleusine coracana*) y poroto común de
  hábito arbustivo.
- **El balance hídrico no llega al informe.** Está calculado y no se muestra
  donde haría falta.
- **La pérdida por conducción no se descuenta** en ningún cálculo de riego.
- **Los picos de riego se suman como coincidentes**, cuando para viviendas la app
  ya usa un coeficiente de simultaneidad publicado con piso de 0,25.
- **La demanda de la huerta en 2 mm/día** no tiene fuente.
- **El motor de swales y keyline no consulta la ficha** antes de recomendar.
- **El reparto HWSD v2 / SoilGrids por ecorregión** necesita GIS.
- **La escalera de forraje**, paso uno: Coe et al. 1977 y Fritz y Duncan 1994, el
  umbral de 800 a 900 mm donde la relación se da vuelta. Está como tarea
  `task_85c50985`.
- **Suelo expansivo** (`task_451d1049`) y **riesgo sísmico en el informe**
  (`task_f5fb4573`).

### Herramientas y código

- **Swales dentro de un polígono**: la última herramienta abierta del lote C.
- **Los cinco asientos del plan Estudio**: no existen en la base, hoy se
  resuelven a mano. Es una feature, no un ajuste.
- **Cierre automático de trazado**: el camino ignora `elementoPoli` y
  `espejoPendiente`.
- **`MapaTerrenoApp.tsx`**: quedan los reducers de `useReliefShader` y del grupo
  de dibujo libre. Ver `PLAN-fase1-modularizacion.md`.
- **El proxy de teselas Terrarium sin guardar**: agujero conocido del tope por
  superficie; `grillaElevacion.ts` cae ahí cuando `/api/dem` no responde.
- **Un tercer espejo de Overpass** — pero la decisión es de Jonatan, porque
  implica mandarle coordenadas de predio a un tercero.
- **Saberes territoriales: 2 activos de 85.** Depende de la fase 1.

---

## 3. De Jonatan, y no se hace sin él

| Qué | Por qué |
|---|---|
| **Las cartas a los organismos de estadística** | Las manda él |
| **Las URL de webhook** en los paneles de Mercado Pago y PayPal | Panel de terceros |
| **Una transacción real controlada**: alta, primer cobro, cancelación en prueba, cambio de plan | Es el único bloque donde equivocarse cuesta plata |
| **Decidir si el cobro sigue abierto al público** o se restringe con `ACEQUIA_PAYMENTS_TEST_EMAILS` | Decisión comercial |
| **Cloudflare bloquea a ClaudeBot** por su cuenta | Se arregla en el dashboard; afecta al posicionamiento que ya está en producción |
| **Validar `/mapa` e `/informe/*`** | Están detrás de login y no se verifican desde el navegador del agente |
| **Pasos 6 a 9 del runbook de mudanza a acequia.app** | La web nueva está fuera del repo y no compila para Vercel |
| **`PLAN-embalse-vaso-real.md`, pasos 3 a 5** | Bloqueados en una decisión suya |
| **El tercer espejo de Overpass** | Manda coordenadas de predio a un tercero |

---

## 4. Cerrado, y conviene no reabrirlo

El encargo de forraje (24 lotes). El portal EDI de los LTER: 403 verificado en
cuatro endpoints, así que Konza, Jornada, Sevilleta y Shortgrass Steppe están
cerrados. Las 22 guías del catálogo NPP del ORNL que no se recuperan. CPER en
secano, el riego de Calabozo y los dos cortes de Ukulinga: inconfirmables. El
rastrojo de cultivo. Los sitios GIAHS de la FAO como geometría: no publican el
polígono, y si lo publicaran la licencia no serviría. Las cañadas reales del
MITECO: son líneas. Los límites de *crofting* escoceses: producto pago.
TIGER/Line para los saberes de EE.UU. Una tabla de K por clase en el AH-537. La
capacidad de carga por sistema de tierras del Pilbara. Las copias de acceso
abierto de ICRISAT de Pathak 2013 y Garg 2021. El NBSS&LUP, y ahora también
**EUDASM**, que contesta 200 con «Request Rejected» adentro. El commit malformado
`b5f85ed`: arreglarlo cuesta un *rebase* de todo septiembre.

Y las **22 fichas con `saberes: []` que son decisiones**, no huecos: ésas no se
tocan.
