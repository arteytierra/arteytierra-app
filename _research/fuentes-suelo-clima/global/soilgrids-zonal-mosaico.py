# -*- coding: utf-8 -*-
"""Resumen zonal de SoilGrids WRB por MOSAICO, para los poligonos grandes.

    python -I soilgrids-zonal-mosaico.py 42 ./salida

`soilgrids-zonal.py`, al lado de este archivo, corta con error cuando el bbox
necesitaria reducirse mas de 2x, porque arriba de 2x el WCS sirve de una
piramide promediada y el promedio de dos codigos de leyenda es un tercer codigo
-una clase que no esta ahi-. El miombo seco de Zambeze (ECO_ID 42) pide 4,4x:
su bbox son 22,9 x 22,4 grados, 10.978 x 10.744 pixeles, 118 Mpx por capa.

Este script lo mide sin submuestrear nada. Comparte con el otro el metodo
-geometria, recorte por scanline, deduccion del mapeo, el valor 0 que es
Acrisols y es nodata- y lo importa en vez de copiarlo, para que el mapeo, los
grupos de la regla y la escalera de reintentos tengan un solo lugar donde
vivir.

Las cuatro cosas que agrega:

1. **Tiles alineados a la grilla, medido y no supuesto.** El WCS devuelve una
   grilla anclada EXACTAMENTE al x0 y al y1 pedidos -verificado: pedidos dos
   cuadrados contiguos de 100 px en multiplos de 1/480 de grado, los origenes
   salen separados 100,000000 px- y el paso real es 1/480 = 0,00208333..., no
   el 0,002083 redondeado, cuyo error acumulado a lo largo de 10.978 columnas
   son casi dos pixeles. Entonces, pidiendo los bordes en multiplos exactos del
   paso, los tiles empalman sin solape y sin hueco, y la union de sus grillas
   es la grilla global. El script igual lo **verifica tile por tile** contra el
   tamanio y el origen esperados: una grilla corrida contaria pixeles dos veces
   o se los saltearia, y el total seguiria pareciendo razonable.

2. **No baja los tiles vacios.** El scanline se corre UNA vez sobre la grilla
   global -22,4 grados son 10.744 filas- y de ahi sale, por fila, en que
   columnas esta el poligono. Un tile sin ninguna fila adentro no se pide.

3. **La deduccion del mapeo va aparte, en ventanas de un grado.** El mapeo
   valor -> clase es global, asi que no hace falta bajar las 30 capas de
   probabilidad sobre los 118 Mpx: alcanza con ventanas donde esten todos los
   valores presentes. Las ventanas no se eligen a dedo, se eligen con el
   conteo del mosaico: se tallan los valores celda por celda y despues una
   cobertura codiciosa agarra las menos celdas que juntan todos los valores con
   muestra suficiente. Lo que NO se hace es suponer el mapeo: un valor que no
   llega a unanimidad queda sin nombre y afuera de la fraccion, igual que en el
   otro script.

4. **La superficie se pesa por el coseno de cada fila**, no por el del centro
   del bbox: 22 grados de latitud son un 8 % de diferencia en el ancho del
   pixel entre el borde norte y el sur. Sirve de control independiente, porque
   la superficie del poligono recortado tiene que dar lo que la ficha cita de
   su primario.

Requiere curl y Pillow. No requiere GDAL ni rasterio.

Licencias: RESOLVE Ecoregions 2017 (Dinerstein et al. 2017) CC BY 4.0;
SoilGrids v2.0 (ISRIC) CC BY 4.0. Las dos permiten uso comercial.
"""
import importlib.util
import io
import json
import math
import os
import sys
from collections import Counter

AQUI = os.path.dirname(os.path.abspath(__file__))

# Cargar el otro script deja un __pycache__ al lado, o sea basura adentro del
# repositorio. Esto es una herramienta de relevamiento que corre una vez por
# poligono: el bytecode no ahorra nada.
sys.dont_write_bytecode = True

# El metodo vive en el otro archivo y se importa por ruta: `python -I` saca el
# directorio del script de sys.path, y el nombre tiene guiones, asi que un
# import normal no lo encuentra. Asi no hay dos copias del mapeo ni de la regla.
_ruta = os.path.join(AQUI, 'soilgrids-zonal.py')
_spec = importlib.util.spec_from_file_location('zonal_base', _ruta)
Z = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(Z)

# Paso exacto de la grilla del WCS en grados.
PASO = 1.0 / 480.0
# Lado del tile en pixeles. 2400 x 2400 son 5,76 Mpx, abajo del tope de 6 Mpx
# por capa que ya usaba el otro script.
LADO_TILE = 2400
# Lado de la ventana de deduccion, en pixeles: 480 px = 1 grado.
LADO_VENTANA = 480
# Muestras por valor que se buscan para la deduccion. El argmax salio unanime
# al 100 % en nueve poligonos de cuatro continentes, asi que 200 alcanzan;
# subirlo solo agrega ventanas.
OBJETIVO_MUESTRA = 200
# Tope de ventanas de la primera vuelta. Cada una son 31 pedidos, asi que esto
# acota el trafico contra un servidor que ya se sabe intermitente.
TOPE_VENTANAS = 8
# Vueltas extra para los valores que quedaron sin ninguna muestra. Pasa cuando
# todos los ceros de las ventanas elegidas resultaron nodata y no Acrisols.
VUELTAS_EXTRA = 2
# Kilometros por grado de latitud. Esferico alcanza: la diferencia con el
# elipsoide es de milesimas y esto se compara contra una cifra publicada.
KM_POR_GRADO = 111.32
# El rango valido de MostProbable: 30 grupos de referencia, base 0. Un valor
# afuera de ahi es la senial de que algo promedio codigos de leyenda.
VALOR_MAX = len(Z.GRUPOS) - 1


def snap_abajo(v):
    return math.floor(v / PASO) * PASO


def snap_arriba(v):
    return math.ceil(v / PASO) * PASO


def area_fila(r, n, Y1):
    """km2 de n pixeles en la fila r. El ancho del pixel se achica con la lat."""
    lat = Y1 - (r + 0.5) * PASO
    return n * (PASO * KM_POR_GRADO) * (PASO * KM_POR_GRADO
                                        * math.cos(math.radians(lat)))


def filas_del_poligono(geo, X0, Y1, W, H):
    """Para cada fila de la grilla global, los rangos de columna adentro.

    Es el mismo recorte por scanline del otro script -su `tramos`, que es la
    funcion verificada contra el poligono 264 pixel por pixel-, corrido una
    sola vez sobre la grilla entera en vez de una vez por tile.
    """
    segs = Z.segmentos(geo)
    filas = {}
    area = 0.0
    adentro = 0
    for r in range(H):
        lat = Y1 - (r + 0.5) * PASO
        rangos = []
        n = 0
        for xa, xb in Z.tramos(lat, segs):
            ca = max(0, int(math.ceil((xa - X0) / PASO - 0.5)))
            cb = min(W - 1, int(math.floor((xb - X0) / PASO - 0.5)))
            if cb >= ca:
                rangos.append((ca, cb))
                n += cb - ca + 1
        if rangos:
            filas[r] = rangos
            adentro += n
            area += area_fila(r, n, Y1)
    return filas, len(segs), adentro, area


def pedir(carpeta, cov, X0, Y1, c0, c1, r0, r1):
    """Baja una capa sobre la ventana [c0,c1) x [r0,r1) de la grilla global.

    Devuelve (imagen, datos) ya verificados contra el tamanio y el origen que
    la grilla global predice. Si no coinciden, corta: una grilla corrida medio
    pixel contaria dos veces el borde o se lo saltearia.
    """
    x0, x1 = X0 + c0 * PASO, X0 + c1 * PASO
    y1, y0 = Y1 - r0 * PASO, Y1 - r1 * PASO
    # El tamanio va en el nombre porque una ventana de deduccion y un tile
    # pueden arrancar en la misma columna y fila: sin eso el cache devolveria
    # el tile de 2400 cuando se pide la ventana de 480.
    dest = os.path.join(carpeta, '%s_c%05d_r%05d_%dx%d.tif'
                        % (cov, c0, r0, c1 - c0, r1 - r0))
    url = ('%s&COVERAGEID=%s&SUBSET=X(%.8f,%.8f)&SUBSET=Y(%.8f,%.8f)'
           % (Z.WCS, cov, x0, x1, y0, y1))
    cod = Z.bajar(url, dest, tiff=True)
    if cod not in ('200', 'cache'):
        raise SystemExit('SoilGrids no entrego %s en c%d r%d: %s'
                         % (cov, c0, r0, cod))
    im, d = Z.datos(dest)
    esperado = (c1 - c0, r1 - r0)
    if im.size != esperado:
        raise SystemExit('%s c%d r%d: vino %s y la grilla global pide %s'
                         % (cov, c0, r0, im.size, esperado))
    gx, gy, dx, dy = Z.geotransform(im)
    if abs((gx - x0) / dx) > 0.01 or abs((gy - y1) / dy) > 0.01:
        raise SystemExit(
            '%s c%d r%d: el origen vino en %.8f,%.8f y se pidio %.8f,%.8f '
            '(%.3f x %.3f pixeles de corrimiento). Los tiles no comparten '
            'grilla y el mosaico contaria pixeles dos veces.'
            % (cov, c0, r0, gx, gy, x0, y1, (gx - x0) / dx, (gy - y1) / dy))
    return im, d


def contar_tile(d, filas, c0, c1, r0, r1, cuenta, por_celda, ceros, Y1):
    """Cuenta los pixeles del tile que estan adentro del poligono.

    `cuenta` es el total por valor; `por_celda` talla lo mismo por ventana de
    un grado, que es lo que despues elige las ventanas de deduccion; `ceros`
    junta los indices planos del tile donde el valor es 0, que hay que separar
    con la capa de Acrisols.
    """
    ancho = c1 - c0
    adentro = 0
    for r in range(r0, r1):
        rangos = filas.get(r)
        if not rangos:
            continue
        base = (r - r0) * ancho
        fcel = r // LADO_VENTANA
        for ca, cb in rangos:
            a, b = max(ca, c0), min(cb, c1 - 1)
            if b < a:
                continue
            adentro += b - a + 1
            # El tramo se parte en los bordes de las celdas de un grado para
            # tallar las dos cosas en la misma pasada.
            x = a
            while x <= b:
                ccel = x // LADO_VENTANA
                fin = min(b, (ccel + 1) * LADO_VENTANA - 1)
                i0, i1 = base + (x - c0), base + (fin - c0) + 1
                seg = d[i0:i1]
                cuenta.update(seg)
                por_celda.setdefault((ccel, fcel), Counter()).update(seg)
                if seg.count(0):
                    s = i0
                    while True:
                        try:
                            k = d.index(0, s, i1)
                        except ValueError:
                            break
                        ceros.append(k)
                        s = k + 1
                x = fin + 1
    return adentro


def elegir_ventanas(por_celda, falta, usadas):
    """Cobertura codiciosa: las menos celdas que juntan todos los valores.

    Se prefiere la celda que mas valores todavia flacos aporta, y entre
    empates la que mas pixeles tiene. No es optima -la cobertura de conjuntos
    no lo es en tiempo polinomico- y no hace falta que lo sea: lo que importa
    es que cada valor presente llegue con muestra a la deduccion.
    """
    falta = dict(falta)
    elegidas = []
    while falta and len(elegidas) < TOPE_VENTANAS:
        mejor, puntaje = None, (0, 0)
        for celda, c in por_celda.items():
            if celda in usadas or celda in elegidas:
                continue
            aporta = sum(1 for v in falta if c.get(v, 0) > 0)
            p = (aporta, sum(c.values()))
            if p > puntaje:
                mejor, puntaje = celda, p
        if mejor is None or puntaje[0] == 0:
            break
        elegidas.append(mejor)
        c = por_celda[mejor]
        for v in list(falta):
            if c.get(v, 0) > 0:
                falta[v] -= min(falta[v], c[v])
                if falta[v] <= 0:
                    del falta[v]
    return elegidas, falta


def deducir(carpeta, X0, Y1, W, H, filas, celdas, valores, votos, hechas):
    """El mapeo valor -> grupo WRB, por argmax contra las 30 capas.

    Mismo criterio que el otro script: se vota pixel por pixel cual de los 30
    grupos maximiza la probabilidad ahi, y si la votacion no es unanime el
    valor queda sin nombre. La diferencia es que las capas se bajan sobre
    ventanas de un grado y no sobre el bbox entero.
    """
    for n, (ci, ri) in enumerate(celdas, 1):
        c0, c1 = ci * LADO_VENTANA, min(W, (ci + 1) * LADO_VENTANA)
        r0, r1 = ri * LADO_VENTANA, min(H, (ri + 1) * LADO_VENTANA)
        print('   ventana %d/%d  celda %d,%d  (%dx%d px)'
              % (n, len(celdas), ci, ri, c1 - c0, r1 - r0), flush=True)
        _, mp = pedir(carpeta, 'MostProbable', X0, Y1, c0, c1, r0, r1)
        ancho = c1 - c0

        # Lo que cada valor ya tiene votado de las ventanas anteriores. Es
        # constante mientras se muestrea esta ventana, asi que se saca una vez
        # y no una vez por pixel.
        llenos = {v for v in valores if sum(votos[v].values()) >= Z.TOPE_MUESTRA}
        buscados = valores - llenos
        muestras = {}
        for r in range(r0, r1):
            for ca, cb in filas.get(r, []):
                a, b = max(ca, c0), min(cb, c1 - 1)
                base = (r - r0) * ancho
                for x in range(a, b + 1):
                    i = base + (x - c0)
                    v = mp[i]
                    if v not in buscados:
                        continue
                    m = muestras.setdefault(v, [])
                    if len(m) < OBJETIVO_MUESTRA * 4:
                        m.append(i)
        del mp
        if not muestras:
            hechas.add((ci, ri))
            continue
        plano = [i for v in sorted(muestras) for i in muestras[v]]
        prob = {}
        for g in Z.GRUPOS:
            _, d = pedir(carpeta, g, X0, Y1, c0, c1, r0, r1)
            prob[g] = [d[i] for i in plano]
            del d
        pos = {i: k for k, i in enumerate(plano)}
        for v, idxs in muestras.items():
            for i in idxs:
                k = pos[i]
                ganador = max(Z.GRUPOS, key=lambda g: prob[g][k])
                # El valor 0 es Acrisols Y es nodata: si las 30 probabilidades
                # valen 0 ahi no hay dato y el argmax no significa nada.
                if prob[ganador][k] <= 0:
                    continue
                votos[v][ganador] += 1
        hechas.add((ci, ri))
        print('      votos: %s' % ', '.join(
            '%d:%d' % (v, sum(votos[v].values())) for v in sorted(valores)),
            flush=True)


def main(eco_id, carpeta, lado_tile=LADO_TILE):
    os.makedirs(carpeta, exist_ok=True)
    geo, nombre, (x0b, x1b, y0b, y1b) = Z.geometria(eco_id, carpeta)
    X0, X1 = snap_abajo(x0b), snap_arriba(x1b)
    Y0, Y1 = snap_abajo(y0b), snap_arriba(y1b)
    W, H = int(round((X1 - X0) / PASO)), int(round((Y1 - Y0) / PASO))
    print('ECO_ID %s  %s' % (eco_id, nombre))
    print('bbox lon %.4f..%.4f  lat %.4f..%.4f' % (X0, X1, Y0, Y1))
    print('grilla global %d x %d = %.0f Mpx por capa, pixel %.0f m'
          % (W, H, W * H / 1e6, PASO * KM_POR_GRADO * 1000), flush=True)

    filas, n_segs, adentro_geom, area_km2 = filas_del_poligono(geo, X0, Y1, W, H)
    print('scanline: %d filas con poligono de %d (%d segmentos), %d px adentro,'
          ' %.0f km2' % (len(filas), H, n_segs, adentro_geom, area_km2),
          flush=True)

    # Plan de tiles: los que no tienen ninguna fila adentro no se piden.
    nx = int(math.ceil(W / float(lado_tile)))
    ny = int(math.ceil(H / float(lado_tile)))
    plan = []
    for tj in range(ny):
        r0, r1 = tj * lado_tile, min(H, (tj + 1) * lado_tile)
        for ti in range(nx):
            c0, c1 = ti * lado_tile, min(W, (ti + 1) * lado_tile)
            hay = any(
                any(max(ca, c0) <= min(cb, c1 - 1) for ca, cb in filas[r])
                for r in range(r0, r1) if r in filas)
            if hay:
                plan.append((c0, c1, r0, r1))
    print('tiles: %d de %d x %d = %d tienen poligono adentro'
          % (len(plan), nx, ny, nx * ny), flush=True)

    cuenta = Counter()
    por_celda = {}
    adentro_total = 0
    ceros_acrisols = 0
    ceros_nodata = 0
    for n, (c0, c1, r0, r1) in enumerate(plan, 1):
        print('   tile %d/%d  c%d..%d  r%d..%d' % (n, len(plan), c0, c1, r0, r1),
              flush=True)
        _, mp = pedir(carpeta, 'MostProbable', X0, Y1, c0, c1, r0, r1)
        ceros = []
        adentro_total += contar_tile(mp, filas, c0, c1, r0, r1, cuenta,
                                     por_celda, ceros, Y1)
        del mp
        if ceros:
            # La capa de Acrisols sobre el mismo tile es la unica prueba que
            # separa el 0-Acrisols del 0-nodata.
            _, ac = pedir(carpeta, 'Acrisols', X0, Y1, c0, c1, r0, r1)
            con = sum(1 for i in ceros if ac[i] > 0)
            ceros_acrisols += con
            ceros_nodata += len(ceros) - con
            del ac
        print('      acumulado: %d px adentro, %d valores, 0 -> %d acrisols / '
              '%d sin dato' % (adentro_total, len(cuenta), ceros_acrisols,
                               ceros_nodata), flush=True)

    if adentro_total != adentro_geom:
        raise SystemExit(
            'el mosaico recorrio %d pixeles y el scanline global decia %d: los '
            'tiles no cubren el poligono entero' % (adentro_total, adentro_geom))

    # El valor 0 que resulto nodata sale de la cuenta; el que resulto Acrisols
    # se queda como valor 0 y entra a la deduccion como cualquier otro.
    if 0 in cuenta:
        if ceros_acrisols:
            cuenta[0] = ceros_acrisols
        else:
            del cuenta[0]
            for celda in por_celda.values():
                if 0 in celda:
                    del celda[0]
    fuera_de_rango = sorted(v for v in cuenta if v < 0 or v > VALOR_MAX)
    cuenta = Counter({v: n for v, n in cuenta.items()
                      if 0 <= v <= VALOR_MAX and n > 0})
    total_validos = sum(cuenta.values())
    if total_validos == 0:
        raise SystemExit('ningun pixel con dato adentro del poligono')
    print('mosaico listo: %d px adentro, %d con dato, %d sin dato'
          % (adentro_total, total_validos, adentro_total - total_validos),
          flush=True)

    valores = set(cuenta)
    votos = {v: Counter() for v in valores}
    hechas = set()
    celdas, falta = elegir_ventanas(por_celda,
                                    {v: OBJETIVO_MUESTRA for v in valores},
                                    hechas)
    print('deduccion del mapeo en %d ventanas de un grado%s'
          % (len(celdas),
             '' if not falta else '  (ojo: muestra flaca para %s)'
             % ', '.join(str(v) for v in sorted(falta))), flush=True)
    deducir(carpeta, X0, Y1, W, H, filas, celdas, valores, votos, hechas)

    # Los valores que quedaron sin ninguna muestra -tipicamente el 0, cuando
    # todos sus pixeles en esas ventanas resultaron nodata- piden otra vuelta
    # en las celdas que mas de ese valor tienen.
    for _ in range(VUELTAS_EXTRA):
        huerfanos = [v for v in valores if not votos[v]]
        if not huerfanos:
            break
        extra, _ = elegir_ventanas(por_celda,
                                   {v: OBJETIVO_MUESTRA for v in huerfanos},
                                   hechas)
        if not extra:
            break
        print('vuelta extra por %s en %d ventanas'
              % (', '.join(str(v) for v in huerfanos), len(extra)), flush=True)
        deducir(carpeta, X0, Y1, W, H, filas, extra, valores, votos, hechas)

    nombre_de, acuerdo, n_muestra = {}, {}, {}
    for v in sorted(valores):
        if not votos[v]:
            nombre_de[v], acuerdo[v], n_muestra[v] = '??? (sin muestra)', 0.0, 0
            continue
        top, n = votos[v].most_common(1)[0]
        tot = sum(votos[v].values())
        acuerdo[v], n_muestra[v] = n / tot, tot
        nombre_de[v] = top if acuerdo[v] >= 0.999 else '??? (%s?)' % top

    # La superficie con dato se prorratea: el nodata esta repartido y pesarlo
    # fila por fila pediria guardar el conteo valido de cada fila.
    area_dato = area_km2 * total_validos / float(adentro_total)

    out = []
    w = out.append
    w('=== ECO_ID %s - %s (por mosaico) ===' % (eco_id, nombre))
    w('grilla %d x %d a resolucion nativa, pixel %.8f grados (%.0f m)'
      % (W, H, PASO, PASO * KM_POR_GRADO * 1000))
    w('%d tiles de hasta %d x %d px, sin submuestreo; %d ventanas de un grado '
      'para el mapeo' % (len(plan), lado_tile, lado_tile, len(hechas)))
    w('pixeles dentro del poligono: %d   con dato: %d   sin dato: %d'
      % (adentro_total, total_validos, adentro_total - total_validos))
    w('superficie del poligono recortado: %.0f km2 = %.2f Mha '
      '(con dato: %.0f km2)' % (area_km2, area_km2 / 10000.0, area_dato))
    w('el valor 0 se separo con la capa de Acrisols: %d Acrisols, %d sin dato'
      % (ceros_acrisols, ceros_nodata))
    if fuera_de_rango:
        w('ATENCION: valores fuera de 0..%d, que no son grupos de la WRB: %s'
          % (VALOR_MAX, ', '.join(str(v) for v in fuera_de_rango)))
    w('')
    w('mapeo deducido valor -> grupo (unanimidad del argmax, n muestras):')
    for v in sorted(valores):
        w('  %3d -> %-16s %.1f %%  (n=%d)'
          % (v, nombre_de[v], acuerdo[v] * 100, n_muestra[v]))
    w('')
    w('reparto de la superficie:')
    for v, n in cuenta.most_common():
        w('  %-16s %5.1f %%  (%d px, %.0f km2)'
          % (nombre_de[v], 100.0 * n / total_validos, n,
             area_dato * n / total_validos))
    w('')
    lix = sum(n for v, n in cuenta.items() if nombre_de[v] in Z.LIXIVIADOS)
    frac = lix / total_validos
    w('fraccion lixiviada/acida (grupo A): %.1f %%' % (frac * 100))
    w('  -25 x %.4f = %.2f  ->  redondeado a 5: %d'
      % (frac, -25 * frac, round(-25 * frac / 5) * 5))
    w('  suman: %s' % (', '.join(sorted(
        {nombre_de[v] for v in cuenta if nombre_de[v] in Z.LIXIVIADOS}))
        or '(ninguno)'))
    w('')
    gb = sum(n for v, n in cuenta.items()
             if nombre_de[v] in Z.LIXIVIADOS or nombre_de[v] in Z.SALINOS_Y_TURBA)
    fb = gb / total_validos
    w('fraccion del grupo B (lo anterior + turba y salinos): %.1f %%'
      % (fb * 100))
    w('  -25 x %.4f = %.2f  ->  redondeado a 5: %d'
      % (fb, -25 * fb, round(-25 * fb / 5) * 5))
    w('  suman ademas: %s' % (', '.join(sorted(
        {nombre_de[v] for v in cuenta if nombre_de[v] in Z.SALINOS_Y_TURBA}))
        or '(ninguno)'))
    w('  PISO y no total: los tionicos son un cualificador de la WRB, no un')
    w('  grupo, y MostProbable no los distingue.')
    dudosos = [v for v in cuenta if acuerdo[v] < 0.999]
    if dudosos:
        w('')
        w('ATENCION: %d valores sin identificacion unanime (%s). No entran a '
          'la fraccion y hay que resolverlos antes de usar este resultado.'
          % (len(dudosos), ', '.join(str(v) for v in sorted(dudosos))))

    # El sufijo distingue las corridas de control, que usan otro lado de tile.
    sufijo = '' if lado_tile == LADO_TILE else '_t%d' % lado_tile
    txt = '\n'.join(out)
    io.open(os.path.join(carpeta, 'zonal_%s_mosaico%s.txt' % (eco_id, sufijo)),
            'w', encoding='utf-8', newline='\n').write(txt)
    json.dump({'cuenta': {str(v): n for v, n in cuenta.items()},
               'nombre_de': {str(v): nombre_de[v] for v in sorted(valores)},
               'acuerdo': {str(v): acuerdo[v] for v in sorted(valores)},
               'n_muestra': {str(v): n_muestra[v] for v in sorted(valores)},
               'ceros': [ceros_acrisols, ceros_nodata],
               'area_km2': area_km2, 'area_dato_km2': area_dato,
               'px_adentro': adentro_total, 'px_con_dato': total_validos,
               'ventanas': [list(c) for c in sorted(hechas)]},
              io.open(os.path.join(carpeta, 'zonal_%s_mosaico%s.json'
                                   % (eco_id, sufijo)), 'w', encoding='utf-8'),
              indent=1)
    print(txt)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(
            'uso: python -I soilgrids-zonal-mosaico.py <ECO_ID> <carpeta> '
            '[lado_tile]\n'
            'El lado del tile es para el control: el mismo poligono con dos '
            'lados distintos tiene que dar el mismo conteo pixel por pixel.')
    main(sys.argv[1], sys.argv[2],
         int(sys.argv[3]) if len(sys.argv) > 3 else LADO_TILE)
