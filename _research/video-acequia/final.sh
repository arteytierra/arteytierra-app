#!/usr/bin/env bash
#
# La VERSION FINAL del segundo video.
#
#   salida/acequia-02-final.mp4   1920x1080 · 73,2 s
#
#   bash _research/video-acequia/final.sh ["/c/Arte y Tierra/Acequia/videoapp-1"]
#
# Antes de correr esto:
#   py -3.12 _research/video-acequia/tiempos-02f.py
#
# Sale de las dos variantes del animatico y de las cinco correcciones que pidio
# Jonatan el 24/11/2026. Las que cambian este archivo (y no `tiempos-02f.py`)
# son dos:
#
#   VELOCIDAD=1.0   la voz a la velocidad a la que la grabo, no a 1,1x
#   EXTRA=7         cada segmento se escribe con siete cuadros de mas, que se
#                   los come el disolver con el que entra el siguiente
#
# ── Por que los cortes dejaron de ser secos ───────────────────────────────
#
# El animatico pegaba los planos con `concat -c copy`, que es un corte seco y
# es gratis: cada segmento ya nace en keyframe, asi que no se recomprime nada.
# Un disolver no se puede hacer asi —hay que tener los dos planos a la vez en
# el mismo filtro—, de modo que el pegado pasa a ser un render completo.
#
# Y ya que hay que recomprimir, **los subtitulos se queman en la misma
# pasada**: `xfade` y `subtitles` en un solo `filter_complex`. Hacerlo en dos
# pasos costaria una recompresion entera de mas, que es exactamente lo que la
# skill de edicion dice que no se hace.
#
# El disolver dura 0,2 s y arranca donde el corte caia antes, asi que el
# momento percibido del corte se atrasa 0,1 s. Eso es inaudible contra la voz
# —que es la que manda la linea de tiempo— y es la razon de que no haya que
# recalcular nada.
set -euo pipefail

export PATH="$PATH:/c/Users/Usuario/AppData/Local/Microsoft/WinGet/Links"

V="${1:-/c/Arte y Tierra/Acequia/videoapp-1}"
A="/c/Arte y Tierra/Acequia/portada animacion"
C="$V/cortes"
P="$V/placas"
O="$V/salida"
T="$O/final"
W="$O/final/sonido"
G="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUENTES_TTF="/c/Users/Usuario/AppData/Local/Microsoft/Windows/Fonts"

VELOCIDAD=1.0      # la voz como se grabo
EXTRA=7            # cuadros de mas por segmento, para alimentar el disolver
DISOLVER=0.2       # 6 cuadros: uno menos que EXTRA, asi nunca queda justo
MARGEN_A=0.08      # sala que se toma antes de cada frase
MARGEN_B=0.10      # sala que se toma despues

mkdir -p "$T" "$W"

if [ ! -f "$G/generado-02/planos-f.sh" ]; then
  printf 'Falta generado-02/planos-f.sh. Corre primero:\n'
  printf '  py -3.12 _research/video-acequia/tiempos-02f.py\n'
  exit 1
fi
# shellcheck source=/dev/null
. "$G/generado-02/duraciones.sh"

cp -f "$FUENTES_TTF/Inter-Medium.ttf"  "$T/Inter-Medium.ttf"
cp -f "$FUENTES_TTF/Inter-Regular.ttf" "$T/Inter-Regular.ttf"

# shellcheck source=/dev/null
. "$G/piezas.sh"

MUSICA_PROPIA="$V/audio en off/musica"   # sin extension; si existe, manda
# shellcheck source=/dev/null
. "$G/cama.sh"

# `pegar_suave` —el pegado con disolver, que ademas quema los subtitulos en la
# misma pasada— vive en `piezas.sh` desde que hay reels: los tres montajes
# tienen que cortar igual. Lee EXTRA y DISOLVER cuando corre, no cuando se
# define, asi que los dos parametros de arriba son los que manda este archivo.

# ─────────────────────────────────────────────────────────────────────────────
printf 'Version final (%s s)…\n' "$DURACION_F"

printf '  planos…\n'
# shellcheck source=/dev/null
. "$G/generado-02/planos-f.sh"

printf '  sonido…\n'
voz f "$G/generado-02/frases-f.txt" "$DURACION_F" "$W/voz-f.wav"
cama "$DURACION_F" "$W/cama-f.wav"
mezclar "$W/voz-f.wav" "$W/cama-f.wav" "$W/mezcla-f.wav"
pegar_sonido "$T/f-sub.mp4" "$W/mezcla-f.wav" "$O/acequia-02-final.mp4"

printf '\n'
f="$O/acequia-02-final.mp4"
printf '%-24s %6s s  %s cuadros  %s  %s\n' "$(basename "$f")" \
  "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")" \
  "$(ffprobe -v error -count_frames -select_streams v:0 \
      -show_entries stream=nb_read_frames -of csv=p=0 "$f")" \
  "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
      -of csv=p=0:s=x "$f")" \
  "$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate \
      -of csv=p=0 "$f")"
