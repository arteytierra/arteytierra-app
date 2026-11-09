/**
 * El factor de actividad radicular por temperatura de suelo.
 *
 * El caso resuelto es doble y los dos salen del mismo trabajo:
 *
 * 1. **La Figura 1 contra sí misma.** La figura trae la ecuación impresa adentro
 *    del recuadro y además dibuja la curva. Son dos cosas distintas en el papel y
 *    tienen que coincidir: los puntos de `PUNTOS_DE_LA_FIGURA_1` son la curva
 *    digitalizada de la página escaneada, y el test los compara contra la
 *    ecuación.
 * 2. **La Figura 3 contra el camino de acequia.** La Figura 3 es la actividad
 *    estacional que el trabajo calculó para Swift Current pasando sus curvas de
 *    temperatura por la Figura 1. acequia hace lo mismo con ERA5-Land en ese
 *    mismo píxel, y la diferencia está medida con su dirección.
 */
import { describe, it, expect } from 'vitest';
import {
  FUENTES_ACTIVIDAD_RADICULAR,
  CURVA_DE_LA_FIGURA_1,
  RANGO_DE_LA_FIGURA,
  PUNTOS_DE_LA_FIGURA_1,
  AJUSTE_A_LA_CURVA_DIBUJADA,
  CAPAS,
  EL_SESGO_DEL_DATO_DE_SUELO,
  LO_QUE_HACE_LA_TEMPORADA,
  CONTRA_LA_FIGURA_3,
  ADVERTENCIAS_ACTIVIDAD,
  AVISO_ACTIVIDAD_RADICULAR,
  actividadRadicular,
  actividadDeLasCapas,
} from '@/lib/actividadRadicular';

describe('el caso resuelto 1: la curva dibujada contra la ecuación impresa', () => {
  it('los puntos digitalizados caen sobre la ecuación', () => {
    // 0,59 puntos porcentuales es la peor diferencia medida en las 1.038
    // columnas de 0 a 16 °C; el test pide 0,7 para no depender del redondeo de
    // las lecturas que quedaron guardadas.
    for (const [t, pct] of PUNTOS_DE_LA_FIGURA_1) {
      const mio = (actividadRadicular(t) as number) * 100;
      expect(Math.abs(mio - pct)).toBeLessThan(0.7);
    }
    expect(PUNTOS_DE_LA_FIGURA_1).toHaveLength(16);
  });

  it('ajustar una exponencial a la curva dibujada devuelve la ecuación impresa', () => {
    const a = AJUSTE_A_LA_CURVA_DIBUJADA;
    expect(Math.abs(a.a - CURVA_DE_LA_FIGURA_1.a) / CURVA_DE_LA_FIGURA_1.a).toBeLessThan(0.02);
    expect(Math.abs(a.k - CURVA_DE_LA_FIGURA_1.k) / CURVA_DE_LA_FIGURA_1.k).toBeLessThan(0.01);
    expect(a.columnas).toBeGreaterThan(1000);
    expect(a.peor_diferencia_pp).toBeLessThan(1);
  });

  it('la saturación de la ecuación es donde la curva toca el borde del recuadro', () => {
    const t = Math.log(1 / CURVA_DE_LA_FIGURA_1.a) / CURVA_DE_LA_FIGURA_1.k;
    expect(t).toBeCloseTo(CURVA_DE_LA_FIGURA_1.satura_en_c, 2);
    expect(t).toBeLessThan(RANGO_DE_LA_FIGURA.maximo_c);
    expect(actividadRadicular(CURVA_DE_LA_FIGURA_1.satura_en_c)).toBeCloseTo(1, 3);
  });
});

describe('la función', () => {
  it('en 0 °C vale lo que dice la ecuación, y nunca pasa de 1', () => {
    expect(actividadRadicular(0)).toBeCloseTo(CURVA_DE_LA_FIGURA_1.en_cero_c, 6);
    expect(actividadRadicular(18)).toBe(1);
    expect(actividadRadicular(40)).toBe(1);
  });

  it('crece con la temperatura, siempre', () => {
    let previo = -1;
    for (let t = -10; t <= 20; t += 0.5) {
      const v = actividadRadicular(t) as number;
      expect(v).toBeGreaterThanOrEqual(previo);
      previo = v;
    }
  });

  it('bajo cero extrapola, y ahí ya no queda casi nada que extraer', () => {
    // La figura arranca en 0 °C. Seguir la exponencial abajo de eso es
    // extrapolar, y está advertido; la alternativa —cortar en seco— cambiaría
    // menos que el error de leer la figura y metería un salto.
    expect(actividadRadicular(-5) as number).toBeLessThan(0.02);
    expect(actividadRadicular(-10) as number).toBeLessThan(0.007);
    expect(actividadRadicular(-5) as number).toBeGreaterThan(0);
    expect(ADVERTENCIAS_ACTIVIDAD.bajo_cero).toMatch(/0,02/);
  });

  it('un día sin temperatura devuelve null, no cero', () => {
    // Un null del dato no es un suelo helado: rellenarlo con cero cerraría el
    // perfil por una laguna del reanálisis.
    expect(actividadRadicular(null)).toBeNull();
    expect(actividadRadicular(undefined)).toBeNull();
    expect(actividadRadicular(NaN)).toBeNull();
    expect(actividadRadicular(Infinity)).toBeNull();
  });
});

describe('las capas', () => {
  it('la primera no lleva factor y las de abajo sí, como en el trabajo', () => {
    const c = actividadDeLasCapas(5, 3);
    expect(c).not.toBeNull();
    expect(c![0]).toBe(1);
    expect(c![1]).toBeCloseTo(actividadRadicular(5) as number, 9);
    expect(c![2]).toBe(c![1]);
    expect(CAPAS.la_primera_no_lleva_factor).toBe(true);
  });

  it('devuelve una por capa, y null si no hay temperatura o no hay capas', () => {
    expect(actividadDeLasCapas(10, 4)).toHaveLength(4);
    expect(actividadDeLasCapas(10, 1)).toEqual([1]);
    expect(actividadDeLasCapas(null, 3)).toBeNull();
    expect(actividadDeLasCapas(10, 0)).toBeNull();
  });

  it('las dos capas del modelo que llevan factor caen adentro de una sola del dato', () => {
    const [desde, hasta] = CAPAS.era5_land_cm[2]!;
    for (const capa of [CAPAS.modelo_cm[1]!, CAPAS.modelo_cm[2]!]) {
      expect(capa[0]).toBeGreaterThanOrEqual(desde);
      expect(capa[1]).toBeLessThanOrEqual(hasta);
    }
    expect(CAPAS.la_que_se_usa).toMatch(/28_to_100/);
    expect(ADVERTENCIAS_ACTIVIDAD.una_temperatura_para_dos_capas).toMatch(/ALTO/);
  });
});

describe('el caso resuelto 2: la Figura 3 contra el camino de acequia', () => {
  it('acequia lee alto en todas las quincenas, que es la dirección declarada', () => {
    for (const [, mio, c3060] of CONTRA_LA_FIGURA_3.medido) {
      expect(mio as number).toBeGreaterThanOrEqual(c3060 as number);
    }
    expect(CONTRA_LA_FIGURA_3.sesgo_pp.contra_30_60).toBeGreaterThan(0);
    expect(CONTRA_LA_FIGURA_3.sesgo_del_indice).toBe('alto');
  });

  it('el sesgo medido es el de la tabla que tiene al lado', () => {
    const f = CONTRA_LA_FIGURA_3.medido;
    const d = f.map(([, mio, a]) => (mio as number) - (a as number));
    const media = d.reduce((x, y) => x + y, 0) / d.length;
    expect(media).toBeCloseTo(CONTRA_LA_FIGURA_3.sesgo_pp.contra_30_60, 1);
    expect(f).toHaveLength(CONTRA_LA_FIGURA_3.quincenas);
  });

  it('la figura publicada dice cuánto cuesta darles una sola temperatura a dos capas', () => {
    // En primavera la actividad de 60-90 es una fracción de la de 30-60, y baja
    // a medida que la estación avanza. Nosotros les damos el mismo número.
    const c = CONTRA_LA_FIGURA_3.cociente_publicado_60_90_sobre_30_60;
    expect(c.abr_16).toBeGreaterThan(c.may_1);
    expect(c.may_1).toBeGreaterThan(c.may_16);
    expect(c.may_16).toBeGreaterThan(c.jun_1);
    expect(c.jun_1).toBeLessThan(0.7);
    for (const [, , a, b] of CONTRA_LA_FIGURA_3.medido) {
      expect(b as number).toBeLessThanOrEqual(a as number);
    }
  });
});

describe('el dato de temperatura de suelo', () => {
  it('se midió contra una fuente que no es ERA5, y adentro de la ventana el sesgo es chico', () => {
    const s = EL_SESGO_DEL_DATO_DE_SUELO;
    expect(s.era5_menos_merra2_c.en_la_ventana)
      .toBeLessThan(s.era5_menos_merra2_c.anio_entero);
    expect(s.dias).toBeGreaterThan(10000);
    expect(s.diferencia_de_actividad_en_la_ventana).toBeLessThan(0.05);
    expect(FUENTES_ACTIVIDAD_RADICULAR.control_independiente).toMatch(/MERRA-2/);
  });

  it('parte de la diferencia es la altura del píxel y no el modelo', () => {
    const a = EL_SESGO_DEL_DATO_DE_SUELO.altitud_del_pixel_m;
    expect(a.nasa_power).toBeGreaterThan(a.era5_land);
    // 133 m de diferencia son del orden de un grado por gradiente seco.
    expect((a.nasa_power - a.era5_land) * 0.0098)
      .toBeGreaterThan(EL_SESGO_DEL_DATO_DE_SUELO.era5_menos_merra2_c.en_la_ventana);
  });
});

describe('lo que hace la temporada, y los avisos', () => {
  it('la curva evaluada en las temperaturas medidas da los factores declarados', () => {
    const l = LO_QUE_HACE_LA_TEMPORADA;
    expect(actividadRadicular(l.abril_15_30.t_suelo_c)).toBeCloseTo(l.abril_15_30.actividad, 3);
    expect(actividadRadicular(l.julio_1_15.t_suelo_c)).toBeCloseTo(l.julio_1_15.actividad, 3);
    // Y el salto de una punta a la otra de la temporada es el que hace que un
    // factor constante no sirva: de 0,07 a 1 en once semanas.
    expect(l.julio_1_15.actividad / l.abril_15_30.actividad).toBeGreaterThan(10);
  });

  it('el aviso declara las dos direcciones, y son opuestas', () => {
    // Un factor más chico baja el índice y sube el Yp que se despeja de un
    // corte. Un solo campo `sesgo` no alcanza para dos consumidores.
    expect(AVISO_ACTIVIDAD_RADICULAR.sesgo_del_indice).toBe('alto');
    expect(AVISO_ACTIVIDAD_RADICULAR.sesgo_del_yp).toBe('bajo');
    expect(AVISO_ACTIVIDAD_RADICULAR.sesgo_del_indice)
      .not.toBe(AVISO_ACTIVIDAD_RADICULAR.sesgo_del_yp);
    expect(AVISO_ACTIVIDAD_RADICULAR.aviso).toMatch(/28/);
  });

  it('las fuentes nombran la figura, el origen y de dónde sale la temperatura', () => {
    const f = FUENTES_ACTIVIDAD_RADICULAR;
    expect(f.figura).toMatch(/Wight/);
    expect(f.figura).toMatch(/Figura 1/);
    expect(f.origen_de_la_curva).toMatch(/de Jong, E\. \(1974\)/);
    // Y la otra cita, que es otra persona y aporta otra cosa.
    expect(f.curvas_de_temperatura_del_trabajo).toMatch(/de Jong, R\. \(1978\)/);
    expect(f.temperatura_del_suelo).toMatch(/ERA5-Land/);
  });
});
