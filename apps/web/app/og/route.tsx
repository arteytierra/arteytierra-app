import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * /og?title=...&eyebrow=...&kind=course|ebook|lodging|article|inmersion|default
 *
 * Genera una imagen OG 1200x630 fiel al sistema editorial (ink + clay + Fraunces).
 * Cache controlado por Next (immutable por params). Sin DB.
 */

const PALETTE = {
  default: { bg: '#0F1410', fg: '#FBF8F3', accent: '#C7553D' },
  course: { bg: '#1A2A1F', fg: '#FBF8F3', accent: '#A8B89A' },
  ebook: { bg: '#2A1F1A', fg: '#FBF8F3', accent: '#E9B567' },
  lodging: { bg: '#1F2A2A', fg: '#FBF8F3', accent: '#8FB5B5' },
  inmersion: { bg: '#2A1A1A', fg: '#FBF8F3', accent: '#C7553D' },
  article: { bg: '#FBF8F3', fg: '#0F1410', accent: '#C7553D' },
} as const;

type Kind = keyof typeof PALETTE;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const title = (sp.get('title') ?? 'Arte y Tierra').slice(0, 140);
  const eyebrow = sp.get('eyebrow') ?? '';
  const kind = (sp.get('kind') ?? 'default') as Kind;
  const c = PALETTE[kind] ?? PALETTE.default;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: c.bg,
          color: c.fg,
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              background: c.accent,
              borderRadius: 999,
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: 'uppercase',
              opacity: 0.7,
              display: 'flex',
            }}
          >
            Arte y Tierra
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 26,
                color: c.accent,
                letterSpacing: 4,
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 60 ? 70 : 92,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: '95%',
              display: 'flex',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            opacity: 0.75,
          }}
        >
          <div style={{ fontSize: 24, display: 'flex' }}>arteytierra.org</div>
          <div style={{ fontSize: 20, letterSpacing: 4, textTransform: 'uppercase', display: 'flex' }}>
            Educación regenerativa
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
