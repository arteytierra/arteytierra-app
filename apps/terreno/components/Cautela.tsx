/**
 * Una cautela: la afirmación en una línea y el desarrollo detrás de «por qué».
 *
 * Nació en el panel de contexto, donde cada número viene con una advertencia que
 * hace falta —el censo cuenta personas donde viven y no territorio, el dato
 * mexicano mide lengua y no identidad, cero es un dato— y todas juntas eran seis
 * párrafos grises debajo de una tarjeta. Leídas en bloque no se leen: la
 * pantalla parece estar disculpándose y el dato queda sepultado.
 *
 * La afirmación se lee siempre, que es la parte que no se puede perder. El
 * desarrollo está a un clic, para quien quiera saber por qué. Es un `<details>`
 * nativo: funciona sin estado, sin JavaScript y con el teclado.
 *
 * Vive en su propio archivo desde que el panel de suelo lo necesitó también. Es
 * un patrón de la app, no un detalle de un panel: donde hay una afirmación que
 * requiere matiz, el matiz se lee acá y con esta forma.
 */
export function Cautela({ claim, children }: { claim: string; children: React.ReactNode }) {
  return (
    <details className="group mt-2">
      <summary className="list-none cursor-pointer text-[10px] leading-relaxed text-ink-700/70 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="font-semibold text-ink-700/80">{claim}</span>{' '}
        <span className="text-water-500 group-open:hidden">por qué</span>
        <span className="text-water-500 hidden group-open:inline">cerrar</span>
      </summary>
      {/* `div` y no `p`: alguna cautela trae una lista adentro —lo que el
          número nacional no dice— y un `ul` dentro de un `p` es HTML inválido
          que React desarma en la hidratación. */}
      <div className="text-[10px] text-ink-700/55 leading-relaxed mt-1">{children}</div>
    </details>
  );
}
