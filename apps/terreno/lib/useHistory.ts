import { useState, useRef, useCallback } from 'react';

interface HistoryResult<T> {
  present:  T;
  canUndo:  boolean;
  canRedo:  boolean;
  /** Commit un cambio al historial (Ctrl+Z puede revertirlo) */
  commit:   (next: T | ((prev: T) => T)) => void;
  /** Reemplaza sin registrar historial — para cargar proyectos/autosave */
  replace:  (next: T) => void;
  undo:     () => void;
  redo:     () => void;
}

export function useHistory<T>(initial: T, maxSize = 50): HistoryResult<T> {
  const [state, setState] = useState<{ present: T; canUndo: boolean; canRedo: boolean }>({
    present: initial, canUndo: false, canRedo: false,
  });
  const past   = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const commit = useCallback((next: T | ((prev: T) => T)) => {
    setState(s => {
      const n = typeof next === 'function' ? (next as (p: T) => T)(s.present) : next;
      past.current   = [...past.current.slice(-(maxSize - 1)), s.present];
      future.current = [];
      return { present: n, canUndo: true, canRedo: false };
    });
  }, [maxSize]);

  const replace = useCallback((next: T) => {
    past.current   = [];
    future.current = [];
    setState({ present: next, canUndo: false, canRedo: false });
  }, []);

  const undo = useCallback(() => {
    setState(s => {
      if (past.current.length === 0) return s;
      const restored = past.current[past.current.length - 1]!;
      future.current = [s.present, ...future.current.slice(0, maxSize - 1)];
      past.current   = past.current.slice(0, -1);
      return { present: restored, canUndo: past.current.length > 0, canRedo: true };
    });
  }, [maxSize]);

  const redo = useCallback(() => {
    setState(s => {
      if (future.current.length === 0) return s;
      const restored = future.current[0]!;
      past.current   = [...past.current.slice(-(maxSize - 1)), s.present];
      future.current = future.current.slice(1);
      return { present: restored, canUndo: true, canRedo: future.current.length > 0 };
    });
  }, [maxSize]);

  return { present: state.present, canUndo: state.canUndo, canRedo: state.canRedo, commit, replace, undo, redo };
}
