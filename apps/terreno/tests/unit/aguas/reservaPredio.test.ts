import { describe, it, expect } from 'vitest';
import {
  ESCENARIOS_RACHA, TIPOS_FUENTE, aporteDeclarado_m3_dia, aporteFirme_m3_dia,
  caudalDiario_m3, nuevaFuenteDefault, rachaDeDiseno, resumenReserva, simularRacha,
  volumenUtil_m3, type FuenteAgua, type TipoFuente,
} from '@/lib/reservaPredio';
import { KC_ESPEJO_SOMERO } from '@/lib/represaDiseno';

/** Una fuente armada a mano, para que cada test diga sólo lo que le importa. */
function fuente(tipo: TipoFuente, p: Partial<FuenteAgua> = {}): FuenteAgua {
  return { ...nuevaFuenteDefault(tipo), ...p };
}

/** La represa somera del ejemplo: 100 m³ útiles bajo 500 m² de espejo. */
const REPRESA_SOMERA = fuente('represa', {
  nombre: 'La represa', volumen_m3: 100, volumenMuerto_m3: 0,
  espejo_m2: 500, infiltracion_mm_dia: 1,
});

/** Los mismos 100 m³, tapados. */
const CISTERNA = fuente('cisterna', { nombre: 'La cisterna', volumen_m3: 100 });

const ETP_VERANO_MM_DIA = 8;
const DEMANDA_L_DIA = 2000;          // 2 m³/día

describe('la autonomía de un predio en una racha seca', () => {
  it('NO ES VOLUMEN SOBRE CONSUMO: EL ESPEJO BEBE MÁS QUE EL RODEO', () => {
    // La cuenta ingenua: 100 m³ útiles / 2 m³ por día = 50 días.
    const ingenua = 100 / (DEMANDA_L_DIA / 1000);
    expect(ingenua).toBe(50);

    const v = simularRacha({
      fuentes: [REPRESA_SOMERA], demanda_l_dia: DEMANDA_L_DIA,
      dias: 21, etp_mm_dia: ETP_VERANO_MM_DIA,
    });

    // La pérdida del primer día: 500 m² × (8 mm × 1,05 de FAO-56) = 4,2 m³ de
    // evaporación, más 500 m² × 1 mm = 0,5 m³ de infiltración.
    expect(ETP_VERANO_MM_DIA * KC_ESPEJO_SOMERO).toBeCloseTo(8.4, 10);
    expect(v.perdida_dia1_m3).toBeCloseTo(4.7, 2);

    // Y eso es MÁS DEL DOBLE de lo que consume el predio. El número que la
    // cuenta ingenua deja afuera es el más grande de los tres.
    expect(v.perdida_dia1_m3).toBeGreaterThan(DEMANDA_L_DIA / 1000);

    // Así que la autonomía real es del orden de la mitad.
    expect(v.dias).not.toBeNull();
    expect(v.dias!).toBeLessThan(ingenua * 0.6);
    expect(v.dias!).toBeGreaterThan(ingenua * 0.4);
  });

  it('y los mismos metros cúbicos tapados dan los 50 días exactos', () => {
    // Una cisterna no evapora, así que acá la cuenta ingenua SÍ es la respuesta.
    // Es la comparación que dice que los dos tipos de reserva no son lo mismo.
    const v = simularRacha({
      fuentes: [CISTERNA], demanda_l_dia: DEMANDA_L_DIA,
      dias: 21, etp_mm_dia: ETP_VERANO_MM_DIA,
    });
    expect(v.dias).toBe(50);
    expect(v.perdida_dia1_m3).toBe(0);
    expect(v.aguanta).toBe(true);
  });

  it('EL ORDEN EN QUE SE GASTA EL AGUA CAMBIA CUÁNTO DURA, CON LA MISMA AGUA', () => {
    // Medio predio al aire y medio tapado. Gastar primero el espejo rinde más:
    // el litro que se deja en la represa se evapora en parte, el de la cisterna
    // no. Es la misma agua y dos órdenes de uso.
    const fuentes = [
      fuente('represa', { volumen_m3: 50, espejo_m2: 500, infiltracion_mm_dia: 1 }),
      fuente('cisterna', { volumen_m3: 50 }),
    ];
    const base = { fuentes, demanda_l_dia: DEMANDA_L_DIA, dias: 21, etp_mm_dia: ETP_VERANO_MM_DIA };
    const espejo  = simularRacha({ ...base, orden: 'espejo_primero' });
    const cerrado = simularRacha({ ...base, orden: 'cerrado_primero' });

    expect(espejo.dias).not.toBeNull();
    expect(cerrado.dias).not.toBeNull();
    expect(espejo.dias!).toBeGreaterThan(cerrado.dias!);

    const r = resumenReserva({
      fuentes, demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: ETP_VERANO_MM_DIA,
      racha: rachaDeDiseno({ racha_max_dias: 40, racha_anual_p50: 15, racha_anual_p90: 21 }),
    });
    expect(r.dias_por_el_orden).toBe(espejo.dias! - cerrado.dias!);
    expect(r.dias_por_el_orden!).toBeGreaterThan(0);
  });

  it('LAS PÉRDIDAS SOLAS PUEDEN VACIAR LA RESERVA SIN QUE NADIE CONSUMA UNA GOTA', () => {
    // Un tajamar de boca grande y poco fondo: 10 m³ útiles bajo 1.000 m² de
    // espejo. La evaporación son 8,4 m³ por día: se vacía en un día y medio.
    const v = simularRacha({
      fuentes: [fuente('tajamar', { volumen_m3: 10, espejo_m2: 1000, infiltracion_mm_dia: 1 })],
      demanda_l_dia: DEMANDA_L_DIA, dias: 21, etp_mm_dia: ETP_VERANO_MM_DIA,
    });
    expect(v.seVaciaSinConsumo).toBe(true);
    expect(v.dias!).toBeLessThan(3);
    expect(v.aguanta).toBe(false);
  });

  it('y la pérdida baja a medida que el espejo se encoge, no es constante', () => {
    const v = simularRacha({
      fuentes: [REPRESA_SOMERA], demanda_l_dia: DEMANDA_L_DIA,
      dias: 21, etp_mm_dia: ETP_VERANO_MM_DIA,
    });
    const d1 = v.serie[0]!;
    const d10 = v.serie[9]!;
    expect(d10.evaporado_m3).toBeLessThan(d1.evaporado_m3);
    // El espejo es proporcional al llenado, que es la misma aproximación de
    // simularRepresaAnual: si cambia una, tiene que cambiar la otra.
    expect(d1.evaporado_m3 / d1.queda_m3).toBeGreaterThan(0);
  });
});

describe('el caudal de una naciente', () => {
  it('UN LITRO POR MINUTO SON 1,44 m³ POR DÍA, EXACTO', () => {
    expect(caudalDiario_m3(1)).toBeCloseTo(1.44, 10);
    expect(caudalDiario_m3(10)).toBeCloseTo(14.4, 10);
    expect(caudalDiario_m3(0)).toBe(0);
    expect(caudalDiario_m3(null)).toBe(0);
  });

  it('NO CUENTA EN LA CRISIS SI NO SE MIDIÓ EN LA SECA, Y ESO NO ES UN BUG', () => {
    // Una vertiente que da 10 L/min en septiembre puede dar cero en febrero, y
    // febrero es cuando se la necesita. Sin saber cuándo se midió, no es firme.
    const sinMedir = fuente('vertiente', { caudal_l_min: 10, medidoEnSeca: false });
    const medida   = fuente('vertiente', { caudal_l_min: 10, medidoEnSeca: true });

    expect(aporteDeclarado_m3_dia(sinMedir)).toBeCloseTo(14.4, 10);
    expect(aporteFirme_m3_dia(sinMedir)).toBe(0);
    expect(aporteFirme_m3_dia(medida)).toBeCloseTo(14.4, 10);

    // Y la diferencia se ve en la autonomía: 14,4 m³/día contra 2 de demanda es
    // la diferencia entre aguantar para siempre y aguantar unos días.
    const conFirme = simularRacha({
      fuentes: [REPRESA_SOMERA, medida], demanda_l_dia: DEMANDA_L_DIA,
      dias: 21, etp_mm_dia: ETP_VERANO_MM_DIA,
    });
    const sinFirme = simularRacha({
      fuentes: [REPRESA_SOMERA, sinMedir], demanda_l_dia: DEMANDA_L_DIA,
      dias: 21, etp_mm_dia: ETP_VERANO_MM_DIA,
    });
    expect(conFirme.dias!).toBeGreaterThan(sinFirme.dias!);
    expect(conFirme.aguanta).toBe(true);
  });

  it('y el resumen lo dice en vez de esconderlo', () => {
    const r = resumenReserva({
      fuentes: [fuente('vertiente', { nombre: 'La vertiente del norte', caudal_l_min: 10 })],
      demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: ETP_VERANO_MM_DIA,
      racha: rachaDeDiseno({ racha_max_dias: 40, racha_anual_p50: 15, racha_anual_p90: 21 }),
    });
    expect(r.caudal_declarado_m3_dia).toBeCloseTo(14.4, 2);
    expect(r.caudal_firme_m3_dia).toBe(0);
    expect(r.advertencias.some(a => /no se midió en la época seca/.test(a))).toBe(true);
    expect(r.advertencias.some(a => /La vertiente del norte/.test(a))).toBe(true);
  });
});

describe('el volumen útil', () => {
  it('NO ES EL VOLUMEN: LA LÁMINA PERMANENTE DE AH-590 NO SE PUEDE USAR', () => {
    const f = fuente('represa', { volumen_m3: 100, volumenMuerto_m3: 30 });
    expect(volumenUtil_m3(f)).toBe(70);
    // Y una represa cuyo volumen muerto se come todo no tiene reserva, no tiene
    // reserva negativa.
    expect(volumenUtil_m3(fuente('represa', { volumen_m3: 20, volumenMuerto_m3: 50 }))).toBe(0);
  });

  it('una fuente de caudal no tiene volumen útil aunque le carguen uno', () => {
    expect(volumenUtil_m3(fuente('pozo', { volumen_m3: 999, caudal_l_min: 5 }))).toBe(0);
  });

  it('el resumen separa lo que está al aire de lo que está tapado', () => {
    const r = resumenReserva({
      fuentes: [
        fuente('represa', { volumen_m3: 100, volumenMuerto_m3: 20, espejo_m2: 500 }),
        fuente('cisterna', { volumen_m3: 30 }),
      ],
      demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: ETP_VERANO_MM_DIA, racha: null,
    });
    expect(r.almacenado_m3).toBe(130);
    expect(r.util_m3).toBe(110);
    expect(r.muerto_m3).toBe(20);
    expect(r.util_abierto_m3).toBe(80);
    expect(r.util_cerrado_m3).toBe(30);
    expect(r.espejo_total_m2).toBe(500);
  });
});

describe('la racha de diseño', () => {
  it('SALE DEL DATO DIARIO DEL PREDIO Y NO DE UN SUPUESTO', () => {
    const sequia = { racha_max_dias: 48, racha_anual_p50: 16, racha_anual_p90: 27 };
    expect(rachaDeDiseno(sequia, 'tipico')!.dias).toBe(16);
    expect(rachaDeDiseno(sequia, 'seco')!.dias).toBe(27);
    expect(rachaDeDiseno(sequia, 'peor')!.dias).toBe(48);
    // El default es el año seco, que es el criterio del resto de la app.
    expect(rachaDeDiseno(sequia)!.escenario).toBe('seco');
  });

  it('sin serie diaria no inventa un período de diseño', () => {
    expect(rachaDeDiseno(null)).toBeNull();
    expect(rachaDeDiseno({ racha_max_dias: 0, racha_anual_p50: 0, racha_anual_p90: 0 })).toBeNull();
    const r = resumenReserva({
      fuentes: [CISTERNA], demanda_l_dia: DEMANDA_L_DIA,
      etp_mm_dia: ETP_VERANO_MM_DIA, racha: null,
    });
    expect(r.advertencias.some(a => /el período de diseño no se inventa/.test(a))).toBe(true);
  });

  it('los tres escenarios tienen su lectura, porque son tres decisiones distintas', () => {
    for (const k of ['tipico', 'seco', 'peor'] as const) {
      expect(ESCENARIOS_RACHA[k].rotulo.length).toBeGreaterThan(0);
      expect(ESCENARIOS_RACHA[k].lectura.length).toBeGreaterThan(20);
    }
  });
});

describe('los casos degenerados, que son los que imprimen un número falso', () => {
  it('SIN DEMANDA Y SIN PÉRDIDAS LA AUTONOMÍA NO ES INFINITA: NO ESTÁ PLANTEADA', () => {
    const v = simularRacha({
      fuentes: [CISTERNA], demanda_l_dia: 0, dias: 21, etp_mm_dia: ETP_VERANO_MM_DIA,
    });
    expect(v.dias).toBeNull();
    expect(Number.isFinite(v.dias as unknown as number)).toBe(false);
  });

  it('sin ninguna fuente aguanta cero días y lo dice', () => {
    const v = simularRacha({ fuentes: [], demanda_l_dia: DEMANDA_L_DIA, dias: 21, etp_mm_dia: 8 });
    expect(v.dias).toBe(0);
    expect(v.aguanta).toBe(false);
    const r = resumenReserva({ fuentes: [], demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: 8, racha: null });
    expect(r.advertencias.some(a => /No hay ninguna fuente cargada/.test(a))).toBe(true);
  });

  it('una represa sin espejo cargado avisa, porque la autonomía sale optimista', () => {
    const r = resumenReserva({
      fuentes: [fuente('represa', { nombre: 'Sin espejo', volumen_m3: 100, volumenMuerto_m3: 10, espejo_m2: 0 })],
      demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: ETP_VERANO_MM_DIA, racha: null,
    });
    expect(r.advertencias.some(a => /no tiene cargada la superficie del espejo/.test(a))).toBe(true);
  });

  it('y una represa sin volumen muerto avisa con el criterio de AH-590', () => {
    const r = resumenReserva({
      fuentes: [fuente('represa', { volumen_m3: 100, volumenMuerto_m3: 0, espejo_m2: 500 })],
      demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: ETP_VERANO_MM_DIA, racha: null,
    });
    expect(r.advertencias.some(a => /lámina permanente/.test(a))).toBe(true);
  });

  it('una ETP de cero no rompe nada: sin evaporación la reserva dura lo que dice la división', () => {
    const v = simularRacha({
      fuentes: [fuente('represa', { volumen_m3: 100, espejo_m2: 500, infiltracion_mm_dia: 0 })],
      demanda_l_dia: DEMANDA_L_DIA, dias: 21, etp_mm_dia: 0,
    });
    expect(v.dias).toBe(50);
  });
});

describe('los cuatro trimestres', () => {
  it('SUMAN EL CAUDAL FIRME AL INGRESO, Y EL DECLARADO QUEDA A LA VISTA SIN SUMARSE', () => {
    const trimestresCaptacion = [
      { nombre: 'Verano', meses_label: 'ene–mar', captacion_m3: 100, consumo_m3: 180 },
      { nombre: 'Otoño',  meses_label: 'abr–jun', captacion_m3: 200, consumo_m3: 120 },
      { nombre: 'Invierno', meses_label: 'jul–sep', captacion_m3: 250, consumo_m3: 100 },
      { nombre: 'Primavera', meses_label: 'oct–dic', captacion_m3: 150, consumo_m3: 160 },
    ];
    const r = resumenReserva({
      fuentes: [fuente('naciente', { caudal_l_min: 1, medidoEnSeca: true })],
      demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: ETP_VERANO_MM_DIA,
      racha: rachaDeDiseno({ racha_max_dias: 40, racha_anual_p50: 15, racha_anual_p90: 21 }),
      trimestresCaptacion,
    });
    expect(r.trimestres).toHaveLength(4);
    // 1 L/min son 1,44 m³/día; el primer trimestre tiene 90 días.
    const t0 = r.trimestres[0]!;
    expect(t0.caudales_firmes_m3).toBeCloseTo(1.44 * 90, 1);
    expect(t0.ingreso_m3).toBeCloseTo(100 + 1.44 * 90, 1);
    expect(t0.balance_m3).toBeCloseTo(100 + 1.44 * 90 - 180, 1);

    // Y acá aparece de qué tamaño es una naciente chica: UN litro por minuto
    // son 130 m³ en el trimestre, que es más que todo lo que juntan los techos
    // (100 m³) y dán vuelta el signo del verano —sin la naciente el balance era
    // −80 m³—. Por eso importa tanto si el caudal es firme o no: no es un
    // ajuste, es el término que manda.
    expect(100 - 180).toBeLessThan(0);
    expect(t0.balance_m3).toBeGreaterThan(0);
    expect(t0.caudales_firmes_m3).toBeGreaterThan(t0.captado_m3);
    expect(r.trimestres[2]!.balance_m3).toBeGreaterThan(0);
  });

  it('y un caudal sin medir en la seca no entra en el ingreso del trimestre', () => {
    const trimestresCaptacion = [
      { nombre: 'Verano', meses_label: 'ene–mar', captacion_m3: 100, consumo_m3: 180 },
    ];
    const r = resumenReserva({
      fuentes: [fuente('naciente', { caudal_l_min: 1, medidoEnSeca: false })],
      demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: ETP_VERANO_MM_DIA, racha: null,
      trimestresCaptacion,
    });
    const t0 = r.trimestres[0]!;
    expect(t0.caudales_firmes_m3).toBe(0);
    expect(t0.caudales_m3).toBeCloseTo(1.44 * 90, 1);
    expect(t0.ingreso_m3).toBe(100);
  });

  it('sin la pestaña de captación no hay trimestres, y lo dice', () => {
    const r = resumenReserva({
      fuentes: [CISTERNA], demanda_l_dia: DEMANDA_L_DIA, etp_mm_dia: 8, racha: null,
    });
    expect(r.trimestres).toHaveLength(0);
    expect(r.advertencias.some(a => /salen de la pestaña Captación/.test(a))).toBe(true);
  });
});

describe('el catálogo de tipos', () => {
  it('cada tipo declara si guarda volumen o entrega caudal, y si tiene la cara al aire', () => {
    for (const [id, f] of Object.entries(TIPOS_FUENTE)) {
      expect(['almacenaje', 'caudal']).toContain(f.clase);
      expect(typeof f.abierta).toBe('boolean');
      expect(f.nota.length).toBeGreaterThan(30);
      // Ninguna fuente de caudal evapora en esta cuenta: lo que evapora es un
      // espejo, y una naciente no lo tiene mientras no se la embalse.
      if (f.clase === 'caudal') expect(f.abierta).toBe(false);
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it('una ecocisterna cuenta como cerrada y una aguada como abierta', () => {
    expect(TIPOS_FUENTE.ecocisterna.abierta).toBe(false);
    expect(TIPOS_FUENTE.aguada.abierta).toBe(true);
    // Y la aguada avisa que casi nunca es reserva: es el punto de entrega.
    expect(TIPOS_FUENTE.aguada.nota).toMatch(/punto de entrega/);
  });

  it('la fuente nueva arranca en cero y con la infiltración sólo si es abierta', () => {
    expect(nuevaFuenteDefault('represa').infiltracion_mm_dia).toBeGreaterThan(0);
    expect(nuevaFuenteDefault('cisterna').infiltracion_mm_dia).toBe(0);
    expect(nuevaFuenteDefault('represa').volumen_m3).toBe(0);
    expect(nuevaFuenteDefault('vertiente').medidoEnSeca).toBe(false);
  });
});
