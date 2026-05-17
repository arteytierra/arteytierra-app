import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface FooterColumn {
  title: string;
  items: { label: string; href: string }[];
}

interface FooterProps {
  brand?: string;
  tagline?: string;
  columns?: FooterColumn[];
  social?: { instagram?: string; whatsapp?: string; email?: string };
  className?: string;
  LinkComponent?: React.ElementType;
}

export function Footer({
  brand = 'Arte y Tierra',
  tagline = 'Educación regenerativa y diseño del territorio.',
  columns = [],
  social,
  className,
  LinkComponent = 'a',
}: FooterProps) {
  const L = LinkComponent;
  return (
    <footer className={cn('bg-ink-950 text-bone-100 mt-section', className)}>
      <div className="mx-auto max-w-wide px-6 md:px-10 py-section grid gap-16 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <p className="font-display text-3xl">{brand}</p>
          <p className="mt-4 text-bone-100/70 max-w-prose">{tagline}</p>

          {social && (
            <div className="mt-8 flex gap-3">
              {social.instagram && (
                <a href={social.instagram} aria-label="Instagram"
                  className="rounded-full border border-bone-100/15 p-2.5 hover:bg-bone-100/10 transition-colors">
                  <Instagram size={16} />
                </a>
              )}
              {social.whatsapp && (
                <a href={social.whatsapp} aria-label="WhatsApp"
                  className="rounded-full border border-bone-100/15 p-2.5 hover:bg-bone-100/10 transition-colors">
                  <MessageCircle size={16} />
                </a>
              )}
              {social.email && (
                <a href={`mailto:${social.email}`} aria-label="Email"
                  className="rounded-full border border-bone-100/15 p-2.5 hover:bg-bone-100/10 transition-colors">
                  <Mail size={16} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs uppercase tracking-[0.18em] text-bone-100/50">{col.title}</p>
              <ul className="mt-5 flex flex-col gap-3">
                {col.items.map((it) => (
                  <li key={it.href}>
                    <L href={it.href} className="text-sm text-bone-100/85 hover:text-bone-50">
                      {it.label}
                    </L>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-bone-100/10">
        <div className="mx-auto max-w-wide px-6 md:px-10 py-8 flex flex-col md:flex-row gap-3 justify-between text-xs text-bone-100/55">
          <p>© {new Date().getFullYear()} {brand} · Tay Pichín. Todos los derechos reservados.</p>
          <p>Hecho con tierra, agua y código.</p>
        </div>
      </div>
    </footer>
  );
}
