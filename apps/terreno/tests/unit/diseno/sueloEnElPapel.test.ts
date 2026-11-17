import { describe, it, expect } from 'vitest';
import {
  avisoPlanillaExpansivo, avisoMaterialesExpansivo, avisoEtapasExpansivo,
  movimientoVerticalMaxCm, ESPESOR_PERFIL_CM,
  GRIETA_SEP_MIN_CM, GRIETA_SEP_MAX_CM,
} from '@/lib/sueloEnElPapel';
import type { SueloExpansivo } from '@/lib/sueloExpansivo';

/**
 * Sólo se leen `nivel` y `lep_pct`: el resto del diagnóstico lo imprime la
 * sección de suelo del informe, no las hojas de papel.
 */
const expansivo = (
  nivel: 'medido' | 'posible', lep_pct: number | null = 9.3,
): SueloExpansivo => ({
  nivel,
  criterio: nivel === 'medido' ? 'vertisol_ssurgo' : 'actividad_arcilla',
  arcilla_pct: 44.1, cec: 40.2, actividad: 91,
  lep_pct,
  taxorder: nivel === 'medido' ? 'Vertisols' : null,
  cautela: '(cautela)', detalle: '(detalle)', efecto_hidrologico: '(efecto)',
});

const LOS_TRES = [
  ['planilla',   avisoPlanillaExpansivo],
  ['materiales', avisoMaterialesExpansivo],
  ['etapas',     avisoEtapasExpansivo],
] as const;

describe('el suelo en las tres entregas de papel', () => {
  describe('sin diagnóstico el papel sale exactamente como salía', () => {
    it.each(LOS_TRES)('%s no inventa un aviso', (_n, fn) => {
      expect(fn({})).toBeNull();
      expect(fn({ expansivo: null })).toBeNull();
    });
  });

  describe('el nivel y el título siguen al dato, no a la obra', () => {
    it.each(LOS_TRES)('%s: medido alerta, inferido avisa', (_n, fn) => {
      const m = fn({ expansivo: expansivo('medido') });
      const p = fn({ expansivo: expansivo('posible') });
      expect(m?.nivel).toBe('alerta');
      expect(p?.nivel).toBe('aviso');
      expect(m?.titulo).toMatch(/^Suelo expansivo: /);
      expect(p?.titulo).toMatch(/^Puede ser suelo expansivo: /);
    });

    it('los tres ids son distintos y estables', () => {
      const ids = LOS_TRES.map(([, fn]) => fn({ expansivo: expansivo('medido') })?.id);
      expect(ids).toEqual([
        'suelo_expansivo_planilla',
        'suelo_expansivo_materiales',
        'suelo_expansivo_etapas',
      ]);
    });
  });

  describe('el movimiento vertical es una conversión de unidades, no un modelo', () => {
    it('un LEP sobre un metro se lee en centímetros', () => {
      expect(ESPESOR_PERFIL_CM).toBe(100);
      expect(movimientoVerticalMaxCm(9.3)).toBe(9.3);
      // Heiden, Riesel TX: el vertisol medido de la ficha, LEP 12,0 %.
      expect(movimientoVerticalMaxCm(12)).toBe(12);
    });

    it('con otro espesor escala lineal', () => {
      expect(movimientoVerticalMaxCm(9.3, 50)).toBe(4.7);
      expect(movimientoVerticalMaxCm(12, 200)).toBe(24);
    });

    it('sin LEP medido no hay número', () => {
      expect(movimientoVerticalMaxCm(null)).toBeNull();
      expect(movimientoVerticalMaxCm(undefined)).toBeNull();
      expect(movimientoVerticalMaxCm(0)).toBeNull();
      expect(movimientoVerticalMaxCm(-1)).toBeNull();
      expect(movimientoVerticalMaxCm(NaN)).toBeNull();
    });
  });

  describe('la planilla', () => {
    it('da el orden de magnitud y lo declara cota superior', () => {
      const a = avisoPlanillaExpansivo({ expansivo: expansivo('medido') })!;
      expect(a.titulo).toContain('la cota de un mojón no es un número fijo');
      expect(a.detalle).toContain('extensibilidad lineal medida acá es de 9,3 %');
      expect(a.detalle).toContain('del orden de 9,3 cm');
      expect(a.detalle).toContain('cota superior y no un pronóstico');
    });

    it('sin LEP lo dice en vez de callarse', () => {
      const a = avisoPlanillaExpansivo({ expansivo: expansivo('posible', null) })!;
      expect(a.detalle).toContain('no está medida');
      expect(a.detalle).not.toContain('del orden de');
    });

    it('manda renivelar el mojón y avisa de la grieta', () => {
      const a = avisoPlanillaExpansivo({ expansivo: expansivo('medido') })!;
      expect(a.detalle).toContain('renivelar el mojón de referencia al empezar cada tramo');
      expect(a.detalle).toContain(`grietas cada ${GRIETA_SEP_MIN_CM} a ${GRIETA_SEP_MAX_CM} cm`);
    });
  });

  describe('la lista de materiales', () => {
    it('declara que no cotiza el camellón ni sus cauces', () => {
      const a = avisoMaterialesExpansivo({ expansivo: expansivo('medido') })!;
      expect(a.detalle).toContain('desagües de parcela y cauces empastados');
      expect(a.detalle).toContain('no tiene acá ningún renglón');
      expect(a.detalle).toContain('«Análisis de suelo»');
    });

    it('trae la recomendación publicada que va contra excavar', () => {
      const a = avisoMaterialesExpansivo({ expansivo: expansivo('medido') })!;
      expect(a.detalle).toContain('«no muy significativos»');
      expect(a.detalle).toContain('manejo agronómico');
    });
  });

  describe('el plan por etapas', () => {
    it('desarma la mitad falsa de la asimetría en vez de repetirla', () => {
      const a = avisoEtapasExpansivo({ expansivo: expansivo('medido') })!;
      expect(a.detalle).toMatch(/mojando por aspersión\. Acá no:/);
      expect(a.detalle).toContain('el agua se mete por las grietas');
      expect(a.detalle).toContain('dejando la superficie seca');
    });

    it('dice que la ventana es angosta de los dos lados', () => {
      const a = avisoEtapasExpansivo({ expansivo: expansivo('medido') })!;
      expect(a.detalle).toContain('rango de humedad angosto');
      expect(a.detalle).toContain('angosta de los dos lados');
      expect(a.detalle).toContain('el mes bueno es el hombro de la temporada');
      expect(a.detalle).not.toContain('banda de meses buenos');
    });
  });
});
