/**
 * Las rutas `/api/terreno/*` son el borde entre acequia y las credenciales de
 * cobro. Dos cosas tienen que valer siempre ahí.
 *
 * Una: los orígenes permitidos se escriben en un solo lado. Estaban copiados en
 * cada ruta, y una copia que se queda atrás no falla ruidosamente: falla como un
 * CORS que bloquea el botón de pago en el dominio nuevo.
 *
 * Dos: el estado que se le informa a la app tiene que salir de las mismas
 * funciones que usa el checkout para decidir. Si `/api/terreno/estado-pagos`
 * leyera `process.env` por su cuenta, podría contestar "hay prueba" mientras el
 * checkout crea un plan de PayPal sin prueba, que es exactamente la falla que
 * este endpoint vino a cerrar.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { ORIGENES_ACEQUIA, esOrigenAcequia, corsAcequia } from '@/lib/terreno/cors';

const RUTAS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'app', 'api', 'terreno');

function fuentesDeRutas(): { nombre: string; codigo: string }[] {
  return readdirSync(RUTAS).map((carpeta) => ({
    nombre: carpeta,
    codigo: readFileSync(join(RUTAS, carpeta, 'route.ts'), 'utf8'),
  }));
}

describe('CORS de las rutas de acequia', () => {
  it('están los tres orígenes de la app y ninguno más', () => {
    expect([...ORIGENES_ACEQUIA].sort()).toEqual([
      'http://localhost:3001',
      'https://app.acequia.app',
      'https://terreno.arteytierra.org',
    ]);
  });

  it('un origen ajeno no recibe la cabecera que lo habilitaría', () => {
    expect(esOrigenAcequia('https://acequia.app.example.com')).toBe(false);
    expect(esOrigenAcequia(null)).toBe(false);
    expect(corsAcequia('https://otro.sitio', 'GET, OPTIONS'))
      .not.toHaveProperty('Access-Control-Allow-Origin');
    expect(corsAcequia('https://app.acequia.app', 'GET, OPTIONS')['Access-Control-Allow-Origin'])
      .toBe('https://app.acequia.app');
  });

  it('varía por origen, para que ningún caché sirva la respuesta de otro dominio', () => {
    expect(corsAcequia('https://app.acequia.app', 'GET, OPTIONS')['Vary']).toBe('Origin');
  });

  it('ninguna ruta se escribe su propia lista de orígenes', () => {
    for (const { nombre, codigo } of fuentesDeRutas()) {
      expect(codigo, nombre).not.toContain('new Set([');
      expect(codigo, nombre).toContain("from '@/lib/terreno/cors'");
    }
  });
});

describe('estado-pagos no puede contradecir al checkout', () => {
  const ruta = readFileSync(join(RUTAS, 'estado-pagos', 'route.ts'), 'utf8');

  it('lee las banderas por las mismas funciones que usa el cobro', () => {
    expect(ruta).toContain('pagosAcequiaHabilitados');
    expect(ruta).toContain('pruebaComercialHabilitada');
    expect(ruta).toContain('tasaArsPorUsd');
  });

  it('no lee ninguna variable de entorno por su cuenta', () => {
    expect(ruta).not.toContain('process.env');
  });

  it('no expone nada que no se vea en la pantalla siguiente', () => {
    for (const secreto of ['MP_ACCESS_TOKEN', 'PAYPAL_CLIENT_SECRET', 'SERVICE_ROLE', 'TEST_EMAILS']) {
      expect(ruta).not.toContain(secreto);
    }
  });
});
