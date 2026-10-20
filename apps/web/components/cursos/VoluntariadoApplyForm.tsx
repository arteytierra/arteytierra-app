'use client';

import { useState } from 'react';
import { submitVoluntariadoApplicationAction } from '@/lib/voluntariado/actions';
import { CONVOCATORIA_VOLUNTARIADO as C } from '@/lib/courses/data';
import { diasEntre, nacimientoMaximo } from '@/lib/voluntariado/reglas';

type Status = 'idle' | 'sending' | 'ok' | 'error';

/**
 * Postulación al voluntariado. No es una inscripción: son cinco lugares y se
 * eligen, así que el formulario pide lo que hace falta para leer una lista y
 * decidir, no sólo para agendar a alguien.
 *
 * Las validaciones de acá son comodidad —avisar antes de mandar—, no seguridad:
 * las mismas corren en la acción de servidor, que es la que no se puede saltear.
 * Los límites salen de `CONVOCATORIA_VOLUNTARIADO`, el mismo objeto que usa la
 * ficha, así que el calendario nativo ya no deja elegir una fecha de afuera.
 */

const campo =
  'border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700';
const etiqueta = 'font-sans text-sm font-semibold text-ink-800';

export function VoluntariadoApplyForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const fechaLlegada = String(fd.get('fechaLlegada') ?? '');
    const fechaSalida = String(fd.get('fechaSalida') ?? '');

    if (fechaLlegada && fechaSalida && diasEntre(fechaLlegada, fechaSalida) < C.diasMinimos) {
      setError(`La estadía mínima es de ${C.diasMinimos} días.`);
      return;
    }

    setStatus('sending');
    try {
      await submitVoluntariadoApplicationAction({
        nombre: String(fd.get('nombre') ?? ''),
        email: String(fd.get('email') ?? ''),
        whatsapp: String(fd.get('whatsapp') ?? ''),
        ciudad: String(fd.get('ciudad') ?? ''),
        fechaNacimiento: String(fd.get('fechaNacimiento') ?? ''),
        fechaLlegada,
        fechaSalida,
        motivacion: String(fd.get('motivacion') ?? ''),
        experiencia: String(fd.get('experiencia') ?? ''),
        restricciones: String(fd.get('restricciones') ?? ''),
        equipo: fd.get('equipo') === 'on',
      });
      setStatus('ok');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Hubo un error al enviar.');
    }
  }

  if (status === 'ok') {
    return (
      <div className="p-10 bg-ink-800 border border-ink-700 text-center">
        <h3 className="font-display text-2xl text-bone-50 mb-3">¡Recibimos tu postulación!</h3>
        <p className="font-sans text-bone-200 text-base leading-relaxed">
          La leemos con calma. Son {C.cupos} lugares, así que no respondemos al instante: si tu
          postulación entra, te escribimos para coordinar una entrevista por videollamada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bone-100 p-8 flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vol-nombre" className={etiqueta}>Nombre completo *</label>
          <input id="vol-nombre" name="nombre" type="text" required placeholder="Tu nombre" className={campo} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vol-email" className={etiqueta}>Email *</label>
          <input id="vol-email" name="email" type="email" required placeholder="tu@email.com" className={campo} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vol-whatsapp" className={etiqueta}>WhatsApp *</label>
          <input id="vol-whatsapp" name="whatsapp" type="tel" required placeholder="+54 9 ..." className={campo} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vol-ciudad" className={etiqueta}>Ciudad y país *</label>
          <input id="vol-ciudad" name="ciudad" type="text" required placeholder="Córdoba, Argentina" className={campo} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vol-nacimiento" className={etiqueta}>Fecha de nacimiento *</label>
        <input
          id="vol-nacimiento"
          name="fechaNacimiento"
          type="date"
          required
          max={nacimientoMaximo()}
          className={`${campo} sm:max-w-xs`}
        />
        <p className="font-sans text-xs text-ink-700/60">La convocatoria es para mayores de {C.edadMinima}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vol-llegada" className={etiqueta}>Fecha de llegada *</label>
          <input
            id="vol-llegada"
            name="fechaLlegada"
            type="date"
            required
            min={C.fechas.desde}
            max={C.fechas.hasta}
            defaultValue={C.fechas.desde}
            className={campo}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vol-salida" className={etiqueta}>Fecha de salida *</label>
          <input
            id="vol-salida"
            name="fechaSalida"
            type="date"
            required
            min={C.fechas.desde}
            max={C.fechas.hasta}
            defaultValue={C.fechas.hasta}
            className={campo}
          />
        </div>
      </div>
      <p className="font-sans text-xs text-ink-700/60 -mt-3">
        La convocatoria va del {C.rango}. Estadía mínima: {C.diasMinimos} días. Los {C.cupos} lugares
        se asignan primero a quienes cubren el período completo — que es lo que viene cargado.
      </p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vol-motivacion" className={etiqueta}>¿Por qué querés venir? *</label>
        <textarea
          id="vol-motivacion"
          name="motivacion"
          rows={4}
          required
          minLength={30}
          placeholder="Qué te trae, qué esperás llevarte, qué estás buscando aprender..."
          className={`${campo} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vol-experiencia" className={etiqueta}>
          Experiencia previa en obra <span className="font-normal text-ink-700/60">(opcional)</span>
        </label>
        <textarea
          id="vol-experiencia"
          name="experiencia"
          rows={3}
          placeholder="No es requisito y no descarta a nadie: nos sirve para armar los equipos de trabajo. Si nunca tocaste el barro, escribilo tal cual."
          className={`${campo} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vol-restricciones" className={etiqueta}>
          Restricciones alimentarias o de salud <span className="font-normal text-ink-700/60">(opcional)</span>
        </label>
        <textarea
          id="vol-restricciones"
          name="restricciones"
          rows={2}
          placeholder="Cocinamos vegetariano. Si hay algo que no podés comer, o algo de salud que debamos saber, contanos acá."
          className={`${campo} resize-none`}
        />
      </div>

      <label htmlFor="vol-equipo" className="flex gap-3 items-start cursor-pointer">
        <input id="vol-equipo" name="equipo" type="checkbox" required className="mt-1 w-4 h-4 flex-shrink-0 accent-clay-700" />
        <span className="font-sans text-sm text-ink-800 leading-relaxed">
          Confirmo que llevo <strong>carpa, aislante térmico y bolsa de dormir</strong>. *
          <span className="block text-ink-700/60 text-xs mt-1">
            Se duerme en la zona de camping y no prestamos equipo. El aislante no es opcional: en
            noviembre el suelo de sierra enfría de noche.
          </span>
        </span>
      </label>

      {error && <p className="font-sans text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}
      {status === 'error' && !error && (
        <p className="font-sans text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
          Hubo un error al enviar. Por favor intentá de nuevo o escribinos por WhatsApp.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar postulación →'}
      </button>
    </form>
  );
}
