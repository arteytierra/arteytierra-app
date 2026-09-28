import { describe, it, expect } from 'vitest';
import {
  hayDatoDePueblos, registroDelPunto, censoDelPunto, censoChilenoDelPunto,
  censoParaguayoDelPunto, censoPeruanoDelPunto, censoBrasilenoDelPunto,
  censoMexicanoDelPunto, censoGuatemaltecoDelPunto, type EstadosPueblos,
} from '@/lib/pueblosOriginarios';
import { paisNacionalDelPunto } from '@/lib/pueblosOriginariosNacional';
import type { Ubicacion } from '@/lib/entorno';

/**
 * La regla de silencio: la pestaña de pueblos originarios aparece cuando alguna
 * fuente contesta algo del punto, y no aparece para explicar por qué no sabemos.
 *
 * El test se corre sobre ubicaciones reales resueltas con las mismas funciones
 * que usa el panel, y no sobre los estados a mano: así verifica la cadena
 * entera —geocodificador, tablas, predicado— y no sólo el `||`.
 */
function estados(u: Ubicacion | null): EstadosPueblos {
  return {
    registroAr: registroDelPunto(u).estado,
    censoAr:    censoDelPunto(u).estado,
    cl:         censoChilenoDelPunto(u).estado,
    py:         censoParaguayoDelPunto(u).estado,
    pe:         censoPeruanoDelPunto(u).estado,
    br:         censoBrasilenoDelPunto(u).estado,
    mx:         censoMexicanoDelPunto(u).estado,
    gt:         censoGuatemaltecoDelPunto(u).estado,
    nacional:   !!paisNacionalDelPunto(u),
  };
}

const hay = (u: Ubicacion | null) => hayDatoDePueblos(estados(u));

describe('cuándo la sección de pueblos originarios no aparece', () => {
  it('sin ubicación resuelta no hay sección', () => {
    // Entorno todavía no corrió. Antes se abría una pestaña para pedir que
    // corriera; ahora la pestaña aparece sola cuando hay algo que mostrar.
    expect(hay(null)).toBe(false);
    expect(hay({ pais: '', provincia: '', departamento: '', localidad: '' })).toBe(false);
  });

  it('un país que no relevamos no abre una sección para decirlo', () => {
    expect(hay({ pais: 'Kenia', provincia: 'Nakuru', departamento: '', localidad: '' })).toBe(false);
    expect(hay({ pais: 'Japón', provincia: 'Hokkaidō', departamento: '', localidad: '' })).toBe(false);
  });

  it('una jurisdicción que el geocodificador escribe de un modo que no conocemos, tampoco', () => {
    expect(hay({ pais: 'Argentina', provincia: 'Provincia Inventada', departamento: '', localidad: '' })).toBe(false);
    expect(hay({ pais: 'Chile', provincia: 'Región Inventada', departamento: '', localidad: '' })).toBe(false);
  });
});

describe('cuándo sí aparece', () => {
  it('los siete países con dato local', () => {
    expect(hay({ pais: 'Argentina', provincia: 'Salta', departamento: 'Orán', localidad: '' })).toBe(true);
    expect(hay({ pais: 'Chile', provincia: 'Región de La Araucanía', departamento: '', localidad: '' })).toBe(true);
    expect(hay({ pais: 'Paraguay', provincia: 'Boquerón', departamento: '', localidad: '' })).toBe(true);
    expect(hay({ pais: 'Perú', provincia: 'Cusco', departamento: '', localidad: '' })).toBe(true);
    expect(hay({ pais: 'Brasil', provincia: 'Amazonas', departamento: '', localidad: '' })).toBe(true);
    expect(hay({ pais: 'México', provincia: 'Oaxaca', departamento: '', localidad: '' })).toBe(true);
    expect(hay({ pais: 'Guatemala', provincia: 'Sololá', departamento: '', localidad: '' })).toBe(true);
  });

  it('un país que entra sólo con la cifra nacional', () => {
    expect(hay({ pais: 'Bolivia', provincia: 'Santa Cruz', departamento: '', localidad: '' })).toBe(true);
  });
});

describe('las dos ausencias que sí son un dato', () => {
  it('una jurisdicción argentina sin comunidades inscriptas abre la sección', () => {
    // No es que no sepamos: el registro del INAI no tiene ninguna anotada, y
    // eso dice algo del trámite. La sección existe para contarlo.
    expect(hayDatoDePueblos({
      registroAr: 'sin_comunidades', censoAr: 'jurisdiccion_desconocida',
      cl: 'fuera_de_chile', py: 'fuera_de_paraguay', pe: 'fuera_de_peru',
      br: 'fuera_de_brasil', mx: 'fuera_de_mexico', gt: 'fuera_de_guatemala',
      nacional: false,
    })).toBe(true);
  });

  it('un departamento paraguayo adonde el operativo no fue, también', () => {
    expect(hayDatoDePueblos({
      registroAr: 'fuera_de_argentina', censoAr: 'fuera_de_argentina',
      cl: 'fuera_de_chile', py: 'sin_comunidades', pe: 'fuera_de_peru',
      br: 'fuera_de_brasil', mx: 'fuera_de_mexico', gt: 'fuera_de_guatemala',
      nacional: false,
    })).toBe(true);
  });

  it('en cambio «no sé dónde está el predio» nunca alcanza', () => {
    expect(hayDatoDePueblos({
      registroAr: 'sin_ubicacion', censoAr: 'sin_ubicacion', cl: 'sin_ubicacion',
      py: 'sin_ubicacion', pe: 'sin_ubicacion', br: 'sin_ubicacion',
      mx: 'sin_ubicacion', gt: 'sin_ubicacion', nacional: false,
    })).toBe(false);
  });
});
