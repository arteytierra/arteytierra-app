import Link from 'next/link';
import { Leaf, Droplets, Sprout, FlaskConical } from 'lucide-react';
import {
  HeroEditorial,
  FeatureGrid,
  Testimonial,
  CTABlock,
  FAQ,
  Newsletter,
  CourseCard,
  ProductCard,
  Section,
  Container,
  Eyebrow,
  Button,
  Reveal,
  RevealGroup,
  RevealItem,
} from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const pilares = [
  { title: 'Bioarquitectura',     description: 'Construir con tierra, madera, paja y agua.', icon: <Leaf size={18} /> },
  { title: 'Diseño hidrológico',  description: 'Leer el territorio, regenerar cuencas.',     icon: <Droplets size={18} /> },
  { title: 'Agroecología',        description: 'Suelos vivos, comunidades alimentarias.',    icon: <Sprout size={18} /> },
  { title: 'Biocosmética',        description: 'Plantas medicinales y oficios cotidianos.',  icon: <FlaskConical size={18} /> },
];

const cursosDestacados = [
  {
    href: '/cursos/bioconstruccion-fundamentos',
    name: 'Bioconstrucción: Fundamentos',
    level: 'intro' as const,
    durationHours: 24,
    isLive: true,
    priceCents: 8000000,
    startsAt: 'Inicio · jun 2026',
  },
  {
    href: '/cursos/diseno-hidrologico',
    name: 'Diseño Hidrológico Regenerativo',
    level: 'intermediate' as const,
    durationHours: 36,
    isLive: false,
    priceCents: 12000000,
    startsAt: 'On demand',
  },
  {
    href: '/cursos/agroecologia-suelos',
    name: 'Agroecología y Suelos Vivos',
    level: 'intro' as const,
    durationHours: 20,
    isLive: true,
    priceCents: 7500000,
    startsAt: 'Inicio · ago 2026',
  },
];

const ebooks = [
  { href: '/ebooks/techo-verde',  name: 'Techo Verde',  category: 'Ebook', priceCents: 1500000 },
  { href: '/ebooks/radiestesia',  name: 'Radiestesia',  category: 'Ebook', priceCents: 1500000 },
  { href: '/ebooks/bioconstruccion', name: 'Bioconstrucción', category: 'Ebook', priceCents: 1800000 },
];

const faqs = [
  { q: '¿Los cursos son presenciales u online?',
    a: 'Tenemos cursos grabados, en vivo y experiencias presenciales (Inmersión Viva). Cada ficha aclara el formato y los requisitos.' },
  { q: '¿Cómo se cobra desde el exterior?',
    a: 'Stripe para pagos internacionales en USD/EUR, Mercado Pago para LATAM en ARS. Aceptamos tarjeta y transferencia.' },
  { q: '¿Recibo certificado al terminar?',
    a: 'Sí, al completar el 95% de las lecciones se emite un certificado digital firmado con código verificable.' },
  { q: '¿Puedo hospedarme en la sede?',
    a: 'Ofrecemos hospedaje regenerativo en la cabaña del monte. Reservás en la sección Hospedaje.' },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <HeroEditorial
        eyebrow="Transición regenerativa · est. en el territorio"
        title={
          <>
            Educación, diseño y oficio para
            <span className="text-moss-700"> habitar la Tierra </span>
            con sentido.
          </>
        }
        description={
          <>
            Bioarquitectura, diseño hidrológico, agroecología y biocosmética.
            Una escuela viva donde el conocimiento se cultiva con manos, agua y semillas.
          </>
        }
        actions={
          <>
            <Link href="/cursos">
              <Button variant="moss" size="xl">Ver cursos</Button>
            </Link>
            <Link href="/inmersion-viva">
              <Button variant="outline" size="xl">Inmersión Viva</Button>
            </Link>
          </>
        }
      />

      {/* Pilares */}
      <Section tone="paper">
        <Container width="editorial">
          <Reveal>
            <Eyebrow>Pilares</Eyebrow>
            <h2 className="display-3 mt-4 max-w-[18ch]">
              Cuatro disciplinas, una sola práctica.
            </h2>
          </Reveal>
          <FeatureGrid items={pilares} columns={4} className="mt-16" />
        </Container>
      </Section>

      {/* Cursos destacados */}
      <Section tone="bone">
        <Container width="editorial">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <Eyebrow>Cursos</Eyebrow>
              <h2 className="display-3 mt-4">Aprender haciendo.</h2>
            </div>
            <Link href="/cursos" className="text-sm text-moss-700 hover:underline">
              Ver todos los cursos →
            </Link>
          </div>

          <RevealGroup className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {cursosDestacados.map((c) => (
              <RevealItem key={c.href}>
                <CourseCard {...c} LinkComponent={Link} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* Testimonial */}
      <Section tone="paper" spacing="lg">
        <Container width="editorial">
          <Reveal>
            <Testimonial
              body="Después de la inmersión, mi forma de ver el agua, el suelo y la casa cambió para siempre. Volví con un plan concreto para mi territorio."
              author="María Soledad"
              role="Diseñadora regenerativa · Mendoza"
              rating={5}
            />
          </Reveal>
        </Container>
      </Section>

      {/* Ebooks */}
      <Section tone="bone">
        <Container width="editorial">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <Eyebrow>Ebooks</Eyebrow>
              <h2 className="display-3 mt-4">Conocimiento descargable.</h2>
            </div>
            <Link href="/ebooks" className="text-sm text-moss-700 hover:underline">
              Ver todos →
            </Link>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {ebooks.map((e) => (
              <ProductCard key={e.href} {...e} LinkComponent={Link} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Inmersión CTA */}
      <Section tone="bone" spacing="sm">
        <Container width="editorial">
          <CTABlock
            tone="moss"
            eyebrow="Inmersión Viva"
            title="Una semana en el monte para diseñar tu propio territorio."
            description="Hospedaje, comida regenerativa, prácticas de campo y mentoría. Cupos limitados."
            actions={
              <Link href="/inmersion-viva">
                <Button variant="clay" size="xl">Reservar lugar</Button>
              </Link>
            }
          />
        </Container>
      </Section>

      {/* FAQ */}
      <Section tone="bone">
        <Container width="editorial">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <Eyebrow>Preguntas frecuentes</Eyebrow>
              <h2 className="display-3 mt-4">Antes de empezar.</h2>
            </div>
            <FAQ items={faqs} />
          </div>
        </Container>
      </Section>

      {/* Newsletter */}
      <Section tone="bone" spacing="sm">
        <Container width="editorial">
          <Newsletter />
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
