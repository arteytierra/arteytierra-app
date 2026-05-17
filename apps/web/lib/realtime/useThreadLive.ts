'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

export interface ThreadReplyChange {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  reply: {
    id: string;
    thread_id: string;
    user_id: string | null;
    body: string;
    is_accepted: boolean;
    reports_count: number;
    hidden: boolean;
    created_at: string;
    edited_at: string | null;
  };
}

/**
 * Suscribe a INSERT/UPDATE/DELETE en edu.thread_replies filtrado por thread_id.
 * Útil para refrescar respuestas Q&A en vivo.
 */
export function useThreadLive(
  threadId: string | null | undefined,
  onChange: (c: ThreadReplyChange) => void,
) {
  const cbRef = useRef(onChange);
  useEffect(() => {
    cbRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!threadId) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'edu',
          table: 'thread_replies',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const type = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          const reply = (type === 'DELETE' ? payload.old : payload.new) as ThreadReplyChange['reply'];
          cbRef.current({ type, reply });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadId]);
}
