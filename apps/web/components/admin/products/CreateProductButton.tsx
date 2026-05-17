'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { upsertProduct } from '@/lib/admin/products';

export function CreateProductButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      onClick={() =>
        start(async () => {
          const slug = `producto-${Date.now().toString(36)}`;
          const res = await upsertProduct(null, {
            slug,
            name: 'Nuevo producto',
            type: 'physical',
            base_price_cents: 0,
            currency: 'ARS',
            is_active: false,
            attributes: {},
          });
          if (res?.id) router.push(`/admin/productos/${res.id}`);
        })
      }
      disabled={pending}
    >
      <Plus size={14} /> {pending ? 'Creando…' : 'Nuevo producto'}
    </Button>
  );
}
