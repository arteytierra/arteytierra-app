/**
 * Preguntas frecuentes de /contacto — fuente única compartida entre el
 * componente visual (FaqAccordion) y el JSON-LD (faqJsonLd) para que
 * nunca queden desincronizados.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const CONTACTO_FAQ: FaqItem[] = [
  {
    q: '¿Trabajan fuera de Argentina?',
    a: 'Sí. Hemos trabajado en Argentina, Colombia, Perú, Bolivia, Italia y Francia. Operamos de manera itinerante en cualquier parte del mundo donde nos inviten a sembrar.',
  },
  {
    q: '¿Cuánto cuesta un proyecto?',
    a: 'Cada proyecto es único — depende de la escala, los materiales locales disponibles, la complejidad del terreno y el alcance del acompañamiento. Después de una primera conversación podemos darte un rango estimativo.',
  },
  {
    q: '¿Necesito experiencia para los talleres?',
    a: 'No. Los talleres están pensados para todo nivel — se aprende haciendo, con acompañamiento del equipo. Lo que sí hace falta es disposición real a trabajar con el cuerpo y aprender en grupo.',
  },
  {
    q: '¿En qué idiomas trabajan?',
    a: 'Español, francés, portugués e inglés. Para proyectos en otros idiomas, podemos coordinar traducción.',
  },
];
