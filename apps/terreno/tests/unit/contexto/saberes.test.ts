import { describe, expect, it } from 'vitest';

import {
  GEOMETRIAS_SABERES,
  LICENCIAS_ADMITIDAS,
  SABERES_TERRITORIALES,
  evaluarSaber,
  resumenSaberes,
  saberesActivos,
  saberesDocumentados,
} from '../../../lib/saberes';
import type { GeometriaSaber, SaberTerritorial } from '../../../lib/saberesTipos';

/** Cuadrado de un grado alrededor de (0,0), suficiente para probar la compuerta. */
const CUADRADO: Array<Array<[number, number]>> = [[
  [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5],
]];

const saberDePrueba: SaberTerritorial = {
  id: 'prueba',
  nombre: 'Saber de prueba',
  region: 'sudamerica',
  portadores: 'comunidad de prueba',
  paises: ['AR'],
  ecoIdsCompatibles: [575],
  territorioMinimo: 'el cuadrado',
  sintesisPublica: 'no describe nada real',
  cautelas: [],
  fuentes: [{ label: 'fuente', url: 'https://example.org', revisada: '2026-09-04' }],
  estado: 'aprobado',
  fuenteInventario: 'tests',
};

const geoDePrueba: GeometriaSaber = {
  saberId: 'prueba',
  tipo: 'comunitario',
  fuente: 'registro de prueba',
  url: 'https://example.org/poligono',
  licencia: 'CC-BY-4.0',
  revisada: '2026-09-04',
  anillos: CUADRADO,
};

const adentro = { lat: 0, lng: 0, pais: 'AR', ecoId: 575 };
const registro = { prueba: geoDePrueba };

describe('inventario de saberes territoriales', () => {
  it('trae los 85 saberes de las tres regiones relevadas', () => {
    expect(SABERES_TERRITORIALES).toHaveLength(85);
    const porRegion = SABERES_TERRITORIALES.reduce<Record<string, number>>(
      (acc, s) => ({ ...acc, [s.region]: (acc[s.region] ?? 0) + 1 }),
      {},
    );
    expect(porRegion).toEqual({
      'mesoamerica-caribe': 9,
      'mexico-estados-unidos': 21,
      'europa-occidental': 26,
      sudamerica: 29,
    });
  });

  it('no repite ids', () => {
    const ids = SABERES_TERRITORIALES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('le pone país a todos: sin país no hay filtro posible', () => {
    const sinPais = SABERES_TERRITORIALES.filter((s) => s.paises.length === 0);
    expect(sinPais.map((s) => s.id)).toEqual([]);
  });

  it('usa códigos ISO de dos letras en mayúscula', () => {
    const raros = SABERES_TERRITORIALES.flatMap((s) => s.paises).filter((p) => !/^[A-Z]{2}$/.test(p));
    expect(raros).toEqual([]);
  });

  it('sólo aprueba lo que tiene geometría cargada: ni uno más', () => {
    const aprobados = SABERES_TERRITORIALES.filter((s) => s.estado === 'aprobado').map((s) => s.id);
    expect(aprobados).toEqual(['cac_quesungual', 'polder_y_waterschap']);
    for (const id of aprobados) expect(GEOMETRIAS_SABERES[id]).toBeDefined();
  });
});

describe('registro de geometrías', () => {
  it('tiene sólo las que pasaron procedencia y licencia', () => {
    expect(Object.keys(GEOMETRIAS_SABERES)).toEqual(['cac_quesungual', 'polder_y_waterschap']);
  });

  it('cada geometría declara fuente, url y una licencia admitida', () => {
    for (const [id, g] of Object.entries(GEOMETRIAS_SABERES)) {
      expect(g.saberId).toBe(id);
      expect(g.fuente.trim()).not.toBe('');
      expect(g.url.trim()).not.toBe('');
      expect(LICENCIAS_ADMITIDAS).toContain(g.licencia);
    }
  });

  it('cada anillo exterior está cerrado y no es degenerado', () => {
    for (const g of Object.values(GEOMETRIAS_SABERES)) {
      const anillo = g.anillos[0] ?? [];
      expect(anillo.length).toBeGreaterThan(3);
      expect(anillo[0]).toEqual(anillo[anillo.length - 1]);
    }
  });

  it('sigue sin activar nada donde no hay polígono cargado', () => {
    const puntos = [
      { lat: -34.6, lng: -58.4, pais: 'AR', ecoId: 575 },   // Buenos Aires
      { lat: 37.0, lng: -3.3, pais: 'ES', ecoId: 805 },     // Alpujarra
      { lat: 20.7, lng: -89.1, pais: 'MX', ecoId: 494 },    // Yucatán
      { lat: -0.9, lng: -77.8, pais: 'EC', ecoId: 483 },    // Napo
    ];
    for (const p of puntos) expect(saberesActivos(p)).toEqual([]);
  });
});

describe('Quesungual: la primera activación de América', () => {
  const gracias = { lat: 14.5906, lng: -88.5811, pais: 'HN' };  // cabecera de Lempira

  it('se activa en Lempira', () => {
    expect(saberesActivos(gracias).map((s) => s.id)).toEqual(['cac_quesungual']);
  });

  it('no se activa en el resto de Honduras, aunque el país coincida', () => {
    // Tegucigalpa: mismo país, misma ecorregión de bosque seco, otro territorio.
    expect(saberesActivos({ lat: 14.0723, lng: -87.2068, pais: 'HN' })).toEqual([]);
  });

  it('no se activa del otro lado de la frontera, a pocos km del polígono', () => {
    // Nueva Ocotepeque (HN) y el oriente de El Salvador quedan afuera del anillo.
    expect(saberesActivos({ lat: 13.85, lng: -88.6, pais: 'SV' })).toEqual([]);
  });

  it('sin país no activa, aunque el punto caiga adentro', () => {
    expect(saberesActivos({ lat: gracias.lat, lng: gracias.lng })).toEqual([]);
  });
});

describe('Polder y waterschap: la primera de Europa', () => {
  // El polígono son las 21 jurisdicciones de waterschap disueltas (OSM, ODbL).
  it('se activa en Ámsterdam', () => {
    expect(saberesActivos({ lat: 52.3728, lng: 4.8936, pais: 'NL' }).map((s) => s.id))
      .toEqual(['polder_y_waterschap']);
  });

  it('se activa en el pólder de Beemster, que es el caso de manual', () => {
    // Droogmakerij de Beemster, Patrimonio Mundial: pólder de 1612.
    expect(saberesActivos({ lat: 52.55, lng: 4.92, pais: 'NL' }).map((s) => s.id))
      .toEqual(['polder_y_waterschap']);
  });

  it('se activa en Limburgo, donde hay waterschap y no hay pólder', () => {
    // No es un error: el polígono es la jurisdicción de la institución, y la
    // cautela del saber lo dice. Queda fijado para que nadie lo "corrija"
    // recortando el polígono sin cambiar también lo que el saber afirma.
    const activos = saberesActivos({ lat: 50.8514, lng: 5.691, pais: 'NL' });
    expect(activos.map((s) => s.id)).toEqual(['polder_y_waterschap']);
    expect(activos[0]?.cautelas[0]).toContain('no el perímetro de los pólderes');
  });

  it('no se activa del otro lado de la frontera', () => {
    // Amberes y Colonia están a menos de 50 km del polígono.
    expect(saberesActivos({ lat: 51.2194, lng: 4.4025, pais: 'BE' })).toEqual([]);
    expect(saberesActivos({ lat: 50.9375, lng: 6.9603, pais: 'DE' })).toEqual([]);
  });

  it('no se activa en el mar del Norte', () => {
    expect(saberesActivos({ lat: 52.5, lng: 3.5, pais: 'NL' })).toEqual([]);
  });

  it('declara las tres fuentes verificadas y una licencia admitida', () => {
    const saber = SABERES_TERRITORIALES.find((s) => s.id === 'polder_y_waterschap');
    expect(saber?.fuentes).toHaveLength(3);
    expect(GEOMETRIAS_SABERES['polder_y_waterschap']?.licencia).toBe('ODbL-1.0');
  });
});

describe('compuerta de activación', () => {
  it('activa cuando se cumplen las ocho condiciones', () => {
    expect(evaluarSaber(saberDePrueba, adentro, registro)).toEqual({
      saber: saberDePrueba,
      activo: true,
    });
  });

  const bloqueos: Array<[string, () => { saber: SaberTerritorial; punto: typeof adentro; geos: Record<string, GeometriaSaber> }, string]> = [
    ['sin fuentes', () => ({ saber: { ...saberDePrueba, fuentes: [] }, punto: adentro, geos: registro }), 'sin_fuente'],
    ['sin aprobar', () => ({ saber: { ...saberDePrueba, estado: 'geometria_propuesta' }, punto: adentro, geos: registro }), 'estado_no_aprobado'],
    ['sin geometría', () => ({ saber: saberDePrueba, punto: adentro, geos: {} }), 'sin_geometria'],
    ['con anillo degenerado', () => ({ saber: saberDePrueba, punto: adentro, geos: { prueba: { ...geoDePrueba, anillos: [[[0, 0], [1, 1]]] } } }), 'sin_geometria'],
    ['con licencia desconocida', () => ({ saber: saberDePrueba, punto: adentro, geos: { prueba: { ...geoDePrueba, licencia: 'todos los derechos reservados' } } }), 'licencia_no_admitida'],
    ['sin procedencia', () => ({ saber: saberDePrueba, punto: adentro, geos: { prueba: { ...geoDePrueba, url: '  ' } } }), 'geometria_sin_procedencia'],
    ['en otro país', () => ({ saber: saberDePrueba, punto: { ...adentro, pais: 'UY' }, geos: registro }), 'pais_no_coincide'],
    ['sin país conocido', () => ({ saber: saberDePrueba, punto: { ...adentro, pais: undefined as unknown as string }, geos: registro }), 'pais_no_coincide'],
    ['en otra ecorregión', () => ({ saber: saberDePrueba, punto: { ...adentro, ecoId: 999 }, geos: registro }), 'ecorregion_no_compatible'],
    ['fuera del polígono', () => ({ saber: saberDePrueba, punto: { ...adentro, lat: 40 }, geos: registro }), 'fuera_del_poligono'],
  ];

  for (const [caso, armar, motivo] of bloqueos) {
    it(`no activa ${caso} → ${motivo}`, () => {
      const { saber, punto, geos } = armar();
      const r = evaluarSaber(saber, punto, geos);
      expect(r.activo).toBe(false);
      expect(r.motivo).toBe(motivo);
    });
  }

  it('no filtra por ecorregión si el saber no declara ninguna', () => {
    const sinEco = { ...saberDePrueba, ecoIdsCompatibles: [] };
    const r = evaluarSaber(sinEco, { ...adentro, ecoId: undefined }, registro);
    expect(r.activo).toBe(true);
  });

  it('el país solo nunca alcanza: es la regla entera de esta capa', () => {
    const r = evaluarSaber(saberDePrueba, { lat: 40, lng: 40, pais: 'AR', ecoId: 575 }, registro);
    expect(r.activo).toBe(false);
  });
});

describe('listado editorial', () => {
  it('lista sin activar, que es para lo que existe', () => {
    const ec = saberesDocumentados({ pais: 'EC' });
    expect(ec.length).toBeGreaterThan(0);
    expect(ec.every((s) => s.paises.includes('EC'))).toBe(true);
    expect(saberesActivos({ lat: -0.9, lng: -77.8, pais: 'EC' })).toEqual([]);
  });

  it('filtra por región', () => {
    expect(saberesDocumentados({ region: 'europa-occidental' })).toHaveLength(26);
  });

  it('cruza país y región', () => {
    const esEuropa = saberesDocumentados({ pais: 'ES', region: 'europa-occidental' });
    expect(esEuropa.map((s) => s.id)).toContain('careo_de_sierra_nevada');
  });
});

describe('resumen', () => {
  it('cuenta lo que hay y lo que falta', () => {
    expect(resumenSaberes()).toEqual({
      documentados: 85,
      // 60 y no 59: el waterschap neerlandés estrenó las fuentes por saber de
      // Europa, que el relevamiento había citado por región.
      conFuente: 60,
      conEcorregiones: 45,
      conGeometria: 2,
      aprobados: 2,
    });
  });
});

describe('licencias', () => {
  it('no admite una licencia vacía ni desconocida', () => {
    expect(LICENCIAS_ADMITIDAS).not.toContain('');
    expect(LICENCIAS_ADMITIDAS.includes('desconocida')).toBe(false);
  });
});
