'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, ArrowLeft, Menu, X } from 'lucide-react';
import { cn } from '@arteytierra/ui';
import type { CourseFullData } from '@/lib/edu/queries';

interface Props {
  slug: string;
  data: CourseFullData;
  children: React.ReactNode;
}

export function PlayerShell({ slug, data, children }: Props) {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);

  const flatLessons = data.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, module_title: m.title })),
  );
  const total = flatLessons.length;
  const done = flatLessons.filter((l) => l.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const currentId = pathname.split('/').pop();
  const currentIdx = flatLessons.findIndex((l) => l.id === currentId);
  const prev = currentIdx > 0 ? flatLessons[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-ink-950 text-bone-50 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-bone-100/10 px-4 lg:px-6 h-14 flex items-center gap-3 shrink-0">
        <Link
          href={`/mis-cursos/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-bone-100/70 hover:text-bone-50"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{data.course.product.name}</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpenMobile((v) => !v)}
          className="ml-auto lg:hidden rounded-md p-2 hover:bg-bone-100/10"
          aria-label="Menú"
        >
          {openMobile ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <div className="w-32 h-1.5 rounded-full bg-bone-100/15 overflow-hidden">
            <div
              className="h-full bg-moss-300 transition-all duration-700 ease-organic"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-bone-100/65">{pct}%</span>
        </div>
      </header>

      <div className="flex-1 lg:grid lg:grid-cols-[320px_1fr] min-h-0">
        {/* Sidebar curriculum */}
        <aside
          className={cn(
            'border-r border-bone-100/10 overflow-y-auto',
            'fixed inset-y-14 left-0 right-0 z-30 bg-ink-950 lg:static lg:inset-auto',
            openMobile ? 'block' : 'hidden lg:block',
          )}
        >
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-bone-100/55">Programa</p>
            <p className="mt-1 text-sm text-bone-100/85">{done} de {total} lecciones</p>
          </div>
          <ol className="pb-8">
            {data.modules.map((m) => (
              <li key={m.id} className="mb-2">
                <p className="px-5 py-2 text-xs uppercase tracking-[0.12em] text-bone-100/55">
                  Módulo {m.position}. {m.title}
                </p>
                <ul>
                  {m.lessons.map((l) => {
                    const active = currentId === l.id;
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/mis-cursos/${slug}/${l.id}`}
                          onClick={() => setOpenMobile(false)}
                          className={cn(
                            'flex items-start gap-3 px-5 py-3 text-sm transition-colors',
                            active
                              ? 'bg-bone-100/10 text-bone-50'
                              : 'text-bone-100/75 hover:bg-bone-100/5 hover:text-bone-50',
                          )}
                        >
                          {l.completed ? (
                            <CheckCircle2 size={14} className="text-moss-300 mt-0.5 shrink-0" />
                          ) : (
                            <Circle size={14} className="text-bone-100/35 mt-0.5 shrink-0" />
                          )}
                          <span className="flex-1">{l.title}</span>
                          {l.duration_sec && (
                            <span className="text-[10px] text-bone-100/45">
                              {Math.round(l.duration_sec / 60)}m
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </aside>

        {/* Main */}
        <main className="overflow-y-auto bg-ink-950">
          <div className="px-5 lg:px-12 py-8 lg:py-12 max-w-4xl mx-auto">
            {children}

            {/* Nav prev/next */}
            <nav className="mt-16 flex items-center justify-between gap-3 border-t border-bone-100/10 pt-6">
              {prev ? (
                <Link
                  href={`/mis-cursos/${slug}/${prev.id}`}
                  className="inline-flex items-center gap-2 text-sm text-bone-100/70 hover:text-bone-50"
                >
                  <ChevronLeft size={14} /> {prev.title}
                </Link>
              ) : <span />}
              {next ? (
                <Link
                  href={`/mis-cursos/${slug}/${next.id}`}
                  className="inline-flex items-center gap-2 text-sm text-bone-100/70 hover:text-bone-50 ml-auto"
                >
                  {next.title} <ChevronRight size={14} />
                </Link>
              ) : <span />}
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
}
