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
  /**
   * Sólo se publica el de una sociedad. El CUIT de una persona humana lleva el
   * DNI adentro (20-DNI-X), así que publicarlo es publicar el documento: por
   * eso mientras el proveedor sea persona humana este campo va vacío y la
   * página no muestra la fila. La identificación se cumple con nombre,
   * domicilio y correo; el CUIT se da en la factura, que es donde la ley lo
   * pide sin ponerlo a la vista de cualquiera.
   */
  cuit?: string;
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
  domicilio: 'San Marcos Sierras, Provincia de Córdoba, República Argentina',
  email: 'info@arteytierra.org',
  forma: 'persona_humana',
};

/**
 * Los registros de la marca «acequia» ante el INPI, concedidos el 30/10/2026
 * por disposición DI-2026-384-APN-DNM#INPI, clase 42, vigentes hasta el
 * 30/10/2036: la denominativa «ACEQUIA» y la mixta con el isologotipo.
 *
 * Están acá porque decir «marca registrada» sin número es una afirmación que
 * nadie puede comprobar, y porque el día que haya que intimar a alguien el
 * número es lo primero que se pide. Los títulos, en
 * `_legal/licencia-software-y-marca.md`, Anexo II.
 */
export const MARCA = {
  registros: ['3.978.600', '3.976.649'],
  clase: 42,
  vigenteHasta: '30 de octubre de 2036',
} as const;

/** Titular de los derechos sobre el software y la marca. */
export const TITULAR_PI = {
  nombre: 'Jonatan Gabriel Palma',
  /** `true` cuando la explotación la hace una sociedad con licencia. */
  explotaBajoLicencia: false,
} as const;
