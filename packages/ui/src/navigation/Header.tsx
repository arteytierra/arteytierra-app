'use client';

import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { cn } from '../utils/cn';

export interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  brand: React.ReactNode;
  items: NavItem[];
  cta?: { label: string; href: string };
  cartCount?: number;
  onCartClick?: () => void;
  extras?: React.ReactNode;
  className?: string;
  LinkComponent?: React.ElementType;
}

export function Header({
  brand,
  items,
  cta,
  cartCount,
  onCartClick,
  extras,
  className,
  LinkComponent = 'a',
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const L = LinkComponent;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 backdrop-blur-md bg-bone-50/80 border-b border-ink-950/5',
        className,
      )}
    >
      <div className="mx-auto max-w-wide px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <L href="/" className="font-display text-lg md:text-xl tracking-tight">
          {brand}
        </L>

        <nav className="hidden lg:flex items-center gap-8">
          {items.map((it) => (
            <L
              key={it.href}
              href={it.href}
              className="text-sm text-ink-800/80 hover:text-moss-700 transition-colors"
            >
              {it.label}
            </L>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {extras}
          {typeof cartCount === 'number' && (
            <button
              onClick={onCartClick}
              aria-label="Carrito"
              className="relative rounded-full p-2.5 hover:bg-bone-100 transition-colors"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-moss-700 text-bone-50 text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {cta && (
            <L
              href={cta.href}
              className="hidden md:inline-flex rounded-full bg-ink-950 px-5 py-2.5 text-sm text-bone-50 hover:bg-moss-700 transition-colors"
            >
              {cta.label}
            </L>
          )}

          <button
            onClick={() => setOpen(!open)}
            aria-label="Menú"
            className="lg:hidden rounded-full p-2.5 hover:bg-bone-100"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink-950/5 bg-bone-50 animate-fade-up">
          <nav className="mx-auto max-w-wide px-6 py-6 flex flex-col gap-4">
            {items.map((it) => (
              <L
                key={it.href}
                href={it.href}
                className="text-base text-ink-950 py-2"
                onClick={() => setOpen(false)}
              >
                {it.label}
              </L>
            ))}
            {cta && (
              <L
                href={cta.href}
                className="mt-2 rounded-full bg-ink-950 px-5 py-3 text-sm text-bone-50 text-center"
              >
                {cta.label}
              </L>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
