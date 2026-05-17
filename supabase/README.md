# Supabase — Arte y Tierra

Backend de datos, auth, storage y edge functions de la plataforma.

## Estructura

```
supabase/
├── migrations/
│   └── 0001_init.sql      Schemas, tablas, triggers, RLS
├── functions/             Edge Functions (Deno) — fase 2+
├── seed.sql               Datos base (cuentas, categorías, páginas, demo)
└── config.toml            Generado por supabase init
```

## Schemas

| Schema | Responsabilidad |
|--------|-----------------|
| `app`  | Perfiles, direcciones, contactos CRM, eventos analytics |
| `cms`  | Páginas, blog, testimonios, media |
| `shop` | Productos polimórficos, carritos, órdenes, pagos, cupones |
| `edu`  | Cursos, módulos, lecciones, inscripciones, progreso, certificados, foros |
| `book` | Recursos reservables, disponibilidad, reservas (hospedaje + asesorías) |
| `fin`  | Cuentas, categorías, transacciones, tipos de cambio, P&L |

## Setup local

```bash
# 1. Instalar CLI (una vez)
npm i -g supabase

# 2. Inicializar y arrancar
supabase init
supabase start

# 3. Aplicar migraciones + seed
supabase db reset
```

Esto levanta Postgres, Auth, Storage, Studio y aplica `migrations/` + `seed.sql`.

## Deploy a Supabase Cloud

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
# Seed manual desde Studio o:
supabase db execute --file seed.sql
```

## Storage buckets

Crear desde Studio (o descomentar el bloque final de `0001_init.sql`):

| Bucket | Público | Uso |
|--------|---------|-----|
| `public-media`        | sí | Imágenes de marketing, fotos, og |
| `course-videos`       | no | Videos protegidos (preferir Mux/CF Stream) |
| `ebooks`              | no | PDFs con signed URL al comprar |
| `finance-attachments` | no | Comprobantes de gastos |
| `certificates`        | no | PDFs de certificados |

## Roles de usuario

Definidos en `app.profiles.role`:
- `customer`   — cliente público (default)
- `instructor` — instructor de curso
- `staff`      — equipo interno con acceso al admin
- `admin`      — superusuario

Helper `app.is_staff()` y `app.is_admin()` usados por todas las policies.

## Triggers de negocio activos

- `on_auth_user_created` — crea `app.profiles` al registrarse
- `trg_orders_to_finance` — inserta `fin.transactions` al pagar
- `trg_orders_decrement_stock` — descuenta stock de físicos/inmersión
- `trg_orders_create_enrollments` — inscribe al alumno al pagar cursos

## RLS

Todas las tablas tienen RLS activo. Patrón:
- Tablas de contenido público (`shop.products`, `cms.posts published`, `edu.courses`): `select` abierto.
- Datos propios del usuario: filtro por `auth.uid()`.
- Lecciones: visibles si `is_free_preview` o si hay `enrollment` vigente.
- Finanzas, CRM, cupones: sólo `staff`.

## Próximos pasos

1. `0002_search.sql` — funciones de búsqueda full-text públicas
2. `0003_rates.sql` — vistas materializadas para dashboards
3. Edge Functions: `webhook-stripe`, `webhook-mp`, `generate-certificate`, `signed-ebook-url`
