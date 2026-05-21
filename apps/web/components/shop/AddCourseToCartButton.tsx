'use client';

import { useState } from 'react';
import { useCourseCart, type CourseCartItem } from './CourseCartProvider';
import { useCartUI } from './CartProvider';

interface Props {
  item: CourseCartItem;
  className?: string;
}

export function AddCourseToCartButton({ item, className }: Props) {
  const { add, items } = useCourseCart();
  const { show } = useCartUI();
  const [added, setAdded] = useState(false);

  const isInCart = items.some(i => i.slug === item.slug && i.optionId === item.optionId);

  function handleClick() {
    add(item);
    setAdded(true);
    show();
    setTimeout(() => setAdded(false), 2000);
  }

  if (isInCart) {
    return (
      <button onClick={show} className={className}>
        Ver en carrito →
      </button>
    );
  }

  return (
    <button onClick={handleClick} className={className}>
      {added ? '¡Agregado!' : 'Agregar al carrito'}
    </button>
  );
}
