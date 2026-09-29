import { describe, it, expect } from 'vitest';
import {
  porQueEsteSuelo,
  regimenHumedad, regimenTermico, intensidadMeteorizacion,
  lecturaLavado, lecturaTextura, arcillaQueBaja,
  biologiaDelSuelo, huellaVegetacion,
  FUENTES_POR_QUE,
  type RegimenHumedad, type RegimenTermico,
} from '@/lib/sueloPorQue';
import { clasificarAridez } from '@/lib/clima';
import type { DatosClima } from '@/lib/clima';
import type { CapaSuelo, DatosSuelo } from '@/lib/suelos';

/**
 * Este módulo no calcula una magnitud: emite **afirmaciones causales** sobre el
 * suelo de alguien. El modo de fallar es distinto al de un motor de cálculo y
 * es peor de detectar: una oración bien escrita y equivocada no se nota nunca.
 *
 * Por eso los tests apuntan a tres cosas y no a que devuelva un objeto:
 *
 * 1. Los umbrales publicados (Jobbágy & Jackson, Q10 de Davidson & Janssens,
 *    los cortes de aridez y de régimen térmico) están donde dice la fuente.
 * 2. Los sitios reales caen en el régimen que les corresponde.
 * 3. **La invariante que evita la afirmación huérfana**: si el módulo dice que
 *    el dato discrepa del clima, tiene que nombrar quién manda; si dice que
 *    coincide, no puede estar echándole la culpa a nadie.
 */

const DEPTHS: Array<[string, number, number]> = [
  ['0-5cm', 0, 5], ['5-15cm', 5, 15], ['15-30cm', 15, 30],
  ['30-60cm', 30, 60], ['60-100cm', 60, 100], ['100-200cm', 100, 200],
];

/** Perfil con carbono por capa y, si se quiere, arcilla y densidad por capa. */
const perfil = (
  socs: number[],
  opts: { arcillas?: number[]; dens?: number } = {},
): CapaSuelo[] =>
  DEPTHS.map(([label, top, bot], i) => ({
    label, prof_top: top, prof_bot: bot, espesor_mm: (bot - top) * 10,
    ph: 6, carbono_org: socs[i] ?? 0,
    arcilla: opts.arcillas?.[i] ?? 20, arena: 40, limo: 40,
    densidad_ap: opts.dens ?? 1.2, nitrogeno: 1.5, clase_textura: 'franco',
    pmp: 0.1, cc: 0.25, sat: 0.45, awc_frac: 0.15, awc_mm: 15, ksat: 10,
  }));

const suelo = (o: Partial<DatosSuelo> = {}): DatosSuelo => ({
  lat: -31, lng: -64, ph: 6, carbono_org: 15, arcilla: 22, arena: 38, limo: 40,
  densidad_ap: 1.2, nitrogeno: 1.5, clase_textura: 'franco',
  interp: {
    ph:         { clase: '', descripcion: '', color: 'verde' },
    carbono:    { clase: '', descripcion: '', color: 'verde' },
    textura:    { clase: 'franco', descripcion: '' },
    fertilidad: { clase: '', descripcion: '', color: 'verde' },
    recomendaciones: [],
  },
  perfil: perfil([20, 18, 14, 9, 5, 3]),
  agua_util:   { total_mm_100: 140, total_mm_200: 250, por_capa: [], clase: '', color: 'verde', descripcion: '' },
  grupo_hidro: { grupo: 'B', ksat_min: 12, capa_limitante: '', cn_pastura: 61, infiltracion: '', descripcion: '' },
  organico: null,
  roca: null,
  fuente: 'test',
  ...o,
});

const clima = (precip: number, etp: number, tmedia: number): DatosClima => ({
  lat: -31, lng: -64,
  precip_anual_mm: precip,
  etp_anual_mm:    etp,
  tmean_anual_c:   tmedia,
  viento_dir_ppal: 'NE',
  meses: [],
  fuente: 'test',
  weather_spark_url: '',
  aridez: clasificarAridez(precip, etp),
});

// ─────────────────────────────────────────────────────────────────────────────

describe('los dos manubrios del clima, en los cortes publicados', () => {
  it('el régimen de humedad usa los cortes de UNEP que ya tiene la app', () => {
    // 0,65 es el límite seco subhúmedo/subhúmedo: aproximadamente donde el
    // perfil deja de conservar carbonato libre (Jenny & Leonard 1934).
    expect(regimenHumedad(clasificarAridez(1000, 1000))).toBe<RegimenHumedad>('lavado');
    expect(regimenHumedad(clasificarAridez(980,  1000))).toBe<RegimenHumedad>('transicion');
    expect(regimenHumedad(clasificarAridez(650,  1000))).toBe<RegimenHumedad>('transicion');
    expect(regimenHumedad(clasificarAridez(640,  1000))).toBe<RegimenHumedad>('acumulacion');
  });

  it('el índice viene redondeado a dos decimales, y eso corre el borde', () => {
    // `clasificarAridez` redondea: 0,999 sale 1,00 y cae en «lavado». No es un
    // error, pero es una diferencia de un milímetro de lluvia que cambia el
    // régimen, y quedó escrita para que nadie la descubra de nuevo depurando.
    expect(clasificarAridez(999, 1000).valor).toBe(1);
    expect(regimenHumedad(clasificarAridez(999, 1000))).toBe<RegimenHumedad>('lavado');
  });

  it('los cortes térmicos son los regímenes de la Keys to Soil Taxonomy', () => {
    expect(regimenTermico(7.9)).toBe<RegimenTermico>('frio');
    expect(regimenTermico(8)).toBe<RegimenTermico>('templado');
    expect(regimenTermico(14.9)).toBe<RegimenTermico>('templado');
    expect(regimenTermico(15)).toBe<RegimenTermico>('calido');
    expect(regimenTermico(21.9)).toBe<RegimenTermico>('calido');
    expect(regimenTermico(22)).toBe<RegimenTermico>('muy_calido');
  });

  it('la meteorización intensa pide las dos cosas juntas, agua y calor', () => {
    expect(intensidadMeteorizacion('lavado', 'muy_calido')).toBe('intensa');
    expect(intensidadMeteorizacion('lavado', 'calido')).toBe('intensa');
    // Sobra agua pero no hay calor: la hidrólisis no corre igual.
    expect(intensidadMeteorizacion('lavado', 'templado')).toBe('moderada');
    expect(intensidadMeteorizacion('lavado', 'frio')).toBe('debil');
    // Hace calor pero no hay agua que lave: tampoco.
    expect(intensidadMeteorizacion('acumulacion', 'muy_calido')).toBe('debil');
  });
});

describe('la velocidad de descomposición, contra Davidson & Janssens (2006)', () => {
  it('a 10 °C la banda es exactamente 1, porque 10 °C es la referencia', () => {
    const b = biologiaDelSuelo('templado', 'transicion', 10).velocidad;
    expect(b).toEqual({ min: 1, max: 1 });
  });

  it('+10 °C da la banda Q10 publicada, 1,5 a 2,5', () => {
    const b = biologiaDelSuelo('calido', 'transicion', 20).velocidad;
    expect(b).toEqual({ min: 1.5, max: 2.5 });
  });

  it('a 25 °C descompone entre 1,8 y 4 veces más rápido que a 10 °C', () => {
    const b = biologiaDelSuelo('muy_calido', 'lavado', 25).velocidad!;
    expect(b.min).toBeCloseTo(1.84, 2);   // 1,5^1,5
    expect(b.max).toBeCloseTo(3.95, 2);   // 2,5^1,5
  });

  it('fuera del rango calibrado no inventa un número', () => {
    expect(biologiaDelSuelo('frio', 'lavado', -3).velocidad).toBeNull();
    expect(biologiaDelSuelo('muy_calido', 'lavado', 34).velocidad).toBeNull();
  });

  it('en clima seco avisa del efecto Birch, que es cuándo aparece el nitrógeno', () => {
    expect(biologiaDelSuelo('calido', 'acumulacion', 18).detalle).toContain('Birch');
    expect(biologiaDelSuelo('calido', 'lavado', 18).detalle).not.toContain('Birch');
  });
});

describe('la huella de la vegetación, contra Jobbágy & Jackson (2000)', () => {
  // La referencia: del carbono del primer metro, está en los primeros 20 cm el
  // ~50 % en bosques, el ~42 % en pastizales y el ~33 % en matorrales.

  it('un perfil concentrado arriba se lee como bosque', () => {
    const h = huellaVegetacion(perfil([40, 30, 15, 6, 3, 2]))!;
    expect(h.fraccion_0_20_pct).toBe(56);
    expect(h.parecido).toBe('bosque');
  });

  it('un perfil repartido se lee como pastizal', () => {
    const h = huellaVegetacion(perfil([30, 26, 18, 10, 6, 3]))!;
    expect(h.fraccion_0_20_pct).toBe(41);
    expect(h.parecido).toBe('pastizal');
  });

  it('un perfil con mucha raíz profunda se lee como matorral', () => {
    const h = huellaVegetacion(perfil([20, 16, 12, 9, 7, 5]))!;
    expect(h.fraccion_0_20_pct).toBe(32);
    expect(h.parecido).toBe('matorral');
  });

  it('un perfil uniforme no es la firma de ninguna vegetación', () => {
    // 20 de 100 cm son el 20 %: es aritmética, no ecología. Si esto se leyera
    // como "matorral" el módulo estaría viendo vegetación en el vacío.
    const h = huellaVegetacion(perfil([12, 12, 12, 12, 12, 12]))!;
    expect(h.fraccion_0_20_pct).toBe(20);
    expect(h.parecido).toBe('intermedio');
  });

  it('el stock sale en t/ha y las unidades cierran a mano', () => {
    // 20 g/kg × 1,3 g/cm³ × 100 cm = 26 kg C/m² = 260 t/ha en el primer metro.
    const h = huellaVegetacion(perfil([20, 20, 20, 20, 20, 20], { dens: 1.3 }))!;
    expect(h.stock_t_ha_100).toBe(260);
  });

  it('compara stock y no concentración: la densidad cambia el resultado', () => {
    // Mismo carbono en g/kg, distinta densidad arriba. Si el módulo comparara
    // g/kg la fracción sería idéntica, y no lo es.
    const suelto = perfil([30, 26, 18, 10, 6, 3], { dens: 1.0 });
    const pesado = suelto.map(c => ({ ...c, densidad_ap: c.prof_top < 20 ? 0.8 : 1.4 }));
    expect(huellaVegetacion(pesado)!.fraccion_0_20_pct)
      .toBeLessThan(huellaVegetacion(suelto)!.fraccion_0_20_pct);
  });

  it('sin el metro completo no hay fracción: el denominador no existe', () => {
    const corto = perfil([30, 26, 18, 0, 0, 0]).filter(c => c.prof_bot <= 30);
    expect(huellaVegetacion(corto)).toBeNull();
  });
});

describe('el lavado, en sitios reales', () => {
  it('Amazonia: sobra agua, hace calor, el suelo es ácido y arcilloso', () => {
    // ~2.200 mm, ETP ~1.400, 27 °C. Ferralsol típico: pH 4,5, 60 % de arcilla.
    const r = porQueEsteSuelo(suelo({ ph: 4.5, arcilla: 60 }), clima(2200, 1400, 27))!;
    expect(r.humedad).toBe('lavado');
    expect(r.termico).toBe('muy_calido');
    expect(r.intensidad).toBe('intensa');
    expect(r.lecturas[0]!.acuerdo).toBe('coincide');
    expect(r.lecturas[1]!.acuerdo).toBe('coincide');
    // Y lo que no puede faltar: mucha arcilla acá no es mucha fertilidad.
    expect(r.lecturas[1]!.porque).toContain('baja actividad');
  });

  it('monte seco: no sobra agua, el pH alcalino coincide', () => {
    const r = porQueEsteSuelo(suelo({ ph: 7.8, arcilla: 25 }), clima(200, 1000, 14))!;
    expect(r.humedad).toBe('acumulacion');
    expect(r.intensidad).toBe('debil');
    expect(r.lecturas[0]!.acuerdo).toBe('coincide');
    expect(r.lecturas[0]!.esperado).toContain('carbonato');
  });

  it('pampa: lluvia y evaporación empatadas, pH cerca del neutro', () => {
    const r = porQueEsteSuelo(suelo({ ph: 6.2 }), clima(950, 1000, 16.5))!;
    expect(r.humedad).toBe('transicion');
    expect(r.lecturas[0]!.acuerdo).toBe('coincide');
  });

  it('un suelo alcalino donde el clima lava delata que alguien repone bases', () => {
    const r = porQueEsteSuelo(suelo({ ph: 7.4 }), clima(1800, 1200, 20))!;
    expect(r.lecturas[0]!.acuerdo).toBe('discrepa');
    expect(r.lecturas[0]!.quienManda).toMatch(/calcáreo|basáltico/);
  });

  it('un suelo ácido donde el clima no lava puede ser un clima que cambió', () => {
    const r = porQueEsteSuelo(suelo({ ph: 5.4 }), clima(300, 1100, 18))!;
    expect(r.lecturas[0]!.acuerdo).toBe('discrepa');
    expect(r.lecturas[0]!.quienManda).toContain('cambió');
  });

  it('un pH imposible no se explica, se marca', () => {
    const l = lecturaLavado('lavado', 12);
    expect(l.acuerdo).toBe('sin_prediccion');
    expect(l.quienManda).toBeNull();
  });
});

describe('la textura, que es donde el clima explica menos', () => {
  it('el vertisol del Chaco: seco y arcilloso, y el módulo no lo niega', () => {
    // ~800 mm con ETP ~1.300 y 23 °C, sobre material rico en bases: 50 % de
    // arcilla. Si el módulo dijera "semiárido, entonces limoso", mentiría.
    const r = porQueEsteSuelo(suelo({ arcilla: 50, ph: 7.2 }), clima(800, 1300, 23))!;
    expect(r.intensidad).toBe('debil');
    expect(r.lecturas[1]!.acuerdo).toBe('discrepa');
    expect(r.lecturas[1]!.quienManda).toContain('vertisoles');
  });

  it('en el régimen intermedio no predice textura, y lo dice', () => {
    const l = lecturaTextura('moderada', 28);
    expect(l.acuerdo).toBe('sin_prediccion');
    expect(l.quienManda).toBeNull();
  });

  it('nunca afirma una textura: siempre informa la medida', () => {
    for (const i of ['debil', 'moderada', 'intensa'] as const) {
      for (const arc of [5, 20, 35, 50, 70]) {
        expect(lecturaTextura(i, arc).medido).toContain(`${arc} %`);
      }
    }
  });
});

describe('la arcilla que baja, con el umbral del horizonte argílico', () => {
  it('1,2× es el umbral y por debajo no se sospecha nada', () => {
    const justo = perfil([0,0,0,0,0,0], { arcillas: [20, 21, 24, 24, 22, 20] });
    expect(arcillaQueBaja(justo)).toEqual({ razon: 1.2, capa: '15-30cm' });

    const casi = perfil([0,0,0,0,0,0], { arcillas: [20, 21, 23.8, 23, 22, 20] });
    expect(arcillaQueBaja(casi)).toBeNull();
  });

  it('toma la capa de máxima arcilla, no la primera que supera', () => {
    const p = perfil([0,0,0,0,0,0], { arcillas: [20, 22, 25, 34, 30, 28] });
    expect(arcillaQueBaja(p)).toEqual({ razon: 1.7, capa: '30-60cm' });
  });

  it('sin perfil devuelve null en vez de romperse', () => {
    expect(arcillaQueBaja([])).toBeNull();
  });
});

describe('la invariante que evita la afirmación huérfana', () => {
  it('discrepa siempre nombra quién manda, y coincide nunca culpa a nadie', () => {
    const humedades: RegimenHumedad[] = ['lavado', 'transicion', 'acumulacion'];
    let vistos = 0;
    for (const h of humedades) {
      for (const ph of [4.0, 5.0, 5.9, 6.5, 7.2, 7.9, 8.6]) {
        const l = lecturaLavado(h, ph);
        vistos++;
        if (l.acuerdo === 'discrepa') expect(l.quienManda, `${h}/${ph}`).toBeTruthy();
        else expect(l.quienManda, `${h}/${ph}`).toBeNull();
        expect(l.porque.length).toBeGreaterThan(80);
      }
      for (const arc of [5, 20, 33, 48, 65]) {
        const l = lecturaTextura(intensidadMeteorizacion(h, 'calido'), arc);
        vistos++;
        if (l.acuerdo === 'discrepa') expect(l.quienManda).toBeTruthy();
        else expect(l.quienManda).toBeNull();
      }
    }
    expect(vistos).toBe(36);
  });
});

describe('la regla del silencio', () => {
  it('sin clima no hay explicación, no hay generalidad', () => {
    expect(porQueEsteSuelo(suelo(), null)).toBeNull();
  });

  it('sin suelo tampoco: no se explica un dato que no existe', () => {
    expect(porQueEsteSuelo(null, clima(900, 1000, 16))).toBeNull();
  });

  it('con ETP en cero no divide por cero ni inventa un índice', () => {
    expect(porQueEsteSuelo(suelo(), clima(900, 0, 16))).toBeNull();
  });
});

describe('las fuentes', () => {
  it('cada afirmación del módulo tiene una cita con autor y año', () => {
    expect(FUENTES_POR_QUE.length).toBeGreaterThanOrEqual(8);
    for (const f of FUENTES_POR_QUE) {
      expect(f.tema.length).toBeGreaterThan(5);
      expect(f.cita).toMatch(/\(\d{4}\)|\d{4}\)/);
    }
  });

  it('están los cinco factores de Jenny, que es el marco de todo esto', () => {
    expect(FUENTES_POR_QUE.some(f => f.cita.includes('Jenny, H. (1941)'))).toBe(true);
    expect(FUENTES_POR_QUE.some(f => f.cita.includes('Jobbágy'))).toBe(true);
  });
});
