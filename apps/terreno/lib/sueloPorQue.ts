/**
 * Por qué este suelo es así.
 *
 * El panel de suelo contesta muy bien *qué* hay —pH 5,4, carbono 12 g/kg,
 * franco arcilloso— y no dice una palabra de *por qué*. Y el por qué no es
 * adorno: es lo único que le permite a alguien anticipar. Quien entiende que su
 * suelo es ácido porque le sobra agua todos los años sabe que encalar no es un
 * arreglo definitivo sino un mantenimiento; quien entiende que el carbono se le
 * va rápido porque hace 24 °C sabe que descubrir el suelo tres meses le cuesta
 * más que a un vecino de Bariloche.
 *
 * ── El marco: cinco factores, y sólo dos los conocemos ───────────────────────
 *
 * Jenny (1941) escribió el suelo como función de cinco factores:
 *
 *     S = f(clima, organismos, relieve, material parental, tiempo)
 *
 * Hans Jenny, *Factors of Soil Formation: A System of Quantitative Pedology*,
 * McGraw-Hill, 1941. Es la formulación que todavía organiza la edafología.
 *
 * De los cinco, acequia conoce bien uno —el clima, medido mes por mes— y
 * parcialmente el relieve. **No conoce el material parental ni la edad de la
 * superficie**, y eso pone un techo a lo que este módulo puede afirmar. Por eso
 * no explica: **predice y compara**. Dice qué suelo haría este clima si el
 * material parental no opinara, muestra el suelo que efectivamente hay, y cuando
 * los dos no coinciden **nombra a los sospechosos** en vez de inventar una
 * causa. La discrepancia es información, no un error del modelo: es justo donde
 * el material parental, la edad o la posición en la ladera están mandando.
 *
 * Ese es el contrato. Un módulo que dijera "tu suelo es arcilloso porque tu
 * clima es húmedo" sin mirar el dato sería exactamente la falla que este repo
 * más teme: una oración plausible y equivocada.
 *
 * ── Los dos manubrios del clima ──────────────────────────────────────────────
 *
 * El clima no actúa de veinte maneras. Actúa de dos:
 *
 * **1. El agua que sobra** (P − ETP, o mejor P/ETP). Es el motor del lavado:
 * cuánta agua atraviesa el perfil por año y se va hacia abajo llevándose cosas
 * disueltas. Donde sobra agua, las bases (Ca, Mg, K, Na) se van y el complejo
 * de cambio queda con H y Al: el suelo **se acidifica**. Donde la ETP gana, el
 * agua sube por capilaridad en la seca y las sales y el carbonato **se
 * acumulan** en el perfil: tosca, caliche, pH por arriba de 7,5.
 *
 * **2. El calor.** Manda dos cosas a la vez: la velocidad de la hidrólisis que
 * fabrica arcilla, y la velocidad con que los microorganismos se comen la
 * materia orgánica. La segunda es la que se nota en una vida humana.
 *
 * Los dos manubrios se expresan con números que la app ya tiene: el índice de
 * aridez P/ETP (`clasificarAridez`, clases de UNEP) y la temperatura media
 * anual corregida por altura. No se inventa ningún umbral nuevo.
 *
 * ── Lo que este módulo NO hace ───────────────────────────────────────────────
 *
 * No clasifica el suelo (no dice "Argiudol" ni "Ferralsol"): para eso hace falta
 * el material parental y la morfología del perfil descripta a campo. No
 * reemplaza un análisis de laboratorio ni una calicata. Y no afirma la roca
 * madre, que se lee de otra fuente.
 *
 * Fuentes de cada afirmación, en `FUENTES_POR_QUE`.
 */

import { clasificarAridez, type DatosClima, type IndiceAridez } from './clima';
import type { CapaSuelo, DatosSuelo } from './suelos';

// ─── Los regímenes ────────────────────────────────────────────────────────────

/**
 * Qué hace el agua en el perfil, según el índice de aridez P/ETP.
 *
 * Los cortes son los de UNEP que ya usa `clasificarAridez`, agrupados en tres:
 * no se inventa un umbral nuevo para esto. El corte que importa es 0,65 —el
 * límite seco subhúmedo/subhúmedo—, que es aproximadamente donde el perfil deja
 * de tener carbonato libre. Jenny & Leonard (1934) lo midieron sobre una
 * transecta de las Grandes Llanuras: la profundidad al horizonte de carbonato
 * crece con la lluvia hasta que el carbonato desaparece del perfil.
 *
 * Es aproximado a propósito. El balance manda más que la lluvia sola: 700 mm en
 * Corrientes lavan y 700 mm en Neuquén no.
 */
export type RegimenHumedad = 'lavado' | 'transicion' | 'acumulacion';

/**
 * Qué tan rápido corre todo, según la temperatura media anual.
 *
 * Los cortes son los regímenes de temperatura del suelo de la taxonomía del
 * USDA (Soil Survey Staff, *Keys to Soil Taxonomy*, 12.ª ed., USDA-NRCS, 2014):
 * frígido < 8 °C, mésico 8–15, térmico 15–22, hipertérmico > 22.
 *
 * **Con una salvedad de unidades que importa:** la taxonomía los define sobre la
 * temperatura *del suelo a 50 cm*, que corre 1–3 °C por encima de la del aire.
 * Acá se usa la del aire como aproximación, así que un predio justo en el borde
 * puede caer del otro lado. Los cortes ordenan, no diagnostican.
 */
export type RegimenTermico = 'frio' | 'templado' | 'calido' | 'muy_calido';

/** Cuánta arcilla *fabrica* este clima, que no es cuánta arcilla hay. */
export type IntensidadMeteorizacion = 'debil' | 'moderada' | 'intensa';

export function regimenHumedad(aridez: IndiceAridez): RegimenHumedad {
  if (aridez.valor >= 1)    return 'lavado';
  if (aridez.valor >= 0.65) return 'transicion';
  return 'acumulacion';
}

export function regimenTermico(tmediaC: number): RegimenTermico {
  if (tmediaC < 8)  return 'frio';
  if (tmediaC < 15) return 'templado';
  if (tmediaC < 22) return 'calido';
  return 'muy_calido';
}

export function intensidadMeteorizacion(
  humedad: RegimenHumedad,
  termico: RegimenTermico,
): IntensidadMeteorizacion {
  if (humedad === 'lavado' && (termico === 'calido' || termico === 'muy_calido')) return 'intensa';
  if (humedad === 'acumulacion' || termico === 'frio') return 'debil';
  return 'moderada';
}

// ─── Una lectura ──────────────────────────────────────────────────────────────

/**
 * Una propiedad del suelo, con lo que el clima predice y lo que el dato mide.
 *
 * `acuerdo` es el campo que hace el trabajo. `coincide` significa que el clima
 * alcanza para explicar el número; `discrepa`, que no alcanza, y entonces
 * `quienManda` nombra los candidatos. `sin_prediccion` es la respuesta honesta
 * cuando el clima no permite predecir esa propiedad en ese régimen.
 */
export interface LecturaSuelo {
  /** Rótulo corto, para el encabezado de la tarjeta. */
  titulo:      string;
  /** El mecanismo, en dos o tres oraciones. Es la parte que enseña. */
  porque:      string;
  /** Lo que este clima haría. */
  esperado:    string;
  /** Lo que el dato del punto dice. */
  medido:      string;
  acuerdo:     'coincide' | 'discrepa' | 'sin_prediccion';
  /** Presente sólo cuando discrepa: qué factor está mandando en vez del clima. */
  quienManda:  string | null;
}

// ─── El lavado: por qué el pH es el que es ────────────────────────────────────

const PORQUE_LAVADO: Record<RegimenHumedad, string> = {
  lavado:
    'Todos los años sobra agua: llueve más de lo que el sol y el aire pueden ' +
    'evaporar, así que el excedente atraviesa el perfil y sale por abajo. No sale ' +
    'limpio: se lleva disueltos el calcio, el magnesio y el potasio del complejo de ' +
    'cambio, y en su lugar quedan hidrógeno y aluminio. Eso es acidificar un suelo, ' +
    'y es un proceso que no se detiene mientras siga sobrando agua.',
  transicion:
    'El agua que llueve y la que el ambiente puede evaporar están casi empatadas. ' +
    'En los meses húmedos el perfil se lava y en los secos el agua vuelve a subir por ' +
    'capilaridad trayendo bases de abajo. Ninguno de los dos procesos gana del todo, ' +
    'y el resultado suele ser el rango más cómodo para cultivar: no es casualidad que ' +
    'los suelos agrícolas más buscados del mundo estén en esta franja.',
  acumulacion:
    'La ETP le gana a la lluvia: casi nunca sobra agua para atravesar el perfil. ' +
    'El movimiento neto del agua es hacia arriba, no hacia abajo, y lo que el agua ' +
    'trae disuelto queda donde se evapora. Por eso las bases no se van: se concentran, ' +
    'y el carbonato de calcio precipita formando una capa endurecida —tosca, caliche— ' +
    'a la profundidad a la que llega el frente de humedecimiento.',
};

/**
 * pH esperado por el balance hídrico, contra el pH medido.
 *
 * Los rangos son direcciones, no predicciones finas: el mismo régimen de lavado
 * da 4,2 sobre una arenisca cuarzosa y 6,5 sobre un basalto, porque el material
 * parental decide de cuántas bases se parte. Por eso la discrepancia se informa
 * como "acá manda otra cosa" y no como "el dato está mal".
 *
 * Validez: pH en agua, capa 0–5 cm. Fuera de 3–10 no se predice nada (un valor
 * así es un error de la fuente, no un suelo).
 */
export function lecturaLavado(humedad: RegimenHumedad, phMedido: number): LecturaSuelo {
  const base = {
    titulo: humedad === 'acumulacion' ? 'El agua no alcanza a lavar' : 'El agua lava el perfil',
    porque: PORQUE_LAVADO[humedad],
    medido: `pH ${phMedido.toFixed(1)} en los primeros 5 cm.`,
  };

  if (phMedido < 3 || phMedido > 10) {
    return { ...base, esperado: '—', acuerdo: 'sin_prediccion', quienManda: null,
      medido: `pH ${phMedido.toFixed(1)}, fuera del rango físico de un suelo.` };
  }

  if (humedad === 'lavado') {
    const coincide = phMedido < 6.2;
    return {
      ...base,
      esperado: 'Un suelo ácido, por debajo de 6,0, y más ácido cuanto más viejo sea el paisaje.',
      acuerdo: coincide ? 'coincide' : 'discrepa',
      quienManda: coincide ? null :
        'El clima lava y aun así el suelo no está ácido: alguien le repone bases. ' +
        'Los candidatos son un material parental calcáreo o basáltico, una ceniza ' +
        'volcánica reciente, un aporte de ladera arriba, una napa con bicarbonatos, o ' +
        'un encalado previo. En todos los casos es una buena noticia con fecha de ' +
        'vencimiento: el lavado sigue corriendo.',
    };
  }

  if (humedad === 'transicion') {
    const coincide = phMedido >= 5.8 && phMedido <= 7.6;
    return {
      ...base,
      esperado: 'Un pH cerca del neutro, entre 5,8 y 7,6.',
      acuerdo: coincide ? 'coincide' : 'discrepa',
      quienManda: coincide ? null : phMedido < 5.8
        ? 'Más ácido de lo que pide el balance. Suele significar un material parental ' +
          'pobre en bases desde el arranque —arenas cuarzosas, granitos ácidos, ' +
          'areniscas— o una superficie muy vieja que ya se lavó en otro clima. También ' +
          'lo produce décadas de fertilización nitrogenada o de extracción sin reposición.'
        : 'Más alcalino de lo que pide el balance. Mirá si hay carbonato en el material ' +
          'parental, si el predio está en una posición baja donde se evapora agua de napa ' +
          '—ahí aparecen los parches sódicos— o si hubo riego con agua dura.',
    };
  }

  const coincide = phMedido >= 6.8;
  return {
    ...base,
    esperado: 'Un pH neutro a alcalino, 7,0 o más, y carbonato en algún lugar del perfil.',
    acuerdo: coincide ? 'coincide' : 'discrepa',
    quienManda: coincide ? null :
      'El balance no da para lavar y el suelo está ácido igual. Eso pasa sobre ' +
      'materiales que nunca tuvieron bases —arenas cuarzosas, granitos— o en ' +
      'superficies que se formaron bajo un clima más húmedo que el de hoy y conservan ' +
      'el suelo de entonces. Un suelo así es una pista de que el clima del lugar cambió.',
  };
}

// ─── La textura: el eslabón donde el clima explica menos ──────────────────────

const PORQUE_TEXTURA: Record<IntensidadMeteorizacion, string> = {
  intensa:
    'Agua en exceso y calor todo el año: la hidrólisis de los silicatos corre sin ' +
    'parar. Los minerales primarios se deshacen, la sílice y las bases se van con el ' +
    'agua y queda un residuo de caolinita y óxidos de hierro y aluminio. El suelo ' +
    'termina con mucha arcilla, y ahí viene la trampa: **es arcilla de baja ' +
    'actividad**. Un suelo tropical con 60 % de arcilla puede retener menos ' +
    'nutrientes que uno templado con 25 %, porque la caolinita tiene una fracción de ' +
    'la capacidad de intercambio que tiene una esmectita. Mucha arcilla no es mucha ' +
    'fertilidad; el color rojo tampoco.',
  moderada:
    'Hay agua y hay calor suficiente para que la hidrólisis fabrique arcilla, pero no ' +
    'para llevarla al extremo: se forman arcillas de actividad media y alta, las que ' +
    'sí retienen nutrientes. Y como sobra agua en parte del año, esa arcilla además ' +
    'viaja: se lava de la capa superficial y se deposita más abajo, formando un ' +
    'horizonte de acumulación más pesado que el resto del perfil.',
  debil:
    'Sin agua suficiente —o sin calor— la hidrólisis casi no corre. Los minerales ' +
    'primarios llegan enteros: cuarzo, feldespatos, micas. La fracción fina que hay ' +
    'no la fabricó el clima, la heredó el suelo del material sobre el que está, y la ' +
    'que se fabrica se queda arriba porque no hay agua que la arrastre. En estos ' +
    'climas la textura la decide el material parental, no el clima.',
};

/**
 * Tendencia de arcilla esperada, contra la medida.
 *
 * **Advertencia de método, y va en el código porque es la que más importa:** de
 * las tres propiedades que este módulo lee, la textura es la que el clima
 * explica peor. La arcilla que hay en un suelo es un saldo de tres cosas —la que
 * el clima fabricó, la que el suelo heredó del material parental, y la que el
 * agua se llevó— y sólo la primera depende del clima.
 *
 * Los dos contraejemplos que hay que tener a mano:
 *
 * - **El loess.** Media pampa argentina, la meseta de Loess china, el medio oeste
 *   de Estados Unidos y Europa central son limosos y no lo son por meteorización:
 *   son polvo depositado por el viento. El mecanismo no es climático en el
 *   sentido de este módulo, es eólico y sedimentario.
 * - **Los vertisoles.** Climas semiáridos a subhúmedos con seca marcada, sobre
 *   material rico en bases (basalto, margas, aluvión), dan esmectita y 50 % o
 *   más de arcilla, con grietas de varios centímetros. Chaco, el Deccan, la
 *   Gezira sudanesa, las tierras negras de Texas. Ahí "semiárido" y "arcilloso"
 *   conviven sin contradicción.
 *
 * De modo que esta lectura predice la *tendencia* y trata la discrepancia como
 * el dato interesante. Nunca afirma una textura.
 */
export function lecturaTextura(
  intensidad: IntensidadMeteorizacion,
  arcillaPct:  number,
): LecturaSuelo {
  const base = {
    titulo: 'El clima fabrica arcilla, el material parental la aporta',
    porque: PORQUE_TEXTURA[intensidad],
    medido: `${Math.round(arcillaPct)} % de arcilla en los primeros 5 cm.`,
  };

  if (intensidad === 'intensa') {
    const coincide = arcillaPct >= 30;
    return {
      ...base,
      esperado: 'Bastante arcilla, 30 % o más, de baja actividad.',
      acuerdo: coincide ? 'coincide' : 'discrepa',
      quienManda: coincide ? null :
        'Menos arcilla de la que este clima fabricaría. Puede ser una superficie joven ' +
        '—un aluvión, una ceniza reciente, una duna— que no tuvo tiempo, o una posición ' +
        'en ladera donde la erosión saca material tan rápido como el clima lo transforma. ' +
        'También lo da un material parental cuarzoso, que no tiene con qué hacer arcilla.',
    };
  }

  if (intensidad === 'debil') {
    const coincide = arcillaPct < 35;
    return {
      ...base,
      esperado: 'Poca arcilla de origen climático: lo que haya viene del material parental.',
      acuerdo: coincide ? 'coincide' : 'discrepa',
      quienManda: coincide ? null :
        `${Math.round(arcillaPct)} % de arcilla es mucho para un clima que casi no la ` +
        'fabrica, así que la arcilla no la hizo el clima. Las dos explicaciones ' +
        'habituales son un material parental rico en bases que da esmectita —el caso de ' +
        'los vertisoles, con grietas en la seca y suelo intransitable en la lluvia— o una ' +
        'posición baja donde la arcilla llegó lavada de más arriba. Las dos cambian el ' +
        'manejo: en ninguna se labra en húmedo.',
    };
  }

  return {
    ...base,
    esperado: 'Arcilla intermedia y de actividad media a alta, la que sí retiene nutrientes.',
    acuerdo: 'sin_prediccion',
    quienManda: null,
  };
}

/**
 * La arcilla que baja: evidencia de lavado en el perfil del propio predio.
 *
 * El criterio del horizonte argílico de la taxonomía del USDA (*Keys to Soil
 * Taxonomy*) pide, para un horizonte superficial con 15–40 % de arcilla, que el
 * horizonte de abajo tenga al menos **1,2 veces** más arcilla. Acá se usa ese
 * 1,2× como umbral de sospecha, no de diagnóstico: el argílico se define sobre
 * horizontes descriptos a campo y con el aumento ocurriendo dentro de 30 cm
 * verticales, y SoilGrids entrega seis profundidades fijas y suavizadas.
 *
 * Devuelve `null` cuando el perfil no alcanza para mirar o cuando no hay
 * aumento. Un `null` acá significa "no se ve", no "no hay".
 */
export function arcillaQueBaja(perfil: CapaSuelo[]): { razon: number; capa: string } | null {
  const sup = perfil.find(c => c.prof_top === 0);
  if (!sup || sup.arcilla <= 0) return null;
  const abajo = perfil.filter(c => c.prof_top >= 15);
  if (abajo.length === 0) return null;

  let mejor: CapaSuelo | null = null;
  for (const c of abajo) if (!mejor || c.arcilla > mejor.arcilla) mejor = c;
  if (!mejor) return null;

  const razon = mejor.arcilla / sup.arcilla;
  if (razon < 1.2) return null;
  return { razon: Math.round(razon * 100) / 100, capa: mejor.label };
}

// ─── La vida del suelo ────────────────────────────────────────────────────────

/**
 * El régimen biológico del suelo, que es el factor que un diseño puede mover.
 *
 * Nada de esto es una medición: es el régimen que imponen la temperatura y la
 * humedad, y acequia no mide biología. Lo que sí se puede afirmar con fuente es
 * cómo responden la temperatura y la humedad, porque eso está medido en
 * laboratorio y en campo desde hace setenta años.
 */
export interface Biologia {
  /** Rótulo del régimen. */
  regimen:   string;
  /** Qué hace la biología acá y por qué. */
  detalle:   string;
  /**
   * Velocidad de descomposición relativa a un sitio de 10 °C, como banda.
   *
   * La descomposición de la materia orgánica del suelo aproximadamente se
   * duplica cada 10 °C: Q10 entre 1,5 y 2,5 según el sustrato y el sitio
   * (Davidson & Janssens 2006, *Nature* 440:165-173). La banda se calcula con
   * los dos extremos de ese rango, `Q10^((T−10)/10)`, y se informa como banda
   * justamente porque un solo número sería precisión falsa: Q10 no es una
   * constante, baja a temperaturas altas y depende de qué tan lábil sea el
   * carbono.
   *
   * Válido para temperaturas medias anuales de 0 a 30 °C, que es donde está
   * calibrada la relación. Fuera de eso, `null`.
   */
  velocidad: { min: number; max: number } | null;
  /** Qué hacer con esto, en una línea. */
  manejo:    string;
}

const AGUA_Y_AIRE =
  'La humedad manda tanto como la temperatura, y no de forma lineal: la actividad ' +
  'microbiana aerobia es máxima cerca del 60 % del espacio poroso ocupado por agua ' +
  '(Linn & Doran 1984). Más seco que eso, las películas de agua se cortan y los ' +
  'microorganismos no llegan a su comida; más húmedo, el problema es el oxígeno, ' +
  'que difunde en agua unas diez mil veces más lento que en aire. Un suelo saturado ' +
  'no descompone: acumula. Así se forma la turba.';

export function biologiaDelSuelo(termico: RegimenTermico, humedad: RegimenHumedad, tmediaC: number): Biologia {
  const velocidad = tmediaC >= 0 && tmediaC <= 30
    ? {
        min: Math.round(Math.pow(1.5, (tmediaC - 10) / 10) * 100) / 100,
        max: Math.round(Math.pow(2.5, (tmediaC - 10) / 10) * 100) / 100,
      }
    : null;

  if (termico === 'frio') {
    return {
      regimen: 'Lenta y acumuladora',
      detalle:
        'Con esta temperatura media la descomposición es el cuello de botella: la ' +
        'planta produce más de lo que la biología alcanza a consumir, y la diferencia se ' +
        'queda en el suelo. Por eso los suelos fríos suelen ser los más ricos en materia ' +
        'orgánica del planeta aunque produzcan poca biomasa. ' + AGUA_Y_AIRE,
      velocidad,
      manejo:
        'El carbono acá se acumula solo; lo que cuesta es liberar nutrientes. La ' +
        'mineralización es el límite, no la materia orgánica: compost maduro antes que ' +
        'material fresco, y cuidado con roturar, que despierta de golpe décadas de ' +
        'acumulación.',
    };
  }

  if (termico === 'muy_calido') {
    return {
      regimen: 'Rápida y voraz',
      detalle:
        'Acá la biología no es el límite de nada: con esta temperatura media, la materia ' +
        'orgánica que llega al suelo se mineraliza en meses. De ahí la paradoja de los ' +
        'suelos tropicales: el bosque encima es exuberante y el suelo debajo es pobre, ' +
        'porque la fertilidad no está guardada en el suelo sino circulando en la biomasa ' +
        'viva y en la hojarasca. Cortar ese ciclo lo vacía en dos o tres campañas. ' +
        AGUA_Y_AIRE,
      velocidad,
      manejo:
        'La materia orgánica es un flujo, no un stock: hay que reponerla todo el año, no ' +
        'una vez. El suelo desnudo es el peor enemigo —cobertura permanente, sombra, ' +
        'estratos— y la labranza acelera una pérdida que ya era rápida.',
    };
  }

  const pulsos = humedad === 'acumulacion'
    ? ' Y como el agua es el factor escaso, la actividad no es constante sino a golpes: ' +
      'cada lluvia sobre suelo seco dispara una descarga de CO₂ y de nitrógeno mineral ' +
      'muy por encima del ritmo normal, el efecto Birch (Birch 1958). En la práctica, el ' +
      'nitrógeno aparece cuando llueve, no cuando el almanaque dice.'
    : '';

  return {
    regimen: termico === 'templado' ? 'Estacional y equilibrada' : 'Activa la mayor parte del año',
    detalle:
      (termico === 'templado'
        ? 'La temperatura media deja la descomposición a medio camino: corre fuerte en la ' +
          'estación cálida y frena en la fría. Ese freno anual es la razón por la que los ' +
          'suelos de pastizal templado son los más profundos y negros del mundo: reciben ' +
          'raíz nueva todos los años y tienen unos meses en los que casi nada se ' +
          'descompone.'
        : 'La temperatura media mantiene la biología trabajando casi todo el año, con un ' +
          'balance apretado entre lo que entra y lo que se mineraliza. El suelo responde ' +
          'rápido a lo que se le hace, para bien y para mal.') +
      pulsos + ' ' + AGUA_Y_AIRE,
    velocidad,
    manejo:
      humedad === 'acumulacion'
        ? 'La materia orgánica se conserva porque falta agua, no porque sobre biología: si ' +
          'se riega sin reponer carbono, la mineralización se acelera y el suelo se ' +
          'descapitaliza rápido. Riego y aporte orgánico van juntos o no van.'
        : 'Es el régimen más manejable de los cuatro: las coberturas y las raíces vivas ' +
          'aumentan el carbono en pocos años y se sostiene, porque el invierno hace de ' +
          'freno. Aprovechalo.',
  };
}

// ─── La huella de la vegetación, leída en el propio perfil ────────────────────

/**
 * Si este suelo lo hizo pasto o lo hizo monte, leído en la forma de la curva de
 * carbono.
 *
 * Es la parte del módulo que no predice nada: **mide**. Y mide justo el eslabón
 * que el usuario quiere ver, clima → vegetación → suelo, en su propio dato.
 *
 * El mecanismo es simple y se ve en el perfil. Un árbol entrega carbono desde
 * arriba, como hojarasca, y el carbono se concentra en los primeros centímetros.
 * Un pastizal entrega carbono desde abajo, como raíz fina que muere y se renueva
 * todos los años, y lo distribuye en profundidad. Un matorral de zona seca lo
 * distribuye todavía más, porque sus raíces van a buscar agua mucho más abajo.
 *
 * Jobbágy & Jackson (2000) lo cuantificaron sobre 2.700 perfiles: la fracción
 * del carbono del primer metro que está en los primeros 20 cm es del orden del
 * **50 % en bosques, 42 % en pastizales y 33 % en matorrales**.
 * E. G. Jobbágy & R. B. Jackson, "The vertical distribution of soil organic
 * carbon and its relation to climate and vegetation", *Ecological Applications*
 * 10(2):423-436, 2000.
 *
 * Unidades: se compara **stock**, no concentración, porque la densidad aparente
 * cambia con la profundidad y comparar g/kg entre capas sobreestima las capas
 * sueltas de arriba. Stock de una capa, en kg C/m²:
 *
 *     stock = 0,01 × carbono(g/kg) × densidad(g/cm³) × espesor(cm)
 *
 * Los 20 cm no caen en un borde de capa de SoilGrids (0-5, 5-15, 15-30…), así
 * que la capa 15-30 se reparte proporcionalmente al espesor. Es una
 * interpolación lineal declarada, no una medición.
 *
 * Devuelve `null` si el perfil no llega a 100 cm: la fracción sólo significa
 * algo contra un denominador completo.
 */
export interface HuellaVegetacion {
  /** Fracción del carbono de 0–100 cm que está en los primeros 20 cm, en %. */
  fraccion_0_20_pct: number;
  /** Stock de carbono orgánico 0–100 cm, en toneladas por hectárea. */
  stock_t_ha_100:    number;
  /** A qué se parece la distribución. */
  parecido:          'bosque' | 'pastizal' | 'matorral' | 'intermedio';
  lectura:           string;
}

/**
 * Stock de carbono orgánico de una capa, en kg C/m², para el espesor que se le
 * pase en centímetros.
 *
 * El espesor va por parámetro y no sale de la capa porque la capa que cruza los
 * 100 cm sólo cuenta hasta ahí. Una sola fórmula, en un solo lugar:
 * `0,01 × carbono(g/kg) × densidad(g/cm³) × espesor(cm)`.
 */
function stockCapa(c: CapaSuelo, espesorCm: number): number {
  return 0.01 * c.carbono_org * c.densidad_ap * espesorCm;
}

export function huellaVegetacion(perfil: CapaSuelo[]): HuellaVegetacion | null {
  const capas = perfil.filter(c => c.prof_top < 100 && c.carbono_org > 0 && c.densidad_ap > 0);
  if (capas.length === 0) return null;
  // Sin el metro completo la fracción no tiene denominador comparable.
  if (!capas.some(c => c.prof_bot >= 100)) return null;

  let total = 0;
  let arriba = 0;
  for (const c of capas) {
    // Una capa que cruza los 100 cm sólo cuenta hasta ahí.
    const bot = Math.min(c.prof_bot, 100);
    const espesor = bot - c.prof_top;
    if (espesor <= 0) continue;
    const s = stockCapa(c, espesor);
    total += s;
    if (c.prof_top < 20) {
      // Reparto lineal por espesor cuando la capa cruza los 20 cm.
      arriba += s * ((Math.min(bot, 20) - c.prof_top) / espesor);
    }
  }
  if (total <= 0) return null;

  const frac = (arriba / total) * 100;
  const parecido: HuellaVegetacion['parecido'] =
    frac >= 47 ? 'bosque' :
    frac >= 38 ? 'pastizal' :
    frac >= 30 ? 'matorral' : 'intermedio';

  const LECTURA: Record<HuellaVegetacion['parecido'], string> = {
    bosque:
      'El carbono está concentrado arriba, como en un suelo construido por hojarasca: ' +
      'la entrada viene de la superficie hacia abajo. Es la firma de un suelo de bosque ' +
      'o de monte. Tiene una consecuencia práctica inmediata: casi todo el capital está ' +
      'en los primeros veinte centímetros, que son los que se pierden primero si se ' +
      'descubre el suelo o se remueve.',
    pastizal:
      'El carbono está repartido en profundidad, no amontonado arriba. Ésa es la firma ' +
      'de un suelo hecho por raíces: un pastizal pone cerca de la mitad de su biomasa ' +
      'bajo tierra y la renueva cada año, y así construye un horizonte oscuro y espeso ' +
      'en vez de una capa fina. Son los suelos agrícolas más buscados del mundo, y la ' +
      'pampa es uno de ellos.',
    matorral:
      'El carbono está repartido muy en profundidad, más de lo que haría un pastizal. ' +
      'Es lo que se ve donde el agua está lejos de la superficie y las raíces la van a ' +
      'buscar abajo: matorral y estepa. Significa que la fertilidad no está toda en el ' +
      'primer palmo, y que el sistema radicular profundo ya existe: conviene apoyarse en ' +
      'él antes que reemplazarlo.',
    intermedio:
      'La distribución del carbono no se parece a ninguno de los tres patrones de ' +
      'referencia. Suele pasar en suelos muy trabajados, donde la labranza homogeneizó ' +
      'la capa arable, o en perfiles jóvenes de aluvión donde el carbono vino con el ' +
      'sedimento y no lo puso la vegetación de arriba.',
  };

  return {
    fraccion_0_20_pct: Math.round(frac),
    stock_t_ha_100:    Math.round(total * 10),
    parecido,
    lectura: LECTURA[parecido],
  };
}

// ─── El armado ────────────────────────────────────────────────────────────────

export interface PorQueEsteSuelo {
  aridez:    IndiceAridez;
  humedad:   RegimenHumedad;
  termico:   RegimenTermico;
  intensidad: IntensidadMeteorizacion;
  tmedia_c:  number;
  precip_mm: number;
  etp_mm:    number;
  /** Código Köppen del predio, si el clima lo trae. */
  koppen:    string | null;
  lecturas:  LecturaSuelo[];
  biologia:  Biologia;
  /** Sospecha de arcilla lavada hacia abajo, o `null` si no se ve. */
  bt:        { razon: number; capa: string } | null;
  /** Pasto o monte, leído en el perfil. `null` si el perfil no llega a 100 cm. */
  huella:    HuellaVegetacion | null;
}

/**
 * Por qué el suelo del predio es como es.
 *
 * Devuelve `null` si falta el clima o el suelo: sin los dos no hay nada que
 * comparar, y media explicación es peor que ninguna. Rige la regla del silencio
 * —la sección no aparece— en vez de rellenar con generalidades.
 */
export function porQueEsteSuelo(
  suelo: DatosSuelo | null,
  clima: DatosClima | null,
): PorQueEsteSuelo | null {
  if (!suelo || !clima) return null;
  if (!(clima.etp_anual_mm > 0)) return null;

  const aridez     = clima.aridez ?? clasificarAridez(clima.precip_anual_mm, clima.etp_anual_mm);
  const humedad    = regimenHumedad(aridez);
  const termico    = regimenTermico(clima.tmean_anual_c);
  const intensidad = intensidadMeteorizacion(humedad, termico);

  return {
    aridez,
    humedad,
    termico,
    intensidad,
    tmedia_c:  clima.tmean_anual_c,
    precip_mm: clima.precip_anual_mm,
    etp_mm:    clima.etp_anual_mm,
    koppen:    clima.koppen?.codigo ?? null,
    lecturas: [
      lecturaLavado(humedad, suelo.ph),
      lecturaTextura(intensidad, suelo.arcilla),
    ],
    biologia: biologiaDelSuelo(termico, humedad, clima.tmean_anual_c),
    bt:       arcillaQueBaja(suelo.perfil ?? []),
    huella:   huellaVegetacion(suelo.perfil ?? []),
  };
}

/** Rótulos de los regímenes, para la pantalla. Una sola tabla. */
export const ROTULO_HUMEDAD: Record<RegimenHumedad, string> = {
  lavado:      'Sobra agua: el perfil se lava',
  transicion:  'Lluvia y evaporación empatadas',
  acumulacion: 'Falta agua: el perfil acumula',
};

export const ROTULO_TERMICO: Record<RegimenTermico, string> = {
  frio:       'Frío (media < 8 °C)',
  templado:   'Templado (8–15 °C)',
  calido:     'Cálido (15–22 °C)',
  muy_calido: 'Muy cálido (> 22 °C)',
};

export const ROTULO_INTENSIDAD: Record<IntensidadMeteorizacion, string> = {
  debil:    'Meteorización débil',
  moderada: 'Meteorización moderada',
  intensa:  'Meteorización intensa',
};

/**
 * De dónde sale cada afirmación de este módulo.
 *
 * Va en pantalla: una explicación sin fuente es una opinión, y este módulo
 * explica procesos que el usuario no puede verificar mirando su campo.
 */
export const FUENTES_POR_QUE = [
  {
    tema: 'El marco de los cinco factores',
    cita: 'Jenny, H. (1941). Factors of Soil Formation: A System of Quantitative Pedology. McGraw-Hill.',
  },
  {
    tema: 'Lavado, carbonato y lluvia',
    cita: 'Jenny, H. & Leonard, C. D. (1934). Functional relationships between soil properties and rainfall. Soil Science 38:363-381.',
  },
  {
    tema: 'Clases de aridez P/ETP',
    cita: 'UNEP, World Atlas of Desertification (1992), índice de aridez precipitación/evapotranspiración potencial.',
  },
  {
    tema: 'Cortes de régimen térmico',
    cita: 'Soil Survey Staff (2014). Keys to Soil Taxonomy, 12.ª ed., USDA-NRCS. Regímenes de temperatura del suelo.',
  },
  {
    tema: 'Velocidad de descomposición con la temperatura',
    cita: 'Davidson, E. A. & Janssens, I. A. (2006). Temperature sensitivity of soil carbon decomposition and feedbacks to climate change. Nature 440:165-173.',
  },
  {
    tema: 'Óptimo de humedad para la actividad microbiana',
    cita: 'Linn, D. M. & Doran, J. W. (1984). Effect of water-filled pore space on CO₂ and N₂O production in tilled and nontilled soils. Soil Science Society of America Journal 48:1267-1272.',
  },
  {
    tema: 'La descarga de nutrientes al rehumedecer un suelo seco',
    cita: 'Birch, H. F. (1958). The effect of soil drying on humus decomposition and nitrogen availability. Plant and Soil 10:9-31.',
  },
  {
    tema: 'Distribución vertical del carbono según la vegetación',
    cita: 'Jobbágy, E. G. & Jackson, R. B. (2000). The vertical distribution of soil organic carbon and its relation to climate and vegetation. Ecological Applications 10(2):423-436.',
  },
] as const;
