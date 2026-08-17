export type CourseKind = 'presencial' | 'online-live' | 'online-async' | 'inmersion';

export interface CourseModule {
  num: string;
  title: string;
  items: string[];
  teoria?: string;
  practica?: string;
  date?: string;
  nota?: string;
  highlighted?: boolean;
}

export interface CourseOption {
  id: string;
  label: string;
  precio: string;
  precioAlt?: string;
  includes: string[];
  highlighted?: boolean;
}

export interface Facilitador {
  name: string;
  role: string;
  bio: string;
  img?: string;
}

export interface CourseData {
  slug: string;
  kind: CourseKind;
  badge: string;
  name: string;
  subtitle: string;
  heroImg: string;
  galeria: string[];
  tag: string;
  intro: string[];
  datos: { label: string; val: string }[];
  paraQuien?: string[];
  vasASalir?: string[];
  modulos: CourseModule[];
  trabajoFinal?: { icon: string; title: string; items: string[] }[];
  facilitadores: Facilitador[];
  opciones: CourseOption[];
  opcionesNota?: string;
  promoVideoId?: string;
  formCurso: string;
  whatsapp: string;
  mercadopago?: string;
  /** Oculta el botón "Agregar al carrito": inscripción solo por formulario + WhatsApp (cursos con seña / cupo muy chico). */
  sinCarrito?: boolean;
}

/* ── Jonatan bio (shared) ─────────────────────────── */
const JONATAN: Facilitador = {
  name: 'Jonatan Gabriel Palma',
  role: 'Bioarquitectura · Bioconstrucción',
  bio: 'Bioconstructor desde 2010, especializado en técnicas de construcción en tierra ancestrales y modernas, bioclimática, bioarquitectura y radiestesia. Su formación incluye el aporte de docentes referentes como Jorge Belanko, Gernot Minke, Marco Arestra y Daniel Smite, entre otrxs maestrxs. Hijo de un carpintero, desde niño aprendió a trabajar con la madera — un oficio que sigue siendo la base de su mirada constructiva. Fundador de Arte y Tierra y de la ecoescuela Tay Pichín en San Marcos Sierras.',
  img: '/img/cursos/vueltatierra/10.jpg',
};

const FABRICIO: Facilitador = {
  name: 'Fabricio Manzoni',
  role: 'Permacultura · Diseño Hidrológico',
  bio: 'Cofundador de Minga Verde, facilitador en Permacultura certificado por la Eco-escuela El Manzano, sede de Universidad Gaia en Chile. Se dedica al diseño, asesoría y consultoría en salud y regeneración de sistemas ecológicos en distintos países. Apasionado del manejo hidrológico, la fertilidad del suelo y los sistemas agroforestales.',
  img: '/img/cursos/vueltatierra/8.jpg',
};

/* ─────────────────────────────────────────────────── */

export const COURSES: Record<string, CourseData> = {

  'formacion-construccion-natural': {
    slug: 'formacion-construccion-natural',
    kind: 'presencial',
    badge: 'Formación intensiva · 2 meses',
    name: 'Formación Integral en Construcción Natural',
    subtitle: 'Dos meses de obra real, de los cimientos al techo. Construimos juntos una cabaña completa en San Marcos Sierras y vos te llevás el oficio en las manos.',
    heroImg: '/img/cursos/bioarquitectura/1.jpg',
    galeria: [
      '/img/cursos/bioarquitectura/3.jpg',
      '/img/cursos/bioarquitectura/7.jpg',
      '/img/cursos/bioarquitectura/9.jpg',
      '/img/cursos/vueltatierra/2.jpg',
      '/img/cursos/bioarquitectura/11.jpg',
      '/img/cursos/bioarquitectura/12.jpeg',
      '/img/cursos/vueltatierra/10.jpg',
      '/img/cursos/mitierramicasa/2.jpg',
    ],
    tag: '21 de septiembre al 30 de noviembre 2026 · San Marcos Sierras · 3 cupos + 2 con experiencia (50% dto)',
    intro: [
      'Volvemos a abrir nuestra formación más profunda: dos meses viviendo una obra real de principio a fin. En San Marcos Sierras vamos a construir una cabaña de 25 m² completa —de los cimientos al techo— como primera intervención dentro de un predio que ya cuenta con su masterplan. Vos aprendés construyéndola.',
      'No es un taller de una técnica suelta: es el ciclo entero de una vivienda natural. Estructuras en madera, muros de adobe y quincha alivianada, techos vivos y de chapa, revoques de barro y de cal, biofiltros para aguas grises y negras, cosecha de agua de lluvia e instalación de servicios hasta el fin de obra.',
      'La práctica diaria en obra se complementa con teoría en campo, el curso grabado «Mi Tierra, Mi Casa», asesorías de diseño colectivas cada tres semanas para tu propio proyecto, círculos de proceso mensuales y el acompañamiento de un focalizador personal durante toda la vivencia.',
    ],
    datos: [
      { label: '¿Cuándo?', val: '21 de septiembre al 30 de noviembre 2026 · 2 meses (10 semanas)' },
      { label: '¿Dónde?', val: 'Obra en San Marcos Sierras, Córdoba · Hospedaje en Ecohostel Tay Pichín' },
      { label: 'Modalidad', val: 'Obra real diaria + teoría en campo + acompañamiento' },
      { label: 'Cupos', val: '3 cupos regulares + 2 cupos con 50% de descuento para personas con experiencia previa' },
    ],
    paraQuien: [
      'Estás por construir tu propia casa y querés vivir el proceso completo antes de emprenderlo por tu cuenta.',
      'Querés dedicarte a la bioconstrucción y necesitás horas reales de obra, no solo un taller de fin de semana.',
      'Ya hiciste talleres sueltos y sentís que te falta ver una obra entera, de los cimientos al techo.',
      'Buscás una vivencia transformadora: aprender un oficio noble, en comunidad y en contacto con la tierra.',
    ],
    vasASalir: [
      'Leer un terreno y replantear una obra con criterio propio.',
      'Ejecutar cimientos, estructuras de madera, muros de adobe y quincha alivianada.',
      'Montar techos vivos y de chapa, y aplicar revoques gruesos y finos de barro y de cal.',
      'Resolver el agua de la vivienda: biofiltros de aguas grises y negras, y cosecha de lluvia.',
      'Acompañar y organizar una obra de construcción natural de principio a fin.',
    ],
    modulos: [
      {
        num: 'Fase 01 · Semana 1', title: 'Fundación', date: 'Septiembre',
        teoria: 'Lectura del terreno, replanteo y elección del sistema constructivo. Tipos de fundación y su comportamiento.',
        practica: 'Preparación del terreno, replanteo, cimientos de piedra, encadenados y contrapisos.',
        items: ['Replanteo de obra', 'Cimientos', 'Contrapisos'],
      },
      {
        num: 'Fase 02 · Semanas 2–3', title: 'Estructura en madera', date: 'Septiembre — Octubre',
        teoria: 'Nociones de estructura: cargas, uniones y arriostramiento. La madera como base de la mirada constructiva.',
        practica: 'Montaje de la estructura portante en madera y del esqueleto del techo.',
        items: ['Estructura portante', 'Uniones', 'Esqueleto de techo'],
      },
      {
        num: 'Fase 03 · Semanas 4–5', title: 'Muros', date: 'Octubre',
        teoria: 'Comportamiento de tierra, paja y madera. Diseño bioclimático y ubicación de aberturas.',
        practica: 'Muros de adobe y quincha alivianada. Colocación de aberturas.',
        items: ['Adobe', 'Quincha alivianada', 'Colocación de aberturas'],
      },
      {
        num: 'Fase 04 · Semanas 6–7', title: 'Techos', date: 'Octubre — Noviembre',
        teoria: 'Cargas, pendientes e impermeabilización. Tipos de techo vivo y sus sustratos.',
        practica: 'Techo de chapa y montaje de techo vivo con sustrato y drenaje.',
        items: ['Techo de chapa', 'Techo vivo', 'Impermeabilización'],
      },
      {
        num: 'Fase 05 · Semana 8', title: 'Revoques', date: 'Noviembre',
        teoria: 'Ciclo de la cal, mezclas y proporciones según cada zona de la casa.',
        practica: 'Revoques gruesos y finos de barro y de cal.',
        items: ['Grueso de barro y de cal', 'Fino de barro y de cal'],
      },
      {
        num: 'Fase 06 · Semanas 9–10', title: 'Agua, servicios y fin de obra', date: 'Noviembre', highlighted: true,
        teoria: 'El ciclo del agua en la vivienda: biofiltros, cosecha de lluvia y saneamiento ecológico.',
        practica: 'Biofiltros de aguas grises y negras, recolección de lluvia, veredas, instalación de servicios y fin de obra.',
        items: ['Biofiltro de aguas grises y negras', 'Cosecha de lluvia', 'Veredas y servicios', 'Fin de obra'],
      },
    ],
    facilitadores: [
      JONATAN,
      {
        name: 'Equipo de obra Arte y Tierra',
        role: 'Cuadrilla y acompañamiento',
        bio: 'La formación se sostiene sobre una cuadrilla estable que trabaja la obra a diario: Julián Denaday, Ignacio Gómez, Karen Ibarra y Valentín Nonino, junto a Jonatan. Un equipo con oficio que acompaña cada fase del proceso, sumado a los voluntarios del programa de Inmersión Viva que dan vida cotidiana a la obra.',
      },
    ],
    opciones: [
      {
        id: 'completo',
        label: 'Formación completa · 2 meses',
        precio: '$2.000.000 ARS',
        precioAlt: 'USD 1.400',
        includes: [
          'Hospedaje en habitación compartida en Ecohostel Tay Pichín',
          'Alimentación completa durante los dos meses',
          'Certificado de participación',
          'Manual de Diseño Simbiótico (PDF)',
          'Acceso al curso grabado «Mi Tierra, Mi Casa»',
          'Asesorías de diseño colectivas cada 3 semanas',
          'Círculos de proceso mensuales',
          'Acompañamiento con focalizador personal',
        ],
        highlighted: true,
      },
      {
        id: 'con-experiencia',
        label: 'Cupo con experiencia previa · 50% dto',
        precio: '$1.000.000 ARS',
        precioAlt: 'USD 700',
        includes: [
          'Solo 2 cupos — para quienes ya hicieron talleres de bioconstrucción con nosotrxs o tienen experiencia previa comprobable',
          'Mismos beneficios que la formación completa: hospedaje, alimentación, certificado, manual, asesorías y acompañamiento',
        ],
      },
    ],
    opcionesNota: 'Reservás tu lugar con una seña del 50%. 3 cupos regulares + 2 cupos con 50% de descuento para personas con experiencia previa en bioconstrucción — grupo chico para cuidar la profundidad del proceso.',
    sinCarrito: true,
    formCurso: 'Formación Integral en Construcción Natural · 21 sep – 30 nov 2026',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20postularme%20a%20la%20Formaci%C3%B3n%20Integral%20en%20Construcci%C3%B3n%20Natural%20(arranca%20el%2021%20de%20septiembre)',
    mercadopago: 'https://link.mercadopago.com.ar/arteytierra',
  },

  'bioarquitectura': {
    slug: 'bioarquitectura',
    kind: 'presencial',
    badge: 'Intensivo presencial',
    name: 'Bioarquitectura, Construcción y Territorio',
    subtitle: 'Dos días de obra real para aprender técnicas ancestrales de bioconstrucción integradas con diseño bioclimático y ecológico adaptado a territorios semiáridos.',
    heroImg: '/img/cursos/bioarquitectura/1.jpg',
    galeria: [
      '/img/cursos/bioarquitectura/2.jpg',
      '/img/cursos/bioarquitectura/3.jpg',
      '/img/cursos/bioarquitectura/4.jpg',
      '/img/cursos/bioarquitectura/5.jpeg',
      '/img/cursos/bioarquitectura/6.jpeg',
      '/img/cursos/bioarquitectura/7.jpg',
      '/img/cursos/bioarquitectura/8.jpg',
      '/img/cursos/bioarquitectura/9.jpg',
      '/img/cursos/bioarquitectura/10.jpg',
      '/img/cursos/bioarquitectura/11.jpg',
      '/img/cursos/bioarquitectura/12.jpeg',
      '/img/cursos/bioarquitectura/13.jpeg',
    ],
    tag: 'Intensivo · 5 y 6 de diciembre 2026 · Tay Pichín',
    intro: [
      'Dos días de experiencia intensiva donde aprenderemos integrando técnicas ancestrales de bioconstrucción con principios contemporáneos de diseño ecológico y arquitectura bioclimática adaptada a territorios semiáridos.',
      'Durante el encuentro trabajaremos colectivamente en distintas etapas constructivas utilizando tierra, piedra, fibras vegetales y materiales naturales, comprendiendo la vivienda como un organismo vivo en relación directa con el paisaje, el clima y las personas que la habitan.',
    ],
    datos: [
      { label: '¿Cuándo?', val: '5 y 6 de diciembre 2026 · Sábado y domingo' },
      { label: '¿Dónde?', val: 'Ecoescuela Tay Pichín · San Marcos Sierras, Córdoba' },
      { label: 'Modalidad', val: '40% teoría · 60% práctica en obra real' },
      { label: 'Facilita', val: 'Jonatan Palma · Cupos limitados' },
    ],
    modulos: [
      { num: 'Fundamentos', title: 'Construcción con tierra', items: ['Propiedades de la tierra', 'Mezclas y comportamiento del material', 'Reconocimiento de materiales locales'] },
      { num: 'Diseño', title: 'Diseño bioclimático y simbiótico', items: ['Adaptación al territorio y clima local', 'Geometría sagrada aplicada', 'Vivienda como sistema vivo'] },
      { num: 'Técnicas de muro', title: 'Quincha, cob y pirca', items: ['Práctica en obra real', 'Paja encofrada', 'Criterios estructurales básicos'] },
      { num: 'Revoques tierra', title: 'Revoques gruesos y finos', items: ['Tierra estabilizada', 'Mezclas y proporciones', 'Aplicación en capas'] },
      { num: 'Revoques cal', title: 'Cal para zonas húmedas', items: ['Tipos de cal y comportamiento', 'Preparación y aplicación', 'Compatibilidad con muros de tierra'] },
      { num: 'Terminaciones', title: 'Pigmentos naturales y acabados', items: ['Pigmentos minerales', 'Aceites naturales', 'Acabados vivos'] },
      { num: 'Techos', title: 'Techos secos y techos vivos', items: ['Introducción práctica', 'Criterios de diseño', 'Impermeabilización natural'] },
      { num: 'Colectivo', title: 'Construcción colectiva', items: ['Como herramienta pedagógica', 'Organización del trabajo en minga', 'Aprendizaje comunitario'] },
    ],
    facilitadores: [JONATAN],
    opciones: [
      { id: 'sin-hospedaje', label: 'Sin hospedaje', precio: '$130.000 ARS', precioAlt: 'USD 100', includes: ['Materiales', 'Certificado de participación', 'Alimentación completa'] },
      { id: 'camping', label: 'Con camping', precio: '$145.000 ARS', precioAlt: 'USD 112', includes: ['Materiales', 'Certificado de participación', 'Alimentación completa', 'Lugar de camping en Tay Pichín'] },
      { id: 'habitacion', label: 'Habitación compartida', precio: '$160.000 ARS', precioAlt: 'USD 123', includes: ['Materiales', 'Certificado de participación', 'Alimentación completa', 'Habitación compartida en Tay Pichín'], highlighted: true },
    ],
    opcionesNota: 'Todas las opciones incluyen materiales, certificado de participación y alimentación completa durante el intensivo.',
    formCurso: 'Bioarquitectura, Construcción y Territorio · 5 y 6 diciembre 2026',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20inscribirme%20al%20Curso%20de%20Bioarquitectura%20(5%20y%206%20diciembre)',
    mercadopago: 'https://link.mercadopago.com.ar/arteytierra',
  },

  'vuelta-a-la-tierra': {
    slug: 'vuelta-a-la-tierra',
    kind: 'online-live',
    badge: '7 semanas · Online en vivo',
    name: 'La Vuelta a la Tierra',
    subtitle: 'En 7 semanas te llevás los planos de tu vivienda y el masterplan de tu predio listos para empezar a construir. Con criterio técnico, sin gastar de más, y entendiendo por qué.',
    heroImg: '/img/cursos/vueltatierra/7.jpg',
    galeria: ['/img/cursos/vueltatierra/2.jpg', '/img/cursos/vueltatierra/3.jpg', '/img/cursos/vueltatierra/4.jpg', '/img/cursos/vueltatierra/5.jpg', '/img/cursos/vueltatierra/6.jpg'],
    tag: 'A partir de marzo 2027 · Online en vivo',
    intro: [
      'La Vuelta a la Tierra es un programa online en vivo orientado a personas que desean transitar un proceso consciente de regreso al territorio, integrando herramientas prácticas para el diseño de vivienda y predio desde una mirada ecosistémica.',
      'A lo largo de 7 semanas se desarrollan fundamentos técnicos y ejercicios aplicados que permiten comprender el hábitat como un sistema vivo en relación con el clima, el agua, el suelo y las dinámicas humanas.',
    ],
    datos: [
      { label: 'Inicio', val: 'A partir de marzo 2027' },
      { label: 'Encuentros en vivo', val: 'Lunes y jueves · quedan grabados' },
      { label: 'Dedicación', val: '4 a 6 hs semanales · clases + práctica' },
      { label: 'Facilitan', val: 'Jonatan Palma + Fabricio Manzoni' },
    ],
    paraQuien: [
      'Soñás con vivir en el campo y querés tomar decisiones técnicas con fundamento propio.',
      'Ya tenés un terreno y no sabés por dónde empezar a planificarlo.',
      'Estás por comprar tierra y querés aprender a leerla antes de construir.',
      'Querés diseñar tu vivienda integrada al paisaje, el agua y el clima.',
      'Sos arquitecto/a, agrónomo/a o constructor/a y querés sumar la mirada regenerativa.',
    ],
    vasASalir: [
      'Leer un terreno a partir de su clima, topografía, agua y suelo.',
      'Diseñar un masterplan con zonas, sectores, caminos y estrategia hídrica.',
      'Implantar tu vivienda con criterio bioclimático y bioarquitectónico.',
      'Elegir el sistema constructivo adecuado a tu clima y presupuesto.',
      'Integrar tecnologías apropiadas para el agua y el saneamiento.',
      'Desarrollar autonomía proyectual para tomar tus propias decisiones de diseño.',
    ],
    modulos: [
      { num: 'Intro', title: 'Visión Integral del Hábitat', date: 'Semana de inicio', items: ['Presentación del programa', 'Metodología de trabajo', 'Lectura del proceso de transición al campo'] },
      { num: 'Etapa 1 · Semana 1', title: 'Análisis Climático y Topográfico', items: ['Clima y microclimas', 'Topografía y formas del paisaje', 'Orientación y asoleamiento', 'Lectura ecosistémica'], teoria: 'Clima y microclimas · topografía · orientación y asoleamiento · lectura ecosistémica.', practica: 'Análisis de un predio · identificación de pendientes · reconocimiento de flujos de agua.' },
      { num: 'Etapa 2 · Semana 2', title: 'Sistemas, Subdivisiones y Caminos', items: ['Accesos y circulación', 'Subdivisiones funcionales', 'Infraestructura básica', 'Relación movilidad–paisaje'], teoria: 'Accesos · circulación · subdivisiones funcionales · infraestructura básica.', practica: 'Diseño inicial de accesos · planificación de recorridos · organización espacial del predio.' },
      { num: 'Etapa 3 · Semana 3', title: 'Permacultura e Hidrología Regenerativa', items: ['Principios de permacultura', 'Escala de permanencia', 'Agua en el paisaje', 'Diseño hidrológico regenerativo'], teoria: 'Principios de permacultura · escala de permanencia · agua en el paisaje · infiltración.', practica: 'Estrategia hídrica · zonas y sectores · primeros esquemas de masterplan.' },
      { num: 'Semana 4', title: 'Integración y Descanso', items: ['Ordenar contenidos', 'Avanzar en ejercicios', 'Consolidar el proyecto'], nota: 'Sin clases nuevas — espacio para ordenar, practicar y consolidar.' },
      { num: 'Etapa 4 · Semana 5', title: 'Materiales y Arquitectura Bioclimática', items: ['Materiales naturales', 'Comportamiento térmico', 'Arquitectura bioclimática', 'Implantación de vivienda'], teoria: 'Materiales naturales · comportamiento térmico · arquitectura bioclimática.', practica: 'Orientación de vivienda · criterios de elección constructiva · primeras plantas.' },
      { num: 'Etapa 5 · Semana 6', title: 'Tecnologías Apropiadas y Arquitectura Simbiótica', items: ['Vivienda como organismo vivo', 'Tecnologías apropiadas', 'Tratamiento ecológico del agua', 'Integración vivienda–territorio'], teoria: 'Vivienda como organismo vivo · tecnologías apropiadas · tratamiento ecológico del agua.', practica: 'Diseño de sistemas complementarios · relación vivienda–ecosistema.' },
      { num: 'Etapa 6 · Semana 7', title: 'Técnicas de Construcción y Revoques', items: ['Sistemas constructivos naturales', 'Tierra cruda y cal', 'Respirabilidad de muros', 'Criterios de terminación'], teoria: 'Sistemas constructivos naturales · tierra cruda · cal · respirabilidad de muros.', practica: 'Elección de técnica constructiva · resolución básica de muros · criterios de revoques.' },
      { num: 'Cierre', title: 'Integración y Devolución Colectiva', date: 'Última semana', items: ['Revisión general', 'Orientación final', 'Preparación de entrega integradora', 'Devolución colectiva'] },
      { num: 'Plus', title: 'Sesión Individual de Devolución', date: '~2 semanas post-cierre', items: ['Devolución personalizada', 'Revisión del anteproyecto', 'Orientación técnica', 'Recomendaciones de continuidad'], highlighted: true },
    ],
    trabajoFinal: [
      { icon: '📐', title: 'Anteproyecto de Vivienda', items: ['Implantación en el terreno', 'Plantas', 'Fachadas', 'Criterios bioclimáticos', 'Lógica constructiva'] },
      { icon: '🗺️', title: 'Anteproyecto de Predio', items: ['Hidrología', 'Zonas y sectores', 'Caminos', 'Estrategia productiva', 'Masterplan general'] },
    ],
    facilitadores: [JONATAN, FABRICIO],
    opciones: [
      { id: 'base', label: 'Vuelta a la Tierra — Base', precio: '$350.000', includes: ['Todas las clases en vivo grabadas', 'Material de práctica', 'Predio modelo para ejercicios', 'Certificado digital'], precioAlt: 'En 4 pagos: $50k + 3 × $100k' },
      { id: 'con-predio', label: 'Con tu propio predio', precio: '$550.000', includes: ['Todo lo del plan base', 'Ejercicios aplicados a tu terreno real', 'Revisión personalizada de tu análisis'], highlighted: true, precioAlt: 'Consultanos cuotas' },
      { id: 'acompanamiento', label: 'Acompañamiento completo', precio: '$950.000', includes: ['Todo lo del plan con predio', 'Sesión individual de devolución', 'Revisión del anteproyecto de vivienda y predio', 'Orientación técnica personalizada', 'Recomendaciones de continuidad'], precioAlt: 'A convenir según predio' },
    ],
    formCurso: 'La Vuelta a la Tierra · Marzo 2027',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20de%20La%20Vuelta%20a%20la%20Tierra%20(marzo%202027)',
    mercadopago: 'https://link.mercadopago.com.ar/arteytierra',
  },

  'cultivo-girgolas': {
    slug: 'cultivo-girgolas',
    kind: 'presencial',
    badge: 'Taller modular · FUNGO × Tay Pichín',
    name: 'Cultivo de Gírgolas',
    subtitle: 'Tres encuentros para recorrer todo el proceso: desde entender cómo vive y crece un hongo hasta llegar a la cosecha. Sumate al ciclo completo o elegí el módulo que más te resuene.',
    heroImg: '/img/cursos/cultivo-girgolas/1.jpg',
    galeria: ['/img/cursos/cultivo-girgolas/2.jpg', '/img/cursos/cultivo-girgolas/3.jpg'],
    tag: 'Tres encuentros modulares · Fechas a confirmar · Tay Pichín',
    intro: [
      'Un taller intensivo, práctico y con los pies en la tierra para quienes se acercan por primera vez al mundo de los hongos —o para quienes quieren ir un paso más allá en su producción.',
      'El formato modular permite sumarse al ciclo completo o elegir el encuentro que más resuene con cada interés: laboratorio, autoproducción doméstica o emprendimiento.',
    ],
    datos: [
      { label: 'Fechas', val: 'A confirmar · tres sábados' },
      { label: '¿Dónde?', val: 'Ecoescuela Tay Pichín · San Marcos Sierras' },
      { label: 'Modalidad', val: 'Presencial · 3 encuentros modulares e independientes' },
      { label: 'Facilita', val: 'FUNGO · Co-organiza Arte y Tierra' },
    ],
    modulos: [
      { num: 'Módulo I', title: 'Biología del hongo y producción de micelio', items: ['Funcionamiento del hongo y ciclo de vida', 'Qué es el micelio y por qué es la clave', 'Tipos de inóculo, grano y esterilización', 'Prevención y manejo de contaminaciones', 'Práctica: inoculación de frascos con grano'], nota: 'Para curiosos, principiantes y quienes quieren meterse en el lado más de laboratorio del cultivo.' },
      { num: 'Módulo II', title: 'Sustrato, inoculación e incubación', items: ['Tipos de sustrato y preparación', 'Pasteurización y esterilización simple', 'Inoculación sin laboratorio', 'Condiciones de incubación', 'Práctica: preparación y siembra de bolsas'], nota: 'Pensado para quienes quieren producir en casa sin montar un laboratorio.' },
      { num: 'Módulo III', title: 'Fructificación, cosecha y escalado', items: ['Desencadenantes de la fructificación', 'Condiciones de temperatura y humedad', 'Cosecha en el momento justo', 'Conservación y uso culinario', 'Práctica: mantenimiento del cultivo y primeras cosechas'], nota: 'Para quienes quieren escalar la producción o emprender con hongos.' },
    ],
    facilitadores: [{
      name: 'Emmanuel Ciancio Manzoni',
      role: 'Cultivador · Productor de micelio',
      bio: 'Hace más de 9 años, su interés por el reino fungi cambió el rumbo de su vida. Lo que empezó como una curiosidad se convirtió en vocación: cultivar, aprender y compartir todo lo que los hongos tienen para ofrecer. Productor de micelio, extractos y kits de cultivo, acompaña a quienes sienten que hay algo fascinante detrás de estos organismos y quieren dar sus primeros pasos. Su objetivo es acercar el mundo de los hongos adaptógenos y comestibles a la vida cotidiana, de forma práctica, accesible y con la misma pasión con la que empezó.',
      img: '/img/cursos/cultivo-girgolas/Emmanuel.jpeg',
    }],
    opciones: [
      { id: 'modulo', label: 'Módulo suelto', precio: 'Consultanos', includes: ['Un encuentro presencial', 'Materiales incluidos', 'Práctica con insumos reales'] },
      { id: 'ciclo', label: 'Ciclo completo · 3 módulos', precio: 'Consultanos', includes: ['Los 3 encuentros', 'Materiales incluidos', 'Precio especial ciclo completo'], highlighted: true },
    ],
    opcionesNota: 'Cada módulo es una unidad cerrada e independiente — podés sumarte en cualquier momento del ciclo.',
    formCurso: 'Cultivo de Gírgolas 2026 · FUNGO × Tay Pichín',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20del%20Taller%20de%20Cultivo%20de%20G%C3%ADrgolas',
  },

  'mi-tierra-mi-casa': {
    slug: 'mi-tierra-mi-casa',
    kind: 'online-async',
    badge: 'Online · Acceso ilimitado',
    name: 'Mi Tierra, Mi Casa',
    subtitle: 'Una formación que te invita a recordar y vivir la experiencia de bioconstrucción — y a recuperar el antiguo hábito de construir una vivienda de forma comunitaria.',
    heroImg: '/img/cursos/mitierramicasa/1.jpg',
    galeria: ['/img/cursos/mitierramicasa/2.jpg', '/img/cursos/mitierramicasa/3.jpg', '/img/cursos/mitierramicasa/4.jpg'],
    tag: 'Disponible ahora · Empezás cuando querés',
    intro: [
      'Así como cualquier especie en este planeta construye su casa o refugio, esta formación te conecta con ese saber ancestral. Te invita a crear tu propio proceso de aprendizaje a través del estudio de archivos multimedia que fomentan el uso de materiales naturales, herramientas y — principalmente — el desarrollo de tu criterio a la hora de poner manos a la obra.',
      '4 módulos y 18 clases que recorren todas las etapas de una obra natural — de los cimientos al criterio. Sin fechas, sin cupos. Mirás las clases tantas veces como necesitás.',
    ],
    datos: [
      { label: 'Formato', val: 'Video clases grabadas · acceso ilimitado' },
      { label: 'Contenido', val: '4 módulos · 18 clases (5 teóricas + 13 prácticas)' },
      { label: 'Duración', val: 'A tu ritmo · sin vencimiento · desde cualquier lugar' },
      { label: 'Facilita', val: 'Jonatan Palma' },
    ],
    modulos: [
      { num: '01', title: 'Introducción a la construcción natural', items: ['Introducción a la construcción natural', 'Cimientos y estructuras', 'Materiales de construcción', 'Laboratorio de pruebas'] },
      { num: '02', title: 'Muros', items: ['Estructuras y quincha', 'Paja alivianada', 'Cob', 'Rollos de paja', 'Paja encofrada', 'Paja seca'] },
      { num: '03', title: 'Terminaciones', items: ['Revoque grueso', 'Revoque fino', 'Pinturas hidrófugas', 'Relieves'] },
      { num: '04', title: 'Bioarquitectura', items: ['Arquitectura bioclimática', 'Geometría sagrada', 'Radiestesia', 'Techo vivo o techo verde'] },
    ],
    facilitadores: [JONATAN],
    promoVideoId: 'Fak9xHjoivQ',
    opciones: [
      { id: 'completo', label: 'Curso completo', precio: 'USD 80', includes: ['18 clases en video (alta calidad)', 'Asesoría por videollamada', 'Acceso ilimitado sin vencimiento', 'Desde cualquier parte del mundo'], highlighted: true },
    ],
    formCurso: 'Mi Tierra, Mi Casa — Curso Online',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20inscribirme%20a%20Mi%20Tierra%2C%20Mi%20Casa',
    mercadopago: 'https://link.mercadopago.com.ar/arteytierra',
  },

  'tadelakt': {
    slug: 'tadelakt',
    kind: 'online-async',
    badge: 'Online · Acceso ilimitado',
    name: 'Tadelakt Online',
    subtitle: 'Aprendé el arte marroquí del enlucido en cal — el acabado impermeable, brillante y vivo que transforma baños, cocinas y cualquier superficie en una pieza única.',
    heroImg: '/img/cursos/tadelakt/0.jpg',
    galeria: ['/img/cursos/tadelakt/1.jpg', '/img/cursos/tadelakt/2.jpg', '/img/cursos/tadelakt/3.jpg', '/img/cursos/tadelakt/4.jpg', '/img/cursos/tadelakt/5.jpg', '/img/cursos/tadelakt/6.jpg'],
    tag: 'Disponible ahora · Empezás cuando querés',
    intro: [
      'El Tadelakt es una técnica ancestral marroquí de enlucido que utiliza cal como material base y se trabaja por capas hasta lograr un acabado impermeable, brillante y bello — apto para zonas húmedas como baños, duchas y cocinas.',
      'A diferencia de las cerámicas y revestimientos sintéticos, el Tadelakt respira, regula la humedad y envejece con dignidad. Cada terminación es única — un objeto vivo más que un revestimiento.',
    ],
    datos: [
      { label: 'Formato',   val: 'Video clases grabadas · acceso ilimitado' },
      { label: 'Contenido', val: '3 módulos · acceso permanente' },
      { label: 'Modalidad', val: '100% online · a tu ritmo · desde donde estés' },
      { label: 'Facilita',  val: 'Jonatan Palma' },
    ],
    modulos: [
      { num: '01', title: 'Introducción al Tadelakt', items: ['Origen y tradición marroquí', 'Tipos de cal y su comportamiento', 'Lectura del soporte', 'Preparación e imprimación'] },
      { num: '02', title: 'Mortero base y aplicación', items: ['Proporciones y mezcla del mortero', 'Aplicación de primeras capas', 'Manejo de tiempos de fragüe', 'Corrección de defectos'] },
      { num: '03', title: 'Pulido, bruñido y acabados', items: ['Técnica de pulido con piedra lisa', 'Bruñido final', 'Pigmentación y colores', 'Sellado y conservación'] },
    ],
    facilitadores: [JONATAN],
    opciones: [
      { id: 'completo', label: 'Curso completo — 3 módulos', precio: '$90.000 ARS', includes: ['Video clases grabadas (3 módulos)', 'Material de apoyo descargable', 'Acceso permanente'], highlighted: true },
    ],
    formCurso: 'Tadelakt Online',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20del%20curso%20de%20Tadelakt%20Online',
    mercadopago: 'https://link.mercadopago.com.ar/arteytierra',
  },

  'alquimia-natural': {
    slug: 'alquimia-natural',
    kind: 'presencial',
    badge: 'Ciclo de talleres presenciales',
    name: 'Alquimia Natural y Limpieza Consciente',
    subtitle: 'Una formación presencial para transformar ingredientes simples y nobles en soluciones de higiene que respetan tu salud y el planeta.',
    heroImg: '/img/taypichin/carousel/3.jpg',
    galeria: ['/img/taypichin/carousel/4.jpg', '/img/taypichin/carousel/6.jpg'],
    tag: 'Inicia sáb. 13 jun · 3er sábado de cada mes · Tay Pichín',
    intro: [
      '¿Querés vivir más coherente con la naturaleza pero no sabés por dónde empezar? ¿Quizá ya cambiaste tu alimentación o algunos aspectos pero tu baño y tu cocina siguen llenos de envases con químicos no naturales?',
      'En este ciclo vas a aprender a transformar ingredientes simples y nobles en soluciones de higiene: desde jabón con aceite usado hasta desodorantes corporales que sí funcionan y respetan tu salud.',
    ],
    datos: [
      { label: 'Frecuencia', val: 'Tercer sábado de cada mes · Inicia 13 jun 2026' },
      { label: '¿Dónde?', val: 'Ecoescuela Tay Pichín · San Marcos Sierras' },
      { label: 'Modalidad', val: '8 encuentros presenciales o módulos sueltos' },
      { label: 'Cupos', val: 'Limitados por encuentro' },
    ],
    modulos: [
      { num: '01', title: 'Jabón artesanal', items: ['Jabón frío con aceite usado', 'Propiedades de los aceites', 'Proceso de saponificación', 'Moldes y curado'] },
      { num: '02', title: 'Shampú y acondicionador naturales', items: ['Bases limpiadoras naturales', 'Plantas y extractos para el cabello', 'Formulación para distintos tipos de pelo'] },
      { num: '03', title: 'Desodorantes corporales', items: ['Por qué fallan los convencionales', 'Bases minerales y vegetales', 'Formulación sólida y en crema'] },
      { num: '04', title: 'Limpiadores multiuso y del hogar', items: ['Limpiadores multiusos', 'Lavavajillas natural', 'Detergente para ropa'] },
      { num: '05', title: 'Dentífrico y enjuague bucal', items: ['Ingredientes que sí funcionan', 'Polvo y pasta dentífrica', 'Enjuague con plantas medicinales'] },
      { num: '06', title: 'Cosmética básica natural', items: ['Cremas humectantes', 'Aceites y sérum', 'Protección solar natural'] },
      { num: '07', title: 'Aromaterapia aplicada', items: ['Aceites esenciales y su uso seguro', 'Ambientadores y difusores', 'Espráis corporales'] },
      { num: '08', title: 'Integración y soberanía del hogar', items: ['Repaso y preguntas frecuentes', 'Construcción de tu botiquín natural', 'Estrategia para la transición completa'] },
    ],
    facilitadores: [{ name: 'Equipo Arte y Tierra', role: 'Alquimia y soberanía del hogar', bio: 'Formación facilitada por el equipo de Arte y Tierra en la Ecoescuela Tay Pichín. Un espacio de experimentación y soberanía personal.' }],
    opciones: [
      { id: 'modulo', label: 'Encuentro suelto', precio: 'Consultanos', includes: ['Un taller presencial', 'Materiales de práctica incluidos', 'Recetas y fichas para llevar'] },
      { id: 'ciclo', label: 'Ciclo completo · 8 encuentros', precio: 'Consultanos', includes: ['Los 8 talleres presenciales', 'Materiales incluidos', 'Precio especial ciclo completo'], highlighted: true },
    ],
    formCurso: 'Alquimia Natural y Limpieza Consciente 2026',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20del%20ciclo%20de%20Alquimia%20Natural',
  },

  'inmersion-viva': {
    slug: 'inmersion-viva',
    kind: 'inmersion',
    badge: 'Inmersión · Desde 2 semanas',
    name: 'Inmersión Viva',
    subtitle: 'Bioconstrucción, agroecología y organización colectiva aprendidas en la práctica diaria — integradas al trabajo, la convivencia y la vida en territorio.',
    heroImg: '/img/taypichin/carousel/5.jpg',
    galeria: ['/img/taypichin/carousel/7.jpg', '/img/taypichin/carousel/8.jpg', '/img/taypichin/carousel/9.jpg', '/img/taypichin/1.jpg'],
    tag: 'Modalidad permanente · Tay Pichín · San Marcos Sierras',
    intro: [
      'Inmersión Viva es un proceso donde la bioconstrucción, la agroecología y la organización colectiva se aprenden en la práctica diaria — integradas al trabajo, la convivencia y la vida en territorio.',
      'El aprendizaje ocurre en un espacio vivo, donde la construcción, la producción y la vida cotidiana forman parte de un mismo sistema. Durante tu estadía participás de procesos reales, integrándote a una forma de habitar más consciente, simple y conectada con la tierra.',
    ],
    datos: [
      { label: 'Duración', val: 'Mínimo 2 semanas · se puede extender a un mes o más' },
      { label: '¿Dónde?', val: 'Ecoescuela Tay Pichín · San Marcos Sierras, Córdoba' },
      { label: 'Práctica diaria', val: '4–6 hs en obra, huerta y sistemas productivos' },
      { label: 'Comunidad', val: 'Asambleas, círculos de la palabra, cocina en rotación' },
    ],
    modulos: [
      { num: '🏗', title: 'Bioconstrucción', items: ['Técnicas con tierra cruda', 'Uso y lectura de materiales locales', 'Criterios constructivos en obra real', 'Revoques y terminaciones naturales'] },
      { num: '🌱', title: 'Agroecología', items: ['Manejo de huerta y sistemas vivos', 'Suelo, compost y bioinsumos', 'Integración vegetal–animal', 'Bosque comestible y zona 1'] },
      { num: '🌿', title: 'Biocosmética', items: ['Cosecha y secado de plantas medicinales', 'Macerados en aceite y alcohol', 'Tinturas madre artesanales', 'Ungüentos, cremas y elaboraciones naturales', 'Soberanía del cuerpo y el hogar'] },
      { num: '💧', title: 'Diseño Hidrológico', items: ['Lectura del paisaje', 'Agua, clima y topografía', 'Introducción al diseño hidrológico', 'Observación de cuencas'] },
      { num: '🎓', title: 'Participación en cursos', items: ['Acceso libre a los talleres que se dicten en la ecoescuela durante tu estadía', 'Participación como parte del equipo logístico de los cursos', 'Aprendizaje desde adentro de la organización pedagógica', 'Experiencia real de co-facilitación y sostenimiento'] },
      { num: '🤝', title: 'Organización comunitaria', items: ['Círculos de la palabra', 'Asambleas y toma de decisiones', 'Gestión del habitar colectivo', 'Vida cotidiana en ecoescuela'] },
    ],
    facilitadores: [JONATAN],
    opciones: [
      { id: 'camping', label: 'En zona de camping', precio: '$40.000 / semana', includes: ['Alimentación completa', 'Lugar de camping en Tay Pichín', 'Participación en todas las actividades'] },
      { id: 'habitacion', label: 'En habitación compartida', precio: '$80.000 / semana', includes: ['Alimentación completa', 'Habitación compartida en Tay Pichín', 'Participación en todas las actividades'], highlighted: true },
    ],
    opcionesNota: 'Ingresos los lunes. Mínimo 2 semanas, con posibilidad de extender a un mes o más según disponibilidad. Consultanos por WhatsApp.',
    formCurso: 'Inmersión Viva · Tay Pichín',
    whatsapp: 'https://wa.me/5493549431594?text=Hola%2C%20quiero%20info%20de%20la%20Inmersi%C3%B3n%20Viva',
  },
};

export function getCourse(slug: string): CourseData | undefined {
  return COURSES[slug];
}

export function getAllSlugs(): string[] {
  return Object.keys(COURSES);
}
