import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  claveEcorregion,
  ecorregionCacheada,
  hayEcorregionCacheada,
  limpiarCacheEcorregion,
  pedirEcorregion,
} from '@/lib/ecorregionDelPunto';

/*
 * La ecorregión decide qué ecosistema tiene el predio, qué cultivos se listan y
 * cómo se corrige la aptitud de uso del suelo. Mientras no llega, la app usa la
 * heurística Köppen, que puede dar otra cosa: en Sorata el panel mostraba "Puna
 * y altoandino" y un segundo después "Puna húmeda central", con otra lista de
 * especies y otros puntajes de aptitud.
 *
 * La caché es lo que hace que eso pase una sola vez por punto y no una vez por
 * pantalla. El hook la usa para asentar el estado en el primer render.
 */

const PUNA: Record<string, unknown> = {
  eco_id: 589,
  eco_name: 'Central Andean wet puna',
  bioma_num: 10,
  bioma_name: 'Montane Grasslands & Shrublands',
};

function respuesta(status: number, cuerpo?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cuerpo ?? null,
  };
}

let fetchStub: ReturnType<typeof vi.fn>;

beforeEach(() => {
  limpiarCacheEcorregion();
  fetchStub = vi.fn();
  vi.stubGlobal('fetch', fetchStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
  limpiarCacheEcorregion();
});

describe('la clave del punto', () => {
  it('redondea a ~1 km, así que mover un mojón no reconsulta', () => {
    expect(claveEcorregion(-15.77385, -68.64438)).toBe('-15.77,-68.64');
    expect(claveEcorregion(-15.7712, -68.6449)).toBe('-15.77,-68.64');
  });

  it('distingue puntos que sí caen en otra celda', () => {
    expect(claveEcorregion(-15.77, -68.64)).not.toBe(claveEcorregion(-15.79, -68.64));
  });

  it('sin punto no hay clave, y un NaN tampoco la genera', () => {
    expect(claveEcorregion(null, -68)).toBeNull();
    expect(claveEcorregion(-15, null)).toBeNull();
    expect(claveEcorregion(Number.NaN, -68)).toBeNull();
  });
});

describe('una consulta por punto y no una por pantalla', () => {
  it('dos pedidos simultáneos comparten la misma consulta', async () => {
    fetchStub.mockResolvedValue(respuesta(200, PUNA));
    const [a, b] = await Promise.all([
      pedirEcorregion('-15.77,-68.64'),
      pedirEcorregion('-15.77,-68.64'),
    ]);
    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(a?.eco_id).toBe(589);
    expect(b).toBe(a);
  });

  it('una vez resuelta no se vuelve a pedir, y queda disponible sin esperar', async () => {
    fetchStub.mockResolvedValue(respuesta(200, PUNA));
    await pedirEcorregion('-15.77,-68.64');

    expect(hayEcorregionCacheada('-15.77,-68.64')).toBe(true);
    expect(ecorregionCacheada('-15.77,-68.64')?.eco_name).toBe('Central Andean wet puna');

    await pedirEcorregion('-15.77,-68.64');
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it('puntos distintos son consultas distintas', async () => {
    fetchStub.mockResolvedValue(respuesta(200, PUNA));
    await pedirEcorregion('-15.77,-68.64');
    await pedirEcorregion('-34.60,-58.38');
    expect(fetchStub).toHaveBeenCalledTimes(2);
  });
});

describe('qué se recuerda y qué no', () => {
  it('un 404 se recuerda: ahí no hay ecorregión terrestre y RESOLVE es de 2017', async () => {
    fetchStub.mockResolvedValue(respuesta(404));
    expect(await pedirEcorregion('0.00,-140.00')).toBeNull();
    expect(hayEcorregionCacheada('0.00,-140.00')).toBe(true);

    await pedirEcorregion('0.00,-140.00');
    expect(fetchStub).toHaveBeenCalledTimes(1);
  });

  it('un 403 se recuerda: el plan no cambia en el medio de la sesión', async () => {
    fetchStub.mockResolvedValue(respuesta(403));
    await pedirEcorregion('-15.77,-68.64');
    expect(hayEcorregionCacheada('-15.77,-68.64')).toBe(true);
  });

  it('un 503 NO se recuerda: es de RESOLVE ahora, no del punto', async () => {
    // Cachear la caída dejaría al predio sin ecorregión por el resto de la
    // sesión por un corte de tres segundos.
    fetchStub.mockResolvedValueOnce(respuesta(503));
    expect(await pedirEcorregion('-15.77,-68.64')).toBeNull();
    expect(hayEcorregionCacheada('-15.77,-68.64')).toBe(false);

    fetchStub.mockResolvedValueOnce(respuesta(200, PUNA));
    expect((await pedirEcorregion('-15.77,-68.64'))?.eco_id).toBe(589);
    expect(fetchStub).toHaveBeenCalledTimes(2);
  });

  it('un fallo de red tampoco se recuerda', async () => {
    fetchStub.mockRejectedValueOnce(new Error('sin red'));
    expect(await pedirEcorregion('-15.77,-68.64')).toBeNull();
    expect(hayEcorregionCacheada('-15.77,-68.64')).toBe(false);
  });

  it('un 200 sin eco_id numérico es "sin ecorregión", no una ecorregión rara', async () => {
    fetchStub.mockResolvedValue(respuesta(200, { eco_name: 'algo' }));
    expect(await pedirEcorregion('-15.77,-68.64')).toBeNull();
    expect(hayEcorregionCacheada('-15.77,-68.64')).toBe(true);
  });
});
