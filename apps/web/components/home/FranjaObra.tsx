'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * La franja de obra: catorce segundos cenitales sobre la cisterna de Tay Pichín.
 *
 * Es la misma pieza que corre en la portada de `acequia.app`, y acá hace otro
 * trabajo. Allá muestra qué pasa *después* del software; acá es al revés: la
 * página entera habla de diseñar el territorio y no había ninguna obra nuestra
 * **vista desde arriba**, que es la única escala en la que se entiende un
 * sistema de agua. Las fotos de `/proyectos` muestran paredes; esto muestra el
 * predio.
 *
 * La toma arranca pegada al agua, sube hasta abrir sobre la escuela entera
 * —cinco techos, el espejo, el deck que los ata— y vuelve a bajar. Las líneas
 * que se dibujan en el vértice son la lectura del lugar: el mismo gesto que
 * hacemos en papel antes de mover un metro cúbico de tierra.
 *
 * **Lo que no dice es cuántos litros, y esa ausencia es deliberada.** Faltan dos
 * cosas para que un número de captación signifique algo y ninguna se lee desde
 * el aire: la escala —la toma no trae altura de vuelo— y la premisa de que esos
 * techos desagüen en ese espejo, que además es una biopiscina cubierta de
 * plantas flotantes y se llena de otra manera. Un área con 25 % de error
 * multiplicada por una lluvia real da litros falsos con cara de medidos.
 *
 * ── Las tres trampas del video en una página, todas medidas ───────────────
 *
 * **1 · Acá no va `loop`.** El primer cuadro y el último no son el mismo: no es
 * un bucle, es un recorrido que sube, se detiene a leer y vuelve a bajar. Corre
 * una vez y queda en reposo sobre su último cuadro, con las cinco superficies
 * puestas.
 *
 * **2 · Con `preload="none"` no alcanza con colgar la `<source>`.** El
 * navegador no pide nada hasta que alguien llama a `load()`. Por eso hay un
 * observador ancho —una pantalla y media para cada lado— que sólo dispara la
 * descarga, y otro pegado a la vista real que recién ahí reproduce: a la
 * distancia de descarga los catorce segundos se consumen antes de que la franja
 * llegue a la pantalla, y como la pieza corre una sola vez, arrancarla tarde no
 * se arregla después.
 *
 * **3 · Quien pidió menos movimiento se queda con el póster**, que no es un
 * hueco: es la obra ya leída, con las líneas puestas. Y como en el servidor la
 * respuesta a `prefers-reduced-motion` es siempre «sí», el primer dibujo del
 * navegador es idéntico al del HTML que llegó; el video aparece después.
 */
const PIEZA = '/video/cisterna-tay-pichin.mp4';
const POSTER = '/video/cisterna-tay-pichin-poster.jpg';
const DESCRIPCION =
  'Vista cenital de la Ecoescuela Tay Pichín: cinco techos entre el monte, el espejo de agua de la cisterna y el deck de madera, con el perímetro de cada superficie dibujado encima.';

export function FranjaObra() {
  const caja = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [quieto, setQuieto] = useState(true);
  const [cerca, setCerca] = useState(false);
  const [aLaVista, setALaVista] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)');
    const leer = () => setQuieto(consulta.matches);
    leer();
    consulta.addEventListener('change', leer);
    return () => consulta.removeEventListener('change', leer);
  }, []);

  useEffect(() => {
    const nodo = caja.current;
    if (quieto || !nodo || typeof IntersectionObserver === 'undefined') return;

    const pedir = new IntersectionObserver(
      entradas => {
        if (!entradas.some(e => e.isIntersecting)) return;
        setCerca(true);
        pedir.disconnect();
      },
      { rootMargin: '150% 0px' },
    );
    const reproducir = new IntersectionObserver(
      entradas => {
        if (!entradas.some(e => e.isIntersecting)) return;
        setALaVista(true);
        reproducir.disconnect();
      },
      { threshold: 0.4 },
    );

    pedir.observe(nodo);
    reproducir.observe(nodo);
    return () => { pedir.disconnect(); reproducir.disconnect(); };
  }, [quieto]);

  // Sin esto la `<source>` queda colgada y el navegador no pide el archivo.
  useEffect(() => { if (cerca) video.current?.load(); }, [cerca]);

  // Puede fallar —una pestaña en segundo plano, una política de reproducción
  // automática— y no pasa nada: queda el póster, que es la obra leída.
  useEffect(() => { if (aLaVista) void video.current?.play().catch(() => {}); }, [aLaVista]);

  return (
    <section className="bg-ink-950 py-20 md:py-28 px-6" aria-labelledby="obra-agua-titulo">
      <div className="max-w-wide mx-auto">
        <div className="max-w-editorial mx-auto mb-10 md:mb-14">
          <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-3">
            La obra, desde arriba
          </p>
          <h2 id="obra-agua-titulo" className="font-display text-4xl md:text-5xl text-bone-50">
            Del techo al<br /><em>espejo de agua.</em>
          </h2>
          <p className="mt-6 font-sans text-lg text-bone-200 leading-relaxed max-w-2xl">
            Catorce segundos sobre la cisterna de agua de lluvia de Tay Pichín. La toma sube desde
            el agua, abre sobre la escuela entera —cinco techos, el espejo, el deck que los ata— y
            vuelve a bajar. Las líneas que se dibujan encima son la lectura del lugar: el mismo
            gesto que hacemos en papel antes de mover un metro cúbico de tierra.
          </p>
        </div>

        <div ref={caja} className="relative aspect-video overflow-hidden bg-ink-800">
          {quieto ? (
            <Image
              src={POSTER}
              alt={DESCRIPCION}
              fill
              className="object-cover"
              sizes="(max-width: 1440px) 100vw, 1440px"
            />
          ) : (
            <video
              ref={video}
              muted
              playsInline
              preload="none"
              poster={POSTER}
              aria-label={DESCRIPCION}
              className="w-full h-full object-cover"
            >
              {cerca && <source src={PIEZA} type="video/mp4" />}
            </video>
          )}
        </div>

        <div className="max-w-editorial mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <p className="font-sans text-base text-bone-200/80 leading-relaxed">
            Lo que no decimos es cuántos litros junta. Para eso hay que medir los techos en el lugar
            y saber de dónde se llena ese espejo, y ninguna de las dos cosas se lee desde el aire.
            La cuenta está hecha; el dato que falta se busca con una cinta métrica.
          </p>
          <p className="font-sans text-sm text-bone-200/60 leading-relaxed md:text-right">
            Ecoescuela Tay Pichín · San Marcos Sierras, Córdoba<br />
            El vaso se cavó a mano en febrero de 2024. Imágenes de Arte y Tierra.
          </p>
        </div>
      </div>
    </section>
  );
}
