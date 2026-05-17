'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, EyeOff, Eye } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { deleteProduct, toggleProductActive } from '@/lib/admin/products';

export function ProductDangerZone({ productId, isActive }: { productId: string; isActive: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function toggle() {
    start(async () => {
      await toggleProductActive(productId, !active);
      setActive(!active);
    });
  }

  function del() {
    if (!confirm('¿Eliminar este producto? Si ya se vendió, sólo se desactiva.')) return;
    start(async () => {
      const res = await deleteProduct(productId);
      if (res.soft) {
        setMsg('Soft-delete: producto desactivado (tiene órdenes asociadas).');
        setActive(false);
      } else {
        router.push('/admin/productos');
      }
    });
  }

  return (
    <div className="rounded-2xl border border-clay-300/40 bg-clay-100/50 p-5 space-y-4">
      <h3 className="font-display text-lg">Acciones</h3>

      <div className="space-y-2">
        <Button variant="outline" size="sm" onClick={toggle} disabled={pending} className="w-full">
          {active ? <EyeOff size={14} /> : <Eye size={14} />}
          {pending ? '…' : active ? 'Desactivar' : 'Activar'}
        </Button>

        <Button variant="danger" size="sm" onClick={del} disabled={pending} className="w-full">
          <Trash2 size={14} />
          Eliminar
        </Button>
      </div>

      {msg && <p className="text-xs text-clay-900">{msg}</p>}
    </div>
  );
}
