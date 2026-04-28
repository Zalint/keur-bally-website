import type { CartItem } from './types';
import { cartTotal, formatFcfa } from './cart';

const FALLBACK_NUMBER = '221770000000';

export function whatsappNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || FALLBACK_NUMBER;
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`;
}

export function helloLink(): string {
  return whatsappLink('Bonjour Keur Bally');
}

// Format ligne panier : on ne reprend pas le nom dans formatQuantite ici
// pour conserver la mise en page demandée du message WhatsApp.
function formatCartLine(item: CartItem): string {
  const u = item.unite.toLowerCase();
  let qty: string;
  if (u === 'kg') {
    qty = item.quantite < 1 ? `${Math.round(item.quantite * 1000)} g de` : `${item.quantite} kg de`;
    qty = `${qty} ${item.nom.toLowerCase()}`;
  } else if (u === 'pack' || item.type === 'pack') {
    const plural = item.quantite > 1 ? 's' : '';
    qty = `${item.quantite} ${item.nom}${plural}`;
  } else {
    const labels: Record<string, [string, string]> = {
      sac: ['sac', 'sacs'],
      l: ['L', 'L'],
      lot: ['lot', 'lots'],
      'pièce': ['pièce', 'pièces'],
      'boîte': ['boîte', 'boîtes'],
      bouteille: ['bouteille', 'bouteilles'],
    };
    const [s, p] = labels[u] ?? [u, u];
    const label = item.quantite > 1 ? p : s;
    const lien = startsWithVowel(item.nom) ? "d'" : 'de ';
    qty = `${item.quantite} ${label} ${lien}${item.nom.toLowerCase()}`;
  }

  const prix = formatFcfa(item.prix_fcfa * item.quantite);
  const livraison = item.livraison_gratuite ? ' — livraison gratuite' : '';
  return `- ${qty} (${prix})${livraison}`;
}

function startsWithVowel(s: string): boolean {
  return /^[aeiouhyéèà]/i.test(s.trim());
}

export function buildCartMessage(items: CartItem[]): string {
  const valid = items.filter((i) => i.disponible !== false);
  const lines = valid.map(formatCartLine).join('\n');
  const total = formatFcfa(cartTotal(valid));
  return [
    'Bonjour Keur Bally, je souhaite commander :',
    '',
    lines,
    '',
    `Total indicatif : ${total}`,
  ].join('\n');
}

export function buildCartLink(items: CartItem[]): string {
  return whatsappLink(buildCartMessage(items));
}
