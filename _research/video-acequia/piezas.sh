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
# El `scale` a 1920x1080 es el que sube de 720; `fps=30` despues del `setpts`
# por la misma razon que en seg_h, aunque estas no pierden cuadros.
seg_pieza () {
  local dest="$T/$1.mp4" src="$A/$2" desde="$3" n="$(( $4 + EXTRA ))" vel="$5"
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
