-- =============================================================
--  Seed inicial — Arte y Tierra
--  Ejecutar después de 0001_init.sql
-- =============================================================

-- ---------- Cuentas financieras ----------
insert into fin.accounts (name, currency, kind) values
  ('Mercado Pago ARS', 'ARS', 'mp'),
  ('Stripe USD',       'USD', 'stripe'),
  ('Banco principal',  'ARS', 'bank'),
  ('Efectivo',         'ARS', 'cash')
on conflict do nothing;

-- ---------- Categorías financieras ----------
insert into fin.categories (name, type, color) values
  ('Ventas Cursos',           'income',  '#588157'),
  ('Ventas Ebooks',           'income',  '#3A5A40'),
  ('Ventas Biocosmética',     'income',  '#A3B18A'),
  ('Ventas Hospedaje',        'income',  '#2F6F7A'),
  ('Asesorías',               'income',  '#D9A441'),
  ('Insumos',                 'expense', '#7A4E2D'),
  ('Marketing',               'expense', '#B08463'),
  ('Servicios profesionales', 'expense', '#1C241E'),
  ('Impuestos',               'expense', '#0F1410'),
  ('Infraestructura',         'expense', '#E6D3BE')
on conflict do nothing;

-- ---------- Páginas CMS base ----------
insert into cms.pages (slug, locale, title, status, published_at, blocks) values
  ('home',     'es', 'Arte y Tierra',                'published', now(), '[]'),
  ('nosotros', 'es', 'Nosotros',                     'published', now(), '[]'),
  ('contacto', 'es', 'Contacto',                     'published', now(), '[]'),
  ('proyectos','es', 'Proyectos',                    'published', now(), '[]')
on conflict (slug, locale) do nothing;

-- ---------- Productos demo (placeholders, reemplazar luego) ----------
insert into shop.products (type, slug, name, subtitle, base_price_cents, currency, is_active, category, tags)
values
  ('course',  'bioconstruccion-fundamentos', 'Bioconstrucción: Fundamentos',
   'Curso introductorio a técnicas de construcción natural',
   8000000, 'ARS', true, 'cursos', array['bioconstruccion','intro']),
  ('course',  'diseno-hidrologico',          'Diseño Hidrológico Regenerativo',
   'Planificación del agua en el territorio',
   12000000, 'ARS', true, 'cursos', array['agua','permacultura']),
  ('ebook',   'ebook-techo-verde',           'Ebook: Techo Verde',
   'Guía práctica de construcción de techos verdes',
   1500000, 'ARS', true, 'ebooks', array['ebook','techo-verde']),
  ('ebook',   'ebook-radiestesia',           'Ebook: Radiestesia',
   'Introducción a la radiestesia aplicada al territorio',
   1500000, 'ARS', true, 'ebooks', array['ebook','radiestesia']),
  ('service', 'asesoria-diseno-regenerativo','Asesoría de Diseño Regenerativo',
   'Sesión 1:1 de planificación de territorio',
   5000000, 'ARS', true, 'asesorias', array['asesoria']),
  ('lodging', 'hospedaje-cabana-monte',      'Cabaña del Monte',
   'Hospedaje regenerativo entre el bosque',
   3500000, 'ARS', true, 'hospedaje', array['hospedaje']),
  ('physical','repelente-natural-citronela', 'Repelente Natural de Citronela',
   'Biocosmética artesanal',
   400000, 'ARS', true, 'biocosmetica', array['biocosmetica','repelente'])
on conflict (slug) do nothing;
