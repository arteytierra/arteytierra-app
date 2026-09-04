'use client';

import { useState, useTransition } from 'react';
import { Copy, Check } from 'lucide-react';
import { Badge, Button, formatMoney } from '@arteytierra/ui';
import { toggleReferralCode, type ReferralSummary } from '@/lib/referrals';

export function ReferralCard({ code, siteUrl }: { code: ReferralSummary; siteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const link = `${siteUrl}/?ref=${code.code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* no-op */
    }
  }

  return (
    <li className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-lg text-ink-950">{code.code}</span>
            <Badge tone={code.is_active ? 'moss' : 'neutral'}>
              {code.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
            <Badge tone="outline">Comisión {code.commission_pct}%</Badge>
            {code.discount_pct > 0 ? (
              <Badge tone="sun">Descuento {code.discount_pct}%</Badge>
            ) : null}
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <code className="text-xs text-ink-800/70 bg-bone-100 border border-ink-950/10 rounded-lg px-2 py-1 truncate max-w-[420px]">
              {link}
            </code>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 text-xs rounded-full border border-ink-950/15 px-3 py-1 hover:bg-bone-100"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-xs text-ink-800/60 uppercase tracking-[0.12em]">Conv.</span>
          <span className="font-display text-2xl text-ink-950">{code.conversions}</span>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <Stat label="Ventas brutas" value={formatMoney(code.gross_cents, 'ARS')} />
        <Stat label="Pendiente" value={formatMoney(code.pending_cents, 'ARS')} tone="clay" />
        <Stat label="Pagado" value={formatMoney(code.paid_cents, 'ARS')} tone="moss" />
      </dl>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await toggleReferralCode(code.id, !code.is_active);
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Error');
              }
            })
          }
        >
          {code.is_active ? 'Desactivar' : 'Activar'}
        </Button>
      </div>
    </li>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'moss' | 'clay' }) {
  const color = tone === 'moss' ? 'text-moss-700' : tone === 'clay' ? 'text-clay-700' : 'text-ink-950';
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.12em] text-ink-800/60">{label}</dt>
      <dd className={`mt-0.5 font-medium ${color}`}>{value}</dd>
    </div>
  );
}
