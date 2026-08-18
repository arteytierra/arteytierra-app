import 'server-only';

/**
 * Cliente mínimo para la API de Claude (Anthropic) vía HTTP directo.
 * No usamos el SDK a propósito: evita sumar peso al bundle del deploy.
 *
 * Requiere env `ANTHROPIC_API_KEY`. Modelo configurable con `ANTHROPIC_MODEL`
 * (default: Claude Sonnet). Doc: https://docs.anthropic.com/en/api/messages
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-sonnet-5';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function askClaude(opts: {
  system: string;
  messages: ClaudeMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY no configurada');

  const model = opts.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.4,
      system: opts.system,
      messages: opts.messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  return (data.content ?? [])
    .filter((b) => b.type === 'text' && b.text)
    .map((b) => b.text)
    .join('')
    .trim();
}
