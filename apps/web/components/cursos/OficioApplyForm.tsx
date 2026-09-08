'use client';

import { useRef, useState } from 'react';
import { createOficioUploadUrlAction, submitOficioApplicationAction } from '@/lib/oficio/actions';

type Status = 'idle' | 'sending' | 'ok' | 'error';

interface Foto {
  path: string;
  name: string;
}

const MAX_PHOTOS = 6;
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

function diasEntre(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function OficioApplyForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const disponibles = MAX_PHOTOS - fotos.length;
    const seleccionados = Array.from(files).slice(0, Math.max(disponibles, 0));
    if (files.length > disponibles) {
      setError(`Máximo ${MAX_PHOTOS} fotos — subimos las primeras ${Math.max(disponibles, 0)}.`);
    }
    setUploading(true);
    try {
      for (const file of seleccionados) {
        if (file.size > MAX_SIZE) {
          setError(`"${file.name}" supera los 8 MB — no se subió.`);
          continue;
        }
        const { path, signedUrl, token } = await createOficioUploadUrlAction({ filename: file.name });
        const res = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'x-upsert': 'true',
            Authorization: `Bearer ${token}`,
          },
          body: file,
        });
        if (!res.ok) throw new Error(`Falló la subida de "${file.name}"`);
        setFotos(prev => [...prev, { path, name: file.name }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo fotos');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function quitarFoto(path: string) {
    setFotos(prev => prev.filter(f => f.path !== path));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const fechaLlegada = String(fd.get('fechaLlegada') ?? '');
    const fechaSalida = String(fd.get('fechaSalida') ?? '');

    if (fechaLlegada && fechaSalida && diasEntre(fechaLlegada, fechaSalida) < 28) {
      setError('La participación mínima para esta beca es de 4 semanas.');
      return;
    }
    if (fotos.length === 0) {
      setError('Necesitamos al menos una foto de tu labor.');
      return;
    }

    setStatus('sending');
    try {
      await submitOficioApplicationAction({
        nombre: String(fd.get('nombre') ?? ''),
        email: String(fd.get('email') ?? ''),
        whatsapp: String(fd.get('whatsapp') ?? ''),
        ciudad: String(fd.get('ciudad') ?? ''),
        fechaNacimiento: String(fd.get('fechaNacimiento') ?? ''),
        formacion: String(fd.get('formacion') ?? ''),
        oficio: String(fd.get('oficio') ?? ''),
        fechaLlegada,
        fechaSalida,
        redes: String(fd.get('redes') ?? ''),
        mensaje: String(fd.get('mensaje') ?? ''),
        fotoPaths: fotos.map(f => f.path),
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
          La revisamos con calma y, si tu oficio encaja con lo que necesitamos en obra, te escribimos para coordinar una entrevista por videollamada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bone-100 p-8 flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="of-nombre" className="font-sans text-sm font-semibold text-ink-800">Nombre completo *</label>
          <input id="of-nombre" name="nombre" type="text" required placeholder="Tu nombre"
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="of-email" className="font-sans text-sm font-semibold text-ink-800">Email *</label>
          <input id="of-email" name="email" type="email" required placeholder="tu@email.com"
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="of-whatsapp" className="font-sans text-sm font-semibold text-ink-800">WhatsApp *</label>
          <input id="of-whatsapp" name="whatsapp" type="tel" required placeholder="+54 9 ..."
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="of-ciudad" className="font-sans text-sm font-semibold text-ink-800">Ciudad y país *</label>
          <input id="of-ciudad" name="ciudad" type="text" required placeholder="Córdoba, Argentina"
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="of-nacimiento" className="font-sans text-sm font-semibold text-ink-800">Fecha de nacimiento *</label>
          <input id="of-nacimiento" name="fechaNacimiento" type="date" required max={new Date().toISOString().slice(0, 10)}
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 focus:outline-none focus:border-clay-700" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="of-oficio" className="font-sans text-sm font-semibold text-ink-800">Servicio que querés brindar *</label>
          <input id="of-oficio" name="oficio" type="text" required placeholder="Electricidad, plomería, herrería, carpintería, comunicación..."
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="of-formacion" className="font-sans text-sm font-semibold text-ink-800">Formación profesional / universitaria *</label>
        <textarea id="of-formacion" name="formacion" rows={3} required minLength={10}
          placeholder="Título, oficio aprendido, años de experiencia en el rubro..."
          className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700 resize-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="of-llegada" className="font-sans text-sm font-semibold text-ink-800">Fecha de llegada *</label>
          <input id="of-llegada" name="fechaLlegada" type="date" required min={new Date().toISOString().slice(0, 10)}
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 focus:outline-none focus:border-clay-700" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="of-salida" className="font-sans text-sm font-semibold text-ink-800">Fecha de salida *</label>
          <input id="of-salida" name="fechaSalida" type="date" required min={new Date().toISOString().slice(0, 10)}
            className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 focus:outline-none focus:border-clay-700" />
          <p className="font-sans text-xs text-ink-700/60">Participación mínima: 4 semanas.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="of-redes" className="font-sans text-sm font-semibold text-ink-800">Redes sociales o portfolio que muestren tu labor *</label>
        <input id="of-redes" name="redes" type="text" required placeholder="Instagram, Facebook, LinkedIn, sitio personal..."
          className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700" />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-sans text-sm font-semibold text-ink-800">Fotos de tu labor * <span className="font-normal text-ink-700/60">(hasta {MAX_PHOTOS}, 8 MB c/u)</span></p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading || fotos.length >= MAX_PHOTOS}
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          }}
          className="font-sans text-sm text-ink-700"
        />
        {uploading && <span className="font-sans text-xs text-ink-700/60">Subiendo…</span>}
        {fotos.length > 0 && (
          <ul className="flex flex-col gap-1 mt-1">
            {fotos.map(f => (
              <li key={f.path} className="flex items-center gap-2 font-sans text-xs text-moss-700">
                ✓ {f.name}
                <button type="button" onClick={() => quitarFoto(f.path)} className="text-clay-700 hover:text-clay-900 font-bold">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="of-mensaje" className="font-sans text-sm font-semibold text-ink-800">Mensaje (opcional)</label>
        <textarea id="of-mensaje" name="mensaje" rows={4}
          placeholder="¿Algo que quieras contarnos?"
          className="border border-bone-200 bg-white px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-700/40 focus:outline-none focus:border-clay-700 resize-none" />
      </div>

      {error && (
        <p className="font-sans text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
      )}
      {status === 'error' && !error && (
        <p className="font-sans text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
          Hubo un error al enviar. Por favor intentá de nuevo o escribinos por WhatsApp.
        </p>
      )}

      <button type="submit" disabled={status === 'sending' || uploading}
        className="bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        {status === 'sending' ? 'Enviando...' : 'Enviar postulación →'}
      </button>
    </form>
  );
}
