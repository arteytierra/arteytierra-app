'use client';

import { useState } from 'react';
import { PostSignupNewsletter } from '@/components/newsletter/PostSignupNewsletter';

const INTERESES = [
  { name: 'interes_bioarq', label: 'Proyecto de bioarquitectura' },
  { name: 'interes_hidro', label: 'Proyecto de hidrología' },
  { name: 'interes_taller_predio', label: 'Taller en mi predio' },
  { name: 'interes_taller_tp', label: 'Taller en Tay Pichín' },
  { name: 'interes_hostel', label: 'Ecohostel · estadía' },
  { name: 'interes_inmersion', label: 'Voluntariado / Inmersión Viva' },
  { name: 'interes_otro', label: 'Otro' },
];

type Status = 'idle' | 'sending' | 'ok' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [datos, setDatos] = useState({ nombre: '', email: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const res = await fetch('https://formspree.io/f/mvzlarvb', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        // Capturamos nombre/email antes del reset para prellenar el newsletter.
        setDatos({
          nombre: String(data.get('nombre') ?? ''),
          email: String(data.get('email') ?? ''),
        });
        setStatus('ok');
        form.reset();
      }
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div className="bg-clay-700/30 border border-clay-700 p-8 text-center">
        <p className="font-display text-2xl text-bone-50 mb-3">¡Mensaje enviado!</p>
        <p className="font-sans text-sm text-bone-200 leading-relaxed">
          Te respondemos en 24–48 hs. Si es urgente, escribinos por WhatsApp.
        </p>
        <a
          href="https://wa.me/5493549431594"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-6 py-3 hover:bg-clay-900 transition-colors"
        >
          WhatsApp →
        </a>
        <div className="mt-6 text-left">
          <PostSignupNewsletter
            email={datos.email}
            name={datos.nombre}
            source="contacto"
            segments={['newsletter']}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="_subject" value="Nuevo mensaje de contacto · arteytierra.org" />
      <input type="hidden" name="form-name" value="contacto" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" name="nombre" required placeholder="Nombre completo"
          className="bg-bone-50/10 border border-bone-50/20 text-bone-100 placeholder-bone-200/50 font-sans text-sm px-4 py-3 focus:outline-none focus:border-clay-500 transition-colors" />
        <input type="email" name="email" required placeholder="Email"
          className="bg-bone-50/10 border border-bone-50/20 text-bone-100 placeholder-bone-200/50 font-sans text-sm px-4 py-3 focus:outline-none focus:border-clay-500 transition-colors" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" name="pais" placeholder="País y región"
          className="bg-bone-50/10 border border-bone-50/20 text-bone-100 placeholder-bone-200/50 font-sans text-sm px-4 py-3 focus:outline-none focus:border-clay-500 transition-colors" />
        <input type="tel" name="whatsapp" placeholder="WhatsApp (opcional)"
          className="bg-bone-50/10 border border-bone-50/20 text-bone-100 placeholder-bone-200/50 font-sans text-sm px-4 py-3 focus:outline-none focus:border-clay-500 transition-colors" />
      </div>

      <div>
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-3">
          ¿Qué buscás? Podés marcar varios
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {INTERESES.map(i => (
            <label key={i.name} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name={i.name} value="si" className="w-4 h-4 accent-clay-700 flex-shrink-0" />
              <span className="font-sans text-sm text-bone-200 group-hover:text-bone-50 transition-colors">{i.label}</span>
            </label>
          ))}
        </div>
      </div>

      <textarea name="mensaje" rows={5} placeholder="Contanos más sobre tu proyecto, idea o consulta…"
        className="bg-bone-50/10 border border-bone-50/20 text-bone-100 placeholder-bone-200/50 font-sans text-sm px-4 py-3 resize-none focus:outline-none focus:border-clay-500 transition-colors" />

      {status === 'error' && (
        <p className="font-sans text-sm text-danger-500">
          Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.
        </p>
      )}

      <button type="submit" disabled={status === 'sending'}
        className="self-start bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-60">
        {status === 'sending' ? 'Enviando…' : 'Enviar mensaje →'}
      </button>
    </form>
  );
}
