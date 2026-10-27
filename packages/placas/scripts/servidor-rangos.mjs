/**
 * Servidor estático CON peticiones por rango, para controlar los videos en un
 * navegador de verdad.
 *
 * Hace falta porque `python -m http.server` no implementa `Range`, y sin eso el
 * navegador no puede BUSCAR dentro del video: `currentTime = 2` vuelve a 0 al
 * instante y el control informa que la pieza no se puede recorrer cuando el que
 * no puede es el servidor. Las cuatro lecturas se recorren justamente así.
 */
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const RAIZ = process.argv[2];
const PUERTO = Number(process.argv[3] ?? 8732);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

createServer((req, res) => {
  const limpia = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const rel = limpia === '/' ? '/_control.html' : limpia;
  const archivo = path.join(RAIZ, path.normalize(rel).replace(/^[\\/]+/, ''));
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }

  let st;
  try { st = statSync(archivo); } catch { res.writeHead(404).end('no está'); return; }

  const tipo = TIPOS[path.extname(archivo).toLowerCase()] ?? 'application/octet-stream';
  const comunes = { 'Content-Type': tipo, 'Cache-Control': 'no-store' };

  const rango = req.headers.range;
  if (rango) {
    const m = /bytes=(\d*)-(\d*)/.exec(rango);
    const desde = m?.[1] ? Number(m[1]) : 0;
    const hasta = m?.[2] ? Number(m[2]) : st.size - 1;
    res.writeHead(206, {
      ...comunes,
      'Content-Range': `bytes ${desde}-${hasta}/${st.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': hasta - desde + 1,
    });
    createReadStream(archivo, { start: desde, end: hasta }).pipe(res);
    return;
  }

  res.writeHead(200, { ...comunes, 'Accept-Ranges': 'bytes', 'Content-Length': st.size });
  if (req.method === 'HEAD') { res.end(); return; }
  createReadStream(archivo).pipe(res);
}).listen(PUERTO, '127.0.0.1', () => {
  process.stdout.write(`sirviendo ${RAIZ} en http://127.0.0.1:${PUERTO}\n`);
});
