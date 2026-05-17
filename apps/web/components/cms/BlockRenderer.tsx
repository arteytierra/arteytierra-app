import Link from 'next/link';
import { Button, Container, Eyebrow } from '@arteytierra/ui';
import type { AnyBlock } from '@/lib/cms/blocks';

/**
 * Renderer público de bloques CMS.
 * Server Component — sin estado, sin JS de cliente salvo embeds.
 */

function sanitizeEmbed(html: string): string {
  // mínimo: remover <script>, on*=, javascript:
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

function videoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return null;
}

export function BlockRenderer({ blocks }: { blocks: AnyBlock[] }) {
  return (
    <div className="cms-doc">
      {blocks.map((b) => (
        <Block key={b.id} block={b} />
      ))}
    </div>
  );
}

function Block({ block }: { block: AnyBlock }) {
  switch (block.type) {
    case 'heading': {
      const { level, text, eyebrow } = block.data;
      const Tag = (level === 4 ? 'h4' : level === 3 ? 'h3' : 'h2') as 'h2' | 'h3' | 'h4';
      const cls =
        level === 4 ? 'font-display text-xl mt-10' : level === 3 ? 'font-display text-2xl mt-12' : 'font-display text-3xl md:text-4xl mt-16';
      return (
        <Container>
          {eyebrow && <Eyebrow className="mt-12">{eyebrow}</Eyebrow>}
          <Tag className={cls}>{text}</Tag>
        </Container>
      );
    }
    case 'paragraph':
      return (
        <Container>
          <p className={`mt-6 max-w-prose ${block.data.lead ? 'text-lg' : ''}`}>{block.data.text}</p>
        </Container>
      );

    case 'image': {
      const { src, alt, caption, aspect } = block.data;
      return (
        <Container>
          <figure className="mt-12">
            <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: aspect.replace('/', ' / ') }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            {caption && <figcaption className="mt-3 text-xs text-ink-700/60 italic">{caption}</figcaption>}
          </figure>
        </Container>
      );
    }

    case 'quote':
      return (
        <Container>
          <blockquote className="mt-12 border-l-2 border-clay-400 pl-6">
            <p className="font-display text-2xl italic leading-snug">"{block.data.text}"</p>
            {block.data.author && <cite className="mt-3 block text-sm not-italic text-ink-700/60">— {block.data.author}</cite>}
          </blockquote>
        </Container>
      );

    case 'gallery': {
      const { images, columns } = block.data;
      const grid = columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : columns === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3';
      return (
        <Container>
          <div className={`mt-12 grid gap-3 ${grid}`}>
            {images.map((im, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={im.src} alt={im.alt} className="aspect-square w-full rounded-xl object-cover" />
            ))}
          </div>
        </Container>
      );
    }

    case 'cta': {
      const { title, body, href, label, variant } = block.data;
      const bg = variant === 'ink' ? 'bg-ink-950 text-bone-50' : variant === 'moss' ? 'bg-moss-700 text-bone-50' : 'bg-clay-500 text-bone-50';
      return (
        <Container>
          <aside className={`mt-16 rounded-3xl p-10 ${bg}`}>
            <h3 className="font-display text-2xl md:text-3xl">{title}</h3>
            {body && <p className="mt-3 max-w-prose opacity-85">{body}</p>}
            <Link href={href as never} className="mt-6 inline-block">
              <Button variant={variant === 'clay' ? 'primary' : 'clay'}>{label}</Button>
            </Link>
          </aside>
        </Container>
      );
    }

    case 'video': {
      const embed = videoEmbed(block.data.url);
      return (
        <Container>
          <figure className="mt-12">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink-950">
              {embed ? (
                <iframe src={embed} className="absolute inset-0 h-full w-full" allowFullScreen allow="encrypted-media; picture-in-picture" />
              ) : (
                <video src={block.data.url} controls className="absolute inset-0 h-full w-full" />
              )}
            </div>
            {block.data.caption && <figcaption className="mt-3 text-xs text-ink-700/60 italic">{block.data.caption}</figcaption>}
          </figure>
        </Container>
      );
    }

    case 'faq':
      return (
        <Container>
          <div className="mt-12 divide-y divide-bone-200 border-y border-bone-200">
            {block.data.items.map((it, i) => (
              <details key={i} className="group py-5">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-medium">
                  <span>{it.q}</span>
                  <span className="text-clay-500 transition group-open:rotate-45 text-xl">+</span>
                </summary>
                <p className="mt-3 text-ink-700/75 whitespace-pre-line">{it.a}</p>
              </details>
            ))}
          </div>
        </Container>
      );

    case 'product':
      // Renderiza un placeholder ligero. El componente real podría hacer fetch del producto.
      return (
        <Container>
          <Link href={`/cursos/${block.data.slug}` as never} className="mt-12 block rounded-2xl border border-bone-200 bg-bone-50 p-6 hover:border-clay-400 transition">
            <p className="text-xs uppercase tracking-[0.16em] text-clay-500">Producto destacado</p>
            <p className="mt-2 font-display text-xl">{block.data.slug}</p>
          </Link>
        </Container>
      );

    case 'embed':
      return (
        <Container>
          <div className="mt-12" dangerouslySetInnerHTML={{ __html: sanitizeEmbed(block.data.html) }} />
        </Container>
      );

    case 'divider':
      return (
        <Container>
          <hr className="my-16 border-bone-200" />
        </Container>
      );
  }
}
