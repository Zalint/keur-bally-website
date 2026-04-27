import { Resend } from 'resend';
import type { Order, OrderItem } from '@prisma/client';
import { prisma } from './db';

type OrderWithItems = Order & { items: OrderItem[] };

const FROM_DEFAULT = 'Keur Bally <onboarding@resend.dev>';

function fmtFcfa(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function escape(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml(order: OrderWithItems, adminUrl: string) {
  const lines = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${escape(i.nom)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${i.quantite} ${escape(i.unite)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmtFcfa(i.totalLine)}</td>
      </tr>`
    )
    .join('');

  const addr = order.customerAddress
    ? `<p style="margin:4px 0"><b>Adresse :</b> ${escape(order.customerAddress)}</p>`
    : '';
  const note = order.customerNote
    ? `<p style="margin:4px 0"><b>Note :</b> ${escape(order.customerNote)}</p>`
    : '';

  return `
  <div style="font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f1f1f">
    <div style="background:#1B5E20;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0">
      <div style="font-size:13px;opacity:0.85">Nouvelle commande</div>
      <div style="font-size:20px;font-weight:600">${order.ref} — ${fmtFcfa(order.totalFcfa)}</div>
    </div>
    <div style="border:1px solid #eee;border-top:0;padding:20px;border-radius:0 0 8px 8px">
      <p style="margin:0 0 12px"><b>Client :</b> ${escape(order.customerName)}<br/>
         <b>Téléphone :</b> <a href="https://wa.me/${order.customerPhone.replace(/\D/g, '')}">${escape(order.customerPhone)}</a></p>
      ${addr}
      ${note}
      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px">
        <thead>
          <tr style="background:#f8f5ec">
            <th style="text-align:left;padding:8px">Article</th>
            <th style="text-align:left;padding:8px">Quantité</th>
            <th style="text-align:right;padding:8px">Total</th>
          </tr>
        </thead>
        <tbody>${lines}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 8px;text-align:right;font-weight:600">Total</td>
            <td style="padding:12px 8px;text-align:right;font-weight:600">${fmtFcfa(order.totalFcfa)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin:20px 0 0">
        <a href="${adminUrl}" style="display:inline-block;background:#1B5E20;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Voir dans l'admin</a>
      </p>
      <p style="margin-top:24px;font-size:12px;color:#777">
        Cette notification est envoyée à la création de la commande sur le site.
        Le client a peut-être encore besoin d'envoyer le message WhatsApp pour valider.
      </p>
    </div>
  </div>`;
}

export async function sendOrderNotification(order: OrderWithItems) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL || 'doucoure.saliou@gmail.com';
  if (!apiKey) {
    console.warn('[notify] RESEND_API_KEY absent — notification skipped');
    await prisma.order.update({
      where: { id: order.id },
      data: { notifError: 'RESEND_API_KEY missing' },
    });
    return;
  }

  const from = process.env.RESEND_FROM || FROM_DEFAULT;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const adminUrl = `${siteUrl}/admin/commandes/${order.id}`;

  const resend = new Resend(apiKey);
  try {
    await resend.emails.send({
      from,
      to: to.split(',').map((s) => s.trim()),
      subject: `Nouvelle commande ${order.ref} — ${fmtFcfa(order.totalFcfa)}`,
      html: buildHtml(order, adminUrl),
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { notifSentAt: new Date(), notifError: null },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    await prisma.order.update({
      where: { id: order.id },
      data: { notifError: msg },
    });
    throw err;
  }
}
