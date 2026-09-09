import { describe, it, expect } from 'vitest';
import { calcularHorasFrio, UMBRAL_FRIO_C } from '@/lib/horasFrio';
import { cultivosDeFicha, CULTIVOS_KC, FAMILIAS } from '@/lib/calendario';
import { ESPECIES_POR_ID, evaluarEspecie } from '@/lib/especies';
import type { MesDato } from '@/lib/clima';

/** Doce meses con la forma que pide MesDato, a partir de tmin/tmax por mes. */
function anio(tmin: number[], tmax: number[]): MesDato[] {
  return tmin.map((tn, i) => {
    const tx = tmax[i]!;
    return {
      mes: String(i + 1),
      precip_mm: 60, tmax_c: tx, tmin_c: tn, tmean_c: (tn + tx) / 2,
      etp_mm: 70, balance_mm: -10, viento_ms: 2,
    };
  });
}

/** Un año simétrico entre un invierno y un verano, con amplitud diaria de 10 °C. */
function anioEstacional(mediaInvierno: number, mediaVerano: number): MesDato[] {
  const amp = (mediaVerano - mediaInvierno) / 2;
  const centro = (mediaVerano + mediaInvierno) / 2;
  const medias = Array.from({ length: 12 }, (_, i) =>
    centro - amp * Math.cos((2 * Math.PI * (i - 6)) / 12));
  return anio(medias.map(m => m - 5), medias.map(m => m + 5));
}

describe('horas de frío', () => {
  it('no devuelve nada si faltan meses', () => {
    expect(calcularHorasFrio(anio([5], [15]))).toBeNull();
  });

  it('un trópico sin invierno no acumula frío', () => {
    const frio = calcularHorasFrio(anioEstacional(26, 28))!;
    expect(frio.total).toBe(0);
    expect(frio.banda).toBe('nulo');
  });

  it('un invierno templado acumula frío de sobra', () => {
    const frio = calcularHorasFrio(anioEstacional(3, 22))!;
    expect(frio.total).toBeGreaterThan(800);
    expect(frio.banda).toBe('alto');
  });

  it('un mes entero dentro de la banda da las horas del mes', () => {
    // Todo el mes entre 0 y 7,2 °C: las 24 h de los 31 días cuentan.
    const meses = anio(Array(12).fill(1), Array(12).fill(6));
    const frio = calcularHorasFrio(meses)!;
    expect(frio.por_mes[0]).toBe(24 * 31);
  });

  it('por debajo de 0 °C no acumula: el tejido congelado no cuenta', () => {
    // Siberia: mucho más frío que el umbral, pero casi nada DENTRO de la banda.
    const siberia = calcularHorasFrio(anioEstacional(-30, 18))!;
    const suave   = calcularHorasFrio(anioEstacional(3, 18))!;
    expect(siberia.total).toBeLessThan(suave.total);
  });

  it('encuentra el invierno en los dos hemisferios', () => {
    const norte = calcularHorasFrio(anioEstacional(2, 22))!;
    // El mismo año corrido seis meses es el hemisferio sur.
    const mesesSur = anioEstacional(2, 22);
    const sur = calcularHorasFrio([...mesesSur.slice(6), ...mesesSur.slice(0, 6)])!;
    // Lo que se le pide es que encuentre el invierno donde está, en cada
    // hemisferio: que la ventana contenga el mes más frío. El índice exacto de
    // arranque no es la propiedad a fijar —entre dos ventanas casi empatadas lo
    // desempata que febrero tenga 28 días—, y clavarlo haría un test frágil
    // sobre algo que no le importa a nadie.
    const contiene = (ini: number, mes: number) =>
      Array.from({ length: 6 }, (_, k) => (ini + k) % 12).includes(mes);
    const masFrio = (ms: MesDato[]) =>
      ms.reduce((b, m, i) => m.tmean_c < ms[b]!.tmean_c ? i : b, 0);

    expect(contiene(norte.ventana.inicio, masFrio(anioEstacional(2, 22)))).toBe(true);
    expect(contiene(sur.ventana.inicio, masFrio([...mesesSur.slice(6), ...mesesSur.slice(0, 6)]))).toBe(true);
    // El total no da idéntico y no tiene por qué: al correr el año, febrero cae
    // en otro lugar y el invierno austral se lleva meses de 31 días donde el
    // boreal tenía uno de 28. Se parecen, que es lo que importa.
    expect(Math.abs(sur.total - norte.total) / norte.total).toBeLessThan(0.05);
  });

  it('el umbral es el clásico de la pomología', () => {
    expect(UMBRAL_FRIO_C).toBe(7.2);
  });
});

describe('el frío decide sobre el frutal caduco', () => {
  it('el manzano no cuaja en un invierno tibio, aunque sobreviva y haya calor', () => {
    const manzano = ESPECIES_POR_ID['manzano']!;
    expect(manzano.horas_frio).toBeGreaterThan(0);

    // Subtropical: nunca hiela, sobra calor, y el invierno no enfría.
    const subtropical = anioEstacional(16, 30);
    const ev = evaluarEspecie(manzano, subtropical);

    expect(ev.viable).toBe(false);
    expect(ev.razon).toMatch(/tibio/);
    expect(ev.razon).toMatch(/horas de frío/);
  });

  it('el mismo manzano sí va donde el invierno enfría', () => {
    const manzano = ESPECIES_POR_ID['manzano']!;
    expect(evaluarEspecie(manzano, anioEstacional(3, 24)).viable).toBe(true);
  });

  it('la especie sin requerimiento de frío no se evalúa por frío', () => {
    // El café no lleva horas_frio y no tiene que fallar por eso: falla —o no—
    // por invierno duro y por calor, que es lo que le corresponde.
    const cafe = ESPECIES_POR_ID['cafe']!;
    expect(cafe.horas_frio).toBeUndefined();
    expect(evaluarEspecie(cafe, anioEstacional(16, 26)).viable).toBe(true);
  });

  it('sólo las caducas donde el frío manda llevan el número', () => {
    const conFrio = Object.values(ESPECIES_POR_ID).filter(e => e.horas_frio !== undefined);
    // Todas perennes: una anual no tiene dormancia invernal que romper.
    expect(conFrio.every(e => e.perenne)).toBe(true);
    expect(conFrio.length).toBeGreaterThanOrEqual(13);
  });
});

describe('el balance hídrico sigue a la ecorregión', () => {
  it('sin ficha se cae a la lista genérica', () => {
    expect(cultivosDeFicha(undefined)).toBe(CULTIVOS_KC);
    expect(cultivosDeFicha([])).toBe(CULTIVOS_KC);
  });

  it('con ficha manda la ficha, con el Kc del catálogo', () => {
    const lista = cultivosDeFicha(['cafe', 'platano', 'yuca']);
    expect(lista.map(c => c.id).sort()).toEqual(['cafe', 'platano', 'yuca']);
    expect(lista.find(c => c.id === 'cafe')!.kc).toBe(ESPECIES_POR_ID['cafe']!.kc);
    // Y ya no ofrece soja en un cafetal.
    expect(lista.some(c => c.id === 'soja')).toBe(false);
  });

  it('un id que no existe en el catálogo no rompe la lista', () => {
    expect(cultivosDeFicha(['cafe', 'no_existe']).map(c => c.id)).toEqual(['cafe']);
  });

  it('una ficha con ids todos inválidos vuelve a la genérica', () => {
    expect(cultivosDeFicha(['no_existe'])).toBe(CULTIVOS_KC);
  });
});

describe('familias vegetales', () => {
  it('hay familias de clima cálido, no sólo de huerta templada', () => {
    const ids = FAMILIAS.map(f => f.id);
    for (const id of ['raices_trop', 'musaceas', 'frutales_trop', 'granos_calidos']) {
      expect(ids).toContain(id);
    }
  });

  it('ninguna familia repite id: un duplicado se perdería en silencio', () => {
    const ids = FAMILIAS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('los límites absolutos contienen al rango óptimo', () => {
    for (const f of FAMILIAS) {
      expect(f.tmin_limite).toBeLessThanOrEqual(f.tmin_opt);
      expect(f.tmax_limite).toBeGreaterThanOrEqual(f.tmax_opt);
    }
  });
});
