import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Open Graph image dinámica.
 * Uso: /api/og?title=...&eyebrow=...&kind=course
 *
 * El generador es edge-native (no usa Node). 1200×630 estándar OG.
 */
const COLORS = {
  bg: '#FBF8F3',
  ink: '#1B2419',
  mute: '#6B7065',
  leaf: '#3D5535',
  bone: '#FBF8F3',
};

const KIND_LABEL: Record<string, string> = {
  course: 'Curso',
  ebook: 'Ebook',
  post: 'Artículo',
  lodging: 'Hospedaje',
  immersion: 'Inmersión',
  consult: 'Asesoría',
  page: 'Arte y Tierra',
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const title = (url.searchParams.get('title') ?? 'Arte y Tierra').slice(0, 140);
  const eyebrow = (url.searchParams.get('eyebrow') ?? '').slice(0, 60);
  const kind = (url.searchParams.get('kind') ?? 'page').toLowerCase();
  const badge = KIND_LABEL[kind] ?? KIND_LABEL.page;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: COLORS.bg,
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(61,85,53,0.10), transparent 50%), radial-gradient(circle at 0% 100%, rgba(61,85,53,0.06), transparent 50%)`,
          padding: '64px 80px',
          fontFamily: 'serif',
          color: COLORS.ink,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 24,
            color: COLORS.mute,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.leaf,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: COLORS.bone, fontSize: 22, fontWeight: 700,
              }}
            >
              A
            </div>
            <div style={{ fontSize: 28, color: COLORS.ink, letterSpacing: '0.02em' }}>Arte y Tierra</div>
          </div>
          <div
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              backgroundColor: 'rgba(27,36,25,0.06)',
              fontSize: 22,
              color: COLORS.mute,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {badge}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 40 }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 26,
                color: COLORS.leaf,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                marginBottom: 18,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div style={{ fontSize: title.length > 60 ? 64 : 84, lineHeight: 1.05, color: COLORS.ink }}>
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: COLORS.mute, fontSize: 22 }}>
          <div>educación regenerativa · diseño del territorio</div>
          <div>arteytierra.org</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, immutable, max-age=31536000',
      },
    },
  );
}
