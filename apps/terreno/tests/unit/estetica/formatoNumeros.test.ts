/**
 * Cómo se escribe un número en castellano, y por qué eso es un cálculo y no un
 * gusto.
 *
 * En es-AR el punto es el separador de MILES y la coma el decimal. El informe
 * imprimía el perímetro con `toFixed(3)` —«3.669 km»— a unos renglones de
 * «840.800 m²», donde el mismo punto sí quiere decir miles. El mismo carácter
 * con dos significados en la misma página, y en la unidad grande la lectura
 * equivocada es por mil.
 *
 * Y los cuatro decimales de hectárea —«84,0769 ha»— son un metro cuadrado de
 * precisión sobre una superficie que el propio anexo del informe declara como
 * 84,08 ± 0,52 ha. Ese anexo llama a esas cifras, textual, «ruido con aspecto
 * de dato».
 */
import { describe, it, expect } from 'vitest';
import { formatearDistancia, formatearMetros, formatearHa, numeroAR } from '../../../lib/geometria';

describe('los números que salen impresos', () => {
  it('UNA DISTANCIA LARGA VA EN km CON COMA DECIMAL, NO CON PUNTO', () => {
    expect(formatearDistancia(3669.4)).toBe('3,669 km');
    expect(formatearDistancia(3669.4)).not.toContain('.');
  });

  it('Y EL PUNTO QUEDA RESERVADO PARA LOS MILES', () => {
    expect(formatearMetros(3669.4)).toBe('3.669,4 m');
    expect(numeroAR(840769, 0)).toBe('840.769');
  });

  it('UNA DISTANCIA CORTA SE QUEDA EN METROS', () => {
    expect(formatearDistancia(945.2)).toBe('945,2 m');
  });

  it('LA SUPERFICIE EN HECTÁREAS LLEVA DOS DECIMALES: 100 m², NO 1 m²', () => {
    expect(formatearHa(84.0769)).toBe('84,08 ha');
    expect(formatearHa(6.9102)).toBe('6,91 ha');
  });
});
