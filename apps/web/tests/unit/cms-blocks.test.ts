import { describe, it, expect } from 'vitest';
import { parseDocument, emptyBlock, blockSchemas, blockTypes } from '@/lib/cms/blocks';

describe('cms/blocks', () => {
  it('emptyBlock devuelve estructura válida para cada tipo', () => {
    for (const t of blockTypes) {
      const b = emptyBlock(t);
      expect(b.id).toMatch(/^b_/);
      expect(b.type).toBe(t);
      // Cada default debe pasar su propio schema
      const r = blockSchemas[t].safeParse(b.data);
      expect(r.success, `default de ${t} debería pasar su schema`).toBe(true);
    }
  });

  it('parseDocument descarta bloques con type desconocido', () => {
    const out = parseDocument([
      { id: 'a', type: 'heading', data: { level: 2, text: 'X' } },
      { id: 'b', type: 'foo' as never, data: {} },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe('a');
  });

  it('parseDocument descarta bloques con data inválida', () => {
    const out = parseDocument([
      { id: 'ok', type: 'image', data: { src: 'https://x.test/i.jpg', alt: '', aspect: '16/9' } },
      { id: 'bad', type: 'image', data: { src: 'no-es-url', alt: '' } },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe('ok');
  });

  it('parseDocument acepta document vacío', () => {
    expect(parseDocument([])).toEqual([]);
    expect(parseDocument(null)).toEqual([]);
    expect(parseDocument('garbage')).toEqual([]);
  });
});
