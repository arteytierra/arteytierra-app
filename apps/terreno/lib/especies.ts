/**
 * Catálogo de especies productivas, con lo que hace falta para ubicarlas en el
 * calendario de un predio concreto.
 *
 * Por qué existe aparte de `FAMILIAS` en `lib/calendario.ts`. Las familias
 * responden "¿en qué meses se puede sembrar hoja?", que es una pregunta de
 * huerta. No responden "¿qué planto acá y con qué lo asocio?", que es la
 * pregunta de un sistema agroforestal. Para eso hacen falta dos cosas que las
 * familias no tienen: el **rol** de cada especie dentro del sistema —qué planta
 * hace de dosel, cuál da sombra, cuál cubre el suelo, cuál fija nitrógeno— y el
 * requerimiento térmico del ciclo, que es lo que decide si en ese clima la
 * especie llega a cerrar o se queda a mitad de camino.
 *
 * El rol es lo que convierte una lista en un diseño. Un cafetal no es café: es
 * café bajo sombra, con plátano de sombra temporaria mientras el dosel crece, y
 * una leguminosa de cobertura abajo. Las tres especies van en la misma ficha,
 * pero no cumplen la misma función ni se plantan el mismo año.
 *
 * Las fichas de ecosistema (`BiomaFicha.especies`) siguen listando **flora
 * nativa**, que es otra cosa: lo que crece ahí sin que nadie lo plante. Este
 * catálogo lista lo que se cultiva. Se cruzan por clima, no por nombre.
 *
 * Los números son de rango agronómico publicado y sirven para ordenar y
 * descartar, no para programar una siembra: eso se hace con el criterio local.
 */
import type { MesDato } from './clima';
import { MESES } from './clima';

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/**
 * Qué función cumple la especie dentro del sistema, no qué es botánicamente.
 *
 * La misma planta puede tener roles distintos en sistemas distintos —el plátano
 * es cultivo principal en un platanal y sombra temporaria en un cafetal— y en
 * ese caso va dos veces, con dos ids, porque el manejo también es distinto.
 */
export type RolEspecie =
  | 'principal'    // de lo que vive el sistema
  | 'sombra'       // regula luz y temperatura para las de abajo
  | 'asociado'     // acompaña al principal en el mismo estrato
  | 'cobertura'    // tapa el suelo, corta la erosión, guarda humedad
  | 'cerco'        // límite vivo, cortina, refugio
  | 'abono_verde'; // se siembra para incorporarla, no para cosecharla

export const LABEL_ROL: Record<RolEspecie, string> = {
  principal:   'Cultivo principal',
  sombra:      'Sombra',
  asociado:    'Asociado',
  cobertura:   'Cobertura de suelo',
  cerco:       'Cerco vivo / cortina',
  abono_verde: 'Abono verde',
};

/** Orden de lectura: primero de lo que se vive, después lo que lo sostiene. */
export const ORDEN_ROL: RolEspecie[] = [
  'principal', 'asociado', 'sombra', 'cobertura', 'abono_verde', 'cerco',
];

export interface Especie {
  id: string;
  nombre: string;
  cientifico: string;
  rol: RolEspecie;
  /** Perenne = el ciclo no se reinicia todos los años; lo que decide es el
   *  invierno, no la ventana de siembra. */
  perenne: boolean;
  /** Temperatura base de acumulación térmica (°C). */
  tbase_c: number;
  /** GDD que necesita para cerrar el ciclo (anuales) o para producir en el año
   *  (perennes). 0 cuando la especie no está limitada por calor. */
  gdd_ciclo: number;
  /** Por debajo de esta mínima media mensual la especie no pasa (°C). */
  tmin_letal_c: number;
  /** Agua del ciclo completo, en mm. Es contra qué se mide el déficit. */
  agua_mm: number;
  /** Kc medio del ciclo (FAO-56 simplificado), para estimar la ETc. */
  kc: number;
  /** Grupos o clases Köppen donde el cultivo está documentado. Un grupo suelto
   *  ('A', 'C') vale para todas sus clases. */
  koppen: string[];
  /** Para qué sirve en el sistema, en una línea. */
  nota: string;
}

// ─── El catálogo ──────────────────────────────────────────────────────────────
//
// Agrupado por régimen climático de origen. No pretende ser exhaustivo: son las
// especies con las que se arman los sistemas que la app ya nombra en los
// análogos, para que la lista de técnicas tenga plantas concretas debajo.

export const ESPECIES: Especie[] = [
  // ── Trópico húmedo (A) ────────────────────────────────────────────────────
  {
    id: 'cafe', nombre: 'Café arábigo', cientifico: 'Coffea arabica',
    rol: 'principal', perenne: true, tbase_c: 10, gdd_ciclo: 2500,
    tmin_letal_c: 4, agua_mm: 1600, kc: 0.95, koppen: ['Af', 'Am', 'Aw', 'Cwa', 'Cwb', 'Cfa'],
    nota: 'Quiere sombra: a pleno sol produce más años pero se agota antes.',
  },
  {
    id: 'cacao', nombre: 'Cacao', cientifico: 'Theobroma cacao',
    rol: 'principal', perenne: true, tbase_c: 15, gdd_ciclo: 3600,
    tmin_letal_c: 10, agua_mm: 1800, kc: 1.00, koppen: ['Af', 'Am'],
    nota: 'Sotobosque por naturaleza; no tolera sol directo ni estación seca larga.',
  },
  {
    id: 'platano_sombra', nombre: 'Plátano (sombra temporaria)', cientifico: 'Musa x paradisiaca',
    rol: 'sombra', perenne: true, tbase_c: 14, gdd_ciclo: 3200,
    tmin_letal_c: 8, agua_mm: 1800, kc: 1.10, koppen: ['Af', 'Am', 'Aw'],
    nota: 'Da sombra y cosecha desde el primer año mientras el dosel definitivo crece.',
  },
  {
    id: 'platano', nombre: 'Plátano / banano', cientifico: 'Musa x paradisiaca',
    rol: 'principal', perenne: true, tbase_c: 14, gdd_ciclo: 3200,
    tmin_letal_c: 8, agua_mm: 1800, kc: 1.10, koppen: ['Af', 'Am', 'Aw'],
    nota: 'Exige agua pareja todo el año; el viento le rompe la hoja.',
  },
  {
    id: 'inga', nombre: 'Guaba / pacay', cientifico: 'Inga edulis',
    rol: 'sombra', perenne: true, tbase_c: 15, gdd_ciclo: 3000,
    tmin_letal_c: 8, agua_mm: 1500, kc: 0.90, koppen: ['Af', 'Am', 'Aw'],
    nota: 'Sombra permanente que además fija nitrógeno y se poda para mulch.',
  },
  {
    id: 'yuca', nombre: 'Yuca / mandioca', cientifico: 'Manihot esculenta',
    rol: 'principal', perenne: false, tbase_c: 13, gdd_ciclo: 3400,
    tmin_letal_c: 8, agua_mm: 900, kc: 0.85, koppen: ['Af', 'Am', 'Aw', 'Cfa'],
    nota: 'Aguanta suelos pobres y sequía; se cosecha cuando hace falta, no en fecha.',
  },
  {
    id: 'maiz_tropical', nombre: 'Maíz de ciclo corto', cientifico: 'Zea mays',
    rol: 'asociado', perenne: false, tbase_c: 10, gdd_ciclo: 1400,
    tmin_letal_c: 4, agua_mm: 500, kc: 1.15, koppen: ['A', 'Cfa', 'Cwa', 'Cwb'],
    nota: 'Primer piso de la milpa: da el soporte a la trepadora.',
  },
  {
    id: 'poroto_trepador', nombre: 'Poroto trepador', cientifico: 'Phaseolus vulgaris',
    rol: 'asociado', perenne: false, tbase_c: 10, gdd_ciclo: 1100,
    tmin_letal_c: 4, agua_mm: 400, kc: 1.05, koppen: ['A', 'B', 'C'],
    nota: 'Trepa el maíz y le devuelve nitrógeno; la milpa es un sistema, no dos cultivos.',
  },
  {
    id: 'zapallo_milpa', nombre: 'Zapallo de guía', cientifico: 'Cucurbita moschata',
    rol: 'cobertura', perenne: false, tbase_c: 12, gdd_ciclo: 1500,
    tmin_letal_c: 6, agua_mm: 500, kc: 1.00, koppen: ['A', 'B', 'C'],
    nota: 'Tapa el suelo entre las matas: menos maleza y menos evaporación.',
  },
  {
    id: 'canavalia', nombre: 'Canavalia', cientifico: 'Canavalia ensiformis',
    rol: 'abono_verde', perenne: false, tbase_c: 12, gdd_ciclo: 1600,
    tmin_letal_c: 6, agua_mm: 450, kc: 0.90, koppen: ['A', 'Aw', 'Cfa', 'Cwa'],
    nota: 'Leguminosa de verano para incorporar antes de floración.',
  },
  {
    id: 'cana_azucar', nombre: 'Caña de azúcar', cientifico: 'Saccharum officinarum',
    rol: 'principal', perenne: true, tbase_c: 12, gdd_ciclo: 4000,
    tmin_letal_c: 5, agua_mm: 1600, kc: 1.10, koppen: ['Af', 'Am', 'Aw', 'Cfa', 'Cwa'],
    nota: 'Rebrota de soca varios años; el problema no es plantarla sino que la cosecha quemada deja el suelo desnudo.',
  },
  {
    id: 'arroz', nombre: 'Arroz', cientifico: 'Oryza sativa',
    rol: 'principal', perenne: false, tbase_c: 12, gdd_ciclo: 2200,
    tmin_letal_c: 8, agua_mm: 1200, kc: 1.15, koppen: ['Af', 'Am', 'Aw', 'Cfa', 'Cwa'],
    nota: 'De secano en tierra alta o inundado: el consumo de agua lo decide el sistema, no la planta.',
  },
  {
    id: 'maracuya', nombre: 'Maracuyá', cientifico: 'Passiflora edulis',
    rol: 'principal', perenne: true, tbase_c: 13, gdd_ciclo: 2400,
    tmin_letal_c: 3, agua_mm: 1200, kc: 0.95, koppen: ['Af', 'Am', 'Aw', 'Cfa', 'Cwa'],
    nota: 'Trepadora de vida corta: da tres o cuatro años y se replanta; sin espaldera no hay cosecha.',
  },
  {
    id: 'vainilla', nombre: 'Vainilla', cientifico: 'Vanilla planifolia',
    rol: 'asociado', perenne: true, tbase_c: 15, gdd_ciclo: 3200,
    tmin_letal_c: 10, agua_mm: 2000, kc: 0.90, koppen: ['Af', 'Am'],
    nota: 'Trepa un tutor vivo y se poliniza a mano: es cultivo de sotobosque, no de parcela abierta.',
  },
  {
    id: 'nogal_cafetero', nombre: 'Nogal cafetero / laurel', cientifico: 'Cordia alliodora',
    rol: 'sombra', perenne: true, tbase_c: 15, gdd_ciclo: 0,
    tmin_letal_c: 8, agua_mm: 1500, kc: 0.85, koppen: ['Af', 'Am', 'Aw', 'Cfa', 'Cwa', 'Cwb'],
    nota: 'Sombra del cafetal que además se cosecha como madera; se regenera sola de semilla.',
  },
  {
    id: 'pasto_elefante', nombre: 'Pasto elefante', cientifico: 'Cenchrus purpureus',
    rol: 'cobertura', perenne: true, tbase_c: 15, gdd_ciclo: 0,
    tmin_letal_c: 5, agua_mm: 1200, kc: 1.00, koppen: ['Af', 'Am', 'Aw', 'Cfa', 'Cwa'],
    nota: 'Corte y acarreo: mucha biomasa por hectárea para forraje o mulch, a cambio de exigir fertilidad.',
  },
  {
    id: 'crotalaria', nombre: 'Crotalaria', cientifico: 'Crotalaria juncea',
    rol: 'abono_verde', perenne: false, tbase_c: 12, gdd_ciclo: 1500,
    tmin_letal_c: 6, agua_mm: 500, kc: 0.90, koppen: ['A', 'Cfa', 'Cwa', 'BSh'],
    nota: 'Abono verde de verano que además baja la población de nematodos del suelo.',
  },

  // ── Trópico y subtrópico con estación seca (Aw, Cw, BSh) ──────────────────
  {
    id: 'agave', nombre: 'Maguey / agave', cientifico: 'Agave salmiana',
    rol: 'cerco', perenne: true, tbase_c: 10, gdd_ciclo: 0,
    tmin_letal_c: -8, agua_mm: 400, kc: 0.40, koppen: ['BSh', 'BSk', 'BWh', 'Cwb', 'Csa'],
    nota: 'Borde vivo del metepantle: corta el viento, frena la erosión y da aguamiel.',
  },
  {
    id: 'nopal', nombre: 'Nopal', cientifico: 'Opuntia ficus-indica',
    rol: 'asociado', perenne: true, tbase_c: 10, gdd_ciclo: 0,
    tmin_letal_c: -6, agua_mm: 350, kc: 0.35, koppen: ['BSh', 'BSk', 'BWh', 'Csa', 'Cwb'],
    nota: 'Verdura, fruta y forraje de reserva en el año seco.',
  },
  {
    id: 'sorgo', nombre: 'Sorgo', cientifico: 'Sorghum bicolor',
    rol: 'principal', perenne: false, tbase_c: 10, gdd_ciclo: 1800,
    tmin_letal_c: 5, agua_mm: 500, kc: 1.00, koppen: ['Aw', 'BSh', 'BSk', 'Cfa', 'Cwa'],
    nota: 'Donde el maíz se corta por seca, el sorgo todavía cierra ciclo.',
  },
  {
    id: 'mijo', nombre: 'Mijo perla', cientifico: 'Pennisetum glaucum',
    rol: 'principal', perenne: false, tbase_c: 12, gdd_ciclo: 1500,
    tmin_letal_c: 8, agua_mm: 350, kc: 0.95, koppen: ['BSh', 'BWh', 'Aw'],
    nota: 'El cereal de las lluvias cortas: ciclo breve y raíz profunda.',
  },
  {
    id: 'gliricidia', nombre: 'Madre de cacao', cientifico: 'Gliricidia sepium',
    rol: 'cerco', perenne: true, tbase_c: 15, gdd_ciclo: 0,
    tmin_letal_c: 6, agua_mm: 900, kc: 0.80, koppen: ['A', 'BSh', 'Cwa'],
    nota: 'Se planta de estaca, rebrota a la poda y el corte va al suelo como abono.',
  },
  {
    id: 'aguacate', nombre: 'Palta / aguacate', cientifico: 'Persea americana',
    rol: 'principal', perenne: true, tbase_c: 10, gdd_ciclo: 2600,
    tmin_letal_c: -2, agua_mm: 1200, kc: 0.85, koppen: ['Cwb', 'Cwa', 'Cfa', 'Csa', 'Csb', 'Am', 'Aw'],
    nota: 'Raíz superficial que se ahoga: el drenaje decide más que la lluvia.',
  },
  {
    id: 'amaranto', nombre: 'Amaranto / kiwicha', cientifico: 'Amaranthus cruentus',
    rol: 'asociado', perenne: false, tbase_c: 10, gdd_ciclo: 1500,
    tmin_letal_c: 3, agua_mm: 400, kc: 0.85, koppen: ['Cwb', 'Cwa', 'BSh', 'BSk', 'Aw'],
    nota: 'Grano de la milpa de altura: cierra ciclo con poca agua y la hoja se come tierna.',
  },
  {
    id: 'chia', nombre: 'Chía', cientifico: 'Salvia hispanica',
    rol: 'asociado', perenne: false, tbase_c: 10, gdd_ciclo: 1400,
    tmin_letal_c: 4, agua_mm: 450, kc: 0.80, koppen: ['Aw', 'Cwa', 'Cwb', 'BSh'],
    nota: 'Florece por día corto: sembrada fuera de fecha crece mucho y no grana.',
  },
  {
    id: 'chile_seco', nombre: 'Chile / ají de secado', cientifico: 'Capsicum annuum',
    rol: 'principal', perenne: false, tbase_c: 12, gdd_ciclo: 1700,
    tmin_letal_c: 5, agua_mm: 600, kc: 1.00, koppen: ['Aw', 'Cwa', 'Cwb', 'BSh', 'BSk', 'Csa'],
    nota: 'Se seca al sol después de cosechar: pide el final del ciclo sin lluvia.',
  },
  {
    id: 'guandul', nombre: 'Guandul / gandul', cientifico: 'Cajanus cajan',
    rol: 'abono_verde', perenne: true, tbase_c: 12, gdd_ciclo: 2200,
    tmin_letal_c: 2, agua_mm: 600, kc: 0.85, koppen: ['Aw', 'Am', 'BSh', 'Cwa', 'Cfa'],
    nota: 'Arbusto leguminoso que da grano y sombra baja; la raíz rompe el piso duro.',
  },
  {
    id: 'mezquite', nombre: 'Mezquite', cientifico: 'Prosopis laevigata',
    rol: 'sombra', perenne: true, tbase_c: 12, gdd_ciclo: 0,
    tmin_letal_c: -10, agua_mm: 350, kc: 0.45, koppen: ['BSh', 'BSk', 'BWh', 'Cwb'],
    nota: 'El algarrobo del altiplano: sombra, vaina de forraje y nitrógeno donde no llueve.',
  },
  {
    id: 'mistol', nombre: 'Mistol', cientifico: 'Ziziphus mistol',
    rol: 'asociado', perenne: true, tbase_c: 13, gdd_ciclo: 0,
    tmin_letal_c: -6, agua_mm: 400, kc: 0.45, koppen: ['BSh', 'BWh', 'Aw', 'Cfa'],
    nota: 'Fruta de secano del monte chaqueño; se aprovecha en arrope y en harina.',
  },
  {
    id: 'chanar', nombre: 'Chañar', cientifico: 'Geoffroea decorticans',
    rol: 'cerco', perenne: true, tbase_c: 12, gdd_ciclo: 0,
    tmin_letal_c: -10, agua_mm: 300, kc: 0.45, koppen: ['BSh', 'BSk', 'BWh', 'BWk', 'Cfa'],
    nota: 'Rebrota de raíz y arma cortina espinosa; el fruto llega en pleno verano seco.',
  },
  {
    id: 'vetiver', nombre: 'Vetiver', cientifico: 'Chrysopogon zizanioides',
    rol: 'cobertura', perenne: true, tbase_c: 12, gdd_ciclo: 0,
    tmin_letal_c: 0, agua_mm: 800, kc: 0.80, koppen: ['A', 'Cfa', 'Cwa', 'Cwb', 'BSh', 'Csa'],
    nota: 'Barrera viva en curva de nivel: raíz vertical de metros que no compite de costado.',
  },

  // ── Andes tropicales de altura (Cwb, Cfb de montaña, ET) ──────────────────
  //
  // El piso andino entre 1800 y 4000 m no es "templado" ni "tropical": tiene
  // día parejo todo el año y la estación la marca la lluvia, no la temperatura.
  // Los cultivos de acá responden al fotoperíodo corto y a la helada de
  // madrugada, dos cosas que no le pasan a un cultivo templado de la misma
  // media anual.
  {
    id: 'lulo', nombre: 'Lulo / naranjilla', cientifico: 'Solanum quitoense',
    rol: 'principal', perenne: true, tbase_c: 10, gdd_ciclo: 2000,
    tmin_letal_c: 4, agua_mm: 1500, kc: 0.90, koppen: ['Cfb', 'Cwb', 'Cfa', 'Am'],
    nota: 'Quiere media sombra y humedad pareja: a pleno sol se le quema la hoja.',
  },
  {
    id: 'mora_andina', nombre: 'Mora de Castilla', cientifico: 'Rubus glaucus',
    rol: 'principal', perenne: true, tbase_c: 8, gdd_ciclo: 1800,
    tmin_letal_c: -2, agua_mm: 1400, kc: 0.85, koppen: ['Cfb', 'Cwb'],
    nota: 'Se conduce en espaldera y se poda cada año; sin poda se cierra y deja de producir.',
  },
  {
    id: 'uchuva', nombre: 'Uchuva / aguaymanto', cientifico: 'Physalis peruviana',
    rol: 'principal', perenne: true, tbase_c: 8, gdd_ciclo: 1800,
    tmin_letal_c: 0, agua_mm: 900, kc: 0.90, koppen: ['Cfb', 'Cwb', 'Cfa'],
    nota: 'Perenne que conviene manejar como bienal: rinde dos años y después decae.',
  },
  {
    id: 'tomate_arbol', nombre: 'Tomate de árbol', cientifico: 'Solanum betaceum',
    rol: 'asociado', perenne: true, tbase_c: 8, gdd_ciclo: 2000,
    tmin_letal_c: 0, agua_mm: 1200, kc: 0.90, koppen: ['Cfb', 'Cwb', 'Cfa'],
    nota: 'Raíz superficial y copa pesada: sin cortina de viento se tumba cargado.',
  },
  {
    id: 'arracacha', nombre: 'Arracacha', cientifico: 'Arracacia xanthorrhiza',
    rol: 'principal', perenne: false, tbase_c: 8, gdd_ciclo: 2600,
    tmin_letal_c: 2, agua_mm: 900, kc: 0.90, koppen: ['Cfb', 'Cwb', 'Cfa'],
    nota: 'Ciclo de diez a doce meses: ocupa la parcela el año entero.',
  },
  {
    id: 'oca', nombre: 'Oca', cientifico: 'Oxalis tuberosa',
    rol: 'asociado', perenne: false, tbase_c: 5, gdd_ciclo: 1500,
    tmin_letal_c: -2, agua_mm: 500, kc: 0.90, koppen: ['ET', 'Cwb', 'Cwc', 'BSk'],
    nota: 'Tuberiza por día corto, después de la papa: alarga la cosecha del año andino.',
  },
  {
    id: 'ulluco', nombre: 'Ulluco / papa lisa', cientifico: 'Ullucus tuberosus',
    rol: 'asociado', perenne: false, tbase_c: 5, gdd_ciclo: 1400,
    tmin_letal_c: -2, agua_mm: 500, kc: 0.90, koppen: ['ET', 'Cwb', 'Cwc', 'BSk'],
    nota: 'Aguanta la helada mejor que la papa, pero se guarda bastante menos tiempo.',
  },
  {
    id: 'tarwi', nombre: 'Tarwi / chocho', cientifico: 'Lupinus mutabilis',
    rol: 'abono_verde', perenne: false, tbase_c: 5, gdd_ciclo: 1900,
    tmin_letal_c: -3, agua_mm: 450, kc: 0.85, koppen: ['ET', 'Cwb', 'Cwc', 'BSk'],
    nota: 'Fija nitrógeno en altura y además da grano; el amargor se saca lavando, no cocinando.',
  },

  // ── Mediterráneo (Cs) ─────────────────────────────────────────────────────
  {
    id: 'olivo', nombre: 'Olivo', cientifico: 'Olea europaea',
    rol: 'principal', perenne: true, tbase_c: 12, gdd_ciclo: 1800,
    tmin_letal_c: -8, agua_mm: 600, kc: 0.65, koppen: ['Csa', 'Csb', 'BSk', 'BSh'],
    nota: 'Necesita frío de invierno para florecer y aguanta la seca de verano.',
  },
  {
    id: 'vid', nombre: 'Vid', cientifico: 'Vitis vinifera',
    rol: 'principal', perenne: true, tbase_c: 10, gdd_ciclo: 1400,
    tmin_letal_c: -12, agua_mm: 500, kc: 0.60, koppen: ['Csa', 'Csb', 'BSk', 'Cfa', 'Cfb'],
    nota: 'La calidad sale del déficit controlado, no del riego pleno.',
  },
  {
    id: 'almendro', nombre: 'Almendro', cientifico: 'Prunus dulcis',
    rol: 'principal', perenne: true, tbase_c: 7, gdd_ciclo: 1500,
    tmin_letal_c: -10, agua_mm: 700, kc: 0.85, koppen: ['Csa', 'Csb', 'BSk'],
    nota: 'Florece temprano: la helada tardía es el riesgo real, no el frío.',
  },
  {
    id: 'higuera', nombre: 'Higuera', cientifico: 'Ficus carica',
    rol: 'asociado', perenne: true, tbase_c: 10, gdd_ciclo: 1600,
    tmin_letal_c: -9, agua_mm: 550, kc: 0.70, koppen: ['Csa', 'Csb', 'BSk', 'Cfa'],
    nota: 'Se conforma con poco y da sombra de copa baja al ganado.',
  },
  {
    id: 'algarrobo_es', nombre: 'Algarrobo europeo', cientifico: 'Ceratonia siliqua',
    rol: 'cerco', perenne: true, tbase_c: 12, gdd_ciclo: 0,
    tmin_letal_c: -5, agua_mm: 450, kc: 0.55, koppen: ['Csa', 'Csb', 'BSh'],
    nota: 'Cortina de secano y vaina de forraje para el verano sin pasto.',
  },
  {
    id: 'veza', nombre: 'Veza', cientifico: 'Vicia sativa',
    rol: 'abono_verde', perenne: false, tbase_c: 4, gdd_ciclo: 900,
    tmin_letal_c: -8, agua_mm: 300, kc: 0.90, koppen: ['Csa', 'Csb', 'Cfa', 'Cfb', 'BSk'],
    nota: 'Cobertura de invierno bajo frutales: se siega antes del verano seco.',
  },

  // ── Templado húmedo y oceánico (Cf) ───────────────────────────────────────
  {
    id: 'manzano', nombre: 'Manzano', cientifico: 'Malus domestica',
    rol: 'principal', perenne: true, tbase_c: 6, gdd_ciclo: 1300,
    tmin_letal_c: -25, agua_mm: 700, kc: 0.90, koppen: ['Cfb', 'Cfa', 'Dfb', 'Csb'],
    nota: 'Pide horas de frío: en invierno tibio no cuaja aunque el verano sobre.',
  },
  {
    id: 'nogal', nombre: 'Nogal', cientifico: 'Juglans regia',
    rol: 'sombra', perenne: true, tbase_c: 10, gdd_ciclo: 1700,
    tmin_letal_c: -20, agua_mm: 800, kc: 0.85, koppen: ['Cfa', 'Cfb', 'Dfa', 'Dfb', 'Csa'],
    nota: 'Dosel de dehesa y madera; su hoja inhibe a la vecina de abajo.',
  },
  {
    id: 'avellano', nombre: 'Avellano', cientifico: 'Corylus avellana',
    rol: 'asociado', perenne: true, tbase_c: 6, gdd_ciclo: 1100,
    tmin_letal_c: -22, agua_mm: 750, kc: 0.85, koppen: ['Cfb', 'Dfb', 'Cfa'],
    nota: 'Estrato medio de setos productivos; rebrota de cepa para leña.',
  },
  {
    id: 'trigo', nombre: 'Trigo de invierno', cientifico: 'Triticum aestivum',
    rol: 'principal', perenne: false, tbase_c: 0, gdd_ciclo: 2000,
    tmin_letal_c: -15, agua_mm: 450, kc: 0.90, koppen: ['Cfa', 'Cfb', 'Csa', 'Dfa', 'Dfb', 'BSk'],
    nota: 'Se siembra en otoño y usa el agua del invierno; escapa a la seca de verano.',
  },
  {
    id: 'papa', nombre: 'Papa', cientifico: 'Solanum tuberosum',
    rol: 'principal', perenne: false, tbase_c: 7, gdd_ciclo: 1200,
    tmin_letal_c: 0, agua_mm: 500, kc: 1.10, koppen: ['Cfb', 'Cfa', 'Dfb', 'Cwb', 'ET'],
    nota: 'La helada le quema la planta; el tubérculo aguanta si el suelo no congela.',
  },
  {
    id: 'trebol_blanco', nombre: 'Trébol blanco', cientifico: 'Trifolium repens',
    rol: 'cobertura', perenne: true, tbase_c: 5, gdd_ciclo: 0,
    tmin_letal_c: -18, agua_mm: 550, kc: 0.90, koppen: ['Cfb', 'Cfa', 'Dfb'],
    nota: 'Tapiz permanente entre frutales: fija nitrógeno y aguanta el pisoteo.',
  },
  {
    id: 'sauce_mimbre', nombre: 'Sauce mimbre', cientifico: 'Salix viminalis',
    rol: 'cerco', perenne: true, tbase_c: 5, gdd_ciclo: 0,
    tmin_letal_c: -30, agua_mm: 900, kc: 1.10, koppen: ['Cfb', 'Dfb', 'Dfc', 'Cfa'],
    nota: 'Cortina de bajo húmedo; se corta cada año y la vara se usa.',
  },
  {
    id: 'yerba_mate', nombre: 'Yerba mate', cientifico: 'Ilex paraguariensis',
    rol: 'principal', perenne: true, tbase_c: 10, gdd_ciclo: 2400,
    tmin_letal_c: -3, agua_mm: 1600, kc: 0.90, koppen: ['Cfa', 'Cfb', 'Am'],
    nota: 'Nació de sotobosque: bajo dosel rinde menos por planta y el yerbal dura décadas más.',
  },
  {
    id: 'naranjo', nombre: 'Naranjo', cientifico: 'Citrus sinensis',
    rol: 'principal', perenne: true, tbase_c: 13, gdd_ciclo: 2200,
    tmin_letal_c: -4, agua_mm: 900, kc: 0.70, koppen: ['Cfa', 'Csa', 'Cwa', 'Aw', 'BSh'],
    nota: 'La helada arruina la fruta antes de matar el árbol: el bajo frío es el peor lugar del predio.',
  },
  {
    id: 'durazno', nombre: 'Durazno', cientifico: 'Prunus persica',
    rol: 'principal', perenne: true, tbase_c: 7, gdd_ciclo: 1400,
    tmin_letal_c: -18, agua_mm: 700, kc: 0.90, koppen: ['Cfa', 'Cfb', 'Csa', 'Csb', 'BSk', 'Dfb'],
    nota: 'Pide menos frío que el manzano, pero florece antes y por eso se hiela más seguido.',
  },
  {
    id: 'cerezo', nombre: 'Cerezo', cientifico: 'Prunus avium',
    rol: 'principal', perenne: true, tbase_c: 6, gdd_ciclo: 1300,
    tmin_letal_c: -22, agua_mm: 700, kc: 0.90, koppen: ['Csb', 'Cfb', 'Dfb', 'Csa'],
    nota: 'La lluvia sobre la fruta madura la parte: el riesgo es la primavera húmeda, no el invierno.',
  },
  {
    id: 'avellano_chileno', nombre: 'Avellano chileno', cientifico: 'Gevuina avellana',
    rol: 'asociado', perenne: true, tbase_c: 6, gdd_ciclo: 1400,
    tmin_letal_c: -8, agua_mm: 1400, kc: 0.90, koppen: ['Cfb', 'Csb'],
    nota: 'Estrato medio del bosque valdiviano: crece a la sombra del renoval y fructifica en otoño.',
  },
  {
    id: 'avena', nombre: 'Avena', cientifico: 'Avena sativa',
    rol: 'cobertura', perenne: false, tbase_c: 2, gdd_ciclo: 1300,
    tmin_letal_c: -12, agua_mm: 400, kc: 0.90, koppen: ['Cfa', 'Cfb', 'Csb', 'Dfb', 'BSk'],
    nota: 'Cobertura de invierno que se pastorea o se rola: tapa el suelo hasta la siembra de verano.',
  },
  {
    id: 'girasol', nombre: 'Girasol', cientifico: 'Helianthus annuus',
    rol: 'principal', perenne: false, tbase_c: 8, gdd_ciclo: 1600,
    tmin_letal_c: 2, agua_mm: 550, kc: 1.00, koppen: ['Cfa', 'Cfb', 'BSk', 'BSh', 'Dfb'],
    nota: 'Raíz pivotante que busca agua profunda: entra donde el maíz ya no cierra el ciclo.',
  },

  // ── Continental y frío (D, ET) ────────────────────────────────────────────
  {
    id: 'centeno', nombre: 'Centeno', cientifico: 'Secale cereale',
    rol: 'principal', perenne: false, tbase_c: 0, gdd_ciclo: 1700,
    tmin_letal_c: -25, agua_mm: 400, kc: 0.90, koppen: ['Dfb', 'Dfc', 'Cfb', 'BSk'],
    nota: 'El cereal del suelo pobre y el invierno duro; también cobertura de otoño.',
  },
  {
    id: 'cebada', nombre: 'Cebada', cientifico: 'Hordeum vulgare',
    rol: 'principal', perenne: false, tbase_c: 2, gdd_ciclo: 1400,
    tmin_letal_c: -12, agua_mm: 380, kc: 0.90, koppen: ['Dfb', 'Dfc', 'BSk', 'Csa', 'Cfb', 'ET'],
    nota: 'Ciclo más corto que el trigo: entra donde el verano es breve.',
  },
  {
    id: 'quinoa', nombre: 'Quinoa', cientifico: 'Chenopodium quinoa',
    rol: 'principal', perenne: false, tbase_c: 3, gdd_ciclo: 1300,
    tmin_letal_c: -4, agua_mm: 350, kc: 0.85, koppen: ['ET', 'BSk', 'Cwb', 'Dfb'],
    nota: 'De altura y de salobre: aguanta lo que casi ningún grano aguanta.',
  },
  {
    id: 'arandano', nombre: 'Arándano', cientifico: 'Vaccinium corymbosum',
    rol: 'principal', perenne: true, tbase_c: 6, gdd_ciclo: 1000,
    tmin_letal_c: -25, agua_mm: 700, kc: 0.90, koppen: ['Dfb', 'Cfb', 'Cfa'],
    nota: 'Quiere suelo ácido y mucho frío invernal; no se adapta al pH alto.',
  },
  {
    id: 'aliso', nombre: 'Aliso', cientifico: 'Alnus glutinosa',
    rol: 'cerco', perenne: true, tbase_c: 5, gdd_ciclo: 0,
    tmin_letal_c: -30, agua_mm: 900, kc: 1.00, koppen: ['Dfb', 'Dfc', 'Cfb'],
    nota: 'Fija nitrógeno y sostiene la barranca del arroyo con la raíz.',
  },

  // ── Árido y semiárido (B) ─────────────────────────────────────────────────
  {
    id: 'datilera', nombre: 'Palmera datilera', cientifico: 'Phoenix dactylifera',
    rol: 'sombra', perenne: true, tbase_c: 12, gdd_ciclo: 4000,
    tmin_letal_c: -5, agua_mm: 1800, kc: 0.95, koppen: ['BWh', 'BSh'],
    nota: 'Dosel del oasis: los pies en el agua, la cabeza en el fuego del sol.',
  },
  {
    id: 'granado', nombre: 'Granado', cientifico: 'Punica granatum',
    rol: 'asociado', perenne: true, tbase_c: 10, gdd_ciclo: 1700,
    tmin_letal_c: -10, agua_mm: 600, kc: 0.75, koppen: ['BWh', 'BSh', 'BSk', 'Csa'],
    nota: 'Segundo estrato del oasis, bajo la palmera y sobre la huerta.',
  },
  {
    id: 'alfalfa', nombre: 'Alfalfa', cientifico: 'Medicago sativa',
    rol: 'cobertura', perenne: true, tbase_c: 5, gdd_ciclo: 0,
    tmin_letal_c: -20, agua_mm: 1000, kc: 0.95, koppen: ['BSk', 'BWk', 'Csa', 'Cfa', 'Dfb'],
    nota: 'Raíz profunda y forraje de corte; en árido sólo cierra con riego.',
  },
  {
    id: 'algarrobo_ar', nombre: 'Algarrobo criollo', cientifico: 'Prosopis alba',
    rol: 'sombra', perenne: true, tbase_c: 12, gdd_ciclo: 0,
    tmin_letal_c: -8, agua_mm: 400, kc: 0.50, koppen: ['BSh', 'BWh', 'BSk', 'Aw'],
    nota: 'Sombra, vaina, madera y nitrógeno en el monte seco.',
  },
  {
    id: 'cebolla', nombre: 'Cebolla', cientifico: 'Allium cepa',
    rol: 'principal', perenne: false, tbase_c: 5, gdd_ciclo: 1400,
    tmin_letal_c: -4, agua_mm: 450, kc: 1.00, koppen: ['BSk', 'BWh', 'Csa', 'Cfa', 'Cfb'],
    nota: 'Bulbifica por largo del día: la variedad tiene que ser de la latitud.',
  },
  {
    id: 'tamarugo', nombre: 'Tamarugo', cientifico: 'Prosopis tamarugo',
    rol: 'sombra', perenne: true, tbase_c: 12, gdd_ciclo: 0,
    tmin_letal_c: -4, agua_mm: 200, kc: 0.35, koppen: ['BWh', 'BWk', 'BSh', 'BSk'],
    nota: 'Vive de la napa salina, no de la lluvia: se planta donde hay agua abajo, no donde llueve.',
  },
];

/** Índice por id, para resolver las listas de las fichas. */
export const ESPECIES_POR_ID: Record<string, Especie> =
  Object.fromEntries(ESPECIES.map(e => [e.id, e]));

/**
 * Especies documentadas para una clase Köppen.
 *
 * Acepta la clase entera (`Csb`) y también el grupo suelto (`C`): una especie
 * declarada en `['A']` vale para `Af`, `Am` y `Aw`. Es lo que permite que el
 * catálogo cubra el mundo sin escribir las 30 clases en cada entrada.
 */
export function especiesDeKoppen(codigo: string): Especie[] {
  const grupo = codigo[0] ?? '';
  return ESPECIES.filter(e => e.koppen.some(k => k === codigo || k === grupo));
}

/** Resuelve ids de ficha a especies, salteando los que no existen. */
export function resolverEspecies(ids: string[]): Especie[] {
  return ids.map(id => ESPECIES_POR_ID[id]).filter((e): e is Especie => !!e);
}

// ─── Evaluación de una especie contra el clima del predio ────────────────────

export interface EvaluacionEspecie {
  especie: Especie;
  /** Meses en los que se puede iniciar el ciclo y llegar a cerrarlo. Vacío en
   *  perennes: ahí la pregunta no es cuándo sembrar sino si el sitio la banca. */
  siembra: number[];
  /** La especie cierra su ciclo (anual) o pasa el año (perenne) en este clima. */
  viable: boolean;
  /** Meses que tarda el ciclo desde la mejor fecha de inicio. 0 en perennes. */
  duracion_meses: number;
  /** Agua de riego que haría falta sobre la lluvia, en mm del ciclo. */
  riego_mm: number;
  /** Por qué sí o por qué no, en una línea. Es lo que se muestra. */
  razon: string;
}

/**
 * Cruza una especie con los doce meses del predio.
 *
 * El criterio es el que usa cualquiera que planifica una temporada, en orden:
 * primero si la planta sobrevive —la mínima del mes contra su letal—, después
 * si junta el calor que su ciclo pide, y recién al final cuánta agua falta. Un
 * cultivo que no sobrevive no se salva con riego, así que el agua se calcula
 * pero no decide.
 */
export function evaluarEspecie(esp: Especie, meses: MesDato[]): EvaluacionEspecie {
  if (meses.length < 12) {
    return { especie: esp, siembra: [], viable: false, duracion_meses: 0, riego_mm: 0,
      razon: 'Faltan datos de clima para evaluarla.' };
  }

  const deficitMes = (m: MesDato) => Math.max(0, m.etp_mm * esp.kc - m.precip_mm);

  // ── Perennes: manda el mes más frío, no la fecha de siembra ──────────────
  if (esp.perenne) {
    const masFrio = meses.reduce((b, m) => m.tmin_c < b.tmin_c ? m : b, meses[0]!);
    const gddAnual = meses.reduce((a, m, i) => a + Math.max(0, m.tmean_c - esp.tbase_c) * (DIAS_MES[i] ?? 30), 0);
    const deficit = Math.round(meses.reduce((a, m) => a + deficitMes(m), 0));

    if (masFrio.tmin_c < esp.tmin_letal_c) {
      return { especie: esp, siembra: [], viable: false, duracion_meses: 0, riego_mm: deficit,
        razon: `El invierno es demasiado duro: ${masFrio.tmin_c.toFixed(0)} °C de mínima media contra ${esp.tmin_letal_c} °C que tolera.` };
    }
    if (esp.gdd_ciclo > 0 && gddAnual < esp.gdd_ciclo) {
      return { especie: esp, siembra: [], viable: false, duracion_meses: 0, riego_mm: deficit,
        razon: `Sobrevive el invierno pero no junta calor para producir: ${Math.round(gddAnual)} grados-día al año contra ${esp.gdd_ciclo} que pide.` };
    }
    return { especie: esp, siembra: [], viable: true, duracion_meses: 0, riego_mm: deficit,
      razon: deficit > 0
        ? `Pasa el invierno y junta el calor. Faltan unos ${deficit} mm al año que hay que reponer con riego o cosecha de agua.`
        : 'Pasa el invierno, junta el calor y la lluvia alcanza sin riego.' };
  }

  // ── Anuales: buscar de qué meses se puede arrancar y cerrar ──────────────
  let mejorDuracion = 0;
  let mejorRiego = 0;
  const siembra: number[] = [];

  for (let inicio = 0; inicio < 12; inicio++) {
    let gdd = 0, riego = 0, k = 0, muere = false;
    for (; k < 12; k++) {
      const m = meses[(inicio + k) % 12]!;
      if (m.tmin_c < esp.tmin_letal_c) { muere = true; break; }
      gdd += Math.max(0, m.tmean_c - esp.tbase_c) * (DIAS_MES[(inicio + k) % 12] ?? 30);
      riego += deficitMes(m);
      if (gdd >= esp.gdd_ciclo) { k++; break; }
    }
    if (muere || gdd < esp.gdd_ciclo) continue;
    siembra.push(inicio);
    if (mejorDuracion === 0 || k < mejorDuracion) { mejorDuracion = k; mejorRiego = Math.round(riego); }
  }

  if (siembra.length === 0) {
    // Distinguir las dos formas de fallar, que piden decisiones distintas: si
    // sobra frío se cambia la especie, si falta calor se cambia el ciclo.
    const gddLibre = meses.reduce((a, m, i) =>
      m.tmin_c < esp.tmin_letal_c ? a : a + Math.max(0, m.tmean_c - esp.tbase_c) * (DIAS_MES[i] ?? 30), 0);
    return { especie: esp, siembra: [], viable: false, duracion_meses: 0, riego_mm: 0,
      razon: gddLibre === 0
        ? 'No hay ningún mes en que la planta sobreviva a la mínima.'
        : `La ventana sin frío no le alcanza: junta ${Math.round(gddLibre)} grados-día y su ciclo pide ${esp.gdd_ciclo}.` };
  }

  const nombres = siembra.map(i => MESES[i] ?? '').filter(Boolean);
  const ventana = nombres.length >= 11
    ? 'Se puede sembrar en cualquier mes del año.'
    : `Se siembra de ${nombres[0]} en adelante (${nombres.length} ${nombres.length === 1 ? 'mes' : 'meses'} de ventana).`;

  return {
    especie: esp, siembra, viable: true,
    duracion_meses: mejorDuracion, riego_mm: mejorRiego,
    razon: `${ventana} Cierra el ciclo en unos ${mejorDuracion} meses${mejorRiego > 0 ? ` y pide unos ${mejorRiego} mm de riego` : ' con la lluvia sola'}.`,
  };
}

// ─── El bloque que se muestra: qué plantar acá ───────────────────────────────

export interface BloqueEcorregion {
  /** De dónde salió la lista: la ficha del ecosistema o el clima solo. */
  origen: 'ficha' | 'koppen';
  /** Todas las evaluadas, ordenadas por rol y con las viables primero. */
  evaluadas: EvaluacionEspecie[];
  /** Agrupadas por rol, ya ordenadas, para armar el diseño de un vistazo. */
  porRol: Array<{ rol: RolEspecie; especies: EvaluacionEspecie[] }>;
  viables: number;
  aviso: string | null;
}

/**
 * Qué se planta en este predio y con qué se acompaña.
 *
 * Recibe los ids que declara la ficha del ecosistema cuando los tiene; si no
 * los tiene, cae al catálogo por clase Köppen. Esa caída importa: sin ella, un
 * predio de una ecorregión todavía sin curar se quedaría con la sección vacía,
 * cuando el clima ya alcanza para decir algo cierto.
 */
export function bloqueEcorregion(
  meses: MesDato[],
  koppenCodigo: string,
  idsFicha?: string[],
): BloqueEcorregion | null {
  const deFicha = idsFicha?.length ? resolverEspecies(idsFicha) : [];
  const lista = deFicha.length ? deFicha : especiesDeKoppen(koppenCodigo);
  if (lista.length === 0) return null;

  const evaluadas = lista.map(e => evaluarEspecie(e, meses));
  const rango = (e: EvaluacionEspecie) => ORDEN_ROL.indexOf(e.especie.rol);
  evaluadas.sort((a, b) =>
    Number(b.viable) - Number(a.viable) || rango(a) - rango(b) ||
    a.especie.nombre.localeCompare(b.especie.nombre, 'es'));

  const porRol = ORDEN_ROL
    .map(rol => ({ rol, especies: evaluadas.filter(e => e.especie.rol === rol) }))
    .filter(g => g.especies.length > 0);

  const viables = evaluadas.filter(e => e.viable).length;

  return {
    origen: deFicha.length ? 'ficha' : 'koppen',
    evaluadas, porRol, viables,
    aviso: deFicha.length
      ? null
      : 'La ecorregión todavía no tiene su lista de cultivos curada: estas especies salen del catálogo por clase climática, que es más grueso. Verificá con quien cultive en tu zona.',
  };
}
