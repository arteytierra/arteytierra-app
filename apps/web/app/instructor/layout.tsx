import Link from 'next/link';
import { GraduationCap, MessageSquare, Users, LayoutDashboard } from 'lucide-react';
import { requireInstructor } from '@/lib/instructor';

export const metadata = { title: 'Instructor', robots: { index: false } };

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  await requireInstructor('/instructor/dashboard');
  return (
    <div className="min-h-screen bg-bone">
      <aside className="border-b border-ink/10 bg-bone-50">
        <nav className="container mx-auto max-w-6xl px-4 py-3 flex items-center gap-1 overflow-x-auto">
          <Link href="/instructor/dashboard" className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-ink/5">
            <LayoutDashboard className="h-4 w-4" /> Resumen
          </Link>
          <Link href="/instructor/alumnos" className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-ink/5">
            <Users className="h-4 w-4" /> Alumnos
          </Link>
          <Link href="/instructor/qa" className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-ink/5">
            <MessageSquare className="h-4 w-4" /> Q&amp;A
          </Link>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-mute">
            <GraduationCap className="h-3.5 w-3.5" /> Portal instructor
          </span>
        </nav>
      </aside>
      {children}
    </div>
  );
}
