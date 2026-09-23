/**
 * La vidriera de /acequia y el checkout tienen que ofrecer lo mismo.
 *
 * El 12/09/2026 no lo hacían: la vidriera anunciaba Estudio a 35/350 USD con un
 * botón "Suscribirme" que llevaba a la pantalla de confirmación, y el checkout
 * rechaza cualquier plan que no sea Personal o Profesional porque los cinco
 * asientos de Estudio se dan de alta a mano. Con los pagos apagados el visitante
 * recibía el 503 genérico y no se notaba; prendidos, habría recorrido el alta del
 * plan más caro para recibir un error al final.
 *
 * Estos tests no miran `esPlanPago` porque vive en un módulo server-only que
 * arrastra Stripe y Mercado Pago. Miran la única fuente que las dos partes leen.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  ACEQUIA_PLANS, ACEQUIA_FEATURES, ACEQUIA_PLAN_ORDER, acequiaSelfCheckout,
  acequiaPlanHabilita, type AcequiaFeature, type AcequiaPlanId,
} from '@arteytierra/config/acequia';
import { PLANES } from '@/lib/terreno/planes';

const IDS: AcequiaPlanId[] = ['semilla', 'personal', 'profesional', 'estudio'];

describe('vidriera y checkout ofrecen lo mismo', () => {
  it('la vidriera lista los cuatro planes del catálogo, sin inventar ninguno', () => {
    expect(PLANES.map((p) => p.id)).toEqual(IDS);
  });

  it('cada plan de la vidriera copia el autoservicio del catálogo', () => {
    for (const plan of PLANES) {
      expect(plan.compraEnLinea).toBe(ACEQUIA_PLANS[plan.id].selfCheckout);
    }
  });

  it('sólo Personal y Profesional se contratan solos', () => {
    const solos = IDS.filter((id) => ACEQUIA_PLANS[id].selfCheckout);
    expect(solos).toEqual(['personal', 'profesional']);
  });

  it('Estudio se pide, no se compra, mientras los asientos se den de alta a mano', () => {
    // Si este test falla porque alguien implementó los asientos: además de
    // poner selfCheckout en true hay que ampliar el tipo PlanPago y las tablas
    // PRECIO_USD y NOMBRE de lib/terreno/suscripciones.ts, o el checkout va a
    // seguir rechazándolo con la vidriera ya ofreciéndolo.
    expect(ACEQUIA_PLANS.estudio.seats).toBeGreaterThan(1);
    expect(ACEQUIA_PLANS.estudio.selfCheckout).toBe(false);
    expect(acequiaSelfCheckout('estudio')).toBe(false);
  });

  it('un plan gratis no necesita autoservicio: se resuelve con el registro', () => {
    expect(ACEQUIA_PLANS.semilla.monthlyUsd).toBeNull();
    expect(ACEQUIA_PLANS.semilla.selfCheckout).toBe(false);
  });

  it('acequiaSelfCheckout sigue aceptando el nombre viejo del plan', () => {
    // Un link viejo o la metadata de un pago en vuelo pueden traer 'disenador'.
    expect(acequiaSelfCheckout('disenador')).toBe(true);
    expect(acequiaSelfCheckout('no_existe')).toBe(false);
    expect(acequiaSelfCheckout('semilla')).toBe(false);
  });

  it('todo plan que se contrata solo tiene precio en los dos períodos', () => {
    for (const id of IDS) {
      if (!ACEQUIA_PLANS[id].selfCheckout) continue;
      expect(ACEQUIA_PLANS[id].monthlyUsd).toBeGreaterThan(0);
      expect(ACEQUIA_PLANS[id].annualUsd).toBeGreaterThan(0);
    }
  });
});

/**
 * La cotización del peso es un precio, y los precios no se escriben dos veces.
 *
 * La vidriera tenía `ARS_POR_USD = 1500` y hasta lo imprimía en la letra chica
 * ("Precios en pesos a 1500 $/USD"), mientras `crearPreapprovalMp` armaba el
 * importe con `ACEQUIA_ARS_PER_USD`. Si esa variable no vale 1500 —y no tiene
 * por qué, es la que se actualiza cuando se mueve el dólar—, el visitante leía
 * un precio y se le cobraba otro.
 */
describe('la cotización que se muestra es la que se cobra', () => {
  const original = process.env.ACEQUIA_ARS_PER_USD;
  afterEach(() => {
    if (original === undefined) delete process.env.ACEQUIA_ARS_PER_USD;
    else process.env.ACEQUIA_ARS_PER_USD = original;
  });

  async function cotizacion() {
    return import('@/lib/terreno/cotizacion');
  }

  it('sin la variable no se muestra ningún precio en pesos', async () => {
    delete process.env.ACEQUIA_ARS_PER_USD;
    const { tasaArsPorUsdParaMostrar, tasaArsPorUsd } = await cotizacion();
    expect(tasaArsPorUsdParaMostrar()).toBeNull();
    // Para cobrar, en cambio, la ausencia tiene que explotar: un preapproval con
    // importe NaN es peor que un error.
    expect(() => tasaArsPorUsd()).toThrow();
  });

  it('un valor imposible se trata como ausente', async () => {
    const { tasaArsPorUsdParaMostrar } = await cotizacion();
    for (const valor of ['0', '-1500', 'mil quinientos', '']) {
      process.env.ACEQUIA_ARS_PER_USD = valor;
      expect(tasaArsPorUsdParaMostrar(), valor).toBeNull();
    }
  });

  it('devuelve la cotización configurada, sin redondearla por su cuenta', async () => {
    process.env.ACEQUIA_ARS_PER_USD = '1423.75';
    const { tasaArsPorUsdParaMostrar } = await cotizacion();
    expect(tasaArsPorUsdParaMostrar()).toBe(1423.75);
  });

  it('ni la vidriera ni su componente escriben una cotización propia', () => {
    const base = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
    const archivos = [
      join(base, 'lib', 'terreno', 'planes.ts'),
      join(base, 'components', 'terreno', 'PlanesTerreno.tsx'),
    ];
    for (const archivo of archivos) {
      const codigo = readFileSync(archivo, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((linea) => !linea.trimStart().startsWith('//'))
        .join('\n');
      expect(codigo, archivo).not.toMatch(/ARS_POR_USD\s*=\s*\d/);
    }
  });
});

/*
 * La vidriera y el candado, comparados.
 *
 * Los precios, los topes y los asientos ya salian de `ACEQUIA_PLANS`, pero QUE
 * incluye cada plan se escribia dos veces: en prosa en `lib/terreno/planes.ts`,
 * y como matriz aplicada en `apps/terreno/lib/entitlements.ts`. Dos fuentes sin
 * ningun punto de contacto, que es como se desincronizan.
 *
 * Desde el 23/09/2026 la matriz vive en `@arteytierra/config/acequia` y los dos
 * lados la leen. Estos tests atan cada afirmacion de la vidriera a la feature
 * que la respalda, para que una promesa no pueda quedar sin candado detras ni un
 * candado sin promesa adelante.
 */
describe('la vidriera promete lo que el candado habilita', () => {
  /**
   * Que feature respalda cada renglon de la vidriera. Un renglon puede no tener
   * ninguna —"Soporte prioritario" no es una feature del producto— y eso se
   * declara con `null` en vez de omitirlo, para que agregar un renglon nuevo
   * obligue a decidir.
   */
  const RESPALDO: Record<string, AcequiaFeature | null> = {
    // Semilla
    'Todas las herramientas de dibujo sobre el mapa': null,
    'Medición: superficie y perímetro': null,
    'Mapa satelital y navegación completa': null,
    'Muestra gratis del análisis: clima, topografía, cuenca y sectores': 'analisis.clima',
    'Calendario del lugar (heladas, lluvias y ventanas de siembra)': 'analisis.clima',
    '1 proyecto activo': null,
    'Informe compartible (con marca de agua de acequia)': null,
    // Personal
    'El análisis completo: agua, suelo, biodiversidad, solar, aptitud y más': 'analisis.aptitud',
    'Curvas de nivel, relieve y vista 3D': 'analisis.topo',
    'Diseño Keyline, agroforestal, riego y pastoreo': 'diseno.keyline',
    'Sugerencias automáticas de diseño': 'sugerencias',
    'Rumbos y replanteo de mojones': 'catastro.rumbos',
    'Informe sin marca de agua': 'informe.sin_marca',
    'Exportación a GeoJSON, KML y GPX': 'export.gis',
    // Profesional
    'Informe con tu marca: tu logo y tu matrícula': 'informe.white_label',
    'Ideal si trabajás varios terrenos a la vez': null,
    // Estudio
    'Exportación DXF / CAD por capas': 'export.dxf',
    'Soporte prioritario': null,
  };

  /**
   * El unico renglon que hoy NO cierra, anotado a proposito en vez de tapado.
   *
   * La vidriera vende "Curvas de nivel, relieve y vista 3D" como beneficio de
   * Personal, pero las tres cuelgan de `analisis.topo`, que es MUESTRA GRATIS
   * en Semilla desde el 15/08/2026 — el boton de 3D pregunta literalmente por
   * `tabBloqueada(plan, 'topo')`. O sea que el sitio cobra por algo que la app
   * ya regala.
   *
   * No se arregla solo porque las dos salidas son decisiones comerciales y no
   * tecnicas: o el renglon baja a Semilla (y Semilla se ve mas generosa), o
   * `analisis.topo` deja de ser muestra gratis (y Semilla pierde el relieve).
   * Lo decide Jonatan. Mientras tanto queda acá, visible y contado.
   */
  const DIVERGENCIAS_CONOCIDAS = new Set(['Curvas de nivel, relieve y vista 3D']);

  it('cada renglón de la vidriera declara si tiene feature detrás o no', () => {
    const sinDeclarar: string[] = [];
    for (const plan of PLANES) {
      for (const renglon of plan.incluye) {
        // Los renglones con número adentro se arman con plantilla desde
        // ACEQUIA_PLANS, así que no son texto fijo y ya los cubre otro test.
        if (/\d/.test(renglon)) continue;
        if (!(renglon in RESPALDO)) sinDeclarar.push(plan.id + ': ' + renglon);
      }
    }
    expect(sinDeclarar, 'renglones nuevos sin decidir si tienen feature:\n' + sinDeclarar.join('\n')).toEqual([]);
  });

  it('ninguna promesa pide un plan más caro del que la vidriera anuncia', () => {
    // Si la vidriera pone bajo Personal algo que el candado exige a Estudio, el
    // que paga Personal se encuentra con un candado que no esperaba. Es el
    // error caro de los dos.
    const mentiras: string[] = [];
    for (const plan of PLANES) {
      for (const renglon of plan.incluye) {
        const feature = RESPALDO[renglon];
        if (!feature) continue;
        if (!acequiaPlanHabilita(plan.id, feature)) {
          mentiras.push(plan.id + ' promete "' + renglon + '" pero ' + feature + ' pide ' + ACEQUIA_FEATURES[feature]);
        }
      }
    }
    expect(mentiras, mentiras.join('\n')).toEqual([]);
  });

  it('las divergencias al revés están declaradas, no escondidas', () => {
    // El otro lado del mismo problema: la vidriera cobra por algo que el plan
    // de abajo ya incluye. No es una mentira al que paga, pero sí al que no:
    // Semilla se ve más pobre de lo que es.
    const regaladas: string[] = [];
    for (const plan of PLANES) {
      for (const renglon of plan.incluye) {
        const feature = RESPALDO[renglon];
        if (!feature) continue;
        const pideMenos = ACEQUIA_PLAN_ORDER[ACEQUIA_FEATURES[feature]] < ACEQUIA_PLAN_ORDER[plan.id];
        if (pideMenos) regaladas.push(renglon);
      }
    }
    // Sólo puede haber divergencias que alguien haya mirado y anotado.
    expect(regaladas.filter((r) => !DIVERGENCIAS_CONOCIDAS.has(r))).toEqual([]);
    // Y la conocida tiene que seguir existiendo: si se arregla, este test avisa
    // para sacarla de la lista en vez de dejar una excepción muerta.
    expect(regaladas).toContain('Curvas de nivel, relieve y vista 3D');
  });

  it('toda feature de la matriz es alcanzable por algún plan que se vende', () => {
    // Una feature cuyo plan mínimo no exista, o que exija un plan que nadie
    // puede contratar, es un candado que no se abre nunca.
    const ids = PLANES.map((p) => p.id);
    for (const [feature, plan] of Object.entries(ACEQUIA_FEATURES)) {
      expect(ids, feature).toContain(plan);
    }
  });
});
