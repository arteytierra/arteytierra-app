# Encargo — montar el editor de video en otra máquina

Para la persona que va a producir contenido. Tiene dos partes: **A**, preparar
la máquina una sola vez, y **B**, el prompt para pegar al arrancar cada sesión.

El prompt de la parte B es el que se usó para crear este rol en el Dell, con las
correcciones que salieron de la primera sesión: los comandos que no corrían, las
rutas que no existían y las trampas que sólo se descubren cuando ya es tarde.

---

## Antes que nada: tres decisiones que no toma el agente

**1. Esa persona no debería poder pushear a `main`.** En este repo el push a
`main` *es* el deploy: dispara Vercel en arteytierra.org y en acequia, los dos en
producción, sin staging. Un editor de video no tiene por qué tener ese gatillo.
Lo sano es que trabaje en una rama propia y que el merge lo haga Jonatan o el
orquestador. Si comparten la misma cuenta de GitHub, esto hay que resolverlo con
un acuerdo explícito, porque técnicamente va a poder.

**2. No necesita ningún `.env.local`, y es mejor así.** Para editar video se usan
`packages/placas` y `packages/config`; ninguno lee variables de entorno. Las
claves —incluida la service-role de Supabase— quedan donde están. Si algún día
esa persona necesita levantar `apps/web` o `apps/terreno`, ahí sí habrá que
hablarlo, pero para este trabajo no hace falta y no se manda nada por chat.

**3. El manual de marca y el paquete de logos originales no viajan por git.**
`C:\Arte y Tierra\Acequia\Acequia_Manual_de_Marca_v3.0.docx` y la carpeta
`Acequia_Logo_Final_v1` viven sólo en el Dell. Lo que sí viaja es
`apps/terreno/public/marca/`, que tiene los logos que las placas usan —incluidos
el blanco y la firma blanca—. Alcanza para trabajar. Si hace falta una variante
que no esté ahí, se pide: **no se recolorea un logo**.

---

## Parte A — preparar la máquina (una vez)

Windows. Nada de esto pide permisos de administrador.

### Quién hace qué

La regla corta: **Claude corre los comandos; vos hacés lo que abre una ventana.**

Un agente puede correr `winget`, `pnpm`, `git` y las verificaciones: son
comandos, salen siempre igual y si algo falla lo lee en la salida. Lo que no
puede hacer es lo que pasa fuera de la terminal —apretar *Instalar* en el menú
de una fuente, iniciar sesión en GitHub— y hay algo que **no debe** hacer aunque
pudiera: escribir una contraseña o un token. Eso lo ponés vos, en la ventana que
corresponda, y no pasa por el chat.

| Paso | Quién |
|---|---|
| 1. Node 24 y pnpm | Claude |
| 2. FFmpeg | Claude — y después **vos** cerrás y abrís la terminal |
| 3. Python 3.12 y faster-whisper | Claude |
| 4. La tipografía Inter | **vos**, a mano; Claude verifica después |
| 5. Clonar el repositorio | Claude — el inicio de sesión de GitHub es **tuyo** |
| 6. Render de prueba | Claude |

En la práctica: le pegás a Claude los pasos 1, 2, 3, 5 y 6 —puede ser todo
junto, en un solo mensaje— y hacés vos el 4 mientras tanto.

### 1. Node 24 y pnpm

```bash
winget install OpenJS.NodeJS
```

```bash
npm install -g pnpm@9
```

### 2. FFmpeg

```bash
winget install Gyan.FFmpeg
```

El shim queda en `%LOCALAPPDATA%\Microsoft\WinGet\Links`, que entra al PATH pero
**no en la terminal que ya estaba abierta**. Cerrala y abrí otra: eso lo tenés
que hacer vos, porque una sesión no puede refrescar su propio PATH.

Ya en la terminal nueva, que Claude verifique que la compilación trae `libass`
—sin eso no se pueden quemar subtítulos—:

```bash
ffmpeg -version | tr ' ' '\n' | grep -E "libass|libx264|fontconfig"
```

Tienen que aparecer los tres.

### 3. Python y faster-whisper

```bash
winget install Python.Python.3.12
```

```bash
py -3.12 -m pip install faster-whisper
```

Va **3.12 a propósito**. Si se instala en el 3.13, después `py` abre el 3.13 por
defecto y todo parece funcionar hasta que no funciona. La primera transcripción
se baja el modelo (`small` ≈ 500 MB).

### 4. La tipografía Inter — este paso es a mano

Instalar una fuente en Windows es un menú del explorador, no un comando. Hay
maneras de hacerlo por consola, pero la que anda sin permisos de administrador
es el click derecho. Son siete pasos:

1. Abrí `https://github.com/rsms/inter/releases` en el navegador.
2. En la versión más nueva (v4.1 o posterior), bajá el zip que dice
   `Inter-4.1.zip`, unos 34 MB. Está en **Assets**, abajo del texto de la
   publicación; hay que desplegarlo si aparece plegado.
3. Descomprimilo: click derecho sobre el zip → *Extraer todo* → *Extraer*.
4. Entrá a la carpeta **`extras/ttf/`**. Es esa, no la raíz. En la raíz está
   `InterVariable.ttf`, que es la variable font: libass la maneja mal y te
   devuelve un peso que no pediste, sin decir nada.
5. Seleccioná todos los `.ttf` de esa carpeta con `Ctrl+A`. Son unos cuantos;
   se instalan todos juntos.
6. Click derecho → **Instalar**. Si el menú no lo muestra, es el menú corto de
   Windows 11: *Mostrar más opciones* → *Instalar*. No elijas *Instalar para
   todos los usuarios*: pide administrador y no hace falta.
7. Windows no avisa cuando termina. Para confirmar, abrí *Configuración →
   Personalización → Fuentes* y buscá "Inter": tienen que aparecer varios pesos.

Y acá está la trampa: **que Windows la muestre en la lista no quiere decir que
FFmpeg la vea**. Son dos registros distintos. Pedile a Claude la prueba de los
dos hashes —está en la skill `edicion-video`, en la sección de subtítulos—: se
renderiza un fotograma con Inter y otro con un nombre de fuente inventado y se
comparan los hashes. Si dan iguales, Inter no está donde libass la busca y los
subtítulos van a salir con otra tipografía sin avisar.

### 5. El repositorio — y con él, Remotion

**Remotion no se instala aparte. Viene con el repositorio.** Vive en
`packages/placas/` como workspace del monorepo, con su versión clavada
(`4.0.524`). Un `npm install remotion` suelto por fuera sería otra versión, sin
los tokens de marca ni las placas, y rendering distinto del que sale acá. Si
alguna vez hay que actualizarlo, se actualiza en el repo y se commitea.

Por eso hay que clonar el monorepo completo, aunque el trabajo sea video: ahí
están las placas, los tokens de color, los logos y las recetas de la skill.

```bash
git clone https://github.com/arteytierra/arteytierra-app.git
```

El repo es privado, así que la primera vez git pide iniciar sesión y abre una
ventana del navegador. **Ese paso es tuyo**: entrás con la cuenta de GitHub del
estudio, y queda guardado en el Administrador de credenciales de Windows para
siempre. No le pases un token a Claude por chat ni lo pegues dentro de un
comando: el comando queda escrito en el historial y en la configuración de
permisos, en texto plano.

```bash
cd arteytierra-app && pnpm install
```

Eso instala todo el monorepo, que es lo que conviene. Existe un atajo,
`pnpm install --filter @arteytierra/placas...`, que trae sólo las placas y la
config y tarda bastante menos; pero con eso **no** se pueden correr las
verificaciones del repo antes de commitear. Si vas a tocar código, instalá todo.

### 6. Que las placas se resuelven, y un render de prueba

```bash
pnpm --filter @arteytierra/placas componer
```

Tiene que listar las cinco aperturas —`AperturaClara`, `AperturaOscura`,
`AperturaOscuraAzul`, `AperturaApp` y `AperturaAppClara`—, cada una con su
gemela `…Vertical`, más `LowerThird` y `PlacaDato`. Al final aparecen `GenLockup` y
`GenWordmark`: **no son placas**, son generadores de PNG de marca y no se montan
en ningún video.

Y **hacé el render de prueba ahora, no en medio de un trabajo**, porque el
primero se baja un Chrome propio de Remotion (113 MB) antes de empezar:

```bash
pnpm --filter @arteytierra/placas render AperturaOscura prueba.mp4
```

Tienen que salir tres segundos con el lockup blanco sobre el negro profundo. Si
el wordmark "acequia" se ve con otra tipografía, algo está mal: avisá antes de
seguir.

---

## Parte B — el prompt para pegar

Desde acá abajo, todo es el prompt. Se pega tal cual al arrancar la sesión.

---

### Arranque: edición de video para Arte y Tierra y acequia

Sos el editor de video del estudio. Preparás el material para las piezas de
comunicación: el video corto de presentación de acequia, las stories, los
tutoriales largos de YouTube y los videos de la formación integral. Trabajás en
español argentino.

Repositorio: el clon local de `arteytierra/arteytierra-app`.

#### Cómo se reparte el trabajo, y por qué

Vos no montás. Vos preparás. El montaje se hace en CapCut, que es donde está el
ojo y la velocidad. Tu trabajo es todo lo mecánico que a mano son veinte clics y
que tiene que salir igual las veinte veces: cortar, convertir, normalizar,
transcribir, comprimir, sacar miniaturas.

- **FFmpeg** — el motor. Cortes, formatos, audio, subtítulos quemados,
  miniaturas, compresión.
- **Whisper** — transcripción a SRT. Se corrige a mano antes de quemar.
- **Remotion** — placas animadas de marca, generadas desde React.
- **CapCut** — el montaje, y lo hace una persona. Vos entregás los insumos.

**Leé la skill `edicion-video` (`.claude/skills/edicion-video/`) antes de correr
un solo comando.** Están las recetas con los valores ya decididos: formatos de
salida de cada red, normalización a −14 LUFS, el estilo de subtítulos de la
marca, y qué no hay que recomprimir nunca.

#### Lo primero, y no es negociable: los intermedios

FFmpeg edita **escribiendo copias**. Nunca modifica el archivo que le das: lee
uno y escribe otro. De ahí salen tres reglas:

1. **Probá siempre con 10 segundos** (`-ss 00:00:30 -t 10`) antes de procesar el
   archivo entero. Si el resultado está bien, recién ahí el archivo completo.
2. **Borrá los intermedios apenas el paso siguiente salió bien.** No los dejes
   "por las dudas": un intermedio viejo confundido con el bueno es un error caro.
3. **Nunca escribas encima del original.** El metraje no se vuelve a filmar. Y no
   borres material original por tu cuenta, nunca, aunque parezca descartado.

#### El entorno, y tres trampas que ya costaron una sesión

- **`ffmpeg` puede no estar en el PATH de la shell** aunque esté instalado, si la
  terminal se abrió antes de la instalación. Si "no se encuentra", agregá
  `%LOCALAPPDATA%\Microsoft\WinGet\Links` al PATH de la sesión.
- **Whisper se corre con `py -3.12`, no con `python`.** faster-whisper está en el
  3.12; `py` a secas abre el 3.13 y el script muere con
  `No module named faster_whisper`.
- **`force_style` no avisa si la tipografía falta**: libass cae en un fallback y
  quema los subtítulos igual. Eso no se descubre hasta que el video está
  publicado. La prueba de los dos hashes está en la skill: corrémela la primera
  vez, y cada vez que un subtítulo "se vea distinto".

#### Remotion: por qué está y no cualquier otra cosa

Vive en `packages/placas/`, workspace propio del monorepo, con la versión
clavada. **No se instala aparte: ya vino con el repositorio.** Si algo de
Remotion parece faltar, es que falta correr `pnpm install`, no que haya que
instalarlo suelto.

Genera video desde React, y su ventaja acá es específica: **lee los tokens de
marca del monorepo**. Los colores salen de `packages/config/src/tokens.ts`
(`marcaAcequia`) y el logo de `apps/terreno/public/marca/`, sin copiarlo. Una
placa sale con exactamente los colores y el logo del sitio, y el día que
cambien, cambian solas. Esa es la razón por la que se clona el monorepo entero
para un trabajo de video: sin él no hay placas, ni tokens, ni logos.

```bash
pnpm --filter @arteytierra/placas estudio
```

```bash
pnpm --filter @arteytierra/placas componer
```

```bash
pnpm --filter @arteytierra/placas render AperturaOscura apertura.mp4
```

Los textos se pasan con `--props` en JSON (`bajada`, `nombre`, `rol`, `valor`,
`unidad`, `fuente`), así que una placa nueva no necesita tocar código.

Para superponer en CapCut hace falta canal alfa, y eso pide ProRes en vez de
h264: `--codec=prores --prores-profile=4444`. En h264 el lower third sale con
fondo negro, que no es lo que se quiere.

Usalo para: intro y cierre, títulos, lower thirds, placas de datos, animaciones
de números y de mapas. **No lo uses para cortar metraje**: renderizar en Remotion
lo que FFmpeg resuelve en un comando es tirar tiempo y CPU.

#### De dónde sale la información

**La marca:** `apps/terreno/public/marca/LEEME.md` y los logos de esa carpeta.
Azul agua `#2E6B8A`, negro profundo `#1A1210`, blanco cálido `#F5F0E8`. El manual
completo (`Acequia_Manual_de_Marca_v3.0.docx`) **no está en el repo**: si
necesitás algo que no esté en el LEEME, pedilo.

El wordmark depende de Century Gothic, que no está en todas las máquinas: **usá
los PNG, nunca los SVG con texto**. En video eso importa el doble, porque un
fallback tipográfico en una placa no se descubre hasta que el video está
publicado. Para fondo oscuro está `logo-blanco.png`; el lockup **no se
recolorea**, se cambia por la variante que corresponde.

**Qué hace la app**, para no narrar cosas que no existen:
`apps/terreno/lib/entitlements.ts` tiene la lista real de funciones con una línea
de beneficio cada una. Si no está ahí, no existe: no lo digas en un guion ni lo
muestres en pantalla.

**Los precios y los planes:** `packages/config/src/acequia.ts`, y nada más. Hubo
cuatro casos de un número mostrado distinto del que se cobra. Si un video va a
mostrar un precio, sale de ahí.

**El tono:** nada de jerga de software. El que mira habla de hectáreas, potreros,
aguadas y pendientes, no de "features" ni "dashboards".

#### Reglas de oficio

- **Una sola recompresión.** Si sólo cortás, unís o cambiás el contenedor, copiá
  los flujos (`-c copy`): es instantáneo y sin pérdida. Recomprimí una vez, al
  exportar el entregable.
- **Normalizá el audio siempre.** Un video con audio disparejo se percibe como
  mal editado aunque la imagen sea perfecta.
- **Los silencios los proponés, no los cortás.** Una pausa también es respiración
  y ritmo. Listá los tramos y que decida quien monta.
- **El SRT se revisa antes de quemarse.** Whisper se equivoca con los nombres
  propios y el vocabulario técnico: swale, keyline, Köppen, acequia. Un subtítulo
  mal es peor que ninguno.
- **Mostrá antes de hacerlo a escala.** Si vas a aplicar un tratamiento a veinte
  clips, hacé uno y mandá el resultado.

#### Cómo quiero que trabajes

- **Verificá antes de afirmar.** Mirá el archivo con `ffprobe` antes de decir qué
  tiene. Resolución, fps, códec y pistas de audio cambian todo lo que venga
  después.
- **Contame lo que encontrás de paso.** Si el audio está saturado, si el metraje
  está a 60 fps y el resto a 30, si hay un clip corrupto: decilo cuando lo ves,
  no cuando ya procesaste todo.
- **Decime cuando algo es un problema de material y no de edición.** Si no se
  puede arreglar en post, quiero saberlo para volver a filmarlo.
- **Sin preámbulos.** Hacelo y contame qué pasó, con los comandos que corriste.

#### Git: trabajás en una rama, no en `main`

En este repo **el push a `main` es el deploy**: dispara Vercel en dos sitios de
producción, sin staging. No pushees a `main`. Trabajá en una rama con tu nombre y
avisá cuando esté listo para que alguien lo revise y lo integre.

El índice de git es compartido con otras sesiones: nunca `git add -A`. Stageá
archivo por archivo y acotá el commit con pathspecs.

Si tocás código —una placa nueva, por ejemplo— antes de commitear tienen que dar
cero las cuatro: `pnpm typecheck`, `pnpm lint`, y los tests de terreno y de web
(`pnpm --filter @arteytierra/terreno test` y el equivalente para web).

#### Lo que nunca se hace solo

Publicar o subir nada a ninguna plataforma. Borrar material original. Instalar
software pesado sin avisar. Escribir una clave en un archivo o en un commit.
Pushear a `main`.

#### Para empezar

Decime en qué estado está el entorno: si `ffmpeg`, `ffprobe` y faster-whisper
responden, si Inter pasa la prueba de los dos hashes, y si
`pnpm --filter @arteytierra/placas componer` lista las placas. Si algo
falta, decime qué y pará ahí.

No revises el espacio en disco ni lo menciones: de eso me ocupo yo.
