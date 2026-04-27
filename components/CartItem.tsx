'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CartItem as CartItemT } from '@/lib/types';
import { formatFcfa } from '@/lib/cart';
import { useCart } from '@/contexts/CartContext';
import QuantitySelector from './QuantitySelector';

export default function CartItem({ item }: { item: CartItemT }) {
  const { updateQuantity, removeItem } = useCart();
  const indisponible = item.disponible === false;

  return (
    <div
      className={`flex gap-3 p-3 bg-white rounded-card border border-cream-border ${
        indisponible ? 'opacity-60' : ''
      }`}
    >
      <Link
        href={`/article/${item.slug}`}
        className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-card overflow-hidden bg-cream-dark/30"
      >
        <Image
          src={item.image_url}
          alt={item.nom}
          fill
          sizes="100px"
          className="object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <Link href={`/article/${item.slug}`} className="font-medium text-sm text-kb-ink hover:text-kb-bordeaux line-clamp-2">
            {item.nom}
          </Link>
          {item.type === 'pack' && (
            <span className="bg-kb-gold text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm flex-shrink-0">
              Pack
            </span>
          )}
        </div>
        {item.livraison_gratuite && !indisponible && (
          <span className="text-[11px] text-kb-green font-medium">
            Livraison gratuite
          </span>
        )}
        {indisponible && (
          <span className="text-[11px] text-kb-bordeaux font-medium uppercase tracking-wider">
            Indisponible
          </span>
        )}

        <div className="mt-1 flex items-center justify-between gap-2">
          <QuantitySelector
            unite={item.unite}
            quantite={item.quantite}
            onChange={(q) => updateQuantity(item.productId, q)}
            disabled={indisponible}
          />
          <div className="text-right">
            <div className="font-serif text-base font-bold text-kb-green tnum">
              {formatFcfa(item.prix_fcfa * item.quantite)}
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-[11px] text-kb-olive hover:text-kb-bordeaux underline"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
