/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kavarna Živa Vera - Resend Email Service Module
 */

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailSendResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const DEFAULT_SENDER = 'Kavarna Živa Vera <kavarna@kalvarija.si>';

/**
 * Standard Kavarna Živa Vera branded HTML email template wrapper
 */
export function buildCafeEmailHtml(options: {
  heading: string;
  bodyContent: string;
  previewText?: string;
  actionButton?: { text: string; url: string };
  badgeText?: string;
}): string {
  const { heading, bodyContent, previewText = '', actionButton, badgeText = 'KAVARNA ŽIVA VERA' } = options;

  return `
<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292524; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e7e5e4; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #78350f 0%, #451a03 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px; color: #fef3c7; }
    .title { margin: 0; font-size: 24px; font-weight: 900; line-height: 1.25; }
    .content { padding: 32px 28px; font-size: 15px; line-height: 1.65; color: #44403c; }
    .btn { display: inline-block; background-color: #78350f; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin: 20px 0; text-align: center; }
    .footer { background-color: #f5f5f4; padding: 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }
    .footer a { color: #78350f; text-decoration: underline; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="container">
    <div class="header">
      <div class="badge">☕ ${badgeText}</div>
      <h1 class="title">${heading}</h1>
    </div>
    <div class="content">
      ${bodyContent}
      ${actionButton ? `
        <div style="text-align: center; margin-top: 24px; margin-bottom: 24px;">
          <a href="${actionButton.url}" class="btn" target="_blank">${actionButton.text} &rarr;</a>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0; font-weight: bold; color: #292524;">Kavarna Živa Vera • KC Kalvarija</p>
      <p style="margin: 0 0 12px 0;">Bežigrajska cesta 7, 3000 Celje • <a href="https://kalvarija.si">kalvarija.si</a></p>
      <p style="margin: 12px 0 0 0; font-size: 10px; color: #a8a29e;">Za vprašanja nas kontaktirajte na <a href="mailto:info@kalvarija.si">info@kalvarija.si</a>.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatches an email using Resend API with serverless endpoint fallback
 */
export async function sendResendEmail(options: SendEmailOptions): Promise<EmailSendResponse> {
  const apiKey = (import.meta as any).env?.VITE_RESEND_API_KEY || (typeof process !== 'undefined' ? process.env?.RESEND_API_KEY : '');
  const toRecipients = Array.isArray(options.to) ? options.to : [options.to];
  const validRecipients = toRecipients.filter(e => e && e.includes('@')).map(e => e.trim());

  if (validRecipients.length === 0) {
    return { success: false, error: 'Ni veljavnih e-poštnih naslovov prejemnika.' };
  }

  const payload = {
    from: options.from || DEFAULT_SENDER,
    to: validRecipients,
    subject: options.subject,
    html: options.html || `<p>${options.text || options.subject}</p>`,
    text: options.text,
    reply_to: options.replyTo || 'info@kalvarija.si',
  };

  // 1. Attempt serverless /api/send-email first
  try {
    const apiRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      return { success: true, data };
    }
  } catch (apiErr) {
    // Fallback to direct client fetch
  }

  // 2. Direct Resend API fetch
  if (!apiKey) {
    return { success: false, error: 'VITE_RESEND_API_KEY ni nastavljen v okolju.' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || data.name || 'Resend API napaka' };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Napaka pri povezavi z Resend poštnim strežnikom.',
    };
  }
}
