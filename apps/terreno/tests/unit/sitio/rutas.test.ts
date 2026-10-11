import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ACEQUIA_APP_URL, RUTAS_PUBLICAS, RUTAS_PRIVADAS } from '@/lib/sitio';

/**
 * El guardián de `robots.txt` y `sitemap.xml`.
 *
 * Lo que esto protege no es el SEO: es que una pantalla nueva no quede sin
 * decisión. Agregar `app/facturacion/page.tsx` y no tocar nada más dejaría una
 * ruta que ningún `Disallow` cubre y que ningún sitemap anuncia — o sea,
 * abierta al crawler por omisión. El test recorre `app/`, junta las rutas
 * reales y exige que cada una esté o en `RUTAS_PUBLICAS` o cubierta por
 * `RUTAS_PRIVADAS`.
 *
 * Es el mismo criterio que el test de la guía contra el riel: lo que se escribe
 * a mano se compara contra lo que el código realmente tiene.
 */

const APP = join(__dirname, '..', '..', '..', 'app');

/** Las rutas que `app/` define de verdad, leídas del árbol de archivos. */
function rutasDeLaApp(): string[] {
  const out: string[] = [];
  const recorrer = (dir: string, prefijo: string) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      if (!entrada.isDirectory()) continue;
      // Los grupos de rutas `(nombre)` no aportan segmento a la URL; los
      // privados `_nombre` no son rutas.
      if (entrada.name.startsWith('_')) continue;
      const hijo = join(dir, entrada.name);
      const seg = entrada.name.startsWith('(') ? '' : `/${entrada.name}`;
      const ruta = prefijo + seg;
      const archivos = readdirSync(hijo);
      if (archivos.includes('page.tsx') || archivos.includes('page.ts')) out.push(ruta);
      recorrer(hijo, ruta);
    }
  };
  recorrer(APP, '');
  return out.sort();
}

/** ¿`RUTAS_PRIVADAS` cubre esta ruta? Prefijo, como lo lee un crawler. */
function estaBloqueada(ruta: string): boolean {
  return RUTAS_PRIVADAS.some(p => ruta === p || ruta.startsWith(p + '/'));
}

describe('rutas públicas y privadas de acequia', () => {
  it('encuentra las rutas de la app', () => {
    const rutas = rutasDeLaApp();
    expect(rutas.length).toBeGreaterThan(8);
    expect(rutas).toContain('/guia');
    expect(rutas).toContain('/mapa');
  });

  it('cada ruta de la app está declarada pública o bloqueada', () => {
    const publicas = new Set(RUTAS_PUBLICAS.map(r => r.path));
    const sinDecidir = rutasDeLaApp().filter(r => !publicas.has(r) && !estaBloqueada(r));
    expect(
      sinDecidir,
      'rutas nuevas sin decidir si se indexan (tocá RUTAS_PUBLICAS o RUTAS_PRIVADAS en lib/sitio.ts):\n' +
        sinDecidir.join('\n'),
    ).toEqual([]);
  });

  it('ninguna ruta pública está además bloqueada', () => {
    // Anunciar en el sitemap algo que robots prohíbe es la contradicción que
    // hace que Search Console marque el sitio y nadie entienda por qué.
    const contradictorias = RUTAS_PUBLICAS.filter(r => estaBloqueada(r.path));
    expect(contradictorias.map(r => r.path)).toEqual([]);
  });

  it('ninguna ruta pública está detrás del login', () => {
    // `middleware.ts` es quien manda de verdad. Si una ruta del sitemap está en
    // RUTAS_PROTEGIDAS, el crawler recibe una redirección a /login y la página
    // nunca se indexa, aunque el sitemap insista.
    const mw = readFileSync(join(__dirname, '..', '..', '..', 'middleware.ts'), 'utf8');
    const bloque = mw.match(/RUTAS_PROTEGIDAS\s*=\s*\[([^\]]*)\]/);
    expect(bloque?.[1], 'no se encontró `RUTAS_PROTEGIDAS` en middleware.ts').toBeTruthy();
    const protegidas = [...bloque![1]!.matchAll(/'([^']+)'/g)].map(m => m[1]!);
    const atrapadas = RUTAS_PUBLICAS
      .map(r => r.path)
      .filter(p => protegidas.some(pr => p === pr || p.startsWith(pr + '/')));
    expect(atrapadas, 'rutas del sitemap que el middleware manda a /login:\n' + atrapadas.join('\n')).toEqual([]);
  });

  it('la dirección canónica no es localhost ni el dominio viejo', () => {
    // El error que este módulo viene a evitar: `NEXT_PUBLIC_SITE_URL` vale
    // `http://localhost:3001` en desarrollo, y un sitemap armado con ella
    // publica direcciones que no existen.
    expect(ACEQUIA_APP_URL).toMatch(/^https:\/\//);
    expect(ACEQUIA_APP_URL).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(ACEQUIA_APP_URL).not.toMatch(/terreno\.arteytierra\.org/);
  });
});
