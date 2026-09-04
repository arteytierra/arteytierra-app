/**
 * Regla de activación de los saberes territoriales.
 *
 * Un saber territorial no es un atributo del terreno. Es de alguien. Por eso
 * acá no hay heurística: hay una compuerta con ocho condiciones, y basta que
 * falle una para que el saber no se muestre como propio del predio.
 *
 *   1. El saber tiene al menos una fuente verificable.
 *   2. Su estado territorial es `aprobado`.
 *   3. Existe una geometría registrada con su id.
 *   4. La licencia de esa geometría está en `LICENCIAS_ADMITIDAS`.
 *   5. La geometría declara fuente y URL.
 *   6. El país del punto está entre los países del saber.
 *   7. Si el saber declara ECO_ID compatibles, el del punto está entre ellos.
 *   8. El punto cae dentro del polígono.
 *
 * Hoy `GEOMETRIAS_SABERES` está vacío, así que `saberesActivos` devuelve
 * siempre `[]`. Eso no es un pendiente que quedó a medias: es el estado
 * correcto mientras no haya cartografía con procedencia y licencia. Cargar un
 * polígono y poner el saber en `aprobado` lo activa; nada más hace falta.
 *
 * Para uso editorial —listar qué hay documentado para una región, escribir una
 * nota, armar una convocatoria— está `saberesDocumentados`, que no pretende que
 * el saber sea del predio de quien mira.
 */

import * as turf from '@turf/turf';

import { SABERES_TERRITORIALES } from './saberesTerritoriales';
import type { GeometriaSaber, SaberTerritorial } from './saberesTipos';

export type { GeometriaSaber, SaberTerritorial } from './saberesTipos';
export { SABERES_TERRITORIALES } from './saberesTerritoriales';

/**
 * Licencias bajo las que se puede redistribuir un polígono ajeno dentro de la
 * app. Una geometría de licencia desconocida queda fuera aunque sea pública:
 * "está en internet" no es una licencia.
 *
 * `comunitaria_con_permiso` es para polígonos que una comunidad cedió
 * expresamente para este uso; la constancia va en `fuente` y `url`.
 */
export const LICENCIAS_ADMITIDAS: readonly string[] = [
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'ODbL-1.0',
  'dominio_publico',
  'comunitaria_con_permiso',
];

/**
 * Registro de geometrías aprobadas, indexado por `saberId`.
 *
 * Vacío a propósito. Para agregar una:
 *
 *   1. Conseguir el polígono de una fuente que publique licencia.
 *   2. Verificar que la licencia esté en `LICENCIAS_ADMITIDAS`.
 *   3. Cuando el saber es de un pueblo o una comunidad, tener su acuerdo
 *      registrado antes de cargarlo; el polígono es sólo la mitad del permiso.
 *   4. Agregar la entrada acá y pasar el saber a `estado: 'aprobado'` en el
 *      inventario de `_research/`, y regenerar `saberesTerritoriales.ts`.
 *
 * Los tres candidatos más cercanos son los europeos marcados
 * `cartografia_oficial_sin_licencia`: cañadas reales (ES), polders y
 * waterschappen (NL) y crofting townships (GB). Tienen cartografía oficial
 * publicada y les falta sólo el paso 2.
 */
export const GEOMETRIAS_SABERES: Readonly<Record<string, GeometriaSaber>> = {};

export type MotivoBloqueo =
  | 'sin_fuente'
  | 'estado_no_aprobado'
  | 'sin_geometria'
  | 'licencia_no_admitida'
  | 'geometria_sin_procedencia'
  | 'pais_no_coincide'
  | 'ecorregion_no_compatible'
  | 'fuera_del_poligono';

export interface PuntoConsulta {
  lat: number;
  lng: number;
  /** ISO 3166-1 alfa-2. Sin país no se activa nada. */
  pais?: string;
  /** ECO_ID de RESOLVE resuelto por `/api/bioma`. */
  ecoId?: number;
}

export interface Evaluacion {
  saber: SaberTerritorial;
  activo: boolean;
  /** Ausente si `activo`. La primera condición que falló, en el orden de arriba. */
  motivo?: MotivoBloqueo;
}

/**
 * Corre la compuerta sobre un saber y devuelve por qué no pasó. Se exporta
 * para poder auditar el registro —"¿por qué no se ve la chakra de Napo?"— sin
 * tener que leer el código.
 */
export function evaluarSaber(
  saber: SaberTerritorial,
  punto: PuntoConsulta,
  geometrias: Readonly<Record<string, GeometriaSaber>> = GEOMETRIAS_SABERES,
): Evaluacion {
  const no = (motivo: MotivoBloqueo): Evaluacion => ({ saber, activo: false, motivo });

  if (saber.fuentes.length === 0) return no('sin_fuente');
  if (saber.estado !== 'aprobado') return no('estado_no_aprobado');

  const geo = geometrias[saber.id];
  const exterior = geo?.anillos[0];
  if (!geo || !exterior || exterior.length < 4) return no('sin_geometria');
  if (!LICENCIAS_ADMITIDAS.includes(geo.licencia)) return no('licencia_no_admitida');
  if (!geo.fuente.trim() || !geo.url.trim()) return no('geometria_sin_procedencia');

  if (!punto.pais || !saber.paises.includes(punto.pais)) return no('pais_no_coincide');
  if (saber.ecoIdsCompatibles.length > 0) {
    if (punto.ecoId === undefined || !saber.ecoIdsCompatibles.includes(punto.ecoId)) {
      return no('ecorregion_no_compatible');
    }
  }

  const dentro = turf.booleanPointInPolygon(
    turf.point([punto.lng, punto.lat]),
    turf.polygon(geo.anillos),
  );
  if (!dentro) return no('fuera_del_poligono');

  return { saber, activo: true };
}

/**
 * Los saberes que se pueden mostrar como propios del predio. Devuelve `[]`
 * mientras el registro de geometrías esté vacío, que es hoy.
 */
export function saberesActivos(
  punto: PuntoConsulta,
  geometrias: Readonly<Record<string, GeometriaSaber>> = GEOMETRIAS_SABERES,
): SaberTerritorial[] {
  return SABERES_TERRITORIALES
    .map((s) => evaluarSaber(s, punto, geometrias))
    .filter((e) => e.activo)
    .map((e) => e.saber);
}

/**
 * Listado editorial: qué hay documentado, sin afirmar que sea del predio de
 * nadie. Filtra por país y por región, nunca activa. Es lo que se puede usar
 * para una nota o un índice; no para decirle a un usuario "tu tierra tiene
 * esto".
 */
export function saberesDocumentados(filtro: {
  pais?: string;
  region?: SaberTerritorial['region'];
} = {}): SaberTerritorial[] {
  return SABERES_TERRITORIALES.filter((s) => {
    if (filtro.pais && !s.paises.includes(filtro.pais)) return false;
    if (filtro.region && s.region !== filtro.region) return false;
    return true;
  });
}

/** Cuentas para el panel de estado y para los tests de regresión. */
export function resumenSaberes(
  geometrias: Readonly<Record<string, GeometriaSaber>> = GEOMETRIAS_SABERES,
): {
  documentados: number;
  conFuente: number;
  conEcorregiones: number;
  conGeometria: number;
  aprobados: number;
} {
  return {
    documentados: SABERES_TERRITORIALES.length,
    conFuente: SABERES_TERRITORIALES.filter((s) => s.fuentes.length > 0).length,
    conEcorregiones: SABERES_TERRITORIALES.filter((s) => s.ecoIdsCompatibles.length > 0).length,
    conGeometria: SABERES_TERRITORIALES.filter((s) => geometrias[s.id] !== undefined).length,
    aprobados: SABERES_TERRITORIALES.filter((s) => s.estado === 'aprobado').length,
  };
}
