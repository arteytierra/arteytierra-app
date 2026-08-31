'use client';

import { useState } from 'react';
import { PostSignupNewsletter } from '@/components/newsletter/PostSignupNewsletter';
import type { CourseOption } from '@/lib/courses/data';

type Status = 'idle' | 'sending' | 'ok' | 'error';

interface Props {
  curso: string;
  whatsapp: string;
  mercadopago?: string;
  /** Opciones de inscripción (precios) — si hay más de una, se muestra un selector. */
  opciones?: CourseOption[];
  /** % de seña para reservar cupo por Mercado Pago (requiere `opciones`). */
  senaPercent?: number;
  /** Oculta la palabra "cupo" en el botón (cursos sin framing de escasez). */
  ocultarCupos?: boolean;
}

/** "$120.000 ARS" → 120000. Devuelve null si no hay dígitos. */
function parsePrecioArs(precio: string): number | null {
  const digits = precio.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

function formatArs(n: number): string {
  return `$${Math.round(n).toLocaleString('es-AR')} ARS`;
}

export function CourseEnrollForm({ curso, whatsapp, mercadopago, opciones, senaPercent, ocultarCupos }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [datos, setDatos] = useState<{ email: string; name: string }>({ email: '', name: '' });

  const opcionesValidas = opciones && opciones.length > 1 ? opciones : undefined;
  const defaultOpcion = opcionesValidas && (opcionesValidas.find(o => o.highlighted) ?? opcionesValidas[0]);
  const [opcionSel, setOpcionSel] = useState<string>(
    defaultOpcion ? `${defaultOpcion.label} — ${defaultOpcion.precio}` : ''
  );
  const selectedOpcion = opcionesValidas?.find(op => `${op.label} — ${op.precio}` === opcionSel);
  const montoTotal = selectedOpcion ? parsePrecioArs(selectedOpcion.precio) : null;
  const senaMonto = montoTotal && senaPercent ? formatArs((montoTotal * senaPercent) / 100) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const fd = new FormData(form);
    setDatos({ email: String(fd.get('email') ?? ''), name: String(fd.get('nombre') ?? '') });
    try {
      const res = await fetch('/api/cursos/inscribir', {
        method: 'POST',
        body: fd,
      });
      setStatus(res.ok ? 'ok' : 'error');
      if (res.ok) form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div>
        <div className="p-10 bg-ink-800 border border-ink-700 text-center">
          <h3 className="font-display text-2xl text-bone-50 mb-3">¡Recibimos tu inscripción!</h3>
          <p className="font-sans text-bone-200 text-base leading-relaxed">
            Te escribimos en las próximas 24–48 horas hábiles con los pasos para confirmar el cupo.
          </p>
        </div>
        <PostSignupNewsletter email={datos.email} name={datos.name} source="inscripcion-curso" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-bone-100 p-8 flex flex-col gap-5">
        <input type="hidden" name="_subject" value={`Nueva inscripción · ${curso}`} />
        <input type="hidden" name="curso" value={curso} />

        {opcionesValidas && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="opcion" className="font-sans text-sm font-semibold text-ink-800">¿Qué opción querés reservar? *</label>
            <select id="opcion" name="opcion" required value={opcionSel} onChange={e => setOpcionSel(e.target.value)}
              className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 focus:outline-none focus:border-clay-700">
              {opcionesValidas.map(op => (
                <option key={op.id} value={`${op.label} — ${op.precio}`}>{op.label} — {op.precio}</option>
              ))}
            </select>
            {senaMonto && (
              <p className="font-sans text-xs text-clay-700">
                Reservás con una seña del {senaPercent}%: <strong>{senaMonto}</strong>. El resto se paga antes de empezar.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="font-sans text-sm font-semibold text-ink-800">Nombre completo *</label>
            <input id="nombre" name="nombre" type="text" required placeholder="Tu nombre"
              className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-sans text-sm font-semibold text-ink-800">Email *</label>
            <input id="email" name="email" type="email" required placeholder="tu@email.com"
              className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsapp" className="font-sans text-sm font-semibold text-ink-800">WhatsApp</label>
            <input id="whatsapp" name="whatsapp" type="tel" placeholder="+54 9 ..."
              className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ciudad" className="font-sans text-sm font-semibold text-ink-800">Ciudad y país</label>
            <input id="ciudad" name="ciudad" type="text" placeholder="Córdoba, Argentina"
              className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="mensaje" className="font-sans text-sm font-semibold text-ink-800">Mensaje (opcional)</label>
          <textarea id="mensaje" name="mensaje" rows={4}
            placeholder="¿Algo que quieras contarnos? Experiencia previa, dudas, necesidades especiales..."
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700 resize-none" />
        </div>

        {status === 'error' && (
          <p className="font-sans text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
            Hubo un error al enviar. Por favor intentá de nuevo o escribinos por WhatsApp.
          </p>
        )}

        <button type="submit" disabled={status === 'sending'}
          className="bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {status === 'sending' ? 'Enviando...' : ocultarCupos ? 'Enviar inscripción →' : 'Reservar cupo →'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">— O contactanos directamente —</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={whatsapp} target="_blank" rel="noopener noreferrer"
            className="inline-flex bg-ink-800 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-ink-700 transition-colors">
            WhatsApp →
          </a>
          {mercadopago && (
            <a href={mercadopago} target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-[#00B1EA] text-white font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:opacity-90 transition-opacity">
              {senaMonto ? `Pagar seña ${senaPercent}% (${senaMonto}) →` : 'Mercado Pago →'}
            </a>
          )}
        </div>
        <p className="mt-4 font-sans text-xs text-bone-200/70 italic">
          {senaMonto
            ? `Aclarás tu nombre, la opción elegida (${selectedOpcion?.label}) y el monto de la seña en el pago, y enviás el comprobante por WhatsApp.`
            : 'Aclarás el nombre del curso en el pago y enviás el comprobante por WhatsApp.'}
        </p>
      </div>
    </>
  );
}
