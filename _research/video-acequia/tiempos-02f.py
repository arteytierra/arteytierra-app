#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La linea de tiempo de la VERSION FINAL del segundo video.

    py -3.12 _research/video-acequia/tiempos-02f.py

Sale de las dos variantes del animatico (`tiempos-02.py`) y de las cinco cosas
que pidio Jonatan el 24/11/2026 despues de mirarlas:

1. El acto 1 es el de la variante A hasta la foto del crudo, y de ahi sigue el
   de la B: la letania de capas con su pie de fuente.
2. Las tres tomas del 22/11 no entran. Queda sola la grabacion de octubre.
3. La voz va a la velocidad a la que la grabo. `VELOCIDAD = 1.0`, no 1,1.
4. No hay carteles de texto sobre negro, y no hay huecos de audio abiertos
   para que la imagen tenga lugar.
5. Ninguna pausa pasa de medio segundo, y los cortes de imagen no son secos:
   un plano se disuelve en el siguiente.

**Este archivo no vuelve a escribir la maquina: la reusa.** Importa
`tiempos-02.py` y le cambia las cuatro cosas que son distintas —las unidades,
la velocidad, el arranque y la lista de planos— antes de llamar a sus
funciones. Mantener dos copias de `tender()` y de `karaoke()` es la forma
segura de que un dia la voz y los subtitulos dejen de coincidir.

Salidas:

    generado-02/planos-f.sh    las llamadas seg_* de la version final
    generado-02/frases-f.txt   que frase va a que segundo
    generado-02/duraciones.sh  se le agrega DURACION_F (sin pisar A ni B)
    karaoke-02f.ass            los subtitulos con la palabra encendida
"""

import importlib.util
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import tiempos as t1    # noqa: E402


def _modulo(nombre, archivo):
    """Importa un archivo cuyo nombre no es un identificador de Python.

    `tiempos-02.py` lleva guion, asi que `import tiempos-02` es un error de
    sintaxis. Se renombra el archivo o se lo carga a mano; renombrarlo
    romperia los dos scripts que ya lo llaman por su nombre.
    """
    spec = importlib.util.spec_from_file_location(
        nombre, os.path.join(AQUI, archivo))
    mod = importlib.util.module_from_spec(spec)
    sys.modules[nombre] = mod
    spec.loader.exec_module(mod)
    return mod


t2 = _modulo("tiempos_02", "tiempos-02.py")

GEN = t2.GEN

VELOCIDAD = 1.0   # la voz a la velocidad a la que se grabo
FPS = t1.FPS

# El tope que pidio Jonatan: «en el caso que haya pausas en el audio no sean de
# mas de 0.5 segundo para no perder el hilo». Se aplica arriba de la pausa que
# hizo al grabar, asi que una pausa corta sigue siendo corta: lo unico que hace
# es cortar las tres que estaban abiertas a proposito para la imagen —los 2,80 s
# despues de «donde va el agua» y los 3,00 s despues de «cuando no confiar»—.
TOPE_PAUSA = 0.50

ARRANQUE = 0.50

# ---------------------------------------------------------------------------
# Las unidades: las veinte de la grabacion de octubre, sin las tres nuevas.
# Mismos cortes que en el animatico; solo cambia la pausa, por el tope.
# ---------------------------------------------------------------------------
UNIDADES = [(uid, f, a, b, min(p, TOPE_PAUSA))
            for uid, f, a, b, p in t2.UNIDADES if f == "base"]

# ---------------------------------------------------------------------------
# Los planos. Misma tabla de siete columnas que en `tiempos-02.py`:
#
#   (tipo, fuente, ss, vel, hasta, capas, largo)
#
# Lo que cambio respecto del animatico, y por que:
#
# · **Sin carteles.** «Las ocho ventanas» y «La observacion» eran catorce
#   segundos de texto sobre negro —uno de cada seis del video— y eran lo
#   primero que saltaba en la hoja de contacto.
#
# · **Sin el perimetro a tiempo real** (el plano con el que arrancaba el
#   segundo 16 de la variante B). Con las pausas en medio segundo ya no hay
#   lugar entre la foto del crudo y la letania de capas: meterlo a la fuerza
#   deja cada capa en 1,7 s y la letania deja de leerse, que es justo la falla
#   que tenia B. Del tramo «B desde el 16» entra lo que lo define, que son las
#   cinco capas con su pie de fuente.
#
# · **Sin 12-swales.** Cinco segundos de la app donde no se mueve nada, con el
#   mismo encuadre de curvas que ya conto `22b-capas-shader`. «Donde va el
#   agua» se lo queda `lectura-agua`, que es el relieve con los cauces
#   dibujados: dice exactamente eso y se lee de un vistazo.
#
# · **Sin 18-anexo-fuentes y sin sol-y-viento.** Las dos vivian de las frases
#   nuevas («cada numero dice de donde salio», «funciona en cualquier parte
#   del mundo»). Sin esas frases quedaban en 1,3 s una y sin quien la
#   explicara la otra. Lo que ganan los ultimos siete segundos es el giro
#   largo y continuo que Jonatan pidio para la portada.
# ---------------------------------------------------------------------------
PLANOS = [
    # ── Acto 1, primera mitad: el de la variante A ────────────────────────
    ("negro",  None,                   0.0,   None,    0.40,                   [], None),
    # Quince segundos de fotos fechadas de la obra, de la excavacion a la
    # cisterna terminada, mientras cuenta de donde viene. No hay nada que
    # filmar de «hace quince anios».
    ("pieza",  "obra",                 0.0,   "llena", ("pausa", "U02", 0.50), [], None),
    # El crudo: el dato antes de que la app lo toque, sobre «se me iba mas
    # tiempo juntando datos que disenando».
    ("foto",   "crudo.png",            0.0,   None,    ("pausa", "U03", 0.50), [], None),

    # ── Acto 1, segunda mitad: el de la variante B ────────────────────────
    # La letania. Una capa por nombre, cada una con su pie de fuente adentro
    # de la banda. El corte cae dentro de la frase donde la voz cambia de
    # capa: esos son los marcadores ("crudo", t).
    # El relieve entra en el segundo 1,9 del corte y no en el 0,9. En el corte
    # el shader de elevaciones tarda 2,1 s en encenderse: entrando antes, el
    # plano que se llama «relieve» mostraba 1,2 s de poligono vacio y el
    # relieve aparecia justo cuando el plano se estaba yendo. Era la falla mas
    # cara del animatico, porque rompia lo unico que la letania tiene que
    # hacer: que cada capa que la voz nombra se vea. Arrancando en 1,9 el
    # relieve se enciende en pantalla, que es mejor todavia que encontrarlo ya
    # puesto.
    ("h",      "04-relieve",           1.9,   "llena", ("crudo", 24.74, -0.12),
        ["pie-relieve.mov@0"], None),
    ("h",      "05-clima",             0.4,   1.0,     ("pausa", "U04", 0.50),
        ["pie-clima.mov@0"], None),
    ("h",      "06-suelo",             0.5,   1.0,     ("pausa", "U05", 0.50),
        ["pie-suelo.mov@0"], None),
    ("h",      "07-cobertura",         0.9,   1.0,     ("crudo", 31.30, -0.12),
        ["pie-cobertura.mov@0"], None),
    # La ecorregion se queda con el final de la letania y con «y asi sin
    # parar»: es el plano que respira antes de la bisagra, el lugar que antes
    # ocupaba el cartel de las ventanas.
    ("h",      "08-ecorregion-yungas", 0.0,   "llena", ("pausa", "U07", 0.50),
        ["pie-ecorregion.mov@0"], None),

    # ── La bisagra ────────────────────────────────────────────────────────
    # El segundo mas importante del video es el primer cuadro de este plano:
    # la voz dice «Por eso hice acequia» y lo que estaba desordenado se ordena.
    # Va la COLA de la portada y no el principio: ahi hace falta la llegada.
    ("pieza",  "portada",             "cola", 1.0,     ("pausa", "U08", 0.50), [], None),

    # ── La lectura ────────────────────────────────────────────────────────
    ("pieza",  "lectura-secuencia",    0.0,   1.0,     ("crudo", 43.00, -0.12), [], None),
    ("h",      "22b-capas-shader",     0.0,   "llena", ("pausa", "U09", 0.50), [], None),

    # ── El diseno. Una promesa, un plano ──────────────────────────────────
    ("h",      "11-keyline",           0.25,  "llena", ("antes", "U11", 0.15), [], None),
    ("pieza",  "lectura-agua",         0.0,   1.0,     ("pausa", "U11", 0.50), [], None),
    ("h",      "13-represa",           0.3,   1.0,     ("pausa", "U12", 0.50), [], None),
    ("h",      "11b-servicios",        0.0,   1.0,     ("pausa", "U13", 0.50), [], None),
    ("h",      "14-camino-perfil",     0.4,   1.0,     ("pausa", "U14", 0.50), [], None),
    ("h",      "15-cortina",           0.5,   1.0,     ("crudo", 60.18, -0.12), [], None),
    # «donde entra el animal»: los potreros. A tiempo real y arrancando en el
    # segundo 2,5 del corte, que es cuando los 28 potreros y el 533 % ya estan
    # escritos en el panel.
    ("h",      "16a-potreros-panel",   2.5,   1.0,     ("antes", "U16", 0.25), [], None),
    # El acto 04 de la mesa de trabajo: lo que el terreno NO admite.
    ("pieza",  "mesa-de-trabajo",     10.67,  1.0,     ("despues", "U16", 0.35), [], None),

    # ── El informe y la advertencia ───────────────────────────────────────
    ("pieza",  "informe",              0.0,   1.0,     ("crudo", 68.00, -0.10), [], None),
    ("h",      "20-salud-del-calculo", 0.0,   1.0,     ("pausa", "U17", 0.50), [], None),

    # ── El remate ─────────────────────────────────────────────────────────
    # Siete segundos de giro, a velocidad 1, arrancando en el segundo 13, que
    # es donde la pieza empieza a girar. Es el movimiento lento y continuo que
    # pidio Jonatan para la portada: a dos segundos la vuelta no se distingue.
    ("pieza",  "portada-giro",        13.0,   1.0,     ("antes", "U20", 0.55), [], None),
    ("placa",  "cierre-h.mp4",         0.0,   None,    ("fin",),               [], None),
]

# El cierre de marca dura 5 s clavados y es lo que fija el largo del video.
PLACA_FINAL = 150

# ---------------------------------------------------------------------------
# Los subtitulos, con mas contorno.
#
# En la hoja de contacto del animatico se ve la falla: el texto es blanco
# calido y sobre las capturas de la app —que son blancas— un contorno de 2 px
# no lo despega del fondo. La frase «Con toda esa informacion ya puedo» sobre
# el panel blanco no se lee. Contorno de 3,5 px y una sombra de 1,5, que es lo
# minimo que aguanta un fondo blanco sin convertir el subtitulo en una caja.
# ---------------------------------------------------------------------------
CABECERA = t1.CABECERA.replace(
    ",1,2,0,2,70,70,", ",1,3.5,1.5,2,70,70,")
assert CABECERA != t1.CABECERA, "no se encontro el renglon de estilo en t1.CABECERA"


def main():
    # Las funciones de `tiempos-02.py` leen sus constantes del modulo cuando
    # corren, no cuando se definen: cambiarlas aca alcanza para que `tender`,
    # `resolver`, `karaoke` y `escribir_planos` trabajen con esta linea de
    # tiempo. Es el precio de no duplicarlas.
    t2.UNIDADES = UNIDADES
    t2.U = {u[0]: u for u in UNIDADES}
    t2.VELOCIDAD = VELOCIDAD
    t2.ARRANQUE = ARRANQUE
    t2.PLACA_FINAL = PLACA_FINAL
    t1.CABECERA = CABECERA

    os.makedirs(GEN, exist_ok=True)
    with open(os.path.join(AQUI, "palabras.json"), encoding="utf-8") as f:
        palabras = {"base": json.load(f)}

    cortes = r"C:\Arte y Tierra\Acequia\videoapp-1\cortes"
    animacion = r"C:\Arte y Tierra\Acequia\portada animacion"
    largos = t2.largos_fuentes(cortes, animacion)

    destinos, _ = t2.tender()
    total = destinos["U20"] - 0.55 + PLACA_FINAL / FPS

    tabla, real = t2.escribir_planos(
        os.path.join(GEN, "planos-f.sh"), "f", PLANOS, destinos, total, largos)
    t2.escribir_frases(os.path.join(GEN, "frases-f.txt"), destinos)
    with open(os.path.join(AQUI, "karaoke-02f.ass"), "w", encoding="utf-8") as f:
        f.write(t2.karaoke("h", destinos, real, palabras))

    # El pegado no es un `concat`: cada plano se disuelve en el siguiente, y
    # los subtitulos se queman en la misma pasada. `pegar_suave` saca los
    # cuadros de cada segmento con ffprobe, asi que le alcanza con los nombres.
    with open(os.path.join(GEN, "planos-f.sh"), encoding="utf-8") as f:
        lineas = f.readlines()
    lineas[-1] = lineas[-1].replace(
        'pegar "$T/f-mudo.mp4"', 'pegar_suave "$T/f-sub.mp4" karaoke-02f.ass')
    with open(os.path.join(GEN, "planos-f.sh"), "w", encoding="utf-8") as f:
        f.writelines(lineas)

    print("%-5s %-7s %-22s %7s %6s %7s %6s  %s"
          % ("plano", "tipo", "fuente", "entra", "dura", "cuadros", "desde",
             "material"))
    for nombre, tipo, fuente, t, dur, n, ss, aviso in tabla:
        corto = "  << CORTO" if dur < 1.1 and tipo != "negro" else ""
        print("%-5s %-7s %-22s %7.2f %6.2f %7d %6.2f  %s%s"
              % (nombre, tipo, fuente, t, dur, n, ss, aviso, corto))
    print("   %.2f s (%d cuadros)" % (real, round(real * FPS)))

    # DURACION_F se agrega al archivo que ya tiene A y B, sin pisarlas.
    ruta = os.path.join(GEN, "duraciones.sh")
    previas = {}
    if os.path.exists(ruta):
        for linea in open(ruta, encoding="utf-8"):
            if linea.startswith("DURACION_"):
                k, v = linea.strip().split("=")
                previas[k] = v
    previas["DURACION_F"] = "%.2f" % real
    with open(ruta, "w", encoding="utf-8") as f:
        f.write("# Generado por tiempos-02.py y tiempos-02f.py\n")
        for k in sorted(previas):
            f.write("%s=%s\n" % (k, previas[k]))

    hablado = sum((u[3] - u[2]) / VELOCIDAD for u in UNIDADES)
    pausas = sum(u[4] for u in UNIDADES[:-1])
    print("\n%.1f s de voz + %.1f s de pausas + %.1f s de cierre = %.1f s"
          % (hablado, pausas, PLACA_FINAL / FPS, real))
    print("la voz ocupa el %d %% del video (en el animatico era el %d %%)"
          % (round(100 * hablado / real), 69))


if __name__ == "__main__":
    main()
