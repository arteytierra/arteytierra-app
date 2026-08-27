export const metadata = { title: 'Términos de Servicio' };

const ACTUALIZADO = '27 de julio de 2026';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-bone-50 px-4 py-12">
      <article className="mx-auto w-full max-w-2xl">
        <header className="mb-10 text-center">
          <p className="eyebrow mb-2">Arte y Tierra</p>
          <h1 className="font-display text-3xl text-ink-950">Términos de Servicio</h1>
          <p className="mt-2 text-sm text-ink-700/70">
            Última actualización: {ACTUALIZADO}
          </p>
        </header>

        <div className="space-y-8 rounded-2xl border border-bone-200 bg-white p-6 shadow-paper sm:p-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">1. Aceptación</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Al crear una cuenta o usar acequia (el
              «Servicio»), operada por Arte y Tierra, aceptás estos Términos de
              Servicio. Si no estás de acuerdo, no uses el Servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">2. El Servicio</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              El Servicio es una herramienta web de análisis catastral y de terreno
              que permite trazar mojones, medir superficie y perímetro, calcular
              rumbos y generar análisis de diseño. Se ofrece en distintos planes,
              gratuitos y pagos, según se detalla en la página de planes. Podemos
              modificar, suspender o discontinuar funciones en cualquier momento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              3. Propiedad intelectual
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              El Servicio, su código, diseño, interfaz, algoritmos, cálculos, bases
              de datos, marca, logotipos y todo su contenido son propiedad exclusiva
              de Arte y Tierra y están protegidos por las leyes de derecho de autor y
              propiedad industrial. No se te transfiere ningún derecho de propiedad:
              sólo recibís una licencia limitada de uso según estos Términos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              4. Licencia de uso
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Te otorgamos una licencia personal, limitada, no exclusiva,
              intransferible y revocable para usar el Servicio con fines propios,
              conforme al plan que tengas activo. Esta licencia no incluye ningún
              derecho a copiar, distribuir, sublicenciar ni explotar comercialmente
              el Servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">5. Usos prohibidos</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              No está permitido, ni por vos ni por terceros que actúen en tu nombre:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-700">
              <li>
                Realizar ingeniería inversa, descompilar, desensamblar o intentar
                obtener el código fuente, la lógica o los algoritmos del Servicio.
              </li>
              <li>
                Copiar, reproducir, replicar, modificar o crear obras derivadas del
                Servicio, su interfaz, su diseño o cualquiera de sus componentes.
              </li>
              <li>
                Extraer datos de forma automatizada (scraping, crawling, bots,
                scripts) o acceder al Servicio por medios distintos a la interfaz
                provista.
              </li>
              <li>
                Revender, alquilar, sublicenciar, redistribuir o explotar
                comercialmente el Servicio o su contenido sin autorización escrita.
              </li>
              <li>
                Eludir, desactivar o interferir con medidas de seguridad, límites de
                plan, marcas de agua o controles de acceso.
              </li>
              <li>
                Usar el Servicio para desarrollar un producto o servicio competidor.
              </li>
              <li>
                Sobrecargar la infraestructura o intentar acceder a cuentas o datos
                de otros usuarios.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              6. Cuentas y responsabilidad
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Sos responsable de la información que cargás, de mantener la
              confidencialidad de tus credenciales y de toda la actividad de tu
              cuenta. Los datos y análisis que generás son tuyos; nos autorizás a
              procesarlos para prestarte el Servicio.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">7. Planes y pagos</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Los planes pagos se facturan de forma recurrente (mensual o anual)
              según el plan elegido, a través de los medios de pago habilitados
              (Mercado Pago para Argentina, PayPal para el resto del mundo). Podés
              cancelar la renovación en cualquier momento; el acceso continúa hasta el
              fin del período ya abonado. Los precios pueden actualizarse con aviso
              previo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              8. Sin garantías y limitación de responsabilidad
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              El Servicio se provee «tal cual», sin garantías de exactitud. Los
              análisis, mediciones y cálculos son orientativos y no reemplazan un
              relevamiento profesional, una mensura oficial ni asesoramiento técnico o
              legal. Arte y Tierra no será responsable por decisiones tomadas en base
              a la información del Servicio ni por daños indirectos derivados de su
              uso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">9. Cambios</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Podemos actualizar estos Términos. Si el cambio es significativo, lo
              avisaremos por la plataforma o por correo. El uso continuado del
              Servicio implica la aceptación de la versión vigente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              10. Ley aplicable y jurisdicción
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Estos Términos se rigen por las leyes de la República Argentina. Ante
              cualquier controversia, las partes se someten a los tribunales
              ordinarios competentes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">11. Contacto</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Por cualquier consulta sobre estos Términos, escribinos a{' '}
              <a
                href="mailto:info@arteytierra.org"
                className="text-moss-700 underline"
              >
                info@arteytierra.org
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-ink-700/60">
          Arte y Tierra · arteytierra.org
        </p>
      </article>
    </div>
  );
}
