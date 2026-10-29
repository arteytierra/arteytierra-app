#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Una sola fuente de verdad para el montaje, la voz y los subtitulos.

    py -3.12 _research/video-acequia/tiempos.py

Por que un solo archivo genera las tres cosas:

El montaje, la pista de voz y los subtitulos karaoke tienen que coincidir al
centesimo. Si el plano del relieve dura 1,67 s, la frase que lo nombra tiene que
empezar ahi y la palabra «topografia» tiene que encenderse ahi. Mantener eso a
mano en tres tablas distintas es la forma segura de que se desincronicen a la
tercera correccion. Asi que aca se declara **una** linea de tiempo y de ahi
salen los cuadros de cada plano, el segundo donde va cada frase y el milisegundo
donde se enciende cada palabra.

La linea de tiempo se construye al reves de lo habitual: **manda la voz**. Se
ponen las veinte frases una tras otra con las pausas que Jonatan hizo al grabar,
y los planos se estiran o se achican para caer donde cae cada frase. Por eso los
cortes de imagen caen en las pausas de la voz —se corta en la respiracion, que
es donde se corta— y por eso ya no hay huecos de ocho segundos.

Tres reglas que no se rompen:

1. **Una frase no se parte nunca.** Los limites de las unidades salen de
   `silencedetect`: son los silencios que hizo al hablar. Cortar el audio en el
   medio de un grupo respiratorio y pegar las dos mitades a tres segundos de
   distancia es exactamente lo que sonaba mal en la primera version.
2. **La imagen si puede cortar dentro de una frase.** Mientras la voz sigue, el
   plano puede cambiar: eso es montaje normal. Los marcadores `('crudo', t)`
   dicen en que momento de la grabacion cae ese corte.
3. **Nada se muestra mientras la voz dice otra cosa.** Si una frase no tiene
   plano que la acompane, la frase no entra.

Salidas, todas en `generado/` menos los subtitulos:

    generado/planos-h.sh      las llamadas seg_* del horizontal
    generado/planos-v30.sh    idem vertical de 30 s
    generado/planos-v15.sh    idem vertical de 15 s
    generado/frases-*.txt     que frase va a que segundo, para voz.sh
    generado/duraciones.sh    el largo final de cada video
    karaoke-*.ass             los subtitulos con la palabra encendida
"""

import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(AQUI, "generado")

VELOCIDAD = 1.1   # la que eligio Jonatan
FPS = 30

# ---------------------------------------------------------------------------
# Las unidades: los tramos de habla que separan los silencios de la grabacion.
#
# `desde` y `hasta` son segundos de `voz en off app.acequia video-1.mpeg` y
# salen de  `silencedetect=noise=-35dB:d=0.15`.  Solo son limite los silencios
# de 0,35 s o mas: las pausas mas cortas son comas y quedan adentro de la frase.
#
# `pausa` es el silencio que va DESPUES de esa frase en el video, ya a 1,1x.
# Arranca del silencio que hizo al grabar y se ajusta donde el montaje necesita
# aire: U11 abre el plano de los swales y U17 el del anexo de fuentes.
# ---------------------------------------------------------------------------
UNIDADES = [
    # id    desde   hasta   pausa   que dice
    ("U01",  6.027, 10.364, 0.35),  # Desde hace quince anios me dedico al diseno...
    ("U02", 10.725, 18.526, 0.70),  # Empece por la bioarquitectura... permacultura.
    ("U03", 19.351, 22.555, 0.55),  # Para iniciar un diseno se me iba mas tiempo...
    ("U04", 23.211, 26.794, 0.35),  # La topografia... el clima, de dos o tres...
    ("U05", 27.176, 28.448, 0.45),  # el suelo, de donde encontrara,
    ("U06", 28.978, 33.083, 0.45),  # la cobertura... el ecosistema y el contexto...
    ("U07", 33.591, 34.479, 1.00),  # Y asi sin parar.
    ("U08", 36.171, 39.317, 0.55),  # Por eso hice acequia, que recopila y cruza.
    ("U09", 39.926, 45.935, 0.95),  # Lluvia, suelo, pendiente... en un solo lugar.
    ("U10", 47.838, 50.221, 0.35),  # Con toda esa informacion ya puedo disenar
    ("U11", 50.626, 51.445, 2.80),  # donde va el agua,          + el plano de swales
    ("U12", 51.899, 53.859, 0.50),  # donde conviene la represa y cuanto junta,
    ("U13", 54.421, 56.069, 0.50),  # por donde pasan las redes de servicios,
    ("U14", 56.494, 57.768, 0.50),  # por donde voy a poner los caminos,
    ("U15", 58.331, 61.255, 0.40),  # donde va la cortina... donde entra el animal,
    ("U16", 61.692, 64.447, 0.70),  # entre otras utilidades que me simplifican...
    ("U17", 65.233, 70.211, 3.00),  # Ademas me entrega un informe... no confiar.
    ("U18", 71.712, 75.014, 0.70),  # Un proyecto entero en una fraccion del tiempo...
    ("U19", 75.848, 78.946, 0.45),  # Mi nombre es Jonatan y te invito a conocer...
    ("U20", 79.443, 80.655, 1.25),  # Empezar no cuesta nada.
]

ARRANQUE = 0.55   # el primer segundo donde entra la voz: despues del negro

# ---------------------------------------------------------------------------
# Los planos del horizontal.
#
#   (nombre, tipo, fuente, ss, velocidad, hasta, [capas])
#
# `velocidad` 1 es tiempo real, 3 es tres veces mas rapido, 0,64 es mas lento.
# `"llena"` calcula la velocidad para que el plano use todo lo que queda del
# corte desde `ss`: es la forma de no desperdiciar material ni inventar freezes.
#
# `hasta` es el segundo del video donde termina el plano:
#   ("pausa", uid, f)   adentro de la pausa que sigue a uid, en la fraccion f
#   ("antes", uid, d)   d segundos antes de que empiece uid
#   ("despues", uid, d) d segundos despues de que termine uid
#   ("crudo", t, d)     en el segundo t de la grabacion cruda, corrido d
#                       (asi se corta la imagen adentro de una frase)
#
# Los titulares `t0*.mov` ya no estan: decian lo mismo que ahora dice la voz y
# caian justo donde van los subtitulos. Quedan los pies `pie-*.mov`, que citan
# la fuente de cada capa y viven adentro de la banda.
# ---------------------------------------------------------------------------
PLANOS_H = [
    ("h01", "negro", None, 0, None, 0.40, []),
    # La presentacion. El descenso baja a 2,35x y el corte de la parcela quieta
    # da el respiro antes de que arranque la biografia.
    ("h02", "h", "01-descenso",        0.0,  2.35,    ("pausa", "U01", 0.5), []),
    ("h03", "h", "02-descenso-cola",   0.1,  "llena", ("crudo", 12.34, -0.12), []),
    # El perimetro, dos veces: rapido mientras cuenta de donde viene, y a tiempo
    # real cuando dice que se le iba mas tiempo juntando datos que disenando.
    # 5,48x era ilegible; 2,0x se entiende que son clics.
    ("h04", "h", "03-perimetro",       0.0,  2.0,     ("pausa", "U02", 0.5), []),
    ("h05", "h", "03-perimetro",      12.2,  1.0,     ("pausa", "U03", 0.5), []),
    # La letania de capas. Cinco planos de menos de dos segundos: la frase
    # tambien es rapida, no respira hasta el final.
    ("h06", "h", "04-relieve",         0.9,  1.0,     ("crudo", 24.74, -0.12),
        ["pie-relieve.mov@0"]),
    ("h07", "h", "05-clima",           0.4,  1.0,     ("pausa", "U04", 0.5),
        ["pie-clima.mov@0"]),
    ("h08", "h", "06-suelo",           0.5,  1.0,     ("pausa", "U05", 0.5),
        ["pie-suelo.mov@0"]),
    ("h09", "h", "07-cobertura",       0.9,  1.0,     ("crudo", 31.08, -0.12),
        ["pie-cobertura.mov@0"]),
    ("h10", "h", "08-ecorregion-yungas", 0.5, 1.0,    ("pausa", "U06", 0.5),
        ["pie-ecorregion.mov@0"]),
    # El cruce. Sin la placa de la curva numero: la cuenca resolviendose sola
    # mientras dice que acequia recopila y cruza, y el panel de capas con el
    # shader mientras enumera lo que junta. Las dos son la app trabajando.
    ("h11", "h", "09-cuenca-resolviendo", 0.0, "llena", ("pausa", "U08", 0.5), []),
    ("h12", "h", "22b-capas-shader",     0.0, "llena", ("pausa", "U09", 0.5), []),
    # El diseno.
    ("h13", "h", "11-keyline",         0.25, "llena", ("despues", "U11", 0.40), []),
    ("h14", "h", "12-swales",          0.7,  1.0,     ("antes", "U12", 0.25), []),
    ("h15", "h", "13-represa",         0.3,  1.0,     ("antes", "U13", 0.25), []),
    ("h16", "h", "11b-servicios",      0.0,  1.0,     ("antes", "U14", 0.25), []),
    ("h17", "h", "14-camino-perfil",   0.4,  1.0,     ("antes", "U15", 0.25), []),
    ("h18", "h", "15-cortina",         0.5,  1.0,     ("crudo", 60.18, -0.12), []),
    ("h19", "h", "16a-potreros-panel", 0.2,  "llena", ("despues", "U16", 0.35), []),
    # El informe y la honestidad. El corte cae en «y hasta me avisa», que es
    # donde la frase cambia de tema: la tapa del informe se va justo ahi.
    ("h20", "h", "17-informe",         1.0,  1.0,     ("crudo", 67.40, -0.10), []),
    ("h21", "h", "20-salud-del-calculo", 0.0, 1.0,    ("despues", "U17", 0.95), []),
    # El anexo de fuentes va DESPUES de la linea de la honestidad, no antes:
    # cada capa con su fuente y su fecha es la prueba de lo que acaba de decir.
    ("h22", "h", "18-anexo-fuentes",   0.0,  1.0,     ("antes", "U18", 0.35), []),
    ("h23", "h", "21-sectores-cierre", 1.0,  1.0,     ("antes", "U19", 0.60), []),
    ("h24", "placa", "cierre-h.mp4",   0.0,  None,    ("fin",), []),
]

# El cierre de marca dura 5 s y la voz necesita 6: el ultimo cuadro se congela
# un segundo. Es un lockup quieto, asi que no se nota.
PLACA_FINAL_H = 180

# ---------------------------------------------------------------------------
# Los verticales. Aca manda el video —los planos ya estan y a Jonatan le gustan
# como estan— asi que la voz se acomoda: se eligen las frases que entran en los
# huecos que el montaje deja, sin partir ninguna.
# ---------------------------------------------------------------------------
VOZ_V30 = [("U01", 0.45), ("U03", 5.00), ("U07", 8.40), ("U08", 10.30),
           ("U09", 13.60), ("U11", 19.30), ("U12", 20.50), ("U18", 23.30),
           ("U19", 26.80)]

VOZ_V15 = [("U01", 0.40), ("U09", 5.30), ("U19", 12.10)]

DURACION_V30 = 30.0
DURACION_V15 = 15.0

# ---------------------------------------------------------------------------
# Subtitulos
#
# La palabra que esta sonando va en blanco calido lleno y el resto de la frase
# en el mismo blanco al 61 %. El contorno no se toca —`\1a` cambia la opacidad
# del relleno nada mas— asi que la linea se lee igual sobre cualquier fondo.
#
# Un evento por palabra: con `\k` de ASS el karaoke va PINTANDO la frase y queda
# todo lo ya dicho encendido, que no es lo que se pidio. Un Dialogue por palabra
# deja encendida solo la que suena.
# ---------------------------------------------------------------------------
APAGADO = r"{\1a&H64&}"
ENCENDIDO = r"{\1a&H00&}"

ESTILOS = {
    # nombre: (ancho, alto, cuerpo, margenV, caracteres por renglon)
    "h":   (1920, 1080, 54, 172, 44),
    "v30": (1080, 1920, 54, 110, 26),
    "v15": (1080, 1920, 54, 110, 26),
}

CABECERA = """[Script Info]
; Subtitulos karaoke: la palabra que suena queda encendida y el resto de la
; frase, al 61 %. Generado por tiempos.py — no se edita a mano.
;
; Va en ASS y no en SRT por dos razones. Una: el filtro `subtitles` de ffmpeg,
; cuando le entra un SRT, arma el script con PlayRes 384x288 y ahi MarginV 110
; no son 110 pixeles. Declarando PlayRes igual al video, Fontsize y MarginV
; vuelven a ser pixeles de verdad. Dos: el SRT no tiene como encender una
; palabra sola.
ScriptType: v4.00+
PlayResX: {ancho}
PlayResY: {alto}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: acequia,Inter,{cuerpo},&H00E8F0F5,&H00E8F0F5,&H0010121A,&H0010121A,-1,0,0,0,100,100,0,0,1,2,0,2,70,70,{margen},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


# ===========================================================================
# Linea de tiempo
# ===========================================================================

def cargar_palabras():
    with open(os.path.join(AQUI, "palabras.json"), encoding="utf-8") as f:
        return json.load(f)


def tender(unidades, arranque):
    """Pone las frases una atras de otra y devuelve donde cae cada una."""
    t = arranque
    destinos = {}
    for uid, desde, hasta, pausa in unidades:
        destinos[uid] = t
        t += (hasta - desde) / VELOCIDAD + pausa
    return destinos, t


def mapa_unidades():
    return {u[0]: u for u in UNIDADES}


def resolver(marca, destinos, total):
    """Traduce un marcador de corte a un segundo del video."""
    U = mapa_unidades()

    def fin(uid):
        _, desde, hasta, _ = U[uid]
        return destinos[uid] + (hasta - desde) / VELOCIDAD

    if isinstance(marca, (int, float)):
        return float(marca)

    clase = marca[0]
    if clase == "fin":
        return total
    if clase == "pausa":
        uid, frac = marca[1], marca[2]
        return fin(uid) + U[uid][3] * frac
    if clase == "antes":
        return destinos[marca[1]] - marca[2]
    if clase == "despues":
        return fin(marca[1]) + marca[2]
    if clase == "crudo":
        t, delta = marca[1], marca[2]
        for uid, desde, hasta, _ in UNIDADES:
            if desde <= t <= hasta:
                return destinos[uid] + (t - desde) / VELOCIDAD + delta
        raise SystemExit("El segundo %s no cae adentro de ninguna frase" % t)
    raise SystemExit("Marcador desconocido: %r" % (marca,))


def duraciones_cortes(cortes_dir):
    """Largo de cada corte, para la velocidad 'llena'."""
    import subprocess
    largos = {}
    for n in sorted(os.listdir(cortes_dir)):
        if not n.endswith(".mp4"):
            continue
        salida = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", os.path.join(cortes_dir, n)],
            capture_output=True, text=True).stdout.strip()
        largos[n[:-4]] = float(salida)
    return largos


# ===========================================================================
# Subtitulos
# ===========================================================================

def renglones(palabras, ancho):
    ren, act = [], ""
    for w in palabras:
        cand = (act + " " + w["p"]).strip()
        if act and len(cand) > ancho:
            ren.append(act)
            act = w["p"]
        else:
            act = cand
    if act:
        ren.append(act)
    return ren


def tarjetas(palabras, ancho):
    """Parte una frase en carteles de a lo sumo dos renglones."""
    salida, act = [], []
    for w in palabras:
        prueba = act + [w]
        if act and len(renglones(prueba, ancho)) > 2:
            salida.append(act)
            act = [w]
        else:
            act = prueba
    if act:
        salida.append(act)

    # Si un cartel termina en el medio de una enumeracion y dos o tres palabras
    # antes habia una coma, se corta en la coma: se lee mejor.
    ajustadas = []
    for i, tar in enumerate(salida):
        if i + 1 < len(salida) and len(tar) > 4:
            for j in range(len(tar) - 1, max(len(tar) - 4, 2), -1):
                if tar[j - 1]["p"].endswith((",", ".", ":")):
                    salida[i + 1] = tar[j:] + salida[i + 1]
                    tar = tar[:j]
                    break
        ajustadas.append(tar)
    return ajustadas


def hhmmss(t):
    t = max(t, 0.0)
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return "%d:%02d:%05.2f" % (h, m, s)


def karaoke(nombre, colocacion, duracion, palabras):
    """Un Dialogue por palabra, con esa palabra encendida."""
    ancho, alto, cuerpo, margen, cpr = ESTILOS[nombre]
    U = mapa_unidades()
    eventos = []

    for uid, destino in colocacion:
        _, desde, hasta, _ = U[uid]
        ws = [w for w in palabras
              if w["f"] > desde + 0.02 and w["t"] < hasta - 0.02]
        if not ws:
            continue

        def av(t):  # al video
            return destino + (min(max(t, desde), hasta) - desde) / VELOCIDAD

        for tar in tarjetas(ws, cpr):
            lineas = renglones(tar, cpr)
            # a que renglon fue a parar cada palabra
            pos, i = [], 0
            for r, texto in enumerate(lineas):
                n = len(texto.split(" "))
                for _ in range(n):
                    pos.append(r)
                    i += 1
            for k, w in enumerate(tar):
                a = av(w["t"]) if k else av(tar[0]["t"])
                b = av(tar[k + 1]["t"]) if k + 1 < len(tar) else av(w["f"]) + 0.12
                b = min(b, duracion)
                if b <= a:
                    continue
                partes = [[] for _ in lineas]
                for j, w2 in enumerate(tar):
                    marca = ENCENDIDO if j == k else APAGADO
                    partes[pos[j]].append(marca + w2["p"])
                texto = r"\N".join(" ".join(p) for p in partes if p)
                eventos.append((a, b, APAGADO + texto))

    # Ningun evento puede seguir en pantalla cuando ya empezo el siguiente: ASS
    # apila los Dialogue simultaneos uno arriba del otro, y al pasar de un
    # cartel al que sigue se veian los dos a la vez.
    eventos.sort(key=lambda e: e[0])
    for i in range(len(eventos) - 1):
        a, b, t = eventos[i]
        eventos[i] = (a, min(b, eventos[i + 1][0]), t)
    eventos = [e for e in eventos if e[1] - e[0] > 0.01]

    cab = CABECERA.format(ancho=ancho, alto=alto, cuerpo=cuerpo, margen=margen)
    cuerpo_txt = "".join(
        "Dialogue: 0,%s,%s,acequia,,0,0,0,,%s\n" % (hhmmss(a), hhmmss(b), t)
        for a, b, t in eventos)
    return cab + cuerpo_txt


# ===========================================================================
# Escritura
# ===========================================================================

def srt(colocacion, duracion, palabras, ancho=46):
    """El mismo texto sin karaoke, un cartel por vez.

    Es para la pista de subtitulos de YouTube, que se sube aparte y se puede
    apagar. Los quemados son los del video; este es el que indexa el buscador.
    """
    def reloj(t):
        t = max(t, 0.0)
        return "%02d:%02d:%06.3f" % (t // 3600, (t % 3600) // 60, t % 60)

    U = mapa_unidades()
    partes, n = [], 0
    for uid, destino in colocacion:
        _, desde, hasta, _ = U[uid]
        ws = [w for w in palabras
              if w["f"] > desde + 0.02 and w["t"] < hasta - 0.02]
        for tar in tarjetas(ws, ancho):
            a = destino + (max(tar[0]["t"], desde) - desde) / VELOCIDAD
            b = destino + (min(tar[-1]["f"], hasta) - desde) / VELOCIDAD + 0.25
            n += 1
            partes.append("%d\n%s --> %s\n%s\n\n" % (
                n, reloj(a).replace(".", ","),
                reloj(min(b, duracion)).replace(".", ","),
                "\n".join(renglones(tar, ancho))))
    return "".join(partes)


def escribir_planos(archivo, planos, destinos, total, largos, cuadros_finales):
    lineas = ["# Generado por tiempos.py. No se edita a mano.\n"]
    tabla = []
    t = 0.0
    for i, (nombre, tipo, fuente, ss, vel, hasta, capas) in enumerate(planos):
        ultimo = i == len(planos) - 1
        fin = total if ultimo else resolver(hasta, destinos, total)
        dur = fin - t
        n = int(round(dur * FPS))
        if tipo == "placa" and cuadros_finales:
            n = cuadros_finales
        if vel == "llena":
            vel = (largos[fuente] - ss) / (n / FPS)
        sobra = ""
        if tipo == "h" and vel:
            usado = ss + (n / FPS) * vel
            sobra = "usa %.1f de %.1f s" % (usado - ss, largos[fuente])
            if usado > largos[fuente] + 0.05:
                sobra = "!! SE PASA: pide %.1f s y el corte tiene %.1f" % (
                    usado, largos[fuente])

        if tipo == "negro":
            lineas.append("seg_negro %s %d 1920x1080\n" % (nombre, n))
        elif tipo == "placa":
            lineas.append("seg_placa %s %s %d\n" % (nombre, fuente, n))
        elif tipo == "h":
            lineas.append("seg_h %s %-22s %4.2f %4d %-6.4g %s\n" % (
                nombre, fuente, ss, n, vel, " ".join(capas)))
        tabla.append((nombre, fuente or "-", t, dur, n, sobra))
        t = fin if not (tipo == "placa" and cuadros_finales) else t + n / FPS

    lineas.append('pegar "$T/h-mudo.mp4" %s\n'
                  % " ".join(p[0] for p in planos))
    with open(archivo, "w", encoding="utf-8") as f:
        f.writelines(lineas)
    return tabla, t


def escribir_frases(archivo, colocacion):
    U = mapa_unidades()
    with open(archivo, "w", encoding="utf-8") as f:
        f.write("# uid  desde  hasta  destino   (generado por tiempos.py)\n")
        for uid, destino in colocacion:
            _, desde, hasta, _ = U[uid]
            f.write("%s %6.3f %6.3f %6.2f\n" % (uid, desde, hasta, destino))


def main():
    os.makedirs(GEN, exist_ok=True)
    palabras = cargar_palabras()
    cortes = os.environ.get("CORTES",
                            "/c/Arte y Tierra/Acequia/videoapp-1/cortes")
    if not os.path.isdir(cortes):
        cortes = r"C:\Arte y Tierra\Acequia\videoapp-1\cortes"
    largos = duraciones_cortes(cortes)

    destinos, total = tender(UNIDADES, ARRANQUE)
    # el cierre de marca fija el largo final
    inicio_cierre = destinos["U19"] - 0.60
    total = inicio_cierre + PLACA_FINAL_H / FPS

    tabla, real = escribir_planos(
        os.path.join(GEN, "planos-h.sh"), PLANOS_H, destinos, total, largos,
        PLACA_FINAL_H)

    colocacion_h = [(u[0], destinos[u[0]]) for u in UNIDADES]
    escribir_frases(os.path.join(GEN, "frases-h.txt"), colocacion_h)
    escribir_frases(os.path.join(GEN, "frases-v30.txt"), VOZ_V30)
    escribir_frases(os.path.join(GEN, "frases-v15.txt"), VOZ_V15)

    with open(os.path.join(GEN, "duraciones.sh"), "w", encoding="utf-8") as f:
        f.write("# Generado por tiempos.py\n")
        f.write("DURACION_H=%.2f\n" % real)
        f.write("DURACION_V30=%.2f\n" % DURACION_V30)
        f.write("DURACION_V15=%.2f\n" % DURACION_V15)

    for nombre, colocacion, dur in (("h", colocacion_h, real),
                                    ("v30", VOZ_V30, DURACION_V30),
                                    ("v15", VOZ_V15, DURACION_V15)):
        with open(os.path.join(AQUI, "karaoke-%s.ass" % nombre), "w",
                  encoding="utf-8") as f:
            f.write(karaoke(nombre, colocacion, dur, palabras))

    with open(os.path.join(AQUI, "subtitulos-youtube.srt"), "w",
              encoding="utf-8") as f:
        f.write(srt(colocacion_h, real, palabras))

    print("%-5s %-24s %7s %6s %6s  %s" % (
        "plano", "corte", "entra", "dura", "cuadros", "material"))
    for nombre, fuente, t, dur, n, sobra in tabla:
        print("%-5s %-24s %7.2f %6.2f %6d  %s" % (nombre, fuente, t, dur, n, sobra))
    print()
    hablado = sum((u[2] - u[1]) / VELOCIDAD for u in UNIDADES)
    print("horizontal: %.2f s (%d cuadros), %.1f s hablados = %d %% del video"
          % (real, round(real * FPS), hablado, round(100 * hablado / real)))


if __name__ == "__main__":
    main()
