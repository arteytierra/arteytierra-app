'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const INTERESES = [
  { name: 'interes_bioarq', label: 'Projet de bioarchitecture' },
  { name: 'interes_hidro', label: 'Projet d\'hydrologie' },
  { name: 'interes_taller_predio', label: 'Atelier sur mon terrain' },
  { name: 'interes_taller_tp', label: 'Atelier à Tay Pichín' },
  { name: 'interes_hostel', label: 'Écohostel · séjour' },
  { name: 'interes_inmersion', label: 'Volontariat' },
  { name: 'interes_otro', label: 'Autre' },
];

const CONTACTOS = [
  { tipo: 'WhatsApp', valor: '+54 9 3549 43-1594', desc: 'Inscriptions aux formations', href: 'https://wa.me/5493549431594?text=Bonjour%2C%20j%27%C3%A9cris%20depuis%20arteytierra.org' },
  { tipo: 'WhatsApp', valor: '+54 9 11 2750-6022', desc: 'Demandes générales · projets', href: 'https://wa.me/5491127506022?text=Bonjour%2C%20j%27%C3%A9cris%20depuis%20arteytierra.org' },
  { tipo: 'Email', valor: 'info.arteytierra@gmail.com', desc: 'Pour tout type de demande', href: 'mailto:info.arteytierra@gmail.com' },
];

type Status = 'idle' | 'sending' | 'ok' | 'error';

export default function ContactoFrPage() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const res = await fetch('https://formspree.io/f/mvzlarvb', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) { setStatus('ok'); form.reset(); }
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <SiteHeader locale="fr" />
      <main>
        {/* HERO */}
        <section className="relative h-[60vh] min-h-[420px] bg-ink-950 flex items-end overflow-hidden">
          <Image
            src="/img/proyectos/portada/1.jpg"
            alt="Arte y Tierra — contact"
            fill priority className="object-cover opacity-40" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
          <div className="relative z-10 max-w-editorial mx-auto w-full px-6 pb-16 text-center">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-300 mb-4">Contact</p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight">
              Commençons<br /><em>la conversation.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-md mx-auto leading-relaxed">
              Parlez-nous de votre terrain, de votre idée, de votre rêve. Nous travaillons partout dans le monde.
            </p>
          </div>
        </section>

        {/* FORMULAIRE */}
        <section className="bg-clay-900 py-20 px-6">
          <div className="max-w-2xl mx-auto">
            {status === 'ok' ? (
              <div className="bg-clay-700/30 border border-clay-700 p-8 text-center">
                <p className="font-display text-2xl text-bone-50 mb-3">Message envoyé !</p>
                <p className="font-sans text-sm text-bone-200">Nous vous répondons généralement en moins de 24 heures.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <input type="hidden" name="idioma" value="fr" />
                <input type="hidden" name="_subject" value="Nouveau message de contact (FR) · arteytierra.org" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" required name="nombre" placeholder="Nom complet" className="bg-ink-800 border border-clay-700/40 text-bone-100 placeholder-bone-200/40 px-4 py-3 font-sans text-sm focus:outline-none focus:border-clay-500" />
                  <input type="email" required name="email" placeholder="Email" className="bg-ink-800 border border-clay-700/40 text-bone-100 placeholder-bone-200/40 px-4 py-3 font-sans text-sm focus:outline-none focus:border-clay-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" name="pais" placeholder="Pays et région" className="bg-ink-800 border border-clay-700/40 text-bone-100 placeholder-bone-200/40 px-4 py-3 font-sans text-sm focus:outline-none focus:border-clay-500" />
                  <input type="tel" name="whatsapp" placeholder="WhatsApp (optionnel)" className="bg-ink-800 border border-clay-700/40 text-bone-100 placeholder-bone-200/40 px-4 py-3 font-sans text-sm focus:outline-none focus:border-clay-500" />
                </div>

                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Que cherchez-vous ? · plusieurs choix possibles</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INTERESES.map(i => (
                      <label key={i.name} className="flex items-center gap-3 p-3 bg-ink-800 border border-clay-700/20 cursor-pointer hover:border-clay-500 transition-colors">
                        <input type="checkbox" name={i.name} value="si" className="accent-clay-700" />
                        <span className="font-sans text-sm text-bone-200">{i.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <textarea name="mensaje" rows={5} placeholder="Parlez-nous davantage de votre projet..." className="bg-ink-800 border border-clay-700/40 text-bone-100 placeholder-bone-200/40 px-4 py-3 font-sans text-sm focus:outline-none focus:border-clay-500 resize-none" />

                {status === 'error' && (
                  <p className="font-sans text-sm text-red-400">Une erreur s'est produite. Réessayez ou écrivez-nous directement.</p>
                )}

                <button type="submit" disabled={status === 'sending'} className="self-start inline-flex bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-60">
                  {status === 'sending' ? 'Envoi...' : 'Envoyer le message →'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* CONTACT DIRECT */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-moss-700 mb-4">Contact direct</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink-950">
                Ou écrivez-nous <em>directement.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {CONTACTOS.map(c => (
                <a
                  key={c.href}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block p-8 bg-bone-100 border-l-4 border-clay-700 hover:bg-bone-200 transition-colors"
                >
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">{c.tipo}</p>
                  <p className="font-display text-xl text-ink-950 mb-1">{c.valor}</p>
                  <p className="font-sans text-sm text-ink-700">{c.desc}</p>
                </a>
              ))}
            </div>
            <div className="p-8 bg-bone-100 text-center">
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-2">Lieu</p>
              <p className="font-display text-xl text-ink-950 mb-1">Tay Pichín · San Marcos Sierras</p>
              <p className="font-sans text-sm text-ink-700">Córdoba, Argentine</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
