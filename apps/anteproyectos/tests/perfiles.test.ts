import { describe, expect, it } from 'vitest';
import type { DatosClima } from '@/lib/clima';
import { generarAnteproyecto, type AnteproyectoGenerado } from '@/lib/motor/generador';
import { anchoMinimoDe } from '@/lib/motor/layout';
import { mobiliarioDe } from '@/lib/motor/mobiliario';
import { PARAMETROS_TRANSVERSALES_DEFAULT, type AmbienteDeseado, type PerfilId } from '@/lib/tipos';

/** El programa del caso piloto: es el que destapó que los perfiles coincidían. */
const PROGRAMA: AmbienteDeseado[] = [
  { id: 'estar', tipo: 'estar-cocina-comedor', cantidad: 1, tamano: 'grande', adyacenciasDeseadas: [] },
  { id: 'd1', tipo: 'dormitorio', nombre: 'Dormitorio principal', cantidad: 1, tamano: 'grande', adyacenciasDeseadas: ['bano1'] },
  { id: 'd2', tipo: 'dormitorio', cantidad: 2, tamano: 'mediano', adyacenciasDeseadas: [] },
  { id: 'bano1', tipo: 'bano', cantidad: 1, tamano: 'mediano', adyacenciasDeseadas: ['estar'] },
  { id: 'hall', tipo: 'hall', cantidad: 1, tamano: 'chico', adyacenciasDeseadas: ['estar'] },
];

const PERFILES_VISIBLES: PerfilId[] = ['fiel-cliente', 'organico', 'bioclimatico'];

function clima(lat: number, codigo: string, grupo: string, precip = 1200): DatosClima {
  return { lat, lng: -66, precip_anual_mm: precip, viento_dir_ppal: 'E', koppen: { codigo, grupo, descripcion: '' } } as unknown as DatosClima;
}

function generar(perfil: PerfilId, c: DatosClima | null = clima(18.25, 'Aw', 'Tropical', 1879)) {
  return generarAnteproyecto(perfil, { m2CubiertosObjetivo: 90, ambientes: PROGRAMA }, PARAMETROS_TRANSVERSALES_DEFAULT, c, {
    zonaSismica: true,
  });
}

/** Posición y tamaño de cada ambiente: dos perfiles con la misma firma dibujan la misma planta. */
function firma(ap: AnteproyectoGenerado): string {
  return [...ap.ambientes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(r => `${r.id}@${r.x_m.toFixed(1)},${r.y_m.toFixed(1)}:${r.w_m.toFixed(1)}x${r.h_m.toFixed(1)}`)
    .join('|');
}

describe('los perfiles proponen plantas distintas', () => {
  it('ningún par de perfiles produce la misma planta', () => {
    // La primera versión daba tres plantas idénticas salvo unos centímetros en
    // el rectángulo exterior: comparar sólo ancho y profundo no lo detectaba,
    // porque la organización interna era la misma en los tres.
    const firmas = PERFILES_VISIBLES.map(p => firma(generar(p)));
    expect(new Set(firmas).size).toBe(PERFILES_VISIBLES.length);
  });

  it('tampoco coinciden en un clima frío del hemisferio sur', () => {
    const c = clima(-41.13, 'Dsb', 'Continental', 800);
    const firmas = PERFILES_VISIBLES.map(p => firma(generar(p, c)));
    expect(new Set(firmas).size).toBe(PERFILES_VISIBLES.length);
  });

  it('el perfil bioclimático arrima el núcleo de servicios al lado polar', () => {
    // Lo que el motor garantiza es esto y no más: los servicios se agrupan en
    // el extremo opuesto al ecuador, de colchón, y el estar se queda con la
    // cara buena. No garantiza una banda de servicios pura — con 8 m² de baño
    // y hall en una casa de 90 m² una banda entera de servicios sería un
    // disparate, y el empaquetador la descarta por inhabitable.
    const casos = [
      { c: clima(18.25, 'Aw', 'Tropical', 1879), polo: 'N' as const },
      { c: clima(-34.6, 'Cfa', 'Templado'), polo: 'S' as const },
      { c: clima(-41.13, 'Dsb', 'Continental', 800), polo: 'S' as const },
    ];
    for (const { c, polo } of casos) {
      const ap = generar('bioclimatico', c);
      const servicios = ap.ambientes.filter(r => r.tipo === 'bano' || r.tipo === 'hall');
      const dormitorios = ap.ambientes.filter(r => r.tipo === 'dormitorio');

      // El núcleo llega al borde del edificio del lado del polo.
      const tocaBordePolar = servicios.some(r =>
        polo === 'N' ? r.y_m < 0.05 : Math.abs(r.y_m + r.h_m - ap.profundo_m) < 0.05,
      );
      expect(tocaBordePolar).toBe(true);

      // Y los dormitorios quedan, en promedio, del lado del ecuador respecto
      // del núcleo: son los que más ganan con la buena orientación.
      const centro = (rs: typeof servicios) => rs.reduce((s, r) => s + r.y_m + r.h_m / 2, 0) / rs.length;
      if (polo === 'N') expect(centro(dormitorios)).toBeGreaterThan(centro(servicios));
      else expect(centro(dormitorios)).toBeLessThan(centro(servicios));
    }
  });

  it('agrupa baño y hall en un núcleo contiguo, no repartidos por la planta', () => {
    for (const perfil of PERFILES_VISIBLES) {
      const ap = generar(perfil);
      const bano = ap.ambientes.find(r => r.tipo === 'bano')!;
      const hall = ap.ambientes.find(r => r.tipo === 'hall')!;
      const pegadosEnY = Math.abs(bano.y_m + bano.h_m - hall.y_m) < 0.05 || Math.abs(hall.y_m + hall.h_m - bano.y_m) < 0.05;
      const pegadosEnX = Math.abs(bano.x_m + bano.w_m - hall.x_m) < 0.05 || Math.abs(hall.x_m + hall.w_m - bano.x_m) < 0.05;
      expect(pegadosEnY || pegadosEnX).toBe(true);
    }
  });

  it('sólo el perfil orgánico declara envolvente curva', () => {
    expect(generar('organico').envolvente).toBe('organica');
    expect(generar('fiel-cliente').envolvente).toBe('rectangular');
    expect(generar('bioclimatico').envolvente).toBe('rectangular');
  });
});

describe('núcleo de servicios apilado', () => {
  it('el baño deja de salir como una tira', () => {
    // Sin apilar, el baño compartía el alto de la banda y salía de 0,9–1,6 m.
    for (const perfil of PERFILES_VISIBLES) {
      const bano = generar(perfil).ambientes.find(r => r.tipo === 'bano')!;
      expect(Math.min(bano.w_m, bano.h_m)).toBeGreaterThanOrEqual(anchoMinimoDe('bano') - 0.01);
    }
  });

  it('ningún ambiente queda por debajo de su ancho utilizable', () => {
    for (const perfil of PERFILES_VISIBLES) {
      const ap = generar(perfil);
      for (const r of ap.ambientes) {
        expect(Math.min(r.w_m, r.h_m)).toBeGreaterThanOrEqual(anchoMinimoDe(r.tipo) - 0.01);
      }
      // Y por lo tanto tampoco se emite la advertencia de ancho inutilizable.
      expect(ap.advertencias.some(a => a.startsWith('Por debajo del ancho utilizable'))).toBe(false);
    }
  });

  it('los apilados no se superponen ni se salen de su banda', () => {
    for (const perfil of PERFILES_VISIBLES) {
      const rects = generar(perfil).ambientes;
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i]!;
          const b = rects[j]!;
          const solapaX = a.x_m < b.x_m + b.w_m - 0.01 && b.x_m < a.x_m + a.w_m - 0.01;
          const solapaY = a.y_m < b.y_m + b.h_m - 0.01 && b.y_m < a.y_m + a.h_m - 0.01;
          expect(solapaX && solapaY).toBe(false);
        }
      }
    }
  });

  it('conserva el área de programa de cada ambiente y la huella exacta', () => {
    for (const perfil of PERFILES_VISIBLES) {
      const ap = generar(perfil);
      for (const r of ap.ambientes) expect(r.w_m * r.h_m).toBeCloseTo(r.area_m2, 1);
      expect(ap.ancho_m * ap.profundo_m).toBeCloseTo(ap.area_total_m2, 0);
    }
  });

  it('el mobiliario sigue entrando en cada ambiente', () => {
    for (const perfil of PERFILES_VISIBLES) {
      for (const r of generar(perfil).ambientes) {
        for (const m of mobiliarioDe(r)) {
          expect(m.x_m).toBeGreaterThanOrEqual(r.x_m - 0.01);
          expect(m.y_m).toBeGreaterThanOrEqual(r.y_m - 0.01);
          expect(m.x_m + m.w_m).toBeLessThanOrEqual(r.x_m + r.w_m + 0.01);
          expect(m.y_m + m.h_m).toBeLessThanOrEqual(r.y_m + r.h_m + 0.01);
        }
      }
    }
  });
});
