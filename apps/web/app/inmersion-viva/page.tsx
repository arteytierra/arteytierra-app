import { Container, Eyebrow, Section, Button } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';
import Link from 'next/link';

export const metadata = {
  title: 'Inmersión Viva',
  description: 'Una semana en el monte: hospedaje, oficio, comida regenerativa y mentoría.',
};
export const revalidate = 300;

export default async function InmersionPage() {
  const products = await listProducts({ type: 'immersion' });

  return (
    <>
      <SiteHeader />

      <Section tone="ink" spacing="md" className="text-bone-50 relative overflow-hidden">
        <Container>
          <Eyebrow className="text-bone-50/70">Inmersión Viva</Eyebrow>
          <h1 className="display-1 mt-6 max-w-[20ch]">Una semana entera, en el monte.</h1>
          <p className="mt-8 max-w-prose text-bone-50/85 text-lg">
            Diseño hidrológico, bioconstrucción, agroecología y comida regenerativa.
            Llegás con preguntas, te vas con un plan para tu propio territorio.
          </p>
          {products[0] && (
            <Link href={`/inmersion-viva/${products[0].slug}`} className="mt-10 inline-block">
              <Button variant="clay" size="xl">Próxima edición</Button>
            </Link>
          )}
        </Container>
        <div className="absolute inset-0 grain opacity-30 pointer-events-none" />
      </Section>

      <Section tone="bone">
        <Container>
          <h2 className="display-3">Próximas ediciones</h2>
          <div className="mt-10">
            <ProductGrid products={products} />
          </div>
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
