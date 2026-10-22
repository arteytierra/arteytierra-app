#!/usr/bin/env bash
#
# Le pone el sonido a los tres videos: la voz de Jonatan ubicada frase por
# frase, una cama de fondo abajo, y las dos cosas mezcladas con la cama
# bajando sola cada vez que el habla.
#
#   bash _research/video-acequia/voz.sh ["/c/Arte y Tierra/Acequia/videoapp-1"]
#
# Entra:  $V/audio en off/voz en off app.acequia video-1.mpeg
#         $V/salida/segmentos/{h,v30,v15}-mudo-sub.mp4   (los arma montaje.sh)
# Sale:   $V/salida/acequia-completo.mp4       1920x1080 · 72,0 s
#         $V/salida/acequia-30s-vertical.mp4   1080x1920 · 30,0 s
#         $V/salida/acequia-15s-vertical.mp4   1080x1920 · 15,0 s
#
# ── Por que no es un `-i audio.mp3` y listo ─────────────────────────────────
#
# La grabacion son 83,2 s con 74,6 s de habla. A 1,1x el habla neta queda en
# 55,2 s y el video dura 72. Pegada de corrido, la voz se adelantaria al video
# desde el primer plano. Asi que se corta en frases y **cada frase se ubica en
# el segundo donde entra su plano**: eso es lo que en una locucion se hace con
# las pausas, hecho con numeros en vez de a oido.
#
# ── Donde se corta, que es lo que estaba mal ────────────────────────────────
#
# En la primera version cuatro frases quedaron cortadas en el medio del habla
# —«la topografia… / el clima…» es un solo grupo respiratorio y lo parti al
# medio para mandar las mitades a tres segundos de distancia— y por eso sonaba
# mal recortado. Ahora los limites salen todos de `silencedetect` y **solo son
# limite los silencios de 0,35 s o mas**: las pausas mas cortas son comas y
# quedan adentro de la frase. La tabla esta en tiempos.py, que es el unico
# lugar donde se tocan estos numeros.
#
# Ademas cada corte se lleva 80 ms del silencio de antes y 100 ms del de
# despues. Son los dos margenes de abajo y hacen dos cosas: que no se coma el
# principio de una palabra, y que el fundido de 40 ms caiga sobre sala y no
# sobre un fonema.
set -euo pipefail

export PATH="$PATH:/c/Users/Usuario/AppData/Local/Microsoft/WinGet/Links"

V="${1:-/c/Arte y Tierra/Acequia/videoapp-1}"
CRUDA="$V/audio en off/voz en off app.acequia video-1.mpeg"
MUSICA_PROPIA="$V/audio en off/musica"   # sin extension; si existe, manda
O="$V/salida"
T="$O/segmentos"
W="$O/sonido"
G="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VELOCIDAD=1.1      # la que eligio Jonatan
MARGEN_A=0.08      # sala que se toma antes de cada frase
MARGEN_B=0.10      # sala que se toma despues

mkdir -p "$W"

if [ ! -f "$G/generado/duraciones.sh" ]; then
  printf 'Falta generado/. Corre primero:\n'
  printf '  py -3.12 _research/video-acequia/tiempos.py\n'
  exit 1
fi
# shellcheck source=/dev/null
. "$G/generado/duraciones.sh"

# ─────────────────────────────────────────────────────────────────────────────
# 1. La voz
#
# `atempo` cambia la velocidad sin tocar el tono, que es lo que hace falta: con
# `asetrate` la voz subiria de tono y sonaria a dibujito. `adelay` corre cada
# frase hasta su segundo y `amix` las suma.
#
# `normalize=0` no es opcional: por defecto `amix` divide entre la cantidad de
# entradas, asi que con veinte frases la voz saldria veinte veces mas baja.
# ─────────────────────────────────────────────────────────────────────────────
voz () {   # voz <nombre> <frases.txt> <duracion> <salida.wav>
  local nombre="$1" tabla="$2" dur="$3" dest="$4"
  local tmp="$W/$nombre"
  rm -rf "$tmp"; mkdir -p "$tmp"

  local -a ins=()
  local fc="" mezcla="" i=0
  local uid desde hasta destino d corte retardo

  while read -r uid desde hasta destino; do
    case "$uid" in ''|'#'*) continue ;; esac
    desde=$(awk -v a="$desde" -v m="$MARGEN_A" 'BEGIN{printf "%.3f", a-m}')
    d=$(awk -v a="$desde" -v b="$hasta" -v m="$MARGEN_B" \
        'BEGIN{printf "%.3f", b+m-a}')
    corte="$tmp/$uid.wav"
    ffmpeg -v error -y -ss "$desde" -t "$d" -i "$CRUDA" \
      -af "atempo=${VELOCIDAD},afade=t=in:d=0.04,afade=t=out:st=$(awk \
           -v d="$d" -v v="$VELOCIDAD" 'BEGIN{printf "%.3f", d/v-0.04}'):d=0.04" \
      -ar 48000 -ac 1 "$corte"
    retardo=$(awk -v t="$destino" -v m="$MARGEN_A" -v v="$VELOCIDAD" \
              'BEGIN{printf "%d", (t-m/v)*1000}')
    ins+=(-i "$corte")
    fc="${fc}[${i}:a]adelay=${retardo}[d${i}];"
    mezcla="${mezcla}[d${i}]"
    i=$((i + 1))
  done < "$tabla"

  # -16 LUFS es nivel de voz sola. La mezcla final con la cama se vuelve a
  # normalizar a -14, que es lo que piden Instagram y YouTube.
  fc="${fc}${mezcla}amix=inputs=${i}:normalize=0:duration=longest[m];"
  fc="${fc}[m]apad,atrim=0:${dur},loudnorm=I=-16:TP=-1.5:LRA=11[a]"
  ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[a]" \
    -ar 48000 -ac 1 "$dest"
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. La cama
#
# Si aparece un tema de verdad en `$V/audio en off/musica.*`, manda ese y esta
# funcion no hace nada mas que recortarlo. Mientras tanto se sintetiza, porque
# el video no puede esperar a que haya una licencia y porque los huecos que
# quedan entre frase y frase necesitan algo abajo.
#
# No es "musica" en el sentido de una cancion: son cuatro acordes largos en la
# menor, cada uno de veinte segundos, encadenados con cinco de cruce. Cada nota
# va duplicada y desafinada 0,35 Hz —de ahi el batido lento, que es lo que hace
# que un seno suene a instrumento y no a tono de prueba— y arriba va una capa
# de ruido rosa filtrado que hace de aire. Todo pasa por un pasabajos: no hay
# nada arriba de 1,5 kHz que pueda pelearse con la voz.
#
# Ojo con una trampa: **la fuente `sine` de ffmpeg no sale a escala completa,
# sale a -18 dB** (amplitud 0,125). Calculando los niveles como si saliera a 1
# la cama termina dieciocho decibeles abajo de donde se la quiere, que es
# inaudible. Por eso el acorde va a `volume=1.0` y el nivel se fija recien al
# final, en el `volume=-17dB`: ahi la cama queda unos 30 dB bajo pico, que es
# donde una base acompania sin pelear.
# ─────────────────────────────────────────────────────────────────────────────
ACORDES=(
  "110.00 164.81 261.63"   # la menor
  " 87.31 174.61 261.63"   # fa
  "130.81 196.00 329.63"   # do
  " 98.00 196.00 293.66"   # sol
  "110.00 164.81 261.63"   # la menor otra vez, para poder repetir
)
LARGO_ACORDE=20
CRUCE=5

cama () {   # cama <duracion> <salida.wav>
  local dur="$1" dest="$2" tmp="$W/cama"
  rm -rf "$tmp"; mkdir -p "$tmp"

  local propia
  for propia in "$MUSICA_PROPIA".{mp3,wav,m4a,flac,ogg}; do
    if [ -f "$propia" ]; then
      printf '  cama: %s\n' "$(basename "$propia")"
      ffmpeg -v error -y -stream_loop -1 -i "$propia" -t "$dur" \
        -af "volume=-18dB,afade=t=in:d=2,afade=t=out:st=$(awk -v d="$dur" \
             'BEGIN{printf "%.2f", d-3}'):d=3" \
        -ar 48000 -ac 1 "$dest"
      return
    fi
  done

  printf '  cama: sintetizada (no hay $V/audio en off/musica.*)\n'
  local i=0 n f fc ins
  for acorde in "${ACORDES[@]}"; do
    ins=(); fc=""; n=0
    for f in $acorde; do
      ins+=(-f lavfi -i "sine=frequency=${f}:duration=${LARGO_ACORDE}:sample_rate=48000")
      ins+=(-f lavfi -i "sine=frequency=$(awk -v x="$f" 'BEGIN{printf "%.2f", x+0.35}'):duration=${LARGO_ACORDE}:sample_rate=48000")
      fc="${fc}[${n}:a]"; n=$((n + 1))
      fc="${fc}[${n}:a]"; n=$((n + 1))
    done
    ffmpeg -v error -y "${ins[@]}" -filter_complex \
      "${fc}amix=inputs=${n}:normalize=0,volume=1.0,lowpass=f=1500,vibrato=f=0.11:d=0.05[a]" \
      -map "[a]" -ar 48000 -ac 1 "$tmp/a$i.wav"
    i=$((i + 1))
  done

  # encadenado: cada acorde entra mientras se va el anterior
  ins=(); fc=""; local previo="0:a"
  for ((j = 0; j < i; j++)); do ins+=(-i "$tmp/a$j.wav"); done
  for ((j = 1; j < i; j++)); do
    fc="${fc}[${previo}][${j}:a]acrossfade=d=${CRUCE}:c1=tri:c2=tri[x${j}];"
    previo="x${j}"
  done
  fc="${fc}[${previo}]volume=1[cuerda]"
  ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[cuerda]" \
    -ar 48000 -ac 1 "$tmp/cuerda.wav"

  ffmpeg -v error -y -i "$tmp/cuerda.wav" \
    -f lavfi -i "anoisesrc=color=pink:amplitude=0.3:duration=${LARGO_ACORDE}:sample_rate=48000" \
    -filter_complex "
      [1:a]aloop=loop=-1:size=$((LARGO_ACORDE * 48000)),highpass=f=600,lowpass=f=3200,
           tremolo=f=0.1:d=0.7,volume=0.25[aire];
      [0:a][aire]amix=inputs=2:normalize=0:duration=first,
           volume=-17dB,apad,atrim=0:${dur},
           afade=t=in:d=3,afade=t=out:st=$(awk -v d="$dur" \
             'BEGIN{printf "%.2f", d-4}'):d=4[a]" \
    -map "[a]" -ar 48000 -ac 1 "$dest"
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. La mezcla
#
# `sidechaincompress` baja la cama cada vez que entra la voz y la deja volver
# cuando calla. Es lo que en radio se llama ducking y es la diferencia entre
# una base que acompania y una que tapa: la primera entrada es la que se
# comprime —la cama— y la segunda es la que manda —la voz.
#
# El `release` largo, 700 ms, es a proposito: con un release corto la cama
# sube y baja entre palabra y palabra y se escucha el bombeo.
# ─────────────────────────────────────────────────────────────────────────────
mezclar () {   # mezclar <voz.wav> <cama.wav> <salida.wav>
  ffmpeg -v error -y -i "$1" -i "$2" -filter_complex "
    [1:a][0:a]sidechaincompress=threshold=0.05:ratio=4:attack=30:release=700[c];
    [0:a][c]amix=inputs=2:normalize=0,alimiter=limit=0.97,
      loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
    -map "[a]" -ar 48000 -ac 1 "$3"
}

pegar_sonido () {   # pegar_sonido <mudo.mp4> <mezcla.wav> <salida.mp4>
  ffmpeg -v error -y -i "$1" -i "$2" -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$3"
}

# ─────────────────────────────────────────────────────────────────────────────
for par in "h:$DURACION_H:acequia-completo.mp4" \
           "v30:$DURACION_V30:acequia-30s-vertical.mp4" \
           "v15:$DURACION_V15:acequia-15s-vertical.mp4"; do
  nombre="${par%%:*}"; resto="${par#*:}"
  dur="${resto%%:*}"; salida="${resto#*:}"
  printf '%s (%s s)…\n' "$nombre" "$dur"
  voz "$nombre" "$G/generado/frases-$nombre.txt" "$dur" "$W/voz-$nombre.wav"
  cama "$dur" "$W/cama-$nombre.wav"
  mezclar "$W/voz-$nombre.wav" "$W/cama-$nombre.wav" "$W/mezcla-$nombre.wav"
  pegar_sonido "$T/$nombre-mudo-sub.mp4" "$W/mezcla-$nombre.wav" "$O/$salida"
done

printf '\n'
for f in "$O"/acequia-completo.mp4 "$O"/acequia-*-vertical.mp4; do
  printf '%-30s %6s s  %s\n' "$(basename "$f")" \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")" \
    "$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate \
        -of csv=p=0 "$f")"
done
