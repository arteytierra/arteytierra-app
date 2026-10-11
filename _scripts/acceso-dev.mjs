/**
 * Enlace de acceso a acequia en desarrollo, sin contraseña y sin mail.
 *
 *   node _scripts/acceso-dev.mjs [email] [ruta] [puerto]
 *   node _scripts/acceso-dev.mjs info.arteytierra@gmail.com /mapa 3001
 *
 * Para qué sirve: `/mapa` y `/informe/*` están detrás de login, así que no se
 * pueden revisar sin una sesión. Esto arma un enlace de un solo uso contra el
 * servidor de desarrollo, se abre en el navegador y queda la sesión.
 *
 * Por qué no alcanza con pedirle el enlace a Supabase: Supabase sólo redirige a
 * una URL que esté en su lista de Redirect URLs, y `localhost` no está. Si se le
 * pide un enlace apuntando a localhost, reemplaza el destino EN SILENCIO por el
 * Site URL de producción y el enlace termina abriendo la app en prod. Así que
 * acá se le pide el `hashed_token` y se arma la URL a mano: la verifica el
 * callback de la app (ver `apps/terreno/app/auth/callback/route.ts`).
 *
 * Reglas:
 *  · La clave de service-role se lee de `apps/terreno/.env.local` en el momento.
 *    No se escribe en ningún archivo, ni se imprime, ni va a un commit.
 *  · Sólo para cuentas internas del estudio (`fundador = true`). Si la cuenta no
 *    es interna, el script se niega: no es una herramienta para entrar a la
 *    cuenta de otra persona.
 *  · El enlace vale una sola vez y vence. Para otra sesión, correlo de nuevo.
 */
import fs from 'node:fs';
import path from 'node:path';

let RUTA_MODULO = decodeURIComponent(new URL(import.meta.url).pathname);
// En Windows esa ruta llega como /C:/... — se saca la barra de adelante.
if (/^.[A-Za-z]:/.test(RUTA_MODULO)) RUTA_MODULO = RUTA_MODULO.slice(1);
const AQUI = path.dirname(RUTA_MODULO);
const ENV = path.join(AQUI, '..', 'apps', 'terreno', '.env.local');

function leerEnv(archivo) {
  if (!fs.existsSync(archivo)) {
    console.error(`No existe ${archivo}. Copialo del checkout principal antes de correr esto.`);
    process.exit(1);
  }
  const env = {};
  for (const linea of fs.readFileSync(archivo, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^([A-Z0-9_]+)=(.*)$/);
    // Se limpia BOM y comillas como hace limpiarEnv() en lib/db/cache.ts.
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '').replace(/^﻿/, '');
  }
  return env;
}

const env = leerEnv(ENV);
const URL_SB = (env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, '');
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_SB || !KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env.local.');
  process.exit(1);
}

const email = process.argv[2] ?? 'info.arteytierra@gmail.com';
let ruta = process.argv[3] ?? '/mapa';
// Git Bash convierte un argumento que empieza con / en una ruta de Windows:
// '/mapa' llega como 'C:/Program Files/Git/mapa'. Se rescata el ultimo tramo.
if (ruta.includes(':')) ruta = '/' + ruta.split('/').pop();
if (!ruta.startsWith('/')) ruta = '/' + ruta;
const puerto = process.argv[4] ?? '3001';

const cabeceras = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

// 1. La cuenta tiene que existir.
const rUsuarios = await fetch(`${URL_SB}/auth/v1/admin/users?per_page=200`, { headers: cabeceras });
if (!rUsuarios.ok) {
  console.error(`No se pudo leer la lista de usuarios (HTTP ${rUsuarios.status}).`);
  process.exit(1);
}
const { users = [] } = await rUsuarios.json();
const usuario = users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase());
if (!usuario) {
  console.error(`No hay cuenta con el correo ${email}.`);
  process.exit(1);
}

// 2. Y tiene que ser interna. Mismo criterio que esCuentaInterna() en
//    apps/terreno/lib/auth/plan.ts y que el trigger de la migración 0063.
const rSub = await fetch(
  `${URL_SB}/rest/v1/suscripciones?select=fundador,provider,estado&user_id=eq.${usuario.id}`,
  { headers: { ...cabeceras, 'Accept-Profile': 'terreno' } },
);
const [sub] = await rSub.json();
if (!sub || sub.fundador !== true || sub.provider !== 'manual' || sub.estado !== 'activa') {
  console.error(
    `${email} no es una cuenta interna del estudio (fundador = true, provider = manual, estado = activa).\n` +
      'Este script no entra a cuentas de terceros.',
  );
  process.exit(1);
}

// 3. El token. El `redirect_to` que se manda lo ignora Supabase si no está en su
//    lista, así que no se usa: lo que importa es el hashed_token.
const rEnlace = await fetch(`${URL_SB}/auth/v1/admin/generate_link`, {
  method: 'POST',
  headers: cabeceras,
  body: JSON.stringify({ type: 'magiclink', email }),
});
const enlace = await rEnlace.json();
if (!enlace.hashed_token) {
  console.error(`Supabase no devolvió un token (HTTP ${rEnlace.status}).`);
  process.exit(1);
}

const destino = new URL(`http://localhost:${puerto}/auth/callback`);
destino.searchParams.set('token_hash', enlace.hashed_token);
destino.searchParams.set('type', 'magiclink');
destino.searchParams.set('next', ruta);

console.log(`\nCuenta:   ${email}`);
console.log(`Destino:  ${ruta} en localhost:${puerto}`);
console.log('Vale una sola vez y vence. Levantá el servidor antes de abrirlo:');
console.log(`  pnpm --filter @arteytierra/terreno dev\n`);
console.log(destino.toString());
console.log('');
