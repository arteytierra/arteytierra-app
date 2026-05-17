import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata = {
  title: 'Cursos',
  description: 'Aprender haciendo. Cursos de bioarquitectura, agua, agroecología y biocosmética.',
};

export const revalidate = 300;

export default async function CursosPage() {
  const products = await listProducts({ type: 'course' });

  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Cursos</Eyebrow>
          <h1 className="display-2 mt-4 max-w-[18ch]">Aprender haciendo.</h1>
          <p className="lead mt-6">
            Cursos en vivo y grabados sobre bioconstrucción, diseño hidrológico,
            agroecología y biocosmética. Cada curso incluye material de apoyo,
            comunidad y certificado.
          </p>
        </Container>
      </Section>

      <Section tone="bone" spacing="md">
        <Container>
          <ProductGrid products={products} />
        </Container>
      </Section>

      <SiteFooter />
    </>
  );
}
