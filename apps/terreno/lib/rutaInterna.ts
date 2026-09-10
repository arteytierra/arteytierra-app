/**
 * Valida un destino `?next=` antes de mandar a nadie ahí.
 *
 * El parámetro viaja en la URL y lo escribe quien quiera. Comprobar sólo que
 * empiece con "/" no alcanza: `//sitio-externo.com` también empieza con "/" y
 * tanto `router.push` como `new URL(next, origin)` lo resuelven como un host
 * ajeno. Alguien podía armar un enlace a /login?next=//sitio-externo.com y la
 * persona terminaba afuera del sitio justo después de autenticarse, que es el
 * momento donde más confianza tiene en lo que ve.
 *
 * Se rechaza todo lo que no sea una ruta de este mismo sitio: orígenes
 * externos, barras invertidas (Windows y algunos navegadores las tratan como
 * "/") y escapes porcentuales que escondan cualquiera de las dos.
 */
const ORIGEN_INTERNO = 'https://acequia.internal';

export function rutaInterna(valor: string | null | undefined, alternativa = '/mapa'): string {
  if (!valor || !valor.startsWith('/') || valor.startsWith('//') || valor.includes('\\')) {
    return alternativa;
  }

  try {
    const decodificado = decodeURIComponent(valor);
    if (decodificado.includes('\\') || decodificado.startsWith('//')) return alternativa;
    const url = new URL(valor, ORIGEN_INTERNO);
    return url.origin === ORIGEN_INTERNO ? `${url.pathname}${url.search}${url.hash}` : alternativa;
  } catch {
    return alternativa;
  }
}
