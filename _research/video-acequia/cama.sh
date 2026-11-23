#!/usr/bin/env bash
#
# La cama de fondo. No se corre sola: la cargan `voz.sh` y `animatico.sh`.
#
#   . "$G/cama.sh"     y despues    cama <duracion> <salida.wav>
#
# Espera dos variables del que la carga:
#   $W               carpeta de trabajo para los intermedios
#   $MUSICA_PROPIA   ruta SIN extension del tema de verdad, si lo hay
#
# ── Que es ────────────────────────────────────────────────────────────────
#
# Si aparece un tema con licencia en `$MUSICA_PROPIA.*`, manda ese y esta
# funcion no hace nada mas que recortarlo. Mientras tanto se sintetiza, porque
# el video no puede esperar a que haya una licencia y porque los huecos que
# quedan entre frase y frase necesitan algo abajo.
#
# No es «musica» en el sentido de una cancion: son cuatro acordes largos en la
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
#
# Vive en su propio archivo desde el segundo video. Los dos montajes tienen que
# sonar abajo exactamente igual, y dos copias de cuatro acordes y un ruido rosa
# es la forma segura de que un dia dejen de sonar igual.

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

  printf '  cama: sintetizada (no hay %s.*)\n' "$MUSICA_PROPIA"
  local i=0 n f fc ins acorde j
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
