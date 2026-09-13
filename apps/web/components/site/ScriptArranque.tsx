/**
 * Las dos cosas que el navegador tiene que resolver antes de pintar.
 *
 * Va como script inline en el layout raíz —no como componente— porque corre
 * antes de que React hidrate: si esperara a la hidratación, el idioma cambiaría
 * a la vista y la cookie llegaría tarde para el primer beacon.
 *
 * 1. `lang` del documento. El layout raíz sirve `es-AR` fijo. Antes resolvía el
 *    idioma con `getLocale()`, que lee `headers()` y `cookies()`, y eso volvía
 *    dinámicas las 161 rutas del sitio: cada visita se renderizaba de nuevo en
 *    `iad1` con `Cache-Control: private, no-store`, sin pasar nunca por el CDN.
 *    El idioma sale del primer segmento de la URL, que es donde vive (`/en`,
 *    `/fr`), y las traducciones siguen declarándose por `alternates.languages`.
 *
 * 2. `ay_vid`, el identificador anónimo de visitante. Lo estampaba el
 *    middleware, y una respuesta con `Set-Cookie` tampoco la cachea el CDN:
 *    aunque la página fuese estática, la primera visita de cada persona —la que
 *    más importa— salía lenta igual. El servidor la sigue leyendo donde ya la
 *    leía; lo único que cambió es quién la crea.
 */

const ARRANQUE = `(function(){try{
var m={en:'en-US',fr:'fr-FR',pt:'pt-BR'},p=location.pathname.split('/')[1];
if(m[p])document.documentElement.lang=m[p];
if(!/(?:^|;\\s*)ay_vid=/.test(document.cookie)){
var v=(crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2);
document.cookie='ay_vid='+v+';path=/;max-age=31536000;samesite=lax'+(location.protocol==='https:'?';secure':'');
}}catch(e){}})();`;

export function ScriptArranque() {
  return <script dangerouslySetInnerHTML={{ __html: ARRANQUE }} />;
}
