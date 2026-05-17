'use client';

import { useActionState, useEffect } from 'react';
import { Button, useToast } from '@arteytierra/ui';
import { addToCart, type CartActionState } from '@/lib/commerce/actions';
import { useCartUI } from './CartProvider';

interface Props {
  productSlug: string;
  qty?: number;
  label?: string;
  variant?: 'primary' | 'moss' | 'clay' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AddToCartButton({
  productSlug,
  qty = 1,
  label = 'Agregar al carrito',
  variant = 'moss',
  size = 'lg',
  className,
}: Props) {
  const [state, action, pending] = useActionState<CartActionState, FormData>(addToCart, {});
  const { show } = useCartUI();
  const { toast } = useToast();

  useEffect(() => {
    if (state.ok) {
      show();
    } else if (state.error) {
      toast('error', state.error);
    }
  }, [state, show, toast]);

  return (
    <form action={action} className={className}>
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="qty" value={qty} />
      <Button type="submit" variant={variant} size={size} disabled={pending}>
        {pending ? 'Agregando…' : label}
      </Button>
    </form>
  );
}
