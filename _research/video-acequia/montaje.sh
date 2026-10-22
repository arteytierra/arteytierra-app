#!/usr/bin/env bash
#
# Arma los tres videos mudos, con los subtitulos karaoke ya quemados:
#
#   segmentos/h-mudo-sub.mp4    1920x1080 · 72,0 s · la madre
#   segmentos/v30-mudo-sub.mp4  1080x1920 · 30,0 s · reel
#   segmentos/v15-mudo-sub.mp4  1080x1920 · 15,0 s · story
#
# El sonido lo pega despues `voz.sh`. Se hace en ese orden porque quemar los
# subtitulos obliga a recodificar la imagen, y recodificar con el audio adentro
# seria recomprimirlo al pedo.
#
# Antes de correr esto:
#   1. los cortes estan en $V/cortes      (ver MONTAJE.md)
#   2. las placas estan en $V/placas      (pnpm --filter @arteytierra/placas render-video)
#   3. la linea de tiempo esta generada:  py -3.12 _research/video-acequia/tiempos.py
#
#   bash _research/video-acequia/montaje.sh ["/c/Arte y Tierra/Acequia/videoapp-1"]
#
# Como esta armado, y por que asi:
#
# Cada elemento de la linea de tiempo se construye como un **segmento** suelto,
# con su recorte, su velocidad, la banda del pie y los MOV con alfa ya encima, y
# todos con exactamente los mismos parametros de codificacion. Recien despues se
# pegan con el demuxer `concat` y `-c copy`. Esa es la unica parte del proceso
# donde `-c copy` es honesto: cada segmento empieza en un keyframe porque acaba
# de nacer, asi que el pegado no recomprime nada y no agrega una generacion.
#
# La duracion de cada segmento se fija con `-frames:v`, nunca con `-t`: los
# cortes vienen de una grabacion que perdio cuadros, y `-t` sobre PTS irregular
# devuelve clips cortos. Ver la seccion de los 30 fps en MONTAJE.md.
#
# **El horizontal ya no trae los titulares `t0*.mov`.** Decian lo mismo que
# ahora dice la voz —«Donde va el agua», «Donde entra el animal»— y ademas
# caian abajo a la derecha, justo donde van los subtitulos. Quedan los pies
# `pie-*.mov`, que citan la fuente de cada capa y viven adentro de la banda.
# Los verticales si los conservan: ahi el subtitulo va dentro de la banda y los
# titulares quedan arriba, sin pisarse.
set -euo pipefail

export PATH="$PATH:/c/Users/Usuario/AppData/Local/Microsoft/WinGet/Links"

V="${1:-/c/Arte y Tierra/Acequia/videoapp-1}"
C="$V/cortes"
P="$V/placas"
O="$V/salida"
T="$O/segmentos"
G="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$T"

# Un solo perfil de codificacion para todo. CRF 17 sobre material que ya venia
# en CRF 16 es visualmente transparente y deja los segmentos pegables.
X264=(-c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -r 30 -an)

# ─────────────────────────────────────────────────────────────────────────────
# Constructores de segmento
# ─────────────────────────────────────────────────────────────────────────────

# seg_h <salida> <corte> <desde> <cuadros> <velocidad> [placa.mov@retardo ...]
#
# `velocidad` 1 es normal; 3 significa tres veces mas rapido y 0,64, mas lento.
# El `fps=30` posterior al `setpts` es el que rellena los huecos de la
# grabacion: sin el, acelerar un clip con cuadros faltantes deja saltos.
seg_h () {
  local dest="$T/$1.mp4" src="$C/$2.mp4" desde="$3" n="$4" vel="$5"
  shift 5
  local -a ins=(-ss "$desde" -i "$src" -i "$P/banda-h.png")
  local fc="[0:v]setpts=PTS/${vel},fps=30[v];[v][1:v]overlay=0:0[b1]"
  local previo=b1 i=2
  local capa f retardo
  for capa in "$@"; do
    f="${capa%%@*}"
    retardo="${capa##*@}"
    ins+=(-i "$P/$f")
    fc="${fc};[${i}:v]format=rgba,tpad=start_duration=${retardo}:start_mode=add:color=0x00000000[c${i}]"
    fc="${fc};[${previo}][c${i}]overlay=0:0:eof_action=pass:repeatlast=0[b${i}]"
    previo="b${i}"
    i=$((i + 1))
  done
  ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[${previo}]" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# seg_v <salida> <corte> <desde> <cuadros> <velocidad> <x-del-recorte> [placa.mov@retardo ...]
#
# El vertical no es un recorte centrado: se elige la columna plano por plano.
# `x` es el borde izquierdo de una ventana de 607x1080 —el alto completo, que es
# lo que manda la relacion 9:16— y despues se agranda x1,78 a 1080x1920. Los
# 140 px de la banda pasan a ser 250, que es justo lo que devuelve `ALTO_BANDA`
# para vertical: por eso los dos formatos usan la misma medida sin retoques.
seg_v () {
  local dest="$T/$1.mp4" src="$C/$2.mp4" desde="$3" n="$4" vel="$5" x="$6"
  shift 6
  local -a ins=(-ss "$desde" -i "$src" -i "$P/banda-v.png")
  local fc="[0:v]setpts=PTS/${vel},fps=30,crop=607:1080:${x}:0,scale=1080:1920:flags=lanczos[v]"
  fc="${fc};[v][1:v]overlay=0:0[b1]"
  local previo=b1 i=2
  local capa f retardo
  for capa in "$@"; do
    f="${capa%%@*}"
    retardo="${capa##*@}"
    ins+=(-i "$P/$f")
    fc="${fc};[${i}:v]format=rgba,tpad=start_duration=${retardo}:start_mode=add:color=0x00000000[c${i}]"
    fc="${fc};[${previo}][c${i}]overlay=0:0:eof_action=pass:repeatlast=0[b${i}]"
    previo="b${i}"
    i=$((i + 1))
  done
  ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[${previo}]" \
    -frames:v "$n" "${X264[@]}" "$dest"
}

# Una placa que va sola y a pantalla completa. `tpad` clona el ultimo cuadro:
# el cierre de marca dura 5 s y la voz necesita 6, y como termina en un lockup
# quieto, congelarlo un segundo no se ve. Sin eso, `-frames:v 180` sobre 150
# cuadros devolveria un segmento corto y el video entero quedaria desfasado.
seg_placa () {
  ffmpeg -v error -y -i "$P/$2" -vf "tpad=stop_mode=clone:stop_duration=3" \
    -frames:v "$3" "${X264[@]}" "$T/$1.mp4"
}

# Negro. El video abre con cuatro decimas de nada: es lo que separa el primer
# plano del final del video anterior en un feed.
seg_negro () {
  ffmpeg -v error -y -f lavfi -i "color=c=0x1A1210:s=$3:r=30" \
    -frames:v "$2" "${X264[@]}" "$T/$1.mp4"
}

# quemar <mudo> <archivo.ass> <salida>
#
# El `subtitles` de ffmpeg toma sus opciones separadas por dos puntos, asi que
# una ruta de Windows —`C:\…`— se parte en la `C:` y el filtro intenta leer el
# resto como un tamanio de imagen. En vez de pelearse con el escapado, se entra
# a la carpeta y se le pasa el nombre pelado: sin barras y sin dos puntos, no
# hay nada que interpretar mal.
quemar () {
  local mudo="$1" ass="$2" dest="$3"
  cp "$G/$ass" "$T/$ass"
  (cd "$T" && ffmpeg -v error -y -i "$mudo" -vf "subtitles=${ass}" \
    "${X264[@]}" "$dest")
}

pegar () { # pegar <salida> <segmento> ...
  local dest="$1"
  shift
  local lista="$T/lista.txt"
  : > "$lista"
  local s
  for s in "$@"; do printf "file '%s.mp4'\n" "$s" >> "$lista"; done
  ffmpeg -v error -y -f concat -safe 0 -i "$lista" -c copy "$dest"
}

# ─────────────────────────────────────────────────────────────────────────────
# La madre: 1920x1080, 72,0 s, 2160 cuadros
#
# La lista de planos la escribe `tiempos.py` y por eso no esta aca: el largo de
# cada uno sale de la frase que lo acompania. Si hay que mover algo, se mueve
# alla y se vuelve a correr. Ver la cabecera de ese archivo.
#
# Eran 90 s con la placa de la curva numero adentro. Salio por pedido de
# Jonatan —«no le encuentro tanto sentido»— y con ella el panel de los 179.787
# m3. En su lugar quedan dos planos de la app de verdad: la cuenca
# resolviendose sola y el panel de capas con el shader de pendientes.
# ─────────────────────────────────────────────────────────────────────────────
printf 'Horizontal…\n'

if [ ! -f "$G/generado/planos-h.sh" ]; then
  printf 'Falta generado/planos-h.sh. Corre primero:\n'
  printf '  py -3.12 _research/video-acequia/tiempos.py\n'
  exit 1
fi
# shellcheck source=/dev/null
. "$G/generado/planos-h.sh"

quemar h-mudo.mp4 karaoke-h.ass "h-mudo-sub.mp4"

# ─────────────────────────────────────────────────────────────────────────────
# Vertical de 30 s, 900 cuadros
# ─────────────────────────────────────────────────────────────────────────────
printf 'Vertical de 30 s…\n'

seg_v v01 01-descenso           0.0  84 7.1429 726 v30-t01-terreno.mov@0
seg_v v02 03-perimetro          0.0  54 9.4444 877
seg_v v03 04-relieve            2.2  36 1      860
seg_v v04 05-clima              1.8  36 1       70
seg_v v05 06-suelo              2.0  36 1       70
seg_v v06 07-cobertura          2.6  36 1       70
seg_v v07 08-ecorregion-yungas  1.5  36 1       70
seg_v v08 09-cuenca-resolviendo 2.6  54 1      745

seg_placa v09 cruce-v30.mp4 195

seg_v v10 11-keyline            2.0  54 1       40
seg_v v11 13-represa            1.0  45 1       40
seg_v v12 16a-potreros-panel    1.5  45 1       40
seg_v v13 20-salud-del-calculo  0.3  84 1       40 v30-t04-honestidad.mov@0

seg_placa v14 cierre-v30.mp4 105

pegar "$T/v30-mudo.mp4" v01 v02 v03 v04 v05 v06 v07 v08 v09 v10 v11 v12 v13 v14
quemar v30-mudo.mp4 karaoke-v30.ass "v30-mudo-sub.mp4"

# ─────────────────────────────────────────────────────────────────────────────
# Vertical de 15 s, 450 cuadros
# ─────────────────────────────────────────────────────────────────────────────
printf 'Vertical de 15 s…\n'

seg_v w01 01-descenso          0.0 60 10 726 v15-t01-terreno.mov@0
seg_v w02 04-relieve           2.3 24 1  860
seg_v w03 05-clima             1.9 24 1   70
seg_v w04 06-suelo             2.2 24 1   70
seg_v w05 07-cobertura         2.7 24 1   70

seg_placa w06 cruce-v15.mp4 150

seg_v w07 20-salud-del-calculo 0.3 54 1   40 v15-t02-honestidad.mov@0

seg_placa w08 cierre-v15.mp4 90

pegar "$T/v15-mudo.mp4" w01 w02 w03 w04 w05 w06 w07 w08
quemar v15-mudo.mp4 karaoke-v15.ass "v15-mudo-sub.mp4"

# ─────────────────────────────────────────────────────────────────────────────
printf '\n'
for f in "$T"/*-mudo-sub.mp4; do
  printf '%s  %s cuadros  %s\n' \
    "$(basename "$f")" \
    "$(ffprobe -v error -count_frames -select_streams v:0 \
        -show_entries stream=nb_read_frames -of csv=p=0 "$f")" \
    "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
        -of csv=p=0:s=x "$f")"
done
printf '\nAhora el sonido:  bash _research/video-acequia/voz.sh\n'
