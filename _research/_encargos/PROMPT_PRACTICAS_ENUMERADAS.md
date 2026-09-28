# Encargo — prácticas agropecuarias enumeradas por ecorregión

Escrito el 28/09/2026. **Este archivo es el prompt completo: se pega tal cual en
la sesión nueva y no hace falta nada más.**

Reemplaza en alcance —no en reglas— al encargo `PROMPT_GPT_PRACTICAS_TERRITORIO.md`,
que cerró con 201 entradas. Las reglas de ese archivo siguen vigentes todas y
están repetidas acá para que esta sesión no tenga que ir a buscarlas.

> **Nota de versión.** Este archivo se llamaba `PROMPT_NUBE_PRACTICAS_ENUMERADAS.md`
> y daba por sentado que la sesión corría en la nube. El 28/09/2026 una sesión de
> nube intentó el lote 1 y no pudo escribir **ninguna** entrada: la política de
> red de ese entorno rechazaba los dominios académicos, y además el GitHub App no
> tenía permiso sobre el repo, así que tampoco podía pushear. Perdió la sesión
> entera descubriéndolo. De ahí salen las dos secciones nuevas: **el preflight**
> y **cómo se abre una fuente**. Leelas antes que nada.

---

## Quién sos y dónde trabajás

Sos una sesión de Claude Code trabajando sobre el monorepo de Arte y Tierra.

- **Repositorio:** `https://github.com/arteytierra/arteytierra-app`
- **Rama de la que partís:** `main`
- **Rama en la que trabajás:** creá `claude/practicas-enumeradas` y quedate ahí
  toda la sesión. **Nunca pushees a `main`.** Al terminar cada lote, pushés tu
  rama y nada más. El merge lo hace otra sesión después de verificar.
- **Se escribe todo en español argentino**: el código, los comentarios y los
  mensajes de commit. Vos y quien revisa hablan así.

Antes de tocar nada, leé `CLAUDE.md` en la raíz y
`apps/terreno/lib/README.md`. Son el contrato del repo y valen más que este
archivo si alguna vez se contradicen.

### Tu propio worktree

Hay otras sesiones sobre el mismo árbol y el índice de git es compartido. Armate
el tuyo apenas arranques y quedate ahí:

```bash
git -C "C:/Arte y Tierra/0. Claude" worktree add ".claude/worktrees/practicas" -b claude/practicas-enumeradas
cd "C:/Arte y Tierra/0. Claude/.claude/worktrees/practicas"
cp "C:/Arte y Tierra/0. Claude/apps/terreno/.env.local" apps/terreno/.env.local
cp "C:/Arte y Tierra/0. Claude/apps/web/.env.local"     apps/web/.env.local
pnpm install
```

Un worktree nuevo sólo trae lo que está en git: le faltan los `.env.local` y
`node_modules`. Los `.env.local` están ignorados a propósito y **nunca se
commitean**.

---

## El preflight, antes de buscar la primera fuente

**Tres minutos, cinco comprobaciones, y ninguna entrada escrita hasta que las
cinco pasen.** Esto existe porque una sesión entera se fue en averiguar que el
entorno no servía. Si alguna falla, **parás y avisás**: no hay forma honesta de
seguir sin red o sin poder pushear, y simular que sí la hay es peor que no
empezar.

1. **¿Resuelve un DOI?**
   `WebFetch` sobre `https://doi.org/10.5194/hess-11-1633-2007`. Tiene que
   redirigir a `hess.copernicus.org` y, al seguir el redirect, decir
   *Updated world map of the Köppen-Geiger climate classification*. Si no
   resuelve, no tenés red útil.
2. **¿Buscás?** Una `WebSearch` cualquiera que devuelva resultados.
3. **¿Abrís una página que le dice que no al fetcher?** Abrí cualquier artículo
   de `scielo.cl` en el panel del navegador y leelo con `get_page_text`. Tiene
   que traer el texto completo. Esto es lo que decide si podés trabajar con las
   fuentes latinoamericanas, que son la mitad del encargo.
4. **¿Podés pushear?** `git push origin claude/practicas-enumeradas` con la rama
   recién creada y vacía. Si da 403, no sigas: todo lo que escribas se va a
   quedar en un commit local que nadie va a ver.
5. **¿Corre la compuerta?** `pnpm typecheck` una vez, en frío. Si `pnpm install`
   quedó a medias te vas a enterar acá y no cuatro horas después.

Anotá el resultado de los cinco en la primera línea de tu primer
`COBERTURA_LOTE_NN.md`. Al que venga después le ahorra la misma tarde.

---

## Cómo se abre una fuente

La regla de oro del encargo es que **la URL se abre antes de escribirla**. Esa
regla no se negocia, pero hay que saber abrirla: un servidor que contesta `403`
**no es un dominio bloqueado**, y confundir las dos cosas hace abandonar fuentes
que estaban perfectamente disponibles.

La escalera, en orden. Bajás un peldaño sólo cuando el anterior falló:

1. **`WebSearch`** para encontrar candidatas. Devuelve títulos y URLs; todavía no
   leíste nada.
2. **`WebFetch`** sobre la URL. Es lo más rápido y además te contesta una
   pregunta sobre el contenido. Aprovechá eso: preguntale directamente *«¿dice
   de qué pueblo es la práctica y desde cuándo? Citame la frase textual»*, que
   es exactamente lo que después va al campo `verificacion`.
3. **Si da `403` o `429`, no la descartes: es antibot, no ausencia.** Abrila en
   el **panel del navegador** (`preview_start` con la `url`, después
   `get_page_text`). Está comprobado: un artículo de `scielo.cl` que a `WebFetch`
   le devolvió `403` abre entero por esta vía. Lo mismo pasa con varios
   repositorios institucionales.
4. **Si el navegador se cuelga** —pasó con `repositorio.inia.gob.pe`, que agotó
   los 300 s sin cargar— **no insistas más de una vez**. Buscá otra fuente para
   el mismo hecho y anotá la URL que no abrió en el `COBERTURA`. Diez minutos
   peleando con un sitio lento es un lote que no se cierra.
5. **`404` es otra cosa:** la URL está mal. Verificá que no la hayas inferido.

**Leer el resumen no es leer el trabajo.** Si sólo pudiste abrir el abstract, la
entrada puede decir únicamente lo que el abstract dice. No completes el método,
ni la fecha, ni la extensión con lo que te parece que el artículo diría.

### El `label` se copia de la página. No se reconstruye

Esto no es una formalidad y ya falló: en el lote 3 del 28/09/2026, **las doce
fuentes eran de `scielo.org.ar`, que devuelve `403`**, y la sesión escribió los
`label` sin abrir ninguna. El resultado fue que los PID eran reales y los títulos
no. Un caso llegó más lejos: la entrada de los yerbales de Misiones citaba *«Los
yerbateros: la fuerza de trabajo… (1875-1903)»* y fechaba la práctica en esa
franja, pero el artículo que hay en ese PID es *«Estado y producción: la
actividad yerbatera en el territorio nacional de Misiones (1926-1953)»*. **La
fecha de la entrada salía de un título inventado.** En el lote 2, con los mismos
403 de `scielo.org.mx`, los títulos estaban bien y los autores no: donde decía
«Flores-Cruz et al.» la portada dice «Álvarez-Duarte, García-Moya, Suárez-Espinosa
y otros».

Por eso, y sin excepción:

- El **título**, los **apellidos** y el **número de volumen** se copian de la
  portada del artículo que tenés abierto. No de la memoria, no del snippet del
  buscador, no del patrón del identificador.
- Si el buscador te dio un PID pero la página no abre por ninguna de las dos
  vías, **la entrada no se escribe**, y el PID va al `COBERTURA` como pendiente.
  Un `403` es motivo para cambiar de herramienta, nunca para escribir de memoria.
- Antes de cerrar el lote, releé tus `label` contra las páginas. Si una fuente
  cambió de título entre lo que buscaste y lo que abriste, es que estás citando
  otro trabajo.

**Y las tildes son parte del texto.** El lote 3 salió entero sin acentos
—«Extraccion», «Practica», «prehispanico», «Parana»—. Esto se imprime en la
pantalla y en el informe de un producto en español argentino: una `á` faltante es
un defecto, no un detalle de codificación.

---

## El trabajo, en una frase

`apps/terreno/lib/practicasHistoricas.ts` tiene **201 entradas para 200
ecorregiones**: exactamente una práctica por región, salvo una que tiene dos.
Eso alcanza para probar que la capa funciona y no alcanza para lo que la app
promete. **Hay que llevarlo a entre 3 y 5 prácticas por ecorregión.**

Son del orden de 600 entradas nuevas. No entran en una sesión de corrido y no
tienen que entrar: se trabaja por lotes, cada lote se commitea cerrado y
verificable, y la sesión puede terminar en cualquier lote sin dejar nada a medio
escribir.

---

## Por qué se amplía, que es lo que decide cómo escribir

El pedido vino del dueño del producto con estas palabras: *«yo quiero que en cada
región se enumeren los tipos de cultivos y las prácticas agropecuarias
tradicionales y ancestrales que se realizaban o realizan en la zona. Si se puede
decir quién lo hacía bien, y si no también.»*

Eso corrige dos cosas del relevamiento anterior, y las dos importan:

**1. No es sólo arqueología.** El encargo viejo se ancló en el registro
arqueológico, y quedó una capa de rasgos fechados: camellones, terrazas, muros.
Está bien y se queda. Pero **la práctica que se hace hoy cuenta igual**: el café
de sombra del eje cafetero colombiano, la barrera viva de vetiver en una ladera
centroamericana, el sistema de riego por acequia, la trashumancia que todavía
sube ganado en verano, la milpa, el manejo de la poda de un frutal criollo. Si
está documentada, entra, con `vigencia: 'en_uso'`.

**2. La autoría se dejó de exigir, pero no se prohibió.** Antes, no poder decir
de quién era una práctica hacía que la práctica no se escribiera. Eso estaba
mal: borraba el contenido para proteger la atribución. La regla nueva es simple
y hay que aplicarla con cuidado en las dos direcciones:

- Si la fuente **dice** de qué pueblo o de qué tradición es, **se lo nombra**,
  dentro de `detalle` y con las palabras de la fuente. Callar una autoría
  documentada no es prudencia: es borrarla.
- Si la fuente **no lo dice**, la entrada se escribe igual, sin autoría, y con
  el período alcanza. **Lo que no se hace nunca es deducir el pueblo del mapa.**

---

## Las reglas. Ninguna es negociable

**1. Sin fuente publicada no hay entrada.** Mínimo una referencia por práctica,
con URL. Sirve: artículo con DOI, libro, informe de organismo (FAO SIPAM,
UNESCO, FIDA, INTA, Embrapa, un ministerio, una universidad), repositorio
académico, museo, herbario. **No sirve:** Wikipedia ni ningún wiki, blogs, notas
periodísticas sin fuente propia, sitios de turismo, agregadores de IA,
contenido generado. Hay un test que rechaza automáticamente las enciclopedias
colaborativas y va a fallar el build si entra una.

**2. La URL se abre antes de escribirla. Siempre.** No de memoria y no por
inferencia del patrón de un DOI. Esto ya falló una vez en este mismo archivo: un
DOI escrito de memoria para el artículo de los jardines de piedra de Rapa Nui
resolvió a **un artículo distinto de la misma revista** — el identificador
existía y el trabajo era otro. Si no podés abrir la fuente, la entrada no se
escribe. Si la abrís y no dice lo que esperabas, se corrige la entrada, no la
fuente.

**3. Una ecorregión con dos entradas sólidas vale más que una con cinco a medias.**
No hay obligación de llegar a 5 en ninguna. El objetivo son 3 a 5 donde la
bibliografía lo permita, y menos donde no. Si de una región no encontrás nada
más que lo que ya está, la respuesta correcta es dejarla como está y anotarlo en
el archivo de cobertura del lote.

**4. El sujeto de la frase es el registro, no el terreno.** Se escribe «el
registro arqueológico de la cuenca documenta camellones desde el 1000 a.C.» o
«la FAO describe el sistema en las zonas montañosas de Tlaxcala», y no «acá se
hacían camellones». En una práctica vigente: «el sistema se sigue manejando en
las laderas de…». La diferencia importa porque esto se imprime en un informe que
alguien va a leer en voz alta delante de un vecino.

**5. El `detalle` le tiene que servir a alguien que está diseñando un predio.**
No es una entrada de glosario. Dos a cuatro oraciones que digan **qué es, cómo
funciona y por qué funciona ahí**: qué problema del sitio resuelve, con qué
material, en qué parte de la ladera, qué mantenimiento pide. El test exige más
de 120 caracteres, pero el umbral real es si se puede copiar a un diseño.

**6. No se repite una práctica dentro de una misma ficha**, y no se cambia de
nombre a una que ya está para colarla de nuevo. El test lo detecta.

**7. Si una práctica es la misma en dos ecorregiones vecinas, se escribe en las
dos**, con el detalle ajustado a cada una. No se «comparte» ni se referencia
cruzado: cada ficha se lee sola.

---

## El ritmo: se trabaja por barridos, no de a una

Buscar, abrir y escribir **una** práctica por vez es la forma más cara de hacer
esto: cada entrada vuelve a pagar el mismo contexto. Dentro de un lote, el
trabajo va en tres barridos.

**Barrido 1 — búsqueda.** Todas las `WebSearch` del lote, varias por turno.
Quince ecorregiones son quince a veinte búsquedas: entran en dos o tres turnos,
no en veinte. Salís con una lista de URLs candidatas y nada escrito.

**Barrido 2 — apertura.** Las `WebFetch` **en paralelo, de a seis u ocho por
turno**, cada una con su pregunta de verificación. Juntá aparte las que dieron
`403` y abrilas después por el navegador, que va de a una.

**Barrido 3 — escritura.** El JSON del lote, las entradas de TypeScript y el
`COBERTURA`, y recién ahí **una sola** corrida de compuerta y **un solo** commit.
No una compuerta por ecorregión: tarda lo mismo con una entrada que con sesenta.

**Lo único que no se batchea es la verificación.** Cada entrada se escribe
después de haber leído su fuente, nunca antes. «Escribo las cinco y después
chequeo» es exactamente el movimiento por el que entró el DOI equivocado de Rapa
Nui: cuando llega el momento de chequear, el texto ya suena bien y nadie lo mira
de verdad.

**Presupuesto de contexto.** Un lote de quince ecorregiones con cuatro entradas
son sesenta fuentes leídas, y eso pesa. Si a mitad de lote ves que el contexto se
acorta, **cerrá el lote con las ecorregiones que ya tenés terminadas** —commit y
push— y arrancá el siguiente con las que faltaban. Un lote chico cerrado vale; un
lote grande sin commitear no vale nada.

---

## Los archivos que podés tocar, y ninguno más

**Podés escribir en:**

| Archivo | Qué le va |
|---|---|
| `apps/terreno/lib/practicasHistoricas.ts` | las entradas nuevas, en el mismo formato que las 201 que ya están |
| `_research/practicas-documentadas-ecorregion/lote-NN-*.json` | el relevamiento crudo de cada lote, con el campo `verificacion` |
| `_research/practicas-documentadas-ecorregion/COBERTURA_LOTE_NN.md` | qué cubrió el lote y qué quedó afuera, con el motivo de cada vacío |

**No toques nada de esto, por ningún motivo:**

- `apps/terreno/lib/biomasRegionales*.ts`, `biomasGlobales.ts`,
  `ecorregiones*.ts` — son **catálogos generados**. Lo que se escriba a mano ahí
  se pierde en el próximo montaje, y hay un test que falla si declaran
  `practicas:`. Por eso esta capa vive aparte.
- `apps/terreno/components/ContextoPanel.tsx` e `InformeView.tsx` — ya renderizan
  esta capa y se están reescribiendo en paralelo en otra sesión. Si los tocás,
  el merge choca.
- Todo lo que sea capa de pueblos originarios: `pueblosOriginarios*.ts`,
  `censoIndigena*.ts`, `_research/pueblos-originarios-paises/`. Es otra capa, con
  otras reglas, y no es parte de este encargo.
- `.vercelignore` — no existe y no se repone nunca.
- Cualquier `.env.local`. **Ninguna clave se escribe en un archivo del repo, ni
  en `_research/`, ni en un mensaje de commit.**

---

## El formato de una entrada

El tipo está en `apps/terreno/lib/biomaTipos.ts` (`PracticaHistorica`) y **no se
modifica**. Leé su JSDoc completo antes de escribir la primera.

```ts
  // ── Nombre legible de la región, para poder navegar el archivo ────────────
  id_de_la_ficha: [
    {
      practica: 'Nombre corto del rasgo o del sistema',
      periodo: 'Cuándo, en texto. "Desde ~1000 a.C."; "Prehispánica, en uso"; "Documentada en 2016"',
      tipo: 'suelo',        // ver TipoPractica en biomaTipos.ts
      vigencia: 'en_uso',   // 'en_uso' | 'en_retroceso' | 'historica'
      detalle:
        'Qué es, cómo funciona y por qué funciona acá. Dos a cuatro oraciones. ' +
        'Si la fuente nombra al pueblo, se lo nombra acá, como lo nombra ella.',
      fuentes: [
        { label: 'Autor (año) — Título, publicación', url: 'https://…' },
      ],
    },
  ],
```

Los `id` de ficha **se sacan del código, no de una lista vieja**: salen de las
claves de los catálogos en `apps/terreno/lib/biomasRegionales*.ts` y
`biomasGlobales.ts`. Hay un anexo en `_research/_encargos/ANEXO_IDS_FICHAS.md`
pero puede estar desactualizado: si no coinciden, manda el código. Un `id` que no
exista hace fallar el test que verifica que cada práctica cuelgue de una ficha
real.

En el JSON del relevamiento, cada entrada lleva **un campo más** que no va al
TypeScript: `verificacion`, con la **frase textual de la fuente** que sostiene la
fecha y la descripción. Es lo que permite revisar el lote sin volver a abrir las
treinta URLs.

---

## El orden de los lotes

Empezá por América, que es donde están los proyectos reales, y de ahí para
afuera. Dentro de cada bloque, primero las ecorregiones **agrícolas y habitadas**
—no tiene sentido pelear por el desierto y el hielo mientras falta el trópico de
altura—.

1. Andes del norte y trópico de altura (Colombia, Ecuador, Venezuela, Perú)
2. México y Centroamérica
3. Cono Sur (Argentina, Chile, Uruguay, Paraguay, sur de Brasil)
4. Amazonía y Caribe
5. Norteamérica (Estados Unidos y Canadá)
6. Europa
7. Indomalaya
8. África y Medio Oriente
9. Oceanía y las islas

Lotes de **10 a 15 ecorregiones**. Ni más —el lote se vuelve irrevisable— ni
menos —el overhead de commit y compuerta se come la sesión—.

---

## La compuerta, antes de cada commit

Las cuatro, en cero. Se corren desde la raíz del repo.

```bash
pnpm typecheck && pnpm lint && pnpm --filter @arteytierra/terreno test && pnpm --filter @arteytierra/web test
```

`vitest` no resuelve desde la raíz: para correrlo directo hay que pararse en la
app. El test que más te va a hablar es
`apps/terreno/tests/unit/contexto/practicasHistoricas.test.ts`: exige fuente con
`https`, rótulo de más de 10 caracteres, período de más de 4, detalle de más de
120, ninguna enciclopedia colaborativa, ninguna práctica duplicada dentro de una
ficha y ningún `id` inexistente. Si algo de eso falla, **se arregla la entrada, no
el test.**

No corras `next build` en esta sesión: no estás tocando componentes y tarda.

---

## Cómo se cierra cada lote

1. Escribís el JSON del lote en `_research/practicas-documentadas-ecorregion/`.
2. Montás las entradas en `practicasHistoricas.ts`.
3. Escribís el `COBERTURA_LOTE_NN.md`: qué ecorregiones cubriste, cuántas
   entradas por cada una, y **el motivo de cada ecorregión que quedó en menos de
   3**. Ese motivo es contenido, no burocracia: es lo que evita que el próximo
   lote vuelva a buscar donde ya se buscó. Va también la lista de URLs que no
   pudiste abrir, con el síntoma (`403`, timeout, `404`).
4. Corrés la compuerta.
5. Commiteás **con pathspecs explícitos**, archivo por archivo:

```bash
git commit -F mensaje.txt -- apps/terreno/lib/practicasHistoricas.ts _research/practicas-documentadas-ecorregion/
```

**Nunca `git add -A`.** El índice de git es compartido con otras sesiones y te
llevás puesto lo que stageó otra.

6. `git push origin claude/practicas-enumeradas`. **Nada de `HEAD:main`**: en este
repo el push a `main` dispara el deploy en Vercel, y esta rama no se deploya.

El mensaje de commit dice qué bloque cubrió, cuántas entradas, y cuántas
ecorregiones quedaron abajo de 3 con el motivo resumido. Terminalo con:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

## Herramientas: lo que sirve y lo que no

No hace falta ningún conector ni plugin para este encargo, y **ninguna de las
skills del repo aplica**: `motor-de-calculo` es para los cálculos físicos,
`migracion-supabase` para la base, `fuente-unica-de-verdad` para los planes.
Ninguna toca esta capa. Si alguna sesión te dice que le falta un conector de
GitHub para trabajar, se equivocó de diagnóstico: con el repo clonado, `git push`
alcanza y sobra.

Lo que sí usás, todo el tiempo: `WebSearch`, `WebFetch`, el panel del navegador
para las que dan `403`, y `git grep` —nunca `grep -rn`, que se come el timeout
con `node_modules`—.

---

## Cómo se informa al final de la sesión

Un mensaje corto con: cuántos lotes cerraste, cuántas entradas nuevas en total,
en cuántas ecorregiones, cuántas quedaron abajo de 3 y por qué, y **qué fuentes
buscaste y no pudiste abrir** —eso último es lo más útil para el que sigue, porque
es donde está el trabajo que no se ve—.

Si te quedás sin contexto, cerrá el lote en curso con su commit y su push antes
de cualquier otra cosa. Un lote a medio montar sin commitear es lo único de esta
tarea que se pierde del todo.

---

## Lo que no hay que hacer, junto

- No empezar sin haber pasado el preflight.
- No dar por bloqueada una fuente que devolvió `403` sin probarla en el navegador.
- No escribir un `label` —título, apellidos, volumen— sin tener la página abierta
  delante.
- No escribir sin tildes.
- No tocar nada fuera de la tabla de archivos permitidos. Si en el camino
  encontrás un arreglo que hay que hacer —pasó con el `version: 9` de
  `pnpm/action-setup` en el CI—, **va en un commit aparte y se avisa**, no se
  mezcla con un lote de prácticas.
- No pushear a `main` ni deployar.
- No tocar los catálogos generados, los paneles, ni la capa de pueblos.
- No usar `git add -A` ni `git stash` a secas.
- No inventar una fuente, un DOI ni una atribución. Ante la duda, la entrada no
  se escribe.
- No deducir de qué pueblo es una práctica a partir de dónde está.
- No bajar el umbral de un test para que pase un lote.
- No escribir ninguna clave en ningún archivo.
