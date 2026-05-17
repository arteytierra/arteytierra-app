'use client';

import { useEffect, useState } from 'react';

interface Prefs {
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const COOKIE_NAME = 'ay_consent';
const POLICY_VERSION = 'v1';

function readConsent(): (Prefs & { v: string }) | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)'));
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1]!));
  } catch { return null; }
}

function writeConsent(p: Prefs) {
  const body = JSON.stringify({ ...p, v: POLICY_VERSION });
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(body)}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`;
}

export function ConsentBanner() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, marketing: false, personalization: false });

  useEffect(() => {
    const existing = readConsent();
    if (!existing || existing.v !== POLICY_VERSION) setShow(true);
    else setPrefs({ analytics: existing.analytics, marketing: existing.marketing, personalization: existing.personalization });
  }, []);

  async function persistServer(p: Prefs) {
    try {
      await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify({ ...p, policy_version: POLICY_VERSION }),
      });
    } catch { /* no-op */ }
  }

  async function accept(p: Prefs) {
    writeConsent(p);
    setPrefs(p);
    setShow(false);
    void persistServer(p);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4">
      <div className="mx-auto max-w-2xl rounded-xl bg-bone shadow-2xl ring-1 ring-ink/10 p-5">
        <p className="text-sm text-ink">
          Usamos cookies necesarias para el funcionamiento del sitio. Con tu permiso
          también medimos uso (analytics) y personalizamos contenido. Podés cambiar esto
          cuando quieras en <a href="/mi-cuenta/privacidad" className="underline">Privacidad</a>.
        </p>

        {expanded && (
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-center gap-2 opacity-60">
              <input type="checkbox" checked disabled /> Necesarias (siempre activas)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
              />
              Analytics anónimos
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
              />
              Marketing (pixels de remarketing)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.personalization}
                onChange={(e) => setPrefs({ ...prefs, personalization: e.target.checked })}
              />
              Personalización
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => accept({ analytics: false, marketing: false, personalization: false })}
            className="rounded-md border border-ink/15 px-4 py-2 text-sm"
          >
            Solo necesarias
          </button>
          {!expanded ? (
            <button onClick={() => setExpanded(true)} className="rounded-md border border-ink/15 px-4 py-2 text-sm">
              Personalizar
            </button>
          ) : (
            <button onClick={() => accept(prefs)} className="rounded-md bg-ink px-4 py-2 text-sm text-bone">
              Guardar selección
            </button>
          )}
          <button
            onClick={() => accept({ analytics: true, marketing: true, personalization: true })}
            className="rounded-md bg-leaf px-4 py-2 text-sm text-bone"
          >
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  );
}
