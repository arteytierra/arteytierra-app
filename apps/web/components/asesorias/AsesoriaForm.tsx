'use client';

import { useState } from 'react';
import { PostSignupNewsletter } from '@/components/newsletter/PostSignupNewsletter';

type Status = 'idle' | 'sending' | 'ok' | 'error';

export function AsesoriaForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [datos, setDatos] = useState({ nombre: '', email: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch('https://formspree.io/f/mvzlarvb', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      if (res.ok) {
        // Capturamos nombre/email antes del reset para prellenar el newsletter.
        setDatos({
          nombre: String(data.get('nombre') ?? ''),
          email: String(data.get('email') ?? ''),
        });
        setStatus('ok');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div className="p-10 bg-moss-50 border border-moss-200">
        <div className="text-center">
          <h3 className="font-display text-2xl text-ink-950 mb-3">¡Recibimos tu consulta!</h3>
          <p className="font-sans text-ink-700 text-base leading-relaxed">
            Te escribimos en las próximas 24 horas hábiles para confirmar la sesión.
          </p>
        </div>
        <PostSignupNewsletter
          email={datos.email}
          name={datos.nombre}
          source="asesorias"
          segments={['newsletter']}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className="font-sans text-sm font-semibold text-ink-800">Nombre *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            placeholder="Tu nombre"
            className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-sans text-sm font-semibold text-ink-800">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="pais" className="font-sans text-sm font-semibold text-ink-800">País</label>
        <input
          id="pais"
          name="pais"
          type="text"
          placeholder="¿Desde dónde escribís?"
          className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tema" className="font-sans text-sm font-semibold text-ink-800">Tema principal *</label>
        <select
          id="tema"
          name="tema"
          required
          className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 focus:outline-none focus:border-clay-700"
        >
          <option value="">Seleccioná un tema</option>
          <option>Agua y manejo hídrico</option>
          <option>Diseño de vivienda natural</option>
          <option>Diagnóstico de terreno</option>
          <option>Materiales y técnicas constructivas</option>
          <option>Producción agroecológica</option>
          <option>Bosque comestible</option>
          <option>Sistemas de tratamiento de aguas</option>
          <option>Cursos y formaciones</option>
          <option>Proyectos integrales</option>
          <option>Otro</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mensaje" className="font-sans text-sm font-semibold text-ink-800">Contanos sobre tu proyecto *</label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          placeholder="¿Qué estás buscando? ¿Tenés un terreno, un proyecto en curso, una duda específica? Contanos todo lo que sea relevante."
          className="border border-bone-300 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-clay-700 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-semibold text-ink-800">Tipo de sesión</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-3 p-4 border border-bone-200 cursor-pointer hover:border-clay-400 transition-colors">
            <input type="radio" name="tipo_sesion" value="puntual-usd30" className="mt-0.5" />
            <div>
              <span className="font-sans text-sm font-semibold text-ink-900 block">Consulta puntual</span>
              <span className="font-sans text-xs text-ink-500">USD 30 · Pregunta específica</span>
            </div>
          </label>
          <label className="flex items-start gap-3 p-4 border border-bone-200 cursor-pointer hover:border-clay-400 transition-colors">
            <input type="radio" name="tipo_sesion" value="diagnostico-usd60" defaultChecked className="mt-0.5" />
            <div>
              <span className="font-sans text-sm font-semibold text-ink-900 block">Diagnóstico integral</span>
              <span className="font-sans text-xs text-ink-500">USD 60 · Revisión completa</span>
            </div>
          </label>
        </div>
      </div>

      {status === 'error' && (
        <p className="font-sans text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
          Hubo un error al enviar. Por favor intentá de nuevo o escribinos directamente.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar consulta'}
      </button>

      <p className="font-sans text-xs text-ink-400 text-center">
        Te respondemos en 24 horas hábiles. Sin spam, nunca.
      </p>
    </form>
  );
}
