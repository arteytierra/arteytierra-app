/**
 * Geometría solar y reglas de orientación/protección solar por clima.
 *
 * Cubre los 5 grupos de Köppen (A/B/C/D/E) y ambos hemisferios: la estrategia
 * bioclimática correcta cambia radicalmente entre un clima tropical húmedo
 * (Puerto Rico: sombra + ventilación cruzada) y un clima continental frío
 * (ganancia solar directa + envolvente compacta), así que no hay una regla
 * única — el `Perfil 3` (bioclimático) resuelve la orientación y el alero
 * consultando esta tabla con el Köppen real del sitio.
 */
import type { Koppen } from '../clima';

export type Hemisferio = 'norte' | 'sur';
export type Enfoque = 'sombra-ventilacion' | 'masa-termica-arida' | 'mixto' | 'ganancia-solar';
export type EjeLargo = 'E-O' | 'N-S' | 'compacto';

export interface EstrategiaClimatica {
  enfoque: Enfoque;
  /** Orientación de la fachada con mayor vidriado / mayor peso bioclimático. */
  fachadaPrioritaria: 'ecuador' | 'viento-dominante' | 'ninguna-marcada';
  ejeLargoPreferido: EjeLargo;
  /** Factor de forma objetivo (perímetro/área): más bajo = más compacto. */
  compacidadObjetivo: 'baja' | 'media' | 'alta';
  descripcion: string;
}

export function hemisferioDe(lat: number): Hemisferio {
  return lat < 0 ? 'sur' : 'norte';
}

/** Orientación cardinal "hacia el ecuador" (mayor sol en invierno) según hemisferio. */
export function fachadaEcuador(lat: number): 'N' | 'S' {
  return hemisferioDe(lat) === 'sur' ? 'N' : 'S';
}

/**
 * Reduce un rumbo de 16 direcciones (el que devuelve `viento_dir_ppal` de
 * `lib/clima.ts`, ej. 'ENE') al cardinal más cercano de los 4 que maneja el
 * motor de layout (N/S/E/O — 'O' de Oeste). Tabla explícita por ángulo, no
 * heurística de substring, para no confundir NNE (22.5°, más cerca de N) con
 * ENE (67.5°, más cerca de E).
 */
const CARDINAL4_POR_RUMBO16: Record<string, 'N' | 'S' | 'E' | 'O'> = {
  N: 'N', NNE: 'N', NE: 'E', ENE: 'E',
  E: 'E', ESE: 'E', SE: 'S', SSE: 'S',
  S: 'S', SSO: 'S', SO: 'O', OSO: 'O',
  O: 'O', ONO: 'O', NO: 'N', NNO: 'N',
};

export function rumboACardinal4(rumbo: string): 'N' | 'S' | 'E' | 'O' {
  return CARDINAL4_POR_RUMBO16[rumbo] ?? 'N';
}

/**
 * Estrategia climática según el grupo Köppen del sitio.
 * `koppen.codigo` distingue variantes cálidas/frías dentro de un grupo
 * (ej. BWh árido cálido vs BWk árido frío) donde la estrategia difiere.
 */
export function estrategiaClimatica(koppen: Koppen): EstrategiaClimatica {
  const c = koppen.codigo;

  if (koppen.grupo === 'Tropical') {
    return {
      enfoque: 'sombra-ventilacion',
      fachadaPrioritaria: 'viento-dominante',
      ejeLargoPreferido: 'E-O',
      compacidadObjetivo: 'baja',
      descripcion:
        'Clima tropical: prioridad a sombra permanente y ventilación cruzada. ' +
        'Eje largo este-oeste para minimizar muros expuestos al sol bajo de ' +
        'mañana/tarde; fachada principal abierta al viento dominante.',
    };
  }

  if (koppen.grupo === 'Árido') {
    const calido = c.endsWith('h');
    return calido
      ? {
          enfoque: 'masa-termica-arida',
          fachadaPrioritaria: 'ninguna-marcada',
          ejeLargoPreferido: 'compacto',
          compacidadObjetivo: 'alta',
          descripcion:
            'Árido cálido: envolvente compacta y aberturas reducidas en todas ' +
            'las fachadas, masa térmica para amortiguar la amplitud diaria, ' +
            'patios/galerías sombreadas como espacio de transición.',
        }
      : {
          enfoque: 'mixto',
          fachadaPrioritaria: 'ecuador',
          ejeLargoPreferido: 'compacto',
          compacidadObjetivo: 'media',
          descripcion:
            'Árido frío: gran amplitud térmica diaria — ganancia solar directa ' +
            'de día por la fachada orientada al ecuador, masa térmica para ' +
            'liberar calor de noche, envolvente compacta.',
        };
  }

  if (koppen.grupo === 'Templado') {
    return {
      enfoque: 'mixto',
      fachadaPrioritaria: 'ecuador',
      ejeLargoPreferido: 'N-S',
      compacidadObjetivo: 'media',
      descripcion:
        'Clima templado: ganancia solar de invierno por la fachada orientada ' +
        'al ecuador (con alero que la bloquea en verano) y ventilación ' +
        'cruzada aprovechable gran parte del año.',
    };
  }

  if (koppen.grupo === 'Continental') {
    return {
      enfoque: 'ganancia-solar',
      fachadaPrioritaria: 'ecuador',
      ejeLargoPreferido: 'compacto',
      compacidadObjetivo: 'alta',
      descripcion:
        'Clima continental: prioridad a ganancia solar pasiva y envolvente ' +
        'compacta (factor de forma bajo) para minimizar pérdida de calor. ' +
        'Mayor vidriado en la fachada orientada al ecuador, mínimo en la ' +
        'fachada opuesta a los vientos dominantes fríos.',
    };
  }

  // Polar / alta montaña — mismo criterio que continental pero más extremo.
  return {
    enfoque: 'ganancia-solar',
    fachadaPrioritaria: 'ecuador',
    ejeLargoPreferido: 'compacto',
    compacidadObjetivo: 'alta',
    descripcion:
      'Clima polar/altoandino: envolvente lo más compacta posible, mínima ' +
      'superficie expuesta al viento, ganancia solar directa cuando hay sol ' +
      'disponible.',
  };
}

// ─── Geometría solar ────────────────────────────────────────────────────────

/** Declinación solar (grados) para un día del año (FAO-56, igual que lib/clima.ts). */
function declinacionSolarDeg(doy: number): number {
  const rad = 0.409 * Math.sin((2 * Math.PI * doy) / 365 - 1.39);
  return (rad * 180) / Math.PI;
}

/** Altitud solar al mediodía solar (grados sobre el horizonte) para una latitud y día del año. */
export function altitudSolarMediodia(latDeg: number, doy: number): number {
  const delta = declinacionSolarDeg(doy);
  const altitud = 90 - Math.abs(latDeg - delta);
  return Math.max(0, Math.min(90, altitud));
}

const DOY_SOLSTICIO_JUN = 172; // ~21 de junio
const DOY_SOLSTICIO_DIC = 355; // ~21 de diciembre

/** Altitud solar de mediodía en el solsticio de verano local (hemisferio-consciente). */
export function altitudSolsticioVerano(latDeg: number): number {
  const doy = hemisferioDe(latDeg) === 'sur' ? DOY_SOLSTICIO_DIC : DOY_SOLSTICIO_JUN;
  return altitudSolarMediodia(latDeg, doy);
}

/** Altitud solar de mediodía en el solsticio de invierno local (hemisferio-consciente). */
export function altitudSolsticioInvierno(latDeg: number): number {
  const doy = hemisferioDe(latDeg) === 'sur' ? DOY_SOLSTICIO_JUN : DOY_SOLSTICIO_DIC;
  return altitudSolarMediodia(latDeg, doy);
}

export interface AleroPasivo {
  /** Profundidad de alero recomendada (m), medida desde el paramento. */
  profundidad_m: number;
  altitudVeranoDeg: number;
  altitudInviernoDeg: number;
  nota: string;
}

/**
 * Profundidad de alero para que, en la fachada prioritaria, el sol de
 * mediodía quede totalmente bloqueado en el solsticio de verano local y
 * penetre en el solsticio de invierno local. Regla clásica de diseño solar
 * pasivo (ej. Fuller Moore, *Environmental Control Systems*), a nivel de
 * anteproyecto — no reemplaza un cálculo de asoleamiento hora a hora.
 *
 * En climas de enfoque 'sombra-ventilacion' (trópico) no hay estación fría
 * que aprovechar: se usa un criterio de sombra máxima todo el año, con
 * profundidad algo mayor.
 */
export function calcularAleroPasivo(
  latDeg: number,
  alturaVentana_m: number,
  enfoque: Enfoque,
): AleroPasivo {
  const altVerano = altitudSolsticioVerano(latDeg);
  const altInvierno = altitudSolsticioInvierno(latDeg);

  if (enfoque === 'sombra-ventilacion' || enfoque === 'masa-termica-arida') {
    // Sombra todo el año: se dimensiona contra el sol más alto (peor caso para
    // sombrear) pero con un margen extra, porque acá no hay ganancia de
    // invierno que proteger.
    const altObjetivo = Math.max(altVerano, altInvierno) * 0.85;
    const profundidad = alturaVentana_m / Math.tan((altObjetivo * Math.PI) / 180);
    return {
      profundidad_m: Math.round(Math.min(Math.max(profundidad, 0.6), 1.8) * 100) / 100,
      altitudVeranoDeg: Math.round(altVerano),
      altitudInviernoDeg: Math.round(altInvierno),
      nota: 'Sombra permanente (no hay estación fría que aprovechar en este clima).',
    };
  }

  // Ganancia de invierno + sombra de verano: profundidad que bloquea el sol
  // alto de verano sin tapar el sol bajo de invierno.
  const profundidad = alturaVentana_m / Math.tan((altVerano * Math.PI) / 180);
  return {
    profundidad_m: Math.round(Math.min(Math.max(profundidad, 0.3), 1.5) * 100) / 100,
    altitudVeranoDeg: Math.round(altVerano),
    altitudInviernoDeg: Math.round(altInvierno),
    nota: 'Bloquea el sol de verano y deja pasar el sol bajo de invierno para ganancia pasiva.',
  };
}
