import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata = {
  title: 'Asesorías',
  description: 'Diseño regenerativo, hidrológico y ecológico. Sesiones 1:1 con el equipo.',
};
export const revalidate = 300;

export default async function AsesoriasPage() {
  const products = await listProducts({ type: 'service' });
  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Asesorías</Eyebrow>
          <h1 className="display-2 mt-4">Pensar el territorio juntos.</h1>
          <p className="lead mt-6">
            Sesiones de diseño regenerativo, hidrológico y bioarquitectura aplicadas a tu lugar.
          </p>
        </Container>
      </Section>
      <Section tone="bone"><Container><ProductGrid products={products} /></Container></Section>
      <SiteFooter />
    </>
  );
}
