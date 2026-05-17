'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, BookOpen, Save } from 'lucide-react';
import { Button, Input, Textarea, Select, Field } from '@arteytierra/ui';
import {
  saveModule,
  deleteModule,
  saveLesson,
  deleteLesson,
  reorderModules,
  reorderLessons,
  revalidateCourse,
} from '@/lib/admin/courses';

interface Module {
  id: string;
  title: string;
  summary: string | null;
  position: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  kind: 'video' | 'reading' | 'quiz' | 'live' | 'download';
  duration_sec: number | null;
  is_free_preview: boolean;
  position: number;
  content_url: string | null;
  body_mdx: string | null;
}

interface Props {
  courseId: string;
  productSlug: string;
  modules: Module[];
  lessons: Lesson[];
}

const KIND_OPTIONS: Array<{ v: Lesson['kind']; l: string }> = [
  { v: 'video', l: 'Video' },
  { v: 'reading', l: 'Lectura' },
  { v: 'quiz', l: 'Quiz' },
  { v: 'live', l: 'En vivo' },
  { v: 'download', l: 'Descarga' },
];

export function CurriculumEditor({ courseId, productSlug, modules: initialMods, lessons: initialLessons }: Props) {
  const [modules, setModules] = useState<Module[]>(initialMods);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; err?: string } | null>(null);

  function lessonsOf(mid: string) {
    return lessons
      .filter((l) => l.module_id === mid)
      .sort((a, b) => a.position - b.position);
  }

  function addModule() {
    start(async () => {
      try {
        const res = await saveModule(courseId, {
          title: 'Nuevo módulo',
          position: modules.length,
        });
        setModules((m) => [
          ...m,
          { id: res.id, title: 'Nuevo módulo', summary: null, position: m.length },
        ]);
        setMsg({ ok: 'Módulo creado' });
      } catch (e) {
        setMsg({ err: e instanceof Error ? e.message : 'Error' });
      }
    });
  }

  function persistModule(m: Module) {
    start(async () => {
      try {
        await saveModule(courseId, { id: m.id, title: m.title, summary: m.summary ?? undefined, position: m.position });
        setMsg({ ok: 'Módulo guardado' });
      } catch (e) {
        setMsg({ err: e instanceof Error ? e.message : 'Error' });
      }
    });
  }

  function removeModule(id: string) {
    if (!confirm('¿Eliminar este módulo y sus lecciones?')) return;
    start(async () => {
      await deleteModule(id);
      setModules((m) => m.filter((x) => x.id !== id));
      setLessons((l) => l.filter((x) => x.module_id !== id));
    });
  }

  function moveModule(id: string, dir: -1 | 1) {
    setModules((mods) => {
      const sorted = [...mods].sort((a, b) => a.position - b.position);
      const i = sorted.findIndex((m) => m.id === id);
      const j = i + dir;
      if (j < 0 || j >= sorted.length) return mods;
      [sorted[i], sorted[j]] = [sorted[j]!, sorted[i]!];
      const reord = sorted.map((m, idx) => ({ ...m, position: idx }));
      start(async () => {
        await reorderModules(reord.map((m) => m.id));
      });
      return reord;
    });
  }

  function addLesson(mid: string) {
    start(async () => {
      try {
        const pos = lessonsOf(mid).length;
        const res = await saveLesson({
          module_id: mid,
          title: 'Nueva lección',
          kind: 'video',
          is_free_preview: false,
          position: pos,
        });
        setLessons((ls) => [
          ...ls,
          {
            id: res.id,
            module_id: mid,
            title: 'Nueva lección',
            kind: 'video',
            duration_sec: null,
            is_free_preview: false,
            position: pos,
            content_url: null,
            body_mdx: null,
          },
        ]);
      } catch (e) {
        setMsg({ err: e instanceof Error ? e.message : 'Error' });
      }
    });
  }

  function persistLesson(l: Lesson) {
    start(async () => {
      try {
        await saveLesson({
          id: l.id,
          module_id: l.module_id,
          title: l.title,
          kind: l.kind,
          duration_sec: l.duration_sec,
          is_free_preview: l.is_free_preview,
          position: l.position,
          content_url: l.content_url ?? undefined,
          body_mdx: l.body_mdx ?? undefined,
        });
        setMsg({ ok: 'Lección guardada' });
      } catch (e) {
        setMsg({ err: e instanceof Error ? e.message : 'Error' });
      }
    });
  }

  function removeLesson(id: string) {
    if (!confirm('¿Eliminar esta lección?')) return;
    start(async () => {
      await deleteLesson(id);
      setLessons((l) => l.filter((x) => x.id !== id));
    });
  }

  function moveLesson(mid: string, lid: string, dir: -1 | 1) {
    const inMod = lessonsOf(mid);
    const i = inMod.findIndex((x) => x.id === lid);
    const j = i + dir;
    if (j < 0 || j >= inMod.length) return;
    const reord = [...inMod];
    [reord[i], reord[j]] = [reord[j]!, reord[i]!];
    const updated = reord.map((l, idx) => ({ ...l, position: idx }));
    setLessons((ls) => [...ls.filter((l) => l.module_id !== mid), ...updated]);
    start(async () => {
      await reorderLessons(mid, updated.map((l) => l.id));
    });
  }

  function setModule(id: string, patch: Partial<Module>) {
    setModules((mods) => mods.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function setLesson(id: string, patch: Partial<Lesson>) {
    setLessons((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function publishRevalidate() {
    start(async () => {
      await revalidateCourse(productSlug);
      setMsg({ ok: 'Cache invalidada en /cursos/' + productSlug });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-bone-50/95 backdrop-blur border-b border-bone-200 -mx-4 sm:mx-0 px-4 py-3 sm:rounded-2xl sm:border">
        <div className="text-sm text-ink-800/65 inline-flex items-center gap-2">
          <BookOpen size={14} /> {modules.length} módulos · {lessons.length} lecciones
        </div>
        <div className="flex items-center gap-2">
          {msg?.ok && <span className="text-xs text-moss-700">✓ {msg.ok}</span>}
          {msg?.err && <span className="text-xs text-clay-700">✗ {msg.err}</span>}
          <Button onClick={publishRevalidate} variant="outline" size="sm" disabled={pending}>
            Revalidar público
          </Button>
        </div>
      </div>

      <ol className="space-y-4">
        {[...modules]
          .sort((a, b) => a.position - b.position)
          .map((m, idx) => (
            <li key={m.id} className="rounded-2xl border border-bone-200 bg-bone-50 p-5">
              <div className="flex items-center justify-between gap-3 border-b border-bone-200 pb-3 mb-4">
                <span className="text-[10px] uppercase tracking-[0.16em] text-ink-800/55">
                  Módulo {idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveModule(m.id, -1)}
                    className="p-1.5 hover:bg-bone-100 rounded"
                    aria-label="Subir"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveModule(m.id, 1)}
                    className="p-1.5 hover:bg-bone-100 rounded"
                    aria-label="Bajar"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => removeModule(m.id)}
                    className="p-1.5 hover:bg-clay-100 text-clay-700 rounded"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                <Field label="Título del módulo">
                  {(id) => (
                    <Input
                      id={id}
                      value={m.title}
                      onChange={(e) => setModule(m.id, { title: e.target.value })}
                      onBlur={() => persistModule({ ...m, title: m.title })}
                    />
                  )}
                </Field>
                <Button variant="outline" size="sm" onClick={() => persistModule(m)}>
                  <Save size={14} /> Guardar
                </Button>
                <Field label="Resumen" className="sm:col-span-2">
                  {(id) => (
                    <Textarea
                      id={id}
                      rows={2}
                      value={m.summary ?? ''}
                      onChange={(e) => setModule(m.id, { summary: e.target.value })}
                      onBlur={() => persistModule(m)}
                    />
                  )}
                </Field>
              </div>

              <ul className="mt-5 space-y-2">
                {lessonsOf(m.id).map((l, li) => (
                  <li key={l.id} className="rounded-xl border border-bone-200 p-3">
                    <div className="grid gap-2 sm:grid-cols-[24px_1fr_140px_120px_auto] items-center">
                      <span className="text-xs text-ink-800/55 text-center">{li + 1}</span>
                      <Input
                        value={l.title}
                        onChange={(e) => setLesson(l.id, { title: e.target.value })}
                        onBlur={() => persistLesson(l)}
                      />
                      <Select
                        value={l.kind}
                        onChange={(e) => {
                          const kind = e.target.value as Lesson['kind'];
                          setLesson(l.id, { kind });
                          persistLesson({ ...l, kind });
                        }}
                      >
                        {KIND_OPTIONS.map((o) => (
                          <option key={o.v} value={o.v}>
                            {o.l}
                          </option>
                        ))}
                      </Select>
                      <Input
                        type="number"
                        min={0}
                        placeholder="seg"
                        value={l.duration_sec ?? ''}
                        onChange={(e) =>
                          setLesson(l.id, {
                            duration_sec: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                        onBlur={() => persistLesson(l)}
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveLesson(m.id, l.id, -1)}
                          className="p-1.5 hover:bg-bone-100 rounded"
                          aria-label="Subir"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveLesson(m.id, l.id, 1)}
                          className="p-1.5 hover:bg-bone-100 rounded"
                          aria-label="Bajar"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => removeLesson(l.id)}
                          className="p-1.5 hover:bg-clay-100 text-clay-700 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <Input
                        placeholder="URL del contenido (YouTube/Vimeo/MP4/archivo)"
                        value={l.content_url ?? ''}
                        onChange={(e) => setLesson(l.id, { content_url: e.target.value })}
                        onBlur={() => persistLesson(l)}
                      />
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={l.is_free_preview}
                          onChange={(e) => {
                            setLesson(l.id, { is_free_preview: e.target.checked });
                            persistLesson({ ...l, is_free_preview: e.target.checked });
                          }}
                          className="h-4 w-4 rounded border-ink-950/25 text-moss-700"
                        />
                        Preview gratis
                      </label>
                    </div>
                  </li>
                ))}

                <button
                  onClick={() => addLesson(m.id)}
                  className="w-full rounded-xl border-2 border-dashed border-bone-200 py-2 text-xs text-ink-800/65 hover:bg-bone-100"
                >
                  <Plus size={14} className="inline" /> Agregar lección
                </button>
              </ul>
            </li>
          ))}
      </ol>

      <button
        onClick={addModule}
        disabled={pending}
        className="w-full rounded-2xl border-2 border-dashed border-bone-200 py-4 text-sm text-ink-800/70 hover:bg-bone-100"
      >
        <Plus size={16} className="inline" /> Agregar módulo
      </button>
    </div>
  );
}
