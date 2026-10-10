/**
 * Juntar el agua de cinco pestañas sin contarla dos veces.
 *
 * El caso que este archivo existe para que no vuelva: Captación tiene «bovinos:
 * 40» porque alguien lo cargó ahí, Producción tiene un rodeo de 40 cabezas
 * porque es donde va el rodeo, y sumar las dos listas dimensiona la reserva
 * para ochenta vacas. El número que sale es perfectamente plausible, que es
 * exactamente el modo en que esta app falla.
 */
import { describe, it, expect } from 'vitest';
import {
  caudalALMin, contrastarRed, reunirDemandas, reunirFuentes, rubroDeConsumo,
} from '../../../lib/balanceAgua';
import type { CaptacionSnapshot, ConsumoPorCategoria } from '../../../lib/captacion';
import type { Rodeo } from '../../../lib/rodeo';
import type { RiegoResumen } from '../../../lib/riego';
import type { FichaRepresa } from '../../../lib/represasGuardadas';

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Doce temperaturas de Traslasierra: verano a 24 °C, invierno a 9 °C. */
const TMEAN = [24, 23, 20, 16, 12, 9, 9, 11, 14, 18, 21, 23];

function categoria(
  id: string, nombre: string, tipo: ConsumoPorCategoria['tipo'], litros_dia: number,
): ConsumoPorCategoria {
  const mensual = DIAS_MES.map(d => (litros_dia * d) / 1000);
  return {
    id, nombre, tipo, litros_dia,
    anual_m3: mensual.reduce((a, b) => a + b, 0),
    mensual_m3: mensual,
    porcentaje: 0,
  };
}

function captacion(cats: ConsumoPorCategoria[]): CaptacionSnapshot {
  return {
    resultado: {
      consumo_por_categoria: cats,
      consumo_total_litros_dia: cats.reduce((s, c) => s + c.litros_dia, 0),
    },
  } as unknown as CaptacionSnapshot;
}

const rodeo = (cabezas: number): Rodeo => ({
  lotes: [{ id: 'l1', categoriaId: 'bovino_vaca_prom', cabezas, litros_animal_dia: null }],
  riego_m3_mes: 0,
  origen: 'manual',
});

const riego = (over: Partial<RiegoResumen> = {}): RiegoResumen => ({
  cultivo: 'Huerta', sistema: 'Goteo', area_ha: 0.1, mes_pico: 'ene',
  neto_pico_mm_dia: 5, caudal_continuo_ls: 0.1, volumen_anual_m3: 730,
  intervalo_dias: 2, lamina_neta_mm: 12,
  ...over,
});

describe('rubroDeConsumo', () => {
  it('manda las cinco filas de animales al mismo rubro', () => {
    for (const t of ['bovinos', 'caprinos_ovinos', 'porcinos', 'aves', 'equinos'] as const) {
      expect(rubroDeConsumo(t)).toBe('ganaderia');
    }
  });

  it('huerta y cultivo extensivo son los dos riego', () => {
    expect(rubroDeConsumo('huerta')).toBe('riego');
    expect(rubroDeConsumo('cultivo_extensivo')).toBe('riego');
  });

  it('lo doméstico y lo personalizado van por su cuenta', () => {
    expect(rubroDeConsumo('domestico')).toBe('domestico');
    expect(rubroDeConsumo('personalizado')).toBe('otro');
  });
});

describe('reunirDemandas · la misma agua contada una sola vez', () => {
  it('EL CASO: 40 vacas en Captación y 40 en el rodeo no son ochenta', () => {
    const d = reunirDemandas({
      captacion: captacion([categoria('c1', 'Bovinos', 'bovinos', 40 * 50)]),
      rodeo:     rodeo(40),
      tmean_c:   TMEAN,
    });

    const suman = d.aportes.filter(a => a.descartado === null);
    expect(suman).toHaveLength(1);
    expect(suman[0]!.origen).toBe('rodeo');
    expect(d.descartados).toBe(1);

    // Y el total es el del rodeo, no la suma de los dos.
    expect(d.total_l_dia).toBeCloseTo(suman[0]!.l_dia, 6);
  });

  it('el descartado sigue en la lista, con el motivo: no desaparece', () => {
    const d = reunirDemandas({
      captacion: captacion([categoria('c1', 'Bovinos', 'bovinos', 2000)]),
      rodeo:     rodeo(40),
      tmean_c:   TMEAN,
    });
    const fuera = d.aportes.find(a => a.descartado !== null)!;
    expect(fuera.origen).toBe('captacion');
    expect(fuera.descartado).toContain('Ya está contada');
    expect(fuera.descartado).toContain('agua por temperatura');
  });

  it('el riego del panel desplaza la huerta y el cultivo de Captación', () => {
    const d = reunirDemandas({
      captacion: captacion([
        categoria('c1', 'Huerta', 'huerta', 2000),
        categoria('c2', 'Cultivo', 'cultivo_extensivo', 5000),
        categoria('c3', 'Casa', 'domestico', 320),
      ]),
      riego: riego(),
    });
    const suman = d.aportes.filter(a => a.descartado === null).map(a => a.id);
    expect(suman).toContain('riego');
    expect(suman).toContain('captacion:c3');
    expect(suman).not.toContain('captacion:c1');
    expect(suman).not.toContain('captacion:c2');
    expect(d.descartados).toBe(2);
  });

  it('sin rodeo cargado, la fila de bovinos de Captación sigue valiendo', () => {
    const d = reunirDemandas({
      captacion: captacion([categoria('c1', 'Bovinos', 'bovinos', 2000)]),
      rodeo:     rodeo(0),
    });
    expect(d.descartados).toBe(0);
    expect(d.total_l_dia).toBe(2000);
  });

  it('lo doméstico y lo personalizado nunca se descartan', () => {
    const d = reunirDemandas({
      captacion: captacion([
        categoria('c1', 'Casa', 'domestico', 320),
        categoria('c2', 'Lavadero', 'personalizado', 100),
      ]),
      rodeo:   rodeo(40),
      tmean_c: TMEAN,
      riego:   riego(),
    });
    expect(d.aportes.filter(a => a.descartado !== null)).toHaveLength(0);
  });
});

describe('reunirDemandas · el pico, que es con lo que se dimensiona la racha', () => {
  it('el pico de la hacienda es el verano, no el promedio del año', () => {
    const d = reunirDemandas({ rodeo: rodeo(40), tmean_c: TMEAN });
    const a = d.aportes[0]!;
    expect(a.pico_l_dia).toBeGreaterThan(a.l_dia);
    // Enero (24 °C) contra el promedio de un año que baja a 9 °C en invierno.
    expect(a.mes_pico).toBe(0);
  });

  it('el pico del riego es la lámina del mes de más demanda, no el anual/365', () => {
    // 5 mm/día sobre 1 ha son 50 m³/día = 50.000 L, contra 2.000 L de promedio.
    const d = reunirDemandas({ riego: riego({ area_ha: 1, neto_pico_mm_dia: 5, volumen_anual_m3: 730 }) });
    const a = d.aportes[0]!;
    expect(a.l_dia).toBeCloseTo(2000, 0);
    expect(a.pico_l_dia).toBeCloseTo(50_000, 0);
  });

  it('el pico nunca queda por debajo del promedio', () => {
    const d = reunirDemandas({
      captacion: captacion([categoria('c1', 'Casa', 'domestico', 320)]),
      riego:     riego({ neto_pico_mm_dia: 0, area_ha: 0 }),
    });
    for (const a of d.aportes) expect(a.pico_l_dia).toBeGreaterThanOrEqual(a.l_dia);
  });

  it('avisa cuando el día pico se despega del promedio', () => {
    const d = reunirDemandas({ riego: riego({ area_ha: 1, neto_pico_mm_dia: 5 }) });
    expect(d.advertencias.join(' ')).toContain('cae en la seca');
  });

  it('sin clima no se puede usar la tabla por temperatura, y lo dice', () => {
    const d = reunirDemandas({ rodeo: rodeo(40) });
    expect(d.advertencias.join(' ')).toContain('tabla por temperatura');
    expect(d.total_l_dia).toBeGreaterThan(0);
  });
});

describe('reunirDemandas · el total mensual', () => {
  it('el anual de un consumo plano es litros por día por 365', () => {
    const d = reunirDemandas({ captacion: captacion([categoria('c1', 'Casa', 'domestico', 1000)]) });
    expect(d.anual_m3).toBe(365);
    expect(d.mensual_m3).toHaveLength(12);
    expect(d.mensual_m3[0]).toBeCloseTo(31, 1);
  });

  it('sin nada cargado devuelve ceros y no rompe', () => {
    const d = reunirDemandas({});
    expect(d.total_l_dia).toBe(0);
    expect(d.pico_l_dia).toBe(0);
    expect(d.anual_m3).toBe(0);
    expect(d.aportes).toHaveLength(0);
  });
});

describe('caudalALMin · la unidad cambia el veredicto por un factor 60', () => {
  it('lee las unidades que la red imprime', () => {
    expect(caudalALMin('10 L/min')).toBe(10);
    expect(caudalALMin('2 L/s')).toBe(120);
    expect(caudalALMin('600 L/h')).toBe(10);
    expect(caudalALMin('3 m³/h')).toBeCloseTo(50, 6);
  });

  it('acepta la coma decimal, que es la de acá', () => {
    expect(caudalALMin('7,5 L/min')).toBe(7.5);
  });

  it('devuelve null antes que adivinar una unidad', () => {
    expect(caudalALMin('10')).toBeNull();
    expect(caudalALMin('')).toBeNull();
    expect(caudalALMin(null)).toBeNull();
    expect(caudalALMin('0 L/min')).toBeNull();
  });
});

describe('contrastarRed · la reserva llena y el agua que no llega', () => {
  const red = (caudal: string) => ({ caudal } as never);

  it('detecta que el caño no mueve el día pico ni corriendo 24 h', () => {
    // 5 L/min × 1440 = 7.200 L, contra 20.000 pedidos.
    const c = contrastarRed(red('5 L/min'), 20_000)!;
    expect(c.estrangula).toBe(true);
    expect(c.techo_l_dia).toBe(7200);
    expect(c.lectura).toContain('el cuello no es el agua, es el caño');
  });

  it('cuando alcanza, dice cuántas horas de bombeo hacen falta', () => {
    const c = contrastarRed(red('10 L/min'), 1200)!;
    expect(c.estrangula).toBe(false);
    expect(c.horas_necesarias).toBe(2);
  });

  it('sin caudal legible o sin demanda no hay contraste que hacer', () => {
    expect(contrastarRed(red('—'), 1000)).toBeNull();
    expect(contrastarRed(red('10 L/min'), 0)).toBeNull();
    expect(contrastarRed(null, 1000)).toBeNull();
  });
});

describe('reunirFuentes · lo ya diseñado entra; lo sólo marcado, no', () => {
  const ficha = (over: Partial<FichaRepresa> = {}): FichaRepresa => ({
    nivel_m: 740, capacidad_m3: 1800, area_espejo_m2: 1200, prof_max_m: 2.8,
    alturaMuro_m: 3.5, largoMuro_m: 60, compactado_m3: 900, banco_m3: 1100,
    eficiencia: 1.6, viable: true, perfilUsado: true,
    ...over,
  });

  it('una represa archivada trae su volumen y su espejo', () => {
    const f = reunirFuentes({ represas: [{ id: 'r1', nombre: 'Represa 1', ficha: ficha() }] });
    expect(f.sugeridas).toHaveLength(1);
    expect(f.sugeridas[0]!.fuente.volumen_m3).toBe(1800);
    expect(f.sugeridas[0]!.fuente.espejo_m2).toBe(1200);
    expect(f.sugeridas[0]!.fuente.tipo).toBe('represa');
  });

  it('no vuelve a ofrecer una que ya está en el inventario', () => {
    const f = reunirFuentes({
      represas:   [{ id: 'r1', nombre: 'Represa 1', ficha: ficha() }],
      yaCargadas: [{ nombre: 'represa 1' } as never],
    });
    expect(f.sugeridas).toHaveLength(0);
  });

  it('una represa sin capacidad no entra: no hay volumen que sumar', () => {
    const f = reunirFuentes({ represas: [{ id: 'r1', nombre: 'R', ficha: ficha({ capacidad_m3: 0 }) }] });
    expect(f.sugeridas).toHaveLength(0);
  });

  it('un marcador del plano se cuenta y NO se convierte en volumen inventado', () => {
    const f = reunirFuentes({ aguadas: [{ tipo: 'represa' }, { tipo: 'represa' }, { tipo: 'swale' }] });
    expect(f.sugeridas).toHaveLength(0);
    expect(f.sin_dimensionar).toBe(2);
    expect(f.advertencias.join(' ')).toContain('sin dimensionar');
  });
});
