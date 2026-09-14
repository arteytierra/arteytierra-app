---
name: edicion-video
description: Cómo se edita video en Arte y Tierra con FFmpeg, Whisper y Remotion — cortar, convertir a 9:16 / 1:1 / 16:9, normalizar audio, transcribir y quemar subtítulos, sacar miniaturas, y generar placas animadas de marca desde React. Se activa al preparar material para Instagram, YouTube o la landing, al pedir subtítulos, al comprimir o convertir un video, y antes de tocar cualquier archivo de metraje.
---

# Edición de video

La división del trabajo es esta y conviene respetarla: **FFmpeg hace lo mecánico,
Jonatan monta en CapCut, Remotion hace las placas de marca.** Claude no
"edita": escribe y corre comandos. Lo que aporta es hacer en un comando lo que a
mano son veinte clics, y hacerlo igual las veinte veces.

## Las herramientas, dónde están

**FFmpeg 9.0.1** (Gyan full build, por winget) con `libass`, `fontconfig` y
`libx264`: alcanza para todo lo que hay acá abajo. El shim está en
`%LOCALAPPDATA%\Microsoft\WinGet\Links`, que **no siempre está en el PATH de la
shell**. Si `ffmpeg` "no se encuentra", es eso:

```bash
export PATH="$PATH:/c/Users/Usuario/AppData/Local/Microsoft/WinGet/Links"
```

**faster-whisper** para transcribir, en el Python 3.12 (`py -3.12`).
**Remotion** para las placas, en `packages/placas/`.

No hay CapCut en esta máquina: el montaje pasa a otra, así que los entregables
viajan. Que estén completos y con nombres que se entiendan importa más que si
fueran para acá.

## Antes que nada: el disco

La máquina trabaja con poco margen y FFmpeg edita **escribiendo copias**. Un
intermedio en 4K pesa más que el original. Reglas que no se saltan:

1. **Mirá cuánto hay libre antes de empezar** y calculá: un intermedio sin
   comprimir puede ser 5–10× el archivo fuente.
2. **Probá con 10 segundos primero.** `-ss 00:00:30 -t 10` al principio del
   comando. Si el resultado está bien, recién ahí corré el archivo entero.
3. **Borrá los intermedios en cuanto el paso siguiente salió bien.** No los
   dejes "por las dudas".
4. **Nunca escribas encima del original.** El metraje no se puede volver a
   filmar.
5. Si el espacio es un problema real, trabajá sobre una copia en calidad de
   trabajo (`-crf 28 -vf scale=-2:720`) y aplicá el montaje final al original
   recién al exportar.

## Lo que no hay que re-comprimir

El error más caro y el más fácil de cometer. Cada re-compresión pierde calidad,
para siempre. Si sólo estás cortando, uniendo o cambiando el contenedor,
**copiá los flujos**:

```bash
ffmpeg -ss 00:01:23 -to 00:02:45 -i entrada.mp4 -c copy salida.mp4
```

Esto es instantáneo y sin pérdida, pero **corta en el fotograma clave más
cercano**, así que puede irse hasta un par de segundos. Si necesitás el corte
exacto, hay que recomprimir (sacá el `-c copy`) y ahí sí se pierde algo.

Regla práctica: para dejar clips listos para CapCut, `-c copy` y que el corte
fino lo haga el montaje. Para el entregable final, recomprimir una sola vez.

## Formatos de salida

Los tres que usa Arte y Tierra. **Siempre `-movflags +faststart`**: sin eso el
video no empieza a reproducirse hasta descargarse entero.

```bash
# 9:16 para stories y reels (1080×1920), recortando al centro
ffmpeg -i entrada.mp4 -vf "scale=1080:-2,crop=1080:1920" \
  -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k \
  -movflags +faststart stories.mp4

# 9:16 sin recortar, con fondo borroso (cuando el encuadre no sobrevive al crop)
ffmpeg -i entrada.mp4 -filter_complex \
  "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=28[bg]; \
   [0:v]scale=1080:-2[fg]; [bg][fg]overlay=(W-w)/2:(H-h)/2" \
  -c:v libx264 -crf 20 -c:a aac -b:a 192k -movflags +faststart stories.mp4

# 16:9 para YouTube (1080p)
ffmpeg -i entrada.mp4 -vf "scale=1920:-2" -c:v libx264 -crf 18 -preset slow \
  -c:a aac -b:a 192k -movflags +faststart youtube.mp4
```

`crf` va al revés de lo que parece: **más bajo es mejor calidad y más peso**.
18 es prácticamente indistinguible del original, 20–23 está muy bien para redes,
28 es calidad de trabajo. `-preset slow` comprime mejor a igual calidad; tarda
más pero el archivo pesa menos.

## Audio: normalizar es lo que más se nota

Un video con audio disparejo se percibe como "mal editado" aunque la imagen sea
perfecta. Las plataformas normalizan a **−14 LUFS**; si entregás más fuerte, te
lo bajan y suena apagado.

```bash
# Una pasada, suficiente para la mayoría de los casos
ffmpeg -i entrada.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy salida.mp4
```

Para el video principal de la campaña vale la pena la versión de dos pasadas:
la primera mide (`-af loudnorm=print_format=json -f null -`), la segunda aplica
los valores medidos. Es más preciso y evita que el normalizador "bombee".

Encontrar silencios para cortar muletillas y pausas largas:

```bash
ffmpeg -i entrada.mp4 -af silencedetect=noise=-30dB:d=0.6 -f null - 2>&1 | grep silence_
```

Eso imprime los tramos. **No los cortes automáticamente todos**: una pausa
también es respiración y ritmo. Proponé la lista, que la decisión sea de
Jonatan.

## Subtítulos

Transcribir con Whisper, revisar, después quemar. **Siempre revisar en el
medio**: Whisper se equivoca con nombres propios y con vocabulario técnico
—"swale", "keyline", "Köppen", "acequia" mismo— y un subtítulo mal es peor que
ninguno.

```bash
# 1. transcribir a SRT en español
py -3.12 _scripts/transcribir.py entrada.mp4            # modelo small por defecto
py -3.12 _scripts/transcribir.py entrada.mp4 --modelo medium   # si hay ruido

# 2. revisar y corregir entrada.srt a mano

# 3. quemar con el estilo de la marca
ffmpeg -i entrada.mp4 -vf "subtitles=entrada.srt:force_style=\
'FontName=Inter,FontSize=22,PrimaryColour=&H00E8F0F5,OutlineColour=&H00101A1A,\
BorderStyle=3,Outline=2,Shadow=0,MarginV=80'" \
  -c:a copy salida.mp4
```

Ojo con el color en `force_style`: va en **BGR**, no RGB, y con `&H00` adelante.
El blanco cálido de la marca (`#F5F0E8`) se escribe `&H00E8F0F5`.

Para stories subí `MarginV` bastante (80–140) o los subtítulos quedan tapados
por la interfaz de Instagram.

**`py -3.12`, no `python`.** faster-whisper está instalado en el Python 3.12 de
esta máquina. `py` a secas abre el 3.13, donde no está, y el script muere con
`No module named faster_whisper`.

**La primera transcripción se baja el modelo** (`small` ≈ 500 MB, `medium` ≈
1,5 GB) antes de empezar. Contalo en el tiempo y en el disco de la primera vez.

**Verificá que la fuente exista antes de quemar.** `force_style` no avisa si la
tipografía no está: libass cae en un fallback y escribe los subtítulos igual, y
eso se descubre con el video publicado. La prueba es renderizar un fotograma con
la fuente que querés y otro con un nombre inventado, y comparar:

```bash
printf '1\n00:00:00,000 --> 00:00:05,000\nSwale sobre la curva de nivel\n\n' > t.srt
for F in Inter ZZZInexistente; do
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i color=c=0x1A1210:s=1280x200:d=1 \
    -vf "subtitles=t.srt:force_style='FontName=$F,FontSize=28'" -frames:v 1 "$F.png"
done
md5sum Inter.png ZZZInexistente.png   # hashes distintos = la fuente está
```

Inter 4.1 (las estáticas, no la variable) está instalada en el perfil del
usuario y verificada así. Si alguna vez el subtítulo "se ve distinto", esto es
lo primero que hay que correr.

## Miniaturas

```bash
# un fotograma en un momento exacto
ffmpeg -ss 00:00:12 -i entrada.mp4 -frames:v 1 -q:v 2 miniatura.jpg

# una grilla de candidatas para elegir
ffmpeg -i entrada.mp4 -vf "fps=1/10,scale=320:-1,tile=5x4" -frames:v 1 contacto.jpg
```

La grilla primero, siempre: elegir a ojo sobre veinte candidatas sale mejor que
adivinar un timestamp.

## Remotion: las placas de marca

Vive en `packages/placas/`, como workspace propio. Está ahí y no colgado de una
app por dos razones: pesa (Remotion se baja su propio Chrome) y no tiene nada
que ver con el build de un sitio. Que `pnpm build` de Vercel no lo mire es parte
del diseño.

Su ventaja es específica y vale la pena entenderla: **lee los tokens del
monorepo**. Los colores salen de `packages/config/src/tokens.ts` (`marcaAcequia`)
y el logo de `apps/terreno/public/marca/`, sin copiarlo: `remotion.config.ts`
apunta el `publicDir` a esa carpeta. Una placa sale con exactamente los colores
y el logo del sitio, y el día que cambien, cambian solas.

```bash
# ver y ajustar en el navegador, con los controles de cada placa
pnpm --filter @arteytierra/placas estudio

# qué placas hay
pnpm --filter @arteytierra/placas componer

# renderizar, con el texto que se le pase
pnpm --filter @arteytierra/placas render AperturaAcequia apertura.mp4 \
  --props='{"bajada":"Leer el territorio antes de moverlo"}'

# un lower third para superponer en CapCut: ProRes 4444, que lleva canal alfa
pnpm --filter @arteytierra/placas render LowerThird lower.mov \
  --codec=prores --prores-profile=4444 \
  --props='{"nombre":"Jonatan","rol":"Arte y Tierra"}'
```

Las placas que hay hoy: `AperturaAcequia` (16:9 y 9:16), `LowerThird` y
`PlacaDato` —un número que cuenta hasta su valor, con la unidad y **la fuente
citada**, que no es opcional: mismo criterio que los motores de cálculo.

Tres cosas que se aprendieron armándolo y conviene no volver a descubrir:

- **La apertura va sobre fondo crema, no sobre el negro profundo.** El paquete
  de marca no tiene un lockup blanco rasterizado, y el wordmark no se puede
  dibujar con texto porque depende de Century Gothic. Si algún día hace falta
  una apertura sobre oscuro, primero hay que exportar `logo-blanco.png`.
- **Las tipografías se empaquetan con `@remotion/google-fonts`**, no se toman
  del sistema. Si se tomaran del sistema, el mismo proyecto renderizado en otra
  máquina saldría distinto sin avisar. Y se piden sólo los pesos que se usan:
  `loadFont()` sin argumentos dispara más de cien pedidos de red por render.
- **La firma (`firma-negro.png`) no baja de ~40 px de alto.** Son cuatro
  anillos: más chico se empastan. Es la misma compensación óptica que explica
  el `LEEME.md` de marca.

Para qué no usarlo: cortar metraje. Renderizar en Remotion lo que FFmpeg hace en
un comando es tirar tiempo y CPU.

La salida es un MP4 (o un MOV con canal alfa, para superponer), que después
entra a CapCut como un clip más.

## El flujo completo, de punta a punta

1. **Copiar** el metraje a una carpeta de trabajo. Nunca tocar el original.
2. **Inspeccionar** con `ffprobe`: resolución, fps, códec, duración, pistas de
   audio. Todo lo que venga después depende de eso.
3. **Cortar** lo obviamente inservible con `-c copy`.
4. **Normalizar** el audio.
5. **Transcribir** con Whisper y corregir el SRT.
6. **Generar** en Remotion las placas que haga falta.
7. **Entregar a CapCut**: los clips limpios, el SRT corregido y las placas.
   Jonatan hace el montaje.
8. **Exportar** los formatos finales desde el montaje, con los presets de
   arriba, una sola recompresión.
9. **Borrar** los intermedios.

## Marca

Azul agua `#2E6B8A`, negro profundo `#1A1210`, blanco cálido `#F5F0E8`. El
manual completo está en `C:\Arte y Tierra\Acequia\Acequia_Manual_de_Marca_v3.0.docx`
(la v3.0, no la v2.1) y los logos en `apps/terreno/public/marca/`.

El wordmark depende de una tipografía que no está en todas las máquinas: **usá
los PNG, nunca los SVG con texto**. En video eso importa el doble, porque un
fallback tipográfico en una placa no se nota hasta que el video está publicado.
