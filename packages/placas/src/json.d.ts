/**
 * El dato de la portada se importa como JSON y pesa más de un megabyte. Sin
 * esta declaración, `tsc` infiere el tipo literal de las 83.100 cotas y el
 * typecheck del repo pasa de segundos a minutos. El tipo de verdad lo pone
 * `DatosPortada` en la composición, con un cast explícito.
 */
declare module '*.json' {
  const valor: unknown;
  export default valor;
}
