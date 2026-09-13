"""Transcribe un video o audio a SRT en español, con faster-whisper.

    python _scripts/transcribir.py metraje.mp4
    python _scripts/transcribir.py metraje.mp4 --modelo small --salida subs.srt

Deja un .srt al lado del archivo de entrada si no se indica otra cosa.
El SRT hay que CORREGIRLO A MANO antes de quemarlo: Whisper se equivoca con los
nombres propios y el vocabulario del oficio (swale, keyline, Köppen, acequia).

Modelos, de menor a mayor: tiny, base, small, medium, large-v3. `small` alcanza
para voz clara en español y es varias veces más rápido que `medium`; subí a
`medium` sólo si hay ruido o varias personas hablando encima.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from faster_whisper import WhisperModel

# Palabras que Whisper escribe mal casi siempre en este dominio. La lista crece
# a medida que aparecen.
#
# Cada entrada tiene que ser una palabra ENTERA y sin ambigüedad: un fragmento
# corto como "suel" convertiría "suelo" en "swaleo". Ante la duda, no la
# agregues y corregí ese caso a mano.
CORRECCIONES = {
    "acequía": "acequia",
    "Acequía": "Acequia",
    "key line": "keyline",
    "Key Line": "Keyline",
    "Copen": "Köppen",
    "Koppen": "Köppen",
    "suel ": "swale ",
    "suels": "swales",
}


def marca_de_tiempo(segundos: float) -> str:
    """Convierte segundos a `HH:MM:SS,mmm`, el formato que pide SRT."""
    ms_totales = int(round(segundos * 1000))
    horas, resto = divmod(ms_totales, 3_600_000)
    minutos, resto = divmod(resto, 60_000)
    seg, ms = divmod(resto, 1000)
    return f"{horas:02d}:{minutos:02d}:{seg:02d},{ms:03d}"


def corregir(texto: str) -> str:
    for mal, bien in CORRECCIONES.items():
        texto = texto.replace(mal, bien)
    return texto


def main() -> int:
    ap = argparse.ArgumentParser(description="Transcribe a SRT en español.")
    ap.add_argument("entrada", type=Path, help="video o audio a transcribir")
    ap.add_argument("--modelo", default="small", help="tiny|base|small|medium|large-v3")
    ap.add_argument("--idioma", default="es")
    ap.add_argument("--salida", type=Path, default=None, help="ruta del .srt")
    args = ap.parse_args()

    if not args.entrada.exists():
        print(f"No existe: {args.entrada}", file=sys.stderr)
        return 1

    salida = args.salida or args.entrada.with_suffix(".srt")

    # int8 en CPU: es el que entra cómodo en esta máquina y la diferencia de
    # calidad contra float16 no se nota en voz hablada.
    modelo = WhisperModel(args.modelo, device="cpu", compute_type="int8")

    segmentos, info = modelo.transcribe(
        str(args.entrada),
        language=args.idioma,
        vad_filter=True,  # descarta los silencios, salen menos subtítulos vacíos
    )
    print(f"Duración: {info.duration:.0f} s · modelo {args.modelo}", file=sys.stderr)

    with salida.open("w", encoding="utf-8") as f:
        n = 0
        for seg in segmentos:
            texto = corregir(seg.text.strip())
            if not texto:
                continue
            n += 1
            f.write(f"{n}\n")
            f.write(f"{marca_de_tiempo(seg.start)} --> {marca_de_tiempo(seg.end)}\n")
            f.write(f"{texto}\n\n")
            print(f"  [{marca_de_tiempo(seg.start)}] {texto}", file=sys.stderr)

    print(f"\n{n} subtítulos escritos en {salida}", file=sys.stderr)
    print("REVISALO antes de quemarlo: los nombres propios salen mal.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
