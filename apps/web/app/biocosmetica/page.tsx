import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata = {
  title: 'Biocosmética',
  description: 'Repelentes naturales, ungüentos herbales, tinturas madre y productos medicinales vegetales.',
};
export const revalidate = 300;

export default async function BiocosmeticaPage() {
  const products = await listProducts({ type: 'physical', category: 'biocosmetica' });
  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Biocosmética</Eyebrow>
          <h1 className="display-2 mt-4">Plantas que cuidan.</h1>
          <p className="lead mt-6">
            Repelentes naturales, ungüentos, tinturas madre y productos medicinales hechos a mano.
          </p>
        </Container>
      </Section>
      <Section tone="bone"><Container><ProductGrid products={products} /></Container></Section>
      <SiteFooter />
    </>
  );
}
