import type { Metadata } from 'next';
import { Container, Eyebrow, Section } from '@arteytierra/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { listProducts } from '@/lib/commerce/products';

export const metadata: Metadata = {
  title: 'Ebooks',
  description: 'Manuels téléchargeables sur la bioarchitecture, l’eau et les métiers traditionnels.',
  alternates: { canonical: '/fr/ebooks' },
};
export const revalidate = 300;

export default async function EbooksFrPage() {
  const products = await listProducts({ type: 'ebook' });
  return (
    <>
      <SiteHeader locale="fr" />
      <Section tone="bone" spacing="sm">
        <Container>
          <Eyebrow>Ebooks</Eyebrow>
          <h1 className="display-2 mt-4">Savoir téléchargeable.</h1>
          <p className="lead mt-6">Guides pratiques en PDF pour porter le métier sur le territoire.</p>
        </Container>
      </Section>
      <Section tone="bone"><Container><ProductGrid products={products} /></Container></Section>
      <SiteFooter />
    </>
  );
}
