'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

const INTERESES = [
  'Bioarchitecture project',
  'Online consultation',
  'Workshop or training',
  'Living Immersion',
  'Accommodation',
  'General question',
];

type Status = 'idle' | 'sending' | 'ok' | 'error';

export default function ContactoEnPage() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch('https://formspree.io/f/mvzlarvb', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('ok');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <SiteHeader locale="en" />
      <main>
        {/* HERO */}
        <section className="bg-ink-950 py-24 px-6">
          <div className="max-w-editorial mx-auto">
            <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-500 mb-4">Contact</p>
            <h1 className="font-display text-5xl md:text-6xl text-bone-50 leading-tight max-w-2xl">
              Tell us about your <em>project.</em>
            </h1>
            <p className="mt-5 font-sans text-base text-bone-200 max-w-xl leading-relaxed">
              We read every message. We design from listening — it all starts with a conversation.
            </p>
          </div>
        </section>

        {/* FORM + WHATSAPP */}
        <section className="bg-bone-50 py-20 px-6">
          <div className="max-w-editorial mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">

            {/* FORM */}
            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-6">Write to us</p>

              {status === 'ok' ? (
                <div className="bg-moss-700/10 border border-moss-700/30 p-8">
                  <p className="font-display text-2xl text-ink-950 mb-2">Message sent!</p>
                  <p className="font-sans text-sm text-ink-700">We will reply within 24–48 hours. Thank you for writing.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block font-sans text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">
                      Name *
                    </label>
                    <input
                      name="name" type="text" required
                      className="w-full border border-ink-300 bg-white px-4 py-3 font-sans text-sm text-ink-950 focus:outline-none focus:border-clay-700"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">
                      Email *
                    </label>
                    <input
                      name="email" type="email" required
                      className="w-full border border-ink-300 bg-white px-4 py-3 font-sans text-sm text-ink-950 focus:outline-none focus:border-clay-700"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">
                      I am interested in
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESES.map(i => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="interests" value={i} className="accent-clay-700" />
                          <span className="font-sans text-sm text-ink-700">{i}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message" required rows={5}
                      className="w-full border border-ink-300 bg-white px-4 py-3 font-sans text-sm text-ink-950 focus:outline-none focus:border-clay-700 resize-none"
                      placeholder="Tell us about your project, land, intentions or questions..."
                    />
                  </div>
                  {status === 'error' && (
                    <p className="font-sans text-sm text-red-600">Something went wrong. Please try again or write to us on WhatsApp.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex justify-center bg-clay-700 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-clay-900 transition-colors disabled:opacity-50"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send message →'}
                  </button>
                </form>
              )}
            </div>

            {/* SIDE INFO */}
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">WhatsApp</p>
                <a
                  href="https://wa.me/5493549431594?text=Hello%2C%20I%27d%20like%20to%20connect%20with%20Arte%20y%20Tierra"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex bg-ink-950 text-bone-50 font-sans font-bold text-sm uppercase tracking-widest px-7 py-4 hover:bg-clay-900 transition-colors"
                >
                  Write on WhatsApp →
                </a>
                <p className="mt-3 font-sans text-sm text-ink-700/70">We reply faster here. Mondays to Saturdays.</p>
              </div>

              <div>
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Email</p>
                <p className="font-sans text-sm text-ink-700">hola@arteytierra.org</p>
              </div>

              <div>
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">Location</p>
                <p className="font-sans text-sm text-ink-700 leading-relaxed">
                  Tay Pichín<br />
                  San Marcos Sierras, Córdoba<br />
                  Argentina
                </p>
              </div>

              <div>
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-clay-700 mb-4">You can also</p>
                <ul className="flex flex-col gap-3">
                  <li>
                    <Link href="/en/asesorias" className="font-sans text-sm text-clay-700 font-bold hover:text-clay-900 transition-colors">
                      Book an online consultation →
                    </Link>
                  </li>
                  <li>
                    <Link href="/en/cursos" className="font-sans text-sm text-clay-700 font-bold hover:text-clay-900 transition-colors">
                      See upcoming workshops →
                    </Link>
                  </li>
                  <li>
                    <Link href="/en/tay-pichin" className="font-sans text-sm text-clay-700 font-bold hover:text-clay-900 transition-colors">
                      Visit Tay Pichín →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
