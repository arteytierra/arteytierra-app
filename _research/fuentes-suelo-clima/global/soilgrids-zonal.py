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
   reporta, en vez de recibir el grupo plausible. Deducido en nueve poligonos
   de cuatro continentes, el resultado coincide exactamente con el indice
   alfabetico base 0 de las 30 capas: el valor v es GRUPOS[v]. La deduccion se
   deja igual porque es la que lo verifica cada vez.

1b. **El valor 0 es dos cosas y hay que separarlas.** Es Acrisols -el primero
   de la lista alfabetica- y es tambien el relleno del raster donde no hay
   suelo. Medido: en un cuadrado del Atlantico abierto el valor 0 cubre todo y
   las 30 probabilidades valen 0; en un cuadrado de Guinea forestal el valor 0
   cubre el 12 % de la tierra y ahi la probabilidad de Acrisols es la mas alta
   de las 30. Asi que no se puede descartar el 0 sin tirar los Acrisols, y no
   se puede contarlo sin sumar el oceano. La prueba que los separa es la capa
   de Acrisols: si en un pixel con valor 0 la probabilidad de Acrisols es
   mayor que cero, el pixel es Acrisols, porque un argmax no puede valer cero
   mientras las 30 clases suman 100; y si vale cero, no hay dato.
2. Se recorta al poligono y no al bbox. En Java occidental el recorte duplica
   los andosoles y baja los ferralsoles a un cuarto: sin recorte el numero no
   sirve. El recorte es por *scanline*: para cada fila de latitud se calculan
   una sola vez los cruces de todos los anillos y de ahi salen, por paridad,
   los intervalos de longitud que estan adentro. Probar cada pixel contra cada
   vertice costaba 6 Mpx x 14.608 vertices en el miombo seco -87 mil millones
   de operaciones, horas- y asi queda en O(filas x vertices), unos 35
   millones.

Dos limites que aparecieron al correrlo sobre los diez poligonos del backlog y
que el script ya maneja:

3. **La geometria se pide simplificada.** El FeatureServer corta la respuesta
   alrededor de los 8 MB y devuelve JSON partido al medio, sin avisarlo por
   `exceededTransferLimit`: el miombo seco y el matorral del Decan no entran
   enteros. Con `maxAllowableOffset` el servidor simplifica antes de
   serializar, y 0,004 grados -unos 450 m, dos pixeles del raster- deja el
   borde con un error de un par de pixeles sobre poligonos de millones de
   hectareas. De paso acelera el recorte, que es O(vertices) por fila.

4. **El raster se submuestrea cuando no cabe, pero NUNCA mas de 2x.** El bbox
   del miombo seco pide 118 Mpx por capa, o sea unos 3.700 Mpx entre las 31.
   Arriba de TOPE_MPX se pide con `SCALESIZE`, y hasta 2x eso esta verificado
   que no interpola: pedido el mismo cuadrado nativo y reducido a la mitad, los
   dos devuelven el mismo conjunto de valores -{0, 10, 17}, no aparece ningun
   11..16- y las fracciones coinciden a 0,1 punto (87,4 % contra 87,5 %).

   **Pasado 2x deja de valer, y el 22/11/2026 se midio cuanto.** Un cuadrado
   de dos grados del miombo seco tiene 8 clases a resolucion nativa y 7 a la
   mitad; pedido a un cuarto tiene 27, con 19 valores que en el dato nativo no
   existen, y a un octavo tiene 21. O sea que arriba de 2x el servidor sirve
   de una piramide promediada -y `INTERPOLATION=NEAREST` no lo impide-, y un
   promedio de codigos de leyenda inventa clases: en el miombo aparecian
   Cryosols, Chernozems y Kastanozems. La prueba vieja no lo detectaba porque
   comparaba la MISMA capa a dos escalas vecinas, y el defecto empieza en la
   tercera.

   Por eso TOPE_REDUCCION corta en 2,0 en vez de submuestrear mas: un
   poligono que no entra no se mide aca, se mide con
   `soilgrids-zonal-mosaico.py`, que parte el bbox en tiles a resolucion
   nativa. Devolver un reparto de clases que no existen seria peor.

Requiere curl y Pillow. No requiere GDAL ni rasterio.

Licencias: RESOLVE Ecoregions 2017 (Dinerstein et al. 2017) CC BY 4.0;
SoilGrids v2.0 (ISRIC) CC BY 4.0. Las dos permiten uso comercial.
"""
import io
import json
import math
import os
import subprocess
import sys
import time
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
# Pixeles por valor que se usan para deducir el mapeo. Es un argmax contra 30
# capas y salio unanime al 100 % en los cuatro poligonos corridos, asi que no
# hace falta mas; subirlo solo cuesta tiempo.
TOPE_MUESTRA = 4000
# Reduccion lineal maxima que el WCS respeta sin promediar codigos de leyenda.
# Es el valor medido y no un margen: a 2x el conjunto de valores no cambia, y a
# 4x aparecen 19 valores que el dato nativo no tiene. Ver el punto 4 del
# encabezado. El poligono 315 pide 1,98x y entra justo.
TOPE_REDUCCION = 2.0
# El WCS de ISRIC sirve las capas desde COGs y de a ratos devuelve un tile
# roto: HTTP 400 con `_TIFFPartialReadStripArray: Cannot read offset/size for
# strile` o `ZIPDecode: Decoding error at scanline 0`. Es intermitente y no es
# de la peticion -el 22/11/2026, MostProbable sobre el mismo cuadrado de la
# pampa dio 400 tres veces y 200 cinco minutos despues-, asi que se reintenta
# con espera creciente. Si despues de todas sigue fallando, el script corta:
# una capa faltante da un reparto plausible y equivocado.
ESPERAS = [5, 15, 40, 90, 180]

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


def es_tiff(path):
    """Un TIFF arranca con II*\0 o MM\0*. El error del WCS arranca con `<`."""
    try:
        with open(path, 'rb') as f:
            return f.read(4) in (b'II*\x00', b'MM\x00*')
    except OSError:
        return False


def motivo(path):
    """El texto de la excepcion OWS, que es lo que explica el 400."""
    try:
        t = io.open(path, encoding='utf-8', errors='replace').read()
    except OSError:
        return ''
    i, j = t.find('<ows:ExceptionText>'), t.find('</ows:ExceptionText>')
    return ' '.join(t[i + 19:j].split()) if 0 <= i < j else ''


def bajar(url, destino, timeout='180', tiff=False, reintentos=None):
    if os.path.exists(destino) and os.path.getsize(destino) > 2000:
        return 'cache'
    esperas = ESPERAS if reintentos is None else ESPERAS[:reintentos]
    ultimo, por_que = '', ''
    for intento in range(len(esperas) + 1):
        r = subprocess.run(
            ['curl', '-s', '-A', UA, '--max-time', timeout, url, '-o', destino,
             '-w', '%{http_code}'], capture_output=True, text=True)
        ultimo = r.stdout.strip()
        # Un 200 que no es TIFF tampoco sirve: el servidor puede devolver la
        # excepcion con codigo bueno, y guardarla como .tif seria peor que el
        # error, porque la proxima corrida la tomaria de la cache.
        if ultimo == '200' and (not tiff or es_tiff(destino)):
            return ultimo
        por_que = motivo(destino)
        try:
            os.remove(destino)
        except OSError:
            pass
        if intento == len(esperas):
            break
        print('   reintento %d/%d (%s%s), espero %d s'
              % (intento + 1, len(esperas), ultimo,
                 '; ' + por_que[:60] if por_que else '', esperas[intento]),
              flush=True)
        time.sleep(esperas[intento])
    return '%s%s' % (ultimo, ' | ' + por_que if por_que else '')


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


def segmentos(geojson):
    """Todos los anillos del MultiPolygon como lista plana de segmentos.

    Exteriores y agujeros van juntos y la regla es la paridad (even-odd): un
    pixel adentro de un exterior y de un agujero cruza dos bordes y queda
    afuera, que es lo correcto. Vale porque los parches de una ecorregion no se
    solapan entre si.
    """
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
    """Intervalos [x_ini, x_fin] de longitud adentro del poligono, a esta lat."""
    cruces = []
    for x1, y1, x2, y2 in segs:
        if (y1 > lat) != (y2 > lat):
            cruces.append(x1 + (lat - y1) * (x2 - x1) / (y2 - y1))
    if len(cruces) < 2:
        return []
    cruces.sort()
    return [(cruces[i], cruces[i + 1]) for i in range(0, len(cruces) - 1, 2)]


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
        if 1.0 / f > TOPE_REDUCCION:
            raise SystemExit(
                'el bbox pide %.0f Mpx por capa y reducirlo para que entre en '
                '%.0f necesitaria %.1fx, arriba del tope de %.1fx. Pasado 2x '
                'el WCS promedia codigos de leyenda e inventa clases (ver el '
                'punto 4 del encabezado), asi que este poligono se mide con '
                'soilgrids-zonal-mosaico.py, que lo parte en tiles a '
                'resolucion nativa.'
                % (mpx, TOPE_MPX, 1.0 / f, TOPE_REDUCCION))
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
        cod = bajar(url, dest, tiff=True)
        if cod not in ('200', 'cache'):
            raise SystemExit('SoilGrids no entrego la capa %s: %s' % (cov, cod))
    print('31 capas listas', flush=True)

    mp_im, mp = datos(os.path.join(carpeta, 'MostProbable.tif'))
    W, H = mp_im.size
    gx, gy, dx, dy = geotransform(mp_im)
    segs = segmentos(geo)

    # Un pixel esta adentro si su centro cae en alguno de los tramos de su
    # fila. Las columnas se despejan por aritmetica, sin recorrer la fila.
    idx = []
    for r in range(H):
        lat = gy - (r + 0.5) * dy
        base = r * W
        for xa, xb in tramos(lat, segs):
            ca = max(0, int(math.ceil((xa - gx) / dx - 0.5)))
            cb = min(W - 1, int(math.floor((xb - gx) / dx - 0.5)))
            if cb >= ca:
                idx.extend(range(base + ca, base + cb + 1))
    print('recorte listo: %d pixeles adentro (%d segmentos)'
          % (len(idx), len(segs)), flush=True)

    # El valor 0 es Acrisols Y es nodata: ver el punto 1b del encabezado. Los
    # pixeles con 0 se apartan y los separa la capa de Acrisols, que de todos
    # modos hay que leer.
    im_ac, ac = datos(os.path.join(carpeta, 'Acrisols.tif'))
    if im_ac.size != (W, H):
        raise SystemExit('Acrisols no comparte la grilla con MostProbable')

    # Las muestras por valor se arman en UNA pasada: filtrar `validos` por cada
    # valor costaba 30 recorridos de millones de elementos.
    cuenta = Counter()
    muestras = {}
    sin_dato = 0
    for i in idx:
        v = mp[i]
        if v == 0 and ac[i] == 0:
            sin_dato += 1
            continue
        if v < 0:
            sin_dato += 1
            continue
        cuenta[v] += 1
        m = muestras.setdefault(v, [])
        if len(m) < TOPE_MUESTRA:
            m.append(i)
    del ac
    total_validos = sum(cuenta.values())
    if total_validos == 0:
        raise SystemExit('ningun pixel con dato adentro del poligono')

    # Las 30 capas NO se cargan juntas: a 6 Mpx serian unos 7 GB de listas de
    # Python. Se lee una, se guarda su probabilidad solo en los indices
    # muestreados, y se descarta.
    plano = [i for v in sorted(muestras) for i in muestras[v]]
    prob_en_muestra = {}
    for g in GRUPOS:
        im, d = datos(os.path.join(carpeta, g + '.tif'))
        if im.size != (W, H):
            raise SystemExit('%s no comparte la grilla con MostProbable' % g)
        prob_en_muestra[g] = [d[i] for i in plano]
        del d

    pos = {i: k for k, i in enumerate(plano)}
    nombre_de, acuerdo = {}, {}
    for v in sorted(muestras):
        gana = Counter()
        for i in muestras[v]:
            k = pos[i]
            gana[max(GRUPOS, key=lambda g: prob_en_muestra[g][k])] += 1
        top, n = gana.most_common(1)[0]
        acuerdo[v] = n / len(muestras[v])
        # Sin unanimidad no se le pone nombre: el valor queda a la vista.
        nombre_de[v] = top if acuerdo[v] >= 0.999 else '??? (%s?)' % top

    out = []
    w = out.append
    w('=== ECO_ID %s - %s ===' % (eco_id, nombre))
    w('raster %dx%d  pixel %.6f x %.6f grados' % (W, H, dx, dy))
    w('%s' % nota_escala)
    w('pixeles dentro del poligono: %d   con dato: %d   sin dato: %d'
      % (len(idx), total_validos, sin_dato))
    w('')
    w('mapeo deducido valor -> grupo (unanimidad del argmax):')
    for v in sorted(cuenta):
        w('  %3d -> %-16s %.1f %%' % (v, nombre_de[v], acuerdo[v] * 100))
    w('')
    w('reparto de la superficie:')
    tot = total_validos
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
