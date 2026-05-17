import 'server-only';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import QRCode from 'qrcode';
import {
  certStrings,
  formatCertDate,
  type CertificateView,
  type Locale,
} from './index';

/**
 * Genera un PDF A4 horizontal con marca Arte y Tierra. Usa fuentes estándar
 * (sin embed externo) para mantener el bundle livianito y edge-compatible.
 */

const BONE = rgb(0.984, 0.972, 0.945);   // bone-50
const INK = rgb(0.07, 0.094, 0.094);     // ink-950
const MOSS = rgb(0.286, 0.443, 0.349);   // moss-700
const CLAY = rgb(0.741, 0.376, 0.231);   // clay-700
const MUTED = rgb(0.5, 0.5, 0.48);

interface PageCtx {
  width: number;
  height: number;
}

export async function buildCertificatePdf(opts: {
  cert: CertificateView;
  baseUrl: string;
  locale?: Locale;
}): Promise<Uint8Array> {
  const locale = opts.locale ?? opts.cert.locale ?? 'es';
  const t = certStrings(locale);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${t.title} — ${opts.cert.studentName}`);
  pdf.setAuthor('Arte y Tierra');
  pdf.setSubject(opts.cert.courseName);
  pdf.setProducer('Arte y Tierra — Cert Engine');
  pdf.setCreationDate(new Date());

  // A4 landscape: 842 x 595 pt
  const page = pdf.addPage([842, 595]);
  const ctx: PageCtx = { width: 842, height: 595 };

  const serif = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Fondo y bordes
  page.drawRectangle({ x: 0, y: 0, width: ctx.width, height: ctx.height, color: BONE });
  // Doble marco
  page.drawRectangle({ x: 24, y: 24, width: ctx.width - 48, height: ctx.height - 48, borderColor: INK, borderWidth: 1.5 });
  page.drawRectangle({ x: 32, y: 32, width: ctx.width - 64, height: ctx.height - 64, borderColor: MOSS, borderWidth: 0.5 });

  // Brand mark
  drawCenteredText(page, 'ARTE Y TIERRA', sansBold, 12, ctx.height - 70, INK, ctx);
  drawCenteredText(page, t.tagline, sans, 8.5, ctx.height - 85, MUTED, ctx);

  // Eyebrow
  drawCenteredText(page, t.title.toUpperCase(), sansBold, 11, ctx.height - 130, CLAY, ctx, 4);

  // Awarded line
  drawCenteredText(page, t.awarded, serif, 14, ctx.height - 170, INK, ctx);

  // Name (big)
  const name = opts.cert.studentName;
  const nameSize = name.length > 38 ? 30 : name.length > 26 ? 36 : 44;
  drawCenteredText(page, name, serifBold, nameSize, ctx.height - 230, INK, ctx);
  // underline
  const nameWidth = serifBold.widthOfTextAtSize(name, nameSize);
  page.drawLine({
    start: { x: (ctx.width - nameWidth) / 2 - 12, y: ctx.height - 245 },
    end: { x: (ctx.width + nameWidth) / 2 + 12, y: ctx.height - 245 },
    color: MOSS,
    thickness: 0.8,
  });

  // For completing
  drawCenteredText(page, t.forCompleting, serif, 13, ctx.height - 280, INK, ctx);

  // Course name
  const courseSize = opts.cert.courseName.length > 60 ? 18 : 22;
  drawCenteredText(page, '« ' + opts.cert.courseName + ' »', serifBold, courseSize, ctx.height - 320, INK, ctx);

  // Duration line
  if (opts.cert.durationHours) {
    drawCenteredText(
      page,
      `${t.duration}: ${opts.cert.durationHours} h`,
      sans,
      11,
      ctx.height - 350,
      MUTED,
      ctx,
    );
  }

  // QR code
  const verifyUrl = `${opts.baseUrl}/verificar/${opts.cert.code}`;
  const qrPngBytes = await QRCode.toBuffer(verifyUrl, {
    type: 'png',
    margin: 1,
    width: 240,
    color: { dark: '#121818', light: '#FBF8EF' },
  });
  const qrImage = await pdf.embedPng(qrPngBytes);
  const qrSize = 110;
  page.drawImage(qrImage, {
    x: ctx.width - 100 - qrSize,
    y: 70,
    width: qrSize,
    height: qrSize,
  });
  // QR caption
  drawCenteredAtX(page, t.verify, sans, 7.5, ctx.width - 100 - qrSize / 2, 60, MUTED);
  drawCenteredAtX(page, new URL(opts.baseUrl).host, sans, 8, ctx.width - 100 - qrSize / 2, 49, INK);

  // Code & date (left side)
  const baseY = 130;
  page.drawText(t.issuedOn.toUpperCase(), { x: 90, y: baseY + 36, size: 7.5, font: sansBold, color: MUTED });
  page.drawText(formatCertDate(opts.cert.issued_at, locale), { x: 90, y: baseY + 22, size: 12, font: serifBold, color: INK });
  page.drawText(t.code.toUpperCase(), { x: 90, y: baseY - 6, size: 7.5, font: sansBold, color: MUTED });
  page.drawText(opts.cert.code, { x: 90, y: baseY - 22, size: 12, font: sans, color: INK });

  // Signature line (center bottom)
  page.drawLine({
    start: { x: ctx.width / 2 - 80, y: 110 },
    end: { x: ctx.width / 2 + 80, y: 110 },
    color: INK,
    thickness: 0.8,
  });
  drawCenteredAtX(page, t.director, sans, 8, ctx.width / 2, 95, MUTED);
  drawCenteredAtX(page, 'Arte y Tierra', serifBold, 11, ctx.width / 2, 80, INK);

  return await pdf.save();
}

function drawCenteredText(
  page: ReturnType<PDFDocument['addPage']>,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  color: ReturnType<typeof rgb>,
  ctx: PageCtx,
  letterSpacing = 0,
) {
  const width = font.widthOfTextAtSize(text, size) + letterSpacing * Math.max(0, text.length - 1);
  page.drawText(text, {
    x: (ctx.width - width) / 2,
    y,
    size,
    font,
    color,
    ...(letterSpacing ? { characterSpacing: letterSpacing } : {}),
  });
}

function drawCenteredAtX(
  page: ReturnType<PDFDocument['addPage']>,
  text: string,
  font: PDFFont,
  size: number,
  cx: number,
  y: number,
  color: ReturnType<typeof rgb>,
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: cx - width / 2, y, size, font, color });
}
