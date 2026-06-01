import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/fr' },
  openGraph: { locale: 'fr_FR' },
};

export default function FrLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
