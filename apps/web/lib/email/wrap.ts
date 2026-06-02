import 'server-only';
import type { Locale } from '@/lib/i18n/config';
import type { EmailCategory } from './index';

export interface WrapMeta {
  messageId: string;
  siteUrl: string;
  locale: Locale;
  category: EmailCategory;
  recipient: string;
}

const FOOTER_STRINGS: Record<Locale, { tag: string; unsubscribe: string; address: string; preferences: string }> = {
  es: {
    tag: 'Arte y Tierra · educación regenerativa',
    unsubscribe: 'Dejar de recibir estos emails',
    preferences: 'Preferencias',
    address: 'Arte y Tierra · Argentina',
  },
  en: {
    tag: 'Arte y Tierra · regenerative education',
    unsubscribe: 'Unsubscribe from these emails',
    preferences: 'Preferences',
    address: 'Arte y Tierra · Argentina',
  },
  fr: {
    tag: 'Arte y Tierra · éducation régénérative',
    unsubscribe: 'Se désabonner de ces emails',
    preferences: 'Préférences',
    address: 'Arte y Tierra · Argentine',
  },
  pt: {
    tag: 'Arte y Tierra · educação regenerativa',
    unsubscribe: 'Cancelar inscrição',
    preferences: 'Preferências',
    address: 'Arte y Tierra · Argentina',
  },
};

/** Reescribe href= con tracking redirect (excepto mailto:, tel: y anchors). */
function rewriteLinks(html: string, meta: WrapMeta): string {
  return html.replace(/href="([^"]+)"/g, (_, url: string) => {
    if (
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.startsWith('#') ||
      url.includes('/api/email/click/') ||
      url.includes('/api/email/track/')
    ) {
      return `href="${url}"`;
    }
    const tracked = `${meta.siteUrl}/api/email/click/${meta.messageId}?to=${encodeURIComponent(url)}`;
    return `href="${tracked}"`;
  });
}

export function wrapHtml(inner: string, meta: WrapMeta): string {
  const f = FOOTER_STRINGS[meta.locale];
  const unsubUrl = `${meta.siteUrl}/preferencias/email?token=${meta.messageId}&cat=${meta.category}`;
  const prefsUrl = `${meta.siteUrl}/preferencias/email?token=${meta.messageId}`;
  const trackPx = `${meta.siteUrl}/api/email/track/${meta.messageId}.gif`;
  const rewritten = rewriteLinks(inner, meta);

  return `<!doctype html>
<html lang="${meta.locale}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  body { margin:0; background:#FBF8F3; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#1B2419; line-height:1.55; }
  .container { max-width:560px; margin:0 auto; background:#fff; }
  .header { padding:24px 32px; border-bottom:1px solid #E8E1D4; }
  .brand { font-family: Georgia, "Times New Roman", serif; font-size:20px; color:#3D5535; letter-spacing:0.02em; }
  .body { padding:32px; font-size:15px; }
  .body h1 { font-family: Georgia, serif; font-size:22px; color:#1B2419; margin:0 0 16px; }
  .body p { margin:0 0 14px; }
  .btn { display:inline-block; background:#3D5535; color:#FBF8F3 !important; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:600; }
  .meta { background:#F4EFE6; padding:14px 18px; border-radius:6px; margin:16px 0; font-size:14px; }
  .footer { padding:20px 32px 28px; border-top:1px solid #E8E1D4; font-size:12px; color:#6B7065; text-align:center; }
  .footer a { color:#6B7065; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><div class="brand">Arte y Tierra</div></div>
    <div class="body">${rewritten}</div>
    <div class="footer">
      <div>${f.tag}</div>
      <div style="margin-top:6px;">${f.address}</div>
      <div style="margin-top:10px;">
        <a href="${prefsUrl}">${f.preferences}</a>
        &nbsp;·&nbsp;
        <a href="${unsubUrl}">${f.unsubscribe}</a>
      </div>
    </div>
  </div>
  <img src="${trackPx}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px;" />
</body>
</html>`;
}

export function wrapText(inner: string, meta: WrapMeta): string {
  const f = FOOTER_STRINGS[meta.locale];
  const unsubUrl = `${meta.siteUrl}/preferencias/email?token=${meta.messageId}&cat=${meta.category}`;
  return [
    inner.trim(),
    '',
    '---',
    f.tag,
    f.address,
    `${f.unsubscribe}: ${unsubUrl}`,
  ].join('\n');
}
