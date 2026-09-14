'use client';

import { useState } from 'react';
import { FORMSPREE_ENDPOINT } from '@/lib/forms/formspree';
import { PostSignupNewsletter } from '@/components/newsletter/PostSignupNewsletter';

/**
 * El formulario que cierra la pagina de diseño.
 *
 * Antes ese lugar lo ocupaba un boton a `/asesorias`: quien llegaba hasta el
 * final —despues de leer las cinco disciplinas y las cuatro formas de
 * contratar— tenia que empezar de nuevo en otra pagina y en otro formulario.
 * La asesoria sigue ofrecida dos veces mas arriba, que es donde sirve: para
 * quien todavia no sabe por donde empezar.
 *
 * Las preguntas son las mismas que hay que hacer igual en el primer mail de
 * ida y vuelta: donde queda, cuanta tierra hay y que se quiere hacer.
 */

const DISCIPLINAS = [
  { name: 'interes_agua', label: 'Manejo del agua' },
  { name: 'interes_vivienda', label: 'Vivienda y hábitat' },
  { name: 'interes_produccion', label: 'Producción agroecológica' },
  { name: 'interes_paisajismo', label: 'Paisajismo funcional' },
  { name: 'interes_integral', label: 'Estrategia regenerativa integral' },
];

const MODOS = [
  'Solo diseño',
  'Diseño + obra',
  'Solo obra',
  'Consultoría puntual',
  'Todavía no lo tengo claro',
];

const PLAZOS = [
  'En los próximos 3 meses',
  'Dentro de este año',
  'Más adelante',
  'Sin fecha definida',
];

type Estado = 'inicial' | 'enviando' | 'enviado' | 'error';

const campo =
  'bg-bone-50/10 border border-bone-50/20 text-bone-50 placeholder-bone-200/40 font-sans text-sm px-4 py-3 focus:outline-none focus:border-clay-400 transition-colors';
const etiqueta = 'font-sans text-sm font-semibold text-bone-100';

export function ProyectoForm() {
  const [estado, setEstado] = useState<Estado>('inicial');
  const [datos, setDatos] = useState({ nombre: '', email: '' });

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado('enviando');
    const formulario = e.currentTarget;
    const data = new FormData(formulario);
    try {
      const respuesta = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      if (!respuesta.ok) {
        setEstado('error');
        return;
      }
      // Guardamos nombre y mail antes del reset, para el alta al newsletter.
      setDatos({
        nombre: String(data.get('nombre') ?? ''),
        email: String(data.get('email') ?? ''),
      });
      setEstado('enviado');
      formulario.reset();
    } catch {
      setEstado('error');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="bg-clay-700/25 border border-clay-600 p-8 md:p-10">
        <p className="font-display text-3xl text-bone-50 mb-3">Recibimos tu consulta.</p>
        <p className="font-sans text-base text-bone-200 leading-relaxed">
          Te escribimos dentro de las próximas 48 horas hábiles. Si querés adelantar algo
          —fotos del terreno, un plano, una ubicación— mandalo por WhatsApp.
        </p>
        <a
          href="https://wa.me/5493549431594?text=Hola%21%20Escribo%20por%20un%20proyecto%20de%20dise%C3%B1o."
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3 hover:bg-clay-900 transition-colors"
        >
          WhatsApp →
        </a>
        <div className="mt-8">
          <PostSignupNewsletter
            email={datos.email}
            name={datos.nombre}
            source="diseno"
            segments={['newsletter']}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6">
      <input type="hidden" name="_subject" value="Nueva consulta de diseño · arteytierra.org" />
      <input type="hidden" name="form-name" value="diseno" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dis-nombre" className={etiqueta}>Nombre *</label>
          <input id="dis-nombre" name="nombre" type="text" required autoComplete="name"
            placeholder="Tu nombre" className={campo} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dis-email" className={etiqueta}>Email *</label>
          <input id="dis-email" name="email" type="email" required autoComplete="email"
            placeholder="tu@email.com" className={campo} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dis-lugar" className={etiqueta}>¿Dónde queda el terreno?</label>
          <input id="dis-lugar" name="lugar" type="text"
            placeholder="Localidad, provincia y país" className={campo} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dis-whatsapp" className={etiqueta}>WhatsApp</label>
          <input id="dis-whatsapp" name="whatsapp" type="tel" autoComplete="tel"
            placeholder="Con código de país" className={campo} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dis-superficie" className={etiqueta}>Superficie, en hectáreas</label>
          <input id="dis-superficie" name="superficie_hectareas" type="text" inputMode="decimal"
            placeholder="Por ejemplo, 2,5" className={campo} />
          <p className="font-sans text-xs text-bone-200/60">
            Si todavía no la sabés, dejalo vacío.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dis-modo" className={etiqueta}>¿Cómo te imaginás trabajarlo?</label>
          <select id="dis-modo" name="modo" className={`${campo} appearance-none`} defaultValue="">
            <option value="" disabled>Elegí una opción</option>
            {MODOS.map(m => (
              <option key={m} value={m} className="text-ink-950">{m}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${etiqueta} mb-1`}>¿Qué necesitás? Podés marcar varios</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DISCIPLINAS.map(d => (
            <label key={d.name} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name={d.name} value="si"
                className="w-4 h-4 accent-clay-700 flex-shrink-0" />
              <span className="font-sans text-sm text-bone-200 group-hover:text-bone-50 transition-colors">
                {d.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="dis-plazo" className={etiqueta}>¿Cuándo te gustaría empezar?</label>
        <select id="dis-plazo" name="plazo" className={`${campo} appearance-none sm:w-1/2`} defaultValue="">
          <option value="" disabled>Elegí una opción</option>
          {PLAZOS.map(p => (
            <option key={p} value={p} className="text-ink-950">{p}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="dis-mensaje" className={etiqueta}>Contanos del lugar y de la idea *</label>
        <textarea id="dis-mensaje" name="mensaje" required rows={5}
          placeholder="Qué hay hoy en el terreno, cómo se comporta el agua, qué te gustaría que pase ahí. Todo lo que nos cuentes acorta la primera conversación."
          className={`${campo} resize-none`} />
      </div>

      {estado === 'error' && (
        <p role="alert" className="font-sans text-sm text-bone-50 bg-clay-900 border border-clay-500 px-4 py-3">
          No pudimos enviar el mensaje. Probá de nuevo, o escribinos por WhatsApp al{' '}
          <a href="https://wa.me/5493549431594" target="_blank" rel="noopener noreferrer" className="underline">
            +54 9 3549 43-1594
          </a>.
        </p>
      )}

      <button type="submit" disabled={estado === 'enviando'}
        className="self-start bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-60">
        {estado === 'enviando' ? 'Enviando…' : 'Enviar consulta →'}
      </button>
    </form>
  );
}
