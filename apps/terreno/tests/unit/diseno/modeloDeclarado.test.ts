/**
 * El modelo declarado, contra los casos resueltos del propio estándar.
 *
 * Casi todos los números esperados de este archivo están impresos en JCGM
 * 100:2008 con sus unidades: el coeficiente de expansión del cobre de 4.3.7, el
 * resistor patrón de 4.3.4, el voltímetro de 5.1.5, los diez resistores en serie
 * de 5.2.2 y el redondeo de 7.2.6. Son la clase de caso que pide la skill
 * `motor-de-calculo`: tomados de la literatura, no inventados.
 *
 * Lo que no sale del GUM sale de la especificación publicada del modelo de
 * elevación que acequia usa por defecto —el manual de Copernicus DEM— o de una
 * cuenta que se puede hacer a mano, y en los dos casos el test dice cuál.
 */
import { describe, it, expect } from 'vitest';
import {
  uDeCota, uDeIntervalo, uDeMedia, propagar, expandir, redondearGUM,
  declarar, declararDesnivel, declararVolumenDeVaso, declararSuperficie,
  incertidumbreDeCota, uDeSuperficie,
  EXACTITUD_DEM, FRACCION_SIGNIFICATIVA, K_95,
  type Entrada,
} from '../../../lib/modeloDeclarado';
import type { Mojon } from '../../../lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const M_POR_GRADO = 111_320;

/** Cuadrado de lado `lado_m` centrado en el ecuador, donde 1° de lng = 1° de lat. */
function cuadrado(lado_m: number): Mojon[] {
  const d = lado_m / M_POR_GRADO;
  return [
    { id: '1', numero: 1, lat: 0,  lng: 0 },
    { id: '2', numero: 2, lat: 0,  lng: d },
    { id: '3', numero: 3, lat: d,  lng: d },
    { id: '4', numero: 4, lat: d,  lng: 0 },
  ];
}

function entrada(id: string, valor: number, u: number, grupo?: string): Entrada {
  return { id, rotulo: id, valor, unidad: '', u, tipo: 'B', origen: 'test', grupo };
}

// ─── De una cota publicada a una incertidumbre típica ─────────────────────────

describe('de la cota publicada a la incertidumbre típica (GUM 4.3)', () => {
  it('EL EJEMPLO 1 DE 4.3.7: EL COBRE DEL MANUAL, QUE DA 0,23 SOBRE UNA COTA DE 0,40', () => {
    // «A handbook gives the value of the coefficient of linear thermal expansion
    // of pure copper at 20 °C […] and simply states that "the error in this
    // value should not exceed 0,40 × 10⁻⁶ °C⁻¹"» → u = 0,23 × 10⁻⁶ °C⁻¹.
    expect(uDeCota(0.40, 'rectangular')).toBeCloseTo(0.23, 2);
  });

  it('LAS TRES FORMAS SE PARECEN MUCHO MÁS DE LO QUE SE DIFERENCIA LO QUE HAY QUE SABER PARA ELEGIRLAS', () => {
    // El remate de la nota 1 de 4.3.9: «The magnitudes of the variances of the
    // three distributions are surprisingly similar in view of the large
    // differences in the amount of information required to justify them».
    const a = 1;
    expect(uDeCota(a, 'rectangular')).toBeCloseTo(0.5774, 4);   // a/√3
    expect(uDeCota(a, 'triangular')).toBeCloseTo(0.4082, 4);    // a/√6
    expect(uDeCota(a, 'normal_3sigma')).toBeCloseTo(0.3333, 4); // a/3
    // Elegir mal la forma mueve la incertidumbre un factor 1,73 y nada más.
    expect(uDeCota(a, 'rectangular') / uDeCota(a, 'normal_3sigma')).toBeCloseTo(Math.sqrt(3), 3);
  });

  it('LA RECTANGULAR ES LA QUE MENOS SUPONE Y LA QUE DEVUELVE EL NÚMERO MÁS GRANDE', () => {
    expect(uDeCota(1, 'rectangular')).toBeGreaterThan(uDeCota(1, 'triangular'));
    expect(uDeCota(1, 'triangular')).toBeGreaterThan(uDeCota(1, 'normal_3sigma'));
  });

  it('EL EJEMPLO DE 4.3.4: 129 µΩ AL 99 % SON 50 µΩ DE INCERTIDUMBRE TÍPICA', () => {
    // «The standard uncertainty of the resistor may be taken as
    //  u(Rs) = (129 µΩ)/2,58 = 50 µΩ».
    expect(uDeIntervalo(129, 99)).toBeCloseTo(50, 1);
  });

  it('UN LE90 NO ES UN DESVÍO ESTÁNDAR, Y PROPAGARLO SIN DIVIDIR INFLA TODO UN 64 %', () => {
    expect(uDeIntervalo(2, 90)).toBeCloseTo(2 / 1.64, 6);
    expect(2 / uDeIntervalo(2, 90)).toBeCloseTo(1.64, 6);
  });

  it('LA MEDIA DE UNA SERIE: ECUACIÓN (5), EL DESVÍO SOBRE RAÍZ DE N', () => {
    expect(uDeMedia(30, 36)).toBeCloseTo(5, 6);
    expect(uDeMedia(30, 1)).toBe(0);   // con una sola observación no hay desvío de la media
  });
});

// ─── La ley de propagación ────────────────────────────────────────────────────

describe('la ley de propagación (GUM 5.1 y 5.2)', () => {
  it('EL EJEMPLO DE 5.1.5: 12 µV CON 8,7 µV DAN 15 µV, NO 20,7', () => {
    // V = V̄ + ΔV̄, con u(V̄) = 12 µV y u(ΔV̄) = 8,7 µV → uc(V) = 15 µV.
    const p = propagar(v => (v.v ?? 0) + (v.dv ?? 0), [
      entrada('v', 0.928571e6, 12), entrada('dv', 0, 8.7),
    ]);
    expect(p).not.toBeNull();
    expect(p!.uc).toBeCloseTo(15, 0);
    // Sumar las incertidumbres en vez de combinarlas daría 20,7: el error de
    // bulto que la cuadratura evita.
    expect(12 + 8.7).toBeCloseTo(20.7, 1);
  });

  it('LOS DIEZ RESISTORES DE 5.2.2: 1 Ω CORRELACIONADOS, 0,32 Ω SI SE IGNORA, Y EL GUM DICE CUÁL ESTÁ MAL', () => {
    // «Ten resistors, each of nominal resistance Ri = 1 000 Ω, are calibrated
    // […] in terms of the same 1 000 Ω standard resistor Rs characterized by a
    // standard uncertainty u(Rs) = 100 mΩ». Rref = Σ Ri, r(Ri, Rj) = +1.
    // El estándar da uc(Rref) = 1 Ω, y sobre los 0,32 Ω dice: «is incorrect
    // because it does not take into account that all of the calibrated values
    // of the ten resistors are correlated».
    const resistores = Array.from({ length: 10 }, (_, i) =>
      entrada(`r${i}`, 1000, 0.1, 'patron'),
    );
    const p = propagar(v => Object.values(v).reduce((a, b) => a + b, 0), resistores);
    expect(p).not.toBeNull();
    expect(p!.uc).toBeCloseTo(1.0, 6);
    expect(p!.uc_independiente).toBeCloseTo(0.32, 2);
    expect(p!.uc / p!.uc_independiente).toBeCloseTo(Math.sqrt(10), 6);
  });

  it('Y EL SIGNO ES LA MITAD DE LA GRACIA: EL MISMO ERROR COMÚN SE CANCELA EN UNA RESTA', () => {
    // Dos cotas con el mismo sesgo. Si entran a una resta el sesgo desaparece;
    // si entran a una suma se duplica. Es la misma ecuación (16) con el mismo r.
    const resta = propagar(v => (v.a ?? 0) - (v.b ?? 0), [
      entrada('a', 100, 2, 'sesgo'), entrada('b', 90, 2, 'sesgo'),
    ]);
    const suma = propagar(v => (v.a ?? 0) + (v.b ?? 0), [
      entrada('a', 100, 2, 'sesgo'), entrada('b', 90, 2, 'sesgo'),
    ]);
    expect(resta!.uc).toBeCloseTo(0, 10);
    expect(suma!.uc).toBeCloseTo(4, 10);
    // Tratándolas como independientes, las dos darían lo mismo: √2·2 = 2,83.
    expect(resta!.uc_independiente).toBeCloseTo(Math.sqrt(2) * 2, 6);
    expect(suma!.uc_independiente).toBeCloseTo(Math.sqrt(2) * 2, 6);
  });

  it('LA ECUACIÓN (12): EN UN PRODUCTO, LAS INCERTIDUMBRES RELATIVAS SE COMBINAN EN CUADRATURA', () => {
    // Y = X1·X2·X3, cada una con el 10 % → uc/Y = √3 · 10 % = 17,3 %.
    const p = propagar(v => (v.a ?? 1) * (v.b ?? 1) * (v.c ?? 1), [
      entrada('a', 10, 1), entrada('b', 10, 1), entrada('c', 10, 1),
    ]);
    expect(p!.valor).toBeCloseTo(1000, 6);
    expect(p!.uc / p!.valor).toBeCloseTo(Math.sqrt(3) * 0.1, 3);
  });

  it('LAS DERIVADAS SALEN NUMÉRICAMENTE, QUE ES LO QUE AUTORIZA LA NOTA 2 DE 5.1.3', () => {
    // f = x², ∂f/∂x = 2x. A x = 5 el coeficiente de sensibilidad es 10.
    const p = propagar(v => (v.x ?? 0) ** 2, [entrada('x', 5, 0.1)]);
    const c = p!.contribuciones[0]!;
    expect(c.c).toBeCloseTo(10, 6);
    expect(c.ui).toBeCloseTo(1.0, 6);
    expect(c.fraccion).toBeCloseTo(1, 10);
  });

  it('LOS APORTES VIENEN ORDENADOS DE MAYOR A MENOR, Y LAS FRACCIONES SUMAN UNO', () => {
    const p = propagar(v => (v.a ?? 0) + (v.b ?? 0) + (v.c ?? 0), [
      entrada('a', 1, 1), entrada('b', 1, 3), entrada('c', 1, 2),
    ]);
    expect(p!.contribuciones.map(c => c.id)).toEqual(['b', 'c', 'a']);
    expect(p!.contribuciones.reduce((a, c) => a + c.fraccion, 0)).toBeCloseTo(1, 10);
  });

  it('UNA ENTRADA SIN INCERTIDUMBRE NO APORTA, Y UNA ENTRADA ROTA DEVUELVE NULL EN VEZ DE NaN', () => {
    const p = propagar(v => (v.a ?? 0) * 2, [entrada('a', 3, 0)]);
    expect(p!.uc).toBe(0);
    expect(propagar(v => v.a ?? 0, [entrada('a', NaN, 1)])).toBeNull();
    expect(propagar(v => v.a ?? 0, [])).toBeNull();
  });
});

// ─── Expansión y redondeo ─────────────────────────────────────────────────────

describe('cómo se imprime (GUM 6.3.3 y 7.2.6)', () => {
  it('K = 2 DA EL 95 %, Y SIN DECLARAR EL K EL ± NO SIGNIFICA NADA', () => {
    expect(expandir(3, K_95)).toBe(6);
    expect(K_95).toBe(2);
  });

  it('EL EJEMPLO DE 7.2.6: 10,05762 CON 27 mΩ SE IMPRIME 10,058', () => {
    // «if y = 10,057 62 Ω with uc(y) = 27 mΩ, y should be rounded to 10,058 Ω».
    const r = redondearGUM(10.05762, 0.027);
    expect(r.valor).toBeCloseTo(10.058, 6);
    expect(r.u).toBeCloseTo(0.027, 6);
    expect(r.decimales).toBe(3);
  });

  it('Y 28,05 kHz BAJA A 28, QUE ES EL CASO EN QUE EL ESTÁNDAR PIDE SENTIDO COMÚN', () => {
    // «common sense should prevail and a value such as u(xi) = 28,05 kHz should
    // be rounded down to 28 kHz». Redondear al más cercano lo cumple.
    expect(redondearGUM(1234, 28.05).u).toBeCloseTo(28, 6);
  });

  it('EL OTRO EJEMPLO DE 7.2.6 VA PARA EL LADO CONTRARIO, Y ACEQUIA ELIGE LA REGLA TESTEABLE', () => {
    // El estándar sugiere que 10,47 m «might be rounded up to 11 m», pero eso
    // es permiso y no regla: con los dos ejemplos juntos no hay criterio
    // automático que los cumpla a los dos. acequia redondea al más cercano, así
    // que acá da 10 y no 11, y queda dicho.
    expect(redondearGUM(123.456, 10.47).u).toBeCloseTo(10, 6);
  });

  it('DOS CIFRAS SIGNIFICATIVAS EN LA INCERTIDUMBRE, Y EL VALOR AL MISMO LUGAR', () => {
    const r = redondearGUM(1247.3829, 615.8);
    expect(r.u).toBe(620);
    expect(r.valor).toBe(1250);
    expect(r.decimales).toBe(0);
    // Las cuatro cifras de la derecha del número original eran ruido con
    // aspecto de dato.
    expect(r.valorTexto).not.toContain(',');
  });

  it('SIN INCERTIDUMBRE NO INVENTA DECIMALES, Y CON UN VALOR ROTO NO IMPRIME UN NÚMERO', () => {
    expect(redondearGUM(5.5, 0).uTexto).toBe('—');
    expect(redondearGUM(NaN, 1).valorTexto).toBe('—');
  });
});

// ─── La exactitud del modelo de elevación ─────────────────────────────────────

describe('la exactitud publicada del relieve', () => {
  it('COPERNICUS GLO-30 PUBLICA LAS DOS EXACTITUDES Y LA BASE DEL PUNTO A PUNTO', () => {
    // Manual del producto v5.0, §2.1 y §2.2: absoluta < 4 m al 90 %, relativa
    // < 2 m (pendiente ≤ 20 %) y < 4 m (> 20 %), «90% linear point-to-point
    // error within an area of 1° × 1°».
    const e = EXACTITUD_DEM.glo30!;
    expect(e.le90_abs_m).toBe(4);
    expect(e.le90_rel_m).toBe(2);
    expect(e.le90_rel_fuerte_m).toBe(4);
    expect(e.pendiente_corte_pct).toBe(20);
    expect(e.base_declarada).not.toBeNull();
  });

  it('Y DE AHÍ SALEN LAS TRES COMPONENTES: ABSOLUTA, PUNTO A PUNTO Y SESGO', () => {
    const inc = incertidumbreDeCota('glo30', 5);
    expect(inc.u_absoluta).toBeCloseTo(4 / 1.64, 4);      // 2,44 m
    expect(inc.u_relativa).toBeCloseTo(2 / 1.64, 4);      // 1,22 m
    // El sesgo es lo que le queda a la absoluta después de sacarle el aleatorio.
    expect(inc.u_sesgo).toBeCloseTo(
      Math.sqrt((4 / 1.64) ** 2 - (2 / 1.64) ** 2), 4,     // 2,11 m
    );
    expect(inc.motivo).toBeNull();
  });

  it('EN PENDIENTE FUERTE EL PUNTO A PUNTO EMPEORA AL DOBLE, Y ENTONCES EL SESGO DESAPARECE', () => {
    const suave  = incertidumbreDeCota('glo30', 10);
    const fuerte = incertidumbreDeCota('glo30', 30);
    expect(fuerte.u_relativa!).toBeCloseTo(2 * suave.u_relativa!, 6);
    // Con relativa = absoluta, el proveedor está diciendo que ahí todo el error
    // es aleatorio: no queda sesgo que restar.
    expect(fuerte.u_sesgo).toBe(0);
  });

  it('SRTM PUBLICA LOS DOS NÚMEROS Y NO DICE SOBRE QUÉ DISTANCIA, ASÍ QUE NO SE PUEDE PROPAGAR', () => {
    // Farr et al. (2007) §1.2: 16 m absoluto y 10 m relativo, los dos al 90 %,
    // pero sin base de comparación. El error entre dos celdas vecinas no es el
    // mismo que entre dos celdas a 100 km.
    const inc = incertidumbreDeCota('srtm30');
    expect(inc.u_absoluta).toBeCloseTo(16 / 1.64, 4);
    expect(inc.u_relativa).toBeNull();
    expect(inc.motivo).toContain('sobre qué distancia');
    expect(declararDesnivel({
      cota_alta_m: 120, cota_baja_m: 100, distancia_m: 200, fuente: 'srtm30',
    })).toBeNull();
  });

  it('Y DONDE NO SE LEYÓ NINGUNA ESPECIFICACIÓN, ACEQUIA DICE QUE NO PUEDE EN VEZ DE USAR SU CRITERIO DE DIBUJO', () => {
    const inc = incertidumbreDeCota('usgs3dep');
    expect(inc.u_absoluta).toBeNull();
    expect(inc.u_relativa).toBeNull();
    expect(inc.motivo).toContain('no cuánto puede estar errada una cota');
  });
});

// ─── El sesgo se cancela en una resta ─────────────────────────────────────────

describe('el desnivel, donde el sesgo se cancela', () => {
  const d = declararDesnivel({
    cota_alta_m: 220, cota_baja_m: 200, distancia_m: 300, fuente: 'glo30', pendiente_pct: 7,
  })!;

  it('EL SESGO ENTRA AL MODELO Y APORTA EXACTAMENTE CERO, QUE ES LA DIFERENCIA ENTRE DEMOSTRARLO Y AFIRMARLO', () => {
    const sesgo = d.propagacion.contribuciones.find(c => c.id === 'sesgo')!;
    expect(sesgo.ui).toBeCloseTo(0, 10);
    expect(sesgo.fraccion).toBeCloseTo(0, 10);
  });

  it('ASÍ QUE EL DESNIVEL SALE CON 1,72 m Y NO CON 3,45: PROPAGAR LA ABSOLUTA LO DUPLICA', () => {
    const inc = incertidumbreDeCota('glo30', 7);
    expect(d.propagacion.uc).toBeCloseTo(Math.sqrt(2) * inc.u_relativa!, 6);
    expect(d.propagacion.uc).toBeCloseTo(1.725, 3);
    const conAbsoluta = Math.sqrt(2) * inc.u_absoluta!;
    expect(conAbsoluta).toBeCloseTo(3.449, 3);
    expect(conAbsoluta / d.propagacion.uc).toBeCloseTo(2, 2);
  });

  it('20 m DE DESNIVEL CON ±3,5 m AL 95 %: EL NÚMERO SIRVE, PERO NO AL CENTÍMETRO', () => {
    expect(d.propagacion.valor).toBeCloseTo(20, 6);
    expect(d.U).toBeCloseTo(3.45, 2);
    expect(d.redondeo.valorTexto).toBe('20,0');
    expect(d.advertencias.some(a => a.includes('se cancela entero'))).toBe(true);
  });

  /*
   * Un viaje, un renglón —y la ganancia del viaje entero.
   *
   * Las dos cotas del desnivel comparten la MISMA medición: el que sube con el
   * nivel levanta las dos en la misma mañana. Un renglón por entrada imprimía
   * dos veces «el desnivel entre los dos puntos · −29 %», porque cada uno
   * calculaba la ganancia mejorando una sola de las dos. Con las dos mejoradas
   * —que es lo que pasa en el campo— el intervalo no baja un 29 %: baja un 98 %.
   * El error no era de forma: al productor se le ofrecía un viaje que parecía no
   * valer la pena.
   */
  it('EL PEDIDO DE RELEVAMIENTO ES UNO SOLO, Y VALE LO QUE VALE EL VIAJE ENTERO', () => {
    expect(d.relevamiento).toHaveLength(1);
    const r = d.relevamiento[0]!;
    expect(r.medicion.que).toContain('desnivel entre los dos puntos');
    // Las dos cotas aportan el 100 % de la varianza (el sesgo aporta cero).
    expect(r.fraccion).toBeCloseTo(1, 6);
    // uc pasa de √2·1,22 = 1,725 m a √2·0,02 = 0,028 m.
    expect(r.uc_despues).toBeCloseTo(Math.sqrt(2) * 0.02, 6);
    expect(r.ganancia).toBeGreaterThan(0.95);
    // Mejorar UNA sola cota —lo que hacía antes— daba esto, y no es lo que se
    // consigue yendo al campo con un nivel.
    const unaSola = 1 - Math.sqrt(0.02 ** 2 + 1.22 ** 2) / d.propagacion.uc;
    expect(unaSola).toBeCloseTo(0.29, 2);
  });

  it('Y SI LOS DOS PUNTOS ESTÁN MÁS CERCA QUE UNA CELDA, AVISA QUE AHÍ NO HAY DOS MEDICIONES', () => {
    const corto = declararDesnivel({
      cota_alta_m: 220, cota_baja_m: 219, distancia_m: 12, fuente: 'glo30',
    })!;
    expect(corto.advertencias.some(a => a.includes('interpolada dos veces'))).toBe(true);
  });
});

// ─── El sesgo no se cancela en una suma, y la cota del agua pesa N veces ──────

describe('el volumen del vaso, donde una sola celda manda', () => {
  const N = 50;
  const AREA_CELDA = 100;          // 10 × 10 m
  const PROF = 2;                  // 2 m de profundidad media
  const d = declararVolumenDeVaso({
    cota_agua_m: 302,
    cotas_fondo_m: Array.from({ length: N }, () => 300),
    area_celda_m2: AREA_CELDA,
    fuente: 'glo30',
    pendiente_pct: 8,
  })!;
  const u = incertidumbreDeCota('glo30', 8).u_relativa!;

  it('LA INCERTIDUMBRE DEL VOLUMEN ES LA SUPERFICIE DEL ESPEJO POR EL ERROR PUNTO A PUNTO', () => {
    // u(V) = A_celda · u · √(N² + N), y para cualquier vaso con más de una celda
    // el término N² —la cota del agua, que aparece en los N términos— manda.
    expect(d.propagacion.uc).toBeCloseTo(AREA_CELDA * u * Math.sqrt(N * N + N), 6);
    const espejo = N * AREA_CELDA;
    expect(d.propagacion.uc / (espejo * u)).toBeCloseTo(Math.sqrt(1 + 1 / N), 6);
  });

  it('LA COTA DEL AGUA PONE EL 98 % DE LA VARIANZA Y EL FONDO ENTERO EL 2 %', () => {
    const agua  = d.propagacion.contribuciones.find(c => c.id === 'z_agua')!;
    const fondo = d.propagacion.contribuciones.find(c => c.id === 'z_fondo')!;
    expect(agua.fraccion).toBeCloseTo(N / (N + 1), 6);     // 0,980
    expect(fondo.fraccion).toBeCloseTo(1 / (N + 1), 6);    // 0,0196
    // El sesgo, otra vez, cero: el vaso es una diferencia de cotas.
    expect(d.propagacion.contribuciones.find(c => c.id === 'sesgo')!.ui).toBeCloseTo(0, 10);
  });

  it('DARLE A CADA CELDA SU PROPIA COTA DE AGUA DARÍA 5 VECES MENOS INCERTIDUMBRE, Y SERÍA LA CUENTA EQUIVOCADA', () => {
    const ingenua = AREA_CELDA * u * Math.sqrt(2 * N);
    expect(d.propagacion.uc / ingenua).toBeCloseTo(Math.sqrt((N + 1) / 2), 6);
    expect(Math.sqrt((N + 1) / 2)).toBeCloseTo(5.05, 2);
  });

  it('Y ENTONCES ESTE VASO SATELITAL TIENE UN INTERVALO MÁS ANCHO QUE SU PROPIO VOLUMEN', () => {
    expect(d.propagacion.valor).toBeCloseTo(N * AREA_CELDA * PROF, 6);   // 10.000 m³
    expect(d.U).toBeGreaterThan(d.propagacion.valor);
    expect(d.advertencias.some(a => a.includes('más ancho que el propio valor'))).toBe(true);
    // No es un error de cálculo: con 2 m de error punto a punto, 2 m de
    // profundidad media no se resuelven. Es el mismo hallazgo de la etapa I,
    // visto desde el volumen en lugar del surco.
    expect(PROF / u).toBeCloseTo(1.64, 2);
  });

  it('CON CELDAS DE 30 m AVISA QUE TODO LO QUE SE VE ADENTRO DEL VASO ES INTERPOLACIÓN', () => {
    expect(d.advertencias.some(a => a.includes('es interpolación'))).toBe(true);
  });
});

// ─── El pedido de relevamiento ────────────────────────────────────────────────

describe('el pedido de relevamiento, que sale de la cuenta y no de la intuición', () => {
  const N = 50;
  const d = declararVolumenDeVaso({
    cota_agua_m: 302,
    cotas_fondo_m: Array.from({ length: N }, () => 300),
    area_celda_m2: 100,
    fuente: 'glo30',
    pendiente_pct: 8,
  })!;

  it('UN SOLO RENGLÓN, PORQUE ES UN SOLO VIAJE: LA MISMA JORNADA LEVANTA VERTEDERO Y FONDO', () => {
    // El fondo pone 1/51 = 2 % de la varianza: por su cuenta no justificaría el
    // viaje, y antes quedaba afuera del pedido. Pero la medición declarada es
    // una sola —«la cota del vertedero y tres o cuatro cotas del fondo,
    // referidas entre sí»— y se hace de una: el renglón es uno y arregla las
    // dos entradas a la vez.
    expect(d.relevamiento).toHaveLength(1);
    expect(d.relevamiento[0]!.id).toBe('z_agua+z_fondo');
    expect(1 / (N + 1)).toBeLessThan(FRACCION_SIGNIFICATIVA);
    // Y lo que manda sigue siendo la cota del agua: aporta el 98 % de la varianza.
    const agua = d.propagacion.contribuciones.find(c => c.id === 'z_agua')!;
    expect(agua.fraccion).toBeGreaterThan(0.95);
  });

  it('Y DICE CUÁNTO SE GANA: 86 % MENOS DE INCERTIDUMBRE POR MEDIO DÍA CON UN NIVEL', () => {
    const r = d.relevamiento[0]!;
    expect(r.ganancia).toBeGreaterThan(0.8);
    expect(r.uc_despues).toBeLessThan(d.propagacion.uc / 5);
    expect(r.medicion.como).toContain('nivel');
    // Después de medir, el intervalo deja de comerse el valor.
    expect(2 * r.uc_despues).toBeLessThan(d.propagacion.valor);
  });

  it('EL UMBRAL DEL 10 % DE LA VARIANZA ES CONVENCIÓN DE ACEQUIA, Y SIGNIFICA UN 5 % DE MEJORA', () => {
    // GUM 4.3.7 pide buscar más datos cuando un aporte «contributes
    // significantly» y no pone número. El 10 % está elegido para que valga la
    // pena: hacer desaparecer ese aporte baja la incertidumbre un 5 %.
    expect(FRACCION_SIGNIFICATIVA).toBe(0.10);
    expect(1 - Math.sqrt(1 - FRACCION_SIGNIFICATIVA)).toBeCloseTo(0.0513, 4);
  });

  it('NO PIDE MEDIR LO QUE YA ESTÁ MEJOR MEDIDO QUE LO QUE EL RELEVAMIENTO DARÍA', () => {
    const sinGanancia = declarar({
      magnitud: 'x', unidad: 'm', modelo: 'x', fuente: 'test',
      f: v => v.x ?? 0,
      entradas: [{
        id: 'x', rotulo: 'x', valor: 10, unidad: 'm', u: 0.01, tipo: 'B', origen: 'test',
        medicion: { que: 'x', como: 'cinta', u_esperada: 0.05 },
      }],
    })!;
    expect(sinGanancia.relevamiento).toHaveLength(0);
  });
});

// ─── La superficie dibujada a mano ────────────────────────────────────────────

describe('la superficie del predio, que sale de un clic', () => {
  it('EN UN CUADRADO DE LADO L LA FÓRMULA DA σ·L·√2 EXACTO', () => {
    // u²(A) = (σ²/4)·Σ|Pᵢ₊₁ − Pᵢ₋₁|². En un cuadrado cada vecino-de-vecino
    // está a la diagonal, L√2, así que Σ = 4·2L² = 8L² y u(A) = σ·L·√2.
    const L = 100, sigma = 1;
    expect(uDeSuperficie(cuadrado(L), sigma)).toBeCloseTo(sigma * L * Math.SQRT2, 2);
  });

  it('1 ha DIBUJADA CON 1 m DE ERROR POR MOJÓN SON ±283 m² AL 95 %: EL 2,8 %', () => {
    const d = declararSuperficie({ mojones: cuadrado(100), sigma_vertice_m: 1 })!;
    // turf mide la superficie geodésica y da 9.977 m² sobre el cuadrado
    // construido con 111.320 m por grado: la misma aproximación plana que usa
    // el resto de la app para operar polígonos en lat/lng.
    expect(d.propagacion.valor).toBeCloseTo(10_000, -2);
    expect(d.U).toBeCloseTo(2 * 100 * Math.SQRT2, 0);      // 283 m²
    expect(d.relativa!).toBeCloseTo(0.0283, 3);
  });

  it('CADA MOJÓN PESA SEGÚN LA DISTANCIA ENTRE SUS DOS VECINOS, NO SEGÚN LA SUYA', () => {
    // Agregar un mojón en el medio de un lado recto casi no cambia la
    // incertidumbre: sus dos vecinos siguen a la misma distancia entre sí.
    const base = cuadrado(100);
    const d = 100 / M_POR_GRADO;
    const conMedio: Mojon[] = [
      base[0]!, { id: '1b', numero: 5, lat: 0, lng: d / 2 }, base[1]!, base[2]!, base[3]!,
    ];
    const u4 = uDeSuperficie(base, 1)!;
    const u5 = uDeSuperficie(conMedio, 1)!;
    expect(u5 / u4).toBeLessThan(1.1);
  });

  it('CON MENOS DE TRES MOJONES O SIN CORRIMIENTO DECLARADO NO DEVUELVE NADA', () => {
    expect(uDeSuperficie(cuadrado(100).slice(0, 2), 1)).toBeNull();
    expect(uDeSuperficie(cuadrado(100), 0)).toBeNull();
    expect(declararSuperficie({ mojones: cuadrado(100), sigma_vertice_m: 0 })).toBeNull();
  });
});

// ─── La correlación que no se puede ignorar ───────────────────────────────────

describe('la advertencia de correlación (GUM 5.2.5)', () => {
  it('CUANDO IGNORAR LA CORRELACIÓN CAMBIARÍA EL NÚMERO, EL MODELO DECLARADO LO DICE', () => {
    // «Correlations between input quantities cannot be ignored if present and
    // significant». Diez celdas del mismo modelo sumadas: la cuenta ingenua da
    // √10 veces menos.
    const d = declarar({
      magnitud: 'Movimiento de suelo', unidad: 'm³', modelo: 'Σ hᵢ · A', fuente: 'test',
      f: v => Object.values(v).reduce((a, b) => a + b, 0) * 100,
      entradas: Array.from({ length: 10 }, (_, i) => entrada(`h${i}`, 0.5, 0.2, 'dem')),
    })!;
    expect(d.propagacion.uc / d.propagacion.uc_independiente).toBeCloseTo(Math.sqrt(10), 6);
    expect(d.advertencias.some(a => a.includes('veces más chica'))).toBe(true);
  });

  it('Y CUANDO NO HAY CORRELACIÓN NO INVENTA LA ADVERTENCIA', () => {
    const d = declarar({
      magnitud: 'x', unidad: 'm', modelo: 'a + b', fuente: 'test',
      f: v => (v.a ?? 0) + (v.b ?? 0),
      entradas: [entrada('a', 1, 0.1), entrada('b', 2, 0.1)],
    })!;
    expect(d.propagacion.uc).toBeCloseTo(d.propagacion.uc_independiente, 10);
    expect(d.advertencias.some(a => a.includes('veces más chica'))).toBe(false);
  });
});
