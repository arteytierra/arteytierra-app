'use client';

import type { Mojon } from './types';

const KEY = 'terreno_autosave_v1';

export interface AutosaveDoc {
  mojones: Mojon[];
  metadatos: Record<string, unknown>;
  nombre: string;
  proyectoActualId: string | null;
  capturaTitulo: string;
  savedAt: string;
}

let _timer: ReturnType<typeof setTimeout> | null = null;

export function guardarAutosave(doc: AutosaveDoc): void {
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(doc));
    } catch {
      // modo incógnito o storage lleno — ignorar silenciosamente
    }
  }, 800);
}

export function leerAutosave(): AutosaveDoc | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AutosaveDoc;
  } catch {
    return null;
  }
}

export function limpiarAutosave(): void {
  if (_timer) { clearTimeout(_timer); _timer = null; }
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}

export function tieneContenido(doc: AutosaveDoc): boolean {
  return doc.mojones.length > 0 || Object.keys(doc.metadatos).length > 0;
}
