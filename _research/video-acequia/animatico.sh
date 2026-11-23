#!/usr/bin/env bash
#
# El animatico del SEGUNDO video, en sus dos variantes:
#
#   salida/animatico-02a.mp4   1920x1080 · 88,0 s · el acto 1 en cine
#   salida/animatico-02b.mp4   1920x1080 · 88,0 s · el acto 1 en captura
#
#   bash _research/video-acequia/animatico.sh ["/c/Arte y Tierra/Acequia/videoapp-1"]
#
# Antes de correr esto:
#   py -3.12 _research/video-acequia/tiempos-02.py
#
# ── Que es un animatico y que no ───────────────────────────────────────────
#
# Es el corte entero, con la voz definitiva, con todos los planos que ya
# existen en su lugar, y con **un cartel negro del largo exacto** donde iria
# una pieza que todavia no esta renderizada. Sirve para una sola cosa, que es
# la que importa: ver si el corte pega. Si pega, se renderizan las piezas que
# faltan y se vuelve a correr esto mismo cambiando tres lineas de tiempos-02.py.
#
# Dos cosas que NO son definitivas y conviene no juzgar:
#
# 1. **Las piezas de Remotion suben de 1280x720 a 1920x1080.** Se renderizaron
#    a 720 para la web y aca se agrandan x1,5 con lanczos, asi que las curvas
#    de nivel y los textos chicos salen mas blandos de lo que van a salir. La
#    entrega se rinde de nuevo con `--scale=1.5`, que no agranda pixeles: los
#    dibuja. Eso no se hace para un animatico porque son catorce renders.
# 2. **La cama sigue sintetizada.** Lo mismo que en el primero: se reemplaza
#    dejando un `musica.mp3` en `videoapp-1/audio en off/`.
#
# ── Por que hay un seg_pieza aparte de seg_h ───────────────────────────────
#
# Los cortes de la app llevan la banda de 140 px que tapa la barra de
# Screenity. Las piezas de Remotion no tienen barra que tapar: ponerles la
# banda seria taparles el pie de fuente que ya traen dibujado. Son dos
# materiales distintos y se construyen distinto, y esa diferencia es a
# proposito: en el video se tiene que notar cual es la app y cual es el dato.
set -euo pipefail

export PATH="$PATH:/c/Users/Usuario/AppData/Local/Microsoft/WinGet/Links"

V="${1:-/c/Arte y Tierra/Acequia/videoapp-1}"
A="/c/Arte y Tierra/Acequia/portada animacion"
C="$V/cortes"
P="$V/placas"
O="$V/salida"
T="$O/animatico"
W="$O/animatico/sonido"
G="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUENTES_TTF="/c/Users/Usuario/AppData/Local/Microsoft/Windows/Fonts"

VELOCIDAD=1.1      # la que eligio Jonatan
MARGEN_A=0.08      # sala que se toma antes de cada frase
MARGEN_B=0.10      # sala que se toma despues

mkdir -p "$T" "$W"

if [ ! -f "$G/generado-02/planos-a.sh" ]; then
  printf 'Falta generado-02/. Corre primero:\n'
  printf '  py -3.12 _research/video-acequia/tiempos-02.py\n'
  exit 1
fi
# shellcheck source=/dev/null
. "$G/generado-02/duraciones.sh"

# El `drawtext` de ffmpeg toma la tipografia por fontconfig, que en esta
# maquina no tiene archivo de configuracion y resuelve a lo que encuentra. Con
# `fontfile` y el archivo al lado no hay nada que resolver. Y va copiado a la
# carpeta de trabajo porque `fontfile=C:\...` se parte en los dos puntos.
cp -f "$FUENTES_TTF/Inter-Medium.ttf"  "$T/Inter-Medium.ttf"
cp -f "$FUENTES_TTF/Inter-Regular.ttf" "$T/Inter-Regular.ttf"

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
  local dest="$T/$1.mp4" src="$C/$2.mp4" desde="$3" n="$4" vel="$5"
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
  ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[${previo}]" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# seg_pieza <salida> <ruta-relativa-a-portada-animacion> <desde> <cuadros> <vel>
#
# Sin banda y sin capas: la pieza ya trae su pie de fuente dibujado adentro.
# El `scale` a 1920x1080 es el que sube de 720; `fps=30` despues del `setpts`
# por la misma razon que en seg_h, aunque estas no pierden cuadros.
#
# El `tpad` del final clona el ultimo cuadro hasta un segundo. No es para
# estirar nada: es para los planos que piden la COLA de una pieza, donde el
# redondeo del segundo de arranque a centesimas puede dejar el pedido un
# cuadro mas largo que lo que queda de fuente. Sin esto el segmento sale corto
# y **todo el video de ahi en adelante se corre 33 ms**, que es la clase de
# error que no se ve hasta que la voz no cierra con la imagen.
seg_pieza () {
  local dest="$T/$1.mp4" src="$A/$2" desde="$3" n="$4" vel="$5"
  ffmpeg -v error -y -ss "$desde" -i "$src" \
    -vf "setpts=PTS/${vel},fps=30,scale=1920:1080:flags=lanczos,setsar=1,tpad=stop_mode=clone:stop_duration=1" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# seg_foto <salida> <ruta-relativa-a-portada-animacion> <cuadros>
#
# Un PNG con un empuje muy lento. Se agranda primero a 3200 px y despues el
# `zoompan` recorta: haciendolo al reves el zoom salta de pixel en pixel y se
# ve el escalon. El 1,00 -> 1,04 en tres segundos y medio no se lee como
# movimiento, se lee como que la imagen esta viva.
seg_foto () {
  local dest="$T/$1.mp4" src="$A/$2" n="$3"
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
  local dest="$T/$1.mp4" n="$2" titulo="$3" bajada="$4" largo="$5"
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
    -frames:v "$2" "${X264[@]}" "$T/$1.mp4"
}

seg_placa () {
  ffmpeg -v error -y -i "$P/$2" -vf "tpad=stop_mode=clone:stop_duration=3" \
    -frames:v "$3" "${X264[@]}" "$T/$1.mp4"
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
# El sonido
#
# Igual que en `voz.sh`, con una diferencia: la voz sale de cuatro archivos y
# no de uno. Cada frase declara de cual sale y con cuanta ganancia entra, y la
# ganancia no es decoracion —las tres tomas nuevas se grabaron entre 5 y 7 LU
# mas fuerte que la de octubre y la normalizacion final es una sola para toda
# la pista, asi que no corrige las diferencias de adentro: las conserva—.
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

# La cama es la misma que la del primer video, del mismo archivo. Mantener dos
# copias de cuatro acordes y un ruido rosa es la forma segura de que un dia
# suenen distinto.
MUSICA_PROPIA="$V/audio en off/musica"   # sin extension; si existe, manda
# shellcheck source=/dev/null
. "$G/cama.sh"

mezclar () {   # mezclar <voz.wav> <cama.wav> <salida.wav>
  ffmpeg -v error -y -i "$1" -i "$2" -filter_complex "
    [1:a][0:a]sidechaincompress=threshold=0.05:ratio=4:attack=30:release=700[c];
    [0:a][c]amix=inputs=2:normalize=0,alimiter=limit=0.97,
      loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
    -map "[a]" -ar 48000 -ac 1 "$3"
}

pegar_sonido () {
  ffmpeg -v error -y -i "$1" -i "$2" -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$3"
}

# ─────────────────────────────────────────────────────────────────────────────
for clave in a b; do
  case "$clave" in
    a) dur="$DURACION_A"; titulo="acto 1 en cine" ;;
    b) dur="$DURACION_B"; titulo="acto 1 en captura" ;;
  esac
  printf 'Variante %s · %s (%s s)…\n' "${clave^^}" "$titulo" "$dur"

  printf '  imagen…\n'
  # shellcheck source=/dev/null
  . "$G/generado-02/planos-$clave.sh"
  quemar "$clave-mudo.mp4" "karaoke-02$clave.ass" "$clave-mudo-sub.mp4"

  printf '  sonido…\n'
  voz "$clave" "$G/generado-02/frases-$clave.txt" "$dur" "$W/voz-$clave.wav"
  cama "$dur" "$W/cama-$clave.wav"
  mezclar "$W/voz-$clave.wav" "$W/cama-$clave.wav" "$W/mezcla-$clave.wav"
  pegar_sonido "$T/$clave-mudo-sub.mp4" "$W/mezcla-$clave.wav" \
    "$O/animatico-02$clave.mp4"
done

printf '\n'
for f in "$O"/animatico-02?.mp4; do
  printf '%-24s %6s s  %s cuadros  %s  %s\n' "$(basename "$f")" \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")" \
    "$(ffprobe -v error -count_frames -select_streams v:0 \
        -show_entries stream=nb_read_frames -of csv=p=0 "$f")" \
    "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
        -of csv=p=0:s=x "$f")" \
    "$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate \
        -of csv=p=0 "$f")"
done
