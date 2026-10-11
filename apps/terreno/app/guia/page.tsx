import Link from 'next/link';
import {
  ACEQUIA_PLANS, ACEQUIA_FEATURES, ACEQUIA_PLAN_ORDER, ACEQUIA_TRIAL_DAYS,
  ACEQUIA_TOPO_SEMILLA_HA,
  type AcequiaPlanId, type AcequiaFeature,
} from '@arteytierra/config/acequia';
import {
  ETIQUETA_RELIEVE, PASO_RELIEVE, CREDITO_RELIEVE, type FuenteRelieve,
} from '@/lib/grillaElevacion';
import {
  PERFILES, PELDANOS, HERRAMIENTAS, REGLAS_DE_LECTURA, LIMITES, SINTOMAS,
  GLOSARIO, ROTULO_FEATURE, ROTULO_HERRAMIENTA, TERRITORIO_DEM, DEM_PARA_IMPORTAR,
  CAPTURAS,
} from '@/lib/guia';

export const metadata = {
  title: 'Guía de uso',
  description:
    'Cómo se lee un predio con acequia: para quién es, en qué orden trabajar, qué hace cada herramienta, de dónde sale cada dato y qué no hace la app.',
};

/**
 * La guía de uso.
 *
 * Es pública a propósito. Reemplaza a `public/guia.html`, que se servía sin
 * sesión, y no muestra ningún dato de nadie: es el manual. Una guía detrás de
 * login no se puede compartir con un cliente ni leer antes de decidir si la
 * app sirve, que son sus dos usos más frecuentes.
 *
 * El contenido vive en `lib/guia.ts`; acá sólo se dibuja. Los planes y las
 * fuentes de relieve se arman leyendo los mismos módulos que usa la app, así
 * que no hay forma de que la guía anuncie un precio o una resolución que el
 * producto ya no tiene.
 */

const SECCIONES: Array<{ id: string; label: string }> = [
  { id: 'perfiles',     label: 'Para quién es' },
  { id: 'orden',        label: 'El orden de trabajo' },
  { id: 'herramientas', label: 'Las herramientas' },
  { id: 'lectura',      label: 'Cómo se lee un número' },
  { id: 'limites',      label: 'Lo que no hace' },
  { id: 'informe',      label: 'El informe' },
  { id: 'planes',       label: 'Los planes' },
  { id: 'relieve',      label: 'De dónde sale el relieve' },
  { id: 'problemas',    label: 'Si algo no aparece' },
  { id: 'glosario',     label: 'Glosario' },
];

/** Los permisos que cada plan agrega respecto del anterior. */
function loQueSuma(plan: AcequiaPlanId): AcequiaFeature[] {
  return (Object.keys(ACEQUIA_FEATURES) as AcequiaFeature[])
    .filter(f => ACEQUIA_FEATURES[f] === plan);
}

/**
 * El salto de capacidad respecto del plan anterior, dicho como frase.
 *
 * Sin esto la tarjeta de Profesional muestra un solo renglón —el informe con
 * marca propia— y parece que no agrega nada, cuando lo que se paga ahí es
 * pasar de dos proyectos a diez. Sale de los mismos números del catálogo, así
 * que no hay nada escrito a mano que pueda quedar viejo.
 */
function saltoDeCapacidad(plan: AcequiaPlanId): string | null {
  const orden = (Object.values(ACEQUIA_PLANS))
    .sort((a, b) => ACEQUIA_PLAN_ORDER[a.id] - ACEQUIA_PLAN_ORDER[b.id]);
  const i = orden.findIndex(p => p.id === plan);
  const previo = i > 0 ? orden[i - 1] : undefined;
  const actual = orden[i];
  if (!previo || !actual) return null;

  const partes: string[] = [];
  if (actual.projects > previo.projects) {
    partes.push(`${actual.projects} proyectos activos en vez de ${previo.projects}`);
  }
  if (actual.seats > previo.seats) {
    partes.push(`${actual.seats} cuentas en vez de ${previo.seats}`);
  }
  return partes.length > 0 ? partes.join(' · ') : null;
}

/** Las fuentes de relieve que se le pueden explicar a alguien, en orden útil. */
const FUENTES_DEM: FuenteRelieve[] = (
  ['glo30', 'usgs3dep', 'ignfr', 'ignes', 'hrdemca', 'ahnnl', 'swisstopo', 'usuario'] as const
).filter(f => TERRITORIO_DEM[f] !== null);

function Seccion({ id, num, titulo, bajada, children }: {
  id: string; num: string; titulo: string; bajada: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-bone-200 scroll-mt-20 border-t py-12">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-water-500 text-base font-semibold">{num}</span>
        <h2 className="font-display text-ink-950 text-3xl leading-tight">{titulo}</h2>
      </div>
      <p className="text-ink-700/70 mt-3 max-w-3xl text-base leading-relaxed">{bajada}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function GuidePage() {
  const porPeldano = PELDANOS.map(p => ({
    peldano: p,
    tools: HERRAMIENTAS.filter(h => h.peldano === p.id),
  }));

  return (
    <main className="bg-bone-50 min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <img
            src="/marca/logo-color.png"
            alt="acequia"
            width={1200}
            height={395}
            className="h-9 w-auto"
          />
          {/* Los dos destinos valen con sesión y sin ella: quien no entró
              todavía cae en el login y vuelve acá después. Preguntar por la
              sesión sólo para elegir el texto del enlace volvería dinámica una
              página que es texto y puede vivir en el CDN. */}
          <div className="flex gap-4 text-sm">
            <Link href="/bienvenida" className="text-moss-700 hover:underline">Primeros pasos</Link>
            <Link href="/mapa" className="text-moss-700 hover:underline">Ir al mapa</Link>
          </div>
        </header>

        <section className="max-w-3xl">
          <p className="eyebrow">Manual de uso</p>
          <h1 className="font-display text-ink-950 mt-3 text-4xl leading-tight md:text-5xl">
            Cómo leer un predio.
          </h1>
          <p className="text-ink-700/75 mt-5 text-lg leading-relaxed">
            acequia no es una lista de botones sueltos: es una cadena. Los mojones dibujan el
            predio, el <strong className="text-ink-950">clima</strong> y el{' '}
            <strong className="text-ink-950">relieve</strong> son las dos raíces, y de ellas se
            desprende casi todo lo demás. Si entendés esas dos raíces, entendés la app entera.
          </p>
          <div className="border-water-200 text-ink-700/75 mt-7 rounded-xl border bg-white p-5 text-sm leading-relaxed shadow-paper">
            <strong className="text-ink-950">Antes de empezar, escribí tu pregunta.</strong> Por
            dónde captar agua, dónde ubicar la casa, cuántos animales entran, qué sector observar
            de cerca. Una lectura territorial sin pregunta devuelve muchos números y ninguna
            decisión.
          </div>
        </section>

        <nav aria-label="Secciones de la guía" className="mt-10 flex flex-wrap gap-2">
          {SECCIONES.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="border-bone-200 text-ink-700/75 hover:border-moss-500 hover:text-moss-700 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* ── 01 · Para quién es ───────────────────────────────────────── */}
        <Seccion
          id="perfiles"
          num="01"
          titulo="Para quién es esto"
          bajada="La misma lectura sirve a gente que llega con preguntas muy distintas. Estos son los recorridos más frecuentes, cada uno con lo que conviene mirar primero y con lo que esa persona en particular va a esperar y acequia no hace."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {PERFILES.map(p => (
              <article key={p.id} className="border-bone-200 rounded-2xl border bg-white p-6">
                <h3 className="font-display text-ink-950 text-xl leading-snug">{p.titulo}</h3>
                <p className="text-ink-700/70 mt-3 text-sm leading-relaxed">{p.llega}</p>
                <p className="text-ink-700/75 mt-4 text-sm leading-relaxed">
                  <span className="text-water-500 font-semibold">Recorrido · </span>
                  {p.recorrido}
                </p>
                <p className="border-sun-300 bg-sun-50 text-ink-700/80 mt-4 rounded-lg border-l-2 px-3 py-2 text-sm leading-relaxed">
                  <span className="text-ink-950 font-semibold">Ojo · </span>
                  {p.ojo}
                </p>
              </article>
            ))}
          </div>
        </Seccion>

        {/* ── 02 · El orden ────────────────────────────────────────────── */}
        <Seccion
          id="orden"
          num="02"
          titulo="El orden de trabajo"
          bajada="El riel de herramientas de /mapa está ordenado según la Escala de Permanencia de P. A. Yeomans: de lo que no se puede cambiar a lo que cambia todos los años. No hace falta hacer todo, pero sí en este orden — cada peldaño deja habilitado el siguiente."
        >
          <ol className="divide-bone-200 border-bone-200 divide-y border-y">
            {PELDANOS.map((p, i) => (
              <li key={p.id} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                <span className="font-display text-water-500 text-xl">
                  {String(i).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-ink-950 text-lg font-semibold">{p.titulo}</h3>
                  <p className="text-ink-700/70 mt-1 text-sm leading-relaxed">{p.que}</p>
                  <p className="text-ink-700/55 mt-2 text-sm leading-relaxed">
                    <span className="font-medium">Por qué acá · </span>{p.porque}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="border-moss-300 bg-moss-50 text-ink-700/80 mt-7 rounded-xl border p-5 text-sm leading-relaxed">
            <strong className="text-ink-950">La lección práctica.</strong> Si abrís un panel de
            diseño y aparece vacío o te manda a calcular otra cosa, casi siempre falta una de las
            dos raíces. Corré <strong className="text-ink-950">Clima</strong> y{' '}
            <strong className="text-ink-950">Topografía</strong> y el resto se enciende solo.
          </div>
        </Seccion>

        {/* ── 03 · Las herramientas ────────────────────────────────────── */}
        <Seccion
          id="herramientas"
          num="03"
          titulo="Las herramientas, una por una"
          bajada="Qué hace cada una, qué necesita tener calculado antes y qué deja disponible para las demás. Están agrupadas igual que en el riel del mapa."
        >
          <div className="space-y-10">
            {porPeldano.map(({ peldano, tools }) => (
              <div key={peldano.id}>
                <h3 className="text-water-500 border-bone-200 border-b pb-2 text-xs font-semibold tracking-[0.18em] uppercase">
                  {peldano.titulo}
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {tools.map(h => (
                    <article key={h.id} className="border-bone-200 rounded-2xl border bg-white p-5">
                      <h4 className="font-display text-ink-950 text-lg">
                        {ROTULO_HERRAMIENTA[h.id]}
                      </h4>
                      <p className="text-ink-700/70 mt-2 text-sm leading-relaxed">{h.que}</p>
                      <dl className="border-bone-200 mt-4 space-y-1.5 border-t pt-3 text-xs">
                        <div className="flex gap-2">
                          <dt className="text-ink-700/50 w-16 shrink-0">Necesita</dt>
                          <dd className="text-ink-700/75">{h.necesita ?? 'nada — es el punto de partida'}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-700/50 w-16 shrink-0">Produce</dt>
                          <dd className="text-ink-700/75">{h.produce}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Seccion>

        {/* ── 04 · Cómo se lee un número ───────────────────────────────── */}
        <Seccion
          id="lectura"
          num="04"
          titulo="Cómo se lee un número de acequia"
          bajada="Esta app no falla estrellándose: fallaría imprimiendo un número plausible y equivocado, que alguien usaría para excavar. Por eso cada resultado viene con la información necesaria para saber cuánto pesa. Estas seis reglas valen para todos los paneles."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {REGLAS_DE_LECTURA.map(r => (
              <article key={r.titulo} className="border-bone-200 rounded-2xl border bg-white p-6">
                <h3 className="text-ink-950 text-base font-semibold">{r.titulo}</h3>
                <p className="text-ink-700/70 mt-2 text-sm leading-relaxed">{r.texto}</p>
              </article>
            ))}
          </div>
        </Seccion>

        {/* ── 05 · Límites ─────────────────────────────────────────────── */}
        <Seccion
          id="limites"
          num="05"
          titulo="Lo que acequia no hace"
          bajada="Dicho en una lista y no escondido en la letra chica, porque es lo que evita que alguien tome una decisión cara con la herramienta equivocada."
        >
          <ul className="divide-bone-200 border-bone-200 divide-y overflow-hidden rounded-2xl border bg-white">
            {LIMITES.map(l => (
              <li key={l} className="text-ink-700/75 px-6 py-4 text-sm leading-relaxed">{l}</li>
            ))}
          </ul>
        </Seccion>

        {/* ── 06 · El informe ──────────────────────────────────────────── */}
        <Seccion
          id="informe"
          num="06"
          titulo="El informe: donde todo se junta"
          bajada="El producto final. Cada análisis que corriste aporta su sección; lo que no corriste, simplemente no aparece. Por eso conviene recorrer las dos raíces antes de generarlo."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Portada', 'Nombre del predio, ubicación, superficie, perímetro, clima Köppen y el plano. Con tu logo y tus datos si tu plan lo incluye.'],
              ['Resumen ejecutivo', 'Los indicadores clave y los aspectos a considerar, según los umbrales de cada análisis.'],
              ['Una sección por análisis', 'Clima, suelo, agua, relieve, contexto… en orden, cada uno con la fuente del dato registrada.'],
              ['Economía y carbono', 'El presupuesto con su retorno, y el carbono con su equivalencia.'],
              ['Anexo', 'Fuentes, métodos, licencias y notas. Acá queda registrado, por ejemplo, si calibraste la lluvia con una estación propia.'],
              ['Exportaciones', 'Además del informe: imagen del plano, DXF para CAD, GeoJSON, KML y GPX.'],
            ].map(([t, d]) => (
              <article key={t} className="border-bone-200 rounded-2xl border bg-white p-5">
                <h3 className="text-ink-950 text-base font-semibold">{t}</h3>
                <p className="text-ink-700/70 mt-2 text-sm leading-relaxed">{d}</p>
              </article>
            ))}
          </div>
          <div className="bg-ink-950 text-bone-50 mt-7 rounded-2xl p-6">
            <p className="eyebrow !text-water-300">Regla de oro</p>
            <p className="text-bone-50/80 mt-3 max-w-3xl text-sm leading-relaxed">
              El informe refleja exactamente lo que calculaste. Y en el informe nada queda plegado:
              todas las cautelas se imprimen enteras, porque el papel se lee sin hacer clic.
            </p>
          </div>
        </Seccion>

        {/* ── 07 · Capturas ────────────────────────────────────────────── */}
        <section className="border-bone-200 border-t py-12">
          <h2 className="font-display text-ink-950 text-2xl">Así se ve</h2>
          <p className="text-ink-700/70 mt-2 max-w-3xl text-sm leading-relaxed">
            Capturas sobre un predio de prueba. Hacé clic para verlas en grande.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {CAPTURAS.map(c => (
              <a
                key={c.archivo}
                href={`/img/guia/${c.archivo}`}
                target="_blank"
                rel="noopener"
                className="border-bone-200 hover:border-moss-500 block overflow-hidden rounded-xl border bg-white transition-colors"
              >
                <img src={`/img/guia/${c.archivo}`} alt={c.alt} loading="lazy" className="w-full" />
              </a>
            ))}
          </div>
        </section>

        {/* ── 08 · Los planes ──────────────────────────────────────────── */}
        <Seccion
          id="planes"
          num="07"
          titulo="Los planes"
          bajada={`Todo empieza con ${ACEQUIA_TRIAL_DAYS} días de acceso completo. Si cancelás antes del primer cobro, la cuenta sigue en Semilla. Esta tabla se arma leyendo el mismo catálogo que aplica los permisos, así que no puede decir un precio que no sea el que se cobra.`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {(Object.values(ACEQUIA_PLANS)
              .sort((a, b) => ACEQUIA_PLAN_ORDER[a.id] - ACEQUIA_PLAN_ORDER[b.id]))
              .map(plan => (
                <article key={plan.id} className="border-bone-200 rounded-2xl border bg-white p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-ink-950 text-2xl">{plan.name}</h3>
                    <span className="text-water-500 text-sm font-semibold">
                      {plan.monthlyUsd === null
                        ? 'gratis'
                        : `US$ ${plan.monthlyUsd}/mes · US$ ${plan.annualUsd}/año`}
                    </span>
                  </div>
                  <p className="text-ink-700/70 mt-2 text-sm">
                    {plan.projects} {plan.projects === 1 ? 'proyecto activo' : 'proyectos activos'}
                    {plan.seats > 1 ? ` · ${plan.seats} cuentas` : ''}
                    {plan.id === 'semilla'
                      ? ` · el relieve, hasta ${String(ACEQUIA_TOPO_SEMILLA_HA).replace('.', ',')} ha`
                      : ''}
                  </p>
                  <p className="text-ink-700/55 mt-3 text-xs font-medium tracking-wide uppercase">
                    {plan.id === 'semilla' ? 'Incluye' : 'Suma al plan anterior'}
                  </p>
                  <ul className="text-ink-700/75 mt-2 space-y-1 text-sm">
                    {saltoDeCapacidad(plan.id) && (
                      <li className="text-ink-950 flex gap-2 leading-relaxed font-medium">
                        <span className="text-moss-500 shrink-0">·</span>
                        {saltoDeCapacidad(plan.id)}
                      </li>
                    )}
                    {loQueSuma(plan.id).map(f => (
                      <li key={f} className="flex gap-2 leading-relaxed">
                        <span className="text-moss-500 shrink-0">·</span>
                        {ROTULO_FEATURE[f]}
                      </li>
                    ))}
                  </ul>
                  {!plan.selfCheckout && plan.monthlyUsd !== null && (
                    <p className="border-bone-200 text-ink-700/60 mt-4 border-t pt-3 text-xs leading-relaxed">
                      El alta de este plan pasa por una persona: escribinos y lo damos de alta.
                    </p>
                  )}
                </article>
              ))}
          </div>
        </Seccion>

        {/* ── 09 · Relieve ─────────────────────────────────────────────── */}
        <Seccion
          id="relieve"
          num="08"
          titulo="De dónde sale el relieve"
          bajada="Todo lo topográfico —curvas, escorrentías, cuencas, aptitud, keyline, master plan— sale de un modelo de elevación. Por defecto se usa el global; donde hay un servicio nacional de mayor resolución con licencia clara, la app lo elige sola. La fuente activa se muestra en el mapa y en el informe."
        >
          <div className="divide-bone-200 border-bone-200 divide-y overflow-hidden rounded-2xl border bg-white">
            {FUENTES_DEM.map(f => (
              <div key={f} className="px-6 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-ink-950 text-base font-semibold">{ETIQUETA_RELIEVE[f]}</h3>
                  <span className="text-water-500 text-xs font-semibold">
                    {f === 'usuario'
                      ? 'el paso del archivo que subas'
                      : `~${String(PASO_RELIEVE[f]).replace('.', ',')} m de paso`}
                  </span>
                </div>
                <p className="text-ink-700/70 mt-1 text-sm leading-relaxed">{TERRITORIO_DEM[f]}</p>
                <p className="text-ink-700/50 mt-1 text-xs leading-relaxed">{CREDITO_RELIEVE[f]}</p>
              </div>
            ))}
          </div>
          <p className="text-ink-700/70 mt-6 max-w-3xl text-sm leading-relaxed">
            El paso que figura arriba es el conservador: el que se puede prometer en cualquier punto
            de la cobertura, no el del folleto. Y el paso <em>efectivo</em> de tu predio puede ser
            mayor, porque también depende de cuántos nodos se muestrean sobre esa superficie. Ese es
            el número que decide hasta qué intervalo de curvas tiene sentido dibujar.
          </p>
          <h3 className="text-ink-950 mt-8 text-base font-semibold">
            ¿Tu país no está en la lista?
          </h3>
          <p className="text-ink-700/70 mt-2 max-w-3xl text-sm leading-relaxed">
            Bajá el modelo oficial y subilo con <strong className="text-ink-950">Importar
            GeoTIFF</strong> desde la barra de dibujo: tu propio modelo tiene prioridad sobre todos
            los demás.
          </p>
          <ul className="divide-bone-200 border-bone-200 mt-4 divide-y overflow-hidden rounded-2xl border bg-white">
            {DEM_PARA_IMPORTAR.map(d => (
              <li key={d.pais} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-6 py-3 text-sm">
                <span className="text-ink-950 w-24 shrink-0 font-semibold">{d.pais}</span>
                <span className="text-ink-700/75">{d.fuente}</span>
                <span className="text-ink-700/50 text-xs">{d.donde}</span>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* ── 10 · Problemas ───────────────────────────────────────────── */}
        <Seccion
          id="problemas"
          num="09"
          titulo="Si algo no aparece"
          bajada="Casi todas las veces que la app parece rota, en realidad está avisando el límite del dato. Estos son los casos frecuentes."
        >
          <div className="space-y-3">
            {SINTOMAS.map(s => (
              <article key={s.sintoma} className="border-bone-200 rounded-2xl border bg-white p-5">
                <h3 className="text-ink-950 text-base font-semibold">«{s.sintoma}»</h3>
                <p className="text-ink-700/70 mt-2 text-sm leading-relaxed">{s.porque}</p>
                <p className="text-moss-700 mt-2 text-sm leading-relaxed">
                  <span className="font-semibold">Qué hacer · </span>{s.hacer}
                </p>
              </article>
            ))}
          </div>
        </Seccion>

        {/* ── 11 · Glosario ────────────────────────────────────────────── */}
        <Seccion
          id="glosario"
          num="10"
          titulo="Glosario"
          bajada="Las palabras que la app usa sin explicar cada vez. Están acá porque la misma pantalla la lee alguien que diseña en permacultura y alguien que dimensiona una cañería, y no comparten vocabulario."
        >
          <dl className="divide-bone-200 border-bone-200 divide-y overflow-hidden rounded-2xl border bg-white">
            {GLOSARIO.map(g => (
              <div key={g.termino} className="px-6 py-4">
                <dt className="text-ink-950 text-sm font-semibold">{g.termino}</dt>
                <dd className="text-ink-700/70 mt-1 text-sm leading-relaxed">{g.definicion}</dd>
              </div>
            ))}
          </dl>
        </Seccion>

        <section className="border-bone-200 flex flex-wrap items-center gap-3 border-t pt-10">
          <Link
            href="/mapa"
            className="bg-moss-700 hover:bg-moss-900 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-colors"
          >
            Aplicarlo en el mapa
          </Link>
          <a
            href="mailto:info@arteytierra.org?subject=Consulta%20sobre%20acequia"
            className="border-bone-200 text-ink-700 hover:border-moss-500 rounded-lg border bg-white px-5 py-3 text-sm font-semibold transition-colors"
          >
            Preguntar por una fuente
          </a>
          <span className="text-ink-700/55 text-xs">
            Dentro del mapa, Ctrl+K abre el buscador de herramientas y atajos.
          </span>
        </section>
      </div>
    </main>
  );
}
