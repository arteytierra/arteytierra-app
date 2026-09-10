import { PasswordUpdateForm } from '@/components/PasswordUpdateForm';

export const metadata = { title: 'Nueva contraseña' };

export default function NewPasswordPage() {
  return <main className="min-h-screen bg-bone-50 px-4 py-12"><section className="mx-auto max-w-sm"><div className="mb-8 text-center"><img src="/marca/logo-color.png" alt="acequia" width={1200} height={395} className="mx-auto h-10 w-auto" /><p className="eyebrow mt-4">Seguridad de la cuenta</p><h1 className="mt-2 font-display text-3xl text-ink-950">Elegí una nueva contraseña.</h1></div><div className="rounded-2xl border border-bone-200 bg-white p-6 shadow-paper"><PasswordUpdateForm /></div></section></main>;
}
