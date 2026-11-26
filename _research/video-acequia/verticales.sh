#!/usr/bin/env bash
#
# Los DOS VERTICALES del segundo video, alineados con la version final.
#
#   salida/acequia-02-30s-vertical.mp4   1080x1920 · 30,0 s · reel
#   salida/acequia-02-15s-vertical.mp4   1080x1920 · 15,0 s · story
#
#   bash _research/video-acequia/verticales.sh ["/c/Arte y Tierra/Acequia/videoapp-1"]
#
# Antes de correr esto:
#   node packages/placas/scripts/vertical.mjs     las piezas paradas
#   py -3.12 _research/video-acequia/vertical-02.py   la voz y los subtitulos
#
# No pisan a `acequia-15s-vertical.mp4` ni a `acequia-30s-vertical.mp4`, que
# son los del PRIMER video y siguen sirviendo: por eso el `02` en el nombre.
#
# ── Por que los planos estan escritos a mano ──────────────────────────────
#
# Porque en un reel manda el video. En el horizontal la lista de planos la
# calcula `tiempos-02f.py` a partir de donde cae cada frase, y tiene sentido:
# son veinte frases y setenta y tres segundos, y a mano eso no se sostiene.
# Aca son cinco y diez planos. Calcularlos costaria mas que escribirlos y
# escondería la unica decision que importa, que es cual entra y cual no.
#
# Lo que NO esta a mano es la voz: cada frase es un recorte con nombre propio
# de la grabacion de octubre y los subtitulos encienden la palabra que suena.
# Eso sale de `vertical-02.py`, que reusa entera la maquinaria del horizontal.
#
# ── Las dos maneras de llegar a 9:16, y por que son dos ───────────────────
#
# Las piezas de Remotion se **renderizan** paradas: la camara del mapa se
# calcula con el tamanio del cuadro, asi que el vertical no es un recorte del
# apaisado sino otro encuadre. Las grabaciones de la app se **recortan** en
# columna y se agrandan x1,78, que es inventar pixeles, y no hay alternativa:
# la pantalla se grabo una vez y a 1920x1080. La columna se elige plano por
# plano y esta escrita en cada llamada. Ver los constructores en `piezas.sh`.
set -euo pipefail

export PATH="$PATH:/c/Users/Usuario/AppData/Local/Microsoft/WinGet/Links"

V="${1:-/c/Arte y Tierra/Acequia/videoapp-1}"
A="/c/Arte y Tierra/Acequia/portada animacion"
C="$V/cortes"
P="$V/placas"
O="$V/salida"
T="$O/vertical"
W="$O/vertical/sonido"
G="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VELOCIDAD=1.0      # la voz como se grabo, igual que en la version final
EXTRA=7            # cuadros de mas por segmento, para alimentar el disolver
DISOLVER=0.2       # 6 cuadros: uno menos que EXTRA, asi nunca queda justo
MARGEN_A=0.08      # sala que se toma antes de cada frase
MARGEN_B=0.10      # sala que se toma despues

mkdir -p "$T" "$W"

if [ ! -f "$G/generado-02/frases-v30.txt" ]; then
  printf 'Falta generado-02/frases-v30.txt. Corre primero:\n'
  printf '  py -3.12 _research/video-acequia/vertical-02.py\n'
  exit 1
fi
# shellcheck source=/dev/null
. "$G/generado-02/duraciones.sh"

P02="salida-encargo-02/encargo 2 entrega 2"
for f in "$P02/portada-master-vertical.mp4" \
         "$P02/portada-giro-master-vertical.mp4" \
         "$P02/lectura-secuencia-master-vertical.mp4" \
         "$P02/lectura-agua-master-vertical.mp4" \
         "salida-encargo-03/crudo-vertical-1800.png"; do
  if [ ! -f "$A/$f" ]; then
    printf 'Falta la pieza parada «%s». Corre primero:\n' "$(basename "$f")"
    printf '  node packages/placas/scripts/vertical.mjs\n'
    exit 1
  fi
done

# shellcheck source=/dev/null
. "$G/piezas.sh"

MUSICA_PROPIA="$V/audio en off/musica"   # sin extension; si existe, manda
# shellcheck source=/dev/null
. "$G/cama.sh"

# ─────────────────────────────────────────────────────────────────────────────
# El reel de 30 s — 900 cuadros
#
# Ocho frases de las veinte. La historia es la del video sin la presentacion:
# el problema (juntar datos), la bisagra (por eso hice acequia), que lee, que
# contesta, cuanto tiempo ahorra, y el nombre.
#
# Los dos planos de la app que entran son los dos que valen en vertical porque
# su columna dice algo sola: el panel de capas de `22b-capas-shader` —que es
# literalmente «todo en un solo lugar» escrito en una lista— y el panel de
# represas de `13-represa`, con los sitios rankeados y los litros al lado.
#
# El cierre de marca son 135 cuadros y no los 105 que tiene el archivo: los 30
# que faltan los clona `seg_placa` del ultimo cuadro, que es el lockup quieto.
# Asi «empezar no cuesta nada» cae encima de la marca y no en el aire.
# ─────────────────────────────────────────────────────────────────────────────
printf 'Reel de 30 s (%s s)…\n' "$DURACION_V30"
printf '  planos…\n'

seg_negro_v  v01  12
seg_foto_v   v02 'salida-encargo-03/crudo-vertical-1800.png'            107
seg_pieza_v  v03 "$P02/portada-master-vertical.mp4"            9.100    109  1
seg_pieza_v  v04 "$P02/lectura-secuencia-master-vertical.mp4"  0.000    102  1
seg_v        v05  22b-capas-shader     0.00    93  2.1    1313
seg_pieza_v  v06 "$P02/lectura-agua-master-vertical.mp4"       0.000     37  1
seg_v        v07  13-represa           0.30    72  1        40
seg_v        v08  21-sectores-cierre   1.00   113  1       817
seg_pieza_v  v09 "$P02/portada-giro-master-vertical.mp4"      15.000    120  1
seg_placa    v10  cierre-v30.mp4      135

pegar_suave "$T/v30-sub.mp4" karaoke-02-v30.ass \
  v01 v02 v03 v04 v05 v06 v07 v08 v09 v10

printf '  sonido…\n'
voz v30 "$G/generado-02/frases-v30.txt" "$DURACION_V30" "$W/voz-v30.wav"
cama "$DURACION_V30" "$W/cama-v30.wav"
mezclar "$W/voz-v30.wav" "$W/cama-v30.wav" "$W/mezcla-v30.wav"
pegar_sonido "$T/v30-sub.mp4" "$W/mezcla-v30.wav" "$O/acequia-02-30s-vertical.mp4"

# ─────────────────────────────────────────────────────────────────────────────
# La story de 15 s — 450 cuadros
#
# Tres frases y cinco planos. No es el reel recortado: es otra cosa, porque en
# quince segundos no entra una historia con problema y solucion. Entra una
# afirmacion —«hice acequia, que recopila los datos y los cruza»— y la prueba.
#
# La portada arranca en el segundo 5,5 y no en el 0 ni en la cola. En el 0 se
# ve el perimetro dibujandose sobre un terreno vacio, que es bonito pero tarda;
# en la cola ya esta todo puesto y la camara apenas deriva. En el 5,5 estan
# terminando las curvas y empiezan a aparecer las lineas de agua: es el tramo
# donde mas cosas pasan por segundo, que es lo que una story necesita en los
# primeros cuatro.
# ─────────────────────────────────────────────────────────────────────────────
printf '\nStory de 15 s (%s s)…\n' "$DURACION_V15"
printf '  planos…\n'

seg_negro_v  w01  12
seg_pieza_v  w02 "$P02/portada-master-vertical.mp4"            5.500    111  1
seg_v        w03  22b-capas-shader     0.00   114  1.73   1313
seg_pieza_v  w04 "$P02/lectura-secuencia-master-vertical.mp4"  0.000    123  1
seg_placa    w05  cierre-v15.mp4       90

pegar_suave "$T/v15-sub.mp4" karaoke-02-v15.ass w01 w02 w03 w04 w05

printf '  sonido…\n'
voz v15 "$G/generado-02/frases-v15.txt" "$DURACION_V15" "$W/voz-v15.wav"
cama "$DURACION_V15" "$W/cama-v15.wav"
mezclar "$W/voz-v15.wav" "$W/cama-v15.wav" "$W/mezcla-v15.wav"
pegar_sonido "$T/v15-sub.mp4" "$W/mezcla-v15.wav" "$O/acequia-02-15s-vertical.mp4"

# ─────────────────────────────────────────────────────────────────────────────
printf '\n'
for f in "$O"/acequia-02-30s-vertical.mp4 "$O"/acequia-02-15s-vertical.mp4; do
  printf '%-32s %6s s  %s cuadros  %s  %s\n' "$(basename "$f")" \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")" \
    "$(ffprobe -v error -count_frames -select_streams v:0 \
        -show_entries stream=nb_read_frames -of csv=p=0 "$f")" \
    "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
        -of csv=p=0:s=x "$f")" \
    "$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate \
        -of csv=p=0 "$f")"
done
