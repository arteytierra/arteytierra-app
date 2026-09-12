/**
 * El endpoint /api/health existe para responder una sola pregunta: qué commit
 * está vivo. Estos tests fijan el caso que lo había vuelto inútil — el build
 * reusado de caché, que dejaba una constante vieja inlineada en el bundle.
 */
import { describe, it, expect } from 'vitest';
import { resolverVersion } from '@/lib/version';

describe('resolverVersion', () => {
  it('manda el SHA del deployment, no el que quedó inlineado en el build', () => {
    // El caso real del 12/09/2026: 52027f6 deployado, bundle compilado en 1f6c946.
    const info = resolverVersion({
      VERCEL_GIT_COMMIT_SHA: '52027f6b1c0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
      NEXT_PUBLIC_APP_VERSION: '1f6c946',
    });
    expect(info.version).toBe('52027f6');
    expect(info.build).toBe('1f6c946');
    expect(info.buildReusado).toBe(true);
  });

  it('no denuncia caché cuando el build es el del deployment', () => {
    const info = resolverVersion({
      VERCEL_GIT_COMMIT_SHA: '52027f6b1c0d4e5f',
      NEXT_PUBLIC_APP_VERSION: '52027f6',
    });
    expect(info.version).toBe('52027f6');
    expect(info.build).toBe('52027f6');
    expect(info.buildReusado).toBe(false);
  });

  it('cae a la constante de build si no hay variable de runtime', () => {
    // Un entorno que no es Vercel (o una preview sin git) todavía puede decir algo.
    const info = resolverVersion({ NEXT_PUBLIC_APP_VERSION: '1f6c946' });
    expect(info.version).toBe('1f6c946');
    expect(info.build).toBe('1f6c946');
    expect(info.buildReusado).toBe(false);
  });

  it('sin ninguna de las dos dice dev, y no inventa un SHA', () => {
    const info = resolverVersion({});
    expect(info.version).toBe('dev');
    expect(info.build).toBe('dev');
    expect(info.buildReusado).toBe(false);
  });

  it('trata el string vacío como ausencia', () => {
    // Vercel puede pasar la variable declarada y vacía; eso no es un commit.
    const info = resolverVersion({ VERCEL_GIT_COMMIT_SHA: '   ', NEXT_PUBLIC_APP_VERSION: '' });
    expect(info.version).toBe('dev');
    expect(info.buildReusado).toBe(false);
  });

  it('recorta a siete caracteres, que es como se cita un commit en el repo', () => {
    const info = resolverVersion({ VERCEL_GIT_COMMIT_SHA: 'abcdef0123456789' });
    expect(info.version).toBe('abcdef0');
  });
});
