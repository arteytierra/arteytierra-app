# -*- coding: utf-8 -*-
"""Donde esta de verdad la superficie de una ecorregion de RESOLVE.

    python -I resolve-area-por-parche.py 305
    python -I resolve-area-por-parche.py 305 98.80 2.60 "lago Toba"

Lista los parches de un ECO_ID ordenados por area y, si se le da un punto de
referencia, la distancia de cada uno a ese punto. Sirve para preguntarle a una
ficha si su nombre describe su territorio.

El 22/11/2026 esto resolvio un pendiente de cuatro lotes: la ficha del ECO_ID
305 se llamaba `pinar_toba` y solo el 16 % de su superficie esta a menos de
120 km del lago Toba; el 56 % esta en Aceh, a 286 y 391 km. Cuatro entregas
seguidas del encargo de practicas propusieron practicas del lago, y las cuatro
veces se respondio repitiendo la advertencia en vez de medir el poligono.

El area va por shoelace en grados escalada por el coseno de la latitud media de
cada parche. No es una proyeccion equivalente y no pretende serlo: el objetivo
es el reparto relativo. Como control, en el 305 la suma dio 2.754 km2 contra los
~2.800 que declara la ficha, 1,6 % de diferencia.

LOS HOYOS NO VIENEN ANIDADOS, Y SE RECONOCEN POR LA ORIENTACION. El
FeatureServer devuelve el MultiPolygon con cada anillo como una parte propia:
un hoyo no aparece adentro de su parche sino al lado, y lo unico que lo delata
es que gira al reves. Leerlo ingenuamente suma el hoyo en vez de restarlo. En
el ECO_ID 423, el matorral interior de California, eso daba 164.283 km2 cuando
son 71.308: el polígono es un anillo alrededor del Valle Central y el hoyo mide
46.488 km2, que es exactamente la superficie del 385, el pastizal del valle.
Son 93.000 km2 de diferencia, o sea mas del doble.

Fuente: RESOLVE Ecoregions 2017 (Dinerstein et al.), CC BY 4.0, via el
FeatureServer publico de ArcGIS. Sin API key.
"""
import io
import json
import math
import os
import subprocess
import sys

R = 6371.0088  # km, radio medio
RESOLVE = ('https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services'
           '/Resolve_Ecoregions/FeatureServer/0/query')
# Simplificacion: el FeatureServer corta la respuesta alrededor de los 8 MB y
# devuelve JSON partido al medio sin avisarlo.
OFFSET_GEOM = 0.004
CERCA_KM = 120.0
# Debajo de esto un parche es ruido de la simplificacion -esquirlas de un par
# de vertices en la bahia de San Francisco, por ejemplo- y se cuenta junto.
MINIMO_KM2 = 1.0


def area_firmada(anillo, lat_med):
    """Shoelace CON signo: el signo es la orientacion, y ahi estan los hoyos."""
    s = 0.0
    n = len(anillo)
    for i in range(n):
        x1, y1 = anillo[i][0], anillo[i][1]
        x2, y2 = anillo[(i + 1) % n][0], anillo[(i + 1) % n][1]
        s += x1 * y2 - x2 * y1
    k = (math.pi * R / 180.0) ** 2 * math.cos(math.radians(lat_med))
    return s / 2.0 * k


def en_anillo(x, y, anillo):
    dentro = False
    n = len(anillo)
    j = n - 1
    for i in range(n):
        xi, yi = anillo[i][0], anillo[i][1]
        xj, yj = anillo[j][0], anillo[j][1]
        if (yi > y) != (yj > y):
            if x < xi + (y - yi) * (xj - xi) / (yj - yi):
                dentro = not dentro
        j = i
    return dentro


def dist_km(lon, lat, ref):
    dx = (lon - ref[0]) * math.cos(math.radians((lat + ref[1]) / 2))
    return math.radians(math.hypot(dx, lat - ref[1])) * R


def anillos_de(fs):
    """Todos los anillos, planos, con su area firmada y su centro."""
    out = []
    for f in fs:
        g = f['geometry']
        polys = (g['coordinates'] if g['type'] == 'MultiPolygon'
                 else [g['coordinates']])
        for p in polys:
            for anillo in p:
                lats = [c[1] for c in anillo]
                lons = [c[0] for c in anillo]
                latm, lonm = sum(lats) / len(lats), sum(lons) / len(lons)
                out.append({'xy': anillo, 'a': area_firmada(anillo, latm),
                            'lon': lonm, 'lat': latm})
    return out


def parches_y_hoyos(fs):
    """Separa exteriores de hoyos por orientacion y resta cada hoyo del suyo.

    El anillo mas grande marca cual es la orientacion de los exteriores. Cada
    anillo que gire al reves es un hoyo, y se le descuenta al parche que lo
    contiene -probado con un vertice del hoyo-; si no lo contiene ninguno, se
    descuenta del total igual, porque superficie que no es de la ecorregion no
    deja de serlo porque el anidado venga roto.
    """
    todos = anillos_de(fs)
    if not todos:
        return [], 0.0
    signo = 1.0 if max(todos, key=lambda r: abs(r['a']))['a'] >= 0 else -1.0
    ext = [r for r in todos if r['a'] * signo > 0]
    hoy = [r for r in todos if r['a'] * signo <= 0]
    for r in ext:
        r['neto'] = abs(r['a'])
    huerfano = 0.0
    for h in hoy:
        x, y = h['xy'][0][0], h['xy'][0][1]
        dentro = [r for r in ext if en_anillo(x, y, r['xy'])]
        if dentro:
            min(dentro, key=lambda r: abs(r['a']))['neto'] -= abs(h['a'])
        else:
            huerfano += abs(h['a'])
    return ext, huerfano


def main(eco_id, ref=None, ref_nombre='la referencia'):
    dest = 'eco_%s_geom.json' % eco_id
    if not (os.path.exists(dest) and os.path.getsize(dest) > 500):
        url = ('%s?f=geojson&where=ECO_ID%%3D%s&outFields=ECO_ID,ECO_NAME'
               '&returnGeometry=true&outSR=4326&maxAllowableOffset=%s'
               % (RESOLVE, eco_id, OFFSET_GEOM))
        subprocess.run(['curl', '-s', '-A', 'acequia-verificacion/1.0',
                        '--max-time', '180', url, '-o', dest],
                       capture_output=True)
    try:
        d = json.load(io.open(dest, encoding='utf-8'))
    except ValueError:
        raise SystemExit('RESOLVE devolvio JSON invalido (%d bytes). Subi '
                         'OFFSET_GEOM y borra %s.'
                         % (os.path.getsize(dest), dest))
    fs = d.get('features') or []
    if not fs:
        raise SystemExit('RESOLVE no devolvio el ECO_ID %s' % eco_id)

    ext, huerfano = parches_y_hoyos(fs)
    bruto = sum(abs(r['a']) for r in ext)
    filas = sorted(((r['neto'], r['lon'], r['lat']) for r in ext),
                   key=lambda r: -r[0])
    tot = sum(r[0] for r in filas) - huerfano
    chicos = [r for r in filas if r[0] < MINIMO_KM2]
    filas = [r for r in filas if r[0] >= MINIMO_KM2]

    out = []
    w = out.append
    w('ECO_ID %s  %s' % (eco_id, fs[0]['properties'].get('ECO_NAME', '?')))
    w('%d parche(s), %.0f km2 en total' % (len(filas) + len(chicos), tot))
    if bruto - tot > 0.01 * bruto:
        w('(los hoyos descuentan %.0f km2: sin restarlos daria %.0f)'
          % (bruto - tot, bruto))
    w('')
    cab = '%8s %6s   %-22s' % ('km2', '%', 'centro')
    w(cab + ('   a km de %s' % ref_nombre if ref else ''))
    for a, lonm, latm in filas:
        linea = '%8.0f %5.1f%%   %8.3f E %7.3f %-2s' % (
            a, 100 * a / tot, lonm, abs(latm), 'N' if latm >= 0 else 'S')
        if ref:
            linea += '   %6.0f km' % dist_km(lonm, latm, ref)
        w(linea)
    if chicos:
        w('%8.0f %5.1f%%   (%d parches de menos de %.0f km2)'
          % (sum(r[0] for r in chicos), 100 * sum(r[0] for r in chicos) / tot,
             len(chicos), MINIMO_KM2))
    if ref:
        cerca = sum(a for a, lo, la in filas if dist_km(lo, la, ref) < CERCA_KM)
        w('')
        w('superficie a menos de %.0f km de %s: %.0f km2 = %.0f %%'
          % (CERCA_KM, ref_nombre, cerca, 100 * cerca / tot))
    sur = sum(a for a, lo, la in filas if la < 0)
    if 0 < sur < tot:
        w('superficie al sur del ecuador: %.0f km2 = %.0f %%'
          % (sur, 100 * sur / tot))

    txt = '\n'.join(out)
    io.open('areas_%s.txt' % eco_id, 'w', encoding='utf-8',
            newline='\n').write(txt)
    print(txt)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit('uso: python -I resolve-area-por-parche.py <ECO_ID> '
                         '[lon_ref lat_ref "nombre"]')
    if len(sys.argv) >= 4:
        main(sys.argv[1], (float(sys.argv[2]), float(sys.argv[3])),
             sys.argv[4] if len(sys.argv) > 4 else 'la referencia')
    else:
        main(sys.argv[1])
