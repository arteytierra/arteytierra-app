import { describe, expect, it } from 'vitest';
import type { DatosClima } from '@/lib/clima';
import { aberturasExteriores } from '@/lib/motor/aberturas';
import { generarAnteproyecto } from '@/lib/motor/generador';
import { puntosHuella } from '@/lib/motor/huella';
import { renderFachada, renderTechos } from '@/lib/motor/svg';
import { camaraDe, direccionSol, modelo3D, renderVista3D, VISTAS_3D } from '@/lib/motor/volumen';
import { PARAMETROS_TRANSVERSALES_DEFAULT, type AmbienteDeseado, type PerfilId } from '@/lib/tipos';

const PROGRAMA: AmbienteDeseado[] = [
  { id: 'estar', tipo: 'estar-cocina-comedor', cantidad: 1, tamano: 'grande', adyacenciasDeseadas: [] },
  { id: 'd1', tipo: 'dormitorio', cantidad: 2, tamano: 'mediano', adyacenciasDeseadas: ['bano'] },
  { id: 'bano', tipo: 'bano', cantidad: 1, tamano: 'mediano', adyacenciasDeseadas: ['estar'] },
  { id: 'hall', tipo: 'hall', cantidad: 1, tamano: 'chico', adyacenciasDeseadas: ['estar'] },
];

function clima(lat: number, codigo: string, descripcion = 'clima de prueba'): DatosClima {
  return {
    lat,
    lng: -60,
    viento_dir_ppal: 'E',
    koppen: { codigo, descripcion },
  } as unknown as DatosClima;
}

function anteproyecto(perfil: PerfilId = 'bioclimatico', lat = 18.25, koppen = 'Aw') {
  return generarAnteproyecto(
    perfil,
    { m2CubiertosObjetivo: 90, ambientes: PROGRAMA },
    PARAMETROS_TRANSVERSALES_DEFAULT,
    clima(lat, koppen),
  );
}

describe('geometría del techo', () => {
  it('la cumbrera corre sobre el eje largo del edificio', () => {
    for (const perfil of ['fiel-cliente', 'organico', 'bioclimatico'] as PerfilId[]) {
      const ap = anteproyecto(perfil);
      const esperado = ap.ancho_m >= ap.profundo_m ? 'E-O' : 'N-S';
      expect(ap.ejeCumbrera).toBe(esperado);
    }
  });

  it('la altura total es una sola para todo el edificio, no una por fachada', () => {
    // Antes cada fachada deducía la cumbrera de su propio ancho: la misma casa
    // se acotaba con dos alturas totales distintas según el lado que se mirara.
    const ap = anteproyecto();
    const alturas = (['N', 'S', 'E', 'O'] as const).map(lado => {
      const m = renderFachada(ap, lado).match(/h\. total ([\d.]+) m/);
      return m?.[1];
    });
    expect(new Set(alturas).size).toBe(1);
    expect(alturas[0]).toBe(ap.altura_total_m.toFixed(2));
  });

  it('la altura de cumbrera sale de la luz perpendicular a ella', () => {
    const ap = anteproyecto();
    const luz = ap.ejeCumbrera === 'E-O' ? ap.profundo_m : ap.ancho_m;
    const esperada = Math.min(Math.max((luz / 2) * (ap.pendiente_techo_pct / 100), 0.8), 4);
    expect(ap.altura_cumbrera_m).toBeCloseTo(esperada, 2);
    expect(ap.altura_total_m).toBeCloseTo(ap.altura_muro_m + ap.altura_cumbrera_m, 2);
  });

  it('el testero se dibuja triangular y el lado largo como faldón proyectado', () => {
    const ap = anteproyecto();
    const testero = ap.ejeCumbrera === 'E-O' ? 'E' : 'N';
    const largo = ap.ejeCumbrera === 'E-O' ? 'N' : 'E';
    // El tímpano es un triángulo (path de tres puntos); el lado largo, un rect.
    expect(renderFachada(ap, testero as 'N')).toMatch(/<path d="M [^"]+ L [^"]+ L [^"]+ Z" fill="#DDD2B8"/);
    expect(renderFachada(ap, largo as 'N')).toMatch(/<rect x="[-\d.]+" y="0"[^/]*fill="#DDD2B8"/);
  });

  it('la planta de techos declara una sola cumbrera', () => {
    const svg = renderTechos(anteproyecto());
    expect(svg).toContain('dos aguas');
    expect(svg.match(/stroke-dasharray="6,3"/g) ?? []).toHaveLength(1);
  });
});

describe('modelo3D', () => {
  it('no genera caras degeneradas ni coordenadas inválidas', () => {
    for (const perfil of ['fiel-cliente', 'organico', 'bioclimatico'] as PerfilId[]) {
      for (const cara of modelo3D(anteproyecto(perfil))) {
        expect(cara.pts.length).toBeGreaterThanOrEqual(3);
        for (const p of cara.pts) {
          expect(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)).toBe(true);
        }
      }
    }
  });

  it('el punto más alto del volumen es exactamente la cumbrera acotada', () => {
    const ap = anteproyecto();
    const zMax = Math.max(...modelo3D(ap).flatMap(c => c.pts.map(p => p.z)));
    expect(zMax).toBeCloseTo(ap.altura_total_m, 2);
  });

  it('el alero baja respecto del muro, no queda horizontal', () => {
    // Un faldón inclinado que llega al alero a la misma altura que el muro
    // describe un techo imposible; la caída tiene que ser alero × pendiente.
    const ap = anteproyecto();
    const luz = ap.ejeCumbrera === 'E-O' ? ap.profundo_m : ap.ancho_m;
    const caida = ap.alero_m * (ap.altura_cumbrera_m / (luz / 2));
    const zTecho = modelo3D(ap)
      .filter(c => c.color === '#8E6A4E')
      .flatMap(c => c.pts.map(p => p.z));
    expect(Math.min(...zTecho)).toBeCloseTo(ap.altura_muro_m - caida, 2);
    expect(caida).toBeGreaterThan(0);
  });

  it('levanta un muro por cada tramo del perímetro de la planta', () => {
    const ap = anteproyecto();
    const tramos = puntosHuella(ap.ambientes, 0).length;
    const muros = modelo3D(ap).filter(c => c.pts.every(p => p.z === 0 || Math.abs(p.z - ap.altura_muro_m) < 1e-9));
    expect(muros.length).toBe(tramos);
  });

  it('sitúa el sol del lado que corresponde al hemisferio', () => {
    // En el hemisferio norte el sol viene del sur; en el sur, del norte.
    expect(direccionSol(18.25).y).toBeLessThan(0);
    expect(direccionSol(-41.13).y).toBeGreaterThan(0);
    expect(direccionSol(undefined).z).toBeGreaterThan(0);
  });
});

describe('proyección axonométrica', () => {
  it('mantiene paralelas las rectas paralelas', () => {
    const cam = camaraDe(45, 32);
    const proy = (p: { x: number; y: number; z: number }) => ({
      x: p.x * cam.u.x + p.y * cam.u.y + p.z * cam.u.z,
      y: -(p.x * cam.v.x + p.y * cam.v.y + p.z * cam.v.z),
    });
    // Dos aristas verticales del edificio, en esquinas distintas.
    const a1 = proy({ x: 0, y: 0, z: 0 });
    const a2 = proy({ x: 0, y: 0, z: 3 });
    const b1 = proy({ x: 5, y: 4, z: 0 });
    const b2 = proy({ x: 5, y: 4, z: 3 });
    const dir = (p: { x: number; y: number }, q: { x: number; y: number }) => Math.atan2(q.y - p.y, q.x - p.x);
    expect(dir(a1, a2)).toBeCloseTo(dir(b1, b2), 6);
  });

  it('los ejes de cámara son ortonormales', () => {
    for (const v of VISTAS_3D) {
      const { c, u, v: arriba } = camaraDe(v.azimut, v.elevacion);
      for (const e of [c, u, arriba]) expect(Math.hypot(e.x, e.y, e.z)).toBeCloseTo(1, 6);
      expect(c.x * u.x + c.y * u.y + c.z * u.z).toBeCloseTo(0, 6);
      expect(c.x * arriba.x + c.y * arriba.y + c.z * arriba.z).toBeCloseTo(0, 6);
      expect(u.x * arriba.x + u.y * arriba.y + u.z * arriba.z).toBeCloseTo(0, 6);
    }
  });
});

describe('renderVista3D', () => {
  it('produce SVG válido y con dimensiones reales en las 5 vistas', () => {
    const ap = anteproyecto();
    for (const v of VISTAS_3D) {
      const svg = renderVista3D(ap, v);
      expect(svg).not.toMatch(/NaN|Infinity|undefined/);
      const vb = svg.match(/viewBox="([-\d. ]+)"/)?.[1]?.split(' ').map(Number);
      expect(vb).toHaveLength(4);
      expect(vb!.every(Number.isFinite)).toBe(true);
      expect(vb![2]).toBeGreaterThan(0);
      expect(vb![3]).toBeGreaterThan(0);
      // El rótulo repite las cotas del plano: es el mismo edificio.
      expect(svg).toContain(`${ap.ancho_m.toFixed(2)} × ${ap.profundo_m.toFixed(2)} m`);
    }
  });

  it('deja caras visibles en todas las vistas', () => {
    // Con las normales mal orientadas el culling se lleva medio edificio y la
    // vista sale hueca; el conteo mínimo lo detecta.
    const ap = anteproyecto();
    for (const v of VISTAS_3D) {
      const caras = renderVista3D(ap, v).match(/<path d=/g) ?? [];
      expect(caras.length).toBeGreaterThan(5);
    }
  });

  it('funciona en cualquier clima y en ambos hemisferios', () => {
    for (const [lat, koppen] of [
      [18.25, 'Aw'],
      [-41.13, 'Dsb'],
      [-24.8, 'BWh'],
      [52.5, 'Cfb'],
      [78, 'ET'],
    ] as const) {
      const ap = generarAnteproyecto(
        'bioclimatico',
        { m2CubiertosObjetivo: 90, ambientes: PROGRAMA },
        PARAMETROS_TRANSVERSALES_DEFAULT,
        clima(lat, koppen),
      );
      expect(renderVista3D(ap, VISTAS_3D[0]!)).not.toMatch(/NaN/);
    }
  });

  it('sigue dibujando sin datos de clima', () => {
    const ap = generarAnteproyecto('fiel-cliente', { m2CubiertosObjetivo: 90, ambientes: PROGRAMA }, PARAMETROS_TRANSVERSALES_DEFAULT, null);
    expect(renderVista3D(ap, VISTAS_3D[2]!)).not.toMatch(/NaN/);
  });
});

describe('aberturas compartidas', () => {
  it('la planta, la fachada y el 3D dibujan las mismas ventanas', () => {
    const ap = anteproyecto();
    const aberturas = aberturasExteriores(ap);
    for (const lado of ['N', 'S', 'E', 'O'] as const) {
      const esperadas = aberturas.filter(a => a.lado === lado).length;
      const dibujadas = (renderFachada(ap, lado).match(/fill="#DCE9F0"|fill="#C9B79A"/g) ?? []).length;
      expect(dibujadas).toBe(esperadas);
    }
  });

  it('ninguna abertura atraviesa el nivel superior del muro', () => {
    for (const perfil of ['fiel-cliente', 'organico', 'bioclimatico'] as PerfilId[]) {
      const ap = anteproyecto(perfil);
      for (const a of aberturasExteriores(ap)) {
        expect(a.antepecho_m + a.alto_m).toBeLessThanOrEqual(ap.altura_muro_m);
        expect(a.ancho_m).toBeGreaterThan(0);
      }
    }
  });

  it('siempre resuelve una puerta de acceso', () => {
    for (const perfil of ['fiel-cliente', 'organico', 'bioclimatico'] as PerfilId[]) {
      const puertas = aberturasExteriores(anteproyecto(perfil)).filter(a => a.clase === 'puerta');
      expect(puertas).toHaveLength(1);
    }
  });

  it('cada abertura cae dentro del muro de su ambiente', () => {
    const ap = anteproyecto();
    for (const a of aberturasExteriores(ap)) {
      const r = ap.ambientes.find(x => x.id === a.ambienteId)!;
      const [ini, fin] = a.lado === 'N' || a.lado === 'S' ? [r.x_m, r.x_m + r.w_m] : [r.y_m, r.y_m + r.h_m];
      expect(a.centro_m - a.ancho_m / 2).toBeGreaterThanOrEqual(ini - 0.01);
      expect(a.centro_m + a.ancho_m / 2).toBeLessThanOrEqual(fin + 0.01);
    }
  });
});

describe('puntosHuella', () => {
  it('el polígono encierra exactamente el área construida', () => {
    const ap = anteproyecto();
    const pts = puntosHuella(ap.ambientes, 0);
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i]!;
      const [x2, y2] = pts[(i + 1) % pts.length]!;
      area += x1 * y2 - x2 * y1;
    }
    expect(Math.abs(area / 2)).toBeCloseTo(ap.area_total_m2, 0);
  });

  it('da cuatro esquinas cuando la huella es rectangular', () => {
    // El empaquetado deja bandas de 9,95 y 9,94 m por redondeo. Sin unificar
    // esa diferencia el perímetro sumaba vértices de más y el volumen 3D
    // levantaba muros parásitos de un centímetro entre banda y banda.
    for (const perfil of ['fiel-cliente', 'organico', 'bioclimatico'] as PerfilId[]) {
      const ap = anteproyecto(perfil);
      expect(puntosHuella(ap.ambientes, 0)).toHaveLength(4);
    }
  });

  it('no deja tres vértices alineados: un muro recto no tiene esquina al medio', () => {
    const pts = puntosHuella(anteproyecto().ambientes, 0);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i - 1 + pts.length) % pts.length]!;
      const p = pts[i]!;
      const b = pts[(i + 1) % pts.length]!;
      expect(Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0]))).toBeGreaterThan(1e-4);
    }
  });

  it('no deja vértices repetidos, que producirían muros de largo cero', () => {
    const pts = puntosHuella(anteproyecto().ambientes, 0);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!;
      const b = pts[(i + 1) % pts.length]!;
      expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeGreaterThan(1e-6);
    }
  });
});
