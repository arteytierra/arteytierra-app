'use client';

/**
 * Ajustes del profesional que firma el informe (white-label).
 * Edita nombre, matrícula, contacto, web y logo, y los guarda en localStorage.
 */
import { useEffect, useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { leerPerfil, guardarPerfil, type PerfilProfesional } from '@/lib/profesional';

interface Props {
  onClose: () => void;
}

export function PerfilProfesionalModal({ onClose }: Props) {
  const [p, setP] = useState<PerfilProfesional>({ nombre: '' });

  useEffect(() => {
    const actual = leerPerfil();
    if (actual) setP(actual);
  }, []);

  const set = (campo: keyof PerfilProfesional, valor: string) => setP(prev => ({ ...prev, [campo]: valor }));

  const subirLogo = (file: File) => {
    if (file.size > 500_000) { alert('El logo es muy pesado (máx. 500 KB). Usá una imagen más chica.'); return; }
    const reader = new FileReader();
    reader.onload = () => setP(prev => ({ ...prev, logoDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const guardar = () => { guardarPerfil(p.nombre.trim() ? p : null); onClose(); };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-bone-200 bg-white text-ink-900 text-sm placeholder-ink-700/30 focus:outline-none focus:border-moss-500 transition-colors';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink-950/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-raised border border-bone-200 w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-ink-950">Datos del profesional</h2>
            <p className="text-xs text-ink-700/50">Aparecen en la portada y el pie del informe.</p>
          </div>
          <button onClick={onClose} className="text-ink-700/40 hover:text-ink-700 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-medium text-ink-700/60 uppercase tracking-wide mb-1">Nombre o estudio *</label>
            <input className={inputCls} value={p.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Estudio Regenera / Ing. Ana Pérez" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-ink-700/60 uppercase tracking-wide mb-1">Matrícula</label>
              <input className={inputCls} value={p.matricula ?? ''} onChange={e => set('matricula', e.target.value)} placeholder="MP 1234" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-700/60 uppercase tracking-wide mb-1">Contacto</label>
              <input className={inputCls} value={p.contacto ?? ''} onChange={e => set('contacto', e.target.value)} placeholder="tel / email" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-700/60 uppercase tracking-wide mb-1">Web</label>
            <input className={inputCls} value={p.web ?? ''} onChange={e => set('web', e.target.value)} placeholder="misitio.com" />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-700/60 uppercase tracking-wide mb-1">Logo</label>
            <div className="flex items-center gap-3">
              {p.logoDataUrl ? (
                <img src={p.logoDataUrl} alt="logo" className="h-12 w-12 object-contain rounded border border-bone-200" />
              ) : (
                <div className="h-12 w-12 rounded border border-dashed border-bone-300 flex items-center justify-center text-ink-700/30 text-[9px]">sin logo</div>
              )}
              <label className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-bone-200 hover:bg-bone-50 text-ink-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" /> Subir
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) subirLogo(f); }} />
              </label>
              {p.logoDataUrl && (
                <button onClick={() => setP(prev => ({ ...prev, logoDataUrl: undefined }))} className="text-ink-700/40 hover:text-clay-700 transition-colors" title="Quitar logo">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] text-ink-700/40 max-w-[55%]">Si dejás el nombre vacío, el informe usa la marca Arte y Tierra.</p>
          <button onClick={guardar} className="px-4 py-2 bg-moss-700 hover:bg-moss-900 text-bone-50 rounded-lg text-sm font-medium transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
