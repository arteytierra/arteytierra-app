/**
 * Las fichas de obra: que existan, que estén completas y que nadie vuelva a
 * escribir los proyectos por séptima vez.
 *
 * Dos fallas reales el 15/11/2026, las dos invisibles desde adentro:
 *
 *  1. **Las seis tarjetas de la portada llevaban a la lista.** Clic en la Casa
 *     del Chelo y aparecía la Casa Aurea. No es un error: es un `href` que
 *     dice `/proyectos` seis veces, y nada en el build lo nota.
 *  2. **La portada inglesa y `/en/proyectos` enlazaban a `/proyectos/<slug>`,
 *     que no existía.** Doce links a un 404, en producción, durante meses.
 *     Un link roto tampoco rompe nada: hay que pedir la URL para enterarse.
 *
 * Y la causa de fondo de los textos que se contradecían entre idiomas era que
 * los seis proyectos estaban escritos en seis archivos. Por eso el último test
 * mira que ninguna página vuelva a declararlos: la regresión no es que el
 * texto quede mal, es que vuelva a haber dos dueños.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  PROYECTOS,
  SLUGS_PROYECTOS,
  etiquetas,
  fotoDeEncabezado,
  lugarCortoYAnio,
  lugarYAnio,
  proyectoPorSlug,
  vecinos,
} from '@/lib/proyectos/datos';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLICO = (ruta: string) => join(RAIZ, 'public', ruta.replace(/^\//, ''));
const fuente = (...partes: string[]) => readFileSync(join(RAIZ, ...partes), 'utf8');

/**
 * El ancho y el alto de un JPEG o un PNG, leídos del encabezado.
 *
 * Sin dependencias a propósito: son veinte líneas y la alternativa es sumar
 * una librería de imágenes al test. PNG trae las medidas en el IHDR, que
 * siempre arranca en el byte 16. JPEG hay que recorrerlo marcador por
 * marcador hasta el SOF, que es cualquier 0xFFC_ menos C4 (tablas Huffman),
 * C8 (extensión JPEG) y CC (codificación aritmética).
 */
function medidas(archivo: string): [number, number] {
  const b = readFileSync(archivo);
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marcador = b[i + 1]!;
    if (marcador >= 0xc0 && marcador <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marcador)) {
      return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`no se pudieron leer las medidas de ${archivo}`);
}

describe('las fotos de cada obra', () => {
  it('todas las que declara el módulo están en public/', () => {
    // Las rutas se arman con un helper (`/img/proyectos/armonia/${i+1}.jpg`),
    // así que el test de imágenes referenciadas —que busca rutas escritas
    // entre comillas— no las ve. Acá se recorre la lista ya construida.
    const faltan: string[] = [];
    for (const p of PROYECTOS) {
      for (const foto of [p.portada, ...p.fotos]) {
        if (!existsSync(PUBLICO(foto))) faltan.push(`${p.slug} → ${foto}`);
      }
    }
    expect(faltan, `fotos que el sitio nombra y no están:\n  ${faltan.join('\n  ')}`).toEqual([]);
  });

  it('no deja ninguna foto de la carpeta afuera de la galería', () => {
    // Al revés que el anterior: si alguien suma fotos a la carpeta y no las
    // declara, la ficha muestra menos obra de la que hay y nadie se entera.
    const olvidadas: string[] = [];
    for (const p of PROYECTOS) {
      const carpeta = join(RAIZ, 'public', 'img', 'proyectos', p.slug);
      if (!existsSync(carpeta)) continue;
      const declaradas = new Set(p.fotos.map((f) => f.split('/').pop()));
      for (const archivo of readdirSync(carpeta)) {
        if (!declaradas.has(archivo)) olvidadas.push(`${p.slug}/${archivo}`);
      }
    }
    expect(olvidadas, `fotos en la carpeta que la ficha no muestra:\n  ${olvidadas.join('\n  ')}`).toEqual([]);
  });

  it('la portada y el encabezado de cada proyecto son fotos suyas', () => {
    for (const p of PROYECTOS) {
      expect(p.fotos, p.slug).toContain(p.portada);
      expect(p.fotos, p.slug).toContain(fotoDeEncabezado(p));
    }
  });

  it('la foto del encabezado es apaisada y grande', () => {
    // El encabezado es una banda de ancho completo. Una foto vertical de
    // teléfono ahí se estira y se recorta hasta no querer decir nada:
    // `chelo/1.jpg` son 768×1024 y por eso esa ficha tiene su propia `hero`.
    // El mínimo son 1280 px de ancho —el ancho de la grilla editorial es
    // 1280— y que no sea más alta que ancha.
    const malas: string[] = [];
    for (const p of PROYECTOS) {
      const foto = fotoDeEncabezado(p);
      const [ancho, alto] = medidas(PUBLICO(foto));
      if (ancho < 1280 || alto > ancho) malas.push(`${p.slug} → ${foto} (${ancho}×${alto})`);
    }
    expect(malas, `encabezados que no sirven de encabezado:\n  ${malas.join('\n  ')}`).toEqual([]);
  });
});

describe('la ruta de la ficha', () => {
  const ficha = fuente('app', 'proyectos', '[slug]', 'page.tsx');

  it('prerenderiza los seis slugs y no acepta ninguno más', () => {
    // `dynamicParams = false` es lo que hace que /proyectos/lo-que-sea sea un
    // 404 y no una ficha vacía armada en caliente.
    expect(ficha).toMatch(/export const dynamicParams = false/);
    expect(ficha).toMatch(/export function generateStaticParams/);
    expect(SLUGS_PROYECTOS).toHaveLength(6);
    expect(new Set(SLUGS_PROYECTOS).size).toBe(6);
  });

  it('un slug que no existe no devuelve una ficha', () => {
    expect(proyectoPorSlug('la-casa-de-nadie')).toBeUndefined();
    expect(vecinos('la-casa-de-nadie')).toBeNull();
  });

  it('cada ficha tiene a dónde seguir, y nunca a sí misma', () => {
    for (const p of PROYECTOS) {
      const v = vecinos(p.slug)!;
      expect(v.anterior.slug, p.slug).not.toBe(p.slug);
      expect(v.siguiente.slug, p.slug).not.toBe(p.slug);
    }
  });
});

describe('las tarjetas llevan a la ficha y no a la lista', () => {
  it('la portada castellana enlaza cada proyecto a su ficha', () => {
    const portada = fuente('app', 'page.tsx');
    expect(portada).toMatch(/href=\{`\/proyectos\/\$\{p\.slug\}`\}/);
  });

  it('la lista enlaza cada tarjeta a su ficha', () => {
    const tarjeta = fuente('components', 'proyectos', 'ProjectCard.tsx');
    expect(tarjeta).toMatch(/\/proyectos\/\$\{project\.slug\}/);
  });
});

describe('un solo dueño de los datos de obra', () => {
  const paginas = [
    ['app', 'page.tsx'],
    ['app', 'proyectos', 'page.tsx'],
    ['app', 'en', 'page.tsx'],
    ['app', 'en', 'proyectos', 'page.tsx'],
    ['app', 'fr', 'page.tsx'],
    ['app', 'fr', 'proyectos', 'page.tsx'],
  ];

  it('ninguna página declara su propia lista de proyectos', () => {
    const culpables: string[] = [];
    for (const partes of paginas) {
      const texto = fuente(...partes);
      if (/const PROYECTOS\s*(:[^=]+)?=\s*\[/.test(texto) || /const PROJECTS\s*(:[^=]+)?=\s*\[/.test(texto)) {
        culpables.push(partes.join('/'));
      }
    }
    expect(culpables, `vuelven a tener su propia copia:\n  ${culpables.join('\n  ')}`).toEqual([]);
  });

  it('las seis páginas leen del módulo', () => {
    for (const partes of paginas) {
      expect(fuente(...partes), partes.join('/')).toMatch(/from '@\/lib\/proyectos\/datos'/);
    }
  });
});

describe('lo que no sabemos no se publica', () => {
  it('el SUM Árbol de Piedra sigue sin año, y la línea no queda colgada', () => {
    // La página francesa le había puesto «· 2023». Ese año no salió de ningún
    // lado: apareció al traducir.
    const sum = proyectoPorSlug('sum-arbol-piedra')!;
    expect(sum.anio).toBe('');
    expect(lugarYAnio(sum)).toBe('San Marcos Sierras, Córdoba, Argentina');
    expect(lugarCortoYAnio(sum)).toBe('San Marcos Sierras');
    expect(lugarYAnio(sum).trim()).not.toMatch(/·$/);
  });

  it('las etiquetas no muestran campos vacíos', () => {
    for (const p of PROYECTOS) {
      for (const idioma of ['es', 'en', 'fr'] as const) {
        for (const e of etiquetas(p, idioma)) {
          expect(e.trim(), `${p.slug}/${idioma}`).not.toBe('');
        }
      }
      // El SUM no tiene superficie, ni duración, ni gente nombrada: una sola.
      if (p.slug === 'sum-arbol-piedra') expect(etiquetas(p)).toHaveLength(1);
    }
  });

  it('a la gente no se la traduce: los nombres salen sólo en castellano', () => {
    // «Susana e hijos» en una tarjeta en francés es media frase en
    // castellano, y traducirlo obliga a elegirle el pronombre a alguien real.
    const conNombre = PROYECTOS.filter((p) => p.habitan);
    expect(conNombre.length).toBeGreaterThan(0);
    for (const p of conNombre) {
      expect(etiquetas(p, 'es'), p.slug).toContain(p.habitan);
      expect(etiquetas(p, 'en'), p.slug).not.toContain(p.habitan);
      expect(etiquetas(p, 'fr'), p.slug).not.toContain(p.habitan);
    }
  });

  it('cada proyecto tiene resumen y tipo en los tres idiomas, y relato en castellano', () => {
    for (const p of PROYECTOS) {
      for (const idioma of ['es', 'en', 'fr'] as const) {
        expect(p.resumen[idioma]?.length, `${p.slug}/${idioma}`).toBeGreaterThan(40);
        expect(p.tipo[idioma]?.length, `${p.slug}/${idioma}`).toBeGreaterThan(3);
        expect(p.rol[idioma]?.length, `${p.slug}/${idioma}`).toBeGreaterThan(3);
      }
      expect(p.relato.length, p.slug).toBeGreaterThan(0);
      expect(p.tecnicas.length, p.slug).toBeGreaterThan(0);
      for (const bloque of p.relato) {
        expect(bloque.titulo.trim(), p.slug).not.toBe('');
        expect(bloque.texto.trim().length, `${p.slug}/${bloque.titulo}`).toBeGreaterThan(20);
      }
    }
  });
});

describe('las fichas están en el sitemap', () => {
  const sitemap = fuente('app', 'sitemap.ts');

  it('se agregan desde el módulo y sin alternates', () => {
    // Declarar `/en/proyectos/armonia` sería prometerle a Google una
    // alternativa que devuelve 404: la ficha existe sólo en castellano.
    expect(sitemap).toMatch(/for \(const p of PROYECTOS\)/);
    const bloque = sitemap.slice(sitemap.indexOf('for (const p of PROYECTOS)'));
    expect(bloque.slice(0, bloque.indexOf('try {'))).not.toMatch(/alternates/);
  });
});
