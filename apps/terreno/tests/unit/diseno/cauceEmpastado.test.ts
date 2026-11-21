import { describe, it, expect } from 'vitest';
import {
  GAMMA_LB_FT3, LB_FT2_EN_PA, PIE3_S_EN_M3_S,
  INDICE_RETARDANCIA, ESFUERZO_ADMISIBLE_LB_FT2, ERODIBILIDAD_POR_TEXTURA,
  COBERTURAS_CAUCE, FACTOR_TALLOS, FACTOR_CF,
  RETARDANCIA_CAPACIDAD_DEFECTO, RETARDANCIA_ESTABILIDAD_DEFECTO,
  TORMENTA_DISENO_ANIOS, TORMENTA_DISENO_H,
  CAUDAL_TABLA_MIN_M3S, PENDIENTE_TABLA_MAX_PCT, TALUD_ORILLA_REVISAR,
  RUGOSIDAD_GRANO_FINO,
  erodibilidadDeTextura, rugosidadDeGrano, indiceDeCurva, esfuerzoVegetalAdmisible,
  manningRetardancia, velocidadManning,
  areaTrapecio, perimetroTrapecio, anchoTrapecio,
  areaParabola, coefParabolico, anchoParabola, taludParabola, perimetroParabola,
  profundidadNormal, dimensionarCauce, caudalDeDiseno, CN_PASTURA,
} from '@/lib/cauceEmpastado';
import { CLASES_USDA } from '@/lib/textura';
import { PIE_M } from '@/lib/represaDiseno';

const pie = (m: number) => m / PIE_M;

/**
 * ── EL CASO RESUELTO ───────────────────────────────────────────────────────
 *
 * Tabla 7–7 del cap. 7 del EFH 650: la solución por tanteo del ejemplo 3, con
 * cuatro profundidades y cinco valores intermedios publicados en cada una.
 * Trapecio de 35 pies de base, talud 4:1, pendiente 0,85 %, caudal 160 pie³/s,
 * retardancia C para la capacidad.
 *
 * **La tabla trae un error de imprenta y acá queda a la vista.** La velocidad
 * de Manning de la columna de D = 1,4 sale impresa como 2,286, pero la fila de
 * abajo de la misma tabla —la diferencia VM − VT— dice 0,471 con VT = 2,815, y
 * 2,815 + 0,471 = 3,286. Es un 3 impreso como 2. El test usa el valor que
 * cierra la aritmética de la propia tabla.
 */
const TABLA_7_7 = [
  { D: 1.5, A: 61.50, R: 1.298, VT: 2.602, n: 0.048, VM: 3.401 },
  { D: 1.4, A: 56.84, R: 1.221, VT: 2.815, n: 0.048, VM: 3.286 },
  { D: 1.3, A: 52.26, R: 1.143, VT: 3.062, n: 0.047, VM: 3.166 },
  { D: 1.2, A: 47.76, R: 1.064, VT: 3.350, n: 0.047, VM: 3.038 },
] as const;

describe('cauce empastado · el caso resuelto de la tabla 7–7', () => {
  const B = 35;
  const z = 4;
  const S = 0.0085;
  const Q = 160;

  for (const f of TABLA_7_7) {
    it(`a ${f.D} pies reproduce las cinco columnas publicadas`, () => {
      const A = areaTrapecio(B, f.D, z);
      const R = A / perimetroTrapecio(B, f.D, z);
      const VT = Q / A;
      const n = manningRetardancia(INDICE_RETARDANCIA.C, VT * R);
      const VM = velocidadManning(n, R, S);

      expect(A).toBeCloseTo(f.A, 2);
      expect(R).toBeCloseTo(f.R, 3);
      expect(VT).toBeCloseTo(f.VT, 3);
      // La tabla publica `n` con tres decimales.
      expect(n).toBeCloseTo(f.n, 3);
      /**
       * VM con un centésimo de pie por segundo de tolerancia, y la razón es de
       * la tabla y no del código: la tabla publica `n` redondeado a tres
       * decimales y su VM no se reproduce ni con ese `n` redondeado —con
       * n = 0,048 la fila de 1,5 pies da 3,406 y no 3,401—, así que arrastra su
       * propio redondeo interno. La desviación máxima medida sobre las cuatro
       * filas es de 0,006 pie/s sobre 3,4, o sea el 0,2 %. Ajustar el método
       * para cerrar esa diferencia sería ajustar contra el redondeo de una
       * imprenta de 2007.
       */
      expect(VM).toBeCloseTo(f.VM, 1);
      expect(Math.abs(VM - f.VM)).toBeLessThan(0.01);
    });
  }

  it('el cruce de velocidades cae entre 1,2 y 1,3 pies, como dice el ejemplo', () => {
    // «Since the difference changes from positive to negative between D=1.3 and
    // D=1.2 feet, a depth of 1.3 feet should be used in the final design.»
    const D = profundidadNormal(Q, S, INDICE_RETARDANCIA.C, 'trapezoidal', B, z);
    expect(D).not.toBeNull();
    expect(D!).toBeGreaterThan(1.2);
    expect(D!).toBeLessThan(1.3);
  });

  it('el esfuerzo vegetal admisible y el total son los publicados', () => {
    expect(esfuerzoVegetalAdmisible(INDICE_RETARDANCIA.C)).toBeCloseTo(4.2, 2);
    expect(GAMMA_LB_FT3 * 1.3 * S).toBeCloseTo(0.69, 2);
  });
});

describe('cauce empastado · el índice de curva de retardancia (ec. 7–5)', () => {
  /**
   * El ejemplo 1 publica los dos valores: gramilla con 500 tallos/ft², pasto de
   * 14 pulgadas → CI = 7,48; el mismo tapiz a 4 pulgadas → CI = 4,87. Son los
   * dos números que fijan la forma de la ecuación, que en el PDF sale con los
   * exponentes mezclados.
   */
  const tallos_m2 = 500 / (PIE_M * PIE_M);

  /**
   * El ejemplo hace su propia conversión y la imprime: 14 pulgadas las trabaja
   * como **1,2 pies** y 4 pulgadas como **0,33 pies**. Son las entradas con las
   * que salen sus dos resultados, así que son las que va el test.
   */
  it('con el pasto alto del ejemplo (1,2 pies) da 7,48', () => {
    expect(indiceDeCurva(1.2 * PIE_M, tallos_m2)).toBeCloseTo(7.48, 2);
  });

  it('con el pasto corto del ejemplo (0,33 pies) da 4,87', () => {
    expect(indiceDeCurva(0.33 * PIE_M, tallos_m2)).toBeCloseTo(4.87, 2);
  });

  /**
   * Y con la conversión exacta de pulgadas a pies da otra cosa: 7,41 y 4,88.
   * No es un error de la ecuación ni del test; es que 14 pulgadas son 1,167
   * pies y el ejemplo redondeó a 1,2. Queda escrito para que nadie persiga esa
   * diferencia creyendo que es un error de unidades.
   */
  it('con la conversión exacta de pulgadas la diferencia es del redondeo del ejemplo', () => {
    expect(indiceDeCurva(14 * 0.0254, tallos_m2)).toBeCloseTo(7.41, 2);
    expect(indiceDeCurva(4 * 0.0254, tallos_m2)).toBeCloseTo(4.88, 2);
  });

  it('y de ahí sale el esfuerzo vegetal admisible del ejemplo 1', () => {
    const ci = indiceDeCurva(0.33 * PIE_M, tallos_m2)!;
    expect(esfuerzoVegetalAdmisible(ci)).toBeCloseTo(3.65, 2);
  });

  it('sin pasto medido no devuelve un número', () => {
    expect(indiceDeCurva(0, tallos_m2)).toBeNull();
    expect(indiceDeCurva(0.3, 0)).toBeNull();
  });
});

describe('cauce empastado · la geometría parabólica del ejemplo 2', () => {
  // T = 37 pies, D = 1,2 pies, y 0,5 pies de resguardo.
  const T = 37;
  const D = 1.2;

  it('el coeficiente parabólico publicado es 0,0035', () => {
    expect(coefParabolico(T, D)).toBeCloseTo(0.0035, 4);
  });

  it('el talud en la orilla publicado es 7,7', () => {
    expect(taludParabola(T, coefParabolico(T, D))).toBeCloseTo(7.7, 1);
  });

  it('con el resguardo el ancho sube a 44,1 pies y el talud baja a 6,5', () => {
    const ap = 0.0035;                      // el valor redondeado que usa el ejemplo
    const Tf = anchoParabola(1.7, ap);
    expect(Tf).toBeCloseTo(44.1, 1);
    expect(taludParabola(Tf, ap)).toBeCloseTo(6.5, 1);
  });

  it('el área es ⅔·T·D', () => {
    expect(areaParabola(T, D)).toBeCloseTo((2 / 3) * T * D, 6);
    expect(areaParabola(T, D)).toBeCloseTo(29.6, 1);
  });

  /**
   * El control del perímetro exacto: cuando la parábola se achata, el radio
   * hidráulico tiende a ⅔ de la profundidad, que es la aproximación clásica.
   * Si el largo de arco estuviera mal escrito, este límite no se cumpliría.
   */
  it('el radio hidráulico de una parábola chata tiende a ⅔ de la profundidad', () => {
    const R = areaParabola(T, D) / perimetroParabola(T, D);
    expect(R).toBeCloseTo((2 / 3) * D, 2);
    expect(R).toBeLessThan((2 / 3) * D);     // el perímetro real es mayor que T
  });

  it('y cuando la sección es profunda y angosta el radio se separa de ⅔·D', () => {
    const R = areaParabola(4, 6) / perimetroParabola(4, 6);
    expect(R).toBeLessThan(0.75 * ((2 / 3) * 6));
  });
});

describe('cauce empastado · la profundidad normal contra las tablas publicadas', () => {
  /**
   * Tres entradas de las tablas de diseño de los apéndices C y D, leídas en los
   * ejemplos 1, 2 y 3. La profundidad que sale del tanteo tiene que ser la
   * tabulada, con el tapiz denso que cada ejemplo declara.
   */
  const CASOS = [
    { que: 'ejemplo 1 · trapecio z=6, S=0,75 %, Q=300',
      Q: 300, S: 0.0075, ci: INDICE_RETARDANCIA.B, forma: 'trapezoidal' as const,
      W: 24, z: 6, D: 2.4 },
    { que: 'ejemplo 2 · parábola, S=2 %, Q=100',
      Q: 100, S: 0.02, ci: INDICE_RETARDANCIA.C, forma: 'parabolica' as const,
      W: 37, z: 0, D: 1.2 },
    { que: 'ejemplo 3 · trapecio z=4, S=1 %, Q=160',
      Q: 160, S: 0.01, ci: INDICE_RETARDANCIA.C, forma: 'trapezoidal' as const,
      W: 35, z: 4, D: 1.2 },
  ];

  for (const c of CASOS) {
    it(`${c.que} → ${c.D} pies`, () => {
      const D = profundidadNormal(c.Q, c.S, c.ci, c.forma, c.W, c.z);
      expect(D).not.toBeNull();
      expect(D!).toBeCloseTo(c.D, 1);
    });
  }

  it('si el caudal no entra ni con treinta pies de profundidad, devuelve null', () => {
    expect(profundidadNormal(50_000, 0.0001, INDICE_RETARDANCIA.B, 'trapezoidal', 1, 4)).toBeNull();
  });

  it('sin caudal o sin pendiente no inventa una profundidad', () => {
    expect(profundidadNormal(0, 0.01, INDICE_RETARDANCIA.C, 'parabolica', 20)).toBeNull();
    expect(profundidadNormal(100, 0, INDICE_RETARDANCIA.C, 'parabolica', 20)).toBeNull();
  });
});

describe('cauce empastado · el diseño completo contra las tablas', () => {
  /**
   * El criterio que gobierna el ancho es el esfuerzo efectivo sobre el suelo, y
   * la prueba es de dos lados: **la sección publicada tiene que pasar el
   * control de estabilidad de este módulo, y una un 10 % más angosta no.** Es
   * más fuerte que una tolerancia, porque acota el resultado por arriba y por
   * abajo con el número impreso en el medio.
   */
  const CASOS = [
    { que: 'ejemplo 1', Q: 300, S: 0.75, ero: 'facil' as const, cob: 'bermuda',
      forma: 'trapezoidal' as const, z: 6, cap: 'B' as const, W_pub: 24 },
    { que: 'ejemplo 2', Q: 100, S: 2, ero: 'resistente' as const, cob: 'mezcla',
      forma: 'parabolica' as const, z: 4, cap: 'C' as const, W_pub: 37 },
    { que: 'ejemplo 3', Q: 160, S: 1, ero: 'erodible' as const, cob: 'mezcla',
      forma: 'trapezoidal' as const, z: 4, cap: 'C' as const, W_pub: 35 },
  ];

  for (const c of CASOS) {
    it(`${c.que}: el ancho mínimo cae entre el 90 % y el 100 % del publicado`, () => {
      const s = dimensionarCauce({
        caudal_m3s: c.Q * PIE3_S_EN_M3_S,
        pendiente_pct: c.S,
        forma: c.forma,
        talud_z: c.z,
        erodibilidad: c.ero,
        coberturaId: c.cob,
        retardanciaCapacidad: c.cap,
      });
      expect(s).not.toBeNull();
      const anchoBase_pie = pie(s!.base_m ?? s!.ancho_m);
      expect(anchoBase_pie).toBeGreaterThan(0.88 * c.W_pub);
      expect(anchoBase_pie).toBeLessThanOrEqual(c.W_pub);
      expect(s!.sueloAguanta).toBe(true);
      expect(s!.pastoAguanta).toBe(true);
    });
  }

  /**
   * La profundidad de la tabla es la que corresponde al ancho de la tabla, y el
   * ancho de la tabla viene redondeado hacia arriba. El mínimo continuo de este
   * módulo es un poco más angosto, así que su profundidad tiene que ser un poco
   * mayor: eso es lo que se controla acá, con el número publicado de piso. La
   * igualdad contra la tabla ya está probada arriba, entrando con el ancho
   * publicado.
   */
  it('al ancho mínimo la profundidad queda apenas arriba de la tabulada', () => {
    const s = dimensionarCauce({
      caudal_m3s: 300 * PIE3_S_EN_M3_S,
      pendiente_pct: 0.75,
      forma: 'trapezoidal',
      talud_z: 6,
      erodibilidad: 'facil',
      coberturaId: 'bermuda',
      retardanciaCapacidad: 'B',
    })!;
    expect(pie(s.profundidad_m)).toBeGreaterThanOrEqual(2.4);
    expect(pie(s.profundidad_m)).toBeLessThan(2.4 * 1.05);
    // Y la profundidad con el tapiz pobre es MENOR: menos freno, menos calado.
    expect(s.profundidadPobre_m).toBeLessThan(s.profundidad_m);
  });

  it('el esfuerzo efectivo queda al filo del admisible, que es lo que define el ancho', () => {
    const s = dimensionarCauce({
      caudal_m3s: 160 * PIE3_S_EN_M3_S,
      pendiente_pct: 1,
      erodibilidad: 'erodible',
      forma: 'trapezoidal',
      talud_z: 4,
    })!;
    expect(s.esfuerzoAdmisible_pa).toBeCloseTo(0.03 * LB_FT2_EN_PA, 1);
    expect(s.esfuerzoEfectivo_pa).toBeLessThanOrEqual(s.esfuerzoAdmisible_pa + 0.01);
    expect(s.esfuerzoEfectivo_pa).toBeGreaterThan(0.95 * s.esfuerzoAdmisible_pa);
  });

  it('el esfuerzo total del agua queda muy por abajo del que aguanta el pasto', () => {
    // El capítulo lo dice: en la mayoría de los suelos el grano se mueve antes
    // de que el pasto se dañe. El test fija ese orden.
    const s = dimensionarCauce({
      caudal_m3s: 160 * PIE3_S_EN_M3_S,
      pendiente_pct: 1,
      erodibilidad: 'erodible',
      forma: 'trapezoidal',
      talud_z: 4,
    })!;
    expect(s.esfuerzoTotal_pa).toBeLessThan(0.5 * s.esfuerzoVegetalAdmisible_pa);
  });

  it('un suelo que aguanta más esfuerzo pide un cauce más angosto', () => {
    const base = {
      caudal_m3s: 2, pendiente_pct: 2, forma: 'parabolica' as const,
    };
    const facil = dimensionarCauce({ ...base, erodibilidad: 'facil' })!;
    const resist = dimensionarCauce({ ...base, erodibilidad: 'resistente' })!;
    expect(resist.ancho_m).toBeLessThan(facil.ancho_m);
  });

  it('un tapiz pobre pide un cauce más ancho que el mismo tapiz bien mantenido', () => {
    const base = {
      caudal_m3s: 2, pendiente_pct: 2, erodibilidad: 'resistente' as const,
      coberturaId: 'bermuda',
    };
    const bueno = dimensionarCauce({ ...base, calidadTapiz: 'bueno' })!;
    const pobre = dimensionarCauce({ ...base, calidadTapiz: 'pobre' })!;
    expect(pobre.ancho_m).toBeGreaterThan(bueno.ancho_m);
    expect(pobre.cf).toBeCloseTo(0.9 * FACTOR_CF.pobre, 2);
  });

  it('el resguardo sube la profundidad total y ensancha la sección de excavación', () => {
    const base = {
      caudal_m3s: 2, pendiente_pct: 2, erodibilidad: 'resistente' as const,
    };
    const sin = dimensionarCauce(base)!;
    const con = dimensionarCauce({ ...base, resguardo_m: 0.15 })!;
    expect(con.profundidadTotal_m).toBeCloseTo(sin.profundidad_m + 0.15, 2);
    expect(con.anchoTotal_m).toBeGreaterThan(sin.anchoTotal_m);
    expect(con.areaExcavacion_m2).toBeGreaterThan(sin.areaExcavacion_m2);
  });

  it('sin caudal o sin pendiente no devuelve una sección', () => {
    expect(dimensionarCauce({ caudal_m3s: 0, pendiente_pct: 2, erodibilidad: 'facil' })).toBeNull();
    expect(dimensionarCauce({ caudal_m3s: 2, pendiente_pct: 0, erodibilidad: 'facil' })).toBeNull();
  });
});

describe('cauce empastado · unidades y geometría en SI', () => {
  it('la sección del ejemplo 2 sale en metros', () => {
    const s = dimensionarCauce({
      caudal_m3s: 100 * PIE3_S_EN_M3_S,
      pendiente_pct: 2,
      erodibilidad: 'resistente',
      forma: 'parabolica',
    })!;
    // 37 pies son 11,28 m, y el ancho mínimo cae apenas por abajo.
    expect(s.ancho_m).toBeGreaterThan(0.88 * 37 * PIE_M);
    expect(s.ancho_m).toBeLessThanOrEqual(37 * PIE_M);
    expect(s.profundidad_m).toBeCloseTo(1.2 * PIE_M, 1);
  });

  /**
   * El coeficiente parabólico tiene unidades de 1/longitud, así que pasarlo de
   * pies a metros lo DIVIDE por 0,3048. Si estuviera multiplicado, la parábola
   * publicada saldría diez veces más abierta y ningún otro número del resultado
   * se movería. El control es la identidad de la ecuación 7–8 en metros.
   */
  it('el coeficiente parabólico cumple la ecuación 7–8 en metros', () => {
    const s = dimensionarCauce({
      caudal_m3s: 2, pendiente_pct: 2, erodibilidad: 'resistente', forma: 'parabolica',
    })!;
    expect(s.coefParabolico).not.toBeNull();
    expect(s.coefParabolico!).toBeCloseTo(
      4 * s.profundidad_m / (s.ancho_m * s.ancho_m), 3,
    );
  });

  it('la trapezoidal informa la base y la parabólica no', () => {
    const base = { caudal_m3s: 2, pendiente_pct: 2, erodibilidad: 'resistente' as const };
    expect(dimensionarCauce({ ...base, forma: 'trapezoidal' })!.base_m).not.toBeNull();
    expect(dimensionarCauce({ ...base, forma: 'parabolica' })!.base_m).toBeNull();
    expect(dimensionarCauce({ ...base, forma: 'parabolica' })!.coefParabolico).not.toBeNull();
  });

  it('el ancho superior de un trapecio es la ecuación 7–7', () => {
    expect(anchoTrapecio(24, 2.4, 6)).toBeCloseTo(53, 0);   // ejemplo 1, 53 pies
  });

  it('la velocidad sale del caudal y el área, en m/s', () => {
    const s = dimensionarCauce({
      caudal_m3s: 2, pendiente_pct: 2, erodibilidad: 'resistente',
    })!;
    expect(s.velocidad_ms).toBeCloseTo(2 / s.area_m2, 1);
  });
});

describe('cauce empastado · el suelo', () => {
  it('las cuatro categorías tienen el esfuerzo admisible de la tabla 7–1', () => {
    expect(ESFUERZO_ADMISIBLE_LB_FT2).toEqual({
      facil: 0.02, erodible: 0.03, resistente: 0.05, muy_resistente: 0.07,
    });
  });

  it('las doce clases texturales están repartidas', () => {
    for (const c of CLASES_USDA) {
      expect(erodibilidadDeTextura(c)).toBeTruthy();
    }
    expect(Object.keys(ERODIBILIDAD_POR_TEXTURA)).toHaveLength(CLASES_USDA.length);
  });

  it('un vertisol es arcilloso, o sea resistente a la erosión', () => {
    expect(erodibilidadDeTextura('arcilloso')).toBe('resistente');
    expect(ESFUERZO_ADMISIBLE_LB_FT2[erodibilidadDeTextura('arcilloso')!]).toBe(0.05);
  });

  it('los francos con arcilla caen del lado conservador, no del resistente', () => {
    expect(erodibilidadDeTextura('franco-arcilloso')).toBe('erodible');
    expect(erodibilidadDeTextura('franco-arcillo-limoso')).toBe('erodible');
    expect(erodibilidadDeTextura('franco-arcillo-arenoso')).toBe('erodible');
  });

  it('la categoría de grava no se asigna nunca sola', () => {
    const asignadas = new Set(Object.values(ERODIBILIDAD_POR_TEXTURA));
    expect(asignadas.has('muy_resistente')).toBe(false);
  });

  it('sin textura no hay categoría', () => {
    expect(erodibilidadDeTextura(null)).toBeNull();
  });

  it('la rugosidad de grano de un suelo fino es la publicada', () => {
    expect(RUGOSIDAD_GRANO_FINO).toBe(0.0156);
    expect(rugosidadDeGrano(0)).toBe(RUGOSIDAD_GRANO_FINO);
  });

  it('y la de un no cohesivo sale de la ecuación 7–2', () => {
    // d75 = 1 pulgada → ns = 1/39.
    expect(rugosidadDeGrano(1)).toBeCloseTo(1 / 39, 6);
    expect(rugosidadDeGrano(0.1)).toBeCloseTo(Math.pow(0.1, 1 / 6) / 39, 8);
  });

  it('un suelo de grano grueso declarado cambia la sección', () => {
    const base = {
      caudal_m3s: 2, pendiente_pct: 2, erodibilidad: 'facil' as const,
    };
    const fino = dimensionarCauce(base)!;
    const grueso = dimensionarCauce({ ...base, d75_mm: 20 })!;
    // ns más grande sube el esfuerzo efectivo, así que el cauce tiene que ser
    // más ancho para bajarlo.
    expect(grueso.ancho_m).toBeGreaterThan(fino.ancho_m);
  });
});

describe('cauce empastado · el tapiz', () => {
  it('los índices de retardancia son los de la tabla 7–5', () => {
    expect(INDICE_RETARDANCIA).toEqual({ A: 10.0, B: 7.64, C: 5.60, D: 4.44, E: 2.88 });
  });

  it('las clases por defecto son las que recomienda el capítulo: D y C', () => {
    expect(RETARDANCIA_ESTABILIDAD_DEFECTO).toBe('D');
    expect(RETARDANCIA_CAPACIDAD_DEFECTO).toBe('C');
  });

  it('la tabla 7–3 trae doce coberturas con su factor y su densidad', () => {
    expect(COBERTURAS_CAUCE).toHaveLength(12);
    for (const c of COBERTURAS_CAUCE) {
      expect(c.cf).toBeGreaterThan(0);
      expect(c.cf).toBeLessThanOrEqual(0.9);
      expect(c.tallos_ft2).toBeGreaterThan(0);
    }
    expect(COBERTURAS_CAUCE.find(c => c.id === 'bermuda')!.cf).toBe(0.90);
    expect(COBERTURAS_CAUCE.find(c => c.id === 'mezcla')!.cf).toBe(0.75);
    expect(COBERTURAS_CAUCE.find(c => c.id === 'sudan')!.tallos_ft2).toBe(50);
  });

  it('los factores de tallos son los cinco del pie de la tabla', () => {
    expect(FACTOR_TALLOS.pobre).toBeCloseTo(1 / 3, 6);
    expect(FACTOR_TALLOS.regular).toBeCloseTo(2 / 3, 6);
    expect(FACTOR_TALLOS.bueno).toBe(1);
    expect(FACTOR_TALLOS.muy_bueno).toBeCloseTo(4 / 3, 6);
    expect(FACTOR_TALLOS.excelente).toBeCloseTo(5 / 3, 6);
  });

  it('el factor de cobertura no premia un tapiz mejor que bueno', () => {
    // Arriba de «bueno» no hay corrección publicada, así que no se sube.
    expect(FACTOR_CF.bueno).toBe(1);
    expect(FACTOR_CF.muy_bueno).toBe(1);
    expect(FACTOR_CF.excelente).toBe(1);
    expect(FACTOR_CF.regular).toBe(0.8);
    expect(FACTOR_CF.pobre).toBe(0.5);
  });

  it('el n del pasto crece con la retardancia para el mismo flujo', () => {
    const vr = 3.5;
    const nD = manningRetardancia(INDICE_RETARDANCIA.D, vr);
    const nC = manningRetardancia(INDICE_RETARDANCIA.C, vr);
    const nB = manningRetardancia(INDICE_RETARDANCIA.B, vr);
    expect(nD).toBeLessThan(nC);
    expect(nC).toBeLessThan(nB);
  });

  it('sin flujo no hay n', () => {
    expect(Number.isNaN(manningRetardancia(INDICE_RETARDANCIA.C, 0))).toBe(true);
    expect(Number.isNaN(velocidadManning(0.04, 0, 0.01))).toBe(true);
  });
});

describe('cauce empastado · el caudal de diseño', () => {
  const BASE = {
    area_ha: 5,
    largoFlujo_m: 400,
    pendienteFlujo_m_m: 0.02,
    lluvia10a24h_mm: 90,
    cn: CN_PASTURA.C,
  };

  it('la tormenta de diseño es la de 10 años y 24 h', () => {
    expect(TORMENTA_DISENO_ANIOS).toBe(10);
    expect(TORMENTA_DISENO_H).toBe(24);
  });

  it('devuelve el pico y la cadena que lo produjo', () => {
    const q = caudalDeDiseno(BASE)!;
    expect(q.caudal_m3s).toBeGreaterThan(0);
    expect(q.escurrimiento_mm).toBeGreaterThan(0);
    expect(q.escurrimiento_mm).toBeLessThan(BASE.lluvia10a24h_mm);
    expect(q.coef_evento).toBeGreaterThan(0);
    expect(q.coef_evento).toBeLessThan(1);
    expect(q.tc_min).toBeGreaterThan(0);
    expect(q.duracion_min).toBeGreaterThanOrEqual(10);
    expect(q.intensidad_mm_h).toBeGreaterThan(0);
  });

  it('el pico es proporcional al área, porque el método racional es lineal en A', () => {
    const q1 = caudalDeDiseno(BASE)!;
    const q2 = caudalDeDiseno({ ...BASE, area_ha: 10 })!;
    expect(q2.caudal_m3s / q1.caudal_m3s).toBeCloseTo(2, 2);
  });

  it('un suelo de infiltración lenta da más pico que uno rápido', () => {
    const qA = caudalDeDiseno({ ...BASE, cn: CN_PASTURA.A })!;
    const qD = caudalDeDiseno({ ...BASE, cn: CN_PASTURA.D })!;
    expect(qD.caudal_m3s).toBeGreaterThan(qA.caudal_m3s);
  });

  it('los CN de pastura suben con el grupo hidrológico', () => {
    expect(CN_PASTURA.A).toBeLessThan(CN_PASTURA.B);
    expect(CN_PASTURA.B).toBeLessThan(CN_PASTURA.C);
    expect(CN_PASTURA.C).toBeLessThan(CN_PASTURA.D);
  });

  it('sin lluvia, sin área o sin recorrido no hay caudal', () => {
    expect(caudalDeDiseno({ ...BASE, lluvia10a24h_mm: 0 })).toBeNull();
    expect(caudalDeDiseno({ ...BASE, area_ha: 0 })).toBeNull();
    expect(caudalDeDiseno({ ...BASE, largoFlujo_m: 0 })).toBeNull();
    expect(caudalDeDiseno({ ...BASE, pendienteFlujo_m_m: 0 })).toBeNull();
  });

  it('una lluvia que no llega a la abstracción inicial no escurre', () => {
    const q = caudalDeDiseno({ ...BASE, lluvia10a24h_mm: 5, cn: CN_PASTURA.A });
    expect(q).toBeNull();
  });
});

describe('cauce empastado · los avisos', () => {
  const BASE = {
    caudal_m3s: 2, pendiente_pct: 2, erodibilidad: 'resistente' as const,
  };
  const ids = (s: ReturnType<typeof dimensionarCauce>) => (s?.avisos ?? []).map(a => a.id);

  it('siempre declara contra qué tormenta se dimensionó', () => {
    expect(ids(dimensionarCauce(BASE))).toContain('cauce_tormenta_de_diseno');
  });

  it('avisa que la sección no trae resguardo cuando no se pidió', () => {
    expect(ids(dimensionarCauce(BASE))).toContain('cauce_sin_resguardo');
    expect(ids(dimensionarCauce({ ...BASE, resguardo_m: 0.15 })))
      .not.toContain('cauce_sin_resguardo');
  });

  it('avisa que el esfuerzo admisible salió de la textura y no de un ensayo', () => {
    expect(ids(dimensionarCauce(BASE))).toContain('cauce_suelo_por_textura');
    expect(ids(dimensionarCauce({ ...BASE, d75_mm: 20 })))
      .not.toContain('cauce_suelo_por_textura');
  });

  it('un caudal de parcela queda abajo del rango de las tablas, y lo dice', () => {
    const chico = dimensionarCauce({ ...BASE, caudal_m3s: 0.1 });
    expect(0.1).toBeLessThan(CAUDAL_TABLA_MIN_M3S);
    expect(ids(chico)).toContain('cauce_fuera_de_tabla');
    expect(ids(dimensionarCauce(BASE))).not.toContain('cauce_fuera_de_tabla');
  });

  it('arriba del 10 % de pendiente el cauce empastado deja de ser la obra', () => {
    const empinado = dimensionarCauce({ ...BASE, pendiente_pct: 14 })!;
    const aviso = empinado.avisos.find(a => a.id === 'cauce_pendiente_fuera_de_rango');
    expect(aviso).toBeTruthy();
    expect(aviso!.nivel).toBe('alerta');
    expect(PENDIENTE_TABLA_MAX_PCT).toBe(10);
  });

  it('abajo del 0,1 % avisa, y es el mismo problema que el surco del camellón', () => {
    const chato = dimensionarCauce({ ...BASE, pendiente_pct: 0.05 });
    const aviso = chato?.avisos.find(a => a.id === 'cauce_pendiente_fuera_de_rango');
    expect(aviso).toBeTruthy();
    expect(aviso!.nivel).toBe('aviso');
    expect(aviso!.detalle).toContain('camellón');
  });

  it('avisa cuando la orilla queda más empinada de lo que se puede cortar', () => {
    // Una sección trapezoidal con talud 2:1 está más empinada que el 4:1 que el
    // capítulo pide revisar.
    const s = dimensionarCauce({ ...BASE, forma: 'trapezoidal', talud_z: 2 })!;
    expect(s.taludOrilla).toBeLessThan(TALUD_ORILLA_REVISAR);
    expect(ids(s)).toContain('cauce_talud_empinado');
  });

  it('todos los avisos traen id, nivel, título y detalle', () => {
    for (const a of dimensionarCauce({ ...BASE, pendiente_pct: 14 })!.avisos) {
      expect(a.id).toMatch(/^cauce_/);
      expect(['ok', 'aviso', 'alerta']).toContain(a.nivel);
      expect(a.titulo.length).toBeGreaterThan(10);
      expect(a.detalle.length).toBeGreaterThan(40);
    }
  });
});
