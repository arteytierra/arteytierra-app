import 'server-only';
import type { Locale } from '@/lib/i18n/config';

export type TemplateName =
  | 'order-paid'
  | 'order-pending'
  | 'enrollment-created'
  | 'certificate-issued'
  | 'scholarship-approved'
  | 'scholarship-rejected'
  | 'partner-decision'
  | 'reservation-confirmed'
  | 'password-reset'
  | 'welcome';

export interface TemplateVars {
  'order-paid': { name: string; orderId: string; totalLabel: string; url: string };
  'order-pending': { name: string; orderId: string; payUrl: string };
  'enrollment-created': { name: string; courseTitle: string; courseUrl: string };
  'certificate-issued': { name: string; courseTitle: string; code: string; verifyUrl: string; pdfUrl: string };
  'scholarship-approved': { name: string; programTitle: string; couponCode: string; applyUrl: string };
  'scholarship-rejected': { name: string; programTitle: string; reason?: string };
  'partner-decision': { name: string; approved: boolean; refCode?: string; dashboardUrl: string; reason?: string };
  'reservation-confirmed': { name: string; lodgingTitle: string; checkIn: string; checkOut: string; url: string };
  'password-reset': { name: string; resetUrl: string };
  'welcome': { name: string; siteUrl: string };
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

interface RendererCtx {
  locale: Locale;
}

type Renderer<T extends TemplateName> = (vars: TemplateVars[T], ctx: RendererCtx) => RenderedEmail;

// ─────────────────────────────────────────────────────────────
// i18n micro-helper
// ─────────────────────────────────────────────────────────────
function t(locale: Locale, dict: Record<Locale, string>): string {
  return dict[locale] ?? dict.es;
}

// ─────────────────────────────────────────────────────────────
// Renderers
// ─────────────────────────────────────────────────────────────
const renderers: { [K in TemplateName]: Renderer<K> } = {
  'order-paid': (v, { locale }) => {
    const subject = t(locale, {
      es: `Pago confirmado · Pedido ${v.orderId}`,
      en: `Payment confirmed · Order ${v.orderId}`,
      pt: `Pagamento confirmado · Pedido ${v.orderId}`,
      fr: `Paiement confirmé · Commande ${v.orderId}`,
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: `Recibimos tu pago. Tu pedido <strong>${v.orderId}</strong> por <strong>${v.totalLabel}</strong> quedó confirmado.`,
      en: `We received your payment. Your order <strong>${v.orderId}</strong> for <strong>${v.totalLabel}</strong> is confirmed.`,
      pt: `Recebemos o seu pagamento. O pedido <strong>${v.orderId}</strong> de <strong>${v.totalLabel}</strong> foi confirmado.`,
      fr: `Nous avons reçu votre paiement. Votre commande <strong>${v.orderId}</strong> de <strong>${v.totalLabel}</strong> est confirmée.`,
    });
    const cta = t(locale, { es: 'Ver pedido', en: 'View order', pt: 'Ver pedido', fr: 'Voir la commande' });
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p><p><a class="btn" href="${v.url}">${cta}</a></p>`;
    const text = `${greet}\n\n${stripHtml(intro)}\n\n${cta}: ${v.url}`;
    return { subject, html, text };
  },

  'order-pending': (v, { locale }) => {
    const subject = t(locale, {
      es: `Tu pedido ${v.orderId} está esperando pago`,
      en: `Your order ${v.orderId} is awaiting payment`,
      pt: `O pedido ${v.orderId} aguarda pagamento`,
      fr: `Votre commande ${v.orderId} est en attente de paiement`,
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: `Tu pedido <strong>${v.orderId}</strong> está creado pero aún no recibimos el pago. Podés completarlo desde el link.`,
      en: `Your order <strong>${v.orderId}</strong> is created but payment is pending. Complete it from the link below.`,
      pt: `O pedido <strong>${v.orderId}</strong> foi criado mas o pagamento está pendente. Conclua pelo link.`,
      fr: `Votre commande <strong>${v.orderId}</strong> a été créée mais le paiement est en attente. Finalisez-le via le lien ci-dessous.`,
    });
    const cta = t(locale, { es: 'Completar pago', en: 'Complete payment', pt: 'Concluir pagamento', fr: 'Compléter le paiement' });
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p><p><a class="btn" href="${v.payUrl}">${cta}</a></p>`;
    const text = `${greet}\n\n${stripHtml(intro)}\n\n${cta}: ${v.payUrl}`;
    return { subject, html, text };
  },

  'enrollment-created': (v, { locale }) => {
    const subject = t(locale, {
      es: `Bienvenida al curso: ${v.courseTitle}`,
      en: `Welcome to: ${v.courseTitle}`,
      pt: `Bem-vindo ao curso: ${v.courseTitle}`,
      fr: `Bienvenue au cours : ${v.courseTitle}`,
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: `Ya tenés acceso al aula del curso <strong>${v.courseTitle}</strong>. ¡Empezamos cuando vos quieras!`,
      en: `Your seat for <strong>${v.courseTitle}</strong> is ready. Start whenever you want.`,
      pt: `Você já tem acesso ao curso <strong>${v.courseTitle}</strong>. Comece quando quiser.`,
      fr: `Vous avez accès au cours <strong>${v.courseTitle}</strong>. Commencez quand vous voulez.`,
    });
    const cta = t(locale, { es: 'Ir al aula', en: 'Open classroom', pt: 'Abrir sala', fr: 'Accéder au cours' });
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p><p><a class="btn" href="${v.courseUrl}">${cta}</a></p>`;
    const text = `${greet}\n\n${stripHtml(intro)}\n\n${cta}: ${v.courseUrl}`;
    return { subject, html, text };
  },

  'certificate-issued': (v, { locale }) => {
    const subject = t(locale, {
      es: `Tu certificado de ${v.courseTitle} está listo`,
      en: `Your certificate for ${v.courseTitle} is ready`,
      pt: `Seu certificado de ${v.courseTitle} está pronto`,
      fr: `Votre certificat pour ${v.courseTitle} est prêt`,
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: `Completaste <strong>${v.courseTitle}</strong>. Tu certificado tiene el código <code>${v.code}</code>.`,
      en: `You completed <strong>${v.courseTitle}</strong>. Your certificate code is <code>${v.code}</code>.`,
      pt: `Você concluiu <strong>${v.courseTitle}</strong>. O código do certificado é <code>${v.code}</code>.`,
      fr: `Vous avez terminé <strong>${v.courseTitle}</strong>. Le code de votre certificat est <code>${v.code}</code>.`,
    });
    const cta = t(locale, { es: 'Descargar PDF', en: 'Download PDF', pt: 'Baixar PDF', fr: 'Télécharger le PDF' });
    const ctaVerify = t(locale, { es: 'Verificar', en: 'Verify', pt: 'Verificar', fr: 'Vérifier' });
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p>
      <div class="meta"><a href="${v.pdfUrl}" class="btn">${cta}</a> &nbsp; <a href="${v.verifyUrl}">${ctaVerify}</a></div>`;
    const text = `${greet}\n\n${stripHtml(intro)}\n\n${cta}: ${v.pdfUrl}\n${ctaVerify}: ${v.verifyUrl}`;
    return { subject, html, text };
  },

  'scholarship-approved': (v, { locale }) => {
    const subject = t(locale, {
      es: `Beca aprobada: ${v.programTitle}`,
      en: `Scholarship approved: ${v.programTitle}`,
      pt: `Bolsa aprovada: ${v.programTitle}`,
      fr: `Bourse approuvée : ${v.programTitle}`,
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: `Tu postulación a <strong>${v.programTitle}</strong> fue aprobada. Usá el cupón <code>${v.couponCode}</code> al hacer checkout.`,
      en: `Your application to <strong>${v.programTitle}</strong> was approved. Use code <code>${v.couponCode}</code> at checkout.`,
      pt: `Sua candidatura a <strong>${v.programTitle}</strong> foi aprovada. Use o cupom <code>${v.couponCode}</code> no checkout.`,
      fr: `Votre candidature à <strong>${v.programTitle}</strong> a été approuvée. Utilisez le code <code>${v.couponCode}</code> au moment du paiement.`,
    });
    const cta = t(locale, { es: 'Aplicar beca', en: 'Apply scholarship', pt: 'Aplicar bolsa', fr: 'Appliquer la bourse' });
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p><p><a class="btn" href="${v.applyUrl}">${cta}</a></p>`;
    const text = `${greet}\n\n${stripHtml(intro)}\n\n${cta}: ${v.applyUrl}`;
    return { subject, html, text };
  },

  'scholarship-rejected': (v, { locale }) => {
    const subject = t(locale, {
      es: `Resultado de tu postulación a ${v.programTitle}`,
      en: `Result of your application to ${v.programTitle}`,
      pt: `Resultado da sua candidatura a ${v.programTitle}`,
      fr: `Résultat de votre candidature à ${v.programTitle}`,
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: `Lamentamos comunicarte que tu postulación a <strong>${v.programTitle}</strong> no fue seleccionada en esta ronda.`,
      en: `We regret to inform you that your application to <strong>${v.programTitle}</strong> was not selected this round.`,
      pt: `Lamentamos informar que sua candidatura a <strong>${v.programTitle}</strong> não foi selecionada nesta rodada.`,
      fr: `Nous regrettons de vous informer que votre candidature à <strong>${v.programTitle}</strong> n'a pas été retenue.`,
    });
    const reasonLine = v.reason ? `<p><em>${v.reason}</em></p>` : '';
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p>${reasonLine}`;
    const text = `${greet}\n\n${stripHtml(intro)}${v.reason ? `\n\n${v.reason}` : ''}`;
    return { subject, html, text };
  },

  'partner-decision': (v, { locale }) => {
    const subject = v.approved
      ? t(locale, {
          es: `¡Sos partner de Arte y Tierra!`,
          en: `You're an Arte y Tierra partner!`,
          pt: `Você é um parceiro Arte y Tierra!`,
          fr: `Vous êtes partenaire d'Arte y Tierra !`,
        })
      : t(locale, {
          es: `Sobre tu aplicación como partner`,
          en: `About your partner application`,
          pt: `Sobre a sua candidatura como parceiro`,
          fr: `Concernant votre candidature comme partenaire`,
        });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const body = v.approved
      ? t(locale, {
          es: `Tu código de referido es <code>${v.refCode}</code>. Compartí <strong>${process.env.NEXT_PUBLIC_SITE_URL ?? ''}?partner=${v.refCode}</strong> y empezá a ganar comisiones.`,
          en: `Your referral code is <code>${v.refCode}</code>. Share <strong>${process.env.NEXT_PUBLIC_SITE_URL ?? ''}?partner=${v.refCode}</strong> and start earning commissions.`,
          pt: `Seu código é <code>${v.refCode}</code>. Compartilhe <strong>${process.env.NEXT_PUBLIC_SITE_URL ?? ''}?partner=${v.refCode}</strong> e comece a ganhar comissões.`,
          fr: `Votre code de parrainage est <code>${v.refCode}</code>. Partagez <strong>${process.env.NEXT_PUBLIC_SITE_URL ?? ''}?partner=${v.refCode}</strong> et commencez à gagner des commissions.`,
        })
      : t(locale, {
          es: `Por ahora no podemos avanzar con tu aplicación. ${v.reason ?? ''}`,
          en: `We can't move forward with your application right now. ${v.reason ?? ''}`,
          pt: `No momento não podemos avançar com sua candidatura. ${v.reason ?? ''}`,
          fr: `Nous ne pouvons pas donner suite à votre candidature pour le moment. ${v.reason ?? ''}`,
        });
    const cta = t(locale, { es: 'Mi dashboard', en: 'My dashboard', pt: 'Meu painel', fr: 'Mon tableau de bord' });
    const ctaBlock = v.approved ? `<p><a class="btn" href="${v.dashboardUrl}">${cta}</a></p>` : '';
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${body}</p>${ctaBlock}`;
    const text = `${greet}\n\n${stripHtml(body)}${v.approved ? `\n\n${cta}: ${v.dashboardUrl}` : ''}`;
    return { subject, html, text };
  },

  'reservation-confirmed': (v, { locale }) => {
    const subject = t(locale, {
      es: `Reserva confirmada: ${v.lodgingTitle}`,
      en: `Booking confirmed: ${v.lodgingTitle}`,
      pt: `Reserva confirmada: ${v.lodgingTitle}`,
      fr: `Réservation confirmée : ${v.lodgingTitle}`,
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: `Tu reserva de <strong>${v.lodgingTitle}</strong> está confirmada del <strong>${v.checkIn}</strong> al <strong>${v.checkOut}</strong>.`,
      en: `Your booking at <strong>${v.lodgingTitle}</strong> is confirmed from <strong>${v.checkIn}</strong> to <strong>${v.checkOut}</strong>.`,
      pt: `Sua reserva em <strong>${v.lodgingTitle}</strong> está confirmada de <strong>${v.checkIn}</strong> a <strong>${v.checkOut}</strong>.`,
      fr: `Votre réservation à <strong>${v.lodgingTitle}</strong> est confirmée du <strong>${v.checkIn}</strong> au <strong>${v.checkOut}</strong>.`,
    });
    const cta = t(locale, { es: 'Ver detalle', en: 'View details', pt: 'Ver detalhes', fr: 'Voir les détails' });
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p><p><a class="btn" href="${v.url}">${cta}</a></p>`;
    const text = `${greet}\n\n${stripHtml(intro)}\n\n${cta}: ${v.url}`;
    return { subject, html, text };
  },

  'password-reset': (v, { locale }) => {
    const subject = t(locale, {
      es: 'Recuperar tu contraseña',
      en: 'Reset your password',
      pt: 'Redefinir sua senha',
      fr: 'Réinitialiser votre mot de passe',
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: 'Hacé click abajo para crear una nueva contraseña. El link expira en 1 hora.',
      en: 'Click below to set a new password. The link expires in 1 hour.',
      pt: 'Clique abaixo para definir uma nova senha. O link expira em 1 hora.',
      fr: 'Cliquez ci-dessous pour définir un nouveau mot de passe. Le lien expire dans 1 heure.',
    });
    const cta = t(locale, { es: 'Nueva contraseña', en: 'New password', pt: 'Nova senha', fr: 'Nouveau mot de passe' });
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p><p><a class="btn" href="${v.resetUrl}">${cta}</a></p>`;
    const text = `${greet}\n\n${intro}\n\n${cta}: ${v.resetUrl}`;
    return { subject, html, text };
  },

  'welcome': (v, { locale }) => {
    const subject = t(locale, {
      es: 'Te damos la bienvenida a Arte y Tierra',
      en: 'Welcome to Arte y Tierra',
      pt: 'Bem-vindo à Arte y Tierra',
      fr: 'Bienvenue sur Arte y Tierra',
    });
    const greet = t(locale, {
      es: `Hola ${v.name},`, en: `Hi ${v.name},`, pt: `Olá ${v.name},`, fr: `Bonjour ${v.name},`,
    });
    const intro = t(locale, {
      es: 'Nos alegra tenerte. Explorá cursos, asesorías, hospedaje y comunidad regenerativa.',
      en: 'Glad to have you. Explore courses, consults, lodging and our regenerative community.',
      pt: 'Que bom ter você. Explore cursos, consultorias, hospedagem e a comunidade regenerativa.',
      fr: 'Heureux de vous accueillir. Découvrez nos cours, conseils, hébergement et communauté régénérative.',
    });
    const cta = t(locale, { es: 'Explorar', en: 'Explore', pt: 'Explorar', fr: 'Explorer' });
    const html = `<h1>${subject}</h1><p>${greet}</p><p>${intro}</p><p><a class="btn" href="${v.siteUrl}">${cta}</a></p>`;
    const text = `${greet}\n\n${intro}\n\n${cta}: ${v.siteUrl}`;
    return { subject, html, text };
  },
};

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}

export function renderTemplate<T extends TemplateName>(
  name: T,
  vars: TemplateVars[T],
  locale: Locale,
): RenderedEmail {
  const fn = renderers[name] as Renderer<T>;
  return fn(vars, { locale });
}
