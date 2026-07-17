/**
 * Perfil del profesional que firma el informe (white-label).
 *
 * Permite que un consultor entregue el informe con su propia marca en la portada
 * y el pie, en vez de "Arte y Tierra". Es lo que habilita el plan Profesional.
 * Se guarda en localStorage (dato del dispositivo del consultor).
 */
export interface PerfilProfesional {
  nombre:       string;
  matricula?:   string;   // matrícula / registro profesional
  contacto?:    string;   // teléfono o email
  web?:         string;
  logoDataUrl?: string;   // logo en base64 (opcional)
}

const LS_KEY = 'terreno_perfil_profesional';

export function leerPerfil(): PerfilProfesional | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const p = raw ? (JSON.parse(raw) as PerfilProfesional) : null;
    return p && p.nombre?.trim() ? p : null;
  } catch { return null; }
}

export function guardarPerfil(p: PerfilProfesional | null): void {
  try {
    if (!p || !p.nombre?.trim()) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch { /* sin soporte */ }
}
