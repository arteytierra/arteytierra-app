#!/usr/bin/env bash
#
# Los constructores de segmento y la pista de sonido. No se corre solo: lo
# cargan `animatico.sh` (las dos variantes del animatico) y `final.sh` (la
# version final).
#
#   . "$G/piezas.sh"
#
# Espera del que lo carga:
#   $V  la carpeta videoapp-1        $T  la carpeta de trabajo (intermedios)
#   $A  la carpeta portada animacion $W  la carpeta de trabajo del sonido
#   $C  los cortes de la app         $G  esta carpeta (_research/video-acequia)
#   $P  las placas
#   VELOCIDAD   el cambio de tempo de la voz (1,0 es como la grabo)
#   EXTRA       cuadros de mas que lleva cada segmento, para el disolver.
#               0 cuando se pega con `concat` y no hay nada que disolver.
#   MARGEN_A / MARGEN_B   la sala que se toma antes y despues de cada frase
#
# ── Por que hay un seg_pieza aparte de seg_h ───────────────────────────────
#
# Los cortes de la app llevan la banda de 140 px que tapa la barra de
# Screenity. Las piezas de Remotion no tienen barra que tapar: ponerles la
# banda seria taparles el pie de fuente que ya traen dibujado. Son dos
# materiales distintos y se construyen distinto, y esa diferencia es a
# proposito: en el video se tiene que notar cual es la app y cual es el dato.
#
# ── Los cuadros de mas ─────────────────────────────────────────────────────
#
# Cada segmento se escribe con `$EXTRA` cuadros mas de los que le tocan. Esos
# cuadros no se ven como plano: se los come el disolver con el que entra el
# plano siguiente. Por eso todos los constructores terminan en
# `tpad=stop_mode=clone`: si a la fuente no le quedaban esos cuadros, el
# ultimo se clona, y clonar un cuadro abajo de un disolver no se nota. Sin el
# tpad el segmento sale corto y **todo el video de ahi en adelante se corre**,
# que es la clase de error que no se ve hasta que la voz no cierra con la
# imagen.

X264=(-c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -r 30 -an)

NEGRO=0x1A1210      # negro profundo de la marca
CREMA=0xF5F0E8      # blanco calido
AGUA=0x2E6B8A       # azul agua

# ─────────────────────────────────────────────────────────────────────────────
# Constructores de segmento
#
# La duracion se fija siempre con `-frames:v`, nunca con `-t`: los cortes
# vienen de una grabacion que perdio cuadros y `-t` sobre PTS irregular
# devuelve clips cortos. Ver MONTAJE.md.
# ─────────────────────────────────────────────────────────────────────────────

# seg_h <salida> <corte> <desde> <cuadros> <velocidad> [placa.mov@retardo ...]
seg_h () {
  local dest="$T/$1.mp4" src="$C/$2.mp4" desde="$3" n="$(( $4 + EXTRA ))" vel="$5"
  shift 5
  local -a ins=(-ss "$desde" -i "$src" -i "$P/banda-h.png")
  local fc="[0:v]setpts=PTS/${vel},fps=30[v];[v][1:v]overlay=0:0[b1]"
  local previo=b1 i=2 capa f retardo
  for capa in "$@"; do
    f="${capa%%@*}"; retardo="${capa##*@}"
    ins+=(-i "$P/$f")
    fc="${fc};[${i}:v]format=rgba,tpad=start_duration=${retardo}:start_mode=add:color=0x00000000[c${i}]"
    fc="${fc};[${previo}][c${i}]overlay=0:0:eof_action=pass:repeatlast=0[b${i}]"
    previo="b${i}"; i=$((i + 1))
  done
  fc="${fc};[${previo}]tpad=stop_mode=clone:stop_duration=1[z]"
  ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[z]" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# seg_pieza <salida> <ruta-relativa-a-portada-animacion> <desde> <cuadros> <vel>
#
# Sin banda y sin capas: la pieza ya trae su pie de fuente dibujado adentro.
# `fps=30` despues del `setpts` por la misma razon que en seg_h, aunque estas
# no pierden cuadros.
#
# El `scale` a 1920x1080 ya no sube nada y se queda igual, de guardia: desde el
# 25/11/2026 las piezas llegan rendidas a 1920x1080 por
# `packages/placas/scripts/video-1080.mjs` y el filtro no tiene nada que hacer.
# Sacarlo ahorraria cero —ffmpeg no escala cuando las medidas coinciden— y
# dejaria el constructor sin red el dia que alguien le pase una de 720.
seg_pieza () {
  local dest="$T/$1.mp4" src="$A/$2" desde="$3" n="$(( $4 + EXTRA ))" vel="$5"
  ffmpeg -v error -y -ss "$desde" -i "$src" \
    -vf "setpts=PTS/${vel},fps=30,scale=1920:1080:flags=lanczos,setsar=1,tpad=stop_mode=clone:stop_duration=1" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# seg_foto <salida> <ruta-relativa-a-portada-animacion> <cuadros>
#
# Un PNG con un empuje muy lento. El `zoompan` tiene que recortar de una imagen
# MAS GRANDE que el cuadro: haciendolo al reves el zoom salta de pixel en pixel
# y se ve el escalon. El 1,00 -> 1,04 en tres segundos y medio no se lee como
# movimiento, se lee como que la imagen esta viva.
#
# Los 3200 px son de donde recorta, y desde el 25/11/2026 el PNG YA VIENE a
# 3200x1800 —`crudo-3200.png`, rendido a doble escala— asi que el `scale` no
# agranda nada. Antes entraba uno de 1600x900 y esta misma linea lo estiraba al
# doble, o sea que el empuje recorria pixeles inventados.
seg_foto () {
  local dest="$T/$1.mp4" src="$A/$2" n="$(( $3 + EXTRA ))"
  ffmpeg -v error -y -loop 1 -i "$src" \
    -vf "scale=3200:-2:flags=lanczos,zoompan=z='1+0.00035*on':d=1:fps=30:s=1920x1080:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',setsar=1" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# texto_para_drawtext <texto>
#
# `drawtext` separa sus opciones con dos puntos, asi que **un dos puntos
# adentro del texto termina la opcion `text` y lo que sigue se lee como el
# nombre de otra opcion**. Las comillas simples no alcanzan: hay que escapar.
# Lo descubrio el cartel de la observacion, que dice «Cuenca de 282 ha: fuera
# del rango de Kirpich» y tiro «No option name near ' fuera del rango…'».
#
# La barra invertida va en una variable y no escrita al pasar. Es la misma
# razon de siempre: segun por cuantas capas de comillas pase la linea, una
# barra escrita derecho se la come alguna.
texto_para_drawtext () {
  local s="$1" barra='\'
  s="${s//"$barra"/${barra}${barra}}"   # primero la barra, o se escapa dos veces
  s="${s//:/${barra}:}"
  s="${s//\'/}"                         # la comilla simple no se escapa: se saca
  printf '%s' "$s"
}

# seg_cartel <salida> <cuadros> <titulo> <bajada con | de renglon> <largo>
#
# El cartel de una pieza que todavia no existe. Dice tres cosas: como se llama,
# de que esta hecha y cuanto dura. El largo va escrito adentro a proposito: es
# lo unico del cartel que el animatico esta midiendo de verdad.
seg_cartel () {
  local dest="$T/$1.mp4" n="$(( $2 + EXTRA ))" titulo="$3" bajada="$4" largo="$5"
  local fc="color=c=${NEGRO}:s=1920x1080:r=30"
  local dt="drawtext=fontfile=Inter-Medium.ttf:text='$(texto_para_drawtext "$titulo")':fontsize=64"
  dt="${dt}:fontcolor=${CREMA}:x=(w-text_w)/2:y=400"
  local y=510 renglon resto="$bajada"
  while [ -n "$resto" ]; do
    renglon="${resto%%|*}"
    if [ "$renglon" = "$resto" ]; then resto=""; else resto="${resto#*|}"; fi
    dt="${dt},drawtext=fontfile=Inter-Regular.ttf:text='$(texto_para_drawtext "$renglon")'"
    dt="${dt}:fontsize=34:fontcolor=${CREMA}@0.62:x=(w-text_w)/2:y=${y}"
    y=$((y + 52))
  done
  dt="${dt},drawtext=fontfile=Inter-Medium.ttf:text='PIEZA POR RENDERIZAR · $(texto_para_drawtext "$largo")'"
  dt="${dt}:fontsize=28:fontcolor=${AGUA}:x=(w-text_w)/2:y=$((y + 60))"
  (cd "$T" && ffmpeg -v error -y -f lavfi -i "$fc" -vf "$dt" \
    -frames:v "$n" "${X264[@]}" "$(basename "$dest")")
}

seg_negro () {
  ffmpeg -v error -y -f lavfi -i "color=c=${NEGRO}:s=1920x1080:r=30" \
    -frames:v "$(( $2 + EXTRA ))" "${X264[@]}" "$T/$1.mp4"
}

seg_placa () {
  ffmpeg -v error -y -i "$P/$2" -vf "tpad=stop_mode=clone:stop_duration=3" \
    -frames:v "$(( $3 + EXTRA ))" "${X264[@]}" "$T/$1.mp4"
}

# ─────────────────────────────────────────────────────────────────────────────
# Los mismos, en 9:16 — los usa `verticales.sh`
#
# La diferencia entre los dos formatos no es un numero: es que el material se
# consigue de dos maneras distintas y hay que tratarlo distinto.
#
# · Las piezas de Remotion **se renderizan de nuevo** paradas, con
#   `packages/placas/scripts/vertical.mjs`. La camara del mapa sale del tamanio
#   del cuadro, asi que un cuadro parado no es un recorte del apaisado: es otro
#   encuadre, calculado. No se estira nada.
#
# · Las grabaciones de la app **se recortan en columna**, y ahi si se agranda:
#   de los 1920x1080 de la captura se toma una ventana de 607x1080 y se la lleva
#   a 1080x1920, que es x1,78. Es el unico lugar de los reels donde se inventan
#   pixeles, y no hay vuelta: la pantalla se grabo una vez y a esa medida. Lo
#   que se elige, plano por plano, es QUE columna; por eso `x` es un argumento
#   y no una cuenta.
# ─────────────────────────────────────────────────────────────────────────────

# seg_v <salida> <corte> <desde> <cuadros> <vel> <x-del-recorte> [placa.mov@retardo ...]
seg_v () {
  local dest="$T/$1.mp4" src="$C/$2.mp4" desde="$3" n="$(( $4 + EXTRA ))" vel="$5" x="$6"
  shift 6
  local -a ins=(-ss "$desde" -i "$src" -i "$P/banda-v.png")
  local fc="[0:v]setpts=PTS/${vel},fps=30,crop=607:1080:${x}:0,"
  fc="${fc}scale=1080:1920:flags=lanczos,setsar=1[v];[v][1:v]overlay=0:0[b1]"
  local previo=b1 i=2 capa f retardo
  for capa in "$@"; do
    f="${capa%%@*}"; retardo="${capa##*@}"
    ins+=(-i "$P/$f")
    fc="${fc};[${i}:v]format=rgba,tpad=start_duration=${retardo}:start_mode=add:color=0x00000000[c${i}]"
    fc="${fc};[${previo}][c${i}]overlay=0:0:eof_action=pass:repeatlast=0[b${i}]"
    previo="b${i}"; i=$((i + 1))
  done
  fc="${fc};[${previo}]tpad=stop_mode=clone:stop_duration=1[z]"
  ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[z]" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# seg_pieza_v <salida> <ruta-relativa-a-portada-animacion> <desde> <cuadros> <vel>
#
# El `scale` esta de guardia, igual que en `seg_pieza`: los maestros verticales
# ya llegan a 1080x1920 y ffmpeg no escala cuando las medidas coinciden.
seg_pieza_v () {
  local dest="$T/$1.mp4" src="$A/$2" desde="$3" n="$(( $4 + EXTRA ))" vel="$5"
  ffmpeg -v error -y -ss "$desde" -i "$src" \
    -vf "setpts=PTS/${vel},fps=30,scale=1080:1920:flags=lanczos,setsar=1,tpad=stop_mode=clone:stop_duration=1" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# seg_foto_v <salida> <ruta-relativa-a-portada-animacion> <cuadros>
#
# El PNG ya viene a 1800x3200 —`crudo-vertical-1800.png`, rendido a doble
# escala— que es 1,667 veces el cuadro, los mismos 1,667 que tiene el
# horizontal con sus 3200 sobre 1920. El empuje recorta de ahi y no agranda
# nada.
seg_foto_v () {
  local dest="$T/$1.mp4" src="$A/$2" n="$(( $3 + EXTRA ))"
  ffmpeg -v error -y -loop 1 -i "$src" \
    -vf "scale=1800:-2:flags=lanczos,zoompan=z='1+0.00035*on':d=1:fps=30:s=1080x1920:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',setsar=1" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

seg_negro_v () {
  ffmpeg -v error -y -f lavfi -i "color=c=${NEGRO}:s=1080x1920:r=30" \
    -frames:v "$(( $2 + EXTRA ))" "${X264[@]}" "$T/$1.mp4"
}

# quemar <mudo> <archivo.ass> <salida>
#
# Se entra a la carpeta y se le pasa el nombre pelado: el filtro `subtitles`
# separa sus opciones con dos puntos y una ruta de Windows se le parte en la
# letra de unidad.
quemar () {
  cp -f "$G/$2" "$T/$2"
  (cd "$T" && ffmpeg -v error -y -i "$1" -vf "subtitles=$2" "${X264[@]}" "$3")
}

pegar () {
  local dest="$1"; shift
  local lista="$T/lista.txt" s
  : > "$lista"
  for s in "$@"; do printf "file '%s.mp4'\n" "$s" >> "$lista"; done
  ffmpeg -v error -y -f concat -safe 0 -i "$lista" -c copy "$dest"
}

# ─────────────────────────────────────────────────────────────────────────────
# pegar_suave <salida> <archivo.ass> <seg1> <seg2> ...
#
# Pega los segmentos disolviendo uno en el siguiente y quema los subtitulos,
# todo en una pasada.
#
# No recibe las duraciones: **las mide**. Cada segmento se escribio con EXTRA
# cuadros de mas, asi que los cuadros que le tocan son los que tiene menos
# EXTRA. Medirlos en vez de confiar en los que se pidieron es lo que hace que
# un segmento que salio corto se note aca y no en el video terminado.
#
# El plano k+1 empieza a aparecer exactamente donde terminaba el plano k en la
# linea de tiempo, asi que la suma de los cuadros nominales es el largo final
# y la voz sigue cayendo donde cae.
#
# Esta aca y no en `final.sh` porque la usan los dos montajes —la version final
# horizontal y los dos reels— y los cortes se tienen que disolver igual en
# todos: una segunda copia es la forma segura de que un dia uno de los dos
# empiece a cortar distinto.
# ─────────────────────────────────────────────────────────────────────────────
#
# `csv=p=0` deja la coma del separador aunque se pida un solo campo, asi que
# la salida viene como «117,» y eso adentro de un $(( )) es un error de
# sintaxis, no un cero: se queda solo con los digitos.
cuadros_de () {
  local n
  n="$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames \
       -of csv=p=0 "$1" | tr -dc '0-9')"
  if [ -z "$n" ]; then
    n="$(ffprobe -v error -count_frames -select_streams v:0 \
         -show_entries stream=nb_read_frames -of csv=p=0 "$1" | tr -dc '0-9')"
  fi
  printf '%s' "$n"
}

pegar_suave () {
  local dest="$1" ass="$2"; shift 2
  local -a ins=() nn=()
  local s n total=0 esperado

  for s in "$@"; do
    n="$(cuadros_de "$T/$s.mp4")"
    esperado=$((n - EXTRA))
    if [ "$esperado" -lt 1 ]; then
      printf 'El segmento %s salio con %s cuadros: no llega ni a los %d del disolver\n' \
        "$s" "$n" "$EXTRA" >&2
      exit 1
    fi
    ins+=(-i "$T/$s.mp4")
    nn+=("$esperado")
    total=$((total + esperado))
  done

  # La cadena. El offset del disolver k es donde termina el plano k en la
  # linea de tiempo, contado en cuadros y pasado a segundos con seis
  # decimales: a treinta cuadros por segundo, redondear a centesimas corre
  # medio cuadro por corte y veintidos cortes son siete cuadros.
  local fc="" previo="0:v" i=1 acum=0
  while [ "$i" -lt "${#nn[@]}" ]; do
    acum=$((acum + nn[i - 1]))
    fc="${fc}[${previo}][${i}:v]xfade=transition=fade:duration=${DISOLVER}"
    fc="${fc}:offset=$(awk -v a="$acum" 'BEGIN{printf "%.6f", a/30}')[x${i}];"
    previo="x${i}"
    i=$((i + 1))
  done
  fc="${fc}[${previo}]subtitles=${ass}[v]"

  cp -f "$G/$ass" "$T/$ass"
  printf '  %d planos · %d cortes disueltos · %d cuadros\n' \
    "${#nn[@]}" "$(( ${#nn[@]} - 1 ))" "$total"

  # `-color_range tv` no es decoracion: sin el, el rango del resultado lo
  # NEGOCIA ffmpeg a partir de la mezcla de entradas, y la mezcla cambia de un
  # montaje a otro. Los segmentos llegan de dos clases: los que salen de una
  # pieza de Remotion son `yuvj420p` de rango completo, y los demas —el negro,
  # la foto, las grabaciones de la app— son `yuv420p` de rango limitado.
  #
  # En el horizontal son diecisiete limitados contra seis completos y la cadena
  # se resuelve en limitado, que es lo correcto. En el reel de 30 s son cinco
  # contra cinco, se resolvio en completo, y como `pegar_sonido` escribe el
  # atomo `colr` con `tv` igual, el archivo terminaba **diciendo rango limitado
  # y llevando rango completo**: los negros levantados y los blancos recortados
  # segun que reproductor lo abra.
  #
  # Medido sobre un disolver de prueba entre el negro de arranque y la portada:
  # sin el flag, el tramo de la pieza sale con la luma entre 0 y 255; con el
  # flag, entre 15 y 234, que es la misma conversion que el horizontal ya le
  # venia haciendo a sus piezas. (Esto no quiere decir que el video entero
  # quede adentro de 16..235: las grabaciones de la app traen blancos en 255 y
  # el horizontal aprobado tambien los tiene.)
  #
  # Pedirlo explicito hace que ffmpeg convierta lo que haga falta antes de
  # encodear, en vez de adivinar. Para el horizontal no cambia un pixel: ya
  # venia resolviendose asi, y lo unico que agrega es decirlo en el flujo
  # ademas de en el contenedor.
  (cd "$T" && ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" \
    -map "[v]" -frames:v "$total" "${X264[@]}" -color_range tv "$(basename "$dest")")
}

# ─────────────────────────────────────────────────────────────────────────────
# El sonido
#
# La voz sale de uno o de varios archivos. Cada frase declara de cual sale y
# con cuanta ganancia entra, y la ganancia no es decoracion: una toma grabada
# 5 LU mas fuerte se despega del resto, porque la normalizacion final es una
# sola para toda la pista y no toca las diferencias de adentro, las conserva.
# ─────────────────────────────────────────────────────────────────────────────
archivo_de () {
  case "$1" in
    base) printf '%s' "$V/audio en off/voz en off app.acequia video-1.mpeg" ;;
    n1)   printf '%s' "$V/audio en off/nuevo 1.mp4" ;;
    n2)   printf '%s' "$V/audio en off/nuevo 2.mp4" ;;
    n3)   printf '%s' "$V/audio en off/nuevo 3.mp4" ;;
    *)    printf 'fuente desconocida: %s\n' "$1" >&2; exit 1 ;;
  esac
}

voz () {   # voz <nombre> <frases.txt> <duracion> <salida.wav>
  local nombre="$1" tabla="$2" dur="$3" dest="$4"
  local tmp="$W/$nombre"
  rm -rf "$tmp"; mkdir -p "$tmp"

  local -a ins=()
  local fc="" mezcla="" i=0
  local uid fuente desde hasta destino ganancia d corte retardo cruda

  while read -r uid fuente desde hasta destino ganancia; do
    case "$uid" in ''|'#'*) continue ;; esac
    cruda="$(archivo_de "$fuente")"
    desde=$(awk -v a="$desde" -v m="$MARGEN_A" 'BEGIN{printf "%.3f", a-m}')
    d=$(awk -v a="$desde" -v b="$hasta" -v m="$MARGEN_B" \
        'BEGIN{printf "%.3f", b+m-a}')
    corte="$tmp/$uid.wav"
    ffmpeg -v error -y -ss "$desde" -t "$d" -i "$cruda" \
      -af "volume=${ganancia}dB,atempo=${VELOCIDAD},afade=t=in:d=0.04,afade=t=out:st=$(awk \
           -v d="$d" -v v="$VELOCIDAD" 'BEGIN{printf "%.3f", d/v-0.04}'):d=0.04" \
      -ar 48000 -ac 1 "$corte"
    retardo=$(awk -v t="$destino" -v m="$MARGEN_A" -v v="$VELOCIDAD" \
              'BEGIN{printf "%d", (t-m/v)*1000}')
    ins+=(-i "$corte")
    fc="${fc}[${i}:a]adelay=${retardo}[d${i}];"
    mezcla="${mezcla}[d${i}]"
    i=$((i + 1))
  done < "$tabla"

  fc="${fc}${mezcla}amix=inputs=${i}:normalize=0:duration=longest[m];"
  fc="${fc}[m]apad,atrim=0:${dur},loudnorm=I=-16:TP=-1.5:LRA=11[a]"
  ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[a]" \
    -ar 48000 -ac 1 "$dest"
}

mezclar () {   # mezclar <voz.wav> <cama.wav> <salida.wav>
  ffmpeg -v error -y -i "$1" -i "$2" -filter_complex "
    [1:a][0:a]sidechaincompress=threshold=0.05:ratio=4:attack=30:release=700[c];
    [0:a][c]amix=inputs=2:normalize=0,alimiter=limit=0.97,
      loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
    -map "[a]" -ar 48000 -ac 1 "$3"
}

# El paso que junta la imagen con el sonido es tambien donde se etiqueta el
# color. x264 deja el VUI en «sin especificar» y entonces cada reproductor
# decide: a 1080p todos eligen bt709 y rango limitado, que es lo correcto, pero
# «todos eligen bien» no es lo mismo que decirlo. Va con `-c:v copy`, asi que
# no recomprime nada: escribe el atomo `colr` del contenedor y listo.
pegar_sonido () {
  ffmpeg -v error -y -i "$1" -i "$2" -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 192k -shortest \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
    -movflags +faststart "$3"
}
