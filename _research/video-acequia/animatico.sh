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
# Esto es el animatico que se miro el 23/11/2026 para elegir. **La version que
# salio de esa eleccion es `final.sh`**, que es la que hay que correr para
# entregar. Este archivo queda porque es de donde salio, y porque las dos
# variantes siguen siendo la unica forma de volver a comparar los dos actos 1.
#
# ── Que es un animatico y que no ───────────────────────────────────────────
#
# Es el corte entero, con la voz definitiva, con todos los planos que ya
# existen en su lugar, y con **un cartel negro del largo exacto** donde iria
# una pieza que todavia no esta renderizada. Sirve para una sola cosa, que es
# la que importa: ver si el corte pega.
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

VELOCIDAD=1.1      # la que eligio Jonatan para el animatico
EXTRA=0            # los cortes son secos: no hay disolver que alimentar
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

# Los constructores de segmento y la pista de voz. Viven aparte porque los
# comparte con `final.sh`: dos copias de un seg_h es la forma segura de que un
# dia los dos videos dejen de verse igual.
# shellcheck source=/dev/null
. "$G/piezas.sh"

# La cama es la misma que la del primer video, del mismo archivo.
MUSICA_PROPIA="$V/audio en off/musica"   # sin extension; si existe, manda
# shellcheck source=/dev/null
. "$G/cama.sh"

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
