import { describe, it, expect } from 'vitest';
import {
  calcularCaptacion,
  coefDeSuperficie,
  COBERTURA_SCS_DE_SUPERFICIE,
  CONSUMO_REFS,
  FUENTES_CONSUMO,
  TIPOS_SUPERFICIE,
  type ConsumoCategoria,
  type Superficie,
  type TipoSuperficie,
} from '@/lib/captacion';
import { coefEscorrentiaAnual, type GrupoHidro } from '@/lib/cuenca';
import { nombresDeTemporada } from '@/lib/estaciones';

/*
 * Captación pluvial: lo que se junta, lo que se gasta y qué tanque hace falta.
 *
 * Es un cálculo con el que alguien compra un tanque. Los dos errores que tenía
 * no se veían: las estaciones estaban clavadas al hemisferio sur, y el déficit
 * acumulado se cortaba el 31 de diciembre, justo en el medio de la seca de
 * verano del sur.
 */

function techo(area_m2: number, coef: number): Superficie {
  return { id: 't1', tipo: 'personalizado', nombre: 'Techo', area_m2, coef };
}

function consumo(litrosDia: number): ConsumoCategoria {
  return {
    id: 'c1',
    tipo: 'personalizado',
    nombre: 'Casa',
    cantidad: 1,
    litros_dia_por_unidad: litrosDia,
  };
}

const SIN_LLUVIA = Array(12).fill(0) as number[];

function lluvia(mm: Partial<Record<number, number>>): number[] {
  return Array.from({ length: 12 }, (_, i) => mm[i] ?? 0);
}

describe('la fórmula de captación', () => {
  it('un milímetro sobre un metro cuadrado es un litro', () => {
    // V(m³) = P(mm) × A(m²) × C / 1000. Con C = 1 y 1 m², 1 mm tiene que dar
    // exactamente 1 L, o sea 0,001 m³. Es la conversión que hace o deshace todo
    // el resto del panel.
    const r = calcularCaptacion([techo(1, 1)], lluvia({ 0: 1000 }), [], -34);
    expect(r.captacion_anual_litros).toBe(1000);
    expect(r.captacion_anual_m3).toBeCloseTo(1, 3);
  });

  it('100 mm sobre 50 m² con coeficiente 0,9 son 4,5 m³', () => {
    const r = calcularCaptacion([techo(50, 0.9)], lluvia({ 0: 100 }), [], -34);
    expect(r.captacion_mensual_m3[0]).toBeCloseTo(4.5, 2);
    expect(r.captacion_anual_m3).toBeCloseTo(4.5, 2);
  });

  it('sin lluvia no se junta nada y el porcentaje no se va a NaN', () => {
    const r = calcularCaptacion([techo(50, 0.9)], SIN_LLUVIA, [consumo(100)], -34);
    expect(r.captacion_anual_m3).toBe(0);
    expect(r.captacion_por_superficie[0]?.porcentaje).toBe(0);
    expect(r.meses_deficit).toBe(12);
  });

  it('sin consumo cargado no divide por cero al repartir porcentajes', () => {
    const r = calcularCaptacion([techo(50, 0.9)], lluvia({ 0: 100 }), [], -34);
    expect(r.consumo_anual_m3).toBe(0);
    expect(r.cobertura_minima_dias).toBe(0);
    expect(Number.isFinite(r.tanque_recomendado_m3)).toBe(true);
  });
});

describe('las estaciones dependen del hemisferio', () => {
  it('en el sur, diciembre a febrero es verano', () => {
    expect(nombresDeTemporada(-34.6)).toEqual(['Verano', 'Otoño', 'Invierno', 'Primavera']);
  });

  it('en el norte, el mismo trimestre es invierno', () => {
    // Ámsterdam. Antes decía "Verano · Dic · Ene · Feb" y era exactamente el
    // revés: quien leía eso guardaba agua para la seca en el trimestre opuesto.
    expect(nombresDeTemporada(52.37)).toEqual(['Invierno', 'Primavera', 'Verano', 'Otoño']);
  });

  it('entre los trópicos no se nombra ninguna estación', () => {
    // En Quito o en Singapur hay seca y lluvias, y cuándo caen no lo decide la
    // latitud. Decir "verano" ahí es afirmar algo que no se sabe.
    for (const lat of [4.7, -1.2, 0, 9.9, -9.9]) {
      expect(nombresDeTemporada(lat), String(lat)).toEqual(['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov']);
    }
  });

  it('sin latitud tampoco se inventa una estación', () => {
    expect(nombresDeTemporada(undefined)).toEqual(['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov']);
    expect(nombresDeTemporada(null)).toEqual(['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov']);
    expect(nombresDeTemporada(Number.NaN)).toEqual(['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov']);
  });

  it('los meses del trimestre no se mueven: lo único que cambia es el nombre', () => {
    const sur   = calcularCaptacion([techo(50, 0.9)], lluvia({ 0: 100 }), [], -34);
    const norte = calcularCaptacion([techo(50, 0.9)], lluvia({ 0: 100 }), [], 52);
    expect(sur.balance_trimestral.map((t) => t.meses_label))
      .toEqual(norte.balance_trimestral.map((t) => t.meses_label));
    expect(sur.balance_trimestral.map((t) => t.captacion_m3))
      .toEqual(norte.balance_trimestral.map((t) => t.captacion_m3));
    expect(sur.balance_trimestral[0]?.nombre).toBe('Verano');
    expect(norte.balance_trimestral[0]?.nombre).toBe('Invierno');
  });
});

describe('el tanque cubre la seca aunque cruce el año', () => {
  /*
   * Caso armado a propósito para el corte de diciembre: llueve de marzo a
   * octubre y no llueve en noviembre, diciembre, enero ni febrero. La seca dura
   * cuatro meses seguidos y arranca antes de fin de año.
   *
   * Consumo 100 L/día = 36,5 m³ al año. Los cuatro meses secos consumen
   * 3,0 + 3,1 + 3,1 + 2,8 = 12,0 m³, y ésa es el agua que tiene que haber
   * guardada. Contando de enero a diciembre nada más, el déficit visible eran
   * los 5,9 m³ de enero y febrero: menos de la mitad.
   */
  const superficie = [techo(100, 1)];
  const consumos = [consumo(100)];
  const lluviaSecaDeVerano = lluvia({ 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 60, 8: 60, 9: 60 });

  const r = calcularCaptacion(superficie, lluviaSecaDeVerano, consumos, -34);

  it('el año cierra con excedente: el problema es cuándo llega, no cuánto', () => {
    expect(r.captacion_anual_m3).toBeCloseTo(48, 1);
    expect(r.consumo_anual_m3).toBeCloseTo(36.5, 1);
    expect(r.balance_anual_m3).toBeGreaterThan(0);
    expect(r.meses_deficit).toBe(4);
  });

  it('la reserva alcanza para los cuatro meses secos, no para dos', () => {
    const secaCompleta = 12.0;
    const soloEneroYFebrero = 5.9;
    expect(r.tanque_recomendado_m3).toBeGreaterThanOrEqual(secaCompleta);
    expect(r.tanque_recomendado_m3).toBeGreaterThan(soloEneroYFebrero * 1.2);
    // El margen del 1,2 sobre el déficit, y nada más que eso.
    expect(r.tanque_recomendado_m3).toBeCloseTo(secaCompleta * 1.2, 1);
  });

  it('con déficit anual no duplica la cuenta: un tanque no arregla eso', () => {
    // Misma seca pero sin lluvia suficiente en el resto del año. Acá la curva de
    // masa no cierra, y recorrer el año dos veces daría una reserva del doble
    // que no significa nada.
    const seco = calcularCaptacion(superficie, lluvia({ 2: 10, 3: 10 }), consumos, -34);
    expect(seco.balance_anual_m3).toBeLessThan(0);
    // Una sola vuelta: la reserva no pasa del déficit de un año con su margen.
    // Con dos daría casi el doble, que sería una cifra sin sentido físico.
    expect(seco.tanque_recomendado_m3).toBeLessThan(seco.consumo_anual_m3 * 1.25);
    expect(seco.tanque_recomendado_m3).toBeGreaterThan(seco.consumo_anual_m3 * 0.8);
  });
});

/*
 * De dónde sale el coeficiente de escorrentía.
 *
 * Hasta el 23/09/2026 las tres superficies de suelo traían un número plano
 * —0,25, 0,15 y 0,35— para cualquier predio del planeta, mientras la app ya
 * derivaba el coeficiente real del grupo hidrológico de SoilGrids y la
 * cobertura de WorldCover. Captación era la única herramienta de diseño que
 * había quedado afuera de esa migración.
 *
 * Lo que hace daño de ese error no es que esté mal: es en qué dirección está
 * mal. La tabla plana acierta sobre arcilla y sobreestima sobre arena, o sea
 * que el tanque sale chico justo donde el suelo no guarda nada.
 */
describe('el coeficiente de escorrentía de cada superficie', () => {
  const GRUPOS: GrupoHidro[] = ['A', 'B', 'C', 'D'];

  it('un techo no le pregunta al suelo, porque WorldCover no ve un techo', () => {
    // Aunque se pase la hidrología del predio, la chapa sigue siendo chapa.
    const r = coefDeSuperficie('techo_metal', 'A');
    expect(r.coef).toBe(0.90);
    expect(r.origen).toBe('tabla');
    expect(r.aviso).toContain('material');
  });

  it('una ladera con análisis de suelo usa el del predio y no el de la tabla', () => {
    const arenoso = coefEscorrentiaAnual('A', 'pastura_regular');
    const r = coefDeSuperficie('suelo_pasto', 'A');
    expect(r.origen).toBe('predio');
    expect(r.coef).toBe(arenoso);
    expect(r.aviso).toBeNull();
    // Y es sustancialmente menor que el plano que había antes.
    expect(r.coef).toBeLessThan(TIPOS_SUPERFICIE.suelo_pasto.coef);
  });

  it('sin análisis de suelo cae a la tabla, pero lo dice y dice para qué lado', () => {
    const r = coefDeSuperficie('suelo_pasto', null);
    expect(r.origen).toBe('tabla');
    expect(r.coef).toBe(0.25);
    expect(r.aviso).toContain('sobreestimar');
  });

  it('el error que se corrigió, medido: hasta 3,9x sobre suelo arenoso', () => {
    // Este es el test que justifica el cambio. Si alguien vuelve a poner un
    // coeficiente plano, acá se ve cuánto miente.
    const medido: Record<string, number> = {};
    for (const [tipo, cobertura] of Object.entries(COBERTURA_SCS_DE_SUPERFICIE)) {
      const plano = TIPOS_SUPERFICIE[tipo as TipoSuperficie].coef;
      medido[tipo] = plano / coefEscorrentiaAnual('A', cobertura!);
    }
    expect(medido.suelo_pasto).toBeCloseTo(3.1, 1);
    expect(medido.suelo_bosque).toBeCloseTo(2.5, 1);
    expect(medido.suelo_cultivo).toBeCloseTo(3.9, 1);

    // Y sobre arcilla la tabla acertaba: por eso nadie lo vio.
    for (const [tipo, cobertura] of Object.entries(COBERTURA_SCS_DE_SUPERFICIE)) {
      const plano = TIPOS_SUPERFICIE[tipo as TipoSuperficie].coef;
      expect(plano / coefEscorrentiaAnual('D', cobertura!), tipo).toBeGreaterThan(0.7);
      expect(plano / coefEscorrentiaAnual('D', cobertura!), tipo).toBeLessThan(1.2);
    }
  });

  it('el rango declarado de cada ladera es el que da el motor hidrológico', () => {
    // Una sola fuente de verdad: si alguien toca COEF_BASE_GRUPO en cuenca.ts,
    // el rango que imprime el panel de captación deja de ser cierto y este test
    // lo agarra antes que el informe.
    for (const [tipo, cobertura] of Object.entries(COBERTURA_SCS_DE_SUPERFICIE)) {
      const valores = GRUPOS.map(g => coefEscorrentiaAnual(g, cobertura!));
      const rango = TIPOS_SUPERFICIE[tipo as TipoSuperficie].rango!;
      expect(rango[0], `${tipo} piso`).toBe(Math.min(...valores));
      expect(rango[1], `${tipo} techo`).toBe(Math.max(...valores));
    }
  });

  it('toda superficie de ladera sabe a qué cobertura SCS corresponde', () => {
    // Sin la correspondencia, `coefDeSuperficie` no tendría a quién preguntarle
    // y caería a la tabla en silencio.
    for (const [tipo, ref] of Object.entries(TIPOS_SUPERFICIE)) {
      if (ref.naturaleza !== 'ladera') continue;
      expect(COBERTURA_SCS_DE_SUPERFICIE[tipo as TipoSuperficie], tipo).toBeDefined();
    }
  });
});

/*
 * Los consumos de referencia.
 *
 * Estuvieron sin fuente trazada desde que se escribió el módulo, con el propio
 * encabezado avisando que no eran un dato. Ahora cada fila cita la publicación
 * de donde sale y el rango que esa publicación publica.
 */
describe('los consumos de referencia y sus fuentes', () => {
  it('cada valor por defecto cae adentro del rango que declara', () => {
    // Es la verificación barata que agarra el error de tipeo que nadie mira:
    // un default fuera de su propio rango es un número inventado.
    for (const [tipo, ref] of Object.entries(CONSUMO_REFS)) {
      if (!ref.rango) continue;
      expect(ref.litros_dia_por_unidad, `${tipo} piso`).toBeGreaterThanOrEqual(ref.rango[0]);
      expect(ref.litros_dia_por_unidad, `${tipo} techo`).toBeLessThanOrEqual(ref.rango[1]);
    }
  });

  it('todas las filas menos las tres declaradas citan una publicación', () => {
    // `huerta` y `cultivo_extensivo` no citan a propósito: la demanda de riego
    // real la calcula el balance hídrico con la ETc del cultivo, y esos dos
    // números son un orden de magnitud para arrancar. `personalizado` lo pone
    // el usuario. Las otras seis sí tienen que citar.
    const sinFuente = Object.entries(CONSUMO_REFS)
      .filter(([, r]) => r.fuente === null)
      .map(([t]) => t)
      .sort();
    expect(sinFuente).toEqual(['cultivo_extensivo', 'huerta', 'personalizado']);

    for (const [tipo, ref] of Object.entries(CONSUMO_REFS)) {
      if (!ref.fuente) continue;
      expect(FUENTES_CONSUMO[ref.fuente], tipo).toBeDefined();
    }
  });

  it('toda fila explicita qué supone, porque el default no se lee solo', () => {
    // 80 L/persona/día no es "lo que necesita una persona": es lo que gasta una
    // casa con agua adentro. La misma tabla de FAO da 2 a 4 si hay que ir a
    // buscarla. Sin el supuesto escrito, el número miente por omisión.
    for (const [tipo, ref] of Object.entries(CONSUMO_REFS)) {
      if (tipo === 'personalizado') continue;   // lo escribe el usuario
      expect(ref.supuesto.length, tipo).toBeGreaterThan(60);
    }
    expect(CONSUMO_REFS.domestico.supuesto).toContain('10');
  });

  it('el uso doméstico es el tramo de FAO que corresponde a una casa con agua adentro', () => {
    // FAO 2011, tabla 19.1: "Water in the home for toilet, tap and shower,
    // 60–100 litres per day". El default es el centro de ese tramo.
    expect(CONSUMO_REFS.domestico.rango).toEqual([60, 100]);
    expect(CONSUMO_REFS.domestico.litros_dia_por_unidad).toBe(80);
    expect(FUENTES_CONSUMO.fao.url).toContain('i2433e');
  });

  it('el bovino es la vaca de carne mejorada de la tabla 19.2', () => {
    // FAO 2011, tabla 19.2: "Upgraded beef cows ... 50" litros por día.
    expect(CONSUMO_REFS.bovinos.litros_dia_por_unidad).toBe(50);
    expect(CONSUMO_REFS.bovinos.fuente).toBe('fao');
  });
});

/*
 * El caso resuelto, que es lo que pide el contrato de motor-de-calculo.
 */
describe('un caso con número conocido de punta a punta', () => {
  it('V = P x A x C / 1000, con las unidades cerrando', () => {
    // Techo de 100 m2, 1.000 mm de lluvia al año repartidos en doce meses
    // iguales, chapa con C = 0,90. Son 1.000 L por milimetro y por cada 1.000
    // m2, asi que: 1.000 mm x 100 m2 x 0,90 / 1.000 = 90 m3 al año.
    const precip = Array.from({ length: 12 }, () => 1000 / 12);
    const r = calcularCaptacion(
      [{ id: 't', tipo: 'techo_metal', nombre: 'Techo', area_m2: 100, coef: 0.90 }],
      precip,
      [],
      -34,
    );
    expect(r.captacion_anual_m3).toBeCloseTo(90, 0);
    // Y un milimetro sobre un metro cuadrado es un litro, que es de donde sale
    // la division por 1.000. Con 1 m2 el resultado se pierde en el redondeo
    // —el modulo redondea a 0,01 m3 por mes—, asi que se verifica con 1.000 m2,
    // donde 1 mm tiene que dar exactamente 1.000 L.
    const unMm = calcularCaptacion(
      [{ id: 't', tipo: 'personalizado', nombre: 'T', area_m2: 1000, coef: 1 }],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [],
      -34,
    );
    expect(unMm.captacion_anual_litros).toBe(1000);
  });

  it('anual_litros no promete mas precision de la que tiene', () => {
    // El campo se llama "litros" pero sale de anual_m3, que viene redondeado a
    // 0,1 m3: siempre es multiplo de 100. Esta escrito en el tipo y se fija
    // aca para que nadie lo lea como una medicion al litro.
    const precip = [120, 110, 95, 60, 35, 20, 15, 18, 40, 70, 90, 115];
    const r = calcularCaptacion(
      [{ id: 't', tipo: 'techo_metal', nombre: 'Techo', area_m2: 40, coef: 0.90 }],
      precip, [], -34,
    );
    expect(r.captacion_por_superficie[0]!.anual_litros % 100).toBe(0);
  });
});
