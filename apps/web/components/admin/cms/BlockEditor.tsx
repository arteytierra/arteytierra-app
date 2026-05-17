'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import {
  type AnyBlock,
  type BlockType,
  blockTypes,
  blockLabels,
  emptyBlock,
} from '@/lib/cms/blocks';
import { savePostBlocks } from '@/lib/cms/actions';
import { BlockForm } from './BlockForm';

interface Props {
  postId: string;
  initialBlocks: AnyBlock[];
}

export function BlockEditor({ postId, initialBlocks }: Props) {
  const [blocks, setBlocks] = useState<AnyBlock[]>(initialBlocks);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function addBlock(type: BlockType) {
    setBlocks((b) => [...b, emptyBlock(type)]);
    setAdding(false);
  }
  function updateBlock(id: string, data: unknown) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? ({ ...b, data } as AnyBlock) : b)));
  }
  function removeBlock(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
  }
  function move(id: string, dir: -1 | 1) {
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      if (i < 0) return bs;
      const j = i + dir;
      if (j < 0 || j >= bs.length) return bs;
      const next = bs.slice();
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }

  function save() {
    start(async () => {
      await savePostBlocks(postId, blocks);
      setSavedAt(new Date().toLocaleTimeString('es-AR'));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-bone-200 pb-3">
        <h2 className="font-display text-xl">Contenido</h2>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-xs text-ink-700/55">Guardado · {savedAt}</span>}
          <Button variant="primary" size="sm" onClick={save} disabled={pending}>
            <Save size={14} /> {pending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>

      <ol className="space-y-3">
        {blocks.map((b, idx) => (
          <li key={b.id} className="rounded-2xl border border-bone-200 bg-bone-50 p-4">
            <div className="flex items-center justify-between gap-3 border-b border-bone-200 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-ink-700/55">
                  {blockLabels[b.type]}
                </span>
                <span className="text-[10px] text-ink-700/40">#{idx + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(b.id, -1)} className="p-1.5 hover:bg-bone-100 rounded" aria-label="Subir">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => move(b.id, 1)} className="p-1.5 hover:bg-bone-100 rounded" aria-label="Bajar">
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => removeBlock(b.id)}
                  className="p-1.5 hover:bg-clay-100 text-clay-600 rounded"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <BlockForm block={b} onChange={(d) => updateBlock(b.id, d)} />
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border-2 border-dashed border-bone-200 p-4">
        {adding ? (
          <div className="flex flex-wrap gap-2">
            {blockTypes.map((t) => (
              <button
                key={t}
                onClick={() => addBlock(t)}
                className="text-xs rounded-full border border-bone-200 bg-bone-50 px-3 py-1.5 hover:bg-moss-100"
              >
                {blockLabels[t]}
              </button>
            ))}
            <button onClick={() => setAdding(false)} className="text-xs text-ink-700/55 px-2">
              cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-ink-700/70 hover:text-ink-700"
          >
            <Plus size={16} /> Añadir bloque
          </button>
        )}
      </div>
    </div>
  );
}
