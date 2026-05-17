import { Badge, formatMoney } from '@arteytierra/ui';
import { getMyWalletAccounts, getMyWalletEntries, type WalletSource } from '@/lib/wallet';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mi saldo' };

const SOURCE_LABEL: Record<WalletSource, string> = {
  manual_adjustment: 'Ajuste manual',
  refund_credit: 'Crédito por reembolso',
  referral_reward: 'Recompensa por referido',
  promo_credit: 'Crédito promocional',
  order_payment: 'Pago de orden',
  order_refund: 'Reembolso de orden',
  gift_card_conversion: 'Conversión gift card',
};

export default async function MiSaldoPage() {
  const accounts = await getMyWalletAccounts();
  const arsEntries = await getMyWalletEntries('ARS', 50);

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">Tu wallet</p>
        <h2 className="display-4 mt-3">Saldo y créditos</h2>
        <p className="mt-3 text-ink-800/70 max-w-prose">
          Acumulás créditos por referidos, reembolsos parciales o promociones. Podés usarlos
          en cualquier compra.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 gap-3">
        {(['ARS', 'USD'] as const).map((cur) => {
          const acc = accounts.find((a) => a.currency === cur);
          return (
            <div key={cur} className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-ink-800/60">Saldo {cur}</p>
                {acc?.is_frozen ? <Badge tone="clay">Congelado</Badge> : null}
              </div>
              <p className="font-display text-3xl text-ink-950 mt-1.5">
                {formatMoney(acc?.balance_cents ?? 0, cur as never)}
              </p>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-xl text-ink-950">Movimientos (ARS)</h3>
        {arsEntries.length === 0 ? (
          <p className="text-sm text-ink-800/65">Aún no hay movimientos.</p>
        ) : (
          <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
                <tr>
                  <th className="text-left px-5 py-3">Fecha</th>
                  <th className="text-left px-5 py-3">Detalle</th>
                  <th className="text-right px-5 py-3">Importe</th>
                  <th className="text-right px-5 py-3">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {arsEntries.map((e) => (
                  <tr key={e.id} className="border-t border-ink-950/5">
                    <td className="px-5 py-3 text-ink-800/70">
                      {new Date(e.created_at).toLocaleString('es-AR')}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-ink-950">{SOURCE_LABEL[e.source]}</p>
                      {e.description ? (
                        <p className="text-xs text-ink-800/60 mt-0.5">{e.description}</p>
                      ) : null}
                    </td>
                    <td
                      className={
                        'px-5 py-3 text-right font-medium ' +
                        (e.amount_cents >= 0 ? 'text-moss-800' : 'text-clay-800')
                      }
                    >
                      {e.amount_cents >= 0 ? '+' : ''}
                      {formatMoney(e.amount_cents, 'ARS')}
                    </td>
                    <td className="px-5 py-3 text-right text-ink-800/70">
                      {formatMoney(e.balance_after, 'ARS')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
