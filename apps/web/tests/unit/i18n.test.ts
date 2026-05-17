import { describe, it, expect } from 'vitest';
import {
  detectLocaleFromPath,
  pathWithLocale,
  stripLocaleFromPath,
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
