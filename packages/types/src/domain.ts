/** Tipos de dominio compartidos por web y futuras apps. */

export type Locale = 'es' | 'pt' | 'en';

export type Currency = 'ARS' | 'USD' | 'EUR' | 'BRL';

export type UserRole = 'customer' | 'instructor' | 'staff' | 'admin';

export type ProductType =
  | 'course'
  | 'ebook'
  | 'physical'
  | 'service'
  | 'lodging'
  | 'immersion';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentProvider = 'stripe' | 'mercadopago' | 'manual';

export interface Money {
  amountCents: number;
  currency: Currency;
}

export interface SEO {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}
