import { describe, it, expect } from 'vitest';
import {
  ARTEFACTOS, ARTEFACTOS_DOMESTICOS, ARTEFACTOS_RIEGO,
  artefactoPorId, caudalHunter_ls, coefSimultaneidad, demandaRed,
  coefSimultaneidadMayorado, simultaneidadConjunto, demandaConjunto,
  MAYORACION_HORA_PUNTA, KV_MINIMO, VIVIENDAS_UMBRAL_EDIFICIO, VIVIENDAS_PISO_EXACTO,
  COEF_SIMULTANEIDAD_PISO, type ItemArtefacto,
} from '@/lib/artefactos';

describe('catálogo de artefactos', () => {
  it('no tiene ids repetidos', () => {
    const ids = ARTEFACTOS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo artefacto tiene caudal y presión positivos', () => {
    for (const a of ARTEFACTOS) {
      expect(a.caudal_ls, a.id).toBeGreaterThan(0);
      expect(a.presion_min_mca, a.id).toBeGreaterThan(0);
    }
  });

  it('los domésticos intermitentes tienen unidades de gasto', () => {
    for (const a of ARTEFACTOS_DOMESTICOS.filter(x => !x.continuo)) {
      expect(a.ug, a.id).toBeGreaterThan(0);
    }
  });

  it('todo el riego es de uso continuo y no aporta unidades de gasto', () => {
    for (const a of ARTEFACTOS_RIEGO) {
      expect(a.continuo, a.id).toBe(true);
      expect(a.ug, a.id).toBe(0);
    }
  });

  it('busca por id y devuelve null si no existe', () => {
    expect(artefactoPorId('ducha')?.nombre).toBe('Ducha');
    expect(artefactoPorId('no_existe')).toBeNull();
  });
});

describe('curva de Hunter', () => {
  it('sin unidades de gasto no hay caudal', () => {
    expect(caudalHunter_ls(0)).toBe(0);
    expect(caudalHunter_ls(-5)).toBe(0);
  });

  it('crece con las unidades de gasto pero cada vez menos', () => {
    const q10 = caudalHunter_ls(10);
    const q20 = caudalHunter_ls(20);
    const q40 = caudalHunter_ls(40);
    expect(q20).toBeGreaterThan(q10);
    expect(q40).toBeGreaterThan(q20);
    // Duplicar las UG no duplica el caudal: ésa es toda la gracia del método.
    expect(q20).toBeLessThan(q10 * 2);
    expect(q40).toBeLessThan(q20 * 2);
  });

  it('reproduce los puntos de la tabla original', () => {
    // 10 UG = 14,6 gpm = 0,921 L/s
    expect(caudalHunter_ls(10)).toBeCloseTo(14.6 * 0.0630902, 3);
    // 50 UG = 29,1 gpm
    expect(caudalHunter_ls(50)).toBeCloseTo(29.1 * 0.0630902, 3);
  });

  it('interpola entre dos filas de la tabla', () => {
    const q = caudalHunter_ls(11);
    expect(q).toBeGreaterThan(caudalHunter_ls(10));
    expect(q).toBeLessThan(caudalHunter_ls(12));
  });
});

describe('coeficiente de simultaneidad', () => {
  it('con un solo artefacto no descuenta nada', () => {
    expect(coefSimultaneidad(1)).toBe(1);
    expect(coefSimultaneidad(0)).toBe(1);
  });

  it('baja al crecer la cantidad, con piso', () => {
    expect(coefSimultaneidad(5)).toBeCloseTo(0.5, 3);
    expect(coefSimultaneidad(100)).toBe(0.2);
  });
});

describe('demanda de la red', () => {
  it('sin artefactos devuelve todo en cero', () => {
    const d = demandaRed([]);
    expect(d.maximo_ls).toBe(0);
    expect(d.diseno_ls).toBe(0);
    expect(d.n_total).toBe(0);
  });

  it('el caudal de diseño es menor que la suma de todas las llaves abiertas', () => {
    const d = demandaRed([
      { artefactoId: 'canilla_cocina',   cantidad: 1 },
      { artefactoId: 'lavatorio',        cantidad: 2 },
      { artefactoId: 'inodoro_deposito', cantidad: 2 },
      { artefactoId: 'ducha',            cantidad: 2 },
      { artefactoId: 'lavarropas',       cantidad: 1 },
    ]);
    expect(d.n_total).toBe(8);
    expect(d.ug_total).toBe(2 + 2 + 6 + 4 + 2);
    expect(d.diseno_ls).toBeLessThan(d.maximo_ls);
    expect(d.diseno_ls).toBeGreaterThan(0);
  });

  it('un solo artefacto se dimensiona por su propio caudal', () => {
    // Con 2 UG Hunter da ~0,32 L/s, más que la canilla sola: manda el mayor.
    const d = demandaRed([{ artefactoId: 'canilla_cocina', cantidad: 1 }]);
    expect(d.diseno_ls).toBeGreaterThanOrEqual(0.2);
    expect(d.maximo_ls).toBe(0.2);
  });

  it('el consumo continuo se suma entero, sin simultaneidad', () => {
    const soloGoteo = demandaRed([{ artefactoId: 'gotero_4', cantidad: 900 }]);
    // 900 goteros × 4 L/h = 3600 L/h = 1 L/s exacto.
    expect(soloGoteo.continuo_ls).toBeCloseTo(1, 3);
    expect(soloGoteo.diseno_ls).toBeCloseTo(soloGoteo.maximo_ls, 3);
    expect(soloGoteo.ug_total).toBe(0);
  });

  it('mezcla doméstico y riego: uno con simultaneidad, el otro no', () => {
    const items = [
      { artefactoId: 'ducha',    cantidad: 2 },
      { artefactoId: 'gotero_4', cantidad: 900 },
    ];
    const d = demandaRed(items);
    const soloDucha = demandaRed([{ artefactoId: 'ducha', cantidad: 2 }]);
    expect(d.continuo_ls).toBeCloseTo(1, 3);
    expect(d.diseno_ls).toBeCloseTo(soloDucha.diseno_ls + 1, 3);
    expect(d.n_intermitentes).toBe(2);
  });

  it('toma la presión más exigente de todo lo conectado', () => {
    const d = demandaRed([
      { artefactoId: 'lavatorio',   cantidad: 1 },   // 2 m.c.a.
      { artefactoId: 'ducha',       cantidad: 1 },   // 5 m.c.a.
      { artefactoId: 'microasp_40', cantidad: 1 },   // 15 m.c.a.
    ]);
    expect(d.presion_min_mca).toBe(15);
    expect(d.presion_manda).toBe('Microaspersor 40 L/h');
  });

  it('ignora ids desconocidos y cantidades en cero', () => {
    const d = demandaRed([
      { artefactoId: 'no_existe', cantidad: 5 },
      { artefactoId: 'ducha',     cantidad: 0 },
    ]);
    expect(d.n_total).toBe(0);
    expect(d.diseno_ls).toBe(0);
  });
});

// ─── Simultaneidad entre viviendas (corrección 1.5) ──────────────────────────

/**
 * El coeficiente de conjunto, Kv = (19 + N) / (10·(N + 1)).
 *
 * El test que vale es `la fórmula sola se va por debajo del piso publicado`: el
 * apartado del plan decía que esto era «una línea de código», y esa línea, con
 * 50 cabañas, dimensiona el caño para la mitad del agua. Si alguien saca el
 * piso, ese test se cae.
 */
describe('simultaneidadConjunto', () => {
  it('reproduce el ejemplo del curso: 10 viviendas → 0,26', () => {
    const r = simultaneidadConjunto(10);
    expect(r.kvCrudo).toBeCloseTo(29 / 110, 3);
    expect(r.kvCrudo).toBeCloseTo(0.264, 3);
    expect(r.kv).toBeCloseTo(0.264, 3);   // todavía por encima del piso
  });

  it('una sola vivienda no es un conjunto: Kv = 1', () => {
    for (const n of [0, 1]) {
      const r = simultaneidadConjunto(n);
      expect(r.kv).toBe(1);
      expect(r.nota).toContain('no hay conjunto');
    }
  });

  it('en N = 11 la fórmula toca el piso publicado, exacto', () => {
    const r = simultaneidadConjunto(VIVIENDAS_PISO_EXACTO);
    expect(r.kvCrudo).toBe(KV_MINIMO);
    expect(r.kv).toBe(KV_MINIMO);
    expect(r.pisoAplicado).toBe(false);
  });

  it('LA FÓRMULA SOLA SE VA POR DEBAJO DEL PISO PUBLICADO', () => {
    // Desde 12 viviendas la expresión cruda queda afuera del rango en el que la
    // publicaron, y el error va para el lado barato: caño chico.
    const doce = simultaneidadConjunto(12);
    expect(doce.kvCrudo).toBeLessThan(KV_MINIMO);
    expect(doce.kv).toBe(KV_MINIMO);
    expect(doce.pisoAplicado).toBe(true);

    const cincuenta = simultaneidadConjunto(50);
    expect(cincuenta.kvCrudo).toBeCloseTo(69 / 510, 3);
    expect(cincuenta.kvCrudo).toBeCloseTo(0.135, 3);
    expect(cincuenta.kv).toBe(KV_MINIMO);
    // La fórmula sola daría un 46 % menos de caudal de diseño.
    expect(1 - cincuenta.kvCrudo / KV_MINIMO).toBeCloseTo(0.459, 2);
    expect(cincuenta.advertencias.join(' ')).toContain('por debajo del piso publicado');
  });

  it('la fórmula tiende a 0,10, que es por qué el piso tiene que existir', () => {
    expect(simultaneidadConjunto(100_000).kvCrudo).toBeCloseTo(0.1, 3);
    expect(simultaneidadConjunto(100_000).kv).toBe(KV_MINIMO);
  });

  it('avisa cuando el conjunto está en el borde del umbral de la fuente', () => {
    const r = simultaneidadConjunto(VIVIENDAS_UMBRAL_EDIFICIO);
    expect(r.advertencias.join(' ')).toContain('borde');
    // Pasado el umbral el aviso de tamaño desaparece.
    expect(simultaneidadConjunto(20).advertencias.join(' ')).not.toContain('borde');
  });

  it('informa las viviendas equivalentes, que es como lo plantea la fuente', () => {
    const r = simultaneidadConjunto(15);
    expect(r.equivalentes).toBeCloseTo(15 * r.kv, 3);
    expect(r.nota).toContain('viviendas a la hora de dimensionar');
  });

  it('nunca devuelve más de 1 ni menos que el piso', () => {
    for (let n = 0; n <= 200; n++) {
      const r = simultaneidadConjunto(n);
      expect(r.kv).toBeLessThanOrEqual(1);
      expect(r.kv).toBeGreaterThanOrEqual(KV_MINIMO);
    }
  });

  it('cita la fuente leída y no una norma que no vio', () => {
    const r = simultaneidadConjunto(12);
    expect(r.fuente).toContain('UPCT');
    expect(r.fuente).toContain('viviendas de igual tipo');
  });
});

describe('la mayoración de hora punta del coeficiente de artefactos', () => {
  it('son +20 %, y las dos fuentes no coinciden', () => {
    expect(MAYORACION_HORA_PUNTA).toBe(1.2);
    expect(coefSimultaneidadMayorado(5)).toBeCloseTo(coefSimultaneidad(5) * 1.2, 4);
  });

  it('no pasa de 1 ni cambia el caso de un solo artefacto', () => {
    expect(coefSimultaneidadMayorado(1)).toBe(1);
    expect(coefSimultaneidadMayorado(2)).toBe(1);   // 1 × 1,2 acotado
  });

  it('demandaRed informa los dos números sin tocar el de diseño', () => {
    const d = demandaRed([
      { artefactoId: 'ducha', cantidad: 1 },
      { artefactoId: 'canilla_cocina', cantidad: 1 },
      { artefactoId: 'inodoro_deposito', cantidad: 1 },
      { artefactoId: 'lavatorio', cantidad: 1 },
    ]);
    // Los dos vienen redondeados a tres decimales, así que la comparación se
    // hace a dos: lo que el test afirma es la mayoración, no el redondeo.
    expect(d.raizMayorada_ls).toBeCloseTo(d.raiz_ls * 1.2, 2);
    // El caudal de diseño lo manda Hunter: la mayoración no lo mueve.
    expect(d.diseno_ls).toBeCloseTo(Math.max(d.hunter_ls, 0.2), 3);
  });

  it('el piso del coeficiente de artefactos es de acequia y se avisa cuando muerde', () => {
    expect(COEF_SIMULTANEIDAD_PISO).toBe(0.2);
    const d = demandaRed([{ artefactoId: 'lavatorio', cantidad: 60 }]);
    expect(d.advertencias.join(' ')).toContain('no está publicado');
    // Con pocos artefactos no muerde y no hay aviso.
    expect(demandaRed([{ artefactoId: 'lavatorio', cantidad: 4 }]).advertencias).toHaveLength(0);
  });
});

describe('demandaConjunto', () => {
  /** Una cabaña de campo: baño completo, cocina y lavadero. */
  const CABANA: ItemArtefacto[] = [
    { artefactoId: 'ducha', cantidad: 1 },
    { artefactoId: 'inodoro_deposito', cantidad: 1 },
    { artefactoId: 'lavatorio', cantidad: 1 },
    { artefactoId: 'canilla_cocina', cantidad: 1 },
    { artefactoId: 'pileta_lavar', cantidad: 1 },
  ];

  it('son DOS simultaneidades, una encima de la otra', () => {
    const una = demandaRed(CABANA);
    const diez = demandaConjunto([{ nombre: 'Cabañas', items: CABANA, viviendas: 10 }]);
    const kv = simultaneidadConjunto(10).kv;

    // El caudal de una vivienda sale de Hunter; el del conjunto, de ese por N por Kv.
    expect(diez.grupos[0]!.intermitentePorVivienda_ls).toBeCloseTo(una.diseno_ls, 3);
    expect(diez.diseno_ls).toBeCloseTo(una.diseno_ls * 10 * kv, 2);

    // Y es mucho menos que diez redes de una, pero mucho más que una sola.
    expect(diez.diseno_ls).toBeLessThan(una.diseno_ls * 10);
    expect(diez.diseno_ls).toBeGreaterThan(una.diseno_ls);
  });

  it('dice cuánto descuenta, y por qué', () => {
    const r = demandaConjunto([{ nombre: 'Cabañas', items: CABANA, viviendas: 20 }]);
    expect(r.sinCoeficiente_ls).toBeGreaterThan(r.diseno_ls);
    expect(r.nota).toContain('no tienen el pico a la misma hora');
    expect(r.viviendas_total).toBe(20);
  });

  it('con 50 viviendas usa el piso, no la fórmula cruda', () => {
    const r = demandaConjunto([{ nombre: 'Loteo', items: CABANA, viviendas: 50 }]);
    expect(r.grupos[0]!.kv.kv).toBe(KV_MINIMO);
    expect(r.grupos[0]!.kv.pisoAplicado).toBe(true);
    expect(r.advertencias.join(' ')).toContain('Loteo:');
  });

  it('dos tipos de vivienda son dos grupos, cada uno con su N', () => {
    const CASA: ItemArtefacto[] = [...CABANA, { artefactoId: 'banera', cantidad: 1 }];
    const r = demandaConjunto([
      { nombre: 'Cabañas', items: CABANA, viviendas: 8 },
      { nombre: 'Casa principal', items: CASA, viviendas: 1 },
    ]);
    expect(r.grupos).toHaveLength(2);
    expect(r.grupos[0]!.kv.viviendas).toBe(8);
    expect(r.grupos[1]!.kv.kv).toBe(1);   // una sola: no hay conjunto
    expect(r.viviendas_total).toBe(9);
    // Y lo que la fuente NO dice queda escrito.
    expect(r.advertencias.join(' ')).toContain('no dice cómo combinar tipos distintos');
  });

  it('sumar los grupos es el lado conservador', () => {
    const partido = demandaConjunto([
      { nombre: 'A', items: CABANA, viviendas: 8 },
      { nombre: 'B', items: CABANA, viviendas: 2 },
    ]);
    const junto = demandaConjunto([{ nombre: 'Todas', items: CABANA, viviendas: 10 }]);
    expect(partido.diseno_ls).toBeGreaterThan(junto.diseno_ls);
  });

  it('el consumo continuo no entra en ninguna de las dos simultaneidades', () => {
    const conTanque = demandaConjunto([{
      nombre: 'Cabañas',
      items: [...CABANA, { artefactoId: 'bebedero_australiano', cantidad: 1 }],
      viviendas: 4,
    }]);
    const sinTanque = demandaConjunto([{ nombre: 'Cabañas', items: CABANA, viviendas: 4 }]);
    // Cuatro llenados de tanque: 0,5 L/s cada uno, enteros.
    expect(conTanque.diseno_ls - sinTanque.diseno_ls).toBeCloseTo(0.5 * 4, 2);
  });

  it('los consumos compartidos de la red se suman aparte', () => {
    const sin = demandaConjunto([{ nombre: 'Cabañas', items: CABANA, viviendas: 6 }]);
    const con = demandaConjunto(
      [{ nombre: 'Cabañas', items: CABANA, viviendas: 6 }],
      [{ artefactoId: 'bebedero_australiano', cantidad: 1 }],
    );
    expect(con.extras).not.toBeNull();
    expect(con.diseno_ls).toBeCloseTo(sin.diseno_ls + 0.5, 3);
  });

  it('la presión la manda el artefacto más exigente de todo el conjunto', () => {
    const r = demandaConjunto(
      [{ nombre: 'Cabañas', items: CABANA, viviendas: 6 }],
      [{ artefactoId: 'incendio', cantidad: 1 }],
    );
    expect(r.presion_min_mca).toBe(25);
    expect(r.presion_manda).toContain('incendio');
  });

  it('sin viviendas no inventa un caudal', () => {
    const r = demandaConjunto([]);
    expect(r.diseno_ls).toBe(0);
    expect(r.grupos).toHaveLength(0);
    expect(r.nota).toContain('Cargá los artefactos');
    expect(demandaConjunto([{ nombre: 'x', items: CABANA, viviendas: 0 }]).diseno_ls).toBe(0);
  });

  it('cita los dos métodos', () => {
    const r = demandaConjunto([{ nombre: 'Cabañas', items: CABANA, viviendas: 10 }]);
    expect(r.fuentes.join(' ')).toContain('Hunter');
    expect(r.fuentes.join(' ')).toContain('viviendas de igual tipo');
    expect(r.metodo).toContain('encima');
  });
});
