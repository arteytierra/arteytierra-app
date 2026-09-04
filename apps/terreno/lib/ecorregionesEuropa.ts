/**
 * Ecorregiones RESOLVE de Europa occidental → fichas regionales.
 *
 * ARCHIVO GENERADO desde _research/ecosistemas-saberes-europa-occidental/
 * fase-1-ecologia/mapeo-eco-id-propuesto.json (`agregar` + `ampliar_sin_remapear`;
 * las `conservar_actual` ya estaban en lib/ecorregiones.ts).
 *
 * Los cinco `ampliar_sin_remapear` son el hallazgo del relevamiento: tres fichas
 * que ya existían describían territorio donde nunca se activaban. Lanzarote y
 * Fuerteventura son 796, no 787, y `macaronesia` lleva justamente el enarenado,
 * el jable y las gavias. El Alentejo, el Algarve, Doñana y Los Alcornocales son
 * 805, no 793, y `mediterraneo_europeo` lleva la dehesa y el montado. Los
 * Pirineos son 676, no 689, y `alpino_montano_europeo` dice "Alpes, Pirineos y
 * Cárpatos" en su propio texto.
 */

export const ECO_ID_EUROPA: Record<number, string> = {
  // Alpino y montano europeo (ficha ya existente)
  676: 'alpino_montano_europeo',

  // Llanura atlantica del noroeste europeo
  664: 'atlantico_llanura_noroeste',

  // Borde atlantico norte: turbera, machair y viento
  672: 'atlantico_norte_turberas',

  // Campina calcarea del sureste ingles
  663: 'campina_calcarea_inglesa',

  // Atlantico cantabrico e iberico noroccidental
  648: 'cantabrico_atlantico_iberico',

  // Macaronesia (ficha ya existente)
  796: 'macaronesia',

  // Bosque y matorral mediterráneo europeo (ficha ya existente)
  788: 'mediterraneo_europeo',
  799: 'mediterraneo_europeo',
  805: 'mediterraneo_europeo',

  // Montana iberica
  792: 'montano_iberico',
  800: 'montano_iberico',

  // Pinar caledonio y paramo escoces
  691: 'pinar_caledonio',

  // Semiarido del sureste iberico
  803: 'semiarido_sureste_iberico',

  // Bosque templado de Europa occidental
  686: 'templado_occidental_europeo',};
