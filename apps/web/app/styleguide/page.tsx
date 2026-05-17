'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardSubtitle,
  Container,
  Section,
  Divider,
  Eyebrow,
  Input,
  Textarea,
  Select,
  Field,
  Checkbox,
  Dialog,
  Sheet,
  PriceTag,
  ProductCard,
  CourseCard,
  FAQ,
  Testimonial,
  TestimonialPull,
  Newsletter,
  ToastProvider,
  useToast,
} from '@arteytierra/ui';
import { colors } from '@arteytierra/config';

export default function StyleguidePage() {
  return (
    <ToastProvider>
      <Page />
    </ToastProvider>
  );
}

function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  return (
    <main className="pb-section">
      <header className="border-b border-ink-950/10 py-12">
        <Container>
          <Eyebrow>Design System</Eyebrow>
          <h1 className="display-2 mt-4">Tierra Viva</h1>
          <p className="lead mt-4">
            Biblioteca de componentes de Arte y Tierra. Guía visual y de implementación.
          </p>
        </Container>
      </header>

      {/* ============ Colores ============ */}
      <Block title="Paleta">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(colors).flatMap(([family, scale]) =>
            Object.entries(scale as Record<string, string>).map(([k, v]) => (
              <div key={`${family}-${k}`} className="rounded-xl border border-ink-950/10 overflow-hidden">
                <div className="h-20" style={{ background: v }} />
                <div className="p-3 text-xs">
                  <p className="font-medium">{family}-{k}</p>
                  <p className="text-ink-800/60">{v}</p>
                </div>
              </div>
            )),
          )}
        </div>
      </Block>

      {/* ============ Tipografía ============ */}
      <Block title="Tipografía">
        <div className="space-y-6">
          <p className="display-1">Display 1 — Fraunces</p>
          <p className="display-2">Display 2 — Fraunces</p>
          <p className="display-3">Display 3 — Fraunces</p>
          <p className="text-2xl">Body large — Inter</p>
          <p className="text-base">Body base — Inter regular</p>
          <p className="text-sm text-ink-800/70">Body small — secundario</p>
          <p className="eyebrow">Eyebrow · uppercase tracking</p>
        </div>
      </Block>

      {/* ============ Buttons ============ */}
      <Block title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="moss">Moss</Button>
          <Button variant="clay">Clay</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
          <Button size="xl">xl</Button>
        </div>
      </Block>

      {/* ============ Badges ============ */}
      <Block title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="moss">Moss</Badge>
          <Badge tone="clay">Clay</Badge>
          <Badge tone="sun">Sun</Badge>
          <Badge tone="water">Water</Badge>
          <Badge tone="ink">Ink</Badge>
          <Badge tone="outline">Outline</Badge>
        </div>
      </Block>

      {/* ============ Card ============ */}
      <Block title="Card">
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Cabaña del Monte</CardTitle>
              <CardSubtitle>Hospedaje regenerativo entre el bosque</CardSubtitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-ink-800/75">
                Una cabaña construida en tierra, paja y madera local.
              </p>
            </CardBody>
            <CardFooter>
              <PriceTag amountCents={3500000} />
              <Button size="sm" className="ml-auto">Reservar</Button>
            </CardFooter>
          </Card>
        </div>
      </Block>

      {/* ============ Forms ============ */}
      <Block title="Forms">
        <form className="grid gap-5 max-w-md">
          <Field label="Nombre" required>{(id) => <Input id={id} placeholder="Tu nombre" />}</Field>
          <Field label="Email" hint="Nunca compartimos tu correo." required>
            {(id) => <Input id={id} type="email" placeholder="tu@correo.com" />}
          </Field>
          <Field label="Mensaje">
            {(id) => <Textarea id={id} placeholder="Contanos qué buscás..." />}
          </Field>
          <Field label="Curso de interés">
            {(id) => (
              <Select id={id} defaultValue="">
                <option value="" disabled>Elegí uno</option>
                <option>Bioconstrucción</option>
                <option>Diseño Hidrológico</option>
                <option>Agroecología</option>
              </Select>
            )}
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox /> Acepto recibir comunicaciones
          </label>
          <Field label="Con error" error="Este campo es obligatorio">
            {(id) => <Input id={id} aria-invalid="true" />}
          </Field>
        </form>
      </Block>

      {/* ============ Overlays ============ */}
      <Block title="Overlays">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setDialogOpen(true)}>Abrir Dialog</Button>
          <Button variant="outline" onClick={() => setSheetOpen(true)}>Abrir Sheet</Button>
          <Button variant="moss" onClick={() => toast('success', '¡Listo!')}>Toast success</Button>
          <Button variant="danger" onClick={() => toast('error', 'Algo falló')}>Toast error</Button>
        </div>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Confirmar inscripción">
          <p className="text-sm text-ink-800/80">
            Vas a inscribirte en el curso de Bioconstrucción. ¿Confirmás?
          </p>
          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="moss" onClick={() => setDialogOpen(false)}>Confirmar</Button>
          </div>
        </Dialog>

        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Tu carrito">
          <p className="text-sm text-ink-800/80">El carrito está vacío.</p>
        </Sheet>
      </Block>

      {/* ============ Commerce ============ */}
      <Block title="Commerce — ProductCard / CourseCard">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <ProductCard
            href="#"
            name="Repelente Natural"
            category="Biocosmética"
            subtitle="Citronela y aceites esenciales"
            priceCents={400000}
            compareAtCents={500000}
            LinkComponent={Link}
          />
          <CourseCard
            href="#"
            name="Bioconstrucción: Fundamentos"
            level="intro"
            durationHours={24}
            isLive
            priceCents={8000000}
            startsAt="Inicio · jun 2026"
            LinkComponent={Link}
          />
          <CourseCard
            href="#"
            name="Diseño Hidrológico"
            level="intermediate"
            durationHours={36}
            studentsCount={142}
            priceCents={12000000}
            startsAt="On demand"
            LinkComponent={Link}
          />
        </div>
      </Block>

      {/* ============ Marketing ============ */}
      <Block title="Marketing — Testimonial">
        <Testimonial
          body="La inmersión transformó mi forma de ver el agua y el suelo."
          author="María Soledad"
          role="Diseñadora regenerativa"
          rating={5}
        />
        <div className="mt-12">
          <TestimonialPull
            body="Diseñar es escuchar al territorio antes de proponer."
            author="Equipo Arte y Tierra"
          />
        </div>
      </Block>

      <Block title="Marketing — FAQ">
        <FAQ
          items={[
            { q: '¿Los cursos son online?', a: 'Hay formatos grabados, en vivo e híbridos.' },
            { q: '¿Cómo cobran desde el exterior?', a: 'Stripe en USD/EUR, Mercado Pago en ARS.' },
          ]}
        />
      </Block>

      <Block title="Marketing — Newsletter">
        <Newsletter onSubmit={async () => new Promise((r) => setTimeout(r, 600))} />
      </Block>

      <Block title="Divider">
        <Divider className="my-6" />
        <Divider label="Sección" className="my-6" />
      </Block>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section tone="bone" spacing="sm" className="border-b border-ink-950/10">
      <Container>
        <h2 className="font-display text-3xl mb-8">{title}</h2>
        {children}
      </Container>
    </Section>
  );
}
