/**
 * La ficha de cada obra.
 *
 * Hasta el 15/11/2026 las seis tarjetas de la portada llevaban todas al mismo
 * lugar: `/proyectos`, la lista. Y la portada inglesa y `/en/proyectos` ya
 * enlazaban a `/proyectos/<slug>`, que **no existía**: doce links a un 404
 * que nadie veía porque nadie navega el sitio en inglés.
 *
 * Lo que una ficha agrega sobre la lista no es más texto: es el dato duro
 * separado del relato (dónde, cuándo, qué hicimos, cuánta superficie, quién
 * lo habita) y **todas** las fotos de la obra, que en Armonía son treinta.
 * Todo sale de `lib/proyectos/datos.ts`, que es el único lugar donde se
 * decide qué dice el sitio de un proyecto.
 *
 * Es estática: `generateStaticParams` las deja prerenderizadas y
 * `dynamicParams = false` hace que cualquier otro slug sea 404 y no una
 * página vacía armada en caliente.
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { GaleriaProyecto } from '@/components/proyectos/GaleriaProyecto';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import {
  PROYECTOS,
  fotoDeEncabezado,
  lugarYAnio,
  proyectoPorSlug,
  vecinos,
} from '@/lib/proyectos/datos';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arteytierra.org';

export const dynamicParams = false;

export function generateStaticParams() {
  return PROYECTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = proyectoPorSlug(slug);
  if (!p) return { title: 'Proyecto no encontrado' };

  const titulo = `${p.nombre} — ${lugarYAnio(p)}`;
  // La previsualización al compartir es una foto de la obra. Una placa
  // generada con el título encima sería peor: lo que convence de un proyecto
  // de bioarquitectura es verlo. Va la del encabezado, que es la apaisada, y
  // sin declarar medidas: las fotos no son todas del mismo tamaño y un
  // `width`/`height` inventado es peor que ninguno.
  const imagen = `${SITE}${fotoDeEncabezado(p)}`;

  return {
    title: p.nombre,
    description: p.resumen.es,
    alternates: { canonical: `/proyectos/${p.slug}` },
    openGraph: {
      title: titulo,
      description: p.resumen.es,
      url: `/proyectos/${p.slug}`,
      type: 'article',
      images: [{ url: imagen, alt: p.nombre }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: p.resumen.es,
      images: [imagen],
    },
  };
}

export default async function FichaProyectoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = proyectoPorSlug(slug);
  if (!p) notFound();

  const alrededor = vecinos(p.slug);

  // El dato duro, sin los que no tenemos. `superficie`, `duracion` y
  // `habitan` faltan en varios proyectos y una fila vacía miente igual que
  // una fila mal: el SUM no tiene año y la ficha no lo muestra.
  const datos: Array<{ k: string; v: string }> = [
    { k: 'Lugar', v: p.lugar },
    ...(p.anio ? [{ k: 'Año', v: p.anio }] : []),
    { k: 'Nuestro rol', v: p.rol.es },
    ...(p.superficie ? [{ k: 'Superficie', v: p.superficie }] : []),
    ...(p.duracion ? [{ k: 'Duración de la obra', v: p.duracion.es }] : []),
    ...(p.habitan ? [{ k: 'Lo habitan', v: p.habitan }] : []),
  ];

  return (
    <>
      <SiteHeader />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', url: '/' },
          { name: 'Proyectos', url: '/proyectos' },
          { name: p.nombre, url: `/proyectos/${p.slug}` },
        ])}
      />
      <main>
        {/* ── PORTADA ── */}
        <section className="relative h-[60vh] min-h-[420px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src={fotoDeEncabezado(p)}
            alt={`${p.nombre} — ${p.lugar}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/10" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-14">
            <Link
              href="/proyectos"
              className="inline-block text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4 hover:text-bone-50 transition-colors"
            >
              ← Proyectos
            </Link>
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">
              {p.tipo.es}
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-bone-50 leading-tight">
              {p.nombre}
            </h1>
            <p className="mt-4 font-sans text-base md:text-lg text-bone-200">{lugarYAnio(p)}</p>
          </div>
        </section>

        {/* ── LA FICHA ── */}
        <section className="bg-bone-50 py-16 md:py-24 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-10 lg:gap-16">
            {/* Dato duro */}
            <div>
              <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-5">
                La obra
              </h2>
              <dl className="divide-y divide-bone-200 border-t border-bone-200">
                {datos.map((d) => (
                  <div key={d.k} className="py-3">
                    <dt className="font-sans text-xs uppercase tracking-wider text-ink-700/70">
                      {d.k}
                    </dt>
                    <dd className="font-sans text-base text-ink-950 mt-0.5">{d.v}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mt-10 mb-4">
                Técnicas
              </h3>
              <ul className="flex flex-wrap gap-2">
                {p.tecnicas.map((t) => (
                  <li
                    key={t}
                    className="font-sans text-xs font-semibold uppercase tracking-wider text-clay-700 bg-clay-100 px-3 py-1.5"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Relato */}
            <div>
              <p className="font-display text-2xl md:text-3xl text-ink-950 leading-snug mb-10">
                {p.resumen.es}
              </p>
              <div className="flex flex-col gap-8 max-w-prose">
                {p.relato.map((bloque) => (
                  <div key={bloque.titulo}>
                    <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-clay-700 mb-2">
                      {bloque.titulo}
                    </h3>
                    <p className="font-sans text-base text-ink-800 leading-relaxed">
                      {bloque.texto}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── LAS FOTOS ── */}
        <section className="bg-ink-950 py-16 md:py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
              <h2 className="font-display text-3xl md:text-4xl text-bone-50">
                La obra, <em>foto por foto.</em>
              </h2>
              <p className="font-sans text-sm text-bone-200/60">
                {p.fotos.length} fotos · tocá cualquiera para ampliarla
              </p>
            </div>
            <GaleriaProyecto fotos={p.fotos} nombre={p.nombre} />
          </div>
        </section>

        {/* ── LA OBRA DE AL LADO ── */}
        {alrededor && (
          <nav aria-label="Otros proyectos" className="bg-bone-100 border-t border-bone-200">
            <div className="max-w-editorial mx-auto grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-bone-200">
              <Link
                href={`/proyectos/${alrededor.anterior.slug}`}
                className="group px-6 py-8 hover:bg-bone-50 transition-colors"
              >
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-700 mb-1">
                  ← Anterior
                </p>
                <p className="font-display text-xl text-ink-950 group-hover:text-clay-700 transition-colors">
                  {alrededor.anterior.nombre}
                </p>
              </Link>
              <Link
                href={`/proyectos/${alrededor.siguiente.slug}`}
                className="group px-6 py-8 sm:text-right hover:bg-bone-50 transition-colors"
              >
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-clay-700 mb-1">
                  Siguiente →
                </p>
                <p className="font-display text-xl text-ink-950 group-hover:text-clay-700 transition-colors">
                  {alrededor.siguiente.nombre}
                </p>
              </Link>
            </div>
          </nav>
        )}

        {/* ── CTA ── */}
        <section className="bg-clay-700 py-20 px-6 text-center">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-200 mb-4">
            ¿Te imaginás algo así en tu tierra?
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-bone-50 mb-4">
            Empezá con una <em>asesoría online.</em>
          </h2>
          {/* Sin precio a propósito: el valor de la asesoría está escrito a mano
              en seis lugares del sitio y no hay una fuente que lo decida. Hasta
              que la haya, acá no se agrega una séptima copia — el precio lo
              dice /asesorias, que es la página que lo cobra. */}
          <p className="text-bone-100 font-sans text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            1 hora con nuestro equipo · revisamos tu terreno, tu agua, tus ideas y tus
            posibilidades. Si después contratás el diseño, la sesión se descuenta.
          </p>
          <Link
            href="/asesorias"
            className="inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink-800 transition-colors"
          >
            Agendar asesoría →
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
