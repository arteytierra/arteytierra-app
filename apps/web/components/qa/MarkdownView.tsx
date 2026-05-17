/**
 * Renderer mínimo de markdown safe para Q&A.
 * Soporta: párrafos, **bold**, *italic*, `code`, ```code blocks```, [link](url),
 * listas (- / 1.) y blockquotes (>). Todo se escapa primero — no se permite HTML.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // code inline
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-bone-200 px-1 py-0.5 text-[0.875em]">$1</code>');
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic
  out = out.replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em>$2</em>');
  // links [text](url) — sólo http(s)/mailto
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, (_, t, u) => {
    return `<a href="${u}" class="text-moss-700 underline" target="_blank" rel="noopener nofollow">${t}</a>`;
  });
  return out;
}

function renderMarkdown(src: string): string {
  const lines = src.split('\n');
  const html: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // code block
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      html.push(
        `<pre class="rounded-xl bg-ink-950 text-bone-50 p-4 overflow-x-auto text-sm"><code>${escapeHtml(buf.join('\n'))}</code></pre>`,
      );
      continue;
    }
    // blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html.push(`<blockquote class="border-l-4 border-moss-700/40 pl-4 italic text-ink-800/80">${inline(buf.join('\n'))}</blockquote>`);
      continue;
    }
    // unordered list
    if (/^- /.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        buf.push(lines[i].replace(/^- /, ''));
        i++;
      }
      html.push('<ul class="list-disc pl-6 space-y-1">' + buf.map((b) => `<li>${inline(b)}</li>`).join('') + '</ul>');
      continue;
    }
    // ordered list
    if (/^\d+\.\s/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        buf.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      html.push('<ol class="list-decimal pl-6 space-y-1">' + buf.map((b) => `<li>${inline(b)}</li>`).join('') + '</ol>');
      continue;
    }
    // blank
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    // paragraph (acumular hasta blank)
    const buf: string[] = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^```/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !/^- /.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return html.join('\n');
}

export function MarkdownView({ source, className }: { source: string; className?: string }) {
  return (
    <div
      className={`prose prose-sm max-w-none text-ink-900 [&_p]:leading-relaxed [&_p+p]:mt-3 ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }}
    />
  );
}
