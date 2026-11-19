/**
 * Tests del paso efectivo del relieve y del piso de intervalo de curvas.
 *
 * El bug que motivó estas pruebas: la app asumía SRTM (~30 m) en todo el planeta
 * aunque el relieve viniera de swissALTI3D (2 m) o de AHN (50 cm). Consecuencias
 * visibles en un predio suizo: se negaba a dibujar curvas por debajo de 2 m
 * teniendo con qué, y avisaba de un "ruido del sensor SRTM" que no existía.
 */
import { describe, it, expect } from 'vitest';
import {
  pasoEfectivoM, pasoFuenteM, PASO_RELIEVE, PASO_FINO_RELIEVE, ETIQUETA_RELIEVE,
} from '@/lib/grillaElevacion';
import {
  intervaloConfiablePara,
  intervaloConfiableRemoto,
  INTERVALO_CONFIABLE_M,
} from '@/lib/curvasNivel';
import { grillaDesdeFn, type BBoxLL } from './_grilla';

/** ~1,1 km de lado (Berna): con N nodos por lado el paso es ~1100/(N-1) m. */
const KM: BBoxLL = { latMin: 46.890, latMax: 46.900, lngMin: 7.480, lngMax: 7.4946 };
/** ~110 m de lado: con 111 nodos por lado el paso es ~1 m. */
const CIEN_M: BBoxLL = { latMin: 46.890, latMax: 46.891, lngMin: 7.480, lngMax: 7.48147 };

describe('PASO_RELIEVE', () => {
  it('cubre exactamente las mismas fuentes que las tablas de atribución', () => {
    expect(Object.keys(PASO_RELIEVE).sort()).toEqual(Object.keys(ETIQUETA_RELIEVE).sort());
  });

  it('los servicios nacionales finos son más finos que el satelital global', () => {
    expect(PASO_RELIEVE.ahnnl).toBeLessThan(PASO_RELIEVE.glo30);
    expect(PASO_RELIEVE.swisstopo).toBeLessThan(PASO_RELIEVE.glo30);
    expect(PASO_RELIEVE.glo30).toBe(PASO_RELIEVE.srtm30);
  });
});

describe('pasoEfectivoM', () => {
  it('con muestreo grueso manda el muestreo, no la fuente', () => {
    // 12 nodos sobre 1,1 km → ~100 m de paso, muy por encima de los 2 m de Suiza.
    const g = { ...grillaDesdeFn(12, 12, (r) => r, KM), fuente: 'swisstopo' as const };
    expect(pasoEfectivoM(g)).toBeGreaterThan(90);
  });

  it('con muestreo fino manda la fuente: no se inventa resolución que no hay', () => {
    // 111 nodos sobre 110 m → 1 m de muestreo, pero swissALTI3D da 2 m.
    const g = { ...grillaDesdeFn(111, 111, (r) => r, CIEN_M), fuente: 'swisstopo' as const };
    expect(pasoEfectivoM(g)).toBe(PASO_RELIEVE.swisstopo);
  });

  it('sin fuente declarada cae al satelital (nunca finge ser más fino)', () => {
    const g = grillaDesdeFn(111, 111, (r) => r, CIEN_M);   // sin `fuente`
    expect(pasoEfectivoM(g)).toBe(PASO_RELIEVE.terrarium);
  });

  /**
   * swissALTI3D publica el mismo km² en 0,5 m y en 2 m, y cuál se leyó lo
   * decide el tamaño del predio. Con la constante de 2 m la app se negaba a
   * dibujar curvas cada 0,25 m teniendo el modelo de 0,5 m con qué hacerlo.
   */
  it('el paso que viene CON la grilla le gana a la tabla por fuente', () => {
    const base = grillaDesdeFn(221, 221, (r) => r, CIEN_M);   // ~0,5 m de muestreo
    const conTabla = { ...base, fuente: 'swisstopo' as const };
    const leido    = { ...base, fuente: 'swisstopo' as const, paso_fuente_m: 0.5 };
    expect(pasoFuenteM(conTabla)).toBe(2);
    expect(pasoFuenteM(leido)).toBe(0.5);
    expect(pasoEfectivoM(leido)).toBeLessThan(pasoEfectivoM(conTabla));
    expect(intervaloConfiableRemoto(pasoEfectivoM(leido))).toBeLessThan(
      intervaloConfiableRemoto(pasoEfectivoM(conTabla)),
    );
  });

  it('el muestreo sigue mandando aunque el ráster sea de 0,5 m', () => {
    // 12 nodos sobre 1,1 km son ~100 m de paso: leer el DTM fino no cambia que
    // entre dos nodos hay interpolación y no terreno medido.
    const g = { ...grillaDesdeFn(12, 12, (r) => r, KM), fuente: 'swisstopo' as const, paso_fuente_m: 0.5 };
    expect(pasoEfectivoM(g)).toBeGreaterThan(90);
  });
});

describe('PASO_FINO_RELIEVE', () => {
  it('sólo lista fuentes que existen, y más finas que su paso de catálogo', () => {
    for (const [f, fino] of Object.entries(PASO_FINO_RELIEVE)) {
      const fuente = f as keyof typeof PASO_RELIEVE;
      expect(PASO_RELIEVE[fuente]).toBeDefined();
      expect(fino!).toBeLessThan(PASO_RELIEVE[fuente]);
    }
  });

  it('declara los 0,5 m de swissALTI3D, que es por lo que existe', () => {
    expect(PASO_FINO_RELIEVE.swisstopo).toBe(0.5);
  });
});

describe('intervaloConfiableRemoto', () => {
  it('nunca empeora el piso empírico del satelital', () => {
    // 30 m de paso daría 15 m con la regla de la media celda: absurdo, porque
    // SRTM tiene 30 m de paso pero exactitud vertical mucho mejor.
    expect(intervaloConfiableRemoto(30)).toBe(INTERVALO_CONFIABLE_M);
    expect(intervaloConfiablePara(30)).toBe(15);   // la regla del DEM propio sí lo hace
  });

  it('baja de 2 m cuando el modelo da para más', () => {
    expect(intervaloConfiableRemoto(2)).toBe(1);      // swissALTI3D
    expect(intervaloConfiableRemoto(0.5)).toBe(0.25); // AHN
  });

  it('sin dato de paso se queda en el piso empírico', () => {
    expect(intervaloConfiableRemoto(null)).toBe(INTERVALO_CONFIABLE_M);
  });

  it('tiene el mismo suelo duro que la regla del DEM propio', () => {
    expect(intervaloConfiableRemoto(0.01)).toBe(0.1);
  });
});
