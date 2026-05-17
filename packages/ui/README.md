# @arteytierra/ui — Tierra Viva

Sistema de diseño y biblioteca de componentes de Arte y Tierra.

## Filosofía

- **Editorial + Naturaleza** — Fraunces para titulares, Inter para UI; mucho whitespace; grano sutil.
- **Tonos tierra** — bone (fondo), moss (acento natural), clay (acento cálido), sun/water (highlights).
- **Microinteracciones orgánicas** — `cubic-bezier(0.22, 1, 0.36, 1)`, fades de 500–700ms.
- **Server-first** — la mayoría de componentes son RSC. Sólo los que necesitan estado (`Dialog`, `Sheet`, `Toast`, `FAQ`, `Newsletter`, `Header`) son `'use client'`.
- **Polimorfismo de Link** — los componentes con `href` aceptan `LinkComponent` para integrarse con `next/link` o cualquier router.

## Estructura

```
src/
├── primitives/      Button · Badge · Card · Container · Section · Divider · Eyebrow
├── forms/           Input · Textarea · Select · Field · Checkbox
├── overlays/        Dialog · Sheet · ToastProvider
├── navigation/      Header · Footer · Breadcrumbs
├── marketing/       HeroEditorial · HeroImmersive · FeatureGrid ·
│                    Testimonial · TestimonialPull · FAQ · CTABlock ·
│                    StorySplit · Newsletter
├── commerce/        PriceTag · ProductCard · CourseCard · CartButton
├── motion/          Reveal · RevealGroup · RevealItem · variants
└── utils/           cn · formatMoney
```

## Uso desde apps/web

```tsx
import { Button, HeroEditorial, CourseCard } from '@arteytierra/ui';

<HeroEditorial
  eyebrow="Cursos"
  title="Aprender haciendo."
  actions={<Button variant="moss" size="xl">Ver cursos</Button>}
/>
```

Para integrar con `next/link`:

```tsx
import Link from 'next/link';
<CourseCard href="/cursos/x" name="Curso" priceCents={8000000} LinkComponent={Link} />
```

## Tokens

Los tokens viven en `@arteytierra/config/tokens` y se aplican a Tailwind vía el preset `@arteytierra/config/tailwind`. Cualquier app del monorepo los hereda sólo agregando:

```ts
import preset from '@arteytierra/config/tailwind';
export default { presets: [preset], content: [...] };
```

## Styleguide

Ver `apps/web/app/styleguide/page.tsx` (ruta `/styleguide`).
