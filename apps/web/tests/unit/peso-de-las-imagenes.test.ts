/**
 * Lo que hay en `public/img`: que esté usado, que sea una imagen y que no pese
 * de más.
 *
 * El 15/11/2026 eran 200 MB en 235 archivos, y nada de eso se notaba desde
 * adentro: una carpeta con fotos de sobra no rompe ningún build.
 *
 *  1. **39 MB no los nombraba nadie.** Entre ellos `img/biocosmetica/drive/`,
 *     que era un volcado de Google Drive: cinco fotos repetidas byte por byte
 *     de las que sí se usan y **diez archivos con extensión `.jpg` que no eran
 *     imágenes** —eran páginas HTML del visor de Drive, descargas fallidas
 *     guardadas con el nombre de la foto. 8,8 MB de HTML servidos como fotos.
 *  2. **Las fotos que sí se usan venían del teléfono y del drone a 4000 y
 *     5400 px.** `deviceSizes` en `next.config.mjs` llega hasta 1920: todo lo
 *     que pasa de ahí se tira en cada transformación, y se vuelve a tirar en
 *     la siguiente. Peor con el `og:image`, que **no pasa por el optimizador**
 *     —se sirve el archivo crudo—: la previsualización de `/servicios` al
 *     compartir el link eran 11,8 MB.
 *  3. **Dos galerías mostraban la misma foto dos veces.** `armonia/29.jpg` era
 *     `armonia/6.jpg` con otro nombre y `bioarquitectura/12.jpeg` era
 *     `bioarquitectura/1.jpg`, que además era el encabezado de esa misma
 *     página. Nadie lo ve leyendo el código: son dos rutas distintas.
 *
 * Quedaron 65 MB. Estos cuatro tests son lo que impide que vuelva a subir.
 */
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative } from 'node:path';
import { PROYECTOS, fotoDeEncabezado } from '@/lib/proyectos/datos';
import { COURSES } from '@/lib/courses/data';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IMG = join(RAIZ, 'public', 'img');

/**
 * 2560 px de lado mayor y 2,5 MB por archivo.
 *
 * El ancho más grande que sirve Next son 1920 (`deviceSizes`); 2560 deja
 * margen para agregar un ancho más sin tener que reponer las fotos. El tope de
 * peso es el que hoy cumplen las 230: el más pesado es `servicios/3.jpg`, una
 * foto de mucho detalle, con 2,06 MB.
 */
const LADO_MAXIMO = 2560;
const PESO_MAXIMO = 2.5 * 1024 * 1024;

/**
 * Los archivos que no nombra ninguna página y aun así se quedan. Cada uno con
 * el motivo: si no hay motivo, sobra y se borra.
 */
const SIN_USAR_A_PROPOSITO: Record<string, string> = {
  // Las lee `shop.products` en la base (`gallery` y `attributes.cover_url`),
  // que este repo no puede ver con un grep.
  '/img/ebooks/manual-bioconstruccion.svg': 'tapa del ebook, la guarda la base',
  '/img/ebooks/manual-diseno-simbiotico.svg': 'tapa del ebook, la guarda la base',
  '/img/biocosmetica/unguento-1.png': 'foto de producto, la guarda la base',
  // Marca. No se borran por no estar en una página.
  '/img/logos/ayt-original.png': 'logo Arte y Tierra',
  '/img/logos/ayt-marron.png': 'logo Arte y Tierra',
  '/img/logos/tp-escuela.png': 'logo Tay Pichín Escuela',
  '/img/logos/tp-hostel.png': 'logo Tay Pichín Hostel',
  '/img/acequia/isotipo-color.svg': 'isotipo de acequia',
  '/img/acequia/isotipo-blanco.svg': 'isotipo de acequia',
};

/**
 * Archivos que viven bajo `public/img` y NO son imágenes de la web.
 *
 * Son material de archivo guardado ahí a mano: el original de cámara de una
 * obra y el PDF de un anteproyecto. Ninguna página los sirve, así que las
 * reglas de peso, de lado y de formato no les aplican —el original de cámara
 * mide 3840 px y pesa 2,9 MB justamente por ser el original, y un PDF no tiene
 * firma de imagen porque no lo es—. Quedan afuera de `TODAS`: si alguna vez
 * una página los nombra, hay que redimensionarlos y sacarlos de esta lista.
 *
 * Nada que se publique entra acá. Esta lista no es la puerta de atrás para
 * subir una foto pesada: para eso está `SIN_USAR_A_PROPOSITO`, que sí pasa por
 * el peso y el lado.
 */
const NO_SON_IMAGENES_DE_LA_WEB: Record<string, string> = {
  '/img/proyectos/alihuen/IMG_20240302_113305 (1).jpg': 'original de cámara, archivo de obra',
  '/img/servicios/Anteproyecto Lili.pdf': 'PDF del anteproyecto, no es una imagen',
};

/** Todos los archivos bajo `public/img`, como rutas web (`/img/...`). */
function archivos(carpeta: string): string[] {
  const salida: string[] = [];
  for (const entrada of readdirSync(carpeta)) {
    const camino = join(carpeta, entrada);
    if (statSync(camino).isDirectory()) salida.push(...archivos(camino));
    else salida.push('/' + relative(join(RAIZ, 'public'), camino).replace(/\\/g, '/'));
  }
  return salida;
}

const TODAS = archivos(IMG).filter((web) => !(web in NO_SON_IMAGENES_DE_LA_WEB));
const enDisco = (web: string) => join(RAIZ, 'public', web.slice(1));

/** Todo archivo de código bajo una carpeta. */
function fuentes(carpeta: string): string[] {
  const salida: string[] = [];
  for (const entrada of readdirSync(carpeta)) {
    if (entrada === 'node_modules' || entrada.startsWith('.')) continue;
    const camino = join(carpeta, entrada);
    if (statSync(camino).isDirectory()) salida.push(...fuentes(camino));
    else if (/\.(ts|tsx)$/.test(entrada)) salida.push(camino);
  }
  return salida;
}

/**
 * El ancho y el alto leídos del encabezado del archivo. Sin dependencias: PNG
 * trae las medidas en el IHDR a partir del byte 16; JPEG hay que recorrerlo
 * marcador por marcador hasta el SOF (cualquier 0xFFC_ menos C4, C8 y CC);
 * WebP las trae en el chunk VP8/VP8L/VP8X.
 */
function medidas(archivo: string): [number, number] | null {
  const b = readFileSync(archivo);
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const tipo = b.toString('ascii', 12, 16);
    if (tipo === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (tipo === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (tipo === 'VP8L') {
      const n = b.readUInt32LE(21);
      return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)];
    }
    return null;
  }
  if (b.readUInt16BE(0) !== 0xffd8) return null; // no es JPEG
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
  return null;
}

describe('ninguna imagen pesa ni mide de más', () => {
  it(`ningún lado pasa de ${LADO_MAXIMO} px`, () => {
    const grandes: string[] = [];
    for (const web of TODAS) {
      if (web.endsWith('.svg')) continue;
      const m = medidas(enDisco(web));
      if (!m) continue; // lo agarra el test de formato
      const [ancho, alto] = m;
      if (Math.max(ancho, alto) > LADO_MAXIMO) grandes.push(`${web} (${ancho}×${alto})`);
    }
    expect(
      grandes,
      `Next nunca sirve más de 1920 px de ancho. Estas tienen de sobra:\n  ${grandes.join('\n  ')}`,
    ).toEqual([]);
  });

  it('ningún archivo pasa de 2,5 MB', () => {
    const pesadas = TODAS.map((web) => ({ web, bytes: statSync(enDisco(web)).size }))
      .filter((a) => a.bytes > PESO_MAXIMO)
      .map((a) => `${a.web} (${(a.bytes / 1048576).toFixed(2)} MB)`);
    expect(
      pesadas,
      `el og:image se sirve crudo, sin optimizar. Estas pesan de más:\n  ${pesadas.join('\n  ')}`,
    ).toEqual([]);
  });
});

describe('todo lo que está en public/img es una imagen', () => {
  it('ningún archivo miente con la extensión', () => {
    const firmas: Record<string, (b: Buffer) => boolean> = {
      jpg: (b) => b.readUInt16BE(0) === 0xffd8,
      jpeg: (b) => b.readUInt16BE(0) === 0xffd8,
      png: (b) => b.readUInt32BE(0) === 0x89504e47,
      webp: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
      svg: (b) => /<svg[\s>]/i.test(b.toString('utf8', 0, 2048)),
    };
    const mentirosos: string[] = [];
    for (const web of TODAS) {
      const ext = web.split('.').pop()!.toLowerCase();
      const comprueba = firmas[ext];
      expect(comprueba, `extensión desconocida en ${web}`).toBeDefined();
      if (!comprueba!(readFileSync(enDisco(web)))) mentirosos.push(web);
    }
    expect(
      mentirosos,
      `se llaman imagen y no lo son:\n  ${mentirosos.join('\n  ')}`,
    ).toEqual([]);
  });
});

describe('ninguna galería muestra dos veces la misma foto', () => {
  const huella = (web: string) => createHash('md5').update(readFileSync(enDisco(web))).digest('hex');

  // No alcanza con comparar nombres: `armonia/29.jpg` y `armonia/6.jpg` eran
  // dos rutas distintas con el mismo contenido, y la ficha las mostraba las
  // dos. Se comparan los bytes.
  const galerias: Array<{ nombre: string; fotos: string[] }> = [
    ...PROYECTOS.map((p) => ({
      nombre: `proyecto ${p.slug}`,
      fotos: [...p.fotos, p.portada, fotoDeEncabezado(p)],
    })),
    ...Object.values(COURSES).map((c) => ({
      nombre: `curso ${c.slug}`,
      fotos: [c.heroImg, ...c.galeria],
    })),
  ];

  it.each(galerias)('$nombre', ({ fotos }) => {
    const vistas = new Map<string, string>();
    const repetidas: string[] = [];
    for (const foto of new Set(fotos)) {
      const h = huella(foto);
      const antes = vistas.get(h);
      if (antes) repetidas.push(`${antes} y ${foto} son el mismo archivo`);
      else vistas.set(h, foto);
    }
    expect(repetidas, repetidas.join('\n  ')).toEqual([]);
  });
});

describe('nada se queda en public/img sin que lo use alguien', () => {
  it('cada archivo lo nombra una página o está en la lista de excepciones', () => {
    // Las rutas escritas enteras en el código, más las que arma el helper
    // `fotos()` de los proyectos, que se expanden importando el módulo.
    const usadas = new Set<string>();
    const RUTA = /["'`](\/img\/[A-Za-z0-9_./()-]+\.(?:jpg|jpeg|JPG|png|webp|svg|avif))["'`]/g;
    for (const archivo of ['app', 'components', 'lib'].flatMap((c) => fuentes(join(RAIZ, c)))) {
      for (const [, ruta] of readFileSync(archivo, 'utf8').matchAll(RUTA)) usadas.add(ruta!);
    }
    for (const p of PROYECTOS) for (const f of p.fotos) usadas.add(f);

    const sobran = TODAS.filter((web) => !usadas.has(web) && !(web in SIN_USAR_A_PROPOSITO));
    expect(
      sobran,
      `nadie las nombra. Si tienen que quedarse, van a SIN_USAR_A_PROPOSITO con el motivo:\n  ${sobran.join('\n  ')}`,
    ).toEqual([]);
  });

  it('la lista de excepciones no tiene fantasmas', () => {
    const fantasmas = Object.keys(SIN_USAR_A_PROPOSITO).filter((web) => !TODAS.includes(web));
    expect(fantasmas, `ya no están en public/:\n  ${fantasmas.join('\n  ')}`).toEqual([]);
  });

  it('lo que no es imagen de la web sigue estando, y nadie lo nombra', () => {
    const idas = Object.keys(NO_SON_IMAGENES_DE_LA_WEB).filter((web) => {
      try {
        statSync(enDisco(web));
        return false;
      } catch {
        return true;
      }
    });
    expect(idas, `ya no están en public/:\n  ${idas.join('\n  ')}`).toEqual([]);
  });
});
