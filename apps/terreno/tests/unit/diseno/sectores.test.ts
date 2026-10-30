import { describe, it, expect } from 'vitest';
import {
  azimutsSolsticio,
  calcularSectoresAuto,
  doyDelSolsticio,
  generarVerticesSector,
  rumboDeAzimut,
} from '@/lib/sectores';
import type { DatosClima } from '@/lib/clima';

/*
 * Los sectores son las influencias externas del predio: de dónde entra el sol,
 * de dónde el viento frío. Con eso alguien decide dónde va la casa y dónde la
 * cortina, así que un sector espejado no es un detalle de dibujo.
 *
 * Tres cosas estaban atadas al hemisferio sur:
 *   - los sectores de sol sólo se generaban con lat < 0;
 *   - el texto del sur venía de bibliografía del norte y describía el recorrido
 *     de verano al revés (NE→NO es, en el sur, el de invierno);
 *   - el arco se barría siempre por el norte, así que en el norte salía
 *     espejado.
 *
 * Y una cuarta, arreglada el 30/10/2026: las dos cuñas de viento no miraban la
 * serie. La del viento frío la decidía la latitud —el polo— y la del
 * predominante convertía la etiqueta de 16 puntas de vuelta a grados, o sea
 * leía el número ya redondeado. Ahora las dos salen de `lib/viento.ts` con el
 * dato medido, y sin dato no hay cuña: el detalle de por qué, y los tres
 * predios que desmienten al modelo del polo, están en
 * `tests/unit/clima/viento.test.ts`.
 */

const CORDOBA = { lat: -31.4, lng: -64.2 };
const AMSTERDAM = { lat: 52.37, lng: 4.9 };
const QUITO = { lat: -0.18, lng: -78.47 };
const LONGYEARBYEN = { lat: 78.2, lng: 15.6 };

/**
 * Doce meses con un solo mes frío y, si se le pasa, una dirección de viento
 * para ese mes distinta de la del resto. Así se ve si la cuña del viento frío
 * lee el trimestre que corresponde o se queda con el promedio del año.
 */
function clima(mesMasFrio: number, dirFrio?: number, dirResto = 90): DatosClima {
  const meses = Array.from({ length: 12 }, (_, i) => ({
    mes: String(i + 1),
    tmean_c: i === mesMasFrio ? -2 : 20,
    precip_mm: 50,
    viento_ms: 4,
    viento_dir_deg: dirFrio !== undefined && Math.abs(i - mesMasFrio) <= 1 ? dirFrio : dirResto,
  }));
  return { lat: 0, lng: 0, viento_dir_ppal: 'E', meses } as unknown as DatosClima;
}

/** El mismo clima pero sin ninguna dirección medida. */
function climaSinViento(mesMasFrio: number): DatosClima {
  const meses = Array.from({ length: 12 }, (_, i) => ({
    mes: String(i + 1),
    tmean_c: i === mesMasFrio ? -2 : 20,
    precip_mm: 50,
    viento_ms: 4,
  }));
  return { lat: 0, lng: 0, viento_dir_ppal: '—', meses } as unknown as DatosClima;
}

describe('el rumbo de un azimut', () => {
  it('cae en la punta más cercana de la rosa de 16', () => {
    expect(rumboDeAzimut(0)).toBe('N');
    expect(rumboDeAzimut(90)).toBe('E');
    expect(rumboDeAzimut(180)).toBe('S');
    expect(rumboDeAzimut(270)).toBe('O');
    expect(rumboDeAzimut(115.9)).toBe('ESE');
    expect(rumboDeAzimut(244.1)).toBe('OSO');
  });

  it('no se rompe al cruzar el norte ni con valores fuera de rango', () => {
    expect(rumboDeAzimut(359)).toBe('N');
    expect(rumboDeAzimut(361)).toBe('N');
    expect(rumboDeAzimut(-90)).toBe('O');
  });
});

describe('cuál es el solsticio alto', () => {
  it('en el norte es junio; en el sur, diciembre', () => {
    expect(doyDelSolsticio('verano', AMSTERDAM.lat)).toBe(172);
    expect(doyDelSolsticio('invierno', AMSTERDAM.lat)).toBe(355);
    expect(doyDelSolsticio('verano', CORDOBA.lat)).toBe(355);
    expect(doyDelSolsticio('invierno', CORDOBA.lat)).toBe(172);
  });
});

describe('por qué lado del cielo pasa el sol', () => {
  it('en Córdoba pasa por el norte los dos solsticios', () => {
    expect(azimutsSolsticio(CORDOBA.lat, 355).porElNorte).toBe(true);
    expect(azimutsSolsticio(CORDOBA.lat, 172).porElNorte).toBe(true);
  });

  it('en Ámsterdam pasa por el sur los dos', () => {
    expect(azimutsSolsticio(AMSTERDAM.lat, 355).porElNorte).toBe(false);
    expect(azimutsSolsticio(AMSTERDAM.lat, 172).porElNorte).toBe(false);
  });

  it('en Quito depende del mes, y por eso no se puede resolver por hemisferio', () => {
    expect(azimutsSolsticio(QUITO.lat, 355).porElNorte).toBe(false);
    expect(azimutsSolsticio(QUITO.lat, 172).porElNorte).toBe(true);
  });

  it('en el verano del sur el sol sale al ESE, no al NE', () => {
    // Medido con el propio motor de arco solar: 116° de salida y 244° de puesta
    // el 21 de diciembre en Córdoba. El texto viejo decía NE→NO.
    const s = azimutsSolsticio(CORDOBA.lat, 355);
    expect(s.amanecer).toBeGreaterThan(90);
    expect(s.amanecer).toBeLessThan(135);
    expect(s.atardecer).toBeGreaterThan(225);
    expect(s.atardecer).toBeLessThan(270);
  });

  it('el recorrido NE→NO del sur es el de invierno', () => {
    const s = azimutsSolsticio(CORDOBA.lat, 172);
    expect(s.amanecer).toBeLessThan(90);
    expect(s.atardecer).toBeGreaterThan(270);
  });

  it('arriba del círculo polar dice si el sol no sale o no se pone', () => {
    expect(azimutsSolsticio(LONGYEARBYEN.lat, 355).siempreAbajo).toBe(true);
    expect(azimutsSolsticio(LONGYEARBYEN.lat, 172).siempreArriba).toBe(true);
  });
});

describe('la geometría del arco se barre por el lado correcto', () => {
  const radio = 1000;

  /**
   * El mediodía del arco, que es lo que dice por qué lado pasa el sol. Las dos
   * puntas están del lado del amanecer y del atardecer en los dos hemisferios
   * —en Ámsterdam, en verano, el sol sale al NE y se pone al NO—, así que mirar
   * si el arco toca el norte no distingue nada. El punto del medio sí.
   */
  function mediodia(lat: number, lng: number): { lat: number; lng: number } {
    const pts = generarVerticesSector('sol_verano', lat, lng, radio, null, null);
    const arco = pts.slice(1);
    return arco[Math.floor(arco.length / 2)]!;
  }

  it('en Córdoba el arco de verano pasa por el norte', () => {
    expect(mediodia(CORDOBA.lat, CORDOBA.lng).lat).toBeGreaterThan(CORDOBA.lat + 0.005);
  });

  it('en Ámsterdam pasa por el sur', () => {
    // Antes salía espejado: el mediodía dibujado al norte y la sombra de la casa
    // del lado que no era.
    expect(mediodia(AMSTERDAM.lat, AMSTERDAM.lng).lat).toBeLessThan(AMSTERDAM.lat - 0.005);
  });

  it('con noche polar no dibuja ningún arco', () => {
    const pts = generarVerticesSector('sol_invierno', LONGYEARBYEN.lat, LONGYEARBYEN.lng, radio, null, null);
    expect(pts).toEqual([]);
  });

  it('con sol de medianoche da la vuelta completa', () => {
    const pts = generarVerticesSector('sol_verano', LONGYEARBYEN.lat, LONGYEARBYEN.lng, radio, null, null);
    expect(pts.length).toBeGreaterThan(30);
    expect(pts.some((p) => p.lat > LONGYEARBYEN.lat + 0.005)).toBe(true);
    expect(pts.some((p) => p.lat < LONGYEARBYEN.lat - 0.005)).toBe(true);
  });
});

describe('los sectores automáticos', () => {
  it('se generan los dos de sol en cualquier hemisferio', () => {
    for (const sitio of [CORDOBA, AMSTERDAM, QUITO]) {
      const tipos = calcularSectoresAuto(sitio.lat, null, null).map((s) => s.tipo);
      expect(tipos, String(sitio.lat)).toContain('sol_verano');
      expect(tipos, String(sitio.lat)).toContain('sol_invierno');
    }
  });

  it('la nota del sol nombra el lado por el que pasa, y no lo afirma de memoria', () => {
    const sur = calcularSectoresAuto(CORDOBA.lat, null, null)
      .find((s) => s.tipo === 'sol_verano');
    const norte = calcularSectoresAuto(AMSTERDAM.lat, null, null)
      .find((s) => s.tipo === 'sol_verano');
    expect(sur?.notas).toContain('por el norte');
    expect(norte?.notas).toContain('por el sur');
    // El recorrido que decía antes para el sur.
    expect(sur?.notas).not.toContain('sale por el NE');
  });

  it('el viento frío sale de los meses fríos y no de la latitud', () => {
    // El mismo rumbo medido en los dos hemisferios: la cuña y la nota dicen lo
    // que midió la serie, y no el polo que les quedaba más cerca.
    const sur = calcularSectoresAuto(CORDOBA.lat, clima(6, 225), null)
      .find((s) => s.tipo === 'viento_frio');
    const norte = calcularSectoresAuto(AMSTERDAM.lat, clima(0, 225), null)
      .find((s) => s.tipo === 'viento_frio');
    expect(sur?.notas).toContain('del SO (225°)');
    expect(norte?.notas).toContain('del SO (225°)');
    // Lo que decía antes, cada uno con su polo.
    expect(sur?.notas).not.toContain('Protegerse del S ');
    expect(norte?.notas).not.toContain('Protegerse del N ');
  });

  it('el trimestre frío manda sobre el promedio del año', () => {
    // Nueve meses del E y tres del SO, que son los fríos. El predominante del
    // año es el E; la cortina se orienta contra el SO.
    const sectores = calcularSectoresAuto(CORDOBA.lat, clima(6, 225, 90), null);
    expect(sectores.find((s) => s.tipo === 'viento_ppal')?.nombre).toBe('Viento E');
    expect(sectores.find((s) => s.tipo === 'viento_frio')?.nombre).toContain('(SO)');
  });

  it('la cuña del viento frío apunta al rumbo medido', () => {
    // SO en los dos hemisferios: las dos cuñas caen al suroeste del centro.
    for (const sitio of [CORDOBA, AMSTERDAM]) {
      const cuña = generarVerticesSector('viento_frio', sitio.lat, sitio.lng, 1000, clima(6, 225), null);
      expect(cuña.some((p) => p.lat < sitio.lat - 0.005 && p.lng < sitio.lng - 0.005)).toBe(true);
    }
  });

  it('sin viento medido no hay cuña ni sector: no se inventa un rumbo', () => {
    expect(generarVerticesSector('viento_frio', CORDOBA.lat, CORDOBA.lng, 1000, null, null)).toEqual([]);
    expect(generarVerticesSector('viento_ppal', CORDOBA.lat, CORDOBA.lng, 1000, null, null)).toEqual([]);
    const sinDir = climaSinViento(6);
    expect(generarVerticesSector('viento_frio', CORDOBA.lat, CORDOBA.lng, 1000, sinDir, null)).toEqual([]);
    const sectores = calcularSectoresAuto(CORDOBA.lat, sinDir, null);
    expect(sectores.some((s) => s.tipo === 'viento_frio')).toBe(false);
    expect(sectores.some((s) => s.tipo === 'viento_ppal')).toBe(false);
  });
});
