/**
 * Agua de la hacienda por temperatura.
 *
 * Los casos que valen son los de la literatura, y hay tres clases de prueba:
 *
 *  1. **Las celdas publicadas**, una por una, convertidas a litros. Si alguien
 *     cambia un dígito de la tabla, falla.
 *  2. **La validación cruzada entre dos publicaciones independientes.** Kansas
 *     State mide el aumento por grado Fahrenheit en tres trabajos distintos
 *     (0,50 en feedlot, 0,85 de media, 1,44 en lactancia) y cada uno tiene que
 *     reproducir la pendiente de una clase distinta de la tabla del NASEM. Que
 *     dos fuentes que no se citan entre sí den lo mismo es la prueba más fuerte
 *     que se puede tener acá.
 *  3. **El método de extensión contra las celdas que no usó.** La columna de
 *     vaca preñada está publicada sólo hasta 70 °F; el método que la extiende se
 *     apoya en la celda de 40 °F y en la forma de otra serie, así que las de 50,
 *     60 y 70 °F son predicciones comprobables.
 */
import { describe, it, expect } from 'vitest';
import {
  aguaAnimal, factorTermico, respondeALaTemperatura,
  GALON_L, TEMP_TABLA_C, TEMP_TABLA_F,
} from '@/lib/aguaGanado';
import { CATEGORIAS, categoriaPorId, type CategoriaAnimal } from '@/lib/categorias';

const cat = (id: string): CategoriaAnimal => {
  const c = categoriaPorId(id);
  if (!c) throw new Error(`no existe la categoría ${id}`);
  return c;
};

/** °F → °C, para poder escribir los tests con las temperaturas de la fuente. */
const aC = (f: number) => ((f - 32) * 5) / 9;
/** Galones por día → litros por día, redondeado como lo hace el módulo. */
const aL = (gal: number) => Math.round(gal * GALON_L * 10) / 10;

describe('la tabla publicada, celda por celda', () => {
  // Las seis temperaturas de la fuente, en °F.
  it('tiene las seis columnas de la fuente', () => {
    expect([...TEMP_TABLA_F]).toEqual([40, 50, 60, 70, 80, 90]);
    expect(TEMP_TABLA_C[0]).toBeCloseTo(4.44, 2);
    expect(TEMP_TABLA_C[5]).toBeCloseTo(32.22, 2);
  });

  /**
   * Vaca con cría al pie = «Lactating cows, 900 lb» de la tabla 1: 11,4 · 12,6 ·
   * 14,5 · 16,9 · 17,9 · 16,2 galones por día. La vaca de acequia pesa 400 kg
   * (882 lb), dentro del 10 % de las 900 lb publicadas, así que se usa la serie
   * tal cual.
   */
  it.each([
    [40, 11.4], [50, 12.6], [60, 14.5], [70, 16.9], [80, 17.9], [90, 16.2],
  ])('vaca con cría al pie a %i °F = %f gal/día', (f, gal) => {
    expect(aguaAnimal(cat('bovino_vaca_cria'), aC(f)).total_l_dia).toBeCloseTo(aL(gal), 1);
  });

  it('la vaca en lactancia BAJA entre 80 y 90 °F, como está publicado', () => {
    // No es un error de transcripción: con estrés calórico severo cae la
    // producción de leche y con ella el consumo. Si alguien lo "arregla", falla.
    const a80 = aguaAnimal(cat('bovino_vaca_cria'), aC(80)).total_l_dia;
    const a90 = aguaAnimal(cat('bovino_vaca_cria'), aC(90)).total_l_dia;
    expect(a90).toBeLessThan(a80);
  });

  /** Ternero de 200 kg (441 lb) ≈ «Growing cattle, 400 lb»: 4,0 … 9,5 gal/día. */
  it('el ternero sigue la serie de crecimiento, interpolada por peso', () => {
    // 441 lb cae entre 400 (4,0 gal) y 600 (5,3 gal) a 40 °F.
    const esperado = 4.0 + (5.3 - 4.0) * ((441 - 400) / 200);
    expect(aguaAnimal(cat('bovino_ternero'), aC(40)).total_l_dia).toBeCloseTo(aL(esperado), 0);
  });

  /**
   * Novillo en engorde de 430 kg = 948 lb, que cae ENTRE las series publicadas de
   * «Finishing cattle» de 800 y 1.000 lb. No se acota: se interpola, que es lo
   * correcto cuando el peso está adentro de la tabla.
   */
  it.each([
    [40, 7.3, 8.7], [70, 10.7, 12.6], [90, 17.4, 20.6],
  ])('novillo en engorde a %i °F queda entre %f y %f gal/día', (f, gal800, gal1000) => {
    const r = aguaAnimal(cat('bovino_novillo_engorde'), aC(f));
    const esperado = gal800 + (gal1000 - gal800) * ((948 - 800) / 200);
    expect(r.total_l_dia).toBeCloseTo(aL(esperado), 0);
    expect(r.total_l_dia).toBeGreaterThan(aL(gal800));
    expect(r.total_l_dia).toBeLessThan(aL(gal1000));
    expect(r.origen.tipo === 'tabla' && r.origen.pesoFueraDeTabla).toBe(false);
  });

  /** Toro de 700 kg (1.543 lb), entre las series de 1.400 y 1.600 lb. */
  it('el toro se interpola entre 1.400 y 1.600 lb', () => {
    const t = (1543 - 1400) / 200;
    const esperado = 8.0 + (8.7 - 8.0) * t;   // a 40 °F
    expect(aguaAnimal(cat('bovino_toro'), aC(40)).total_l_dia).toBeCloseTo(aL(esperado), 0);
  });
});

describe('validación cruzada contra Kansas State: el aumento por grado Fahrenheit', () => {
  /**
   * KSU/OSU MF3303 cita tres coeficientes medidos de aumento de consumo por °F
   * por encima de 40 °F, y cada uno corresponde a un tipo de animal distinto.
   * La tabla del NASEM tiene que reproducirlos en el tramo lineal (40 a 70 °F).
   * 1 galón = 8,35 lb de agua, según la nota al pie de esa misma publicación.
   */
  const LB_POR_GALON = 8.35;

  /**
   * La pendiente se mide sobre la SERIE publicada y no sobre la categoría de
   * acequia, porque las categorías tienen otros pesos y la app interpola entre
   * series: un novillo de 430 kg no es la columna de 1.000 lb. Para leer una
   * serie exacta se arma una categoría sintética con el peso publicado.
   */
  const alPeso = (id: string, pesoVivo_lb: number): CategoriaAnimal =>
    ({ ...cat(id), pesoVivo_kg: pesoVivo_lb * 0.45359237 });

  const pendiente_lb_F = (c: CategoriaAnimal) => {
    const a40 = aguaAnimal(c, aC(40)).total_l_dia / GALON_L;
    const a70 = aguaAnimal(c, aC(70)).total_l_dia / GALON_L;
    return ((a70 - a40) / 30) * LB_POR_GALON;
  };

  it('«Growing cattle, 400 lb» da 0,50 lb/°F, el valor de Hicks et al. (1988)', () => {
    expect(pendiente_lb_F(alPeso('bovino_ternero', 400))).toBeCloseTo(0.50, 1);
  });

  it('«Pregnant cows, 1.100 lb» da 0,84 lb/°F, la media de 0,85 que usa KSU', () => {
    // Y es justo la categoría de la que habla esa publicación: vacas de carne
    // maduras. Que la media de tres trabajos ajenos reproduzca la pendiente de
    // esta columna no puede ser casualidad.
    expect(pendiente_lb_F(alPeso('bovino_vaca_seca', 1100))).toBeCloseTo(0.85, 1);
  });

  it('«Lactating cows, 900 lb» da 1,53 lb/°F, cerca de los 1,44 de Murphy et al. (1983)', () => {
    expect(pendiente_lb_F(alPeso('bovino_vaca_cria', 900))).toBeCloseTo(1.5, 1);
  });

  it('las tres pendientes de KSU caen dentro del abanico de la tabla', () => {
    // La tabla va de 0,50 (ternero liviano) a 1,53 (vaca en lactancia) lb/°F, y
    // los tres coeficientes publicados —0,50 feedlot, 0,61 toros en crecimiento,
    // 1,44 lactancia— están todos adentro. Dos fuentes que no se citan.
    const minima = pendiente_lb_F(alPeso('bovino_ternero', 400));
    const maxima = pendiente_lb_F(alPeso('bovino_vaca_cria', 900));
    for (const publicado of [0.50, 0.61, 1.44]) {
      expect(publicado).toBeGreaterThanOrEqual(minima - 0.01);
      expect(publicado).toBeLessThanOrEqual(maxima + 0.01);
    }
  });
});

describe('la extensión de la columna de vaca preñada', () => {
  /**
   * La fuente publica «Pregnant cows, 900 lb» sólo hasta 70 °F: 6,0 · 6,5 · 7,4 ·
   * 8,7. El método de extensión usa la celda de 40 °F y la forma del novillo en
   * terminación de 1.000 lb, así que las otras tres son predicciones.
   */
  it.each([[50, 6.5], [60, 7.4], [70, 8.7]])(
    'reproduce la celda publicada de %i °F (%f gal) sin haberla usado',
    (f, gal) => {
      expect(aguaAnimal(cat('bovino_vaca_seca'), aC(f)).total_l_dia).toBeCloseTo(aL(gal), 0);
    });

  it('no se queda plana arriba de 70 °F: el verano sube y mucho', () => {
    const a70 = aguaAnimal(cat('bovino_vaca_seca'), aC(70)).total_l_dia;
    const a90 = aguaAnimal(cat('bovino_vaca_seca'), aC(90)).total_l_dia;
    // Extender con la recta del tramo 40-70 daría ~10,7 gal; la forma real da ~14,2.
    expect(a90 / a70).toBeGreaterThan(1.5);
  });
});

describe('el rango de validez se respeta y se informa', () => {
  it('por debajo de 4,4 °C usa la columna de 40 °F, como indica la fuente', () => {
    const a0  = aguaAnimal(cat('bovino_vaca_cria'), 0);
    const a40 = aguaAnimal(cat('bovino_vaca_cria'), aC(40));
    expect(a0.total_l_dia).toBe(a40.total_l_dia);
    expect(a0.origen.tipo === 'tabla' && a0.origen.extrapoladoPorCalor).toBe(false);
  });

  it('a −10 °C tampoco baja: la tabla no tiene nada abajo de 40 °F', () => {
    expect(aguaAnimal(cat('bovino_vaca_cria'), -10).total_l_dia)
      .toBe(aguaAnimal(cat('bovino_vaca_cria'), 4.44).total_l_dia);
  });

  it('arriba de 32,2 °C se acota Y se marca como extrapolado', () => {
    const r = aguaAnimal(cat('bovino_vaca_cria'), 40);
    expect(r.origen.tipo === 'tabla' && r.origen.extrapoladoPorCalor).toBe(true);
    expect(r.total_l_dia).toBe(aguaAnimal(cat('bovino_vaca_cria'), 32.22).total_l_dia);
  });

  it('un peso muy fuera de la tabla se informa', () => {
    const chico: CategoriaAnimal = { ...cat('bovino_ternero'), pesoVivo_kg: 60 };
    const r = aguaAnimal(chico, 20);
    expect(r.origen.tipo === 'tabla' && r.origen.pesoFueraDeTabla).toBe(true);
  });

  it('una vaca criolla de 400 kg contra las 900 lb de la tabla NO se informa', () => {
    // 2 % de diferencia no es una advertencia: avisar de todo es no avisar de nada.
    const r = aguaAnimal(cat('bovino_vaca_seca'), 20);
    expect(r.origen.tipo === 'tabla' && r.origen.pesoFueraDeTabla).toBe(false);
  });
});

describe('la vaca de cría promedio anual', () => {
  it('es el promedio de la lactando y la seca, mitad y mitad', () => {
    const t = 20;
    const prom = aguaAnimal(cat('bovino_vaca_prom'), t).total_l_dia;
    const lact = aguaAnimal(cat('bovino_vaca_cria'), t).total_l_dia;
    const seca = aguaAnimal(cat('bovino_vaca_seca'), t).total_l_dia;
    expect(prom).toBeCloseTo((lact + seca) / 2, 0);
  });

  it('queda entre las dos, que es la única forma de que el promedio tenga sentido', () => {
    const t = 25;
    const prom = aguaAnimal(cat('bovino_vaca_prom'), t).total_l_dia;
    expect(prom).toBeGreaterThan(aguaAnimal(cat('bovino_vaca_seca'), t).total_l_dia);
    expect(prom).toBeLessThan(aguaAnimal(cat('bovino_vaca_cria'), t).total_l_dia);
  });
});

describe('las especies que la fuente da como rango', () => {
  it('la oveja toma el extremo alto del rango publicado (2,0 gal)', () => {
    const r = aguaAnimal(cat('ovino_oveja'), 20);
    expect(r.total_l_dia).toBeCloseTo(aL(2.0), 1);
    expect(r.origen.tipo).toBe('rango');
    if (r.origen.tipo === 'rango') {
      expect(r.origen.min_l_dia).toBeCloseTo(aL(1.0), 1);
      expect(r.origen.max_l_dia).toBeCloseTo(aL(2.0), 1);
    }
  });

  it('no responde a la temperatura, porque la fuente no la publica para ovinos', () => {
    expect(aguaAnimal(cat('ovino_oveja'), 5).total_l_dia)
      .toBe(aguaAnimal(cat('ovino_oveja'), 35).total_l_dia);
    expect(respondeALaTemperatura(cat('ovino_oveja'))).toBe(false);
    expect(factorTermico(cat('ovino_oveja'))).toBeNull();
  });

  it('el cerdo también sale de la tabla 5, con su rango', () => {
    const r = aguaAnimal(cat('porcino'), 20);
    expect(r.origen.tipo).toBe('rango');
    expect(r.total_l_dia).toBeCloseTo(aL(6.0), 1);
  });
});

describe('las especies sin fuente conservan lo declarado y lo dicen', () => {
  it.each(['equino_adulto', 'equino_crecimiento', 'equino_potrillo', 'caprino'])(
    '%s queda en declarado', id => {
      const c = cat(id);
      const r = aguaAnimal(c, 25);
      expect(r.origen.tipo).toBe('declarado');
      expect(r.total_l_dia).toBe(c.agua_l_dia);
      expect(r.fuente).toBe('');
    });
});

describe('el factor térmico, que es el argumento de todo este módulo', () => {
  it('una vaca SECA se multiplica por 2,4 entre 4 y 32 °C', () => {
    expect(factorTermico(cat('bovino_vaca_seca'))).toBeCloseTo(2.37, 1);
  });

  it('la de cría promedio sube menos (1,75) porque la mitad lactando baja a 90 °F', () => {
    // No es un defecto del promedio: es la caída publicada del consumo de la
    // vaca en lactancia bajo estrés calórico severo, que arrastra la mitad del
    // promedio. Sigue siendo muy lejos de un litraje fijo.
    const f = factorTermico(cat('bovino_vaca_prom'));
    expect(f).not.toBeNull();
    expect(f!).toBeCloseTo(1.75, 1);
    expect(f!).toBeGreaterThan(1.5);
  });

  it('el novillo en engorde se multiplica por 2,37', () => {
    expect(factorTermico(cat('bovino_novillo_engorde'))).toBeCloseTo(2.37, 1);
  });

  it('todas las categorías bovinas suben con el calor', () => {
    for (const c of CATEGORIAS.filter(x => x.especie === 'bovino' && x.id !== 'bovino_vaca_cria')) {
      expect(aguaAnimal(c, 32).total_l_dia).toBeGreaterThan(aguaAnimal(c, 5).total_l_dia);
    }
  });
});

describe('contra el litraje fijo que había antes', () => {
  /**
   * El valor declarado de la vaca de cría promedio era 50 L/día. Con la tabla,
   * eso es lo que toma a unos 20 °C — o sea que el número viejo era el de una
   * temperatura templada aplicada a todo el año y a todo el planeta. Es el mismo
   * defecto que tenía el equivalente vaca.
   */
  it('los 50 L/día que había eran un valor de clima templado', () => {
    const c = cat('bovino_vaca_prom');
    expect(c.agua_l_dia).toBe(50);
    const templado = aguaAnimal(c, 20).total_l_dia;
    expect(Math.abs(templado - 50)).toBeLessThan(10);
  });

  it('y en un enero de 30 °C se queda corto', () => {
    expect(aguaAnimal(cat('bovino_vaca_prom'), 30).total_l_dia).toBeGreaterThan(50);
  });
});
