/**
 * La roca de abajo, y qué le hereda al suelo.
 *
 * `lib/sueloPorQue.ts` predice el suelo desde el clima y, cuando el dato no
 * coincide con la predicción, nombra a los sospechosos: material parental, edad
 * de la superficie, posición en la ladera. Este módulo va a buscar al primero de
 * esos sospechosos.
 *
 * ── La advertencia que va primero porque es la que puede arruinar todo ───────
 *
 * **Esto es la roca de base, y la roca de base no siempre es el material sobre
 * el que se formó el suelo.** La distinción no es un tecnicismo: en la mayor
 * parte de la tierra agrícola del mundo el suelo se formó sobre un depósito
 * superficial —loess, aluvión, coluvio, till glaciario, ceniza volcánica— que
 * los mapas geológicos de roca de base no muestran. La pampa argentina es el
 * caso de manual: abajo hay sedimentos cenozoicos, y el suelo se hizo sobre
 * loess pleistoceno soplado por el viento, que es otra cosa.
 *
 * Por eso este módulo no dice "el material parental de tu suelo es X". Dice qué
 * roca hay abajo, con qué mapa se supo, y **qué le heredaría al suelo si el
 * suelo se hubiera formado sobre ella**. Es una pista fuerte y un dato incierto,
 * y las dos cosas se dicen juntas.
 *
 * ── La escala, que acá es más importante que en cualquier otra capa ──────────
 *
 * Macrostrat compila 288 mapas de escalas muy distintas. En Iowa contesta el
 * mapa del servicio geológico estatal, cuyo polígono promedio cubre 42 km². En
 * la Argentina contesta el único mapa mundial disponible, cuyo polígono promedio
 * cubre casi 16.000 km² —unos 126 km de lado—: una unidad así no describe un
 * predio, describe una provincia.
 *
 * Presentar las dos cosas igual sería exactamente la falla que este repo ya
 * cometió con el relieve, que anunciaba "SRTM 30 m" mientras usaba un DEM
 * nacional. Así que el tamaño del polígono promedio **se calcula y se imprime**:
 * sale de dividir el área que cubre el mapa por la cantidad de polígonos que
 * tiene, dos números que la propia API publica para cada fuente.
 *
 * ── Licencia ────────────────────────────────────────────────────────────────
 *
 * Macrostrat declara CC-BY 4.0 en cada respuesta de la API (campo `license`).
 * Permite uso comercial con atribución. Se atribuye dos veces, porque son dos
 * obras: la compilación (Macrostrat) y el mapa del que salió la unidad, que la
 * API identifica con autor, año y publicación.
 */

// ─── Litología → qué le hereda al suelo ───────────────────────────────────────

/**
 * Familias de roca, agrupadas por lo único que le importa a un suelo: cuántas
 * bases trae y qué queda cuando se deshace.
 *
 * No es la clasificación de un geólogo —un geólogo no pone el gneis y la
 * arenisca cuarzosa en la misma bolsa— sino la de alguien que va a plantar. Un
 * granito y una riolita son minerales distintos y la misma noticia: sílice,
 * pocas bases, suelo ácido y arenoso. Un basalto y un gabro también.
 */
export type FamiliaRoca =
  | 'acida_cristalina'
  | 'basica'
  | 'ultramafica'
  | 'ceniza_volcanica'
  | 'carbonatica'
  | 'evaporitica'
  | 'siliciclastica'
  | 'sedimento_suelto'
  | 'organica'
  | 'mixta';

export interface ConsecuenciaRoca {
  titulo:  string;
  /** Qué suelo sale de esta roca si el suelo se formó sobre ella. */
  hereda:  string;
  /** Lo que hay que mirar, y que suele ser lo que sorprende. */
  cuidado: string;
}

export const CONSECUENCIA: Record<FamiliaRoca, ConsecuenciaRoca> = {
  acida_cristalina: {
    titulo: 'Roca ácida: sílice y pocas bases',
    hereda:
      'Granitos, riolitas, gneises y cuarcitas son en buena medida cuarzo y feldespatos ' +
      'pobres en calcio. Cuando se deshacen, el cuarzo no se deshace: queda como arena. ' +
      'El suelo que sale de acá tiende a ser arenoso o franco-arenoso, ácido desde el ' +
      'arranque, pobre en calcio y magnesio, y con poca capacidad de retener nutrientes.',
    cuidado:
      'Si el clima además lava, se juntan las dos cosas y el suelo se acidifica rápido: ' +
      'el encalado acá no es una corrección de una vez, es un mantenimiento. Y como la ' +
      'capacidad de intercambio es baja, el fertilizante soluble se va con el agua: la ' +
      'materia orgánica es la que tiene que sostener la fertilidad.',
  },
  basica: {
    titulo: 'Roca básica: la que da los suelos buenos',
    hereda:
      'Basaltos, gabros, andesitas y anfibolitas son ricos en calcio, magnesio y hierro y ' +
      'casi no tienen cuarzo. Al deshacerse no dejan arena: dejan arcillas, y arcillas de ' +
      'las que retienen nutrientes. Son los suelos rojos profundos y fértiles —la terra ' +
      'roxa del basalto del Paraná, los suelos del Deccan, los de las mesetas etíopes—, y ' +
      'aguantan un clima lavador mucho mejor que una roca ácida porque tienen bases de ' +
      'sobra para reponer.',
    cuidado:
      'Mucha arcilla también significa drenaje lento y riesgo de compactación: no se ' +
      'labra en húmedo. Y si el clima es muy lavador y la superficie muy vieja, hasta un ' +
      'basalto termina en caolinita y óxidos: mucha arcilla con poca capacidad de ' +
      'retención. Ahí manda el análisis, no la roca.',
  },
  ultramafica: {
    titulo: 'Roca ultramáfica: el suelo que hay que mirar dos veces',
    hereda:
      'Peridotitas, dunitas y serpentinitas tienen muchísimo magnesio y hierro y casi nada ' +
      'de calcio, potasio y fósforo. El suelo que sale es delgado, con una relación ' +
      'calcio/magnesio invertida respecto de lo que necesita una planta, y suele tener ' +
      'níquel, cromo y cobalto en concentraciones altas de origen natural.',
    cuidado:
      'Es la única familia que puede limitar qué se planta por química y no por manejo. ' +
      'Los suelos serpentínicos sostienen floras endémicas propias justamente porque la ' +
      'mayoría de las especies no prospera ahí. Si el predio está sobre esto, conviene un ' +
      'análisis con calcio, magnesio y metales antes de decidir nada.',
  },
  ceniza_volcanica: {
    titulo: 'Ceniza volcánica: el suelo raro, y el mejor',
    hereda:
      'Ceniza, tobas y depósitos volcaniclásticos. Al meteorizarse no dan arcillas comunes ' +
      'sino minerales de orden corto —alofano e imogolita— que arman un suelo que no se ' +
      'parece a ningún otro: muy liviano, oscurísimo, con muchísima materia orgánica y ' +
      'una capacidad de retener agua que ningún análisis de textura anticipa. Son los ' +
      'suelos del eje cafetero, de Costa Rica, de Java, de Nueva Zelanda y del Rift, y ' +
      'están entre los más productivos del planeta.',
    cuidado:
      'Un solo dato cambia todo el manejo: **fijan fósforo**. El alofano lo retiene con ' +
      'tanta fuerza que buena parte del fósforo que se aplica queda no disponible, y por eso ' +
      'un análisis puede mostrar fósforo total alto y la planta pasar hambre igual. Se ' +
      'trabaja con fósforo localizado, con micorrizas y con materia orgánica, no con dosis ' +
      'más grandes al voleo. Y ojo con la erosión: son livianos, y descubiertos se van.',
  },
  carbonatica: {
    titulo: 'Roca carbonática: calcio de sobra y agua que se escapa',
    hereda:
      'Calizas, dolomías y mármoles son carbonato de calcio y magnesio. El suelo que dejan ' +
      'es alcalino, rico en calcio, y llamativamente **delgado**: la roca se disuelve casi ' +
      'entera en el agua de lluvia y deja muy poco residuo sólido, así que hace falta ' +
      'muchísima roca para hacer poco suelo. Suelen ser suelos pardos o rojos, arcillosos, ' +
      'de poca profundidad y apoyados directamente sobre la roca.',
    cuidado:
      'Dos cosas. El pH alto bloquea hierro, zinc y manganeso, y eso se ve como clorosis ' +
      'aunque el análisis diga que están. Y el agua: el carbonato se disuelve formando ' +
      'conductos, así que el agua superficial se va para abajo y desaparece. Una represa ' +
      'sobre calizas puede no llenarse nunca, y conviene verificar antes de excavar.',
  },
  evaporitica: {
    titulo: 'Evaporitas: sal en el material de origen',
    hereda:
      'Yeso, anhidrita y halita son sales precipitadas. Un suelo formado sobre esto, o ' +
      'regado con agua que las atravesó, arrastra el problema de la salinidad y a veces el ' +
      'de la sodicidad, que es peor porque destruye la estructura del suelo.',
    cuidado:
      'Antes que cualquier diseño de riego, medir conductividad eléctrica y sodio ' +
      'intercambiable, en el suelo y en el agua. En clima seco el riego concentra sales en ' +
      'superficie en pocos años, y si el material ya las traía el margen es mucho más corto.',
  },
  siliciclastica: {
    titulo: 'Roca sedimentaria detrítica: hereda lo que hereda',
    hereda:
      'Areniscas, lutitas, limolitas y conglomerados están hechos de pedazos de otras ' +
      'rocas. Eso significa que el suelo no depende tanto de la roca como de qué estaba ' +
      'hecha la roca: una arenisca cuarzosa da un suelo arenoso y ácido, casi como un ' +
      'granito; una lutita da un suelo arcilloso y bastante más rico. Como regla gruesa, ' +
      'cuanto más fino el grano de la roca, más arcilloso y fértil el suelo.',
    cuidado:
      'Es la familia menos predecible y la que más gana con una calicata. También es la que ' +
      'más suele alternar: bancos de arenisca y de lutita intercalados dan suelos muy ' +
      'distintos a pocos metros de distancia, y cambios de drenaje bruscos dentro del ' +
      'mismo predio.',
  },
  sedimento_suelto: {
    titulo: 'Sedimento suelto: acá sí es el material del suelo',
    hereda:
      'Arenas, gravas, limos y arcillas sin consolidar. Es la respuesta más útil que puede ' +
      'dar un mapa geológico para un suelo, porque **no hay intermediario**: esto no es la ' +
      'roca debajo del material parental, esto es el material parental. Lo que diga acá ' +
      'sobre textura se traslada bastante directo al suelo.',
    cuidado:
      'Que el mapa nombre el sedimento no dice cómo llegó, y eso cambia el predio: un ' +
      'aluvión de río deja capas de texturas alternadas y napa cerca; un depósito de ' +
      'ladera deja material grueso y pendiente; el loess deja limo parejo y profundo, y ' +
      'también una erodibilidad muy alta apenas se lo descubre.',
  },
  organica: {
    titulo: 'Material orgánico: carbón o turba',
    hereda:
      'Carbón, lignito o turba en el material de origen. Son suelos y sustratos con mucho ' +
      'carbono, típicamente ácidos, y con un comportamiento hidrológico propio.',
    cuidado:
      'Si hay turba, manda la regla de la turba sobre todo lo demás: drenarla libera el ' +
      'carbono acumulado durante milenios y el terreno se hunde de forma irreversible. ' +
      'El panel de suelo lo detecta aparte, y si lo dice, eso es lo que hay que leer.',
  },
  mixta: {
    titulo: 'La unidad del mapa junta varias litologías',
    hereda:
      'El mapa nombra rocas de familias distintas para esta misma unidad, así que no hay ' +
      'una herencia única que anunciar: depende de cuál aflore bajo el predio. Abajo están ' +
      'todas las litologías que declara la unidad.',
    cuidado:
      'Es una señal de que la unidad es gruesa para el tamaño de un campo. Si el suelo ' +
      'medido no se parece a lo que predice el clima, la respuesta probablemente esté acá ' +
      'adentro, pero hace falta un mapa de más detalle o una calicata para saber cuál.',
  },
};

/**
 * Palabras de cada familia, buscadas dentro del nombre de la litología.
 *
 * Las litologías vienen de la tabla de Macrostrat (`/defs/lithologies`, 214
 * entradas con `name`, `class` y `type`), no de parsear el texto libre del mapa.
 *
 * **El orden importa y no es alfabético**: se evalúa de la familia más
 * específica a la más general. `serpentinita` tiene que resolverse como
 * ultramáfica antes de que `metamórfica` la agarre, y `caliza arenosa` como
 * carbonática antes que como detrítica.
 */
const PALABRAS: Array<[FamiliaRoca, string[]]> = [
  ['ultramafica', ['peridotite', 'dunite', 'serpentinite', 'pyroxenite', 'komatiite', 'ophiolite', 'ultramafic']],
  ['evaporitica', ['evaporite', 'gypsum', 'anhydrite', 'halite', 'trona']],
  ['organica',    ['coal', 'peat', 'lignite', 'anthracite', 'gyttja']],
  // Antes que las detríticas, y no es un detalle: Macrostrat le asigna a
  // `volcaniclastic` el tipo `siliciclastic`, así que sin esta entrada la ceniza
  // del eje cafetero salía clasificada como arenisca. Es la diferencia entre
  // «hereda lo que hereda» y «fija fósforo», que es el dato que cambia el manejo.
  // 'ash ' con espacio al final para no engancharse a otra palabra.
  ['ceniza_volcanica', ['volcaniclastic', 'pyroclastic', 'ash ', 'tephra', 'tuff',
                        'ignimbrite', 'pumice', 'scoria', 'volcanic glass']],
  ['carbonatica', ['limestone', 'dolomite', 'dolostone', 'marble', 'marl', 'chalk', 'carbonate',
                   'travertine', 'calcarenite', 'wackestone', 'packstone', 'grainstone', 'boundstone',
                   'lime mudstone']],
  ['basica',      ['basalt', 'gabbro', 'diabase', 'dolerite', 'andesite', 'amphibolite', 'greenstone',
                   'mafic', 'tholeiite', 'eclogite', 'metabasalt', 'metagabbro', 'basanite',
                   'tephrite', 'norite', 'anorthosite']],
  ['acida_cristalina', ['granite', 'granodiorite', 'granitoid', 'rhyolite', 'dacite', 'rhyodacite',
                        'tonalite', 'trondhjemite', 'syenite', 'monzonite', 'pegmatite', 'aplite',
                        'quartzite', 'gneiss', 'schist', 'migmatite', 'felsic', 'obsidian',
                        'phonolite', 'trachyte', 'diorite', 'charnockite']],
  ['sedimento_suelto', ['gravel', 'sand ', 'silt ', 'mud ', 'clay ', 'alluvium', 'till', 'loess',
                        'regolith', 'soil', 'paleosol', 'laterite', 'bauxite', 'eluvium', 'colluvium',
                        'moraine', 'loam', 'unconsolidated']],
  ['siliciclastica', ['sandstone', 'shale', 'mudstone', 'siltstone', 'claystone', 'conglomerate',
                      'arkose', 'greywacke', 'graywacke', 'wacke', 'breccia', 'turbidite', 'slate',
                      'phyllite', 'argillite', 'siliciclastic', 'flysch', 'molasse', 'arenite']],
];

/**
 * A qué familia pertenece esta unidad, según las litologías que declara.
 *
 * Si las litologías caen en más de una familia, la respuesta es `mixta` y no la
 * primera que apareció: elegir una sería elegir por el orden de la lista, que no
 * significa nada. Si ninguna palabra engancha —hay litologías genéricas como
 * "sedimentary rocks" a secas— devuelve `null`, y entonces la pantalla muestra
 * la unidad sin prometer una herencia.
 */
/**
 * Respaldo por tipo, para la cola larga de nombres.
 *
 * La tabla de Macrostrat tiene 214 litologías y las palabras de arriba resuelven
 * 118. Las 96 restantes no son exóticas al azar: son sobre todo carbonatos con
 * nombre de clasificación de Dunham —floatstone, rudstone, bafflestone,
 * micrita, coquina, oolita— que caen todos en la misma familia. Escribir 96
 * palabras más sería una lista que se desactualiza; el tipo que la propia fuente
 * le asigna ya lo dice.
 *
 * **Qué queda afuera a propósito.** Los tipos ígneos y metamórficos genéricos
 * (`volcanic`, `plutonic`, `metamorphic`) no se traducen, porque el eje que
 * decide el suelo —cuánta sílice, cuántas bases— los cruza por el medio: una
 * riolita y un basalto son los dos `volcanic` y dan suelos opuestos. Devolver
 * `null` ahí es la respuesta correcta.
 *
 * Y una trampa que este respaldo tenía y ya no: Macrostrat clasifica
 * `volcaniclastic` con tipo `siliciclastic`, así que la ceniza volcánica caía en
 * las detríticas. Por eso `ceniza_volcanica` tiene entrada propia en las
 * palabras, que se evalúan antes que esto.
 */
const POR_TIPO: Record<string, FamiliaRoca> = {
  carbonate:    'carbonatica',
  evaporite:    'evaporitica',
  organic:      'organica',
  siliciclastic:'siliciclastica',
  regolith:     'sedimento_suelto',
};

export function familiaDeTipos(tipos: string[]): FamiliaRoca | null {
  const encontradas = new Set<FamiliaRoca>();
  for (const t of tipos) {
    const f = POR_TIPO[t.toLowerCase().trim()];
    if (f) encontradas.add(f);
  }
  if (encontradas.size === 0) return null;
  if (encontradas.size === 1) return [...encontradas][0]!;
  return 'mixta';
}

export function familiaDeLitologias(litologias: string[]): FamiliaRoca | null {
  const encontradas = new Set<FamiliaRoca>();
  for (const cruda of litologias) {
    // El espacio final permite que 'sand ' no matchee 'sandstone'; para que eso
    // funcione en el último token, se agrega un espacio al texto.
    const l = ` ${cruda.toLowerCase().trim()} `;
    for (const [familia, palabras] of PALABRAS) {
      if (palabras.some(p => l.includes(p))) { encontradas.add(familia); break; }
    }
  }
  if (encontradas.size === 0) return null;
  if (encontradas.size === 1) return [...encontradas][0]!;
  return 'mixta';
}

// ─── El dato tal como lo devuelve el proxy ────────────────────────────────────

/** Escalas con las que Macrostrat rotula cada mapa fuente. */
export type EscalaMapa = 'large' | 'medium' | 'small' | 'tiny';

/** De la más detallada a la más gruesa: así se elige qué mapa contesta. */
export const ORDEN_ESCALA: EscalaMapa[] = ['large', 'medium', 'small', 'tiny'];

export interface MapaFuente {
  nombre:   string;
  /** Cita completa: autores, año, título y publicación. */
  cita:     string;
  escala:   EscalaMapa;
  /** Área del polígono promedio de ese mapa, en km². Calculado, no declarado. */
  poligono_km2: number | null;
}

export interface RocaMadre {
  /** Nombre de la unidad en el mapa. */
  unidad:      string;
  /** Nombre estratigráfico formal, cuando el mapa lo trae. */
  formacion:   string | null;
  /** Litologías declaradas por la unidad, con el nombre de Macrostrat. */
  litologias:  string[];
  familia:     FamiliaRoca | null;
  /** Edad en millones de años y el nombre del período, si lo hay. */
  edad:        { desde_ma: number | null; hasta_ma: number | null; periodo: string | null };
  /** Descripción del mapa original. Los mapas estatales de EE.UU. la traen larga. */
  descripcion: string | null;
  mapa:        MapaFuente;
}

/**
 * El lado de un cuadrado de esa superficie, en km, redondeado.
 *
 * Existe porque «16.000 km²» no se imagina y «126 km de lado» sí. Es una
 * equivalencia geométrica, no una medida del polígono real, que puede ser largo
 * y angosto.
 */
export function ladoEquivalenteKm(km2: number): number {
  return Math.round(Math.sqrt(km2));
}

/**
 * Qué tan lejos está este mapa de poder hablar de un predio.
 *
 * El corte en 100 km² es deliberadamente generoso: un polígono de 100 km² son
 * 10 km de lado, que ya es mucho más grande que cualquier predio, pero todavía
 * describe una comarca. Por encima de 2.500 km² —50 km de lado— la unidad
 * describe una región entera y decir «la roca de tu campo» sería falso.
 */
export function confianzaDelMapa(km2: number | null): 'predio' | 'comarca' | 'region' {
  if (km2 === null) return 'region';
  if (km2 <= 100)   return 'predio';
  if (km2 <= 2500)  return 'comarca';
  return 'region';
}

export const ROTULO_CONFIANZA: Record<'predio' | 'comarca' | 'region', string> = {
  predio:  'El detalle del mapa alcanza para hablar del predio.',
  comarca: 'El mapa describe la comarca, no el predio: adentro de este polígono puede haber más de una roca.',
  region:  'El mapa describe una región entera. Tomalo como el encuadre geológico de la zona, no como la roca de este campo.',
};

export const FUENTE_MACROSTRAT = {
  label: 'Macrostrat — compilación de mapas geológicos',
  url: 'https://macrostrat.org',
  atribucion: 'Geología: Macrostrat (macrostrat.org), CC BY 4.0, y el mapa fuente citado en cada unidad',
  licencia: 'CC BY 4.0, declarada por la propia API en el campo `license` de cada respuesta',
  licenciaUrl: 'https://creativecommons.org/licenses/by/4.0/',
} as const;

/**
 * La advertencia que acompaña siempre al dato, sin excepción.
 *
 * Es una constante y no un texto suelto en el JSX porque tiene que decir lo
 * mismo en el panel y en el informe, que es el que se imprime y se discute sin
 * nosotros.
 */
export const ROCA_NO_ES_MATERIAL_PARENTAL =
  'Esto es la roca de base, y la roca de base no siempre es el material sobre el que se ' +
  'formó el suelo. En la mayor parte de la tierra agrícola del mundo el suelo se hizo ' +
  'sobre un depósito superficial —loess, aluvión, coluvio, till glaciario, ceniza ' +
  'volcánica— que los mapas de roca de base no muestran. La pampa es el ejemplo de ' +
  'manual: abajo hay sedimentos cenozoicos, y el suelo se formó sobre loess soplado por ' +
  'el viento, que es otra cosa. Leelo como una pista fuerte sobre lo que el suelo puede ' +
  'haber heredado, no como el material parental confirmado.';

// ─── Cliente ──────────────────────────────────────────────────────────────────

/**
 * Roca de base del punto, vía el proxy.
 *
 * Devuelve `null` en cualquier problema —punto en el mar, mapa sin cobertura,
 * servicio caído— y nunca tira. El suelo se analiza igual sin esto: es una capa
 * que agrega, no una de la que algo dependa.
 */
export async function obtenerRocaMadre(lat: number, lng: number): Promise<RocaMadre | null> {
  try {
    const r = await fetch('/api/geologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    if (!r.ok) return null;
    return await r.json() as RocaMadre;
  } catch {
    return null;
  }
}
