# -*- coding: utf-8 -*-
"""Resumen zonal de SoilGrids WRB contra un poligono de RESOLVE 2017.

    python -I soilgrids-zonal.py 229 ./salida

Trae la geometria del ECO_ID desde el FeatureServer publico de RESOLVE, baja del
WCS de SoilGrids las 31 capas WRB sobre el bbox, recorta al poligono y reporta
el reparto de clases mas la fraccion lixiviada/acida que pide la regla de
acequia.

Las dos decisiones de metodo estan explicadas en
`soilgrids-zonal-por-poligono.md`, al lado de este archivo. En resumen:

1. El mapeo valor -> clase WRB de `MostProbable` NO esta publicado y NO se
   supone: se deduce. `MostProbable` es por definicion el argmax de las 30
   capas de probabilidad, asi que para cada valor presente se busca que grupo
   lo maximiza. Si la unanimidad no es total el valor queda sin nombre y se
   reporta, en vez de recibir el grupo plausible.
2. Se recorta al poligono y no al bbox. En Java occidental el recorte duplica
   los andosoles y baja los ferralsoles a un cuarto: sin recorte el numero no
   sirve.

Dos limites que aparecieron al correrlo sobre los diez poligonos del backlog y
que el script ya maneja:

3. **La geometria se pide simplificada.** El FeatureServer corta la respuesta
   alrededor de los 8 MB y devuelve JSON partido al medio, sin avisarlo por
   `exceededTransferLimit`: el miombo seco y el matorral del Decan no entran
   enteros. Con `maxAllowableOffset` el servidor simplifica antes de
   serializar, y 0,004 grados -unos 450 m, dos pixeles del raster- deja el
   borde con un error de un par de pixeles sobre poligonos de millones de
   hectareas. De paso acelera el recorte, que es O(vertices) por pixel.

4. **El raster se submuestrea cuando no cabe.** El bbox del miombo seco pide
   118 Mpx por capa, o sea unos 3.700 Mpx entre las 31. Arriba de TOPE_MPX se
   pide con `SCALESIZE`, y eso **esta verificado que no interpola**: pedido el
   mismo cuadrado nativo y reducido a la mitad, los dos devuelven el mismo
   conjunto de valores -{0, 10, 17}, no aparece ningun 11..16- y las
   fracciones coinciden a 0,1 punto (87,4 % contra 87,5 %). Un bilineal sobre
   datos categoricos habria promediado codigos de leyenda y producido clases
   que no existen. El reporte dice siempre a que resolucion efectiva se midio.

Requiere curl y Pillow. No requiere GDAL ni rasterio.

Licencias: RESOLVE Ecoregions 2017 (Dinerstein et al. 2017) CC BY 4.0;
SoilGrids v2.0 (ISRIC) CC BY 4.0. Las dos permiten uso comercial.
"""
import io
import json
import os
import subprocess
import sys
from collections import Counter

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

RESOLVE = ('https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services'
           '/Resolve_Ecoregions/FeatureServer/0/query')
WCS = ('https://maps.isric.org/mapserv?map=/map/wrb.map&SERVICE=WCS'
       '&VERSION=2.0.1&REQUEST=GetCoverage&FORMAT=image/tiff'
       '&SUBSETTINGCRS=http://www.opengis.net/def/crs/EPSG/0/4326'
       '&OUTPUTCRS=http://www.opengis.net/def/crs/EPSG/0/4326')
UA = 'acequia-verificacion/1.0'

# Simplificacion de la geometria: ~450 m, dos pixeles del raster.
OFFSET_GEOM = 0.004
# Tope de pixeles por capa. Arriba de esto se pide con SCALESIZE.
TOPE_MPX = 6.0
# Grados por pixel de la grilla nativa del WCS de SoilGrids.
PX_NATIVO = 0.002083

GRUPOS = [
    'Acrisols', 'Albeluvisols', 'Alisols', 'Andosols', 'Arenosols', 'Calcisols',
    'Cambisols', 'Chernozems', 'Cryosols', 'Durisols', 'Ferralsols', 'Fluvisols',
    'Gleysols', 'Gypsisols', 'Histosols', 'Kastanozems', 'Leptosols', 'Lixisols',
    'Luvisols', 'Nitisols', 'Phaeozems', 'Planosols', 'Plinthosols', 'Podzols',
    'Regosols', 'Solonchaks', 'Solonetz', 'Stagnosols', 'Umbrisols', 'Vertisols',
]

# El grupo A de la regla de acequia -lixiviados y acidos-, que es la fraccion
# que entra en `valor = -25 x fraccion con limitante severa, redondeado a 5`.
# Ver _research/ecosistemas-saberes-indomalaya/README.md.
LIXIVIADOS = {'Acrisols', 'Alisols', 'Ferralsols', 'Lixisols', 'Plinthosols',
              'Podzols'}

# El grupo B suma a los de arriba la turba y los salinos o sodicos. Falta una
# parte y hay que decirlo: los tionicos -suelos sulfatados acidos- son un
# cualificador de la WRB y no un grupo de referencia, asi que MostProbable no
# los puede distinguir. Donde importan -turberas con material sulfidico debajo,
# manglares- este script da un piso, no la fraccion completa.
SALINOS_Y_TURBA = {'Histosols', 'Solonchaks', 'Solonetz'}


def bajar(url, destino, timeout='180'):
    if os.path.exists(destino) and os.path.getsize(destino) > 2000:
        return 'cache'
    r = subprocess.run(
        ['curl', '-s', '-A', UA, '--max-time', timeout, url, '-o', destino,
         '-w', '%{http_code}'], capture_output=True, text=True)
    return r.stdout.strip()


def geometria(eco_id, carpeta):
    dest = os.path.join(carpeta, 'eco_%s.geojson' % eco_id)
    url = ('%s?f=geojson&where=ECO_ID%%3D%s&outFields=ECO_ID,ECO_NAME'
           '&returnGeometry=true&outSR=4326&maxAllowableOffset=%s'
           % (RESOLVE, eco_id, OFFSET_GEOM))
    cod = bajar(url, dest, '180')
    try:
        d = json.load(io.open(dest, encoding='utf-8'))
    except ValueError:
        # Pasa cuando la respuesta se corto por tamanio: JSON partido al medio.
        raise SystemExit(
            'RESOLVE devolvio JSON invalido para el ECO_ID %s (%d bytes, HTTP '
            '%s). Subi OFFSET_GEOM y borra %s.'
            % (eco_id, os.path.getsize(dest), cod, dest))
    fs = d.get('features') or []
    if not fs:
        raise SystemExit('RESOLVE no devolvio el ECO_ID %s (HTTP %s)' % (eco_id, cod))
    # Un truncamiento silencioso daria un poligono incompleto y un zonal
    # plausible y equivocado: se corta aca.
    if d.get('properties', {}).get('exceededTransferLimit'):
        raise SystemExit('RESOLVE trunco la geometria: pedila por partes')
    nombre = fs[0]['properties'].get('ECO_NAME', '?')
    xs, ys = [], []

    def walk(c):
        if isinstance(c[0], (int, float)):
            xs.append(c[0]); ys.append(c[1])
        else:
            for k in c:
                walk(k)
    for f in fs:
        walk(f['geometry']['coordinates'])
    return d, nombre, (min(xs), max(xs), min(ys), max(ys))


def anillos(geojson):
    out = []
    for f in geojson['features']:
        g = f['geometry']
        polys = (g['coordinates'] if g['type'] == 'MultiPolygon'
                 else [g['coordinates']])
        for p in polys:
            out.append((p[0], p[1:]))
    return out


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


def dentro(x, y, polis):
    for ext, hoyos in polis:
        if en_anillo(x, y, ext) and not any(en_anillo(x, y, h) for h in hoyos):
            return True
    return False


def geotransform(im):
    t = im.tag_v2
    escala, tie = t.get(33550), t.get(33922)
    if not escala or not tie:
        raise SystemExit('el TIFF no trae tags de georreferencia')
    return float(tie[3]), float(tie[4]), float(escala[0]), float(escala[1])


def datos(path):
    im = Image.open(path)
    d = (im.get_flattened_data() if hasattr(im, 'get_flattened_data')
         else im.getdata())
    return im, list(d)


def main(eco_id, carpeta):
    os.makedirs(carpeta, exist_ok=True)
    geo, nombre, (x0b, x1b, y0b, y1b) = geometria(eco_id, carpeta)
    print('ECO_ID %s  %s' % (eco_id, nombre))
    print('bbox lon %.3f..%.3f  lat %.3f..%.3f' % (x0b, x1b, y0b, y1b), flush=True)

    # Cuanto raster pide el bbox a resolucion nativa, y si hay que reducirlo.
    wn = int((x1b - x0b) / PX_NATIVO)
    hn = int((y1b - y0b) / PX_NATIVO)
    mpx = wn * hn / 1e6
    escala = ''
    nota_escala = 'resolucion nativa (%.0f m)' % (PX_NATIVO * 111320)
    if mpx > TOPE_MPX:
        f = (TOPE_MPX / mpx) ** 0.5
        we, he = max(1, int(wn * f)), max(1, int(hn * f))
        escala = '&SCALESIZE=x(%d),y(%d)&INTERPOLATION=NEAREST' % (we, he)
        nota_escala = ('submuestreado a %dx%d desde %dx%d (%.0f m de pixel); '
                       'nearest verificado, ver el .md'
                       % (we, he, wn, hn, (x1b - x0b) / we * 111320))
    print('%s  [%s]' % (nombre, nota_escala), flush=True)

    for cov in ['MostProbable'] + GRUPOS:
        dest = os.path.join(carpeta, cov + '.tif')
        url = ('%s&COVERAGEID=%s&SUBSET=X(%.6f,%.6f)&SUBSET=Y(%.6f,%.6f)%s'
               % (WCS, cov, x0b, x1b, y0b, y1b, escala))
        cod = bajar(url, dest)
        if cod not in ('200', 'cache'):
            raise SystemExit('SoilGrids devolvio %s en la capa %s' % (cod, cov))
    print('31 capas listas', flush=True)

    mp_im, mp = datos(os.path.join(carpeta, 'MostProbable.tif'))
    W, H = mp_im.size
    gx, gy, dx, dy = geotransform(mp_im)
    polis = anillos(geo)

    idx = []
    for r in range(H):
        lat = gy - (r + 0.5) * dy
        base = r * W
        for c in range(W):
            if dentro(gx + (c + 0.5) * dx, lat, polis):
                idx.append(base + c)
    print('recorte listo: %d pixeles adentro' % len(idx), flush=True)

    validos = [i for i in idx if mp[i] > 0]
    cuenta = Counter(mp[i] for i in validos)

    probs = {}
    for g in GRUPOS:
        im, d = datos(os.path.join(carpeta, g + '.tif'))
        if im.size != (W, H):
            raise SystemExit('%s no comparte la grilla con MostProbable' % g)
        probs[g] = d

    nombre_de, acuerdo = {}, {}
    for v in cuenta:
        muestra = [i for i in validos if mp[i] == v][:4000]
        gana = Counter()
        for i in muestra:
            gana[max(GRUPOS, key=lambda g: probs[g][i])] += 1
        top, n = gana.most_common(1)[0]
        acuerdo[v] = n / len(muestra)
        # Sin unanimidad no se le pone nombre: el valor queda a la vista.
        nombre_de[v] = top if acuerdo[v] >= 0.999 else '??? (%s?)' % top

    out = []
    w = out.append
    w('=== ECO_ID %s - %s ===' % (eco_id, nombre))
    w('raster %dx%d  pixel %.6f x %.6f grados' % (W, H, dx, dy))
    w('%s' % nota_escala)
    w('pixeles dentro del poligono: %d   con dato: %d'
      % (len(idx), len(validos)))
    w('')
    w('mapeo deducido valor -> grupo (unanimidad del argmax):')
    for v in sorted(cuenta):
        w('  %3d -> %-16s %.1f %%' % (v, nombre_de[v], acuerdo[v] * 100))
    w('')
    w('reparto de la superficie:')
    tot = len(validos)
    for v, n in cuenta.most_common():
        w('  %-16s %5.1f %%  (%d px)' % (nombre_de[v], 100.0 * n / tot, n))
    w('')
    lix = sum(n for v, n in cuenta.items() if nombre_de[v] in LIXIVIADOS)
    frac = lix / tot
    w('fraccion lixiviada/acida (grupo A): %.1f %%' % (frac * 100))
    w('  -25 x %.4f = %.2f  ->  redondeado a 5: %d'
      % (frac, -25 * frac, round(-25 * frac / 5) * 5))
    w('  suman: %s' % (', '.join(sorted(
        {nombre_de[v] for v in cuenta if nombre_de[v] in LIXIVIADOS})) or '(ninguno)'))
    w('')
    gb = sum(n for v, n in cuenta.items()
             if nombre_de[v] in LIXIVIADOS or nombre_de[v] in SALINOS_Y_TURBA)
    fb = gb / tot
    w('fraccion del grupo B (lo anterior + turba y salinos): %.1f %%' % (fb * 100))
    w('  -25 x %.4f = %.2f  ->  redondeado a 5: %d'
      % (fb, -25 * fb, round(-25 * fb / 5) * 5))
    w('  suman ademas: %s' % (', '.join(sorted(
        {nombre_de[v] for v in cuenta if nombre_de[v] in SALINOS_Y_TURBA})) or '(ninguno)'))
    w('  PISO y no total: los tionicos son un cualificador de la WRB, no un')
    w('  grupo, y MostProbable no los distingue.')
    dudosos = [v for v in cuenta if acuerdo[v] < 0.999]
    if dudosos:
        w('')
        w('ATENCION: %d valores sin identificacion unanime. No entran a la '
          'fraccion y hay que resolverlos antes de usar este resultado.'
          % len(dudosos))

    txt = '\n'.join(out)
    io.open(os.path.join(carpeta, 'zonal_%s.txt' % eco_id), 'w',
            encoding='utf-8', newline='\n').write(txt)
    print(txt)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit('uso: python -I soilgrids-zonal.py <ECO_ID> <carpeta>')
    main(sys.argv[1], sys.argv[2])
