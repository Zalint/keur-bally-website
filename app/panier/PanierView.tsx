'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import EmptyCart from '@/components/EmptyCart';
import { formatFcfa } from '@/lib/cart';
import { buildCartLink } from '@/lib/whatsapp';

export default function PanierView({
  availability,
}: {
  availability: Record<string, boolean>;
}) {
  const { items, totalFcfa, hasFreeDeliveryItem, isHydrated } = useCart();

  // Marque les items devenus indisponibles depuis l'ajout au panier
  // (sans muter le contexte : on calcule juste pour l'affichage et le lien WA).
  const annotated = useMemo(
    () =>
      items.map((i) => ({
        ...i,
        disponible: availability[i.productId] !== false,
      })),
    [items, availability],
  );

  const hasIndispo = annotated.some((i) => i.disponible === false);
  const validItems = annotated.filter((i) => i.disponible !== false);
  const validTotal = validItems.reduce((s, i) => s + i.prix_fcfa * i.quantite, 0);
  const link = buildCartLink(annotated);

  // Avant hydratation, on montre un placeholder pour éviter le flash "panier vide"
  if (!isHydrated) {
    return (
      <div className="py-16 text-center text-kb-olive text-sm">Chargement…</div>
    );
  }

  if (annotated.length === 0) return <EmptyCart />;

  return (
    <>
      <div className="mt-6 space-y-3">
        {annotated.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>

      {hasIndispo && (
        <div className="mt-5 rounded-card border border-kb-bordeaux/30 bg-kb-bordeaux/5 p-4 text-sm text-kb-bordeaux">
          Certains articles sont devenus indisponibles. Ils ne seront pas inclus
          dans la commande WhatsApp.
        </div>
      )}

      {/* Total + CTA — sticky mobile */}
      <div className="fixed bottom-0 inset-x-0 md:static md:mt-8 z-30 bg-cream/95 backdrop-blur md:bg-transparent border-t md:border md:border-cream-border md:rounded-card p-4 md:p-5 shadow-pack md:shadow-card">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-kb-olive">
              {validItems.length} article{validItems.length > 1 ? 's' : ''}
            </span>
            <span className="font-serif text-2xl font-bold text-kb-green tnum">
              {formatFcfa(validTotal || totalFcfa)}
            </span>
          </div>
          {hasFreeDeliveryItem && (
            <div className="mb-2 text-xs text-kb-green font-medium">
              ✓ Livraison gratuite incluse
            </div>
          )}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center h-12 leading-[3rem] bg-kb-bordeaux text-cream font-semibold rounded-card hover:bg-kb-bordeaux-dark"
          >
            Commander sur WhatsApp
          </a>
          <Link
            href="/catalogue"
            className="block mt-2 text-center text-sm text-kb-olive hover:text-kb-bordeaux underline"
          >
            Continuer mes achats
          </Link>
          <p className="mt-3 text-[11px] text-kb-olive leading-snug">
            Le prix final dépendra du poids exact pesé pour les produits au kg.
            L&apos;adresse de livraison et le créneau seront confirmés par
            WhatsApp.
          </p>
        </div>
      </div>
    </>
  );
}
