export const WHATSAPP_PRINCIPAL = '5493549431594';
export const WHATSAPP_ALQUIMIA = '5493413751171';

export function waLink(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
