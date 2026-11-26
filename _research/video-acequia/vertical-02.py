#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La voz y los subtitulos de los DOS VERTICALES del segundo video.

    py -3.12 _research/video-acequia/vertical-02.py

Salidas:

    generado-02/frases-v30.txt   que frase va a que segundo, en el reel de 30 s
    generado-02/frases-v15.txt   idem en la story de 15 s
    generado-02/duraciones.sh    se le agregan DURACION_V30 y DURACION_V15
    karaoke-02-v30.ass           los subtitulos, a 1080x1920
    karaoke-02-v15.ass           idem

El `02` del nombre no es decoracion: `karaoke-v30.ass` y `karaoke-v15.ass`, sin
el, son los subtitulos de los verticales del PRIMER video, los escribe
`tiempos.py` y los usa `montaje.sh`. La primera version de este guion los piso.

**Los planos no salen de aca.** Estan escritos a mano en `verticales.sh`, y es
a proposito: en el horizontal manda la voz —la lista de planos se calcula a
partir de donde cae cada frase, porque son veinte frases y setenta y tres
segundos— pero en un reel manda el video. Son cinco y diez planos; calcularlos
cuesta mas que escribirlos y esconde la unica decision que importa, que es cual
entra y cual no. Es la misma division que hacia `montaje.sh` con los verticales
del primer video.

Lo que si sale de aca es la voz, porque eso NO se puede escribir a mano: cada
frase es un recorte con nombre propio de la grabacion de octubre, y los
subtitulos tienen que encender la palabra que suena en el cuadro en que suena.
Dos copias de esa cuenta son dos copias que un dia dejan de coincidir, asi que
se reusa la de `tiempos-02.py` entera.

── Que se eligio y por que ────────────────────────────────────────────────

De las veinte frases entran ocho en el reel y tres en la story. El criterio no
es resumir el video: es que cada una se entienda sola, porque un reel se mira
sin sonido, a la mitad, y casi nunca desde el principio.

Quedan afuera las dos primeras —los quince anios y la bioarquitectura— que son
la presentacion de Jonatan: en setenta y tres segundos son el piso de todo lo
que sigue, y en treinta son diez segundos de curriculum antes de que aparezca
el producto. La story arranca directamente en «por eso hice acequia».
"""

import importlib.util
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import tiempos as t1    # noqa: E402


def _modulo(nombre, archivo):
    """Importa un archivo cuyo nombre no es un identificador de Python."""
    spec = importlib.util.spec_from_file_location(
        nombre, os.path.join(AQUI, archivo))
    mod = importlib.util.module_from_spec(spec)
    sys.modules[nombre] = mod
    spec.loader.exec_module(mod)
    return mod


t2 = _modulo("tiempos_02", "tiempos-02.py")

GEN = t2.GEN
FPS = t1.FPS
VELOCIDAD = 1.0   # la voz a la velocidad a la que se grabo, como en la final

# ---------------------------------------------------------------------------
# Que frase va a que segundo.
#
# Los segundos estan escritos y no calculados por la misma razon que los
# planos: la voz se acomoda al video, no al reves. Las pausas que quedan entre
# frase y frase van todas entre 0,40 y 0,46 s, bien abajo del medio segundo que
# pidio Jonatan; se ven en la tabla que imprime este guion.
# ---------------------------------------------------------------------------
VOZ_V30 = [
    ("U03",  0.45),   # «se me iba mas tiempo juntando datos que disenando»
    ("U08",  4.05),   # «por eso hice acequia, que recopila los datos y los cruza»
    ("U09",  7.65),   # «lluvia, suelo, pendiente... en un solo lugar»
    ("U11", 14.10),   # «donde va el agua»
    ("U12", 15.35),   # «donde conviene la represa y cuanto junta»
    ("U18", 17.75),   # «un proyecto entero en una fraccion del tiempo»
    ("U19", 21.50),   # «mi nombre es Jonatan y te invito a conocer acequia.app»
    ("U20", 25.05),   # «empezar no cuesta nada»  — cae sobre el cierre de marca
]

VOZ_V15 = [
    ("U08",  0.45),
    ("U09",  4.04),
    ("U19", 10.49),   # cae sobre el cierre de marca
]

DURACION_V30 = 30.0
DURACION_V15 = 15.0

# ---------------------------------------------------------------------------
# El estilo del subtitulo en vertical.
#
# Dos cosas cambian respecto de los verticales del primer video:
#
# · **El margen de abajo pasa de 110 a 300 px.** Instagram se queda con la
#   franja de abajo del cuadro —el pie, los botones, el texto del posteo— y a
#   110 px el subtitulo cae justo ahi. 300 lo deja arriba de todo eso y sigue
#   leyendose como un pie. Es el unico numero de estos que se puede equivocar
#   sin que se note en la compu y se note en el telefono.
#
# · **El contorno pasa de 2 a 3,5 px, con sombra.** Mismo arreglo que en la
#   version final horizontal: el blanco calido sobre el panel blanco de la app
#   no se despega del fondo con 2 px. Y aca pesa mas, porque en vertical la
#   grabacion de la app se agranda y el panel ocupa el cuadro entero.
#
# El cuerpo sube de 54 a 56 y el renglon baja de 26 a 24 caracteres: el mismo
# texto, mas grande, en un cuadro que se mira a un palmo de los ojos.
# ---------------------------------------------------------------------------
ESTILO_VERTICAL = (1080, 1920, 56, 300, 24)

CABECERA = t1.CABECERA.replace(",1,2,0,2,70,70,", ",1,3.5,1.5,2,70,70,")
assert CABECERA != t1.CABECERA, "no se encontro el renglon de estilo en t1.CABECERA"


def armar(colocacion):
    """Deja en `t2` las unidades elegidas y devuelve donde cae cada una."""
    elegidas = {uid for uid, _t in colocacion}
    porden = {uid: i for i, (uid, _t) in enumerate(colocacion)}
    unidades = sorted((u for u in t2.UNIDADES if u[0] in elegidas),
                      key=lambda u: porden[u[0]])
    faltan = elegidas - {u[0] for u in unidades}
    if faltan:
        raise SystemExit("no existen esas frases: %s" % ", ".join(sorted(faltan)))
    t2.UNIDADES = unidades
    t2.U = {u[0]: u for u in unidades}
    return dict(colocacion)


def main():
    t2.VELOCIDAD = VELOCIDAD
    t1.CABECERA = CABECERA
    t1.ESTILOS["vertical"] = ESTILO_VERTICAL

    os.makedirs(GEN, exist_ok=True)
    with open(os.path.join(AQUI, "palabras.json"), encoding="utf-8") as f:
        palabras = {"base": json.load(f)}

    for nombre, colocacion, duracion in (("v30", VOZ_V30, DURACION_V30),
                                         ("v15", VOZ_V15, DURACION_V15)):
        destinos = armar(colocacion)
        t2.escribir_frases(os.path.join(GEN, "frases-%s.txt" % nombre), destinos)
        with open(os.path.join(AQUI, "karaoke-02-%s.ass" % nombre),
                  "w", encoding="utf-8") as f:
            f.write(t2.karaoke("vertical", destinos, duracion, palabras))

        print("\n%s — %.1f s" % (nombre, duracion))
        print("  %-5s %6s %6s %6s  %s" % ("frase", "entra", "dura", "pausa", "aviso"))
        fin_previo = None
        for uid, _fuente, desde, hasta, _p in t2.UNIDADES:
            entra = destinos[uid]
            dura = (hasta - desde) / VELOCIDAD
            pausa = "" if fin_previo is None else "%6.2f" % (entra - fin_previo)
            aviso = ""
            if fin_previo is not None and entra < fin_previo:
                aviso = "!! PISA a la anterior"
            elif pausa and entra - fin_previo > 0.5:
                aviso = "!! pausa de mas de medio segundo"
            if entra + dura > duracion:
                aviso = "!! SE PASA del final por %.2f s" % (entra + dura - duracion)
            print("  %-5s %6.2f %6.2f %6s  %s" % (uid, entra, dura, pausa, aviso))
            fin_previo = entra + dura
        print("  la voz ocupa el %d %% del reel"
              % round(100 * sum((u[3] - u[2]) / VELOCIDAD for u in t2.UNIDADES)
                      / duracion))

    # Se agregan a las que ya estan (A, B y F), sin pisarlas.
    ruta = os.path.join(GEN, "duraciones.sh")
    previas = {}
    if os.path.exists(ruta):
        for linea in open(ruta, encoding="utf-8"):
            if linea.startswith("DURACION_"):
                k, v = linea.strip().split("=")
                previas[k] = v
    previas["DURACION_V30"] = "%.2f" % DURACION_V30
    previas["DURACION_V15"] = "%.2f" % DURACION_V15
    with open(ruta, "w", encoding="utf-8") as f:
        f.write("# Generado por tiempos-02.py, tiempos-02f.py y vertical-02.py\n")
        for k in sorted(previas):
            f.write("%s=%s\n" % (k, previas[k]))

    print("\nAhora los planos:  bash _research/video-acequia/verticales.sh")


if __name__ == "__main__":
    main()
