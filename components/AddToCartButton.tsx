'use client';

import { useState } from 'react';
import type { CatalogueItem } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { stepFor } from '@/lib/cart';

type Props = {
  item: CatalogueItem;
  variant?: 'default' | 'sticky';
  className?: string;
};

export default function AddToCartButton({ item, variant = 'default', className = '' }: Props) {
  const { addItem } = useCart();
  const [quantite, setQuantite] = useState<number>(stepFor(item.unite));
  const [toast, setToast] = useState(false);

  const disabled = !item.disponible;

  function handleAdd() {
    if (disabled) return;
    addItem({
      productId: item.id,
      slug: item.slug,
      nom: item.nom,
      type: item.type,
      prix_fcfa: item.prix_fcfa,
      unite: item.unite,
      quantite,
      image_url: item.image_url,
      livraison_gratuite: item.livraison_gratuite,
      disponible: true,
    });
    setToast(true);
    window.setTimeout(() => setToast(false), 2000);
  }

  const step = stepFor(item.unite);
  const min = step;

  const baseBtn =
    'inline-flex items-center justify-center font-semibold rounded-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClass =
    variant === 'sticky'
      ? 'h-12 px-6 bg-kb-green text-cream w-full hover:bg-kb-green-dark'
      : 'h-12 px-6 bg-kb-green text-cream hover:bg-kb-green-dark';

  return (
    <div className={className}>
      <div className="flex items-stretch gap-3">
        <div className="inline-flex items-stretch rounded-card border border-cream-border bg-white">
          <button
            type="button"
            onClick={() =>
              setQuantite((q) => Math.max(min, +(q - step).toFixed(2)))
            }
            disabled={disabled || quantite <= min}
            className="w-11 text-xl text-kb-green disabled:text-kb-olive/40"
            aria-label="Diminuer"
          >
            −
          </button>
          <div className="px-3 self-center min-w-[40px] text-center font-semibold tnum">
            {item.unite.toLowerCase() === 'kg' && quantite < 1
              ? `${Math.round(quantite * 1000)} g`
              : `${quantite}${item.unite.toLowerCase() === 'kg' ? ' kg' : ''}`}
          </div>
          <button
            type="button"
            onClick={() => setQuantite((q) => +(q + step).toFixed(2))}
            disabled={disabled}
            className="w-11 text-xl text-kb-green"
            aria-label="Augmenter"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className={`${baseBtn} ${variantClass} flex-1`}
        >
          {disabled ? 'Indisponible' : 'Ajouter au panier'}
        </button>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-kb-green text-cream text-sm px-4 py-2 rounded-full shadow-pack"
        >
          Ajouté au panier
        </div>
      )}
    </div>
  );
}
