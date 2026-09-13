import { describe, it, expect } from 'vitest';
import {
  estacionDelMes,
  hemisferioDe,
  nombreDelSolsticio,
  nombresDeTemporada,
} from '@/lib/estaciones';
import { calcularSolar } from '@/lib/solar';
import { calcularArcoSolar } from '@/lib/arco_solar';

/*
 * El nombre de la estación es la mitad del dato en una herramienta con la que
 * alguien orienta un invernadero, dimensiona una cortina o guarda agua para la
 * seca. La astronomía de estos módulos estaba bien; el rótulo estaba escrito
 * para el hemisferio sur y la app se usa en Canadá, España y los Países Bajos.
 */

const CORDOBA = { lat: -31.4, lng: -64.2 };
const AMSTERDAM = { lat: 52.37, lng: 4.9 };
const QUITO = { lat: -0.18, lng: -78.47 };

describe('en qué hemisferio está el predio', () => {
  it('separa norte, sur y trópico', () => {
    expect(hemisferioDe(-31.4)).toBe('sur');
    expect(hemisferioDe(52.37)).toBe('norte');
    expect(hemisferioDe(-0.18)).toBe('tropico');
  });

  it('el borde del trópico es la latitud 10, inclusive', () => {
    expect(hemisferioDe(10)).toBe('tropico');
    expect(hemisferioDe(-10)).toBe('tropico');
    expect(hemisferioDe(10.1)).toBe('norte');
    expect(hemisferioDe(-10.1)).toBe('sur');
  });

  it('sin latitud usable no se arriesga un hemisferio', () => {
    expect(hemisferioDe(null)).toBe('tropico');
    expect(hemisferioDe(undefined)).toBe('tropico');
    expect(hemisferioDe(Number.NaN)).toBe('tropico');
  });
});

describe('la estación de cada mes', () => {
  it('enero es verano en el sur e invierno en el norte', () => {
    expect(estacionDelMes(0, CORDOBA.lat)).toBe('Verano');
    expect(estacionDelMes(0, AMSTERDAM.lat)).toBe('Invierno');
  });

  it('julio es lo contrario que enero, en los dos hemisferios', () => {
    expect(estacionDelMes(6, CORDOBA.lat)).toBe('Invierno');
    expect(estacionDelMes(6, AMSTERDAM.lat)).toBe('Verano');
  });

  it('los doce meses caen en alguna estación', () => {
    for (let mes = 0; mes < 12; mes++) {
      expect(estacionDelMes(mes, CORDOBA.lat), String(mes)).not.toBe('');
    }
  });

  it('las cuatro estaciones del sur son las del norte corridas medio año', () => {
    const sur = nombresDeTemporada(-40);
    const norte = nombresDeTemporada(40);
    expect(norte).toEqual([sur[2], sur[3], sur[0], sur[1]]);
  });
});

describe('los solsticios se nombran por la latitud', () => {
  it('el 21 de diciembre es de verano en el sur y de invierno en el norte', () => {
    expect(nombreDelSolsticio('diciembre', CORDOBA.lat).labelCorto).toBe('Verano');
    expect(nombreDelSolsticio('diciembre', AMSTERDAM.lat).labelCorto).toBe('Invierno');
  });

  it('el 21 de junio es el opuesto, y la fecha no se mueve', () => {
    expect(nombreDelSolsticio('junio', CORDOBA.lat)).toEqual({
      label: 'Solsticio de invierno (21 jun)',
      labelCorto: 'Invierno',
    });
    expect(nombreDelSolsticio('junio', AMSTERDAM.lat)).toEqual({
      label: 'Solsticio de verano (21 jun)',
      labelCorto: 'Verano',
    });
  });

  it('en el trópico se nombran por su mes, sin afirmar una estación', () => {
    expect(nombreDelSolsticio('diciembre', QUITO.lat).labelCorto).toBe('Diciembre');
    expect(nombreDelSolsticio('junio', QUITO.lat).labelCorto).toBe('Junio');
  });
});

describe('los motores que muestran estaciones usan la latitud que ya tienen', () => {
  it('el panel solar rotula enero según el hemisferio', () => {
    expect(calcularSolar(CORDOBA.lat, CORDOBA.lng).meses[0]?.estacion).toBe('Verano');
    expect(calcularSolar(AMSTERDAM.lat, AMSTERDAM.lng).meses[0]?.estacion).toBe('Invierno');
  });

  it('el arco del 21 de junio es el más alto del año en el norte, y se llama verano', () => {
    // Es la comprobación que ata el nombre a la física: el arco rotulado
    // "Verano" tiene que ser el de más horas de luz. Con el rótulo fijo al sur,
    // en Ámsterdam el arco más largo decía "Invierno".
    const arcos = calcularArcoSolar(AMSTERDAM.lat, AMSTERDAM.lng, 500).arcos;
    const masLargo = arcos.reduce((a, b) => (b.horas_luz > a.horas_luz ? b : a));
    expect(masLargo.labelCorto).toBe('Verano');
    expect(masLargo.label).toContain('21 jun');
  });

  it('y en el sur el más largo sigue siendo el de diciembre', () => {
    const arcos = calcularArcoSolar(CORDOBA.lat, CORDOBA.lng, 500).arcos;
    const masLargo = arcos.reduce((a, b) => (b.horas_luz > a.horas_luz ? b : a));
    expect(masLargo.labelCorto).toBe('Verano');
    expect(masLargo.label).toContain('21 dic');
  });
});
