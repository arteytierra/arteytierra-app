/**
 * La guía de uso no se puede quedar atrás de la app.
 *
 * Por qué existe este test. Hasta hoy había dos guías y la más completa vivía
 * en `public/guia.html`, un archivo estático que nadie compilaba: anunciaba el
 * plan Profesional a US$ 12 con proyectos ilimitados cuando ya eran US$ 15 y
 * diez, seguía diciendo "Arte y Tierra · Terreno" después del rebrand, y no
 * conocía ni Swales, ni Master Plan, ni Cortafuegos, ni Silvopastura, ni
 * Elementos, ni Infraestructuras. Una guía equivocada es exactamente el tipo de
 * falla que este repo se toma en serio: no rompe nada, y engaña.
 *
 * Lo que se puede derivar del código ya se deriva —los planes salen de
 * `ACEQUIA_PLANS`, el relieve de `grillaElevacion`— así que no hay nada que
 * testear ahí. Lo que queda escrito a mano es la lista de herramientas, y eso
 * es lo que vigila este archivo: si alguien agrega una pestaña al riel y no la
 * documenta, la compuerta lo dice con el nombre de la pestaña.
 *
 * El riel se lee como TEXTO y no se importa. `components/mapa/riel.tsx` es un
 * componente de cliente con JSX y con `lucide-react` adentro; importarlo desde
 * un test de node trae React y todo el paquete de íconos para leer una lista de
 * strings. Es el mismo criterio que usa `estetica/paleta.test.ts`: leer el
 * archivo verifica lo que Tailwind —o acá, el usuario— va a ver de verdad.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  HERRAMIENTAS, PELDANOS, PERFILES, ROTULO_HERRAMIENTA, GLOSARIO,
} from '@/lib/guia';

const RIEL = readFileSync(
  join(__dirname, '..', '..', '..', 'components', 'mapa', 'riel.tsx'),
  'utf8',
);

/** Los `id` de `TAB_DEFS`, en el orden en que los declara el riel. */
function tabsDelRiel(): string[] {
  const bloque = RIEL.match(/export const TAB_DEFS[^=]*= \[([\s\S]*?)\n\];/);
  if (!bloque?.[1]) throw new Error('no se encontró `TAB_DEFS` en riel.tsx');
  return [...bloque[1].matchAll(/\{\s*id:\s*'([a-z0-9]+)'/g)].map(m => m[1]!);
}

/** `label` por `id`, tal como los muestra el riel. */
function rotulosDelRiel(): Record<string, string> {
  const bloque = RIEL.match(/export const TAB_DEFS[^=]*= \[([\s\S]*?)\n\];/);
  if (!bloque?.[1]) throw new Error('no se encontró `TAB_DEFS` en riel.tsx');
  const salida: Record<string, string> = {};
  for (const m of bloque[1].matchAll(/\{\s*id:\s*'([a-z0-9]+)',\s*label:\s*'([^']+)'/g)) {
    salida[m[1]!] = m[2]!;
  }
  return salida;
}

/** Los `id` de los grupos del riel. */
function gruposDelRiel(): string[] {
  const bloque = RIEL.match(/export const GRUPOS_RIEL[^=]*= \[([\s\S]*?)\n\];/);
  if (!bloque?.[1]) throw new Error('no se encontró `GRUPOS_RIEL` en riel.tsx');
  return [...bloque[1].matchAll(/\{\s*id:\s*'([a-z0-9]+)'/g)].map(m => m[1]!);
}

describe('la guía conoce la app entera', () => {
  it('el riel se puede leer (si esto falla, cambió la forma de riel.tsx)', () => {
    expect(tabsDelRiel().length).toBeGreaterThan(20);
    expect(gruposDelRiel().length).toBeGreaterThan(3);
  });

  it('toda herramienta del riel está documentada', () => {
    const documentadas = new Set(HERRAMIENTAS.map(h => h.id));
    const faltan = tabsDelRiel().filter(t => !documentadas.has(t as never));
    expect(faltan, `sin ficha en lib/guia.ts: ${faltan.join(', ')}`).toEqual([]);
  });

  it('la guía no documenta herramientas que ya no existen', () => {
    const enElRiel = new Set(tabsDelRiel());
    const sobran = HERRAMIENTAS.map(h => h.id).filter(id => !enElRiel.has(id));
    expect(sobran, `ya no están en el riel: ${sobran.join(', ')}`).toEqual([]);
  });

  it('ninguna herramienta aparece dos veces', () => {
    const ids = HERRAMIENTAS.map(h => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('la guía llama a cada herramienta igual que el riel', () => {
    const rotulos = rotulosDelRiel();
    for (const [id, label] of Object.entries(rotulos)) {
      expect(ROTULO_HERRAMIENTA[id as never], `rótulo de «${id}»`).toBe(label);
    }
  });
});

describe('los peldaños', () => {
  it('cada grupo del riel es un peldaño de la guía', () => {
    const enLaGuia = new Set(PELDANOS.map(p => p.id));
    const faltan = gruposDelRiel().filter(g => !enLaGuia.has(g));
    expect(faltan, `grupos sin peldaño: ${faltan.join(', ')}`).toEqual([]);
  });

  it('toda herramienta cae en un peldaño declarado', () => {
    const peldanos = new Set(PELDANOS.map(p => p.id));
    const huerfanas = HERRAMIENTAS.filter(h => !peldanos.has(h.peldano));
    expect(huerfanas.map(h => h.id)).toEqual([]);
  });

  it('ningún peldaño queda vacío', () => {
    const vacios = PELDANOS.filter(p => !HERRAMIENTAS.some(h => h.peldano === p.id));
    expect(vacios.map(p => p.id)).toEqual([]);
  });
});

describe('las promesas de la guía', () => {
  /** La razón de ser del bloque: un manual que sólo promete es una trampa. */
  it('todo perfil dice qué es lo que acequia NO le va a dar', () => {
    for (const p of PERFILES) {
      expect(p.ojo.length, `el perfil «${p.id}» no tiene cautela`).toBeGreaterThan(40);
    }
  });

  it('los perfiles no repiten id', () => {
    const ids = PERFILES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('el glosario no define dos veces el mismo término', () => {
    const t = GLOSARIO.map(g => g.termino);
    expect(new Set(t).size).toBe(t.length);
  });
});
