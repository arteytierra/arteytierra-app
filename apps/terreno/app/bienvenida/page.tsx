import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';

export const metadata = { title: 'Primeros pasos' };

const steps = [
  [
    '1',
    'Ubicá el predio',
    'Buscá una localidad, dirección o coordenada y acercate hasta reconocer el lugar.',
  ],
  [
    '2',
    'Marcá sus límites',
    'Cargá al menos tres mojones. La superficie y el perímetro se actualizan mientras trazás.',
  ],
  [
    '3',
    'Empezá por las raíces',
    'Leé primero clima y relieve; después sumá agua, suelo, cobertura y contexto.',
  ],
  [
    '4',
    'Contrastá lo remoto',
    'Usá la fuente, escala y confianza para decidir qué verificar en campo.',
  ],
  [
    '5',
    'Diseñá una alternativa',
    'Trazá una hipótesis, guardala y comparala con otra antes de intervenir.',
  ],
];

export default async function WelcomePage() {
  const user = await requireUser('/bienvenida');
  const firstName = user.fullName?.trim().split(/\s+/)[0] || null;

  return (
    <main className="bg-bone-50 min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <img
            src="/marca/logo-color.png"
            alt="acequia"
            width={1200}
            height={395}
            className="h-9 w-auto"
          />
          <Link href="/cuenta" className="text-moss-700 text-sm hover:underline">
            Mi cuenta
          </Link>
        </header>
        {!user.fullName && (
          <aside className="border-sun-300 bg-sun-50 text-ink-700/75 mb-7 flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span><strong className="text-ink-950">Tu cuenta está casi lista.</strong> Completá tu nombre para personalizar la experiencia.</span>
            <Link href="/cuenta/completar" className="text-moss-700 shrink-0 font-semibold hover:underline">Completar cuenta</Link>
          </aside>
        )}
        <section className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="eyebrow">Bienvenida{firstName ? `, ${firstName}` : ''}</p>
            <h1 className="font-display text-ink-950 mt-3 text-4xl leading-tight md:text-5xl">
              Leé el territorio antes de intervenirlo.
            </h1>
            <p className="text-ink-700/75 mt-5 max-w-xl text-base leading-relaxed">
              Este recorrido te lleva de un mapa vacío a una primera hipótesis territorial. No hace
              falta usar todas las herramientas en la primera sesión.
            </p>
            <div className="border-water-200 text-ink-700/75 mt-7 rounded-xl border bg-white p-5 text-sm leading-relaxed">
              <strong className="text-ink-950">Prepará una pregunta concreta.</strong>
              <br />
              Por ejemplo: por dónde captar agua, dónde ubicar un acceso o qué sector conviene
              observar con más detalle.
            </div>
          </div>
          <ol className="divide-bone-200 border-bone-200 divide-y border-y">
            {steps.map(([number, title, body]) => (
              <li key={number} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                <span className="font-display text-water-700 text-xl">{number}</span>
                <div>
                  <h2 className="text-ink-950 text-lg font-semibold">{title}</h2>
                  <p className="text-ink-700/70 mt-1 text-sm leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="border-bone-200 mt-10 flex flex-wrap items-center gap-3 border-t pt-7">
          <Link
            href="/mapa"
            className="bg-moss-700 hover:bg-moss-900 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-colors"
          >
            Empezar en el mapa
          </Link>
          <Link
            href="/guia"
            className="border-bone-200 text-ink-700 hover:border-moss-500 rounded-lg border bg-white px-5 py-3 text-sm font-semibold"
          >
            Abrir la guía de uso
          </Link>
          <span className="text-ink-700/55 text-xs">
            La guía explica fuentes, cruces, escala y limitaciones.
          </span>
        </section>
      </div>
    </main>
  );
}
