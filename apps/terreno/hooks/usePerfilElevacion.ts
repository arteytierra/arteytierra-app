'use client';

import { useCallback, useState } from 'react';
import { fetchPerfilElevacion, type Camino, type PerfilElevacion } from '@/lib/caminos';

type Vertice = { lat: number; lng: number };

interface Params {
  caminos:    Camino[];
  setCaminos: (v: Camino[] | ((p: Camino[]) => Camino[])) => void;
}

/**
 * Perfil de elevación interactivo (dock inferior estilo Google Earth Pro) —
 * Fase B del refactor de MapaTerrenoApp. Dueño del dock (traza + perfil),
 * el punto bajo el cursor, y el estado de carga/error. Pide el perfil a la API
 * (fetchPerfilElevacion) y cachea el resultado dentro del camino via setCaminos.
 * Extraído tal cual: misma lógica y mismas dependencias de los handlers.
 */
export function usePerfilElevacion({ caminos, setCaminos }: Params) {
  const [perfilDock,     setPerfilDock]     = useState<{ vertices: Vertice[]; perfil: PerfilElevacion; nombre: string; color: string } | null>(null);
  const [perfilPunto,    setPerfilPunto]    = useState<Vertice | null>(null);
  const [perfilCargando, setPerfilCargando] = useState(false);
  const [perfilError,    setPerfilError]    = useState<string | null>(null);

  // Asegura la cota del DEM en la traza de un camino (para Red de agua). Lo pide si falta.
  const handleCargarPerfilCamino = useCallback(async (id: string): Promise<PerfilElevacion | null> => {
    const c = caminos.find(x => x.id === id);
    if (!c) return null;
    if (c.perfil) return c.perfil;
    const r = await fetchPerfilElevacion(c.vertices);
    if ('error' in r) return null;
    setCaminos(prev => prev.map(x => x.id === id ? { ...x, perfil: r.perfil } : x));
    return r.perfil;
  }, [caminos, setCaminos]);

  // Abre el perfil de un camino en el dock inferior interactivo (lo pide si no está cacheado).
  const handleAbrirPerfilDock = useCallback(async (camino: Camino) => {
    if (perfilDock && perfilDock.nombre === camino.nombre && perfilDock.vertices === camino.vertices) {
      setPerfilDock(null); setPerfilPunto(null); return;   // toggle
    }
    setPerfilError(null);
    if (camino.perfil) {
      setPerfilDock({ vertices: camino.vertices, perfil: camino.perfil, nombre: camino.nombre, color: camino.color });
      return;
    }
    setPerfilCargando(true);
    const r = await fetchPerfilElevacion(camino.vertices);
    setPerfilCargando(false);
    if ('error' in r) { setPerfilError(r.error); return; }
    setCaminos(prev => prev.map(c => c.id === camino.id ? { ...c, perfil: r.perfil } : c));
    setPerfilDock({ vertices: camino.vertices, perfil: r.perfil, nombre: camino.nombre, color: camino.color });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilDock]);

  return {
    perfilDock, setPerfilDock,
    perfilPunto, setPerfilPunto,
    perfilCargando,
    perfilError,
    handleCargarPerfilCamino,
    handleAbrirPerfilDock,
  };
}
