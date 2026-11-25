#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La linea de tiempo del SEGUNDO video: «Antes de acequia», en sus dos variantes.

    py -3.12 _research/video-acequia/tiempos-02.py

Es el mismo mecanismo que `tiempos.py` —manda la voz, la imagen se acomoda— con
tres diferencias que justifican un archivo aparte en vez de un parametro:

1. **La voz sale de cuatro grabaciones, no de una.** A la toma de octubre se le
   suman las tres frases del 22/11/2026, cada una en su archivo y con su propio
   cero. Por eso cada unidad declara de que fuente sale.
2. **Hay planos que no son metraje ni placa de marca**: son las piezas de
   Remotion renderizadas desde los datos del predio. No llevan banda —la banda
   tapa la barra de Screenity, que ahi no existe— y vienen en 1280x720.
3. **Hay planos que todavia no existen.** Van de cartel negro del largo exacto
   que les toca, con el nombre adentro. Eso es lo que hace que esto sea un
   animatico y no un corte: se mira, se discute, y recien despues se renderiza.

Dos variantes, que se diferencian **solo en el acto 1**:

    A · cine     el acto 1 es la obra construida y «Las ocho ventanas»
    B · captura  el acto 1 es el descenso y el perimetro, como en el video 1,
                 y «Las ocho ventanas» se reduce a cuatro segundos

De la bisagra en adelante los dos videos son el mismo plano por plano.

Salidas, todas en `generado-02/` menos los subtitulos:

    generado-02/planos-a.sh   las llamadas seg_* de la variante A
    generado-02/planos-b.sh   idem variante B
    generado-02/frases-a.txt  que frase va a que segundo y de que archivo sale
    generado-02/frases-b.txt  (identico: la voz es la misma en las dos)
    generado-02/duraciones.sh el largo final de cada variante
    karaoke-02a.ass           los subtitulos con la palabra encendida
    karaoke-02b.ass
"""

import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import tiempos as t1   # noqa: E402  (renglones, tarjetas, hhmmss, CABECERA, ESTILOS)

GEN = os.path.join(AQUI, "generado-02")

VELOCIDAD = t1.VELOCIDAD   # 1,1x, la que eligio Jonatan
FPS = t1.FPS

# ---------------------------------------------------------------------------
# Las cuatro grabaciones.
#
# `ganancia` lleva cada toma al nivel de la de octubre. Las tres nuevas se
# grabaron entre 5 y 7 LU mas fuerte —medido con `loudnorm` sobre el tramo de
# habla de cada una: -26,5 LUFS la vieja contra -21,5 / -21,1 / -19,5— y si
# entran asi se despegan del resto, porque la normalizacion final es una sola
# para toda la pista y no toca las diferencias de adentro.
#
# La sala no hace falta igualarla. La de octubre esta en -84 dB RMS y la de las
# nuevas entre -61 y -75, pero de cada frase solo quedan al aire 180 ms de sala
# (los margenes del corte) y abajo corre la cama a unos -33 dBFS, que se la
# come entera.
# ---------------------------------------------------------------------------
FUENTES = {
    "base": ("voz en off app.acequia video-1.mpeg",  0.0),
    "n1":   ("nuevo 1.mp4",                         -5.0),
    "n2":   ("nuevo 2.mp4",                         -5.4),
    "n3":   ("nuevo 3.mp4",                         -7.0),
}

# ---------------------------------------------------------------------------
# Las unidades, en el orden en que suenan.
#
#   (id, fuente, desde, hasta, pausa)
#
# `desde` y `hasta` son segundos DE SU PROPIO ARCHIVO y salen de
# `silencedetect=noise=-35dB:d=0.12`. Sigue valiendo que solo es limite un
# silencio de 0,35 s o mas: en «nuevo 2» la pausa de 0,32 s despues de «mundo»
# es una coma y queda adentro de la frase.
#
# Las tres nuevas van donde dice el documento de la idea:
#   N1  despues de la biografia, todavia sobre la obra construida
#   N3  sobre el anexo de fuentes, despues de la advertencia
#   N2  sobre las trayectorias del sol, justo antes del giro final
# ---------------------------------------------------------------------------
UNIDADES = [
    # id   fuente  desde   hasta   pausa   que dice
    ("U01", "base",  6.027, 10.364, 0.35),  # Desde hace quince anios me dedico...
    ("U02", "base", 10.725, 18.526, 0.70),  # Empece por la bioarquitectura...
    ("N1",  "n1",    1.171,  4.241, 0.80),  # Esto lo construimos nosotros...
    ("U03", "base", 19.351, 22.555, 0.55),  # se me iba mas tiempo juntando datos
    ("U04", "base", 23.211, 26.794, 0.35),  # La topografia... el clima...
    ("U05", "base", 27.176, 28.448, 0.45),  # el suelo, de donde encontrara,
    ("U06", "base", 28.978, 33.083, 0.45),  # la cobertura... el contexto...
    ("U07", "base", 33.591, 34.479, 1.00),  # Y asi sin parar.
    ("U08", "base", 36.171, 39.317, 0.55),  # Por eso hice acequia...   << bisagra
    ("U09", "base", 39.926, 45.935, 0.95),  # Lluvia, suelo, pendiente...
    ("U10", "base", 47.838, 50.221, 0.35),  # Con toda esa informacion ya puedo
    ("U11", "base", 50.626, 51.445, 2.80),  # donde va el agua,
    ("U12", "base", 51.899, 53.859, 0.50),  # donde conviene la represa...
    ("U13", "base", 54.421, 56.069, 0.50),  # por donde pasan las redes...
    ("U14", "base", 56.494, 57.768, 0.50),  # por donde voy a poner los caminos,
    ("U15", "base", 58.331, 61.255, 0.40),  # donde va la cortina... el animal,
    ("U16", "base", 61.692, 64.447, 0.70),  # entre otras utilidades...
    ("U17", "base", 65.233, 70.211, 3.00),  # Ademas me entrega un informe...
    ("N3",  "n3",    0.690,  3.308, 0.60),  # Cada numero dice de donde salio...
    ("N2",  "n2",    0.737,  7.658, 0.80),  # Y funciona en cualquier parte...
    ("U18", "base", 71.712, 75.014, 0.70),  # Un proyecto entero en una fraccion
    ("U19", "base", 75.848, 78.946, 0.45),  # Mi nombre es Jonatan y te invito...
    ("U20", "base", 79.443, 80.655, 1.25),  # Empezar no cuesta nada.
]

ARRANQUE = 0.55   # el primer segundo donde entra la voz: despues del negro

# ---------------------------------------------------------------------------
# Los planos.
#
#   (tipo, fuente, ss, vel, hasta, capas, largo)
#
# El nombre no se escribe: lo pone el generador con el prefijo de la variante y
# el numero de orden. Numerar a mano una lista que se reordena es la forma
# segura de que el plano 14 termine llamandose como el 13.
#
# tipo
#   "negro"   negro de marca
#   "cartel"  negro con el nombre de la pieza que todavia no existe
#   "foto"    un PNG quieto con un empuje lento
#   "pieza"   un render de Remotion: sin banda, 1280x720 escalado a 1920x1080
#   "h"       un corte de la app: con banda y con los pies de fuente
#   "placa"   una placa de marca ya en 1920x1080
#
# ss
#   un numero, o "cola" para que el plano use el FINAL de la fuente
#
# vel
#   1 es tiempo real; "llena" calcula la velocidad para usar todo lo que queda
#   de la fuente desde `ss`
#
# hasta  — el segundo del video donde termina el plano
#   ("pausa", uid, f)    adentro de la pausa que sigue a uid, en la fraccion f
#   ("antes", uid, d)    d segundos antes de que empiece uid
#   ("despues", uid, d)  d segundos despues de que termine uid
#   ("crudo", t, d)      en el segundo t de la grabacion de octubre, corrido d
#   ("fin",)             hasta el final del video
#
# largo
#   None, y el plano empieza donde termino el anterior. Un numero, y el plano
#   dura eso: el anterior se recorta para dejarle lugar. Es lo que permite
#   decir «cuatro segundos de ventanas» sin recalcular a mano los dos vecinos.
# ---------------------------------------------------------------------------

# El acto 1 de la variante A: la obra construida y las ocho ventanas.
#
# Son quince segundos de fotos fechadas de Tay Pichin —excavacion, membrana,
# cisterna viva— mientras la voz cuenta de donde viene y remata con «esto lo
# construimos nosotros». No hay nada que filmar de «hace quince anios»: por eso
# va cine.
ACTO1_A = [
    ("negro",  None,                  0.0,   None,    0.40,                    [], None),
    ("pieza",  "obra",                0.0,   "llena", ("pausa", "N1", 0.55),   [], None),
    ("foto",   "crudo.png",           0.0,   None,    ("pausa", "U03", 0.50),  [], None),
    ("cartel", "ventanas",            0.0,   None,    ("pausa", "U07", 0.50),  [], None),
]

# El acto 1 de la variante B: la app, como en el video 1.
#
# El descenso, el perimetro a 2x, y la letania de capas plano por plano con su
# pie de fuente. La obra queda igual, pero reducida a los tres segundos de N1:
# ahi la voz habla de la obra, asi que la obra tiene que estar.
#
# «Las ocho ventanas» se achica a TRES segundos y entra sobre el final de U06 y
# todo U07: la voz sigue nombrando capas mientras las ventanas se encinman.
# Tres y no cuatro, que es lo que decia el documento de la idea, porque con
# cuatro los cinco planos de capas quedan en 1,4 s cada uno y dejan de leerse:
# el cartel se come justo el tiempo que necesita la letania.
#
# La obra sigue estando, pero reducida a los tres segundos y medio de N1, y va
# por la COLA: ahi lo que hace falta es la cisterna terminada, no la
# excavacion. Acelerar catorce segundos de fotos fechadas a 4x no es un plano,
# es un parpadeo.
ACTO1_B = [
    ("negro",  None,                  0.0,   None,    0.40,                     [], None),
    ("h",      "01-descenso",         0.0,   2.35,    ("pausa", "U01", 0.50),   [], None),
    ("h",      "02-descenso-cola",    0.1,   "llena", ("crudo", 12.34, -0.12),  [], None),
    ("h",      "03-perimetro",        0.0,   2.0,     ("pausa", "U02", 0.50),   [], None),
    ("pieza",  "obra",               "cola", 1.0,     ("pausa", "N1", 0.55),    [], None),
    ("h",      "03-perimetro",       12.2,   1.0,     ("pausa", "U03", 0.50),   [], None),
    ("h",      "04-relieve",          0.9,   1.0,     ("crudo", 24.74, -0.12),
        ["pie-relieve.mov@0"], None),
    ("h",      "05-clima",            0.4,   1.0,     ("pausa", "U04", 0.50),
        ["pie-clima.mov@0"], None),
    ("h",      "06-suelo",            0.5,   1.0,     ("pausa", "U05", 0.50),
        ["pie-suelo.mov@0"], None),
    ("h",      "07-cobertura",        0.9,   1.0,     ("crudo", 30.30, -0.12),
        ["pie-cobertura.mov@0"], None),
    ("h",      "08-ecorregion-yungas", 0.5,  1.0,     ("pausa", "U06", 0.30),
        ["pie-ecorregion.mov@0"], None),
    ("cartel", "ventanas-3s",         0.0,   None,    ("pausa", "U07", 0.50),  [], 3.0),
]

# De la bisagra al final: identico en las dos variantes.
#
# El segundo mas importante del video es el primer cuadro de este bloque: la
# voz dice «Por eso hice acequia» y lo que estaba desordenado se ordena.
RESTO = [
    # El predio, en 3D, ya con las curvas y el agua encima. Va la COLA de la
    # portada y no el principio: lo que hace falta ahi es la llegada, no el
    # dibujo. El dibujo ya lo contaron las ventanas, al reves.
    ("pieza",  "portada",             "cola", 1.0,    ("pausa", "U08", 0.50),  [], None),
    # Las capas del predio encendiendose. Tres segundos alcanzan para el shader
    # y las curvas, que son las dos primeras marcas de la pieza; las otras dos
    # las cuenta el plano siguiente, que es la app haciendo lo mismo de verdad.
    ("pieza",  "lectura-secuencia",   0.0,   1.0,     ("crudo", 43.00, -0.12), [], None),
    ("h",      "22b-capas-shader",    0.0,   "llena", ("pausa", "U09", 0.50),  [], None),
    # El diseno. Siete promesas y siete planos de la app, con el cursor adentro.
    ("h",      "11-keyline",          0.25,  "llena", ("antes", "U11", 0.15),  [], None),
    ("pieza",  "lectura-agua",        0.0,   1.0,     ("despues", "U11", 0.60), [], None),
    ("h",      "12-swales",           0.7,   1.0,     ("antes", "U12", 0.25),  [], None),
    ("h",      "13-represa",          0.3,   1.0,     ("antes", "U13", 0.25),  [], None),
    ("h",      "11b-servicios",       0.0,   1.0,     ("antes", "U14", 0.25),  [], None),
    ("h",      "14-camino-perfil",    0.4,   1.0,     ("antes", "U15", 0.25),  [], None),
    ("h",      "15-cortina",          0.5,   1.0,     ("crudo", 60.18, -0.12), [], None),
    # El panel de potreros arranca en el segundo 2,5 del corte y a tiempo real:
    # para cuando entra, los 28 potreros y el 533 % ya estan escritos. Con
    # "llena" el plano salia a 3,4x sobre un panel de numeros, que es
    # exactamente la clase de plano que no se puede leer.
    ("h",      "16a-potreros-panel",  2.5,   1.0,     ("antes", "U16", 0.25),  [], None),
    # El acto 04 de la mesa de trabajo: lo que el terreno NO admite.
    ("pieza",  "mesa-de-trabajo",    10.67,  1.0,     ("despues", "U16", 0.35), [], None),
    # El informe, la advertencia, y los tres segundos de silencio que Jonatan
    # dejo despues de «cuando no confiar»: ahi va la observacion.
    ("pieza",  "informe",             0.0,   1.0,     ("crudo", 67.40, -0.10), [], None),
    ("h",      "20-salud-del-calculo", 0.0,  1.0,     ("despues", "U17", 0.10), [], None),
    ("cartel", "observacion",         0.0,   None,    ("antes", "N3", 0.0),    [], None),
    # El anexo de fuentes, que ahora tiene frase propia.
    ("h",      "18-anexo-fuentes",    0.0,   1.0,     ("despues", "N3", 0.45), [], None),
    # El acto 01 de sol-y-viento: las tres trayectorias, y la de junio pasando
    # por el norte. Es el argumento que una plantilla no puede copiar.
    ("pieza",  "sol-y-viento",        0.0,   1.0,     ("despues", "N2", 0.55), [], None),
    # El giro. Arranca en el segundo 13, que es donde la portada-giro empieza a
    # girar, y a velocidad 1: media vuelta lenta. Jonatan ya dijo que a 2 s la
    # vuelta entera no se distingue nada, asi que no se acelera.
    ("pieza",  "portada-giro",       13.0,   1.0,     ("antes", "U20", 0.55),  [], None),
    ("placa",  "cierre-h.mp4",        0.0,   None,    ("fin",),                [], None),
]

VARIANTES = {
    "a": ("A · el acto 1 en cine",    ACTO1_A + RESTO),
    "b": ("B · el acto 1 en captura", ACTO1_B + RESTO),
}

# El cierre de marca dura 5 s clavados y es lo que fija el largo del video.
PLACA_FINAL = 150

# Donde viven las fuentes de imagen. Las piezas estan repartidas en tres
# carpetas de encargo; el generador no las busca, las tiene escritas.
CARPETAS = {
    "02": "salida-encargo-02/encargo 2 entrega 2",
    "03": "salida-encargo-03",
    "04": "salida-encargo-04",
}

# Las piezas que entran al video salen de `scripts/video-1080.mjs`, que las
# rinde A 1920x1080 —la resolucion del video— y no a los 1280x720 de la
# entrega web. Son dos entregas distintas y conviven: los `-master.mp4` de al
# lado siguen siendo los de la pagina, con su tope de peso y su verificacion
# que exige 1280x720.
#
# Hasta el 25/11/2026 esto apuntaba a los de 720 y el montaje los estiraba a
# 1080 con lanczos, que es inventar un pixel de cada tres: las curvas de nivel
# y los textos chicos salian blandos. `--scale=1.5` no agranda pixeles, los
# dibuja.
#
# `sol-y-viento` es la unica que sigue en 720, y a proposito: no esta en la
# version final —ver la tabla de bajas en FINAL-02.md— asi que rendirla a 1080
# serian mil doscientos cuadros para un plano que no existe. Queda nombrada
# porque el animatico, que si la usaba, todavia se puede generar.
PIEZAS = {
    "obra":              ("04", "obra-master-1080.mp4"),
    "portada":           ("02", "portada-master-1080.mp4"),
    "portada-giro":      ("02", "portada-giro-master-1080.mp4"),
    "lectura-secuencia": ("02", "lectura-secuencia-master-1080.mp4"),
    "lectura-agua":      ("02", "lectura-agua-master-1080.mp4"),
    "mesa-de-trabajo":   ("03", "mesa-de-trabajo-master-1080.mp4"),
    "sol-y-viento":      ("04", "sol-y-viento-master.mp4"),
    "informe":           ("04", "informe-master-1080.mp4"),
}

# El crudo va a 3200 de ancho y no a 1920, porque `seg_foto` le hace un empuje:
# lleva la imagen a 3200 y recien ahi recorta a 1920. Con un PNG de 1920 el
# empuje volveria a inventar pixeles adentro del montaje. 1600x900 x2 da
# 3200x1800 exacto, asi que el `scale` del constructor queda sin nada que hacer.
FOTOS = {"crudo.png": ("03", "crudo-3200.png")}

# Los carteles: lo que diria la pieza que todavia no existe. La barra vertical
# separa renglones; el largo lo escribe el generador, para que el cartel diga
# exactamente cuanto hay que llenar.
CARTELES = {
    "ventanas": (
        "Las ocho ventanas",
        "ocho fuentes apareciendo de a una, cada una en su recuadro,"
        "|con su resolucion y su fecha, hasta que no se hablan entre ellas"),
    "ventanas-3s": (
        "Las ocho ventanas",
        "la version corta: las ocho ya encimadas, solo el amontonamiento"),
    "observacion": (
        "La observacion",
        "Confianza media · 1 observacion"
        "|Cuenca de 282 ha: fuera del rango de Kirpich."
        "|Subestima el tiempo de concentracion y sobreestima el caudal pico."),
}


# ===========================================================================
# Linea de tiempo
# ===========================================================================

U = {u[0]: u for u in UNIDADES}


def tender():
    """Pone las frases una atras de otra y devuelve donde cae cada una."""
    t = ARRANQUE
    destinos = {}
    for uid, _fuente, desde, hasta, pausa in UNIDADES:
        destinos[uid] = t
        t += (hasta - desde) / VELOCIDAD + pausa
    return destinos, t


def fin_de(uid, destinos):
    _, _f, desde, hasta, _p = U[uid]
    return destinos[uid] + (hasta - desde) / VELOCIDAD


def resolver(marca, destinos, total):
    if isinstance(marca, (int, float)):
        return float(marca)
    clase = marca[0]
    if clase == "fin":
        return total
    if clase == "pausa":
        return fin_de(marca[1], destinos) + U[marca[1]][4] * marca[2]
    if clase == "antes":
        return destinos[marca[1]] - marca[2]
    if clase == "despues":
        return fin_de(marca[1], destinos) + marca[2]
    if clase == "crudo":
        # un segundo de la grabacion de octubre: solo puede caer en una unidad
        # que salga de ese archivo
        t, delta = marca[1], marca[2]
        for uid, fuente, desde, hasta, _p in UNIDADES:
            if fuente == "base" and desde <= t <= hasta:
                return destinos[uid] + (t - desde) / VELOCIDAD + delta
        raise SystemExit("El segundo %s no cae adentro de ninguna frase de la "
                         "toma de octubre" % t)
    raise SystemExit("Marcador desconocido: %r" % (marca,))


def largos_fuentes(cortes, animacion):
    """Cuanto dura cada cosa que se puede poner en un plano."""
    import subprocess

    def dur(ruta):
        salida = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", ruta], capture_output=True, text=True).stdout
        if not salida.strip():
            raise SystemExit("ffprobe no pudo leer %s" % ruta)
        return float(salida.strip())

    largos = {}
    for n in sorted(os.listdir(cortes)):
        if n.endswith(".mp4"):
            largos["h:" + n[:-4]] = dur(os.path.join(cortes, n))
    for clave, (encargo, archivo) in PIEZAS.items():
        largos["pieza:" + clave] = dur(os.path.join(
            animacion, CARPETAS[encargo].replace("/", os.sep), archivo))
    return largos


# ===========================================================================
# Subtitulos: un Dialogue por palabra, con esa palabra encendida
# ===========================================================================

def karaoke(estilo, destinos, duracion, palabras):
    ancho, alto, cuerpo, margen, cpr = t1.ESTILOS[estilo]
    eventos = []

    for uid, fuente, desde, hasta, _pausa in UNIDADES:
        destino = destinos[uid]
        ws = [w for w in palabras[fuente]
              if w["f"] > desde + 0.02 and w["t"] < hasta - 0.02]
        if not ws:
            continue

        def av(t, desde=desde, hasta=hasta, destino=destino):
            return destino + (min(max(t, desde), hasta) - desde) / VELOCIDAD

        for tar in t1.tarjetas(ws, cpr):
            lineas = t1.renglones(tar, cpr)
            pos = []
            for r, texto in enumerate(lineas):
                pos.extend([r] * len(texto.split(" ")))
            for k, w in enumerate(tar):
                a = av(w["t"]) if k else av(tar[0]["t"])
                b = av(tar[k + 1]["t"]) if k + 1 < len(tar) else av(w["f"]) + 0.12
                b = min(b, duracion)
                if b <= a:
                    continue
                partes = [[] for _ in lineas]
                for j, w2 in enumerate(tar):
                    marca = t1.ENCENDIDO if j == k else t1.APAGADO
                    partes[pos[j]].append(marca + w2["p"])
                texto = r"\N".join(" ".join(p) for p in partes if p)
                eventos.append((a, b, t1.APAGADO + texto))

    eventos.sort(key=lambda e: e[0])
    for i in range(len(eventos) - 1):
        a, b, txt = eventos[i]
        eventos[i] = (a, min(b, eventos[i + 1][0]), txt)
    eventos = [e for e in eventos if e[1] - e[0] > 0.01]

    cab = t1.CABECERA.format(ancho=ancho, alto=alto, cuerpo=cuerpo, margen=margen)
    return cab + "".join(
        "Dialogue: 0,%s,%s,acequia,,0,0,0,,%s\n" % (t1.hhmmss(a), t1.hhmmss(b), x)
        for a, b, x in eventos)


# ===========================================================================
# Escritura
# ===========================================================================

def comillas(s):
    """Un argumento de shell entre comillas simples, a prueba de espacios."""
    return "'" + s.replace("'", "'\\''") + "'"


def escribir_planos(archivo, prefijo, planos, destinos, total, largos):
    # 1. donde termina cada plano
    fines = []
    for i, p in enumerate(planos):
        fines.append(total if i == len(planos) - 1
                     else resolver(p[4], destinos, total))
    # 2. los que declaran largo propio le recortan el final al anterior
    for i, p in enumerate(planos):
        if p[6] is not None and i > 0:
            fines[i - 1] = fines[i] - p[6]

    lineas = ["# Generado por tiempos-02.py. No se edita a mano.\n"]
    tabla = []
    t = 0.0
    nombres = []
    for i, (tipo, fuente, ss, vel, _hasta, capas, _largo) in enumerate(planos):
        nombre = "%s%02d" % (prefijo, i + 1)
        nombres.append(nombre)
        if tipo == "placa":
            n = PLACA_FINAL
        else:
            n = int(round((fines[i] - t) * FPS))
        dur = n / FPS

        aviso = ""
        if tipo in ("h", "pieza"):
            clave = ("h:" if tipo == "h" else "pieza:") + fuente
            largo = largos[clave]
            factor = 1.0 if vel == "llena" else vel
            arranque = largo - dur * factor if ss == "cola" else ss
            if vel == "llena":
                vel = (largo - arranque) / dur
            usado = arranque + dur * vel
            aviso = "usa %.1f de %.1f s" % (dur * vel, largo)
            if usado > largo + 0.05:
                aviso = "!! SE PASA: pide hasta %.1f s y la fuente tiene %.1f" % (
                    usado, largo)
            elif arranque < -0.001:
                aviso = "!! SE PASA: la cola de %.1f s no entra en %.1f" % (dur, largo)
            ss = arranque

        if tipo == "negro":
            lineas.append("seg_negro %s %d\n" % (nombre, n))
        elif tipo == "cartel":
            titulo, bajada = CARTELES[fuente]
            lineas.append("seg_cartel %s %d %s %s %s\n" % (
                nombre, n, comillas(titulo), comillas(bajada),
                comillas("%.1f s" % dur)))
        elif tipo == "foto":
            enc, png = FOTOS[fuente]
            lineas.append("seg_foto %s %s %d\n" % (
                nombre, comillas(CARPETAS[enc] + "/" + png), n))
        elif tipo == "pieza":
            enc, archivo_pieza = PIEZAS[fuente]
            # tres decimales y no dos: el segundo de arranque de un plano que
            # pide la cola se redondea para arriba y deja el pedido un cuadro
            # mas largo que la fuente
            lineas.append("seg_pieza %s %s %8.3f %4d %-6.4g\n" % (
                nombre, comillas(CARPETAS[enc] + "/" + archivo_pieza),
                ss, n, vel))
        elif tipo == "placa":
            lineas.append("seg_placa %s %s %d\n" % (nombre, fuente, n))
        elif tipo == "h":
            lineas.append("seg_h %s %-22s %5.2f %4d %-6.4g %s\n" % (
                nombre, fuente, ss, n, vel, " ".join(capas)))

        tabla.append((nombre, tipo, fuente or "-", t, dur, n,
                      ss if isinstance(ss, float) else 0.0, aviso))
        t += dur

    lineas.append('pegar "$T/%s-mudo.mp4" %s\n' % (prefijo, " ".join(nombres)))
    with open(archivo, "w", encoding="utf-8") as f:
        f.writelines(lineas)
    return tabla, t


def escribir_frases(archivo, destinos):
    with open(archivo, "w", encoding="utf-8") as f:
        f.write("# uid fuente  desde   hasta  destino  dB"
                "   (generado por tiempos-02.py)\n")
        for uid, fuente, desde, hasta, _p in UNIDADES:
            _archivo_voz, ganancia = FUENTES[fuente]
            f.write("%-4s %-5s %7.3f %7.3f %7.2f %5.1f\n"
                    % (uid, fuente, desde, hasta, destinos[uid], ganancia))


def main():
    os.makedirs(GEN, exist_ok=True)
    with open(os.path.join(AQUI, "palabras.json"), encoding="utf-8") as f:
        palabras = {"base": json.load(f)}
    with open(os.path.join(AQUI, "palabras-02.json"), encoding="utf-8") as f:
        palabras.update({k: v for k, v in json.load(f).items() if k != "_"})

    cortes = r"C:\Arte y Tierra\Acequia\videoapp-1\cortes"
    animacion = r"C:\Arte y Tierra\Acequia\portada animacion"
    largos = largos_fuentes(cortes, animacion)

    destinos, _ = tender()
    inicio_cierre = destinos["U20"] - 0.55
    total = inicio_cierre + PLACA_FINAL / FPS

    duraciones = {}
    for clave, (titulo, planos) in VARIANTES.items():
        tabla, real = escribir_planos(
            os.path.join(GEN, "planos-%s.sh" % clave), clave, planos,
            destinos, total, largos)
        duraciones[clave] = real
        escribir_frases(os.path.join(GEN, "frases-%s.txt" % clave), destinos)
        with open(os.path.join(AQUI, "karaoke-02%s.ass" % clave), "w",
                  encoding="utf-8") as f:
            f.write(karaoke("h", destinos, real, palabras))

        print("\n== %s" % titulo)
        print("%-5s %-7s %-22s %7s %6s %7s %6s  %s"
              % ("plano", "tipo", "fuente", "entra", "dura", "cuadros", "desde",
                 "material"))
        for nombre, tipo, fuente, t, dur, n, ss, aviso in tabla:
            print("%-5s %-7s %-22s %7.2f %6.2f %7d %6.2f  %s"
                  % (nombre, tipo, fuente, t, dur, n, ss, aviso))
        print("   %.2f s (%d cuadros)" % (real, round(real * FPS)))

    with open(os.path.join(GEN, "duraciones.sh"), "w", encoding="utf-8") as f:
        f.write("# Generado por tiempos-02.py\n")
        for clave in sorted(duraciones):
            f.write("DURACION_%s=%.2f\n" % (clave.upper(), duraciones[clave]))

    hablado = sum((u[3] - u[2]) / VELOCIDAD for u in UNIDADES)
    nuevo = sum((u[3] - u[2]) / VELOCIDAD for u in UNIDADES if u[1] != "base")
    print("\n%.1f s hablados (%.1f de las tres tomas nuevas) = %d %% del video"
          % (hablado, nuevo, round(100 * hablado / duraciones["a"])))


if __name__ == "__main__":
    main()
