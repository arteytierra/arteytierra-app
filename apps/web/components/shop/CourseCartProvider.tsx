'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface CourseCartItem {
  slug: string;
  name: string;
  optionId: string;
  optionLabel: string;
  precio: string;
}

interface CourseCartCtx {
  items: CourseCartItem[];
  add: (item: CourseCartItem) => void;
  remove: (slug: string, optionId: string) => void;
  clear: () => void;
  count: number;
}

const Ctx = createContext<CourseCartCtx | null>(null);
const KEY = 'ayt_course_cart';

export function useCourseCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCourseCart: falta <CourseCartProvider>');
  return ctx;
}

export function CourseCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CourseCartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setItems(JSON.parse(stored) as CourseCartItem[]);
    } catch {}
  }, []);

  const add = useCallback((item: CourseCartItem) => {
    setItems(prev => {
      const filtered = prev.filter(i => !(i.slug === item.slug && i.optionId === item.optionId));
      const next = [...filtered, item];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const remove = useCallback((slug: string, optionId: string) => {
    setItems(prev => {
      const next = prev.filter(i => !(i.slug === slug && i.optionId === optionId));
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(KEY); } catch {}
  }, []);

  return (
    <Ctx.Provider value={{ items, add, remove, clear, count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}
