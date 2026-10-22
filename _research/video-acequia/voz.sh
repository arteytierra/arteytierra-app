#!/usr/bin/env bash
#
# Pega la voz en off grabada al montaje de 90 s.
#
#   bash _research/video-acequia/voz.sh ["/c/Arte y Tierra/Acequia/videoapp-1"]
#
# Entra:  $V/audio en off/voz en off app.acequia video-1.mpeg   (la grabación cruda)
#         $V/salida/acequia-90s.mp4                             (el montaje mudo)
# Sale:   $V/salida/voz-93s.wav          la pista de voz sola, ya ubicada
#         $V/salida/acequia-93s-voz.mp4  el video con la voz
#
# Por qué no es un `-i audio.mp3` y listo:
#
# La grabación son 83,2 s con 74,6 s de habla. A 1,2× —la velocidad que eligió
# Jonatan— el habla queda en 56,2 s, y el video dura 93,8. Pegada de corrido, la
# voz se adelantaría al video desde el primer plano y para el final estaría
# hablando del cierre sobre el informe. Así que se corta en frases y **cada
# frase se ubica en el segundo donde entra su plano**: eso es lo que en una
# locución se hace con las pausas, hecho con números en vez de a oído.
#
# Los cortes caen en el medio de los silencios que midió `silencedetect`, y los
# tiempos de destino salen de la tabla de planos de MONTAJE.md. Las dos columnas
# están juntas en VOZ-EN-OFF-montaje.md, que es el documento que hay que leer si
# algo de esto no cierra.
set -euo pipefail

export PATH="$PATH:/c/Users/Usuario/AppData/Local/Microsoft/WinGet/Links"

V="${1:-/c/Arte y Tierra/Acequia/videoapp-1}"
CRUDA="$V/audio en off/voz en off app.acequia video-1.mpeg"
MUDO="$V/salida/acequia-90s.mp4"
O="$V/salida"
T="$O/voz"

VELOCIDAD=1.2
DURACION=93.80   # el largo del montaje nuevo; la pista se rellena hasta acá

mkdir -p "$T"

# ─────────────────────────────────────────────────────────────────────────────
# Las frases: nombre · desde · hasta (en la grabación cruda) · dónde va (en el
# video). Las tres columnas de tiempo están en segundos.
#
# F14 —«por dónde pasan las redes de servicios»— no está en esta lista a
# propósito: no hay plano que la acompañe. Ver VOZ-EN-OFF-montaje.md.
# ─────────────────────────────────────────────────────────────────────────────
FRASES=(
  "f01  5.90 10.52  0.40"   # Desde hace quince años me dedico al diseño…
  "f02 10.52 18.70  4.75"   # Empecé por la bioarquitectura… permacultura.
  "f03 18.95 22.80 12.10"   # Para iniciar un diseño se me iba más tiempo…
  "f04 22.88 24.60 15.90"   # La topografía la sacaba de un programa,
  "f05 24.60 26.90 18.70"   # el clima, de dos o tres plataformas,
  "f06 26.90 28.60 21.50"   # el suelo, de donde encontrara,
  "f07 28.70 30.90 24.30"   # la cobertura, a ojo en el satélite,
  "f08 30.95 33.30 27.10"   # el ecosistema y el contexto, googleando.
  "f09 33.50 34.45 30.00"   # Y así sin parar.
  "f10 35.60 39.45 35.50"   # Por eso hice acequia, que recopila y cruza.
  "f11 39.80 45.95 39.10"   # Lluvia, suelo, pendiente… en un solo lugar.
  "f12 47.40 50.05 46.30"   # Con toda esa información ya puedo diseñar:
  "f13 50.05 51.42 49.30"   # dónde va el agua,
  "f14 51.70 53.70 55.80"   # dónde conviene la represa y cuánto junta,
  "f15 56.35 57.95 59.30"   # por dónde voy a poner los caminos,
  "f16 58.10 59.95 62.30"   # dónde va la cortina rompevientos,
  "f17 60.05 61.20 65.30"   # dónde entra el animal,
  "f18 61.45 64.60 66.50"   # entre otras utilidades que me simplifican…
  "f19 65.00 67.60 69.50"   # Además me entrega un informe completo…
  "f20 67.60 70.30 79.60"   # y hasta me avisa cuándo no confiar.
  "f21 71.10 74.90 84.00"   # Un proyecto entero en una fracción del tiempo…
  "f22 75.50 79.00 89.00"   # Mi nombre es Jonatan y te invito a conocer…
  "f23 79.20 80.80 92.10"   # Empezar no cuesta nada.
)

# ─────────────────────────────────────────────────────────────────────────────
# 1. Cada frase a su propio wav, ya acelerada.
#
# `atempo` cambia la velocidad sin tocar el tono, que es lo que hace falta: con
# `asetrate` la voz subiría de tono y sonaría a dibujito. El fundido de 40 ms en
# cada punta evita el clic que deja un corte en medio de una onda.
# ─────────────────────────────────────────────────────────────────────────────
printf 'Cortando las frases…\n'

for linea in "${FRASES[@]}"; do
  read -r nombre desde hasta _ <<< "$linea"
  dur=$(awk -v a="$desde" -v b="$hasta" 'BEGIN{printf "%.3f", b-a}')
  ffmpeg -v error -y -ss "$desde" -t "$dur" -i "$CRUDA" \
    -af "atempo=${VELOCIDAD},afade=t=in:d=0.04,afade=t=out:st=$(awk -v d="$dur" -v v="$VELOCIDAD" 'BEGIN{printf "%.3f", d/v-0.04}'):d=0.04" \
    -ar 48000 -ac 1 "$T/$nombre.wav"
done

# ─────────────────────────────────────────────────────────────────────────────
# 2. Las frases ubicadas, sobre una pista de 93,8 s.
#
# `adelay` corre cada frase hasta su segundo y `amix` las suma. `normalize=0`
# no es opcional: por defecto `amix` divide entre la cantidad de entradas, así
# que con veintitrés frases la voz saldría veintitrés veces más baja.
# ─────────────────────────────────────────────────────────────────────────────
printf 'Ubicando cada frase en su plano…\n'

ins=(); fc=""; mezcla=""; i=0
for linea in "${FRASES[@]}"; do
  read -r nombre _ _ destino <<< "$linea"
  ins+=(-i "$T/$nombre.wav")
  ms=$(awk -v d="$destino" 'BEGIN{printf "%d", d*1000}')
  fc="${fc}[${i}:a]adelay=${ms}[d${i}];"
  mezcla="${mezcla}[d${i}]"
  i=$((i + 1))
done

# −16 LUFS es el nivel de voz sola que piden Instagram y YouTube. Cuando entre
# la música, la mezcla entera se vuelve a normalizar a −14 y la voz manda sobre
# ella bajándola 6 a 9 dB: eso se hace en el montaje, no acá.
fc="${fc}${mezcla}amix=inputs=${i}:normalize=0:duration=longest[m];"
fc="${fc}[m]apad,atrim=0:${DURACION},loudnorm=I=-16:TP=-1.5:LRA=11[a]"

ffmpeg -v error -y "${ins[@]}" -filter_complex "$fc" -map "[a]" \
  -ar 48000 -ac 1 "$O/voz-93s.wav"

# ─────────────────────────────────────────────────────────────────────────────
# 3. La voz encima del montaje. El video se copia tal cual: una sola generación.
# ─────────────────────────────────────────────────────────────────────────────
printf 'Pegando la voz al video…\n'

ffmpeg -v error -y -i "$MUDO" -i "$O/voz-93s.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart "$O/acequia-93s-voz.mp4"

printf '\n'
for f in "$O/voz-93s.wav" "$O/acequia-93s-voz.mp4"; do
  printf '%s  %s s\n' "$(basename "$f")" \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"
done
