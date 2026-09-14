/**
 * El puntaje de Booking se escribe en un solo lugar.
 *
 * Hasta el 13/09/2026 estaba a mano en cinco pantallas y ninguna coincidia con
 * la ficha real: `/hospedaje` anunciaba 9,7 sobre 10 y las otras cuatro
 * repetian un 7,5 con 59 comentarios de una lectura vieja. El real es 7,4 con
 * 60 comentarios. Una copia que se queda atras no rompe nada: se ve tranquila
 * en la vidriera hasta que el huesped abre booking.com en la otra pestaña.
 *
 * No se puede verificar contra Booking desde un test —bloquean a los robots—,
 * asi que lo que se vigila es lo unico que si depende de nosotros: que ninguna
 * pagina vuelva a escribir el numero adentro de una frase.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative } from 'node:path';
import {
  BOOKING_TAY_PICHIN,
  BOOKING_URL,
  puntajeBooking,
  comentariosBooking,
} from '@/lib/hospedaje/booking';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LA_FUENTE = join('lib', 'hospedaje', 'booking.ts');

function fuentes(carpeta: string): string[] {
  const salida: string[] = [];
  for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) salida.push(...fuentes(ruta));
    else if (/\.tsx?$/.test(entrada.name)) salida.push(ruta);
  }
  return salida;
}

describe('el puntaje de Booking', () => {
  it('se formatea con coma en castellano y con punto en ingles', () => {
    expect(puntajeBooking()).toBe('7,4');
    expect(puntajeBooking('fr')).toBe('7,4');
    expect(puntajeBooking('en')).toBe('7.4');
    expect(comentariosBooking()).toBe(BOOKING_TAY_PICHIN.comentarios);
  });

  it('es un puntaje posible sobre 10', () => {
    expect(BOOKING_TAY_PICHIN.puntaje).toBeGreaterThan(0);
    expect(BOOKING_TAY_PICHIN.puntaje).toBeLessThanOrEqual(10);
    expect(BOOKING_TAY_PICHIN.comentarios).toBeGreaterThan(0);
  });

  it('apunta al mismo alojamiento en los tres idiomas', () => {
    for (const url of Object.values(BOOKING_URL)) {
      expect(url).toContain('/hotel/ar/ecohostel-tay-pichin');
    }
  });

  it('no esta copiado en ninguna pagina ni componente', () => {
    // Dos formas de escribirlo. Una: un numero con decimales a menos de 40
    // caracteres de la palabra Booking, en cualquiera de los dos ordenes —
    // "7,5 · Booking.com", "Score 7.5 on Booking". La otra: la palabra puntaje
    // y un decimal, aunque Booking quede lejos en la misma linea; asi estaba
    // escondido el segundo 9.7 de /hospedaje, a noventa caracteres del nombre.
    const sospechoso =
      /(\d+[.,]\d+[^\n]{0,40}Booking)|(Booking[^\n]{0,40}\d+[.,]\d+)|((?:puntaje|puntuaci|score|note)[^\n]{0,15}\d+[.,]\d+)/i;
    const copias: string[] = [];

    for (const carpeta of ['app', 'components', 'lib']) {
      for (const archivo of fuentes(join(RAIZ, carpeta))) {
        const corto = relative(RAIZ, archivo);
        if (corto === LA_FUENTE) continue;
        const codigo = readFileSync(archivo, 'utf8');
        for (const linea of codigo.split('\n')) {
          // Las URLs de la ficha llevan numeros de version de locale y no son
          // un puntaje; y el propio import de la fuente nombra la palabra.
          if (linea.includes('booking.com/hotel')) continue;
          if (linea.includes('lib/hospedaje/booking')) continue;
          if (sospechoso.test(linea)) copias.push(`${corto}: ${linea.trim()}`);
        }
      }
    }

    expect(copias, `el puntaje de Booking se escribe en ${LA_FUENTE}`).toEqual([]);
  });
});
