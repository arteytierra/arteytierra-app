import { Badge, formatMoney } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { listWalletsAdmin } from '@/lib/wallet';
import { AdjustWalletDialog } from '@/components/admin/wallets/AdjustWalletDialog';
import { ToggleFreezeButton } from '@/components/admin/wallets/ToggleFreezeButton';

export const metadata = { title: 'Wallets · Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminWalletsPage() {
  const accounts = await listWalletsAdmin();
  const totalArs = accounts
    .filter((a) => a.currency === 'ARS')
    .reduce((acc, a) => acc + Number(a.balance_cents), 0);
  const totalUsd = accounts
    .filter((a) => a.currency === 'USD')
    .reduce((acc, a) => acc + Number(a.balance_cents), 0);

  return (
    <>
      <PageHeader
        title="Wallets"
        description="Cuentas internas de saldo (créditos a usuarios)."
        actions={<AdjustWalletDialog />}
      />

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Stat label="Total saldo ARS" value={formatMoney(totalArs, 'ARS')} />
        <Stat label="Total saldo USD" value={formatMoney(totalUsd, 'USD')} />
      </div>

      {accounts.length === 0 ? (
        <EmptyState title="Sin wallets" description="Aún no hay cuentas con movimientos." />
      ) : (
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Usuario</th>
                <th className="text-left px-5 py-3">Moneda</th>
                <th className="text-right px-5 py-3">Saldo</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Actualizada</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-t border-ink-950/5">
                  <td className="px-5 py-3 font-mono text-xs">{a.user_id.slice(0, 12)}…</td>
                  <td className="px-5 py-3">{a.currency}</td>
                  <td className="px-5 py-3 text-right font-medium">
                    {formatMoney(Number(a.balance_cents), a.currency as never)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={a.is_frozen ? 'clay' : 'moss'}>
                      {a.is_frozen ? 'Congelada' : 'Activa'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-800/70">
                    {new Date(a.updated_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ToggleFreezeButton id={a.id} frozen={a.is_frozen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-950/10 bg-bone-50 p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-ink-800/60">{label}</p>
      <p className="font-display text-2xl text-ink-950 mt-1.5">{value}</p>
    </div>
  );
}
