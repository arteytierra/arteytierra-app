'use client';

import { useState, useTransition } from 'react';
import { Send } from 'lucide-react';
import { Button, Textarea } from '@arteytierra/ui';
import { sendInboxReply } from '@/lib/integrations/inbox-actions';

export function ReplyForm({ channel, to }: { channel: 'whatsapp' | 'email'; to: string }) {
  const [text, setText] = useState('');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    if (!text.trim()) return;
    start(async () => {
      setErr(null);
      try {
        await sendInboxReply({ channel, to, body: text });
        setText('');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Error');
      }
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <Textarea
        rows={2}
        value={text}
        placeholder="Respuesta…"
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between">
        {err && <span className="text-xs text-clay-700">{err}</span>}
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={pending || !text.trim()}
          className="ml-auto"
        >
          <Send size={14} /> {pending ? 'Enviando…' : 'Responder'}
        </Button>
      </div>
    </div>
  );
}
