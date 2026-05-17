import Link from 'next/link';
import { Container, Section, Eyebrow } from '@arteytierra/ui';
import { HelpCircle, MessageCircle, Mail } from 'lucide-react';
import { listHelpCategories, searchHelp } from '@/lib/help';
import { HelpSearch } from '@/components/help/HelpSearch';
import { buildMetadata } from '@/lib/seo/meta';

export const metadata = buildMetadata({
  title: 'Centro de ayuda',
  eyebrow: 'Soporte',
  path: '/ayuda',
  description: 'Artículos, guías y preguntas frecuentes sobre cursos, pagos y reservas.',
});

export default async function HelpIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q?.trim() ?? '';
  const [categories, hits] = await Promise.all([
    listHelpCategories(),
    q ? searchHelp(q, 20) : Promise.resolve([]),
  ]);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Eyebrow>Soporte</Eyebrow>
        <h1 className="mt-2 font-display text-4xl md:text-5xl text-ink-950">
          ¿Cómo podemos ayudarte?
        </h1>
        <p className="mt-3 text-ink-800/70">
          Buscá entre nuestros artículos o explorá por categoría.
        </p>

        <HelpSearch defaultQuery={q} />

        {q && (
          <div className="mt-8">
            <p className="text-sm text-mute mb-3">
              {hits.length === 0 ? 'Sin resultados.' : `${hits.length} resultado(s) para "${q}"`}
            </p>
            <ul className="space-y-2">
              {hits.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/ayuda/${h.slug}`}
                    className="block rounded-xl border border-ink-950/10 bg-bone-50 p-4 hover:border-moss-700/30 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle size={18} className="text-moss-700 mt-1 flex-none" />
                      <div className="min-w-0">
                        <div className="font-medium text-ink-950">{h.title}</div>
                        {h.excerpt && (
                          <div className="text-sm text-mute mt-1 line-clamp-2">{h.excerpt}</div>
                        )}
                        {h.category_slug && (
                          <div className="text-[11px] uppercase tracking-wide text-mute mt-1.5">
                            {h.category_slug}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!q && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/ayuda/categoria/${c.slug}`}
                className="rounded-2xl border border-ink-950/10 bg-bone-50 p-6 hover:border-moss-700/30 hover:-translate-y-1 transition-all"
              >
                <HelpCircle className="h-6 w-6 text-moss-700 mb-3" />
                <h3 className="font-display text-xl text-ink-950">{c.title}</h3>
                {c.description && (
                  <p className="mt-2 text-sm text-ink-800/65">{c.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-ink-950/10 bg-moss-100/40 p-6">
          <h3 className="font-display text-xl text-ink-950">¿No encontraste lo que buscás?</h3>
          <p className="mt-2 text-sm text-ink-800/70">
            Escribinos y te respondemos en menos de 24 horas hábiles.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:hola@arteytierra.org"
              className="inline-flex items-center gap-2 rounded-full bg-ink-950 text-bone-50 px-5 py-2 text-sm hover:bg-moss-700 transition-colors"
            >
              <Mail size={16} /> Email
            </a>
            <a
              href="https://wa.me/5491100000000"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-ink-950/15 px-5 py-2 text-sm hover:bg-bone-100 transition-colors"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
