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
