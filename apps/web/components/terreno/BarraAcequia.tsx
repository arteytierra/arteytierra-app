'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { REGISTRO_URL } from '@/lib/terreno/planes';

/**
 * Barra de conversión de la landing de acequia.
 *
 * La página tiene cinco secciones seguidas —lo que hace, de dónde salen los
 * datos, para quién es, planes, preguntas— sin ningún lugar donde hacer clic:
 * los únicos dos botones están en el hero y en el cierre. Quien se convence a
 * mitad de página tiene que buscar dónde empezar. Esta barra acompaña ese
 * tramo: aparece cuando el hero terminó de salir de pantalla y se retira al
 * llegar al CTA final, donde sería redundante y taparía justamente el botón al
 * que queremos llevar.
 *
 * Se observan las dos secciones con IntersectionObserver en vez de escuchar el
 * scroll: no hay que medir geometría en cada evento y los cambios de alto de la
 * página —imágenes que cargan tarde, rotar el teléfono— se resuelven solos.
 *
 * Posición, transformación y transición van en `style` y no en clases: en el
 * CSS compilado de esta app faltan utilidades que uno daría por seguras
 * (`w-auto` es el caso conocido), y acá una clase ausente no se vería mal
 * —dejaría la barra fija tapando el contenido en todo el scroll—. Los colores
 * y la tipografía sí van en clases: son las mismas que ya usa la página.
 */
export function BarraAcequia({ desdeUSD }: { desdeUSD: number }) {
  const [visible, setVisible] = useState(false);
  const [animar, setAnimar]   = useState(true);

  useEffect(() => {
    setAnimar(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const hero   = document.getElementById('acequia-hero');
    const cierre = document.getElementById('acequia-cta-final');
    if (!hero || !cierre) return;

    // El banner de cookies vive en el mismo borde inferior y con más z-index,
    // así que mientras esté abierto las dos piezas se pisan. Como sale para
    // todo visitante nuevo —o sea, para casi todos los que lleguen acá—, la
    // barra espera a que el consentimiento esté resuelto. ConsentBanner escribe
    // esa decisión en la cookie `ay_consent` antes de cerrarse.
    const consentimientoResuelto = () => document.cookie.includes('ay_consent=');

    let pasoHero = false;
    let enCierre = false;
    const sincronizar = () => setVisible(pasoHero && !enCierre && consentimientoResuelto());

    // `top < 0` distingue "el hero ya quedó arriba" de "todavía no llegamos":
    // sin eso la barra aparecería también antes de empezar a bajar.
    const obsHero = new IntersectionObserver(([e]) => {
      if (!e) return;
      pasoHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      sincronizar();
    });

    // El margen negativo abajo adelanta el apagado: la barra se retira cuando
    // el cierre entró en el 70% de arriba de la pantalla, no cuando asoma. Y el
    // `top < 0` la mantiene guardada en el footer, más abajo del cierre.
    const obsCierre = new IntersectionObserver(([e]) => {
      if (!e) return;
      enCierre = e.isIntersecting || e.boundingClientRect.top < 0;
      sincronizar();
    }, { rootMargin: '0px 0px -30% 0px' });

    obsHero.observe(hero);
    obsCierre.observe(cierre);
    // Aceptar las cookies es un clic: alcanza con reevaluar después de
    // cualquiera para que la barra aparezca sin esperar al próximo scroll.
    document.addEventListener('click', sincronizar);

    return () => {
      obsHero.disconnect();
      obsCierre.disconnect();
      document.removeEventListener('click', sincronizar);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        transition: animar ? 'transform 260ms ease-out' : 'none',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      className="bg-[#1A1210]/95 backdrop-blur border-t border-[#2E6B8A]/40 shadow-2xl shadow-[#1A1210]/50"
    >
      <div className="max-w-editorial mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <p className="font-sans text-xs sm:text-sm text-[#F5F0E8]/85 leading-tight">
          <span className="text-[#F5F0E8] font-semibold">Gratis, sin tarjeta.</span>{' '}
          <span className="hidden sm:inline">Los planes pagos arrancan en </span>
          <span className="sm:hidden">Desde </span>
          <span className="font-mono tabular-nums text-[#7FB2CC]">USD&nbsp;{desdeUSD}</span> al mes.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="#planes"
            className="hidden md:inline-flex font-sans font-bold text-xs uppercase tracking-widest text-[#F5F0E8]/70 hover:text-[#F5F0E8] transition-colors"
            tabIndex={visible ? undefined : -1}
          >
            Ver planes
          </a>
          <a
            href={REGISTRO_URL}
            className="inline-flex items-center gap-2 bg-[#2E6B8A] text-[#F5F0E8] font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-[#4A6741] transition-colors"
            tabIndex={visible ? undefined : -1}
          >
            Trazar mi terreno <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
