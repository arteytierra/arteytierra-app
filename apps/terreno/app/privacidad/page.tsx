export const metadata = { title: 'Política de Privacidad' };

const ACTUALIZADO = '26 de agosto de 2026';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-bone-50 px-4 py-12">
      <article className="mx-auto w-full max-w-2xl">
        <header className="mb-10 text-center">
          <p className="eyebrow mb-2">Arte y Tierra</p>
          <h1 className="font-display text-3xl text-ink-950">Política de Privacidad</h1>
          <p className="mt-2 text-sm text-ink-700/70">
            Última actualización: {ACTUALIZADO}
          </p>
        </header>

        <div className="space-y-8 rounded-2xl border border-bone-200 bg-white p-6 shadow-paper sm:p-8">
          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">1. Alcance</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Esta política explica qué datos trata <strong>acequia</strong> (el «Servicio»),
              la herramienta de diseño ecosistémico del territorio operada por Arte y Tierra.
              Complementa la{' '}
              <a href="https://arteytierra.org/privacidad" className="text-moss-700 underline">
                política general de Arte y Tierra
              </a>
              , que cubre el sitio, la tienda y los canales de atención. Ante cualquier
              diferencia sobre el Servicio, manda esta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">2. Qué datos guardamos</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-700">
              <li>
                <strong>Cuenta:</strong> tu correo electrónico y tu nombre. Si entrás con
                Google, recibimos esos mismos datos de tu perfil; nunca tu contraseña.
              </li>
              <li>
                <strong>Tus proyectos:</strong> las coordenadas de los mojones que marcás y
                todo lo que dibujás encima (zonas, sectores, caminos, pines, capas), junto
                con los resultados de los análisis que corrés sobre ese predio. Son tuyos:
                los guardamos para que puedas volver a abrirlos.
              </li>
              <li>
                <strong>Plan y pagos:</strong> qué plan tenés, desde cuándo y por qué medio.
                Los datos de tu tarjeta los procesan Mercado Pago o PayPal —{' '}
                <strong>nosotros no los vemos ni los almacenamos</strong>.
              </li>
              <li>
                <strong>Uso del Servicio:</strong> registros técnicos y eventos mínimos —por
                ejemplo, que intentaste abrir una función que tu plan no incluye— para
                entender qué mejorar.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              3. La ubicación de tu terreno
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Las coordenadas de un predio son un dato sensible: pueden identificar dónde
              vivís o trabajás. Por eso:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-700">
              <li>Tus proyectos son <strong>privados por defecto</strong>. Nadie más que vos los ve.</li>
              <li>
                Sólo se vuelven accesibles si vos generás un <strong>enlace de informe
                compartido</strong>. Ese enlace lleva un identificador aleatorio y no
                adivinable, y podés dejar de publicarlo cuando quieras.
              </li>
              <li>
                <strong>No vendemos ni cedemos</strong> las coordenadas de tu predio a
                terceros, ni las usamos para publicidad.
              </li>
              <li>
                Si usás «Mi ubicación», el navegador te pide permiso y la posición se usa
                sólo para centrar el mapa en ese momento.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">
              4. Servicios externos de datos
            </h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Para analizar tu predio, el Servicio consulta fuentes públicas de datos
              abiertos (clima, relieve, suelo, cobertura, biodiversidad, mapas base). Esas
              consultas se hacen <strong>desde nuestros servidores</strong>, no desde tu
              navegador, y viajan sólo las coordenadas del área a analizar: nunca tu nombre,
              tu correo ni el nombre de tu proyecto. Los resultados se guardan en una caché
              propia para no repetir pedidos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">5. Con quién los compartimos</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Con nadie, salvo los proveedores necesarios para que el Servicio funcione:
              Supabase (base de datos y autenticación), Vercel (alojamiento) y las
              plataformas de pago mencionadas. Cada uno trata los datos por nuestra cuenta y
              bajo sus propias obligaciones de seguridad. También podríamos compartirlos si
              nos lo exige una autoridad competente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">6. Cuánto los conservamos</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Mientras tengas la cuenta activa. Si la cerrás, borramos tus proyectos y tus
              datos personales, salvo los registros contables de pagos que la ley nos obliga
              a conservar.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">7. Tus derechos</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Podés pedirnos acceder, rectificar, actualizar o eliminar tus datos, y llevarte
              tus proyectos (el Servicio ya exporta a GeoJSON, KML, GPX y DXF según tu plan).
              Escribinos a{' '}
              <a href="mailto:info@arteytierra.org" className="text-moss-700 underline">
                info@arteytierra.org
              </a>{' '}
              y respondemos dentro de los plazos legales. En Argentina, la Agencia de Acceso
              a la Información Pública es la autoridad de control (Ley 25.326).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">8. Menores de edad</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              El Servicio no está dirigido a menores de 16 años y no recopilamos sus datos a
              sabiendas. Si detectás que ocurrió, avisanos y los eliminamos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">9. Cambios</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Si cambiamos esta política, actualizamos la fecha de arriba y, cuando el cambio
              sea relevante, te avisamos por correo o dentro de la aplicación.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-ink-950">10. Contacto</h2>
            <p className="text-sm leading-relaxed text-ink-700">
              Por cualquier consulta sobre tus datos, escribinos a{' '}
              <a href="mailto:info@arteytierra.org" className="text-moss-700 underline">
                info@arteytierra.org
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-ink-700/60">
          Arte y Tierra · arteytierra.org ·{' '}
          <a href="/terminos" className="underline hover:text-moss-700">Términos de Servicio</a>
        </p>
      </article>
    </div>
  );
}
