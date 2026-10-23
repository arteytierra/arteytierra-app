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
 * `GEOMETRIAS_SABERES` estuvo vacío a propósito hasta que hubo una geometría
 * con procedencia y licencia verificadas. Hoy tiene dos —el Quesungual sobre el
 * departamento de Lempira y el waterschap neerlandés— y por eso
 * `saberesActivos` ya puede devolver algo, pero sólo adentro de esos dos
 * polígonos: en todo el resto del mundo sigue devolviendo `[]`, que es el
 * estado correcto mientras no haya cartografía.
 *
 * Para uso editorial —listar qué hay documentado para una región, escribir una
 * nota, armar una convocatoria— está `saberesDocumentados`, que no pretende que
 * el saber sea del predio de quien mira.
 */

import * as turf from '@turf/turf';

import { GEOMETRIAS } from './geometriasSaberes';
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
  'OGL-3.0',
  'dominio_publico',
  'comunitaria_con_permiso',
];

/*
 * `OGL-3.0` entró el 22/10/2026, verificada contra el texto de la licencia en
 * `nationalarchives.gov.uk/doc/open-government-licence/version/3/`.
 *
 * La **Open Government Licence v3.0** del Reino Unido concede, con estas
 * palabras: «You are free to: copy, publish, distribute and transmit the
 * Information; adapt the Information; **exploit the Information commercially**
 * and non-commercially». Es mundial, gratuita, perpetua y no exclusiva, y lo
 * único que pide es atribución, con una fórmula por defecto cuando el proveedor
 * no especifica una: «Contains public sector information licensed under the Open
 * Government Licence v3.0.» O sea: para lo que esta app necesita —redistribuir
 * un polígono adentro de un producto que se vende y derivar de él— es
 * funcionalmente equivalente a una CC-BY.
 *
 * Importa porque desbloquea un reino entero del inventario: diez saberes
 * británicos e irlandeses están en `documentado_sin_geometria` y el open data
 * del Reino Unido se publica mayoritariamente bajo esta licencia. **Pero no
 * activa nada todavía**: lo que falta de esos diez sigue siendo el polígono, y
 * esto sólo saca de la lista de excusas a la licencia.
 *
 * Tres cosas de su texto que hay que respetar al montar un polígono OGL, y que
 * no son decorativas:
 *
 * 1. **Las exenciones.** La licencia no cubre datos personales, logos, escudos
 *    ni las Armas Reales, insignias militares, derechos de terceros que el
 *    proveedor no está autorizado a licenciar, otras formas de propiedad
 *    intelectual —patentes, marcas, derechos de diseño— ni documentos de
 *    identidad. Un polígono es dato geográfico y entra; el logo del organismo
 *    que lo publica, no.
 * 2. **La cláusula de no-respaldo**, textual: la licencia «does not grant you
 *    any right to use the Information in a way that suggests any official status
 *    or that the Information Provider and/or Licensor endorse you or your use of
 *    the Information». La atribución nombra la fuente; no puede insinuar que el
 *    organismo avala el análisis de acequia.
 * 3. **Los derechos terminan automáticamente** si no se cumplen las condiciones.
 *    No hay período de gracia escrito.
 *
 * Y un caso particular ya verificado, para no volver a intentarlo: **esto no
 * desbloquea los límites de crofting escoceses.** Viven en el Crofting Register
 * y derivan de Ordnance Survey, que es un producto pago; que la Crofting
 * Commission publique datos tabulares bajo OGL no hace OGL a la cartografía.
 *
 * Nota aparte sobre los Estados Unidos, de la misma tanda. Los shapefiles
 * TIGER/Line del Census Bureau —que incluyen los límites AIANNH, las áreas de
 * pueblos originarios— **son de dominio público**: «Copyright protection is not
 * available for any work of the United States Government (Title 17 U.S.C.,
 * Section 105). Thus, you are free to reproduce census materials as you see
 * fit», con el pedido de citar al Census Bureau. Eso cae en `dominio_publico`,
 * que ya estaba admitida, así que no hace falta una entrada nueva.
 *
 * Pero su documentación técnica trae dos cláusulas que sí cambian cómo se usa,
 * las dos en la página 12 del `TGRSHP2026_TechDoc.pdf`. Una es de marca:
 * «TIGER/Line cannot be used as or within the proprietary product names of any
 * commercial product», y pide una declaración visible al redistribuir. La otra
 * es la que importa de verdad, y pesa más que la licencia:
 *
 * > «the boundary information in the TIGER/Line Shapefiles is for statistical
 * > data collection and tabulation purposes only. Their depiction and
 * > designation for statistical purposes **does not constitute a determination
 * > of jurisdictional authority or rights of ownership or entitlement** and are
 * > not legal land descriptions.»
 *
 * La condición 8 de esta compuerta es que el punto caiga adentro del polígono, y
 * eso equivale a afirmar que el saber es de ahí. Un límite que declara
 * explícitamente no ser una determinación de autoridad jurisdiccional ni de
 * derechos de propiedad **no es el instrumento para sostener esa afirmación**, y
 * menos con territorios de pueblos originarios. La licencia habilita; esta
 * cláusula aconseja lo contrario. Es el mismo patrón que la FAO, al revés: allá
 * el rótulo decía CC-BY y los términos adicionales lo cerraban; acá el rótulo
 * dice dominio público y lo que acota es para qué sirve el dato.
 *
 * Así que los trece saberes de Estados Unidos no se activan con TIGER/Line. Lo
 * que corresponde ahí es el paso 3 de la receta de abajo, que ya estaba escrito:
 * el acuerdo antes que el mapa.
 */

/*
 * Estar en esta lista es necesario y no es suficiente: el rótulo lo pone quien
 * publica, y a veces no describe lo que firmó.
 *
 * Dos veces ya el rótulo no coincidió con los términos. En PDOK la política del
 * portal declaraba CC BY 4.0 mientras el registro del dataset declaraba
 * CC BY-NC-ND 4.0, y manda el del dato concreto. En la FAO —verificado el
 * 10/10/2026— las bases estadísticas corporativas dicen CC BY 4.0 y le
 * atornillan unos «Additional terms of use» que prohíben usar los datasets
 * «in conjunction with the promotion of a commercial enterprise and/or its
 * product(s) or service(s)» y acotan el propósito a investigación y estadística.
 * Una CC BY con una cláusula no-promocional encima no es una CC BY: acequia
 * cobra, así que no entra. El resto del contenido web de la FAO es
 * explícitamente no comercial.
 *
 * Entonces el paso 2 de la receta de abajo no es leer la sigla: es abrir los
 * términos del dataset y leerlos. Y en licencias la duda se resuelve del lado
 * de no usar el dato. El detalle está en
 * `_research/_encargos/RESPUESTAS_LICENCIAS.md`.
 *
 * Nada de esto toca las citas: nombrar una fuente con su rótulo y su URL para
 * respaldar una afirmación es una referencia, no una redistribución de dato.
 */

/**
 * Registro de geometrías aprobadas, indexado por `saberId`. Los polígonos viven
 * en `geometriasSaberes.ts` para que acá se pueda leer la regla sin scrollear
 * cientos de vértices.
 *
 * Para agregar una:
 *
 *   1. Conseguir el polígono de una fuente que publique licencia.
 *   2. Verificar que la licencia esté en `LICENCIAS_ADMITIDAS`.
 *   3. Cuando el saber es de un pueblo o una comunidad, tener su acuerdo
 *      registrado antes de cargarlo; el polígono es sólo la mitad del permiso.
 *   4. Agregar la entrada acá y pasar el saber a `estado: 'aprobado'` en el
 *      inventario de `_research/`, y regenerar `saberesTerritoriales.ts`.
 *
 * El primero que pasó los cuatro pasos es el Quesungual: es campesino y no de
 * un pueblo originario, así que el paso 3 no aplicaba, y el departamento de
 * Lempira tiene polígono publicado bajo ODbL. Los saberes indígenas de América
 * necesitan el acuerdo antes que el mapa, no después.
 *
 * El segundo es el waterschap neerlandés, y su historia es la advertencia del
 * paso 2. Los tres candidatos europeos estaban marcados
 * `cartografia_oficial_sin_licencia` porque tenían cartografía oficial
 * publicada y se suponía que sólo faltaba mirar la licencia. Mirada de cerca,
 * **ninguno de los tres servía**: las cañadas reales españolas son líneas —un
 * punto no cae "dentro" de una línea— y su licencia es de atribución propia
 * del MITECO; los límites de crofting escoceses no son datos abiertos; y el
 * dataset neerlandés de PDOK, que el relevamiento daba por CC-BY-4.0 leyendo la
 * política general, declara en la ficha del Nationaal Georegister CC BY-NC-ND
 * 4.0: prohíbe cobrar y prohíbe derivar, o sea prohíbe las dos cosas que esta
 * app hace. Se activó igual, pero por la misma vía que el Quesungual:
 * OpenStreetMap bajo ODbL. La lección es la del paso 2 escrita al pie: la
 * licencia que vale es la del conjunto concreto, no la del portal que lo
 * publica.
 */
export const GEOMETRIAS_SABERES: Readonly<Record<string, GeometriaSaber>> = GEOMETRIAS;

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
 * Los saberes que se pueden mostrar como propios del predio. Devuelve `[]` para
 * cualquier punto que no caiga en uno de los polígonos del registro, que hoy es
 * casi todo el planeta.
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
