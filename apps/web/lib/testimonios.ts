export interface Testimonio {
  quote: string;
  author: string;
  role: string;
}

/**
 * Testimonios reales de participantes/comitentes de Arte y Tierra.
 * Fuente única — se usa en la home y en las páginas de curso.
 */
export const TESTIMONIOS: Testimonio[] = [
  {
    quote: '"Llegué a Tay Pichín pensando que iba a aprender a construir. Me fui sabiendo escuchar el agua, la tierra, y a quienes la habitan."',
    author: 'Sofía',
    role: 'participante taller bioconstrucción',
  },
  {
    quote: '"La Formación Integral en Bioconstrucción me cambió la manera de mirar el habitar. No es solo técnica — es una forma de estar en el mundo."',
    author: 'Diego',
    role: 'participante Formación Integral',
  },
  {
    quote: '"Trabajar con Jonatan y el equipo fue encontrar gente que diseña desde el lugar — no desde un catálogo. Cada decisión nació del territorio."',
    author: 'Franco Colavita',
    role: 'participante taller bioconstrucción',
  },
];
