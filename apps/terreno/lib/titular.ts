/**
 * Quién presta el Servicio. Una sola fuente.
 *
 * Hasta el 18/11/2026 los Términos decían que acequia era «operada por Arte y
 * Tierra» y que el código, los algoritmos y la marca eran «propiedad exclusiva
 * de Arte y Tierra». **Arte y Tierra es un nombre comercial, no un sujeto de
 * derecho**: no tiene CUIT, no puede ser dueña de nada ni firmar un contrato.
 * El proveedor real era una persona humana y el contrato no lo decía en ninguna
 * parte, lo que además incumple el deber de información del art. 4 de la Ley
 * 24.240 y la Resolución 424/2020 de Comercio Interior, que exigen identificar
 * al proveedor en la oferta electrónica.
 *
 * El día que la S.A.S. esté inscripta se cambia ACÁ —razón social, CUIT, sede y
 * `forma: 'sociedad'`— y las dos páginas legales quedan al día solas. Ver
 * `_legal/SAS-paso-a-paso.md` y `_legal/licencia-software-y-marca.md`: la
 * sociedad explota el software y la marca bajo licencia, no como dueña.
 */
export interface Proveedor {
  /** Quién contrata con el usuario y responde por el Servicio. */
  razonSocial: string;
  /** Nombre comercial con el que se conoce al estudio. No contrata. */
  nombreComercial: string;
  cuit: string;
  /**
   * Localidad y provincia. La calle NO se publica: la ley pide domicilio
   * identificable, y mientras el proveedor sea una persona humana ese domicilio
   * es su casa.
   */
  domicilio: string;
  email: string;
  /** Cambia la redacción de las páginas legales entre singular y sociedad. */
  forma: 'persona_humana' | 'sociedad';
}

export const PROVEEDOR: Proveedor = {
  razonSocial: 'Jonatan Gabriel Palma',
  nombreComercial: 'Arte y Tierra',
  cuit: '20-33402098-4',
  domicilio: 'San Marcos Sierras, Provincia de Córdoba, República Argentina',
  email: 'info@arteytierra.org',
  forma: 'persona_humana',
};

/** Titular de los derechos sobre el software y la marca. */
export const TITULAR_PI = {
  nombre: 'Jonatan Gabriel Palma',
  /** `true` cuando la explotación la hace una sociedad con licencia. */
  explotaBajoLicencia: false,
} as const;
