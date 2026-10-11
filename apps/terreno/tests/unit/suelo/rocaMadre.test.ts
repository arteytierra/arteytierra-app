import { describe, it, expect } from 'vitest';
import {
  familiaDeLitologias, familiaDeTipos, ladoEquivalenteKm, confianzaDelMapa,
  CONSECUENCIA, ORDEN_ESCALA, ROCA_NO_ES_MATERIAL_PARENTAL, FUENTE_MACROSTRAT,
  type FamiliaRoca,
} from '@/lib/rocaMadre';

/**
 * Lo que este módulo puede romper es una afirmación sobre el campo de alguien:
 * decirle «roca básica, suelo fértil» a quien está sobre un granito, o
 * presentarle como «la roca de tu predio» un polígono de 16.000 km².
 *
 * Los tests van a los dos errores. Primero la clasificación, con los pares que
 * se confunden entre sí —basalto contra granito, serpentinita contra
 * metamórfica, caliza contra arenisca— y con las trampas de subcadena. Después
 * la escala, que es la que decide cuánta confianza muestra la pantalla.
 */

describe('la clasificación, donde confundirse cambia el consejo', () => {
  it('el basalto y el granito no pueden caer en la misma familia', () => {
    expect(familiaDeLitologias(['basalt'])).toBe<FamiliaRoca>('basica');
    expect(familiaDeLitologias(['granite'])).toBe<FamiliaRoca>('acida_cristalina');
    // Es la distinción que más cambia el manejo: uno da suelo arcilloso y
    // fértil, el otro arenoso y ácido. Si se mezclan, el consejo se invierte.
    expect(CONSECUENCIA.basica.hereda).not.toBe(CONSECUENCIA.acida_cristalina.hereda);
  });

  it('el basalto de inundación del Paraná entra como básica', () => {
    // Es lo que Macrostrat devuelve de verdad en el sur de Brasil, y es la
    // terra roxa: el caso donde la roca explica un suelo excelente.
    expect(familiaDeLitologias(['flood basalt(s)', 'mafic volcanic rocks'])).toBe('basica');
  });

  it('la serpentinita se resuelve como ultramáfica y no como metamórfica', () => {
    // El orden de la tabla es el que hace esto. Si se reordena alfabéticamente,
    // un predio sobre serpentinita deja de recibir la única advertencia que
    // puede limitar qué se planta por química.
    expect(familiaDeLitologias(['serpentinite'])).toBe('ultramafica');
    expect(familiaDeLitologias(['peridotite'])).toBe('ultramafica');
    expect(CONSECUENCIA.ultramafica.hereda).toMatch(/níquel|cromo/);
    expect(CONSECUENCIA.ultramafica.cuidado).toMatch(/análisis/);
  });

  it('«basalt» contiene «salt», y eso mandaba el basalto a las evaporitas', () => {
    // Estuvo roto mientras se escribía: la palabra 'salt' en la lista de
    // evaporitas agarraba 'basalt' por subcadena, y la roca que da los mejores
    // suelos del mundo salía como «sal en el material de origen». Queda fijado
    // porque el bug es invisible: devuelve una familia válida, sólo que la
    // equivocada, con un consejo de manejo que es casi el opuesto.
    expect(familiaDeLitologias(['basalt'])).toBe('basica');
    expect(familiaDeLitologias(['basaltic andesite'])).toBe('basica');
    expect(familiaDeLitologias(['halite'])).toBe('evaporitica');
  });

  it('la caliza no se lee como roca detrítica', () => {
    expect(familiaDeLitologias(['limestone'])).toBe('carbonatica');
    expect(familiaDeLitologias(['dolomite'])).toBe('carbonatica');
    // Y trae la advertencia que a nadie se le ocurre antes de excavar.
    expect(CONSECUENCIA.carbonatica.cuidado).toMatch(/represa/);
  });

  it('«sand» no es «sandstone», que son suelos opuestos', () => {
    // La trampa de subcadena: arena suelta es el material parental mismo;
    // arenisca es una roca que hay que meteorizar primero.
    expect(familiaDeLitologias(['sand'])).toBe('sedimento_suelto');
    expect(familiaDeLitologias(['sandstone'])).toBe('siliciclastica');
  });

  it('litologías de familias distintas dan mixta, no la primera de la lista', () => {
    // Elegir una sería elegir por el orden de la tabla, que no significa nada.
    expect(familiaDeLitologias(['shale', 'limestone'])).toBe('mixta');
    expect(familiaDeLitologias(['limestone', 'shale'])).toBe('mixta');
  });

  it('varias litologías de la misma familia no son mixta', () => {
    expect(familiaDeLitologias(['basalt', 'gabbro', 'diabase'])).toBe('basica');
  });

  it('una litología genérica no se fuerza a ninguna familia', () => {
    // Macrostrat devuelve «sedimentary rocks» a secas en buena parte del mundo.
    // Inventarle una herencia sería la afirmación plausible y equivocada.
    expect(familiaDeLitologias(['sedimentary rocks'])).toBeNull();
    expect(familiaDeLitologias([])).toBeNull();
  });

  it('la ceniza volcánica no es una arenisca, y Macrostrat las confunde', () => {
    // Caso real, verificado contra la API: en el Quindío la unidad es la
    // Formación Armenia con litología `volcaniclastic`, y Macrostrat le asigna
    // el tipo `siliciclastic`. Sin la entrada propia, el respaldo por tipo lo
    // mandaba a las detríticas y el consejo salía al revés: los suelos de ceniza
    // fijan fósforo, que es lo único que hay que saber antes de fertilizarlos.
    expect(familiaDeLitologias(['volcaniclastic'])).toBe('ceniza_volcanica');
    expect(familiaDeTipos(['siliciclastic'])).toBe('siliciclastica');
    expect(familiaDeLitologias(['ash'])).toBe('ceniza_volcanica');
    expect(familiaDeLitologias(['welded tuff'])).toBe('ceniza_volcanica');
    expect(CONSECUENCIA.ceniza_volcanica.cuidado).toMatch(/fósforo/);
  });

  it('el respaldo por tipo cubre la cola larga de los carbonatos', () => {
    // De las 214 litologías de Macrostrat, las palabras resuelven 118. El grueso
    // del resto son carbonatos con nombre de clasificación de Dunham, que nadie
    // va a mantener a mano y que el tipo de la fuente ya identifica.
    expect(familiaDeTipos(['carbonate'])).toBe('carbonatica');
    expect(familiaDeTipos(['siliciclastic'])).toBe('siliciclastica');
    expect(familiaDeTipos(['regolith'])).toBe('sedimento_suelto');
    expect(familiaDeTipos(['carbonate', 'siliciclastic'])).toBe('mixta');
  });

  it('el tipo ígneo genérico no se traduce, porque no alcanza para decidir', () => {
    // Una riolita y un basalto son los dos `volcanic` y dan suelos opuestos.
    // Contestar acá sería acertarle a la mitad de los casos.
    expect(familiaDeTipos(['volcanic'])).toBeNull();
    expect(familiaDeTipos(['plutonic'])).toBeNull();
    expect(familiaDeTipos(['metamorphic'])).toBeNull();
  });

  it('cada familia tiene qué hereda y qué cuidar, sin excepción', () => {
    for (const k of Object.keys(CONSECUENCIA) as FamiliaRoca[]) {
      expect(CONSECUENCIA[k].titulo.length, k).toBeGreaterThan(10);
      expect(CONSECUENCIA[k].hereda.length, k).toBeGreaterThan(100);
      expect(CONSECUENCIA[k].cuidado.length, k).toBeGreaterThan(80);
    }
  });
});

describe('la escala, que decide cuánto se puede afirmar', () => {
  it('el orden va de la más detallada a la más gruesa', () => {
    // El proxy elige el mapa con `indexOf` sobre esta lista. Invertirla haría
    // que en Iowa contestara el mapa mundial teniendo el estatal al lado.
    expect(ORDEN_ESCALA).toEqual(['large', 'medium', 'small', 'tiny']);
  });

  it('el lado equivalente traduce un área a algo imaginable', () => {
    // Mapa mundial de Macrostrat: 145.535.839 km² en 9.143 polígonos.
    expect(ladoEquivalenteKm(Math.round(145_535_839 / 9_143))).toBe(126);
    // Mapa estatal de Iowa: 145.746 km² en 3.501 polígonos.
    expect(ladoEquivalenteKm(Math.round(145_746 / 3_501))).toBe(6);
  });

  it('el mapa mundial no habla de un predio y el estatal sí', () => {
    expect(confianzaDelMapa(Math.round(145_535_839 / 9_143))).toBe('region');
    expect(confianzaDelMapa(Math.round(145_746 / 3_501))).toBe('predio');
  });

  it('sin área conocida se asume lo más prudente', () => {
    // El default de un dato que decide cuánta confianza mostrar tiene que ser
    // el conservador, no el optimista.
    expect(confianzaDelMapa(null)).toBe('region');
  });

  it('los bordes son los escritos: 100 km² y 2.500 km²', () => {
    expect(confianzaDelMapa(100)).toBe('predio');
    expect(confianzaDelMapa(101)).toBe('comarca');
    expect(confianzaDelMapa(2500)).toBe('comarca');
    expect(confianzaDelMapa(2501)).toBe('region');
  });
});

describe('lo que no se puede perder de vista', () => {
  it('la advertencia nombra el caso que la hace necesaria', () => {
    // Si alguien recorta este texto, que el test diga qué se está perdiendo:
    // la pampa es el ejemplo de manual de roca de base ≠ material parental.
    expect(ROCA_NO_ES_MATERIAL_PARENTAL).toMatch(/loess/);
    expect(ROCA_NO_ES_MATERIAL_PARENTAL).toMatch(/pampa/i);
  });

  it('la licencia se atribuye y se declara de dónde salió', () => {
    expect(FUENTE_MACROSTRAT.licencia).toContain('CC BY 4.0');
    expect(FUENTE_MACROSTRAT.atribucion).toContain('Macrostrat');
    // Son dos obras: la compilación y el mapa fuente.
    expect(FUENTE_MACROSTRAT.atribucion).toContain('mapa fuente');
  });
});
