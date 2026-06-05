import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { waLink, WHATSAPP_PRINCIPAL } from '@/lib/contact';
import { JsonLd } from '@/components/seo/JsonLd';
import { coursesItemListJsonLd } from '@/lib/seo/jsonld';
import { buildSocial } from '@/lib/seo/og';
import { YouTubeFacade } from '@/components/media/YouTubeFacade';
import {
  getCoursesForLanding,
  getProductCover,
  type LandingProduct,
  type LandingMeta,
} from '@/lib/commerce/products';

export const revalidate = 60;

const META_TITLE = 'Ecoescuela — Arte y Tierra';
const META_DESC =
  'Cursos y formaciones de bioarquitectura, diseño hidrológico, permacultura y biocosmética. Presenciales en Tay Pichín y online desde cualquier parte del mundo.';

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESC,
  alternates: { canonical: '/cursos' },
  ...buildSocial({
    title: META_TITLE,
    description: META_DESC,
    url: '/cursos',
    ogKind: 'course',
    ogEyebrow: 'Ecoescuela · Tay Pichín',
  }),
};

/* ─── Tipos derivados ────────────────────────────────── */

type Dato = { label: string; val: string };

interface Curso {
  slug: string;
  badge: string;
  name: string;
  tag: string;
  desc: string;
  img: string;
  datos?: Dato[];
  contenidos?: string[];
  precio: string;
  precioNote: string;
  href: string;
  whatsapp: string;
  tentativo?: boolean;
}

type TodoItem = {
  slug: string;
  name: string;
  tag: string;
  img: string;
  badge: string;
  tentativo: boolean;
  online: boolean;
};

/* ─── Mappers ────────────────────────────────────────── */

const FALLBACK_IMG = '/img/cursos/cursos/1.jpg';

function cover(p: LandingProduct): string {
  return getProductCover(p as never) ?? FALLBACK_IMG;
}

function waUrl(lm: LandingMeta): string {
  return waLink(lm.whatsapp_numero ?? WHATSAPP_PRINCIPAL, lm.whatsapp_msg);
}

function toTodoItem(p: LandingProduct): TodoItem {
  const lm = p.landing_meta;
  return {
    slug: p.slug,
    name: p.name,
    tag: lm.tag,
    img: cover(p),
    badge: lm.badge,
    tentativo: !p.is_active,
    online: lm.badge.toLowerCase().includes('online'),
  };
}

function toCurso(p: LandingProduct): Curso {
  const lm = p.landing_meta;
  return {
    slug: p.slug,
    badge: lm.badge,
    name: p.name,
    tag: lm.tag,
    desc: p.subtitle ?? '',
    img: cover(p),
    datos: lm.datos,
    contenidos: lm.contenidos,
    precio: lm.precio_display ?? '',
    precioNote: lm.precio_note ?? '',
    href: `/cursos/${p.slug}`,
    whatsapp: waUrl(lm),
    tentativo: !p.is_active,
  };
}

/* ─── Testimonios en texto (completar con contenido real) ── */

const TESTIMONIOS: Array<{ name: string; course: string; quote: string }> = [
  // { name: 'María L.', course: 'Mi Tierra, Mi Casa', quote: '...' },
];

/* ─── Components ─────────────────────────────────────── */

function GridCard({ c, idx }: { c: TodoItem; idx: number }) {
  const className = 'group relative overflow-hidden bg-ink-800 flex flex-col';
  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={c.img}
          alt={c.name}
          fill
          priority={idx < 5}
          className={`object-cover transition-transform duration-300 group-hover:scale-105${c.tentativo ? ' grayscale opacity-70' : ''}`}
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 20vw, 11vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 to-transparent" />
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
          {c.online && (
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-moss-700 text-bone-50 px-1.5 py-0.5">
              Online
            </span>
          )}
          {c.tentativo && (
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-clay-500 text-bone-50 px-1.5 py-0.5">
              Próx.
            </span>
          )}
        </div>
      </div>
      <div className="p-2 flex flex-col gap-0.5 flex-1">
        <p className="font-sans text-[11px] font-bold text-bone-50 leading-tight line-clamp-2">{c.name}</p>
        <p className="font-sans text-[10px] text-bone-200 leading-tight">{c.tag}</p>
      </div>
    </>
  );

  if (c.tentativo) {
    return <a href="#proximamente" className={className}>{inner}</a>;
  }
  return <Link href={`/cursos/${c.slug}`} className={className}>{inner}</Link>;
}

function CourseCard({ c, reverse }: { c: Curso; reverse?: boolean }) {
  const isProximo = !!c.tentativo;
  return (
    <article className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} ${isProximo ? 'opacity-80' : ''} bg-bone-100 overflow-hidden`}>
      <div className="relative md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[420px] overflow-hidden bg-ink-950 flex-shrink-0">
        <Image src={c.img} alt={c.name} fill className={`object-cover${isProximo ? ' grayscale' : ''}`} sizes="(max-width: 768px) 100vw, 50vw" />
        <div className="absolute top-4 left-4">
          <span className={`${isProximo ? 'bg-ink-700' : 'bg-clay-700'} text-bone-50 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1.5`}>
            {c.badge}
          </span>
        </div>
      </div>
      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-5">
        <div>
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-2">{c.tag}</p>
          <h3 className="font-display text-2xl md:text-3xl text-ink-950">{c.name}</h3>
        </div>
        <p className="font-sans text-base text-ink-700 leading-relaxed">{c.desc}</p>
        {c.datos && (
          <div className="grid grid-cols-2 gap-2">
            {c.datos.map(d => (
              <div key={d.label} className="bg-bone-50 px-3 py-2.5 border-l-2 border-clay-400">
                <p className="text-xs font-sans font-bold uppercase tracking-wider text-clay-600 mb-0.5">{d.label}</p>
                <p className="text-xs font-sans text-ink-800 leading-snug">{d.val}</p>
              </div>
            ))}
          </div>
        )}
        {c.contenidos && (
          <div className="flex flex-wrap gap-1.5">
            {c.contenidos.map(t => (
              <span key={t} className="text-xs font-sans text-clay-700 bg-clay-50 border border-clay-200 px-2.5 py-1">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-3 pt-2 border-t border-bone-200">
          <div>
            <span className="font-display text-2xl text-ink-950">{c.precio}</span>
            <p className="text-xs font-sans text-ink-500 mt-0.5">{c.precioNote}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isProximo ? (
              <a
                href={c.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-clay-900 transition-colors"
              >
                Anotarme →
              </a>
            ) : (
              <>
                <Link
                  href={c.href}
                  className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-clay-900 transition-colors"
                >
                  Inscribirme →
                </Link>
                <a
                  href={c.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex border border-clay-400 text-clay-700 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-clay-50 transition-colors"
                >
                  Consultar
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────── */

export default async function CursosPage() {
  const { activos, inmersion, proximos } = await getCoursesForLanding();

  const allTodos: TodoItem[] = [
    ...activos,
    ...(inmersion ? [inmersion] : []),
    ...proximos,
  ].map(toTodoItem);

  const cursos: Curso[] = activos.map(toCurso);

  const inmersionWa = inmersion
    ? waUrl(inmersion.landing_meta)
    : waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero info de la Inmersión Viva');

  return (
    <>
      <SiteHeader />
      <main>
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] bg-ink-950 flex items-end overflow-hidden">
        <Image src="/img/cursos/cursos/1.jpg" alt="Ecoescuela Arte y Tierra — Tay Pichín" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-transparent" />
        <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">Ecoescuela · Tay Pichín</p>
          <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-2xl">
            Aprender haciendo<br />en un <em>espacio vivo.</em>
          </h1>
          <p className="mt-4 text-bone-200 font-sans text-lg max-w-lg">
            Cursos presenciales, online y formaciones intensivas sobre bioconstrucción, diseño del territorio y soberanía personal.
          </p>
        </div>
      </section>

      {/* GRILLA RÁPIDA */}
      <section className="bg-ink-900 py-8 px-6 border-b border-ink-700">
        <div className="max-w-editorial mx-auto">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-5 text-center">Todas las formaciones</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {allTodos.map((c, idx) => <GridCard key={c.slug} c={c} idx={idx} />)}
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-ink-950 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-5">El enfoque</p>
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-8">
            El conocimiento<br />vuelve a las <em>manos.</em>
          </h2>
          <p className="font-sans text-bone-100 text-base leading-relaxed mb-4">
            Cada formación parte de una premisa: el aprendizaje verdadero ocurre en la práctica. Trabajamos sobre obras reales, en territorio vivo, con materiales del lugar y técnicas que tienen siglos de sabiduría detrás.
          </p>
          <p className="font-sans text-bone-200 text-base leading-relaxed">
            Formaciones presenciales en Tay Pichín (San Marcos Sierras, Córdoba) y cursos online en vivo para quienes aprenden desde cualquier parte del mundo.
          </p>
        </div>
      </section>

      {/* CURSOS PRINCIPALES */}
      <section className="bg-bone-50 py-20 md:py-28 px-6">
        <div className="max-w-editorial mx-auto mb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Formaciones · 2026</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-950">
            Todos los<br /><em>cursos.</em>
          </h2>
          <p className="mt-4 font-sans text-ink-600 text-base max-w-xl">
            Presenciales en Tay Pichín, online en vivo y a tu ritmo. Elegí la formación que más resuena con tu camino.
          </p>
        </div>
        <div className="max-w-editorial mx-auto flex flex-col divide-y divide-bone-200">
          {cursos.map((c, i) => (
            <CourseCard key={c.slug} c={c} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      {/* INMERSIÓN VIVA */}
      <section className="bg-ink-950">
        <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[600px] overflow-hidden">
            <Image src="/img/taypichin/carousel/5.jpg" alt="Inmersión Viva — Tay Pichín" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute top-4 left-4">
              <span className="bg-moss-700 text-bone-50 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1.5">
                Inmersión · 15 o 30 días
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 p-10 md:p-16">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300">Experiencia completa</p>
            <h2 className="font-display text-4xl md:text-5xl text-bone-50">
              Inmersión <em>Viva.</em>
            </h2>
            <p className="font-sans text-bone-50 text-base leading-relaxed">
              Períodos formativos de 15 o 30 días en Tay Pichín. Bioconstrucción, agroecología y organización colectiva aprendidas en la práctica diaria — integradas al trabajo, la convivencia y la vida en territorio.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🏗', t: 'Bioconstrucción',    d: 'Obra real con tierra y materiales naturales' },
                { icon: '🌱', t: 'Agroecología',        d: 'Huerta, suelo y sistemas vivos' },
                { icon: '💧', t: 'Diseño hidrológico',  d: 'Lectura del paisaje y el agua' },
                { icon: '🤝', t: 'Comunidad',           d: 'Círculos de la palabra y organización' },
              ].map(item => (
                <div key={item.t} className="p-4 bg-ink-800 border border-ink-600">
                  <div className="text-lg mb-1"><span aria-hidden="true">{item.icon}</span></div>
                  <p className="font-sans font-semibold text-sm text-bone-50">{item.t}</p>
                  <p className="font-sans text-xs text-bone-200 mt-0.5 leading-snug">{item.d}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/cursos/inmersion-viva"
                className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:bg-clay-900 transition-colors"
              >
                Inscribirme →
              </Link>
              <a
                href={inmersionWa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex border border-bone-500/40 text-bone-200 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3.5 hover:border-bone-200 transition-colors"
              >
                Consultar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SIN FECHA CONFIRMADA */}
      <section id="proximamente" className="bg-bone-50 py-20 px-6 border-t border-bone-200">
        <div className="max-w-editorial mx-auto">
          <div className="mb-10">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-3">Próximamente</p>
            <h2 className="font-display text-4xl text-ink-950">
              En preparación —<br /><em>anotate antes.</em>
            </h2>
            <p className="mt-4 font-sans text-ink-600 text-base max-w-xl">
              Estas formaciones no tienen fecha confirmada aún. Dejanos tu nombre y te avisamos apenas abramos inscripción.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {proximos.map(t => {
              const lm = t.landing_meta;
              const img = cover(t);
              return (
                <div key={t.slug} className="bg-bone-100 overflow-hidden border border-bone-200">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={img} alt={t.name} fill className="object-cover grayscale opacity-80"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-sans font-bold uppercase tracking-widest bg-bone-50 text-clay-700 px-2.5 py-1">
                        {lm.badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl text-ink-950 mb-2">{t.name}</h3>
                    <p className="font-sans text-sm text-ink-700 leading-relaxed mb-5">{t.subtitle ?? ''}</p>
                    <a
                      href={waUrl(lm)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-clay-900 transition-colors"
                    >
                      Anotarme →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-clay-700 py-14 px-6">
        <div className="max-w-editorial mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '+150', label: 'talleres dictados' },
            { n: '+10k',  label: 'personas formadas' },
            { n: '7',     label: 'países' },
            { n: '15+',   label: 'años de experiencia' },
          ].map(s => (
            <div key={s.n}>
              <div className="font-display text-5xl md:text-6xl text-bone-50">{s.n}</div>
              <div className="mt-2 font-sans text-sm uppercase tracking-widest text-clay-200">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO TESTIMONIOS */}
      <section className="bg-ink-950 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Lo que dicen quienes pasaron por acá</p>
            <h2 className="font-display text-3xl text-bone-50">Voces de la <em>comunidad.</em></h2>
          </div>
          <div className="relative aspect-video bg-ink-800 overflow-hidden">
            <YouTubeFacade
              videoId="dSqscHL4pF8"
              title="Testimonios de participantes — Arte y Tierra"
            />
          </div>
          {TESTIMONIOS.length > 0 && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIOS.map(t => (
                <blockquote key={t.name} className="bg-ink-800 p-6 flex flex-col gap-4 border border-ink-700">
                  <p className="font-sans text-bone-100 text-sm leading-relaxed">"{t.quote}"</p>
                  <footer className="mt-auto pt-4 border-t border-ink-700">
                    <cite className="not-italic">
                      <span className="font-sans font-semibold text-bone-50 text-sm">{t.name}</span>
                      <span className="font-sans text-xs text-bone-400 ml-2">· {t.course}</span>
                    </cite>
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bone-50 py-20 px-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">
          ¿No sabés qué curso es para vos?
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-ink-950 mb-5">
          Hablemos antes<br />de <em>decidir.</em>
        </h2>
        <p className="font-sans text-ink-700 text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          Una asesoría de 30 minutos sin costo para ayudarte a elegir el camino que más se alinea con lo que buscás.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href={waLink(WHATSAPP_PRINCIPAL, 'Hola, quiero info sobre los cursos')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors"
          >
            WhatsApp →
          </a>
          <Link
            href="/asesorias"
            className="inline-flex border border-ink-950 text-ink-950 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-950 hover:text-bone-50 transition-colors"
          >
            Agendar asesoría
          </Link>
        </div>
      </section>
    </main>
      <SiteFooter />

      <JsonLd
        data={[
          coursesItemListJsonLd({
            courses: activos.map(p => ({
              slug: p.slug,
              name: p.name,
              description: p.subtitle ?? undefined,
              img: cover(p),
            })),
          }),
        ]}
      />
    </>
  );
}
