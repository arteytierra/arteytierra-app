/**
 * Origen de `apps/web`, que es donde viven las credenciales de cobro y, por lo
 * tanto, donde se decide qué se le cobra a quién. acequia no tiene ninguna.
 */
export const URL_WEB = process.env.NEXT_PUBLIC_WEB_URL ?? 'https://arteytierra.org';
