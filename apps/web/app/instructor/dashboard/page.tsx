import Link from 'next/link';
import { requireInstructor, getInstructorRevenue, listInstructorCourses, listInstructorQAQueue } from '@/lib/instructor';

function money(cents: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format((cents ?? 0) / 100);
}

export default async function InstructorDashboard() {
  const ctx = await requireInstructor('/instructor/dashboard');
  const [revenue, courses, queue] = await Promise.all([
    getInstructorRevenue(ctx),
    listInstructorCourses(ctx),
    listInstructorQAQueue(ctx, 10),
  ]);

  const totalShare = revenue.reduce((a, r) => a + Number(r.share_cents ?? 0), 0);
  const totalStudents = revenue.reduce((a, r) => a + Number(r.students ?? 0), 0);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-2">
        Hola{ctx.fullName ? `, ${ctx.fullName}` : ''} 👋
      </h1>
      <p className="text-mute mb-6">
        {ctx.isStaff ? 'Vista admin: todos los cursos.' : `Estás asignado a ${ctx.courseIds.length} curso(s).`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Cursos" value={String(courses.length)} />
        <Stat label="Alumnos totales" value={String(totalStudents)} />
        <Stat label="Tu share acumulado" value={money(totalShare)} />
      </div>

      <h2 className="font-display text-lg text-ink mb-3">Revenue por curso</h2>
      <div className="overflow-x-auto rounded-lg border border-ink/10 mb-10">
        <table className="w-full text-sm">
          <thead className="bg-bone-50 text-left">
            <tr>
              <th className="px-3 py-2">Curso</th>
              <th className="px-3 py-2 text-right">Alumnos</th>
              <th className="px-3 py-2 text-right">Gross</th>
              <th className="px-3 py-2 text-right">Share %</th>
              <th className="px-3 py-2 text-right">Tu share</th>
            </tr>
          </thead>
          <tbody>
            {revenue.map((r) => (
              <tr key={`${r.instructor_id}-${r.course_id}`} className="border-t border-ink/5">
                <td className="px-3 py-2 font-medium">{r.course_name}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.students}</td>
                <td className="px-3 py-2 text-right tabular-nums">{money(r.gross_cents)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.revenue_share_pct}%</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium">{money(r.share_cents)}</td>
              </tr>
            ))}
            {revenue.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-mute">Sin revenue todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-ink">Q&amp;A abiertas</h2>
        <Link href="/instructor/qa" className="text-sm text-mute hover:text-ink">Ver todas →</Link>
      </div>
      <ul className="space-y-2">
        {queue.map((t) => (
          <li key={t.id} className="rounded-md border border-ink/10 p-3 hover:bg-ink/[0.02]">
            <div className="font-medium text-ink">{t.title}</div>
            <div className="text-xs text-mute mt-1">
              {t.reply_count} respuesta(s) · última actividad {new Date(t.last_activity_at).toLocaleString('es-AR')}
            </div>
          </li>
        ))}
        {queue.length === 0 && <li className="text-mute text-sm">Sin preguntas abiertas.</li>}
      </ul>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-bone-50 p-4">
      <div className="text-xs uppercase tracking-wider text-mute">{label}</div>
      <div className="font-display text-2xl text-ink mt-1">{value}</div>
    </div>
  );
}
