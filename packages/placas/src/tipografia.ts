/**
 * Las fuentes se **empaquetan**, no se toman del sistema. Si el render tomara la
 * fuente instalada en esta máquina, el mismo proyecto renderizado en otra saldría
 * con otra tipografía y nadie se enteraría hasta ver el video publicado.
 *
 * Se piden sólo los pesos y el subconjunto que las placas usan: sin acotar,
 * `loadFont()` dispara más de cien pedidos de red por render.
 */
import { loadFont as cargarFraunces } from '@remotion/google-fonts/Fraunces';
import { loadFont as cargarInter } from '@remotion/google-fonts/Inter';

/** Titulares. La `display` del sistema de diseño. */
export const DISPLAY = cargarFraunces('normal', {
  weights: ['400', '600'],
  subsets: ['latin', 'latin-ext'],
}).fontFamily;

/** Texto corrido, bajadas, lower thirds. */
export const SANS = cargarInter('normal', {
  weights: ['400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
}).fontFamily;
