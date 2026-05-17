'use client';

import { useEffect } from 'react';

/**
 * Beacon que se monta una vez por sesión. Lee UTMs de la URL + cookies y
 * registra un touch si hay algo nuevo. Idempotencia: hash en sessionStorage.
 */
export function AttributionBeacon() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const get = (k: string) =>
        url.searchParams.get(k) ?? readCookie(`ay_${k}`) ?? null;

      const source = get('utm_source');
      const medium = get('utm_medium');
      const campaign = get('utm_campaign');
      const content = get('utm_content');
      const term = get('utm_term');
      const referrer = document.referrer || null;

      const sig = JSON.stringify({ source, medium, campaign, content, term, p: url.pathname });
      if (window.sessionStorage.getItem('ay:attr') === sig) return;

      if (!source && !medium && !campaign && !content && !term && !referrer) return;

      void fetch('/api/attribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source, medium, campaign, content, term,
          referrer,
          landing_path: url.pathname,
        }),
        credentials: 'include',
        keepalive: true,
      }).then(() => {
        window.sessionStorage.setItem('ay:attr', sig);
      }).catch(() => {});
    } catch { /* no-op */ }
  }, []);

  return null;
}

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[^a-zA-Z0-9_-]/g, '') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]!) : null;
}
