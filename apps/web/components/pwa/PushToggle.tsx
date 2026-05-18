'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@arteytierra/ui';

/**
 * Toggle de suscripción a Web Push.
 * Usa Push Manager + VAPID. Persiste en /api/push/subscribe.
 */

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    });
  }, []);

  async function enable() {
    setBusy(true);
    setErr(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permiso denegado');

      const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapid) throw new Error('VAPID public key no configurada');

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
      });

      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error('No se pudo guardar la suscripción');

      setSubscribed(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return (
      <p className="text-xs text-ink-800/55">
        Tu navegador no soporta notificaciones push.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant={subscribed ? 'outline' : 'moss'}
        size="sm"
        onClick={subscribed ? disable : enable}
        disabled={busy}
      >
        {subscribed ? <BellOff size={14} /> : <Bell size={14} />}
        {busy ? '…' : subscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
      </Button>
      {err && <p className="text-xs text-clay-700">{err}</p>}
    </div>
  );
}
