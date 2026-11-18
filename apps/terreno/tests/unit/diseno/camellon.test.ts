import { describe, it, expect } from 'vitest';
import {
  bandaCamellon, trazarLineaGuia, gradoDelOffset, anchoUnidadDeDrenaje,
  trazarDesague, trazarCauce, cantidadesCamellon, metrosDeSurcoPorHa,
  avisosCamellon, trazarCamellon,
  PASO_BBF_M, CAMELLON_ANCHO_M, SURCO_ANCHO_M, GRADO_CONSTRUIDO_PCT,
  PENDIENTE_MIN_PARA_GRADO_PCT, PENDIENTE_MIN_PARA_BANDA_COMPLETA_PCT,
  PENDIENTE_VERTISOL_MAX_PCT, LLUVIA_ASEGURADA_MM,
} from '@/lib/camellon';
import type { GrillaElevacion } from '@/lib/grillaElevacion';

/**
 * Un plano inclinado exacto: la cota depende sólo de la latitud, así que el
 * gradiente apunta al norte y vale `pendiente_pct` en todos los puntos.
 *
 * El tramo de latitud es 0,01° = 1113,2 m, de donde sale el desnivel que da la
 * pendiente pedida. Importa que sea exacto porque el caso resuelto del trazado
 * se compara contra la trigonometría, no contra otra corrida del código.
 */
const LAT_MIN = -30.80, LAT_MAX = -30.79;
const LNG_MIN = -64.70, LNG_MAX = -64.68;
const TRAMO_LAT_M = (LAT_MAX - LAT_MIN) * 111_320;

function plano(pendiente_pct: number, rows = 80, cols = 80): GrillaElevacion {
  const desnivel = TRAMO_LAT_M * (pendiente_pct / 100);
  const elev = new Float64Array(rows * cols);
  for (let r = 0; r < rows; r++) {
    const z = (r / (rows - 1)) * desnivel;
    for (let c = 0; c < cols; c++) elev[r * cols + c] = z;
  }
  return {
    rows, cols, latMin: LAT_MIN, latMax: LAT_MAX, lngMin: LNG_MIN, lngMax: LNG_MAX,
    elev, elev_min: 0, elev_max: desnivel,
  };
}

/** El mismo plano con una vaguada en la columna del medio. */
function valle(pendiente_pct: number, rows = 80, cols = 80): GrillaElevacion {
  const g = plano(pendiente_pct, rows, cols);
  const medio = (cols - 1) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) g.elev[r * cols + c]! += Math.abs(c - medio) * 0.4;
  }
  let min = Infinity, max = -Infinity;
  for (const z of g.elev) { if (z < min) min = z; if (z > max) max = z; }
  return { ...g, elev_min: min, elev_max: max };
}

const CENTRO = { lat: (LAT_MIN + LAT_MAX) / 2, lng: (LNG_MIN + LNG_MAX) / 2 };

/** Desplazamiento norte-sur de una línea, en metros. */
const corrimientoNorte = (puntos: ReadonlyArray<{ lat: number }>) =>
  (puntos[puntos.length - 1]!.lat - puntos[0]!.lat) * 111_320;

describe('las dimensiones publicadas', () => {
  it('el surco es el resto del paso', () => {
    expect(PASO_BBF_M).toBe(1.5);
    expect(CAMELLON_ANCHO_M).toBe(1);
    expect(SURCO_ANCHO_M).toBe(0.5);
  });

  it('los metros de surco por hectarea coinciden con los 6,7 km publicados', () => {
    // «where the machinery working width is 150 cm, the distance travelled per
    // hectare is only 6.7 km» (Kanwar, Kampen y Virmani 1982).
    expect(metrosDeSurcoPorHa(PASO_BBF_M)).toBe(6667);
    expect(metrosDeSurcoPorHa(PASO_BBF_M)! / 1000).toBeCloseTo(6.7, 1);
  });

  it('un paso invalido no devuelve un numero', () => {
    expect(metrosDeSurcoPorHa(0)).toBeNull();
    expect(metrosDeSurcoPorHa(-1.5)).toBeNull();
    expect(metrosDeSurcoPorHa(NaN)).toBeNull();
  });
});

describe('bandaCamellon', () => {
  it('sobre el 3 % del trazado del ICRISAT la banda publicada entra entera', () => {
    const b = bandaCamellon({ pendienteTerreno_pct: 3, grupoHidro: 'D' });
    expect(b.vacia).toBe(false);
    expect(b.min_pct).toBe(0.4);
    expect(b.max_pct).toBe(0.8);
    expect(b.grado_pct).toBe(GRADO_CONSTRUIDO_PCT);
    expect(b.recortada).toBe(false);
  });

  it('el techo del estandar recorta el grado en terreno mas suave', () => {
    // La mitad de 1 % es 0,5 %, por debajo del 0,6 % construido.
    const b = bandaCamellon({ pendienteTerreno_pct: 1, grupoHidro: 'D' });
    expect(b.vacia).toBe(false);
    expect(b.max_pct).toBe(0.5);
    expect(b.grado_pct).toBe(0.5);
    expect(b.recortada).toBe(true);
  });

  it('por debajo de 0,8 % de pendiente el camellon publicado no se puede trazar', () => {
    const b = bandaCamellon({ pendienteTerreno_pct: 0.7, grupoHidro: 'D' });
    expect(b.vacia).toBe(true);
    expect(b.grado_pct).toBeNull();
    expect(b.nota).toContain('no se puede trazar');
  });

  it('el umbral es exactamente el piso publicado sobre la fraccion del estandar', () => {
    expect(PENDIENTE_MIN_PARA_GRADO_PCT).toBe(0.8);
    expect(PENDIENTE_MIN_PARA_BANDA_COMPLETA_PCT).toBe(1.6);
    expect(bandaCamellon({ pendienteTerreno_pct: 0.8 }).vacia).toBe(false);
    expect(bandaCamellon({ pendienteTerreno_pct: 0.8 }).grado_pct).toBe(0.4);
    expect(bandaCamellon({ pendienteTerreno_pct: 1.6 }).max_pct).toBe(0.8);
  });

  it('un terreno plano no devuelve un grado extrapolado', () => {
    const b = bandaCamellon({ pendienteTerreno_pct: 0 });
    expect(b.vacia).toBe(true);
    expect(b.grado_pct).toBeNull();
  });
});

describe('trazarLineaGuia: el caso resuelto del plano inclinado', () => {
  /**
   * Sobre un plano de pendiente S, una línea al grado g forma con la curva de
   * nivel un ángulo `asin(g/S)`, así que su corrimiento perpendicular a la curva
   * —acá el norte-sur— es `g/S` del largo recorrido, y su grado medido es g.
   * Las tres cosas se comparan contra la trigonometría.
   */
  const G = plano(3);

  it('al 0,6 % sobre el 3 % baja el 0,6 % y corre a asin(0,2) de la curva', () => {
    const l = trazarLineaGuia(G, CENTRO, { grado_pct: 0.6 });
    expect(l).not.toBeNull();
    expect(l!.grado_medido_pct).toBeCloseTo(0.6, 2);
    expect(Math.abs(corrimientoNorte(l!.puntos)) / l!.largo_m).toBeCloseTo(0.2, 3);
    expect(l!.pasosSinPendiente).toBe(0);
  });

  it('al grado cero es la curva de nivel', () => {
    const l = trazarLineaGuia(G, CENTRO, { grado_pct: 0 });
    expect(l!.grado_medido_pct).toBeCloseTo(0, 2);
    expect(Math.abs(corrimientoNorte(l!.puntos)) / l!.largo_m).toBeCloseTo(0, 2);
  });

  it('al grado de la pendiente es la linea de maxima pendiente', () => {
    const l = trazarLineaGuia(G, CENTRO, { grado_pct: 3 });
    expect(l!.grado_medido_pct).toBeCloseTo(3, 2);
    expect(Math.abs(corrimientoNorte(l!.puntos)) / l!.largo_m).toBeCloseTo(1, 3);
    expect(l!.pasosSinPendiente).toBe(0);
  });

  it('baja siempre: el corrimiento es hacia el sur, que es donde el plano baja', () => {
    const l = trazarLineaGuia(G, CENTRO, { grado_pct: 0.6 });
    expect(corrimientoNorte(l!.puntos)).toBeLessThan(0);
    expect(l!.desnivel_m).toBeGreaterThan(0);
  });

  it('el sentido elige el lado y no cambia el grado', () => {
    const a = trazarLineaGuia(G, CENTRO, { grado_pct: 0.6, sentido: 1 })!;
    const b = trazarLineaGuia(G, CENTRO, { grado_pct: 0.6, sentido: -1 })!;
    const este = (l: typeof a) => (l.puntos[l.puntos.length - 1]!.lng - l.puntos[0]!.lng);
    expect(Math.sign(este(a))).toBe(-Math.sign(este(b)));
    expect(a.grado_medido_pct).toBeCloseTo(b.grado_medido_pct, 2);
  });

  it('si el terreno es mas suave que el grado pedido no extrapola: avisa y mide menos', () => {
    const suave = plano(0.5);
    const l = trazarLineaGuia(suave, CENTRO, { grado_pct: 2 });
    expect(l).not.toBeNull();
    expect(l!.pasosSinPendiente).toBeGreaterThan(0);
    expect(l!.grado_medido_pct).toBeCloseTo(0.5, 1);
    expect(l!.grado_medido_pct).toBeLessThan(l!.grado_pedido_pct);
  });

  it('un grado negativo o un arranque sin dato no devuelven linea', () => {
    expect(trazarLineaGuia(G, CENTRO, { grado_pct: -1 })).toBeNull();
    expect(trazarLineaGuia(G, { lat: 0, lng: 0 }, { grado_pct: 0.6 })).toBeNull();
  });

  it('se recorta al predio cuando se le pasa el adentro', () => {
    const libre = trazarLineaGuia(G, CENTRO, { grado_pct: 0.6 })!;
    const corta = trazarLineaGuia(G, CENTRO, {
      grado_pct: 0.6,
      dentro: (_lat, lng) => lng > CENTRO.lng - 0.002,
    })!;
    expect(corta.largo_m).toBeLessThan(libre.largo_m);
    expect(corta.corte).toBe('borde');
  });
});

describe('la deriva de la paralela', () => {
  it('sobre un plano la paralela no deriva: el camellon puede seguir', () => {
    const G = plano(3);
    const guia = trazarLineaGuia(G, CENTRO, { grado_pct: 0.6 })!;
    const off = gradoDelOffset(G, guia.puntos, 60, { min_pct: 0.4, max_pct: 0.8 });
    expect(off).not.toBeNull();
    expect(off!.grado_pct).toBeCloseTo(0.6, 1);
    expect(off!.dentroDeBanda).toBe(true);
    expect(off!.plegado).toBe(false);
  });

  it('la unidad de drenaje se mide con el paso del modelo y da camellones enteros', () => {
    const G = plano(3);
    const guia = trazarLineaGuia(G, CENTRO, { grado_pct: 0.6 })!;
    const u = anchoUnidadDeDrenaje(G, guia.puntos, { min_pct: 0.4, max_pct: 0.8 });
    expect(u).not.toBeNull();
    expect(u!.pasoMedicion_m).toBeGreaterThan(PASO_BBF_M);
    expect(u!.camellones).toBe(Math.floor(u!.ancho_m / PASO_BBF_M));
    expect(u!.ancho_m).toBeCloseTo(u!.ancho_izquierda_m + u!.ancho_derecha_m, 1);
  });

  it('una guia de un solo punto no tiene paralela', () => {
    const G = plano(3);
    expect(gradoDelOffset(G, [CENTRO], 10)).toBeNull();
    expect(anchoUnidadDeDrenaje(G, [CENTRO], { min_pct: 0.4, max_pct: 0.8 })).toBeNull();
  });
});

describe('la salida del agua', () => {
  const G = valle(3);

  it('el cauce corre por el eje de la vaguada y baja', () => {
    const c = trazarCauce(G);
    expect(c).not.toBeNull();
    expect(c!.puntos.length).toBeGreaterThan(10);
    expect(c!.pendiente_pct).toBeGreaterThan(0);
    const anchoCelda = (LNG_MAX - LNG_MIN) / (G.cols - 1);
    for (const p of c!.puntos) {
      expect(Math.abs(p.lng - CENTRO.lng)).toBeLessThan(anchoCelda * 2);
    }
  });

  it('el desague sale de la ladera y llega al cauce', () => {
    const d = trazarDesague(G, { lat: CENTRO.lat, lng: CENTRO.lng + 0.005 });
    expect(d).not.toBeNull();
    expect(d!.largo_m).toBeGreaterThan(0);
    expect(d!.pendiente_pct).toBeGreaterThan(0);
    expect(d!.acumulacion).toBeGreaterThan(1);
  });

  it('un arranque fuera de la grilla no traza desague', () => {
    expect(trazarDesague(G, { lat: 0, lng: 0 })).toBeNull();
  });
});

describe('cantidadesCamellon', () => {
  it('diez hectareas al paso del ICRISAT', () => {
    const q = cantidadesCamellon({ superficie_ha: 10, anchoUnidad_m: 60 });
    expect(q).not.toBeNull();
    expect(q!.surco_m).toBe(66670);
    expect(q!.camellones).toBe(40);          // 60 m / 1,5 m
    expect(q!.jornadasYunta.min).toBe(8.3);  // 10 ha / 1,2 ha por jornada
    expect(q!.jornadasYunta.max).toBe(25);   // 10 ha / 0,4 ha por jornada
  });

  it('una superficie invalida no devuelve cantidades', () => {
    expect(cantidadesCamellon({ superficie_ha: 0 })).toBeNull();
    expect(cantidadesCamellon({ superficie_ha: 5, paso_m: 0 })).toBeNull();
  });
});

describe('avisosCamellon', () => {
  const ids = (a: ReturnType<typeof avisosCamellon>) => a.map((x) => x.id);

  it('con 3 % de pendiente, lluvia alta y vertisol no sobra ningun aviso', () => {
    const e = { pendienteTerreno_pct: 3, lluviaAnual_mm: 900, sueloExpansivo: true };
    expect(avisosCamellon(e, bandaCamellon(e))).toEqual([]);
  });

  it('la banda vacia es alerta y el recorte es aviso', () => {
    const plana = { pendienteTerreno_pct: 0.7 };
    const a = avisosCamellon(plana, bandaCamellon(plana));
    expect(ids(a)).toContain('camellon_banda_vacia');
    expect(a[0]!.nivel).toBe('alerta');

    const media = { pendienteTerreno_pct: 1 };
    const b = avisosCamellon(media, bandaCamellon(media));
    expect(ids(b)).toContain('camellon_banda_recortada');
    expect(b[0]!.nivel).toBe('aviso');
  });

  it('avisa por debajo de los 750 mm publicados', () => {
    const seco = { pendienteTerreno_pct: 3, lluviaAnual_mm: LLUVIA_ASEGURADA_MM - 100 };
    expect(ids(avisosCamellon(seco, bandaCamellon(seco)))).toContain('camellon_lluvia_insuficiente');
    const humedo = { pendienteTerreno_pct: 3, lluviaAnual_mm: LLUVIA_ASEGURADA_MM + 100 };
    expect(ids(avisosCamellon(humedo, bandaCamellon(humedo)))).not.toContain('camellon_lluvia_insuficiente');
  });

  it('avisa arriba del 8 % y cuando el suelo no es el que motiva el camellon', () => {
    const e = { pendienteTerreno_pct: PENDIENTE_VERTISOL_MAX_PCT + 2, sueloExpansivo: false };
    const a = ids(avisosCamellon(e, bandaCamellon(e)));
    expect(a).toContain('camellon_pendiente_alta');
    expect(a).toContain('camellon_sin_suelo_expansivo');
  });
});

describe('trazarCamellon', () => {
  it('arma la geometria completa sobre una vaguada al 3 %', () => {
    const r = trazarCamellon(valle(3), {
      pendienteTerreno_pct: 3, grupoHidro: 'D', lluviaAnual_mm: 900,
      sueloExpansivo: true, superficie_ha: 12,
    });
    expect(r.trazable).toBe(true);
    expect(r.banda.grado_pct).toBe(GRADO_CONSTRUIDO_PCT);
    expect(r.guia!.puntos.length).toBeGreaterThan(2);
    expect(r.unidad).not.toBeNull();
    expect(r.cauce).not.toBeNull();
    expect(r.cantidades!.surco_m).toBe(80004);
    expect(r.avisos.map((a) => a.id)).toContain('camellon_grado_se_replantea');
  });

  it('en terreno demasiado plano no devuelve geometria, devuelve el motivo', () => {
    const r = trazarCamellon(plano(0.5), { pendienteTerreno_pct: 0.5, grupoHidro: 'D' });
    expect(r.trazable).toBe(false);
    expect(r.guia).toBeNull();
    expect(r.banda.vacia).toBe(true);
    expect(r.avisos.map((a) => a.id)).toContain('camellon_banda_vacia');
  });
});
