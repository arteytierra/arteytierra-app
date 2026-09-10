const internalOrigin = 'https://acequia.internal';

export function safeInternalPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.includes('\\') || decoded.startsWith('//')) return fallback;
    const parsed = new URL(value, internalOrigin);
    return parsed.origin === internalOrigin ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}
