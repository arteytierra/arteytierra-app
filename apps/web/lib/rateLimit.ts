import 'server-only';

/**
 * Rate limit best-effort en memoria del proceso.
 *
 * En serverless cada instancia tiene su propia memoria, así que esto NO es un
 * límite global exacto: frena ráfagas contra una instancia caliente —el caso
 * típico de un script en loop o un formulario spameado— sin sumar infra ni
 * costo por request. Para un límite duro y distribuido haría falta un store
 * compartido (Upstash/DB), que hoy no se justifica para estos endpoints.
 *
 * Es el mismo helper que ya usaba apps/terreno. Se duplica en vez de compartirse
 * porque un límite en memoria no tiene sentido compartido entre dos apps que
 * corren en procesos distintos: cada una cuenta lo suyo.
 */
type Ventana = { conteo: number; reinicia: number };
const baldes = new Map<string, Ventana>();

/**
 * Cuenta un intento para `clave` en una ventana fija de `ventanaMs`.
 * Devuelve `true` si está permitido, `false` si superó `max` en la ventana.
 */
export function limitar(clave: string, max: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const b = baldes.get(clave);

  if (!b || ahora >= b.reinicia) {
    baldes.set(clave, { conteo: 1, reinicia: ahora + ventanaMs });
    // Limpieza oportunista para que el Map no crezca sin techo.
    if (baldes.size > 5000) {
      for (const [k, v] of baldes) if (ahora >= v.reinicia) baldes.delete(k);
    }
    return true;
  }

  if (b.conteo >= max) return false;
  b.conteo++;
  return true;
}

/** IP del request desde los headers del proxy (Vercel). */
export function ipDe(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'desconocida';
}

/** Respuesta estándar cuando se pasó del límite. */
export function demasiadosIntentos(mensaje = 'Demasiados intentos. Esperá un momento y probá de nuevo.') {
  return Response.json({ error: 'rate_limited', mensaje }, { status: 429 });
}
