'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'ok' | 'error';

interface Props {
  curso: string;
  whatsapp: string;
  mercadopago?: string;
}

export function CourseEnrollForm({ curso, whatsapp, mercadopago }: Props) {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    try {
      const res = await fetch('/api/cursos/inscribir', {
        method: 'POST',
        body: new FormData(form),
      });
      setStatus(res.ok ? 'ok' : 'error');
      if (res.ok) form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div className="p-10 bg-ink-800 border border-ink-600 text-center">
        <h3 className="font-display text-2xl text-bone-50 mb-3">¡Recibimos tu inscripción!</h3>
        <p className="font-sans text-bone-300 text-base leading-relaxed">
          Te escribimos en las próximas 24–48 horas hábiles con los pasos para confirmar el cupo.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-bone-100 p-8 flex flex-col gap-5">
        <input type="hidden" name="_subject" value={`Nueva inscripción · ${curso}`} />
        <input type="hidden" name="curso" value={curso} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="font-sans text-sm font-semibold text-ink-800">Nombre completo *</label>
            <input id="nombre" name="nombre" type="text" required placeholder="Tu nombre"
              className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-sans text-sm font-semibold text-ink-800">Email *</label>
            <input id="email" name="email" type="email" required placeholder="tu@email.com"
              className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsapp" className="font-sans text-sm font-semibold text-ink-800">WhatsApp</label>
            <input id="whatsapp" name="whatsapp" type="tel" placeholder="+54 9 ..."
              className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ciudad" className="font-sans text-sm font-semibold text-ink-800">Ciudad y país</label>
            <input id="ciudad" name="ciudad" type="text" placeholder="Córdoba, Argentina"
              className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="mensaje" className="font-sans text-sm font-semibold text-ink-800">Mensaje (opcional)</label>
          <textarea id="mensaje" name="mensaje" rows={4}
            placeholder="¿Algo que quieras contarnos? Experiencia previa, dudas, necesidades especiales..."
            className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700 resize-none" />
        </div>

        {status === 'error' && (
          <p className="font-sans text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
            Hubo un error al enviar. Por favor intentá de nuevo o escribinos por WhatsApp.
          </p>
        )}

        <button type="submit" disabled={status === 'sending'}
          className="bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {status === 'sending' ? 'Enviando...' : 'Reservar cupo →'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-400 mb-4">— O contactanos directamente —</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={whatsapp} target="_blank" rel="noopener noreferrer"
            className="inline-flex bg-ink-800 text-bone-50 font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:bg-ink-700 transition-colors">
            WhatsApp →
          </a>
          {mercadopago && (
            <a href={mercadopago} target="_blank" rel="noopener noreferrer"
              className="inline-flex bg-[#00B1EA] text-white font-sans font-bold text-xs uppercase tracking-widest px-5 py-3 hover:opacity-90 transition-opacity">
              Mercado Pago →
            </a>
          )}
        </div>
        <p className="mt-4 font-sans text-xs text-ink-500 italic">
          Aclarás el nombre del curso en el pago y enviás el comprobante por WhatsApp.
        </p>
      </div>
    </>
  );
}
