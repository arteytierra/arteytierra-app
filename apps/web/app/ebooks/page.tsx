import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata = { title: 'Ebooks', description: 'Manuales descargables de bioarquitectura, agua y oficios.' };
export const revalidate = 300;

export default async function EbooksPage() {
  const products = await listProducts({ type: 'ebook' });
  return (
    <>
      <SiteHeader />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Ebooks</Eyebrow>
          <h1 className="display-2 mt-4">Conocimiento descargable.</h1>
          <p className="lead mt-6">Guías prácticas en PDF para llevar el oficio al territorio.</p>
        </Container>
      </Section>
      <Section tone="bone"><Container><ProductGrid products={products} /></Container></Section>
      <SiteFooter />
    </>
  );
}
