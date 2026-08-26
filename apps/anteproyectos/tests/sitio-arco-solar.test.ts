import { describe, expect, it } from 'vitest';
import { calcularArcoSolar, horaStr } from '@/lib/sitio/arcoSolar';

describe('horaStr', () => {
  it('formatea horas y minutos con cero a la izquierda', () => {
    expect(horaStr(6.5)).toBe('06:30');
    expect(horaStr(18)).toBe('18:00');
  });

  it('arrastra el minuto redondeado a la hora siguiente en vez de mostrar 60', () => {
    expect(horaStr(18.9995)).toBe('19:00');
  });
});

describe('calcularArcoSolar', () => {
  it('devuelve 3 arcos (verano, equinoccio, invierno) centrados en el punto pedido', () => {
    const datos = calcularArcoSolar(18.2537, -66.1057, 200);
    expect(datos.centro).toEqual({ lat: 18.2537, lng: -66.1057 });
    expect(datos.radio_m).toBe(200);
    expect(datos.arcos).toHaveLength(3);
    expect(datos.arcos.map(a => a.fecha).sort()).toEqual(['equinoccio', 'solsticio_invierno', 'solsticio_verano'].sort());
  });

  it('cada arco tiene puntos dentro del círculo de horizonte (radio_m)', () => {
    const radio = 200;
    const datos = calcularArcoSolar(18.2537, -66.1057, radio);
    for (const arco of datos.arcos) {
      expect(arco.puntos.length).toBeGreaterThan(0);
      for (const p of arco.puntos) {
        const dLat = (p.lat - datos.centro.lat) * 111320;
        const dLng = (p.lng - datos.centro.lng) * 111320 * Math.cos(datos.centro.lat * (Math.PI / 180));
        const distancia_m = Math.hypot(dLat, dLng);
        expect(distancia_m).toBeLessThanOrEqual(radio + 1);
      }
    }
  });

  it('las etiquetas de fecha son las del hemisferio sur (origen de Arte y Tierra): "solsticio_verano" es el de diciembre, con más luz en el sur y menos en el norte', () => {
    // Latitud negativa (Buenos Aires): diciembre es verano real ahí, más horas de luz.
    const sur = calcularArcoSolar(-34.6, -58.4, 200);
    const veranoSur = sur.arcos.find(a => a.fecha === 'solsticio_verano')!;
    const inviernoSur = sur.arcos.find(a => a.fecha === 'solsticio_invierno')!;
    expect(veranoSur.horas_luz).toBeGreaterThan(inviernoSur.horas_luz);

    // Misma etiqueta, latitud positiva (Puerto Rico): ahí diciembre es invierno real, así que se invierte.
    const norte = calcularArcoSolar(18.2537, -66.1057, 200);
    const veranoNorte = norte.arcos.find(a => a.fecha === 'solsticio_verano')!;
    const inviernoNorte = norte.arcos.find(a => a.fecha === 'solsticio_invierno')!;
    expect(veranoNorte.horas_luz).toBeLessThan(inviernoNorte.horas_luz);
  });

  it('el mediodía solar cae cerca del cénit (elevación alta) en el ecuador durante el equinoccio', () => {
    const datos = calcularArcoSolar(0, 0, 200);
    const equinoccio = datos.arcos.find(a => a.fecha === 'equinoccio')!;
    expect(equinoccio.mediodia.elevacion).toBeGreaterThan(85);
  });

  it('los puntos cardinales de la brújula están sobre la circunferencia del horizonte', () => {
    const radio = 300;
    const datos = calcularArcoSolar(-10, -50, radio);
    for (const punto of Object.values(datos.brujula)) {
      const dLat = (punto.lat - datos.centro.lat) * 111320;
      const dLng = (punto.lng - datos.centro.lng) * 111320 * Math.cos(datos.centro.lat * (Math.PI / 180));
      const distancia_m = Math.hypot(dLat, dLng);
      expect(distancia_m).toBeCloseTo(radio, 0);
    }
  });
});
