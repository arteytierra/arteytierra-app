'use client';

import { useState } from 'react';

/**
 * Formulario del botón de arrepentimiento.
 *
 * Lo que importa acá no es el diseño: es que el pedido quede registrado. Por eso
 * la ruta guarda en la base antes de mandar el correo, y este formulario sólo
 * muestra "listo" cuando la ruta confirma que quedó guardado. Si el envío falla,
 * la persona ve el error y los otros canales, no una pantalla de éxito falsa.
 */
export function ArrepentimientoForm() {
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'listo' | 'error'>('inicial');
  const [mensaje, setMensaje] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado('enviando');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/arrepentimiento', { method: 'POST', body: form });
      const data = (await res.json().catch(() => ({}))) as { mensaje?: string };
      if (!res.ok) {
        setMensaje(data.mensaje ?? 'No pudimos registrar tu pedido. Escribinos a info.arteytierra@gmail.com.');
        setEstado('error');
        return;
      }
      setEstado('listo');
    } catch {
      setMensaje('No pudimos registrar tu pedido. Escribinos a info.arteytierra@gmail.com.');
      setEstado('error');
    }
  }

  if (estado === 'listo') {
    return (
      <div role="status" className="rounded-lg border border-moss-300 bg-moss-100 p-6">
        <p className="font-display text-xl text-ink-900">Pedido registrado.</p>
        <p className="mt-2 font-sans text-sm text-ink-700">
          Te vamos a escribir al correo que dejaste para confirmarte los pasos. Si en 48 horas hábiles no tuviste
          novedades, escribinos a info.arteytierra@gmail.com.
        </p>
      </div>
    );
  }

  const campo =
    'mt-1 w-full rounded-md border border-clay-300 bg-white px-3 py-2 font-sans text-sm text-ink-900 ' +
    'focus:border-moss-700 focus:outline-none focus:ring-2 focus:ring-moss-700/30';
  const etiqueta = 'block font-sans text-sm font-semibold text-ink-800';

  return (
    <form onSubmit={enviar} className="rounded-lg border border-clay-300 bg-white p-6 space-y-5">
      <div>
        <label className={etiqueta} htmlFor="arr-nombre">Nombre y apellido</label>
        <input className={campo} id="arr-nombre" name="nombre" required autoComplete="name" />
      </div>
      <div>
        <label className={etiqueta} htmlFor="arr-email">Correo con el que compraste</label>
        <input className={campo} id="arr-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <label className={etiqueta} htmlFor="arr-pedido">
          Número de pedido <span className="font-normal text-ink-700">(si lo tenés a mano)</span>
        </label>
        <input className={campo} id="arr-pedido" name="pedido" />
      </div>
      <div>
        <label className={etiqueta} htmlFor="arr-detalle">
          Qué compraste <span className="font-normal text-ink-700">(opcional)</span>
        </label>
        <textarea className={campo} id="arr-detalle" name="detalle" rows={3} maxLength={1500} />
      </div>

      <p className="font-sans text-xs text-ink-700">
        No hace falta que digas el motivo. Usamos estos datos sólo para encontrar tu compra y devolverte el dinero.
      </p>

      {estado === 'error' && (
        <p role="alert" className="font-sans text-sm text-danger-500">{mensaje}</p>
      )}

      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="rounded-md bg-ink-950 px-5 py-2.5 font-sans text-sm font-semibold text-bone-50 hover:bg-ink-800 disabled:opacity-60"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar pedido de arrepentimiento'}
      </button>
    </form>
  );
}
