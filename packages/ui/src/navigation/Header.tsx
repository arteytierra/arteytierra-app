'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, ShoppingBag, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

export interface NavItem {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}

interface HeaderProps {
  brand: React.ReactNode;
  items: NavItem[];
  cta?: { label: string; href: string };
  cartCount?: number;
  onCartClick?: () => void;
  extras?: React.ReactNode;
  /** Controles que se muestran sólo dentro del menú móvil (drawer), no en la barra superior. */
  mobileExtras?: React.ReactNode;
  className?: string;
  LinkComponent?: React.ElementType;
}

function DropdownMenu({
  item,
  LinkComponent,
}: {
  item: NavItem;
  LinkComponent: React.ElementType;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const L = LinkComponent;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!item.children?.length) {
    return (
      <L href={item.href} className="text-sm text-ink-800/80 hover:text-moss-700 transition-colors">
        {item.label}
      </L>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-ink-800/80 hover:text-moss-700 transition-colors"
      >
        {item.label}
        <ChevronDown size={14} className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-44 rounded-xl border border-ink-950/8 bg-bone-50 shadow-lg shadow-ink-950/5 py-1 z-50">
          {item.children.map((child) => (
            <L
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-ink-800 hover:bg-bone-100 hover:text-moss-700 transition-colors"
            >
              {child.label}
            </L>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({
  brand,
  items,
  cta,
  cartCount,
  onCartClick,
  extras,
  mobileExtras,
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
            <DropdownMenu key={it.href} item={it} LinkComponent={L} />
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
          <nav className="mx-auto max-w-wide px-6 py-6 flex flex-col gap-1">
            {mobileExtras && (
              <div className="flex items-center justify-center pb-4 mb-2 border-b border-ink-950/5">
                {mobileExtras}
              </div>
            )}
            {items.map((it) =>
              it.children?.length ? (
                <div key={it.href}>
                  <p className="px-2 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-ink-800/80">
                    {it.label}
                  </p>
                  {it.children.map((child) => (
                    <L
                      key={child.href}
                      href={child.href}
                      className="block px-2 py-2 text-base text-ink-950"
                      onClick={() => setOpen(false)}
                    >
                      {child.label}
                    </L>
                  ))}
                </div>
              ) : (
                <L
                  key={it.href}
                  href={it.href}
                  className="block px-2 py-2 text-base text-ink-950"
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                </L>
              ),
            )}
            {cta && (
              <L
                href={cta.href}
                className="mt-4 rounded-full bg-ink-950 px-5 py-3 text-sm text-bone-50 text-center"
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
