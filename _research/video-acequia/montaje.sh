#!/usr/bin/env bash
#
# Arma los tres videos de presentación de acequia a partir de los cortes y de
# las placas ya renderizadas:
#
#   acequia-90s.mp4           1920×1080 · la madre
#   acequia-30s-vertical.mp4  1080×1920 · reel, con subtítulos quemados
#   acequia-15s-vertical.mp4  1080×1920 · story, con subtítulos quemados
#
# Antes de correr esto:
#   1. los cortes están en $V/cortes      (ver MONTAJE.md)
#   2. las placas están en $V/placas      (pnpm --filter @arteytierra/placas render-video)
#
#   bash _research/video-acequia/montaje.sh ["/c/Arte y Tierra/Acequia/videoapp-1"]
#
# Cómo está armado, y por qué así:
#
# Cada elemento de la línea de tiempo se construye como un **segmento** suelto,
# con su recorte, su velocidad, la banda del pie y los MOV con alfa ya encima, y
# todos con exactamente los mismos parámetros de codificación. Recién después se
# pegan con el demuxer `concat` y `-c copy`. Esa es la única parte del proceso
# donde `-c copy` es honesto: cada segmento empieza en un keyframe porque acaba
# de nacer, así que el pegado no recomprime nada y no agrega una generación.
#
# La duración de cada segmento se fija con `-frames:v`, nunca con `-t`: los
# cortes vienen de una grabación que perdió cuadros, y `-t` sobre PTS irregular
# devuelve clips cortos. Ver la sección de los 30 fps en MONTAJE.md.
set -euo pipefail

V="${1:-/c/Arte y Tierra/Acequia/videoapp-1}"
C="$V/cortes"
P="$V/placas"
O="$V/salida"
T="$O/segmentos"
G="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$T"

# Un solo perfil de codificación para todo. CRF 17 sobre material que ya venía
# en CRF 16 es visualmente transparente y deja los segmentos pegables.
X264=(-c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -r 30 -an)

# ─────────────────────────────────────────────────────────────────────────────
# Constructores de segmento
# ─────────────────────────────────────────────────────────────────────────────

# seg_h <salida> <corte> <desde> <cuadros> <velocidad> [placa.mov@retardo ...]
#
# `velocidad` 1 es normal; 3 significa tres veces más rápido. El `fps=30`
# posterior al `setpts` es el que rellena los huecos de la grabación: sin él,
# acelerar un clip con cuadros faltantes deja saltos.
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
# `x` es el borde izquierdo de una ventana de 607×1080 —el alto completo, que es
# lo que manda la relación 9:16— y después se agranda ×1,78 a 1080×1920. Los
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

# Una placa que va sola y a pantalla completa. Se recodifica con el mismo perfil
# que el resto para que el `concat` no tenga que recomprimir.
seg_placa () {
  ffmpeg -v error -y -i "$P/$2" -frames:v "$3" "${X264[@]}" "$T/$1.mp4"
}

# Negro. El video abre con cuatro décimas de nada: es lo que separa el primer
# plano del final del video anterior en un feed.
seg_negro () {
  ffmpeg -v error -y -f lavfi -i "color=c=0x1A1210:s=$3:r=30" \
    -frames:v "$2" "${X264[@]}" "$T/$1.mp4"
}

# quemar <mudo> <archivo.ass> <salida>
#
# El `subtitles` de ffmpeg toma sus opciones separadas por dos puntos, así que
# una ruta de Windows —`C:\…`— se parte en la `C:` y el filtro intenta leer el
# resto como un tamaño de imagen. En vez de pelearse con el escapado, se entra a
# la carpeta y se le pasa el nombre pelado: sin barras y sin dos puntos, no hay
# nada que interpretar mal.
quemar () {
  local mudo="$1" ass="$2" dest="$3"
  cp "$G/$ass" "$T/$ass"
  (cd "$T" && ffmpeg -v error -y -i "$mudo" -vf "subtitles=${ass}" \
    "${X264[@]}" -movflags +faststart "$dest")
}

pegar () { # pegar <salida> <segmento> ...
  local dest="$1"
  shift
  local lista="$T/lista.txt"
  : > "$lista"
  local s
  for s in "$@"; do printf "file '%s.mp4'\n" "$s" >> "$lista"; done
  ffmpeg -v error -y -f concat -safe 0 -i "$lista" -c copy -movflags +faststart "$dest"
}

# ─────────────────────────────────────────────────────────────────────────────
# La madre: 1920×1080, 90,0 s, 2700 cuadros
# ─────────────────────────────────────────────────────────────────────────────
printf 'Horizontal…\n'

seg_negro  h01 12 1920x1080

# 01 va a 2,985× y no a 3× redondo: son 600 cuadros de fuente en 201 de salida,
# y el número que los divide es el que sale de esa cuenta, no de la intención.
seg_h h02 01-descenso          0.0 201 2.9851 t01-terreno.mov@1.6
seg_h h03 02-descenso-cola     0.3  72 1      t02-ya-sabe.mov@0
seg_h h04 03-perimetro         0.0  93 5.4839 t03-no-cargas.mov@0
seg_h h05 04-relieve           0.4  84 1      pie-relieve.mov@0
seg_h h06 05-clima             0.4  84 1      pie-clima.mov@0
seg_h h07 06-suelo             0.5  84 1      pie-suelo.mov@0
seg_h h08 07-cobertura         0.9  84 1      pie-cobertura.mov@0
seg_h h09 08-ecorregion-yungas 0.5  84 1      pie-ecorregion.mov@0
seg_h h10 09-cuenca-resolviendo 0.3 132 1

seg_placa h11 cruce-h.mp4 360

seg_h h12 10-cuenca-numero     0.0  90 1
seg_h h13 11-keyline           0.3 105 1      t04-agua.mov@0
seg_h h14 12-swales            0.7  90 1
seg_h h15 13-represa           0.3 105 1
seg_h h16 14-camino-perfil     0.4  90 1      t05-camino.mov@0
seg_h h17 15-cortina           0.5  90 1      t06-arbol.mov@0
seg_h h18 16a-potreros-panel   0.5 105 1      t07-animal.mov@0
seg_h h19 17-informe           0.0 105 1      t08-informe.mov@0
seg_h h20 17b-resumen          0.5  90 1
seg_h h21 18-anexo-fuentes     0.0 105 1
seg_h h22 20-salud-del-calculo 0.0 135 1      t09-honestidad.mov@0
seg_h h23 21-sectores-cierre   1.0 150 1

seg_placa h24 cierre-h.mp4 150

pegar "$O/acequia-90s.mp4" h01 h02 h03 h04 h05 h06 h07 h08 h09 h10 h11 h12 \
  h13 h14 h15 h16 h17 h18 h19 h20 h21 h22 h23 h24

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
quemar v30-mudo.mp4 subtitulos-30s.ass "$O/acequia-30s-vertical.mp4"

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
quemar v15-mudo.mp4 subtitulos-15s.ass "$O/acequia-15s-vertical.mp4"

# ─────────────────────────────────────────────────────────────────────────────
printf '\n'
for f in "$O"/acequia-*.mp4; do
  printf '%s  %s cuadros  %s\n' \
    "$(basename "$f")" \
    "$(ffprobe -v error -count_frames -select_streams v:0 \
        -show_entries stream=nb_read_frames -of csv=p=0 "$f")" \
    "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
        -of csv=p=0:s=x "$f")"
done
