import { describe, it, expect } from 'vitest';
import { rutaInterna } from '@/lib/rutaInterna';

/*
 * El `?next=` lo escribe cualquiera en la barra de direcciones. Estas pruebas
 * fijan la única regla que importa: de acá no se sale del sitio.
 */
describe('rutaInterna', () => {
  it('deja pasar rutas internas con consulta y fragmento', () => {
    expect(rutaInterna('/cuenta')).toBe('/cuenta');
    expect(rutaInterna('/suscribir?plan=personal&periodo=mensual'))
      .toBe('/suscribir?plan=personal&periodo=mensual');
    expect(rutaInterna('/guia#agua')).toBe('/guia#agua');
  });

  it('rechaza destinos externos', () => {
    // El caso que motivó todo: empieza con "/" y sin embargo es otro host.
    expect(rutaInterna('//sitio-externo.com')).toBe('/mapa');
    expect(rutaInterna('https://sitio-externo.com')).toBe('/mapa');
    expect(rutaInterna('http://sitio-externo.com')).toBe('/mapa');
    expect(rutaInterna('///sitio-externo.com')).toBe('/mapa');
  });

  it('rechaza barras invertidas y sus escapes', () => {
    expect(rutaInterna('\\\\sitio-externo.com')).toBe('/mapa');
    expect(rutaInterna('/\\sitio-externo.com')).toBe('/mapa');
    expect(rutaInterna('/%5C%5Csitio-externo.com')).toBe('/mapa');
    expect(rutaInterna('/%2f%2fsitio-externo.com')).toBe('/mapa');
  });

  it('rechaza vacíos y basura, y respeta la alternativa que se le pase', () => {
    expect(rutaInterna(null)).toBe('/mapa');
    expect(rutaInterna(undefined)).toBe('/mapa');
    expect(rutaInterna('')).toBe('/mapa');
    expect(rutaInterna('cuenta')).toBe('/mapa');
    expect(rutaInterna('javascript:alert(1)')).toBe('/mapa');
    expect(rutaInterna('//sitio-externo.com', '/cuenta')).toBe('/cuenta');
  });

  it('no explota con escapes porcentuales inválidos', () => {
    expect(rutaInterna('/%E0%A4%A')).toBe('/mapa');
  });
});
