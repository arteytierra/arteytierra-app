'use client';
/**
 * De qué modelo de elevación sale lo que el usuario está mirando.
 *
 * Por qué existe: el router de relieve elige la mejor fuente disponible del
 * lugar (swissALTI3D en Suiza, AHN en Países Bajos, 3DEP en EE.UU., GLO-30 en
 * el resto), pero los paneles que hablan del relieve tenían "SRTM 30 m"
 * escrito a mano en el texto. Sobre un predio suizo la app decía swissALTI3D
 * en el chip del mapa y SRTM dos centímetros más abajo, al mismo tiempo.
 *
 * Se resuelve con contexto y no con props porque son ocho paneles que cuelgan
 * de ramas distintas del árbol y ninguno necesita el dato para calcular: sólo
 * para nombrarlo en una nota al pie. Pasarlo prop a prop por MapaTerrenoApp
 * —que ya es demasiado grande— habría sumado ruido en cada capa intermedia.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface FuenteRelieve {
  /** Nombre corto de la fuente en uso, p. ej. "swissALTI3D". `null` mientras no se sabe. */
  nombre: string | null;
  /** Paso efectivo en metros: el mayor entre el de la fuente y el del muestreo. */
  pasoM: number | null;
}

const SIN_DATO: FuenteRelieve = { nombre: null, pasoM: null };

const Ctx = createContext<FuenteRelieve>(SIN_DATO);

export function ProveedorRelieve({ nombre, pasoM, children }: FuenteRelieve & { children: ReactNode }) {
  const valor = useMemo(() => ({ nombre, pasoM }), [nombre, pasoM]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useFuenteRelieve(): FuenteRelieve {
  return useContext(Ctx);
}

/** "50 cm", "2 m", "1,5 m" — el paso dicho en la unidad que se lee de un vistazo. */
export function fmtPaso(m: number): string {
  if (m < 1) return `${Math.round(m * 100)} cm`;
  return `${Number.isInteger(m) ? m : m.toFixed(1)} m`;
}

/**
 * Cómo nombrar el relieve en una nota al pie: "swissALTI3D (~2 m)".
 * Mientras no se sabe cuál es, devuelve algo cierto en vez de inventar SRTM.
 */
export function useTextoRelieve(cuandoNoSeSabe = 'el modelo de elevación'): string {
  const { nombre, pasoM } = useFuenteRelieve();
  if (!nombre) return cuandoNoSeSabe;
  return pasoM != null ? `${nombre} (~${fmtPaso(pasoM)})` : nombre;
}
