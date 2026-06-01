import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/en' },
  openGraph: { locale: 'en_US' },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
