'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

interface NotificationPayload {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  url: string | null;
  read_at: string | null;
  created_at: string;
}

/**
 * Suscribe a INSERT en app.notifications filtrado por user_id.
 * Dispara `onInsert` por cada nueva notif sin polling.
 * Devuelve un cleanup function automático via useEffect.
 */
export function useNotificationsLive(
  userId: string | null | undefined,
  onInsert: (n: NotificationPayload) => void,
) {
  // mantenemos la última referencia del callback para que el effect
  // no re-suscriba si cambia el handler.
  const cbRef = useRef(onInsert);
  useEffect(() => {
    cbRef.current = onInsert;
  }, [onInsert]);

  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`notifs:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'app',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          cbRef.current(payload.new as NotificationPayload);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
