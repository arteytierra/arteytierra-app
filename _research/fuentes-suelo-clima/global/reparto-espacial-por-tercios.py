# -*- coding: utf-8 -*-
"""Donde adentro del poligono esta cada clase de suelo.

    python -I reparto_espacial.py <carpeta> <eco_id> [clase ...]

Reusa las capas que ya bajo soilgrids-zonal.py en esa carpeta: no pide nada al
WCS. Corta el poligono en tercios de superficie por longitud y por latitud -no
por grados, por superficie, para que los tres tercios pesen igual- y reporta la
fraccion de cada clase en cada tercio. Si no se nombran clases, toma las tres
mas grandes.

Por que existe: el promedio de un poligono grande puede estar hecho de dos
mitades que no se parecen, y el numero del promedio no describe a ninguna de las
dos. Paso en Java y volvio a pasar en el Decan sur, el ECO_ID 298, donde el
vertisol es el 75 % del tercio sur y el 15 % del norte: el 42 % del promedio no
es el suelo de ningun predio. Y tambien sirve para lo contrario, que es lo que
dio el Decan norte: ahi el vertisol esta repartido parejo entre 24 y 48 %, asi
que el promedio si sirve. Las dos respuestas hay que medirlas.

El valor 0 de MostProbable es Acrisols y tambien el relleno sin suelo, y aca se
separan igual que en el zonal: con la capa de Acrisols. Ver el punto 1b del
encabezado de soilgrids-zonal.py.

Fuentes y licencias: las mismas del zonal. RESOLVE Ecoregions 2017 CC BY 4.0 y
SoilGrids v2.0 de ISRIC CC BY 4.0, las dos con uso comercial permitido.
"""
import json
import math
import os
import sys
from collections import Counter

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

GRUPOS = ['Acrisols', 'Albeluvisols', 'Alisols', 'Andosols', 'Arenosols',
          'Calcisols', 'Cambisols', 'Chernozems', 'Cryosols', 'Durisols',
          'Ferralsols', 'Fluvisols', 'Gleysols', 'Gypsisols', 'Histosols',
          'Kastanozems', 'Leptosols', 'Lixisols', 'Luvisols', 'Nitisols',
          'Phaeozems', 'Planosols', 'Plinthosols', 'Podzols', 'Regosols',
          'Solonchaks', 'Solonetz', 'Stagnosols', 'Umbrisols', 'Vertisols']


def geotransform(im):
    tie = im.tag_v2.get(33922)
    escala = im.tag_v2.get(33550)
    if not tie or not escala:
        raise SystemExit('el TIFF no trae tags de georreferencia')
    return float(tie[3]), float(tie[4]), float(escala[0]), float(escala[1])


def segmentos(geojson):
    segs = []
    for f in geojson['features']:
        g = f['geometry']
        polys = (g['coordinates'] if g['type'] == 'MultiPolygon'
                 else [g['coordinates']])
        for p in polys:
            for anillo in p:
                n = len(anillo)
                for i in range(n):
                    x1, y1 = anillo[i][0], anillo[i][1]
                    x2, y2 = anillo[(i + 1) % n][0], anillo[(i + 1) % n][1]
                    if y1 != y2:
                        segs.append((x1, y1, x2, y2))
    return segs


def tramos(lat, segs):
    cr = []
    for x1, y1, x2, y2 in segs:
        if (y1 > lat) != (y2 > lat):
            cr.append(x1 + (lat - y1) * (x2 - x1) / (y2 - y1))
    if len(cr) < 2:
        return []
    cr.sort()
    return [(cr[i], cr[i + 1]) for i in range(0, len(cr) - 1, 2)]


def main(carpeta, eco_id, clases):
    geo = None
    for n in os.listdir(carpeta):
        if n.endswith('.geojson') or n.endswith('.json'):
            geo = json.load(open(os.path.join(carpeta, n), encoding='utf-8'))
            break
    if geo is None:
        raise SystemExit('no encontre la geometria en %s' % carpeta)

    im = Image.open(os.path.join(carpeta, 'MostProbable.tif'))
    mp = list(im.get_flattened_data() if hasattr(im, 'get_flattened_data')
              else im.getdata())
    W, H = im.size
    gx, gy, dx, dy = geotransform(im)
    segs = segmentos(geo)

    # El mapeo valor -> grupo se vuelve a deducir igual que en el zonal, pero
    # alcanza con las clases pedidas: argmax contra las 30 capas en una muestra.
    # El valor 0 es Acrisols Y es nodata: los separa la capa de Acrisols.
    im_ac = Image.open(os.path.join(carpeta, 'Acrisols.tif'))
    ac = list(im_ac.get_flattened_data() if hasattr(im_ac, 'get_flattened_data')
              else im_ac.getdata())
    puntos = []
    for r in range(H):
        lat = gy - (r + 0.5) * dy
        for xa, xb in tramos(lat, segs):
            ca = max(0, int(math.ceil((xa - gx) / dx - 0.5)))
            cb = min(W - 1, int(math.floor((xb - gx) / dx - 0.5)))
            for c in range(ca, cb + 1):
                i = r * W + c
                v = mp[i]
                if v > 0 or ac[i] > 0:
                    puntos.append((c, r, v))
    del ac
    if not puntos:
        raise SystemExit('ningun pixel con dato')

    muestra = {}
    for c, r, v in puntos:
        m = muestra.setdefault(v, [])
        if len(m) < 2000:
            m.append(r * W + c)
    plano = [i for v in sorted(muestra) for i in muestra[v]]
    prob = {}
    for g in GRUPOS:
        im2 = Image.open(os.path.join(carpeta, g + '.tif'))
        d = list(im2.get_flattened_data() if hasattr(im2, 'get_flattened_data')
                 else im2.getdata())
        prob[g] = [d[i] for i in plano]
        del d
    pos = {i: k for k, i in enumerate(plano)}
    nombre = {}
    for v in sorted(muestra):
        gana = Counter()
        for i in muestra[v]:
            k = pos[i]
            gana[max(GRUPOS, key=lambda g: prob[g][k])] += 1
        nombre[v] = gana.most_common(1)[0][0]

    quiero = set(clases) if clases else {
        n for n, _ in Counter(nombre[v] for _, _, v in puntos).most_common(3)}

    lons = sorted(gx + (c + 0.5) * dx for c, _, _ in puntos)
    lats = sorted(gy - (r + 0.5) * dy for _, r, _ in puntos)
    print('ECO_ID %s   %d pixeles con dato' % (eco_id, len(puntos)))
    print('lon %.2f..%.2f   lat %.2f..%.2f'
          % (lons[0], lons[-1], lats[0], lats[-1]))

    for eje, vals, saca in (('longitud', lons, lambda c, r: gx + (c + 0.5) * dx),
                            ('latitud', lats, lambda c, r: gy - (r + 0.5) * dy)):
        q1 = vals[len(vals) // 3]
        q2 = vals[2 * len(vals) // 3]
        cubos = [Counter(), Counter(), Counter()]
        for c, r, v in puntos:
            x = saca(c, r)
            cubos[0 if x < q1 else (1 if x < q2 else 2)][nombre[v]] += 1
        etiq = (['oeste', 'centro', 'este'] if eje == 'longitud'
                else ['sur', 'centro', 'norte'])
        if eje == 'latitud':
            etiq = ['sur', 'centro', 'norte']
        print('\npor %s (tercios de superficie, corte en %.2f y %.2f):'
              % (eje, q1, q2))
        print('  %-14s %10s %10s %10s' % ('clase', etiq[0], etiq[1], etiq[2]))
        for g in sorted(quiero):
            fila = ['%9.1f %%' % (100.0 * cu[g] / max(1, sum(cu.values())))
                    for cu in cubos]
            print('  %-14s %s' % (g, ' '.join(fila)))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3:])
