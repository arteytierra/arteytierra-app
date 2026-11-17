/**
 * Los proyectos ejecutados, en un solo lugar.
 *
 * Antes del 15/11/2026 los mismos seis proyectos estaban escritos **seis
 * veces**: la portada castellana, `/proyectos`, la portada inglesa,
 * `/en/proyectos`, la portada francesa y `/fr/proyectos`. Y las copias no
 * decían lo mismo. El SUM Árbol de Piedra no tenía año en castellano y era
 * «· 2023» en francés; la Casa del Chelo era «9 meses con Marcelo Notta» en
 * castellano y «un taller comunitario con 40 participantes de 5 provincias»
 * en inglés; la Casa Aurea era pircas, quincha, cob y paja apisonada en
 * castellano y «diseño integrado al paisaje productivo de Tay Pichín» en
 * inglés. Ninguno de esos datos de más estaba en otra parte: aparecieron al
 * traducir.
 *
 * Por eso este archivo es el dueño. Todo lo que diga una página sobre un
 * proyecto sale de acá, y **lo que acá no está no se publica**: si falta el
 * año del SUM es porque no lo tenemos, no porque haya que completarlo con
 * algo verosímil.
 *
 * `relato` y `tecnicas` están sólo en castellano porque la ficha completa
 * existe sólo en castellano. Las páginas traducidas usan `resumen[idioma]`.
 */

export type IdiomaFicha = 'es' | 'en' | 'fr';

export interface Proyecto {
  slug: string;
  /** El nombre propio: no se traduce. */
  nombre: string;
  /** Qué trabajo fue, en cada idioma. */
  tipo: Record<IdiomaFicha, string>;
  /** Localidad, provincia, país. */
  lugar: string;
  /** Sólo la localidad, para las tarjetas chicas de la portada. */
  lugarCorto: string;
  /** El año o el rango. Vacío cuando no lo sabemos. */
  anio: string;
  /** Qué hicimos nosotros, en cada idioma. */
  rol: Record<IdiomaFicha, string>;
  /** Las unidades no se traducen. */
  superficie?: string;
  duracion?: Record<IdiomaFicha, string>;
  /** Quién lo encargó o quién lo habita, cuando se puede nombrar. */
  habitan?: string;
  /** Una o dos líneas para las tarjetas, en cada idioma. */
  resumen: Record<IdiomaFicha, string>;
  /** El cuerpo de la ficha, en bloques con título. Castellano. */
  relato: ReadonlyArray<{ titulo: string; texto: string }>;
  tecnicas: readonly string[];
  /** La foto de la tarjeta. Se recorta a 4:3, así que casi cualquiera sirve. */
  portada: string;
  /**
   * La foto de arriba de la ficha, y la que se ve al compartir el link.
   *
   * No es la misma que la tarjeta: el encabezado es una banda apaisada de
   * ancho completo, y una foto vertical de teléfono ahí se estira y se
   * recorta hasta no querer decir nada. `chelo/1.jpg` son 768×1024: en una
   * tarjeta de 4:3 pasa, en una banda de 1440 px de ancho es una mancha.
   * Cuando falta se usa la portada, que es lo correcto para los cinco
   * proyectos cuya tapa ya es apaisada y grande. Hay un test que mide los
   * píxeles del archivo: mínimo 1280 de ancho y nunca más alta que ancha.
   */
  hero?: string;
  fotos: readonly string[];
}

function fotos(carpeta: string, cantidad: number): string[] {
  return Array.from({ length: cantidad }, (_, i) => `/img/proyectos/${carpeta}/${i + 1}.jpg`);
}

export const PROYECTOS: readonly Proyecto[] = [
  {
    slug: 'armonia',
    nombre: 'Proyecto Armonía',
    tipo: {
      es: 'Bioarquitectura + Hidrología',
      en: 'Bioarchitecture + Hydrology',
      fr: 'Bioarchitecture + Hydrologie',
    },
    lugar: 'Capilla del Monte, Córdoba, Argentina',
    lugarCorto: 'Capilla del Monte',
    anio: '2025',
    rol: { es: 'Diseño + Obra', en: 'Design + Build', fr: 'Conception + Chantier' },
    superficie: '104 m² + 37 m²',
    habitan: 'Liliana Gaiarín',
    resumen: {
      es: 'Un hogar bioclimático con vista al Cerro Uritorco, donde el agua se diseñó junto con la casa: terrazas, reservorios, bosque comestible y biojardineras.',
      en: 'A bioclimatic home looking out at Cerro Uritorco, where the water was designed together with the house: terraces, reservoirs, an edible forest and planted filter beds.',
      fr: "Un foyer bioclimatique avec vue sur le Cerro Uritorco, où l'eau a été conçue avec la maison : terrasses, réservoirs, forêt comestible et biojardinières.",
    },
    relato: [
      {
        titulo: 'El lugar',
        texto: 'Capilla del Monte, con la casa puesta de cara al Cerro Uritorco.',
      },
      {
        titulo: 'La casa',
        texto: 'Arquitectura bioclimática y geometría sagrada: la planta se traza sobre dos rectángulos áureos y una curva Fibonacci. Los muros son de adobe y el invernadero trabaja como sistema pasivo de calefacción y refrigeración. Tres de las cubiertas están vegetalizadas.',
      },
      {
        titulo: 'El agua',
        texto: 'El diseño hidrológico se resolvió con la casa y no después: terrazas, reservorios, bosque comestible y biojardineras.',
      },
    ],
    tecnicas: [
      'Adobe',
      'Cubiertas vegetalizadas',
      'Invernadero como sistema pasivo',
      'Terrazas',
      'Reservorios',
      'Biojardineras',
      'Bosque comestible',
    ],
    portada: '/img/proyectos/armonia/1.jpg',
    // Eran treinta hasta el 15/11/2026, y la 29 era la 6 otra vez: el mismo
    // archivo, byte por byte, con otro nombre, así que la galería mostraba la
    // misma foto dos veces. Se borró y la 30 pasó a ser la 29.
    fotos: fotos('armonia', 29),
  },
  {
    slug: 'alihuen',
    nombre: 'Casa Alihuen',
    tipo: { es: 'Bioarquitectura', en: 'Bioarchitecture', fr: 'Bioarchitecture' },
    lugar: 'Santa Isabel, Córdoba, Argentina',
    lugarCorto: 'Santa Isabel',
    anio: '2024',
    rol: { es: 'Diseño + Obra', en: 'Design + Build', fr: 'Conception + Chantier' },
    duracion: { es: '9 meses', en: '9 months', fr: '9 mois' },
    habitan: 'Silvia y Alejandro',
    resumen: {
      es: 'Una casa hexagonal dentro de una reserva de bosque nativo del valle de Punilla, con biofiltros para toda el agua que sale y techos vivos que se riegan solos.',
      en: 'A hexagonal house inside a native-forest reserve in the Punilla valley, with biofilters for every drop of water that leaves it and living roofs that water themselves.',
      fr: "Une maison hexagonale dans une réserve de forêt indigène de la vallée de Punilla, avec des biofiltres pour toute l'eau qui en sort et des toitures vivantes à auto-arrosage.",
    },
    relato: [
      {
        titulo: 'El lugar',
        texto: 'El predio es una reserva de bosque nativo del valle de Punilla, en Santa Isabel.',
      },
      {
        titulo: 'La casa',
        texto: 'Geometría hexagonal trazada sobre una espiral de Fibonacci. Muros de adobe, revoques de barro y cal, e interiores terminados con estucos tipo tadelakt.',
      },
      {
        titulo: 'Los sistemas',
        texto: 'Paneles solares para la electricidad; biofiltros para las aguas grises y para las negras; techos vivos con autoriego e infiltración de las aguas pluviales.',
      },
    ],
    tecnicas: [
      'Adobe',
      'Revoques de barro y cal',
      'Estucos tipo tadelakt',
      'Techos vivos con autoriego',
      'Biofiltros de aguas grises y negras',
      'Paneles solares',
    ],
    portada: '/img/proyectos/alihuen/12.jpg',
    fotos: fotos('alihuen', 14),
  },
  {
    slug: 'sol',
    nombre: 'Casa del Sol',
    tipo: { es: 'Bioarquitectura', en: 'Bioarchitecture', fr: 'Bioarchitecture' },
    lugar: 'Santa Isabel, Córdoba, Argentina',
    lugarCorto: 'Santa Isabel',
    anio: '2023',
    rol: { es: 'Diseño + Obra', en: 'Design + Build', fr: 'Conception + Chantier' },
    habitan: 'Susana e hijos',
    resumen: {
      es: 'Dos plantas trazadas sobre el espiral de Fibonacci —adobe abajo, quincha reforzada arriba— construidas con voluntariado y talleres abiertos.',
      en: 'Two floors laid out on the Fibonacci spiral — adobe below, reinforced quincha above — built with volunteers and open workshops.',
      fr: 'Deux niveaux tracés sur la spirale de Fibonacci — adobe en bas, quincha renforcée en haut — construits avec des bénévoles et des ateliers ouverts.',
    },
    relato: [
      {
        titulo: 'La casa',
        texto: 'Diseñada a partir del espiral de Fibonacci. En planta baja, la sala-cocina-comedor y el baño, en muros de adobe. En planta alta, la habitación en quincha reforzada, que es lo que le da resistencia sísmica.',
      },
      {
        titulo: 'Las cubiertas',
        texto: 'Techos vivos sobre paraboloides hiperbólicos.',
      },
      {
        titulo: 'El clima',
        texto: 'Ventilación cruzada y orientación estratégica.',
      },
      {
        titulo: 'La obra',
        texto: 'Se construyó con voluntariado y talleres abiertos.',
      },
    ],
    tecnicas: [
      'Adobe',
      'Quincha reforzada',
      'Paraboloides hiperbólicos',
      'Techos vivos',
      'Ventilación cruzada',
      'Construcción participativa',
    ],
    portada: '/img/proyectos/sol/1.jpg',
    fotos: fotos('sol', 23),
  },
  {
    slug: 'aurea',
    nombre: 'Casa Aurea',
    tipo: { es: 'Bioarquitectura', en: 'Bioarchitecture', fr: 'Bioarchitecture' },
    lugar: 'San Marcos Sierras, Córdoba, Argentina',
    lugarCorto: 'San Marcos Sierras',
    anio: '2022–2026',
    rol: { es: 'Diseño + Obra', en: 'Design + Build', fr: 'Conception + Chantier' },
    resumen: {
      es: 'Un proceso largo en San Marcos Sierras: pircas de piedra, quincha, cob y paja apisonada en una misma casa.',
      en: 'A long process in San Marcos Sierras: dry-stone pircas, quincha, cob and rammed straw in a single house.',
      fr: 'Un processus long à San Marcos Sierras : pircas en pierre sèche, quincha, cob et paille damée dans une même maison.',
    },
    relato: [
      {
        titulo: 'El proceso',
        texto: 'Una vivienda de proceso largo, diseñada desde cero: del análisis del sitio a las terminaciones.',
      },
      {
        titulo: 'Las técnicas',
        texto: 'Combina pircas de piedra, quincha, cob y paja apisonada — un compendio de técnicas con tierra cruda integradas al paisaje serrano cordobés.',
      },
    ],
    tecnicas: ['Pircas de piedra', 'Quincha', 'Cob', 'Paja apisonada'],
    portada: '/img/proyectos/aurea/1.jpg',
    fotos: fotos('aurea', 10),
  },
  {
    slug: 'chelo',
    nombre: 'La Casa del Chelo',
    tipo: { es: 'Bioarquitectura', en: 'Bioarchitecture', fr: 'Bioarchitecture' },
    lugar: 'María Juana, Santa Fé, Argentina',
    lugarCorto: 'María Juana, Santa Fé',
    anio: '2019',
    rol: { es: 'Diseño + Obra', en: 'Design + Build', fr: 'Conception + Chantier' },
    duracion: { es: '9 meses', en: '9 months', fr: '9 mois' },
    habitan: 'Marcelo Notta y su familia',
    resumen: {
      es: 'Líneas rectas con apenas dos ángulos rectos, tres techos vivos y toda el agua tratada en el mismo terreno.',
      en: 'Straight lines with only two right angles, three living roofs, and every drop of water treated on site.',
      fr: "Des lignes droites avec seulement deux angles droits, trois toitures vivantes et toute l'eau traitée sur place.",
    },
    relato: [
      {
        titulo: 'El encargo',
        texto: 'El sueño del Chelo: un hogar nuevo para él y su familia.',
      },
      {
        titulo: 'La casa',
        texto: 'Diseñada bajo conceptos de arquitectura bioclimática, geometría sagrada —la flor de la vida— y radiestesia. Pese a sus líneas rectas tiene sólo dos ángulos rectos, y la orientación es solar.',
      },
      {
        titulo: 'Los sistemas',
        texto: 'Tres techos vivos, fitotratamiento de las aguas grises y de las negras, y termotanque solar.',
      },
      {
        titulo: 'La obra',
        texto: 'Se construyó con voluntarios y talleres.',
      },
    ],
    tecnicas: [
      'Geometría sagrada (flor de la vida)',
      'Radiestesia',
      'Techos vivos',
      'Fitotratamiento de aguas grises y negras',
      'Termotanque solar',
      'Construcción participativa',
    ],
    hero: '/img/proyectos/chelo/7.jpg',
    portada: '/img/proyectos/chelo/1.jpg',
    fotos: fotos('chelo', 10),
  },
  {
    slug: 'sum-arbol-piedra',
    nombre: 'SUM Árbol de Piedra',
    tipo: { es: 'Bioarquitectura', en: 'Bioarchitecture', fr: 'Bioarchitecture' },
    lugar: 'San Marcos Sierras, Córdoba, Argentina',
    lugarCorto: 'San Marcos Sierras',
    // Sin año: no lo tenemos. La página francesa decía «2023» y ese dato
    // apareció solo al traducir.
    anio: '',
    rol: { es: 'Diseño + Obra', en: 'Design + Build', fr: 'Conception + Chantier' },
    resumen: {
      es: 'Un salón de usos múltiples de piedra, madera y tierra de la zona, integrado al paisaje serrano.',
      en: 'A community hall of local stone, timber and earth, built into the mountain landscape.',
      fr: 'Une salle polyvalente en pierre, bois et terre du lieu, intégrée au paysage des sierras.',
    },
    relato: [
      {
        titulo: 'El espacio',
        texto: 'Un salón de usos múltiples construido con materiales naturales de la zona. Piedra, madera y tierra se combinan para crear un espacio comunitario integrado al paisaje serrano.',
      },
    ],
    tecnicas: ['Piedra', 'Madera', 'Tierra cruda'],
    portada: '/img/proyectos/sum-arbol-piedra/1.jpg',
    fotos: fotos('sum-arbol-piedra', 6),
  },
];

export const SLUGS_PROYECTOS: readonly string[] = PROYECTOS.map((p) => p.slug);

export function proyectoPorSlug(slug: string): Proyecto | undefined {
  return PROYECTOS.find((p) => p.slug === slug);
}

/** Lugar y año en una línea, como lo escribe el sitio: «Santa Isabel, Córdoba, Argentina · 2024». */
export function lugarYAnio(p: Proyecto): string {
  return p.anio ? `${p.lugar} · ${p.anio}` : p.lugar;
}

/** La foto de arriba de la ficha: la propia si la tiene, y si no la tapa. */
export function fotoDeEncabezado(p: Proyecto): string {
  return p.hero ?? p.portada;
}

/** Lo mismo, corto, para la tarjeta de la portada: «Santa Isabel · 2024». */
export function lugarCortoYAnio(p: Proyecto): string {
  return p.anio ? `${p.lugarCorto} · ${p.anio}` : p.lugarCorto;
}

/**
 * Las etiquetas de la tarjeta: lo que se puede leer de un vistazo.
 *
 * Se arman de los campos que existen, en ese orden, y las que no tenemos no
 * aparecen. Antes estaban tipeadas a mano en cada tarjeta y por eso la Casa
 * Aurea mostraba sus cuatro técnicas como si fueran datos de obra mientras
 * el SUM no mostraba ninguna.
 */
export function etiquetas(p: Proyecto, idioma: IdiomaFicha = 'es'): string[] {
  // `habitan` sale sólo en castellano. No es un dato que se traduzca: son
  // «Susana e hijos» y «Marcelo Notta y su familia», que puestos en una
  // tarjeta en francés quedan como una frase en castellano a medio camino. Y
  // traducirlos obligaría a elegirle el pronombre a gente real.
  return [
    p.rol[idioma],
    p.superficie,
    p.duracion?.[idioma],
    ...(idioma === 'es' && p.habitan ? [p.habitan] : []),
  ].filter((x): x is string => Boolean(x));
}

/**
 * El proyecto anterior y el siguiente, en círculo.
 *
 * Una ficha sin salida es un callejón: de la última se vuelve a la primera,
 * así que no queda nunca un botón muerto.
 */
export function vecinos(slug: string): { anterior: Proyecto; siguiente: Proyecto } | null {
  const i = PROYECTOS.findIndex((p) => p.slug === slug);
  if (i === -1) return null;
  const total = PROYECTOS.length;
  return {
    anterior: PROYECTOS[(i - 1 + total) % total]!,
    siguiente: PROYECTOS[(i + 1) % total]!,
  };
}
