/**
 * Lo que las placas saben de la marca. Los colores vienen de
 * `@arteytierra/config`: acá no se escribe ningún valor hexadecimal.
 */
import { marcaAcequia } from '@arteytierra/config/tokens';

export const COLORES = marcaAcequia;

/**
 * El wordmark "acequia" está dibujado con Century Gothic, que no está en esta
 * máquina ni en el renderizador. Por eso el lockup se usa **rasterizado**: los
 * PNG de `apps/terreno/public/marca/`, nunca los SVG que llevan `<text>`.
 *
 * En video el riesgo es peor que en web: un fallback tipográfico en una placa
 * no se descubre hasta que el video está publicado.
 */
export const LOGOS = {
  /** Lockup completo, sobre fondo claro. */
  color: 'marca/logo-color.png',
  /** Lockup completo en blanco, para fondo oscuro. Trazo #FFFFFF, no el crema. */
  blanco: 'marca/logo-blanco.png',
  /** La firma en blanco: lower thirds sobre metraje oscuro. */
  firmaBlanca: 'marca/firma-blanca.png',
  /** Lockup completo a un color, sobre fondo claro. */
  negro: 'marca/logo-negro.png',
  /** Símbolo + wordmark en poca altura: para lower thirds. */
  firma: 'marca/firma-negro.png',
  /** Lockup con el isotipo en azul agua y el wordmark claro, para fondo oscuro. */
  azulOscuro: 'marca/logo-azul-oscuro.png',
  /** El mismo, con el wordmark en crema en vez de blanco puro. */
  azulCrema: 'marca/logo-azul-crema.png',
  /**
   * El wordmark "acequia.app" entero, rasterizado con Century Gothic. Las placas
   * lo recortan para mostrar sólo "acequia" y corren el recorte para revelar el
   * dominio: así el kerning es el de la tipografía y nada se mueve al aparecer.
   */
  wordmarkAppBlanco: 'marca/wordmark-app-blanco.png',
  wordmarkAppTinta: 'marca/wordmark-app-tinta.png',
  /** Símbolo solo, trazo puro: escala sin riesgo. */
  isotipoBlanco: 'marca/isotipo-blanco.svg',
  isotipoColor: 'marca/isotipo-color.svg',
} as const;

/** 30 fps en todo. Mezclar fps con el metraje es lo que produce el video "a saltos". */
export const FPS = 30;

export const FORMATOS = {
  /** YouTube, landing. */
  horizontal: { width: 1920, height: 1080 },
  /** Stories y reels. */
  vertical: { width: 1080, height: 1920 },
  /** Feed cuadrado. */
  cuadrado: { width: 1080, height: 1080 },
} as const;

/**
 * Alto de la banda del pie, en píxeles, para el formato que se le pase.
 *
 * El número sale de una medición, no del gusto: sobre 1920×1080 el metraje trae
 * la barra de Chrome que avisa que se está compartiendo la pantalla ocupando de
 * y=952 a y=1021, y abajo de eso viven la atribución de Leaflet y la barra de
 * estado de la app. 140 px desde abajo se las llevan a las tres con margen.
 *
 * El vertical se recorta del horizontal tomando el alto completo y 607 px de
 * ancho, así que todo crece ×16/9: los mismos 140 px pasan a ser 249. Se
 * redondea a 250 para no arrastrar un decimal por toda la placa.
 */
export const ALTO_BANDA = (ancho: number, alto: number): number => (alto > ancho ? 250 : 140);
