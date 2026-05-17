import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata = {
  title: 'Hospedaje',
  description: 'Cabañas y experiencias regenerativas en el monte. Reserva en línea.',
};
export const revalidate = 300;

export default async function HospedajePage() {
  const products = await listProducts({ type: 'lodging' });
  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Hospedaje</Eyebrow>
          <h1 className="display-2 mt-4">Dormir cerca del bosque.</h1>
          <p className="lead mt-6">
            Espacios construidos con tierra y madera local, integrados al territorio.
          </p>
        </Container>
      </Section>
      <Section tone="bone"><Container><ProductGrid products={products} /></Container></Section>
      <SiteFooter />
    </>
  );
}
