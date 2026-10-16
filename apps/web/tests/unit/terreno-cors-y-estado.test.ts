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
import {
  ACEQUIA_FEATURES, ACEQUIA_FEATURES_VITRINA, ACEQUIA_LIBRE,
  ACEQUIA_TOPO_SEMILLA_HA, acequiaPlanHabilita,
  type AcequiaFeature, type AcequiaPlanId,
} from '@arteytierra/config/acequia';

const RUTAS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'app', 'api', 'terreno');

function fuentesDeRutas(): { nombre: string; codigo: string }[] {
  return readdirSync(RUTAS).map((carpeta) => ({
    nombre: carpeta,
    codigo: readFileSync(join(RUTAS, carpeta, 'route.ts'), 'utf8'),
  }));
}

describe('CORS de las rutas de acequia', () => {
  it('están los orígenes de acequia y ninguno más', () => {
    expect([...ORIGENES_ACEQUIA].sort()).toEqual([
      'http://localhost:3001',
      'https://acequia.app',
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

  it('publica el catálogo leyéndolo del paquete de configuración', () => {
    // Es lo que la vidriera de acequia.app verifica contra su copia. Si esto se
    // escribiera a mano acá, el guardián estaría comparando una copia con otra.
    expect(ruta).toContain("from '@arteytierra/config/acequia'");
    expect(ruta).toContain('ACEQUIA_PLANS');
    expect(ruta).toContain('planes: publicarPlanes()');
  });

  it('no expone nada que no se vea en la pantalla siguiente', () => {
    for (const secreto of ['MP_ACCESS_TOKEN', 'PAYPAL_CLIENT_SECRET', 'SERVICE_ROLE', 'TEST_EMAILS']) {
      expect(ruta).not.toContain(secreto);
    }
  });
});

/**
 * Las frases de la vidriera.
 *
 * Publicar los precios no evitó el error del 15/10/2026: la tarjeta de Semilla
 * de `acequia.app` ofrecía «Informe con marca de agua» dos semanas después de
 * que `informe.descarga` pasara a Personal, y ningún número estaba mal. La
 * frase estaba mal. Por eso las frases también salen del paquete de
 * configuración, y por eso esto exige que estén completas: una feature sin
 * etiqueta obliga a la vidriera a inventarla, que es de donde salen las tres
 * mentiras que ya hubo.
 */
describe('la vidriera no puede quedarse sin frases', () => {
  it('toda feature con candado tiene su etiqueta, y ninguna de relleno', () => {
    const features = Object.keys(ACEQUIA_FEATURES) as AcequiaFeature[];
    expect(features.length).toBeGreaterThan(20);
    for (const f of features) {
      const v = ACEQUIA_FEATURES_VITRINA[f];
      expect(v, f).toBeDefined();
      // Corta, pero no un rótulo técnico: tiene que poder leerla un visitante.
      expect(v.etiqueta.length, f).toBeGreaterThan(12);
      expect(v.etiqueta.length, f).toBeLessThan(90);
      expect(v.etiqueta, f).not.toMatch(/\./);           // no es el id
      expect(typeof v.tarjeta, f).toBe('boolean');
    }
  });

  it('la muestra de topografía no se puede anunciar sin su tope', () => {
    // El renglón «curvas de nivel» sin el tope promete la herramienta y
    // entrega media hectárea: un cuadrado de 70 m de lado.
    const v = ACEQUIA_FEATURES_VITRINA['analisis.topo'];
    expect(v.salvedad).not.toBeNull();
    expect(v.salvedad!).toContain(String(ACEQUIA_TOPO_SEMILLA_HA).replace('.', ','));
    expect(v.tarjeta).toBe(true);
  });

  it('bajar el informe dice qué le queda a Semilla, que es lo que se dijo mal', () => {
    const v = ACEQUIA_FEATURES_VITRINA['informe.descarga'];
    expect(ACEQUIA_FEATURES['informe.descarga']).toBe('personal');
    expect(v.salvedad).not.toBeNull();
    expect(v.salvedad!).toMatch(/Semilla/);
    expect(v.salvedad!).toMatch(/link/i);
  });

  it('lo que no tiene candado también se publica, porque es la tarjeta de Semilla', () => {
    // Una vidriera que sólo conoce las features con candado no tiene con qué
    // armar la oferta gratis: termina inventando renglones.
    expect(ACEQUIA_LIBRE.length).toBeGreaterThanOrEqual(4);
    const ids = ACEQUIA_LIBRE.map(l => l.id);
    expect(ids).toContain('informe_publico');
    expect(new Set(ids).size, 'ids repetidos').toBe(ids.length);
    for (const l of ACEQUIA_LIBRE) expect(l.etiqueta.length, l.id).toBeGreaterThan(12);
    // Y ninguna de las libres puede ser una feature con candado disfrazada.
    const conCandado = new Set(Object.keys(ACEQUIA_FEATURES));
    for (const l of ACEQUIA_LIBRE) expect(conCandado.has(l.id), l.id).toBe(false);
  });

  it('Semilla no habilita nada de la etapa de entrega', () => {
    // Decisión del 01/10/2026: la muestra gratis deja de llevarse el trabajo.
    // Si alguien vuelve a abrir una de estas, la tarjeta de Semilla cambia y
    // este test es el que avisa.
    for (const f of ['informe.descarga', 'informe.sin_marca', 'export.imagen', 'export.gis', 'export.dxf'] as AcequiaFeature[]) {
      expect(acequiaPlanHabilita('semilla', f), f).toBe(false);
    }
  });

  it('cada plan hereda todo lo del anterior, que es lo que dice «Todo en Personal»', () => {
    const escalera: AcequiaPlanId[] = ['semilla', 'personal', 'profesional', 'estudio'];
    for (let i = 1; i < escalera.length; i++) {
      const abajo = escalera[i - 1]!, arriba = escalera[i]!;
      for (const f of Object.keys(ACEQUIA_FEATURES) as AcequiaFeature[]) {
        if (acequiaPlanHabilita(abajo, f)) {
          expect(acequiaPlanHabilita(arriba, f), `${arriba} perdió ${f}`).toBe(true);
        }
      }
      // Y cada escalón tiene que agregar algo, o el renglón de precio no se
      // justifica solo.
      const nuevas = (Object.keys(ACEQUIA_FEATURES) as AcequiaFeature[])
        .filter(f => acequiaPlanHabilita(arriba, f) && !acequiaPlanHabilita(abajo, f));
      expect(nuevas.length, `${arriba} no agrega nada sobre ${abajo}`).toBeGreaterThan(0);
    }
  });

  const ruta = readFileSync(join(RUTAS, 'estado-pagos', 'route.ts'), 'utf8');

  it('y el endpoint las publica leyéndolas del paquete, no copiándolas', () => {
    expect(ruta).toContain('ACEQUIA_FEATURES_VITRINA');
    expect(ruta).toContain('features: publicarFeatures()');
    expect(ruta).toContain('libre: ACEQUIA_LIBRE');
    expect(ruta).toContain('topoSemillaHa: ACEQUIA_TOPO_SEMILLA_HA');
  });
});
