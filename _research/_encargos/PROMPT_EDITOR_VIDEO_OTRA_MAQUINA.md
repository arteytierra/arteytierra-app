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

Windows. Todo esto se corre en PowerShell, y ninguno pide permisos de
administrador.

### 1. Node 24 y pnpm

```bash
winget install OpenJS.NodeJS
npm install -g pnpm@9
```

### 2. FFmpeg

```bash
winget install Gyan.FFmpeg
```

Importante: el shim queda en `%LOCALAPPDATA%\Microsoft\WinGet\Links`, que entra
al PATH pero **no en la terminal que ya estaba abierta**. Hay que cerrarla y
abrir otra. Verificar que la compilación traiga `libass` —sin eso no se pueden
quemar subtítulos—:

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

### 4. La tipografía Inter

Se baja de `https://github.com/rsms/inter/releases` (v4.1, unos 34 MB) y se
instalan **las estáticas de `extras/ttf`**, no `InterVariable.ttf`: libass maneja
mal las variable fonts y te da un peso que no pediste sin decir nada.

Seleccionar todos los `.ttf` de esa carpeta, botón derecho → *Instalar*.

Después **verificar que libass la ve de verdad**, que no es lo mismo que que
Windows la muestre en la lista de fuentes. La prueba está en la skill
`edicion-video`, en la sección de subtítulos: renderiza un fotograma con Inter y
otro con un nombre inventado y compara los hashes. Si son iguales, Inter no está
y los subtítulos van a salir con otra tipografía sin avisar.

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

```bash
cd arteytierra-app && pnpm install
```

Eso instala todo el monorepo. Si el disco aprieta, alcanza con
`pnpm install --filter @arteytierra/placas...` —sólo las placas y la config—,
pero con eso **no** se pueden correr las verificaciones del repo antes de
commitear. Si vas a tocar código, instalá todo.

Después, probar que las placas se resuelven:

```bash
pnpm --filter @arteytierra/placas componer
```

Tienen que salir seis: `AperturaAcequia`, `AperturaAcequiaVertical`,
`AperturaAcequiaOscura`, `AperturaAcequiaOscuraVertical`, `LowerThird` y
`PlacaDato`.

Y **hacé un render de prueba ahora, no en medio de un trabajo**, porque el primer
render se baja un Chrome propio de Remotion (113 MB) antes de empezar:

```bash
pnpm --filter @arteytierra/placas render AperturaAcequiaOscura prueba.mp4
```

Tienen que salir tres segundos con el lockup blanco sobre el negro profundo. Si
el wordmark "acequia" se ve con otra tipografía, algo está mal: avisá antes de
seguir.

### 6. Cuánto espacio hace falta

Medido sobre la instalación real, en una máquina donde todo esto arranca de
cero:

| Qué | Cuánto |
|---|---|
| el repositorio clonado | ~400 MB |
| `node_modules` del monorepo | ~1 GB |
| la caché de paquetes de pnpm | ~1,3 GB |
| el Chrome de Remotion | 113 MB |

Unos **3 GB** para tener el entorno andando, antes de un solo archivo de video.
Súmenle el metraje y el doble del metraje en intermedios. Si la máquina tiene
menos de 20 GB libres, decilo antes de empezar.

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

#### Lo primero, y no es negociable: el disco

FFmpeg edita escribiendo copias, y un intermedio en 4K pesa más que el original.
Antes de cualquier trabajo:

1. Fijate cuánto hay libre. Si no entra el trabajo con margen, decilo y pará; no
   arranques para quedarte a mitad de camino.
2. Probá siempre con 10 segundos (`-ss 00:00:30 -t 10`) antes de procesar el
   archivo entero.
3. Borrá los intermedios apenas el paso siguiente salió bien.
4. Nunca escribas encima del original. El metraje no se vuelve a filmar.

Si el espacio te bloquea, avisá: no borres material por tu cuenta.

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
pnpm --filter @arteytierra/placas render AperturaAcequiaOscura apertura.mp4
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
responden, si Inter pasa la prueba de los dos hashes, cuánto espacio libre hay en
disco, y si `pnpm --filter @arteytierra/placas componer` lista las seis placas.
Si algo falta, decime qué y pará ahí.
