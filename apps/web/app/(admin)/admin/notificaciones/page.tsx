import { requireStaff } from '@/lib/auth/session';
import { broadcastNotificationAction } from './actions';

export const metadata = { title: 'Broadcast' };

export default async function AdminBroadcastPage() {
  await requireStaff();
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-2">Broadcast a usuarios</h1>
      <p className="text-sm text-mute mb-6">
        Crea una notificación in-app + push para todos los usuarios o un segmento. Usar con criterio.
      </p>

      <form action={broadcastNotificationAction} className="space-y-4 rounded-lg border border-ink/10 p-5">
        <div>
          <label className="block text-sm text-mute mb-1">Título</label>
          <input
            name="title"
            required
            maxLength={120}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-mute mb-1">Cuerpo (opcional)</label>
          <textarea
            name="body"
            rows={3}
            maxLength={500}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-mute mb-1">URL de destino</label>
          <input
            name="url"
            type="url"
            placeholder="/blog/nuevo-post"
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="push" defaultChecked /> Enviar push también
          </label>
          <label className="inline-flex items-center gap-2 text-sm ml-4">
            <span className="text-mute">Segmento:</span>
            <select name="segment" className="rounded-md border border-ink/15 px-2 py-1 text-sm">
              <option value="all">Todos</option>
              <option value="students">Solo alumnos</option>
              <option value="partners">Solo partners</option>
            </select>
          </label>
        </div>
        <button className="rounded-md bg-leaf px-5 py-2.5 text-sm text-bone">Enviar broadcast</button>
      </form>
    </main>
  );
}
