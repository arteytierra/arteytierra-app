'use client';

import { useState } from 'react';

const FAQ = [
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

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {FAQ.map((item, i) => (
        <div key={i} className="border-t border-clay-700/30 last:border-b">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left"
          >
            <span className="font-sans font-bold text-sm text-ink-950 pr-4">{item.q}</span>
            <span className="text-clay-700 font-bold text-lg flex-shrink-0">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <p className="font-sans text-sm text-ink-700 leading-relaxed pb-5">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
