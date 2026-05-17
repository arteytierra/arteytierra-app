'use client';

import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { usePresence } from '@/lib/realtime/usePresence';

export function PresenceList({
  channelKey,
  me,
  max = 5,
}: {
  channelKey: string;
  me: { user_id: string; name: string; avatar?: string | null };
  max?: number;
}) {
  const users = usePresence(channelKey, me);
  const unique = useMemo(() => {
    const seen = new Set<string>();
    const out: typeof users = [];
    for (const u of users) {
      if (seen.has(u.user_id)) continue;
      seen.add(u.user_id);
      out.push(u);
    }
    return out.sort((a, b) => a.joined_at.localeCompare(b.joined_at));
  }, [users]);

  const visible = unique.slice(0, max);
  const extra = Math.max(0, unique.length - visible.length);

  return (
    <div className="inline-flex items-center gap-2">
      <Users className="h-4 w-4 text-bone-50/70" />
      <span className="text-xs text-bone-50/70 tabular-nums">{unique.length}</span>
      <div className="flex -space-x-2">
        {visible.map((u) => (
          <div
            key={u.user_id}
            title={u.name}
            className="h-6 w-6 rounded-full ring-2 ring-ink-950 bg-bone-50 text-ink-950 text-[10px] font-semibold flex items-center justify-center"
          >
            {u.name.slice(0, 1).toUpperCase()}
          </div>
        ))}
        {extra > 0 && (
          <div className="h-6 w-6 rounded-full ring-2 ring-ink-950 bg-bone-50/20 text-bone-50 text-[10px] font-semibold flex items-center justify-center">
            +{extra}
          </div>
        )}
      </div>
    </div>
  );
}
