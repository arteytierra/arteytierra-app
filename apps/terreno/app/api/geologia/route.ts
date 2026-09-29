import { SITE_ORIGIN } from '@/lib/http';
import { cacheGet, cacheSet } from '@/lib/db/cache';
import { requierePlan } from '@/lib/auth/apiGuard';
import {
  ORDEN_ESCALA, familiaDeLitologias, familiaDeTipos,
  type EscalaMapa, type RocaMadre,
} from '@/lib/rocaMadre';

/**
 * Roca de base del predio — Macrostrat, compilación de mapas geológicos.
 *
 * Sin clave. La API declara CC-BY 4.0 en el campo `license` de cada respuesta,
 * así que se puede usar comercialmente atribuyendo; se atribuye a Macrostrat y
 * al mapa del que salió la unidad, que son dos obras distintas.
 *
 * ── Por qué este proxy no es un pasamanos ───────────────────────────────────
 *
 * Macrostrat puede devolver **varias unidades para el mismo punto**, una por
 * cada mapa que lo cubre, y no vienen ordenadas. En Iowa devuelve cuatro: el
 * mapa estatal, el mundial, el de Norteamérica y una compilación federal. Elegir
 * la primera sería elegir al azar entre un mapa de 42 km² por polígono y uno de
 * 16.000.
 *
 * Así que el proxy ordena por escala y se queda con la más detallada, y además
 * **calcula el tamaño del polígono promedio** de ese mapa —el área que cubre
 * dividida por la cantidad de polígonos, dos números que la API publica— para
 * que la pantalla pueda decir de qué está hablando. Sin eso, un dato de escala
 * continental se leería como el dato del campo.
 *
 * Si el punto está en el mar o ningún mapa lo cubre, 404. La geología es una
 * capa que agrega: el análisis de suelo funciona igual sin ella.
 */

const HDRS      = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': SITE_ORIGIN };
const CACHE_TTL = 60 * 60 * 24 * 365; // 1 año — un mapa geológico no cambia
const API       = 'https://macrostrat.org/api/v2';

interface Body { lat?: number; lng?: number }

interface UnidadCruda {
  map_id?:      number;
  source_id?:   number;
  name?:        string;
  strat_name?:  string;
  descrip?:     string;
  liths?:       number[];
  t_age?:       number;
  b_age?:       number;
  best_int_name?: string | null;
  t_int_name?:  string;
  b_int_name?:  string;
}

interface FuenteCruda {
  source_id: number;
  name?:       string;
  authors?:    string;
  ref_year?:   string;
  ref_title?:  string;
  ref_source?: string;
  scale?:      string;
  features?:   number;
  area?:       number;
}

interface LitologiaCruda { lith_id: number; name?: string; type?: string }

/**
 * Las tablas de referencia de Macrostrat, cacheadas en el módulo.
 *
 * Son dos tablas chicas y completamente estáticas —288 mapas fuente y 214
 * litologías— que harían falta en cada consulta. Viven mientras viva la
 * instancia; si la instancia es nueva se piden una vez y listo. Si fallan, la
 * consulta sigue: se pierde la cita del mapa o el nombre de la litología, no el
 * dato.
 */
let FUENTES:    Map<number, FuenteCruda> | null = null;
let LITOLOGIAS: Map<number, { nombre: string; tipo: string }> | null = null;

async function tablaFuentes(): Promise<Map<number, FuenteCruda>> {
  if (FUENTES) return FUENTES;
  const m = new Map<number, FuenteCruda>();
  try {
    const r = await fetch(`${API}/defs/sources?all`, { signal: AbortSignal.timeout(12_000) });
    if (r.ok) {
      const j = await r.json() as { success?: { data?: FuenteCruda[] } };
      for (const f of j.success?.data ?? []) m.set(f.source_id, f);
    }
  } catch { /* se sigue sin la tabla */ }
  // Sólo se cachea si vino con algo: una tabla vacía por un error de red se
  // quedaría pegada para toda la vida de la instancia.
  if (m.size > 0) FUENTES = m;
  return m;
}

async function tablaLitologias(): Promise<Map<number, { nombre: string; tipo: string }>> {
  if (LITOLOGIAS) return LITOLOGIAS;
  const m = new Map<number, { nombre: string; tipo: string }>();
  try {
    const r = await fetch(`${API}/defs/lithologies?all`, { signal: AbortSignal.timeout(12_000) });
    if (r.ok) {
      const j = await r.json() as { success?: { data?: LitologiaCruda[] } };
      for (const l of j.success?.data ?? []) {
        if (l.name) m.set(l.lith_id, { nombre: l.name, tipo: l.type ?? '' });
      }
    }
  } catch { /* se sigue sin la tabla */ }
  if (m.size > 0) LITOLOGIAS = m;
  return m;
}

function esEscala(s: string | undefined): s is EscalaMapa {
  return s === 'large' || s === 'medium' || s === 'small' || s === 'tiny';
}

export async function POST(req: Request) {
  const bloqueo = await requierePlan('analisis.suelo');
  if (bloqueo) return bloqueo;

  let body: Body;
  try { body = await req.json() as Body; } catch { return err('JSON inválido', 400); }

  const lat = Number(body.lat), lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return err('Faltan lat/lng.', 400);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return err('Coordenadas fuera de rango.', 400);

  // Dos decimales (~1 km): incluso el mapa más detallado tiene polígonos más
  // grandes que eso, así que la vecindad comparte unidad.
  const dbKey = `geologia:${lat.toFixed(2)},${lng.toFixed(2)}`;
  const dbHit = await cacheGet<{ raw: string }>(dbKey);
  if (dbHit?.raw) return new Response(dbHit.raw, { status: 200, headers: HDRS });

  let crudas: UnidadCruda[];
  try {
    const r = await fetch(`${API}/geologic_units/map?lat=${lat}&lng=${lng}`, {
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) return err(`Macrostrat respondió ${r.status}.`, 502);
    const j = await r.json() as { success?: { data?: UnidadCruda[] } };
    crudas = j.success?.data ?? [];
  } catch {
    return err('No se pudo consultar la geología (Macrostrat no disponible).', 503);
  }

  // Punto en el mar, o sin ningún mapa que lo cubra. No se busca el vecino.
  if (crudas.length === 0) return err('Ningún mapa geológico cubre ese punto.', 404);

  const fuentes = await tablaFuentes();

  // La más detallada gana. Sin tabla de fuentes no hay con qué ordenar, y
  // entonces se toma la primera, que es lo que había antes de poder elegir.
  let elegida = crudas[0]!;
  let fuente: FuenteCruda | undefined = fuentes.get(elegida.source_id ?? -1);
  if (fuentes.size > 0) {
    let mejorRango = Number.POSITIVE_INFINITY;
    for (const u of crudas) {
      const f = fuentes.get(u.source_id ?? -1);
      const rango = esEscala(f?.scale) ? ORDEN_ESCALA.indexOf(f.scale) : Number.POSITIVE_INFINITY;
      if (rango < mejorRango) { mejorRango = rango; elegida = u; fuente = f; }
    }
  }

  const litos = await tablaLitologias();
  const detalle = (elegida.liths ?? [])
    .map(id => litos.get(id))
    .filter((x): x is { nombre: string; tipo: string } => !!x);
  const litologias = detalle.map(l => l.nombre);

  // Área del polígono promedio: lo que permite decir si el mapa habla del predio
  // o de una región. `area` viene en km² (verificado: Iowa da 145.746, que es
  // exactamente la superficie del estado).
  const poligono_km2 =
    fuente?.area && fuente?.features && fuente.features > 0
      ? Math.round(fuente.area / fuente.features)
      : null;

  // Sin escala declarada se asume la más gruesa, que es la que obliga a la
  // pantalla a ser más prudente. El default de un dato que decide cuánta
  // confianza mostrar tiene que ser el conservador.
  const escala: EscalaMapa = esEscala(fuente?.scale) ? fuente.scale : 'tiny';

  const cita = [
    fuente?.authors,
    fuente?.ref_year ? `(${fuente.ref_year})` : null,
    fuente?.ref_title,
    fuente?.ref_source,
  ].filter(Boolean).join('. ');

  const roca: RocaMadre = {
    unidad:      elegida.name?.trim() || 'Unidad sin nombre en el mapa',
    formacion:   elegida.strat_name?.trim() || null,
    litologias,
    // La familia se resuelve acá y no en el cliente para que viaje dentro del
    // payload cacheado: una sola respuesta, un solo criterio.
    // Primero las palabras, que distinguen lo que el tipo no distingue (un
    // basalto de una riolita); si no enganchan, el tipo que declara la fuente.
    familia:     familiaDeLitologias(litologias) ?? familiaDeTipos(detalle.map(l => l.tipo)),
    edad: {
      desde_ma: Number.isFinite(elegida.b_age) ? elegida.b_age! : null,
      hasta_ma: Number.isFinite(elegida.t_age) ? elegida.t_age! : null,
      periodo:  elegida.best_int_name ?? elegida.b_int_name ?? null,
    },
    descripcion: elegida.descrip?.trim() || null,
    mapa: {
      nombre: fuente?.name?.trim() || 'Mapa no identificado',
      cita:   cita || 'Sin cita en la fuente',
      escala: escala,
      poligono_km2,
    },
  };

  const payload = JSON.stringify(roca);
  await cacheSet(dbKey, { raw: payload }, CACHE_TTL);
  return new Response(payload, { status: 200, headers: HDRS });
}

function err(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HDRS });
}
