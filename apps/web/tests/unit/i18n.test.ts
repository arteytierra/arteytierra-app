import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  detectLocaleFromPath,
  pathWithLocale,
  rutaParaCambiarDeIdioma,
  stripLocaleFromPath,
  RUTAS_TRADUCIDAS,
  DEFAULT_LOCALE,
} from '@/lib/i18n/config';

describe('i18n/config', () => {
  it('detecta locale desde el path', () => {
    expect(detectLocaleFromPath('/en/cursos')).toBe('en');
    expect(detectLocaleFromPath('/pt/blog/x')).toBe('pt');
    expect(detectLocaleFromPath('/cursos')).toBe(DEFAULT_LOCALE);
    expect(detectLocaleFromPath('/')).toBe(DEFAULT_LOCALE);
  });

  it('stripLocaleFromPath quita prefijo', () => {
    expect(stripLocaleFromPath('/en/cursos')).toBe('/cursos');
    expect(stripLocaleFromPath('/pt')).toBe('/');
    expect(stripLocaleFromPath('/cursos')).toBe('/cursos');
  });

  it('pathWithLocale construye correctamente', () => {
    expect(pathWithLocale('/cursos', 'en')).toBe('/en/cursos');
    expect(pathWithLocale('/en/cursos', 'pt')).toBe('/pt/cursos');
    expect(pathWithLocale('/en/cursos', 'es')).toBe('/cursos');
    expect(pathWithLocale('/', 'en')).toBe('/en');
  });

  it('round-trip: stripLocale + pathWithLocale es identidad', () => {
    const samples = ['/cursos', '/blog/post-x', '/hospedaje/casa-1'];
    for (const p of samples) {
      expect(pathWithLocale(stripLocaleFromPath(p), 'en')).toBe(`/en${p}`);
    }
  });
});

/**
 * El selector de idioma no puede mandar a un 404.
 *
 * El castellano tiene cuarenta y pico de rutas y los otros dos idiomas
 * diecinueve. Apretar «EN» parado en el carrito, en el aula o en un post del
 * blog pegaba el prefijo igual y caía en una página que no existe.
 */
describe('a dónde lleva el selector de idioma', () => {
  it('va al equivalente cuando la página está traducida', () => {
    expect(rutaParaCambiarDeIdioma('/diseno', 'en')).toBe('/en/diseno');
    expect(rutaParaCambiarDeIdioma('/cursos/bioarquitectura', 'fr')).toBe('/fr/cursos/bioarquitectura');
    expect(rutaParaCambiarDeIdioma('/', 'en')).toBe('/en');
    expect(rutaParaCambiarDeIdioma('/en/diseno', 'fr')).toBe('/fr/diseno');
  });

  it('va a la portada del idioma cuando la página no está traducida', () => {
    for (const ruta of ['/carrito', '/checkout', '/aula/clase-3', '/blog/un-post', '/tienda/un-producto', '/buscar']) {
      expect(rutaParaCambiarDeIdioma(ruta, 'en'), ruta).toBe('/en');
    }
  });

  it('volver al castellano nunca degrada: el sitio entero está en castellano', () => {
    expect(rutaParaCambiarDeIdioma('/en/carrito', 'es')).toBe('/carrito');
    expect(rutaParaCambiarDeIdioma('/fr/blog/un-post', 'es')).toBe('/blog/un-post');
  });

  it('cada ruta de la lista existe de verdad en app/en y en app/fr', () => {
    // Una lista escrita a mano envejece sola: si alguien borra o renombra una
    // página traducida, el selector sigue mandando ahí y vuelve el 404.
    const APP = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'app');
    for (const locale of ['en', 'fr']) {
      for (const ruta of RUTAS_TRADUCIDAS) {
        const carpeta = ruta === '/' ? join(APP, locale) : join(APP, locale, ...ruta.slice(1).split('/'));
        expect(existsSync(join(carpeta, 'page.tsx')), `falta app/${locale}${ruta}/page.tsx`).toBe(true);
      }
    }
  });
});
