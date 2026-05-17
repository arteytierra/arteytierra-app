'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/db/browser';

export interface PresenceUser {
  user_id: string;
  name: string;
  avatar?: string | null;
  joined_at: string;
}

/**
 * Presence en un canal arbitrario (ej. lección, hilo, sesión live).
 * Devuelve la lista de usuarios actualmente conectados.
 */
export function usePresence(
  channelKey: string | null,
  me: { user_id: string; name: string; avatar?: string | null } | null,
): PresenceUser[] {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!channelKey || !me) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`presence:${channelKey}`, {
      config: { presence: { key: me.user_id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, PresenceUser[]>;
        const flat: PresenceUser[] = [];
        for (const arr of Object.values(state)) flat.push(...arr);
        setUsers(flat);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: me.user_id,
            name: me.name,
            avatar: me.avatar ?? null,
            joined_at: new Date().toISOString(),
          } satisfies PresenceUser);
        }
      });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [channelKey, me?.user_id, me?.name, me?.avatar]);

  return users;
}
