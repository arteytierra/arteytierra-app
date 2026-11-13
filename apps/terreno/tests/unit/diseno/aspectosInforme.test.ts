import { describe, it, expect } from 'vitest';
import {
  aspectosAConsiderar, AGUA_UTIL_BAJA_MM, PENDIENTE_MODERADA_PCT,
  PENDIENTE_PRONUNCIADA_PCT, RACHA_SECA_LARGA_DIAS, SUELO_DESCUBIERTO_PCT,
  type EntradaAspectos,
} from '@/lib/aspectosInforme';
import { BBF_SURCO_MIN_PCT, BBF_SURCO_MAX_PCT } from '@/lib/saludCalculo';
import type { SueloExpansivo } from '@/lib/sueloExpansivo';

/**
 * Sólo se lee `nivel`: el resto del diagnóstico lo imprime la sección de
 * suelo, no el resumen ejecutivo.
 */
const expansivo = (nivel: 'medido' | 'posible'): SueloExpansivo => ({
  nivel,
  criterio: nivel === 'medido' ? 'vertisol_ssurgo' : 'actividad_arcilla',
  arcilla_pct: 44.1, cec: 40.2, actividad: 91,
  lep_pct: nivel === 'medido' ? 9.3 : null,
  taxorder: nivel === 'medido' ? 'Vertisols' : null,
  cautela: '(cautela)', detalle: '(detalle)', efecto_hidrologico: '(efecto)',
});

/** Un vertisol del Decán: semiárido, grupo D y pendiente de media loma. */
function decan(exp: SueloExpansivo | null, pendiente_pct = 10): EntradaAspectos {
  return {
    clima: { aridez: { valor: 0.35, clase: 'Semiárido' } },
    topo: { pendiente_pct },
    suelo: {
      agua_util: {
        total_mm_100: 160, total_mm_200: 300, por_capa: [],
        clase: 'Alta', color: 'verde', descripcion: '',
      },
      grupo_hidro: {
        grupo: 'D', ksat_min: 1.4, capa_limitante: '30–100 cm',
        cn_pastura: 84, infiltracion: 'muy baja', descripcion: '',
      },
      expansivo: exp,
    },
  };
}

describe('aspectosAConsiderar', () => {
  describe('sin suelo expansivo nada cambia', () => {
    it('devuelve las frases heredadas, palabra por palabra', () => {
      const n = aspectosAConsiderar(decan(null));
      expect(n).toEqual([
        'Clima semiárido: priorizar captación, almacenamiento y retención de agua (represas, keyline, cobertura).',
        'Pendiente general moderada (10 %): manejar el escurrimiento con trazados a nivel.',
        'Grupo hidrológico D: baja infiltración y mayor escurrimiento; dimensionar drenajes y reservorios en consecuencia.',
      ]);
    });

    it('y las de pendiente pronunciada, heladas, agua útil, racha y cobertura', () => {
      const n = aspectosAConsiderar({
        clima: { aridez: { valor: 0.9, clase: 'Húmedo' }, heladas: { meses_riesgo: ['jun', 'jul'], meses_seguras: [], periodo_libre: '' } },
        topo: { pendiente_pct: 22 },
        suelo: {
          agua_util: { total_mm_100: 70, total_mm_200: 120, por_capa: [], clase: 'Baja', color: 'rojo', descripcion: '' },
          grupo_hidro: { grupo: 'B', ksat_min: 20, capa_limitante: '', cn_pastura: 61, infiltracion: '', descripcion: '' },
          expansivo: null,
        },
        extremos: { sequia: { racha_max_dias: 48, racha_anual_p50: 20, racha_anual_p90: 40 } },
        cobertura: { suelo_pct: 41 } as EntradaAspectos['cobertura'],
      });
      expect(n).toEqual([
        'Riesgo de heladas (jun, jul): elegir especies y fechas de siembra acordes.',
        'Pendiente general pronunciada (22 %): riesgo de erosión; considerar terrazas, keyline o cobertura permanente.',
        'Baja capacidad de agua útil (70 mm): suelos de poca retención; aportar materia orgánica.',
        'Racha seca histórica de 48 días: prever reserva de agua para el período crítico.',
        'Suelo descubierto en 41 % del predio: oportunidad de aumentar la cobertura vegetal.',
      ]);
    });

    it('sin datos no inventa ninguna frase', () => {
      expect(aspectosAConsiderar({})).toEqual([]);
    });

    it('los umbrales editoriales siguen donde estaban', () => {
      expect([
        PENDIENTE_PRONUNCIADA_PCT, PENDIENTE_MODERADA_PCT,
        AGUA_UTIL_BAJA_MM, RACHA_SECA_LARGA_DIAS, SUELO_DESCUBIERTO_PCT,
      ]).toEqual([15, 8, 100, 30, 30]);
    });
  });

  describe('con suelo expansivo el resumen deja de recomendar obras a nivel', () => {
    it('la obra va primero y nombra el camellón publicado', () => {
      const n = aspectosAConsiderar(decan(expansivo('medido')));
      expect(n[0]).toMatch(/^Suelo expansivo: la obra de agua acá no va a nivel\./);
      expect(n[0]).toContain('camellón ancho con el surco a pendiente, entre 0,4 y 0,8 %');
      expect(n[0]).toContain('Una zanja a nivel hace lo contrario.');
      expect(n[0]).toContain('«Análisis de suelo»');
    });

    it('ninguna frase manda trazar a nivel ni retener con keyline', () => {
      const n = aspectosAConsiderar(decan(expansivo('medido'))).join(' | ');
      expect(n).not.toContain('con trazados a nivel.');
      expect(n).not.toContain('retención de agua (represas, keyline, cobertura)');
      expect(n).toContain('con trazados a pendiente suave, del orden de 0,4 a 0,8 %, y no a nivel.');
      expect(n).toContain('no para retenerla');
    });

    it('en pendiente pronunciada tampoco propone terrazas y keyline sueltos', () => {
      const n = aspectosAConsiderar(decan(expansivo('medido'), 22)).join(' | ');
      expect(n).not.toContain('considerar terrazas, keyline o cobertura permanente.');
      expect(n).toContain('el surco publicado corre entre 0,4 y 0,8 %');
    });

    it('el grupo hidrológico deja de prometer baja infiltración todo el año', () => {
      const n = aspectosAConsiderar(decan(expansivo('medido'))).join(' | ');
      expect(n).not.toContain('Grupo hidrológico D: baja infiltración y mayor escurrimiento');
      expect(n).toMatch(/Grupo hidrológico D: la tabla le pone baja infiltración todo el año/);
      expect(n).toContain('del lado optimista');
    });

    it('cuando el dato es inferido lo dice en el título de la frase', () => {
      const n = aspectosAConsiderar(decan(expansivo('posible')));
      expect(n[0]).toMatch(/^Puede ser suelo expansivo: /);
      // y el resto del aviso es el mismo: la obra no cambia por la confianza
      expect(n[0]).toContain('camellón ancho con el surco a pendiente, entre 0,4 y 0,8 %');
    });

    it('la pendiente del surco sale de saludCalculo y no de una copia', () => {
      const banda = `entre ${String(BBF_SURCO_MIN_PCT).replace('.', ',')} y ${String(BBF_SURCO_MAX_PCT).replace('.', ',')} %`;
      expect(aspectosAConsiderar(decan(expansivo('medido')))[0]).toContain(banda);
    });

    it('sin datos de suelo el consejo vuelve a ser el general', () => {
      const n = aspectosAConsiderar({ clima: { aridez: { valor: 0.35, clase: 'Semiárido' } } });
      expect(n).toEqual([
        'Clima semiárido: priorizar captación, almacenamiento y retención de agua (represas, keyline, cobertura).',
      ]);
    });
  });
});
