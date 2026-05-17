import Link from 'next/link';
import { Footer } from '@arteytierra/ui/navigation';

const columns = [
  {
    title: 'Aprender',
    items: [
      { label: 'Cursos',         href: '/cursos' },
      { label: 'Inmersión Viva', href: '/inmersion-viva' },
      { label: 'Ebooks',         href: '/ebooks' },
      { label: 'Asesorías',      href: '/asesorias' },
    ],
  },
  {
    title: 'Vivir',
    items: [
      { label: 'Hospedaje',     href: '/hospedaje' },
      { label: 'Biocosmética',  href: '/biocosmetica' },
      { label: 'Proyectos',     href: '/proyectos' },
    ],
  },
  {
    title: 'Nosotros',
    items: [
      { label: 'Quiénes somos', href: '/nosotros' },
      { label: 'Blog',          href: '/blog' },
      { label: 'Contacto',      href: '/contacto' },
    ],
  },
];

export function SiteFooter() {
  return (
    <Footer
      columns={columns}
      tagline="Bioarquitectura, agua, agroecología y biocosmética. Una escuela viva en el territorio."
      social={{
        instagram: 'https://instagram.com/arteytierra',
        whatsapp:  'https://wa.me/5491100000000',
        email:     'hola@arteytierra.org',
      }}
      LinkComponent={Link}
    />
  );
}
