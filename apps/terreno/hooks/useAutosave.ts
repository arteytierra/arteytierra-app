'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import {
  guardarAutosave, leerAutosave, limpiarAutosave, tieneContenido, type AutosaveDoc,
} from '@/lib/autosave';
import type { Mojon } from '@/lib/types';
import type { Proyecto } from '@/lib/proyectos';

interface Params {
  mojones:        Mojon[];
  metadatos:      Record<string, unknown>;
  proyectoActual: Proyecto | null;
  capturaTitulo:  string;
  /** ¿Hay contenido real que valga la pena autoguardar? (lo calcula el padre). */
  hayContenido:   boolean;
}

export interface AutosaveApi {
  banner:   AutosaveDoc | null;
  min:      boolean;
  setMin:   (v: boolean) => void;
  /** Borra el borrador de localStorage y oculta el banner (no toca el flag sucio). */
  limpiar:  () => void;
  /** Flag "hay cambios sin guardar" (beforeunload + restaurar/limpiar del padre). */
  dirtyRef: MutableRefObject<boolean>;
}

/**
 * Autosave del trabajo en curso en localStorage. Extraído tal cual de
 * MapaTerrenoApp (Fase A del refactor): misma lógica y —clave— las MISMAS
 * dependencias del efecto de escritura, para no cambiar cuándo se autoguarda.
 */
export function useAutosave({ mojones, metadatos, proyectoActual, capturaTitulo, hayContenido }: Params): AutosaveApi {
  const [banner, setBanner] = useState<AutosaveDoc | null>(null);
  const [min, setMin] = useState(false);
  const dirtyRef = useRef(false);

  // `hayContenido` se lee fresco dentro del efecto de escritura sin ensanchar
  // sus deps: se preserva el disparo original (mojones/metadatos/id/título).
  const hayContenidoRef = useRef(hayContenido);
  hayContenidoRef.current = hayContenido;

  // El banner se colapsa a un chip a los 9 s para no tapar el mapa.
  useEffect(() => {
    if (!banner) { setMin(false); return; }
    setMin(false);
    const t = setTimeout(() => setMin(true), 9000);
    return () => clearTimeout(t);
  }, [banner]);

  // Montaje: si hay un borrador con contenido, ofrecerlo.
  useEffect(() => {
    const saved = leerAutosave();
    if (saved && tieneContenido(saved)) setBanner(saved);
  }, []);

  // Escribir en cada cambio (mismas deps que el original en MapaTerrenoApp).
  useEffect(() => {
    if (!hayContenidoRef.current) return;
    dirtyRef.current = true;
    guardarAutosave({
      mojones,
      metadatos,
      nombre:           proyectoActual?.nombre ?? '',
      proyectoActualId: proyectoActual?.id ?? null,
      capturaTitulo,
      savedAt:          new Date().toISOString(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mojones, metadatos, proyectoActual?.id, capturaTitulo]);

  // Aviso del navegador si hay cambios sin guardar.
  useEffect(() => {
    const handle = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, []);

  const limpiar = useCallback(() => {
    limpiarAutosave();
    setBanner(null);
  }, []);

  return { banner, min, setMin, limpiar, dirtyRef };
}
