/**
 * Ecorregiones RESOLVE de Sudamérica → fichas regionales sudamericanas.
 *
 * ARCHIVO GENERADO desde _research/ecosistemas-saberes-sudamerica/
 * fase-1-ecologia/mapeo-eco-id-final-auditoria.json. Acá van sólo los ECO_ID
 * cuyo dueño es una de las 47 fichas nuevas; los que siguen apuntando a las 12
 * fichas de lib/contexto.ts quedan en el bloque SUDAMERICA de ecorregiones.ts.
 *
 * Cada ECO_ID fue verificado contra el FeatureServer de RESOLVE por consulta de
 * envolvente, no inferido por parecido de nombre ni por rango numérico. Los
 * nombres de los comentarios son los ECO_NAME que publica RESOLVE.
 */

export const ECO_ID_SUDAMERICA_NUEVAS: Record<number, string> = {
  // Amazonía noroccidental de tierra firme
  446: 'amazonia_noroccidental_tierra_firme', // Caqueta moist forests
  473: 'amazonia_noroccidental_tierra_firme', // Japurá-Solimões-Negro moist forests
  483: 'amazonia_noroccidental_tierra_firme', // Napo moist forests
  503: 'amazonia_noroccidental_tierra_firme', // Solimões-Japurá moist forests

  // Amazonía oriental y meridional de tierra firme
  476: 'amazonia_oriental_tierra_firme',      // Madeira-Tapajós moist forests
  507: 'amazonia_oriental_tierra_firme',      // Tapajós-Xingu moist forests
  508: 'amazonia_oriental_tierra_firme',      // Tocantins/Pindare moist forests
  518: 'amazonia_oriental_tierra_firme',      // Xingu-Tocantins-Araguaia moist forests

  // Amazonía suroccidental de tierra firme
  474: 'amazonia_suroccidental_tierra_firme', // Juruá-Purus moist forests
  497: 'amazonia_suroccidental_tierra_firme', // Purus-Madeira moist forests
  505: 'amazonia_suroccidental_tierra_firme', // Southwest Amazon moist forests
  512: 'amazonia_suroccidental_tierra_firme', // Ucayali moist forests

  // Bosques húmedos del occidente ecuatoriano
  516: 'bosque_humedo_occidente_ecuador',     // Western Ecuador moist forests

  // Bosques templados de Juan Fernández
  560: 'bosque_juan_fernandez',               // Juan Fernández Islands temperate forests

  // Bosque seco chiquitano
  529: 'bosque_seco_chiquitano',              // Chiquitano dry forests

  // Bosques estacionales del Mato Grosso
  481: 'bosque_seco_mato_grosso',             // Mato Grosso tropical dry forests

  // Bosques de babaçu de Maranhão
  540: 'bosques_babacu_maranhao',             // Maranhão Babaçu forests

  // Bosques húmedos del Caribe colombiano y Catatumbo
  447: 'bosques_humedos_caribe_colombia_venezuela',// Catatumbo moist forests
  478: 'bosques_humedos_caribe_colombia_venezuela',// Magdalena-Urabá moist forests

  // Bosques montanos de los Andes del norte
  448: 'bosques_montanos_andes_norte',        // Cauca Valley montane forests
  457: 'bosques_montanos_andes_norte',        // Cordillera Oriental montane forests
  477: 'bosques_montanos_andes_norte',        // Magdalena Valley montane forests
  486: 'bosques_montanos_andes_norte',        // Northwest Andean montane forests
  513: 'bosques_montanos_andes_norte',        // Venezuelan Andes montane forests

  // Bosques secos del Caribe suramericano y Orinoquía occidental
  520: 'bosques_secos_caribe_colombia_venezuela',// Apure-Villavicencio dry forests
  536: 'bosques_secos_caribe_colombia_venezuela',// Lara-Falcón dry forests
  539: 'bosques_secos_caribe_colombia_venezuela',// Maracaibo dry forests
  546: 'bosques_secos_caribe_colombia_venezuela',// Sinú Valley dry forests

  // Bosques secos de Tumbes, Piura y Ecuador
  531: 'bosques_secos_tumbes_ecuador_peru',   // Ecuadorian dry forests
  549: 'bosques_secos_tumbes_ecuador_peru',   // Tumbes-Piura dry forests

  // Caatinga
  525: 'caatinga',                            // Caatinga

  // Enclaves húmedos de la Caatinga
  445: 'caatinga_enclaves_humedos',           // Caatinga Enclaves moist forests

  // Campinaranas del río Negro
  498: 'campinaranas_aguas_negras',           // Rio Negro campinarana

  // Campos rupestres de Espinhaço
  566: 'campos_rupestres',                    // Campos Rupestres montane savanna

  // Campos y pastizales uruguayos
  574: 'campos_uruguayos',                    // Uruguayan savanna

  // Chaco húmedo
  571: 'chaco_humedo',                        // Humid Chaco

  // Galápagos: zonas áridas y de transición
  601: 'galapagos_matorral_xerico',           

  // Bosques inundables de Guayanas y delta del Orinoco
  463: 'guayanas_bosques_inundables_delta',   // Guianan freshwater swamp forests
  488: 'guayanas_bosques_inundables_delta',   // Orinoco Delta swamp forests

  // Bosques de tierras bajas del Escudo Guayanés
  465: 'guayanas_bosques_tierras_bajas',      // Guianan lowland moist forests
  466: 'guayanas_bosques_tierras_bajas',      // Guianan piedmont moist forests
  484: 'guayanas_bosques_tierras_bajas',      // Negro-Branco moist forests
  511: 'guayanas_bosques_tierras_bajas',      // Uatumã-Trombetas moist forests

  // Pastizales inundables de Guayaquil
  582: 'humedales_guayaquil',                 // Guayaquil flooded grasslands

  // Humedales del Orinoco
  583: 'humedales_orinoco',                   // Orinoco wetlands

  // Humedales del Paraná y Mesopotamia
  585: 'humedales_parana_mesopotamia',        // Paraná flooded savanna
  586: 'humedales_parana_mesopotamia',        // Southern Cone Mesopotamian savanna

  // Isla Malpelo: roca oceánica xerófila
  604: 'isla_malpelo_xerica',                 // Malpelo Island xeric scrub

  // Islas Desventuradas: matorral oceánico
  562: 'islas_desventuradas',                 // San Félix-San Ambrosio Islands temperate forests

  // Llanos del Orinoco
  572: 'llanos_orinoquia',                    // Llanos

  // Manglares del Amazonas, Orinoco y Caribe sur
  611: 'manglares_amazon_orinoco_caribe_sur', // Amazon-Orinoco-Southern Caribbean mangroves

  // Manglares del Atlántico sur de Brasil
  616: 'manglares_atlantico_sur_brasil',      // Southern Atlantic Brazilian mangroves

  // Manglares del Pacífico suramericano
  615: 'manglares_pacifico_suramericano',     // South American Pacific mangroves

  // Bosque de araucaria de la Mata Atlántica
  440: 'mata_araucaria_altura',               // Araucaria moist forests

  // Bosques húmedos costeros de la Mata Atlántica
  442: 'mata_atlantica_costera',              // Bahia coastal forests
  491: 'mata_atlantica_costera',              // Pernambuco coastal forests
  500: 'mata_atlantica_costera',              // Serra do Mar coastal forests

  // Bosques interiores de la Mata Atlántica
  443: 'mata_atlantica_interior',             // Bahia interior forests
  492: 'mata_atlantica_interior',             // Pernambuco interior forests

  // Restingas atlánticas
  441: 'mata_atlantica_restingas',            // Atlantic Coast restingas
  485: 'mata_atlantica_restingas',            // Northeast Brazil restingas

  // Bosques secos atlánticos de Brasil
  524: 'mata_atlantica_seca',                 // Brazilian Atlantic dry forests

  // Matorrales xerófilos del Caribe suramericano
  597: 'matorrales_xericos_caribe_suramericano',// Araya and Paria xeric scrub
  602: 'matorrales_xericos_caribe_suramericano',// Guajira-Barranquilla xeric scrub
  603: 'matorrales_xericos_caribe_suramericano',// La Costa xeric shrublands
  606: 'matorrales_xericos_caribe_suramericano',// Paraguaná xeric scrub

  // Montañas húmedas del Caribe suramericano
  456: 'montanas_caribe_norte',               // Cordillera La Costa montane forests
  499: 'montanas_caribe_norte',               // Santa Marta montane forests

  // Pantanal
  584: 'pantanal',                            // Pantanal

  // Pantepui y tierras altas guayanesas
  464: 'pantepui_guayana_alta',               // Guianan Highlands moist forests
  490: 'pantepui_guayana_alta',               // Pantepui forests & shrublands

  // Páramos de los Andes del norte
  590: 'paramos_andinos',                     // Cordillera Central páramo
  591: 'paramos_andinos',                     // Cordillera de Merida páramo
  593: 'paramos_andinos',                     // Northern Andean páramo
  594: 'paramos_andinos',                     // Santa Marta páramo

  // Puna húmeda central
  589: 'puna_humeda_central',                 // Central Andean wet puna

  // Puna seca central
  587: 'puna_seca_central',                   // Central Andean dry puna

  // Rapa Nui y Sala y Gómez
  628: 'rapa_nui_bosque_subtropical_transformado',

  // Sabanas inundables del Beni
  565: 'sabanas_beni',                        // Beni savanna

  // Sabanas del Escudo Guayanés
  570: 'sabanas_guayanesas',                  // Guianan savanna

  // Valles secos interandinos
  479: 'valles_secos_interandinos',           // Marañón dry forests
  523: 'valles_secos_interandinos',           // Bolivian montane dry forests
  526: 'valles_secos_interandinos',           // Cauca Valley dry forests
  538: 'valles_secos_interandinos',           // Magdalena Valley dry forests
  542: 'valles_secos_interandinos',           // Patía valley dry forests

  // Várzeas e igapós amazónicos
  467: 'varzeas_igapos_amazonicos',           // Gurupa várzea
  469: 'varzeas_igapos_amazonicos',           // Iquitos várzea
  480: 'varzeas_igapos_amazonicos',           // Marajó várzea
  482: 'varzeas_igapos_amazonicos',           // Monte Alegre várzea
  496: 'varzeas_igapos_amazonicos',           // Purus várzea
};
