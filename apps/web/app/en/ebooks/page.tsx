import type { Metadata } from 'next';
import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata: Metadata = {
  title: 'Ebooks',
  description: 'Downloadable manuals on bioarchitecture, water and traditional crafts.',
  alternates: { canonical: '/en/ebooks' },
};
export const revalidate = 300;

export default async function EbooksEnPage() {
  const products = await listProducts({ type: 'ebook' });
  return (
    <>
      <SiteHeader locale="en" />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Ebooks</Eyebrow>
          <h1 className="display-2 mt-4">Downloadable knowledge.</h1>
          <p className="lead mt-6">Practical PDF guides to bring the craft to your territory.</p>
        </Container>
      </Section>
      <Section tone="bone"><Container><ProductGrid products={products} /></Container></Section>
      <SiteFooter />
    </>
  );
}
