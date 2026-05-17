# Arte y Tierra — Plataforma

Monorepo de la plataforma digital de Arte y Tierra / Tay Pichín:
ecommerce + academia + reservas + CMS + dashboard interno, sobre Next.js 15, Supabase y Cloudflare Pages.

## Estructura

```
apps/
  web/                   Next.js 15 (App Router, RSC, Edge)
packages/
  config/                Design system tokens + preset Tailwind
  types/                 Tipos compartidos + DB types generados
supabase/
  migrations/            SQL versionado (0001_init.sql)
  seed.sql               Cuentas, categorías, demos
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 · React 19 · TypeScript · TailwindCSS · Framer Motion |
| Backend  | Supabase (Postgres + Auth + Storage + Realtime + Edge Functions) |
| Pagos    | Stripe (USD) + Mercado Pago (ARS) |
| Email    | Resend |
| Hosting  | Cloudflare Pages (edge) |
| Auto.    | n8n (self-host Hetzner) |
| Analytics| GA4 + Meta CAPI + PostHog (opcional) |

## Setup

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env.local
# completar SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY...

# 3. Base de datos local
supabase start
supabase db reset            # aplica migrations + seed
pnpm db:types                # regenera packages/types/src/database.ts

# 4. Desarrollo
pnpm dev                     # corre apps/web en http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev`       | Next.js dev server |
| `pnpm build`     | Build de todos los packages |
| `pnpm typecheck` | tsc --noEmit en todo el monorepo |
| `pnpm db:reset`  | Reinicia DB local y aplica seed |
| `pnpm db:push`   | Aplica migrations a Supabase Cloud |
| `pnpm db:types`  | Regenera tipos TS desde el schema |

## Roadmap

Ver el documento maestro de arquitectura (sección 18). Estado actual: **Fase 0 — Fundaciones** en curso.

- [x] Migración inicial Supabase con 6 schemas, RLS y triggers
- [x] Scaffolding monorepo (Turbo + pnpm + Next 15)
- [x] Design system "Tierra Viva" — tokens base
- [ ] Componentes UI completos
- [ ] Páginas marketing (HOME, NOSOTROS, PROYECTOS...)
- [ ] Checkout Stripe + MP
- [ ] Player de cursos
- [ ] Dashboard admin
- [ ] Sistema de reservas
- [ ] Automatizaciones n8n
- [ ] PWA + i18n
