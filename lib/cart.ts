import type { CartItem } from './types';

// Format FCFA avec espaces insécables (locale FR).
export function formatFcfa(n: number): string {
  return `${Math.round(n).toLocaleString('fr-FR').replace(/\u202F/g, '\u00A0')}\u00A0FCFA`;
}

// Step de quantité selon l'unité : 0.5 pour les kg, 1 sinon.
export function stepFor(unite: string): number {
  return unite.toLowerCase() === 'kg' ? 0.5 : 1;
}

// Quantité minimale au-dessous de laquelle on supprime la ligne.
export function minQtyFor(unite: string): number {
  return stepFor(unite);
}

export function lineTotal(item: CartItem): number {
  return item.prix_fcfa * item.quantite;
}

export function cartTotal(items: CartItem[]): number {
  return items
    .filter((i) => i.disponible !== false)
    .reduce((sum, i) => sum + lineTotal(i), 0);
}

export function cartTotalQuantite(items: CartItem[]): number {
  // 1 ligne du panier = 1 article, peu importe la quantité (5 kg = 1 article).
  return items.filter((i) => i.disponible !== false).length;
}

export function hasFreeDeliveryItem(items: CartItem[]): boolean {
  return items.some((i) => i.disponible !== false && i.livraison_gratuite);
}

// Format quantité humain : "0.5 kg" affiché "500 g", "2 kg", "1 sac d'oignons", etc.
export function formatQuantite(quantite: number, unite: string, nom: string): string {
  const u = unite.toLowerCase();
  if (u === 'kg') {
    if (quantite < 1) return `${Math.round(quantite * 1000)} g de ${nom.toLowerCase()}`;
    return `${quantite} kg de ${nom.toLowerCase()}`;
  }
  if (u === 'pack') {
    return quantite > 1 ? `${quantite} ${nom}s` : `${quantite} ${nom}`;
  }
  // sac, l, lot, pièce, boîte, bouteille
  const labelUnite = pluralUnite(u, quantite);
  const article = needsDe(nom) ? "d'" : 'de ';
  return `${quantite} ${labelUnite} ${article}${nom.toLowerCase()}`;
}

function pluralUnite(u: string, q: number): string {
  if (q <= 1) return u === 'l' ? 'L' : u;
  switch (u) {
    case 'sac':
      return 'sacs';
    case 'lot':
      return 'lots';
    case 'pièce':
      return 'pièces';
    case 'boîte':
      return 'boîtes';
    case 'bouteille':
      return 'bouteilles';
    case 'l':
      return 'L';
    default:
      return u;
  }
}

function needsDe(nom: string): boolean {
  const first = nom.trim().charAt(0).toLowerCase();
  return ['a', 'e', 'i', 'o', 'u', 'h', 'y', 'é', 'è', 'à'].includes(first);
}
