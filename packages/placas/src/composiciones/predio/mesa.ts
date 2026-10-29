/**
 * El dato del ENCARGO 03, el de la secuencia de la mesa de trabajo.
 *
 * Sale de `generado/cuetiepa-mesa.json`, que escribe
 * `apps/terreno/scripts/datos-mesa.ts` llamando a las funciones del repo
 * —`buscarSitiosRepresa`, `vasoDesdeMuro`, `prepararEmplazamiento`,
 * `evaluarEmplazamiento`, `accesibilidad`, `velocidadTobler`— sobre el mismo
 * predio y la misma grilla que el encargo 02. Acá no se calcula nada: se lee.
 *
 * Va aparte de `datos.ts` porque las diez piezas del encargo 02 están
 * aprobadas sobre aquel archivo y aquel archivo no se vuelve a tocar.
 *
 * ── Lo que NO hay acá, y por qué ───────────────────────────────────────────
 *
 * No hay viviendas, ni potreros, ni un bosque comestible. El acto 04 del
 * encargo pedía «emplazamiento, caminos y zonificación por frecuencia de
 * visita» y nombraba `zonificacion.ts`; leído el código de la app:
 *
 *   · `emplazamiento.ts` sí calcula, y lo que calcula es qué celdas el terreno
 *     RECHAZA y por qué regla. No dice dónde va la casa: dice dónde no va.
 *   · `caminos.ts` no calcula un camino: mide el que dibuja el usuario. Lo que
 *     sí existe es el corredor de `accesibilidad()`, que es además el objeto
 *     con el que se decide la exclusión «Sin camino posible».
 *   · `zonificacion.ts` no calcula las zonas de Mollison: define categorías y
 *     mide polígonos dibujados. Lo que la app sí calcula es el tiempo de
 *     caminata sobre el relieve (Tobler), y su propia constante
 *     `EL_ANILLO_NO_ES_LA_ZONA` dice que lo que define la zona es la frecuencia
 *     de visita y que «el terreno decide dónde se puede ir seguido».
 *
 * Así que el acto 04 muestra las tres cosas que la app de verdad resuelve, y
 * ninguna de las tres es un dibujo de un proyecto que el cliente no declaró.
 */
import crudo from '../../../generado/cuetiepa-mesa.json';

type Par = [number, number];
/**
 * Las capas del archivo son todas colecciones de polígonos: el shader, el
 * corredor y las bandas se arman juntando por fila las celdas contiguas del
 * mismo valor, que es la misma técnica del shader vectorial de la portada.
 */
type Coleccion = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, number | string>;
    geometry: { type: 'Polygon'; coordinates: Par[][] };
  }>;
};

export interface DatosMesa {
  predio: string;
  generado: string;
  bbox: [number, number, number, number];
  cols: number; rows: number;
  procedencia: {
    fuente: string; nombre_completo: string; resolucion_m: number;
    lectura: string; remuestreo: string; advertencia: string; generado: string;
  };
  represa: {
    cierre: Par;
    cota_cauce_m: number;
    altura_m: number;
    ancho_muro_m: number;
    muro: [Par, Par];
    muro_ancho_reconstruido_m: number;
    muro_celdas: number;
    nivel_disenio_m: number;
    area_ha: number;
    volumen_agua_m3: number;
    volumen_muro_m3: number;
    eficiencia: number;
    vaso: {
      cota_fondo_m: number; cota_eje_min_m: number; cota_derrame_m: number;
      tipo_tope: string; derrame_por_estribo: boolean; punto_derrame: Par | null;
      volumen_m3: number | null; area_ha: number | null; prof_en_muro_m: number | null;
      advertencias: string[]; fuente: string;
    } | null;
    certificado_por_vaso: boolean;
    espejo: Coleccion;
  };
  emplazamiento: {
    acceso: Par;
    edificio: { ancho_m: number; largo_m: number };
    resumen: {
      celdas_libres: number; celdas_total: number;
      superficie_libre_ha: number; superficie_total_ha: number;
      por_regla: Array<{ regla: string; titulo: string; celdas: number; pct: number }>;
    };
    admite: Coleccion;
  };
  caminos: {
    acceso: Par; limite_pct: number;
    celdas_dentro: number; celdas_en_el_halo: number;
    ha_dentro: number; pct_del_predio: number;
    largo_max_m: number; pasos: number;
    criterio: string;
    corredor: Coleccion;
  };
  caminata: {
    centro: Par; cortes_min: number[]; max_redondo_min: number; modelo: string;
    costos: Array<{
      corte_min: number; zona: number; frecuencia: string;
      viajes_anio: [number, number]; horas_anio: [number, number];
      celdas: number; nota: string;
    }>;
    bandas: Coleccion;
  };
}

export const M = crudo as unknown as DatosMesa;

/** El espejo de la represa elegida, como lo publica `buscarSitiosRepresa`. */
export const GEO_ESPEJO_MESA = M.represa.espejo;

/**
 * El eje del muro, como línea.
 *
 * Va con `lineMetrics` para poder dibujarlo de a poco, que es lo que lo
 * convierte en una obra que se levanta y no en un palito que aparece.
 */
export const GEO_MURO = {
  type: 'FeatureCollection' as const,
  features: [{
    type: 'Feature' as const,
    properties: { ancho_m: M.represa.ancho_muro_m, altura_m: M.represa.altura_m },
    geometry: { type: 'LineString' as const, coordinates: M.represa.muro },
  }],
};

/** El cierre y el punto de derrame, como puntos sueltos para el pulso. */
export const GEO_CIERRE = {
  type: 'FeatureCollection' as const,
  features: [{
    type: 'Feature' as const, properties: {},
    geometry: { type: 'Point' as const, coordinates: M.represa.cierre },
  }],
};

export const GEO_DERRAME = {
  type: 'FeatureCollection' as const,
  features: M.represa.vaso?.punto_derrame
    ? [{
        type: 'Feature' as const, properties: {},
        geometry: { type: 'Point' as const, coordinates: M.represa.vaso.punto_derrame },
      }]
    : [],
};

/** Las celdas que el terreno admite para una construcción: 6,6 ha de 428,4. */
export const GEO_ADMITE = M.emplazamiento.admite;

/**
 * El corredor que el terreno deja para llegar, con `t` de 0 a 7 según la
 * distancia al acceso. Encenderlo por `t` es recorrerlo desde la tranquera.
 */
export const GEO_CORREDOR = M.caminos.corredor;

/** Las isócronas de ida y vuelta a pie, con `b` = la banda y `c` = su color. */
export const GEO_CAMINATA = M.caminata.bandas;

/** El acceso al predio: la celda de borde más baja, que es la regla de la app. */
export const GEO_ACCESO = {
  type: 'FeatureCollection' as const,
  features: [{
    type: 'Feature' as const, properties: {},
    geometry: { type: 'Point' as const, coordinates: M.caminos.acceso },
  }],
};
