import { requireInstructor, listInstructorStudents, listInstructorCourses } from '@/lib/instructor';

export default async function InstructorStudentsPage() {
  const ctx = await requireInstructor('/instructor/alumnos');
  const [students, courses] = await Promise.all([
    listInstructorStudents(ctx),
    listInstructorCourses(ctx),
  ]);
  const courseNameById = new Map(courses.map((c) => [c.id, c.products.name]));

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl text-ink mb-6">Alumnos</h1>
      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full text-sm">
          <thead className="bg-bone-50 text-left">
            <tr>
              <th className="px-3 py-2">Alumno</th>
              <th className="px-3 py-2">Curso</th>
              <th className="px-3 py-2">Inscripto</th>
              <th className="px-3 py-2">Progreso</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {students.map((e) => (
              <tr key={e.id} className="border-t border-ink/5">
                <td className="px-3 py-2">{e.profiles.full_name ?? '—'}</td>
                <td className="px-3 py-2 text-mute">{courseNameById.get(e.course_id) ?? e.course_id.slice(0, 8)}</td>
                <td className="px-3 py-2 text-mute">{new Date(e.created_at).toLocaleDateString('es-AR')}</td>
                <td className="px-3 py-2 tabular-nums">{Math.round((e.progress ?? 0) * 100)}%</td>
                <td className="px-3 py-2">
                  {e.completed_at ? (
                    <span className="text-xs rounded bg-leaf/10 text-leaf px-2 py-0.5">Completado</span>
                  ) : (
                    <span className="text-xs rounded bg-ink/5 text-mute px-2 py-0.5">En curso</span>
                  )}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-mute">Sin alumnos todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
